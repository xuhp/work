define(function (require, exports, module) {
    var $ = require('jquery');
    function flow_latitude(trs) {
        var flag = true;
        var len = trs.length;
        //创建数组存放条件字符串数组
        var strs = new Array();
        for (var i = 0; i < len; i++) {
            strs[i]='';
            for (var j = 0; j < 4; j++) {
                var $td=$(trs[i]).find('td').eq(j);
                if (j == 2) {
                    strs[i] += $td.find('input').val() + $td.find('.cardNo').children('span').text();
                } else {
                    strs[i] += $td.find('input').val();
                }
            }
        }
        //对数组进行排序
        strs.sort();
        //比较相邻两个字符串是否相等
        for (var m = 0; m < strs.length-1; m++) {
            if (strs[m] == strs[m + 1]) {
                flag = false;
                var msg = '申请条件不能相同';
                errorMsg(msg);
                break;
            }
        }
        return flag;
    };
    module.exports= flow_latitude;
})