define(function (require, exports, module) {
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //获取订单id
    var orderId = getUrlParam('orderid');
    var taskId = getUrlParam('taskid');
    var modeId = getUrlParam('mode');

    var check = {
        init: function () {
            this._common();
            this._foot_state();
            this._check_agree();
            this._check_refuse();
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
                    //添加底部元素
                    $('.footer').append(create_footer(data, modeId));
                    //先将footer中的元素进行影藏，等待按需加载
                    $('.footer').children().hide();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //点击核定按钮
        _check_agree: function () {
            $('#check_agree').live('click', function () {
                //验证
                function onSubmit() {
                    var flag = true;
                    //获取所有的输入元素
                    var $elem = $('#about_detail').contents().find('#expenseBody td :text,.mutate-table :input,#description');
                    var msg = '请完善表单';
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
                var agree_agin = '<div class="agreeAgain" style="text-algin:center;">' +
                    '<p>你确定要通过核定吗？通过之后将无法撤销。</p>' +
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
        //取消订单
        _check_refuse: function () {
            $('#check_refuse').live('click', function () {
                var refuse_con = '<div class="refuse_reason desc_wrapper">' +
                     '<label for="res_desc">不能输入超过一百个字符</label>' +
                     '<textarea id="res_desc" class="form-textarea form-normal description "></textarea>' +
                     '<button class="blueBtn h26 w82 mr10 disableBtn" id="ref_sure" disabled="disabled">确定</button>' +
                     '<button class="redBtn h26 w82" id="ref_cancel">取消</button>' +
                 '</div>';

                //倒计时弹出框
                var con = refuse_con;
                var id = '#ref_sure';
                cd_dialog(con, id);
                //输入框验证
                textArea();
                //替换标题
                art.dialog({ id: 'cd_dialog' }).title('拒绝理由');
                //点击取消订单确定按钮
                $('#ref_sure').die('click').live('click', function () {
                    var reason = $('.description').val().replace(/<[^>].*?>/g, '');
                    if (!reason) {
                        var msg = '请填写拒绝理由';
                        errorMsg(msg);
                        return false;
                    }
                    sureBtn_click(reason);
                });
                //点击取消关闭弹出框
                $('#ref_cancel').die('click').live('click', function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            })
        }
    }
    //取消订单确认按钮
    function sureBtn_click(reason) {
        var attitude = false;
        var url = $.url_prefix+$.general+'method=CheckOrder';
        $.ajax({
            type: "post",
            url: url,
            data: {
                'attitude': attitude,
                'reason': reason,
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
    //报销确认按钮
    function agree_sure() {
        var url = $.url_prefix+$.general+'method=FinancialVerification';
        var parent = $('#about_detail').contents().find('#expenseBody tbody');
        var desc = $('#about_detail').contents().find('.detailTop .description').val().replace(/<[^>].*?>/g, '');
        var tr = parent.find('tr');
        var dataJson = [
        ];
        var dataJsonSort = [];
        $(tr).each(function (index, el) {
            var data_row = {};
            data_row.RowID = $(this).attr('rowId');
            data_row.MoneyVouch = no_comma($(this).find('.finance_decmak').val());
            data_row.HasBill = ($(this).find('.fms-select').find('option:selected').text() == '有') ? 'True' : 'False';
            data_row.SubID_ = $(this).find('.tree_subject,.tree_span').attr('nodeId');
            data_row.BillDesc = $(this).find('.explain').attr('title');
            dataJson.push(jsonToString(data_row));
            data_row.SubID = $(this).find('.subName').attr('subid');
            dataJsonSort.push(data_row);
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
        //对json数组进行排序
        var sortData = dataJsonSort.sort(function (a, b) {
            return a['SubID'] > b['SubID'] ? 1 : a['SubID'] == b['SubID'] ? 0 : -1
        });
        /* //如果同一个对内科目对应的对外科目不相同，则发出提醒
        for (var i = 0; i < sortData.length - 1; i++) {
            if (sortData[i].SubID == sortData[i + 1].SubID) {
                if (sortData[i].SubID_ != sortData[i + 1].SubID_) {
                    var str = '对内科目不能对应多个对外科目';
                    errorMsg(str);
                    return false;
                }
            }
        } */
        $.ajax({
            type: "post",
            url: url,
            data: {
                'taskID': taskId,
                'desc':desc,
                'bodyData': dataJsonStr
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    errorMsg(data.msg);
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
            foot_con += '<button class="sureBtn blueBtn  h26 pl10 w100 mr10" id="check_agree">确定</button>' +
                 '<button class="cancelBtn redBtn  h26 pl10 w100 fr  mr10" id="check_refuse">拒绝</button>';
        } else {
            if (data.Attitude == "True") {
                foot_con += '<p class="state_blue">核定已通过</p>'
            } else {
                foot_con += '<span class="state_red" style="display:inline-block;margin-right:20px;">订单已经被拒绝</span>';
            }
        }
        return foot_con;
    }
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
    //输入框验证
    function textArea() {
        var $description = $('.description');
        text($description);
        function text(elem) {
            var $label = $(elem).parents('.desc_wrapper').children('label');
            $(elem).die('focus').live('focus', function () {
                $label.hide();
            }).die('blur').live('blur', function () {
                if ($(elem).val() == '') {
                    $label.show();
                }
            }).die('keyup').live('keyup', function () {
                var $val = elem.val();
                if ($val.length > 100) {
                    //截取前100个字符
                    elem.val($val.substr(0, 100));
                }
            });
        }
    }
    module.exports = check;
})