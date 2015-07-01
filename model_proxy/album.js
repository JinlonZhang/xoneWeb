/**
 * 专辑、杂志的查询
 * Created by allen on 14-7-20.
 */



var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var Album = models.Album;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一个专辑
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new Album();

        s.author_id = o.author_id;
        s.name = o.name;
        s.description = o.description;
        s.shares = o.shares;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        Album.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        Album.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        Album.find(query, field, opt, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        Album.findOne({_id: id}, fn);
    },

    /**
     * 根据查询条件，获得总数
     * @param query
     * @param fn
     */
    getTotalByQuery: function(query, fn){
        Album.count(query, fn);
    }
})