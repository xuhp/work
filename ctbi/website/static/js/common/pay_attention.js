/*
 *@Version:	    v1.0(2014-07-14)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description:添加我的关注，取消我的关注，显示方式控制
 * state: 
 * 0: 关注    
 * 1： 取消关注
 */
var attention = {
    init: function (state) {
        var appid = common.getUrlPara('appid'),
            params = { 'appid': appid };
        this._judgment_status(state);
        this._add_attention(params);
        this._remove_attention(params);
        this._hover();
    },
    //判断关注状态
    _judgment_status: function (state) {
        var $wrap = $('.attention_help_wrap');
        if (state == '1') {
            $wrap.append('<a class="remove_attention">已关注</a>');
        } else {
            $wrap.append('<a class="add_attention">未关注</a>');
        }
    },
    //添加我的关注
    _add_attention: function (params) {
        $('.attention_help_wrap').delegate('.add_attention', 'click', function () {
            get_origin_data({
                url: url.domain + url.port + interFace.add_attention,//url地址，必填
                data: params,//参数,选填
                callback: {
                    funName: add_attention_backfun
                }
            });
        })
    },
    //移除我的关注
    _remove_attention: function (params) {
        $('.attention_help_wrap').delegate('.remove_attention', 'click', function () {
            get_origin_data({
                url: url.domain + url.port + interFace.remove_attention,//url地址，必填
                data: params,//参数,选填
                callback: {
                    funName:remove_attention_backfun
                }
            });
        });
    },
    //按钮hover状态
    _hover: function () {
        $('.attention_help_wrap').delegate('.add_attention', 'mouseover', function () {
            $(this).text('点击关注');
        }).delegate('.add_attention', 'mouseout', function () {
            $(this).text('未关注');
        }).delegate('.remove_attention', 'mouseover', function () {
            $(this).text('点击取消关注');
        }).delegate('.remove_attention', 'mouseout', function () {
            $(this).text('已关注');
        })
    }
}
//添加关注回调函数
function add_attention_backfun() {
    $('.add_attention').removeClass('add_attention').addClass('remove_attention').hide().text('已关注').fadeIn(200);
}
//取消关注回调函数
function remove_attention_backfun() {
    $('.remove_attention').removeClass('remove_attention').addClass('add_attention').hide().text('未关注').fadeIn(200);
}
   