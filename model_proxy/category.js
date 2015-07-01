/**
 * proxy of category
 * Created by allen on 14-5-11.
 */
var _ = require('underscore');
var model = require('../model');
var Category = model.Category;

var mod = {};
module.exports = mod;

_.extend(mod, {

    getCategoryByQuery: function(query, field, opt, fn){
        Category.find(query, field, opt, fn);
    },

    getCategoryById: function(id, fn){
        Category.findOne({_id: id}, fn);
    }
})