

var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var User = models.User;

var mod = {}
module.exports = mod;

_.extend(mod, {
    /**
     * 新增一个用户
     * @param {JSON} o 用户信息
     * @param {Function} fn 回调函数
     */
    add: function (o, fn) {
    
        var user = new User();
        user.uuid = o.uuid;
        user.name = o.name;
        user.login_name = o.login_name;
        user.pwd = o.pwd;
        user.introduce = o.introduce;
        user.avatarUrl = o.avatarUrl;
    
        user.save(fn);
    },
    
    modifyById: function(id, o, fn){
        User.findByIdAndUpdate(id, {$set: o}, fn);
    },
    
    /**
     * 根据查询条件，获取一组用户
     * Callback:
     * - err, 数据库异常
     * - user, 用户
     * @param {Object} query 关键字
     * @param {Object} field 字段显示
     * @param {Object} opt 选项(sort， limit)
     * @param {Function} fn 回调函数
     */
    getByQuery: function (query, field, opt, fn) {
        User.find(query, field, opt, fn);
    },
    
    /**
     * 根据昵称查找用户列表
     * Callback:
     * - err, 数据库异常
     * - user, 用户
     * @param {Array} name 昵称
     * @param {Function} callback 回调函数
     */
    getByName: function (name, callback) {
        User.findOne({name: name }, callback);
    },
    
    /**
     * 根据登录名查找用户
     * Callback:
     * - err, 数据库异常
     * - user, 用户
     * @param {String} login_name 登录名
     * @param {Function} callback 回调函数
     */
    getByLoginName: function (login_name, callback) {
        User.findOne({login_name: login_name}, callback);
    },
    
    /**
     * 根据用户ID，查找用户
     * Callback:
     * - err, 数据库异常
     * - user, 用户
     * @param {String} id 用户ID
     * @param {Function} callback 回调函数
     */
    getById: function (id, field, callback) {
        User.findOne({_id: id}, field, callback);
    },

    getByUUid: function(uuid, fn){
        User.findOne({uuid: uuid}, fn);
    }
})


