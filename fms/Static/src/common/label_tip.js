/*
 *@Description: 实现了label的输入提示功能，并且能够控制输入的文字的数量
 *@date:        2014-04-18
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    //输入框验证验证函数
    function label_tip(elem, num) {
        var $label = $(elem).siblings('label');
        if ($(elem).val() != '') {
            $label.hide();
        }
        $(elem).die('focus').live('focus', function () {
            $label.hide();
        }).die('blur').live('blur', function () {
            if ($(elem).val() == '') {
                $label.show();
            }
        }).die('keyup').live('keyup', function () {
            var $val = elem.val();
            if ($val.length > num) {
                //截取前250个字符
                elem.val($val.substr(0, num));
            }
        }).die('change').live('change', function () {
            var $val = elem.val();
            if ($val.length > num) {
                //截取前250个字符
                elem.val($val.substr(0, num));
            }
        });
    }
    exports.label_tip = label_tip;
})