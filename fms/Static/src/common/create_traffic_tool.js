/*
 *@Description: 创建交通工具选项
 *@date:        2014-04-22
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    var $ = require('jquery');
    function traffic_tool() {
        //交通工具数据
        var $option = '';
        var url = '/Static/src/travel_expense/data/long_traffic_tool.js';
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

                for (var i = 0; i < data.length; i++) {
                    $option += '<option traffic_tool_id="' + data[i].type + '">' + data[i].name + '</option>';
                }

            },
            error: function (error) {
                errorMsg("网络繁忙，请稍后再试！");
            }
        });
        return $option;
    };
    exports.traffic_tool = traffic_tool;
})