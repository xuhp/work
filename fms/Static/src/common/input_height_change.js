/*
 *@Description: 模拟输入框获得焦点高度变长,默认控制输入的长度不超过250个字符
 *@date:        2014-04-21
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    function input_height_change(that,len) {
        var offset = $(that).offset();
        var left = offset.left;
        var top = offset.top;
        var width = $(that).width();
        var height = $(that).height();
        var $old_val = $(that).val();
        var textArea = '<textarea class="auto_height"></textarea>';

        $('body').append(textArea);
        var $input_box = $('.auto_height');

        //一定要先定位再去获得焦点，不然网页会跳到元素的定位之前的位置
        $input_box.css({ 'position': 'absolute', 'top': top, 'left': left, 'width': width, 'height': height, 'padding': '2px 3px' });

        //将获得焦点写在前面，可以将光标定位到输入文字的后面
        $('.auto_height')[0].focus();

        $input_box.animate({
                height: '100px'
            }, 100)
            .val($old_val)

        $input_box.blur(function () {
            var $new_val = $(this).val().substr(0,250);
                $(this).remove();
                $(that).val($new_val);
            });

    };
    exports.input_height_change = input_height_change;
})