gameProto.toTimeout = false;
gameProto.endTimeout = false;

gameProto.startPowerUpsManager = function () {

	console.debug('powerupManager started');

	var self = this,
		G = this,
		powerUps = {},
		i = 0, l,
		_puNode = G.panel.getNode('powerup').node,
		_channel = SB.Channel('boing'),
		_powerUp_margin_area = 200;
	
	/* ##powerups/invert.js## */
	$$powerups/visor.js$$


	powerUps.visor.activate();
	
/*
	function extract() {
		var p = [],
			name, j;
		for (name in powerUps) {
			j = 0;
			while(j++ < powerUps[name].settings.frequencyWeight) p.push(name);
		}
		p = shuffle3(p);
		console.info('Next powerup is ' + p[0]);
		return p[0];
	}

	function shuffle3(arr) {
		(function f() {
			arr.sort(function(a,b) {return (Math.random() < 0.5) ? 1 : -1;});
			return f;
		})()()();
		return arr;
	}
	
	function nextTime () {
		var nt = ~~(1000 * (_powerAppearDelay[0] + Math.random() * (_powerAppearDelay[1] - _powerAppearDelay[0])));
		console.info(+new Date, ' Next powerup will show in ' + nt/1000 + 's');
		return nt;
	}

	function start() {
		
		var nt = nextTime();
		_currentPowerUp = extract();

		// decided which powerup to show and when
		//
		self.toTimeout = window.setTimeout(function () {

			powerUps[_currentPowerUp].show();
						
			// book the removal of the icon
			// can be removed from inside the handler when
			// the icon is collided
			// 
			self.endTimeout = window.setTimeout(function () {
				_icon = null;
				powerUps[_currentPowerUp].hide();

				start();

			}, powerUps[_currentPowerUp].settings.timeToDisappear * 1000);

		}, nt);
	}
	
	_channel.sub('launchNextPowerup', function () {
		console.info('Powerups manager asked to start a powerup');
		start();
	});
*/
};