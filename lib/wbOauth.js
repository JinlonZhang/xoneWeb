/**
 * Created by allenxu on 14-8-5.
 */

var querystring = require('querystring'),
    crypto = require('crypto'),
    URL = require('url'),
    https = require('https'),
    path = require('path'),
    _ = require('underscore'),
    Util = require('./util');

var wb = {
    appKey: '687411186',
    appSecret: '5eb06d8b3fe63101df2147835f7f2292',
    callback: 'http://www.dingdangjie.cn/oauth/wb/callback'
}

var Oauth = {};
Oauth.url = {};
Oauth.api = {};
module.exports = Oauth;

_.extend(Oauth.url, {
    GET_AUTH_CODE_URL: 'https://api.weibo.com/oauth2/authorize',
    GET_ACCESS_TOKEN_URL: 'https://api.weibo.com/oauth2/access_token'
});

_.extend(Oauth.api, {
    GET_INFO: 'https://api.weibo.com/2/users/show.json'
});

_.extend(Oauth, {
    wb_login: function(){
        var w = this;

        var url = '';

        var p = {
            "response_type" : "code",
            "client_id" : wb.appKey,
            "redirect_uri" : wb.callback
        }
        var pd = querystring.stringify(p);

        url = w.url.GET_AUTH_CODE_URL + '?' + pd;

        return url;
    },

    wb_callback: function(req, fn){
        var w = this, r = {};
        //-------请求参数列表
        var p = {
            "grant_type" : "authorization_code",
            "client_id" : wb.appKey,
            "redirect_uri" : wb.callback,
            "client_secret" : wb.appSecret,
            "code" : req.query.code
        }
        var pd = querystring.stringify(p);
        var post_headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': pd.length
        };
        var url = w.url.GET_ACCESS_TOKEN_URL;
        var parsedUrl = URL.parse(url, true);
        var opt = {
            host: parsedUrl.host,
            path: parsedUrl.pathname,
            method: 'post',
            port: 443,
            headers: post_headers
        }


        var reqHttps = https.request(opt, function(res){
            res.setEncoding("utf8");

            res.on("data", function(d) {
                console.log(d);
                fn(null, JSON.parse(d) );
            });

        })

        reqHttps.write(pd);
        reqHttps.end();

    },

    getUserInfo: function(o, fn){
        var w = this, r = {};
        //-------请求参数列表
        var p = {
            access_token: o.access_token,
            uid: o.uid
        }
        var pd = querystring.stringify(p);
        var url = w.api.GET_INFO + '?' + pd;

        https.get(url, function(res){
            var result = '';

            res.on("data", function(d) {
                result += d;
            });

            res.on('end', function(){
                fn(null, JSON.parse(result) );
            })

        })
    }
})

