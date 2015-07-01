/**
 * controller of user
 * Created by allen on 14-7-5.
 */

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var config = require('../config');
var UPYun = require('./../lib/upyun').UPYun;
var Util = require('./../lib/util');
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

var _o = {};
var upyun = new UPYun(config.UPYun.space, config.UPYun.name, config.UPYun.pwd);
var upyunAvatarDir = '/avatar/';
var upyunShareDir = '/share/';

var USER = null;

_.extend(mod, {
    index: function(req, res){
        var id = USER.id, o = {};

        Share.getByQuery({author_id: id}, {}, {sort: {_id: -1}, limit: 20}, function(err, list){

            _.extend(o, {shareList: list, albumList: []}, Util.getSEO("", {name: USER.name}))

            res.render('user/index', o);
        });


    },

    /**
     * 用户的基本信息
     * @param req
     * @param res
     * @param next
     */
    baseInfo: function(req, res, next){
        var id = req.params.id, isSelf = false, us = {};

        if(req.session.user){
            isSelf = id == req.session.user._id;
        }

        res.locals.isSelf = isSelf;
        res.locals.byname = isSelf ? '我' : 'TA';

        async.auto({
            user: function(fn){
                User.getById(id, {}, fn);
            },
            follow: function(fn){
                if(req.session.user){
                    Follow.getByHostIdAndFansId(id, req.session.user._id, fn);
                }else{
                    fn();
                }
            }
        }, function(err, d){
            USER = d.user;
            res.locals.user = d.user;
            res.locals.isFollow = d.follow != null;

            next();
        })
    },

    /**
     * 上传图片后，显示
     * @param req
     * @param res
     */
    avatarRaw: function(req, res){
        var id = req.session.user._id, size = req.params.size;

        var filePath = config.uploadDir + '/' + id + '.jpg';

        fs.exists(filePath, function(exists){
            if(exists){
                fs.readFile(filePath, 'binary', function(err, file){
                    if(err){
                        res.writeHead(500, {'Content-Type': 'text/plain'});
                        res.end()
                    }else{
                        res.writeHead(200, {"Content-Type": "image/jpg"});
                        res.write(file, "binary");
                        res.end();
                    }
                })
            }
        });
    },

    profile: function(req, res){
        var id = req.session.user._id;

        User.getById(id, {}, function(err, user){
            res.render('user/profile', {user: user});
        })
    },

    pwd: function(req, res){
        res.render('user/pwd');
    },

    avatar: function(req, res){
        res.render('user/avatar');
    },

    /**
     * 喜欢页面
     * @param req
     * @param res
     */
    love: function(req, res){
        var id = USER._id, itemList = [], resJson = {};

        async.auto({
            love: function(fn){
                Love.getByQuery({user_id: id, type: 0}, {}, {sort: {_id: -1}, limit: 20}, fn)
            },
            item: ['love', function(fn, data){
                async.eachSeries(data.love, function(love, fn2){
                    Item.getById(love.bb_id, function(err, item){
                        itemList.push(item);
                        fn2(null);
                    })
                }, function(err){
                    fn(err);
                })
            }]
        }, function(err, data){
            _.extend(resJson, {itemList: itemList}, Util.getSEO("", {name: USER.name + '喜欢的宝贝'}) );
            res.render('user/love', resJson);
        })
    },

    /**
     * 专辑页面
     * @param req
     * @param res
     */
    album: function(req, res){
        var id = USER._id, l = [], resJson = {}, limit = 12, skip = req.query.skip || 0;

        async.auto({
            total: function(fn){
                Album.getTotalByQuery({author_id: id}, fn);
            },
            list: function(fn){
                Album.getByQuery({author_id: id}, {}, {sort: {_id: -1}, skip: skip, limit: limit}, fn);
            },
            resList:['list', function(fn, d){
                var list = d.list;
                async.eachSeries(list, function(album, fn0){
                    var o = {
                        album: album,
                        imgList: []
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

            _.extend(resJson, {list: l, total: d.total, limit: limit}, Util.getSEO("", {name: USER.name + '的时尚专辑'}) );

            res.render('user/album', resJson);
        })
    }
});

_.extend(mod.api, {
    /**
     * 修改个人资料
     * @param req
     * @param res
     * @returns {*|ServerResponse}
     */
    modifyProfile: function(req, res){
        var id = req.session.user._id, json = {};

        var o = {
            id: id,
            name : req.body.name,
            introduce: req.body.introduce
        }

        if(o.name == ''){
            return res.json( Util.resJson(-1, {msg: '昵称不能为空！'}))
        }

        async.auto({
            chkName: function(fn){
                //昵称是否存在
                User.getByName(o.name, function(err, user){
                    if(user && user._id != o.id){
                        json = {code: -1, msg: '昵称已存在。'};
                    }else{
                        json = {code: 0};
                    }
                    fn(null, json);
                });
            },
            edit: ['chkName', function(fn, data){
                if(data.chkName.f){
                    fn(null)
                }else{
                    User.modifyById(o.id, o, function(err, user){
                        req.session.user = user;
                        fn(err);
                    });
                }
            }]
        }, function(err, data){
            res.json( Util.resJson(err, json));
        });
    },

    /**
     * 修改密码
     * @param req
     * @param res
     * @returns {*|ServerResponse}
     */
    modifyPwd: function(req, res){
        var id = req.session.user._id;
        var o = {
            old_pwd: req.body.old_pwd,
            pwd1: req.body.pwd1,
            pwd2: req.body.pwd2
        }

        if(o.old_pwd == ""){ return res.json( Util.resJson(-1, {msg: '旧密码不能为空。'}) ) }
        if(o.pwd1 == ""){ return res.json( Util.resJson(-1, {msg: '新密码不能为空。'}) ) }
        if(o.pwd2 == ""){ return res.json( Util.resJson(-1, {msg: '新密码不能为空。'}) ) }

        if(o.pwd1.length < 6){ return res.json( Util.resJson(-1, {msg: '新密码长度必须大于等于6位。'}) ) }

        if(o.pwd1 != o.pwd2){
            return res.json( Util.resJson(-1, {msg: '两次密码不一致。'}) );
        }

        o.old_pwd = Util.md5(o.old_pwd + config.pwdSecret);

        User.getById(id, {}, function(err, user){
            if(user.pwd != o.old_pwd){
                return res.json( Util.resJson(-1, {msg: '旧密码不正确。'}) );
            }else{
                user.pwd = Util.md5(o.pwd1 + config.pwdSecret);
                user.save();
                res.json( Util.resJson(0) );
            }
        })
    },

    /**
     * 上传搭配、晒货照
     * @param req
     * @param res
     */
    uploadShare: function(req, res){
        var img = req.files.img, id = req.session.user._id, nn = id + '_' + Util.timestamp();

        var path = img.path;

        async.auto({
            size: function(fn){
                gm(path).size(fn);
            },
            UPYun:function(fn){
                var fileContent = fs.readFileSync(path);

                upyun.writeFile(upyunShareDir + nn + '.jpg', fileContent, true, fn);
            }
        }, function(err, data){
            var r = data.size.height / data.size.width, size = {};
            size.w = 225;
            size.h = Math.floor(225 * r);
            var o = {
                url: config.UPYun.url + upyunShareDir + nn + '.jpg',
                size: size
            }
            fs.unlinkSync(path);
            res.json( Util.resJson(err, o) );
        })
    },

    /**
     * 上传头像
     * @param req
     * @param res
     */
    uploadAvatar: function(req, res){
        var img = req.files.img;
        var oldPath = img.path, newPath = "", name = req.session.user._id + ".jpg";
        newPath = config.uploadDir + name;

        gm(oldPath).write(newPath, function(er){
            if(!er){
                fs.unlinkSync(img.path);

                gm(newPath).size(function(e, v){
                    res.json( Util.resJson(0, {size: v}) );
                });
            }
        })
    },

    /**
     * 修改头像
     * @param req
     * @param res
     */
    modifyAvatar: function(req, res){
        var id = req.session.user._id;
        var s = {
            w: req.body.w,
            h: req.body.h,
            x1: req.body.x1,
            y1: req.body.y1,
            cc: req.body.cc
        }

        var avatarImg = config.uploadDir + '/' + id + '.jpg', cropImg = config.uploadDir + id + '_crop.jpg';

        async.auto({
            crop: function(fn){
                gm(avatarImg)
                    .crop(s.w * s.cc, s.h * s.cc, s.x1 * s.cc, s.y1 * s.cc)
                    .write(cropImg, function(){
                        fn(null)
                    });
            },
            UPYun:['crop', function(fn){
                var fileContent = fs.readFileSync(cropImg);

                upyun.writeFile(upyunAvatarDir + id + '.jpg', fileContent, true, function(err, data){
                    fn(err);
                });
            }],
            edit:['UPYun', function(fn){
                var url = config.UPYun.url + upyunAvatarDir + id + '.jpg';

                User.modifyById(id, {avatarUrl: config.UPYun.url + upyunAvatarDir + id + '.jpg'}, fn);
            }]
        }, function(err, d){
            console.log(err);
            console.log('edit user avatar OK');
            req.session.user = d.edit;
            fs.unlinkSync(avatarImg);
            fs.unlinkSync(cropImg);
            res.json( Util.resJson(err) );
        })
    },

    /**
     * 关注
     * @param req
     * @param res
     */
    follow: function(req, res){
        var host_id = req.body.host_id, fans_id = req.session.user._id;

        if(host_id == fans_id){
            return res.json( Util.resJson(-1, {msg: '自己也要关注吗？'}) );
        }

        async.auto({
            chk: function(fn){
                Follow.getByHostIdAndFansId(host_id, fans_id, fn);
            },
            add:['chk', function(fn, d){
                if(d.chk == null){
                    Follow.add({host_id: host_id, fans_id: fans_id}, fn);
                }else{
                    Follow.deleteByQuery({host_id: host_id, fans_id: fans_id}, fn);
                }
            }],
            count:['chk', function(fn, d){
                async.auto({
                    host:function(fn1){
                        User.getById(host_id, {fans_count: 1}, function(err, usr){
                            d.chk == null ? usr.fans_count++ : usr.fans_count--;
                            usr.save(fn1)
                        });
                    },
                    fans: function(fn1){
                        User.getById(fans_id, {follow_count: 1}, function(err, usr){
                            d.chk == null ? usr.follow_count++ : usr.follow_count--;
                            usr.save(fn1)
                        });
                    }
                }, function(err, d1){
                    fn();
                })

            }]
        }, function(err, d){
            res.json( Util.resJson(err, {isFollow: d.chk == null}) );
        })
    }
})
