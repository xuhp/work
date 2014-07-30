/*
 *@Description: 用于显示核定详情
 *@date:        2014-05-08
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
    var analyze_travel_type = travel_common.analyze_travel_type;

    var data = travel_common.get_data();

    //引入财务数字
    var f = require('/Static/src/common/f_decmal');
    //引入数值合计
    var add_up = require('/Static/src/common/addUp');

    //重组行程描述数据
    var travel_data = {};

    travel_data.travel_start = data.traveldata.filter(function (item, index, array) {
        return (data.traveldata[index].TravelTag == '0');
    });
    travel_data.travel_end = data.traveldata.filter(function (item, index, array) {
        return (data.traveldata[index].TravelTag == '-1');
    });
    //将数据查分成预计、实际、核定三部分。模版引擎渲染的时候以最长数据为准，不足的用空行补齐
    travel_data.travel_detail = {
        all: [],
        purpose: [],
        actual: [],
        check:[]
    }
    for (var i = 0; i < data.traveldata.length; i++) {
        if (data.traveldata[i].TravelTag > 0) {
            travel_data.travel_detail.all.push(data.traveldata[i]);
            if (data.traveldata[i].Type == '0') {
                travel_data.travel_detail.purpose.push(data.traveldata[i]);
            }
            if (data.traveldata[i].Type == '10') {
                travel_data.travel_detail.actual.push(data.traveldata[i]);
            }
            if (data.traveldata[i].Type == '20') {
                travel_data.travel_detail.check.push(data.traveldata[i]);
            }
        }
    }
    travel_data.travel_detail.max_len = parseInt(travel_data.travel_detail.all[travel_data.travel_detail.all.length - 1].TravelTag);
    travel_data.travel_detail.purpose_len = travel_data.travel_detail.purpose.length;
    travel_data.travel_detail.actual_len = travel_data.travel_detail.actual.length;
    travel_data.travel_detail.check_len = travel_data.travel_detail.check.length;

    //引入模板
    var header_temp = require('/Static/temp/travel/header.js');
    var header = header_temp.header_temp();

    var purpose_desc_temp = require('/Static/temp/travel/purpose_desc_full.js');
    var purpose_desc = purpose_desc_temp.purpose_desc_full_temp();
    var porpose_desc_html = purpose_desc(data);

    var mode = getUrlParam('mode');

    var check_inner = {
        init: function () {
            this._temp_render();
            this._add_check_desc();
            this._textArea_tip();
            this._f_decmal();
            this._add_up();
            this._average();
        },
        //渲染模板
        _temp_render: function () {
            var header_html = header(data);
            if (mode != 'r') {
                var travel_desc_check_temp = require('/Static/temp/travel/travel_desc_check.js');
                var travel_desc_check = travel_desc_check_temp.travel_desc_check_temp();
                var travel_desc_check_html = travel_desc_check(travel_data);
                $('#content').append(header_html, porpose_desc_html, travel_desc_check_html);
            } else {
                var travel_desc_temp = require('/Static/temp/travel/travel_desc.js');
                var travel_desc = travel_desc_temp.travel_desc_temp();
                var travel_desc_html = travel_desc(travel_data);
                $('#content').append(header_html, porpose_desc_html, travel_desc_html);
            }
            analyze_travel_type();
        },
        //添加报销说明
        _add_check_desc: function () {
            var check_desc = '<tr>' +
                        '<td colspan="6">' +
                            '<span class="mutate-label label" style="display:inline-block;position:relative;top:-35px;">核定说明:</span>' +
                            '<div class="desc_wrapper" style="display:inline-block;width:100%;">' +
                                '<label for="description" style="display:block;">请输入不多于250个字符</label>' +
                                '<textarea id="description" class="form-textarea form-normal description" style="width:92%;">' + data.headdata.Description + '</textarea>' +
                            '</div></td></tr>';
            if (mode != 'r') {
                $('.detailTop table tbody').append(check_desc);
            }
        },
        //输入框提示
        _textArea_tip: function () {
            var label_tip = require('/Static/src/common/label_tip');
            //获取需要验证的元素
            var $desc_top = $('.description');
            var num = 250;
            label_tip.label_tip($desc_top, num);
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
            var check_trs = $('.travel_detail .travel_detail_row');
            for (var i = 0; i < check_trs.length; i++) {
                if (i == 0) {
                    add_up.add_up('#travel_detail_row_1 .subcost ,#travel_detail_leave .subcost', '#travel_detail_row_1 .subtotal');
                } else {
                    add_up.add_up('#travel_detail_row_'+(i+1)+' .subcost', '#travel_detail_row_'+(i+1)+' .subtotal');
                }
            }
            //费用总计
            add_up.add_up('.subcost ', '.alltotal');

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
        }
    }
    module.exports = check_inner;
})