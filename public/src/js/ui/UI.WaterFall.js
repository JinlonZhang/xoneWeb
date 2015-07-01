/**
 * Package: ui
 * Class: UI.WaterFall
 * @description: 瀑布流控件
 * @author: allen
 * @Date: 2014-06-17
 */

(function(D){
    D.ns("UI");

    var O = Das.create()

    UI.WaterFall = O;

    D.extend( UI.Base, O , {

        init: function(data){
            var w = this;
            O.__super__.init(data);

            w.num = 0;
            w.cols = [];

            w.panelFix = w.el.find('.j-panel-fix');

            w.buildFall();
            w.initEvent();
        },

        initEvent: function(){
            var w = this;


        },

        buildFall:function(pls){
            var w = this, elWidth = w.el.width();
            var panel = pls || w.el.find('.j-panel'), panelWidth = panel.width();
            if(panel.size() == 0){ return; }
            w.num = parseInt(elWidth/panelWidth);

            for(var i = 0;i < w.num; i++){
                var oldCol = w.cols[i];
                if(oldCol){
                    w.cols[i]={index: i, height: oldCol.height, count: oldCol.count}
                }else{
                    w.cols[i]={index: i, height: 0, count: 0}
                }

            }
            if(w.panelFix.size() != 0){
                w.panelFix.css({
                    top: 0,
                    left: (panelWidth + 20) * 3
                });
                w.cols[3].height = w.panelFix.height() + 20;
                w.cols[3].count++;
            }
            panel.each(function(i){
                var self = $(this), p = w.getMin(), o = w.cols[p.index];

                self.css({
                    top: o.height,
                    left: (panelWidth + 20) * p.index
                })

                o.height += (self.height() + 20);
                o.count++;
            });
            w.el.css('height', w.getMax().height );
        },

        getMin: function(){
            var w = this, p = w.cols[0];

            for(var i = 1;i< w.cols.length;i++){
                if(w.cols[i].height < p.height){
                    p = w.cols[i]
                }
            }
            return p;
        },

        getMax: function(){
            var w = this, p = w.cols[0];

            for(var i = 1;i< w.cols.length;i++){
                if(w.cols[i].height > p.height){
                    p = w.cols[i];
                }
            }
            return p;
        },

        resize:function(){
            var w = this;

            w.build();
        }
    });
})(Das);