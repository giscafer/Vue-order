/**
 * 静态页面
 * 关于页面等
 */
var models = require('../proxy');
var mongoose = require('mongoose');
var tools = require('../common/tools');
var ReplyProxy = models.Reply;
/**
 * 留言板
 */
exports.about = function (req, res, next) {
    var message_board={};
    var str=tools.stringToHex('messageboard');
    var objId = new mongoose.Types.ObjectId(str);
    ReplyProxy.getRepliesByObjectId(objId, function (err, replies) {
        if (err) {
            return next(err);
        }
        message_board.replies=replies;
        res.render('static/about', {
            object_id:'messageboard',
            message_board:message_board,
            pageTitle: '关于站点'
        });
    });
};
// FAQ
exports.faq = function (req, res, next) {
    res.render('static/faq');
};

