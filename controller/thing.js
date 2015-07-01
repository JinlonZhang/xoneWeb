/**
 * Created by allen on 14-8-17.
 */

var _ = require('underscore');
var async = require('async');
var Util = require('./../lib/util');
var proxy = require('../model_proxy');
var User = proxy.User;
var Item = proxy.Item;
var Share = proxy.Share;
var Album = proxy.Album;
var Love = proxy.Love;
var Follow = proxy.Follow;
var Thing = proxy.Thing;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {
    index: function(req, res){
        var id = res.locals.user._id, list = [];

        async.auto({
            follow: function(fn){
                Follow.getByQuery({fans_id: id}, {host_id: 1}, {sort: {last_date: -1}, limit: 40}, fn);
            },
            thing:['follow', function(fn, d){
                var host_list = [];
                _.each(d.follow, function(fl){
                    host_list.push(fl.host_id);
                });
                Thing.getByQuery({host_id: {$in: host_list}}, {}, {sort: {_id: -1}, limit: 40}, fn);
            }],
            bb: ['thing', function(fn, d){
                async.eachSeries(d.thing, function(th, fn1){
                    var o = {
                        type: th.type,
                        bb: {},
                        user: {},
                        date: null
                    };

                    o.date = th.date;
                    async.auto({
                        bb: function(fn2){
                            if(th.type == 1){
                                //宝贝
                                Item.getById(th.bb_id, function(err, item){
                                    if(item == null){ fn2(); return; }
                                    o.bb = {
                                        _id: item._id,
                                        name: item.name,
                                        link: 'item/',
                                        love_api: '/api/love',
                                        price: item.price,
                                        love_total: item.love_total,
                                        imgs: [
                                            {
                                                url: item.img.url,
                                                size: item.img.size
                                            }
                                        ]
                                    }
                                    fn2();
                                })
                            }
                            if(th.type == 2){
                                //分享、搭配
                                Share.getById(th.bb_id, function(err, sh){
                                    if(sh == null){ fn2(); return;}
                                    var link = '';
                                    if(sh.type == 1){ link = 'share/'; }
                                    if(sh.type == 2){ link = 'look/'; }

                                    o.bb = {
                                        _id: sh._id,
                                        description: sh.description,
                                        link: link,
                                        love_total: sh.love_total,
                                        love_api: '/api/share/love',
                                        imgs: sh.imgs
                                    }
                                    fn2();
                                })
                            }
                        },
                        user: function(fn2){
                            User.getById(th.host_id, function(err, user){
                                o.user = {
                                    _id: user._id,
                                    name: user.name,
                                    avatarUrl: user.avatarUrl
                                }
                                fn2();
                            });
                        }
                    }, function(err, d){
                        list.push(o);
                        fn1();
                    })
                }, function(err){
                    fn(err);
                })
            }]
        }, function(err, d){
            var resJson = {};
            _.extend(resJson, {list: list}, Util.getSEO("", {name: res.locals.user.name + '关注的动态'}) );
            res.render('user/thing', resJson);
        })
    }
})