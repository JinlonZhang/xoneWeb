/**
 * Created by allen on 14-8-16.
 */


var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var Thing = models.Thing;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一个动态
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new Thing();

        s.type = o.type;
        s.host_id = o.host_id;
        s.bb_id = o.bb_id;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        Thing.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        Thing.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        Thing.find(query, field, opt, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        Thing.findOne({_id: id}, fn);
    }
})