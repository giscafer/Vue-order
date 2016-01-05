var validator = require('validator'); //好用的验证工具
var EventProxy = require('eventproxy'); //解决事件回调层级过深，方便管理回调
var UserProxy = require('../proxy').User;
var mail = require('../common/mail');
var tools = require('../common/tools');
var authMiddleWare = require('../common/auth');
var utility = require('utility');
var config = require('../config');
var uuid = require('node-uuid');

/**
 * 展示注册页面
 * @param  {HttpRequest}   req  
 * @param  {HttpRequest}   res  
 */
exports.showSignup = function(req, res) {
    res.render('sign/signup');
};
/**
 * 验证昵称是否存在 api接口（ajax请求）
 * @author giscafer
 * @version 1.0
 * @date    2016-01-05T20:23:49+0800
 */
exports.validateName_api_v1=function(req, res, next){
    var name = validator.trim(req.params.name);
    UserProxy.getUsersByName(name,function(err,users){
        if(err){
            return next(err);
        }
        var code=0,msg='该昵称可以使用';
        if (users.length > 0) {
            code=1;
            msg='该昵称已被使用';
        }
        res.send({
            status: code,
            msg:msg
        });
    });

};
/**
 * 验证昵称是否存在
 * @author giscafer
 * @version 1.0
 * @date    2016-01-05T20:23:49+0800
 */
exports.validateName=function(req, res, next){
    var name = validator.trim(req.body.name);
    var ep=new EventProxy();
    ep.fail(next);
    ep.on('valid_error',function(msg){
        res.status(422);
        return res.render('sign/signup', {
            error: msg,
            name: name
        });
    });
    UserProxy.getUsersByName(name,function(err,users){
        if(err){
            return next(err);
        }
        if (users.length > 0) {
            ep.emit('valid_error', '该昵称已被使用。');
            return;
        }
        next();
    });

};
/**
 * 注册入口
 * @param  {HttpRequest}   req  
 * @param  {HttpRequest}   res  
 * @param  {Function} next
 */
exports.signup = function(req, res, next) {
    var name = validator.trim(req.body.name);
    var loginname = validator.trim(req.body.loginname).toLowerCase();
    var email = validator.trim(req.body.email).toLowerCase();
    var pass = validator.trim(req.body.pass);
    var rePass = validator.trim(req.body.re_pass);
    var active=false; //默认用户未激活

    var ep = new EventProxy();
    ep.fail(next);
    ep.on('prop_err', function(msg) {
        res.status(422);
        res.render('sign/signup', {
            error: msg,
            name: name,
            loginname: loginname,
            email: email
        });
    });

    //START验证信息的正确性
    if ([name,loginname, pass, rePass, email].some(function(item) {
            return item === '';
        })) {
        ep.emit('prop_err', '信息不完整。');
        return;
    }
    if (loginname.length < 5 || loginname.length > 12) {
        ep.emit('prop_err', '用户名要求5~12个字符。');
        return;
    }
    if (!tools.validateId(loginname)) {
        return ep.emit('prop_err', '用户名不合法。');
    }
    if (!validator.isEmail(email)) {
        return ep.emit('prop_err', '邮箱不合法。');
    }
    if (pass !== rePass) {
        return ep.emit('prop_err', '两次密码输入不一致。');
    }
    //END
    //验证数据库是否有重复用户和邮箱
    UserProxy.getUsersByQuery({
        '$or': [{
            'loginname': loginname
        }, {
            'email': email
        }]
    }, {}, function(err, users) {
        if (err) {
            return next(err);
        }
        if (users.length > 0) {
            ep.emit('prop_err', '用户名或邮箱已被使用。');
            return;
        }
        //加密密码后保存
        tools.bhash(pass, ep.done(function(passhash) {
            // create gravatar
            // var avatarUrl = UserProxy.makeGravatar(email);
            if(!config.need_active_mail){
                active=true;
            }
            UserProxy.newAndSave(name,loginname, passhash, email, active, function(err) {
                if (err) {
                    return next(err);
                }
                //发送激活邮件
                mail.sendActiveMail(email, utility.md5(email + passhash + config.session_secret), loginname);
                if(!config.need_active_mail){
                    res.render('sign/signup', {
                        success: '注册成功，欢迎加入' + config.name + '！',
                        referer:'/signin'
                    });
                }else{
                    res.render('sign/signup', {
                        success: '欢迎加入' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。',
                        referer:'/signin'
                    });
                }
            });
        }));
    });
};
/**
 * 用户登录页面
 * @param  {HttpRequest} req 
 * @param  {HttpRequest} res 
 */
exports.showLogin = function(req, res) {
    req.session._loginReferer = req.headers.referer;
    res.render('sign/signin');
};

var notJump = [
    '/active_account', //激活页面
    '/reset_pass', //重置密码页面，避免重置两次
    '/signup', //注册页面
    '/search_pass' //search pass page
];
/**
 * Handler user login
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.login = function(req, res, next) {
    var loginname = validator.trim(req.body.loginname).toLowerCase();
    var pass = validator.trim(req.body.pass);
    var ep = new EventProxy();

    ep.fail(next);

    if (!loginname || !pass) {
        res.status(422);
        return res.render('sign/signin', {
            error: '信息不完整。'
        });
    }

    var getUser;
    if (loginname.indexOf('@') != -1) {
        getUser = UserProxy.getUserByMail;
    } else {
        getUser = UserProxy.getUserByLoginName;
    }

    ep.on('login_error', function(login_error) {
        res.status(403);
        res.render('sign/signin', {
            error: '用户名或密码错误'
        });
    });
    //用户名是否存在——>存在则验证密码，不存在则返回错误信息
    getUser(loginname, function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return ep.emit('login_error');
        }
        //密码是否正确
        var passhash = user.pass;
        tools.bcompare(pass, passhash, ep.done(function(match) {
            if (!match) {
                return ep.emit('login_error');
            }
            //用户未激活的话（如果用户使用的是手机注册的模式，该过程不需要）
            if (!user.active) {
                mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
                res.status(403);
                return res.render('sign/signin', {
                    error: '此账号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。'
                });
            }
            //end
            //将session保存到cookie中
            authMiddleWare.gen_session(user, res);
            var refer = req.session._loginReferer || '/';
            for (var i = 0, len = notJump.length; i !== len; ++i) {
                if (refer.indexOf(notJump[i]) >= 0) {
                    refer = '/';
                    break;
                }
            }
            res.redirect(refer);
        }));
    });
};
//登出
exports.signout = function(req, res, next) {
    // console.log('signout');
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, {
        path: '/'
    });
    res.redirect('/');
};
/**
 * 通过邮箱链接激活账号
 * @param  {HttpRequest}   req  
 * @param  {[HttpResponse]}   res  
 * @param  {Function} next 
 */
exports.activeAccount = function(req, res, next) {
    var key = validator.trim(req.query.key);
    var name = validator.trim(req.query.name);

    UserProxy.getUserByLoginName(name, function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('[ACTIVE_ACCOUNT] no such user:' + name));
        }
        var passhash = user.pass;
        if (!user || utility.md5(user.email + passhash + config.session_secret) !== key) {
            return res.render('notify/notify', {
                error: '信息有误，账号无法被激活。'
            });
        }
        if (user.active) {
            return res.render('notify/notify', {
                error: '账号已经是激活状态。'
            });
        }
        user.active = true;
        user.save(function(err) {
            if (err) {
                return next(err);
            }
            res.render('notify/notify', {
                success: '账号已被激活，请登录'
            });
        });
    });
};
//密码找回页面
exports.showSearchPass = function(req, res) {
    res.render('sign/search_pass');
};
/**
 * 找回密码申请
 * @param  {HttpRequest}   req 
 * @param  {HttpRequest}   res 
 * @param  {Function} next
 */
exports.updateSearchPass = function(req, res, next) {
    var email = validator.trim(req.body.email).toLowerCase();
    if (!validator.isEmail(email)) {
        return res.render('sign/search_pass', {
            error: '邮箱不合法',
            email: email
        });
    }
    //动态生成retrieve_key和timestamp到users collection，之后重置密码进行验证
    var retrieveKey = uuid.v4();
    var retrieveTimer = new Date().getTime();

    UserProxy.getUserByMail(email, function(err, user) {
        if (err) {
            res.render('sign/search_pass', {
                error: '没有这个电子邮箱。',
                email: email
            });
            return;
        }
        user.retrieve_key = retrieveKey;
        user.retrieve_time = retrieveTimer;
        user.save(function(err) {
            if (err) {
                return next(err);
            }
            //发送重置密码的邮件

            mail.sendResetPassMail(email, retrieveKey, user.loginname);

            res.render('notify/notify', {
                success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'
            });

        });
    });
};
/**
 * 找回密码邮箱链接有效性验证
 * @param  {HttpRequest}   req 
 * @param  {HttpRequest}   res 
 * @param  {Function} next
 */
exports.resetPass=function(req,res,next){

    var key =validator.trim(req.query.key);
    var name=validator.trim(req.query.name);

    UserProxy.getUserByNameAndKey(name,key,function(err,user){
        if(err){
            next(err);
        }
        if(!user){
            res.status(403);
            return res.render('notify/notify',{error:'信息有误，密码无法重置。'});
        }
        var now=new Date().getTime();
        var oneDay=1000*60*60*24;
        if(!user.retrieve_time || now-user.retrieve_time>oneDay){
            res.status(403);
            return res.render('notify/notify',{error:'该连接已过期，请重新申请。'});
        }
        return res.render('sign/reset',{name:name,key:key});
    });
};
/**
 * 密码更新保存
 * @param  {HttpRequest}   req 
 * @param  {HttpRequest}   res 
 * @param  {Function} next
 */
exports.updatePass=function(req,res,next){
    var psw=validator.trim(req.body.psw) || '';
    var repsw=validator.trim(req.body.repsw) || '';
    var key=validator.trim(req.body.key) || '';
    var name=validator.trim(req.body.name)  || '';

    var ep=new EventProxy();
    ep.fail(next);

    if(psw!==repsw){
        return res.render('sign/reset',{name:name,key:key,error:'两次密码输入不一致。'});
    }
    UserProxy.getUserByNameAndKey(name,key,ep.done(function(user){
        if(!user){
            return res.render('notify/notify',{error:'错误的激活链接'});
        }
        tools.bhash(psw,ep.done(function(passhash){
            user.pass=passhash;
            //清空重置标志字段
            user.retrieve_key=null;
            user.retrieve_time=null;
            user.active=true;//用户激活

            user.save(function(err){
                if(err){
                    return next(err);
                }
                return res.render('notify/notify',{success:'你的密码已重置。'});
            });
        }));
    }));
};