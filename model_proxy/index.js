
var _ = require('underscore');

var mod = {};
module.exports = mod;

_.extend(mod, {
    Item: require('./item'),
    Category: require('./category'),
    Advert: require('./advert'),
    User: require('./user'),
    FindPwd: require('./findPwd'),
    Share: require('./share'),
    ShareItem: require('./shareItem'),
    Album: require('./album'),
    Love: require('./love'),
    Comment: require('./comment'),
    Follow: require('./follow'),
    Thing: require('./thing'),
    AddToAlbum: require('./addToAlbum')
});