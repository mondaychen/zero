/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express  = require('express');
var mongoose = require('mongoose');
var fs       = require('fs');
var path     = require('path');
var config   = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// test data stuff

if (process.env.TEST) {
	var test_data_app = express();

	test_data_app.get('/num_ext/zero/getCareTeam', function(req,res) {
		fs.readFile(path.resolve(__dirname, 'api/Provider/test_and_heroku_data/test_careTeam.json'), 'utf8', function(err, data){
			res.status(200).json(JSON.parse(data));
		});
	});

	test_data_app.get('/num_ext/zero/getProvider', function(req,res) {
		fs.readFile(path.resolve(__dirname, 'api/Provider/test_and_heroku_data/test_provider.json'), 'utf8', function(err, data){
			res.status(200).json(JSON.parse(data));
		});
	});

	// this test app will not be exposed
	test_data_app.listen(8003);
}

// Expose app
exports = module.exports = app;
