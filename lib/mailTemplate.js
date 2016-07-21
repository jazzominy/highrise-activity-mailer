var Handlebars = require('handlebars');
var fs = require("fs");
var logger = require("./logger");
var sendMail = require("./mail");

var users,activityLog,mailConfig,onMail;

function updateUserName(){
	if(!users || !activityLog)
	{
		logger.error("Either user or activityLog data not provided!!!");
		return;
	}

	activityLog.reverse();//Latest logs first
	var userMap = {};//id -> name

	users.forEach(function(item){
		users[item.id] = item.name;
	})

	activityLog.forEach(function(item){
		item.username = users[item.author_id];
		item.updated_at = new Date(item.updated_at).toLocaleString();
	})

	logger.info("Raw data ready for the template");

	var context = {root:activityLog};
	renderTemplate(context);
}

function renderTemplate(context){
	if(!context)
		return;

	var source = createSource();
	var template = Handlebars.compile(source);
	var result = template(context);

	logger.info("Template generated for email");

	mailConfig.template = result;

	sendMail(mailConfig,onMail);
}

function createSource(){
	var tpl = "<!DOCTYPE html>" + 
				"<html>" +
				'<head>' +
				    "<title>Highrise Activity</title>"+
				    getStyles() +' '+
				"</head>"+
				"<body>"+
					'<p>' + mailConfig.body + '</p>' +
					'<div id="react-container">'+
				    '<table>'+
				    	'<thead><tr><th>User</th><th>Contact Name</th><th>Updated At</th></tr></thead>'+
				    	'<tbody>'+
				    	'{{#root}}'+
				    	'<tr><td>{{username}}</td><td>{{subject_name}}</td><td>{{updated_at}}</td><tr>'+
				    	'{{/root}}'+
				    	'</tbody>'+
				    '</table>'+
				    '</div>'+
				"</body>"+
				"</html>";
	return tpl;
}

function getStyles(){
	var result = "<style>"+
		"#react-container{"+
		"right:100px;position:relative;left:50px;width:90%;top:0px;overflow:auto;font-size:11px;"+
		"}"+
		"table{"+
		"border:1px solid #ddd;width:100%;max-width:100%;margin-bottom:20px;border-spacing:0;"+
		"border-collapse:collapse;"+
		"}"+
		"th{"+
		"border:1px solid #ddd;border-bottom-width:2px;padding:4px;vertical-align:middle;"+
		"text-align:left;"+
		"}"+
		"td{"+
		"border:1px solid #ddd;vertical-align:top;"+
		"}"+
	"</style>";

	return result;
}

module.exports = function(config){
	users = config.users;
	activityLog = config.activityLog;
	mailConfig = config.mailConfig;
	onMail = config.callback;

	updateUserName();
}