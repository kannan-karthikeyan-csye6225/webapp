#!/bin/bash

sleep 30

#update Ubuntu
sudo apt-get update
sudo apt-get upgrade -y
echo 'Ubuntu updated'

#install Node
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
echo 'Node installed to version'
node -v

# Install the CloudWatch Agent
sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

#Create a group csye6225 and add the user csye6225 to the group - user has no login attribute
sudo groupadd csye6225
sudo useradd -g csye6225 -m -s /usr/sbin/nologin csye6225

echo 'Ubuntu updated - Node installed - User created'