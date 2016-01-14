/**
 * 评论回复控制器
 */
var validator = require('validator');
var _ = require('lodash');
var at = require('../common/at');
var EventProxy = require('eventproxy');
var UserProxy = require('../proxy').User;
var OrderProxy = require('../proxy').Order;
var ReplyProxy = require('../proxy').Reply;
var config = require('../config');
var tools = require('../common/tools');
var mongoose = require('mongoose');
/**
 * messageboard留言板
 */
exports.messageboard_add = function (req, res, next) {
    var content = req.body.r_content;
    var reply_id = req.body.reply_id;
    //留言板object_id写死了
    var objId = new mongoose.Types.ObjectId(tools.stringToHex('messageboard'));
    console.log(objId);
    var str = validator.trim(content);
    if (str === '') {
        return res.renderError('回复内容不能为空!', 422);
    }

    var ep = EventProxy.create();
    ep.fail(next);

    ReplyProxy.newAndSave(content, objId, req.session.user._id, reply_id, function (err, reply) {
        if (err) return next(err);
        ep.emit('reply_saved', reply);
    });

    UserProxy.getUserById(req.session.user._id, ep.done(function (user) {
        user.score += 5;
        user.reply_count += 1;
        user.save();
        req.session.user = user;
        ep.emit('score_saved');
    }));


    ep.all('reply_saved', 'score_saved', function (reply) {
        res.redirect('/about#' + reply._id);
    });
};
/**
 * 删除回复
 */
exports.delete = function (req, res, next) {
    var reply_id = req.params.reply_id;
    if (!reply_id) return next();
    ReplyProxy.getReplyById(reply_id, function (err, reply) {
        if (err) {
            return next(err);
        }
        if (!reply) {
            res.status(422);
            res.json({ status: '该回复 ' + reply_id + ' 不存在' });
            return;
        }
        //判断是否是本人回复
        if (reply.user_id.toString() === req.session.user._id.toString() || req.session.user.is_admin) {
            reply.deleted = true;
            reply.save(function (err) {
                if(err){
                    return next(err);
                }
                res.json({status:'success'});
                
                if(!reply.reply_id){ //如果回复下没有回复
                    reply.user.score-=5;
                    reply.user.reply_count-=1;
                    reply.user.save();
                }
            });
        }else{
            res.json({status:'failed'});
            return;
        }

    });
};
/**
 * 评论置顶
 */
exports.up = function (req, res, next) {
  var replyId = req.params.reply_id;
  var userId = req.session.user._id;
  ReplyProxy.getReplyById(replyId, function (err, reply) {
    if (err) {
      return next(err);
    }
    if (reply.user_id.equals(userId) && !config.debug) {
      // 不能帮自己点赞
      res.send({
        success: false,
        message: '做人要谦虚，不能给自己点赞。',
      });
    } else {
      var action;
      reply.ups = reply.ups || [];
      var upIndex = reply.ups.indexOf(userId);
      if (upIndex === -1) {
        reply.ups.push(userId);
        action = 'up';
      } else {
        reply.ups.splice(upIndex, 1);
        action = 'down';
      }
      reply.save(function () {
        res.send({
          success: true,
          action: action
        });
      });
    }
  });
};
/**
 * 修改评论页
 */
exports.showEdit = function (req, res, next) {
  var reply_id = req.params.reply_id;

  ReplyProxy.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      return res.render404('此回复不存在或已被删除。');
    }
    if (req.session.user._id.equals(reply.user_id) || req.session.user.is_admin) {
      res.render('reply/edit', {
        reply_id: reply._id,
        content: reply.content
      });
    } else {
      return res.renderError('对不起，你不能编辑此回复。', 403);
    }
  });
};

/** 
 * 更新编辑回复
*/
exports.update = function (req, res, next) {
  var reply_id = req.params.reply_id;
  var content = req.body.t_content;

  ReplyProxy.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      return res.render404('此回复不存在或已被删除。');
    }

    if (String(reply.user_id) === req.session.user._id.toString() || req.session.user.is_admin) {

      if (content.trim().length > 0) {
        reply.content = content;
        reply.save(function (err) {
          if (err) {
            return next(err);
          }
          //目前写死跳转留言板
          res.redirect('/about#' + reply._id);
        });
      } else {
        return res.renderError('回复的字数太少。', 400);
      }
    } else {
      return res.renderError('对不起，你不能编辑此回复。', 403);
    }
  });
};