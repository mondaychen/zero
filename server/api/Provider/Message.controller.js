var credentials = require('../../config/credentials')
var client      = require('twilio')(credentials.accountSid, credentials.authToken); 
var request     = require('request');

// exports.sendSMS = function(req,res) {
// 	var toPhone   = req.params.toPhone;
// 	var fromPhone = req.params.fromPhone;
// 	var message   = req.params.message;
// 	client.messages.create({ 
// 		to: toPhone,//"+19175121917", 
// 		from: fromPhone,//"+19175215911", 
// 		body: message//"hello world",   
// 	}, function(err, message) { 
// 		if (!err) { 
// 			res.json(200, message);
// 		} else {
// 			res.json(500, err);
// 		}
// 	});
// };

exports.sendSMS = function(req, res) {
	var message    = req.params.message;
	var toPhone = req.params.toPhone;

	if(toPhone.length === 10) {
		toPhone = '1' + toPhone
	}

	var options = {
		url: credentials.sms.url,
		form: {
			username: credentials.sms.username,
			password: credentials.sms.password,
			destination: toPhone,
			text: message
		}
	};

	request.post(options, function (err, response, body) {
		if (!err && !/error/.test(body)) {
			res.json(200, body);
		} else {
			res.json(500, err);
		}
	});
};

exports.sendPage = function(req, res) {
	var message    = req.params.message;
	var pageNumber = req.params.pageNum;

	console.log(message);
	console.log(pageNumber);

	var options = {
		url : 'https://143.104.96.129:444/ConnectService/SendPage?PageNumber=' + pageNumber + '&Message=' + message,
		strictSSL : false,
		headers : {
			'Authorization': credentials.authorization
		}
	};
	
	request(options, function (err, response, body) {
		if (!err) { 
			res.json(200, body);
		} else {
			res.json(500, err);
		}
	});
};