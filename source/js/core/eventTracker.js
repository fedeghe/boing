SB.makeNS('SB/track', function () {

	var SB_tracker = (function () {

			var endPoint = SB.engy.config.eventEntryPoint,
				data = {
					// believe it or not that id locked by the ADB
					// a_id : 'sm_creativeID' in window ? sm_creativeID : 0,
					ad_id : 'sm_creativeID' in window ? sm_creativeID : 0,
					ca_id : 'sm_campaignID' in window ? sm_campaignID : 0,
					li_id : 'sm_lineItemID' in window ? sm_lineItemID : 0
				},
				debug = function (msg) {
					typeof cns !== 'undefined' && cns.debug(msg);
					'dbg' in console && console.dbg(msg);
				},
				interacted = false;

		// bridge
		// 
		function do_event(ev){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `event`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(ev);
			debug(msg);

			SB.io.getJson(
				endPoint,
				function () {},
				SB.object.extend(data, {
					"event" : ev + ""
				})
			);
			return true;
		}

		function do_dynamicClick(ev, url){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `dynamicClick`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(ev, url);
			SB.io.getJson(
				endPoint,
				function () {
					window.open(url);
				},
				SB.object.extend(data, {
					"event" : ev + "",
					clickUrl : url
				})
			);
			SB.io.getJson(
				endPoint,
				function () {
					console.log('click event logged')
				},
				SB.object.extend(data, {
					"event" : "click",
					clickUrl : url
				})
			);
			return true;
		}

		function do_expand(){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `expand`]';
			console.log(msg);
		
			SB.io.getJson(
				endPoint,
				function () {
					console.log('expand event logged')
				},
				SB.object.extend(data, {
					"event" : 'expand'
				})
			);
			return true;
		}
		function do_contract(){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `contract`]';
			console.log(msg);
			SB.io.getJson(
				endPoint,
				function () {
					console.log('collapse event logged')
				},
				SB.object.extend(data, {
					"event" : 'contract'
				})
			);
			return true;
		}

		function do_ready(f){
			var msg = '[Stailabounce IMPLEMENTATION on action `ready`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(f);
			SB.events.ready(f);
			return true;
		}

		function do_getContent(lab, fback){
			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `getContent`]';
			console.log(msg);
			console.log('Arguments passed : ');
			console.log(lab, fback);
			return true;
		}

		function do_interaction() {
			// once
			//
			if (interacted) return;
			interacted = true;

			var msg = '[TEMPORARY Stailabounce IMPLEMENTATION on action `interaction`]';
			console.log(msg);

			SB.io.getJson(
				endPoint,
				function () {},
				SB.object.extend(data, {
					"event" : 'interaction'
				})
			);
			return true;
		}

		function do_clickThrough(pars) {
			if (typeof pars === 'undefined') {
				return;
			}
			
			pars = SB.object.extend(pars, {
				adId : sm_creativeID,
				cpId : sm_campaignID,
				liId : sm_lineItemID,
				"event" : "clickThrough"
			});
		
			SB.io.getJson(
				endPoint,
				function () {
					console.log('DEBUG: ', pars);
				},
				pars
			);
			return true;
		}

		function do_debug(pars) {
			if (typeof pars === 'undefined') {
				return;
			}
			'type' in pars || (pars.type="no type specified");
			pars = SB.object.extend(pars, {
				adId : sm_creativeID,
				cpId : sm_campaignID,
				liId : sm_lineItemID
			});
		
			SB.io.getJson(
				endPoint,
				function () {
					console.log('DEBUG: ', pars);
				},
				pars
			);
			return true;
		}

		return {
			"event" : do_event,
			clickThrough : do_clickThrough,
			dynamicClick : do_dynamicClick,
			expand : do_expand,
			contract : do_contract,
			ready : do_ready,
			getContent : do_getContent,
			interaction : do_interaction,
			debug : do_debug
		};
	})();


	return {
		"event" : function(p) {
			return !SB.mute && SB_tracker['event'](p);
		},
		
		dynamicClick : function (p1, p2) {
			return !SB.mute && SB_tracker.dynamicClick(p1, p2);
		},
		
		expand : function () {
			return !SB.mute && SB_tracker.expand();
		},
		
		contract : function () {
			return !SB.mute && SB_tracker.contract();
		},
		
		ready : function (f) {
			return !SB.mute && SB_tracker.ready(f);
		},
		
		getContent : function (p1, p2) {
			return !SB.mute && SB_tracker.getContent(p1, p2);
		},

		// interaction is not present in ADTECH, thus check
		// 
		interaction : function () {
			return !SB.mute
			&&
			'interaction' in SB_tracker
			&&
			typeof SB_tracker.interaction == 'function'
			&&
			SB_tracker.interaction();
		},
		pixel : function (pixel_url) {
			if(SB.mute) return false;

			if (SB.util.isArray(pixel_url)) {
				for (var i = 0, l = pixel_url.length; i < l; i++) {
					SB.track.pixel(pixel_url[i]);
				}
			}
			var i = new Image(1, 1);
			i.src = pixel_url;
			return true;
		},
		clickThrough : SB_tracker.clickThrough,
		debug : SB_tracker.debug
	};

	

});