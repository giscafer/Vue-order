var Order = require('../models').Order;
var EventProxy = require('eventproxy');
var tools = require('../common/tools');

/**
 * 获取一条订单信息
 * @param {String} id 订单ID
 * @param {Function} callback 回调函数
 */
exports.getOrder = function(id, callback) {
    Order.findOne({
        _id: id
    }, callback);
};

/**
 * 根据ID，获取订单信息
 * Callback:
 * - err, 数据库异常
 * - order, 订单信息
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getOrderById = function(id, callback) {
    if (!id) {
        return callback(null, null);
    }
    Order.findOne({
        _id: id
    }, function(err, order) {
        if (err) {
            return callback(err);
        }
        if (!order) {
            return callback(err, null);
        }

        var user_id = order.user_id;
        if(user_id){
            User.getUserById(user_id, function (err, user) {
              if (err) {
                return callback(err);
              }
              order.user = user;
             
              return callback(null, order);
            });
        }else{
            return callback(err, order);
        }
        
    });
};
/**
 * 根据用户ID，获取订单信息
 * Callback:
 * - err, 数据库异常
 * - order, 订单信息
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getRepliesByUserId = function(userId, opt, callback) {
    if (!callback) {
        callback = opt;
        opt = null;
    }
    Order.find({
        user_id: authorId
    }, {}, opt, callback);
};
/**
 * 创建并保存一条订单信息
 * @param {String} dish_name 菜名
 * @param {Number} dish_price 价格
 * @param {String} user_id 回复作者
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function(dish_name, dish_price, ispack,user_id, callback) {
    if (typeof user_id === 'function') {
        callback = user_id;
        user_id = null;
    }
    var order = new Order();
    order.dish_name = dish_name;
    order.dish_price = dish_price;
    order.ispack = ispack;

    if (user_id) {
        order.user_id = user_id;
    }
    order.save(function(err) {
    	if (err) {
    	  return callback(err,order);
    	}
        callback(err, order);
    });
};
