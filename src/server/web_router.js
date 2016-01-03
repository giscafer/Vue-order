/**
 * 路由
 * @type {[type]}
 */
var express = require('express');
var orderController = require('./controllers/order');
var router = express.Router();
// home page
router.get('/', function(req, res) {
	res.render('index', {
	    title: '首页'
	});
});
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

//####订餐####
//
router.get('/charts',function(req, res) {
	res.render('charts/charts', {
	    title: '图表统计'
	});
});


module.exports = router;
