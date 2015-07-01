/**
 * Created by allenxu on 2013-11-30.
 * 保存成功的提示信息。
 */

(function(){
    _.ns('UI');

    var O = _.create();

    O.opt = {
        cls: 'u-msg',
        type: 'ok',
        text: '保存成功',
        autoHide: true
    }

    UI.Message = O;

    _.extend(UI.Base, O, {

        type: {
            'ok': '<i class="ico ico-ok ico-c-orange ico-18"></i>',
            'load': '<i class="ico ico-spinner ico-spin ico-c-orange ico-18"></i>',
            'info': '<i class="ico ico-info ico-c-orange ico-18"></i>'
        },

        init: function(o){
            var w = this;

            O.__super__.init.call(this, o);

            w.initHTML();
        },

        initHTML: function(){
            var w = this;

            w.buildEl();
        },

        buildEl: function(){
            var w = this;

            var t = $('.u-msg');
            if(t.get(0)){
                w.el = t;
            }else{
                w.el = $('<div></div>');
                w.el.addClass(w.opt.cls);
                $(document.body).append(w.el);
            }
            w.hide();
        },

        setText: function(str){
            var w = this;

            w.el.html(w.type[w.opt.type] + (str || w.opt.text));
        },

        setType: function(str){
            var w = this;

            w.opt.type = str;
        },

        setTimeout: function(n){
            var w = this;

            w.opt.timeout = n;
        },

        show: function(o){
            var w = this, opt = o && o.opt || {}, param = o && o.param || {}, timeout = opt.timeout || 1000;

            w.el.show();
            if(opt.autoHide == false || opt.autoHide == undefined){
                window.setTimeout(function(){
                    w.hide();
                    opt.fn && opt.fn(param);
                }, timeout);
            }else{
                opt.fn && opt.fn(param);
            }
        },

        hide: function(){
            var w = this;

            w.el.hide();
        }
    });
})();