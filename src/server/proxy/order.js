var OrderModel = require('../models').Order;
var UserProxy = require('./user');
var EventProxy = require('eventproxy');
var tools = require('../common/tools');
var _ =require('lodash');
/**
 * 获取一条简单的订单信息
 * @param {String} id 订单ID
 * @param {Function} callback 回调函数
 */
exports.getOrder = function(id, callback) {
    OrderModel.findOne({
        _id: id
    }, callback);
};
/**
 * 根据用户ID，获取订单信息
 * Callback:
 * - err, 数据库异常
 * - order, 订单信息
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getOrderByUserId = function(userId, opt, callback) {
    if (!callback) {
        callback = opt;
        opt = null;
    }
    OrderModel.find({
        user_id: userId
    }, {}, opt, callback);
};
/**
 * 根据ID，获取订单信息(包括用户信息)
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
    OrderModel.findOne({
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
            UserProxy.getUserById(user_id, function (err, user) {
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
 * 根据关键词，获取订餐列表
 * Callback:
 * - err, 数据库错误
 * - count, 记录列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getOrdersByQuery = function (query, opt, callback) {
 result=[];
  OrderModel.find(query, {}, opt, function (err, orders) {
    if (err) {
      return callback(err);
    }
    if (orders.length === 0) {
      return callback(null, []);
    }
    orders.forEach(function (order, i) {
      var ep = new EventProxy();
      ep.all('user_done', function (user) {
        // 作者可能已被删除
        if (user) { 
            //order.user=user;//赋值失败原因未知 2016年1月5日02:34:47
          order.username = user.loginname;
        } else {
          orders[i] = null;
        }
        if(i===orders.length-1){
           orders = _.compact(orders); // 删除不合规的 order
           return callback(null, orders); 
        }
      });

      UserProxy.getUserById(order.user_id, ep.done('user_done'));
      
    });
    
        
    /*
    ////赋值失败，迫不得已在schema中添加了username字段，未知（如果您知道请告知）
    var proxy = new EventProxy();
    proxy.after('order_ready', orders.length, function () {
      orders = _.compact(orders); // 删除不合规的 order
      return callback(null, orders); 
    });
    proxy.fail(callback);

    orders.forEach(function (order, i) {
      var ep = new EventProxy();
      ep.on('user', function (user) {
        // 作者可能已被删除
       
        if (user) {
            //order.user=user;//赋值失败原因未知
          order.username = user.loginname;
          result.push(user.loginname);
        } else {
          orders[i] = null;
        }
      });
      proxy.emit('order_ready');
      UserProxy.getUserById(order.user_id, ep.done('user'));
    });*/
  });
};
/**
 * 创建并保存一条订单信息
 * @param {String} dish_name 菜名
 * @param {Number} dish_price 价格
 * @param {String} user_id 订餐用户
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function(dish_name, dish_price, ispack,user_id, callback) {
    if (typeof user_id === 'function') {
        callback = user_id;
        user_id = null;
    }
    var order = new OrderModel();
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
