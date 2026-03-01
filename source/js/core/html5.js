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

    LIB.html5 = {
        exitFullscreen : _.html5.exitFullscreen,
        exitVideoFullscreen : _.html5.exitVideoFullscreen,
        enterFullscreen : _.html5.enterFullscreen,
        cancelFullscreen : _.html5.cancelFullscreen,
        onExitFullScreen : function (func) {

            LIB.events.on(document, "fullscreenchange", function () {
                !document.fullscreen && func();
            });
            LIB.events.on(document, "mozfullscreenchange", function () {
                !document.mozFullScreen && func();
            });
            LIB.events.on(document, "webkitfullscreenchange", function () {
                !document.webkitIsFullScreen && func();
            });
        },
        allowedFullscreen : _.html5.allowedFullscreen
    };

})();