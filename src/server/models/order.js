var mongoose=require('mongoose');
var BaseModel = require("./base_model");
var Schema= mongoose.Schema;
var ObjectId=Schema.ObjectId;

var OrderSchema=new Schema({
	user_id: { type: ObjectId }, //用户
	username:{type:String},
	dish_name: { type: String }, //菜名
	dish_price: { type: Number, default: 12 }, //菜价
	ispack: { type: Boolean, default: false }, //是否打包
	create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    deleted: {type: Boolean, default: false} //删除的order
});
OrderSchema.plugin(BaseModel);
OrderSchema.index({create_at: -1});
OrderSchema.index({user_id: 1, create_at: -1});

mongoose.model('Order', OrderSchema);