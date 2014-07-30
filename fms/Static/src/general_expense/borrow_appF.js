define(function (require, exports, module) {
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //获取订单id
    var orderId = getUrlParam('orderid');
    var taskId = getUrlParam('taskid');
    var modeId = getUrlParam('mode');

    var borrow = {
        init: function () {
            this._common();
            this._foot_state();
            this._applyFor_agree();
            this._applyFor_refuse();
            this._applyFor_stop();
        },
        //加载流程公共部分
        _common: function () {
            var common = require('/Static/src/common/flow_common');
            common.init();
        },
        //获取底部状态
        _foot_state: function () {
            $.ajax({
                type: "post",
                url: $.url_prefix+$.general+'method=GetTaskInfo',
                data: { 'taskID': taskId },
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg)
                        return false;
                    }
                    //判断订单是否是被拒绝打回来的
                    if (data.RefuseResult && modeId != 'r') {
                        //如果有数据则弹出来
                        var con = '<div style="text-align:center;">' +
                            '<h1 class="fb f14 tc" style="color:#f00;text-algin:left;"> 此订单已经被拒绝</h1>' +
                            '<p  style="margin:10px 0px 8px;"><span class="fb">拒绝理由： </span>' + data.RefuseResult + '</p>' +
                            '<button class="blueBtn  h22 w45 tc" id="refuseRes">确定</button>' +
                            '</div>';
                        art.dialog({
                            id: 'errorMsg',
                            drag: false,
                            content: con,
                            title: '提示',
                            lock: true
                        });
                        //关闭弹出框
                        $('#refuseRes').die('click').live('click', function () {
                            art.dialog({ id: 'errorMsg' }).close();
                        })
                    }
                    $('.footer').append(create_footer(data, modeId));
                    //先将footer中的元素进行影藏，等待按需加载
                    $('.footer').children().hide();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //点击借款申请按钮
        _applyFor_agree: function () {
            $('#applyFor_agree').live('click', function () {
                var agree_agin = '<div class="agreeAgain" style="text-algin:center;">' +
                    '<p>你确定要通过借款申请吗？通过之后将无法撤销。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="agree_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="agree_cancel">取消</button>' +
                    '</div>';
                //倒计时弹出框
                var con = agree_agin;
                var id = '#agree_sure';
                cd_dialog(con, id);

                //通过确定按钮
                $('#agree_sure').die('click').live('click', function () {
                    agree_sure();
                });
                //通过取消按钮
                $('#agree_cancel').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            });
        },
        //订单作废
        _applyFor_refuse: function () {
            $('#applyFor_refuse').live('click', function () {
                var refuse_con = '<div class="refuse_reason agreeAgain">' +
                    '<p>你确定要结束订单吗？取消之后将无法撤销。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="ref_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="ref_cancel">取消</button>' +
                '</div>';
                //倒计时弹出框
                var con = refuse_con;
                var id = '#ref_sure';
                cd_dialog(con, id);
                //确定关闭借款申请
                $('#ref_sure').die('click').live('click', function () {
                    sureBtn_click();
                });
                //取消关闭借款申请
                $('#ref_cancel').die('click').live('click', function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            })
        },
        //结束借款申请
        _applyFor_stop: function () {
            $('#flow_stop').die('click').live('click', function () {
                var stop_agin = '<div class="agreeAgain" style="text-algin:center;">' +
                    '<p>你确定要结束借款吗？结束之后将无法继续。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="agree_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="agree_cancel">取消</button>' +
                    '</div>';
                //倒计时弹出框
                var con = stop_agin;
                var id = '#agree_sure';
                cd_dialog(con, id);
                //确定结束借款
                $('#agree_sure').die('click').live('click', function () {
                    stop_sure();
                });
                //取消结束借款
                $('#agree_cancel').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            });
        }
    }
    //报销确认
    function agree_sure() {
        //验证
        function onSubmit() {
            var flag = true;
            var $sum = $('#about_detail').contents().find('#payForSum').text();
            if ($sum == '0.00') {
                var msg = '借款申请总金额必须大于0';
                //关闭弹出框
                art.dialog({ id: 'cd_dialog' }).close();
                errorMsg(msg);
                flag = false;
            }
            return flag;
        }
        if (!onSubmit()) return false;

        var parent = $('#about_detail').contents().find('#expenseBody tbody');
        var trs = parent.find('tr');
        //创建JSON数组
        var flow_Mcl = parent.find('.moneyBorrow');
        var dataJson = [
        ];
        $(trs).each(function (index, el) {
            var data_row = {};
            data_row.RowID = parent.find('tr').eq(index).attr('rowId');
            data_row.MoneyBorrow = no_comma(flow_Mcl.eq(index).val());
            dataJson.push(jsonToString(data_row));
        });
        var dataJsonStr = "[" + dataJson.join() + "]";
        //将json转换成string
        function jsonToString(o) {
            var arr = [];
            var fmt = function (s) {
                if (typeof s == 'object' && s != null) return jsonToString(s);
                return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
            }
            for (var i in o)
                arr.push("'" + i + "':" + fmt(o[i]));
            return '{' + arr.join(',') + '}';
        };
        $.ajax({
            type: "post",
            url: $.url_prefix+$.general+'method=BorrowApply',
            data: {
                'orderID': orderId,
                'taskID': taskId,
                'bodyData': dataJsonStr
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg);
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    return false;
                }
                //关闭弹出框
                art.dialog({ id: 'cd_dialog' }).close();
                //操作成功提示
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
    };
    //结束借款
    function stop_sure() {
        $.ajax({
            type: "post",
            url: $.url_prefix+$.general+'method=TaskComplete',
            data: {
                'taskID': taskId
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg);
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
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
    //订单作废
    function sureBtn_click() {
        var url = $.url_prefix+$.general+'method=Nullify';
        $.ajax({
            type: "post",
            url: url,
            data: {
                'taskId': taskId
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg);
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    return false;
                }
                //关闭弹出框
                art.dialog({ id: 'cd_dialog' }).close();
                //操作成功提示
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
    };
    //创建底部信息
    function create_footer(data, modeId) {
        var foot_con = '';
        $('.footer').empty();
        if (modeId != 'r') {
            //未完成
            foot_con += '<button class="blueBtn  h26 w100 mr10" id="applyFor_agree">借款申请</button>' +
                '<button class="redBtn  h26 pl10 w100  mr10" id="flow_stop">关闭借款申请</button>' +
                '<button class="redBtn  h26 pl10 w100 fr  mr10" id="applyFor_refuse">作废</button>';
        } else if (data.Attitude == 'True') {
            $('.footer').hide().height(0).css('padding', '0');
            $('.container').css('padding-bottom', '0');
            $('#expenseFoot').css({ 'position': 'relative', 'top': '5px' });
        } else {
            foot_con += '<span class="state_red" style="display:inline-block;margin-right:20px;">订单已经作废</span>';
        }
        return foot_con;
    };
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //错误提示效
    function errorMsg(msg) {
        art.dialog({
            id: 'errorMsg',
            drag: false,
            content: msg,
            title: '错误提示页面',
            lock: true
        });
        art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
    }
    //去除字符串中的‘,’号
    function no_comma(str) {
        var no_comma_str = '';
        for (var i = 0; i < str.length; i++) {
            if (!isNaN(str[i]) || str[i] == '.') {
                no_comma_str += str[i];
            }
        }
        return no_comma_str;
    }
    //操作成功提示
    function infoMsg() {
        var msg = '<div class="tc" style="width:100px;">' +
                        '<p>操作成功</p>' +
                        '<button class="blueBtn h22 w45 mt10" id="success_btn">确定</button>' +
                    '</div>';
        art.dialog({
            id: 'infoMsg',
            drag: false,
            content: msg,
            title: '信息提示页面',
            lock: true,
            close: function () {
                //关闭弹窗重新加载页面
                location.reload();
            }
        });
    }
    //倒计时弹出框
    function cd_dialog(con, id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }
    module.exports = borrow;
})