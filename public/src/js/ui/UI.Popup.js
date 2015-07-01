/**
 * Package: ui
 * Class: UI.Popup
 * @description:
 * @author: Allen.xu
 * @date: 2013-08-12 下午1:19
 * @lastUpdate: 2013-08-12 下午1:19
 */
(function(D){
    D.ns("UI");

    var O = D.create();
    O.opt = {
        trigger: "click",
        pos:"left"
    };

    UI.Popup = O;

    D.extend( UI.Base, O , {
        init: function(data){
            var w = this;

            O.__super__.init.call(this, data);
            w.initMe(data);
        },

        initMe: function(data){
            var w = this;

            w.docMouseUpFlag = false;
            w.isShow = false;
            w.trigger = w.el.find(".j-pop-trigger");
            w.box = w.el.find(".j-pop-box");

            if(w.trigger.get(0) == undefined){
                w.trigger = w.el;
            }
            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
            var w = this;
            w.box.css("top", w.trigger.outerHeight(true) );
            if(w.opt.pos == "right"){
                w.box.css({right:0, left: "auto"})
            }
        },

        initEvent: function(){
            var w = this;

            if(w.opt.trigger == "click"){
                w.trigger.bind("click", function(){
                    w.isShow ? w.hide() : w.show();
                });
            }

            if(w.opt.trigger == "hover"){
                w.el.hover(function(){
                    w.show()
                }, function(){
                    w.hide()
                });
            }
        },

        show: function(){
            var w = this;

            w.box.show();
            w.isShow = true;
            if(w.opt.trigger == "click"){
                if(!w.docMouseUpFlag){
                    $(document.body).mouseup( $.proxy(w.docMouseUp, w) );
                }
                w.docMouseUpFlag = true;
            }
        },

        hide: function(){
            var w = this;

            w.box.hide();
            w.isShow = false;
        },

        docMouseUp: function(e){
            var w = this;

            if(!w.isShow) return;

            if(!$.contains(w.el.get(0), e.target)){
                w.hide();
            }
        }
    })
})(Das);
