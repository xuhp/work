/*
 *@Description: 获取当前用户相关信息
 *@date:        2014-05-06
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */

define(function (require, exports, module) {
    var $ = require('jquery');
    function get_current_user_data() {
        //交通工具数据
        var user_data;
        var url = $.url_prefix + '/Ashx/Common/SSOHandler.ashx?method=GetCurrentUser';
        $.ajax({
            type: "get",
            url: url,
            async: false,
            dataType: "json",
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg);
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    return false;
                }
                user_data = data;
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
        return user_data;
    };
    exports.get_current_user_data = get_current_user_data;
})