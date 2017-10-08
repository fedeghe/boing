LIB.makeNS('$LIB$/animate');


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

LIB.animate.move = function(elem, move) {
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

LIB.animate.fadeIn = function (el) {
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
LIB.animate.fadeOut = function (el) {
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

LIB.animate.transform = function (elem, props, duration) {
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

// LIB.animate.move($0, {x:300});