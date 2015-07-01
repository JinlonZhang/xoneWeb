/**
 * 每个用户做了什么事情，记录为动态。
 * Created by allen on 14-8-15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ThingSchema = new Schema({

    type: Number,           //类型。1=喜欢了某个宝贝，2=对某个分享点了赞，3=上传了分享照片
    host_id: ObjectId,      //关注者ID
    bb_id: ObjectId,      //宝贝ID，分享ID，专辑ID
    date: { type: Date, default: Date.now }     //添加时间

})

mongoose.model('Thing', ThingSchema);