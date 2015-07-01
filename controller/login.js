/**
 * 登录 13-10-18.
 */

var _ = require('underscore');
var moment = require('moment');
var async = require('async');
var xss = require('xss');
var nodemailer = require('nodemailer');
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var config = require('../config');
var Util = require('../lib/util');
var proxy = require('../model_proxy');
var User = proxy.User;
var FindPwd = proxy.FindPwd;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {
    login: function(req, res){
        res.render('login', Util.getSEO("", {name: '登录'}));
    },

    logout: function(req, res){
        req.session.destroy();
        res.redirect('/');
    },

    findPwd: function(req, res){
        res.render('pwdFind');
    },

    resetPwd: function(req, res){
        var key = xss(req.query.key).trim();

        if(!key){
            return res.render('pwdReset', {msg: '邮件找回校验失败或者已经失效,请重新找回。'});
        }

        async.auto({
            chkKey: function(fn){
                FindPwd.getByKey(key, fn);
            },
            chkTime:['chkKey', function(fn, data){
                if(data.chkKey){
                    var now = moment();
                    FindPwd.getByKey(key, function(err, fp){
                        var create = moment(fp.date);
                        fn(null, {time: create.isAfter(now), fp: fp});
                    })
                }else{
                  fn(null, {time: false});
                }
            }]
        }, function(err, data){
            if(data.chkTime.time){
                res.render('pwdReset', {msg: '', fp: data.chkTime.fp});
            }else{
                res.render('pwdReset', {msg: '邮件找回校验失败或者已经失效,请重新找回。'});
            }
        })

    }
})


/*************** API **************/
_.extend(mod.api, {
    login: function(req, res){
        var o = {
            login_name: xss(req.body.login_name).trim(),
            pwd: req.body.pwd
        }
        var rem = req.body.rem;

        if(o.login_name == ''){
            return res.json( Util.resJson(-1, {msg: '请输入登录邮箱。'} ));
        }
        if(o.pwd == ''){
            return res.json( Util.resJson(-1, {msg: '请输入密码。'} ));
        }

        User.getByLoginName(o.login_name, function(err, user){

            if (!user) {
                return res.json(Util.resJson(-1, { msg: '邮箱或密码错误。' }));
            }

            o.pwd = Util.md5(o.pwd + config.pwdSecret);
            if(o.pwd != user.pwd){
                return res.json(Util.resJson(-1, { msg: '邮箱或密码错误。' }));
            }

            user.score += 1;
            user.last_active = new Date();
            user.save();
            if(rem == '1'){
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
            req.session.user = user;
            res.json(Util.resJson(0));
        })
    },

    /**
     * 找回密码请求
     * @param req
     * @param res
     */
    findPwd: function(req, res){
        var ln = xss(req.body.login_name).trim();
        var key = Util.md5(ln + Math.round(new Date().getTime()) );

        if(ln == ""){ return res.json( Util.resJson(-1, {msg: '注册邮箱不能为空。'}) )}

        async.auto({
            chkUser: function(fn){
                User.getByLoginName(ln, function(err, user){
                    fn(null, user);
                });
            },
            findPwd:['chkUser', function(fn, data){
                if(data.chkUser){
                    FindPwd.getByLoginName(ln, function(err, fp){
                        var time = moment().hours(moment().hours() + 24);
                        if(fp){
                            FindPwd.modifyByQuery({login_name: ln}, {key: key, date: new Date(time)}, fn)
                        }else{
                            FindPwd.add({
                                login_name: ln,
                                key: key,
                                date: new Date(time)
                            }, fn)
                        }
                    });
                }else{
                    fn(null);
                }
            }],
            mail: function(fn){
                var url = 'http://www.dingdangjie.cn/resetPwd?key=' + key;
                var html = [
                    '<p>亲爱的用户：</p>',
                    '<p>欢迎你使用叮当街找回密码功能。请点击以下链接重置你的密码（24小时内有效）：</p>',
                    '<a href="' + url + '" target="_blank">' + url + '</a>',
                    '<p>如果链接不可点击，可以尝试将链接拷贝至浏览器地址栏进入相应页面。</p>',
                    '<p>如果你没有申请找回密码，请忽略此邮件。</p>',
                    '<p>感谢你对叮当街的支持 ！</p>',
                    '<br/><br/><br/><br/><p><a href="http://www.dingdangjie.cn" target="_blank">叮当街</a></p>',
                    '<p>(本邮件由系统自动发送，请勿回复。)</p>'
                ]
                //这里是初始化，需要定义发送的协议，还有你的服务邮箱，当然包括密码了
                var smtpTransport = nodemailer.createTransport("SMTP",{
                    service: "QQ",
                    auth: {
                        user: "user@dingdangjie.cn",
                        pass: "1qazxcde32"
                    }
                });
                //邮件配置
                var mailOptions = {
                    from: "叮当街<user@dingdangjie.cn>",            // 发送地址
                    to: "24822324@qq.com",              // 接收列表
                    subject: "[叮当街]找回您的密码",   // 邮件主题
                    text: html.join(''),                // 文本内容
                    html: html.join('')                 // html内容
                }
                //开始发送邮件
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                    }else{
                        console.log("邮件已经发送: " + response.message);
                    }
                    fn(error);
                    //如果还需要实用其他的 smtp 协议，可将当前回话关闭
                    //smtpTransport.close();
                });
            }
        }, function(err, data){
            if(data.chkUser == null){
                return res.json( Util.resJson(-1, {msg: '你的邮箱还没有在叮当街注册。'}) );
            }else{
                res.json( Util.resJson(err) );
            }
        })
    },

    /**
     * 重置密码
     * @param req
     * @param res
     */
    resetPwd: function(req, res){
        var key = xss(req.body.key).trim();
        var o = {
            pwd: req.body.pwd,
            pwd2: req.body.pwd2
        }

        if(o.pwd == ""){ return res.json( Util.resJson(-1, {msg: '新密码不能为空。'}) ); }
        if(o.pwd != o.pwd2){ return res.json( Util.resJson(-1, {msg: '两次新密码不一致。'}) ); }

        async.auto({
            FP: function(fn){
                FindPwd.getByKey(key, fn);
            },

            saveUser: ['FP', function(fn, data){
                if(data.FP){
                    User.getByLoginName(data.FP.login_name, function(err, user){
                        user.pwd = Util.md5(o.pwd + config.pwdSecret);
                        user.save(fn);
                    });
                }else{
                    fn(null, {error: true});
                }
            }],
            deleteFp: ['saveUser', function(fn){
                FindPwd.deleteByQuery({key: key}, fn);
            }]
        }, function(err, data){
            if(data.saveUser.error){
                return res.json( Util.resJson(-1, {msg: '设置新密码失败！'} ))
            }
            res.json( Util.resJson(0) );
        })

    }

});


