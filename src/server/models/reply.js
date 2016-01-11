
/**
 * 点评Schema
 */
var mongoose = require("mongoose");
var BaseModel = require("./base_model");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ReplySchema = new Schema({
    content: { type: String },
    order_id: { type: ObjectId },
    user_id: { type: ObjectId },
    reply_id: { type: ObjectId },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Boolean, default: Date.now },
    ups: [Schema.Types.ObjectId],
    deleted: { type: Boolean, default: false }
});

ReplySchema.plugin(BaseModel);
ReplySchema.index({order_id:1});
ReplySchema.index({user_id:1,create_at:-1});


mongoose.model('Reply',ReplySchema);
