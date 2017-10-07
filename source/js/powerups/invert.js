powerUps.invert = {
	settings : {
		index : 'invert',
		label : 'invert',
		icon : '\uf002',//'fa fa-search',
		frequencyWeight : 2,
		timeToDisappear : 30,
		powerLastsFor : 20
	},
	show : function () {
		console.debug('invert show icon');
		console.debug(_puNode);
	},
	hide : function () {
		console.debug('invert hide');
	},
	activate : function () {
		console.debug('invert active');
	},
	deactivate : function () {
		console.debug('invert inactive');
	}
};