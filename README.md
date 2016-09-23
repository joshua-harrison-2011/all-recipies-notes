AllRecipiesRecipeNotes
======================

This is a projects that adds the ability to add and edit recipe notes to recipies on AllRecipies.com.  
This functionality existed previously, but was lost in a site redesign.  There have been indications that
it will be added back in, but nothing has happened in months.

#### Notes Service  
This is a single threaded python web server that exposes a rest service to get and set notes for a particular recipe.  
It persists data in a pickledb database and has no knowledge of multi-tenancy.  The service depends on pip.

To install the notes service:  
```bash
$ cd notes-service
$ virtualenv . && source bin/activate  # Optional. Create a virtual environment.
$ pip install -r requirements.txt
```

To start the notes service (in the foreground):  
```bash
$ cd notes-service && source bin/activate && python notes_service.py
```

Starting via supervisor, create a supervisord config file similar to:  
```
[program:notes-service]
command=<project root>/notes-service/run-notes-service.sh
directory=<project root>/notes-service/
user=jezro
autostart=true
autorestart=true
stopsignal=INT
stopasgroup=true
killasgroup=true
stdout_logfile=<project root>/log/notes-service.stdout.log
stderr_logfile=<project root>/log/notes-service.stderr.log
```

#### Chrome Extension  
This is an extension to be installed in the Chrome browser that alters the behavior of AllRecipies.com to
add the add/edit notes ability.  

The Chrome Extension is hardcoded to talk to the Notes Service on my internal network.

To install for development:  
* Make the chrome-extension directory readable by the system running Chrome (copy to windows, copy to a share, etc)
* In the browser, navigate to chrome://extensions
* Click the checkbox for Developer Mode
* Click "Load unpacked extension..." and select the readable chrome-extension directory
* Note: Every time Chrome loads, you'll see an error about "development extensions", so it's best to following the additional steps below.

To install for everyday use:
* Click "Pack extension..." and select the directory as above.  Ignore the key.
* This will write out an extension file (.crx) and an unused key (.pem)
* Turn Developer Mode off in Chrome.
* Drag the .crx file to the extension screen and follow the instructions.

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
