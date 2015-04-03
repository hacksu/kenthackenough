# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.box = "ubuntu/trusty64"

  # Use a special shared directory
  config.vm.synced_folder "./", "/var/www/kenthackenough"

  # Port forwarding
  config.vm.network "forwarded_port", guest: 3000, host: 3000

  # Provision
  config.vm.provision "shell", path: "provision.sh"

  # Make symlinks work on Windows
  config.vm.provider "virtualbox" do |v|
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
  end

end
