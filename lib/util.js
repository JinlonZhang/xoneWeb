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

    /**
     * 时间戳
     * @returns {number}
     */
    timestamp: function(){
        return Math.round(new Date().getTime());
    },

    /**
     * 时间处理。
     * 今天的时间显示 5小时之前
     * 3天以内的时间显示 2天前 20:12
     * 超过3天的 2013-07-08 20:12
     */
    dateFormat: function(date){
        var now = moment(), before = moment(date), str = '';
        var diff = now.diff(before, 'day');

        if(diff == 0){
            str = before.from(now);
        }else if(diff < 3){
            str = before.from(now) + " " + before.format('HH:mm');
        }else{
            str = before.format('YYYY-MM-DD HH:mm');
        }
        return str;
    },

    /**
     * 网页的标题
     * @param catId
     * @param item
     * @returns {{}}
     */
    getSEO: function(catId, item){
        var o = {};
        var categoryList = CONST.CATEGORY_LIST, categoryMap = CONST.CATEGORY_MAP;
        var categoryId = catId;

        var title = '叮当街 - 时尚女装搭配,时尚女装图片,时尚女装品牌,时尚女装新款',
            keyword = '叮当街,时尚女装,时尚女装搭配,时尚女装图片,时尚女装品牌,时尚女装搭配技巧,时尚女装新款,韩版女装,韩版女装品牌,韩版女装大码,韩版时尚女装,韩版时尚女装品牌,韩版时尚女装图片',
            desc = '叮当街每天为您精选各类时尚女装品牌，追逐最新、最潮的时尚女装新款，与百万网友分享自己的时尚女装搭配心得，发现潮流精品。';

        //var kd = "时尚女装,女性购物,购物分享社区,导购,女性购物网站,导购达人,搭配达人,叮当街",
        //    desc = '数十位网购达人每天为您精选款式优美、质量上乘、价格合理的时尚女装、鞋子、包包等潮流商品。在这里分享购物乐趣，发现时尚精品。';

        if(categoryId == "home" || categoryId == 'none'){
            //首页
            o.title = title;
            o.keywords = keyword;
            o.desc = desc;
            return o;
        }else if(categoryId == "album"){
            //专辑页面
            o.title = '【多图】{n}：{n}搭配和{n}图片 - 叮当街-时尚女装搭配分享社区'.replace(/{n}/gi, item.name);
            o.keywords = '{n},{n}搭配,{n}图片'.replace(/{n}/gi, item.name);
            o.desc = item.description || '叮当街为您推荐{n}搭配以及{n}的时尚图片，和网购达人一起分享{n}的搭配心得。'.replace(/{n}/gi, item.name);
            return o;
        }else if(categoryId == ""){
            //其它页面，带标题的页面
            o.title = item.name + ' - 叮当街-时尚女装搭配分享社区';
            o.keywords = keyword;
            o.desc = item.description || desc;
            return o;
        }else{
            //一级、二级、三级分类
            var oneObj, keywords;
            console.log('util getSEO start');
            console.log('categoryId:' + categoryId);
            categoryList.forEach(function(one){
                console.log(categoryMap[categoryId]);
                if(one.self._id == categoryMap[categoryId].oneId){
                    oneObj = one.self;
                    return;
                }
            });
            var name = categoryMap[categoryId].name;
            o.title = '{n}：{n}搭配_{n}图片 - 叮当街-时尚女装搭配分享社区'.replace(/{n}/gi, name);
            //o.keywords = oneObj.SEO_keywords;
            o.keywords = '{n},{n}搭配,{n}图片'.replace(/{n}/gi, name);
            var desc = '欢迎访问叮当街n频道，这里有网购达人们精心挑选的最热2014新款时尚n，发现当季最潮n和最佳n搭配心得。';
            o.desc = desc.replace(/n/g, name);
        }
        return o;
    }
})
