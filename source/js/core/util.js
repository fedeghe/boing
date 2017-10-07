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
