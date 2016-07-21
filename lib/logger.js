var bunyan = require("bunyan");

var logger = null;

function getLogger(){
	if(logger)
		return logger;

	logger = bunyan.createLogger({
		name: "highrise",
		level: bunyan.INFO,
		streams: [
	        {
	            level: bunyan.INFO,
	            stream: process.stdout
	        },
	        {
	            level: bunyan.INFO,
	            path: "./info.log"
	        }
        ]
	});

	return logger;
}

module.exports = getLogger();