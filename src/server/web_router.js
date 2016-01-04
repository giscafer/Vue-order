/**
 * 路由
 * @type {[type]}
 */
var express = require('express');
var config=require('./config');
var orderController = require('./controllers/order');
var sign=require('./controllers/sign');
var router = express.Router();
// home page
router.get('/', function(req, res) {
	res.render('index', {
	    title: '首页'
	});
});
//#### 登录注册 ####

// sign controller
if (config.allow_sign_up) {
  router.get('/signup', sign.showSignup);  // 跳转到注册页面
  router.post('/signup', sign.signup);  // 提交注册信息
} else {
  router.get('/signup', configMiddleware.github, passport.authenticate('github'));  // 进行github验证
}
router.get('/signout',sign.signout)//登出
router.get('/signin',sign.showLogin)//进入登录页面
router.post('/signin',sign.login)//登录校验
router.get('/active_account',sign.activeAccount);//账号激活

router.get('/search_pass',sign.showSearchPass);//进入找回密码页面
router.post('/search_pass',sign.updateSearchPass);//密码找回申请
router.get('/reset_pass',sign.resetPass);//进入重置密码页面
router.post('/reset_pass',sign.updatePass);//更新密码

//####订餐####
router.get('/orders', orderController.index);
//编辑订餐页
router.get('/orders/:oid/edit', orderController.showEdit);
//按日期查询当日订餐记录
router.get('/orders/:qdate', orderController.index);
//新建订餐
router.post('/orders/create', orderController.create);
//删除订餐
router.get('/orders/:oid/del', orderController.del);
// 更新订餐
router.post('/orders/:oid/edit', orderController.update);

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

module.exports = router;
