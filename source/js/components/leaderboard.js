LEADERBOARD = {
	style : {display:'none'},			
	attrs : {'class' : 'infoWindow round round8 gameover'},

	content : [{
		wid : 'leaderboard_main',
		content : [{
			tag : 'h1',
			html : 'GAME OVER'
		},/*{
			tag : 'h1',
			content : [{
				tag : 'span',
				html : 'You ranked'	
			}, {
				tag : 'span',
				attrs : {'class':'score'},
				html : '#33',
				wid : 'rank',
				cb : function () {
					var self = this;
					self.data.updateRank = function () {
						SB.io.post('$SUBMIT_URL$?a=rank', function (r) {
							self.node.innerHTML = '#' + r;
						}, true, {
							score : parseFloat(parseFloat(SB.s.d.cs, 10).toFixed(1), 10)
						});
					}

					self.done();
				}

				
				
				// SB.io.post('$SUBMIT_URL$?a=store', function (r) {
				// 	console.debug(r);
				// 	SB.Channel('boing').pub('hideGameover');
				// 	SB.s.reset();
				// }, true, {
				// 	name : name,
				// 	e : SB.s.d.e,
				// 	cs : parseFloat(SB.s.d.cs, 10), 
				// 	os : SB.s.d.os
				// });

				 

			}]
		},{
			tag : 'form',
			style : {textAlign:'center'},
			content : [{
				tag : 'input',
				wid :'thename',
				attrs : {type : 'text', placeholder : 'Your name', "class" : "round round10"}
			},{
				tag : 'input',
				attrs : {type: 'button', value : 'submit', "class" : "round round10"},
				cb : function () {
					var self = this,
						$elf = self.node,
						res = null,
						active = false;
					SB.Channel('boing').sub('submitReady', function (topic, r) {
						active = true;
						res = r;
					})
					SB.events.on($elf, "#PARAM{bEvent}", function () {
						if (!active) return;

						var name = self.getNode('thename').node.value;

						!!name && SB.io.post('$SUBMIT_URL$?a=store', function (r) {
							alert('saved');
							
							SB.Channel('boing').pub('hideGameover');
							G.start();
						}, true, {
							name : name,
							e : SB.s.d.e,
							cs : parseFloat(SB.s.d.cs, 10), 
							os : SB.s.d.os
						});
					});
					self.done();
				}
			}]
		},*/{
			attrs : {"class" : "bottomPanel"},
			content : [{
				tag : 'span',
				attrs : {"class" : "fa fa-trophy", title : "open the leaderboard"},
				cb : function () {
					var self = this,
						$elf = self.node;
					SB.events.on($elf, 'click', function () {
						SB.s.getLeaderboard(function (r) {
							SB.Channel('boing').pub('gotLeaderboard', [r]);
						});
					});
					this.done();
				}
			},{
				tag : 'span',
				attrs : {"class" : "fa fa-play-circle", title : "play again"},
				cb : function () {
					var self = this,
						$elf = self.node;
					SB.events.on($elf, 'click', function () {
						
						G.start();
					});
					self.done();
				}
			},'clearer']
		}]
	},{
		style : {display : "none"},
		attrs : {"class" : "leaderBoard round round10"},
		wid : "leaderBoard",
		content : [{
			tag : "span",
			attrs : {"class" : "fa fa-times"},
			cb : function () {
				var self = this,
					$elf = self.node;
				SB.events.on($elf, 'click', function () {
					var n = self.getNode('leaderBoard').node,
						content = self.getNode('leaderBoard_content').node;
					self.getNode('leaderboard_main').node.style.display = '';
					content.innerHTML = "#PARAM{loadingDiv}";
					
					n.style.display = 'none';
				});
				self.done();
			}
		},'clearer',{
			tag : 'h1',
			html : 'LEADERBOARD',
			style : {textAlign:'center'}
		}, {
			wid : "leaderBoard_content",
			attrs : {"class" : "leaderBoard_content"},
			// style : {overflow : 'hidden'},
			cb : function () {
				var self = this,
					$elf = self.node;

				SB.Channel('boing').sub('gotLeaderboard', function (t, res) {
					self.getNode('leaderboard_main').node.style.display = 'none';
					self.getNode('leaderBoard').node.style.display = '';

					var list = [],
						i = 0, l = res.length,
						nameMaxSize = 10;
					for (null; i < l; i++) {
						list.push({
							tag : 'li',
							attrs : {"class" : "round round8 " + (i % 2 ? "odd" : "even")},
							content : [{
								tag : 'span',
								attrs : {"class" : "rank"},
								html : i+1
							},{
								tag : 'span',
								attrs : {"class" : "name"},
								html : res[i].name.length > nameMaxSize ?  res[i].name.substr(0, nameMaxSize) + '...' : res[i].name
							},{
								tag : 'span',
								attrs : {"class" : "score"},
								html : res[i].score
							}]
						});
					}
					SB.Widgzard.render({
						target : $elf,
						content : [{
							tag : 'ul',
							content : list
						}]
					}, true);



				});
				this.done();
			}
		}]
	}],
	cb : function () {
		var self = this,
			$elf = self.node;

		SB.Channel('boing').sub('gameOver', function () {
			SB.s.snd(G.score);
			SB.css.style($elf, {display: 'block'});
			G.score = 0;
			self.getNode('rank').data.updateRank();
		});
		SB.Channel('boing').sub('hideGameover', function () {
			SB.css.style($elf, {display: 'none'});
		});
		this.done();
	}
}