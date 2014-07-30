/*
 *@Description: 用于显示历史页面出纳信息
 *@date:        2014-05-14
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

    //引入财务数字
    var f = require('/Static/src/common/f_decmal');
    //引入数值合计
    var add_up = require('/Static/src/common/addUp');

    var orderid = getUrlParam('orderid');

    var OperateType = {
        '10': '借款',
        '20': '还款',
        '30': '报销'
    }
    var cashier_info = {
        init: function () {
            this._load();
            this._f_decmal();
            this._add_up();
        },
        //加载数据
        _load: function () {
            var detail_url = $.url_prefix + $.travel + 'method=GetCashierInfo&orderid='+orderid;
            //根据modeId的不同,使用不同的参数
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
                    $('#expenseFormMain tbody').append(create_body(data));
                    //如果type_20（还款）,要将text()改为减号
                    $('.type_20').text('- ');

                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //财务数字转化
        _f_decmal: function () {
            var elem = '.finance_decmal';
            f.f_decmal(elem);
        },
        //合计
        _add_up: function () {
            add_up.add_up('.moneyBorrow', '#moneyBorrowSum');
        }
        ,
        //仅删除页面元素
        _no_data_del: function () {
            $('#expenseBody').delegate('.no_data_del', 'click', function () {
                $(this).parents('tr').remove();
                //进行累加操作
                add_up.add_up('.moneyBorrow', '#moneyBorrowSum');
            })
        }
    }

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

    module.exports = cashier_info;
})