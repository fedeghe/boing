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