/*
 *@Description: 核定页面框架
 *@date:        2014-05-08
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
    //获取数据
    var old_data = travel_common.get_data();
    actual_data = old_data.traveldata.filter(function (item, index, array) {
        return (old_data.traveldata[index].Type == '10');
    });
    //引入内容框架相关js
    var frame_oprate = require('/Static/src/travel_expense/common/frame_oprate');
    frame_oprate.init();
    var url_para = frame_oprate.get_url_para();
    var foot_state = frame_oprate.get_footer_status();
    var infoMsg = frame_oprate.infoMsg;
    //输入框验证
    var label_tip = require('/Static/src/common/label_tip');
    var detail = {
        init: function () {
            this._foot_state();
            this._flow_agree();
            this._flow_refuse();
            this._close_dialig();
        },
        //创建底部状态
        _foot_state: function () {
            var foot_con = '';
            if (url_para.mode != 'r') {
                //未完成
                foot_con += '<button class="sureBtn blueBtn  h26 pl10 w100 mr10" id="flow_agree">同意</button>' +
                     '<button class="cancelBtn redBtn  h26 pl10 w100" id="flow_refuse">拒绝</button>';
            } else {
                if (foot_state.Attitude == "True") {
                    //审核通过
                    foot_con += '<p class="state_blue">财务核定完成</p>'
                } else {
                    //审核未通过
                    foot_con += '<span class="state_red" style="display:inline-block;margin-right:20px;">财务核定未完成</span>' +
                        '<span><label class="fb">未通过理由: </label>' + foot_state.Reason + '</span>';
                }

            }
            $('.footer').append(foot_con);
        },
        //核定通过
        _flow_agree: function () {
            $('.footer').delegate('#flow_agree', 'click', function () {
                //基本验证
                var flag = form_validation();
                if (flag) {
                    return false;
                }
                //获取数据
                var return_data = get_data();
                //验证核定金额不能大于实际金额
                flag = money_validation(return_data.traveldata);
                if (flag) {
                    errorMsg('核定金额不能大于实际金额');
                    return false;
                }

                confirm_dialog();
                $('#agree_sure').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    $.ajax({
                        type: "post",
                        url: $.url_prefix + $.travel + 'method=FinancialVerification',
                        async: false,
                        data: return_data.jsondata,
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
                })
            })
        },
        //拒绝
        _flow_refuse: function () {
            $('.footer').delegate('#flow_refuse', 'click', function () {
                var o_show_str = {};
                o_show_str.tips = '<div class="refuse_reason desc_wrapper">' +
                    '<label for="res_desc" style="display: block;">不能输入超过一百个字符</label>' +
                    '<textarea id="res_desc" class="form-textarea form-normal description "></textarea></div>';
                o_show_str.id_name = 'ref_sure';
                confirm_dialog(o_show_str);

                $('.aui_title').text('拒绝理由')
                //获取需要验证的元素
                var $desc_top = $('.description');
                var num = 100;
                label_tip.label_tip($desc_top, num);
            })
            $('body').undelegate('#ref_sure', 'click').delegate('#ref_sure', 'click', function () {
                var this_reason = $('.description').val();
                var o = {
                    attitude: false,
                    reason: this_reason,
                    taskid: url_para.taskid,
                    orderid: url_para.orderid
                }
                submit_data(o);
            })

        },
        //关闭审核弹出框
        _close_dialig: function () {
            $('body').delegate('#agree_cancel', 'click', function () {
                art.dialog({ id: 'cd_dialog' }).close();
            })
        }
    }
    //提交数据，通过与拒绝同用一个接口
    function submit_data(o) {
        $.ajax({
            type: 'post',
            url: $.url_prefix + $.travel + 'method=CheckOrder',
            data: o,
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    errorMsg(data.msg)
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
    //提交表单验证
    function form_validation() {
        var flag = false;
        var $text = $('#about_detail').contents().find('.detailTop :input,.travel_desc :input ');
        //需验证的元素的个数
        var len = $text.length;
        //验证所有的输入框都为必填
        $text.each(function (index, elem) {
            if ($(this).val() == '') {
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
    //核定金额不得大于实际金额
    function money_validation(traveldata) {
        var flag = false;
        for (var i = 1; i <actual_data.length; i++) {
            if (i == 1) {
                if (traveldata[i].IncityTrafficFee > actual_data[i].IncityTrafficFee || traveldata[i].LongDistancTrafficFee > actual_data[i].LongDistancTrafficFee) {
                    flag = true;
                    return flag;
                }
            } else {
                if (traveldata[i].IncityTrafficFee > actual_data[i].IncityTrafficFee || traveldata[i].LongDistancTrafficFee > actual_data[i].LongDistancTrafficFee || traveldata[i].LodgingFee > actual_data[i].LodgingFee) {
                    flag = true;
                    return flag;
                }
            }
        }
        return flag;
    }
    //获取数据
    function get_data() {
        var this_frame = $('#about_detail').contents();
        //获取预计行程描述信息
        var traveldata = [];
        //获取行程开始信息
        var start_tr = this_frame.find('.travel_start tbody #travel_detail_leave');
        traveldata[0] = {};
        traveldata[0].Type = 20;
        traveldata[0].TravelTag = 0;
        var areaPicker = start_tr.find('.areaPicker');
        traveldata[0].AreaID = areaPicker.attr('areaid');
        traveldata[0].AreaName = areaPicker.text();
        traveldata[0].StartDate = start_tr.find('.start_time ').text();
        traveldata[0].IncityTrafficFee = fToNum(start_tr.find('.city_traffic_cost').val());
        traveldata[0].LongDistancTrafficFee = fToNum(start_tr.find('.long_traffic_cost ').val());
        traveldata[0].LongDistancTransportation = start_tr.find('.long_traffic_tool').text();
        //获取行程详细信息
        var detail_trs = this_frame.find('.travel_detail tbody tr.travel_detail_row');
        for (var i = 1; i <= detail_trs.length; i++) {
            var this_tr = $(detail_trs[i-1]);
            traveldata[i] = {};
            traveldata[i].Type =20;
            traveldata[i].TravelTag = i;
            var areaPicker = this_tr.find('.areaPicker');
            traveldata[i].AreaID = areaPicker.attr('areaid');
            traveldata[i].AreaName = areaPicker.text();
            traveldata[i].ArrivalTime = this_tr.find('.arrival_time').text();
            traveldata[i].LeaveTime = this_tr.find('.leave_time').text();
            traveldata[i].IncityTrafficFee = fToNum(this_tr.find('.city_traffic_cost ').val());
            traveldata[i].LongDistancTrafficFee = fToNum(this_tr.find('.long_traffic_cost ').val());
            traveldata[i].LongDistancTransportation = this_tr.find('.long_traffic_tool').text();
            traveldata[i].LodgingFee = fToNum(this_tr.find('.stay_cost ').val());
            traveldata[i].Total = fToNum(this_tr.find('.subtotal').text());
        }
        //获取行程结束信息
        var end_tr = this_frame.find('.travel_end tbody tr#travel_detail_end');
        var len = traveldata.length;
        traveldata[len] = {};
        traveldata[len].Type = 20;
        traveldata[len].TravelTag = -1;
        var areaPicker = end_tr.find('.areaPicker');
        traveldata[len].AreaID = areaPicker.attr('areaid');
        traveldata[len].AreaName = areaPicker.text();
        traveldata[len].ArrivalTime = end_tr.find('.end_time').text();
        traveldata[len].SumDays = end_tr.find('.total_days').text();
        traveldata[len].IncityTrafficFeeSum = fToNum(end_tr.find('.city_traffic_cost_total').text());
        traveldata[len].LodgingFeeSum = fToNum(end_tr.find('.stay_cost_total ').text());
        traveldata[len].LongDistancTrafficFeeSum = fToNum(end_tr.find('.long_traffic_cost_total ').text());
        traveldata[len].AvgFee = fToNum(end_tr.find('.average_cost ').text());
        traveldata[len].SumFee = fToNum(end_tr.find('.alltotal ').text());

        var return_data = {};
        return_data.jsondata = {
            'taskID':url_para.taskid,
            'verifDesc':this_frame.find('#description').val() ,
            'traveldata':JSON.stringify(traveldata)
        }
        //对traveldata进行排序没用于金额比较
        return_data.traveldata =traveldata.sort(compare);;
        return return_data;
    }

    function compare(a, b) {
        return a.TravelTag - b.TravelTag
    }

    module.exports = detail;
})