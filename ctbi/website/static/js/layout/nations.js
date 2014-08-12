/*
 *@Version:	    v1.0(2014-07-24)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 全国相关操作
 */

var nations = {
    init: function (state,info,pos) {
        this._pay_attention(state);
        this._app_tip_info();
        this._create_app_tip(info, pos);
    },
    //关注
    _pay_attention: function (state) {
        attention.init(state);
    },
    //app提示文本操作
    _app_tip_info: function () {
        var $app_help = $('.app_help');
        $('.info_tip').removeClass('info_tip_bottom').addClass('info_tip_top');
        $app_help.click(function () {
            $('.info_tip_wrap').fadeIn(200);
        }).mouseout(function () {
            $('.info_tip_wrap').fadeOut(100);
        })
    },
    //绘制app提示文本
    _create_app_tip: function (info, pos) {
        help_info.init(info, pos);
    }
}