AllRecipiesRecipeNotes
======================

This is a projects that adds the ability to add and edit recipe notes to recipies on AllRecipies.com.  
This functionality existed previously, but was lost in a site redesign.  There have been indications that
it will be added back in, but nothing has happened in months.

*Notes Service*
This is a single threaded python web server that exposes a rest service to get and set notes for a particular recipe.  
It persists data in a pickledb database and has no knowledge of multi-tenancy.  The service depends on pip.

To install the notes service:  
    $ cd notes-service
    $ virtualenv . && source bin/activate  # Optional. Create a virtual environment.
    $ pip install -r requirements.txt

To start the notes service (in the foreground):  
    $ cd notes-service
    $ source bin/activate && FLASK_APP=recipe-notes-service.py flask run --host=0.0.0.0

*Chrome Extension*
This is an extension to be installed in the Chrome browser that alters the behavior of AllRecipies.com to
add the add/edit notes ability.  

The Chrome Extension is hardcoded to talk to the Notes Service on my internal network.

To install:  
* Make the chrome-extension directory readable by the system running Chrome (copy to windows, copy to a share, etc)
* In the browser, navigate to chrome://extensions
* Click the checkbox for Developer Mode
* Click "Load unpacked extension..." and select the readable chrome-extension directory

*TODO*
* [Fault Tolerance] Change service backend to replicated redis
* [Fault Tolerance] Backup pickledb database
* [Configurability] Add options ui
* [Configurability] Make the notes service endpoint configurable
* [Configurability/Debug] Add an option to send background console messages to the main window?
* [Configurability] Add local storage option and (perhaps) make it optional
* [Enterprise] Move to AWS
* [Multi-Tenancy] Have extension create unique identifier (or add configuration option)
* [Multi-Tenancy] Have notes-service recognize tenants
* [Enterprise] IE & Firefox
* [Enterprise] Pack extension automatically.
