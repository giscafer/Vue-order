var validator = require('validator');
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var OrderModel = require('../models').Order;
var tools = require('../common/tools');

/**
 * 首页，按日期查询当日记录
 * @author giscafer
 * @version 1.0
 * @date    2016-01-02T12:11:21+0800
 */
exports.index = function(req, res, next) {
    var queryDate = req.params.qdate;
    //查询过滤
    var query = {
        "$and": [{
            "update_at": {
                "$gt": queryDate + " 0:0:0"
            }
        }, {
            "update_at": {
                "$lt": queryDate + " 23:59:59"
            }
        }]
    };

    OrderModel.find(query).exec(function(err, orders) {
        if (err) {
            next(err);
        }
        res.send({
            data: orders
        });
    });
};
exports.showEdit = function(req, res, next) {
    var order_id = req.params.oid;
    console.log(order_id);
    if (order_id) {
        OrderProxy.getOrderById(order_id, function(err, order) {
            if (!order) {
                res.render404('此话题不存在或已被删除。');
                return;
            }
            // if (String(order.user_id) === String(req.session.user._id) || req.session.user.is_admin) {
            res.render('order/edit', {
                action: 'edit',
                title: '编辑订餐',
                order_id: order._id,
                dish_name: order.dish_name,
                dish_price: order.dish_price,
                ispack: order.ispack,
            });

            // } else {
            //   res.renderError('对不起，你不能编辑此话题。', 403);
            // }
        });
    }
};
/**
 * 新增
 * @author giscafer
 * @version 1.0
 * @date    2016-01-02T12:11:09+0800
 * @param   {Function}               next 
 */
exports.create = function(req, res, next) {
    var dish_name = validator.trim(req.body.dish_name);
    dish_name = validator.escape(dish_name);
    var dish_price = validator.trim(req.body.dish_price);
    dish_price = Number(dish_price);
    // var user_id = validator.trim(req.body.user_id);
    if (ispack === 'on') {
        ispack = true;
    } else {
        ispack = false;
    }
    // 验证（前端页面使用了bootStrapValidator插件验证，这里其实不需要）
    var editError;
    if (dish_name === '') {
        editError = '菜名不能是空的。';
    } else if (dish_name.length < 2 || dish_name.length > 8) {
        editError = '菜名字数太多或太少（2~8个字符）。';
    } else if (dish_price < 0) {
        editError = '价格不能小于0。';
    }
    // END 验证

    if (editError) {
        res.status(422);
        return res.render('index', {
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

exports.update = function(req, res, next) {
    var order_id = req.params.oid;
    var dish_name = validator.trim(req.body.dish_name);
    dish_name = validator.escape(dish_name);
    var dish_price = validator.trim(req.body.dish_price);
    dish_price = Number(dish_price);
    var ispack = req.body.ispack;
    if (ispack === 'on') {
        ispack = true;
    } else {
        ispack = false;
    }

    OrderProxy.getOrderById(order_id, function(err, order) {
        if (!order) {
            res.render404('此订餐记录不存在或已被删除。');
            return;
        }

        // if (order.author_id.equals(req.session.user._id) || req.session.user.is_admin) {
        if (1==1) {
            // 验证
            var editError;
            if (dish_name === '') {
                editError = '菜名不能是空的。';
            } else if (dish_name.length < 2 || dish_name.length > 8) {
                editError = '菜名字数太多或太少（2~8个字符）。';
            } else if (dish_price < 0) {
                editError = '价格不能小于0。';
            }
            // END 验证

            if (editError) {
                return res.render('order/edit', {
                    action: 'edit',
                    edit_error: editError,
                    dish_name: dish_name,
                    dish_price: dish_price,
                    ispack: ispack
                });
            }

            //保存话题
            order.dish_name = dish_name;
            order.dish_price = dish_price;
            order.ispack = ispack;
            order.update_at = new Date();

            order.save(function(err) {
                if (err) {
                    return next(err);
                }
                //跳转首页
                res.redirect('/');
            });
        } else {
            res.renderError('对不起，你不能编辑此记录。', 403);
        }
    });
};
