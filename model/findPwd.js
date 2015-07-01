/**
 * Created by allen on 14-7-13.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FindPwdSchema = new Schema({
    login_name: String,          //用户ID
    key: String,            //找回密码的验证字符串
    date: Date                  //过期时间。超过这个时间后，找回密码链接失效。
})

mongoose.model('FindPwd', FindPwdSchema);