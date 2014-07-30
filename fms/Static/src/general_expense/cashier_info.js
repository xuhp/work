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
    var OperateType = {
        '10': '借款',
        '20': '还款',
        '30': '报销'
    }
    var cashier_inner = {
        init: function (orderId) {
            this._load_data(orderId);
        },
        //加载数据
        _load_data: function (orderId) {
            var detail_url = $.url_prefix+$.general+'method=GetAmountCashierInfo';
            $.ajax({
                type: "post",
                url: detail_url,
                data: {'orderID':orderId},
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg);
                        return false;
                    }
                    //插入数据
                    $('#expenseFormMain tbody').append(create_body(data));
                    //判断modeId是否为r
                    //如果type_20（还款）,要将text()改为减号
                    $('.type_20').text('- ');
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
                    //添加提示框效果
                    tooltip();
                    //应用财务数字
                    f_decmal();
                    //合计
                    add_up();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        }
    }
    //创建表格内容
    function create_body(data) {
        var body_source = '';
        for (var i = 0; i < data.length; i++) {
            body_source += '<tr cId="' + data[i].CID + '" class="operateType_' + data[i].OperateType + '">' +
                   '<td class="flow_data">' +toDate(data[i].RecordDate) + '</td>' +
                   '<td class="flow_paidFor" pfId="' + data[i].PFID + '">' +
                    '<div class="paidFor_pos">'+
                        '<span class="paidFor ellipsis">' + data[i].CusName + '(' + cusType[data[i].CusType] + ')</span>' +
                        '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;" style="min-width:100px;">' +
                            '<p class="bankName">开户行：<span>' + data[i].BankName + '</span></p>' +
                            '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：<span>' + data[i].CardNo + '</span></p>' +
                            '<p class="AccountHolder">户主名：<span>' + data[i].AccountHolder + '</span></p>' +
                        '</div>' +
                        '</div>'+
                   '</td>' +
                   '<td class="operateType">' + OperateType[data[i].OperateType] + '</td>' +
                   //默认为加号
                   '<td><span class="type_' + data[i].OperateType + ' fb">+</span> <span class="finance_decmal  moneyBorrow" this_type="' + data[i].OperateType + '">' + data[i].Money + '</span></td>' +
                   '<td class="ellipsis" title="' + data[i].Remark + '">' +
                     '<span>' + data[i].Remark + '</span>' +
                   '</td>'
            '</tr>';
        }
        return body_source;
    }
    //表格布局
    function table_layout() {
        //获取窗体高度
        var winH = $('html').height();
        //获取表格头部高度
        var tabTop = $('#expenseHead').outerHeight(true);
        //获取表格尾部高度
        var tabFoot = $('#expenseFoot').outerHeight(true);
        //设置表格内容区域高度
        $('#expenseFormMain').height(winH - tabTop - tabFoot);
    }
    //文本提示框
    //文本提示框
    function tooltip() {
        var x = 0,
            y = 30;
        $('.paidFor,.paidFor_outer').die('mouseover').live('mouseover', function () {
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
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //申请额度列
        var elem = '.finance_decmal';
        f.f_decmal(elem);
        //报销列
        var el = '.apply_fd';
        f.f_decmal(el);
    }
    //合计
    function add_up() {
        var add_up = require('/Static/src/common/addUp');
        //申请额度列
        var numClass = '.finance_decmal';
        var sumId = '#expenseSum';
        add_up.add_up(numClass, sumId);
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
    //日期格式转换
    function toDate(str) {
        var DateStr = typeof (str) == "string" ? str : str.toString();
        var myDate = DateStr.substr(0, 4) + "/" + DateStr.substr(4, 2) + "/" + DateStr.substr(6, 2);
        return myDate;
    };
    module.exports = cashier_inner;
});