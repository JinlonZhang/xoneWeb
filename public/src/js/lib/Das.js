/**
 * Class Das
 * @Auther: allen
 * data: 2011-08-04
 * vision: 1.1:增加extend功能（类的继承） allen 2013-03-26
 *
 */

(function(){
	var global = this,
	    objectPrototype = Object.prototype,
	    toString = Object.prototype.toString,
	    enumerables = true,
	    enumerablesTest = { toString: 1 },
	    i;
	/*
	 * toString 是系统成员。标准浏览器无法迭代Object成员。这是为了检测是否支持迭代出系统成员。
	 */
	
	
	if (typeof Das === 'undefined') {
	    global.Das = {};
        global._ = global.Das;
        global.Xone = global.Das;
	}
	
	Das.global = global;
	
	for (i in enumerablesTest) {
        enumerables = null;
    }

    if (enumerables) {
        enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
                       'toLocaleString', 'toString', 'constructor'];
    }
	
    /**
     * 复制更新参数
     * @param {Object} object 接受方对象
     * @param {Object} config 源对象
     * @param {Object} 默认对象，如果该参数存在，object将会获取那些defaults有而config没有的属性
     * @return {Object} returns obj
     */
	Das.apply = function(object, config, defaults) {
        if (defaults) {
        	Das.apply(object, defaults);
        }

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    };
    
    Das.apply(Das, {
    	/*
    	 * 空函数。
    	 */
    	emptyFn: function(){},
    	/*
    	 * 创建类的时候，可以使用此方法。
    	 *
    	 */
    	create: function(){
            return function() { this.init.apply(this, arguments); }
        },

        /**
         * 抛出异常
         * @param msg
         */
        error: function(msg){
            throw msg instanceof Error ? msg : new Error(msg);
        },

        /**
         *
         */
        log: function(o){
        	var w = this;
        },

        /**
         * 函数节流功能
         * @param fn
         * @param delay
         * @return {Function}
         */
        throttle:function(fn, delay){
            var timer = null;

            return function(){
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function(){
                    fn.apply(context, args);
                }, delay);
            }
        },

        /**
         * 继承功能。
         * @param super 父类
         * @param sub 子类
         * @return 继承后的子类。
         */
        extend: function(r, s, px, sx){
            var OP = Object.prototype,
                rp = r.prototype,
                sp = Das.Object(rp);

            s.prototype = sp;

            sp.constructor = s;
            s.__super__ = rp;

            if(r !== Object && r.constructor === OP){
                rp.constructor = r;
            }

            if(px){
                Das.apply(sp, px);
            }

            if(sx){
                Das.apply(s, sx);
            }

            return s;
        },

        Object: function(o){
            var F = Das.emptyFn;
            F.prototype = o;
            return new F();
        }

    });
	
    Das.apply(Das, {
    	typeOf: function(value) {
            if (value === null) {
                return 'null';
            }

            var type = typeof value;

            if (type === 'undefined' || type === 'string' || type === 'number' || type === 'boolean') {
                return type;
            }

            var typeToString = toString.call(value);

            switch(typeToString) {
                case '[object Array]':
                    return 'array';
                case '[object Date]':
                    return 'date';
                case '[object Boolean]':
                    return 'boolean';
                case '[object Number]':
                    return 'number';
                case '[object RegExp]':
                    return 'regexp';
            }

            if (type === 'function') {
                return 'function';
            }

            if (type === 'object') {
                if (value.nodeType !== undefined) {
                    if (value.nodeType === 3) {
                        return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    }
                    else {
                        return 'element';
                    }
                }

                return 'object';
            }
        },
		isEmpty: function(value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Das.isArray(value) && value.length === 0);
        },
        isArray: ('isArray' in Array) ? Array.isArray : function(value) {
			return toString.call(value) === '[object Array]';
		},
		isDate: function(value) {
			return toString.call(value) === '[object Date]';
		},
		isObject: (toString.call(null) === '[object Object]') ?
			function(value) {
				return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.nodeType === undefined;
			} :
			function(value) {
				return toString.call(value) === '[object Object]';
			},
		/**
		* 如果传递的值是一个JavaScript的'基元'，返回true，比如：一个字符串，数字或布尔。
		*/
		isPrimitive: function(value) {
			var type = typeof value;
		
			return type === 'string' || type === 'number' || type === 'boolean';
		},
		isFunction: function(value) {
			return typeof value === 'function';
		},
		isNumber: function(value) {
			return typeof value === 'number' && isFinite(value);
		},
		isNumeric: function(value) {
			return !isNaN(parseFloat(value)) && isFinite(value);
		},
		isString: function(value) {
			return typeof value === 'string';
		},
		isBoolean: function(value) {
			return typeof value === 'boolean';
		},
		isElement: function(value) {
			return value ? value.nodeType !== undefined : false;
		},
		isTextNode: function(value) {
			return value ? value.nodeName === "#text" : false;
		},
		isDefined: function(value) {
			return typeof value !== 'undefined';
		},
		/**
		* 如果传递的值是迭代的，返回true，否则返回false
		*/
		isIterable: function(value) {
			return (value && typeof value !== 'string') ? value.length !== undefined : false;
		}
    });
	
	Das.apply(Das, {
		/*
		 * 数组迭代
		 * @param {Array} 需要迭代的元素。可以是一个字符串\数字型\布尔型
		 * @param {Function} 迭代的主函数。
		 * @param {Object} 迭代函数内，this指针所指向的实体。默认为空，指针指向迭代元素本身
		 */
		each: function(array, fn, scope){
			if( Das.isEmpty(array, true) ){
				return;
			}
			/*
			 * 判断array是否可以被迭代，对于数组，NodeList，HTMLCollection都可以被迭代，返回true
			 * 判断array是否是javascript基元[字符串，数字型，布尔型]；直接封装成数组。
			 */
			if( !Das.isIterable(array) || Das.isPrimitive(array) ){
				array = [array];
			}
			for(var i = 0, len = array.length ; i < len ; i++){
				/*
				 * fn内的this指向scope或者当前迭代元素
				 * fn的第一个参数是当前迭代元素，第二个是i索引值，第三个是集合元素
				 */
				if( fn.call(scope || array[i], array[i], i, array) === false){
					return i;
				}
			}
			
		},
		
		/*
		 * 命名空间
		 * @param {String} 需要申请的命名空间。如：Das.namespace('allen.xu', 'xu.ai.liang');
		 */
		namespace: function(){
			var a = arguments, o = null, i, j, d, rt;
			for (i = 0; i < a.length; i++){
				d = a[i].split(".");
				rt = d[0];
				
				/*
				 * eval这句话理解成：
				 * if(typeof allen == "undefined"){
				 * 	allen = {};
				 * }
				 */
				eval( 'if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';' );
				for(j = 1; j<d.length; ++j ){
					o[d[j]] = o[d[j]] || {};
					o = o[d[j]];
				}
			}
			return o;
		}
		
	});
	
	Das.ns = Das.namespace;
	
	/**
	 * @class Das.String
	 *
	 * 一些常用的字符串处理函数
	 * @author Allen Xu
	 * @docauthor Allen Xu
	 */
	Das.String = {
		
		/**
	     * 字符串的第一个字符大写
	     * @param {String} 需要设置的字符串
	     * @return {String}
	     */
	    capitalize: function(string) {
	        return string.charAt(0).toUpperCase() + string.substr(1);
	    },

	    /**
	     * 截断超过长度的字符。并在后面跟上“...”。中文当做两个字符处理
	     * @example Das.String.ellipsis("abc中文de", 5) -> abc中
	     * @param {String} 需要截断的字符。
	     * @param {Number} 截断的最大长度。
	     * @return {String} 返回截断后的字符+“...”。
	     */
		ellipsis: function(value, len) {
	        var reg = new RegExp(/[^\x00-\xff]/), l = 0, b=[];

	        for(var i = 0; i < value.length; i++){
	            var s = value.charAt(i);
	            reg.test(s) ? l+=2 : l+=1;

	            if( l > len){
	                break;
	            }else{
	                b.push(s);
	            }
	        }

	        return b.join("") == value ? value : b.join("") + "...";
	    },

	    /**
	     *
	     */
	    format: function(str){
	        var args = arguments, arr = [];
	        if(Das.typeOf(args[1]) == "array"){
	            arr = [str].concat(args[1]);
	        }else{
	            arr = args;
	        }
	        var pattern = new RegExp("%([1-" + arr.length + "])", "g");

	        return String(str).replace(pattern, function(match, index, input){
	            return arr[index];
	        })
	    }
    }

    // $.browser fallback for jQuery 1.9+.
    if($.browser === undefined) $.browser = {};
    $.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
    $.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    $.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    $.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
})();

