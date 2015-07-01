/**
 * Created by allen on 14-5-11.
 */

var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var xss = require('xss');
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var qqOauth = require('../lib/qqOauth');
var wbOauth = require('../lib/wbOauth');
var Util = require('../lib/util');
var config = require('../config');
var CONST = require('../CONST');
var proxy = require('../model_proxy');
var User = proxy.User;
var Category = proxy.Category;
var Item = proxy.Item;
var Advert = proxy.Advert;
var ShareItem = proxy.ShareItem;

var mod = {};
mod.api = {};
module.exports = mod;

var filed = {name: 1, price: 1, href: 1, img: 1, love_total: 1};

_.extend(mod, {

    /**
     * 首页
     * @param req
     * @param res
     */
    index: function(req, res){

        async.auto({
            todayItemList: function(fn){
                var skip = 0, limit = 20, today = moment(23, 'HH');
                var query = {
                    date: {$lt: new Date(today)}
                }
                var filed = {name: 1, href: 1, price: 1, img: 1, love_total: 1, click_total: 1};

                Item.getByQuery(query, filed, {sort: {"_id": -1}, skip: skip, limit: limit}, fn)
            }
        }, function(err, d){
            var o = {
                categoryItem: CONST.CATEGORY_ITEM,
                recommendItem: CONST.RECOMMEND_HOME,
                hotItem: CONST.HOT_ITEM,
                advertHome: CONST.ADVERT.HOME,
                advertHomeSmall: CONST.ADVERT.HOME_SMALL,
                albumList: CONST.ALBUM_LIST,
                albumListHot: CONST.ALBUM_LIST_HOT,
                todayItemList: d.todayItemList,
                categoryId: "home"
            }
            o.todayItemList.sort(function(a, b){ return a.click_total > b.click_total ? -1 : 1 });
            var seo = Util.getSEO("home");
            res.render('index', _.extend(o, seo));
        });
    },

    oauth: function(req, res){
        var type = req.params.type;

        if(type == 'qq'){
            res.redirect( qqOauth.qq_login() );
        }else if(type == 'wb'){
            res.redirect( wbOauth.wb_login() );
        }

    },

    /**
     * 社会化网络账号登录回调页面，目前支持QQ和微博
     * @param req
     * @param res
     */
    oauthCallback: function(req, res){
        var type = req.params.type;

        if(type == 'qq'){
            var qq = qqOauth;
            async.auto({
                getToken: function(fn){
                    qq.qq_callback(req, fn)
                },
                getOpenId: ['getToken', function(fn, d){
                    if(d.error){
                        fn(null, d);
                    }else{
                        var token = d.getToken.access_token;
                        qq.getOpenId(token, fn);
                    }
                }],
                getUserInfo: ['getOpenId', function(fn, d){
                    qq.getUserInfo({
                        access_token: d.getToken.access_token,
                        openid: d.getOpenId.openid
                    }, fn);
                }],
                chk: ['getOpenId', function(fn, d){
                    User.getByUUid('qq_' + d.getOpenId.openid, fn);
                }],
                add: ['chk', 'getUserInfo', function(fn, d){
                    if(d.chk == null){
                        User.add({
                            uuid: 'qq_' + d.getOpenId.openid,
                            name: xss(d.getUserInfo.nickname).trim() + '_qq'+ Math.floor(Math.random() * 1000),
                            login_name: '',
                            pwd: '',
                            introduce: '',
                            avatarUrl: 'http://s10.dingdangjie.cn/avatar.jpg'
                        }, fn)
                    }else{
                        fn(null, [d.chk]);
                    }
                }]
            }, function(err, d){
                if(d.getOpenId.error){

                }else{
                    req.session.user = d.add[0];
                    var session = req.session;
                    var sid = session.id;
                    req.session.cookie.originalMaxAge = 1000 * 60 * 60 * 24 * 30 * 12 * 10//10年

                    var store = new MongoStore({
                        host: config.host,
                        db: config.dbName
                    });
                    store.set(sid, session, function(){
                        console.log('Remember Me OK');
                    });
                }
                res.render('oauthCallback');
            })

        }else if(type == 'wb'){
            console.log('wb start');
            async.auto({
                getToken: function(fn){
                    wbOauth.wb_callback(req, fn)
                },
                getUserInfo:['getToken', function(fn, d){
                    wbOauth.getUserInfo({
                        access_token: d.getToken.access_token,
                        uid: d.getToken.uid
                    }, fn);
                }],
                chk: ['getToken', function(fn, d){
                    User.getByUUid('wb_' + d.getToken.uid, fn);
                }],
                add: ['chk', 'getUserInfo', function(fn, d){
                    if(d.chk == null){
                        User.add({
                            uuid: 'wb_' + d.getToken.uid,
                            name: xss(d.getUserInfo.screen_name).trim() + '_wb',
                            login_name: '',
                            pwd: '',
                            introduce: xss(d.getUserInfo.description).trim(),
                            avatarUrl: 'http://s10.dingdangjie.cn/avatar.jpg'
                        }, fn)
                    }else{
                        fn(null, [d.chk]);
                    }
                }]
            }, function(fn, d){

                req.session.user = d.add[0];
                var session = req.session;
                var sid = session.id;
                req.session.cookie.originalMaxAge = 1000 * 60 * 60 * 24 * 30 * 12 * 10//10年

                var store = new MongoStore({
                    host: config.host,
                    db: config.dbName
                });
                store.set(sid, session, function(){
                    console.log('Remember Me OK');
                });


                res.render('oauthCallback');
            });
        }
    },

    /**
     * 今日热门宝贝
     * @param req
     * @param res
     */
    hot: function(req, res){
        var skip = req.query.skip, limit = 40, today = moment(23, 'HH');
        var query = {
            date: {$lt: new Date(today)}
        }
        var filed = {name: 1, href: 1, price: 1, img: 1, love_total: 1, click_total: 1};

        Item.getByQuery(query, filed, {sort: {_id: -1, click_total: -1}, skip: skip, limit: limit}, function(err, list){
            list.sort(function(a, b){ return a.click_total > b.click_total ? -1 : 1 });

            var o = {categoryId: 'hot', list: list, total: 2000, limit: 40};
            _.extend(o, Util.getSEO('', {name: '今日最热'}));
            res.render('hot', o);
        })

    },

    /**
     * 分类页面
     * @param req
     * @param res
     */
    category: function(req, res, next){
        var categoryId = req.params.categoryId, urlName = req.params.urlName, sortBy = req.query.sort_by, price = req.query.price;
        if(CONST.CATEGORY_URL_MAP[urlName] == undefined){
            return next();
        }
        var today = moment(23, 'HH'), query = {date: {$lte: new Date(today)}, category: categoryId};

        if(categoryId == undefined){
            query.category = CONST.CATEGORY_URL_MAP[urlName];
            categoryId = query.category;
        }

        var listQuery = {};
        if(price && price != ""){
            var tmp = {};
            if(price.indexOf('-') != -1){
                tmp['$gte'] = price.split('-')[0];
                tmp['$lte'] = price.split('-')[1];
            }else{
                tmp['$gte'] = price;
            }
            listQuery.price = tmp;
        }

        var listOpt = {};
        if(sortBy == 'hot' || sortBy == undefined){
            listOpt = {
                sort: {_id: -1}
            }
        }else if(sortBy == 'new'){
            listOpt = {
                sort: {_id: -1}
            }
        }
        var o = {
            categoryItem: CONST.CATEGORY_ITEM,
            categoryMap: CONST.CATEGORY_MAP,
            newItem: [],
            recommendItem: [],
            item: []
        }

        var listLimit = 20, skip = req.query.skip || 0;
        _.extend(listOpt, {limit: listLimit, skip: skip});

        async.auto({
            /*
            //当前类目下的广告
            advert: function(fn){
                Advert.getByQuery({location: 'categorySmall', category_id: CONST.CATEGORY_MAP[categoryId].oneId}, {}, {sort: {_id: -1}, limit: 2}, fn)
            },
            */
            /*
            //新品推荐
            newItem: function(fn){
                Item.getByQuery(_.extend({'img.size.h':{$gte: 280} }, query), filed, {sort: {_id: -1}, limit: 20}, fn)
            },
            //小编推荐
            recommendItem: function(fn){
                Item.getByQuery(_.extend({recommend: 1}, query), filed, {sort: {_id: -1}, limit: 20}, fn)
            },
            */
            //宝贝列表
            list: function(fn){
                Item.getByQuery(_.extend(listQuery, query), {}, listOpt, fn);
            },
            //总数
            total: function(fn){
                Item.getTotalByQuery(_.extend(query, listQuery), fn);
            }
        }, function(err, data){
            data.total > 1600 ? data.total = 1600 : null;
            data.limit = 60;
            if(sortBy == 'hot' || sortBy == undefined){
                data.list.sort(function(a, b){ return a.click_total > b.click_total ? -1 : 1 });
            }
            var seo = Util.getSEO(categoryId);
            res.render('category', _.extend(o, data, {categoryId: categoryId}, seo));
        })

    },

    /**
     * 宝贝详情页面
     * @param req
     * @param res
     */
    item: function(req, res){
        var id = req.params.id;
        var limit = 20;

        async.auto({
            detail: function(fn){
                Item.getById(id, fn)
            },
            list:['detail', function(fn, d){
                var query = {};
                if(!d.detail){
                    console.log('detail false');
                    console.log(id);
                    console.log(d.detail); return fn(null);
                }
                if(d.detail.category){
                    query = {category: {$in : d.detail.category}}
                }
                var skip = Math.floor( Math.random() * 100 );
                Item.getByQuery(query, filed, {sort: {click_total: -1}, skip: skip, limit: limit}, fn);
            }]
        }, function(err, d){

            var tmp = {
                albumList: CONST.ALBUM_LIST,
                albumListHot: CONST.ALBUM_LIST_HOT,
                categoryId: d.detail.category[0]
            }
            var seo = Util.getSEO("", d.detail);
            _.extend(tmp, d, seo);
            res.render( 'item', tmp );
        })
    },

    /**
     * 小编后台添加的宝贝，URL跳转。
     * @param req
     * @param res
     */
    go: function(req, res, next){
        var id = req.params.id;

        Item.getById(id, function(err, item){
            if(item){
                item.click_total++;
                item.save();
                res.redirect(item.href);
            }else{
                next();
            }
        })
    },

    /**
     * 分享的单品链接，URL跳转。
     * @param req
     * @param res
     * @param next
     */
    sgo: function(req, res, next){
        var id = req.params.id;

        ShareItem.getById(id, function(err, si){
            if(si){
                res.redirect(si.TBK_href || si.href);
            }else{
                next();
            }
        })
    }

});