/**
 * CONST下面的变量全部存放在内存中。一次性从数据库中取出。
 * 如果数据库中有变动，可以由/controller/site.api手动更新。
 * Created by allen on 14-6-7.
 */

var _ = require('underscore');

var mod = {};
module.exports = mod;

_.extend(mod, {

    /**
     * 分类的map对照表。
     * {_id: {oneId, name}}
     */
    CATEGORY_MAP: {},

    /**
     * 分类的url map对照表
     * {urlName: _id}
     */
    CATEGORY_URL_MAP: {},

    /**
     * 分类列表，树形结构。由init.js在项目启动的时候，一次性取出放到内存中。
     */
    CATEGORY_LIST: [],

    /**
     * 每个小分类最新的宝贝信息。用于首页显示。每天凌晨3点的时候会更新
     * {分类ID：宝贝}
     */
    CATEGORY_ITEM: {},

    /**
     * 首页的推荐宝贝。每天凌晨3点的时候会更新
     */
    RECOMMEND_HOME: [],

    /**
     * 每个大类下面点击数最高的宝贝。每天凌晨3点的时候会更新
     * {分类ID：宝贝列表}
     */
    HOT_ITEM: {},

    /**
     * 广告：首页大图广告；首页小图广告；
     */
    ADVERT: {
        HOME: [],
        HOME_SMALL: []
    },

    /**
     * 首页的专辑
     */
    ALBUM_LIST: [],

    /**
     * 首页热门专辑
     */
    ALBUM_LIST_HOT: []
})