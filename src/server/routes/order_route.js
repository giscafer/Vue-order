/**
 * 订餐相关接口路由
 */
var express = require('express');
var router = express.Router();
var auth=require('../common/auth');
var orderController = require('../controllers/order');


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

module.exports = router;