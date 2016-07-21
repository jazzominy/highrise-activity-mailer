var nodemailer = require("nodemailer");
var logger = require("./logger");

module.exports = function(config,callback){
	
	var transporter = nodemailer.createTransport('smtps://' + config.fromEmail + ':' + 
					  config.password + '@smtp.gmail.com');

	var mailOptions = {
		from: config.fromEmail,
		to: config.toEmail,
		subject: config.subject,
	    html: config.template
	};

	logger.info("Sending mail...");

	transporter.sendMail(mailOptions, function(error, info){
	    
		if(typeof(callback) === "function")
		{
			callback(error,info);
			return;
		}

	    if(error){
	    	logger.info(error,"Error occurred when sending mail!!!");
	        return console.log(error);
	    }

	    logger.info('Message sent: ' + info.response);
	});
}