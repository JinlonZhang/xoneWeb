/**
 * Created by allenxu on 13-11-23.
 */
var page = {

    previewDom: [
        {id: '#preview180', size: 180},
        {id: '#preview100', size: 100},
        {id: '#preview50', size: 50}
    ],

    coe: 1,
    cropCoe: 1,

    init: function(o){
        var w = this;

        w.ajaxIframe = $('#ajaxIframe');
        w.wrap = $("#jcrop-wrap");

        $('.j-form').data('opt', {
            fn: function(){
                window.location.reload(true);
            }
        })

        w.initEvent();
    },

    initEvent: function(){
        var w = this, f = 0;

        w.ajaxIframe.load(function(){
            var doc = this.contentWindow.document;
            var json = JSON.parse($(doc.body).text());
            w.size = json.size;

            $('#jcrop').find('img').each(function(){
                var s = $(this);
                s.attr('src', '/avatar/raw?' + Math.round(new Date().getTime()) )
            });
            w.initImg();

            w.jcrop_api && w.jcrop_api.setImage($('#target').attr('src'));

            w.initJcrop();

            //w.jcrop_api && w.jcrop_api.destroy();

        });


    },

    initImg:function(){
        var w = this, t, r = w.size.width / w.size.height;

        if(r >= 1){
            t = w.size.width;

            $('#target').css({
                width: '100%',
                height: 'auto'
            })
        }else{
            t = w.size.height;

            $("#target").css({
                width: 'auto',
                height: '100%'
            })
        }
        w.coe = 400/ t;
        w.cropCoe = t / 400;

    },
    initJcrop: function(){
        var w = this;

        $('#target').Jcrop({
            minSize: [50, 50],
            aspectRatio: 1 / 1,
            setSelect: [ 200, 200, 0, 0 ],
            drawBorders: true,
            onSelect: function(c){w.Jcrop(c)},
            onChange: function(c){w.Jcrop(c)}
        },function(){

            // Store the API in the jcrop_api variable
            w.jcrop_api = this;
        });
    },

    Jcrop: function(c){
        var w = this;

        w.c = c;

        w.showPreview();
        w.setData(c);
    },

    showPreview: function(){
        var w = this, c = w.c;

        $(w.previewDom).each(function(){
            var o = {
                rx : this.size / c.w,
                ry : this.size / c.h
            };
            $(this.id).css({
                width: Math.round(o.rx * w.size.width * w.coe) + 'px',
                height: Math.round(o.ry * w.size.height * w.coe) + 'px',
                marginLeft: '-' + Math.round(o.rx * c.x) + 'px',
                marginTop: '-' + Math.round(o.ry * c.y) + 'px'
            })
        });
    },

    setData: function(){
        var w = this, c = w.c;

        $('#w').val(c.w);
        $('#h').val(c.h);
        $('#x1').val(c.x);
        $('#y1').val(c.y);
        $('#cropCoe').val(w.cropCoe);
    }
}
