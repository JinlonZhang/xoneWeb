/**
 * Created by allen on 14-6-26.
 */

var _ = require('underscore');
var later = require('later');
var moment = require('moment');
var SiteMap = require('./server/siteMap');
var init = require('./init');

later.date.localTime();

var mod = {};
module.exports = mod;

_.extend(mod, {
    init: function(){
        var w = this;

        var s = {
            schedules:[ {h: [1]} ]
        };

        later.setInterval(function(){
            console.log( moment().format('YYYY-MM-DD HH:mm:ss') + ' START');
            SiteMap.init();
            init.init();
        }, s);
    }
})
