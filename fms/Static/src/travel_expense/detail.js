/*
 *@Description: 审核页面框架
 *@date:        2014-04-30
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
    var detail = {
        init: function () {
            this._foot_state();
            this._flow_agree();
            this._flow_refuse();
            this._close_dialig();
        },
        //创建底部状态
        _foot_state: function () {
            var foot_con = '';
            if (url_para.mode != 'r') {
                //未完成
                foot_con += '<button class="sureBtn blueBtn  h26 pl10 w100 mr10" id="flow_agree">同意</button>' +
                     '<button class="cancelBtn redBtn  h26 pl10 w100" id="flow_refuse">拒绝</button>';
            } else {
                if (foot_state.Attitude == "True") {
                    //审核通过
                    foot_con += '<p class="state_blue">审核已通过</p>'
                } else {
                    //审核未通过
                    foot_con += '<span class="state_red" style="display:inline-block;margin-right:20px;">审核未通过</span>' +
                        '<span><label class="fb">未通过理由: </label>' + foot_state.Reason + '</span>';
                }

            }
            $('.footer').append(foot_con);
        },
        //审核通过
        _flow_agree: function () {
            $('.footer').delegate('#flow_agree', 'click', function () {
                confirm_dialog();
            })
            $('body').delegate('#agree_sure', 'click', function () {
                var o = {
                        attitude: true,
                        reason: '',
                        taskid: url_para.taskid,
                        orderid:url_para.orderid
                    }
                submit_data(o);
            })
        },
        //拒绝
        _flow_refuse: function () {
            $('.footer').delegate('#flow_refuse', 'click', function () {
                var o_show_str = {};
                o_show_str.tips = '<div class="refuse_reason desc_wrapper">'+
                    '<label for="res_desc" style="display: block;">不能输入超过一百个字符</label>' +
                    '<textarea id="res_desc" class="form-textarea form-normal description "></textarea></div>';
                o_show_str.id_name = 'ref_sure';
                confirm_dialog(o_show_str);

                $('.aui_title').text('拒绝理由')
                //获取需要验证的元素
                var $desc_top = $('.description');
                var num = 100;
                label_tip.label_tip($desc_top, num);
            })
            $('body').undelegate('#ref_sure', 'click').delegate('#ref_sure', 'click', function () {
                var this_reason = $('.description').val();
                var o = {
                    attitude: false,
                    reason: this_reason,
                    taskid: url_para.taskid,
                    orderid: url_para.orderid
                }
                submit_data(o);
            })
           
        },
        //关闭审核弹出框
        _close_dialig: function () {
            $('body').delegate('#agree_cancel', 'click', function () {
                art.dialog({ id: 'cd_dialog' }).close();
            })
        }
    }
    //提交数据，通过与拒绝同用一个接口
    function submit_data(o) {
        //关闭弹出框
        art.dialog({ id: 'cd_dialog' }).close();
        $.ajax({
            type: 'post',
            url: $.url_prefix+$.travel+'method=CheckOrder',
            data: o,
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
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

    module.exports = detail;
})