
/**
 * 点评Schema
 */
var mongoose = require("mongoose");
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;
var ObjectId=Schema.Types.ObjectId;

var ReplySchema = new Schema({
    content: { type: String }, //评论内容
    object_id: { type: ObjectId }, //这里命名为object_id，是因为后期评论对象可能为订餐和商家以及文章；
    user_id: { type: ObjectId }, //评论用户
    reply_id: { type: ObjectId }, //回复ID
    create_at: { type: Date, default: Date.now },
    update_at: { type: Boolean, default: Date.now },
    ups: [ObjectId],
    deleted: { type: Boolean, default: false } //给删除的评论做个标识，删除并不是真正的删除
});

ReplySchema.plugin(BaseModel);
ReplySchema.index({object_id:1});
ReplySchema.index({user_id:1,create_at:-1});


mongoose.model('Reply',ReplySchema);
