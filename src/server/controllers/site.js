
/**
 * 订餐控制器
 */
var validator = require('validator');
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var UserProxy = require('../proxy').User;
var request = require('request');
var map = require('./map');

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
   var responseJson = map.userLocation();
    proxy.all('lasts','tops',function (lasts,tops) {
      res.locals.current_page='index';
      res.render('index', {
        lasts: lasts,
        tops: tops,
        locationMap: responseJson,
        pageTitle:'首页'
      });
    });
};
exports.initMap = function(req, res, next){
    // var clientIp = map.getClientIP(req);
    var responseJson = map.userLocation();
    // var cateJson = map.getNearbyCate();
    if (responseJson.result.error == 161) {
          // 如果返回正常解析数据
          res.send({data:responseJson});
      } else {
          // 如果返回错误解析数据，需要申请key，否则一天不能超过多少次请求。。。
          console.log( ': 请求失败！错误代码：' +responseJson.result.error + "\r\n");
      } 
};