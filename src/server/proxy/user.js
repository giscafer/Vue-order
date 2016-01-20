var models=require('../models');
var User=models.User;
var uuid=require('node-uuid');

/**
 * 根据昵称查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} name 账号名列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByName=function(name,callback){
	if(name==='' || name===undefined){
		return callback(null,[]);
	}
	User.find({name:name},callback);
};
/**
 * 根据用户名列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} names 账号名列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByLoginNames=function(names,callback){
	if(names.length===0){
		return callback(null,[]);
	}
	User.find({loginname:{$in:names}},callback);
};
/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName=function(loginName,callback){
	User.findOne({'loginname':loginName},callback);
};
/**
 * 根据分组名称查找用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByGroupId=function(groupid,callback){
	User.find({'groupid':groupid},callback);
};
/**
 * 根据用户ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById=function(id,callback){
	User.findOne({_id:id},callback);
};
/**
 * 根据邮箱，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail=function(email,callback){
	User.findOne({email:email},callback);
};

/**
 * 根据用户ID列表，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds=function(ids,callback){
	User.find({'_id':{'$in':ids}},callback);
};
/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery=function(query,opt,callback){
	User.find(query,'',opt,callback);
};
/**
 * 根据查询条件，获取一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginname 账号名
 * @param {String} key 激活码
 * @param {Function} callback 回调函数
 */
exports.getUserByNameAndKey=function(loginname,key,callback){
	User.findOne({loginname:loginname,retrieve_key:key},callback);
};
/**
 * 获取用户数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  User.count(query, callback);
};
/**
 * 保存注册用户
 * @param  {String}   name      昵称
 * @param  {String}   loginname 用户名
 * @param  {String}   pass      密码
 * @param  {String}   email     邮箱
 * @param  {Boolean}   active    是否激活
 * @param  {Function} callback  
 */
exports.newAndSave=function(name,loginname,pass,email,active,callback){
	var user=new User();
	user.name=name;
	user.loginname=loginname;
	user.pass=pass;
	user.email=email;
	user.active=active || false;
	user.accessToken=uuid.v4();
	//保存注册信息
	user.save(callback);
};

