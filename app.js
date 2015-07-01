
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var moment = require('moment');
var URL = require('url');
var _ = require('underscore');
var MongoStore = require('connect-mongo')(express);
var init = require('./init');
var route = require('./route');
var config = require('./config');
var Util = require('./lib/util');

moment.lang('zh-cn');
var app = express();

// all environments
app.set('port', config.port);
app.set('views', path.join(__dirname, 'public/page'));
app.set('view engine', 'ejs');
app.use(express.favicon(__dirname + '/public/src/img/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser({uploadDir: config.uploadDir }));
app.use(express.favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(express.methodOverride());
//Cookie 解析的中间件
app.use(express.cookieParser(config.cookieSecret));
//提供会话支持
//secret 用来防止篡改 cookie
//key 的值为 cookie 的名字
app.use(express.session({
    secret : config.cookieSecret,
    key : config.cookieSecret,
    cookie: {maxAge: 1000 * 60 * 60 * 12},//12小时
    store: new MongoStore({
        host: config.host,
        db: config.dbName
    })
}));

app.use(express.static(path.join(__dirname, 'public')));
var CONST = require('./CONST');

//初始化数据，读取到内存中。
init.init();

app.use(function(req, res, next){
    var o = {
        moment: moment,
        req: req,
        dateFormat: Util.dateFormat,
        URL: URL,
        miniDev: config.miniDev,
        categoryList: CONST.CATEGORY_LIST,
        linkUrl: config.linkUrl
    }

    _.extend(o, Util.getSEO("none"));

    res.locals(o);

    var url = req.originalUrl;


    next();
});
app.use(app.router);

//路由分配
route(app);

//定时任务，用于更新内存中的数据
var timer = require('./timer');
timer.init();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});