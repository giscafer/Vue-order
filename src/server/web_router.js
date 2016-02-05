/**
 * 路由
 * @type {[type]}
 */
var express = require('express');
var config=require('./config');
var auth=require('./common/auth');
var orderController = require('./controllers/order');
var signController=require('./controllers/sign');
var userController=require('./controllers/user');
var staticController=require('./controllers/static');
var replyController=require('./controllers/reply');//reply controller
var siteController=require('./controllers/site');//site controller
var userGpController=require('./controllers/usergroup');//usergroup controller
var router = express.Router();
// home page
router.get('/', siteController.index);
//#### 登录注册 ####

// signController controller
if (config.allow_sign_up) {
  router.get('/signup', signController.showSignup);  // 跳转到注册页面
  router.post('/signup', signController.validateName,signController.signup);  // 提交注册信息
} else {
//   router.get('/signup', configMiddleware.github, passport.authenticate('github'));  // 进行github验证
}
router.get('/signout',signController.signout); //登出
router.get('/signin',signController.showLogin); //进入登录页面
router.post('/signin',signController.login); //登录校验
router.get('/active_account',signController.activeAccount);//账号激活

router.get('/search_pass',signController.showSearchPass);//进入找回密码页面
router.post('/search_pass',signController.updateSearchPass);//密码找回申请
router.get('/reset_pass',signController.resetPass);//进入重置密码页面
router.post('/reset_pass',signController.updatePass);//更新密码

//用户相关
router.get('/setting', auth.userRequired,userController.showSetting); //账号信息设置
router.post('/setting', auth.userRequired,userController.setting); //账号信息设置
router.get('/users/top10',userController.top10); //用户积分排行榜
//####订餐####
router.get('/orders', orderController.index);
//按日期查询当日订餐记录
router.get('/orders/:qdate/query', orderController.query);
//编辑订餐页
router.get('/orders/:oid/edit',auth.userRequired, orderController.showEdit);
//新建订餐
router.post('/orders/create', auth.userRequired,orderController.create);
//删除订餐
router.get('/orders/:oid/del', auth.userRequired,orderController.del);
// 更新订餐
router.post('/orders/:oid/edit', auth.userRequired,orderController.update);


// static
router.get('/about', staticController.about);

//回复
// reply controller
router.post('/:object_id/reply', auth.userRequired, replyController.messageboard_add); // 提交一级回复
router.post('/reply/:reply_id/delete', auth.userRequired, replyController.delete); // 删除某评论
router.post('/reply/:reply_id/up', auth.userRequired, replyController.up); // 为评论点赞
router.get('/reply/:reply_id/edit', auth.userRequired, replyController.showEdit); // 修改自己的评论页
router.post('/reply/:reply_id/edit', auth.userRequired, replyController.update); // 修改某评论



// admin
router.get('/admin/userlist',auth.adminRequired,userController.showuser_list); //用户列表页
router.post('/admin/userlist',auth.adminRequired,userController.user_list);//获取用户列表
router.get('/admin/user/:userId/active',auth.adminRequired,userController.active);//激活用户
router.get('/admin/user/:userId/:action/block',auth.adminRequired,userController.block);//激活用户
router.get('/admin/usergroup',auth.adminRequired,userGpController.group_list);//分组列表
router.post('/admin/group/create',auth.adminRequired,userGpController.create);//激活用户
router.post('/admin/group/:gid/del',auth.adminRequired,userGpController.del);//激活用户
router.post('/admin/group/:gid/edit',auth.adminRequired,userGpController.edit);//激活用户

//####图表####
//
router.get('/charts',function(req, res,next) {
    res.locals.current_page='charts'
	res.render('charts/charts', {
	    title: '图表统计'
	});
});
//statistics统计
router.post('/orders/:type/statistics',orderController.statistics); //订餐统计






//api_v1
router.get('/signController/:name/validname', signController.validateName_api_v1);




module.exports = router;
