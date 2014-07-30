define(function (require, exports, module) {

    var rownum = 0;

    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //引入日历插件
    require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
    require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')($);

    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    //转化传入的cusType
    var cusType = {
        '0': '未知',
        '1': '个人',
        '2': '单位'
    }
    var borrow_inner = {
        init: function (orderId, taskId, modeId) {
            this._load_data(orderId, taskId, modeId);
            this._common();
        },
        //获取公共基础样式
        _common: function () {
            var common = require('/Static/src/common');
            //临界高度的设置
            var threshold = 40;
            common.toolTip(threshold);
        },
        //加载数据
        _load_data: function (orderId, taskId, modeId) {
            var detail_url = $.url_prefix+$.general+'method=GetOrderInfo';
            //根据modeId的不同,使用不同的参数
            var u_data;
            if (modeId == 'r') {
                u_data = { 'taskID': taskId, 'last': 'false' }
            } else {
                u_data = { 'taskID': taskId, 'last': 'true' }
            }
            $.ajax({
                type: "post",
                url: detail_url,
                data: u_data,
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
                    $('#expenseHead').before(create_head(data, orderId, taskId));
                    //添加主体类容
                    $('#expenseFormMain tbody').append(create_body(data, modeId));
                    //显示底部元素
                    $(window.parent.document).find('.footer').children().show();
                    //设置元素高度
                    table_layout();
                    var pane = $('.scroll-pane')
                    pane.jScrollPane({});
                    var api = pane.data('jsp');
                    //当窗体大小改变时，对表格布局
                    $(window).resize(function () {
                        table_layout();
                        api.reinitialise();
                    });
                    //应用财务数字
                    f_decmal();
                    //合计
                    add_up();
                    //判断关闭申请和作废这两个按钮是否要显示
                    if (data.Close == 'False') {
                        $(window.parent.document).find('#flow_stop').remove();
                    }
                    if (data.Nullify == 'False') {
                        $(window.parent.document).find('#applyFor_refuse').remove();
                    }
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        }
    }
    //创建头部内容
    function create_head(data, orderId, taskId) {
        var flowH = require('/Static/src/common/flow_head');
        var head_source = flowH.flowH(data, orderId, taskId);
        return head_source;
    }
    //创建表格内容
    function create_body(data, modeId) {
        var body_source = '';
        for (var i = 0; i < data.bodyData.length; i++) {
            body_source += '<tr rowId="' + data.bodyData[i].RowID + '">' +
                   '<td class="flow_data">' + data.bodyData[i].Date + '</td>' +
                   '<td class="flow_area ellipsis" areaId="' + data.bodyData[i].Area + '" title="' + data.bodyData[i].AreaName + '">' + data.bodyData[i].AreaName + '</td>' +
                   '<td class="flow_paidFor" cusName="' + data.bodyData[i].CusName + '" cusId="' + data.bodyData[i].CusID + '" cusType="' + data.bodyData[i].CusType + '">' +
                    '<div class="paidFor_pos">' +
                        '<span class="paidFor ellipsis">' + data.bodyData[i].CusName + '(' + cusType[data.bodyData[i].CusType] + ')</span>' +
                        '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;" style="min-width:100px;">' +
                            '<p class="bankName">开户行：<span>' + data.bodyData[i].BankName + '</span></p>' +
                            '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：<span>' + data.bodyData[i].CardNo + '</span></p>' +
                            '<p class="AccountHolder">户主名：<span>' + data.bodyData[i].AccountHolder + '</span></p>' +
                        '</div>' +
                        '</div>'+
                   '</td>' +
                   '<td class="subName  ellipsis" subId="' + data.bodyData[i].SubID + '" title="' + data.bodyData[i].SubName + '">' + data.bodyData[i].SubName + '</td>' +
                   '<td class="finance_decmal moneyApply">' + data.bodyData[i].MoneyApply + '</td>';
            if (modeId == 'r') {
                body_source += '<td class="moneyBorrow">' + data.bodyData[i].MoneyBorrow + '</td>';
            } else {
                body_source +=
                    '<td >' +
                     '<input type="text" class="allEditTab-txtInput apply_fd  moneyBorrow" />' +
                   '</td>';
            }
            body_source += '</tr>';

        }
        return body_source;
    }
    //表格布局
    function table_layout() {
        //获取窗体高度
        var winH = $('html').height();
        //获取头部信息高度，包括padding和border,当含有参数true时，包括margin
        var topH = $('.detailTop').outerHeight(true);
        //获取表格头部高度
        var tabTop = $('#expenseHead').outerHeight(true);
        //获取表格尾部高度
        var tabFoot = $('#expenseFoot').outerHeight(true);
        //设置表格内容区域高度
        $('#expenseFormMain').height(winH - topH - tabTop - tabFoot);
    };
    //当窗体大小改变时，对表格布局
    $(window).resize(table_layout);
    //财务数字
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //申请额度列
        var elem = '.finance_decmal';
        f.f_decmal(elem);
        //报销列
        var el = '.moneyBorrow';
        f.f_decmal(el);
    }
    //合计
    function add_up() {
        var add_up = require('/Static/src/common/addUp');
        //申请额度列
        var numClass = '.finance_decmal';
        var sumId = '#expenseSum';
        add_up.add_up(numClass, sumId);
        //报销列
        var apply_class = '.moneyBorrow';
        var apply_sum = '#payForSum';
        add_up.add_up(apply_class, apply_sum);
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

    module.exports = borrow_inner;
});