/**
 * 把宝贝添加到专辑
 * Created by allen on 14-8-18.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AddToAlbumSchema = new Schema({

    type: Number,               //类型。1=宝贝，2=分享
    album_id: ObjectId,      //专辑ID
    bb_id: ObjectId,       //宝贝ID
    date: { type: Date, default: Date.now }     //添加时间

})

mongoose.model('AddToAlbum', AddToAlbumSchema);