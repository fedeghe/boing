SB.makeNS('SB/i18n');
(function () {
	var data = {};
	SB.i18n = {
		load : function (dict) {
			data = dict;
		},
		/**
		 * receives a Literal like
		 * {
		 * 	"hello" : {
		 * 		"de" : "hallo",
		 * 		"it" : "ciao",
		 * 		"fr" : "bonjour",
		 * 	 	"en" : "hello"
		 * 	 },
		 * 	 "prova generale" : {
		 * 	 	"de" : "Generalprobe",
		 * 	  	"it" : "prova generale",
		 * 	   	"fr" : "répétition générale",
		 * 	   	"en" : "dress rehearsal"
		 * 	 }
		 * 	}
		 * @return {[type]} [description]
		 */
		dynamicLoad : function (lo) {
			for (var label in lo) {
				SB.lang in lo[label] && (data[label] = lo[label][SB.lang]);
			}
		},
		check : function (lab) {
			var match = lab.match(/i18n\(([^)|]*)?\|?([^)|]*)\|?([^)]*)?\)/);
			return match ? 
				(data[match[1]] ?
					data[match[1]] :
					(match[2] ? match[2] : match[1])
				)
				:
				lab;
		},
		// check : function (lab) {
		// 	var match = lab.match(/i18n\(([^)|]*)?\|?([^)|]*)\|?([^)]*)?\)/),
		// 		matched = match ? 
		// 			(data[match[1]] ?
		// 				data[match[1]] :
		// 				(match[2] ? match[2] : match[1])
		// 			)
		// 			:
		// 			lab;
		// 	return match ? lab.replace(match[0], matched) : lab;
		// },
		get : function (k, fallback) {
			return data[k] || fallback || 'no Value';
		}
	}
})();