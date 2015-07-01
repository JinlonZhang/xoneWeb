/**
 * 专辑
 * Created by allen on 14-7-27.
 */

var _ = require('underscore');
var async = require('async');
var xss = require('xss');

var Util = require('./../lib/util');
var proxy = require('../model_proxy');
var Album = proxy.Album;
var User = proxy.User;
var Share = proxy.Share;
var ShareItem = proxy.ShareItem;
var Follow = proxy.Follow;
var Item = proxy.Item;
var AddToAlbum = proxy.AddToAlbum;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {

    /**
     * 专辑的频道页
     * @param req
     * @param res
     */
    list: function(req, res){
        var l = [], resJson = {}, sessionUser = req.session.user, limit = 12, skip = req.query.skip || 0;

        async.auto({
            total: function(fn){
                Album.getTotalByQuery({pass: 1}, fn);
            },
            list: function(fn){
                Album.getByQuery({pass: 1}, {}, {sort: {_id: -1}, skip: skip, limit: limit}, fn);
            },
            resList:['list', function(fn, d){
                var list = d.list;
                async.eachSeries(list, function(album, fn0){
                    var o = {
                        album: album,
                        imgList: [],
                        user: {}
                    }

                    async.auto({
                        //上传的晒货和搭配
                        shareList:function(fn1){
                            Share.getByQuery({album_id: album._id}, {imgs: 1, date: 1}, {sort: {_id: -1}, limit: 9}, function(er, shareList){
                                _.each(shareList, function(share){
                                    var img = share.imgs[0];
                                    o.imgList.push(img.url)
                                })
                                fn1()
                            });
                        },
                        //小编后台添加的宝贝
                        itemList:function(fn1){
                            AddToAlbum.getByQuery({album_id: album._id}, {}, {sort: {_id: -1}, limit: 9}, function(err, adList){
                                var ids = [];
                                if(adList.length == 0){ return fn1(); }
                                _.each(adList, function(ad){
                                    ids.push(ad.bb_id);
                                });

                                Item.getByQuery({_id: {$in: ids}}, {img: 1}, {sort: {_id: -1}, limit: 9}, function(err, itemList){
                                    _.each(itemList, function(item){
                                        o.imgList.push(item.img.url);
                                    })
                                    fn1();
                                })
                            })

                        },
                        usr: function(fn1){
                            User.getById(album.author_id, function(err, user){
                                o.user._id = user._id;
                                o.user.name = user.name;
                                o.user.avatarUrl = user.avatarUrl;
                                fn1();
                            })
                        },
                        follow: function(fn1){
                            if(sessionUser){
                                Follow.getByHostIdAndFansId(album.author_id, sessionUser._id, fn1);
                            }else{
                                fn1(null, null);
                            }
                        }
                    }, function(err, d){
                        if(sessionUser){
                            if(sessionUser._id == album.author_id){
                                o.user.isFollow = null;
                            }else{
                                o.user.isFollow = d.follow != null;
                            }
                        }else{
                            o.user.isFollow = false;
                        }

                        l.push( o );
                        fn0(err);
                    })

                }, function(err){
                    fn(err);
                });
            }]
        }, function(err, d){
            _.extend(resJson, {list: l, total: d.total, limit: limit}, Util.getSEO('', {name: '专辑'}) );
            res.render('album/list', resJson);
        });
    },

    /**
     * 专辑的详情页面
     * @param req
     * @param res
     */
    detail: function(req, res){
        var id = req.params.id, sessionUserId = req.session.user && req.session.user._id, list = [],
            skip = req.query.skip, limit = 50;

        async.auto({
            detail: function(fn){
                Album.getById(id, fn)
            },
            isExist: function(fn, d){
                fn(null, d.detail);
            },
            shareList: function(fn){
                Share.getByQuery({album_id: id}, {}, {sort: {_id: -1}, skip: skip, limit: limit}, function(err, shList){
                    async.eachSeries(shList, function(sh, fn2){
                        var o = {
                            type: 'share',
                            _id: sh._id,
                            name: '',
                            description: sh.description,
                            price: 0,
                            imgs: sh.imgs,
                            love_total: sh.love_total,
                            link: 'share/',
                            love_api: '/api/share/love',
                            del_api: '/api/share',
                            date: sh.date
                        }
                        list.push(o);
                        ShareItem.getByShareId(sh._id, function(err2, si){
                            o.name = si ? si.name : '';
                            o.price = si ? si.price : 0;
                            fn2();
                        })
                    }, function(err2){
                        fn(err, shList);
                    })

                });
            },
            itemList: function(fn){
                async.auto({
                    adList: function(fn1){
                        AddToAlbum.getByQuery({album_id: id}, {}, {sort: {_id: -1}, skip: skip, limit: limit}, function(err, adList){
                            var ids = [];
                            if(adList.length == 0){ return fn1(null, []); }
                            _.each(adList, function(ad){
                                ids.push(ad.bb_id);
                            });
                            fn1(null, ids);
                        })
                    },
                    itemList:['adList', function(fn1, d){
                        if(d.adList.length == 0){ return fn1(null, []); }
                        var item_id = d.adList;
                        Item.getByQuery({_id: {$in: item_id}}, {}, {sort: {_id: -1}}, function(err, itList){
                            _.each(itList, function(it){
                                var o = {
                                    type: 'item',
                                    _id: it._id,
                                    name: it.name,
                                    description: it.description || '',
                                    price: it.price,
                                    imgs: [it.img],
                                    love_total: it.love_total,
                                    link: 'item/',
                                    love_api: '/api/love',
                                    del_api: '/api/itemDelToAlbum',
                                    date: it.date
                                }
                                list.push(o);
                                fn1(err, itList);
                            })
                        });
                    }]
                }, function(err, d){
                    fn(err, d.itemList);
                })
            },
            more:['detail', function(fn, d){
                Album.getByQuery({_id: {$ne: id}, author_id: d.detail.author_id}, {}, {sort: {_id: -1}, limit: 18}, fn);
            }],
            user: ['detail', function(fn, data){
                var author_id = data.detail.author_id;
                User.getById(author_id, fn);
            }],
            shareTotal: function(fn){
                Share.getTotalByQuery({album_id: id}, fn);
            },
            itemTotal: function(fn){
                AddToAlbum.getTotalByQuery({album_id: id}, fn);
            }
        }, function(err, d){
            var o = {limit: limit, total: d.shareTotal + d.itemTotal},
                isSelf = sessionUserId == d.user._id,
                name = d.detail.name,
                isItem = d.itemList.length > d.shareList.length;

            _.extend(
                o,
                {user: d.user, detail: d.detail, list: list, isSelf: isSelf, isItem: isItem, moreList: d.more},
                Util.getSEO("album", {name: name})
            );

            res.render('album/detail', o);
        })
    }
})

_.extend(mod.api, {

    /**
     * 新增、编辑专辑
     * @param req
     * @param res
     */
    album: function(req, res){
        var author_id = req.session.user._id, _id = req.body._id, o = {};
        if(_id){
            o = {
                name: xss(req.body.name).trim(),
                description: xss(req.body.description).trim()
            }

            Album.modifyById(_id, o, function(err){
                res.json( Util.resJson(err) )
            })
        }else{
            o = {
                author_id: author_id,
                name: xss(req.body.name).trim(),
                description: xss(req.body.description).trim(),
                shares: []
            }

            Album.add(o, function(err){
                res.json( Util.resJson(err) )
            })
        }
    },

    /**
     * 获得专辑列表
     * @param req
     * @param res
     */
    getAlbumList: function(req, res){
        var author_id = req.session.user._id;

        Album.getByQuery({author_id: author_id}, {name: 1}, {}, function(err, list){
            res.json( Util.resJson(err, {list: list} ));
        })
    },

    /**
     * 专辑详情页面，ajax载入
     * @param req
     * @param res
     */
    getAlbumForDetail: function(req, res){

    },

    /**
     * 删除专辑
     * @param req
     * @param res
     */
    deleteAlbum: function(req, res){
        var _id = req.body._id, user_id = req.session.user._id;

        async.auto({
            detail: function(fn){
                Album.getById(_id, fn);
            },
            chk: ['detail', function(fn, data){
                fn(null, user_id == data.detail.author_id);
            }],
            delShare:['chk', function(fn, d){
                if(d.chk){
                    Share.deleteByQuery({album_id: _id}, fn);
                }else{
                    fn();
                }
            }],
            delAlbum:['chk', 'delShare', function(fn, d){
                if(d.chk){
                    Album.deleteByQuery({_id: _id}, fn);
                }else{
                    fn();
                }
            }]
        }, function(err, data){
            res.json( Util.resJson(err) );
        })
    }
})