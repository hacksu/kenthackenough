# nginx and node
apt-get update
apt-get install -y nginx nodejs npm
npm install -g npm
npm install -g n mocha
n stable

# mongodb
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
apt-get update
apt-get install -y mongodb-org
service mongod start

# redis
apt-get install -y redis-server
service redis-server start

# nginx config
if [ -f /etc/nginx/sites-available/default ]; then
  rm /etc/nginx/sites-available/default
  rm /etc/nginx/sites-enabled/default
fi
cp /var/www/kenthackenough/config/api.khe.conf /etc/nginx/sites-available
ln -s /etc/nginx/sites-available/api.khe.conf /etc/nginx/sites-enabled
service nginx reload

# install libraries
cd /var/www/kenthackenough
npm install

# pm2
npm install -g pm2

echo "-----------------------"
echo "| test:     npm test  |"
echo "| start:    npm start |"
echo "-----------------------"