/*
 *@Description: 用于存放差旅报销的公共代码片段
 *@date:        2014-04-18
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
	
    //引入财务数字
    var f = require('/Static/src/common/f_decmal');

    var travel_common = {
        //获取request
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        },
        //错误提示效
        errorMsg: function (msg) {
            art.dialog({
                id: 'errorMsg',
                drag: false,
                content: msg,
                title: '错误提示页面',
                lock: true
            });
            art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
        },
        //计算天数相差的天数日期格式为2014-4-22格式
        date_diff: function (sDate1, sDate2) {
            var aDate, oDate1, oDate2, iDays;
            aDate = sDate1.split('-');
            oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
            aDate = sDate2.split("-");
            oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
            iDays = parseInt((oDate1 - oDate2) / 1000 / 60 / 60 / 24)+1;    //把相差的毫秒数转换为天数
            return iDays;
        },
        //计算时间相差的秒数,格式为16:32:14
        time_diff: function (sTime1, sTime2) {
            var aTime, oTime1, oTime2, iTime;
            aTime = sTime1.split(':');
            oTime1 = aTime[0] * 60 * 60 + aTime[1] * 60 + aTime[2];
            aTime = sTime2.split(':');
            oTime2 = aTime[0] * 60 * 60 + aTime[1] * 60 + aTime[2];
            iTime = oTime1 - oTime2;
            return iTime;
        },
        //弹出框倒计时
        cd_dialog: function (con, id) {
            var cd_dialog = require('/Static/src/common/cd_dialog');
            cd_dialog.cd_dialog(con, id);
        },
        //将财务数字转化成数字形式
        fToNum: function (str) {
            var num='';
            for (var i = 0; i < str.length; i++) {
                if ((!isNaN(str[i]) || str[i] == '.') && str[i]!=' ') {
                    num += str[i];
                }
            };
            return num;
        },
        //获取显示数据
        get_data: function () {
            var flow_data, oPara, mode;
            oPara = {};
            oPara.taskid = this.getUrlParam('taskid');
            oPara.orderid = this.getUrlParam('orderid');
            mode = this.getUrlParam('mode');
            if (!oPara.taskid) {
                oPara.taskid = 888;
                mode = 'h';
            }
            if (mode == 'r') {
                oPara.last = 'false'
            } else {
                oPara.last = 'true'
            }
            var that = this;
            $.ajax({
                type: "post",
                url: $.url_prefix + $.travel + 'method=GetOrder',
                dataType: "json",
                data: oPara,
                cache: false,
                async: false,
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        that.errorMsg(data.msg);
                        return false;
                    }
                    data.traveldata.sort(compare);
                    flow_data=data;
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
            return flow_data;
        },
        //解析报销类型
        analyze_travel_type: function () {
            //报销类型解析
            var travel_type = {
                '100': '普通出差',
                '101': '探亲出差',
                '102': '培训出差',
                '103': '招聘出差'
            }
            var wrap, type_num;
            wrap = $('.travel_type');
            type_num = wrap.attr('nodeid');
            wrap.text(travel_type[type_num]);

        },
        //表格各行变色
        tabColor:function () {
            var $tbody = $('.fms-table tbody');
            $tbody.find('tr:odd').css('background', '#F0F0F0');
        },
        //字符串转换成日期
         ToDate:function(str){
            var DateStr = typeof(str)=="string"?str:str.toString();
            var myDate = DateStr.substr(0,4)+"/"+DateStr.substr(4,2)+"/"+DateStr.substr(6,2);
            return 	myDate;
        },
        //字符串转换成具体时间
        ToTime:function (str){
            var TimeStr = typeof (str) == "string" ? str : str.toString();
            var lackLen = 6 - TimeStr.length;
            for (var i = 0; i < lackLen; i++) {
                TimeStr = "0" + TimeStr;
            }
            var myTime = TimeStr.substr(0, 2) + ":" + TimeStr.substr(2, 2) + ":" + TimeStr.substr(4, 2);
            return myTime;
        },
        //倒计时二次确认页面
        confirm_dialog: function (o_show_str) {
            var tips, sure_btn_text, ref_btn_text, id_name;
            tips = '你确定要通过审核吗？通过之后将无法撤销。';
            sure_btn_text = '确定';
            ref_btn_text = '取消';
            id_name = 'agree_sure';

            if (arguments.length > 0) {
                if (o_show_str.tips) {
                    tips = o_show_str.tips;
                }
                if (o_show_str.sure_btn_text) {
                    sure_btn_text = o_show_str.sure_btn_text;
                }
                if (o_show_str.ref_btn_text) {
                    ref_btn_text = o_show_str.ref_btn_text;
                }
                if (o_show_str.id_name) {
                    id_name = o_show_str.id_name;
                }
            }

            var agree_agin = '<div class="agreeAgain" style="text-align:center;">' +
                   '<p>' + tips + '</p>' +
                   '<button class="blueBtn mt10 h26 w82 mr10 disableBtn" id="' + id_name + '" disabled="disabled">' + sure_btn_text + '</button>' +
                   '<button class="redBtn mt10 h26 w82" id="agree_cancel">' + ref_btn_text + '</button>' +
                   '</div>';
            //倒计时弹出框
            var con = agree_agin;
            var id = '#' + id_name;
            cd_dialog(con, id);
        }
    }
    function compare(a, b) {

        if (a.TravelTag == b.TravelTag) {
            return a.Type - b.Type;
        }

        return a.TravelTag - b.TravelTag
    }
    //倒计时弹出框
    function cd_dialog(con, id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }

    module.exports = travel_common;
})