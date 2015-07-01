/**
 * Created by allen on 14-8-2.
 */


var _ = require('underscore');
var async = require('async');
var proxy = require('./model_proxy');

var Item = proxy.Item;
var User = proxy.User;
var Share = proxy.Share;

var _o = {
    upAvatar: function(){
        var fs = require('fs');
        var UPYun = require('./lib/upyun').UPYun;
        //var upyun = new UPYun('jimi-test', 'allen', '1qazXSW@');
        var upyun = new UPYun('ddj-user', 'allen', '1qazXSW@');

        var path = 'avatar.jpg';
        var fileContent = fs.readFileSync(path);

        upyun.writeFile('/avatar.jpg', fileContent, false, function(err){
            console.log('done!');
            console.log(err);
        });
    },

    upResource: function(){
        var fs = require('fs');
        var UPYun = require('./lib/upyun').UPYun;
        var upyun = new UPYun('ddj-resource', 'allen', '1qazXSW@');

        var path = 'tb-99-02.jpg';
        var fileContent = fs.readFileSync(path);

        upyun.writeFile('/tb-99-02.jpg', fileContent, false, function(err){
            console.log('done!');
            console.log(err);
        });
    },

    user: function(){
        User.getByQuery({}, {}, {}, function(err, list){

            _.each(list, function(user){
                user.love_count = 0;
                user.save();
                console.log('edit user OK##' + user.name);
            });
            console.log(list.length);
        })
    },

    share: function(){
        Share.getByQuery({love_total: {$gt: 30}}, {}, {skip: 0, limit: 500}, function(err, list){
            _.each(list, function(sh){

                sh.love_total = sh.love_total - Math.floor(Math.random() * 20);
                sh.save();
                console.log('ok');

            })
        })
    },

    userShare: function(){
        /* *
        User.getByQuery({}, {love_count: 1}, {}, function(err, list){
            _.each(list, function(us){
                us.love_count = 0;
                us.save();
                console.log('OK');
            });
            console.log(list.length);
        })
        /* */
        /* */
        Share.getByQuery({}, {}, {}, function(err, list){
            async.eachSeries(list, function(sh, fn){
                User.getById(sh.author_id, function(er, us){
                    us.love_count += sh.love_total;
                    us.save(fn);
                })
            }, function(err){
                console.log('all done');
            })
        });
        /* */
    },

    item: function(){
        Item.getByQuery({}, {}, {sort: {_id: -1},skip:0, limit:3000}, function(err, list){
            _.each(list, function(it){
                it.love_total = Math.floor( Math.random() * 3600 ) + 400;
                it.save();
                console.log('ok');
            })
        })
    }
}

_o.upResource();