/**
 * 关注
 * Created by allenxu on 14-8-7.
 */

var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var Follow = models.Follow;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增关注
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new Follow();

        s.host_id = o.host_id;
        s.fans_id = o.fans_id;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        Follow.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        Follow.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        Follow.find(query, field, opt, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        Follow.findOne({_id: id}, fn);
    },

    /**
     * 根据用户ID和粉丝ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getByHostIdAndFansId: function (host_id, fans_id, fn) {
        Follow.findOne({host_id: host_id, fans_id: fans_id}, fn);
    },

    /**
     * 获得总数
     * @param query
     * @param fn
     */
    getTotalByQuery: function(query, fn){
        Follow.count(query, fn);
    }
})