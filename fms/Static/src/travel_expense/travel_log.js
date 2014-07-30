/*
 *@Description: 差旅报销日志
 *@date:        2014-04-30
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');

    //引入javascript模板引擎 artTemplate
    require('/Static/src/plugin/artTemplate/template.min');

    //引入差旅报销公共js
    //引入差旅报销公共js
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var getUrlParam = travel_common.getUrlParam;
    var errorMsg = travel_common.errorMsg;
    var tabColor = travel_common.tabColor;
    var ToDate = travel_common.ToDate;
    var ToTime = travel_common.ToTime;

    //引入模板
    var travel_log_temp = require('/Static/temp/travel/travel_log.js');
    var travel_log = travel_log_temp.travel_log_temp();
   
    var daily = {
        init: function () {
            this._get_data();
        },
        //获取数据
        _get_data: function () {
            var orderid,that;
            orderid = getUrlParam('orderid');
            that = this;
            $.ajax({
                type: "post",
                url: $.url_prefix+$.travel+'method=GetFlowLog',
                data: { 'orderID': orderid },
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg)
                        return false;
                    }
                    var log_data = {};
                    log_data.data = data;
                    var travel_log_html = travel_log(log_data);
                    $('#content').append(travel_log_html);

                    that._related_operations();
                    
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //获取数据之后相关操作
        _related_operations: function () {
            //转化日期格式
            $('#daily tbody tr .operateDate').each(function () {
                $(this).text(ToDate($(this).text()));
            });
            //转化时间格式
            $('#daily tbody tr .operateTime').each(function () {
                $(this).text(ToTime($(this).text()));
            });
            tabColor();
            
            //对前面的图标做相关处理
            var trs = $('#daily tbody tr');
            var len = trs.length;
            for (var i = 0; i < len; i++) {
                if (len == 1) {
                    $(trs[0]).find('.flow ').addClass('flowOnly');
                } else {
                    switch (i) {
                        case 0:
                            $(trs[0]).find('.flow ').addClass('flowTop');
                            break;
                        case len - 1:
                            $(trs[len - 1]).find('.flow ').addClass('flowBottom');
                    }
                }
            }
        }
    }
    module.exports = daily;
});