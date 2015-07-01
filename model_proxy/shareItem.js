/**
 * Created by allen on 14-8-3.
 */


var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var ShareItem = models.ShareItem;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一个分享
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new ShareItem();

        s.share_id = o.share_id;
        s.author_id = o.author_id;
        s.name = o.name;
        s.href = o.href;
        s.price = o.price;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        ShareItem.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        ShareItem.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        ShareItem.find(query, field, opt, fn);
    },

    getByShareId: function(share_id, fn){
        ShareItem.findOne({share_id: share_id}, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        ShareItem.findOne({_id: id}, fn);
    }
})