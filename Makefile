provision-local:
	sudo apt-get update
	sudo add-apt-repository -y ppa:ansible/ansible && sudo apt-get update
	sudo apt-get install -y ansible
	ansible-playbook ./setup-utils.yml
	ansible-playbook ./setup-containers.yml
