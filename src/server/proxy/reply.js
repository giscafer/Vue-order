/**
 * reply代理
 */
var Reply=require('../models').Reply;
var EventProxy=require('eventproxy');
var tools=require('../common/tools');
var User=require('./user');
var at=require('../common/at');

/**
 * 获取一条回复信息
 * @param {String} id 回复ID
 * @param {Function} callback 回调函数
 */
exports.getReply=function(id,callback){
     Reply.findOne()
};
/**
 * 根据回复ID，获取回复
 * Callback:
 * - err, 数据库异常
 * - reply, 回复内容
 * @param {String} id 回复ID
 * @param {Function} callback 回调函数
 */
exports.getReplyById=function(id,callback){
    if(!id){
        return callback(null,null);
    }
    Reply.findOne({_id:id},function(err,reply){
        if(err){
            return callback(err);
        }
        if(!reply){
            return callback(err,null);
        }
        var user_id=reply.user_id;
        User.getUserById(user_id,function(err,user){
            if(err){
                return  callback(err);
            }
            reply.user=user;
            at.linkUsers(reply.content,function(err,str){
                if(err){
                    return callback(err);
                }
                reply.content=str;
                return callback(err,reply);
            });
        });
    });
};

/**
 * 根据objId，获取回复列表
 * Callback:
 * - err, 数据库异常
 * - replies, 回复列表
 * @param {String} id objId
 * @param {Function} callback 回调函数
 */
exports.getRepliesByObjectId = function (id, cb) {
  Reply.find({object_id: id, deleted: false}, '', {sort: 'create_at'}, function (err, replies) {
    if (err) {
      return cb(err);
    }
    if (replies.length === 0) {
      return cb(null, []);
    }

    var proxy = new EventProxy();
    proxy.after('reply_find', replies.length, function () {
      cb(null, replies);
    });
    for (var j = 0; j < replies.length; j++) {
      (function (i) {
        var user_id = replies[i].user_id;
        User.getUserById(user_id, function (err, user) {
          if (err) {
            return cb(err);
          }
          replies[i].user = user || { _id: '' };
          if (replies[i].content_is_html) {
            return proxy.emit('reply_find');
          }
          at.linkUsers(replies[i].content, function (err, str) {
            if (err) {
              return cb(err);
            }
            replies[i].content = str;
            proxy.emit('reply_find');
          });
        });
      })(j);
    }
  });
};
/**
 * 创建并保存一条回复信息
 * @param {String} content 回复内容
 * @param {String} objectId 回复对象ID mongoose.Types.ObjectId.toString()
 * @param {String} userId 回复用户
 * @param {String} [replyId] 回复ID，当二级回复时设定该值
 * @param {Function} callback 回调函数
 */
exports.newAndSave=function(content,objectId,userId,replyId,callback){
    
    if(typeof replyId==='function'){
        callback=replyId;
        replyId=null;
    }
    var reply=new Reply();
    reply.content=content;
    reply.object_id=objectId;
    reply.user_id=userId;
    
    if(replyId){
        reply.reply_id=replyId;
    }
    reply.save(function(err){
       callback(err,reply); 
    });
};

/**
 * 根据objId查询到最新的一条未删除回复
 * @param objId 回复对象ID
 * @param callback 回调函数
 */
exports.getLastReplyByObjId=function(objId,callback){
    Reply.find({object_id:objId},{},{},callback);
    // Reply.find({object_id:objId,delete:false},'_id',{sort:{create_at:-1},limit:1},callback);
};
/**
 * 根据用户id获取所有回复
 */
exports.getRepliesByUserId=function(userId,opt,callback){
    if(callback){
        callback=opt;
        opt=null;
    }
    Reply.find({user_id:userId},{},opt,callback);
};
/**
 * 通过userId获取回复总数
 */
exports.getCountByUserId=function(userId,callback){
    Reply.count({user_id:userId},callback);
}