/**
 * 分享照片，搭配照，晒货照
 * Created by allen on 14-7-16.
 */

(function(X){

    X.ns("User.Share");

    X.apply(User.Share, {

        num: 0,

        url: {
            linkInfo: '/api/share/linkInfo',
            albumList: '/api/album'
        },

        init: function(o){
            var w = this;

            w.win = null;
            w.html = '';

            w.btn = $('.j-share');
            w.imgHide = $('#imgHide');
            w.el = $('#share');
            w.bd = w.el.find('.j-shareBd');

            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
            var w = this;

            w.html = [
                '<div class="share-img-fm">',
                    '<form action="/api/uploadShare" method="post" enctype="multipart/form-data">',
                        '<input type="file" class="file" name="img" hidefocus="true"/>',
                        '<a href="javascript://" class="link ico ico-plus" title="上传图片"></a>',
                    '</form>',
                '</div>'
            ];

            w.linkHtml = [
                '<li>',
                    '<a href="#" class="ch-ells a-lk" target="_blank"></a>',
                    '<button class="u-btn u-b-mini u-b-white"><i class="ico ico-remove ico-mini"></i>删除</button>',
                '</li>'
            ]

            w.Message = new UI.Message({
                type: 'load',
                opt: {
                    autoHide: false
                }
            });
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
                    win.open( $('#share') );
                    w.win = win;
                    w.buildForm();
                }
                w.el.find('#shType').val( $(this).attr('_t') )
                w.initAlbum();
            });

            $('#selectAlbumId').change(function(){
                w.albumChange();
            });

            $('#sh_addLink').click(function(){
                w.getLinkInfo();
            })
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
            var w = this, sel = $('#selectAlbumId');

            if(list.length == 0){
                list = [{name: '默认专辑', _id: '0'}];
            }
            sel.empty();
            for(var i=0;i<list.length; i++){
                var t = $('<option></option>');
                t.text(list[i].name).val(list[i]._id);

                sel.append(t);
            }
            w.albumChange();
        },

        getLinkInfo: function(){
            var w = this, lk = $('#sh_link'), url = $.trim( lk.val()), btn = $('#sh_addLink');

            if(url == ""){
                lk.focus();
                return;
            }

            btn.attr('disabled', true);

            $.ajax({
                type: 'post',
                url: w.url.linkInfo,
                data: {url: url},
                success: function(data){

                    if(data.code == 0){
                        w.buildLink(data);
                    }
                    btn.removeAttr('disabled');
                }
            })
        },

        buildLink: function(o){
            var w = this;

            var li = $( w.linkHtml.join('') );

            li.find('a').attr('href', o.href).text(o.name);
            $('#shLinkAppend').append(li);
            $('#sh_link').val("");
            w.buildInput('item', li, o);
            li.find('button').click(function(){
                li.data('input').remove();
                li.remove();
            })
        },

        albumChange: function(){
            var w = this, val = $('#selectAlbumId').find(':selected').val();

            $('#albumId').val(val);
        },

        buildForm: function(){
            var w = this;

            if(w.num >= 8){ return; }
            w.num++;

            var fm = $(w.html.join(''));

            fm.find('[type="file"]').change(function(){
                w.Message.setText('正在上传');
                w.Message.show({});
                fm.find('form').submit();
            });

            new UI.AjaxUpload({
                id: 's' + w.num,
                el: fm.find('form'),
                success: function(o, dom){
                    w.buildImg(fm, o);
                    w.buildInput('img', fm, o);
                    w.buildClose(fm);
                    w.buildForm();
                    w.Message.hide()
                }
            });
            w.bd.append(fm);

        },

        buildImg: function(dom, o){
            var w = this;

            var img = $('<img />');
            img.attr('src', o.url + '!100x100');

            dom.empty().append(img);
        },

        buildInput: function(name, fm, o){
            var w = this;

            var it = $('<input name="' + name + '" />');
            delete o.code;
            it.val( JSON.stringify(o) );
            fm.data('input', it);

            w.imgHide.append(it);
        },

        buildClose: function(fm){
            var w = this;

            var close = $('<a class="ico ico-close close" href="javascript://"></a>');
            fm.append(close);
            close.bind('click', function(){
                fm.data('input').remove();
                fm.remove();
                w.num--;
            });
        }

    });

})(Xone);