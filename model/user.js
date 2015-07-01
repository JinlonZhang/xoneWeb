/**
 * Created by Administrator on 13-10-18.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({

    uuid: String,                   //oAuth授权协议登录的用户。
    name: String,                   //昵称
    login_name: String,             //注册邮箱
    pwd: String,
    introduce: String,              //自我介绍
    avatarUrl: String,              //头像的URL地址，绝对地址。上传到又拍云的http地址

    score: {type:Number, default: 0},   //积分

    follow_count: {type: Number, default: 0},   //关注数量
    fans_count: {type: Number, default: 0},     //粉丝数量
    love_count: {type: Number, default: 0},     //赞数量
    topic_count: {type: Number, default: 0},    //发帖数量
    reply_count: {type: Number, default: 0},    //回复数量

    type: {type: Number, default: 0},           //type=0,正常注册的用户；type=1,运维添加的假用户
    date: {type: Date, default: Date.now },     //注册时间
    last_active: { type: Date, default: Date.now }
})

UserSchema.index({uuid: 1}, {unique: true});
UserSchema.index({name: 1}, {unique: true});
UserSchema.index({login_name: 1});

mongoose.model('User', UserSchema);