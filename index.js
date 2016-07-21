var fs = require("fs");
var logger = require("./lib/logger");
var highrise = require("node-highrise-api");
var config = require("./config.json");
var mailReport = require("./lib/mailTemplate");

//Set to get the user logs from 1st day of current month
var sinceDate = "";
var callCnt = 0;
var retryCnt = 0;
var users = null;
var recordings = [];

var client = new highrise({
	username: config.highrise.company,
	token: config.highrise.token,
	authorization: "basic",
	secure: "true"
});

function getUsers(){
	client.users.get(onUsers);
}

function onUsers(err,result){
	if(err)
	{
		if(err.search && err.search("getaddrinfo ENOENT") != -1)
		{
			logger.error("Error occurred when getting users. Please check the internet connection");
			return;
		}
		else
			logger.error({err:err},"Error occurred when getting users");
	}
	else
	{
		logger.info("Total users fetched --> " + result.length);
		users = result;
		var dataToBeWritten = JSON.stringify(users, ["id","name"], 4);
		writeData(dataToBeWritten,"users");
	}
}

function getRecordings(params){
	
	var query = params || {};

	if(!query.hasOwnProperty("since"))
	{
		query.since = sinceDate;
	}

	client.recording.get(query,onRecordings);
	callCnt++;
}

function onRecordings(err,result,res_xml){
	var query = null;

	if(err)
	{
		if(err.search && err.search("getaddrinfo ENOENT") != -1)
		{
			logger.error("Error when querying activities. Please check the internet connection");
			return;
		}
		else if(retryCnt == 5)
		{
			logger.error({err:err},"Error when querying activities. Retried 5 times but the problem still persists");
			retryCnt = 0;
			return;
		}
		
		logger.error({err:err},"Error when querying activities");
		logger.info("Resuming to fetch activities");

		callCnt--;
		retryCnt++;

		query = {
				n:callCnt*25,
				since: sinceDate
			};

		getRecordings(query);
	}
	else
	{
		logger.info("Activities found -> " + result.length + " Call complete count --> " + callCnt);
		recordings = recordings.concat(result);

		//Check original length as result will have filtered recordings
		if(res_xml.recordings.recording === undefined || res_xml.recordings.recording.length < 25)
		{
			//Generate template
			logger.info("Total activities fetched --> " + recordings.length);

			var dataToBeWritten = JSON.stringify(recordings, ["id","author_id","body","subject_id",
				"subject_name","updated_at"], 4);
			writeData(dataToBeWritten,"userActivityLog");
		}
		else
		{
			query = {
				n:callCnt*25,
				since: sinceDate
			};

			getRecordings(query);
		}
	}
}

function setSinceDate(){
	if(config && config.highrise.logRequiredSince)
	{
		sinceDate = config.highrise.logRequiredSince;
		return;
	}

	var today = new Date();
	var year = today.getFullYear().toString();
	var month = (today.getMonth()+1).toString();

	if(month.length == 1)
		month = "0" + month;

	var dayHrMinSec = "01000000";

	sinceDate =  year + month + dayHrMinSec;
}

function writeData(data,filename)
{
	fs.writeFile('./data/'+filename+'.json', data, function(err) {
      if (err) {
        logger.error({err:err},"Error when writing file --> " + filename);
        process.exit(1);
      }
      logger.info("Data written to file -> " + filename);
    });

    if(users && recordings && recordings.length > 0)
    {
    	var options = {
    		users : users,
    		activityLog: recordings,
    		mailConfig: config.mailConfig,
    		callback: null
    	};

    	mailReport(options);
    }
}

setSinceDate();
getUsers();
getRecordings();