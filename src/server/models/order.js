var mongoose=require('mongoose');
var BaseModel = require("./base_model");
var Schema= mongoose.Schema;
var ObjectId=Schema.ObjectId;
// var config=require('../config');
// var _ =require('lodash');

var OrderSchema=new Schema({
	user_id: { type: ObjectId }, //用户
	dish_name: { type: String }, //菜名
	dish_price: { type: Number, default: 12 }, //菜价
	create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now }
});
OrderSchema.plugin(BaseModel);
OrderSchema.index({create_at: -1});
OrderSchema.index({user_id: 1, create_at: -1});

mongoose.model('Order', OrderSchema);