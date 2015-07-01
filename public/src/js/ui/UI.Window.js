/**
 * Package: ui
 * Class: UI.win.css
 * @description: 弹出窗口控件
 * @author: Zhen.li
 * @Date: 13-8-10 上午9:04
 */

(function(X){
    X.ns("UI.Window");

    var O = X.create();

    O.opt = {
        title: "对话框",
        h: 260,
        w: 500,
        showHead: 0,
        showClose: 1,
        showMask: 1,
        showBtn: 0,
        cls:''
    }

    UI.Window = O;

    X.extend( UI.Base, O , {
        init: function(data){
            var w = this;

            O.__super__.init.call(this, data);
            w.initMe(data);
        },

        initMe: function(data){
            var w = this;

            w.id = data.id;
            w.mid = "win_mask";
            w.wid = "win_" + w.id || 'win';

            w.render();
            w.initEvent();
        },

        render: function(){
            var w = this;

            w.buildEl();
            w.buildContent();

            w.opt.showMask == 1 ? w.buildMask() : null;
            w.opt.showClose == 1 ? w.buildClose() : null;
            w.opt.showHead == 1 ? w.buildHead() : null;


        },

        buildEl: function(){
            var w = this;

            //w.el = $("#" + w.wid);

            //if(w.el.get(0) == undefined){
                var html = [
                    '<div class="u-win" id="' + w.wid + '">',
                    '</div>'
                ];
                w.el = $(html.join(""));
            //}
            w.el.css({
                height:w.opt.h,
                width:w.opt.w
            }).hide();

            $(document.body).append(w.el);
        },

        buildClose: function(){
            var w = this;

            var close = $('<a class="ico ico-close u-win-close j-Win-close" href="javascript://"></a>')

            w.closeBtn = close;
            w.closeBtn.bind("click",function(e){
                w.close();
            })
            w.el.append(close);
        },

        buildHead: function(){
            var w = this;

            var html = [
                '<div class="u-win-head">',
                '</div>'
            ];

            w.headEl = $(html.join(""));
            w.el.append(w.headEl);

            w.setTitle();
        },

        buildContent: function(){
            var w = this;

            w.content = $('<div class="u-win-cont j-win-cont"></div>');
            w.el.append(w.content);

        },
        initEvent: function(){
            var w = this;

            /*w.closebtnEl.bind("click",function(e){
             w.close();
             })

             w.headEl.bind("mousedown",function(e){
             //w.start(event);
             })

             w.closebtnEl.bind("mousedown",function(e){
             event.stopPropagation();
             return false;
             })*/

            $(document).bind("keydown",function(event){
                if(event.keyCode == 27){
                    w.close();
                }
            })
        },

        /**
         * 设置标题
         * @param str
         */
        setTitle: function(str){
            var w = this, s = str || w.opt.title;

            w.headEl.html(s);
        },

        /**
         * 设置内容
         * @param obj
         */
        setContent: function(obj){
            var w = this;

            w.content.empty().append(obj);
            obj.find('.j-Win-close').bind('click', function(){
                w.close();
            })
        },

        setPosition: function(){
            var w = this,top = ($(window).height() - w.el.height()) / 2;

            w.el.css({
                "top": top+$(document).scrollTop(),
                "margin-left": - w.opt.w / 2
            });
        },

        /**
         * 打开
         */
        open:function(dom){
            var w = this;

            if(dom){
                w.setContent(dom);
            }
            w.setPosition();
            w.mask.show().height( document.body.scrollHeight );
            w.el.show();
        },

        /**
         * 关闭
         */
        close:function(){
            var w = this;

            w.mask.hide();
            w.el.hide();

            w.el.trigger(WinEvent.CLOSE);
        },

        /**
         * 背后的蒙版
         */
        buildMask: function(){
            var w = this;

            w.mask = $("#" + w.mid);
            if(w.mask.get(0) == undefined){
                w.mask = $("<div class='u-win-mask'></div>");
                w.mask.attr("id", w.mid).hide();
                $(document.body).append(w.mask);
            }
        },

        getEl: function(){
            return this.el;
        }
    })
})(Das);