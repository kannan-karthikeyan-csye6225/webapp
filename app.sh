#!/bin/bash

#Change the ownership to csye6225 user and group
sudo chown -R csye6225:csye6225 /opt/apps/webapp

sudo mv /home/ubuntu/myapp.service /etc/systemd/system/myapp.service
sudo chown root:root /etc/systemd/system/myapp.service
sudo chmod 644 /etc/systemd/system/myapp.service

#Listing the files in the directory
ls -l /opt/apps/webapp

#CD to the relevant directory
cd /opt/apps/webapp || exit
sudo rm -rf node_modules package-lock.json  ####THIS

#NPM install and run the Integration Test
cat <<EOL > .env
PORT=5173
DB_NAME=healthDB
DB_USER=kannankarthikeyan
DB_PASSWORD=pass
DB_HOST=localhost
DB_PORT=5432
EOL

# Start the Node.js app using systemd service
echo 'Enabling and starting the Node.js app service...'
sudo systemctl daemon-reload
sudo systemctl enable myapp.service

echo 'Installing npm dependencies...'
sudo -u csye6225 npm install

sudo systemctl start myapp.service

# Check the status of the service.
sudo systemctl status myapp.service