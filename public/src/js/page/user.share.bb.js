/**
 * 发布宝贝
 * Created by allen on 14-9-6.
 */

(function(X){

    X.ns("User.Share.BB");

    X.apply(User.Share.BB, {

        url: {
            albumList: '/api/album'
        },

        init: function(o){
            var w = this;

            w.win = null;

            w.el = $('#SI');
            w.btn = $('.j-shareBB');
            w.formLink = $('#SI_link');
            w.formSubmit = $('#SI_submit');

            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
            var w = this;

            w.formLink.data('opt', {
                hideText: 1,
                beforeFn: function(){
                    w.Loading.setText('正在获取宝贝信息。。。');
                    w.Loading.open();
                },
                fn: function(d){
                    w.Loading.close();
                    $('#SI_s1').hide();
                    $('#SI_s2').show();
                    w.buildInfo(d);
                    w.win.setPosition();
                }
            });

            w.formSubmit.data('opt', {
                hideText: 1,
                beforeFn: function(){
                    w.Loading.open();
                },
                fn: function(d){
                    w.Loading.close();
                    w.win.close();
                    w.Message.show({
                        timeout: 3000
                    })
                }
            })
        },

        initEvent: function(){
            var w = this;

            w.btn.click(function(){
                if(w.win){
                    w.win.open();
                }else{
                    var win = new UI.Window({
                        id: 'share',
                        opt: {
                            w: 560,
                            h: 'auto'
                        }
                    });
                    win.open( $('#SI') );
                    w.win = win;
                    w.initAlbum();

                    w.win.on(WinEvent.CLOSE, function(){
                        $('#SI_s1').show();
                        $('#SI_s2').hide();
                        w.clearInfo();
                    })

                    w.Loading = new UI.Loading({
                        pel: win.getEl()
                    });

                    w.Message = new UI.Message({
                        opt: {
                            type: 'ok'
                        }
                    });
                    w.Message.setText('保存成功');
                }

                $('#SI_url').focus();
            });


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
            var w = this, sel = $('#SI_album');

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

        buildInfo: function(d){
            var w = this;

            $('#SI_name').text(d.name);
            w.el.find('[name="itemId"]').val(d.itemId);
            w.el.find('[name="name"]').val(d.name);
            w.el.find('[name="href"]').val(d.href);
            w.el.find('[name="price"]').val(d.price);

            for(var i=0;i< d.imgList.length; i++){
                if(i>=8) return;
                var li = $('<li></li>'), img = new Image(), input = $('<input type="hidden" name="img" />');
                img.src = d.imgList[i].url;
                input.val(img.src);
                li.append(img).append(input);
                $('#SI_img').append(li);
            }

        },

        clearInfo: function(){
            var w = this;

            $('#SI_url').val('');
            $('#SI_name').text('');
            w.el.find('[name="itemId"]').val('');
            w.el.find('[name="name"]').val('');
            w.el.find('[name="href"]').val('');
            w.el.find('[name="price"]').val('');
            $('#SI_img').empty();
        }

    });

})(Xone);