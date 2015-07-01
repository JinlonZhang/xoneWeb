
var _ = require('underscore');
var moment = require('moment');

var model = require('../model');
var Item = model.Item;

var mod = {};
module.exports = mod;

_.extend(mod, {
    
    getByQuery: function(query, field, opt, fn){
        Item.find(query, field, opt, fn);
    },
    
    getById: function(id, fn){
        Item.findOne({_id: id}, fn);
    },

    getTotalByQuery: function(query, fn){
        Item.count(query, fn);
    }
})


