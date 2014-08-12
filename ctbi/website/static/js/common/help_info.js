/*
 *@Version:	    v1.0(2014-08-11)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 这里用于显示帮助信息
 */

var help_info = {
    init: function (help_info,pos) {
        this._create_tip_wrap(pos);
        this._create_tip_info(help_info);
    },
    //绘制提示框框架层
    _create_tip_wrap: function (pos) {
        var str = '';
        if (pos == 'top') {
            str += '<div class="info_tip_wrap"><div class="info_tip info_tip_top"></div></div>';
            $('.header').append(str);
        }
        if (pos == 'bottom') {
            str += '<div class="info_tip_wrap"><div class="info_tip info_tip_bottom"></div></div>';
            $('body').append(str);
        }
    },
    //添加提示文本
    _create_tip_info: function (help_info) {
        var $tip_info = $('.info_tip');
        var len = help_info.length;
        for (var i = 0; i < len; i++) {
            var keys = common.get_keys(help_info[i]);
            switch (keys[0]) {
                case 'item':
                    $tip_info.append('<p class="item"><span class="icon"></span>' + help_info[i][keys[0]] + '</p>');
                    break;
                case 'summary':
                    $tip_info.append('<p class="summary"><span>' + help_info[i][keys[0]] + '</span></p>');
                    break;
            }
        }
    }

}
