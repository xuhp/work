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
    //获取省份数据
    var pData = proviceData();
    //省份数据
    function proviceData() {
        var proData;
        $.ajax({
            type: "post",
            url: $.url_prefix+'/Ashx/Common/AreaHandler.ashx?method=GetAllProvince',
            dataType: "json",
            cache: false,
            async: false,
            success: function (data) {
                proData = data;
            },
            error: function (data) {
                alert("网络繁忙，请稍后再试！");
            }
        });
        return proData;
    }
    var borrow_inner = {
        init: function (orderId, taskId, modeId) {
            this._load_data(orderId, taskId, modeId);
            this._add_row();
            this._paidFor(taskId);
            this._sure_btn_click(taskId);
            this._del_btn_click(taskId);
            this._no_data_del_click();
            this._common();
            this._length_control();
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
            var detail_url = $.url_prefix+$.general+'method=GetCashierInfo';
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
                    $('#expenseFormMain tbody').append(create_body(data));
                    //判断modeId是否为r
                    if (modeId == 'r') {
                        $('.addBtn').remove();
                        $('.opera_hide').remove();
                    } else {
                        $('.opera_hide').show();
                    }
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
                    //显示底部元素
                    $(window.parent.document).find('.footer').children().show();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //添加行
        _add_row: function () {
            myclass = this;
            $('#expenseF_addBtn').click(function () {
                myclass._new_row();
                var pane = $('.scroll-pane')
                pane.jScrollPane({});
                var api = pane.data('jsp');
                api.reinitialise();
                return false;
            });
        },
        //新行
        _new_row: function () {
            var id = 'tr_' + rownum++;
            var tr = '<tr id = "' + id + '">' +
                        '<td class="flow_data">' +
                            '<input type="text" class="allEditTab-txtInput jdpicker" readonly="true" /></td>' +
                        '<td class="flow_paidFor">' +
                            '<div class="paidFor_pos">' +
                             '<input type="text" class="allEditTab-txtInput paidFor" readonly="true" />'+
                            '</div>'+
                        '</td>'+
                        '<td class="flow_moneyBorrow">' +
                            '<input type="text" class="allEditTab-txtInput finance_decmal f14 moneyBorrow" value=""/></td>' +
                        '<td  class="flow_remark ellipsis" >' +
                            '<input type="text" class="allEditTab-txtInput remark" value="" />' +
                        '</td>' +
                        '<td class="flow_opera">' +
                            '<button class="blueBtn h22 w45 sure_btn" style="margin-right:5px">确定</button><button class="redBtn h22 w45 no_data_del">删除</button>' +
                        '</td>'+
                    '</tr>';
            //地区选择
            var select_area = $('#' + id + ' .areaPicker');
            select_area.die('click').live('click', function () {
                require('/Static/src/plugin/areaPicker/areaPicker.css');
                var areaPicker = require('/Static/src/plugin/areaPicker/areaPicker');
                areaPicker.init(this, pData);
            })
            $('#expenseBody tbody').append(tr);
            $('.date_selector').remove();
            $.date_input.initialize('.jdpicker');
        },
        //对象选择
        _paidFor: function (taskId) {
            var paidFor = require('/Static/src/common/paidFor_simplify');
            paidFor(taskId);
        },
        //单击确认按钮，添加借款信息
        _sure_btn_click: function (taskId) {
            $('.sure_btn').die('click').live('click', function () {
                var $tr = $(this).parents('tr');
                //验证
                function onSubmit() {
                    var flag = true;
                    var $elem = $tr.find('input');
                    var msg = '请完善表单';
                    //表单项不能为空
                    for (var i = 0; i < $elem.length; i++) {
                        if ($elem.eq(i).val() == '') {
                            errorMsg(msg);
                            flag = false;
                            break;
                        }
                    }
                    //借款金额大于0
                    if ($elem.eq(2).val() == '0.00') {
                        msg = '借款金额必须大于0';
                        errorMsg(msg);
                        flag = false;
                    }
                    return flag;
                }
                if (!onSubmit()) return false;

                var date=$tr.find('.jdpicker').val();
                var pfId = $tr.find('.paidFor').attr('pfId');
                var money = no_comma($tr.find('.moneyBorrow').val());
                var remark = $tr.find('.remark').val();
                var type = '10';
                var that = this;
                var detail_url = $.url_prefix+$.general+'method=AddCashierInfo';
               
                $.ajax({
                    type: "post",
                    url: detail_url,
                    data: {
                        'taskID': taskId,
                        'pfID': pfId,
                        'date':date,
                        'type':type,
                        'money': money,
                        'remark':remark
                    },
                    async: false,
                    cache: false,
                    dataType: 'json',
                    success: function (data) {
                        //错误验证
                        if (data != null && data.error) {
                            errorMsg(data.msg);
                            return false;
                        }
                        //为tr添加cid 为删除做准备
                        $tr.attr('cid', data.CID);
                        //提交成功之后页面执行操作
                        sure_change($tr);
                    },
                    error: function (error) {
                        window.location.href = error.responseText;
                    }
                });
            });
        },
        //点击删除按钮
        _del_btn_click: function (taskId) {
            $('.data_del').die('click').live('click', function () {
                //获取cId
                var tr = $(this).parents('tr');
                var cId = tr.attr('cId');

                var delForm = '<div>' +
                   '<p>确定要删除这一行吗?删除之后将无法恢复。</p>' +
                   '<div class="btnWrapper" style="padding-top: 20px;text-align: center;">' +
                       '<button class="blueBtn h22 w45 disableBtn" disabled="disabled" id="deterBtn">确定</button>' +
                       '<button class="redBtn h22 w45" style="margin-left:10px;" id="cancelBtn">取消</button>' +
                   '</div>'
                '</div>'

                //倒计时弹出框
                var con = delForm;
                var id = '#deterBtn';
                cd_dialog(con, id);

                $('#deterBtn').click(function () {
                    //在数据库中删除此行
                    removeData(tr, cId, taskId);
                    add_up()
                });
                $('#cancelBtn').click(function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            });
        },
        //仅删除页面元素
        _no_data_del_click: function () {
            $('.no_data_del').die('click').live('click', function () {
                $(this).parents('tr').remove();
                //进行累加操作
                add_up();
            });
        },
        //控制输入字符不能超过100个字符
        _length_control:function() {
            $('.remark').die('change').live('change', function () {
                var val=$(this).val();
                var len = val.length;
                if (len > 100) {
                    $(this).val(val.substr(0, 100));
                }
            });
        }

    }
    //单击删除确定按钮，移除数据库中的信息
    function removeData(tr, cId, taskId) {
        var url = $.url_prefix+$.general+'method=DelCashierInfo';
        $.ajax({
            type: "post",
            url: url,
            data: {
                'taskID': taskId,
                'CID': cId
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    art.dialog({ id: 'cd_dialog' }).close();
                    errorMsg(data.msg);
                    return false;
                }
                art.dialog({ id: 'cd_dialog' }).close();
                //在页面中删除本行
                tr.remove();
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }
    //单击确定按钮，提交成功之后在页面执行操作
    function sure_change($tr) {
        //日期
        var flow_data = $tr.find('.flow_data');
        flow_data.text(flow_data.find('input').val());
        //付款对象
        var flow_paidFor = $tr.find('.paidFor_pos');
            //添加span元素
        flow_paidFor.append('<span class="paidFor ellipsis">' + flow_paidFor.find('input').val() + '</span>');
            //移除input元素
        flow_paidFor.find('input').remove();
        //借款
        var flow_moneyBorrow = $tr.find('.flow_moneyBorrow');
        var $val = flow_moneyBorrow.find('input').val();
        flow_moneyBorrow.text($val);
        flow_moneyBorrow.addClass('finance_decmal moneyBorrow');
        //备注
        var flow_remark = $tr.find('.flow_remark');
        var $val = flow_remark.find('input').val()
        flow_remark.text($val);
        flow_remark.attr('title', $val);
        //操作
        var flow_opera = $tr.find('.flow_opera');
        flow_opera.find('button').remove();
        flow_opera.append('<button class="redBtn h22 w45 data_del">删除</button>');
    }
    //创建表格内容
    function create_body(data) {
        var body_source = '';
        for (var i = 0; i < data.length; i++) {
            body_source += '<tr cId="'+data[i].CID+'">' +
                   '<td class="flow_data">' + data[i].RecordDate + '</td>' +
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
                   '<td class="finance_decmal moneyBorrow ">' + data[i].Money + '</td>' +
                   '<td class="ellipsis"  title="' + data[i].Remark + '" > ' +
                     '<span>' + data[i].Remark + '</span>' +
                   '</td>' +
                   '<td class="opera_hide"><button class="redBtn h22 w45 data_del">删除</button></td>' +
                '</tr>';
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
    }
    
    //财务数字
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //申请额度列
        var elem = '.finance_decmal';
        f.f_decmal(elem);
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
    //移除disableBtn按钮
    function removeClass() {
        $('#deterBtn').removeClass('disableBtn');
    }
    //倒计时弹出框
    function cd_dialog(con, id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }

    module.exports = borrow_inner;
});