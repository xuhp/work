/*
 *@Description: 报销申请页面框架
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
    var fToNum = travel_common.fToNum;
    var date_diff = travel_common.date_diff;
    var time_diff = travel_common.time_diff;
    //引入内容框架相关js
    var frame_oprate = require('/Static/src/travel_expense/common/frame_oprate');
    frame_oprate.init();
    var url_para = frame_oprate.get_url_para();
    var foot_state = frame_oprate.get_footer_status();
    var infoMsg = frame_oprate.infoMsg;
    //输入框验证
    var label_tip = require('/Static/src/common/label_tip');
    var applyFor = {
        init: function () {
            this._foot_state();
            this._flow_agree();
            this._submit_data();
            this._close_dialig();
        },
        //创建底部状态
        _foot_state: function () {
            var foot_con = '';
            if (url_para.mode != 'r') {
                //未完成
                foot_con += '<button class="blueBtn  h26 w100" id="flow_agree">提交报销申请</button>';
            } else {
                foot_con += '<p class="state_blue">报销申请已结束</p>'
            }
            $('.footer').append(foot_con);
        },
        //结束借款
        _flow_agree: function () {
            $('.footer').delegate('#flow_agree', 'click', function () {
                //基本验证
                var flag = form_validation();
                if (flag) {
                    return false;
                }
                //获取数据
                var json_data = get_data();
                var date_data = json_data.date_data;
                var time_data = json_data.time_data;

                //前一时间值不得大于后一时间值
                var len = date_data.length;
                var diff_days;
                for (var i = 0; i < date_data.length - 1; i++) {
                    diff_days = date_diff(date_data[i + 1], date_data[i]);
                    if (diff_days <= 0) {
                        errorMsg('请正确填写日期');
                        return false;
                    }
                    if (diff_days == 1) {
                        var diff_times = time_diff(time_data[i + 1], time_data[i]);
                        if (diff_times < 0) {
                            errorMsg('请正确填写时间');
                            return false;
                        }
                    }
                }

                //出差总天数不能大于到达时间和出发时间之差
                //如果出发时间是在当天18：00（18：00不算在内）之后，则出发当天不计算在出差天数中
                //如果结束的到达时间在当天6：00（6：00不算在内）之前，则到达当天不计算在出差天数中
                diff_days = date_diff(date_data[len - 1], date_data[0]);
                var arrived_time = time_data[len - 1].split(':'),
                    leaved_time = time_data[0].split(':');

                if (leaved_time[0] > 18) {
                    diff_days--;
                }
                if (arrived_time[0] < 6) {
                    diff_days--;
                }
                var days = parseInt($('#applyFor').contents().find('.total_days').val());
                if ((days - diff_days) > 0) {
                    errorMsg('出差总天数不能大于到达时间和出发时间之差');
                    return false;
                }

                //弹出二次确认框
                var o_show_str = {
                    'tips': '你确定要提交报销申请吗？通过之后将无法返回。'
                }
                confirm_dialog(o_show_str);


                //二次确认确定提交
                $('#agree_sure').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    $.ajax({
                        type: "post",
                        url: $.url_prefix + $.travel + 'method=ClaimApply',
                        async: false,
                        data: json_data.json_data,
                        dataType: "json",
                        success: function (data) {
                            if (data != null && data.error) {
                                errorMsg(data.msg)
                                return false;
                            }
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
                });

            })
        },
        //提交数据
        _submit_data: function () {
            $('#agree_sure').die().live('click', function () {
               
            })
        },
        //关闭审核弹出框
        _close_dialig: function () {
            $('body').delegate('#agree_cancel', 'click', function () {
                art.dialog({ id: 'cd_dialog' }).close();
            })
        }
    }
    //提交表单验证
    function form_validation() {
        var flag = false;

        //总出差天数不能为0
        if ($('#applyFor').contents().find('.total_days').val() == '0.0') {
            errorMsg('总出差天数必须大于0');
            flag = true;
            return flag;
        }
        var $text = $('#applyFor').contents().find('.detailTop :input,#purpose_desc :input,.travel_desc :input ');
        //需验证的元素的个数
        var len = $text.length;
        //验证所有的输入框都为必填
        $text.each(function (index, elem) {
            if ($(this).val() == '' || $(this).val() == '-选择交通工具-') {
                art.dialog({
                    id: 'allError_msg',
                    drag: false,
                    content: '请完善表单',
                    lock: true
                });
                art.dialog({ id: 'allError_msg' }).title('3秒后关闭').time(3);
                flag = true;
            }
        })
        return flag;
    };

    //获取数据
    function get_data() {
        var this_frame = $('#applyFor').contents();
        var date_time;
        var data = {};
        data.date_data = [];
        data.time_data = [];

        //获取出差目的描述信息
        var purposedata = [];

        var trs = this_frame.find('#purpose_desc tbody tr');
        for (var i = 0; i < trs.length; i++) {
            var this_tr = $(trs[i]);
            purposedata[i] = {};
            purposedata[i].PurposeDesc = this_tr.find('.travel_purpose').text() || this_tr.find('.travel_purpose').val();
            var contact = this_tr.find('.client_contact_name');
            purposedata[i].ContactName = contact.text();
            purposedata[i].ContactID = contact.attr('nodeid');
            var customer = this_tr.find('.client_customer_name');
            purposedata[i].CusName = customer.text();
            purposedata[i].CusID = customer.attr('nodeid');
            purposedata[i].Duty = this_tr.find('.client_duty').text();
            purposedata[i].Phone = this_tr.find('.client_phone').text();
            purposedata[i].Completion = this_tr.find('.client_Completion  :input').val();
        }

        //获取预计行程描述信息
        var traveldata = [];
        //获取行程开始信息
        var start_tr = this_frame.find('.travel_start tbody tr');
        traveldata[0] = {};
        traveldata[0].Type = 10;
        traveldata[0].TravelTag = 0;
        var areaPicker = start_tr.find('.areaPicker');
        traveldata[0].AreaID = areaPicker.attr('areaid');
        traveldata[0].AreaName = areaPicker.val();
        traveldata[0].StartDate = start_tr.find('.start_time ').val();
        traveldata[0].IncityTrafficFee = fToNum(start_tr.find('.city_traffic_cost').val());
        traveldata[0].LongDistancTrafficFee = fToNum(start_tr.find('.long_traffic_cost ').val());
        traveldata[0].LongDistancTransportation = start_tr.find('.long_traffic_tool option:selected').val();
        date_time = traveldata[0].StartDate.split(' ');
        data.date_data.push(date_time[0]);
        data.time_data.push(date_time[1]);
        //获取行程详细信息
        var detail_trs = this_frame.find('.travel_detail tbody tr');
        for (var i = 1; i <= detail_trs.length; i++) {
            var this_tr = $(detail_trs[i - 1]);
            traveldata[i] = {};
            traveldata[i].Type = 10;
            traveldata[i].TravelTag = i;
            var areaPicker = this_tr.find('.areaPicker');
            traveldata[i].AreaID = areaPicker.attr('areaid');
            traveldata[i].AreaName = areaPicker.val();
            traveldata[i].ArrivalTime = this_tr.find('.arrival_time').val();
            traveldata[i].LeaveTime = this_tr.find('.leave_time').val();
            traveldata[i].IncityTrafficFee = fToNum(this_tr.find('.city_traffic_cost ').val());
            traveldata[i].LongDistancTrafficFee = fToNum(this_tr.find('.long_traffic_cost ').val());
            traveldata[i].LongDistancTransportation = this_tr.find('.long_traffic_tool option:selected').val();
            traveldata[i].LodgingFee = fToNum(this_tr.find('.stay_cost ').val());
            traveldata[i].Total = fToNum(this_tr.find('.subtotal').text());

            date_time = traveldata[i].ArrivalTime.split(' ');
            data.date_data.push(date_time[0]);
            data.time_data.push(date_time[1]);
            date_time = traveldata[i].LeaveTime.split(' ');
            data.date_data.push(date_time[0]);
            data.time_data.push(date_time[1]);
        }
        //获取行程结束信息
        var end_tr = this_frame.find('.travel_end tbody tr');
        var len = traveldata.length;
        traveldata[len] = {};
        traveldata[len].Type = 10;
        traveldata[len].TravelTag = -1;
        var areaPicker = end_tr.find('.areaPicker');
        traveldata[len].AreaID = areaPicker.attr('areaid');
        traveldata[len].AreaName = areaPicker.val();
        traveldata[len].ArrivalTime = end_tr.find('.end_time').val();
        traveldata[len].SumDays = end_tr.find('.total_days').val();
        traveldata[len].IncityTrafficFeeSum = fToNum(end_tr.find('.city_traffic_cost_total').text());
        traveldata[len].LodgingFeeSum = fToNum(end_tr.find('.stay_cost_total ').text());
        traveldata[len].LongDistancTrafficFeeSum = fToNum(end_tr.find('.long_traffic_cost_total ').text());
        traveldata[len].AvgFee = fToNum(end_tr.find('.average_cost ').text());
        traveldata[len].SumFee = fToNum(end_tr.find('.alltotal ').text());

        date_time = traveldata[len].ArrivalTime.split(' ');
        data.date_data.push(date_time[0]);
        data.time_data.push(date_time[1]);

        data.json_data = {
            'taskID': url_para.taskid,
            'claimDesc':this_frame.find('#description').val(),
            'purposedata': JSON.stringify(purposedata),
            'traveldata': JSON.stringify(traveldata)
        }

        var url = $.url_prefix + $.travel + 'method=ClaimApply' + '&taskID=' + url_para.taskid + '&claimDesc=' + this_frame.find('#description').val() + '&purposedata=' + JSON.stringify(purposedata) + '&traveldata=' + JSON.stringify(traveldata);

        return data;
    };

    module.exports = applyFor;
})