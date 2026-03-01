NS.s = {
	//data
	d : {
		e : [], // filled with time*(dx?1:-1)
		cs : 0, //clear score
		os: '' //obsc score, cryp(cs, sum(e))
	},

	// store the time
	//
	str : function (s, versus) {
		this.d.e.push((new Date) * Math.random() * (versus ? 1 : -1));
	},

	// send 
	snd : function (score, name) {
		var self = this;
		this.d.cs = score;
		this.d.os = LIB.security.crypt(score+"", eval(this.d.e.join('+')) + (name||'anonymous'));
		LIB.io.post("$SUBMIT_URL$?a=pre", function (r) {
			LIB.Channel('boing').pub('submitReady', [r]);
		}, true, {
			e : self.d.e,
			cs : self.d.cs,
			os : self.d.os
		})
	},
	reset : function (){
		this.d = {e : [], cs : 0, os : ''};
	},
	getLeaderboard : function (f) {
		LIB.io.getJson('$SUBMIT_URL$?a=lb', f);
	}
};