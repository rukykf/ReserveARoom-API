## Setup Instructions
The application requires you to have a minimum node version of 10.x installed.


You can use either `yarn` or `npm` to install the packages and run the commands.

 From the main folder, `cd` into the `server` directory, copy the `.env.example` file into a `.env` file and fill out your environment variables, Twilio API keys and `APP_SECRET`. The `APP_SECRET` will be used to encrypt user sessions

Run the following commands in the server directory:

Install packages

    yarn install

Setup the database (this project uses an SQLite database named reservations.db located in the `./server` directory)

    yarn run knex migrate:latest --env=development // you can set any other environment here

Seed the database

    yarn run knex seed:run --env=development

Start the server

    yarn run nodemon index.js

## Setup Instructions (Using Vagrant and Make)
There's a Vagrant.example file and a Makefile containing utilities for setting up the application in a Vagrant box. The commands in Vagrantfile.example use VirtualBox as Vagrant's provider. You can copy the example into a Vagrantfile and make any necessary changes before spinning up your vm.

After setting up Vagrant, `cd` into `/vagrant` and run `make provision-local`

This will install  `node 10.x` and `yarn` You can then follow along with the Setup Instructions above or use some of the other make commands in the `Makefile`
