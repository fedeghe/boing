gameProto.powerUps.hypervisor = {
	show : function (t) {
		console.debug('showing hypervisor')
		var G = this,
			pu = t,
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
			// G.ctx.fillText(String.fromCharCode(pu.data.icon), pos[0], pos[1]);
			G.ctx.fillText(pu.icon, pos[0], pos[1]);
			G.ctx.font = ft;
		};
		_icon.position = {
			left : pos[0],
			top : pos[1]
		};

		// start the timeout
		// to undefined the _icon function so that is no more
		// 
		to = window.setTimeout(function () {
			_icon = null;
			_gotPowerup = null;
		}, pu.timeToDisappear * 1000);


		_gotPowerup = function () {
			console.debug('got powerup hypervisor')
			

			// enable specific powerup
			//
			// SB.Channel('boing').pub('enable_powerup_hypervisor');

			// show the powerup notification panel
			//
			G.panel.getNode('powerup_spec').data.start(pu.index);

			// for now it last even at death
			//
			window.setTimeout(function () {
				
				// disable the specific powerup
				// 
				// SB.Channel('boing').pub('disable_powerup_hypervisor');
				_gotPowerup = null;
			}, pu.powerLastsFor * 1000);
			return true;
		};
	},
	hide : function (t) {
		SB.Channel('boing').pub('disable_powerup_hypervisor');
		console.debug(t, ' disable_powerup_hypervisor');
	}
};