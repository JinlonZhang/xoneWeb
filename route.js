/**
 * Created by allen on 14-5-11.
 */
var _ = require('underscore');
var Util = require('./lib/util');
var controller = require('./controller');
var Site = controller.Site;
var Item = controller.Item;
var Album = controller.Album;
var Share = controller.Share;
var Login = controller.Login;
var Reg = controller.Reg;
var User = controller.User;
var Follow = controller.Follow;
var Thing = controller.Thing;

var Auth = {
    userIsSelf: function(req, res, next){
        var _id = req.params.id;
        if(req.session.user && req.session.user._id == _id){
            next();
        }else{
            res.redirect('/login');
        }
    },

    userLogin: function(req, res, next){
        if(req.session.user){
            next();
        }else{
            res.redirect('/login');
        }
    },

    userNotLogin: function(req, res, next){
        if(req.session.user){
            res.redirect('/');
        }else{
            next();
        }
    },

    API_userIsSelf: function(req, res, next){
        var author_id = req.body.author_id;
        if(req.session.user && req.session.user._id == author_id){
            next();
        }else{
            return res.json( Util.resJson(-100, {msg: '请重新登录。'}) );
        }
    },

    API_userLogin: function(req, res, next){
        if(req.session.user){
            next();
        }else{
            return res.json( Util.resJson(-100, {msg: '请重新登录。'}) );
        }
    },

    API_userNotLogin: function(req, res, next){
        if(req.session.user){
            return res.json( Util.resJson(-100, {msg: '请重新登录。'}) );
        }else{
            next();
        }
    }
}

var mod = function(app){

    app.get('/', Site.index);
    app.get('/oauth/:type', Site.oauth);
    app.get('/oauth/:type/callback', Site.oauthCallback);
    app.get('/guang/hot', Site.hot);
    app.get('/guang/:urlName', Site.category);
    app.get('/guang/:urlName/:categoryId', Site.category);
    app.get('/item/:id', Site.item);
    app.get('/go/:id', Site.go);
    app.get('/sgo/:id', Site.sgo);

    app.get('/album', Album.list);
    app.get('/share', Share.list);
    app.get('/look', Share.listLook);
    app.get('/album/:id', Album.detail);
    app.get('/share/:id', Share.detail);

    app.get('/login', Auth.userNotLogin, Login.login);
    app.get('/logout', Login.logout);
    app.get('/findPwd', Auth.userNotLogin, Login.findPwd);
    app.get('/resetPwd', Auth.userNotLogin, Login.resetPwd);
    app.get('/reg', Auth.userNotLogin, Reg.reg);

    app.get('/avatar/raw', Auth.userLogin, User.avatarRaw);
    app.get('/user/:id', User.baseInfo, User.index);
    app.get('/user/:id/thing', Auth.userIsSelf, User.baseInfo, Thing.index);
    app.get('/user/:id/album', User.baseInfo, User.album);
    app.get('/user/:id/love', User.baseInfo, User.love);
    app.get('/user/:id/profile', Auth.userIsSelf, User.baseInfo, User.profile);
    app.get('/user/:id/pwd', Auth.userIsSelf, User.baseInfo, User.pwd);
    app.get('/user/:id/avatar', Auth.userIsSelf, User.baseInfo, User.avatar);
    app.get('/user/:id/follow', User.baseInfo, Follow.list);
    app.get('/user/:id/fans', User.baseInfo, Follow.fansList);

    /************* API ************/
    app.post('/api/login', Login.api.login);
    app.post('/api/reg', Reg.api.reg);

    app.get('/api/item', Item.api.getItem);
    app.get('/api/itemForCategory', Item.api.getItemForCategory);
    app.post('/api/itemToAlbum', Auth.API_userLogin, Item.api.album);
    app.delete('/api/itemDelToAlbum', Auth.API_userLogin, Item.api.delToAlbum);

    app.post('/api/findPwd', Login.api.findPwd);
    app.post('/api/resetPwd', Login.api.resetPwd);
    app.post('/api/love', Auth.API_userLogin, Item.api.love);
    app.post('/api/follow', Auth.API_userLogin, User.api.follow);
    app.post('/api/modifyProfile', Auth.API_userLogin, User.api.modifyProfile);
    app.post('/api/modifyPwd', Auth.API_userLogin, User.api.modifyPwd);
    app.post('/api/uploadAvatar', Auth.API_userLogin, User.api.uploadAvatar);
    app.post('/api/modifyAvatar', Auth.API_userLogin, User.api.modifyAvatar);
    app.post('/api/uploadShare', Auth.API_userLogin, User.api.uploadShare);
    app.get('/api/album', Auth.API_userLogin, Album.api.getAlbumList);
    app.post('/api/album', Auth.API_userLogin, Album.api.album);
    app.delete('/api/album', Auth.API_userLogin, Album.api.deleteAlbum);
    app.get('/api/albumForDetail', Album.api.getAlbumForDetail);
    app.get('/api/share', Share.api.getShareList);
    app.post('/api/share', Auth.API_userLogin, Share.api.share);
    app.post('/api/shareByUser', Auth.API_userLogin, Share.api.shareByUser);
    app.delete('/api/share', Auth.API_userLogin, Share.api.deleteShare);
    app.post('/api/share/love', Auth.API_userLogin, Share.api.love);
    app.post('/api/share/comment', Auth.API_userLogin, Share.api.comment);
    app.delete('/api/share/comment', Auth.API_userLogin, Share.api.deleteComment);
    app.post('/api/share/link', Auth.API_userLogin, Share.api.link);
    app.post('/api/share/linkInfo', Auth.API_userLogin, Share.api.linkInfo);
    app.delete('/api/share/link', Auth.API_userLogin, Share.api.deleteLink);


    app.get('*', function(req, res){
        res.status(404);
        res.end();
    })
}
module.exports = mod;