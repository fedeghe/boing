// type : FACTOY_METHOD

LIB.makeNS('$LIB$/security');

LIB.security = (function () {

	var seed = 24523;
	// var seed = 2;

	return {

		// seed : 3,
		seed : seed,

		useEncoding : false,

		crypt : function (msg, pwd) {
			var code_pwd = LIB.string.str2code(pwd),
				code_msg = [].concat(LIB.string.str2code(escape(msg)), code_pwd),
				cout = [],
				lm = code_msg.length,
				lp = code_pwd.length,
				i = 0,
				j = 0,
				t,
				out;
			while (i < lm) {
				t = code_msg[i]  + code_pwd[j] + LIB.security.seed;
				cout.push(t);
				i += 1;
				j = (j + 1) % lp;
			}
			out = LIB.string.code2str(cout);
			
			return LIB.security.useEncoding ? encodeURIComponent( out ) : out;
		}
		/*
		decrypt : function (cmsg, pwd) {
			pwd = pwd + "";
			if (JMVC.security.useEncoding) cmsg = decodeURIComponent(cmsg);
			var code_cmsg = JMVC.string.str2code(cmsg),
				code_pwd = JMVC.string.str2code(pwd),
				out = [],
				lm = code_cmsg.length,
				lp = code_pwd.length,
				i = 0,
				j = 0,
				t;

			while(i < lm) {
				t = code_cmsg[i]  - code_pwd[j] - JMVC.security.seed;
				out.push(t);
				i += 1;
				j = (j + 1) % lp;
			}

			var out = unescape(JMVC.string.code2str(out)),
				mat = out.match(new RegExp('^(.*)' + pwd + '$'));
			return mat ? mat[1] : false;
		}
		*/
	};
})(); 
