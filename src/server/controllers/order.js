var validator = require('validator');
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var OrderModel = require('../models').Order;

/**
 * 首页
 * @author giscafer
 * @version 1.0
 * @date    2016-01-02T12:11:21+0800
 * @param   {[type]}                 req  [description]
 * @param   {[type]}                 res  [description]
 * @param   {Function}               next [description]
 */
exports.index = function(req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = Number(req.query.limit) || 5;
    var mdrender = req.query.mdrender === 'false' ? false : true;

    var query = {};

    query.deleted = false;
    var options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: '-create_at -update_at'
    };

    var ep = new EventProxy();
    ep.fail(next);

    // OrderModel.find(query, '', options, ep.done('orders'));
    OrderModel.find({}).exec(function(err, orders) {
        if (err) {
            console.log(err);
        }
        res.send({
            data: orders
        });
    });
    ep.all('orders', function(orders) {
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
 * @param   {[type]}                 req  [description]
 * @param   {[type]}                 res  [description]
 * @param   {Function}               next [description]
 */
exports.add = function(req, res, next) {
    var dish_name = validator.trim(req.body.dish_name);
    dish_name = validator.escape(dish_name);
    var dish_price = validator.trim(req.body.dish_price);
    dish_price = Number(dish_price);
    var user_id = validator.trim(req.body.user_id);

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
            user_id: user_id
        });
    }

    OrderProxy.newAndSave(dish_name, dish_price, user_id, function(err, order) {
        if (err) {
            return next(err);
        }
        // res.redirect('/order/' + order._id);
        res.redirect('/');
    });
};
