/**
 * Created by allen on 14-8-9.
 */

var _ = require('underscore');
var async = require('async');
var xss = require('xss');

var Util = require('./../lib/util');
var proxy = require('../model_proxy');
var Follow = proxy.Follow;
var User = proxy.User;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {

    /**
     * 关注的列表页
     * @param req
     * @param res
     */
    list: function(req, res){
        var fans_id = req.params.id, list = [], skip = req.query.skip || 0, limit = 18;

        async.auto({
            total: function(fn){
                Follow.getTotalByQuery({fans_id: fans_id}, fn);
            },
            list: function(fn){
                Follow.getByQuery({fans_id: fans_id}, {}, {sort: {_id: -1}, limit: limit, skip: skip}, fn);
            },
            detail: function(fn){
                User.getById(fans_id, fn);
            },
            user:['list', function(fn, d){
                async.eachSeries(d.list, function(fl, fn1){
                    User.getById(fl.host_id, function(err, u){
                        var o = {
                            _id: u._id,
                            name: u.name,
                            avatarUrl: u.avatarUrl,
                            fans_count: u.fans_count,
                            love_count: u.love_count,
                            introduce: u.introduce
                        }
                        list.push(o);
                        fn1();
                    })
                }, function(err){
                    fn();
                })
            }]
        }, function(err, d){

            var tmp = {list: list, total: d.total, limit: limit, followType: 'follow'};
            _.extend(tmp, Util.getSEO('', {name: d.detail.name + '的关注'}));
            res.render('user/follow', tmp);
        })
    },

    /**
     * 粉丝列表
     * @param req
     * @param res
     */
    fansList: function(req, res){
        var host_id = req.params.id, list = [], skip = req.query.skip, limit = 18;

        async.auto({
            list: function(fn){
                Follow.getByQuery({host_id: host_id}, {}, {sort: {_id: -1}, limit: limit, skip: skip}, fn);
            },
            total: function(fn){
                Follow.getTotalByQuery({host_id: host_id}, fn);
            },
            detail: function(fn){
                User.getById(host_id, fn);
            },
            user:['list', function(fn, d){
                async.eachSeries(d.list, function(fl, fn1){
                    User.getById(fl.fans_id, function(err, u){
                        var o = {
                            _id: u._id,
                            name: u.name,
                            avatarUrl: u.avatarUrl,
                            fans_count: u.fans_count,
                            love_count: u.love_count,
                            introduce: u.introduce
                        }
                        list.push(o);
                        fn1();
                    })
                }, function(err){
                    fn();
                })
            }]
        }, function(err, d){

            var tmp = {list: list, total: d.total, limit: limit, followType: 'fans'};
            _.extend(tmp, Util.getSEO('', {name: d.detail.name + '的粉丝'}));

            res.render('user/follow', tmp);
        })
    }
})