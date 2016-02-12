var UserProxy=require('../../proxy/user');
var OrderProxy=require('../../proxy/order');
var ReplyProxy=require('../../proxy/reply');
var ready=require('ready'); //https://github.com/supershabam/ready
var tools = require('../../common/tools');
var Eventproxy=require('eventproxy');

exports.testUserArr=[];
function randomInt(){
    return (Math.random()*1000).toFixed(0);
}
//创建用户
var createUser=exports.createUser=function(callback){
    var key=new Date().getTime()+'_'+randomInt();
    tools.bhash('pass',function(err,passhash){
        UserProxy.newAndSave('giscafer'+key,'giscafer'+key,passhash,'giscafer'+key+'@163.com',false,callback)
    });
};

exports.createUserByNameAndPwd=function(loginname,pwd,callback){
    tools.bhash(pwd,function(err,passhash){
        UserProxy.newAndSave(loginname,loginname,passhash,loginname+new Date()+'@163.com',true,callback)
    });
};
//创建订单
var createOrder=exports.createOrder=function(userId,callback){
    var key=new Date().getTime()+'_'+randomInt();
    OrderProxy.newAndSave('dishName'+key,12,false,userId,callback);
}

function mockUser(user) {
  return 'mock_user=' + JSON.stringify(user) + ';';
}

// ready(exports);

var ep = new Eventproxy();
ep.fail(function (err) {
  console.error(err);
});

ep.all('user', 'user2', 'admin', function (user, user2, admin) {
  exports.normalUser = user;
  exports.normalUserCookie = mockUser(user);

  exports.normalUser2 = user2;
  exports.normalUser2Cookie = mockUser(user2);

  var adminObj = JSON.parse(JSON.stringify(admin));
  adminObj.is_admin = true;
  exports.adminUser = admin;
  exports.adminUserCookie = mockUser(adminObj);
  
  exports.testUserArr.push(user);
  exports.testUserArr.push(user2);
  exports.testUserArr.push(admin);
  
  createOrder(user._id, ep.done('order'));
});
createUser(ep.done('user'));
createUser(ep.done('user2'));
createUser(ep.done('admin'));

ep.all('order', function (order) {
  exports.testOrder = order;
//   createReply(order._id, exports.normalUser._id, ep.done('reply'));
//   exports.ready(true);
});

// ep.all('reply', function (reply) {
//   exports.testReply = reply;
//   exports.ready(true);
// });