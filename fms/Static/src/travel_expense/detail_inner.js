/*
 *@Description: 用于显示详情信息
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
    var cd_dialog = travel_common.cd_dialog;
    var analyze_travel_type = travel_common.analyze_travel_type;
    //获取数据
    var data = travel_common.get_data();

    //重组行程描述数据,filter支持ie9+
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
    //如果含有完成情况信息，怎显示完整的出差目的描述
    if (data.purposesdata[0].Completion) {
        var purpose_desc_temp = require('/Static/temp/travel/purpose_desc_full.js');
        var purpose_desc = purpose_desc_temp.purpose_desc_full_temp();
    }else{
        var purpose_desc_temp = require('/Static/temp/travel/purpose_desc.js');
        var purpose_desc = purpose_desc_temp.purpose_desc_temp();
    }
    var travel_desc_temp = require('/Static/temp/travel/travel_desc.js');
    var travel_desc = travel_desc_temp.travel_desc_temp();

    var detail_inner ={
        init: function () {
            this._temp_render();
            this._f_decmal();
        },
        //渲染模板
        _temp_render: function () {
            var header_html = header(data);
            var porpose_desc_html = purpose_desc(data);
            var travel_desc_html = travel_desc(travel_data);
            $('#content').append(header_html, porpose_desc_html, travel_desc_html);
            analyze_travel_type();
        },
        //财务数字验证
        _f_decmal: function () {
            //引入财务数字
            var f = require('/Static/src/common/f_decmal');
            var elem = '.finance_decmal';
            f.f_decmal(elem);
        },
    }
    module.exports = detail_inner;
})