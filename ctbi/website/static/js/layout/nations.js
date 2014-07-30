/*
 *@Version:	    v1.0(2014-07-24)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 全国相关操作
 */

var nations = {
    init: function (state) {
        this._pay_attention(state);
        this._app_tip_info();
    },
    //关注
    _pay_attention: function (state) {
        attention.init(state);
    },
    //app提示文本
    _app_tip_info: function () {
        var $info_tip_wrap = $('.info_tip_wrap'),
            $app_help = $('.app_help');
        $('.info_tip').removeClass('info_tip_bottom').addClass('info_tip_top');
        $app_help.click(function () {
            $info_tip_wrap.fadeIn(200);
        }).mouseout(function () {
            $info_tip_wrap.fadeOut(100);
        })
    }
}