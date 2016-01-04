var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var BaseModel=require('./base_model');
var ObjectId=Schema.Types.ObjectId;
var UserSchema=new Schema({
	name:{type:String},
	loginname:{type:String},
	pass:{type:String},
	email:{type:String},
	phone:{type:String},
	role:{type:Number},
	shop_id:[{type:ObjectId,ref:'Shop'}],
	profile_image_url:{type:String},
	signature:{type:String},
	score:{type:Number, default: 0},
	level:{type:String},
	comments_count:{ type: Number, default: 0 },
	create_at:{type:Date,default:Date.now},
	update_at: { type: Date, default: Date.now },

	active: { type: Boolean, default: false },

	retrieve_time: {type: Number},
	retrieve_key: {type: String},

	accessToken: {type: String}
});

UserSchema.plugin(BaseModel);

UserSchema.virtual('isAdvanced').get(function () {
  // 积分高于 700 则认为是高级用户
  return this.score > 700 || this.is_star;
});
//创建索引
UserSchema.index({loginname:1},{unique:true});
UserSchema.index({email:1},{unique:true});
UserSchema.index({score:-1});

mongoose.model('User',UserSchema);