/**
 * Created by allen on 14-5-11.
 */

var _ = require('underscore');
var dev = 1, miniDev = 1, mod;

var devConfig = {
    db: 'mongodb://127.0.0.1/xone',
    dbName: 'xone',
    host: 'localhost',
    cookieSecret: 'ddj-dev',
    uploadDir: '../upload/',
    linkUrl: '/',
    UPYun: {
        space: 'jimi-test',
        name: 'allen',
        pwd: '1qazXSW@',
        url: 'http://jimi-test.b0.upaiyun.com'
    }
}
var onlineConfig = {
    db: 'mongodb://10.232.83.227/xone',
    dbName: 'xone',
    host: '10.232.83.227',
    cookieSecret: 'ddj',
    uploadDir: '/data/',
    linkUrl: 'http://www.dingdangjie.cn/',
    UPYun: {
        space: 'ddj-user',
        name: 'allen',
        pwd: '1qazXSW@',
        url: 'http://s10.dingdangjie.cn'
    }
}

if(dev == 1){
    mod = devConfig
}else{
    mod = onlineConfig
}

_.extend(mod, {
    port: 9000,
    miniDev: miniDev,
    pwdSecret: 'ddpp',
    mlslm: 'NM_s10756'
})

module.exports = mod;


