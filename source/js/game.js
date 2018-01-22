~function () {

	var gameProto,
		_mobile = LIB.util.isMobile(),
		_video = $settings.showIntroVideo$,
		_bEvent = _mobile ? 'touchstart' : 'click',
		_baseEndPhrase = '<i>You</i> need',
		_endPhrases = 'skills|focus|passion|the right partner|the essential|another perspective|to go further'.split('|'),
		_lifeUpCutoff = 1E5,
		_icon,
		_currentPowerUp,
		_loadingDiv = '<div class="loading"></div>',
		_powerAppearDelay = [2,5];

	LIB.events.avoidVerticalScroll();

	LIB.css.fontAwesome();

	NS.Game = function () {
		this.canvas = null;
		this.ctx = null;
		this.score = 0;
		this.infoPanelVisible = false;
		this.start();
	};

	gameProto = NS.Game.prototype;
	

	gameProto._currentPowerup = false;
	
	gameProto._icon = false;


/*
	DDpowerups/list.jsDD
*/	
	gameProto.start = function () {
	
		NS.s.reset();
		LIB.Channel('boing').reset();

		
		this.viewport = LIB.util.getViewportSize();

		this.createPlayground()
			.renderPanels()
			.gameReady();

		LIB.events.disableRightClick();
		console.log('game started');
	}

	/**
	 * [drawPlayground description]
	 * @return {[type]} [description]
	 */
	gameProto.createPlayground = function () {

		var G = this;

		LIB.Widgzard.render({
			content : [{
				attrs : {"class" : "logo"}
			},{
				tag : 'canvas',
				wid : "canvas",
				attrs : {
					width : G.viewport.width,
					height : G.viewport.height
				},
				style : {
					position:'absolute',
					top: '0px',
					left: '0px',
					opacity : 0
				},
				cb : function () {
					var self = this,
						$canvas = self.node,
						size = G.viewport.width/(_mobile ? 10 : 25);

					G.I = new Image;
					G.I.width = G.I.height = size;

					LIB.css.style(G.I, {width : size + 'px', height : size + 'px'});
					
					G.I.onload = function () {
						var ctx = $canvas.getContext('2d'),
							x0 = (G.viewport.width - G.I.width)/2,
							y0 = (G.viewport.height - G.I.height)/2,
							x,y,
							v0X = 0 ,
							v0Y = -20;

						//antialiasing
						ctx.imageSmoothingEnabled = true;

						G.speedX = 0;
						G.speedY = 0;
						G.accX = 0;
						G.accY = $settings.acceleration$;

						// clean canvas
						ctx.clearRect(0, 0, $canvas.width, $canvas.height);

						// draw the logo
						ctx.drawImage(G.I, x0, y0, size, size);//, x0+110, y0+110, 0, 0, size, size);
						// @ first touch/click start the movement
						// 
						LIB.events.one($canvas, _bEvent, beg);

						function beg(e) {
							// !_mobile && LIB.boing();
							
							// get the coord of the event
							//
							var coord = LIB.events.coord(e),
								left = coord[0],
								dist = G.viewport.width/2 - left;

							// and use it ot set the initial speed vector
							// 
							v0X = v0X + 50 * dist/G.viewport.width;

							// 
							start();
						}

						function start () {

							console.log('start');
							LIB.Channel('boing').pub('start');
							var i = 0,
								tx, ty,
								t,
								rotSpeed,
								rot,
								rot0 = 0,
								baseMultiplier = 0.1,
								multiplier = baseMultiplier,
								running = false,
								visible = true,
								left,
								move = function () {

									
									running = true;
									
									// gravity
									// 
									G.speedX = v0X + i * G.accX;
									G.speedY = v0Y + i * G.accY;
									
									tx = x0 + i * v0X + 1/2 * i * i * G.accX;
									ty = y0 + i * v0Y + 1/2 * i * i * G.accY;

									ctx.clearRect(0, 0, $canvas.width, $canvas.height);

									rotSpeed = G.speedX;
									rot = (rot0 + i * rotSpeed) % 360;
									LIB.canvas.drawRotatedImage(ctx, G.I, tx, ty, rot, size)

									
									LIB.Channel('boing').pub('scoreUp', [multiplier]);
									check();
									i++;
								},
								editPath = function (e) {

									// if not visible (up)
									// break
									if (!visible || !running) {
										return false;
									}
									
									var coord = LIB.events.coord(e),
										left = coord[0] - G.I.width / 2,
										dist = tx - left;

									v0X = v0X + 50 * dist / G.viewport.width + Math.random()*(Math.random()>.5 ? -1 : 1);
									
									// set rot0 to the current status
									//
									rot0 = rot;
									
									i = 1;
									x0 = tx;
									y0 = ty;
									
									// async sound
									// !_mobile && window.setTimeout(function (){LIB.boing();}, 0);

									if (G.speedY < 0) {
										// speed up 10%
										// 
										v0Y = 1.02 * v0Y;
									} else {
										// bounce at 90%
										v0Y = -.95 * G.speedY;
									}

									LIB.Channel('boing').pub('scoreStore', [coord[0] > x0]);
								},

								check = function () {
									if (
										( (tx + G.I.width/2) < 0 || (tx + G.I.width/2) > G.viewport.width)
										||
										( (ty + G.I.height/2) > G.viewport.height)
									) {
										clearInterval(t);
										LIB.events.off($canvas, _bEvent, editPath);
										LIB.Channel('boing').pub('collision');
										
										running = false;
									}

									LIB.Channel('boing').pub('notifyPosition', [tx, ty]);


									if (ty < 0) {

										// LIB.Channel('boing').pub('outNotify', [tx]);

										LIB.Channel('boing').pub('outNotifyShow', [tx]);

										visible = false;
										multiplier = 1 + -ty / 10;
									} else {

										LIB.Channel('boing').pub('outNotifyHide');

										visible = true;
										multiplier = baseMultiplier;
									}
								};
							self._icon = null;
							self._currentPowerUp = null;
							

							// LIB.Channel('boing').pub('launchNextPowerup');
							
							// main touch click event listener
							//
							LIB.events.on($canvas, _bEvent, editPath);

							//when help is opened disable touches&clicks
							//
							LIB.Channel('boing').sub('openHelp', function () {
								running = false;
							});

							LIB.Channel('boing').sub('closeHelp', function () {
								running = true;
							});

							t = window.setInterval(move, 25);
						}
					};
					G.I.src = 'css/img/$BALL$';

					self.done();
				}
			},





			/**
			 * Audio tag
			 */
			{
				tag : 'audio',
				attrs : {
					controls : '',
					preload : "auto"
				},
				style : {
					display:'none'
				},
				content : [{
					tag : 'source',
					attrs : {
						src : 'media/boing1.m4a',
						type : 'audio/mpeg'
					}
				},{
					tag : 'source',
					attrs : {
						src : 'media/boing1.ogg',
						type : 'audio/ogg'
					}
				},{
					tag : 'source',
					attrs : {
						src : 'media/boing1.mp3',
						type : 'audio/mpeg'
					}
				}],
				cb : function () {
					var self = this,
						$elf = self.node;

					LIB.Channel('boing').sub('boing', function () {
						
						var ab = self.getNode('audioBag').node;
						LIB.Widgzard.render({
							target : ab,
							content : [{
								tag : 'audio',
								content : [{
									tag : 'source',
									attrs : {
										src : 'media/boing1.m4a',
										type : 'audio/mpeg'
									}
								},{
									tag : 'source',
									attrs : {
										src : 'media/boing1.ogg',
										type : 'audio/ogg'
									}
								},{
									tag : 'source',
									attrs : {
										src : 'media/boing1.mp3',
										type : 'audio/mpeg'
									}
								}],
								end : function () {
									var self = this,
										$elf = this.node;
									LIB.events.on($elf, 'ended', function () {
										LIB.dom.remove($elf);
									});
									// LIB.Channel('boing').pub('start', function () {
										$elf.play();
									// });
								}

							}]
						}, true);
						
					});

					this.done();
				}
			},{
				style : {
					display:'none'
				},
				wid:'audioBag'
			}/*,

			
			{
				attrs : {'class':'bg'},
				style : {
					position:'absolute',
					top:0,
					left:0,
					width:'100%',
					height:'100%',
					zIndex : 1
				},
				html : '&nbsp;'
			}*/],




			cb : function () {
				G.canvas = this.getNode('canvas').node;
				G.ctx = G.canvas.getContext("2d");
			}
		}, true);



		console.log('playground drawn');
		return this;
	};

	/**
	 * [renderPanels description]
	 * @return {[type]} [description]
	 */
	gameProto.renderPanels = function () {
		var G = this,
			life = {
				tag : "i",
				attrs : {'class' : 'life'}
			};
			lifesArr = (function () {
				var r = [],
					i = $LIFES$;
				while (--i) r.push(life);
				return r;
			})();


		G.panel = LIB.Widgzard.render({
			content : [{
				style : {position: 'absolute', top : '0px', width:'100%'},
				content : [{
					attrs : {'class' : 'panel'},

					content : [{
						tag : "span",
						html : "SCORE: "
					}, {
						tag : "span",
						style : {color:"black"},
						wid:'score',
						html : '0',
						init : function () {
							return true;
						},
						cb : function () {
							var self = this,
								$elf = self.node,
								
								cursorForLifes = 0;

							LIB.Channel('boing').sub('scoreUp', function (topic, mult) {

								G.score += mult*1;
								if (~~(G.score / _lifeUpCutoff) != cursorForLifes) {
									cursorForLifes++;
									LIB.Channel('boing').pub('lifeUp');
								}

								$elf.innerHTML = LIB.util.formatNumber(parseFloat(G.score.toFixed(1), 10));

								// var s = parseFloat($elf.innerHTML, 10),
								// 	next = parseFloat(s, 10) + mult*1;
								// if (~~(s/G._lifeUpCutoff) != ~~(next/G._lifeUpCutoff)) {
								// 	LIB.Channel('boing').pub('lifeUp');
								// }
								// $elf.innerHTML = next.toFixed(1);
								
							});
							self.done();
						}
					},{
						tag : 'br'
					}]
				},{
					attrs : {'class' : 'lifes'},
					wid : 'lifes',
					content : lifesArr,
					cb : function () {
						var self = this,
							$elf = self.node;

						LIB.Channel('boing').sub('collision', function() {
							var lifes = $elf.childNodes;
							
							if (lifes.length) {
								LIB.Channel('boing').pub('lifeLost');
								LIB.dom.remove(lifes[0]);
							} else {
								LIB.Channel('boing').pub('gameOver');
							}
							
						});

						LIB.Channel('boing').sub('lifeUp', function () {
							// adding just one the gears do not mantain the synchro
							// but when is removed one the synchronization is ok thus
							// I used a stupid trick to ensure gears stay in synchro
							// add two and then remove one
							// 
							LIB.Widgzard.render({
								target : $elf,
								content : [life, life],
								cb : function () {
									var lifes = $elf.childNodes;
									LIB.dom.remove(lifes[0]);
								}
							});
						});
						this.done();
					}
				},{
					wid : 'powerup'
				}],
				cb : function () {
					var self = this,
						$elf = self.node;

					LIB.Channel('boing').sub('openHelp', function () {
						G.infoPanelVisible = true;
						LIB.css.style($elf, {opacity: 0.2});
					});
					LIB.Channel('boing').sub('closeHelp', function () {
						G.infoPanelVisible = false;
						LIB.css.style($elf, {opacity: 1});
					});
					self.done();
				}
			},

			/**
			 * OPEN HELP BUTTON 
			 */
			{
				attrs : {'class' : 'help'},
				html : "?",
				cb : function () {
					var self = this,
						$elf = self.node;

					LIB.events.on($elf, _bEvent, function () {
						LIB.css.style($elf, {display: 'none'});
						LIB.Channel('boing').pub('openHelp');
					});
					LIB.Channel('boing').sub('closeHelp', function () {
						LIB.css.style($elf, {display: 'block'});
					});

					self.done();
				}
			},


			/**
			 * HELP WINDOW
			 */
			{
				
					wid : 'helpWindow',
					// style : {display:'none'},
					// wid : 'helpWindow',
					attrs : {'class' : 'infoWindow round round8'},
					content : [{
						attrs : {
							"class" : "closeButton"
						},
						html : 'x',
						cb : function () {
							var self = this,
								$elf = self.node,
								close = function () {
									LIB.css.style(self.parent.node, {display: 'none'});
									LIB.Channel('boing').pub('closeHelp');
								}
							LIB.events.onEsc(close);
							LIB.events.on($elf, _bEvent, close);
							LIB.Channel('boing').sub('openHelp', function () {
								G.infoPanelVisible = true;
								LIB.css.style(self.parent.node, {display: 'block'});
							});
							this.done();
						}
					},{
						tag : "h2",
						html :"$APPNAME$ v.$VERSION$ <sub>__BUILDNUMBER__</sub>",
						style : {marginTop : "1.5em", textAlign:'center'}
					},{
						tag : "ul",
						
						content : [{
							tag : "li",
							html : "make the Daisy bounce as long & high as possible"
						},{
							tag : "li",
							html : "one tap to bounce, two tap to speed up"
						},{
							tag : "li",
							html : "avoid the ground and the walls"
						},{
							tag : "li",
							html : "the more You go out of screen the more You score"
						},{
							tag : "li",
							html : "gain 1up every 100k"
						}]
					},{
						tag : 'button',
						attrs : {"class" : "round round4"},
						html : 'OK',
						cb : function () {
							var self = this,
								$elf = self.node,
								close = function () {
									LIB.css.style(self.getNode('helpWindow').node, {display: 'none'});
									LIB.Channel('boing').pub('closeHelp');
								}
							LIB.events.on($elf, _bEvent, close);
							this.done();
						}

					}]
				
			},
			

			/**
			 * LIFE LOST MESSAGE IN THE CENTER
			 */
			{
				style : {display:'none'},
				attrs : {'class' : 'lifeLost'},
				
				cb : function () {
					var self = this,
						$elf = self.node;
					LIB.Channel('boing').sub('lifeLost', function () {
						
						$elf.innerHTML = [
							'...',
							_baseEndPhrase,
							' ',
							_endPhrases[LIB.util.rand(0, _endPhrases.length - 1)],
							'...'
						].join('');

						LIB.css.style($elf, {display: 'block'});
						
						window.setTimeout(function () {
							LIB.css.style($elf, 'display', 'none');

							G.I.onload();

						}, 3000);
					});
					this.done();
				}
			},

			/**
			 * LEADERBOARD
			 */
			{
				style : {display:'none'},			
				attrs : {'class' : 'infoWindow round round8 gameover'},

				content : [{
					wid : 'leaderboard_main',
					content : [{
						tag : 'h1',
						html : 'GAME OVER'
					},{
						tag : 'div',
						style : {
							'text-align' : 'center'
						},
						content : [{
							attrs : {"class" : "fa fa-play-circle", title : "play again"},
							cb : function () {
								var self = this,
									$elf = self.node;
								LIB.events.on($elf, 'click', function () {
									LIB.Channel('boing').pub('hideGameover');
									G.start();
								});
								self.done();
							}	
						}]
						
					}]
				}],
				cb : function () {
					var self = this,
						$elf = self.node;

					LIB.Channel('boing').sub('gameOver', function () {
						
						//
						// avoid it for the moment
						// NS.s.snd(G.score);

						LIB.css.style($elf, {display: 'block'});
						G.score = 0;
						// self.getNode('rank').data.updateRank();
					});
					LIB.Channel('boing').sub('hideGameover', function () {
						LIB.css.style($elf, {display: 'none'});
					});
					this.done();
				}
			}]
		});

		// .panel.getNode('powerup_spec').data.start('');
		// console.log(t.getNode('powerup_spec').node);

		return this;
	};
	
	/**
	 * [gameReady description]
	 * @return {[type]} [description]
	 */
	gameProto.gameReady = function () {

		console.log("game ready")

		var G = this,
			self = this,
			ctx = self.ctx,
			cnv = self.canvas;

		NS.boing = function () {LIB.Channel('boing').pub('boing');};
		
		// first boing	
		NS.boing();
		
		/*
		_video && !_mobile && window.setTimeout(function (){
			var trg = window.body;

			NS.Widgzard.render({
				target : trg,
				content : [{
					tag : 'video',
					attrs : {
						width:'100%',
						loop : 'loop',
						muted : 'muted'
					},
					style : {
						position:'absolute'
					},
					content : [{
						tag :'source',
						attrs : {type:'video/mp4', src : 'http://www.stailamedia.com/wp-content/uploads/2013/06/Final_Grading.mp4'}
					},{
						tag :'source',
						attrs : {type:'video/webm', src : 'http://www.stailamedia.com/wp-content/uploads/2013/06/Final_Grading.webm'}
					}],
					cb : function () {
						var self = this,
							$elf = this.node,
							play = function () {$elf.play();},
							position = NS.util.adaptive.getVideoCoordinates({
								width : G.viewport.width,
								height : G.viewport.height
							});
						NS.css.style($elf, {
							top : position.top + 'px',
							left : position.left + 'px',
							width : position.width + 'px',
							height : position.height + 'px'
						})	

						$elf.volume = 0;
						NS.events.on($elf, 'loadeddata', play);
						this.done();
					}
				}]
			});
		}, 3000 + Math.random()*3000);
		*/

		//fade in
		//
		LIB.animate.transform(self.canvas, {opacity: 1}, 1000);


		window.setTimeout(function () {	
			LIB.dom.removeClass(document.body, 'loading');
			LIB.css.style(cnv, {backgroundColor : 'transparent'});
		}, 1100);
		

		LIB.Channel('boing').sub('scoreStore', function (topic, versus) {
			NS.s.str(G.score, versus);
		});

		self.startPowerUpsManager();

		

		console.log('ready to play');
		
		/*
		this.ctx.beginPath();
		this.ctx.arc(95,50,400,0,2*Math.PI);
		this.ctx.stroke();
		*/
		return self;
	};

	$$powerups/manager.js$$

	$$score.js$$
}();