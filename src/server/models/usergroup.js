/**
 * 用户组表
 */
var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;
var BaseModel=require('./base_model');

var UserGroupSchema=new Schema({
    grouptitle:{type:String} //组头衔
});

UserGroupSchema.plugin(BaseModel);
UserGroupSchema.index({grouptitle:1},{unique:true});

mongoose.model('UserGroup',UserGroupSchema);