define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');

    //转化传入的cusType
    var cusType = {
        '0': '未知',
        '1': '个人',
        '2': '单位'
    }
    //转化是否含有订单
    var hasBill = {
        'True': '有',
        'False': '无'
    }
    //加载公共样式
    var common = require('/Static/src/common');
    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    function detail(orderId,taskId,modeId) {
        var detail_url = $.url_prefix+'/Ashx/Workflow/CostReimbursementHandler.ashx?method=GetOrderInfo';
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
            cache:false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg)
                    return false;
                }
                //添加头部信息
                $('body').append(create_head(data, orderId, taskId));
                //添加主体类容
                $('body').append(create_body(data));
                //表格布局
                table_layout();
                //添加提示框效果
                tooltip();
                //应用财务数字
                f_decmal();
                //计算总和
                add_up();
                //显示底部元素
                $(window.parent.document).find('.footer').children().show();
                //执行滚动条插件
                var pane = $('.scroll-pane')
                pane.jScrollPane({});
                var api = pane.data('jsp');
                //当窗体大小改变时，对表格布局
                $(window).resize(function () {
                    table_layout();
                    api.reinitialise();
                });
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }
    //创建头部内容
    function create_head(data, orderId, taskId) {
        var flowH = require('/Static/src/common/flow_head');
        var head_source = flowH.flowH(data, orderId, taskId);
        return head_source;
    }
    //创建表格内容s
    function create_body(data) {
        //表格头部
        var body_source = '<table class="allEditTable fms-table expenseForm-allEditTable mt10 " id="expenseHead">' +
                '<thead>'+
                    '<tr>';
        //创建thead
        var bodyData = data.bodyData[0];
        body_source += create_table_head(bodyData);

        //添加表格头部结尾
        body_source += '</tr>' +
            '</thead>' +
            '</table>'; 

         //表格中部
        body_source += '<div id="expenseFormMain" class="scroll-pane">' +
                '<table class="allEditTable fms-table expenseForm-allEditTable" id="expenseBody">' +
                    '<thead>' +
                        '<tr>';
       
        //创建中部thead
        body_source += create_table_head(bodyData);

        //表格中部头部结尾
        body_source += '</tr>' +
            '</thead>'+
            '<tbody>';

        //添加表格类容部分
        for (var index in data.bodyData) {
            var rowData = data.bodyData[index];
            body_source += '<tr>';

            if (rowData.Date) {
                body_source += '<td>' + rowData.Date + '</td>';
            }
            if (rowData.Area) {
                body_source += '<td title="' + rowData.AreaName + '">' + rowData.AreaName + '</td>';
            }
            if (rowData.CusName) {
                body_source += '<td>' +
                                '<div class="paidFor_pos">' +
                                    '<span class="paidFor">' + rowData.CusName + '(' + cusType[rowData.CusType] + ')</span>' +
                                    '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;" style="min-width:100px;">' +
                                        '<p>开户行：' + rowData.BankName + '</p>' +
                                        '<p>卡&nbsp;&nbsp;&nbsp;&nbsp;号：' + rowData.CardNo + '</p>' +
                                        '<p>户主名：' + rowData.AccountHolder + '</p>' +
                                    '</div>' +
                                '</div>' +
                            '</td>';
            }
            if (rowData.SubID) {
                body_source += '<td class="subName" subId="' + rowData.SubID + '" title="' + rowData.SubName + '">' + rowData.SubName + '</td>';
            }
            if (rowData.SubID_) {
                body_source += '<td class="subName_ " subId="' + rowData.SubID_ + '" title="' + rowData.SubName_ + '">' + rowData.SubName_ + '</td>';
            }
            if (rowData.MoneyApply) {
                body_source += '<td class="finance_decmal">' + rowData.MoneyApply + '</td>';
            }
            if (rowData.MoneyBorrow) {
                body_source += '<td class="moneyBorrow fb">' + rowData.MoneyBorrow + '</td>';
            }
            if (rowData.MoneyClaim) {
                body_source += '<td class="moneyClaim fb">' + rowData.MoneyClaim + '</td>';
            }
            if (rowData.MoneyVouch) {
                body_source += '<td class="moneyVouch fb">' + rowData.MoneyVouch + '</td>';
            }
            if (rowData.HasBill) {
                body_source += '<td class="HasBill">' +
                            '<span>' + hasBill[rowData.HasBill] + '</span>' +
                            '<img src="/Static/images/base/icon/explain.png" style="margin-left:5px;" class="explain" title="' + rowData.BillDesc + '">' + '</td>';
            }
            body_source += '</tr>';
        }
        //添加内容结束部分
        body_source +='</tbody>' +
                    '</table>' +
                '</div>';
        //表格尾部
        body_source += '<table class="allEditTable fms-table expenseForm-allEditTable" id="expenseFoot">'+
            '<thead>'+
            '<tr>';
        //创建底部thead
        body_source += create_table_head(bodyData)
        //表格中部头部结尾
        body_source += '</tr>' +
            '</thead>' +
            '<tfoot>' +
                '<tr >';
        if (bodyData.SubID_) {
            body_source += '<td colspan="5" class="tr fb">合计:</td>';
        } else {
            body_source += '<td colspan="4" class="tr fb">合计:</td>';
        }
        body_source += '<td id="expenseSum">0.00</td>';
        if (bodyData.MoneyBorrow) {
            body_source += '<td id="borrowSum">0.00</td>';
        }
        if (bodyData.MoneyClaim) {
            body_source += '<td id="claimSum">0.00</td>';
        }
        if (bodyData.MoneyVouch) {
            body_source += '<td id="vouchSum">0.00</td>';
        }
        if (bodyData.HasBill) {
            body_source += '<td style="width:10%;"></td>';
        }
        body_source+='</tr>' +
            '</tfoot>' +
            '</table>';
        return body_source;
    }
    //创建table head部分
    function create_table_head(bodyData) {
        var table_head = '';
        if (bodyData.Date) {
            table_head += '<th style="width:8%;">发生日期</th>';
        }
        if (bodyData.Area) {
            table_head += '<th style="width:11%;">地区</th>';
        }
        if (bodyData.CusName) {
            table_head += '<th style="width:14%;">付款对象</th>';
        }
        if (bodyData.SubID) {
            table_head += '<th style="width:20%;">对内科目</th>';
        }
        if (bodyData.SubID_) {
            table_head += '<th style="width:15%;">对外科目</th>';
        }
        if (bodyData.MoneyApply) {
            table_head += '<th style="width:7%;">申请额度</th>';
        }
        if (bodyData.MoneyBorrow) {
            table_head += '<th style="width:7%;">借款金额</th>';
        }
        if (bodyData.MoneyClaim) {
            table_head += '<th style="width:7%;">报销金额</th>';
        }
        if (bodyData.MoneyVouch) {
            table_head += '<th style="width:7%;">核定金额</th>';
        }
        if (bodyData.HasBill) {
            table_head += '<th style="width:5%;">发票</th>';
        }
        return table_head;
    }
    //文本提示框
    function tooltip() {
        //引如公共样式中的文本提示框函数
        //临界高度的设置
        var threshold = 40;
        common.toolTip(threshold);
    }
    //财务数字
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //申请额度
        var elem = '.finance_decmal';
        f.f_decmal(elem);
        //借款金额
        var el = '.moneyBorrow';
        f.f_decmal(el);
        //报销金额
        f.f_decmal('.moneyClaim');
        //核定金额
        f.f_decmal('.moneyVouch');
    }
    //合计
    function add_up () {
        var add_up = require('/Static/src/common/addUp');
        //申请额度
        var numClass = '.finance_decmal';
        var sumId = '#expenseSum';
        add_up.add_up(numClass, sumId);
        //借款金额
        var detail = '.moneyBorrow';
        var borrowSum = '#borrowSum';
        add_up.add_up(detail, borrowSum);
        //报销金额
        var claim = '.moneyClaim';
        var claimSum = '#claimSum';
        add_up.add_up(claim, claimSum);
        //核定金额
        var vouch = '.moneyVouch';
        var vouchSum = '#vouchSum';
        add_up.add_up(vouch, vouchSum);
    }
    //错误提示效果
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
    exports.detail = detail;
});