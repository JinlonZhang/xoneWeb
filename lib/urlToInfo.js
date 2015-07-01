/**
 * 获取淘宝、天猫宝贝链接的详细信息。下载宝贝图片并且上传到又拍云。
 * Created by allen on 14-9-6.
 */

var _ = require('underscore');
var http = require('http');
var url = require('url');
var iconv = require('iconv-lite');
var cheerio = require("cheerio");
var fs = require('fs');
var async = require('async');
var UPYun = require('./upyun').UPYun;
var Util = require('./util');
var config = require('../config');

var O = function(u){
    var w = this;

    w.url = u;
    w.urlJson = w.buildOpt(u);
    w.r = {code: 0, itemId: '', name: '', href: '', price: '', msg: '', imgList: []};
    w.r.itemId = w.itemId;
    w.r.href = w.getUrl();
};

module.exports = O;

var upyun = new UPYun(config.UPYun.space, config.UPYun.name, config.UPYun.pwd);
var upyunShareDir = '/share/';

_.extend(O.prototype, {

    chkUrl: function(){
        var w = this, host = w.urlJson.host;

        if(host != 'detail.tmall.com' && host != 'item.taobao.com'){
            w.r.code = -1;
            w.r.msg = '目前仅支持淘宝、天猫的商品！';
        }

        return w.r;
    },

    /**
     * http请求的参数对象
     * @param url
     */
    buildOpt: function(u){
        var w = this;

        w.itemId = url.parse(u, true).query.id;

        return {
            host: url.parse(u).host,
            port: 80,
            path: url.parse(u).pathname
        }
    },

    /**
     * 获得宝贝信息
     * @param url
     * @param fn
     */
    getInfo: function(fn){
        var w = this;

        w.httpRequest(w.r.href, function($){
            w.r.name = w.getName(w.urlJson.host, $);
            w.r.price = w.getPrice(w.urlJson.host, $);
            w.getImg($, fn);
        })

    },

    /**
     * 发起HTTP请求
     * @param u
     * @param fn
     */
    httpRequest: function(u, fn){
        var w = this;

        http.get(u, function(res){
            if(res.statusCode == 302){
                w.httpRequest(res.headers.location, fn);
                return
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
                var $ = cheerio.load(html);
                fn($);
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

    /**
     * 获得宝贝图片。数组
     * @param $
     */
    getImg: function($, fn){
        var w = this, imgs = $('#J_UlThumb').find('img'), arr = [];

        _.each(imgs, function(img, i){
            if(i>=6){ return; }
            var src = img.attribs['src'] || img.attribs['data-src'];
            src = src.replace(/_.webp/gi, '');
            src = src.replace(/60x60q90|50x50/gi, '100x100');
            var tmp = {
                url: src,
                size: {w: 100, h:100}
            }
            arr.push(tmp);
        })
        w.r.imgList = arr;
        fn(null, w.r);
    },

    /**
     * 获得宝贝的价格。
     * @param host
     * @param $
     * @returns {*}
     */
    getPrice: function(host, $){
        var w = this, pt = $('.originPrice').text(), pc = $('#J_StrPrice').find('.tb-rmb-num').text(), price;

        if(host == 'detail.tmall.com'){
            price = pt.replace('¥', '');
        }
        if(host == 'item.taobao.com'){
            price = pc.split('-')[0].trim();
        }
        return price;
    },

    getUrl: function(){
        var w = this;
        return 'http://' + w.urlJson.host + w.urlJson.path + '?id=' + w.itemId;
    }
})

_.extend(O, {
    /**
     * 下载宝贝图片到本地
     * @param u
     */
    downloadImg: function(itemId, o, fn){
        var w = this;

        var opt = {
            host: url.parse(o.url).hostname,
            port: 80,
            path: url.parse(o.url).pathname
        }

        http.get(opt, function(r){
            var h = '';
            r.setEncoding('binary');
            r.on('data', function(d){
                h += d;
            });
            r.on('end', function(){
                var name = itemId + '_' + Util.timestamp();
                var p = config.uploadDir + name + '.jpg';
                fs.writeFileSync(p, h, 'binary');
                w.uploadImgToUPyun(p, name, function(err, size){
                    var x = 225 / size.w;
                    size.h = Math.floor( x * size.h );
                    size.w = 225;
                    o.size = size;
                    o.url = config.UPYun.url + upyunShareDir + name + '.jpg';
                    fs.unlinkSync(p);
                    fn(err, o);
                });
            })
        })
    },

    /**
     * 上传图片到又拍云空间
     * @param filePath
     * @param name
     * @param fn
     */
    uploadImgToUPyun: function(filePath, name, fn){
        var fileContent = fs.readFileSync(filePath), size = {};

        upyun.writeFile(upyunShareDir + name + '.jpg', fileContent, false, function(err, data){
            size = {w: upyun.getWritedFileInfo('x-upyun-width'), h: upyun.getWritedFileInfo('x-upyun-height')};
            fn(err, size);
        });
    }
})