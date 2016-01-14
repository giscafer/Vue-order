
/**
 * 订餐控制器
 */
var validator = require('validator');
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var UserProxy = require('../proxy').User;

exports.index = function (req, res, next) {
    var proxy = new EventProxy();
    proxy.fail(next);
  
    UserProxy.getUsersByQuery(
        {'$or': [
          {is_block: {'$exists': false}},
          {is_block: false}
        ]},
        { limit: 10, sort: '-score'},
        proxy.done('tops', function (tops) {
          return tops;
        })
      );
      
    proxy.all('tops',function (tops) {
      res.locals.current_page='index';
      res.render('index', {
        tops: tops,
        pageTitle:'首页'
      });
    });
}