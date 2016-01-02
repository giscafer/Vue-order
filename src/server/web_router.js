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
router.get('/orders', orderController.index);
router.get('/orders/:qdate', orderController.index);
router.post('/orders', orderController.add);
router.get('/orders/:oid/del', orderController.del);
// 
module.exports = router;
