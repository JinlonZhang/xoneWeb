/**
 * Created by allen.xu on 13-10-18.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ItemSchema = new Schema({

    //type: Number,               //类型。比如小编添加的宝贝，网友分享的宝贝。
    author_id: ObjectId,        //添加者
    category: [ObjectId],       //分类。比如衣服，鞋子，包包
    name: String,
    description: String,           //描述
    href: String,
    price: Number,
    img: {
        url: String,//图片链接；
        size: {}
    },

    recommend: {type: Number, default: 0},      //小编推荐
    recommend_home: {type: Number, default: 0}, //首页推荐

    click_total: {type: Number, default: 0},     //点击的计数
    love_total: {type: Number, default: 0},     //喜欢的计数
    date: Date
})

ItemSchema.index({click_total: 1});

mongoose.model('Item', ItemSchema);