/*
 *@Description: 用于显示出纳信息
 *@date:        2014-05-09
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入javascript模板引擎 artTemplate
    require('/Static/src/plugin/artTemplate/template.min');
    //引入公共js
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var getUrlParam = travel_common.getUrlParam;
    var errorMsg = travel_common.errorMsg;
    var cd_dialog = travel_common.cd_dialog;
    var ToDate = travel_common.ToDate;
    var confirm_dialog = travel_common.confirm_dialog;
    //获取数据
    var user_data = travel_common.get_data();

    //引入日历插件
    require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
    require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')($);

    //引入财务数字
    var f = require('/Static/src/common/f_decmal');
    //引入数值合计
    var add_up = require('/Static/src/common/addUp');

    //引入输入框高度变化插件
    var input_height_change = require('/Static/src/common/input_height_change');

    var orderid = getUrlParam('orderid');
    var taskid = getUrlParam('taskid');
    var mode = getUrlParam('mode');
    var OperateType = {
        '10': '借款',
        '20': '还款',
        '30': '报销'
    }
    var cashier_inner = {
        init: function () {
            this._load();
            this._add_row();
            this._input_box_height_change();
            this._f_decmal();
            this._add_up();
            this._select_type();
            this._no_data_del();
            this._add_borrow_info();
            this._data_del();
        },
        //加载数据
        _load: function () {
            var detail_url = $.url_prefix + $.travel + 'method=GetCashierInfo&orderid=' + orderid;
            $.ajax({
                type: "post",
                url: detail_url,
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg);
                        return false;
                    }
                    //判断mode是否为r
                    if (mode == 'r') {
                        $('.addBtn').remove();
                        $('.opera_hide').remove();
                    } else {
                        $('.opera_hide').show();
                    }
                    $('#expenseFormMain tbody').append(create_body(data));
                    //出纳页面的借款不能删除
                    $('.operateType_10').find('.opera_hide button').remove();
                    //如果type_20（还款）,要将text()改为减号
                    $('.type_20').text('- ');

                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //增加一行
        _add_row: function () {
            $('#expenseF_addBtn').click(function () {
                var new_tr = cashier_new_row();
                $('#expenseBody').append(new_tr);
                //重新初始化日历插件
                $('.date_selector').remove();
                $.date_input.initialize('.jdpicker');
            })
        },
        //输入框高度变化
        _input_box_height_change: function () {
            $('#expenseBody').delegate('.focus_change_height', 'click', function () {
                var that = this;
                input_height_change.input_height_change(that);
            })
        },
        //财务数字转化
        _f_decmal: function () {
            var elem = '.finance_decmal';
            f.f_decmal(elem);
        },
        //合计
        _add_up: function () {
            add_up.add_up('.moneyBorrow', '#moneyBorrowSum');
        },
        //选择操作类型
        _select_type: function () {
            $('.fms-select').die('change').live('change', function () {
                var tr = $(this).parents('tr');
                if ($(this).find("option:selected").text() == '还款') {
                    tr.attr({ 'class': 'operateType_20', 'type': '20' });
                    tr.find('.moneyBorrow').attr('this_type', '20');
                } else if ($(this).find("option:selected").text() == '报销') {
                    tr.attr({ 'class': 'operateType_30', 'type': '30' });
                    tr.find('.moneyBorrow').attr('this_type', '');
                } else {
                    tr.attr({ 'class': '', 'type': '' });
                    tr.find('.moneyBorrow').attr('this_type', '');
                }
            });
        },
        //添加借款信息
        _add_borrow_info: function () {
            $('#expenseBody').delegate('.sure_btn', 'click', function () {
                //基本验证
                var $tr = $(this).parents('tr');
                var flag = form_validation($tr);
                if (flag) {
                    return false;
                }
                //获取传递参数
                var o_para = {
                    'taskID': taskid,
                    'pfID': '',
                    'type': $tr.attr('type'),
                    'date': $tr.find('.jdpicker').val(),
                    'money': no_comma($tr.find('.moneyBorrow').val()),
                    'remark': $tr.find('.remark').val()
                }

                var detail_url = $.url_prefix + $.travel + 'method=AddCashierInfo';

                //数据交互
                $.ajax({
                    type: "post",
                    url: detail_url,
                    data: o_para,
                    async: false,
                    cache: false,
                    dataType: 'json',
                    success: function (data) {
                        //错误验证
                        if (data != null && data.error) {
                            errorMsg(data.msg);
                            return false;
                        }

                        //为tr添加cid 为删除做准备
                        $tr.attr('cId', data.CID);
                        //提交成功之后页面执行操作
                        sure_change($tr, o_para);
                        //将还款前面的标注改成‘-’
                        $('.type_20').text('- ');
                    },
                    error: function (error) {
                        window.location.href = error.responseText;
                    }
                });
            })
        },
        //仅删除页面元素
        _no_data_del: function () {
            $('#expenseBody').delegate('.no_data_del', 'click', function () {
                $(this).parents('tr').remove();
                //进行累加操作
                add_up.add_up('.moneyBorrow', '#moneyBorrowSum');
            })
        },
        //删除页面元素及数据
        _data_del: function () {
            $('#expenseBody').delegate('.data_del', 'click', function () {
                var tr = $(this).parents('tr');
                //弹出二次确认框
                var o_show_str = {
                    'tips': '确定要删除这一行吗?删除之后将无法恢复。'
                }

                confirm_dialog(o_show_str);

                //删除数据
                $('#agree_sure').die('click').live('click', function () {
                    //在数据库中删除此行
                    removeData(tr);
                    //进行累加操作
                    add_up.add_up('.moneyBorrow', '#moneyBorrowSum');
                })

                //关闭弹出框
                $('body').delegate('#agree_cancel', 'click', function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                })

            })
        }
    }

    //增加一行
    function cashier_new_row() {
        var tr = '<tr>' +
                       '<td class="flow_date">' +
                           '<input type="text" class="allEditTab-txtInput jdpicker" readonly="true" /></td>' +
                       '<td class="flow_paidFor">' +
                       user_data.fullname +
                       '</td>' +
                       '<td class="operateType">' +
                            '<select class="fms-select" style="width:90%;">' +
                                '<option>请选择类型</option>' +
                                '<option class="refund">还款</option>' +
                                '<option class="reimburse">报销</option>' +
                            '</select>' +
                       '</td>' +
                        '<td class="flow_moneyBorrow">' +
                            '<input type="text" class="allEditTab-txtInput finance_decmal f14 moneyBorrow" value=""/></td>' +
                        '<td   class="flow_remark ellipsis ">' +
                            '<input type="text" class="allEditTab-txtInput remark focus_change_height" value="" />' +
                        '</td>' +
                        '<td class="flow_opera opera_hide">' +
                            '<button class="blueBtn h22 w45 sure_btn" style="margin-right:5px">确定</button><button class="redBtn h22 w45 no_data_del">删除</button>' +
                        '</td>' +
                   '</tr>';
        return tr;
    }

    //提交成功后执行操作
    function sure_change($tr, o_para) {
        //日期
        var flow_data = $tr.find('.flow_date');
        flow_data.text(o_para.date);
       
        //操作类型
        var operateType = $tr.find('.operateType');
        operateType.text(OperateType[o_para.type]);

        //借款
        var type = $tr.attr('type');
        var flow_moneyBorrow = $tr.find('.flow_moneyBorrow');
        var opera = '<span class="type_' + type + ' fb">';
        if (type == '20') {
            opera+='-';
        }else{
            opera+='+';
        }
        opera += '</span><span class="finance_decmal  moneyBorrow">' + $tr.find('.moneyBorrow').val() + '</span>';
        flow_moneyBorrow.empty();
        flow_moneyBorrow.append(opera)

        // 备注
        var flow_remark = $tr.find('.flow_remark');
        flow_remark.text(o_para.remark);
        flow_remark.attr('title', o_para.remark);
        //操作
        var flow_opera = $tr.find('.flow_opera');
        flow_opera.find('button').remove();
        flow_opera.append('<button class="redBtn h22 w45 data_del">删除</button>');
    }

    //删除数据
    function removeData(tr) {
        var url = $.url_prefix + $.travel + 'method=DelCashierInfo';
        var cid = tr.attr('cid');
        $.ajax({
            type: "post",
            url: url,
            data: {
                'taskID': taskid,
                'CID': cid
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    art.dialog({ id: 'cd_dialog' }).close();
                    errorMsg(data.msg);
                    return false;
                }
                art.dialog({ id: 'cd_dialog' }).close();
                //在页面中删除本行
                tr.remove();
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }

    //提交表单验证
    function form_validation($tr) {
        var flag = false,
            $elem = $tr.find('input'),
            msg = '请完善表单';
        //表单项不能为空
        for (var i = 0; i < $elem.length; i++) {
            if ($elem.eq(i).val() == '') {
                errorMsg(msg);
                flag = true;
                break;
            }
        }
        //借款金额大于0
        if ($elem.eq(1).val() == '0.00') {
            msg = '借款金额必须大于0';
            errorMsg(msg);
            flag = true;
        }
        return flag;
    };

    //加载表单主体信息
    function create_body(data) {
        var body_source = '';
        for (var i = 0; i < data.length; i++) {
            body_source += '<tr cid="' + data[i].CID + '" class="operateType_' + data[i].OperateType + '">' +
                   '<td class="flow_data">' + ToDate(data[i].RecordDate) + '</td>' +
                   '<td class="flow_paidFor">' +
                   user_data.fullname +
                   '</td>' +
                    '<td class="operateType">' + OperateType[data[i].OperateType] + '</td>' +
                   //默认为加号
                   '<td><span class="type_' + data[i].OperateType + ' fb">+</span> <span class="finance_decmal  moneyBorrow" this_type="' + data[i].OperateType + '">' + data[i].Money + '</span></td>' +
                   '<td class="ellipsis"  title="' + data[i].Remark + '" > ' +
                     '<span>' + data[i].Remark + '</span>' +
                   '</td>';
            if (mode != 'r') {
                body_source += '<td class="opera_hide"><button class="redBtn h22 w45 data_del">删除</button></td>';
            }
            body_source += '</tr>';
        }
        return body_source;
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

    module.exports = cashier_inner;
})