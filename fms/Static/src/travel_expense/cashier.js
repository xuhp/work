/*
 *@Description: 出纳页面框架
 *@date:        2014-05-09
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);
    //引入公共js
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var errorMsg = travel_common.errorMsg;
    var confirm_dialog = travel_common.confirm_dialog;
    //引入内容框架相关js
    var frame_oprate = require('/Static/src/travel_expense/common/frame_oprate');
    frame_oprate.init();
    var url_para = frame_oprate.get_url_para();
    var foot_state = frame_oprate.get_footer_status();
    var infoMsg = frame_oprate.infoMsg;
    //输入框验证
    var label_tip = require('/Static/src/common/label_tip');
    var cashier = {
        init: function () {
            this._foot_state();
            this._flow_agree();
            this._close_dialig();
        },
        //创建底部状态
        _foot_state: function () {
            var foot_con = '';
            if (url_para.mode != 'r') {
                //未完成
                foot_con += '<button class="blueBtn  h26 w100" id="flow_agree">关闭订单</button>';
            } else {
                foot_con += '<p class="state_blue">订单已关闭</p>'
            }
            $('.footer').append(foot_con);
        },
        //关闭订单
        _flow_agree: function () {
            $('.footer').delegate('#flow_agree', 'click', function () {
                var o_show_str = {
                    'tips': '你确定要关闭订单吗？通过之后将无法撤销。'
                }
                confirm_dialog(o_show_str);
            })
            $('body').delegate('#agree_sure', 'click', function () {
                //关闭弹出框
                art.dialog({ id: 'cd_dialog' }).close();
                close_order();
            })
        },
        //关闭弹出框
        _close_dialig: function () {
            $('body').delegate('#agree_cancel', 'click', function () {
                art.dialog({ id: 'cd_dialog' }).close();
            })
        }
    }
    //提交数据
    function close_order() {
        var url = $.url_prefix + $.travel + 'method=CloseOrder&taskID=' + url_para.taskid;
        $.ajax({
            type: 'post',
            url: url,
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    errorMsg(data.msg)
                    return false;
                }
                //关闭弹出框
                art.dialog({ id: 'cd_dialog' }).close();
                //弹出操作成功信息
                infoMsg();
                //刷新页面
                $('#success_btn').live('click', function () {
                    art.dialog({ id: 'infoMsg' }).close();
                });
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }

    module.exports = cashier;
})