/**
 * Created by allen on 14-5-21.
 */

var _ = require('underscore');

var mod = {};
module.exports = mod;

_.extend(mod, {
    Site: require('./site'),
    Item: require('./item'),
    Album: require('./album'),
    Share: require('./share'),
    Login: require('./login'),
    Reg: require('./reg'),
    User: require('./user'),
    Follow: require('./follow'),
    Thing: require('./thing')
});