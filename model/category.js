/**
 * 分类模块
 * Created by allen on 14-5-11.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({

    p_id: ObjectId,                 //上一级的类别

    name: String,                   //名称
    name_other: String,             //别名
    level: Number,                  //类别的等级
    pop: {type: Boolean, default: false},   //是否是当季流行
    sort: {type: Number, default: 0},   //排序字段
    SEO_title: String,              //搜索引擎标题
    SEO_keywords: String,           //搜索引擎关键词
    urlName: String,                //链接的前缀。比如衣服:clothing
    img: {
        url: String,                //图片链接，存储在又拍云上；
        size: {}
    }
})

mongoose.model('Category', CategorySchema);
