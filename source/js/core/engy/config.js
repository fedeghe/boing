LIB.makeNS('LIB/engy');
(function() {

	var params = {
			componentsUrl: '$COMPONENTS_URI$',
			langUrl : '$LANGS_URI$',
			defaultLang : '$DEFAULT_LANG$',
			eventEntryPoint : '$EVENT_ENTRYPOINT$'
		},
		
		proto = document.location.protocol || 'http:',
		domain = '$DOMAIN$';

	LIB.engy.config = {
		baseUrl: proto + '//' + domain,
		componentsUrl: proto + '//' + domain + params.componentsUrl,
		// openWideUrl: proto + '//' + params.openWideUrl,
		// openWideBaseScriptUrl: proto + '//' + params.openWideBaseScriptUrl,
		langUrl : proto + '//' + domain + params.langUrl,
		eventEntryPoint : params.eventEntryPoint
	};

	LIB.defaultLang = params.defaultLang;
})();
