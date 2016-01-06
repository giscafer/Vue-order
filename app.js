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
var session = require('express-session');

require('./src/server/models');
//开发模式下mongo本地连接设置
if (config.devMode) { //这里应该用process.env.NODE_ENVl来判断
    process.env.MONGO_DB_STR = config.dev_dbUrl;
}
// 引用mongoosekeeper，链接数据库
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

//cookie和session 保存注册
app.use(cookieParser(config.auth_cookie_name));
//开发模式下本地存储session用mongodb，BAE用redis存储session
if (config.devMode) {
    var MongoStore = require('connect-mongo')(session);
    app.use(session({
        secret: config.session_secret,
        key: config.auth_cookie_name, //cookie name
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        }, //24 hours
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            url: config.dev_dbUrl
        })
    }));

} else {
    //redis保存session
    var redis = require('redis');
    var RedisStore = require('connect-redis')(session);
    var client = redis.createClient(80, 'redis.duapp.com', {
        "no_ready_check": true
    });
    client.on("error", function(err) {
        console.log("redis client Error " + err);
    });
    // 建立连接后，在进行集合操作前，需要先进行auth验证
    client.auth(config.bae_accesskey + '-' + config.bae_secretkey + '-' + config.redis_db);
    app.use(session({
        secret: config.session_secret,
        key: config.auth_cookie_name,
        store: new RedisStore({
            client: client
        }),
        resave: true,
        saveUninitialized: true
    }));
}

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
