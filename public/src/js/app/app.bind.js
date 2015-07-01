/**
 * 通用dom绑定事件
 * allenxu on 2013-10-23.
 */

(function (D) {
    D.ns("app.bind");

    D.apply(app.bind, {

        url: {
            follow: '/api/follow',
            addToAlbum: '/api/itemToAlbum'
        },

        init: function(data) {
            var w = this;

            w.sessionUserId = data.sessionUserId;

            w.form = $('.j-form');
            w.uploadForm = $('.j-uploadForm');

            w.action = $('.j-action');
            w.pop = $('.j-pop');

            w.addToAlbum = $('.j-addToAlbum');
            w.love = $('.j-love');
            w.follow = $('.j-follow');

            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
            var w = this;

            //动作按钮
            /*w.action.each(function(){
                w.initDomOpt( $(this) );
            });*/

            //表单
            w.form.each(function(){
                w.initDomOpt( $(this) );

                new UI.FormValidator({
                    el: $(this)
                })
            })

            //上传表单
            w.uploadForm.each(function(){
                w.initDomOpt( $(this) );

                new UI.FormValidator({
                    el: $(this)
                })
            })

            //下拉框 popup
            w.pop.each(function(){
                new UI.Popup({
                    el: $(this)
                })
            });

            //上传图片
            w.uploadForm.each(function(){
                new UI.AjaxUpload({
                    el: $(this),
                    success: function(o, dom){
                        app.common.ajaxCallBack(o, dom);
                    }
                })
            })

            //返回顶部
            $('#top').hide();
        },

        initDomOpt: function(dom){
            var w = this;
            var defaultOpt = {
                fn: function(){
                    window.location.reload(true)
                }
            }
            var f = dom, opt = f.data('opt') || {}, optStr = f.attr('opt') || "{}";
            f.data('opt',
                $.extend(
                    true,
                    {},
                    defaultOpt,
                    opt,
                    JSON.parse( optStr )
                ));
        },

        initEvent: function() {
            var w = this;

            //表单提交
            w.form.submit(function(){
                w.formSubmit( $(this) );
                return false;
            });
            w.form.each(function(){
                var f = $(this);
                f.find('.j-submit').click(function(){
                    w.formSubmit(f);
                });
            });

            w.action.bind('click', function(){
                w.actionClick( $(this) );
                return false;
            });

            //滚动
            $(window).bind('scroll', D.throttle(function(){
                var x = $(document).scrollTop();

                w.loadImg(x);
                w.showTopBtn(x);
                w.fixedNav(x);
            }, 5));

            $('#top').click(function(){
                $(window).scrollTop(0);
            });

            //喜欢
            w.love.bind('click', function(){
                w.loveClick( $(this) );
                return false;
            });

            //关注
            w.follow.bind('click', function(){
                w.followClick( $(this) );
                return false;
            });

            //添加到专辑
            w.addToAlbum.bind('click', function(){
                w.addToAlbumClick( $(this) )
            });

            //QQ登录
            $('.j-qqLogin').click(function(){
                window.open( '/oauth/qq','newwindow','height=450px,width=600px,top=100,left=300,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no' )
            });

            //微博登录
            $('.j-wbLogin').click(function(){
                window.open( '/oauth/wb','newwindow','height=500px,width=800px,top=100,left=300,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no' )
            })
        },

        /**
         * 如果已经登录，直接调用回调函数。
         * 如果没登录，弹出登录对话框。
         * @param fn
         */
        needLogin: function(fn){
            var w = this;

            if(w.sessionUserId == 'undefined'){
                if(w.loginWin){
                    w.loginWin.open();
                }else{
                    w.loginWin = new UI.Window({
                        opt: {
                            w: 600,
                            h: 280
                        }
                    });
                    w.loginWin.open( $('#login') );
                }
            }else{
                fn();
            }
        },

        /**
         * 喜欢
         * @param dom
         */
        loveClick: function(dom){
            var w = this, id = dom.attr('_id'), url = dom.attr('_url');

            w.needLogin(function(){
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: url,
                    data: {id: id},
                    success: function(d){

                        if(d.code == 0){
                            dom.find(".j-loveNum").text('(' + d.total + ')');
                        }else{
                            w.Message = w.Message || new UI.Message({opt: {type: 'info'}});
                            w.Message.setText(d.msg);
                            w.Message.show({
                                opt: {timeout: 1500}
                            });
                        }

                    }
                })
            });
        },

        /**
         * 关注
         * @param dom
         */
        followClick: function(dom){
            var w = this, host_id = dom.attr('_id');

            w.needLogin(function(){
                $.ajax({
                    type: 'post',
                    url: w.url.follow,
                    dataType: 'json',
                    data: {host_id: host_id},
                    success: function(d){
                        if(d.code == 0){
                            if(d.isFollow){
                                dom.removeClass('u-b-orange').addClass('u-b-white').html('<i class="ico ico-check ico-mini"></i>已关注')
                            }else{
                                dom.removeClass('u-b-white').addClass('u-b-orange').html('<i class="ico ico-plus2 ico-c-white ico-mini"></i>关注');
                            }
                        }else{
                            w.Message = w.Message || new UI.Message({});
                            w.Message.setType('info');
                            w.Message.setText(d.msg);
                            w.Message.show({
                                opt: {timeout: 1500}
                            });
                        }
                    }
                })
            })
        },

        /**
         * 加入专辑
         * @param dom
         */
        addToAlbumClick: function(dom){
            var w = this, itemId = dom.attr('_id'), src = dom.attr('_src');

            w.needLogin(function(){
                User.AddToAlbum.init({
                    userId: w.sessionUserId,
                    itemId: itemId,
                    imgSrc: src
                });
            });
        },

        formSubmit: function(f){
            var w = this, opt = f.data('opt');

            if(opt.beforeFn){
                opt.beforeFn();
            }

            f.trigger(FormValidatorEvent.SUBMIT, function(){
                $.ajax({
                    url: f.attr('action'),
                    type: f.attr('method'),
                    dataType: 'json',
                    data: f.serialize(),
                    success: function(o){
                        app.common.ajaxCallBack(o, f);
                    }
                })
            })
        },

        actionClick: function(dom){
            var w = this, url = dom.attr('_url'), opt = dom.data('opt'), postData = opt.postData || {};

            var fn = function(){
                $.ajax({
                    type: opt.type,
                    url: url,
                    dataType: 'json',
                    data: postData,
                    success: function(o){
                        app.common.ajaxCallBack(o, dom);
                    }
                })
            }

            if(opt.confirm){
                if(window.confirm(opt.confirm)){fn()};
            }else{
                fn();
            }

        },

        /**
         * 显示返回顶部按钮
         * @param x
         */
        showTopBtn: function(x){
            var w = this, btn = $('#top');

            if(x > 100){
                btn.fadeIn(500);
            }else{
                btn.fadeOut(500);
            }
        },

        /**
         * 延迟载入图片
         * @param x
         */
        loadImg: function(x){
            var w = this, height = $(window).height();

            var img = $('.j-delayImg');

            img.each(function(i){
                var top = $(this).offset().top;
                if((x + height) > top){
                    $(this).attr('src',$(this).attr('_src'));
                }
            })
        },

        /**
         * 头部菜单固定
         * @param x
         */
        fixedNav: function(x){
            var w = this, hd = $('#G_hd'), nav = $('#G_nav');

            if(x > 120){
                hd.addClass('g-hd-fix');
                nav.addClass('g-nav-fix');
            }else{
                hd.removeClass('g-hd-fix');
                nav.removeClass('g-nav-fix');
            }
        }

    })
})(Das);