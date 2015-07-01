/**
 * Created by allen on 14-6-28.
 */


var _ = require('underscore');

var model = require('../model');
var Advert = model.Advert;

var mod = {};
module.exports = mod;

_.extend(mod, {

    getByQuery: function(query, field, opt, fn){
        Advert.find(query, field, opt, fn);
    },

    getById: function(id, fn){
        Advert.findOne({_id: id}, fn);
    },

    getTotalByQuery: function(query, fn){
        Advert.count(query, fn);
    }
})


