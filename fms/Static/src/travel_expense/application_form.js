/*
 *@Description: 用于处理申请提交页面
 *@date:        2014-04-18
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //全局变量计数器
    var purpose_row_num=1;
    var travel_row_num = 1;
    var create_travel_row_num=1;
    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //引入差旅报销公共js
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var getUrlParam = travel_common.getUrlParam;
    var errorMsg = travel_common.errorMsg;
    var date_diff = travel_common.date_diff;
    var time_diff = travel_common.time_diff;
    var cd_dialog = travel_common.cd_dialog;
    var fToNum = travel_common.fToNum;
    //var apply_common = require('/Static/src/travel_expense/common/apply_common');

    //引入财务数字
    var f = require('/Static/src/common/f_decmal');
    //引入数值合计
    var add_up = require('/Static/src/common/addUp');

    //引入交通工具
    var create_traffic_tool = require('/Static/src/travel_expense/common/create_traffic_tool');
    var traffic_tool = create_traffic_tool.traffic_tool();

    //获取当前用户数据
    var get_current_user_data = require('/Static/src/travel_expense/common/get_data/get_current_user_data');

    //引入树状下拉菜单
    require('/Static/src/plugin/stree/jquery.stree.part')($);
    require('/Static/src/plugin/stree/css/stree.css');

    //引入客户信息获取
    require('/Static/src/travel_expense/common/client_info/get_client_info.css');
    var client_info = require('/Static/src/travel_expense/common/client_info/get_client_info');

    //引入地区选择
    require('/Static/src/plugin/areaPicker/areaPicker.css');
    var areaPicker = require('/Static/src/plugin/areaPicker/areaPicker');
	
	//引入日历插件
	require('/Static/src/plugin/jdpicker_1.2/jdpicker.css');
	require('/Static/src/plugin/jdpicker_1.2/jquery.jdpicker')($);
	$.date_input.initialize('.jdpicker');
	
    //获取省份数据
    var pData = proviceData();
    pData.splice(0, 1);
    //省份数据
    function proviceData() {
        var proData;
        $.ajax({
            type: "post",
            url: $.url_prefix + '/Ashx/Common/AreaHandler.ashx?method=GetAllProvince&t='+(+new Date()),
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


    var appForm = {
        init: function () {
            this._subNav();
            this._company();
            this._userName();
            this._textArea_tip();
            this._phone();
            this._treebox();
            this._input_box_height_change();
            this._purpose_add_row();
            this._purpose_del_row()
            this._travel_detail_add_row();
            this._travel_detail_del_row();
            this._area_picker();
            this._jd_picker();
            this._f_decmal();
            this._add_up();
            this._long_traffic_tool();
            this._total_days();
            this._averge();
            this._add_client_info();
            this._application_submit();
        },
        //申请页面公共部分
        _apply_common: function () {
            apply_common.init();
        },
        //面包屑导航
        _subNav: function () {
            var state = getUrlParam('applycase');
            var s_main = '';
            switch (state) {
                case '100':
                    s_main += '<span>普通出差</span>';
                    break;
                case '101':
                    s_main += '<span>探亲出差</span>';
                    break;
                case '102':
                    s_main += '<span>培训出差</span>';
                    break;
                case '103':
                    s_main += '<span>招聘出差</span>';
                    break;
            }
            $('.fms-navsite').append(s_main);
        },
        //公司列表
        _company: function () {
            var $company = $('.choice_company');
            var url = $.url_prefix + '/Ashx/Common/CompanyHandler.ashx?method=GetEffectiveCompanys&'+(+new Date())
            $.ajax({
                type: "post",
                url: url,
                async: false,
                dataType: "json",
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg);
                        //关闭弹出框
                        art.dialog({ id: 'cd_dialog' }).close();
                        return false;
                    }
                    var $option = '';
                    for (var i = 0; i < data.length; i++) {
                        $option += '<option companyId="' + data[i].CompanyID + '">' + data[i].CompanyName + '</option>';
                    }
                    $company.append($option);
                },
                error: function (error) {
                    errorMsg("网络繁忙，请稍后再试！");
                }
            });
        },
        //获取姓名和id
        _userName: function () {
            var user_data = get_current_user_data.get_current_user_data();
            var $userName = $('.userName');
            $userName.text(user_data.TrueName);
            $userName.attr('userId', user_data.UserID);
        },
        //输入框提示
        _textArea_tip: function () {
            var label_tip=require('/Static/src/common/label_tip');
            //获取需要验证的元素
            var $desc_top = $('.description');
            var num = 250;
            label_tip.label_tip($desc_top, num);
        },
        //长途交通工具
        _long_traffic_tool: function () {
            //加载页面时
            var $long_traffic_tool = $('.long_traffic_tool');
            $long_traffic_tool.each(function () {
                $(this).append(traffic_tool);
            });

        },
        //手机号码验证
        _phone: function () {
            $('.pnone').bind('blur', function () {
                var elem = this;
                phone_reg(elem);
            });
        },
        //树
        _treebox: function () {
            //业务
            $(".tree_business").partTree({
                ajaxUrl: $.url_prefix+'/Ashx/BusinessHandler.ashx?method=GetListUsing',
                sign: "bus",
                elem: "#busBox"
            });
            //部门
            $("#tree_department").partTree({
                ajaxUrl: $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=GetDepts&DeptType=0',//DeptType=0,行政部门
                id: "DeptID",
                pid: "ParentDeptID",
                name: "DeptName",
                type: "0",//0为没有文件夹图表
                end: false,//false,为全部节点可以选择。True为只可以选择末节点
                sign: "part",
                elem: "#partBox"
            });

        },
        //输入框高度变化
        _input_box_height_change: function () {
            $('#purpose_desc').delegate('.focus_change_height', 'click', function () {
                var input_height_change = require('/Static/src/common/input_height_change');
                var that = this;
                input_height_change.input_height_change(that);
            })
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
            $('.travel_desc_add_row').unbind('click').bind('click',function () {
                travel_row_num++;
                create_travel_row_num++;
                var new_tr = travel_detail_new_row();
                $('.travel_detail').append(new_tr);
                //重新初始化日历插件
				$.date_input.my_init('#travel_detail_row_'+create_travel_row_num+' .jdpicker');
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
                if (len > 1){
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
                    if ((!isNaN(str[i]) || str[i]=='.') && str[i] != ' ') {
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
        _averge: function () {
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
                },100)
            })
            //平均费用计算
            function average_count() {
                var $days = parseFloat($('.total_days').val());
                if ($days) {
                    var total_cost_str = $('.alltotal').text();
                    var total_cost_num='';
                    for (var i = 0; i < total_cost_str.length; i++) {
                        if (!isNaN(total_cost_str[i]) || total_cost_str[i]=='.') {
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
                client_info.get_client_info.init($(this));
            })
        },
        //提交申请
        _application_submit: function () {
            $(document).delegate('#submit_btn','click',function () {
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

                if (leaved_time[0] > 18 ) {
                    diff_days--;
                }
                if (arrived_time[0] < 6 ) {
                    diff_days--;
                }
                var days = parseInt($('.total_days').val());
                if ((days - diff_days) > 0) {
                    errorMsg('出差总天数不能大于到达时间和出发时间之差');
                    return false;
                }

                //弹出二次确认框
                var agree_agin = '<div class="agreeAgain" style="text-align:center;">' +
                    '<p>您确定要提交报销申请吗？提交之后将无法取消。</p>' +
                    '<span class="blueBtn h26 w82 mr10 disableBtn mt10" id="agree_sure" disabled="disabled">确定</span>' +
                    '<span class="redBtn h26 w82 mt10" id="agree_cancel">取消</span>' +
                    '</div>';
                //倒计时弹出框
                var con = agree_agin;
                var id = '#agree_sure';
                cd_dialog(con, id);

                //二次确认确定提交
                $('#agree_sure').die('click').live('click', function () {
                    var $that = $(this);
                    $that.addClass('disableBtn')
                        .text('申请提交中...')
                        .attr('disabled', 'disabled');
                    $.ajax({
                        type: "post",
                        url: $.url_prefix + $.travel+'method=AddOrder',
                        async: true,
                        data: json_data.json_data,
                        dataType: "json",
                        success: function (data) {
                            if (data != null && data.error) {
                                errorMsg(data.msg)
                                return false;
                            }
                            if (data != null && data.status == 'OK') {
                                //关闭弹出框
                                window.location.href = '/Workflow/TravelExpense/ApplySuccess.html';
                            }
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        },
                        complete: function () {
                            $that.removeAttr('disabled')
                            .text('确定')
                            .removeClass('disableBtn');
							 art.dialog({ id: 'cd_dialog' }).close();
                        }
                    });
                });
                //二次确认取消
                $('#agree_cancel').die('click').live('click', function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                })
            })
        }
    }

    //手机号验证函数
    function phone_reg(el) {
        var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        var phoneNum = $(el).val();
        if (!reg.test(phoneNum)) {
            art.dialog({
                id: 'phone_msg',
                lock: true,
                drag: false,
                content: '请填写正确的手机号码',
            });
            art.dialog({ id: 'phone_msg' }).title('3秒后关闭').time(3);
            return false;
        }
        return true;
    };
    //出差目的新行
    function purpose_new_row() {
        var tr = '<tr>' +
                '<td>' + purpose_row_num + '</td>' +
                    '<td><input type="text" class="allEditTab-txtInput focus_change_height" readonly="true" /></td>' +
                    '<td colspan="4"><p class="allEditTab-txtInput client_info"></p></td>' +
                    '<td><span class="redBtn h22 w45 purpose_del_btn">删除</span></td>' +
                '</tr>';
        return tr;
    };
    //行程详情新行
    function travel_detail_new_row() {
        var tr = '<tr id="travel_detail_row_' + create_travel_row_num + '">' +
                '<td>行程' + travel_row_num + '</td>' +
                '<td><input type="text" class="allEditTab-txtInput areaPicker" readonly="true"/></td>' +
                '<td><input type="text" class="allEditTab-txtInput jdpicker arrival_time" readonly="true" /></td>' +
                '<td><input type="text" class="allEditTab-txtInput finance_decmal city_traffic_cost subcost" value=""/></td>' +
                '<td><input type="text" class="allEditTab-txtInput finance_decmal stay_cost subcost" value="" /></td>' +
                '<td><input type="text" class="allEditTab-txtInput finance_decmal long_traffic_cost subcost" value="" /></td>' +
                '<td><select class="fms-select long_traffic_tool">'+
                    '<option>-选择交通工具-</option>'+
                '</select></td>'+
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
        }
    };
    //提交表单验证
    function form_validation() {
        var flag = false;

        //验证手机号码
        var phone = $('#phone');
        if (!phone_reg(phone)) {
            return true;
        };
        //总出差天数验证
        var total_days = $('.total_days');
        if ($('.total_days').val() == '0.0') {
            errorMsg('出差总天数必须大于0')
        }
        var $text = $('.mutate-table :input,#purpose_desc :input,.travel_desc :input ');
        //需验证的元素的个数
        var len = $text.length;
        //验证所有的输入框都为必填
        $text.each(function (index, elem) {
            if ($(this).val() == '' || $(this).val() == '— 请选择公司 —' || $(this).val() == '-选择交通工具-') {
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
        var date_time;
        var data = {};
        data.date_data = [];
        data.time_data = [];
        //获取头部信息
        var headdata = {};

        headdata.CompanyID = $('.choice_company option:selected').attr('companyid');
        headdata.DeptID = $('.tree_department').attr('nodeid');
        headdata.BusiID = $('.tree_business').attr('nodeid');
        headdata.UserID = $('.userName').attr('userId');
        headdata.TrueName = $('.userName').text();
        headdata.Phone = $('.pnone').val();
        //获取申请说明文本,先使用正则表达式去掉html标签，然后对字符串进行编码
        headdata.Description = $('.description').val().replace(/<[^>].*?>/g, '');
        headdata.FormID = getUrlParam('formid');
        headdata.ApplyCase = getUrlParam('applycase');

        //获取出差目的描述信息
        var purposedata = [];

        var trs = $('#purpose_desc tbody tr');
        for (var i = 0; i < trs.length; i++) {
            var this_tr = $(trs[i]);
            purposedata[i] = {};
            purposedata[i].PurposeDesc = this_tr.find('.focus_change_height').val();
            var contact = this_tr.find('.client_contact_name');
            purposedata[i].ContactName = contact.text();
            purposedata[i].ContactID = contact.attr('nodeid');
            var customer = this_tr.find('.client_customer_name');
            purposedata[i].CusName = customer.text();
            purposedata[i].CusID = customer.attr('nodeid');
            purposedata[i].Duty = this_tr.find('.client_duty').text();
            purposedata[i].Phone = this_tr.find('.client_phone').text();
        }

        //获取预计行程描述信息
        var traveldata = [];
        //获取行程开始信息
        var start_tr = $('.travel_start tbody tr');
        traveldata[0] = {};
        traveldata[0].Type = 0;
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
        var detail_trs = $('.travel_detail tbody tr');
        for (var i = 1; i <= detail_trs.length; i++) {
            var this_tr = $(detail_trs[i-1]);
            traveldata[i] = {};
            traveldata[i].Type = 0;
            traveldata[i].TravelTag = i;
            var areaPicker = this_tr.find('.areaPicker');
            traveldata[i].AreaID = areaPicker.attr('areaid');
            traveldata[i].AreaName = areaPicker.val();
            traveldata[i].ArrivalTime = this_tr.find('.arrival_time').val();
            traveldata[i].LeaveTime = this_tr.find('.leave_time').val();
            traveldata[i].IncityTrafficFee =fToNum(this_tr.find('.city_traffic_cost ').val());
            traveldata[i].LongDistancTrafficFee = fToNum(this_tr.find('.long_traffic_cost ').val());
            traveldata[i].LongDistancTransportation = this_tr.find('.long_traffic_tool option:selected').val();
            traveldata[i].LodgingFee = fToNum(this_tr.find('.stay_cost ').val());
            traveldata[i].Total =fToNum(this_tr.find('.subtotal').text());

            date_time = traveldata[i].ArrivalTime.split(' ');
            data.date_data.push(date_time[0]);
            data.time_data.push(date_time[1]);
            date_time = traveldata[i].LeaveTime.split(' ');
            data.date_data.push(date_time[0]);
            data.time_data.push(date_time[1]);
        }
        //获取行程结束信息
        var end_tr = $('.travel_end tbody tr');
        var len=traveldata.length;
        traveldata[len] = {};
        traveldata[len].Type = 0;
        traveldata[len].TravelTag = -1;
        var areaPicker = end_tr.find('.areaPicker');
        traveldata[len].AreaID = areaPicker.attr('areaid');
        traveldata[len].AreaName = areaPicker.val();
        traveldata[len].ArrivalTime = end_tr.find('.end_time').val();
        traveldata[len].SumDays = end_tr.find('.total_days').val();
        traveldata[len].IncityTrafficFeeSum =fToNum( end_tr.find('.city_traffic_cost_total').text());
        traveldata[len].LodgingFeeSum =fToNum( end_tr.find('.stay_cost_total ').text());
        traveldata[len].LongDistancTrafficFeeSum = fToNum(end_tr.find('.long_traffic_cost_total ').text());
        traveldata[len].AvgFee = fToNum(end_tr.find('.average_cost ').text());
        traveldata[len].SumFee = fToNum(end_tr.find('.alltotal ').text());

        date_time = traveldata[len].ArrivalTime.split(' ');
        data.date_data.push(date_time[0]);
        data.time_data.push(date_time[1]);

        var url = $.url_prefix + $.travel+'method=AddOrder&headdata=' + JSON.stringify(headdata) + '&purposedata=' + JSON.stringify(purposedata) + '&traveldata=' + JSON.stringify(traveldata);
        data.json_data = {
            'headdata':JSON.stringify(headdata),
            'purposedata': JSON.stringify(purposedata),
            'traveldata': JSON.stringify(traveldata)
        }
        return data;
    }; 

    module.exports = appForm;
})