/**
 * 搭配、晒单分享
 * Created by allen on 14-7-27.
 */

var _ = require('underscore');
var async = require('async');
var xss = require('xss');
var Util = require('./../lib/util');
var proxy = require('../model_proxy');
var UrlToInfo = require('../lib/urlToInfo');
var Album = proxy.Album;
var User = proxy.User;
var Share = proxy.Share;
var Love = proxy.Love;
var Comment = proxy.Comment;
var ShareItem = proxy.ShareItem;
var Follow = proxy.Follow;
var Thing = proxy.Thing;

var mod = {};
mod.api = {};
module.exports = mod;

var _o = {};

_.extend(mod, {

    /**
     * 分享的频道页
     * @param req
     * @param res
     */
    list: function(req, res){
        _o.getShare(1, req, function(err, d){
            var o = {};
            _.extend(o, {list: d.list, total: d.total, limit: 60, shareType: 1}, Util.getSEO('', {name: '搭配'}) );
            res.render('share/list', o);
        })
    },

    /**
     * 晒货的频道页
     * @param req
     * @param res
     */
    listLook: function(req, res){
        _o.getShare(2, req, function(err, d){
            var o = {};
            _.extend(o, {list: d.list, total: d.total, limit: 60, shareType: 2}, Util.getSEO('', {name: '晒货'}) );
            res.render('share/list', o);
        })
    },

    /**
     * 分享的详情页面
     * @param req
     * @param res
     */
    detail: function(req, res){
        var id = req.params.id, sessionUserId = req.session.user && req.session.user._id;

        async.auto({
            detail: function(fn){
                Share.getById(id, fn);
            },
            itemList: function(fn){
                ShareItem.getByQuery({share_id: id}, {}, {}, fn);
            },
            commentList: function(fn){
                Comment.getByQuery({share_id: id}, {}, {sort: {_id: -1}, limit: 10}, fn);
            },
            comment:['commentList', function(fn, data){
                var com = data.commentList, comList = [];
                async.eachSeries(com, function(c, fn){

                    User.getById(c.author_id, function(err, user){
                        var o = {
                            author:{
                                _id: user._id,
                                name:user.name,
                                avatarUrl: user.avatarUrl
                            },
                            _id: c._id,
                            content: c.content,
                            date: c.date,
                            isSelf: user._id == sessionUserId
                        }
                        comList.push(o);
                        fn(null);
                    })
                }, function(err){
                    fn(err, comList);
                })
            }],
            user: ['detail', function(fn, data){
                var author_id = data.detail.author_id;
                User.getById(author_id, fn);
            }],
            follow: ['detail', function(fn, d){
                if(sessionUserId){
                    Follow.getByHostIdAndFansId(d.detail.author_id, sessionUserId, fn);
                }else{
                    fn(null, null);
                }
            }],
            //其它分享推荐
            list:['detail', function(fn, d){
                var type = d.detail.type, author_id = d.detail.author_id;
                Share.getByQuery({type: type, _id : {$ne: id}, author_id: author_id}, {}, {sort: {_id: -1}, limit: 12}, function(err, list){
                    var l = [];
                    async.eachSeries(list, function(sh, fn2){
                        var o = {};
                        o = {
                            _id: sh._id,
                            img: sh.imgs[0],
                            love_total: sh.love_total,
                            item: {}
                        }
                        ShareItem.getByShareId(sh._id, function(er, si){
                            if(si){
                                o.item.name = si.name;
                                o.item.price = si.price;
                            }else{
                                o.item.name = '';
                                o.item.price = 0;
                            }
                            l.push(o);
                            fn2(er);
                        })
                    }, function(err2){
                        fn(err2, l);
                    })
                });
            }]
        }, function(err, d){
            var o = {}, isSelf = sessionUserId == d.user._id, isFollow = d.follow != null;
            var name = d.user.name, desc = null;
            if(d.itemList.length > 0){
                name = d.itemList[0].name + '_' + d.user.name;
            }else if(d.detail.description != ''){
                name = d.detail.description + '_' + d.user.name;
            }
            if(d.detail.description != ''){
                desc = d.detail.description;
            }
            _.extend(o, d, {isSelf: isSelf, isFollow: isFollow}, Util.getSEO("", {name: name, description: desc}));

            res.render('share/detail', o);
        })
    }


})



_.extend(mod.api, {

    /**
     * 搭配，晒货频道页面，滚动ajax载入内容
     * @param req
     * @param res
     */
    getShareList: function(req, res){
        var type = req.query.type || 1;
        _o.getShare(type, req, function(err, d){
            res.json({list: d.list});
        })
    },

    /**
     * 保存分享的内容。分享晒货和搭配，需要用户自己上传图片
     * @param req
     * @param res
     */
    share: function(req, res){
        var author_id = req.session.user._id;
        var o = {
            type: req.body.type,
            album_id: req.body.album_id,
            author_id: author_id,
            description: xss(req.body.description).trim(),
            imgs: [],
            items: []
        }
        if(req.body.img == undefined){
            return res.json( Util.resJson(-1, {msg: '请选择要分享的照片'} ))
        }
        var imgs = typeof req.body.img == 'string' ? [req.body.img] : req.body.img || [];
        var items = typeof req.body.item == 'string' ? [req.body.item] : req.body.item || [];

        _.each(imgs, function(m){
            o.imgs.push( JSON.parse(m) );
        });

        _.each(items, function(m){
            o.items.push( JSON.parse(m) );
        });

        async.auto({
            albumAdd: function(fn){
                if(o.album_id == 0){
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
                                    o.album_id = album._id;
                                    fn2();
                                })
                            }else{
                                o.album_id = d.isExist[0]._id;
                                fn2();
                            }
                        }]
                    }, fn);
                }else{
                    fn();
                }
            },
            shareAdd:['albumAdd', function(fn){
                Share.add(o, fn);
            }],
            shareItemAdd: ['shareAdd', function(fn, data){
                var share_id = data.shareAdd[0]._id, author_id = data.shareAdd[0].author_id;

                async.each(o.items, function(item, fn2){
                    _.extend(item, {share_id: share_id, author_id: author_id});
                    ShareItem.add(item, fn2);
                }, function(err){
                    fn(err);
                })
            }],
            imgTotal: ['shareAdd', function(fn, d){
                Album.getById(o.album_id, function(err, album){
                    album.img_total += o.imgs.length;
                    album.save(fn);
                })
            }]
        }, function(err, data){
            res.json( Util.resJson(err) );
        })
    },

    /**
     * 保存分享的内容。分享宝贝，只需要一个淘宝或天猫的链接。
     * @param req
     * @param res
     * @returns {*|ServerResponse}
     */
    shareByUser: function(req ,res){
        var author_id = req.session.user._id;
        var o = {
            type: req.body.type,
            album_id: req.body.album_id,
            author_id: author_id,
            description: xss(req.body.description).trim(),
            item_id: req.body.itemId,
            price: req.body.price,
            imgs: []
        }
        var oi = {
            href: req.body.href,
            name: req.body.name
        }
        if(req.body.img == undefined){
            return res.json( Util.resJson(-1, {msg: '请选择要分享的照片'} ))
        }
        var imgs = typeof req.body.img == 'string' ? [req.body.img] : req.body.img || [];

        _.each(imgs, function(m){

            var tmp = {
                url: m.replace(/100x100/gi, '600x600'),
                size: {w: 600, h:600}
            }
            o.imgs.push( tmp );
        });

        async.auto({
            albumAdd: function(fn){
                if(o.album_id == 0){
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
                                    o.album_id = album._id;
                                    fn2();
                                })
                            }else{
                                o.album_id = d.isExist[0]._id;
                                fn2();
                            }
                        }]
                    }, fn);
                }else{
                    fn();
                }
            },
            imgAdd: function(fn){

                async.map(o.imgs, function(img, fn1){
                    UrlToInfo.downloadImg(o.item_id, img, fn1);
                }, function(err, d){
                    console.log('get TB img ok.');
                    console.log(d);
                    o.imgs = d;
                    fn(err, d);
                })
            },
            shareAdd:['albumAdd', 'imgAdd', function(fn){
                Share.add(o, fn);
            }],
            shareItemAdd: ['shareAdd', function(fn, data){
                var share_id = data.shareAdd[0]._id;
                var item = {};

                _.extend(item, oi, { share_id: share_id, author_id: author_id, price: o.price } );

                ShareItem.add(item, fn);
            }],
            imgTotal: ['shareAdd', function(fn, d){
                Album.getById(o.album_id, function(err, album){
                    album.img_total += o.imgs.length;
                    album.save(fn);
                })
            }]
        }, function(err, data){
            res.json( Util.resJson(err) );
        })
    },

    /**
     * 删除分享
     * @param req
     * @param res
     */
    deleteShare: function(req, res){
        var _id = req.body._id, user_id = req.session.user._id, info = {};

        async.auto({
            detail: function(fn){
                Share.getById(_id, fn);
            },
            chk: ['detail', function(fn, d){
                info.album_id = d.detail.album_id;
                info.img_count = d.detail.imgs.length;
                info.love_count = d.detail.love_total;
                fn(null, user_id == d.detail.author_id);
            }],
            delShare:['chk', function(fn, d){
                if(d.chk){
                    Share.deleteByQuery({_id: _id}, fn);
                }else{
                    fn();
                }
            }],
            delShareItem:['chk', function(fn, d){
                if(d.chk){
                    ShareItem.deleteByQuery({share_id: _id}, fn);
                }else{
                    fn();
                }
            }],
            delImgTotal:['chk', function(fn, d){
                if(d.chk){
                    Album.getById(info.album_id, function(err, album){
                        album.img_total -= info.img_count;
                        album.love_total -= info.love_count;
                        if(album.img_total < 0){ album.img_total = 0; }
                        if(album.love_total < 0){ album.love_total = 0; }
                        album.save(fn);
                    })
                }else{
                    fn();
                }
            }]
        }, function(err, d){
            console.log('delete Share');
            console.log(err);
            res.json( Util.resJson(err) );
        })

    },

    /**
     * 赞
     * @param req
     * @param res
     */
    love: function(req, res){
        var user_id = req.session.user._id, share_id = req.body.id;

        async.auto({
            shareDetail: function(fn){
                Share.getById(share_id, fn);
            },
            chk:['shareDetail', function(fn, d){
                if(d.shareDetail.author_id == user_id){
                    fn(null, {isSelf: true});
                }else{
                    Love.getByUserIdAndBBId(1, user_id, share_id, fn);
                }
            }],
            save:['chk', function(fn, d){
                if(d.chk && d.chk.isSelf){ return fn(); }
                if(d.chk){
                    Love.deleteByQuery({type: 1, bb_id: share_id}, fn);
                }else{
                    Love.add({
                        type: 1,
                        user_id: user_id,
                        bb_id: share_id
                    }, fn);
                }
            }],
            userDetail:['chk', function(fn, d){
                if(d.chk && d.chk.isSelf){ return fn(); }
                User.getById(d.shareDetail.author_id, function(err, user){
                    if(d.chk){
                        user.love_count--;
                    }else{
                        user.love_count++;
                    }
                    user.save(fn);
                });
            }],
            share: ['chk', function(fn, d){
                if(d.chk && d.chk.isSelf){ return fn(); }
                Share.getById(share_id, function(err, share){
                    if(d.chk){
                        share.love_total--;
                    }else{
                        share.love_total++;
                    }
                    share.save(fn);
                })
            }],
            album: ['chk', function(fn, d){
                if(d.chk && d.chk.isSelf){ return fn(); }
                Album.getById(d.shareDetail.album_id, function(err, album){
                    if(d.chk){
                        album.love_total--;
                    }else{
                        album.love_total++;
                    }
                    album.save(fn);
                })
            }],
            thing: ['chk', function(fn, d){
                if(d.chk && d.chk.isSelf){ return fn(); }
                _o.setThing(d.chk, user_id, share_id, fn);
            }]
        }, function(err, d){
            if(d.chk && d.chk.isSelf){
                return res.json( Util.resJson(-1, {msg: '自己的分享不能点赞喔'}) );
            }
            res.json( Util.resJson(err, {total: d.share[0].love_total, isLove: d.chk}) );
        })
    },

    /**
     * 提交评论
     * @param req
     * @param res
     */
    comment:function(req, res){
        var id = req.body.share_id;

        var o = {
            share_id: id,
            author_id: req.body.author_id,
            content: xss(req.body.content).trim()
        }

        if(o.content == ""){
            return res.json( Util.resJson(-1, {msg: '随便说点什么吧：）'}) )
        }

        async.auto({
            com: function(fn){
                Comment.add(o, fn);
            },
            com_count: function(fn){
                Share.getById(id, function(err, share){
                    share.comment_count++;
                    share.save(fn);
                })
            }
        }, function(err, data){
            res.json( Util.resJson(err) );
        });

    },

    /**
     * 删除评论
     * @param req
     * @param res
     */
    deleteComment: function(req, res){
        var _id = req.body._id, user_id = req.session.user._id;

        async.auto({
            detail: function(fn){
                Comment.getById(_id, fn);
            },
            chk: ['detail', function(fn, d){
                fn(null, user_id == d.detail.author_id);
            }],
            com:['chk', function(fn, d){
                if(d.chk){
                    Comment.deleteByQuery({_id: _id}, fn);
                }else{
                    fn();
                }
            }],
            com_count:['chk', function(fn, d){
                var share_id = d.detail.share_id;
                if(d.chk){
                    Share.getById(share_id, function(err, share){
                        share.comment_count--;
                        share.save(fn);
                    })
                }else{
                    fn();
                }
            }]
        }, function(err, d){
            res.json( Util.resJson(err) );
        });

    },

    /**
     * 添加链接
     * @param req
     * @param res
     */
    link: function(req, res){
        var _id = req.body._id, author_id = req.session.user._id, url = req.body.url.trim();

        var uf = new UrlToInfo(url);

        var r = uf.chkUrl();
        if(r.code == -1){
            return res.json( Util.resJson(-1, {msg: r.msg}) );
        }

        uf.getInfo(function(err, o){
            res.json( Util.resJson(err, o) );
        })

        async.auto({
            info: function(fn){
                uf.getInfo(fn);
            },
            add: ['info', function(fn, data){
                _.extend(data.info, {share_id: _id, author_id: author_id});
                ShareItem.add(data.info, fn);
            }]
        }, function(err, data){
            res.json( Util.resJson(err) );
        });

    },

    /**
     * 根据链接获取宝贝的信息。
     * @param req
     * @param res
     */
    linkInfo: function(req, res){
        var url = req.body.url.trim();

        var uf = new UrlToInfo(url);

        var r = uf.chkUrl();
        if(r.code == -1){
            return res.json( Util.resJson(-1, {msg: r.msg}) );
        }

        uf.getInfo(function(err, o){
            res.json( Util.resJson(err, o) );
        })
    },

    /**
     * 删除商品链接
     * @param req
     * @param res
     */
    deleteLink: function(req, res){
        var _id = req.body._id, user_id = req.session.user._id;

        async.auto({
            detail: function(fn){
                ShareItem.getById(_id, fn);
            },
            chk:['detail', function(fn, d){
                fn(null, d.detail.author_id == user_id);
            }],
            si: ['chk', function(fn, d){
                if(d.chk){
                    ShareItem.deleteByQuery({_id: _id}, fn);
                }else{
                    fn();
                }
            }]
        }, function(err, d){
            res.json( Util.resJson(err) );
        })

    }
})

var http = require("http");
var URL = require("url");
var iconv = require('iconv-lite');
var cheerio = require("cheerio");

_.extend(_o, {

    /**
     * 获得晒货、搭配列表
     * @param type
     * @param req
     * @param fn
     */
    getShare: function(type, req, callback){
        var type = type, list = [], sessionUser = req.session.user, skip = req.query.skip || 0, limit = 20;

        async.auto({
            total: function(fn){
                Share.getTotalByQuery({type: type, pass: 1}, fn);
            },
            list: function(fn){
                Share.getByQuery({type: type, pass: 1}, {description: 1, author_id: 1, imgs: 1, love_total: 1}, {sort: {_id: -1},skip: skip, limit: limit}, fn);
            },
            user:['list', function(fn, data){
                var l = data.list;
                async.eachSeries(l, function(share, fn2){
                    var o = {
                        share: share
                    }
                    User.getById({_id: share.author_id}, {name: 1, avatarUrl: 1}, function(err, user){
                        o.user = {
                            _id: user._id,
                            name: user.name,
                            avatarUrl: user.avatarUrl
                        };
                        list.push(o);
                        if(sessionUser == null){
                            //未登录状态
                            o.user.isFollow = false;
                            fn2();
                        }else{
                            if(sessionUser._id == share.author_id){
                                //分享的作者=当前登录的用户
                                o.user.isFollow = null;
                                fn2();
                            }else{
                                Follow.getByHostIdAndFansId(share.author_id, sessionUser._id, function(err, fl){
                                    o.user.isFollow = fl != null;
                                    fn2();
                                })
                            }
                        }
                    });

                }, function(err){
                    fn();
                })
            }]
        }, function(err, d){
            callback(err, {list: list, total: d.total});
        });
    },

    setThing: function(chk, user_id, bb_id, fn){
        if(chk && chk.isSelf){ return fn(); }
        if(chk){
            async.auto({
                thing: function(fn1){
                    //删除动态
                    Thing.deleteByQuery({type: 2, bb_id: bb_id}, fn1);
                }
            }, function(err, d){
                fn(err);
            })
        }else{
            async.auto({
                thing: function(fn1){
                    //添加动态
                    Thing.add({
                        type: 2,
                        host_id: user_id,
                        bb_id: bb_id
                    }, fn1);
                },
                follow: function(fn1){
                    //更新关注列表里的最后活跃时间
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
    },

    /**
     * 获得宝贝信息
     * @param url
     * @param fn
     */
    getInfo: function(url, fn){
        var w = this;
        var opt = {
            host: URL.parse(url).host,
            port: 80,
            path: URL.parse(url).pathname + '?id=' + URL.parse(url, true).query.id
        }
        var r = {code: 0, name: '', href: ''};

        var u = 'http://' + opt.host + opt.path;
        r.href = u;
        http.get(url, function(res){

            if(res.statusCode == 302){
                return _o.getInfo(res.headers.location, fn);
            }
            var chunks = [],
                size = 0;
            res.on("data" , function(chunk){
                chunks.push(chunk);
                size += chunk.length;
            });
            res.on("end" , function(){
                var data = Buffer.concat(chunks , size);
                var str = iconv.decode(data, 'GBK');
                var html = str.toString();
                var $ = cheerio.load(html)
                r.name = w.getName(opt.host, $);
                w.getImg($);
                fn(null, r);
            })
        })
    },

    /**
     * 获得宝贝名称
     * @param host
     * @param $
     * @returns {string}
     */
    getName: function(host, $){
        var r = '';

        if(host == 'detail.tmall.com'){
            r = $('.tb-detail-hd').find('h1').text().trim()
        }else if(host == 'item.taobao.com'){
            r = $('.tb-main-title').text().trim()
        }
        return r;
    },

    getImg: function($){
        var img = $('#J_UlThumb').find('img').eq(0);

        var src = img.attr('src') ? img.attr('src') : img.attr('data-src');
        console.log(src);
    }
})