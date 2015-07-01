/**
 * 喜欢、赞
 * Created by allen on 14-7-30.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var LoveSchema = new Schema({
    type: Number,           //0=item, 1=share
    user_id: ObjectId,      //用户ID
    bb_id: ObjectId,        //宝贝、分享ID
    date: { type: Date, default: Date.now }     //添加时间
})

mongoose.model('Love', LoveSchema);
