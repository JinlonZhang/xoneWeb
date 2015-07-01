/**
 * Created by allen on 14-7-30.
 */


var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var Love = models.Love;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一个喜欢、赞
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new Love();

        s.type = o.type;
        s.user_id = o.user_id;
        s.bb_id = o.bb_id;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        Love.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        Love.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        Love.find(query, field, opt, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        Love.findOne({_id: id}, fn);
    },

    /**
     * 根据用户ID和bb_id查找
     * @param {String} id
     * @param {Function} fn
     */
    getByUserIdAndBBId: function (type, user_id, bb_id, fn) {
        Love.findOne({type: type, user_id: user_id, bb_id: bb_id}, fn);
    }
})