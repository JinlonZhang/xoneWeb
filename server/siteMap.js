/**
 * Created by allenxu on 14-9-19.
 */

var _ = require('underscore');
var async = require('async');
var xml = require('xml');
var moment = require('moment');
var fs = require('fs');
var path = require('path');

var config = require('../config');
var proxy = require('../model_proxy');
var Item = proxy.Item;
var Share = proxy.Share;
var Album = proxy.Album;
var Category = proxy.Category;
var ShareItem = proxy.ShareItem;

var CONST = require('../CONST');

var mod = {};
module.exports = mod;

_.extend(mod, {
    init: function(){
        var w = this;

        w.buildIndex();
        w.buildSite();
        w.buildAlbum();
        w.buildItem();
        w.buildShare();
    },

    buildIndex: function(){
        var w = this, td = moment().format('YYYY-MM-DD'),
            l = [
            {
                sitemap: [
                    {loc: 'http://www.dingdangjie.cn/sitemap/home.xml'},
                    {lastmod: td}
                ]
            },
            {
                sitemap: [
                    {loc: 'http://www.dingdangjie.cn/sitemap/item.xml'},
                    {lastmod: td}
                ]
            },
            {
                sitemap: [
                    {loc: 'http://www.dingdangjie.cn/sitemap/album.xml'},
                    {lastmod: td}
                ]
            },
            {
                sitemap: [
                    {loc: 'http://www.dingdangjie.cn/sitemap/share.xml'},
                    {lastmod: td}
                ]
            }
        ]

        console.log(td + ' home siteMap start');

        var s = xml({'sitemapindex':l}, { declaration: true });
        var p = path.join(__dirname, '../public/');

        fs.writeFile(p + 'sitemap.xml', s, function(err){
            console.log('index siteMap end');
        });
    },

    buildSite: function(){
        var w = this, td = moment().format('YYYY-MM-DD'),
            url = ['', '/guang/hot', '/guang/clothing', '/guang/shoes', '/guang/bags', '/album', '/share', '/look'],
            l = [];

        console.log(td + ' home siteMap start');

        _.each(url, function(u){
            var o = {
                url: [
                    {loc: 'http://www.dingdangjie.cn' + u},
                    {lastmod: td},
                    {changefreq: 'daily'}
                ]
            }
            l.push(o);
        })

        Category.getCategoryByQuery({level: 3}, {name: 1, p_id: 1}, {}, function(err, list){
            async.each(list, function(ca, fn){
                async.auto({
                    leve2: function(fn2){
                        Category.getCategoryById(ca.p_id, fn2);
                    },
                    leve1: ['leve2', function(fn2, d){
                        Category.getCategoryById(d.leve2.p_id, fn2);
                    }]
                }, function(err2, d){
                    var u = ['/guang/', d.leve1.urlName, '/', ca._id].join('');
                    var o = {
                        url: [
                            {loc: 'http://www.dingdangjie.cn' + u},
                            {lastmod: td},
                            {changefreq: 'daily'},
                            {priority: '0.6'}
                        ]
                    }
                    l.push(o);
                    fn();
                })

            }, function(err2){
                var s = xml({'urlset':l}, { declaration: true });
                var p = path.join(__dirname, '../public/sitemap/');

                fs.writeFile(p + 'home.xml', s, function(err){
                    console.log('home siteMap end');
                });
            });
        })

    },

    buildItem: function(){
        var w = this, l = [], td = moment().format('YYYY-MM-DD');

        console.log(td + ' item siteMap start');

        Item.getByQuery({}, {img: 1, price:1, name:1, description:1, date:1 }, {sort: {_id: -1}, skip:0, limit: 5000}, function(err, list){
            _.each(list, function(it){
                var date = moment(it.date).format('YYYY-MM-DD'), img = it.img.url;
                var o = {
                    url: [
                        {loc: 'http://www.dingdangjie.cn/item/' + it._id},
                        {lastmod: date},
                        {changefreq: 'monthly'},
                        {priority: '0.8'},
                        {
                            data: [{
                                display: [
                                    {title: it.name},
                                    {pubTime: date},
                                    {thumbnail: {_attr: {loc: img + '!100x100.jpg'}} },
                                    {image: {_attr: {loc: img + '!440x999.jpg', title: it.name}} },
                                    {price: {_attr: {new: it.price.toFixed(2)}} }
                                ]
                            }]
                        }
                    ]
                }
                l.push( o );
            })
            var s = xml({'urlset':l}, { declaration: true });
            var p = path.join(__dirname, '../public/sitemap/');

            fs.writeFile(p + 'item.xml', s, function(err){
                console.log('item siteMap end');
            });
            fs.writeFile(p + 'item2.xml', s, function(err){
                console.log('item2 siteMap end');
            });
        })

    },

    buildAlbum: function(){
        var w = this, l = [], td = moment().format('YYYY-MM-DD');

        console.log(td + ' album siteMap start');

        Album.getByQuery({}, {}, {sort: {_id: -1}, skip: 0, limit: 5000}, function(err, list){

            _.each(list, function(ab){
                var date = moment(ab.date).format('YYYY-MM-DD');
                var o = {
                    url: [
                        {loc: 'http://www.dingdangjie.cn/album/' + ab._id},
                        {lastmod: date},
                        {changefreq: 'weekly'},
                        {priority: '0.7'},
                        {
                            data: [{
                                display: [
                                    {title: ab.name},
                                    {pubTime: date}
                                    //{thumbnail: {_attr: {loc: img}} },
                                    //{image: {_attr: {loc: img, title: it.name}} }
                                ]
                            }]
                        }
                    ]
                }
                if(ab.name != '默认专辑'){
                    l.push( o );
                }
            })
            var s = xml({'urlset':l}, { declaration: true });
            var p = path.join(__dirname, '../public/sitemap/');
            fs.writeFile(p + 'album.xml', s, function(err){
                console.log('album siteMap end');
            });
            fs.writeFile(p + 'album2.xml', s, function(err){
                console.log('album2 siteMap end');
            });
        })
    },

    buildShare: function(){
        var w = this, l = [], td = moment().format('YYYY-MM-DD');

        console.log(td + ' share siteMap start');

        Share.getByQuery({}, {}, {sort: {_id: -1}, skip: 0, limit: 5000}, function(err, list){
            async.eachSeries(list, function(sh, fn){
                ShareItem.getByShareId(sh._id, function(err2, si){
                    if(si){
                        var date = moment(sh.date).format('YYYY-MM-DD'), img = sh.imgs[0].url;
                        var o = {
                            url: [
                                {loc: 'http://www.dingdangjie.cn/share/' + sh._id},
                                {lastmod: date},
                                {changefreq: 'monthly'},
                                {priority: '0.8'},
                                {
                                    data: [{
                                        display: [
                                            {title: si.name},
                                            {pubTime: date},
                                            {thumbnail: {_attr: {loc: img + '!100x100.jpg'}} },
                                            {image: {_attr: {loc: img + '!460x999.jpg', title: si.name}} },
                                            {price: {_attr: {new: si.price ? si.price.toFixed(2) : 0}} }
                                        ]
                                    }]
                                }
                            ]
                        }
                        l.push( o );
                    }
                    fn(err2);
                })
            }, function(err){
                var s = xml({'urlset':l}, { declaration: true });
                var p = path.join(__dirname, '../public/sitemap/');
                fs.writeFile(p + 'share.xml', s, function(err){
                    console.log('share siteMap end');
                });
                fs.writeFile(p + 'share2.xml', s, function(err){
                    console.log('share2 siteMap end');
                });
            })

        })
    }
});