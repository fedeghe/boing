SB.makeNS('SB/cookie');

~function () {

	SB.cookie = {
		cookie_nocookiesaround : false,

		set : function (name, value, expires, path, domain, secure) {
			"use strict";
			this.cookie_nocookiesaround = false;
			var today = new Date(),
				expires_date = new Date(today.getTime() + expires);
			expires && (expires = expires * 1000 * 60 * 60 * 24);
			window.document.cookie = name +
				"=" + window.escape(value) +
				(expires ? ";expires=" + expires_date.toGMTString() : "") +
				(path ? ";path=" + path : "") +
				(domain ? ";domain=" + domain : "") +
				(secure ? ";secure" : "");
			return true;
		},

		get : function (check_name) {
			"use strict";
			var a_all_cookies = window.document.cookie.split(';'),
				a_temp_cookie = '',
				cookie_name = '',
				cookie_value = '',
				b_cookie_found = false,
				i = 0,
				l = a_all_cookies.length;
			for (null; i < l; i += 1) {
				a_temp_cookie = a_all_cookies[i].split('=');
				cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
				if (cookie_name === check_name) {
					b_cookie_found = true;
					a_temp_cookie.length > 1 && (cookie_value = window.unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, '')));
					return cookie_value;
				}
				a_temp_cookie = null;
				cookie_name = '';
			}
			return b_cookie_found;
		},

		del : function (name, path, domain) {
			"use strict";
			var ret = false;
			if (this.get(name)) {
				window.document.cookie = name + "=" + (path ? ";path=" + path : "") + (domain ? ";domain=" + domain : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
				ret = true;
			}
			return ret;
		},

		getall : function () {
			"use strict";
			var ret = [],
				tmp, i = 0, l, t;
			if (window.document.cookie === '') {
				return ret;
			}
			if (this.cookie_nocookiesaround) {
				return ret;
			} else {
				tmp = window.document.cookie.split(';');
				l = tmp.length;
				while (i < l) {
					t = tmp[i++].split(';');
					tmp.push({name : t[0], value : t[1]});
				}
			}
			return ret;
		}
	};

}();
