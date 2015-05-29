var credentials = require('../../config/credentials')
var client      = require('twilio')(credentials.accountSid, credentials.authToken); 
var request     = require('request');
var nodemailer  = require('nodemailer');

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
//router.post('/message/email/:fromAddress/:toAddress/:message', n_controller.sendEmail);

var smtpTransport = nodemailer.createTransport("SMTP",{
    host: "localhost"
});

exports.sendEmail = function(req, res) {
	var fromAddress = req.params.fromAddress;
	var toAddress   = req.params.toAddress;
	var message     = req.params.message;

	/*
	var mailOptions = {
        from: "testing@nyp.org",
        to: "testing@gmail.com",
        subject: "Zero Mailing System",
        text: "Message: This was a test",
        // the html link should contain the reset-key
        // consider formatting the message to utilize HTML styling
        html: "This was a test"
    }
    */

    var mailOptions = {
    	from: fromAddress,
    	to: toAddress,
    	subject: "Zero Mailing System",
    	text: message,
    	html: ""
    }


    smtpTransport.sendMail(mailOptions, function(error, response){
        if (!error) {
          console.log("Message sent: " + response.message);
          res.json(200, {message:'Zero email sent successfully.'});
        } else {
        	console.log(error);
        	console.log(response);
          res.json(401, {message:error});
        }

      // if you don't want to use this transport object anymore, uncomment following line
      //smtpTransport.close(); // shut down the connection pool, no more messages
    });
}

exports.sendSMS = function(req, res) {
	var message = req.params.message;
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