/**
 * 项目启动的时候，载入一些数据到内存中。
 * CONST下面的变量全部存放在内存中。一次性从数据库中取出。
 * Created by allen on 14-6-7.
 */
var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var CONST = require('./CONST');
var proxy = require('./model_proxy');
var Category = proxy.Category;
var Item = proxy.Item;
var Advert = proxy.Advert;
var Album = proxy.Album;
var User = proxy.User;
var Share = proxy.Share;
var Follow = proxy.Follow;
var AddToAlbum = proxy.AddToAlbum;

var mod = {};
module.exports = mod;

var filed = {name: 1, href: 1, price: 1,img: 1};

_.extend(mod, {
    init: function(){
        var w = this;

        w.today = moment(23, 'HH');

        w.getCategory();
        w.getCategoryItem();

        w.getRecommendHomeItem();
        w.getHotItem();

        w.getAdvert();

        w.getAlbum();
    },

    getAlbum: function(){
        var l = [];

        async.auto({
            hl: function(fn){
                Album.getByQuery({pass: 1}, {}, {sort: {_id: -1}, skip: 3, limit: 10}, fn);
            },
            list: function(fn){
                Album.getByQuery({pass: 1}, {}, {sort: {_id: -1}, skip: 0, limit: 3}, fn);
            },
            resList:['list', function(fn, d){
                var list = d.list, hl = d.list;
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
                                    o.imgList.push(img.url);
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
                        }
                    }, function(err, d){
                        l.push( o );
                        fn0(err);
                    })

                }, function(err){
                    fn(err);
                });
            }]
        }, function(err, d){

            CONST.ALBUM_LIST = l;
            CONST.ALBUM_LIST_HOT = d.hl;
            console.log('get album list OK!');
        })
    },

    /**
     * 分类列表，树形结构。由init.js在项目启动的时候，一次性取出放到内存中。
     */
    getCategory: function(){
        var w = this;

        async.auto({
            one: function(fn){
                Category.getCategoryByQuery({ level: 1}, {}, {sort: {'sort': -1}}, fn)
            },
            two: function(fn){
                Category.getCategoryByQuery({ level: 2}, {}, {sort: {pop: -1, 'sort': -1}}, fn);
            },
            three: function(fn){
                Category.getCategoryByQuery({ level: 3}, {}, {sort: {pop: -1, 'sort': -1}}, fn);
            }
        }, function(err, o){

            CONST.CATEGORY_LIST = [];

            _.each(o.one, function(p){
                var tmp = {
                    self: p,
                    list: [],
                    threeList: []
                }
                _.each(o.two, function(c){
                    if( c.p_id.toString() == p._id.toString() ){
                        var tmp2 = {
                            self: c,
                            list: []
                        }

                        _.each(o.three, function(t){
                            if( t.p_id.toString() == c._id.toString() ){
                                tmp2.list.push(t);
                                tmp.threeList.push(t);
                                CONST.CATEGORY_MAP[t._id] = {
                                    name: t.name,
                                    oneId: p._id,
                                    oneUrlName: p.urlName
                                }
                            }
                        })
                        tmp.list.push(tmp2);
                        CONST.CATEGORY_MAP[c._id] = {
                            name: c.name,
                            oneId: p._id,
                            oneUrlName: p.urlName
                        };
                    }
                });
                tmp.threeList.sort(function(x, y){ return x.sort > y.sort ? -1 : 1; })
                CONST.CATEGORY_MAP[p._id] = {
                    name: p.name,
                    oneId: p._id,
                    oneUrlName: p.urlName
                };
                CONST.CATEGORY_URL_MAP[p.urlName] = p._id;
                CONST.CATEGORY_LIST.push(tmp);
            });
            console.log('get category tree OK!');
        })
    },

    /**
     * 每个小分类最新的宝贝信息。用于首页显示。每天凌晨1点的时候会更新
     * {分类ID：宝贝}
     */
    getCategoryItem: function(){
        var w = this;

        Category.getCategoryByQuery({level: 3}, {}, {}, function(err, list){
            async.each(list, function(entry, fn){
                Item.getByQuery({date: {$lt: new Date(w.today)}, category: entry._id}, {category: 0}, {sort: {_id: -1}, limit: 10}, function(er, item){
                    var n = Math.floor( Math.random() * item.length );
                    CONST.CATEGORY_ITEM[entry._id] = (item && item[n]) || {};
                    fn(er);
                })
            }, function(e){
                console.log("get category item OK!");
            });
        })
    },

    /**
     * 首页的推荐宝贝。每天凌晨1点的时候会更新
     */
    getRecommendHomeItem: function(){
        var w = this;

        Item.getByQuery({date: {$lt: new Date(w.today)}, recommend_home: 1}, filed, {sort: {_id: -1}, limit: 5}, function(err, list){
            CONST.RECOMMEND_HOME = list.sort(function(){ return Math.random() > 0.5 ? 1 : -1 });
            console.log('get recommendHome item OK!')
        })
    },

    /**
     * 每个大类下面点击数最高的宝贝(5天内)。每天凌晨1点会更新
     * {分类ID：宝贝列表}
     */
    getHotItem: function(){
        var w = this;

        Category.getCategoryByQuery({ level: 1}, {}, {}, function(err, list){
            async.each(list, function(entry, fn){
                //时间范围，10天内。不包括今天
                var start = moment(0, 'HH').add('days', -30);
                var end = moment(23, 'HH').add('days', -1);
                Item.getByQuery({date: {$gt: new Date(start), $lt: new Date(end)}, category: entry._id}, filed, {sort: {click_total: -1, _id: -1}, limit: 4}, function(er, itemList){
                    CONST.HOT_ITEM[entry._id] = itemList;
                    fn(er)
                })
            }, function(e){
                console.log("get hot item OK!");
            });
        })
    },

    /**
     * 广告
     */
    getAdvert: function(){
        var w = this;

        async.auto({
            home: function(fn){
                Advert.getByQuery({location: 'home'}, {}, {sort: {_id: -1}, limit: 4}, fn);
            },
            homeSmall: function(fn){
                Advert.getByQuery({location: 'homeSmall'}, {}, {sort: {_id: -1}, limit: 2}, fn);
            }
        }, function(err, data){
            CONST.ADVERT.HOME = data.home;
            CONST.ADVERT.HOME_SMALL = data.homeSmall;
            console.log('get advert of home OK!');
        });

    }
})
