/**
 * Package: UI
 * Class: UI.Base.js
 * @description:
 * @author: Allen.xu
 * @date: 2013-04-01 上午10:48
 * @lastUpdate: 2013-04-01 上午10:48
 */

(function(D){
    D.ns("UI");

    var O = D.create();

    O.opt = {
        ns: "Base"
    };

    UI.Base = O;

    D.apply( O.prototype , {
        init: function(data){
            var w = this;

            w.el = data && data.el;

            var opt = w.constructor.opt, sup = w.constructor.__super__;
            while(sup){
                opt = $.extend({}, sup.constructor.opt, opt);
                sup = sup.constructor.__super__;
            }

            w.opt = $.extend(
                true,
                {},
                opt || {},
                data.opt || {},
                JSON.parse( (w.el && w.el.attr("opt")) || "{}"),
                w.el && w.el.data("opt") || {}
            );
            Das.log(w.opt);
        },

        setOpt: function(json){
            var w = this;

            w.opt = $.extend(true,{}, w.opt, json);
        },

        on: function(e, fn){
            var w = this;

            e && w.el.bind(e, function(event, data){
                fn(event, data);
            });
        }
    });
})(Das);