/**
 * 广告模块
 * Created by allen on 2014-6-26.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AdvertSchema = new Schema({
    author_id: ObjectId,
    category_id: ObjectId,         //在哪个类别下显示，在首页显示的广告，这个字段=null

    /**
     * 'home' 首页大图
     * 'home-small' 首页小图
     * 'category-small' 分类小图
     */
    location: String,               //广告显示的位置

    name: String,                   //名称
    href: String,                   //链接

    img: {
        url: String,                //图片链接，存储在又拍云上；
        size: {}
    },

    date: Date                      //上线的时间，默认是第二天上线
})

mongoose.model('Advert', AdvertSchema);