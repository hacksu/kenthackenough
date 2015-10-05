# nginx and node
apt-get update
apt-get install -y nginx node nodejs npm
npm install -g npm@3.3.x
npm install -g n mocha
n 4.0.0

# mongodb
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
apt-get update
apt-get install -y mongodb-org=2.6.10 mongodb-org-server=2.6.10 mongodb-org-shell=2.6.10 mongodb-org-mongos=2.6.10 mongodb-org-tools=2.6.10
service mongod start

# redis
apt-get install -y redis-server
service redis-server start

# nginx config
if [ -f /etc/nginx/sites-available/default ]; then
  rm /etc/nginx/sites-available/default
  rm /etc/nginx/sites-enabled/default
fi
if [ $1 == "dev" ]; then
  cp /var/www/kenthackenough/config/dev.conf /etc/nginx/sites-available
  ln -s /etc/nginx/sites-available/dev.conf /etc/nginx/sites-enabled
fi
service nginx reload

# install libraries
cd /var/www/kenthackenough
npm install

# pm2
npm install -g pm2

# bunyan logger
npm install -g bunyan

echo "Next steps:"
echo "-------------------------------------------------"
echo "| run tests:             make vagrant-test      |"
echo "| start the app:         make vagrant-server    |"
echo "-------------------------------------------------"