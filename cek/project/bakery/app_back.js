const express = require('express');
const path = require('path');
const multer = require('multer');
const upload = multer({dest:'./uploads/'});

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


const {SERVER_PORT} = require('./config.js');
const routes = require('./routes/index');

var app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('error');
});

app.use('/', routes);

app.listen(SERVER_PORT, function() {
    console.log('start server...' + SERVER_PORT);
});



/*

app.post('/upload', upload.single('dataFile'), function(req, res) {
    res.end('File Uploaded');
});

module.exports = app;
*/