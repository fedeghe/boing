gameProto.startPowerUpsManager = function () {

	var self = this,
		activePowerUps = false,
		nextPowerUp,
		to,
		protoPowerups = 'visor|hyperVisor|lifeUp|speedUp|speedDown|upBound'.split('|');

		i = 0, l = protoPowerups.length;

	for (null; i < l; i++) {
		(function (pu) {
			SB.Channel('boing').sub('show_powerup_' + pu, function (t, o) {
				self['show_powerup_' + pu].call(self, o);
			});
			SB.Channel('boing').sub('hide_powerup_' + pu, function (t, o) {
				self['hide_powerup_' + pu].call(self, o);
			});
		})(protoPowerups[i]);
	}

	function extract() {
		var p = [],
			i, j;
		for (i in _powerUps) {
			j = 0;
			while(j++ < _powerUps[i].frequencyWeight)
				p.push(_powerUps[i]);
		}
		
		p = shuffle(p);
		p = shuffle(p);
		p = shuffle(p);
		console.info('Next powerup is ' + p[0].index);
		return p[0];
	}

	function shuffle(arr) {
		return arr.sort(function(a,b) {
			var r = Math.random();
			return (r < 0.5) ? 1 : -1;
		});
	}
	
	function nextTime () {
		var nt = ~~(1000 * (_powerUpsFrequency[0] + Math.random() * (_powerUpsFrequency[1] - _powerUpsFrequency[0])));
		console.info(+new Date, ' Next powerup will show in ' + nt/1000 + 's');
		return nt;
	}

	function show() {
		
		if (!activePowerUps) return;

		var nt = nextTime();

		nextPowerUp = extract();

		to = window.setTimeout(function () {
				
				SB.Channel('boing').pub('show_powerup_' + nextPowerUp.label, [nextPowerUp]);

				// book the removal
				// 
				window.setTimeout(function (o) {
						
						SB.Channel('boing').pub('hide_powerup_' + o.label, [o]);
						
						activePowerUps && show();

					},
					nextPowerUp.timeToDisappear * 1000,
					nextPowerUp
				)

			}, nt
		);
	}
	
	SB.Channel('boing').sub('enable_powerups', function () {
		console.info('Powerups manager activated');
		
		
		// // !activePowerUps && 
		// to = window.setTimeout(function () {
		// 	activePowerUps && show();
		// 	activePowerUps = true;
		// }, nextTime());

		activePowerUps = true;
		show();
	});

	SB.Channel('boing').sub('disable_powerups', function () {
		console.info('Powerups manager deactivated');
		window.clearTimeout(to);

		// activePowerUps &&
		nextPowerUp && SB.Channel('boing').pub('hide_powerup_' + nextPowerUp.name);
		nextPowerUp = null;
		
		activePowerUps = false;
	});

};