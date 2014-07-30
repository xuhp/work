define(function (require, exports, module) {
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //获取订单id
    var orderId = getUrlParam('orderid');
    var taskId = getUrlParam('taskid');
    var modeId = getUrlParam('mode');

    var applyFor = {
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
                    if (data.RefuseResult && modeId!='r') {
                        //如果有数据则弹出来
                        var con = '<div style="text-align:center;">' +
                            '<h1 class="fb f14 tc" style="color:#f00;text-algin:left;"> 此订单已经被拒绝</h1>' +
                            '<p  style="margin:10px 0px 8px;"><span class="fb">拒绝理由： </span>' + data.RefuseResult + '</p>' +
                            '<button class="blueBtn  h22 w45 tc" id="refuseRes">确定</button>'+
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
                    //添加底部元素
                    var $footer = $('.footer');
                    var footer_children = setInterval(create, 100);
                    function create() {
                        $footer.append(create_footer(data, modeId));
                        if ($footer.has('button').length > 0) {
                            clearInterval(footer_children);
                        }
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
        //点击报销按钮
        _applyFor_agree: function () {
            $('#applyFor_agree').die('click').live('click', function () {
                var parent = $('#about_detail').contents().find('#expenseBody tbody');
                var trs = parent.find('tr');
                //验证
                function onSubmit() {
                    var flag = true;
                    var $elem = trs.find('input');
                    var msg = '请完善表单';
                    //表单项不能为空
                    for (var i = 0; i < $elem.length; i++) {
                        if ($elem.eq(i).val() == '') {
                            errorMsg(msg);
                            flag = false;
                            break;
                        }
                    }
                    return flag;
                }
                if (!onSubmit()) return false;

                //判断申请条件是否相同
                var flag = different_latitude(trs);
                if (!flag) {
                    return false;
                }

                var agree_agin = '<div class="agreeAgain" style="text-algin:center;">' +
                    '<p>你确定要提交报销申请吗？提交之后将无法撤销。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="agree_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="agree_cancel">取消</button>' +
                    '</div>';
                //倒计时弹出框
                var con = agree_agin;
                var id = '#agree_sure';
                cd_dialog(con, id);
                //通过确定按钮
                $('#agree_sure').die('click').live('click', function () {
                    agree_sure(parent,trs);
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
            $('#applyFor_refuse').die('click').live('click', function () {
                var refuse_con = '<div class="refuse_reason agreeAgain">' +
                    '<p>你确定要取消订单吗？取消之后将无法撤销。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="ref_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="ref_cancel">取消</button>' +
                '</div>';

                //倒计时弹出框
                var con = refuse_con;
                var id = '#ref_sure';
                cd_dialog(con, id);

                //点击取消订单确定按钮
                $('#ref_sure').die('click').live('click', function () {
                    sureBtn_click();
                });
                //点击取消关闭弹出框
                $('#ref_cancel').die('click').live('click', function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            })
        },
        //结束报销申请
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
    //结束报销
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
    //报销确认按钮
    function agree_sure(parent,trs) {
        //创建JSON数组
        var flow_data = parent.find('.flow_data');
        var flow_area = parent.find('.flow_area');
        var flow_paidFor = parent.find('.flow_paidFor');
        var flow_subName = parent.find('.subName');
        var flow_Map = parent.find('.moneyApply');
        var flow_Mcl = parent.find('.moneyClaim');
        var dataJson = [
        ];
        $(trs).each(function (index, el) {
            var data_row = {};
            data_row.RowID = parent.find('tr').eq(index).attr('rowId');
            data_row.Date = flow_data.eq(index).text() || flow_data.eq(index).val();
            data_row.Area = flow_area.eq(index).attr('areaId');
            data_row.CusID = flow_paidFor.eq(index).attr('cusId') || flow_paidFor.eq(index).find('.paidFor').attr('cusId');
            data_row.CusName = flow_paidFor.eq(index).attr('cusName') || flow_paidFor.eq(index).find('.paidFor').attr('cusName');
            data_row.CusType = flow_paidFor.eq(index).attr('cusType') || flow_paidFor.eq(index).find('.paidFor').attr('cusType');
            data_row.AccountHolder = flow_paidFor.eq(index).find('.AccountHolder span').text();
            data_row.CardNo = flow_paidFor.eq(index).find('.cardNo span').text();
            data_row.BankName = flow_paidFor.eq(index).find('.bankName span').text();
            data_row.SubID = flow_subName.eq(index).attr('subId') || flow_subName.eq(index).attr('nodeid');
            data_row.MoneyApply = no_comma(flow_Map.eq(index).text() || flow_Map.eq(index).val());
            data_row.MoneyClaim = no_comma(flow_Mcl.eq(index).val());
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
            url: $.url_prefix+$.general+'method=ClaimApply',
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
            foot_con += '<button class="blueBtn  h26 w100 mr10" id="applyFor_agree" style="display:none;">报销申请</button>' +
                 '<button class="redBtn  h26 pl10 w100   mr10" id="flow_stop" style="display:none;">结束报销申请</button>' +
                 '<button class="redBtn  h26 pl10 w100 fr  mr10" id="applyFor_refuse" style="display:none;">作废</button>';
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
        art.dialog({ id: 'infoMsg' }).title('3秒后关闭').time(3);
    }
    //倒计时弹出框
    function cd_dialog(con, id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }
    //申请条件不可重复
    function different_latitude(trs) {
        var flag = true;
        var len = trs.length;
        //创建数组存放条件字符串数组
        var strs = new Array();
        for (var i = 0; i < len; i++) {
            strs[i] = '';
            for (var j = 0; j < 4; j++) {
                var $td = $(trs[i]).find('td').eq(j);
                if (j == 2) {
                    strs[i] += ($td.find('input').val() || $td.find('.paidFor_pos>span').text()) + $td.find('.cardNo').children('span').text();
                } else {
                    strs[i] += $td.find('input').val() || $td.text() || $td.children('span').text();
                }
            }
        }
        //对数组进行排序
        strs.sort();
        //比较相邻两个字符串是否相等
        for (var m = 0; m < strs.length - 1; m++) {
            if (strs[m] == strs[m + 1]) {
                flag = false;
                var msg = '申请条件不能相同';
                errorMsg(msg);
                break;
            }
        }
        return flag;
    }

    module.exports = applyFor;
})