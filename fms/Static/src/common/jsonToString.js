define(function (require,exports,module) {
    function jsonToString(obj) {
        var THIS = this;
        switch (typeof (obj)) {
            case 'string':
                return '"' + obj.replace(/(["\\])/g, '\\$1') + '"';
            case 'array':
                return '[' + obj.map(THIS.jsonToString).join(',') + ']';
            case 'object':
                if (obj instanceof Array) {
                    var strArr = [];
                    var len = obj.length;
                    for (var i = 0; i < len; i++) {
                        strArr.push(THIS.jsonToString(obj[i]));
                    }
                    return '[' + strArr.join(',') + ']';
                } else if (obj == null) {
                    return 'null';

                } else {
                    var string = [];
                    for (var property in obj) string.push(THIS.jsonToString(property) + ':' + THIS.jsonToString(obj[property]));
                    return '{' + string.join(',') + '}';
                }
            case 'number':
                return obj;
            case false:
                return obj;
        }
    };
    exports.jsonToString = jsonToString;
})