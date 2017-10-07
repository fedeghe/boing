/*
[Malta] ../core.js
*/
/**
 * Autoexecuted closure that allows to create namespaces,
 * the autocall is used to put the function itself in a namespace
 * 
 */
(function (ns){
    // this is due, to test all implications see
    // http://www.jmvc.org/test_strict?ga=false
    // (the ga=false params inhibits google analytics tracking)
    "use strict";

    var allowLog = true,
        allowDebug = true;

    /**
     * Creates a namespace
     * @param  {String} str     dot or slash separated path for the namespace
     * @param  {Object literal} [{}]obj optional: the object to be inserted in the ns, or a function that returns the desired object
     * @param  {[type]} ctx     [window] the context object where the namespace will be created
     * @return {[type]}         the brand new ns
     *
     * @hint This method is DESTRUCTIVE if the obj param is passed,
     *       a conservative version is straight-forward
     * @sample
     *     makens('SM', {hello: ...});
     *     makens('SM', {hi: ...}); // now hello exists no more
     *
     *     //use
     *     makens('SM', {hello: ..., hi: })
     
     *     // or if in different files
     *     // file1     
     *     makens('SM')
     *     SM.hello = ...
     *     //
     *     // file2
     *     makens('SM')
     *     SM.hi = ...
     *
     *     makens('SM/proto', function () {
     *
     *          // some private stuff
     *          //
     *          
     *          return {
     *              foo0 : function () {...},
     *              foo1 : function () {...}
     *          }
     *     })
     *     
     */
    function makens(str, obj, ctx) {
        
        str = str.replace(/^\//, '');
        var els = str.split(/\.|\//),
            l = els.length,
            _u_ = 'undefined',
            ret;

        // default context window
        // 
        (typeof ctx === _u_) && (ctx = window);

        // default object empty
        // 
        (typeof obj === _u_) && (obj = {});

        // if function
        // 
        (typeof obj === 'function') && (obj = obj());        

        //
        if (!ctx[els[0]]) {
            ctx[els[0]] = (l === 1) ? obj : {};
        }
        ret = ctx[els[0]];
        return (l > 1) ? makens(els.slice(1).join('.'), obj, ctx[els[0]]) : ret;
    }


    function checkns(ns, ctx) {
        // if (ns == undefined) {
        //     debugger;
        // } 
        var els = ns.split(/\.|\//),
            i = 0,
            l = els.length;
        ctx = (ctx !== undefined) ? ctx : W;

        if (!ns) return ctx;

        for (null; i < l; i += 1) {

            if (typeof ctx[els[i]] !== 'undefined') {
                ctx = ctx[els[i]];
            } else {
                // break it
                return undefined;
            }
        }
        return ctx;
    }


    // use makens to publish itself and something more
    //
    makens(ns, {

        makeNS : makens,
        checkNS : checkns,
        debug : function () {
            var args = Array.prototype.slice.call(arguments, 0);
            allowDebug && 'debug' in console && console.debug.apply(console, args);
        },
        log : function () {
            var args = Array.prototype.slice.call(arguments, 0);
            allowLog && 'log' in console && console.log.apply(console, args);
        },

        dbg : function (m) {
            // maybe shut up
            if (!allowDebug) {return void 0;}
            try {console.log(m);} catch(e1) {try {opera.postError(m);} catch(e2){alert(m);}}
        }
    });
    
    // use it again to define a function to get
    // uniqueid
    makens(ns + '.utils', {
        /**
         * useful to get a unique id string
         * @return {String} the wanted id
         */
        uniqueId : new function () {
            var count = 0,
                self = this;
            this.prefix = ns + '_';
            this.toString = function () {
                return  self.prefix + ++count;
            }
        }
    });

// base ns 
})('SB');
/*
[Malta] ../util.js
*/
SB.makeNS('SB/util', {
    uniqueid: new function () {
        var count = 0,
            self = this;
        this.prefix = 'SB';
        this.toString = function () {
            ++count;
            return  self.prefix + count;
        };
    },
    
    isValidEmail: function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    
    delegate: function (func, ctx) {
        // get relevant arguments
        var args = Array.prototype.slice.call(arguments, 2);
        return function () {
            return func.apply(
                ctx || null,
                [].concat(args, Array.prototype.slice.call(arguments, 0))
            );
        };
    },
    
    once : function (f) {
        var ran = false;
        return function () {
            !ran && f();
            ran = true;
        };
    },

    formatNumber : function (n, sep) {
        n += '';
        var x = n.split('.'),
            x1 = x[0],
            x2 = x.length > 1 ? '.' + x[1] : '',
            rgx = /(\d+)(\d{3})/,
        sep = sep || "'";

        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + sep + '$2');
        }
        return x1 + x2;
    },

    replaceAll : function (tpl, obj, options) {

        var start = '%',
            end = '%',
            fb = null,
            clean = false,
            reg,
            straight = true,
            str, tmp, last;

        if (undefined != options) {
            if ('delim' in options) {
                start = options.delim[0];
                end = options.delim[1];
            }
            if ('fb' in options) {
                fb = options.fb;
            }
            clean = !!options.clean;
        }

        reg = new RegExp(start + '(\\\+)?([A-z0-9-_\.]*)' + end, 'g');

        while (straight) {
            if (!(tpl.match(reg))) {
                return tpl;
            }
            tpl = tpl.replace(reg, function (str, enc, $1, _t) {
                
                if (typeof obj === 'function') {
                    /**
                     * avoid silly infiloops */
                    tmp = obj($1);
                    _t = (tmp !== start + $1 + end) ? obj($1) : $1;

                } else if ($1 in obj) {

                    _t = typeof obj[$1];
                    if (_t === 'function') {
                        _t = obj[$1]($1);
                    } else if (_t === 'object') {
                        _t = '';
                    } else {
                        _t= obj[$1];
                    }
                    // incomplete when the placeholder points to a object (would print)
                    // _t = typeof obj[$1] === 'function' ? obj[$1]($1) : obj[$1];
                    
                /**
                 * not a function and not found in literal
                 * use fallback if passed or get back the placeholder
                 * switching off before returning
                 */
                } else {
                    /* @ least check for ns, in case of dots
                    */
                    if ($1.match(/\./)) {
                        last = SB.checkNS($1 ,obj);
                        if (last) {
                            _t = enc ? encodeURIComponent(last) : last;
                            return typeof last === 'function' ? last($1) : last;
                        }
                    }
                    // but do not go deeper   
                    straight = false;
                    _t = fb !== null ? fb : clean ? '' : start + $1 + end;
                }
                return enc ? encodeURIComponent(_t): _t;
            });
        }
        return tpl;
    },

    isMobile: function () {
        var ua = navigator.userAgent || navigator.vendor || window.opera;
        return /android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|meego.+mobile|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|playbook|silk/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
        // return !!(typeof window.ontouchstart != "undefined");
    },
    
    isObject : function (o) {
        var t0 = String(o) !== o,
            t1 = o === Object(o),
            t2 = typeof o !== 'function',
            t3 = {}.toString.call(o).match(/\[object\sObject\]/);
        return t0 && t1 && t2 && !!(t3 && t3.length);
    },

    isArray : function (o) {
        if (Array.isArray && Array.isArray(o)) {
            return true;
        }
        var t1 = String(o) !== o,
            t2 = {}.toString.call(o).match(/\[object\sArray\]/);

        return t1 && !!(t2 && t2.length);
    },
    
    getViewportSize : function () {
        
        if (typeof window.innerWidth != 'undefined') {
            return {
                width : window.innerWidth,
                height : window.innerHeight
            };
        } else {
            return (typeof window.document.documentElement != 'undefined'
                &&
                typeof window.document.documentElement.clientWidth != 'undefined'
                &&
                window.document.documentElement.clientWidth != 0
            ) ? {
                width : window.document.documentElement.clientWidth,
                height : window.document.documentElement.clientHeight
            } : {
                width : window.document.getElementsByTagName('body')[0].clientWidth,
                height : window.document.getElementsByTagName('body')[0].clientHeight
            };
        }
    },
    
    arrayFind : function (arr, mvar) {
        //IE6,7,8 fail here
        if (arr instanceof Array && 'indexOf' in arr) {
            return arr.indexOf(mvar);
        }
        var l = arr.length - 1;
        while (l >= 0 && arr[l] !== mvar) {l--; }
        return l;
    },  

    rand : function (min, max) {
        return min + ~~(Math.random() * (max - min + 1));
    },

    arrSum : function (arr) {
        var n = arr.length,
            ret = 0,
            i = 0;
        while (i < n) {
            ret += arr[i++]
        }
        return ret.toFixed(2);
    },
    arrMean : function (arr) {
        var n = arr.length,
            ret = 0,
            i = 0;
        while (i < n) {
            ret += arr[i++]
        }
        return (ret / n).toFixed(2);
    },

    coll2array : function (coll) {
        var ret = [],
            i = 0;
        try {
            ret = [].slice.call(coll, 0);
        } catch (e) {
            // what if coll[i] element is false? loop breaks
            // but this is not the case since collection has no falsy values
            for (null; coll[i]; i++) {
                ret[i] = coll[i];
            }
        }
        return ret;
    },
    
    // public section
    match : {
        rex : {
            email : new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
            url : new RegExp(/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i),
            alfa : new RegExp(/^[A-z]*$/),
            numint : new RegExp(/^[0-9]*$/),
            floatnum : new RegExp(/^[0-9\.]*$/),
            alfanum : new RegExp(/^[A-z0-9]*$/)
        },
        email : function (str) {
            return str.match(SB.util.match.rex.email);
        },
        url : function (str) {
            return str.match(SB.util.match.rex.url);
        },
        alfa : function (str, min, max) {
            max && min > max && (max = min);
            return str.match(new RegExp('^[A-z\s]' + (~~min ? '{' + min + ',' + (~~max ? max : '') + '}' : '*') + '$'));
        },
        alfanum : function (an) {
            return an.match(SB.util.match.rex.alfanum);
        },
        floatnum : function (fn) {
            return (fn + '').match(SB.util.match.rex.floatnum);
        }
    },
    getScrollingPosition : function () {
        var W = window,
            WD = window.document,
            f_filterResults = function (n_win, n_docel, n_body) {
                var n_result = n_win ? n_win : 0;
                if (n_docel && (!n_result || (n_result > n_docel))) {
                    n_result = n_docel;
                }
                return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
            };
        return {
            left: f_filterResults(
                W.pageXOffset ? W.pageXOffset : 0,
                WD.documentElement ? WD.documentElement.scrollLeft : 0,
                WD.body ? WDB.scrollLeft : 0
            ),
            top: f_filterResults(
                W.pageYOffset ? W.pageYOffset : 0,
                WD.documentElement ? WD.documentElement.scrollTop : 0,
                WD.body ? WD.body.scrollTop : 0
            )
        };
    },
    size2layout : function(options) {
        var minSize = options.minSize || 250,
            maxSize = options.maxSize || 1000,
            inRange = function (d) {return d >= minSize && d<= maxSize;},

            mUp = options.breakingFactor || 1.2,
            mDown = 1 / mUp,
            
            // splits all the following formats:
            // 111X222
            // 111x222
            // 111*222
            // 111|222
            // 111 222
            // 111,222
            requestedSizes = options.requestedSize.split(/x|\*|\||\s|,/i),
            requestedWidth = parseInt(requestedSizes[0], 10),
            requestedHeight = parseInt(requestedSizes[1], 10),
            requestedArea = requestedWidth * requestedHeight,

            valid = true,
            minArea = minSize * minSize,
            maxArea = maxSize * maxSize,
            sizeStep = (maxSize - minSize ) / 3,

            cutoffs = {
                small2medium : (minSize + sizeStep) * (minSize + sizeStep),
                medium2large : (minSize + 2*sizeStep) * (minSize + 2*sizeStep),
            },
            stepArea = (maxArea - minArea) / 3,

            layouts = ['portrait', 'landscape', 'squared'],
            sizes = ['small', 'medium', 'large'],
            size,

            // portrait
            // 
            layout1 = (function (w, h) {
                return (w < mDown * h) && (h > mUp * w);
            })(requestedWidth, requestedHeight),

            // landscape
            // 
            layout2 = (function (w, h) {
                return (h < mDown * w) && (w > mUp * h);
            })(requestedWidth, requestedHeight),

            // if in the valid range but not portrait
            // or landscape it MUST be squared
            // 
            layout3 = !layout1 && !layout2,
            layout;

        if (!inRange(requestedWidth) || !inRange(requestedHeight)) {
            console.warn('Requested size [' + requestedWidth + ',' + requestedHeight + '] is not in the allowed range!');
            valid = false;
        }
        

        // small
        // 
        if (minArea <= requestedArea && requestedArea < cutoffs.small2medium) {
            size = sizes[0];

        // medium
        // 
        } else if (cutoffs.small2medium <= requestedArea && requestedArea < cutoffs.medium2large) {
            size = sizes[1];

        // large
        // 
        } else if (cutoffs.medium2large <= requestedArea && requestedArea <= maxArea) {
            size = sizes[2];
        }

        layout = (function (portrait, landscape, squared){
            if (portrait) return layouts[0];
            if (landscape) return layouts[1];
            if (squared) return layouts[2];
        })(layout1, layout2, layout3);
        
        return valid && {
            layout : layout,
            size : size,
            width : requestedWidth,
            height : requestedHeight
        };
    },
    adaptive : {
        getVideoCoordinates : function (containerSizes) {
            var propo_16_9 = 16/9,
                w = containerSizes.width,
                h = containerSizes.height,
                containerRatio = w/h,
                out = {};

            if (containerRatio < propo_16_9) {
                out.height = h;
                out.width = h * propo_16_9;
                out.top = 0;
                out.left = -(out.width - w) / 2;
            } else {
                out.height = w / propo_16_9;
                out.width = w;
                out.top = -(out.height - h) / 2;
                out.left = 0;
            }
            return out;
        },
        getNoFsCoordinates : function (containerSizes) {
            var propo_16_9 = 16/9,
                w = containerSizes.width,
                h = containerSizes.height,
                containerRatio = w/h,
                out = {};

            if (containerRatio < propo_16_9) {
                // nofs video
                // 
                out.top = (h - w/propo_16_9)/2;
                out.left = 0;
                out.height = w / propo_16_9;
                out.width = w;
            } else {
                // nofs video
                // 
                out.top = 0
                out.left = (w - h * propo_16_9) / 2;
                out.height = h;
                out.width = h * propo_16_9;
            }
            return out;
        },
        centerderLimitedBoxContained : function (containerSizes, innerBoxLimits) {
            var innerW = containerSizes.width > innerBoxLimits.width ? innerBoxLimits.width : containerSizes.width,
                innerH = containerSizes.height > innerBoxLimits.height ? innerBoxLimits.height : containerSizes.height;
            return {
                left : (containerSizes.width - innerW) / 2,
                top : (containerSizes.height - innerH) / 2,
                width : innerW,
                height : innerH
            };
        }
    }
});

SB.getFromTop = function (url) {
    var p = SB.Widgzard.Promise.create();
    SB.io.getJson('http://www.smwidgzard.dev/get.php?url=' + encodeURIComponent(encodeURIComponent(url)), function (r) {
        p.done(r);
    });
    return p;
}









/*


//  MinArea = 250 * 250 = 62.5k
//  MaxArea = 1000 * 1000 = 1000k
//  step = (1000k - 62.5k)/3 = 937.5k / 3 = 312.5k

//  -------- 62.5k
//  small
//  -------- 375k 
//  medium
//  -------- 687.5k
//  large
//  -------- 1000k






var benchmarc = [
  {
    input : "100X100",
    output : false
  },
  {
    input : "200X200",
    output : false
  },
  {
    input : "249X250",
    output : false
  },
  {
    input : "250X250",
    output : {
         layout : 'squared',
         size : "small"
     }
  },
  {
     input : "900*800",
     output : {
         layout : 'squared',
         size : "large"
     }
  }
],
result = true;


for(var i=0, l = benchmarc.length; i < l && result ; i++) {
  
  var r = SB.util.size2layout({requestedSize : benchmarc[i].input}),
   local;
  if(!r) {
     if (r !== benchmarc[i].output){
         alert(i + 'th test failed');
     }
 result = result && r == benchmarc[i].output;
  } else {
     local = r.size == benchmarc[i].output.size
     && r.layout == benchmarc[i].output.layout
 !local && alert(i + 'th test failed');
 result = result && local;
  }
}

alert('Test ' + (result ? 'successful' : 'failed'));

*/

/*
[Malta] ../object.js
*/
SB.object = (function (){

    /**
     * maps an object literal to a string according using the map function  passed
     * @param  {Literal}   o  the object literal
     * @param  {Function} fn  the map function
     * @return {String}       the resulting string
     */
    function str_map(o, fn) {
        var ret = '', j;
        for (j in o) {
            o.hasOwnProperty(j) && (ret += fn(o, j, ret));
        }
        return ret;
    }

    function jCompare(obj1, obj2) {
        // avoid tags
        return  !isNode(obj1)
                && typeof JSON !== 'undefined' ?
            JSON.stringify(obj1) === JSON.stringify(obj2)
            :
            obj1 == obj2;
    }

    // Returns true if it is a DOM node
    //
    function isNode(o){
        return (
            typeof Node === "object" ? o instanceof Node : 
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
        );
    }

    // Returns true if it is a DOM element
    // 
    function isElement(o){
        return (
            typeof HTMLElement === "object" ?
                o instanceof HTMLElement
                : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
        );
    }

    function digFor(what, obj, target, limit) {

        if(!what.match(/key|value|keyvalue/)) {
            throw new Error('Bad param for object.digFor');
        }
        limit = ~~limit;
        
        var found = 0,
            matches = {
                key : function (k1, k2, key) {
                    return ($NS$.object.isString(k1) && key instanceof RegExp) ?
                        k1.match(key)
                        :
                        jCompare(k1, key);
                },
                value : function (k1, k2, val) {
                    
                    var v =  ($NS$.object.isString(k2) && val instanceof RegExp) ?
                        k2.match(val)
                        :
                        jCompare(k2, val);
                    
                    return v;
                },
                keyvalue : function (k1, k2, keyval) {
                    return (
                        ($NS$.object.isString(k1) && keyval.key instanceof RegExp) ?
                        k1.match(keyval.key)
                        :
                        jCompare(k1, keyval.key)
                    ) && (

                        ($NS$.object.isString(k2) && keyval.value instanceof RegExp) ?
                        k2.match(keyval.value)
                        :
                        jCompare(k2, keyval.value)
                    );
                }
            }[what],
            res = [],
            maybeDoPush = function (path, index, key, obj, level) {

                var p = [].concat.call(path, [index]),
                    tmp = matches(index, obj[index], key);

                if (tmp) {
                    res.push({
                        obj : obj,
                        value: obj[index],
                        key : p[p.length - 1],
                        parentKey : p[p.length - 2],
                        path : p.join('/'),
                        container : p.slice(0, p.length - 1).join('/'),
                        parentContainer : p.slice(0, p.length - 2).join('/'),
                        regexp : tmp,
                        level : level
                    });
                    found++;
                }
                dig(obj[index], key, p, level+1);
            },
            dig = function (o, k, path, level) {
                // if is a domnode must be avoided
                if (isNode(o) || isElement(o)) return;
                
                var i, l, p, tmp;
                
                if (o instanceof Array) {                
                    for (i = 0, l = o.length; i < l; i++) {
                        maybeDoPush(path, i, k, o, level);
                        if (limit && limit == found) break;
                    }
                } else if (typeof o === 'object') {
                    for (i in o) {
                        maybeDoPush(path, i, k, o, level);
                        if (limit && limit == found) break;
                    }
                } else {
                    return;
                }
            };
        dig(obj, target, [], 0);
        return res;
    }


    return {
        fromQs : function () {
            var els = document.location.search.substr(1).split('&'),
                i, len, tmp, out = [];

            for (i = 0, len = els.length; i < len; i += 1) {
                tmp = els[i].split('=');

                // do not override extra path out
                // 
                !out[tmp[0]] && (out[tmp[0]] = decodeURIComponent(tmp[1]));
            }
            return out;
        },
        
        clone: function(obj) {
            var self = SB.object,
                copy,
                i, l;
            // Handle the 3 simple types, and null or undefined
            if (null === obj || "object" !== typeof obj) {
                return obj;
            }

            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (i = 0, l = obj.length; i < l; i++) {
                    copy[i] = self.clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        copy[i] = self.clone(obj[i]);
                    }
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        },

        /**
         * { function_description }
         *
         * @param      {<type>}  o       { parameter_description }
         * @param      {<type>}  k       { parameter_description }
         * @param      {<type>}  lim     The limit
         * @return     {<type>}  { description_of_the_return_value }
         */
        digForKey : function (o, k, lim) {
            return digFor('key', o, k, lim);
        },

        /**
         * [digForValues description]
         * @param  {[type]} o [description]
         * @param  {[type]} k [description]
         * @return {[type]}   [description]
         */
        digForValue : function (o, k, lim) {
            return digFor('value', o, k, lim);
        },

        /**
         * { function_description }
         *
         * @param      {<type>}  o       { parameter_description }
         * @param      {<type>}  kv      { parameter_description }
         * @param      {<type>}  lim     The limit
         * @return     {<type>}  { description_of_the_return_value }
         */
        digForKeyValue : function (o, kv, lim) {
            return digFor('keyvalue', o, kv, lim);
        },

        extend: function(o, ext, force) {
            var obj = SB.object.clone(o),
                j;
            for (j in ext) {
                if (ext.hasOwnProperty(j) && (!(j in obj) || force)) {
                    obj[j] = ext[j];
                }
            }
            return obj;
        },
        
        isString : function(o) {
            return typeof o === 'string' || o instanceof String;
        },


        jCompare: jCompare,

        /**
         * uses map private function to map an onject literal to a querystring ready for url
         * @param  {Literal} obj    the object literal
         * @return {String}         the mapped object
         */
        toQs : function (obj) {
            return map(obj, function (o, i, r) {
                return ((r ? '&' : '?') + encodeURIComponent(i) + '=' + encodeURIComponent(o[i])).replace(/\'/g, '%27');
            });
        }
    };
})();
/*
[Malta] ../io.js
*/
SB.makeNS('SB/io');
SB.io = (function (){

    var W = window,
        xdr = typeof W.XDomainRequest !== 'undefined' && document.all && !(navigator.userAgent.match(/opera/i)),
        _ = {
            /**
             * Façade for getting the xhr object
             * @return {object} the xhr
             */
            getxhr : function (o) {
                var xhr,
                    IEfuckIds = ['Msxml2.XMLHTTP', 'Msxml3.XMLHTTP', 'Microsoft.XMLHTTP'],
                    len = IEfuckIds.length,
                    i = 0;

                if (xdr && o.cors) {
                    xhr = new W.XDomainRequest();
                } else {
                    try {
                        xhr = new W.XMLHttpRequest();
                    } catch (e1) {
                        for (null; i < len; i += 1) {
                            try {
                                xhr = new W.ActiveXObject(IEfuckIds[i]);
                            } catch (e2) {continue; }
                        }
                        !xhr && alert('No way to initialize XHR');
                    }
                }
                return xhr;
            },

            setHeaders : function (xhr, type) {
            
                var tmp = {
                    xml : 'text/xml',
                    html : 'text/html',
                    json : 'application/json'
                }[type] || 'text/html';

                xhr.setRequestHeader('Accept', tmp + '; charset=utf-8');
            },

            setMultipartHeader : function (xhr) {
                xhr.setRequestHeader("Content-Type","multipart/form-data");
            },

            setCookiesHeaders : function (xhr) {
                var cookies, i, l;
                cookies = SB.cookie.getall();
                i = 0, l = cookies.length;
                while (i < l) {
                    xhr.setRequestHeader("Cookie", cookies[i].name + "=" + cookies[i].value);
                    i++;
                }
            },

            ajcall : function (uri, options) {

                var xhr = _.getxhr(options),
                    method = (options && options.method) || 'POST',
                    cback = options && options.cback,
                    cb_opened = (options && options.opened) || function () {},
                    cb_loading = (options && options.loading) || function () {},
                    cb_error = (options && options.error) || function () {},
                    cb_abort = (options && options.abort) || function () {},
                    sync = options && options.sync,
                    data = (options && options.data) || {},
                    type = (options && options.type) || 'text/html',
                    cache = (options && options.cache !== undefined) ? options.cache : true,
                    targetType = type === 'xml' ?  'responseXML' : 'responseText',
                    timeout = options && options.timeout || 10000,
                    hasFiles = options && options.hasFiles,
                    formData,
                    complete = false,
                    res = false,
                    ret = false,
                    state = false,
                    cookies,
                    tmp,
                    i,l;

                //prepare data, caring of cache
                //
                if (!cache) {

                    data.C = +new Date;
                }
                
                if (method === 'GET') {

                    data = SB.object.toQs(data).substr(1);

                } else {
                    // wrap data into a FromData object
                    // 
                    formData = new FormData();
                    for (tmp in data) {
                        formData.append(tmp , data[tmp]);
                    }
                    data = formData;
                }

                if (xdr && options.cors) {
                    // xhr is actually a xdr
                    xhr.open(method, (method === 'GET') ? (uri + ((data) ? '?' + data: '')) : uri);

                    xhr.onerror = cb_error;
                    xhr.ontimeout = function () {};
                    xhr.onprogress = function (e) {
                        if (e.lengthComputable) {
                            var percentComplete = (e.loaded / e.total) * 100;
                            console.log(percentComplete + '% uploaded');
                        }
                    };
                    xhr.onload = function (r) {
                        // cback((targetType === 'responseXML') ? r.target[targetType].childNodes[0] : r.target[targetType]);
                        cback(xhr.responseText);
                    };
                    xhr.timeout = 3000;

                    _.setHeaders(xhr, hasFiles, type);

                    var tmp = {
                        xml : 'text/xml',
                        html : 'text/html',
                        json : 'application/json'
                    }[type] || 'text/html';

                    xhr.contentType = tmp;
                    window.setTimeout(function () {
                        xhr.send();    
                    }, 20);
                    


                } else {
                    xhr.onreadystatechange = function () {
                        
                        if (state === xhr.readyState) {
                            
                            return false;
                        }
                        state = xhr.readyState;


                        // 404
                        //
                        if (~~xhr.readyState === 4 && ~~xhr.status === 0) {
                            xhr.onerror({error : 404, xhr : xhr, url : uri});
                            xhr.abort();
                            return false;
                        }
                        
                        if (state === 'complete' || (~~state === 4 && ~~xhr.status === 200)) {
                            complete = true;
                            
                            if(~~xhr.status === 404) {
                                xhr.onerror.call(xhr);
                                return false;
                            }


                            if (cback) {
                                res = xhr[targetType];
                                (function () {cback(res); })(res);
                            }
                            ret = xhr[targetType];

                            // IE leak ?????
                            W.setTimeout(function () {
                                xhr = null;
                            }, 50);
                            return ret;
                        } else if (state === 3) {
                            // loading data
                            //
                            cb_loading(xhr);
                        } else if (state === 2) {
                            // headers received
                            //
                            cb_opened(xhr);
                        } else if (state === 1) {
                            // in every case add cookies
                            //
                            

                            // only if no file upload is required
                            // add the header
                            // 
                            if (!hasFiles) {
                                
                                _.setHeaders(xhr, type);



                                // NOOOOOOO
                                // _.setCookiesHeaders(xhr);
                                
                            } else {
                                _.setHeaders(xhr, 'json');



                                // NO HEADERS AT ALL!!!!!!
                                // othewise no up
                                //                                
                                // _.setMultipartHeader(xhr);
                            }

                            switch (method) {
                            case 'POST':
                            case 'PUT':
                                try {
                                    xhr.send(data || true);
                                } catch (e1) {}
                                break;
                            
                            case 'GET':
                                try {
                                    xhr.send(null);
                                } catch (e2) {}
                                break;
                            default :
                                alert(method);
                                xhr.send(null);
                                break;
                            }
                        }
                        return true;
                    } ;

                    // error
                    // 
                    xhr.onerror = function () {
                        cb_error && cb_error.apply(null, arguments);
                    };

                    // abort
                    // 
                    xhr.onabort = function () {
                        cb_abort && cb_abort.apply(null, arguments);
                    };

                    // open request
                    //
                    xhr.open(method, method === 'GET' ? uri + (data ? '?' + data: '') : uri, sync);

                    // thread abortion
                    //
                    W.setTimeout(function () {
                        if (!complete) {
                            complete = true;
                            xhr.abort();
                        }
                    }, timeout);

                    try {
                        return (targetType === 'responseXML') ? xhr[targetType].childNodes[0] : xhr[targetType];
                    } catch (e3) {}

                }

                return true;
            }
        };


    // returning module
    // 
    return {
        getxhr : _.getxhr,
        post : function (uri, cback, sync, data, cache, files, err) {
            return _.ajcall(uri, {
                cback : function (r) {
                    if (files) {
                        r = r.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '');
                        cback( (window.JSON && window.JSON.parse) ? JSON.parse(r) : eval('(' + r + ')') );
                    } else {
                        cback(r);
                    }
                },
                method : 'POST',
                sync : sync,
                data : data,
                cache : cache,
                error: err,
                hasFiles : !!files
            });
        },
        get : function (uri, cback, sync, data, cache, err) {
            return _.ajcall(uri, {
                cback : cback || function () {},
                method : 'GET',
                sync : sync,
                data : data,
                cache : cache,
                error : err
            });
        },
        put : function (uri, cback, sync, data, cache, err) {
            return _.ajcall(uri, {
                cback : cback,
                method : 'PUT',
                sync : sync,
                data : data,
                cache : cache,
                error: err
            });
        },
        getJson : function (uri, cback, data, cors) {
            return _.ajcall(uri, {
                type : 'json',
                method: 'GET',
                sync : false,
                cback : function (r) {
                    // just to allow inline comments on json (not valid in json)
                    // cleanup comments
                    r = r.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '');
                    cback( (W.JSON && W.JSON.parse) ? JSON.parse(r) : eval('(' + r + ')') );
                },
                data : data,
                cors : !!cors
            });
        },
        getXML : function (uri, cback) {
            return _.ajcall(uri, {
                method : 'GET',
                sync : false,
                type : 'xml',
                cback : cback || function () {}
            });
        }
    };
})();
/*
[Malta] ../css.js
*/
SB.makeNS('SB/css');

SB.css.style = function (el, prop, val ) {

	if (!el) return false;

	var prop_is_obj = (typeof prop === 'object' && typeof val === 'undefined'),
		ret = false,
		newval, k;

	if (!prop_is_obj && typeof val === 'undefined') {

		ret = el.currentStyle ? el.currentStyle[prop] : el.style[prop];
		return ret;
	}

	if (prop_is_obj) {
		for (k in prop) {
			el.style[k] = prop[k];
		}
	} else if (typeof val !== 'undefined') {
		val += '';

		el.style[prop] = val;

		if (prop === 'opacity') {
			el.style.filter = 'alpha(opacity = ' + (~~(100 * parseFloat(val, 10))) + ')';
		}//
	}
	return true;
};

SB.css.fontAwesome = function () {
	var fa = document.createElement('link');
	fa.href = 'css/font-awesome-4.5.0/font-awesome.min.css';
	fa.rel = 'stylesheet';
	document.getElementsByTagName('head').item(0).appendChild(fa);
};

SB.css.setZoom = function (el, zoom, origin) {

	origin = origin || [ 0.5, 0.5 ];

	var p = [ "webkit", "moz", "ms", "o" ],
		s = "scale(" + zoom + ")",
		oString = (origin[0] * 100) + "% " + (origin[1] * 100) + "%";

	for (var i = 0; i < p.length; i++) {
		el.style[p[i] + "Transform"] = s;
		el.style[p[i] + "TransformOrigin"] = oString;
	}

	el.style["transform"] = s;
	el.style["transformOrigin"] = oString;
}

SB.css.bg = (function () {

	var speed = 0.6,
		steps = 15,
		to = 1000 * speed / steps,
		transparency = 0.3,
		baseColorTpl = "rgba(%r%,%g%,%b%,%a%)",
		transp = "rgba(0,0,0,0)",
		tpls = [
			"-webkit-linear-gradient(left, %rgbaElements%)",
			"-o-linear-gradient(right, %rgbaElements%)",
			"-moz-linear-gradient(right, %rgbaElements%)",
			"linear-gradient(to right, %rgbaElements%)"

			// "-webkit-radial-gradient(left, %rgbaElements%)",
			// "-o-radial-gradient(right, %rgbaElements%)",
			// "-moz-radial-gradient(right, %rgbaElements%)",
			// "radial-gradient(to right, %rgbaElements%)"
		],
		done = function () {},
		node,
		color,
		moving = false,
		cursor,
		start, end,
		versus,
		moves;

	function move() {

		moving = true;

		var rgbElements = [],
			tmp,
			i = 0,
			l = tpls.length;
		for (null; i < steps; i++) {
			rgbElements.push(i == cursor ? color : transp);
		}
		tmp = rgbElements.join(',');

		for (i = 0; i < l; i++) {
			SB.css.style(node, 'background', SB.util.replaceAll(tpls[i], {rgbaElements: tmp}));
		}

		if (cursor != end) {
			cursor += versus;
			setTimeout(move, to);
		} else {
			clean();
			done();
			moving = false;
		}
	}

	function clean() {
		SB.css.style(node, 'background', 'none');
	}


	// SB.css.bg.moveR(node, [255,255,255]);
	function moveR(elem, c) {
		node = elem;
		color = SB.util.replaceAll(baseColorTpl, {r:c[0],g:c[1],b:c[2],a:transparency});
		start = 0;
		end = steps - 1;
		versus = 1;
		cursor = start;
		move();
	}
	function moveL(elem, c) {
		node = elem;
		color =  SB.util.replaceAll(baseColorTpl, {r:c[0],g:c[1],b:c[2],a:transparency});
		start = steps - 1;
		end = 0;
		versus = -1;
		cursor = start;
		move();
	}

	return {
		moveR : moveR,
		moveL : moveL,
		moveRL : function (elem, c) {
			done = function () {
				done = function () {};
				moveL(elem, c);
			};
			moveR(elem, c);
		},
		moveLR : function (elem, c) {
			done = function () {
				done = function () {};
				moveR(elem, c);
			};
			moveL(elem, c);
		}
	};

})();

/*
[Malta] ../dom.js
*/
(function (){

    var _ = {
        dom : {
            nodeidMap : {},
            nodeAttrForIndex : '__ownid__'
        }
    };

    SB.dom = {

        addClass : function (elem, addingClass) {
            var cls = !!(elem.className) ? elem.className : '',
                reg = new RegExp('(\\s|^)' + addingClass + '(\\s|$)');
            if (!cls.match(reg)) {
                elem.className = addingClass + ' '+ cls;
            }
            return true;
        },

        childs : function (node, only_elements) {
            return only_elements? node.children : node.childNodes;
        },

        removeAttr : function (el, valore) {
            el.removeAttribute(valore);
            return el;
        },

        attr : function (elem, name, value) {
            if (!elem) {
                return '';
            }
            if (!('nodeType' in elem)) {
                return false;
            }
            if (elem.nodeType === 3 || elem.nodeType === 8) {
                return undefined;
            }

            var attrs = false,
                l = false,
                i = 0,
                result,
                is_obj = false;
     
            is_obj = SB.util.isObject(name);
            
            if (is_obj && elem.setAttribute) {
                for (i in name) {
                    elem.setAttribute(i, name[i]);
                }
                return true;
            }
            
            // Make sure that avalid name was provided, here cannot be an object
            // 
            if (!name || name.constructor !== String) {
                return '';
            }
            
            // If the user is setting a value
            // 
            if (typeof value !== 'undefined') {
                
                // Set the quick way first 
                // 
                elem[{'for': 'htmlFor', 'class': 'className'}[name] || name] = value;
                
                // If we can, use setAttribute
                // 
                if (elem.setAttribute) {
                    elem.setAttribute(name, value);
                }
            } else {
                result = (elem.getAttribute && elem.getAttribute(name)) || 0;
                if (!result) {
                    attrs = elem.attributes;
                    l = attrs.length;
                    for (i = 0; i < l; i += 1) {
                        if (attrs[i].nodeName === name) {
                            return attrs[i].value;
                        }
                    }
                }
                elem = result;
            }
            return elem;
        },

        removeClass : function (elem, removingClass) {
            var reg = new RegExp('(\\s|^)' + removingClass + '(\\s|$)');
            if (elem.className) {
                elem.className = elem.className.replace(reg, ' ');
            }
            return true;
        },

        switchClass : function (elem, classToGo, classToCome) {
            SB.dom.removeClass(elem, classToGo);
            SB.dom.addClass(elem, classToCome);
            return true;
        },

        descendant : function () {
            var args = Array.prototype.slice.call(arguments, 0),
                i = 0,
                res = args.shift(),
                l = args.length;
            if (!l) return res;
            while (i < l) {
                res = res.children.item(~~args[i++]);
            }
            return res;
        },
        remove : function (el) {
            var parent = el.parentNode;
            parent && parent.removeChild(el);
        },

        idize : function (el, prop) {
            prop = prop || _.dom.nodeAttrForIndex;
            //if (!el.hasOwnProperty(prop)) {
            if (!(prop in el)) {
                var nid = SB.util.uniqueid + '';
                el[prop] = nid;
                //save inverse
                _.dom.nodeidMap[nid] = el;
            }
            return el[prop];
        },
        walk : function (root, func, mode) {
            mode = {pre : 'pre', post : 'post'}[mode] || 'post';
            var nope = function () {},
                pre = mode === 'pre' ? func : nope,
                post = mode === 'post' ? func : nope,
                walk = (function () {
                    return function (node, _n) {
                        pre(node);
                        _n = node.firstChild;
                        while (_n) {
                            walk(_n);
                            _n = _n.nextSibling;
                        }
                        post(node);
                    };
                })();
            walk(root);
        },
        clone : function (n, deep) {
            return n.cloneNode(!!deep);
        },

        gebtn : function (n, name) {
            return Array.prototype.slice.call(n.getElementsByTagName(name), 0);
        },
        addStyle : function (src, ret) {
            var style = document.createElement('link');
            style.rel = 'stylesheet',
            style.href = src;
            if (ret) return style;
            head = document.getElementsByTagName('head').item(0);
            head.appendChild(style);
        }
    };

})();
/*
[Malta] ../html5.js
*/
(function (){

    var fakeVideo = (function () {return document.createElement('video');})(),
        _ = {
            html5 : {
                nodeidMap : {},
                nodeAttrForIndex : '__ownid__',
                enterFullscreen : (function () {
                    

                    return function (n, cb) {
                        
                        if (n.requestFullscreen) {
                            n.requestFullscreen();
                        } else if (n.msRequestFullscreen) {
                            n.msRequestFullscreen();
                        } else if (n.mozRequestFullScreen) {
                            n.mozRequestFullScreen();
                        } else if (n.webkitRequestFullscreen) {
                            n.webkitRequestFullscreen();
                        }


                        var calls = 0;

                        var check = function () {
                                // calls++;
                                // if(calls > 50){ 
                                //     console.debug(document.fullscreen, document.mozFullScreen, document.webkitIsFullScreen)
                                //     debugger;
                                // }
                                
                                // return (document.fullscreen ||
                                //         document.mozFullScreen ||
                                //         document.webkitIsFullScreen) &&
                                //         cb && typeof cb === 'function' && cb.apply(n, null);
                                return (document.fullscreenElement ||    // alternative standard method
                                        document.mozFullScreenElement ||
                                        document.webkitFullscreenElement ||
                                        document.msFullscreenElement) &&
                                        cb && typeof cb === 'function' && cb.apply(n, null);    
                            },
                            to = window.setInterval(function () {
                                if (check()) window.clearInterval(to);
                            }, 100);


                        // cb && typeof cb === 'function' && cb.apply(n, null);


                        return true;
                    }
                })(),
                cancelFullScreen : (function () {
                    return function (n, cb) {
                        
                        if (n.cancelFullscreen) {
                            n.cancelFullscreen();
                        } else if (n.msCancelFullscreen) {
                            n.msCancelFullscreen();
                        } else if (n.mozCancelFullScreen) {
                            n.mozCancelFullScreen();
                        } else if (n.webkitCancelFullscreen) {
                            n.webkitCancelFullscreen();
                        }


                        cb && typeof cb === 'function' && cb.apply(n, null);
                    }
                })(),
                exitFullscreen : function () {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                },
                exitVideoFullscreen : function (v) {
                    if (v.exitFullscreen) {
                        v.exitFullscreen();
                    } else if (v.msExitFullscreen) {
                        v.msExitFullscreen();
                    } else if (v.mozCancelFullScreen) {
                        v.mozCancelFullScreen();
                    } else if (v.webkitExitFullscreen) {
                        v.webkitExitFullscreen();
                    }
                },
                allowedFullscreen : (function () {
                    return document.fullscreenEnabled ||
                            document.webkitFullscreenEnabled || 
                            document.mozFullScreenEnabled ||
                            document.msFullscreenEnabled || false;
                })()
            }
        };

    SB.html5 = {
        exitFullscreen : _.html5.exitFullscreen,
        exitVideoFullscreen : _.html5.exitVideoFullscreen,
        enterFullscreen : _.html5.enterFullscreen,
        cancelFullscreen : _.html5.cancelFullscreen,
        onExitFullScreen : function (func) {

            SB.events.on(document, "fullscreenchange", function () {
                !document.fullscreen && func();
            });
            SB.events.on(document, "mozfullscreenchange", function () {
                !document.mozFullScreen && func();
            });
            SB.events.on(document, "webkitfullscreenchange", function () {
                !document.webkitIsFullScreen && func();
            });
        },
        allowedFullscreen : _.html5.allowedFullscreen
    };

})();
/*
[Malta] ../events.js
*/
SB.makeNS('SB/events');

~function () {


    var _ = {},
        W = window,
        WD = W.document;


    // -----------------+
    // EVENTS sub-module |
    // -----------------+

    // private section
    _.events = {
        /**
         * storage literal to speed up unbinding
         * @type {Object}
         */
        bindings: {},
        /**
         * store wrapped callbacks
         * @type {Array}
         */
        cbs: [],
        /**
         * wired function queue fired
         * at the beginning of render function
         * @type {Array}
         */
        Estart: [],
        /**
         * wired function queue fired
         * at the end of render function
         * @type {Array}
         */
        Eend: [],
        /**
         * map used to get back a node from an id
         * @type {Object}
         */
        //nodeidMap : {},
        disabledRightClick: false,
        /**
         * bind exactly one domnode event to a function
         * @param  {DOM node}   el the dom node where the event must be attached
         * @param  {String}   evnt the event
         * @param  {Function} cb   the callback executed when event is fired on node
         * @return {undefined}
         */
        bind: (function() {
            var fn;

            function store(el, evnt, cb) {

                var nid = SB.dom.idize(el); // _.events.nodeid(el);
                !(evnt in _.events.bindings) && (_.events.bindings[evnt] = {});

                !(nid in _.events.bindings[evnt]) && (_.events.bindings[evnt][nid] = []);
                //store for unbinding
                _.events.bindings[evnt][nid].push(cb);
                return true;
            }
            if ('addEventListener' in W) {
                fn = function(el, evnt, cb) {
                    // cb = _.events.fixCurrentTarget(cb, el);
                    el.addEventListener.apply(el, [evnt, cb, false]);
                    store(el, evnt, cb);
                };
            } else if ('attachEvent' in W) {
                fn = function(el, evnt, cb) {
                    // cb = _.events.fixCurrentTarget(cb, el);
                    el.attachEvent.apply(el, ['on' + evnt, cb]);
                    store(el, evnt, cb);
                };
            } else {
                fn = function() {
                    throw new Error('No straight way to bind an event');
                };
            }
            return fn;
        })(),

        /**
         * unbind the passed cb or all function
         * binded to a node-event pair
         *
         * @param  {DOM node}   el   the node
         * @param  {String}   tipo   the event
         * @param  {Function|undefined} cb the function that must be unbinded
         *                                 if not passed all functions attached
         *                                 will be unattached
         * @return {boolean}    whether the unbinding succeded
         */
        unbind: function(el, evnt, cb) {
            function unstore(evnt, nodeid, index) {
                Array.prototype.splice.call(_.events.bindings[evnt][nodeid], index, 1);
            }

            //cb && (cb = this.fixCurrentTarget(cb, el));

            var nodeid = SB.dom.idize(el), //_.events.nodeid(el),
                index, tmp, l;

            if ((evnt in _.events.bindings) && (nodeid in _.events.bindings[evnt])) {
                tmp = _.events.bindings[evnt][nodeid];
            } else {
                return false;
            }

            // try {
            //     tmp = _.events.bindings[evnt][nodeid];
            // } catch (e) {
            //     return false;
            // }

            //
            //  loop if a function is not given
            if (typeof cb === 'undefined') {
                tmp = _.events.bindings[evnt][nodeid];
                if (!tmp) {
                    return false;
                }
                l = tmp.length;
                /*the element will be removed at the end of the real unbind*/
                while (l--) {
                    _.events.unbind(el, evnt, tmp[l]);
                }
                return true;
            }

            //JMVC.W.exp = _.events.bindings;
            index = SB.util.arrayFind(_.events.bindings[evnt][nodeid], cb);

            if (index === -1) {
                return false;
            }

            if (el.removeEventListener) {
                el.removeEventListener(evnt, cb, false);
            } else if (el.detachEvent) {
                el.detachEvent('on' + evnt, cb);
            }

            //remove it from private bindings register
            
            unstore(evnt, nodeid, index);
            
            return true;
        }
    };
    //
    // PUBLIC section
    SB.events = {


        avoidVerticalScroll : function () {


            _.events.bind(window, 'touchmove', function (e) {
                e.preventDefault();
                _.events.kill(e);
            });/*
            _.events.bind(window,'touchstart', function() {
                var top = el.scrollTop,
                    totalScroll = el.scrollHeight,
                    currentScroll = top + el.offsetHeight
                if(top === 0) {
                    el.scrollTop = 1
                } else if(currentScroll === totalScroll) {
                    el.scrollTop = top - 1
                }
            })*/



        },
        /**
         * [ description]
         * @param  {[type]}   el   [description]
         * @param  {[type]}   tipo [description]
         * @param  {Function} fn   [description]
         * @return {[type]}        [description]
         */
        on: function(el, tipo, fn) {
            var res = true;
            if (el instanceof Array) {
                for (var i = 0, l = el.length; i < l; i++) {
                    res = res & _.events.bind(el[i], tipo, fn);
                }
                return res;
            }
            if (tipo instanceof Array) {
                for (var i = 0, l = tipo.length; i < l; i++) {
                    res = res & _.events.bind(el, tipo[i], fn);
                }
                return res;
            }
            return _.events.bind(el, tipo, fn);
        },

        blurAllAnchorClicks : function () {
            SB.events.on(W, 'click', function (e) {
                var target = SB.events.eventTarget(e); 
                target.tagName && target.tagName.toLowerCase() == 'a' && target.blur();
            });
        },

        /**
         * [click description]
         * @param  {[type]} el [description]
         * @return {[type]}    [description]
         */
        click : function (el) {
            SB.events.fire(el, 'click');
        },

        /**
         * [code description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        code: function(e) {
            if (e.keyCode) {
                return e.keyCode;
            } else if (e.charCode) {
                return e.charCode;
            } else if (e.which) {
                return e.which;
            }
            return false;
        },

        /**
         * [ description]
         * @param  {[type]} f [description]
         * @param  {[type]} t [description]
         * @return {[type]}   [description]
         */
        delay: function(f, t) {
            window.setTimeout(f, t);
        },

        /**
         * [disableRightClick description]
         * @return {[type]} [description]
         */
        disableRightClick: function() {
            if (_.events.disabledRightClick) {
                return false;
            }
            _.events.disabledRightClick = true;
            var self = SB.events;
            SB.dom.attr(WD.body, 'oncontextmenu', 'return false');
            self.on(WD, 'mousedown', function(e) {
                if (~~(e.button) === 2) {
                    self.preventDefault(e);
                    return false;
                }
            });
        },

        /**
         * [ description]
         * @param  {[type]} f [description]
         * @return {[type]}   [description]
         */
        end: function(f) {
            _.events.Eend.push(f);
        },

        /**
         * [ description]
         * @return {[type]} [description]
         */
        endRender: function() {
            var i = 0,
                l = _.events.Eend.length;
            for (null; i < l; i += 1) {
                _.events.Eend[i]();
            }
        },

        /**
         * [eventTarget description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        eventTarget: function(e) {
            e = e ? e : W.event;
            var targetElement = e.currentTarget || (typeof e.target !== 'undefined') ? e.target : e.srcElement;
            if (!targetElement) {
                return false;
            }

            while (targetElement.nodeType === 3 && targetElement.parentNode !== null) {
                targetElement = targetElement.parentNode;
            }

            return targetElement;
        },

        /**
         * NOCROSS
         * @param  {[type]} el   [description]
         * @param  {[type]} evnt [description]
         * @return {[type]}      [description]
         */
        fire: function(el, evnt) {
            var evt = el[evnt];
            typeof evt === 'function' && (el[evnt]());
        },

        /**
         * [free description]
         * @param  {[type]} node [description]
         * @return {[type]}      [description]
         */
        free: function(node, evnt) {
            node = node || WD;
            if (typeof evnt === 'undefined') {
                for (var j in _.events.bindings) {
                    SB.events.free(node, j);
                }
                return true;
            }
            SB.dom.walk(node, function(n) {
                SB.events.off(n, evnt);
            }, 'pre');
        },

        /**
         * [coord description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        coord : function (e) {
            var x,
                y;
            
            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else if(e.clientX || e.clientY) {
                x = e.clientX + WD.body.scrollLeft + WD.documentElement ? ~~WD.documentElement.scrollLeft : 0;
                y = e.clientY + WD.body.scrollTop + WD.documentElement ? ~~WD.documentElement.scrollTop : 0;
            } else if(e.touches && e.touches.length > 0) {
                x = e.touches[0].pageX;
                y = e.touches[0].pageY;
            }
            
            return [x, y];
        },

        /**
         * [ description]
         * @param  {[type]} el [description]
         * @param  {[type]} e  [description]
         * @return {[type]}    [description]
         */
        getCoord: function(el, e) {
            var coord = SB.events.coord(e)
            coord[0] -= el.offsetLeft;
            coord[1] -= el.offsetTop;
            return coord;
        },


        /**
         * [ description]
         * @param  {[type]} el   [description]
         * @param  {[type]} tipo [description]
         * @return {[type]}      [description]
         */
        off: function(el, tipo, fn) {
            //as for binding
            if (el instanceof Array) {
                for (var i = 0, l = el.length; i < l; i++) {
                    _.events.unbind(el[i], tipo, fn);
                }
                return;
            }
            _.events.unbind(el, tipo, fn);
        },

        /**
         * [ description]
         * @param  {[type]}   el   [description]
         * @param  {[type]}   tipo [description]
         * @param  {Function} fn   [description]
         * @return {[type]}        [description]
         */
        one: function(el, tipo, fn) {
            var self = SB.events,
                i, l;
            if (el instanceof Array) {
                for (i = 0, l = el.length; i < l; i++) {
                    self.one(el[i], tipo, fn);
                }
                return;
            }
            self.on(el, tipo, function f(e) {
                fn(e); 
                self.off(el, tipo, f);
            });
        },

        /**
         * Very experimental function to bind a function to
         * a click triggered outside of a node tree
         * @param  {[type]}   el [description]
         * @param  {Function} cb [description]
         * @return {[type]}      [description]
         * @sample http://www.jmvc.dev
         * || var tr = JMVC.dom.find('#extralogo');
         * || JMVC.events.clickout(tr, function (){console.debug('out')});
         */
        onEventOut: function(evnt, el, cb) {
            var self = SB.events;

            self.on(WD.body, evnt, function f(e) {
                var trg = self.eventTarget(e);
                while (trg !== el) {
                    trg = SB.dom.parent(trg);
                    if (trg === WD.body) {
                        self.off(WD.body, evnt, f);
                        return cb();
                    }
                }
            });
        },

        /**
         * [onEsc description]
         * @param  {Function} cb [description]
         * @param  {[type]}   w  [description]
         * @return {[type]}      [description]
         */
        onEsc: function (cb, w) {
            w = w || W;
            SB.events.on(w.document, 'keyup', function (e) {
                if (e.keyCode == 27) {
                    cb.call(w, e);
                }
            });
        },

        /**
         * [onRight description]
         * @param  {[type]} el [description]
         * @param  {[type]} f  [description]
         * @return {[type]}    [description]
         */
        onRight: function(el, f) {
            SB.events.disableRightClick();
            SB.events.on(el, 'mousedown', function(e) {

                if (~~(e.button) === 2) {
                    f.call(el, e);
                }
            });
        },

        /**
         * [ description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        kill: function(e) {
            if (!e) {
                e = W.event;
                e.cancelBubble = true;
                e.returnValue = false;
            }
            'stopPropagation' in e && e.stopPropagation() && e.preventDefault();
            return false;
        },

        /**
         * [ description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        preventDefault: function(e) {
            e = e || W.event;

            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },

        /**
         * [description]
         */
        ready : (function () {
            var cb = [],
                readyStateCheckInterval = setInterval(function() {
                    if (document.readyState === "complete") {
                        clearInterval(readyStateCheckInterval);
                        for (var i = 0, l = cb.length; i < l; i++) {
                            cb[i].call(this);
                        }
                    }
                }, 10);
            return function (c) {
                if (document.readyState === "complete") {
                    c.call(this);
                } else {
                    cb.push(c);
                }
            };
        })(),

        /**
         * [ description]
         * @param  {[type]} f [description]
         * @return {[type]}   [description]
         */
        start: function(f) {
            _.events.Estart.push(f);
        },

        /**
         * [ description]
         * @return {[type]} [description]
         */
        startRender: function() {
            var i = 0,
                l = _.events.Estart.length;
            for (null; i < l; i += 1) {
                _.events.Estart[i]();
            }
        },

        /**
         * [stopBubble description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        stopBubble: function(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.cancelBubble !== null) {
                e.cancelBubble = true;
            }
        },

        /**
         * [ description]
         * @param  {[type]} left [description]
         * @param  {[type]} top  [description]
         * @return {[type]}      [description]
         */
        scrollBy: function(left, top) {
            SB.events.delay(function() {
                W.scrollBy(left, top);
            }, 1);
        },

        /**
         * [ description]
         * @param  {[type]} left [description]
         * @param  {[type]} top  [description]
         * @return {[type]}      [description]
         */
        scrollTo: function(left, top) {
            SB.events.delay(function() {
                W.scrollTo(left, top);
            }, 1);
        },

        /**
         * [ description]
         * @param  {[type]} e [description]
         * @return {[type]}   [description]
         */
        touch: function(e) {
            var touches = [],
                i = 0,
                ect = e.touches,
                l = ect.length;

            for (null; i < l; i += 1) {
                touches.push({
                    x: ect[i].pageX,
                    y: ect[i].pageY
                });
            }
            return touches;
        },



        trigger : function (elem, ev) {
            if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent(ev, false, true);
                elem.dispatchEvent(evt);
            } else {
                elem.fireEvent("on" + ev);
            }
        },

        /**
         * [unload description]
         * @return {[type]} [description]
         */
        unload: function (){
            SB.events.on(W, 'beforeunload', function (e) {
                
                var confirmationMessage = /\//;//'Are you sure to leave or reload this page?';//"\o/";
                (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
                return confirmationMessage; 
                
                
            });
        }
    };



    // blur all clicks
    SB.events.blurAllAnchorClicks();


    if (!Event.prototype.preventDefault) {
        Event.prototype.preventDefault = function() {
            this.returnValue = false;
        };
    }
    if (!Event.prototype.stopPropagation) {
        Event.prototype.stopPropagation = function() {
            this.cancelBubble = true;
        };
    }
    //-----------------------------------------------------------------------------




    _.events.drag = {
        gd1 : false,
        getDirection : function (e) {
            var gd1 = this.gd1,
                gd2 = SB.events.coord(e),
                d,
                directions = [
                    'o','no', 'no',
                    'n', 'n', 'ne', 'ne',
                    'e', 'e', 'se', 'se',
                    's', 's', 'so', 'so',
                    'o'
                ];
            
            d = Math.atan2(gd2[1] - gd1[1], gd2[0] - gd1[0]) * 180 / (Math.PI);
            SB.events.drag.direction = d.toFixed(2);
            SB.events.drag.orientation = directions[~~(((d + 180) % 360) / 22.5)] ;
            return true;
        }

    };

    SB.events.drag = {
        
        direction : false,
        
        orientation : false,

        on : function (el, fn) {
            
            
            
            var fStart = fn.start || function () {},
                fMove = fn.move || function () {},
                fEnd = fn.end || function () {},
                mmove = function (e) {

                    _.events.drag.getDirection(e);

                    var tmp = SB.events.coord(e),
                        dst = Math.sqrt((tmp[1] - _.events.drag.gd1[1]) * (tmp[1] - _.events.drag.gd1[1])
                            + (tmp[0] - _.events.drag.gd1[0]) * (tmp[0] - _.events.drag.gd1[0])
                        );
                    fMove.call(e, e, {
                        start : _.events.drag.gd1,
                        current : tmp,
                        direction : SB.events.drag.direction,
                        orientation : SB.events.drag.orientation,
                        distance : dst
                    });
                },
                mup = function (e) {

                    // not for sure attached, will be caugth an exception
                    // by _.events.unbind
                    
                    SB.events.off(el, 'mousemove');
                    SB.events.off(el, 'touchmove');
                    var tmp = SB.events.coord(e),
                        dst = Math.sqrt((tmp[1] - _.events.drag.gd1[1]) * (tmp[1] - _.events.drag.gd1[1])
                            +
                            (tmp[0] - _.events.drag.gd1[0]) * (tmp[0] - _.events.drag.gd1[0])
                        );
                    
                    fEnd.call(e, e, {
                        start : _.events.drag.gd1,
                        current : SB.events.coord(e),
                        direction : SB.events.drag.direction,
                        orientation : SB.events.drag.orientation,
                        distance : dst
                    });
                };

            SB.events.on(el, 'mousedown', function (e) {    
                _.events.drag.gd1 = SB.events.coord(e);
                fStart.call(e, e, {start : _.events.drag.gd1});
                SB.events.on(el, 'mousemove', mmove);
            });

            SB.events.on(el, 'mouseup', mup);
            
            SB.events.on(el, 'touchstart', function (e) {    
                _.events.drag.gd1 = SB.events.coord(e);
                fStart.call(e, e, {start : _.events.drag.gd1});
                SB.events.on(el, 'touchmove', mmove);
            });
            SB.events.on(el, 'touchend', mup);
        },

        off : function (el, f) {
            SB.events.on(el, 'mouseup', f);
            SB.events.on(el, 'touchend', f);
        }
    };




    /* From Modernizr */
    SB.events.transitionEnd = (function () {
        var n = document.createElement('fake'),
            k,
            trans = {
              'transition':'transitionend',
              'OTransition':'oTransitionEnd',
              'MozTransition':'transitionend',
              'WebkitTransition':'webkitTransitionEnd'
            };
        for(k in trans){
            if (n.style[k] !== undefined ){
                return trans[k];
            }
        }
    })();


    SB.events.doTab = function (el) {
        el.onkeydown = function (e) {
            var textarea = this,
                input,
                remove,
                posstart,
                posend,
                compensateForNewline,
                before,
                after,
                selection,
                val;

            if (e.keyCode == 9) { // tab
                input = textarea.value; // as shown, `this` would also be textarea, just like e.target
                remove = e.shiftKey;
                posstart = textarea.selectionStart;
                posend = textarea.selectionEnd;

                // if anything has been selected, add one tab in front of any line in the selection
                if (posstart != posend) {
                    posstart = input.lastIndexOf('\n', posstart) + 1;
                    compensateForNewline = input[posend - 1] == '\n';
                    before = input.substring(0, posstart);
                    after = input.substring(posend - (~~compensateForNewline));
                    selection = input.substring(posstart, posend);

                    // now add or remove tabs at the start of each selected line, depending on shift key state
                    // note: this might not work so good on mobile, as shiftKey is a little unreliable...
                    if (remove) {
                        if (selection[0] == '\t') {
                            selection = selection.substring(1);
                        }
                        selection = selection.split('\n\t').join('\n');
                    } else {
                        selection = selection.split('\n');
                        if (compensateForNewline){
                            selection.pop();    
                        } 
                        selection = '\t'+selection.join('\n\t');
                    }

                    // put it all back in...
                    textarea.value = before+selection+after;
                    // reselect area
                    textarea.selectionStart = posstart;
                    textarea.selectionEnd = posstart + selection.length;
                } else {
                    val = textarea.value;
                    textarea.value = val.substring(0,posstart) + '\t' + val.substring(posstart);
                    textarea.selectionEnd = textarea.selectionStart = posstart + 1;
                }
                e.preventDefault(); // dont jump. unfortunately, also/still doesnt insert the tab.
            }
        }
    };
}();

SB.makeNS('SB/mobile');
SB.mobile = {
    deviceOrientation : function (f, absolute) {
        
        SB.events.on(window, 'deviceorientation', function (e) {
            e.absolute = typeof absolute !== 'undefined'
                        && (e.absolute = absolute);
            f({
                alpha : e.alpha,
                beta : e.beta,
                gamma : e.gamma,
                e : e
            });
        });
    },
    deviceMotion : function (f) {
        SB.events.on(window, 'devicemotion', function (e) {
            f({
                accX : e.acceleration.x,
                accY : e.acceleration.y,
                accZ : e.acceleration.z,
                accGX : e.accelerationIncludingGravity.x,
                accGY : e.accelerationIncludingGravity.y,
                accGZ : e.accelerationIncludingGravity.z,
                accAlpha : e.rotationRate.alpha,
                accBeta : e.rotationRate.beta,
                accGamma : e.rotationRate.gamma,
                interval : e.interval,
                e : e
            });
        });
    }
};
/*
[Malta] ../string.js
*/
// -----------------+
// STRING sub-module |
// -----------------+

// private section

// public section
SB.string = {
    /**
     * [ description]
     * @param  {Array[int]} code [description]
     * @return {[type]}      [description]
     */
    code2str : function (code) {
        return String.fromCharCode.apply(null, code);
    },

    /**
     * [ description]
     * @param  {[type]} str [description]
     * @param  {[type]} pwd [description]
     * @return {[type]}     [description]
     */
    str2code : function (str) {
        var out = [],
            i = 0,
            l = str.length;
        while (i < l) {
            out.push(str.charCodeAt(i));
            i += 1;
        }
        return out;
    }
};
/*
[Malta] ../crypt.js
*/
// type : FACTOY_METHOD

SB.makeNS('SB/security');

SB.security = (function () {

	var seed = 24523;
	// var seed = 2;

	return {

		// seed : 3,
		seed : seed,

		useEncoding : false,

		crypt : function (msg, pwd) {
			var code_pwd = SB.string.str2code(pwd),
				code_msg = [].concat(SB.string.str2code(escape(msg)), code_pwd),
				cout = [],
				lm = code_msg.length,
				lp = code_pwd.length,
				i = 0,
				j = 0,
				t,
				out;
			while (i < lm) {
				t = code_msg[i]  + code_pwd[j] + SB.security.seed;
				cout.push(t);
				i += 1;
				j = (j + 1) % lp;
			}
			out = SB.string.code2str(cout);
			
			return SB.security.useEncoding ? encodeURIComponent( out ) : out;
		}
		/*
		decrypt : function (cmsg, pwd) {
			pwd = pwd + "";
			if (JMVC.security.useEncoding) cmsg = decodeURIComponent(cmsg);
			var code_cmsg = JMVC.string.str2code(cmsg),
				code_pwd = JMVC.string.str2code(pwd),
				out = [],
				lm = code_cmsg.length,
				lp = code_pwd.length,
				i = 0,
				j = 0,
				t;

			while(i < lm) {
				t = code_cmsg[i]  - code_pwd[j] - JMVC.security.seed;
				out.push(t);
				i += 1;
				j = (j + 1) % lp;
			}

			var out = unescape(JMVC.string.code2str(out)),
				mat = out.match(new RegExp('^(.*)' + pwd + '$'));
			return mat ? mat[1] : false;
		}
		*/
	};
})(); 

/*
[Malta] ../channel.js
*/
/**
 * [Channel description]
 * @param {[type]} n [description]
 */
SB.Channel = (function () {
    var channels = {},

        // function added to free completely
        // that object from dependencies
        // 
        findInArray = function (arr, mvar) {
            //IE6,7,8 would fail here
            if ('indexOf' in arr) {
                return arr.indexOf(mvar);
            }
            var l = arr.length - 1;
            while (arr[l] !== mvar) {
                l--;
            }
            return l;
        },

        _Channel = function () {
            this.topic2cbs = {};
            this.lateTopics = {};
            this.enabled = true;
        };

    /**
     * [prototype description]
     * @type {Object}
     */
    _Channel.prototype = {
        /**
         * enable cb execution on publish
         * @return {undefined}
         */
        enable : function () {
            this.enabled = true;
        },

        /**
         * disable cb execution on publish
         * @return {undefined}
         */
        disable : function () {
            this.enabled = false;
        },

        /**
         * publish an event on that channel
         * @param  {String} topic
         *                  the topic that must be published
         * @param  {Array} args
         *                 array of arguments that will be passed
         *                 to every callback
         * @return {undefined}
         */
        pub : function (topic, args) {
            var i = 0,
                l;
            if (!(topic in this.topic2cbs) || !this.enabled) {
                //save it for late pub, at everysub to this topic
                if (topic in this.lateTopics) {
                    this.lateTopics[topic].push({args : args});
                } else {
                    this.lateTopics[topic] = [{args : args}];
                }
                return false;
            }
            for (l = this.topic2cbs[topic].length; i < l; i += 1) {
                this.topic2cbs[topic][i].apply(null, [topic].concat(args));
            }
            return true;
        },

        /**
         * add a callback to a topic
         * @param {String} topic
         *                 the topic that must be published
         * @param {Function} cb
         *                   the callback will receive as first
         *                   argument the topic, the others follow
         * @return {undefined}
         */
        sub : function (topic, cb, force) {
            var i = 0,
                l;
            if (topic instanceof Array) {
                for (l = topic.length; i < l; i += 1) {
                    this.sub(topic[i], cb, force);
                }
            }
            if (!(topic in this.topic2cbs) || !this.enabled) {
                this.topic2cbs[topic] = [];
            }
            if (!force && findInArray(this.topic2cbs[topic], cb) >= 0) {
                return this;
            }

            this.topic2cbs[topic].push(cb);

            // check lateTopics
            // save it for late pub, at everysub to this topic
            //
            if (topic in this.lateTopics) {
                for (i = 0, l = this.lateTopics[topic].length; i < l; i++) {                    
                    cb.apply(null, [topic].concat(this.lateTopics[topic][i].args));
                }
            }
        },

        /**
         * removes an existing booked callback from the topic list
         * @param  {[type]}   topic [description]
         * @param  {Function} cb    [description]
         * @return {[type]}         [description]
         */
        unsub : function (topic, cb) {
            var i = 0,
                l;
            if (topic instanceof Array) {
                for (l = topic.length; i < l; i += 1) {
                    this.unsub(topic[i], cb);
                }
            }
            // topic = topic + '_' + SM.aid;
            
            if (topic in this.topic2cbs) {
                i = findInArray(this.topic2cbs[topic], cb);
                if (i >= 0) {
                    this.topic2cbs[topic].splice(i, 1);
                }
            }
            if (topic in this.lateTopics) {
                i = findInArray(this.lateTopics[topic], cb);
                if (i >= 0) {
                    this.lateTopics[topic].splice(i, 1);
                }
            }
            return this;
        },
        
        /**
         * one shot sub with auto unsub after first shot
         * @param  {[type]}   topic [description]
         * @param  {Function} cb    [description]
         * @return {[type]}         [description]
         */
        once : function (topic, cb){
            var self = this;
            function cbTMP() {
                cb.apply(null, Array.prototype.slice.call(arguments, 0));
                self.unsub(topic, cbTMP);
            };
            this.sub(topic, cbTMP);
        },

        /**
         * Removes all callbacks for one or more topic
         * @param [String] ...
         *                 the topic queues that must  be emptied
         * @return [Channel] the instance
         */
        reset : function () {
            var ts = Array.prototype.slice.call(arguments, 0),
                l = ts.length,
                i = 0;
            if (!l) {
                this.topic2cbs = {};
                this.lateTopics = {};
                return this;
            }
            for (null; i < l; i += 1) {
                ts[i] in this.topic2cbs && (this.topic2cbs[ts[i]] = []);
                ts[i] in this.lateTopics && (this.lateTopics[ts[i]] = []);
            }
            return this;
        }
    };

    /**
     * returning function
     */
    return function (name) {
        if (!(name in channels)) {
            channels[name] = new _Channel();
        }
        return channels[name];
    };
})();
/*
[Malta] ../widgzard.js
*/
/**

      _/          _/  _/_/_/  _/_/_/      _/_/_/  _/_/_/_/_/    _/_/    _/_/_/    _/_/_/    
     _/          _/    _/    _/    _/  _/              _/    _/    _/  _/    _/  _/    _/   
    _/    _/    _/    _/    _/    _/  _/  _/_/      _/      _/_/_/_/  _/_/_/    _/    _/    
     _/  _/  _/      _/    _/    _/  _/    _/    _/        _/    _/  _/    _/  _/    _/     
      _/  _/      _/_/_/  _/_/_/      _/_/_/  _/_/_/_/_/  _/    _/  _/    _/  _/_/_/   


 * Widgzard module
 * 
 * Create an arbitrary dom tree json based allowing for each node to 
 * specify a callback that will be called only when either
 *   > the node is appended (in case the node is a leaf)
 * ||
 *   > every child has finished (explicitly calling the done function on his context)
 *
 * @author Federico Ghedina <fedeghe@gmail.com>
 *
 *
 *
 * PLEASE read this : http://stackoverflow.com/questions/1915341/whats-wrong-with-adding-properties-to-dom-element-objects
 */
(function (W){
    
    'use strict';    

    // clearer class that should provide right
    // css float clearing
    // ex: TB uses `clearfix`, I don`t
    // 
    var clearerClassName = 'clearer', 
        nodeIdentifier = 'wid',
        autoclean = true,
        debug = false,
        Wproto = Wnode.prototype,
        Promise,
        htmlspecialchars, delegate, eulerWalk,
        noop = function () {};

    /**
     * Main object constructor represeting any node created
     * @param {[type]} conf the object that has the information about the node
     *                      that will be created
     * @param {[type]} trg  the DomNODE where the element will be appended to
     * @param {[type]} mapcnt an object used to allow the access from any node
     *                        to every node that has the gindID attribute
     */
    function Wnode(conf, trg, mapcnt) {

        // save a reference to the instance
        // 
        var self = this,

            // the tag used for that node can be specified in the conf
            // otherwise will be a div (except for 'clearer') 
            tag = conf.tag || "div";

        // save a reference to the target parent for that node
        // by means of the callback promise chain, in fact the 
        // real parent for the node can even be different as 
        // specified in the conf.target value
        // 
        this.target = trg;

        // create the node
        // 
        this.node = document.createElement(tag);


        //this.target.childrens = [];


        // save a reference to the node configuration
        // will be useful on append to append to conf.target
        // if specified
        //
        this.conf = conf;

        // save a reference to the node callback if speficied
        // otherwise create a function that do nothing but
        // freeing the parent promise from waiting
        //
        this.WIDGZARD_cb = conf.cb || function () {
            debug && console.log('autoresolving  ', self.node);
            // autoresolve
            self.resolve();
        };

        
        // a reference the the root
        //
        this.root = mapcnt.root;

        // save a reference to the parent
        // 
        this.parent = trg;

        // save a reference to a brand new Promise
        // the Promise.node() will be called as far as
        // all the child elements cb have called 
        // this.done OR this.resolve
        // 
        this.WIDGZARD_promise = Promise.create();

        // When called Promise.done means that 
        // the parent callback can be called
        // delegating the parent context
        //
        this.WIDGZARD_promise.then(self.WIDGZARD_cb, self);

        // as said at the beginning every node keeps a reference
        // to a function that allow to get a reference to any
        // node that in his configuration has a `nodeIdentifier` value
        // specified
        //
        this.map = mapcnt.map;



        //function to abort all
        this.abort = mapcnt.abort;

        // publish in the node the getNode fucntion that allows for
        // getting any node produced from the same json having a 
        // `nodeIdentifier` with a valid value
        this.getNode = mapcnt.getNode;


        // get all nodes mapped
        this.getNodes = mapcnt.getNodes;

        // how many elements are found in the content field?
        // that counter is fundamental for calling this node
        // callback only when every child callback has done
        // 
        this.WIDGZARD_len = conf.content ? conf.content.length : 0;

        // through these two alias from within a callback
        // (where the DOMnode is passed as context)
        // the have to declare that has finished
        // if the count is nulled it means that the promise 
        // is done, thus it`s safe to call its callback
        //
        this.done = this.resolve = this.solve = function () {
          
            // if all the child has called done/resolve
            // it`s time to honour the node promise,
            // thus call the node callback
            //
            if (--self.target.WIDGZARD_len == 0) {
                if (self.target.WIDGZARD_promise) {
                    self.target.WIDGZARD_promise.done();
                } else {
                    self.target.WIDGZARD_cb();   
                }
            }

        };

        this.lateWid = mapcnt.lateWid;
    }


    /**
     * save a function to climb up n-parent
     * @param  {[type]} n [description]
     * @return {[type]}   [description]
     */
    Wproto.climb = function (n) {
        n = n || 1;
        var ret = this;
        while (n--) {
            ret = ret.parent;
        }
        return ret;
    };


    /**
     * and one to go down
     * @return {[type]} [description]
     */
    Wproto.descendant = function () {
        var self = this,
            args = Array.prototype.slice.call(arguments, 0),
            i = 0,
            res = self,
            l = args.length;
        if (!l) return res;
        while (i < l) {
            res = res.childrens[~~args[i++]];
        }
        return res;
    };

    /**
     * Set neo attributes
     * @param {DOMnode} node  the node
     * @param {Object} attrs  the hash of attributes->values
     */
    Wproto.setAttrs = function (node, attrs) {
        // if set, append all attributes (*class)
        // 
        if (typeof attrs !== 'undefined') { 
            for (var j in attrs) {
                if (j !== 'class') {
                    if (j !== 'style') {
                        node.setAttribute(j, attrs[j]);
                    } else {
                        this.setStyle(node, attrs.style);
                    }
                } else {
                    node.className = attrs[j];
                }
            }
        }
        return this;
    };

    /**
     * Set node inline style
     * @param {DOMnode} node  the node
     * @param {Object} style  the hash of rules
     */
    Wproto.setStyle = function (node, style) {
        // if set, append all styles (*class)
        //
        if (typeof style !== 'undefined') { 
            for (var j in style) {
                node.style[j.replace(/^float$/i, 'cssFloat')] = style[j];
            }
        }
        return this;
    };

    /**
     * Set node data
     * @param {DOMnode} node  the node
     * @param {Object} data   the hash of properties to be attached
     */
    Wproto.setData = function (el, data) {
        el.data = data || {};
        return this;
    };

    /**
     * [checkInit description]
     * @param  {[type]} el [description]
     * @return {[type]}    [description]
     */
    Wproto.checkInit = function (el, conf) {
        var keepRunning = true;
        if ('init' in conf && typeof conf.init === 'function') {
            keepRunning = conf.init.call(el);
            !keepRunning && el.abort();
        }
        return this;
    }

    /**
     * [checkInit description]
     * @param  {[type]} el [description]
     * @return {[type]}    [description]
     */
    Wproto.checkEnd = function (el, conf) {
        if ('end' in conf && typeof conf.end === 'function') {
            this.root.endFunctions.push(function () {conf.end.call(el);});
        }
        return this;
    }
    
    /**
     * add method for the Wnode
     */
    Wproto.add = function () {

        var conf = this.conf,
            node = this.node;

        // set attributes and styles
        // 
        this.setAttrs(node, conf.attrs)
            .setStyle(node, conf.style)
            .setData(this, conf.data)
            .checkInit(this, conf)
            .checkEnd(this, conf);

        // if `html` key is found on node conf 
        // inject its value
        //
        typeof conf.html !== 'undefined' && (node.innerHTML = conf.html);

        // if the node configuration has a `nodeIdentifier` key
        // (and a String value), the node can be reached 
        // from all others callback invoking
        // this.getNode(keyValue)
        //
        
        if (typeof conf[nodeIdentifier] !== 'undefined') {
            this.map[conf[nodeIdentifier]] = this;
        }

        // if the user specifies a node the is not the target 
        // passed to the constructor we use it as destination node
        // (node that in the constructor the node.target is always
        // the target passed)
        // 
        (conf.target || this.target.node).appendChild(node);

        if (!('childrens' in (conf.target || this.target))) {
            (conf.target || this.target).childrens = [];
        }
        (conf.target || this.target).childrens.push(this);
        this.WIDGZARD = true;

        // if the node configuration do not declares content array
        // then the callback is executed.
        // in the callback the user is asked to explicitly declare
        // that the function has finished the work invoking
        // this.done() OR this.resolve()
        // this is the node itself, those functions are attached
        // 
        (!conf.content || conf.content.length == 0) && this.WIDGZARD_cb.call(this);

        // chain
        return this;
    };


    function cleanupWnode(trg) {
        var node = trg.node,
            removeNode = function (t) {
                t.parentNode.removeChild(t);
                return true;
            },
            nodesToBeCleaned = [],
            keys = [
                'WIDGZARD', 'WIDGZARD_cb', 'WIDGZARD_promise', 'WIDGZARD_length',
                'parent', 'getNode', 'climb', 'root', 'done', 'resolve', 'data'
            ],
            kL = keys.length,
            i = 0, j = 0, k = 0,
            n = null;
        
        // pick up postorder tree traversal
        eulerWalk(node, function (n) {
            //skip root & text nodes
            n !== node && n.nodeType != 3 && nodesToBeCleaned.push(n) && k++;
        }, 'post');
        
        while (j < k) {
            n = nodesToBeCleaned[j++];
            while (i < kL) n[keys[i++]] = null;
            removeNode(n);
        }

        nodesToBeCleaned = null, keys = null;

        return true;
    }

    /**
     * PUBLIC function to render Dom from Json
     * @param  {Object} params the configuration json that contains all the 
     *                         information to build the dom :
     *                         target : where to start the tree
     *                         content : what to create
     *                         {cb} : optional end callback
     *                         {style} : optional styles for the target Node
     *                         {attrs} : optionsl attributes to be added at the target Node
     *                         
     * @param  {boolean} clean whether or not the target node must be emptied before
     *                         creating the tree inside it.
     * @return {undefined}
     */
    function render (params, clean) {

        if ((typeof params).match(/string/i)) {
            SB.io.get(params, function (j) {
                window.eval(j);
            });
            return;
        }


        var target = {
                node : params.target || document.body,
                endFunctions : []
            },
            targetFragment = {
                node : document.createDocumentFragment('div')
            },
            active = true;

        // debug ? 
        debug = !!params.debug;

        // maybe cleanup previous
        //
        autoclean && target.WIDGZARD && cleanupWnode(target)

        if (!params) {
            throw new Exception('ERROR : Check parameters for render function');
        }

        // a literal used to save a reference 
        // to all the elements that need to be 
        // reached afterward calling this.getNode(id)
        // from any callback
        // 
        var mapcnt = {
            root : target,
            map : {},
            getNode : function (id) {
                return mapcnt.map[id] || false;
            },
            getNodes : function () {
                return mapcnt.map;
            },
            abort : function () {
                active = false;
                target.node.innerHTML = '';
                return false;
            },
            lateWid : function (wid) {
                mapcnt.map[wid] = this;
            }
        };

        // rape Node prototype funcs
        // to set attributes & styles
        // and check init function 
        // 
        Wproto
            .setAttrs(target.node, params.attrs)
            .setStyle(target.node, params.style)
            .setData(target, params.data)
            .setData(targetFragment, params.data);

        target.descendant = Wproto.descendant;
        targetFragment.descendant = Wproto.descendant;
        // maybe clean
        // 
        if (!!clean) target.node.innerHTML = '';

        // maybe a raw html is requested before treating content
        // 
        if (typeof params.html !== 'undefined') {
            target.node.innerHTML = params.html;
        }
        
        // initialize the root node to respect what is needed
        // by the childs node Promise 
        // 
        // - len : the lenght of the content array
        // - cb : exactly the end callback
        // 
        target.WIDGZARD_len = params.content ? params.content.length : 0;
        targetFragment.WIDGZARD_len = params.content ? params.content.length : 0;

        targetFragment.WIDGZARD_cb = target.WIDGZARD_cb = function () {
            active 
            &&
            target.node.appendChild(targetFragment.node)
            &&
            params.cb && params.cb.call(target);

            //ending functions
            //
            if (target.endFunctions.length) {
                for (var i = 0, l = target.endFunctions.length; i < l; i++) {
                    target.endFunctions[i]();
                }
            }
        };

        // flag to enable cleaning
        //
        target.WIDGZARD = true;

        // allow to use getNode & getNodes from root
        // 
        target.getNode = targetFragment.getNode = mapcnt.getNode;
        target.getNodes = targetFragment.getNodes = mapcnt.getNodes;
        target.abort = targetFragment.abort = mapcnt.abort;


        // what about a init root function?
        // 
        Wproto.checkInit(targetFragment, params);

        // start recursion
        //
        (function recur(cnf, trg){
            if (!active) {
                return false;
            }
            // change the class if the element is simply a "clearer" String
            // 
            if (cnf.content) {
                for (var i = 0, l = cnf.content.length; i < l; i++) {
                    if (cnf.content[i] === clearerClassName) {
                        cnf.content[i] = {
                            tag : 'br',
                            attrs : {'class' : clearerClassName}
                        };
                    }
        
                    recur(cnf.content[i], new Wnode(cnf.content[i], trg, mapcnt).add());
                }
            }
        })(params, targetFragment);

        // if no content in the root there are no childs
        // thus, let the cb execute
        // 
        if (!('content' in params)) {
            targetFragment.WIDGZARD_cb();
        }

        return target;
    }

    // MY WONDERFUL Promise Implementation
    // 
    Promise = (function() {
        var _Promise = function() {
                this.cbacks = [];
                this.solved = false;
                this.result = null;
            },
            proto = _Promise.prototype;
        /**
         * [then description]
         * @param  {[type]} func [description]
         * @param  {[type]} ctx  [description]
         * @return {[type]}      [description]
         */
        proto.then = function(func, ctx) {
            var self = this,
                f = function() {
                    self.solved = false;
                    func.apply(ctx || self, [ctx || self, self.result]);
                };
            if (this.solved) {
                f();
            } else {
                this.cbacks.push(f);
            }
            return this;
        };

        /**
         * [done description]
         * @return {Function} [description]
         */
        proto.done = function() {
            var r = [].slice.call(arguments, 0);
            this.result = r;
            this.solved = true;
            if (!this.cbacks.length) {
                return this.result;
            }
            this.cbacks.shift()(r);
        };

        /**
         * [chain description]
         * @param  {[type]} funcs [description]
         * @param  {[type]} args  [description]
         * @return {[type]}       [description]
         */
        function chain(funcs, args) {

            var p = new _Promise();
            var first = (function() {

                    funcs[0].apply(p, [p].concat([args]));
                    return p;
                })(),
                tmp = [first];

            for (var i = 1, l = funcs.length; i < l; i++) {
                tmp.push(tmp[i - 1].then(funcs[i]));
            }
            return p;
        }

        /**
         * [join description]
         * @param  {[type]} pros [description]
         * @param  {[type]} args [description]
         * @return {[type]}      [description]
         */
        function join(pros, args) {
            var endP = new _Promise(),
                res = [],
                stack = [],
                i = 0,
                l = pros.length,
                limit = l,
                solved = function (remainder) {
                    !remainder && endP.done.apply(endP, res);
                };

            for (null; i < l; i++) {
                (function (k) {
                    stack[k] = new _Promise();

                    // inside every join function the context is a Promise, and
                    // is possible to return it or not 
                    var _p = pros[k].apply(stack[k], [stack[k], args]);
                    (_p instanceof _Promise ? _p : stack[k])
                    .then(function (p, r) {
                        res[k] = r;
                        solved(--limit);
                    });
                })(i);
            }
            return endP;
        }

        /* returning module
        */
        return {
            create: function() {
                return new _Promise();
            },
            chain: chain,
            join: join
        };
    })();

    /**
     * [get description]
     * @param  {[type]} params [description]
     * @return {[type]}        [description]
     */
    function get (params) {
        var r = document.createElement('div');
        params.target = r;
        render(params);
        return r;
    }


    function cleanup(trg){
        render({target : trg, content : [{html : "no content"}]}, true);
    }
    
    // SB.Widgzard.load('js/_index.js');
    function load (src) {
        var s = document.createElement('script');
        document.getElementsByTagName('head')[0].appendChild(s);
        s.src = src;
        
        // when finished remove the script tag
        s.onload = function () {
            s.parentNode.removeChild(s);
        }
    };

    /**
     * [eulerWalk description]
     * @param  {[type]} root [description]
     * @param  {[type]} func [description]
     * @param  {[type]} mode [description]
     * @return {[type]}      [description]
     */
    eulerWalk = function (root, func, mode) {
        mode = {pre : 'pre', post : 'post'}[mode] || 'post';
        var nope = function () {},
            pre = mode === 'pre' ? func : nope,
            post = mode === 'post' ? func : nope,
            walk = (function () {
                return function (n_, _n) {
                    pre(n_);
                    _n = n_.firstChild;
                    while (_n) {
                        walk(_n);
                        _n = _n.nextSibling;
                    }
                    post(n_);
                };
            })();
        walk(root);
    };

    /**
     * Dummy delegation function 
     * @param  {[type]} func [description]
     * @param  {[type]} ctx  [description]
     * @return {[type]}      [description]
     */
    delegate = function (func, ctx) {
    
        // get relevant arguments
        // 
        var args = Array.prototype.slice.call(arguments, 2);
        
        // return the function
        //
        return function() {
            return func.apply(
                ctx || window,
                [].concat(args, Array.prototype.slice.call(arguments))
            );
        };
    };

    /**
     * [htmlspecialchars description]
     * @param  {[type]} c [description]
     * @return {[type]}   [description]
     */
    htmlspecialchars = function (c) {
        return '<pre>' +
            c.replace(/&(?![\w\#]+;)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;') +
        '</pre>';
    };

    // publish module
    SB.makeNS('SB/Widgzard', {
        render : render,
        cleanup : cleanup,
        get : get,
        load : load,
        htmlspecialchars : htmlspecialchars,
        Promise : Promise
    });

})(this);
/*
[Malta] ../cookie.js
*/
SB.makeNS('SB/cookie');

~function () {

	SB.cookie = {
		cookie_nocookiesaround : false,

		set : function (name, value, expires, path, domain, secure) {
			"use strict";
			this.cookie_nocookiesaround = false;
			var today = new Date(),
				expires_date = new Date(today.getTime() + expires);
			expires && (expires = expires * 1000 * 60 * 60 * 24);
			window.document.cookie = name +
				"=" + window.escape(value) +
				(expires ? ";expires=" + expires_date.toGMTString() : "") +
				(path ? ";path=" + path : "") +
				(domain ? ";domain=" + domain : "") +
				(secure ? ";secure" : "");
			return true;
		},

		get : function (check_name) {
			"use strict";
			var a_all_cookies = window.document.cookie.split(';'),
				a_temp_cookie = '',
				cookie_name = '',
				cookie_value = '',
				b_cookie_found = false,
				i = 0,
				l = a_all_cookies.length;
			for (null; i < l; i += 1) {
				a_temp_cookie = a_all_cookies[i].split('=');
				cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
				if (cookie_name === check_name) {
					b_cookie_found = true;
					a_temp_cookie.length > 1 && (cookie_value = window.unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, '')));
					return cookie_value;
				}
				a_temp_cookie = null;
				cookie_name = '';
			}
			return b_cookie_found;
		},

		del : function (name, path, domain) {
			"use strict";
			var ret = false;
			if (this.get(name)) {
				window.document.cookie = name + "=" + (path ? ";path=" + path : "") + (domain ? ";domain=" + domain : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
				ret = true;
			}
			return ret;
		},

		getall : function () {
			"use strict";
			var ret = [],
				tmp, i = 0, l, t;
			if (window.document.cookie === '') {
				return ret;
			}
			if (this.cookie_nocookiesaround) {
				return ret;
			} else {
				tmp = window.document.cookie.split(';');
				l = tmp.length;
				while (i < l) {
					t = tmp[i++].split(';');
					tmp.push({name : t[0], value : t[1]});
				}
			}
			return ret;
		}
	};

}();

/*
[Malta] ../canvas.js
*/
(function (){

    var TO_RADIANS = Math.PI/180; 

    SB.canvas = {

        drawRotatedImage : function (ctx, image, x, y, angle, size) { 
         
            // save the current co-ordinate system 
            // before we screw with it
            ctx.save(); 
         
            // move to the middle of where we want to draw our image
            ctx.translate(x + image.height/2, y + image.height/2);
         
            // rotate around that point, converting our 
            // angle from degrees to radians 
            ctx.rotate(angle * TO_RADIANS);
         
            // draw it up and to the left by half the width
            // and height of the image 
            ctx.drawImage(image, -(image.width/2), -(image.height/2), size, size);
         
            // and restore the co-ords to how they were when we began
            ctx.restore(); 
        }
    };

})();

/*
[Malta] ../i18n.js
*/
SB.makeNS('SB/i18n');
(function () {
	var data = {};
	SB.i18n = {
		load : function (dict) {
			data = dict;
		},
		/**
		 * receives a Literal like
		 * {
		 * 	"hello" : {
		 * 		"de" : "hallo",
		 * 		"it" : "ciao",
		 * 		"fr" : "bonjour",
		 * 	 	"en" : "hello"
		 * 	 },
		 * 	 "prova generale" : {
		 * 	 	"de" : "Generalprobe",
		 * 	  	"it" : "prova generale",
		 * 	   	"fr" : "répétition générale",
		 * 	   	"en" : "dress rehearsal"
		 * 	 }
		 * 	}
		 * @return {[type]} [description]
		 */
		dynamicLoad : function (lo) {
			for (var label in lo) {
				SB.lang in lo[label] && (data[label] = lo[label][SB.lang]);
			}
		},
		check : function (lab) {
			var match = lab.match(/i18n\(([^)|]*)?\|?([^)|]*)\|?([^)]*)?\)/);
			return match ? 
				(data[match[1]] ?
					data[match[1]] :
					(match[2] ? match[2] : match[1])
				)
				:
				lab;
		},
		// check : function (lab) {
		// 	var match = lab.match(/i18n\(([^)|]*)?\|?([^)|]*)\|?([^)]*)?\)/),
		// 		matched = match ? 
		// 			(data[match[1]] ?
		// 				data[match[1]] :
		// 				(match[2] ? match[2] : match[1])
		// 			)
		// 			:
		// 			lab;
		// 	return match ? lab.replace(match[0], matched) : lab;
		// },
		get : function (k, fallback) {
			return data[k] || fallback || 'no Value';
		}
	}
})();
/*
[Malta] ../animate.js
*/
SB.makeNS('SB/animate');


// a polyfill for requestAnimationFrame
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

SB.animate.move = function(elem, move) {
    var xmove = move.x || false,
        ymove = move.y || false,

        dir = xmove ? 'left' : 'top',
        startTime = null,

        endPos = xmove || ymove, // in pixels
        duration = 300; // in milliseconds

    function render(time) {
        if (time === undefined) {
            time = +new Date();
        }
        if (startTime === null) {
            startTime = time;
        }

        elem.style[dir] = ((time - startTime) / duration * endPos % endPos) + 'px';
    }
    
    (function animationLoop() {
        render();
        requestAnimationFrame(animationLoop, elem);
    })();

};

SB.animate.fadeIn = function (el) {
  el.style.opacity = 0;

  var last = +new Date();
  var tick = function() {
    el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
    last = +new Date();

    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
    }
  };
  tick();
}
SB.animate.fadeOut = function (el) {
  el.style.opacity = 1;

  var last = +new Date();
  var tick = function() {
    el.style.opacity = +el.style.opacity - (new Date() - last) / 400;
    last = +new Date();

    if (+el.style.opacity > 0) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
    }
  };
  tick();
}

SB.animate.transform = function (elem, props, duration) {
    var startTime = +new Date,
        step = 50,
        time;
    for (var p in props) {
        (function (name, value) {
            var pref = value.match(/(px|%|em)$/),
                current = parseFloat(elem.style[name], 10),
                to = duration/step,
                incr = (parseFloat(value, 10) - current) / step,
                t,
                versus = current < value;
            
                
            t = window.setInterval(function () {
                
                var v = parseFloat(elem.style[name], 10) + incr + pref
                elem.style[name] = v;
                
                if (versus ? (v > parseFloat(value, 10)) : (v < parseFloat(value, 10))) {
                    
                    clearInterval(t);
                }
            }, to);

        })(p, props[p]+ "");
    }
};

// SB.animate.move($0, {x:300});
/*
[Malta] ../engy/config.js
*/
SB.makeNS('SB/engy');
(function() {

	var params = {
			componentsUrl: '/js/components',
			langUrl : '/i18n',
			defaultLang : 'en',
			eventEntryPoint : '$EVENT_ENTRYPOINT$'
		},
		
		proto = document.location.protocol || 'http:',
		domain = 'http://www.jmvc.org';

	SB.engy.config = {
		baseUrl: proto + '//' + domain,
		componentsUrl: proto + '//' + domain + params.componentsUrl,
		// openWideUrl: proto + '//' + params.openWideUrl,
		// openWideBaseScriptUrl: proto + '//' + params.openWideBaseScriptUrl,
		langUrl : proto + '//' + domain + params.langUrl,
		eventEntryPoint : params.eventEntryPoint
	};

	SB.defaultLang = params.defaultLang;
})();

/*
[Malta] ../engy/engy.js
*/
/**
 
		_/_/_/_/  _/      _/    _/_/_/  _/      _/   
	   _/        _/_/    _/  _/          _/  _/      
	  _/_/_/    _/  _/  _/  _/  _/_/      _/         
	 _/        _/    _/_/  _/    _/      _/          
	_/_/_/_/  _/      _/    _/_/_/      _/ 


 * @author Federico Ghedina <fedeghe@gmail.com>
 * 
 * @depencencies:
 * SB.Widgzard.Promise
 * SB.checkNS()
 * SB.object
 * SB.io
 */

SB.makeNS("SB/engy");

SB.engy.process = function () {

	var args = [].slice.call(arguments, 0),
		config = args[0],
		
		Processor, processorPROTO,
		outConfig = {},
		CONST = {
			fileNameSeparator : "/",
			fileNamePrepend : "component_",
			ext : ".js"
		},
		langFunc = SB.i18n.check;


	// user i18n? 
	//
	'params' in config &&
	'i18n' in config.params &&
	SB.i18n.dynamicLoad(config.params.i18n);

	/**
	 * Basic Processor object
	 * @param {[type]} config [description]
	 */
	Processor = function (config) {
		/**
		 * List of all caugth components
		 * each components stored will be something like
		 * {component : String name , params : Object Literal}
		 * @type {Array}
		 */
		this.components = [];
		this.retFuncs = [];
		this.config = config;
	};
	processorPROTO = Processor.prototype;


	processorPROTO.run = function () {

		var self = this,
			endPromise = SB.Widgzard.Promise.create(),
			tmp, i1, i2 , l1, l2;

		// if (SB.engy.config.lazyLoading) {
			self.getComponentsPromise().then(function () {
				SB.Widgzard.Promise.join(self.retFuncs).then(function (pro, r) {

					build(self, pro); // let the build resolve it

				}).then(function (p, r) {

					endPromise.done(r[0].config);

				});
			});
		// } else { 
		// 	// get position
		// 	self.getComponents();
		// 	// now look into SB ns to get the missing json, the one loaded in lazy mode
		// 	for (i1 = 0, l1 = self.components.length; i1 < l1 ; i1++) {
		// 		if (self.components[i1]) {
		// 			for (i2 = 0, l2 = self.components[i1].length; i2 < l2; i2++) {
		// 				self.components[i1][i2].json = SB.components[self.components[i1][i2].component.value]; //SB.components;
		// 			}
		// 		}
		// 	}
		// 	var p = SB.Widgzard.Promise.create();
		// 	p.then(function (p, r) {
				
		// 		//console.debug(r[0]);

		// 		endPromise.done(r[0].config);

		// 	});
		// 	build(self, p);
		// }
		return endPromise;
	};


	processorPROTO.getComponents = function () {
		var self = this,
			tmp = SB.object.digForKey(self.config, 'component'),
			i, l;

		//build at level
		for (i = 0, l = tmp.length; i < l; i++) {
		
			if (!self.components[tmp[i].level])  {
				self.components[tmp[i].level] = [];
			}     
			self.components[tmp[i].level].push({
				component : tmp[i],
				params : SB.checkNS(tmp[i].container ?  tmp[i].container + '.params' : 'params' , self.config)
			});
		}
	}; 
	
	processorPROTO.getComponentsPromise = function () {
		var self = this,
			p = SB.Widgzard.Promise.create(),
			i1, i2, l1, l2;

		self.getComponents();

		self.retFuncs = [];

		for (i1 = 0, l1 = self.components.length; i1 < l1; i1++) {

			// could be undefined @ that level
			// 
			if (self.components[i1]) {

				for (i2 = 0, l2 = self.components[i1].length; i2 < l2; i2++) {

					(function (j1, j2) {

						self.retFuncs.push(function () {
							// a promise for that component
							var pr = SB.Widgzard.Promise.create(),

								// get the right complete path for the file
								parts = self.components[j1][j2].component.value.split(CONST.fileNameSeparator),
								last = parts.pop(),
								readyName = parts.join(CONST.fileNameSeparator) + CONST.fileNameSeparator + CONST.fileNamePrepend + last,
								file = SB.engy.config.componentsUrl + readyName + CONST.ext;
							
							// not get it as json, but as raw text so it's possible to specify the cb within the component
							// not being it validated from JSON.parse
							SB.io.get(
								file,
								function (raw) {
									// remove WHATEVER is found before the {
									// normally will be something like 
									// var WTF = { .....
									// present only to allow minification
									// of each component;
									// the minification with uglify-js usually adds a semicolon at 
									// the end, that must be removed to obtain the  {.....}
									// that will be evaluated
									raw = raw.replace(/^[^{]*/, '').replace(/;?$/, '');

									// and store it
									// self.components[j1][j2].json = eval('(' + raw.replace(/\/n|\/r/g, '') + ')');
									
									self.components[j1][j2].json = eval('(' + raw + ')');
									
									// solve
									pr.done();
								}
							);
							return pr;
						});
					})(i1, i2);
				}    
			}
		}
		p.done();
		return p;
	};


	/**
	 * copyWithNoComponentNorParams
	 * As the name suggest given an object returns a clone
	 * leaving out `params` and `component` elements, if they exist
	 * 
	 * @param  {[type]} o [description]
	 * @return {[type]}   [description]
	 */
	function copyWithNoComponentNorParams(o) {
		var ret = {};
		for (var j in o) {
			if (!j.match(/params|component/)) {
				ret[j] = o[j];
			}
		}
		return ret;
	}

	function build(instance, pro) {

		//  in reverse order the sostitution
		/*
		 * {component: s1 , k1 : x1, k2: ,x2, .....} or 
		 * {component: s1 , params: {}, k1 : x1, k2: ,x2, .....}
		 *
		 * will be at the end replaced with
		 * {content : [ resulting ], k1 : x1, k2: ,x2, .....}
		 * 
		 */
		// localize config, that will be modified

		var components = instance.components,
			config = instance.config,
			k = components.length,
			i, l,
			comp, params, json, res,ref,

			solve = function (j, p) {

				// use 
				var replacing = SB.object.digForValue(j, /#PARAM{([^}|]*)?\|?([^}]*)}/),
					i, l,
					mayP, fback, ref,
					ret,
					rxRes;

				for (i = 0, l = replacing.length; i < l; i++) {

					rxRes = replacing[i].regexp;

					if (rxRes[2].match(/true|false/)) {
						rxRes[2] = rxRes[2] === "true";
					}


					mayP = SB.checkNS(replacing[i].regexp[1], p),
					fback = replacing[i].regexp[2],
					ref = SB.checkNS(replacing[i].container, j);

					// maybe convert
					


					if (mayP !== undefined) {
						ref[replacing[i].key] = mayP;    
					} else {
						ref[replacing[i].key] = fback || false; //'{MISSING PARAM}';
					}
					// WANT SEE if some params are missing?
					// !mayP && !fback && console.log("WARNING: missing parameter! " + replacing[i].regexp[1]) && console.debug(j);
				}

				// maybe langs i18n
				// 
				if (langFunc) {

					replacing = SB.object.digForValue(j, /i18n\(([^}|]*)?\|?([^}]*)\)/);

					for (i = 0, l = replacing.length; i < l; i++) {
						mayP = langFunc(replacing[i].regexp[0]),
						ref = SB.checkNS(replacing[i].container, j);
						ref[replacing[i].key] = mayP;
					}	
				}

				// return a clean object
				// with no component & params
				return copyWithNoComponentNorParams(j);
			};
		
		// from the deepest, some could be empty
		while (k--) {
			if (components[k]) {
				for (i = 0, l = components[k].length; i < l; i++) {
					comp = components[k][i];
					params = comp.params;
					json = comp.json;

					res = solve(json, params);

					ref = SB.checkNS(comp.component.parentContainer, config);
					
					if (comp.component.parentKey != undefined) {
						ref[comp.component.parentKey] = res;
					} else {
						// root
						instance.config = res;
					}
				}
			}
		}
		
		pro.done(instance);
	}
	

	// RUN & return the promise, 
	// so the tipical usega will be
	// 
	//  SB.engy.process(component-params--CONF).done(function (thePromise, theResults){
	//      
	//      // theResults is an array of the results passed to promise.done()
	//      // in this case is just one, the first el of the array
	//      
	//      // maybe add a target element, otherwise SB.Widgzard will use the body
	//      theResults[0].target = document.getElementById('myTargetDivID');
	//      SB.Widgzard.render(theResults[0], true);
	//      
	//  });
	// 
	return (new Processor(config)).run();
	// return endPromise;
};









/*
[Malta] ../eventTracker.js
*/
SB.makeNS('SB/track', function () {

	var SB_tracker = (function () {

			var endPoint = SB.engy.config.eventEntryPoint,
				data = {
					// believe it or not that id locked by the ADB
					// a_id : 'sm_creativeID' in window ? sm_creativeID : 0,
					ad_id : 'sm_creativeID' in window ? sm_creativeID : 0,
					ca_id : 'sm_campaignID' in window ? sm_campaignID : 0,
					li_id : 'sm_lineItemID' in window ? sm_lineItemID : 0
				},
				debug = function (msg) {
					typeof cns !== 'undefined' && cns.debug(msg);
					'dbg' in console && console.dbg(msg);
				},
				interacted = false;

		// bridge
		// 
		function do_event(ev){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `event`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(ev);
			debug(msg);

			SB.io.getJson(
				endPoint,
				function () {},
				SB.object.extend(data, {
					"event" : ev + ""
				})
			);
			return true;
		}

		function do_dynamicClick(ev, url){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `dynamicClick`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(ev, url);
			SB.io.getJson(
				endPoint,
				function () {
					window.open(url);
				},
				SB.object.extend(data, {
					"event" : ev + "",
					clickUrl : url
				})
			);
			SB.io.getJson(
				endPoint,
				function () {
					console.log('click event logged')
				},
				SB.object.extend(data, {
					"event" : "click",
					clickUrl : url
				})
			);
			return true;
		}

		function do_expand(){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `expand`]';
			console.log(msg);
		
			SB.io.getJson(
				endPoint,
				function () {
					console.log('expand event logged')
				},
				SB.object.extend(data, {
					"event" : 'expand'
				})
			);
			return true;
		}
		function do_contract(){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `contract`]';
			console.log(msg);
			SB.io.getJson(
				endPoint,
				function () {
					console.log('collapse event logged')
				},
				SB.object.extend(data, {
					"event" : 'contract'
				})
			);
			return true;
		}

		function do_ready(f){
			var msg = '[Stailabounce IMPLEMENTATION on action `ready`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(f);
			SB.events.ready(f);
			return true;
		}

		function do_getContent(lab, fback){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `getContent`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(lab, fback);
			return true;
		}

		function do_interaction() {
			// once
			//
			if (interacted) return;
			interacted = true;

			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `interaction`]';
			console.log(msg);

			SB.io.getJson(
				endPoint,
				function () {},
				SB.object.extend(data, {
					"event" : 'interaction'
				})
			);
			return true;
		}

		function do_clickThrough(pars) {
			if (typeof pars === 'undefined') {
				return;
			}
			
			pars = SB.object.extend(pars, {
				adId : sm_creativeID,
				cpId : sm_campaignID,
				liId : sm_lineItemID,
				"event" : "clickThrough"
			});
		
			SB.io.getJson(
				endPoint,
				function () {
					console.log('DEBUG: ', pars);
				},
				pars
			);
			return true;
		}

		function do_debug(pars) {
			if (typeof pars === 'undefined') {
				return;
			}
			'type' in pars || (pars.type="no type specified");
			pars = SB.object.extend(pars, {
				adId : sm_creativeID,
				cpId : sm_campaignID,
				liId : sm_lineItemID
			});
		
			SB.io.getJson(
				endPoint,
				function () {
					console.log('DEBUG: ', pars);
				},
				pars
			);
			return true;
		}

		return {
			"event" : do_event,
			clickThrough : do_clickThrough,
			dynamicClick : do_dynamicClick,
			expand : do_expand,
			contract : do_contract,
			ready : do_ready,
			getContent : do_getContent,
			interaction : do_interaction,
			debug : do_debug
		};
	})();


	return {
		"event" : function(p) {
			return !SB.mute && SB_tracker['event'](p);
		},
		
		dynamicClick : function (p1, p2) {
			return !SB.mute && SB_tracker.dynamicClick(p1, p2);
		},
		
		expand : function () {
			return !SB.mute && SB_tracker.expand();
		},
		
		contract : function () {
			return !SB.mute && SB_tracker.contract();
		},
		
		ready : function (f) {
			return !SB.mute && SB_tracker.ready(f);
		},
		
		getContent : function (p1, p2) {
			return !SB.mute && SB_tracker.getContent(p1, p2);
		},

		// interaction is not present in ADTECH, thus check
		// 
		interaction : function () {
			return !SB.mute
			&&
			'interaction' in SB_tracker
			&&
			typeof SB_tracker.interaction == 'function'
			&&
			SB_tracker.interaction();
		},
		pixel : function (pixel_url) {
			if(SB.mute) return false;

			if (SB.util.isArray(pixel_url)) {
				for (var i = 0, l = pixel_url.length; i < l; i++) {
					SB.track.pixel(pixel_url[i]);
				}
			}
			var i = new Image(1, 1);
			i.src = pixel_url;
			return true;
		},
		clickThrough : SB_tracker.clickThrough,
		debug : SB_tracker.debug
	};

	

});
/*
[Malta] ../fx.js
*/
SB.txtSlide = {
	active : true,
	shut : function () {
		this.active = false;
	},
	slide : function (node, txt, options) {

		txt = txt || 'swiping';
		options = options || {};
		
		var n = node,
			color = options.color || [255,255,255],
			steps = options.steps || 5,
			versus = options.versus || 'right',
			height = options.height || 1,
			keys = [],
			repeat = options.repeat || false,
			topAlpha = options.topAlpha || 0.6,
			step = topAlpha / steps,
			chars = txt.split(''),
			len = chars.length,
			speed = options.speed || 500,
			nextSpeed = speed / 10,
			letterSpeed = speed / (2 * steps),
			els = [],
			tplStyle = {'color' : 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',%alpha%)'},
			i, l, t,
			repTo,
			self = this;
			
		// init
		// 
		self.active = true;
		//n.style.height = height + 'px';
		//n.style.lineHeight = height + 'px';
		//n.style.fontSize = height/2 + 'px';
		n.style.fontWeight = 'bold';
		n.style.letterSpacing = '0.5em';
		n.innerHTML = '';

		for (i = 0; i < len; i++) {
			keys[i] = i;
			t = document.createElement('span');
			t.style.color = tplStyle.color.replace(/%alpha%/, 0);
			t.innerHTML = chars[i];
			n.appendChild(t);
			els.push(t);
		}

		// maybe wrong versus
		//
		versus == 'left' && keys.reverse();

		function fade(node) {
			var beg = 0, current = 0, end = topAlpha, sign = 1,
				to = window.setInterval(function () {
					if (current >= end)sign = -1;
					if (current <= beg)sign = 1;
					current = current + sign * step;
					node.style.color = tplStyle.color.replace(/%alpha%/, current);

					if (current <= 0 || !self.active){
						window.clearInterval(to);
					}
				}, letterSpeed);
		}
		
		function seq() {
			// shut it up if not active
			//
			if (!self.active) {
				window.clearInterval(repTo);
				return;
			}
			for (i = 0; i < len; i++) {
				(function (j, k){
					window.setTimeout(function (){
						fade(els[j]);
					}, nextSpeed * k);
				})(keys[i], i);
			}
		}

		// first
		// 
		seq();

		// what about the repeat param?
		// 
		if (repeat) {

			repTo = window.setInterval(function () {

				// maybe we should reverse each time?
				// 
				versus == 'both' && keys.reverse();
				
				// again
				//
				seq();

			}, repeat);
		}
	}
};