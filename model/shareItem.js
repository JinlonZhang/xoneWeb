/**
 * 搭配、晒货的单品链接
 * Created by allen on 14-8-3.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ShareItemSchema = new Schema({

    author_id: ObjectId,
    share_id: ObjectId,
    name: String,
    href: String,
    TBK_href: String,
    imgUrl: String,
    price: Number

});

ShareItemSchema.index({share_id: 1});

mongoose.model('ShareItem', ShareItemSchema);