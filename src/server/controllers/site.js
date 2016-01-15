
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

      //最新加入
    UserProxy.getUsersByQuery(
        {'$or': [
          {is_block: {'$exists': false}},
          {is_block: false}
        ]},
        { limit: 10, sort: '-create_at'},
        proxy.done('lasts', function (lasts) {
          return lasts;
        })
      );
        //积分排行榜
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
    proxy.all('lasts','tops',function (lasts,tops) {
      res.locals.current_page='index';
      res.render('index', {
        lasts: lasts,
        tops: tops,
        pageTitle:'首页'
      });
    });
}