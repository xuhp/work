define(function (require, exports, module) {
    var rownum = 0;
    //引入jquery
    var $ = require('jquery');

    //获取订单id
    var orderid = getUrlParam('orderid');

    //转化传入的cusType
    var cusType = {
        '0': '未知',
        '1': '个人',
        '2': '单位'
    }
    //转化传入的installment
    var installment = {
        'True': '多次报销',
        'False': '一次报销'
    }
    //申请方式
    var applyCase={
        '1':'我要借款',
        '2':'自己垫付',
        '3':'先有发票'
    }
    //票据有无
    var hasBill = {
        'True': '有',
        'False': '无'
    }

    /*排序，筛选*/
    //require('/Static/src/plugin/sortTable/sortTable')($);
    //require('/Static/src/plugin/sortTable/css/sort.css');

    /*滚动条*/
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
    
    var orderId = getUrlParam('orderid');

    var applyFor_inner = {
        init: function () {
            this._load_data();
            this._tab();
            this._set_height();
        },
        //加载数据
        _load_data: function () {
            var detail_url = $.url_prefix+$.general+'method=GetAmountOrderInfo&orderID='+orderId;
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
                    //添加头部信息
                    $('.mainWrapper').before(create_head(data));
                    //向父框架中添加说明文本
                    $(window.parent.document).find('.top_tab').append(create_outer_info(data));
                    //判断是否为多次报销，一次来判断是否需要绘制,true为多次报销
                    if (data.Installment == true) {
                        $('.mainWrapper').append(create_nav(data));
                    } else {
                        //获取父元素操作按钮
                        var commonA = $(window.parent.document).find('.footer a');
                        var commonHref = commonA.attr('href')+data.Flows[0].BAID+'&orderid='+orderid;
                        commonA.attr('href', commonHref);
                    }
                    //添加详细信息
                    create_detail(data);
                    //权限判断
                    if (data.SubRight == false) {
                        $('.outer_subjects').remove();
                    }

                    //添加提示框效果
                    tooltip();
                    //应用财务数字
                    var len = data.Flows.length;
                    f_decmal(len);
                    //合计
                    add_up(len);
                    //判断对外科目和票据信息是否有数据，没有则将此td置空
                    $('.no_data').each(function (index, elem) {
                        if ($(this).text() == 'undefined' || $(this).find('span').text() == 'undefined') {
                            $(this).text('-');
                        }
                    });
                    ////如果含有对应的数据为 - ，则取消对这一列的筛选、排序
                    //var $td = $('#conTable tbody tr').eq(0).find('td');
                    //var $th = $('#topTable thead tr').eq(0).find('th');
                    //for (var i = 0; i < $td.length; i++) {
                    //    if ($($td.eq(i)).text() == '-' || $($td.eq(i)).text() == 'undefined') {
                    //        $($th.eq(i).find('span')).remove();
                    //    }
                    //}
                    ////筛选排序
                    //for (var i = 0; i < len; i++) {
                    //    var tabID = "conTable_" + i;
                    //    $("#topTable_"+i).sortTable({
                    //        tableID: tabID
                    //        //backFun: backFun
                    //    });
                    //}
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //tab切换+设置导出报表href
        _tab: function () {
            //获取父元素操作按钮
            var commonA = $(window.parent.document).find('.footer a');
            var commonHref = commonA.attr('href');
            $('.claims_nav li').die('click').live('click', function () {
                var curdex = $('.claims_nav li').index(this);
                $(this).addClass('fms-tab-item-current').siblings().removeClass('fms-tab-item-current');
                $('.detail_list').eq(curdex).siblings('.detail_list').hide().end().show();
                var $href = commonHref + $(this).find('span').text() + '&orderid=' + orderid;
                commonA.attr('href', $href);
                //重新计算页面高度
                set_height();
                //重新计算滚动条
                $('.scroll-pane').jScrollPane();
                //阻止href默认跳转
                return false;
            }).eq(0).click();
        },
        //height设置
        _set_height: function () {
            //dom加载完成后执行
            set_height();
            var pane = $('.scroll-pane');
            pane.jScrollPane({});
            var api = pane.data('jsp');

            //窗体大小改变时执行
            $(window).resize(function () {
                set_height();
                api.reinitialise();
            });
        }
    }
    //筛选排序的回调函数
    //function backFun() {
    //    ////重新执行合计函数
    //    //var length = $('.detail_list').length;
    //    //add_up(length);
    //}

    //计算高度
    function set_height() {
        //页面高度
        var body_h = $('body').outerHeight(true);
        //头部信息高度
        var detailTop_h = $('.detailTop').outerHeight(true);
        //获取导航高度
        var claims_nav_h = $('.claims_nav').outerHeight(true);
        //获取核定说明高度
        var desc_info_h = $('.desc_info').outerHeight(true);
        //获取表单头部高度
        var table_head_h = $('.expenseHead').outerHeight(true);
        //获取表单尾部高度
        var table_foot_h = $('.expenseFoot').outerHeight(true);
        //计算数据部分的高度,10是mainWrapper的padding-top
        $('.expenseFormMain').height(body_h - detailTop_h - claims_nav_h - desc_info_h - table_foot_h - table_head_h - 10);
    }
    //创建头部内容
    function create_head(data) {
        //头部
        var head_source = '<div class="mutate-table-wrapper detailTop">' +
            '<table style="width:100%;">' +
                '<tr>' +
                    '<td>' +
                        '<span class="label">公司: </span>' +
                        '<span class="mr20">' + data.HeadContent.CompanyName + '</span>' +
                    '</td>' +
                    '<td>' +
                        '<span class="label">部门: </span>' +
                        '<span class="mr20" id="deptName" deptId="' + data.HeadContent.DeptID + '">' + data.HeadContent.DeptName + '</span>' +
                    '</td>' +
                    '<td>' +
                        '<span class="label">业务类型: </span>' +
                        '<span class="mr20">' + data.HeadContent.BusName + '</span>' +
                    '</td>' +
                    '<td>' +
                        '<span class="label">姓名: </span>' +
                        '<span class="mr20">' + data.HeadContent.TrueName + '</span>' +
                    '</td>' +
                    '<td>' +
                        '<span class="label">手机: </span>' +
                        '<span class="mr20">' + data.HeadContent.Phone + '</span>' +
                    '</td>' +
                '</tr>' +
                '<tr>' +
                    '<td colspan="5" class="break-word">' +
                        '<span class="label">申请说明: </span>' +
                        '<span>' + data.HeadContent.Description + '</span>' +
                    '</td>' +
                '</tr>' +
            '</table>' +
        '</div>';
        return head_source;
    }
    //创建父框架提示信息
    function create_outer_info(data) {
        var outer_info = '<div id="outer_info">' +
            '<label class="fb">申请方式：</label>' +
            '<span>' + applyCase[data.HeadContent.ApplyCase] + '</span>' +
            '<label class="fb">报销模式：</label>' +
            '<span>' + installment[data.HeadContent.Installment] + '</span>' +
            '</div>';
        return outer_info;
    }
    //创建多次报销导航
    function create_nav(data) {
        var claims_nav='<div class="claims_nav fms-tab tabBg-gray">'+
            '<ul class="fms-tab-items clearfix pr">';
        //添加导航主体部分
        for(var i=0;i< data.Flows.length;i++){
            if(i==0){
                claims_nav+='<li class="fms-tab-item fms-tab-item-current">'+
                        '<a href="javascript:;">分支流程ID: ' +'<span>'+data.Flows[i].BAID + '</span></a>' +
                    '</li>';
            }else{
                claims_nav+='<li class="fms-tab-item">'+
                        '<a href="javascript:;">分支流程ID: ' + '<span>'+data.Flows[i].BAID + '</span></a>' +
                    '</li>';
            }
        }
        claims_nav += '</ul>' +
        '</div>';
        return claims_nav;
    }
    //创建报销详细信息
    function create_detail(data) {
        for (var i = 0;i< data.Flows.length; i++) {
            var detail_li = '';
            for (var j = 0; j<data.Flows[i].BodyContent.length ; j++) {
                var b_con = data.Flows[i].BodyContent[j];
                detail_li += '<tr>' +
                   '<td>' + b_con.Date + '</td>' +
                   '<td class="ellipsis" title="' + b_con.AreaName + '">' + b_con.AreaName + '</td>' +
                   '<td>' +
                   '<div class="paidFor_pos">'+
                        '<span class="paidFor ellipsis">' + b_con.CusName + '(' + cusType[b_con.CusType] + ')</span>' +
                        '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;" style="min-width:100px;">' +
                            '<p class="bankName">开户行：<span>' + b_con.BankName + '</span></p>' +
                            '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：<span>' + b_con.CardNo + '</span></p>' +
                            '<p class="AccountHolder">户主名：<span>' + b_con.AccountHolder + '</span></p>' +
                        '</div>' +
                        '</div>'+
                   '</td>' +
                   '<td class="ellipsis" title="' + b_con.SubName + '">' + b_con.SubName + '</td>' +
                   '<td class="no_data outer_subjects ellipsis" title="' + b_con.SubName_ + '">' + b_con.SubName_ + '</td>' +
                   '<td class="moneyApply_' + i + ' fb">' + b_con.MoneyApply + '</td>' +
                   '<td class="moneyBorrow_' + i + ' borrow_hide fb">' + b_con.MoneyBorrow + '</td>' +
                   '<td class="moneyClaim_' + i + ' fb">' + b_con.MoneyClaim + '</td>' +
                   '<td class="moneyVouch_' + i + ' fb">' + b_con.MoneyVouch + '</td>' +
                   '<td  class="no_data">' +
                        '<span>' + hasBill[b_con.HasBill] + '</span>' +
                        '<img src="/Static/images/base/icon/explain.png" style="margin-left:5px;" class="explain" title="' + b_con.BillDesc + '" />' +
                   '</td>'+
                '</tr>';
            }
            //创建框架元素
            var detail_wrapper = create_detail_wrapper(i);
            //创建说明文本
            var descInfo=desc_info(data,i);
            //将框架添加到网页中
            $('.mainWrapper').append(detail_wrapper);
            //添加说明文本
            $('#list_' + i).find('.expenseHead').before(descInfo);
            //将创建信息添加到框架元素当中
            $('#list_' + i).find('.expenseBody tbody').append(detail_li);
        }
    }
    //创建说明文本
    function desc_info(data, i) {
        var desc_info = '<div class="mt10 desc_info" style="background:#fbfbfb;padding:5px;border:1px solid #f0f0f0;">' +
            '<table style="width:100%;"> ' +
                '<tr>' +
                    '<td class="break-word">' +
                        '<label class="fb">核定说明：</label>' +
                        '<span>' + data.Flows[i].VerifDesc + '</span>' +
                    '</td>' +
                    '<td class="tr" style="width:150px;">' +

                        '<label class="fb">当前进度：</label>' +
                        '<span>' + data.Flows[i].Status + '<span>' +
                    '</td>' +
                '</tr>' +
            '</table>' +
            '</div>';

        return desc_info;
    }
    //创建详细内容框架
    function create_detail_wrapper(i) {
        var detail_wrapper = '<div class="detail_list" id="list_'+i+'" >' +
            '<table id="topTable_'+i+'" class="allEditTable fms-table expenseForm-allEditTable mt10 expenseHead">'+
            '<thead>'+
                '<tr>'+
                    '<th style="width: 10%">日期</th>' +
                    '<th style="width: 10%">地区</th>' +
                    '<th style="width: 10%">付款对象</th>' +
                    '<th style="width: 10%">对内科目</th>' +
                    '<th style="width: 10%" class="outer_subjects">对外科目</th>' +
                    '<th style="width: 10%">申请额度</th>' +
                    '<th style="width: 10%" class="borrow_hide">借款额度</th>' +
                    '<th style="width: 10%">报销额度</th>' +
                    '<th style="width: 10%">核定额度</th>' +
                    '<th style="width: 10%">票据信息</th>'+
                '</tr>'+
            '</thead>'+
        '</table>'+
        '<div class="expenseFormMain scroll-pane" style="overflow-y:auto;">' +
            '<table id="conTable_' + i + '" class="allEditTable fms-table expenseForm-allEditTable expenseBody ellips-table" sortCol="-1">' +
                '<thead>'+
                    '<tr>'+
                        '<th style="width: 10%">日期</th>'+
                        '<th style="width: 10%">地区</th>'+
                        '<th style="width: 10%">付款对象</th>'+
                        '<th style="width: 10%">对内科目</th>'+
                        '<th style="width: 10%" class="outer_subjects">对外科目</th>' +
                        '<th style="width: 10%">申请额度</th>'+
                        '<th style="width: 10%" class="borrow_hide">借款额度</th>'+
                        '<th style="width: 10%">报销额度</th>'+
                        '<th style="width: 10%">核定额度</th>'+
                        '<th style="width: 10%">票据信息</th>'+
                    '</tr>'+
                '</thead>'+
                '<tbody>'+
                '</tbody>'+
            '</table>'+
        '</div>'+
        '<table id="bottomTable_'+i+'" class="allEditTable fms-table expenseForm-allEditTable expenseFoot">'+
        '<thead>'+
                '<tr>'+
                    '<th style="width: 10%">日期</th>'+
                    '<th style="width: 10%">地区</th>'+
                    '<th style="width: 10%">付款对象</th>'+
                    '<th style="width: 10%">对内科目</th>'+
                    '<th style="width: 10%" class="outer_subjects">对外科目</th>' +
                    '<th style="width: 10%">申请额度</th>'+
                    '<th style="width: 10%" class="borrow_hide">借款额度</th>'+
                    '<th style="width: 10%">报销额度</th>'+
                    '<th style="width: 10%">核定额度</th>'+
                    '<th style="width: 10%">票据信息</th>'+
                '</tr>'+
            '</thead>'+
            '<tfoot>'+
                '<tr>'+
                    '<td colspan="5" class="tr">合计:</td>'+
                    '<td id="expenseSum_'+i+'">0.00</td>'+
                    '<td id="borrowedSum_'+i+'"  class="borrow_hide">0.00</td>'+
                    '<td id="payForSum_'+i+'">0.00</td>'+
                    '<td id="checkSum_'+i+'">0.00</td>'+
                    '<td></td>'+
                '</tr>'+
            '</tfoot>'+
        '</table>'+
      '</div>';
        return detail_wrapper;
    }
    //文本提示框
    function tooltip() {
        var x = 0,
            y = 30;
        $('.paidFor,.paidFor_outer').live('mouseover', function () {
            var td = $(this).parents('td');
            //获取指定输入框的offset值
            var offset = td.offset();
            var top = offset.top;
            //计算窗体的高度
            var win_h = $(window).height();
            //计算td的高度
            var td_h = td.outerHeight(true);
            //计算输入框距离底端的距离，30为输入框的高度（包括padding和border）
            var bottom = win_h - top - td_h;
            //提示框的高度
            var tip_h = 55;
            //如果提示框距离底部的高度太小则上翻,
            if ((bottom - tip_h) < 40) {
                var h = -(tip_h + 6);
                $(this).siblings('.tooltip')
                    .css({
                        'top': h + 'px',
                        'left': x + 'px'
                    }).show();
            } else {
                $(this).siblings('.tooltip')
                    .css({
                        'top': y + 'px',
                        'left': x + 'px'
                    }).show();
            }

        }).live('mouseout', function () {
            $(this).siblings('.tooltip').hide();
        });
    }
    //财务数字
    function f_decmal(len) {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        var no_data = 1;
        for (var i = 0; i < len; i++) {
            //申请列
            f.f_decmal('.moneyApply_' + i,no_data);
            //我要借款列
            f.f_decmal('.moneyBorrow_' + i, no_data);
            //报销额度列
            f.f_decmal('.moneyClaim_' + i, no_data);
            //报销申请列
            f.f_decmal('.moneyVouch_' + i, no_data);
        }
    }
    //合计
    function add_up(len) {
        var add_up = require('/Static/src/common/addUp');
        for (var i = 0; i < len; i++) {
            //申请列
            add_up.add_up('.moneyApply_' + i, '#expenseSum_' + i);
            //我要借款列
            add_up.add_up('.moneyBorrow_' + i, '#borrowedSum_' + i);
            //报销额度列
            add_up.add_up('.moneyClaim_' + i, '#payForSum_' + i);
            //报销申请列
            add_up.add_up('.moneyVouch_' + i, '#checkSum_' + i);
        }
    }
    //错误提示效
    function errorMsg(msg) {
        art.dialog({
            id: 'errorMsg',
            drag: false,
            content: msg,
            title: '错误提示页面',
            lock: true
        });
        art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
    }
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    module.exports = applyFor_inner;
});
