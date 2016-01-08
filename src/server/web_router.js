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
var router = express.Router();
// home page
router.get('/', function(req, res) {
	res.render('index', {
	    title: '首页'
	});
});
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

router.get('/setting', auth.userRequired,userController.showSetting); //账号信息设置
router.post('/setting', auth.userRequired,userController.setting); //账号信息设置
//####订餐####
// router.get('/orders', orderController.index);
//按日期查询当日订餐记录
router.get('/orders/:qdate', orderController.index);
//编辑订餐页
router.get('/orders/:oid/edit',auth.userRequired, orderController.showEdit);
//新建订餐
router.post('/orders/create', auth.userRequired,orderController.create);
//删除订餐
router.get('/orders/:oid/del', auth.userRequired,orderController.del);
// 更新订餐
router.post('/orders/:oid/edit', auth.userRequired,orderController.update);

//####图表####
//
router.get('/charts',function(req, res) {
	res.render('charts/charts', {
	    title: '图表统计'
	});
});
//###其他页面###
router.get('/about', function(req, res) {
	res.render('about', {
	    title: '关于站点'
	});
});

//api_v1
router.get('/signController/:name/validname', signController.validateName_api_v1);




module.exports = router;
