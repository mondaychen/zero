var express = require('express');
var fs      = require('fs');
var path    = require('path');
var app     = express();


app.get('/2.0/zero/getCareTeam2', function(req,res) {
	fs.readFile(path.resolve(__dirname, 'test_careTeam.json'), 'utf8', function(err, data){
		res.status(200).json(JSON.parse(data));
	});
});

app.get('/2.0/zero/getProvider2', function(req,res) {
	fs.readFile(path.resolve(__dirname, 'test_provider.json'), 'utf8', function(err, data){
		res.status(200).json(JSON.parse(data));
	});
});

app.listen(5000);
