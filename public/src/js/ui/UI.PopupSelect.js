/**
 * Package: App
 * Class: UI.PopupSelect.js
 * @description:
 * @author: Allen.xu
 * @date: 2013-08-12 下午3:17
 * @lastUpdate: 2013-08-15 下午3:17
 */
(function(D){
    D.ns("UI");

    var O = D.create();

    UI.PopupSelect = O;

    D.extend( UI.Popup, O , {
        init: function(o){
            var w = this;

            O.__super__.init.call(this, o);
        },

        /**
         * override
         * @param data
         */
        initMe: function(o){
            var w = this;

            w.inputs = w.opt.inputs;
            w.inputsObj = {};
            w.textDom = w.el.find(".j-pop-txt");
            w.form = w.el.parents(".j-form");

            O.__super__.initMe.call(this, o);
        },

        /**
         * override
         */
        initHTML: function(){
            var w = this;

            O.__super__.initHTML.call(this);

            w.buildInput();
        },

        /**
         * override
         */
        initEvent: function(){
            var w = this;

            O.__super__.initEvent.call(this);

            w.initEventMe();
        },

        initEventMe: function(){
            var w = this;

            w.box.find("li").bind("click", function(){
                w.itemClick( $(this) );
            });



        },

        buildInput: function(){
            var w = this;

            var len = w.inputs.length;

            while(len--){
                var o = w.inputs[len];
                var input = $("<input type='text' class='hide J_Popup__input' size='2'/>");
                input.attr({
                    name:o.name,
                    allow:JSON.stringify(o.allow) || '{}'
                });
                w.inputsObj[o.mapper] = input;
                w.el.append(input);
                input.bind(PopupEvent.INITVALUE, function(e, o){
                    //alert(o.val)
                    w.initValue(o.val);
                });
            }
        },

        initValue: function(val){
            var w = this, val = val || w.el.attr("val");

            w.box.find("li").each(function(){
                var self = $(this);

                var v = self.attr("v") || self.text();
                if(v == val){
                    self.addClass("now");

                    w.valueToInput(self.data('json'));
                }else{
                    self.removeClass("now");
                }
            })
        },

        itemClick: function(dom){
            var w = this;

            w.box.find("li").removeClass("now");
            dom.addClass("now");

            w.change({
                text: dom.text(),
                val: dom.attr("v")
            })
        },

        change: function(o){
            var w = this;

            w.valueToInput(o);

            w.el.trigger(PopupEvent.CHANGE, o);

            w.hide();
        },

        valueToInput: function(o){
            var w = this;

            w.textDom && w.textDom.text( o.text );

            for (var obj in o) {
                w.inputsObj[obj] && w.inputsObj[obj].val(o[obj]);
            }
        },

        clear:function(){
            var w = this;

            for (var obj in w.inputsObj) {
                w.inputsObj[obj].val("");
            }

            w.box.find("li").removeClass("now");
            w.textDom.text(w.opt.defaultText || "请选择");

        }
    })
})(Das);