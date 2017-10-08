/**
 
		_/_/_/_/  _/      _/    _/_/_/  _/      _/   
	   _/        _/_/    _/  _/          _/  _/      
	  _/_/_/    _/  _/  _/  _/  _/_/      _/         
	 _/        _/    _/_/  _/    _/      _/          
	_/_/_/_/  _/      _/    _/_/_/      _/ 


 * @author Federico Ghedina <fedeghe@gmail.com>
 * 
 * @depencencies:
 * LIB.Widgzard.Promise
 * LIB.checkNS()
 * LIB.object
 * LIB.io
 */

LIB.makeNS("LIB/engy");

LIB.engy.process = function () {

	var args = [].slice.call(arguments, 0),
		config = args[0],
		
		Processor, processorPROTO,
		outConfig = {},
		CONST = {
			fileNameSeparator : "/",
			fileNamePrepend : "component_",
			ext : "$COMPONENTS_EXT$"
		},
		langFunc = LIB.i18n.check;


	// user i18n? 
	//
	'params' in config &&
	'i18n' in config.params &&
	LIB.i18n.dynamicLoad(config.params.i18n);

	/**
	 * Basic Processor object
	 * @param {[type]} config [description]
	 */
	Processor = function (config) {
		/**
		 * List of all caugth components
		 * each components stored will be something like
		 * {component : String name , params : Object Literal}
		 * @type {Array}
		 */
		this.components = [];
		this.retFuncs = [];
		this.config = config;
	};
	processorPROTO = Processor.prototype;


	processorPROTO.run = function () {

		var self = this,
			endPromise = LIB.Widgzard.Promise.create(),
			tmp, i1, i2 , l1, l2;

		// if (LIB.engy.config.lazyLoading) {
			self.getComponentsPromise().then(function () {
				LIB.Widgzard.Promise.join(self.retFuncs).then(function (pro, r) {

					build(self, pro); // let the build resolve it

				}).then(function (p, r) {

					endPromise.done(r[0].config);

				});
			});
		// } else { 
		// 	// get position
		// 	self.getComponents();
		// 	// now look into LIB ns to get the missing json, the one loaded in lazy mode
		// 	for (i1 = 0, l1 = self.components.length; i1 < l1 ; i1++) {
		// 		if (self.components[i1]) {
		// 			for (i2 = 0, l2 = self.components[i1].length; i2 < l2; i2++) {
		// 				self.components[i1][i2].json = LIB.components[self.components[i1][i2].component.value]; //LIB.components;
		// 			}
		// 		}
		// 	}
		// 	var p = LIB.Widgzard.Promise.create();
		// 	p.then(function (p, r) {
				
		// 		//console.debug(r[0]);

		// 		endPromise.done(r[0].config);

		// 	});
		// 	build(self, p);
		// }
		return endPromise;
	};


	processorPROTO.getComponents = function () {
		var self = this,
			tmp = LIB.object.digForKey(self.config, 'component'),
			i, l;

		//build at level
		for (i = 0, l = tmp.length; i < l; i++) {
		
			if (!self.components[tmp[i].level])  {
				self.components[tmp[i].level] = [];
			}     
			self.components[tmp[i].level].push({
				component : tmp[i],
				params : LIB.checkNS(tmp[i].container ?  tmp[i].container + '.params' : 'params' , self.config)
			});
		}
	}; 
	
	processorPROTO.getComponentsPromise = function () {
		var self = this,
			p = LIB.Widgzard.Promise.create(),
			i1, i2, l1, l2;

		self.getComponents();

		self.retFuncs = [];

		for (i1 = 0, l1 = self.components.length; i1 < l1; i1++) {

			// could be undefined @ that level
			// 
			if (self.components[i1]) {

				for (i2 = 0, l2 = self.components[i1].length; i2 < l2; i2++) {

					(function (j1, j2) {

						self.retFuncs.push(function () {
							// a promise for that component
							var pr = LIB.Widgzard.Promise.create(),

								// get the right complete path for the file
								parts = self.components[j1][j2].component.value.split(CONST.fileNameSeparator),
								last = parts.pop(),
								readyName = parts.join(CONST.fileNameSeparator) + CONST.fileNameSeparator + CONST.fileNamePrepend + last,
								file = LIB.engy.config.componentsUrl + readyName + CONST.ext;
							
							// not get it as json, but as raw text so it's possible to specify the cb within the component
							// not being it validated from JSON.parse
							LIB.io.get(
								file,
								function (raw) {
									// remove WHATEVER is found before the {
									// normally will be something like 
									// var WTF = { .....
									// present only to allow minification
									// of each component;
									// the minification with uglify-js usually adds a semicolon at 
									// the end, that must be removed to obtain the  {.....}
									// that will be evaluated
									raw = raw.replace(/^[^{]*/, '').replace(/;?$/, '');

									// and store it
									// self.components[j1][j2].json = eval('(' + raw.replace(/\/n|\/r/g, '') + ')');
									
									self.components[j1][j2].json = eval('(' + raw + ')');
									
									// solve
									pr.done();
								}
							);
							return pr;
						});
					})(i1, i2);
				}    
			}
		}
		p.done();
		return p;
	};


	/**
	 * copyWithNoComponentNorParams
	 * As the name suggest given an object returns a clone
	 * leaving out `params` and `component` elements, if they exist
	 * 
	 * @param  {[type]} o [description]
	 * @return {[type]}   [description]
	 */
	function copyWithNoComponentNorParams(o) {
		var ret = {};
		for (var j in o) {
			if (!j.match(/params|component/)) {
				ret[j] = o[j];
			}
		}
		return ret;
	}

	function build(instance, pro) {

		//  in reverse order the sostitution
		/*
		 * {component: s1 , k1 : x1, k2: ,x2, .....} or 
		 * {component: s1 , params: {}, k1 : x1, k2: ,x2, .....}
		 *
		 * will be at the end replaced with
		 * {content : [ resulting ], k1 : x1, k2: ,x2, .....}
		 * 
		 */
		// localize config, that will be modified

		var components = instance.components,
			config = instance.config,
			k = components.length,
			i, l,
			comp, params, json, res,ref,

			solve = function (j, p) {

				// use 
				var replacing = LIB.object.digForValue(j, /#PARAM{([^}|]*)?\|?([^}]*)}/),
					i, l,
					mayP, fback, ref,
					ret,
					rxRes;

				for (i = 0, l = replacing.length; i < l; i++) {

					rxRes = replacing[i].regexp;

					if (rxRes[2].match(/true|false/)) {
						rxRes[2] = rxRes[2] === "true";
					}


					mayP = LIB.checkNS(replacing[i].regexp[1], p),
					fback = replacing[i].regexp[2],
					ref = LIB.checkNS(replacing[i].container, j);

					// maybe convert
					


					if (mayP !== undefined) {
						ref[replacing[i].key] = mayP;    
					} else {
						ref[replacing[i].key] = fback || false; //'{MISSING PARAM}';
					}
					// WANT SEE if some params are missing?
					// !mayP && !fback && console.log("WARNING: missing parameter! " + replacing[i].regexp[1]) && console.debug(j);
				}

				// maybe langs i18n
				// 
				if (langFunc) {

					replacing = LIB.object.digForValue(j, /i18n\(([^}|]*)?\|?([^}]*)\)/);

					for (i = 0, l = replacing.length; i < l; i++) {
						mayP = langFunc(replacing[i].regexp[0]),
						ref = LIB.checkNS(replacing[i].container, j);
						ref[replacing[i].key] = mayP;
					}	
				}

				// return a clean object
				// with no component & params
				return copyWithNoComponentNorParams(j);
			};
		
		// from the deepest, some could be empty
		while (k--) {
			if (components[k]) {
				for (i = 0, l = components[k].length; i < l; i++) {
					comp = components[k][i];
					params = comp.params;
					json = comp.json;

					res = solve(json, params);

					ref = LIB.checkNS(comp.component.parentContainer, config);
					
					if (comp.component.parentKey != undefined) {
						ref[comp.component.parentKey] = res;
					} else {
						// root
						instance.config = res;
					}
				}
			}
		}
		
		pro.done(instance);
	}
	

	// RUN & return the promise, 
	// so the tipical usega will be
	// 
	//  LIB.engy.process(component-params--CONF).done(function (thePromise, theResults){
	//      
	//      // theResults is an array of the results passed to promise.done()
	//      // in this case is just one, the first el of the array
	//      
	//      // maybe add a target element, otherwise LIB.Widgzard will use the body
	//      theResults[0].target = document.getElementById('myTargetDivID');
	//      LIB.Widgzard.render(theResults[0], true);
	//      
	//  });
	// 
	return (new Processor(config)).run();
	// return endPromise;
};








