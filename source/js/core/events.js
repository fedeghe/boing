LIB.makeNS('$LIB$/events');

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

                var nid = LIB.dom.idize(el); // _.events.nodeid(el);
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

            var nodeid = LIB.dom.idize(el), //_.events.nodeid(el),
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
            index = LIB.util.arrayFind(_.events.bindings[evnt][nodeid], cb);

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
    LIB.events = {


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
            LIB.events.on(W, 'click', function (e) {
                var target = LIB.events.eventTarget(e); 
                target.tagName && target.tagName.toLowerCase() == 'a' && target.blur();
            });
        },

        /**
         * [click description]
         * @param  {[type]} el [description]
         * @return {[type]}    [description]
         */
        click : function (el) {
            LIB.events.fire(el, 'click');
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
            var self = LIB.events;
            LIB.dom.attr(WD.body, 'oncontextmenu', 'return false');
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
                    LIB.events.free(node, j);
                }
                return true;
            }
            LIB.dom.walk(node, function(n) {
                LIB.events.off(n, evnt);
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
            var coord = LIB.events.coord(e)
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
            var self = LIB.events,
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
            var self = LIB.events;

            self.on(WD.body, evnt, function f(e) {
                var trg = self.eventTarget(e);
                while (trg !== el) {
                    trg = LIB.dom.parent(trg);
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
            LIB.events.on(w.document, 'keyup', function (e) {
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
            LIB.events.disableRightClick();
            LIB.events.on(el, 'mousedown', function(e) {

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
            LIB.events.delay(function() {
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
            LIB.events.delay(function() {
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
            LIB.events.on(W, 'beforeunload', function (e) {
                
                var confirmationMessage = /\//;//'Are you sure to leave or reload this page?';//"\o/";
                (e || window.event).returnValue = confirmationMessage;     //Gecko + IE
                return confirmationMessage; 
                
                
            });
        }
    };



    // blur all clicks
    LIB.events.blurAllAnchorClicks();


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
                gd2 = LIB.events.coord(e),
                d,
                directions = [
                    'o','no', 'no',
                    'n', 'n', 'ne', 'ne',
                    'e', 'e', 'se', 'se',
                    's', 's', 'so', 'so',
                    'o'
                ];
            
            d = Math.atan2(gd2[1] - gd1[1], gd2[0] - gd1[0]) * 180 / (Math.PI);
            LIB.events.drag.direction = d.toFixed(2);
            LIB.events.drag.orientation = directions[~~(((d + 180) % 360) / 22.5)] ;
            return true;
        }

    };

    LIB.events.drag = {
        
        direction : false,
        
        orientation : false,

        on : function (el, fn) {
            
            
            
            var fStart = fn.start || function () {},
                fMove = fn.move || function () {},
                fEnd = fn.end || function () {},
                mmove = function (e) {

                    _.events.drag.getDirection(e);

                    var tmp = LIB.events.coord(e),
                        dst = Math.sqrt((tmp[1] - _.events.drag.gd1[1]) * (tmp[1] - _.events.drag.gd1[1])
                            + (tmp[0] - _.events.drag.gd1[0]) * (tmp[0] - _.events.drag.gd1[0])
                        );
                    fMove.call(e, e, {
                        start : _.events.drag.gd1,
                        current : tmp,
                        direction : LIB.events.drag.direction,
                        orientation : LIB.events.drag.orientation,
                        distance : dst
                    });
                },
                mup = function (e) {

                    // not for sure attached, will be caugth an exception
                    // by _.events.unbind
                    
                    LIB.events.off(el, 'mousemove');
                    LIB.events.off(el, 'touchmove');
                    var tmp = LIB.events.coord(e),
                        dst = Math.sqrt((tmp[1] - _.events.drag.gd1[1]) * (tmp[1] - _.events.drag.gd1[1])
                            +
                            (tmp[0] - _.events.drag.gd1[0]) * (tmp[0] - _.events.drag.gd1[0])
                        );
                    
                    fEnd.call(e, e, {
                        start : _.events.drag.gd1,
                        current : LIB.events.coord(e),
                        direction : LIB.events.drag.direction,
                        orientation : LIB.events.drag.orientation,
                        distance : dst
                    });
                };

            LIB.events.on(el, 'mousedown', function (e) {    
                _.events.drag.gd1 = LIB.events.coord(e);
                fStart.call(e, e, {start : _.events.drag.gd1});
                LIB.events.on(el, 'mousemove', mmove);
            });

            LIB.events.on(el, 'mouseup', mup);
            
            LIB.events.on(el, 'touchstart', function (e) {    
                _.events.drag.gd1 = LIB.events.coord(e);
                fStart.call(e, e, {start : _.events.drag.gd1});
                LIB.events.on(el, 'touchmove', mmove);
            });
            LIB.events.on(el, 'touchend', mup);
        },

        off : function (el, f) {
            LIB.events.on(el, 'mouseup', f);
            LIB.events.on(el, 'touchend', f);
        }
    };




    /* From Modernizr */
    LIB.events.transitionEnd = (function () {
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


    LIB.events.doTab = function (el) {
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
