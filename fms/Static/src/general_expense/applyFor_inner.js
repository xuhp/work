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
    var applyFor_inner={
        init:function(orderId, taskId,modeId){
            this._load_data(orderId, taskId, modeId);
            this._add_row();
            this._treebox();
            this._paidFor();
            this._del_row();
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
        _load_data:function(orderId, taskId,modeId){
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
                    $('#expenseFormMain tbody').append(create_body(data,modeId));
                    //判断是否需要添加一行按钮
                    if (data.ApplyCase == '1') {
                        $('#expenseF_addBtn').remove();
                        $('.oprea_hide').remove();
                    } else {
                        $('.borrow_hide').remove();
                    }
                    //判断modeId是否为r
                    if (modeId == 'r') {
                        $('.oprea_hide').remove();
                        $('#expenseF_addBtn').remove();
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
                    //判断关闭申请和作废这两个按钮是否要显示
                    if (data.Close == 'False') {
                        $(window.parent.document).find('#flow_stop').remove();
                    }
                    if (data.Nullify == 'False') {
                        $(window.parent.document).find('#applyFor_refuse').remove();
                    }
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
            var tr = '<tr id = "' + id + '" rowId="-1">' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput jdpicker flow_data" readonly="true" /></td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput areaPicker flow_area" readonly="true"/></td>' +
                        '<td class="flow_paidFor ">' +
                            '<div class="paidFor_pos">'+
                                '<input type="text" class="allEditTab-txtInput paidFor" readonly="true" />'+
                            '</div>'+
                        '</td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput tree_subject subName"  readonly="true"/></td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput finance_decmal fb moneyApply" value="0.00" readonly /></td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput apply_fd about_fd fb moneyClaim" value="" />' +
                        '</td>' +
                        '<td>' +
                            '<button class="redBtn h22 w45 del_row">删除</button>'
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
        //树
        _treebox: function () {
            require('/Static/src/plugin/stree/jquery.stree.part')($);
            require('/Static/src/plugin/stree/css/stree.css');
            //科目
            $(".tree_subject").partTree({
                ajaxUrl: $.url_prefix+"/Ashx/SubjectHandler.ashx?method=GetListByTypeID&TypeID=0",//TypeID=0,对内科目
                sign: "sub",
                elem: "#subBox"
            });
        },
        //对象选择
        _paidFor: function () {
            var paidFor = require('/Static/src/common/paidFor');
            paidFor();
        },
        //删除
        _del_row: function () {
            $('.del_row').die('click').live('click', function () {
                $(this).parents('tr').remove();
                //进行累加操作
                add_up();
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
                        '<span class="paidFor_outer ellipsis">' + data.bodyData[i].CusName + '(' + cusType[data.bodyData[i].CusType] + ')</span>' +
                        '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;" style="min-width:100px;">' +
                            '<p class="bankName">开户行：<span>' + data.bodyData[i].BankName + '</span></p>' +
                            '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：<span>' + data.bodyData[i].CardNo + '</span></p>' +
                            '<p class="AccountHolder">户主名：<span>' + data.bodyData[i].AccountHolder + '</span></p>' +
                        '</div>' +
                      '</div>'+
                   '</td>' +
                   '<td class="subName ellipsis" subId="' + data.bodyData[i].SubID + '" title="' + data.bodyData[i].SubName + '">' + data.bodyData[i].SubName + '</td>' +
                   '<td class="finance_decmal moneyApply">' + data.bodyData[i].MoneyApply + '</td>' +
                   '<td class="moneyBorrow borrow_hide">' + data.bodyData[i].MoneyBorrow + '</td>' +
                   '<td>';
            if (modeId != 'r') {
                body_source += '<input type="text" class="allEditTab-txtInput apply_fd fb  moneyClaim" />';
            } else {
                body_source += '<span class=" apply_fd fb  moneyClaim">' + data.bodyData[i].MoneyClaim + '</span>';
            }
            body_source +='</td>' +
                   '<td class="oprea_hide"></td>'+
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
    //当窗体大小改变时，对表格布局
    $(window).resize(table_layout);
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //申请额度列
        var elem = '.finance_decmal';
        f.f_decmal(elem);
        //报销列
        var el = '.apply_fd';
        f.f_decmal(el);
        //借款金额列
        f.f_decmal('.moneyBorrow');
    }
    //合计
    function add_up() {
        var add_up = require('/Static/src/common/addUp');
        //申请额度列
        var numClass = '.finance_decmal';
        var sumId = '#expenseSum';
        add_up.add_up(numClass, sumId);
        //报销列
        var apply_class = '.apply_fd';
        var apply_sum = '#payForSum';
        add_up.add_up(apply_class, apply_sum);
        //借款金额列
        add_up.add_up('.moneyBorrow', '#borrowedSum');
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
    module.exports = applyFor_inner;
});