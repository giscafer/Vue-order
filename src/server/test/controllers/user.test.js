/**
 * user controller test
 */
/**
 * Module dependencies.
 */
var app = require('../../../../app');
var should = require('chai').should();
var UserProxy=require('../../proxy/user');
var pedding=require('pedding');
var support=require('../support/support');
var request=require('supertest')(app);
var _=require('lodash');

describe('test/controllers/user.test.js',function(){
    
    var testUser;
    //测试用户注册
    before(function(done){
        // done=pedding(done,2);
        // support.ready(done);
        //创建一个用户
        support.createUser(function(err,user){
           testUser=user;
           support.testUserArr.push(user);
           done(err); 
        });
    });
    //测试完毕后将测试注册的用户删除
  after(function(done){
    _.map(support.testUserArr,function(_user){
       _user.remove(function(err){
           should.not.exist(err);
       }); 
    });
    done();
  });
  //积分榜测试
   describe('#top10', function () {
    it('should get /users/top10', function (done) {
      request.get('/users/top10')
      .expect(200, function (err, res) {
        res.text.should.contain('Top10 积分榜');
        done(err);
      });
    });
  });
});