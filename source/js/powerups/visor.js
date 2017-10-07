powerUps.visor = {
	settings : {
		index : 'visor',
		label : 'visor',
		icon : '\uf002',//'fa fa-search',
		frequencyWeight : 2,
		timeToDisappear : 30000,
		powerLastsFor : 20
	},

	show : function () {
		
		console.debug('visor show icon');
		console.debug(_puNode);


		var VISOR = this,
			P = _puNode,
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
			G.ctx.fillText(VISOR.settings.icon, pos[0], pos[1]);
			G.ctx.font = ft;
		};
		_icon.position = {
			left : pos[0],
			top : pos[1]
		};

		_activatePowerup = function () {
			VISOR.activate.call(VISOR);
		};





	},

	hide : function () {

		console.debug('visor hide');

	},

	activate : function () {
		
		console.debug('visor active');

		// G.panel.getNode('powerup_spec').data.start(this);
		



		SB.Widgzard.render({
			target : _puNode,
			attrs : {'class' : 'spacezoom'},
			content : [{
				attrs : {'class' : 'cell round round4'},
				html : '&nbsp;',
				cb : function () {
					var self = this,
						$elf = self.node,
						$bar = _puNode,
						visible = true;
					
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
					
					_channel.sub('outNotifyShow', move);
					_channel.sub('outNotifyShow', show);
					_channel.sub('outNotifyHide', hide);
					hide();
					self.done();
				}
			}]
		}, true);
	},

	deactivate : function () {
		// _channel.reset('outNotifyShow', 'outNotifyHide');
		_puNode.innerHTML = '';
		console.debug('visor unactive');
	}
};