# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.box = "ubuntu/trusty64"

  # Port forwarding
  config.vm.network "forwarded_port", guest: 80, host: 3000

  # Provision
  config.vm.provision "shell", inline: <<-SHELL
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
    cp /vagrant/config/api.khe.conf /etc/nginx/sites-available
    ln -s /etc/nginx/sites-available/api.khe.conf /etc/nginx/sites-enabled
    service nginx reload
    # install libraries
    cd /vagrant
    npm install
    npm rebuild
    # pm2
    npm install -g pm2
    cd /vagrant
    pm2 start processes.json
    echo "------------------------------------------"
    echo "|  KHE API up at http://localhost:3000/  |"
    echo "------------------------------------------"
  SHELL
end
