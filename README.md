# Highrise user activity to your inbox

This project fetches the highrise user activity and mails the activity report in html table format to specified email addresses in config.json file

This is how config.json looks like

	{
		"highrise": {
			"company": "account", //as in account.highrisehq.com
			"token": "api token", //token of the highrise account to access api for activities
			"logRequiredSince": "20160714000000" //start date in the format yyyymmddhhmmss
												 //since when the activities are to be fetched
		},
	
		"mailConfig": {
			"smtpEmail": "abc@email.com", //gmail address to be used to send email using smtp.gmail.com
			"password": "*****", // gmail account password
			"fromEmail": "abc@email.com", //this is same as smtpEmail
			"toEmail": "xyz@email.com", //recepient (can have comma separated email ids)
			"subject": "subject for email",
			"body": "body for email"
		}
	}

This project is implemented using nodejs and uses normal authentication and does not use OAuth when connecting to highrise. And also, when sending mail, google smtp service is used by using the `smtpEmail` & `password` provided in `config.json` file

At the time when I was working on this project, the node-highrise-api did not have support for the Recordings object api. So I have included the same. So `package.json` does not include dependency for `node-highrise-api` module as I have included it in `node_modules` folder. When fetching recordings from highrise, the bulk email activity is ignored.
