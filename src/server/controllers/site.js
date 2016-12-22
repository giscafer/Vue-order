
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
  var url = "http://mainsite-restapi.ele.me/shopping/restaurants?extras%5B%5D=activities&geohash=wx4ejbc13vb&latitude="+lat+"&limit=1&longitude="+lng+"&offset=0";
  var result = requestSync('GET', url);
  var responseJson = JSON.parse(result.getBody().toString());
  var canteenUrl = "http://mainsite-restapi.ele.me/shopping/v1/menu?restaurant_id="+responseJson[0].id;
  var canteenResult = requestSync('GET', canteenUrl);
  res.locals.current_page='orders'
  res.render('orders', {
      title: '首页'
  });
//   try {
//       // res.write(canteenResult.getBody().toString());
//       // res.end();
//   } catch (error) {
//       // 解析失败
//       console.log("Error!" + error.stack);
//   }
};