var validator = require('validator');
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var OrderModel = require('../models').Order;
var tools=require('../common/tools');

/**
 * 首页，按日期查询当日记录
 * @author giscafer
 * @version 1.0
 * @date    2016-01-02T12:11:21+0800
 */
exports.index = function(req, res, next) {
    var queryDate=req.params.qdate;
    // console.log(queryDate);
    //查询过滤
    var query = {
        "$and": [{"update_at":{"$gt":queryDate+" 0:0:0"}},{"update_at":{"$lt":queryDate+" 23:59:59"}}]
    };

    var ep = new EventProxy();
    ep.fail(next);
  
    OrderModel.find(query).exec(function(err, orders) {
        if (err) {
            next(err);
        }
        res.send({
            data: orders
        });
    });
};
/**
 * 新增
 * @author giscafer
 * @version 1.0
 * @date    2016-01-02T12:11:09+0800
 * @param   {Function}               next 
 */
exports.add = function(req, res, next) {
    var dish_name = validator.trim(req.body.dish_name);
    dish_name = validator.escape(dish_name);
    var dish_price = validator.trim(req.body.dish_price);
    dish_price = Number(dish_price);
    var user_id = validator.trim(req.body.user_id);
    var ispack = validator.trim(req.body.ispack);
    if (ispack === 'on') {
        ispack = true;
    } else {
        ispack = false;
    }
    // 验证
    var editError;
    if (dish_name === '') {
        editError = '菜名不能是空的。';
    } else if (dish_name.length < 2 || dish_name.length > 6) {
        editError = '菜名字数太多或太少。';
    } else if (dish_price < 0) {
        editError = '价格不能小于0。';
    }
    // END 验证

    if (editError) {
        res.status(422);
        return res.render('order/edit', {
            edit_error: editError,
            dish_name: dish_name,
            dish_price: dish_price,
            ispack: ispack,
            user_id: user_id
        });
    }

    OrderProxy.newAndSave(dish_name, dish_price, ispack, user_id, function(err, order) {
        if (err) {
            return next(err);
        }
        // res.redirect('/order/' + order._id);
        res.redirect('/');
    });

};

/**
 * 删除订单
 * @author giscafer
 * @version 1.0
 * @date    2016-01-02T15:11:04+0800
 */
exports.del = function(req, res, next) {
    var order_id = req.params.oid;
    if (order_id) {
        OrderModel.remove({
            _id: order_id
        }, function(err, movie) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    success: 1
                });
            }
        });
    }
};
