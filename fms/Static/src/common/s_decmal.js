define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    function s_decmal(elem) {
        $(function () {
            var $el = $(elem);
            for (var i = 0; i < $el.length; i++) {
                var that = $el[i];
                decmal_find(that);
            }
        });
		if($(elem).is('input')){
			$(elem).live('change', function () {
				var that = this;
				decmal_find(that);
			});			
		}
    };
	//确定要传入的值
	function decmal_find(that){
        //获取输入框中的val值
        if ($(that).is('input')) {
            var str = $(that).val();
			$(that).val(decmal_num(str));
        } else {
           var str= $(that).text();
		   $(that).text(decmal_num(str));
        }				
	}
	//转化操作
    function decmal_num(str) {
		var flag = false;		
		var str = typeof(str)=="string"?str:str.toString();
		if(str[0]=="-"){
			flag = true;
		}
		//str_num用以保存数字和'.'
        var str_num = '';
        //添加分号后的str
        var str_comma = '';
		//如果为数字和'.'之外的字符则移除
        for (var i = 0; i < str.length; i++) {
            if ((!isNaN(str[i]) || str[i] == '.') && str[i]!=' ' ) {
                str_num += str[i];
            }
        };
		//获取第一个'.'出现的索引
        var index = str_num.indexOf('.');
        //判断是否含有'.'
        if (index != -1) {
            /*含有'.'的处理*/
            //获取小数点前面的部分
            var before_str = str_num.substr(0, index);
            var after_str = str_num.substr(index + 1);
            //为before_str添加分号
            var len = before_str.length;
            //余数
            var remainder = len % 3;
            //为before_str添加分号
            for (var j = 0; j < len; j++) {
                str_comma += before_str[j];
                if ((j + 1) % 3 == remainder && j != (len - 1)) {
                    str_comma += ',';
                }
            }
            //如果为空则赋值为0
            if (str_comma.length == 0) {
                str_comma = '';
            }
            //去掉after_str中的'.'
            var newStr = '';
            for (var i = 0; i < after_str.length; i++) {
                if (!isNaN(after_str[i])) {
                    newStr += after_str[i];
                }
            }
            //保留小数点后两位，不足两位的用0补充
            var newStr_len = newStr.length;
            if (newStr_len == 0) {
                newStr = newStr + '00';
            }
            if (newStr_len == 1) {
                newStr = newStr + '0';
            }
            if (newStr_len >= 2) {
                newStr = newStr.substr(0, 2);
            }
            //将字符串进行拼接
            str_comma += '.' + newStr;
        } else {
            //不含有'.'的处理
            var len = str_num.length;
            //余数
            var remainder = len % 3;
            //为before_str添加分号
            for (var j = 0; j < len; j++) {
                str_comma += str_num[j];
                if ((j + 1) % 3 == remainder && j != (len - 1)) {
                    str_comma += ',';
                }
            }
            //如果为空则赋值为0
            if (str_comma.length == 0) {
                str_comma = '';
            }else{
				//补全小数部分
				str_comma += '.00';	
			}
            
        }
        //将数字前置的0去除
        var str_remove_zero;
        var len = str_comma.length
        for (var i = 0; i <len; i++) {
            if (str_comma[i] != ',' && str_comma[i] > 0) {
                str_remove_zero = str_comma.substring(i);
                i = len;
            }
            if (str_comma[i] == '.') {
                str_remove_zero = '0' + str_comma.substring(i);
                i = len;
            }
        }
		if(flag){
			str_remove_zero	 ="-" +  str_remove_zero;
		}
		return str_remove_zero;	
	}
	exports.s_decmal = s_decmal;
	exports.decmal_num = decmal_num;	
})