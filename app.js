/*!
 * Vue-order - app.js
 */

/**
 * Module dependencies.
 */

var config = require('./src/server/config');

var path = require('path');
var errorhandler = require('errorhandler');
var Loader = require('loader');
var express = require('express');
// var session                  = require('express-session');
// var passport                 = require('passport');
// require('./middlewares/mongoose_log'); // 打印 mongodb 查询日志
require('./src/server/models');
var webRouter = require('./src/server/web_router');
// var _                        = require('lodash');
var bodyParser = require('body-parser');

// 静态文件目录
var staticDir = path.join(__dirname, './src/libs');

config.hostname = config.host;

var app = express();

// configuration in all env
app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
app.locals._layoutFile = 'layout.html';
app.enable('trust proxy');


// 静态资源
// app.use(Loader.less(__dirname));
app.use('/libs', express.static(staticDir));
//限制
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
//
app.use('/', webRouter);

// error handler
if (config.debug) {
    app.use(errorhandler());
} else {
    app.use(function(err, req, res, next) {
        console.error('server 500 error:', err);
        return res.status(500).send('500 status');
    });
}

app.listen(config.port, function() {
    console.log("Vue-Order listening on port %d", config.port);
    console.log("You can debug your app with http://" + config.hostname + ':' + config.port);
});


module.exports = app;
