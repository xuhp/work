/*
 *@Version:	    v1.0(2014-07-08)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 在线用户操作页面
 */
var list_main = {
    init: function (state,info,pos) {
        this._layout();
        this._pay_attention(state);
        this._app_tip_info();
        this._create_app_tip(info, pos);
    },
    //布局
    _layout: function () {
        setTimeout(function () {
            $('.ui_layout_west').layout({
                resizer: true
            });
        }, 100);
    },
    //关注
    _pay_attention: function (state) {
        attention.init(state);
    },
    //app提示文本
    _app_tip_info: function () {
        var $app_help = $('.app_help');
        $app_help.click(function () {
            var offset = $app_help.offset();
            //设置提示框位置
            $('.info_tip_wrap').css({ 'left': offset.left + 50, 'bottom': $app_help.height() + 10 })
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