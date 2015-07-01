/**
 * Created by allenxu on 14-8-19.
 */

var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var AddToAlbum = models.AddToAlbum;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new AddToAlbum();

        s.type = o.type;
        s.album_id = o.album_id;
        s.bb_id = o.bb_id;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        AddToAlbum.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        AddToAlbum.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        AddToAlbum.find(query, field, opt, fn);
    },

    /**
     * 查询是否已添加到某个专辑了
     * @param album_id
     * @param bb_id
     * @param fn
     */
    getAlbumIdAndBbId: function(album_id, bb_id, fn){
        AddToAlbum.findOne({album_id: album_id, bb_id: bb_id}, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        AddToAlbum.findOne({_id: id}, fn);
    },

    /**
     * 查询总数
     * @param query
     * @param fn
     */
    getTotalByQuery: function(query, fn){
        AddToAlbum.count(query, fn);
    }
})