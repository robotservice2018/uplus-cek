const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const moment = require('moment-timezone');

const fs = require('fs');
const logDir = '../logs/';

if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const ts = function() {
	return moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS');
};

const logger = new(winston.Logger)({
	transports: [
			new(winston.transports.Console)({
				timestamp : ts,
				level : 'debug',
				colorize:true
			}),
			new(winstonDaily)({
				level : 'info',
				filename : './public/logs/.log',
				timestamp : ts,
				datePattern : 'yyyy-MM-dd', 
				prepend:true, 
				localTime : true,
				showLevel : false,
				json : false,
				maxsize : 1024 * 1024 * 100,
				maxFiles : 100
			}),
			new(winston.transports.File)({
				level : 'debug',
				filename : './public/logs/cek_log.log',
				timestamp : ts,
				datePattern : 'yyyy-MM-dd', 
				prepend:true,
				showLevel : true,
				json : false,
				maxsize : 1024 * 1024 * 100,
				maxFiles : 20
		})
	]
});

module.exports = logger;