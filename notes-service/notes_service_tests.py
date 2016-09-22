import os
import notes_service
import unittest
import json
import tempfile

class RecipeNotesServiceTestCase(unittest.TestCase):

	def setUp(self):
		# Would prefer to use os.tempnam(), but it throws warnings
		ignored_file_handle, db = tempfile.mkstemp()
		os.unlink(db)

		notes_service.app.config.update(dict(
			LOGGER_HANDLER_POLICY = 'never',	
			TESTING = True,
			DATABASE = db
		))
		self.app = notes_service.app.test_client()

	def tearDown(self):
		try:
			os.unlink(notes_service.app.config['DATABASE'])
		except:
			pass

	def test_hello_world(self):
 		response = self.app.get('/hello-world')
        	assert b'Hello, World!' in response.data

	def test_get_all_empty(self):
		response = self.app.get('/notes')
		assert response.status_code == 200

		notes = json.loads(response.data)
		assert notes == {"notes": {}}
	
	def test_get_all(self):

		expect = {"notes": {
			"1": "notes 1",
			"2": "notes 2",
			"3": "notes 3"
		}}

		for k,v in expect["notes"].iteritems():
			response = self.app.post('/notes/' + k, data=v)
			assert response.status_code == 200

		response = self.app.get('/notes')
		assert response.status_code == 200
		
		notes = json.loads(response.data)
		assert expect == notes

	def test_crud(self):
		endpoint = '/notes/123'
		notes = 'my notes'

		response = self.app.post(endpoint, data=notes)
		assert response.status_code == 200

		response = self.app.get(endpoint)
		assert response.status_code == 200
		assert response.data == notes

		response = self.app.delete(endpoint)
		assert response.status_code == 200

		response = self.app.get(endpoint)
		assert response.status_code == 200
		assert response.data == ""

	def test_bad_database(self):
		# Create an empty file.  pickledb doesn't handle empty files
		open(notes_service.app.config['DATABASE'], 'w').close()

		self.app = notes_service.app.test_client()

		response = self.app.get('/notes')
		assert response.status_code == 500

		response = self.app.get('/notes/123')
		assert response.status_code == 500


if __name__ == '__main__':
	unittest.main()
