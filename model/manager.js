/**
 * 用户模块-管理员，小编
 * Created by allen on 14-5-12.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ManagerSchema = new Schema({
    name: {type: String, index: true},
    login_name: {type:String, index: true},
    pwd: String,

    type: Number     //type=0：管理员；type=1,小编
})

mongoose.model('Manager', ManagerSchema);