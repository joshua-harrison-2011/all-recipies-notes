import json, os, pickledb
from flask import Flask, request
#from tinydb import TinyDB, Query

app = Flask(__name__)
db  = pickledb.load(os.path.dirname(os.path.realpath(__file__)) + "/recipe-notes.db", False);
#db  = TinyDB(os.path.dirname(os.path.realpath(__file__)) + "/recipe-notes.db.json");

@app.route('/')
def hello_world():
	return 'Hello, World!'

@app.route('/notes', methods=['GET'])
def get_notes():
	rval = {}
	for k in db.getall():
		rval[k] = db.get(k)
	return json.dumps({"notes": rval})

@app.route('/notes/<int:recipe_id>', methods=['GET', 'POST', 'DELETE'])
def note_handler(recipe_id):
	recipe_id = str(recipe_id)
	response = ""
	if request.method == "POST":
		notes = request.get_data()
		print "Setting notes for recipe_id {} to {}".format(recipe_id, notes)
		db.set(recipe_id, notes)
	elif request.method == "DELETE":
		print "Deleting notes for recipe_id {}".format(recipe_id)
		db.rem(recipe_id)
	else:
		notes = db.get(recipe_id)
		print "Getting notes for recipe_id {}: {}".format(recipe_id, notes)
		response = notes if notes else ""

	db.dump()
	return response
