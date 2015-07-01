/**
 * Created by allenxu on 14-8-1.
 */


var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var Comment = models.Comment;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一条评论
     * @param {JSON}
     * @param {Function}
     */
    add: function (o, fn) {

        var s = new Comment();

        s.share_id = o.share_id;
        s.author_id = o.author_id;
        s.content = o.content;

        s.save(fn);
    },

    modifyById: function(id, o, fn){
        Comment.findByIdAndUpdate(id, {$set: o}, fn);
    },

    deleteByQuery: function(query, fn){
        Comment.remove(query, fn);
    },

    /**
     * 通用查询条件
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        Comment.find(query, field, opt, fn);
    },

    /**
     * 根据ID查找
     * @param {String} id
     * @param {Function} fn
     */
    getById: function (id, fn) {
        Comment.findOne({_id: id}, fn);
    }

})