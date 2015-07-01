/**
 * Created by allen on 14-7-13.
 */

var _ = require('underscore');
var moment = require('moment');

var models = require('../model');
var FindPwd = models.FindPwd;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {
    add: function(o, fn){
        var fp = new FindPwd();

        fp.login_name = o.login_name;
        fp.key = o.key;
        fp.date = o.date;

        fp.save(fn);
    },

    modifyByQuery: function(query, o, fn){
        FindPwd.update(query, {$set: o}, {}, fn);
    },

    deleteByQuery: function(q, fn){
        FindPwd.remove(q, fn);
    },

    deleteById: function(id, fn){
        FindPwd.findByIdAndRemove(id, fn);
    },

    getByQuery: function(query, field, opt, fn){
        FindPwd.find(query, field, opt, fn);
    },

    getByKey: function(key, fn){
        FindPwd.findOne({key: key}, fn);
    },

    getByLoginName: function(n, fn){
        FindPwd.findOne({login_name: n}, fn);
    },



    getById: function(id, fn){
        FindPwd.findOne({_id: id}, fn);
    }
})