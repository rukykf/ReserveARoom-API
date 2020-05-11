start-server:
	cd ./server && yarn run nodemon index.js

provision-local:
	sudo apt-get update
	curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
	sudo apt install -y nodejs
	curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
	echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
	sudo apt update && sudo apt install -y yarn

install-packages:
	cd ./server && yarn install && cd ..

setup-database:
	cd ./server && yarn run knex migrate:latest && cd ..

seed-database:
	cd ./server && yarn run knex seed:run && cd ..