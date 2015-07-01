/**
 * Created by allenxu on 13-11-2.
 */

(function (D) {
    D.ns("app.common");

    D.apply(app.common, {

        init: function(){
            var w = this;

            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
            var w = this;


            w.Message = new UI.Message({});
        },

        initEvent: function () {
            var w = this;

        },

        ajaxCallBack: function (o, f) {
            var w = this, opt = f.data('opt');
            if(o.code == 0){
                if(opt.hideText && opt.hideText == 1){
                    opt.fn && opt.fn(o, f);
                }else{
                    w.Message.setText(opt.text);
                    w.Message.show({param: o, opt: opt});
                }
            }else{
                var m = $('#msg');
                if(m.get(0)){
                    m.text(o.msg).show();
                }else{
                    alert(o.msg);
                }
            }

        }

    })
})(Das);