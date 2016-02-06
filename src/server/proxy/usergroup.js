var UserGroupModel=require('../models').UserGroup;

/**
 * 根据groudId查询分组
 */
exports.getUserGroupById=function(id,callback){
    if(!id){
        return callback(null,[]);
    }
    UserGroupModel.findOne({_id:id},callback);
};
/**
 * 根据分组名称title查询分组
 */
exports.getUserGroupByTitle=function(title,callback){
    if(!title){
        return callback(null,[]);
    }
    UserGroupModel.findOne({'title':title},callback);
};
/**
 * 根据分组ID列表，获取一组分组
 * Callback:
 * - err, 数据库异常
 * @param {Array} ids 分组ID列表
 * @param {Function} callback 回调函数
 */
exports.getGroupsByIds=function(ids,callback){
	UserGroupModel.find({'_id':{'$in':ids}},callback);
};
/**
 * 获取分组数量
 * Callback:
 * - err, 数据库错误
 * - count, 分组数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  UserGroupModel.count(query, callback);
};
/**
 * 根据关键字，获取一组分组
 * Callback:
 * - err, 数据库异常
 * - groups, 分组列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getGroupsByQuery=function(query,opt,callback){
	UserGroupModel.find(query,'',opt,callback);
};
/**
 * 删除分组
 */
exports.removeById=function(id,callback){
    UserGroupModel.remove({_id:id},callback);
};
/**
 * 保存接口
 */
exports.newAndSave=function(grouptitle,callback){
    var userGroup=new UserGroupModel();
    userGroup.grouptitle=grouptitle;
    userGroup.save(callback);
}