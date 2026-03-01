/**
 * Each powerup implements the interface
 * - show: show the icon
 *
 * 
 */

(function () {

	var dom = {
			wid : 'outerPu',
			attrs : {'class' : 'spacezoom'},
			content : [{
				attrs : {'class' : 'cell round round4'},
				html : '&nbsp;',
				cb : function () {
					var self = this,
						$elf = self.node,
						$bar = self.parent.node,
						visible = false;

					// SHOW HIDE THE SPACE ZOOM 
					// event driven
					//
					function move(topic, val) {
						SB.css.style($elf, {width : G.I.width + 'px'});
						SB.css.style($elf, {left : val + 'px'});
					}
					function show() {
						if (!visible) {
							SB.css.style($bar, {display : 'block'});
							visible = true;
						}
					}
					function hide() {
						if (visible) {
							SB.css.style($bar, {display : 'none'});
							visible = false;
						}
					}

					SB.Channel('boing').sub('enable_powerup_visor', function () {
						// SB.Channel('boing').sub('outNotify', move);
						SB.Channel('boing').sub('outNotifyShow', move);
						SB.Channel('boing').sub('outNotifyShow', show);
						SB.Channel('boing').sub('outNotifyHide', hide);
					});
					SB.Channel('boing').sub('disable_powerup_visor', function () {
						// SB.Channel('boing').unsub('outNotify', move);
						SB.Channel('boing').unsub('outNotifyShow', move);
						SB.Channel('boing').unsub('outNotifyShow', show);
						SB.Channel('boing').unsub('outNotifyHide', hide);
						hide();
					});
					self.done();
				}
			}]
		},
		wDom;


	gameProto.powerUps.elements.visor = {

		settings : {
			index : 'visor',
			label : 'visor',
			icon : '\uf002',
			frequencyWeight : 2,
			timeToDisappear : 30,
			powerLastsFor : 20
		},

		show : function () {
			console.debug('showing visor')

			var P = this,
				G = gameProto.powerUps.G,
				to,
				pos = [
					SB.util.rand(_powerUp_margin_area, G.viewport.width - _powerUp_margin_area),
					SB.util.rand(_powerUp_margin_area, G.viewport.height - _powerUp_margin_area)
				],
				size = G.viewport.width/(_mobile ? 10 : 25);

			// override global function 
			// as far as defined will be drawn
			//
			_icon = function () {
				var ft = G.ctx.font;
				G.ctx.font = "1em FontAwesome";
				G.ctx.fillText(P.settings.icon, pos[0], pos[1]);
				G.ctx.font = ft;
			};
			_icon.position = {
				left : pos[0],
				top : pos[1]
			};

			// start the timeout
			// to undefined the _icon function so that is no more
			// 
			


			_gotPowerup = function () {
				console.debug('got powerup visor')
				

				// enable specific powerup
				//
				// SB.Channel('boing').pub('enable_powerup_visor');

				// show the powerup notification panel
				//
				G.panel.getNode('powerup_spec').data.start(pu.index);

				// for now it last even at death
				//
				window.setTimeout(function () {
					_gotPowerup = null;
				}, pu.powerLastsFor * 1000);

				return true;

			};

		},

		activate : function () {
			wDom = SB.Widgzard.render({
				target : gameProto.powerUps.G.panel.getNode('powerup').node,
				content : [dom],
				cb : function () {
					var self = this;
					SB.Channel('boing').sub('outNotifyShow', function () {
						
						self.getNode('outerPu').node.style.display = "";
					});
					SB.Channel('boing').sub('outNotifyHide', function () {
						self.getNode('outerPu').node.style.display = "none";
					});
				}
			},true);
			return wDom;
		},

		hide : function (t) {
			// SB.Channel('boing').pub('disable_powerup_visor');
			console.debug(t, ' disable_powerup_visor');
			
		}
	};
})();

