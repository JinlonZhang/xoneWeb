/**
 * Package: UI
 * @description: ajax上传文件控件
 * @author: allen.xu
 * @Date: 2013-12-18 14:18
 */

(function(D){
    D.ns("UI.AjaxUpload");

    var O = D.create();

    O.opt = {

    }

    UI.AjaxUpload = O;

    D.extend( UI.Base, O , {
        init: function(data){
            var w = this;

            O.__super__.init.call(this, data);
            w.initMe(data);
        },

        initMe: function(data){
            var w = this;

            w.id = data.id || "";
            w.name = 'ajax_' + w.id;
            w.success = data.success;

            w.el.attr('target', w.name);

            w.render();
            w.initEvent();
        },

        render: function(){
            var w = this;

            w.buildIframe();
        },

        buildIframe: function(){
            var w = this;

            var iframe = $('iframe[name="'+w.name+'"]');
            if(iframe.get(0) == undefined){
                iframe = $('<iframe class="hide" name="'+w.name+'"></iframe>');
                $(document.body).append(iframe);
            }

            w.iframe = iframe;
        },


        initEvent: function(){
            var w = this;

            w.iframe.bind('load', function(){
                var body = this.contentWindow.document.body;
                if($(body).text() !='' ){
                    var o = JSON.parse( $(body).text() || "{}");
                    w.success && w.success(o, w.el);
                }

            })
        }


    })
})(Das);