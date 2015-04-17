ZERO
======

## Setup

### Environment

1. Install [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.org/).
2. You may need to install bower and grunt globally with `npm install -g bower` and `npm install -g grunt-cli`.
1. To get ZERO running locally, you need a running instance of MongoDB.

_Note: In case that you are new to MongoDB, it is quiet easy to setup your first instance._
_After MongoDB installed, just make a directory as your DB path, such as `mkdir ~/data/db/` and then run `mongod --dbpath ~/data/db`._

### Get ready before first run

1. Clone the repo into a directory and `cd` into it.
1. Run `npm install`
1. Run `bower install`
2. Run `grunt build`

### Set the local server up!

1. Run `node node_test_server/app.js`
2. Run `grunt serve`

ZERO will be opened in your browser automaticly as `localhost:9000`.

_Note that `grunt serve` command will also start a process to watch the changes applied to related files. When you change the source files, they will be re-compiled automaticly and the webpage will refresh itself (on modern browsers)._
