/**
 * 用户信息控制器
 */
var Proxy = require('../proxy');
var UserProxy = Proxy.User;
var OrderProxy = Proxy.Order;
var EventProxy = require('eventproxy');
var validator = require('validator');
var tools = require('../common/tools');
var config=require('../config');
var moment=require('moment');
/**
 * 展示用户设置页面
 */
exports.showSetting = function (req, res, next) {
    UserProxy.getUserById(req.session.user._id, function (err, user) {
        if (err) { return next(err); }
        //点击保存后，提示信息
        if (req.query.save === 'success') {
            user.success = '保存成功！'
        }
        user.error = null;
        return res.render('user/setting', user);
    });
};
/**
 * 保存设置
 */
exports.setting = function (req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    
    //显示成功或者错误信息
    function showMessage(msg, data, isSuccess) {
        data = data || req.body;
        var data2 = {
            name: data.name,
            loginname: data.loginname,
            email: data.email,
            phone: data.phone,
            job: data.job,
            location: data.location,
            signature: data.signature,
        };
        if (isSuccess) {
            data2.success = msg;
        } else {
            data2.error = msg;
        }
        res.render('user/setting', data2);
    }
    //处理post请求
    var action = req.body.action;
    if (action === 'change_setting') { //一般信息设置
        var name = validator.trim(req.body.name);
        name = validator.escape(name);
        var phone = validator.trim(req.body.phone);
        phone = validator.escape(phone);
        var job = validator.trim(req.body.job);
        job = validator.escape(job);
        // var email=validator.trim(req.body.email);
        // email=validator.escape(email);
        var location = validator.trim(req.body.location);
        location = validator.escape(location);
        var signature = validator.trim(req.body.signature);
        signature = validator.escape(signature);
        UserProxy.getUsersByName(name, function (err, users) {
            if (err) {
                return next(err);
            }
            if (users.length > 0 && users[0]._id.toString()!==req.session.user._id.toString()) {
                return showMessage('该昵称已经被使用！', {
                    phone:phone,
                    job:job,
                    location:location,
                    signature:signature
                });
            } else {
                //更新
                UserProxy.getUserById(req.session.user._id, ep.done(function (user) {
                    user.name = name;
                    user.location = location;
                    user.signature = signature;
                    user.job = job;
                    user.phone = phone;
                    user.save(function (err) {
                        if (err) {
                            return next(err);
                        }
                        req.session.user = user.toObject({ virtual: true });
                        return res.redirect('/setting?save=success');
                    });
                }));
            }
        });

    }
    if (action === 'change_password') {
        var old_pass = validator.trim(req.body.old_pass);
        var new_pass = validator.trim(req.body.new_pass);
        var re_new_pass = validator.trim(req.body.re_new_pass);

        UserProxy.getUserById(req.session.user._id, ep.done(function (user) {
            if (!old_pass || !new_pass || !re_new_pass) {
                return showMessage('旧密码或新密码不得为空', user);
            }
            if (new_pass !== re_new_pass) {
                return showMessage('两次新密码输入的不一致', user);
            }
            tools.bcompare(old_pass, user.pass, ep.done(function (bool) {
                if (!bool) {
                    return showMessage('当前密码不正确', user);
                }
                tools.bhash(new_pass, ep.done(function (passhash) {

                    user.pass = passhash;
                    user.save(function (err) {
                        return next(err);
                    });
                    return showMessage('密码修改成功！', user, true);
                }));
            }));
        }));
    }

};
/**
 * 获取积分排行在10名前的
 */
exports.top10 = function (req, res, next) {
  var opt = {limit: 10, sort: '-score'};
  var query={'$or': [
    {is_block: {'$exists': false}},
    {is_block: false},
  ]};
 
  UserProxy.getUsersByQuery(query, opt, function(err,tops){
      if(err){
          next(err);
      }
      if(tops.length===0){
          return res.render('user/top10', {
            users: [],
            pageTitle: 'top10',
        });
      }
      var proxy=new EventProxy();
      proxy.fail(next);
      proxy.after('top10_ready', tops.length, function () {
          //返回结果
         res.render('user/top10', {
            users: tops,
            pageTitle: 'top10',
        }); 
     });
     //遍历查询每个人的订单数量
     tops.forEach(function(user,i){
        var ep=new EventProxy();
        ep.on('order_count',function(order_count){
            user.order_count=order_count || 0;
            proxy.emit('top10_ready');
        }); 
        //根据用户ID查询订餐数
        OrderProxy.getCountByQuery({user_id:user._id},ep.done('order_count'));
     });
  });
};


/////////////////////////////////////////admin start///////////////////////////////////
//showuser_list
exports.showuser_list=function(req,res,next){
   
   res.render('admin/user/userlist', {
        pageTitle: '用户管理'
    });
    
};
//user_list
exports.user_list=function(req,res,next){
    var proxy=new EventProxy();
    proxy.fail(next);
    var query = {};
    //分页查询
    var opt = { sort: '-create_at'};
    UserProxy.getUsersByQuery(query, opt,function (err,users) {
        if(err){
             return next(err);
        }
        proxy.fire('users',users);
    });
    proxy.on('users',function(users){
        return res.send(users);
    });
    
};
/**
 * 激活用户
 */
exports.active=function(req,res,next){
    var userId=req.params.userId;
    if(!req.session.user.is_admin){
        return res.send({success:false,message:'无权限'});
    }
    UserProxy.getUserById(userId,function(err,user){
        if(err){
             return next(err);
        }
        if (!user) {
            return next(new Error('user is not exists'));
        }
        user.active=true;
        user.save(function(err){
            if(err){
                return res.send({sucess:false,message:err.message});
            }
            // return res.redirect('/admin/user');
            return exports.user_list(req,res,next);
        });
    });
};
/**
 * 锁定用户
 */
exports.block=function(req,res,next){
    var userId=req.params.userId;
    var action=req.params.action;
    if(!req.session.user.is_admin){
        return res.send({success:false,message:'无权限'});
    }
    UserProxy.getUserById(userId,function(err,user){
        if(err){
             return next(err);
        }
        if (!user) {
            return next(new Error('user is not exists'));
        }
        if(action==='lock'){
           user.is_block=true;
        }else{
           user.is_block=false;
        }
     
        user.save(function(err){
            if(err){
                return res.send({sucess:false,message:err.message});
            }
            // return res.redirect('/admin/user');
             return exports.user_list(req,res,next);
        });
    });
};

/////////////////////////////////////////admin end///////////////////////////////////