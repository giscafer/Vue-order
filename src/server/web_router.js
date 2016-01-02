var express = require('express');
var orderController = require('./controllers/order');
var router = express.Router();
// home page
router.get('/', function(req, res) {
	res.render('index', {
	    title: '首页'
	});
});
router.get('/topics', orderController.index);
router.post('/orders', orderController.add);
// 
module.exports = router;
