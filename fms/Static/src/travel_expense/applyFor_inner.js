/*
 *@Description: 用于显示借款信息详情
 *@date:        2014-04-29
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
    var date_diff = travel_common.date_diff;
    var time_diff = travel_common.time_diff;
    var cd_dialog = travel_common.cd_dialog;
    var analyze_travel_type = travel_common.analyze_travel_type;
    //获取数据
    var data = travel_common.get_data();

    var apply_common = require('/Static/src/travel_expense/common/apply_common');

    //引入交通工具
    var create_traffic_tool = require('/Static/src/travel_expense/common/create_traffic_tool');
    var traffic_tool = create_traffic_tool.traffic_tool();

    //全局变量计数器
    var purpose_row_num = data.purposesdata.length,
        travel_row_num = data.traveldata.length-2,
        create_travel_row_num = data.traveldata.length-3;

    var mode=getUrlParam('mode');

    var applyFor_inner = {
        init: function () {
            this._temp_render();
            this._add_applyFor_desc();
            this._long_traffic_tool();
            this._apply_common();
        },
        //渲染模板
        _temp_render: function () {
            //引入模板
            var header_temp = require('/Static/temp/travel/header.js');
            var header = header_temp.header_temp();
            var header_html = header(data);

            if (mode != 'r') {
                var purpose_desc_edit_temp = require('/Static/temp/travel/purpose_desc_edit.js');
                var purpose_desc_edit = purpose_desc_edit_temp.purpose_desc_edit_temp();
                var porpose_desc_edit_html = purpose_desc_edit(data);

                var travel_desc_applyFor_temp = require('/Static/temp/travel/travel_desc_applyFor.js');
                var travel_desc_applyFor = travel_desc_applyFor_temp.travel_desc_applyFor_temp();
                var travel_desc_applyFor_html = travel_desc_applyFor(data);

                $('#content').append(header_html, porpose_desc_edit_html, travel_desc_applyFor_html);
            } else {
                var purpose_desc_full_temp = require('/Static/temp/travel/purpose_desc_full.js');
                var purpose_desc_full = purpose_desc_full_temp.purpose_desc_full_temp();
                var porpose_desc_full_html = purpose_desc_full(data);

                var travel_desc_temp = require('/Static/temp/travel/travel_desc.js');
                var travel_desc = travel_desc_temp.travel_desc_temp();
                //筛选行车描述数据,重组行程描述数据
                var travel_data = {};

                travel_data.travel_start = data.traveldata.filter(function (item, index, array) {
                    return (data.traveldata[index].TravelTag == '0' && data.traveldata[index].Type == '10');
                });
                travel_data.travel_end = data.traveldata.filter(function (item, index, array) {
                    return (data.traveldata[index].TravelTag == '-1' && data.traveldata[index].Type == '10');
                });
                //此处只显示实际行程，因此只需要获取actual就可以了。另外max_len也要修改，防止出现空行（当预计比实际数据多的时候）
                travel_data.travel_detail = {
                    purpose: [],
                    actual: [],
                    check: []
                }
                for (var i = 0; i < data.traveldata.length; i++) {
                    if (data.traveldata[i].TravelTag > 0) {
                        if (data.traveldata[i].Type == '10') {
                            travel_data.travel_detail.actual.push(data.traveldata[i]);
                        }
                    }
                }
                travel_data.travel_detail.purpose_len = travel_data.travel_detail.purpose.length;
                travel_data.travel_detail.actual_len = travel_data.travel_detail.actual.length;
                travel_data.travel_detail.check_len = travel_data.travel_detail.check.length;
                travel_data.travel_detail.max_len = travel_data.travel_detail.actual.length;

                var travel_desc_html = travel_desc(travel_data);

                $('#content').append(header_html, porpose_desc_full_html, travel_desc_html);
            }
            analyze_travel_type();
        },
        //添加报销说明
        _add_applyFor_desc: function () {
            var applyFor_desc = '<tr>' +
                        '<td colspan="6">' +
                            '<span class="mutate-label label" style="display:inline-block;position:relative;top:-35px;">报销说明:</span>'+
                            '<div class="desc_wrapper" style="display:inline-block;width:100%;">' +
                                '<label for="description" style="display:block;">请输入不多于250个字符</label>' +
                                '<textarea id="description" class="form-textarea form-normal description" style="width:92%;">' + data.headdata.Description + '</textarea>' +
                            '</div></td></tr>';
            if (mode != 'r') {
                $('.detailTop table tbody').append(applyFor_desc);
            }
        },
        //长途交通工具
        _long_traffic_tool: function () {
            //加载页面时
            var $long_traffic_tool = $('.long_traffic_tool');
            $long_traffic_tool.each(function (index,el) {
                $(this).append(traffic_tool)
                    .val(data.traveldata[index+1].LongDistancTransportation);
            });
        },
        //提交页面公共部分
        _apply_common: function () {
            apply_common.init();
        }
        
    }

    module.exports = applyFor_inner;
})