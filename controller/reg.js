/**
 * Controller of reg
 * 2014-7-5.
 */
var _ = require('underscore');
var async = require('async');
var xss = require('xss');
var config = require('../config');
var Util = require('../lib/util')
var proxy = require('../model_proxy');
var User = proxy.User;
var Album = proxy.Album;

var mod = {};
mod.api = {};
module.exports = mod;

_.extend(mod, {
    reg: function(req, res){
        res.render('reg', Util.getSEO("", {name: '注册'}));
    }
})


/***************** API *******************/
var api = {};
exports.api = api;

_.extend(mod.api, {
    /**
     * 注册
     * @param req
     * @param res
     */
    reg: function(req, res){

        var o = {
            uuid: 'ddj_' + Util.timestamp(),
            login_name : xss(req.body.login_name).trim(),
            pwd : req.body.pwd,
            pwd2 : req.body.pwd2,
            name : xss(req.body.name).trim(),
            introduce: '',
            avatarUrl: 'http://s10.dingdangjie.cn/avatar.jpg'
        }
        if(o.login_name == ''){
            return res.json( Util.resJson(-1, {msg: '注册邮箱不能为空。'}) )
        }
        if(o.login_name.indexOf('@') == -1){
            return res.json( Util.resJson(-1, {msg: '请输入合法的邮箱地址。'}) )
        }
        if(o.pwd == ''){
            return res.json( Util.resJson(-1, {msg: '密码不能为空'}) );
        }
        if(o.pwd.length < 6){
            return res.json( Util.resJson(-1, {msg: '密码长度必须大于等于6位'}) );
        }
        if(o.pwd != o.pwd2){
            return res.json( Util.resJson(-1, {msg: '两次密码不一致。'}) )
        }
        o.pwd = Util.md5(o.pwd + config.pwdSecret);

        var fb = ['叮当街', '官方'];
        _.each(fb, function(f){
            if(o.name.indexOf(f) != -1){
                return res.json( Util.resJson(-1, {msg: '昵称违规！'}) )
            }
        })

        async.auto({
            checkLoginName: function(fn){
                User.getByLoginName(o.login_name, fn);
            },
            checkName: function(fn){
                User.getByName(o.name, fn);
            },
            add: ['checkLoginName', 'checkName', function(fn, data){
                if(data.checkLoginName == null && data.checkName == null){
                    User.add(o, fn);
                }else{
                    fn(null);
                }
            }]
        }, function(err, data){
            if(data.checkLoginName != null){
                return res.json( Util.resJson(-1, {msg: '邮箱已被注册！'}) );
            }
            if(data.checkName != null){
                return res.json( Util.resJson(-1, {msg: '昵称重复！'}) );
            }
            req.session.user = data.add[0];
            res.json( Util.resJson(0) );
        });
    }
})