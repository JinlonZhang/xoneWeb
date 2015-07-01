/**
 * 专辑、杂志。晒单的集合体
 * Created by allen on 14-7-20.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AlbumSchema = new Schema({

    author_id: ObjectId,        //添加者
    name: String,               //名称
    description: String,        //描述

    comment: [],                //评论

    pass: {type: Number, default: 0},           //小编审核通过
    recommend: {type: Number, default: 0},      //小编推荐
    recommend_home: {type: Number, default: 0}, //首页推荐

    img_total: {type: Number, default: 0},      //照片的计数
    love_total: {type: Number, default: 0},     //喜欢的计数

    date: { type: Date, default: Date.now }     //添加时间
})

mongoose.model('Album', AlbumSchema);