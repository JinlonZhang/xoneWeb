/**
 * Created by Administrator on 13-10-18.
 */

var mongoose = require('mongoose');
var config = require('../config');
var _ = require('underscore');

var mod = {};
module.exports = mod;

mongoose.connect(config.db, function (err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});



// models
require('./item');
require('./manager');
require('./category');
require('./advert');
require('./user');
require('./findPwd');
require('./share');
require('./shareItem')
require('./album');
require('./love');
require('./comment');
require('./follow');
require('./thing');
require('./addToAlbum')

_.extend(mod, {
    Item: mongoose.model('Item'),
    Manager: mongoose.model('Manager'),
    Category: mongoose.model('Category'),
    Advert: mongoose.model('Advert'),
    User: mongoose.model('User'),
    FindPwd: mongoose.model('FindPwd'),
    Share: mongoose.model('Share'),
    ShareItem: mongoose.model('ShareItem'),
    Album: mongoose.model('Album'),
    Love: mongoose.model('Love'),
    Comment: mongoose.model('Comment'),
    Follow: mongoose.model('Follow'),
    Thing: mongoose.model('Thing'),
    AddToAlbum: mongoose.model('AddToAlbum')
});