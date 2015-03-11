# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/trusty64"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  config.vm.network "forwarded_port", guest: 80, host: 3000

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
    # nginx and node
    apt-get update
    apt-get install -y nginx node npm
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
    # pm2
    npm install -g pm2
    cd /vagrant
    pm2 start processes.json
    echo "---------------------------------------------"
    echo "| See application at http://localhost:3000/ |"
    echo "---------------------------------------------"
  SHELL
end
