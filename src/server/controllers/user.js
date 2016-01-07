/**
 * 用户信息控制器
 */
var UserProxy=require('../proxy').User;

/**
 * 展示用户设置页面
 */
exports.showSetting=function(req,res,next){
    UserProxy.getUserById(req.session.user._id,function (err,user) {
        if(err){return next(err);}
        //点击保存后，提示信息
        if(req.query.save==='success'){
            user.success='保存成功！'
        }
        user.error=null;
        return res.render('user/setting',user);
    });
};