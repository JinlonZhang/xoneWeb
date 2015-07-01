/**
 * Created by allen on 14-7-15.
 */



var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var Share = models.Share;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一个分享
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new Share();

        s.type = o.type;
        s.album_id = o.album_id;
        s.author_id = o.author_id;
        s.name = o.name;
        s.description = o.description;
        s.imgs = o.imgs;
        s.items = o.items;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        Share.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        Share.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        Share.find(query, field, opt, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        Share.findOne({_id: id}, fn);
    },

    /**
     * 查询总数
     * @param query
     * @param fn
     */
    getTotalByQuery: function(query, fn){
        Share.count(query, fn);
    }
})


