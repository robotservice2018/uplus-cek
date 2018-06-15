const express = require('express');
const path = require('path');
const http = require('http');
const cluster = require('cluster');
const os = require('os');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const {SERVER_PORT} = require('./config.js');
const routes = require('./routes/index');

var app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.send('error');
});

app.use('/', routes);

if(cluster.isMaster) {
	os.cpus().forEach(function(cpu) {
		cluster.fork();
	});

	cluster.on('exit', function(worker, code, signal) {
		console.log('destroy worker : ' + worker.id);

		if(code == 200) {
			cluster.fork();
		}
	});
} else {
	app.listen(SERVER_PORT, function () {
		console.log('start server ! ' + SERVER_PORT);
	});

	console.log('worker : ' + process.pid);
}
