var express = require('express');
var fs      = require('fs');
var path    = require('path');
var app     = express();


app.get('/num_ext/zero/getCareTeam', function(req,res) {
	fs.readFile(path.resolve(__dirname, '../server/api/Provider/test_and_heroku_data/test_careTeam.json'), 'utf8', function(err, data){
		res.status(200).json(JSON.parse(data));
	});
});

app.get('/num_ext/zero/getProvider', function(req,res) {
	fs.readFile(path.resolve(__dirname, '../server/api/Provider/test_and_heroku_data/test_provider.json'), 'utf8', function(err, data){
		res.status(200).json(JSON.parse(data));
	});
});

app.listen(8003);
