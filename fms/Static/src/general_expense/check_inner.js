define(function (require, exports, module) {

    var rownum = 0;

    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //引入日历插件
    require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
    require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')($)

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
    //转化是否含有订单
    var hasBill = {
        'True': '有',
        'False':'无'
    }
    var check_inner = {
        init: function (orderId, taskId, modeId) {
            this._load_data(orderId, taskId, modeId);
            this._treebox();
            this._explain_click();
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
                    $('.verif_tr').remove();
                    //添加核定说明
                    var check_about= '<table style="width:100%">' +
                        '<tr>';
                    if (modeId != 'r') {
                        check_about += '<td style="width:60px;">'+
                                '<span class="label">核定说明: </span>' +
                            '</td>' +
                            '<td>'+
								'<div class="desc_wrapper">'+
								'<label for="description">请输入不多于250个汉字</label>'+
								'<textarea id="description" class="form-textarea form-normal description" style="width:100%">' +
								'</textarea></div>';
                    } else {
						check_about +='<td><span class="label">核定说明：</span>';
                        if (data.headData.VerifDesc == undefined) {
                            check_about += '';
                        } else {
                            check_about += data.headData.VerifDesc;
                        }
                    }
                    check_about +='</td>' +
                        '</tr>'+
                    '</table>';
                    
                    $('.detailTop').append(check_about);
                    if (modeId != 'r') {
                        $('#description').text(data.headData.Description);
                        $('.desc_wrapper label').hide();
                    }
                    //添加主体类容
                    $('#expenseFormMain tbody').append(create_body(data, modeId));
                    //如果不是我要借款，则将借款金额列影藏
                    if (data.ApplyCase != 1) {
                        $('.borrow_hidden').remove();
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
                    //输入框验证
                    textArea();
                    //显示底部元素
                    $(window.parent.document).find('.footer').children().show();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //树
        _treebox: function () {
            require('/Static/src/plugin/stree/jquery.stree.part')($);
            require('/Static/src/plugin/stree/css/stree.css');
            //科目
            $(".tree_subject").partTree({
                ajaxUrl: $.url_prefix+"/Ashx/SubjectHandler.ashx?method=GetListByTypeID&TypeID=1",//TypeID=0,对内科目
                sign: "sub",
                elem: "#subBox"
            });
        },
        //发票说明
        _explain_click: function () {
            $('.explain').live('click', function () {
                var that = this;
                var explain = '<div class="explainAgain desc_wrapper" style="text-algin:center;width:350px;">' +
                    '<label for="tr_desc" style="top:7px;">请输入不多于100个汉字</label>'+
                    '<textarea id="tr_desc" class="form-textarea form-normal description tr_desc" style="width:350px;margin-bottom:10px;"></textarea></br >' +
                    '<button class="blueBtn h26 w82 mr10" id="explain_sure" style="margin-left:70px;">确定</button>' +
                    '<button class="redBtn h26 w82" id="explain_cancel">取消</button>' +
                    '</div>';
                art.dialog({
                    id: 'explain',
                    content: explain,
                    title: '票据说明',
                    lock: true,
                    drag: false
                });
                //如果已经对说明进行赋值，则要重新获取它
                $('#tr_desc').val($(this).attr('title'));
                //输入框验证
                textArea();
                //通过确定按钮
                $('#explain_sure').die('click').live('click', function () {
                    var $val = $('#tr_desc').val();
                    if ($val.length > 100) {
                        $('#tr_desc').val($val.substr(0, 100));
                    }
                    $(that).attr('title', $('.explainAgain  .description').val());
                    //关闭弹出框
                    art.dialog({ id: 'explain' }).close();
                });
                //通过取消按钮
                $('#explain_cancel').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'explain' }).close();
                });
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
    function create_body(data,modeId) {
        var body_source = '';
        for (var i = 0; i < data.bodyData.length; i++) {
            body_source += '<tr rowId="' + data.bodyData[i].RowID + '">' +
                   '<td class="flow_data">' + data.bodyData[i].Date + '</td>' +
                   '<td class="flow_area ellipsis" areaId="' + data.bodyData[i].Area + '" title="' + data.bodyData[i].AreaName + '">' + data.bodyData[i].AreaName + '</td>' +
                   '<td class="flow_paidFor" cusName="' + data.bodyData[i].CusName + '" cusId="' + data.bodyData[i].CusID + '" cusType="' + data.bodyData[i].CusType + '">' +
                    '<div class="paidFor_pos">'+
                        '<span class="paidFor ellipsis">' + data.bodyData[i].CusName + '(' + cusType[data.bodyData[i].CusType] + ')</span>' +
                        '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;" style="min-width:100px;">' +
                            '<p class="bankName">开户行：<span>' + data.bodyData[i].BankName + '</span></p>' +
                            '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：<span>' + data.bodyData[i].CardNo + '</span></p>' +
                            '<p class="AccountHolder">户主名：<span>' + data.bodyData[i].AccountHolder + '</span></p>' +
                        '</div>' +
                        '</div>'+
                   '</td>' +
                   '<td class="subName ellipsis" subId="' + data.bodyData[i].SubID + '" title="' + data.bodyData[i].SubName + '">' + data.bodyData[i].SubName + '</td>' +
                    '<td class="subName_outer ellipsis" title="' + data.bodyData[i].SubName_ + '">';
            if (modeId != 'r') {
                if (data.bodyData[i].SubName_ != undefined) {
                    body_source += '<span class="tree_span"  nodeId="' + data.bodyData[i].SubID_ + '" title="' + data.bodyData[i].SubName_ + '">' + data.bodyData[i].SubName_ + '</span>';
                } else {
                    body_source += '<input type="text" class="allEditTab-txtInput tree_subject " readonly="true">'
                }
            } else {
                if (data.bodyData[i].SubName_ != undefined) {
                    body_source += data.bodyData[i].SubName_;
                }
            }
            body_source += '</td>' +
                   '<td class="finance_decmal  moneyApply">' + data.bodyData[i].MoneyApply + '</td>' +
                   '<td class="borrowed fb borrow_hidden">' + data.bodyData[i].MoneyBorrow + '</td>' +
                   '<td class="moneyClaim  fb">' + data.bodyData[i].MoneyClaim + '</td>';
            if (modeId != 'r') {
                body_source += '<td>' +
                        '<input type="text"  class="allEditTab-txtInput finance_decmak fb" value="' + data.bodyData[i].MoneyClaim + '" />' +
                    '</td>' +
                    '<td>' +
                        '<select class="fms-select">' +
                            '<option>有</option>' +
                            '<option>无</option>' +
                        '</select>' +
                        '<img src="/Static/images/base/icon/explain.png" style="margin-left:5px;" class="explain" title="" />' +
                    '</td>';
            } else {
                body_source += '<td class="fb finance_decmak">';
                if (data.bodyData[i].MoneyVouch != undefined) {
                    body_source += data.bodyData[i].MoneyVouch ;
                }
                body_source += '</td> <td> '
                if (data.bodyData[i].HasBill != undefined) {
                    body_source += hasBill[data.bodyData[i].HasBill];
                }
                if (data.bodyData[i].BillDesc != undefined) {
                    body_source += '<img src="/Static/images/base/icon/explain.png" style="margin-left:5px;" title="' + data.bodyData[i].BillDesc + '" />'
                }
                body_source += '</td>'
            }
            body_source +='</tr>';
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
    //财务数字
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //申请额度列
        var elem = '.finance_decmal';
        f.f_decmal(elem);
        //借款列
        f.f_decmal('.borrowed');
        //报销列
        var el = '.moneyClaim';
        f.f_decmal(el);
        //核定列
        var ele = '.finance_decmak';
        f.f_decmal(ele);
    }
    //合计
    function add_up() {
        var add_up = require('/Static/src/common/addUp');
        //申请额度列
        var numClass = '.finance_decmal';
        var sumId = '#expenseSum';
        add_up.add_up(numClass, sumId);
        //借款列
        var borrowed = '.borrowed';
        var borrowedSum = '#borrowedSum';
        add_up.add_up(borrowed, borrowedSum);
        //报销列
        var moneyClaim_class = '.moneyClaim';
        var apply_sum = '#payForSum';
        add_up.add_up(moneyClaim_class, apply_sum);
        //核定列
        var decmak = '.finance_decmak';
        var checkSum = '#checkSum';
        add_up.add_up(decmak, checkSum);
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
    //输入框验证
    function textArea() {
        //获取需要验证的元素,顶部输入框
        var $desc_top= $('.detailTop .description');
        text($desc_top);
        //tr元素的输入框
        var tr_desc = $('.tr_desc');
        text(tr_desc);
        //验证函数
        function text(elem) {
            var $label = $(elem).parents('.desc_wrapper').children('label');
            if ($('#tr_desc').val() != '') {
                $label.hide();
            }
            $(elem).die('focus').live('focus', function () {
                $label.hide();
            }).die('blur').live('blur', function () {
                if ($(elem).val() == '') {
                    $label.show();
                }
            }).die('keyup').live('keyup', function () {
                var $val = elem.val();
                if ($val.length > 250) {
                    //截取前250个字符
                    elem.val($val.substr(0, 250));
                }
            });
        }
        
    }

    module.exports = check_inner;
});