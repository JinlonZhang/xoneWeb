/**
 * Created by allen on 14-8-18.
 */


(function(X){

    X.ns("User.AddToAlbum");

    X.apply(User.AddToAlbum, {

        flag: false,

        url: {
            albumList: '/api/album'
        },

        init: function(o){
            var w = this;

            w.userId = o.userId;
            w.itemId = o.itemId;
            w.imgSrc = o.imgSrc;
            w.win = null;

            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
            var w = this;

            if(w.win){
                w.win.open();
            }else{
                var win = new UI.Window({
                    id: 'addToAlbum',
                    opt: {
                        w: 560,
                        h: 240
                    }
                });
                win.open( $('#addToAlbum') );
                w.win = win;
            }

            $('#IA-img').attr('src', w.imgSrc);
            $('#IA-item').val(w.itemId);

            if(!w.flag){
                w.Message = new UI.Message({
                    type: 'ok'
                });

                $('#IA-form').bind('submit', function(){
                    w.formSubmit( $(this) );
                    return false;
                });

                w.initAlbum();

                w.flag = true;
            }
        },

        initEvent: function(){
            var w = this;


        },

        initAlbum: function(){
            var w = this;

            $.ajax({
                type: 'get',
                url: w.url.albumList,
                dataType: 'json',
                success: function(o){
                    if(o.code == 0){
                        w.buildAlbum(o.list);
                    }
                }
            })
        },

        buildAlbum: function(list){
            var w = this, sel = $('#IA-album');

            if(list.length == 0){
                list = [{name: '默认专辑', _id: '0'}];
            }
            sel.empty();
            for(var i=0;i<list.length; i++){
                var t = $('<option></option>');
                t.text(list[i].name).val(list[i]._id);

                sel.append(t);
            }
        },

        formSubmit: function(dom){
            var w = this, url = dom.attr('action'), data = dom.serialize();

            $.ajax({
                type: 'post',
                dataType: 'json',
                url: url,
                data: data,
                success: function(d){
                    if(d.code == 0){
                        w.win.close();
                        w.Message.setType('ok');
                        w.Message.setText('收入专辑成功。');
                        w.Message.show();
                    }else{
                        w.win.close();
                        w.Message.setType('info');
                        w.Message.setText('专辑中已经有这个宝贝了。');
                        w.Message.show({
                            opt: {
                                timeout: 2000
                            }
                        });
                    }
                }
            })
        }

    });

})(Xone);