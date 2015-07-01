/**
 * 搭配、晒单、其它
 * Created by allen on 14-7-15.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ImgSchema = new Schema({
    url: String,
    size: {
        h: Number,
        w: Number
    }
})

var ShareSchema = new Schema({

    type: Number,               //0=分享宝贝，1=搭配，2=晒货，3=其它
    isItem: {type: Boolean, default: false},    //type=0的分享，无法修改，值=true。
    album_id: ObjectId,         //属于哪个专辑
    author_id: ObjectId,        //添加者
    name: String,               //名称
    description: String,        //装扮，晒货心得

    imgs: [ImgSchema],
    comment_count: {type: Number, default: 0},  //评论条数

    pass: {type: Number, default: 0},           //小编审核通过
    recommend: {type: Number, default: 0},      //小编推荐
    recommend_home: {type: Number, default: 0}, //首页推荐

    click_total: {type: Number, default: 0},     //点击的计数
    love_total: {type: Number, default: 0},     //赞的计数
    date: { type: Date, default: Date.now }     //添加时间
})

ShareSchema.index({type: 1});
ShareSchema.index({pass: 1});

mongoose.model('Share', ShareSchema);