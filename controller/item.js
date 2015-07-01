/**
 * Created by allen on 14-7-2.
 */

var _ = require('underscore');
var moment = require('moment');
var async = require('async');
var Util = require('../lib/util');
var proxy = require('../model_proxy');
var User = proxy.User;
var Item = proxy.Item;
var Share = proxy.Share;
var Album = proxy.Album;
var Love = proxy.Love;
var Follow = proxy.Follow;
var Thing = proxy.Thing;
var AddToAlbum = proxy.AddToAlbum;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {

});

_.extend(mod.api, {

    /**
     * 喜欢、取消喜欢宝贝
     * @param req
     * @param res
     */
    love: function(req, res){
        var user_id = req.session.user._id, item_id = req.body.id;

        async.auto({
            chk: function(fn){
                Love.getByUserIdAndBBId(0, user_id, item_id, fn);
            },
            save:['chk', function(fn, data){
                if(data.chk){
                    async.auto({
                        thing: function(fn1){
                            //删除动态
                            Thing.deleteByQuery({type: 1, bb_id: item_id}, fn1);
                        },
                        love: function(fn1){
                            //删除喜欢
                            Love.deleteByQuery({type: 0, bb_id: item_id}, fn1);
                        }
                    }, function(err, d){
                        fn(err);
                    })
                }else{
                    async.auto({
                        thing: function(fn1){
                            //添加动态
                            Thing.add({
                                type: 1,
                                host_id: user_id,
                                bb_id: item_id
                            }, fn1);
                        },
                        love: function(fn1){
                            //添加喜欢
                            Love.add({
                                type: 0,
                                user_id: user_id,
                                bb_id: item_id
                            }, fn1);
                        },
                        follow: function(fn1){
                            Follow.getByQuery({host_id: user_id}, {}, {}, function(err, list){
                                async.each(list, function(fl, fn2){
                                    fl.last_date = new Date();
                                    fl.save(fn2);
                                }, function(err2){
                                    fn1(err2);
                                })
                            })
                        }
                    }, function(err, d){
                        fn(err);
                    })

                }

            }],
            item: ['chk', function(fn, data){
                Item.getById(item_id, function(err, item){
                    if(data.chk){
                        item.love_total--;
                    }else{
                        item.love_total++;
                    }
                    item.save(fn);
                })
            }]
        }, function(err, data){
            res.json( Util.resJson(err, {total: data.item[0].love_total, isLove: data.chk}) );
        })
    },

    /**
     * 把宝贝添加到某个专辑。
     * @param req
     * @param res
     */
    album: function(req, res){
        var author_id = req.session.user._id,
            album_id = req.body.album_id,
            bb_id = req.body.item_id;
        console.log(album_id);
        async.auto({
            chk: function(fn){
                if(album_id == 0){
                    fn(null, {needAdd: true});
                }else{
                    AddToAlbum.getAlbumIdAndBbId(album_id, bb_id, fn);
                }
            },
            addAlbum: function(fn){
                if(album_id == 0){
                    async.auto({
                        //检查是否存在"默认专辑"
                        isExist: function(fn2){
                            Album.getByQuery({name: '默认专辑', author_id: author_id}, fn2);
                        },
                        add:['isExist', function(fn2, d){
                            if(d.isExist.length == 0){
                                Album.add({
                                    author_id: author_id,
                                    name: '默认专辑',
                                    description: "",
                                    shares: []
                                }, function(err, album){
                                    album_id = album._id;
                                    fn2();
                                })
                            }else{
                                album_id = d.isExist[0]._id;
                                fn2();
                            }
                        }]
                    }, fn);
                }else{
                    fn();
                }
            },
            add:['chk', 'addAlbum', function(fn, d){
                if(d.chk == null){
                    AddToAlbum.add({
                        type: 1,
                        album_id: album_id,
                        bb_id: bb_id
                    }, fn);
                }else{
                    fn();
                }
            }]
        }, function(err, d){
            var o = {}
            if(d.chk != null){
                o.code = -1;
                o.msg = '宝贝已添加。';
            }
            res.json( Util.resJson(err, o) );
        });

    },

    /**
     * 把某个宝贝从专辑中删掉
     * @param req
     * @param res
     */
    delToAlbum: function(req, res){
        var album_id = req.body.album_id, bb_id = req.body._id;

        async.auto({
            chk: function(fn){
                AddToAlbum.getAlbumIdAndBbId(album_id, bb_id, fn);
            },
            del:['chk', function(fn, d){
                if(d.chk != null){
                    AddToAlbum.deleteByQuery({
                        type: 1,
                        album_id: album_id,
                        bb_id: bb_id
                    }, fn);
                }else{
                    fn();
                }
            }]
        }, function(err, d){
            res.json( Util.resJson(err) );
        });
    },

    /**
     * 首页获得宝贝
     * @param req
     * @param res
     */
    getItem: function(req, res){
        var skip = req.query.skip, limit = 20, today = moment(23, 'HH');
        var query = {
            date: {$lt: new Date(today)}
        }
        var filed = {name: 1, href: 1, price: 1, img: 1, love_total: 1, click_total: 1};

        Item.getByQuery(query, filed, {sort: {_id: -1}, skip: skip, limit: limit}, function(err, list){
            res.json( Util.resJson(err, {list: list}) );
        })
    },

    /**
     * 获得某一个分类下面的宝贝
     * @param req
     * @param res
     */
    getItemForCategory: function(req, res){
        var _id = req.query._id, sortBy = req.query.sort_by, price = req.query.price;
        var skip = req.query.skip, limit = 20;
        var filed = {name: 1, href: 1, price: 1, img: 1, love_total: 1, click_total: 1};

        var today = moment(23, 'HH'), query = {date: {$lte: new Date(today)}, category: _id};
        if(price && price != ""){
            var tmp = {};
            if(price.indexOf('-') != -1){
                tmp['$gte'] = price.split('-')[0];
                tmp['$lte'] = price.split('-')[1];
            }else{
                tmp['$gte'] = price;
            }
            query.price = tmp;
        }

        var opt = {};
        if(sortBy == 'hot' || sortBy == undefined){
            opt = {
                sort: {_id: -1}
            }
        }else if(sortBy == 'new'){
            opt = {
                sort: {_id: -1}
            }
        }

        _.extend(opt, {limit: limit, skip: skip});

        Item.getByQuery(query, filed, opt, function(err, list){
            if(sortBy == 'hot' || sortBy == undefined){
                list.sort(function(a, b){ return a.click_total > b.click_total ? -1 : 1 });
            }
            res.json( Util.resJson(err, {list: list}) );
        })
    }
})