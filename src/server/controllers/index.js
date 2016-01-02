var Order = require('../models/index').Order;
    //index page
exports.index = function(req, res) {

    Order.find({}).exec(function(err, orders) {
            if (err) {
                console.log(err);
            }
            console.log('请求首页');
            console.log(orders);
            res.render('index', {
                title: '首页',
                orders: orders
            });
        });
};