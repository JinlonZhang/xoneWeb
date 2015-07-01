/**
 * 关注
 * Created by allenxu on 14-8-7.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FollowSchema = new Schema({

    host_id: ObjectId,      //被关注者ID
    fans_id: ObjectId,       //粉丝ID
    last_date: { type: Date, default: Date.now }, //最后活动时间。
    date: { type: Date, default: Date.now }     //添加时间
})

mongoose.model('Follow', FollowSchema);