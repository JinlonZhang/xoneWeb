/**
 * Created by allenxu on 14-8-1.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({

    share_id: ObjectId,         //属于哪个分享
    author_id: ObjectId,        //发表者
    content: String,            //内容

    date: { type: Date, default: Date.now }     //添加时间
})

mongoose.model('Comment', CommentSchema);