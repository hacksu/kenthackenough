# nginx and node
sudo apt-get update
sudo apt-get install -y nginx nodejs npm
sudo npm install -g npm
sudo npm install -g n mocha
n stable

# mongodb
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
sudo echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start

# redis
sudo apt-get install -y redis-server
sudo service redis-server start

# nginx config
if [ -f /etc/nginx/sites-available/default ]; then
  sudo rm /etc/nginx/sites-available/default
  sudo rm /etc/nginx/sites-enabled/default
fi
sudo cp /var/www/kenthackenough/config/api.khe.conf /etc/nginx/sites-available
sudo ln -s /etc/nginx/sites-available/api.khe.conf /etc/nginx/sites-enabled
sudo service nginx reload

# install libraries
cd /var/www/kenthackenough
npm install

# pm2
sudo npm install -g pm2

echo "-----------------------"
echo "| test:     npm test  |"
echo "| start:    npm start |"
echo "-----------------------"