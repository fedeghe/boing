// -----------------+
// STRING sub-module |
// -----------------+

// private section

// public section
SB.string = {
    /**
     * [ description]
     * @param  {Array[int]} code [description]
     * @return {[type]}      [description]
     */
    code2str : function (code) {
        return String.fromCharCode.apply(null, code);
    },

    /**
     * [ description]
     * @param  {[type]} str [description]
     * @param  {[type]} pwd [description]
     * @return {[type]}     [description]
     */
    str2code : function (str) {
        var out = [],
            i = 0,
            l = str.length;
        while (i < l) {
            out.push(str.charCodeAt(i));
            i += 1;
        }
        return out;
    }
};