
/**
 * 订餐控制器
 */
var validator = require('validator');
var EventProxy = require('eventproxy');
var OrderProxy = require('../proxy').Order;
var UserProxy = require('../proxy').User;
var request = require('request');
var requestSync = require('sync-request');

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
};
exports.getMean = function(req, res, next){
  var lng = req.query.lng;
  var lat = req.query.lat;
  var name = req.query.name;
  var url = "http://mainsite-restapi.ele.me/shopping/restaurants/search?extras[]=activity&keyword="+name+"&latitude="+lat+"&limit=1&longitude="+lng+"&offset=0";
  var result = requestSync('GET', url);
  try {
      var responseJson = JSON.parse(result.getBody().toString());
  } catch (error) {
      // 解析失败
      console.log("Error!" + error.stack);
      res.write({ success: false, message: '获取商铺信息失败' });
      res.end();
  }
  
  var canteenUrl = "http://mainsite-restapi.ele.me/shopping/v1/menu?restaurant_id="+responseJson.restaurant_with_foods[0].restaurant.id;
  var canteenResult = requestSync('GET', canteenUrl);
  try {
      res.write(canteenResult.getBody().toString());
      res.end();
  } catch (error) {
      // 解析失败
      res.write({ success: false, message: '获取商铺信息失败' });
      res.end();
  }
};