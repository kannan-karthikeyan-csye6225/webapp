#!/bin/bash

sleep 30 # No actions for 30 seconds because EC2 might need time to setup all its stuff

#update Ubuntu
sudo apt-get update
sudo apt-get upgrade -y
echo 'Ubuntu updated'

#install Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
echo 'Node installed to version'
node -v

#install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo service postgresql start
echo 'PostgreSQL installed and started!'

#Create a User in Postgres and grant privileges
sudo -u postgres psql -c "CREATE USER kannankarthikeyan WITH SUPERUSER CREATEDB PASSWORD 'pass';"
echo 'User Created!'

#Create a group csye6225 and add the user csye6225 to the group - user has no login attribute
sudo groupadd csye6225
sudo useradd -g csye6225 -m -s /usr/sbin/nologin csye6225

#Make a directory  /opt/apps and have permissions so that the ubuntu user is able to provision file to that directory
sudo mkdir -p /opt/apps/webapp
sudo chown ubuntu:ubuntu /opt/apps/webapp


#Every command is run
echo 'Ubuntu updated - Node installed - Postgres Installed - User created and given privileges'