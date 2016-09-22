import json, os, pickledb, logging, argparse
from logging.handlers import RotatingFileHandler
from flask import Flask, request, abort

app = Flask(__name__)
app.config.update(dict(
    DATABASE   = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'recipe-notes.db'),
))

def get_pickle_db():
	try:
		return pickledb.load(app.config.get('DATABASE'), False)
	except: 
		return None

@app.route('/hello-world')
def hello_world():
	return 'Hello, World!'

@app.route('/notes', methods=['GET'])
def get_notes():
	db = get_pickle_db()
	if db is None:
		app.logger.error("Aborting on invalid database")
		abort(500)
	rval = {}
	for k in db.getall():
		rval[k] = db.get(k)
	return json.dumps({"notes": rval})

@app.route('/notes/<int:recipe_id>', methods=['GET', 'POST', 'DELETE'])
def note_handler(recipe_id):
	db = get_pickle_db()
	if db is None:
		app.logger.error("Aborting on invalid database")
		abort(500)
	recipe_id = str(recipe_id)
	response = ""
	if request.method == "POST":
		notes = request.get_data()
		app.logger.info("Setting notes for recipe_id {} to {}".format(recipe_id, notes))
		db.set(recipe_id, notes)
	elif request.method == "DELETE":
		app.logger.info("Deleting notes for recipe_id {}".format(recipe_id))
		db.rem(recipe_id)
	else:
		notes = db.get(recipe_id)
		app.logger.info("Getting notes for recipe_id {}: {}".format(recipe_id, notes))
		response = notes if notes else ""

	db.dump()
	return response

if __name__ == '__main__':
	# Command line options: http://flask.pocoo.org/snippets/133/
	parser = argparse.ArgumentParser(description='Recipie notes service')
	parser.add_argument('--host', help="Hostname to listen on", default='0.0.0.0')
	parser.add_argument('--port', help="Port to listen on", default=5000)
	parser.add_argument('--log', help="Loglevel", default='WARN', choices=['DEBUG','INFO','WARN','ERROR','CRITICAL'])
	args = parser.parse_args();

	# Logging: https://gist.github.com/ibeex/3257877
	handler = RotatingFileHandler('notes_service.log', maxBytes=1000000, backupCount=1)
	handler.setLevel(getattr(logging, args.log.upper()))
	app.logger.addHandler(handler)
	app.run(
		host=args.host,
		port=args.port
	)
