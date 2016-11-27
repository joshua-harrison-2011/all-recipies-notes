#!/bin/bash

SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INSTALL_DIR=$1

IAM=`whoami`

if [ "$INSTALL_DIR" == "" ]
then
	echo "Invalid install directory"
	exit 1
fi

if [ ! -d $INSTALL_DIR ]
then
	mkdir -p $INSTALL_DIR 2>/dev/null
	if [ $? -ne 0 ]
	then
		echo "Failed to create $INSTALL_DIR.  Invalid permissions?"
		exit 2
	fi
fi

touch $INSTALL_DIR/install.test 2>/dev/null
if [ $? -ne 0 ]
then
	echo "Failed to write to $INSTALL_DIR.  Invalid permissions?"
	exit 3
fi

rm $INSTALL_DIR/install.test 2>/dev/null

cp $SOURCE_DIR/notes_service.py $SOURCE_DIR/requirements.txt $INSTALL_DIR

cd $INSTALL_DIR
mkdir -p logs
virtualenv . && source bin/activate
pip install -r requirements.txt

if [ -d /etc/supervisor/conf.d ]
then
	echo
	echo 
	echo "To have supervisord manage this service, place the following to /etc/supervisor/conf.d/all-recipies-notes-service.conf:"
	echo

	cat <<- EOM
		[program:all-recipies-notes-service]
		command=$INSTALL_DIR/bin/python $INSTALL_DIR/notes_service.py
		directory=$INSTALL_DIR
		autostart=true
		autorestart=true
		stopsignal=INT
		stopasgroup=true
		killasgroup=true
		stdout_logfile=$INSTALL_DIR/logs/notes-service.stdout.log
		stderr_logfile=$INSTALL_DIR/logs/notes-service.stderr.log

	EOM
fi

