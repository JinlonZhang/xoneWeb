/**
 * Created by allen on 14-5-13.
 */

var _ = require('underscore');
var crypto = require('crypto');
var moment = require('moment');
var CONST = require('../CONST');

var mod = {};
module.exports = mod;

_.extend(mod, {

    md5: function(str){
        var md5sum = crypto.createHash('md5');
        md5sum.update(str);
        str = md5sum.digest('hex');
        return str;
    },

    /**
     * api接口返回的JSON结构
     * resJson(0, {msg: '保存成功'});
     * resJson(-1, {msg: '用户已存在'});
     * resJson(err, {list: groupList});
     */
    resJson: function(status, o){
        var s = 0, t = {};
        if(typeof status == 'number'){
            s = status;
        }else{
            if(status == null){
                s = 0;
            }else{
                s = -1;
                t.msg = '未知错误';
                t.err = status;
            }
        }
        t.code = s;

        return _.extend(t, o ? o : {});
    },

    timestamp: function(){
        return Math.round(new Date().getTime());
    },

    getSEO: function(catId, item){
        var o = {};
        var categoryList = CONST.CATEGORY_LIST, categoryMap = CONST.CATEGORY_MAP;
        var categoryId = catId;

        if(categoryId == "home" || categoryId == 'none'){
            o.title = "叮当街，发现潮流精品，分享网购乐趣。";
            o.keywords = "叮当街,淘宝网,女装,鞋子,包包,搭配,达人,团购,淘宝店";
            o.desc = "叮当街-精选淘宝网款式美、质量优、价格合理的衣服、鞋子、包包等潮流商品。在这里享受购物乐趣，发现时尚精品。";
            return o;
        }else if(categoryId == ""){
            o.title = item.name + '-叮当街';
            o.keywords = "叮当街,淘宝网,女装,鞋子,包包,搭配,达人,团购,淘宝店";
            o.desc = item.description || "叮当街-精选淘宝网款式美、质量优、价格合理的衣服、鞋子、包包等潮流商品。在这里享受购物乐趣，发现时尚精品。";
            return o;
        }else{
            var oneObj, keywords;
            categoryList.forEach(function(one){
                if(one.self._id == categoryMap[categoryId].oneId){
                    oneObj = one.self;
                }
            });
            o.title = categoryMap[categoryId].name + ' - 叮当街_' + oneObj.SEO_title;
            o.keywords = oneObj.SEO_keywords;
            var desc = '欢迎访问叮当街n频道，这里有淘宝网购达人们精心挑选的最热2014新款时尚n，发现当季最潮n和最佳搭配心得。';
            o.desc = desc.replace(/n/g, o.keywords.split(',')[0]);
        }
        return o;
    }
})
