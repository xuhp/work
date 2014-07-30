/*
 *@Description: 报销页面公共操作
 *@date:        2014-05-07
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');

    //引入公共js
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var errorMsg = travel_common.errorMsg;
    //获取数据
    var data = travel_common.get_data();

    //引入财务数字
    var f = require('/Static/src/common/f_decmal');
    //引入数值合计
    var add_up = require('/Static/src/common/addUp');

    //引入地区选择
    require('/Static/src/plugin/areaPicker/areaPicker.css');
    var areaPicker = require('/Static/src/plugin/areaPicker/areaPicker');

    //引入客户信息获取
    require('/Static/src/travel_expense/common/client_info/get_client_info.css');
    var client_info = require('/Static/src/travel_expense/common/client_info/get_client_info');

    //引入交通工具
    var create_traffic_tool = require('/Static/src/travel_expense/common/create_traffic_tool');
    var traffic_tool = create_traffic_tool.traffic_tool();

    //获取省份数据
    var pData = proviceData();
    pData.splice(0, 1);
    //省份数据
    function proviceData() {
        var proData;
        $.ajax({
            type: "post",
            url: $.url_prefix + '/Ashx/Common/AreaHandler.ashx?method=GetAllProvince',
            dataType: "json",
            cache: false,
            async: false,
            success: function (data) {
                proData = data;
            },
            error: function (data) {
                errorMsg("网络繁忙，请稍后再试！");
            }
        });
        return proData;
    };

    //全局变量计数器
    if (data) {
        var purpose_row_num = data.purposesdata.length,
            travel_row_num = data.traveldata.length - 2,
            create_travel_row_num = data.traveldata.length - 3;
    } else {
        var purpose_row_num = 1,
           travel_row_num = 1,
           create_travel_row_num = 1;
    }

    var apply_common = {
        init: function () {
            this._textArea_tip();
            this._purpose_add_row();
            this._purpose_del_row();
            this._travel_detail_add_row();
            this._travel_detail_del_row();
            this._area_picker();
            this._jd_picker();
            this._f_decmal();
            this._add_up();
            this._total_days();
            this._average();
            this._add_client_info();
            this._input_box_height_change();
        },
        //输入框提示
        _textArea_tip: function () {
            var label_tip = require('/Static/src/common/label_tip');
            //获取需要验证的元素
            var $desc_top = $('.description');
            var num = 250;
            label_tip.label_tip($desc_top, num);
        },
        //出差目的添加行
        _purpose_add_row: function () {
            $('#purpose_desc_add_row').click(function () {
                purpose_row_num++;
                var new_tr = purpose_new_row();
                $('#purpose_desc').append(new_tr);
            })
        },
        //出差目的删除行
        _purpose_del_row: function () {
            $('#purpose_desc').delegate('.purpose_del_btn', 'click', function () {
                var $tr_wrap = $('#purpose_desc tbody');
                var $trs = $tr_wrap.children('tr');
                var len = $trs.length;
                if (len > 1) {
                    $(this).parents('tr').remove();
                    purpose_row_num--;
                    mark_num($tr_wrap);
                } else {
                    var msg = '最后一行不能删除';
                    errorMsg(msg);
                }
                return false;
            })
        },
        //预计行程描述添加行
        _travel_detail_add_row: function () {
            $('.travel_desc_add_row').click(function () {
                travel_row_num++;
                create_travel_row_num++;
                var new_tr = travel_detail_new_row();
                $('.travel_detail').append(new_tr);
                //重新初始化日历插件
                $.date_input.my_init('#travel_detail_row_' + create_travel_row_num + ' .jdpicker');
                //添加长途交通工具
                $('#travel_detail_row_' + create_travel_row_num).find('.long_traffic_tool').append(traffic_tool);
                //进行费用小计统计
                add_up.add_up('#travel_detail_row_' + create_travel_row_num + ' .subcost', '#travel_detail_row_' + create_travel_row_num + ' .subtotal');
            })
        },
        //预计行程描述删除行
        _travel_detail_del_row: function () {
            var that = this;
            $('.travel_detail').delegate('.travel_desc_del_btn', 'click', function () {
                var $tr_wrap = $('.travel_detail tbody');
                var $trs = $tr_wrap.children('tr');
                var len = $trs.length;
                if (len > 1) {
                    $(this).parents('tr').remove();
                    travel_row_num--;
                    mark_num($tr_wrap, '行程');
                    that._add_up();
                } else {
                    var msg = '最后一行不能删除';
                    errorMsg(msg);
                }
                return false;
            })
        },
        //地区选择
        _area_picker: function () {
            $('.travel_desc').delegate('.areaPicker', 'click', function () {
                areaPicker.init(this, pData);
            })
        },
        //日期选择
        _jd_picker: function () {
            //引入日历插件
            require('/Static/src/plugin/jdpicker_1.2/jdpicker.css');
            require('/Static/src/plugin/jdpicker_1.2/jquery.jdpicker')($);
            $.date_input.initialize('.jdpicker');
        },
        //财务数字验证
        _f_decmal: function () {
            //详细
            var elem = '.finance_decmal';
            f.f_decmal(elem);

            //验证是否超过九位
            //如果为数字和'.'之外的字符则移除
            $('.finance_decmal').live('change', function () {
                var str = $(this).val();
                var str_num = '';
                for (var i = 0; i < str.length; i++) {
                    if (!isNaN(str[i]) || str[i] == '.') {
                        str_num += str[i];
                    }
                };
                var reg = /^(([1-9]\d{0,9})|0)(\.\d{1,2})?$/;
                if (!reg.test(str_num)) {
                    var msg = '填写的金额过长';
                    errorMsg(msg);
                }
            })
        },
        //合计
        _add_up: function () {
            //市内交通费
            add_up.add_up('.city_traffic_cost', '.city_traffic_cost_total');
            //住宿费
            add_up.add_up('.stay_cost', '.stay_cost_total');
            //长途交通费
            add_up.add_up('.long_traffic_cost', '.long_traffic_cost_total');
            //费用小计
            add_up.add_up('.travel_detail tbody tr:first .subcost ,#travel_detail_leave .subcost', '.travel_detail tbody tr:first .subtotal');
            var trs = $('.travel_detail tbody tr');
            for (var i = 1; i < trs.length; i++) {
                add_up.add_up('#travel_detail_row_' + i + ' .subcost', '#travel_detail_row_' + i + ' .subtotal');
            }
            //费用总计
            add_up.add_up('.subcost ', '.alltotal');
        },
        //出差天数验证
        _total_days: function () {
            var days = $('.total_days');
            //输入验证
            days.change(function () {
                var str = days.val();
                var str_num = '';
                for (var i = 0; i < str.length; i++) {
                    if ((!isNaN(str[i]) || str[i] == '.') && str[i] != ' ') {
                        str_num += str[i];
                    }
                }
                if (str_num != '') {
                    days.val(parseFloat(str_num).toFixed(1));
                } else {
                    days.val('0.0');
                }
            })
        },
        //平均费用
        _average: function () {
            //当费用总计变化时
            $('.travel_desc').delegate('.subcost', 'change', function () {
                //费用总计会耗费一定的时间
                setTimeout(function () {
                    average_count();
                }, 100);
            });
            //出差总天数变化时
            $('.total_days').change(function () {
                //保证数字转化先完成
                setTimeout(function () {
                    average_count();
                }, 100)
            })
            //平均费用计算
            function average_count() {
                var $days = parseFloat($('.total_days').val() || $('.total_days').text());
                if ($days) {
                    var total_cost_str = $('.alltotal').text();
                    var total_cost_num = '';
                    for (var i = 0; i < total_cost_str.length; i++) {
                        if (!isNaN(total_cost_str[i]) || total_cost_str[i] == '.') {
                            total_cost_num += total_cost_str[i];
                        }
                    }
                    var total_cost = parseFloat(total_cost_num);
                    var average_cost = (total_cost / $days).toFixed(2);
                    $('.average_cost').text(average_cost);
                    f.f_decmal('.average_cost');
                } else {
                    $('.average_cost').text('0.00');
                }
            }
        },
        //添加联系客户信息
        _add_client_info: function () {
            $('#purpose_desc').delegate('.client_info', 'click', function () {
                client_info.get_client_info.init(this);
            })
        },
        //输入框高度变化
        _input_box_height_change: function () {
            $('#purpose_desc').delegate('.focus_change_height', 'click', function () {
                var input_height_change = require('/Static/src/common/input_height_change');
                var that = this;
                input_height_change.input_height_change(that);
            })
        }
    }

    //出差目的新行
    function purpose_new_row() {
        var tr = '<tr>' +
                '<td>' + purpose_row_num + '</td>' +
                    '<td><input type="text" class="allEditTab-txtInput focus_change_height travel_purpose" readonly="true" /></td>' +
                    '<td colspan="4"><p class="allEditTab-txtInput client_info" style="width:98%;"></p></td>';
        if (data) {
            tr += '<td class="client_Completion ellipsis"><input type="text" class="allEditTab-txtInput focus_change_height" readonly="true"></td>';
        }
                    tr+='<td><span class="redBtn h22 w45 purpose_del_btn">删除</span></td>' +
                '</tr>';
        return tr;
    };
    //行程详情新行
    function travel_detail_new_row() {
        var tr = '<tr id="travel_detail_row_' + create_travel_row_num + '" TravelTag="' + create_travel_row_num + '">' +
                '<td>行程' + travel_row_num + '</td>' +
                '<td><input type="text" class="allEditTab-txtInput areaPicker" readonly="true"/></td>' +
                '<td><input type="text" class="allEditTab-txtInput jdpicker arrival_time" readonly="true" /></td>' +
                '<td><input type="text" class="allEditTab-txtInput finance_decmal city_traffic_cost subcost" value=""/></td>' +
                '<td><input type="text" class="allEditTab-txtInput finance_decmal stay_cost subcost" value="" /></td>' +
                '<td><input type="text" class="allEditTab-txtInput finance_decmal long_traffic_cost subcost" value="" /></td>' +
                '<td><select class="fms-select long_traffic_tool">' +
                    '<option>-选择交通工具-</option>' +
                '</select></td>' +
                '<td><input type="text" class="allEditTab-txtInput jdpicker leave_time" readonly="true" /></td>' +
                '<td class=" finance_decmal subtotal fb">0.00</td>' +
                '<td><span class="redBtn h22 w45 travel_desc_del_btn">删除</span></td>' +
            '</tr>';
        return tr;
    };
    //表格标序号
    function mark_num($tr_wrap, str) {
        var trs = $tr_wrap.children('tr');
        for (var i = 0; i < trs.length; i++) {
            if (arguments.length == 1) {
                $(trs[i]).children().first().text(i + 1);
            }
            if (arguments.length == 2) {
                $(trs[i]).children().first().text(str + (i + 1));
            }
            $(trs[i]).attr('id', 'travel_detail_row_' + i);
        }
    };

    module.exports = apply_common;
})