/**
 * 载入中、正在保存。后台需要一定时间来处理的ajax请求，可以用这个控件在界面上友好的显示等待的提示语言
 * Created by allen on 14-9-8.
 */

(function(X){

    X.ns("UI.Loading");

    var O = X.create();

    O.opt = {
        id: 'UI_LD'
    }

    UI.Loading = O;

    X.extend( UI.Base, O , {

        init: function(data){
            var w = this;

            O.__super__.init.call(this, data);
            w.initMe(data);
        },

        initMe: function(d){
            var w = this;

            w.pel = d.pel;
            w.id = d.id || w.opt.id;
            w.maskId = w.id + '_MK';

            w.el = $('#U_LD');
            w.textEl = w.el.find('.j-ld-text');
            w.maskEl = w.el.find('.j-ld-mask');

            w.initHTML();
        },

        initHTML: function(){
            var w = this;


        },

        initEvent: function(){
            var w = this;

        },

        open: function(){
            var w = this;

            w.setPosition();
            w.el.show();
        },

        close: function(){
            var w = this;

            w.el.hide();
        },

        setPosition: function(){
            var w = this, of = w.pel.offset();

            w.el.css({
                top: of.top,
                left: of.left,
                width: w.pel.width(),
                height: w.pel.height()
            });
        },

        setText: function(s){
            var w = this;

            w.textEl.text(s);
        },

        setPel: function(p){
            var w = this;

            w.pel = p;
        }

    });

})(Xone);