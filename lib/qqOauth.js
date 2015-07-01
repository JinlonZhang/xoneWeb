/**
 * Created by allen on 14-8-4.
 */
var querystring = require('querystring'),
    crypto = require('crypto'),
    URL = require('url'),
    https = require('https'),
    path = require('path'),
    _ = require('underscore'),
    Util = require('./util');

var QQ = {
    appId: '101137643',
    appKey: 'ef72ba0dc1c9df19c5a5d0a1e8f03e01',
    callback: 'http://www.dingdangjie.cn/oauth/qq/callback',
    scope: 'all'
}
var Oauth = {}
module.exports = Oauth;

Oauth.GET_AUTH_CODE_URL = "https://graph.qq.com/oauth2.0/authorize";
Oauth.GET_ACCESS_TOKEN_URL = "https://graph.qq.com/oauth2.0/token";
Oauth.GET_OPENID_URL = "https://graph.qq.com/oauth2.0/me";

_.extend(Oauth, {
    GET_INFO: 'https://graph.qq.com/user/get_user_info'
})

_.extend(Oauth, {
    qq_login: function (){
        var w = this;

        var url = '';
        w.state = Util.md5('ddj' + Util.timestamp());

        var p = {
            "response_type" : "code",
            "client_id" : QQ.appId,
            "redirect_uri" : QQ.callback,
            "state" : w.state,
            "scope" : QQ.scope
        }
        var pd = querystring.stringify(p);

        url = w.GET_AUTH_CODE_URL + '?' + pd;

        return url;
    },

    qq_callback: function(req, fn){
        var w = this, r = {};
        //-------请求参数列表
        var p = {
            "grant_type" : "authorization_code",
            "client_id" : QQ.appId,
            "redirect_uri" : encodeURI(QQ.callback),
            //"redirect_uri" : encodeURIComponent(QQ.callback),
            "client_secret" : QQ.appKey,
            "code" : req.query.code
        }
        var pd = querystring.stringify(p);
        var url = w.GET_ACCESS_TOKEN_URL + '?' + pd;

        https.get(url, function(res){
            var result;

            res.on("data", function(chunk) {
                result += chunk
            });

            res.on('end', function(){
                result = result.replace('undefined', '');
                if(result.indexOf('callback') != -1){
                    var s = result.indexOf('(');
                    var e = result.indexOf(')');
                    result = result.substring(s+1, e);
                    r = JSON.parse(result);
                }else{
                    result = result.split('&');
                    _.each(result, function(it){
                        r[ it.split('=')[0] ] = it.split('=')[1];
                    });
                }
                fn(null, r);
            });

            res.on('error', function(){
                fn(null, {error: 1});
            })

        })
    },

    getOpenId: function(token, fn){
        var w = this, r = {};
        var p = {
            'access_token': token
        }
        var pd = querystring.stringify(p);
        var url = w.GET_OPENID_URL + '?' + pd;


        https.get(url, function(res){
            var result;

            res.on("data", function(chunk) {
                result += chunk
            });

            res.on('end', function(){
                result = result.replace('undefined', '');
                if(result.indexOf('callback') != -1){
                    var s = result.indexOf('(');
                    var e = result.indexOf(')');
                    result = result.substring(s+1, e);
                    r = JSON.parse(result);
                }else{
                    result = result.split('&');
                    _.each(result, function(it){
                        r[ it.split('=')[0] ] = it.split('=')[1];
                    });
                }
                fn(null, r);
            });

            res.on('error', function(){
                fn(null, {error: 1});
            })

        })
    },

    /**
     * 获得QQ用户信息
     * @param o
     * @param fn
     */
    getUserInfo: function(o, fn){
        var w = this, r = {};

        var p = {
            access_token: o.access_token,
            oauth_consumer_key: QQ.appId,
            openid: o.openid
        }
        var pd = querystring.stringify(p);

        var url = w.GET_INFO + '?' + pd;

        https.get(url, function(res){
            var result;

            res.on("data", function(chunk) {
                result += chunk
            });

            res.on('end', function(){
                result = result.replace('undefined', '');
                r = JSON.parse(result);
                fn(null, r);
            });

            res.on('error', function(){
                fn(null, {error: 1});
            })

        })
    }
});


