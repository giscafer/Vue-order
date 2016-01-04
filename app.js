/*!
 * Vue-order - app.js
 */
'use-strict'
/**
 * Module dependencies.
 */
var config = require('./src/server/config');

var path = require('path');
var errorhandler = require('errorhandler');
var Loader = require('loader');
var express = require('express');
var errorPageMiddleware = require("./src/server/common/error_page");
var authMiddleware = require("./src/server/common/auth");
// var passport  = require('passport');
// require('./middlewares/mongoose_log'); // 打印 mongodb 查询日志
var webRouter = require('./src/server/web_router');
var mongoosekeeper = require('./src/server/models/mongoosekeeper');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
 

// var RedisStore = require('connect-redis')(session);
require('./src/server/models');

if (config.devMode) {
    process.env.MONGO_DB_STR = config.dev_dbUrl;
}
// 引用mongoosekeeper
// 调用更新配置，这里的配置可以去读某个json
mongoosekeeper.config(config.dbConfig);

// 静态文件目录
var staticDir = path.join(__dirname, './src/libs');
var sassetsDir = path.join(__dirname, './src/assets');

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
app.use('/assets', express.static(sassetsDir));
//限制
app.use(bodyParser.json({
    limit: '1mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '1mb'
}));
//中间件
app.use(errorPageMiddleware.errorPage);

//cookie
app.use(cookieParser(config.auth_cookie_name));
//因为版本问题，这里坑里好一会
app.use(session({
  secret:config.session_secret,
  key: config.auth_cookie_name,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24},//24 hours
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: config.dev_dbUrl
  })
}));
//redis保存session
/*app.use(session({
    secret: config.sessionSecret,
    store: new RedisStore({
        port: config.redis_port,
        host: config.redis_host,
    }),
    resave: true,
    saveUninitialized: true,
}));*/
//注册自定义中间件
app.use(authMiddleware.authUser);
app.locals.current_user = null;
//router
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
