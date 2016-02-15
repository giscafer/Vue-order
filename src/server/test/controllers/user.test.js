/**
 * user controller test
 */
/**
 * Module dependencies.
 */
var app = require('../../../../app');
var should = require('chai').should();
var UserProxy = require('../../proxy/user');
var pedding = require('pedding');
var support = require('../support/support');
var request = require('supertest')(app);
var _ = require('lodash');
var tools = require('../../common/tools');
var mongoose = require('mongoose');

describe('test/controllers/user.test.js', function () {

    var testUser;
    //测试用户注册
    before(function (done) {
        // done=pedding(done,2);
        // support.ready(done);
        //创建一个用户
        support.createUser(function (err, user) {
            testUser = user;
            support.testUserArr.push(user);
            done(err);
        });
    });
    //测试完毕后将测试注册的用户删除
    after(function (done) {
        _.map(support.testUserArr, function (_user) {
            _user.remove(function (err) {
                should.not.exist(err);
            });
        });
        done();
    });
    //积分榜测试
    describe('#top10()', function () {
        it('should get /users/top10', function (done) {
            request.get('/users/top10')
                .expect(200, function (err, res) {
                    res.text.should.contain('Top10 积分榜');
                    done(err);
                });
        });
    });

    describe('#showuser_list page', function () {
        it('should get admin/userlist', function (done) {
            request.get('/admin/userlist')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    res.text.should.contain('用户管理');
                    done(err);
                })
        });
    });
    describe('#block()', function () {
        it('should block user', function (done) {
            request.get('/admin/user/' + testUser._id + '/lock/block')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    UserProxy.getUserById(testUser._id, function (err, user) {
                        user.is_block.should.be.true;
                        done(err);
                    });
                });
        });
        it('should unblock user', function (done) {
            request.get('/admin/user/' + testUser._id + '/unlock/block')
                .set('Cookie', support.adminUserCookie)
                .expect(200, function (err, res) {
                    UserProxy.getUserById(testUser._id, function (err, user) {
                        user.is_block.should.be.false;
                        done(err);
                    });
                });
        });
        it('should be wrong when user is not exists', function (done) {
            var userId = new mongoose.Types.ObjectId(tools.stringToHex('usernotexist'));
            request.get('/admin/user/' + userId + '/lock/block')
                .set('Cookie', support.adminUserCookie)
                .expect(500, function (err, res) {
                    res.text.should.contain('user is not exists')
                    done(err);
                })
        });
    });
});