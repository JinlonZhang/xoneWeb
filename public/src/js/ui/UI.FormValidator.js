/**
 * Package: UI
 * Class: UI.FormValidator.js
 * @description: 表单验证控件
 * @author: Allen.xu
 * @date: 2013-05-02 下午1:34
 * @lastUpdate: 2013-05-02 下午1:34
 */

/**
 * 用户名不能为空
 * <input type='text' name='a' allow='{"require": 1, "title": "用户名"}' />
 *
 */

(function(D){
    D.ns("UI");

    var O = D.create();
    UI.FormValidator = O;

    O.opt = {
        formEntry: '.u-fm-i'
    }


    D.apply(O, {
        valid: "allow",

        rules: {//验证规则池
            "require": {
                regExp: (/.+/),
                message: "%1不能为空！"
            },
            "int": {
                regExp: function(t){
                    return O.empty.call(this, t, (/^[-\+]?\d+$/));
                },
                message: "%1必须是整数！"
            },
            "intPlus": {
                regExp: function(t){
                    return O.empty.call(this, t, (/^[0-9]*[1-9][0-9]*$/));
                },
                message: "%1必须是正整数！"
            },
            "float": {
                regExp: function(t){
                    return O.empty.call(this, t, (/^[-\+]?\d+(\.\d+)?$/));
                },
                message: "%1必须是浮点数！"
            },
            "floatPlus": {
                regExp: function(t){
                    return O.empty.call(this, t, (/^\d+(\.\d+)?$/));
                },
                message: "%1必须是正浮点数！"
            },
            "email": {
                regExp: function(t){
                    return O.empty.call(this, t, (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/));
                },
                message: "%1格式不正确！"
            },
            "phone": {
                regExp: function(t){
                    return O.empty.call(this, t, (/^1[3|4|5|8][0-9]\d{8}$/));
                },
                message: "%1格式不正确！"
            },
            "min": {
                regExp: function(min){
                    return this.size >= min;
                },
                message: "%1至少选择 %2 个！"
            },
            "length": {
                regExp: function(min, max){
                    return this.val().length >= min && this.val().length <= max;
                },
                message: "%1长度必须 %2 到 %3 位！"
            },
            "maxLength": {
                regExp: function(max){
                    return this.val().length <= max;
                },
                message: "%1长度必须小于 %2 位！"
            },
            "confirm": {
                regExp: function(id){
                    return this.val() == $("#" + id).val();
                },
                message: "%1不一致！"
            },
            "username":{
                regExp: function(t){
                    return this.val().indexOf("@") == -1 ? O.rules.phone.regExp.call(this, t) : O.rules.email.regExp.call(this, t);
                },
                message: "%1不合法！"
            },

            "nickname":{
                regExp: function(t){
                    return O.empty.call(this, t, (/^[a-zA-Z0-9_]+$/));
                },
                message: "%1不合法！只能是英文字符、数字、下划线"
            },
            "least": {
                regExp: function(id){
                    return !(this.val()=="" && $("#" + id).val()=="");
                },
                message: "%1至少填写一项！"
            },
            "size":{
                regExp: function(min, max){
                    return parseInt(this.val()) >= min && parseInt(this.val()) <= max;
                },
                message: "%1必须是 %2 到 %3！"
            },
            "less":{
                regExp: function(id){
                    return parseInt(this.val()) < parseInt($("#" + id).val());
                },
                message: "%1必须是小于%2 "
            },
            "ip":{
                regExp:function(t){
                    return O.empty.call(this, t, (/^((1?\d?\d|(2([0-4]\d|5[0-5]))).){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/));
                },
                message: "%1格式不正确！"
            }
        },

        elementMap: {//表单元素
            INPUT:{
                text: function(dom, rule){ return O.validateDom(dom, rule) },
                password: function(dom, rule){ return O.validateDom(dom, rule) },
                radio: function(dom, rule){
                    var obj = {value: "", size: 0},
                        vData = dom.data("validator");

                    for (var i = 0; i < vData.length; i++) {
                        var v = vData[i];
                        if(v.checked){
                            obj.size++;
                            obj.value += v.value + ",";
                        }
                    }

                    return O.validateDom(dom, rule, obj);
                },
                checkbox: function(dom, rule){
                    return O.elementMap.INPUT.radio(dom, rule);
                }
            },
            SELECT: {
                normal: function(dom, rule){ return O.validateDom(dom, rule) }
            },
            TEXTAREA: {
                normal: function(dom, rule){ return O.validateDom(dom, rule) }
            }
        },

        /**
         * 验证每一个表单元素
         * @param dom
         * @param rule
         * @param checkElement
         * @return {Object} {code: 0, obj: {dom:dom, text: ""}}
         */
        validateDom: function(dom, rule, checkElement){
            var w = this;

            var sValue = checkElement ? checkElement.value + "" : dom.val(); //对象的值属性
            var result = {
                code: 0,
                obj: {dom: dom, text: rule.message}
            };
            for (var obj in rule) {
                var currRule = rule[obj];
                var argument = D.typeOf(currRule) == "array" ? currRule : [currRule];

                if(typeof(w.rules[obj]) != "undefined"){

                    if(D.typeOf(w.rules[obj].regExp) == "function"){
                        result.code = w.rules[obj].regExp.apply(checkElement ? checkElement : dom, argument) ? 0 : -1;
                    }else{
                        result.code = w.rules[obj].regExp.test( $.trim(sValue) ) ? 0 : -1;
                    }

                    if(D.typeOf(rule.title) == "object"){
                        result.obj.text = D.String.format(w.rules[obj].message, rule.title[obj]);
                    }else{
                        result.obj.text = D.String.format(w.rules[obj].message, rule.title)
                    }

                    if(result.code == -1){
                        return result;
                    }
                }
            }

            return result;
        },

        addRule: function(s, j){
            this.rules[s] = j;
        },

        empty: function(t, regExp){
            if(this.val() == '') return true;

            return regExp.test( this.val() );
        }
    });

    D.extend( UI.Base, O , {

        result: {
            code: 0,    //0:全部验证通过。-1:验证没通过
            list:[]     //在验证没通过的时候，这个列表里存放着没通过的那些dom
        },

        messageDom: [],    //出错提示信息的dom集合

        init: function(data){
            var w = this;

            O.__super__.init.call(this, data);
            w.initMe(data);
        },

        initMe: function(data){
        	var w = this;

            w.initHTML();
            w.initEvent();
        },

        initHTML: function(){
        	var w = this;

            w.id = w.el.attr("id") || w.el.attr("name") || "noId";

        },

        initEvent: function(){
            var w = this;

            w.on(FormValidatorEvent.SUBMIT, function(event, param){
                w.elements = $(("input[#],select[#],textarea[#]").replace(/#/g, O.valid), w.el);
                w.reset();
                w.validator(param);
            })
        },

        reset: function(){
        	var w = this;

            w.result.code = 0;
            w.result.list = [];

            var len = w.messageDom.length;
            while(len--){
                w.messageDom[len].remove();
            }
        },

        /**
         * 开始验证
         * @param param [Function]
         */
        validator: function(param){
        	var w = this;
            var len = w.elements.size();

            //预处理，input radio/checkbox 单个name对应多个element的情况
            w.elements.each(function(){
                var self = $(this);

                if ((this.tagName == "INPUT") && (this.type == "radio" || this.type == "checkbox")) {
                    var n = this.name;
                    var valMap = [];
                    var o = $("input[name='" + n + "']");
                    o.each(function(){
                        valMap.push({checked: this.checked, value: this.value})
                    })
                    self.data("validator", valMap);
                }
            })

            w.elements.each(function(){
                var self = $(this), type = "", r = {};

                if(self.attr("disabled")) return;
                switch (this.tagName) {
                    case "INPUT": type = this.type || "text"; break;
                    case "SELECT": type = this.multiple ? "multiple" : "normal"; break;
                    case "TEXTAREA": type = "normal"; break;
                }

                r = w.validateEach(self, this.tagName, type);
                if(r.code == -1){
                    w.result.code = -1;
                    w.result.list.push(r.obj);
                }
            });

            if(w.result.code == -1){
                for (var i = 0; i < w.result.list.length; i++) {
                    var obj = w.result.list[i];
                    var p = $("<p class='ib ch-fv'><i class='fa fa-exclamation-circle fa-l'></i></p>");
                    var parent = obj.dom.parents(O.opt.formEntry);
                    p.append(obj.text);
                    w.messageDom.push(p);

                    parent.append(p);
                }
                $('[type="submit"]' ,w.el).removeAttr('disabled');
            }else{
                param && param();
            }
        },

        /**
         * 逐个验证。
         * @param dom [jquery dom]
         * @param tagName [String]
         * @param type [String]
         * @return [Object] {code: 0, obj: {dom:dom, text: ""}}
         */
        validateEach: function(dom, tagName, type){
            var w = this, v = {};

            try{
                v = JSON.parse(dom.attr("allow"));
            }catch(e){
                alert(dom.attr("allow") + "语法错误！\n\nJSON字符串的key和value(如果value是字符串)必须用双引号引起来。");
            }
            return O.elementMap[tagName][type](dom, v);

            return {code: 0, obj: {dom:dom, text: ""}};
        }
    });
})(Das);
