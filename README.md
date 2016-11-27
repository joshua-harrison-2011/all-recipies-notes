allrecipies.com Recipe Notes
============================

This is a projects that adds the ability to add and edit recipe notes to recipies on AllRecipies.com.  
This functionality existed previously, but was lost in a site redesign.  There have been indications that
it will be added back in, but nothing has happened in months.

#### Notes Service  
This is a single threaded python web server that exposes a rest service to get and set notes for a particular recipe.  
It persists data in a pickledb database and has no knowledge of multi-tenancy.  The service depends on pip.

To setup the notes service for development:  
```bash
# Clone the repo (if necessary)
$  https://github.com/joshua-harrison-2011/all-recipies-notes

$ cd all-recipies-notes;

# Intialize virtual environment (only needs to be done once)
$ virtualenv .

# Activate the virtual environment
$ source bin/activate

# Install dependencies (if necessary)
$ pip install -r requirements.txt

# Run the notes service locally in the foreground
# Set a non-standard port to avoid production collision
$ python notes_service.py --port=5555 --log=DEBUG

# Deactivate the virtual environment
$ deactivate

```

To install the notes service:  
```bash
# Clone the repo (if necessary)
$  https://github.com/joshua-harrison-2011/all-recipies-notes

$ cd all-recipies-notes;
$ sudo ./deploy.sh <install path>

# If supervisord is installed, deploy.sh will write out config
# that can be installed to automatically start the notes service
# The service can then be managed with the following commands.
$ sudo supervisorctl stop all-recipies-notes-service
$ sudo supervisorctl restart all-recipies-notes-service
$ sudo supervisorctl start all-recipies-notes-service
```

#### Browser Integration
Instead of building and maintaining browser plugins, the browser integration depends on the cross browser plugin "TamperMonkey".  

To configure your browser:  
* Download and install [TamperMonkey](http://tampermonkey.net/) appropriate to your browser(s)
* In your browser, navigate to the notes service endpoint: `http://<host>:<port>/browser-plugin` and copy the plugin contents
* Open the TamperMonkey dialog and click "Create a new script..."
* Enter the copied contents into the new script and save
