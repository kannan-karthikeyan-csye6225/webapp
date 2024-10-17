#!/bin/bash

#Change the ownership to csye6225 user and group
sudo chown -R csye6225:csye6225 /opt/apps/webapp-main

#Listing the files in the directory
ls -l /opt/apps/webapp-main

#CD to the relevant directory
cd /opt/apps/webapp-main || exit

#NPM install and run the Integration Test
echo 'Installing npm dependencies...'
sudo -u csye6225 npm install
echo 'Starting the app...'
sudo -u csye6225 npm test