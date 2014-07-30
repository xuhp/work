define(function (require, exports, module) {
    //引入jquery
    var rownum = 0;
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);
    //引入日历插件
    require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
    require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')($);
    //引入javascript模板引擎 artTemplate
    require('/Static/src/plugin/artTemplate/template.min');

    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

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
    //创建提交信息数据对象
    var oHeadData = new Object();
    oHeadData.FormID = '';
    oHeadData.CompanyId = '';
    oHeadData.CompanyName='';
    oHeadData.DeptID = '';
    oHeadData.DeptName='';
    oHeadData.BusiID = '';
    oHeadData.BusiName='';
    oHeadData.Installment = false;
    oHeadData.ApplyCase = '';
    oHeadData.FormID = '';
    oHeadData.UserID = '';
    oHeadData.TrueName = '';
    oHeadData.Phone = '';
    oHeadData.Description = '';

    var expense = {
        init: function () {
            this._common(),
            this._elem_h(),
            this._subNav(),
            this._company(),
            this._userName(),
            this._tabColor(),
            this._jdPicker(),
            this._paidFor(),
            this._f_decmal(),
            this._del_row(),
            this._phone(),
            this._textArea(),
            this._add_row(),
            this._new_row(),
            this._treebox(),
            this._add_up(),
            this._sure_click()
        },
        //加载公共样式
        _common: function () {
            var common = require('/Static/src/common');
            //临界高度的设置，对象提示框
            var threshold = 80;
            common.toolTip(threshold);
            //将所有input元素清空
            $('input').val('');
        },
        //面包屑导航
        _subNav: function () {
            var state = getUrlParam('applycase');
            var s_main = '';
            switch (state) {
                case '1':
                    s_main += '<span>我要借款</span>';
                    break;
                case '2':
                    s_main += '<span>自己垫付</span>';
                    break;
                case '3':
                    s_main += '<span>先有发票</span>';
                    break;
            }
            $('.fms-navsite').append(s_main);
        },
        //公司列表
        _company: function () {
            var $company = $('.choice_company');
            $.ajax({
                type: "post",
                url: $.url_prefix+"/Ashx/Common/CompanyHandler.ashx?method=GetEffectiveCompanys",
                async: false,
                dataType: "json",
                cache: false,
                beforeSend: function () {
                },
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg);
                        //关闭弹出框
                        art.dialog({ id: 'cd_dialog' }).close();
                        return false;
                    }
                    var $option = create_company(data);
                    $company.append($option);
                },
                error: function (error) {
                    errorMsg("网络繁忙，请稍后再试！");
                }
            });
            //创建公司列表
            function create_company(data) {
                var $option = '';
                for (var i = 0; i < data.length; i++) {
                    $option += '<option companyId="' + data[i].CompanyID + '">' + data[i].CompanyName + '</option>';
                }
                return $option;
            };
        },
        //获取姓名和id
        _userName: function () {
            var $userName = $('.userName');
            $.ajax({
                type: "post",
                url: $.url_prefix+"/Ashx/Common/SSOHandler.ashx?method=GetCurrentUser",
                async: false,
                dataType: "json",
                cache: false,
                beforeSend: function () {
                },
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg);
                        //关闭弹出框
                        art.dialog({ id: 'cd_dialog' }).close();
                        return false;
                    }
                    $userName.text(data.TrueName);
                    $userName.attr('userId', data.UserID);
                },
                error: function (error) {
                     window.location.href = error.responseText;
                }
            });
        },
        //日历选择
        _jdPicker: function () {
            //$.date_input.initialize('.jdpicker');
        },
        //地区选择
        _areaPicker: function () {
        },
        //对象选择
        _paidFor: function () {
            var paidFor = require('/Static/src/common/paidFor');
            paidFor();
        },
        //合计
        _add_up: function () {
            var add_up = require('/Static/src/common/addUp');
            var numClass = '.finance_decmal';
            var sumId = '#expenseSum';
            add_up.add_up(numClass, sumId);
        },
        //财务数字输入
        _f_decmal: function () {
            //引入财务数字
            var f = require('/Static/src/common/f_decmal');
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
                if (!reg.test(str_num) && str_num!='') {
                    var msg = '填写的金额过长';
                    errorMsg(msg);
                }
            })
        },
        //手机号验证
        _phone: function () {
            $('.pnone').live('blur', function () {
                var elem = this;
                phone_reg(elem);
            });
        },
        //输入框验证
        _textArea: function () {
            var $description = $('.description')
            $description.live('blur', function () {
                var $val = $description.val();
                if ($val == '') {
                    $description.val('请输入不多于250个字符');
                }
                var $val = $description.val();
                if ($val.length > 250) {
                    $description.val($val.substr(0, 250));
                }
            }).live('focus', function () {
                if ($description.val() == '请输入不多于250个字符') {
                    $description.val('');
                }
            }).live('keyup', function () {
                var $val = $description.val();
                if ($val.length > 250) {
                    $description.val($val.substr(0, 250));
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
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput jdpicker" readonly="true" /></td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput areaPicker" readonly="true"/></td>' +
                        '<td>' +
                            '<div class="paidFor_pos">'+
                                '<input type="text" class="allEditTab-txtInput paidFor" readonly="true" />'+
                            '</div>'+
                        '</td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput tree_subject"  readonly="true"/></td>' +
                        '<td>' +
                            '<input type="text" class="allEditTab-txtInput finance_decmal f14" value="" /></td>' +
                        '<td>' +
                            '<button class="redBtn h22 w45 expenseF-delBtn" >删除</button></td>' +
                    '</tr>';
            //地区选择
            var select_area = $('#' + id + ' .areaPicker');
            select_area.die('click').live('click', function () {
                require('/Static/src/plugin/areaPicker/areaPicker.css');
                var areaPicker = require('/Static/src/plugin/areaPicker/areaPicker');
                areaPicker.init(this,pData);
            })

            $('#expenseBody tbody').append(tr);
            $('.date_selector').remove();
            $.date_input.initialize('.jdpicker');
        },
        //删除行
        _del_row: function () {
            $('.expenseF-delBtn').live('click', function () {
                var len=$('#expenseBody tbody tr').length;
                if (len > 1) {
                    var that = $(this);
                    var del = require('/Static/src/common/delRow');
                    del.del_row(that);
                    $('.scroll-pane').jScrollPane();
                } else {
                    var msg = '最后一行不能删除';
                    errorMsg(msg);
                }
                return false;
            });
        },
        //表格颜色设置
        _tabColor: function () {
            var $tbody = $('.fms-table tbody');
            $tbody.find('tr:odd').css('background', '#F0F0F0');
        },
        //页面元素高度设置
        _elem_h: function () {
            $(function () {
                o_elem_h();
                var pane = $('.scroll-pane')
                pane.jScrollPane({});
                var api = pane.data('jsp');
                $(window).resize(function () {
                    o_elem_h();
                    api.reinitialise();
                });
                setTimeout(function () {
                    $('#expense-loader').remove();
                },100)
            })
            function o_elem_h() {
                var $body_h = $('body').height();
                var $nav_h = $('.navsite').height();
                var $m_h = $('.mutate-table-wrapper').height();
                var $FormMain_h = $body_h - $nav_h - $m_h - 20-74  - 90;
                $('#expenseFormMain').height($FormMain_h);
            };
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
            //业务
            $(".tree_business").partTree({
                ajaxUrl: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=GetListUsing",
                sign: "bus",
                elem: "#busBox"
            });
            //部门
            $("#tree_department").partTree({
                ajaxUrl: $.url_prefix+"/Ashx/Common/SSOHandler.ashx?method=GetDepts&DeptType=0",//DeptType=0,行政部门
                id: "DeptID",
                pid: "ParentDeptID",
                name: "DeptName",
                type: "0",//0为没有文件夹图表
                end: false,//false,为全部节点可以选择。True为只可以选择末节点
                sign: "part",
                elem: "#partBox"
            });

        },
        //确定按钮
        _sure_click: function () {
            $('#expense_sureBtn .sureBtn').click(function () {
                //移除弹出内容
                $('.date_selector').hide();
                $('.areaWrapper').remove();
                //验证
                function onSubmit() {
                    var $text = $('#expenseBody td :text,.mutate-table :input,');
                    //num用以统计为填写内容表单在所有元素中的顺序
                    var num = 0;
                    //需验证的元素的个数
                    var len = $text.length;
                    $text.each(function (index, elem) {
                        if (index == 3) {
                            if (!phone_reg(elem)) {
                                return false;
                            };
                        } else {
                            var $f_decmal = $('.finance_decmal');
                            for (var i = 0; i < $f_decmal.length; i++) {
                                if ($(this).val() == '0.00') {
                                    var msg = '申请金额不能为0';
                                    errorMsg(msg)
                                    return false;
                                }
                            }
                            if ($(this).val() == '' || $(this).val() == '— 请选择公司 —' || $(this).val() == '请输入不多于500个字符') {
                                art.dialog({
                                    id: 'allError_msg',
                                    drag: false,
                                    content: '请完善表单',
                                    lock: true
                                });
                                art.dialog({ id: 'allError_msg' }).title('3秒后关闭').time(3);
                                return false;
                            }
                        }
                        //获取顺序数
                        num = $text.index(this);
                    });
                    if (num == len - 1) {
                        return true;
                    } else {
                        return false;
                    }
                }
                if (!onSubmit()) return false;

                //判断申请条件是否相同
                var trs = $('#expenseBody tbody tr');
                var flag=different_latitude(trs);
                if (!flag) {
                    return false;
                }
                /*
                * headData部分
                */
               
                //获取公司id和公司名称
                var $company_selected = $('.choice_company option:selected');
                oHeadData.CompanyId = $company_selected.attr('companyid');
                oHeadData.CompanyName = $company_selected.val();

                //获取部门id和部门名称
                var $department=$('.tree_department');
                oHeadData.DeptID=$department.attr('nodeid')
                oHeadData.DeptName = $department.val();

                //获取业务类型id和名称
                $business=$('.tree_business');
                oHeadData.BusiID=$business.attr('nodeid');
                oHeadData.BusiName = $business.val();

                //获取姓名id和姓名
                oHeadData.UserID = $('.userName').attr('userId');
                oHeadData.TrueName = $('.userName').text();
                
                //获取手机号码
                oHeadData.Phone = $('.pnone').val();
                //获取申请说明文本,先使用正则表达式去掉html标签，然后对字符串进行编码
                oHeadData.Description = $('.description').val().replace(/<[^>].*?>/g, '');


                //获取ApplyCase和formid
                //http://localhost:52024/Static/expenseForm.html?formid=1&applycase=1 
                //获取request
                function getUrlParam(name) {
                    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                    var r = window.location.search.substr(1).match(reg);
                    if (r != null) return unescape(r[2]); return null;
                }
                oHeadData.FormID = getUrlParam('formid');
                oHeadData.ApplyCase = getUrlParam('applycase');
                
                //判断是否需要多次报销
                if ($('.fms-checkbox').attr('checked')) {
                    oHeadData.Installment = true;
                } else {
                    oHeadData.Installment = false;
                };
               
                //获取头部数据-用于javascript模版引擎
                var head_data = {
                    'companyName': oHeadData.CompanyName,
                    'DeptName': oHeadData.DeptName,
                    'BusiName': oHeadData.BusiName,
                    'TrueName': oHeadData.TrueName,
                    'Phone': oHeadData.Phone,
                    'Description': oHeadData.Description
                }
                //重写头部html
                var head_source = '<div class="mutate-table-wrapper mt10" style="width:850px;">' +
                    '<table class="fms-table mutate-table ellips-table">' +
                        '<tr>' +
                            '<td style="width:60px;">' +
                                '<label for="" class="mutate-label">公司:</label>' +
                            '</td>' +
                            '<td style="width:130px;" class="ellipsis">' +
                               '<%=companyName%>' +
                            '</td>' +
                            '<td style="width:30px;">' +
                                '<label for="" class="mutate-label">部门:</label>' +
                            '</td>' +
                            '<td style="width:150px;">' +
                                '<div class="ellipsis" title="' + '<%=DeptName%>' + '">' + '<%=DeptName%>' + '</div>' +
                            '</td>' +
                            '<td  style="width:60px;">' +
                                '<label for="" class="mutate-label">业务类型:</label>' +
                            '</td>' +
                            '<td style="width:150px;">' +
                                '<div class="ellipsis" title="' + '<%=BusiName%>' + '">' + '<%=BusiName%>' + '</div>' +
                            '</td>' +
                            '<td  style="width:30px;">' +
                                '<label for="" class="mutate-label">姓名:</label>' +
                            '</td>' +
                            '<td style="width:80px;" class="ellipsis">' +
                                '<%=TrueName%>' +
                            '</td>' +
                            '<td  style="width:30px;">' +
                                '<label for="" class="mutate-label">手机:</label>' +
                            '</td>' +
                            '<td class="ellipsis">' +
                                '<%=Phone%>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td style="width:60px;">' +
                                '<label for="" class="mutate-label">申请说明:</label>' +
                            '</td>' +
                            '<td colspan="9" class="break-word">' +
                                '<%=Description%>' +
                            '</td>' +
                        '</tr>' +
                    '</table>' +
                '</div>';
                /*
                * bodyData
                */
                //获取#expenseBody的tr的行数
                var tr_len = $('#expenseBody tbody tr').length;
                
                //获取body数据-用于javascript模版引擎
                var body_data = {
                    'date': [],
                    'areaId': [],
                    'areaName': [],
                    'cusId': [],
                    'cusName': [],
                    'cusType': [],
                    'cusVal':[],
                    'accountHolder': [],
                    'cardNo': [],
                    'bankName': [],
                    'subId': [],
                    'subName':[],
                    'moneyApply': []
                }
                $('#expenseBody tbody tr').each(function (index, elem) {
                        //获取日期值,并将他添加到date数组当中
                        body_data.date.push($(this).find('.jdpicker').val());

                        //获取area id,并将他添加到areaId数组当中
                        var areaP = $(this).find('.areaPicker');
                        body_data.areaId.push(areaP.attr('areaId'));
                        //获取area的值，并将其添加到areaName数组当中
                        body_data.areaName.push(areaP.val());

                        //获取去客户信息，并添加到相关数组
                        var paidFor = $(this).find('.paidFor');
                        body_data.cusId.push(paidFor.attr('cusId'));
                        body_data.cusName.push(paidFor.attr('cusName'));
                        body_data.cusType.push(paidFor.attr('cusType'));
                        body_data.cusVal.push(paidFor.val());

                        //获取银行账户信息，并添加到相关数组
                        var tooltip = $(this).find('.tooltip');
                        body_data.accountHolder.push(tooltip.find('.AccountHolder span').text());
                        body_data.cardNo.push(tooltip.find('.cardNo span').text());
                        body_data.bankName.push(tooltip.find('.bankName span').text());

                        //获取科目id，并将其添加到subId数组中
                        var sub = $(this).find('.tree_subject');
                        body_data.subId.push(sub.attr('nodeid'));
                        body_data.subName.push(sub.val());

                        //获取申请额度值，并将其添加到moneyApply
                        var $fd_val = $(this).find('.finance_decmal').val();
                        body_data.moneyApply.push($fd_val);
                })

                //获取申请费用总计
                var money_sum = $('#expenseSum').text();
                //重写body部分代码
                var body_source = '<table class="fms-table partEditTable mt10" id="header_artBody">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th style="width:15%;">日期</th>' +
                                    '<th style="width:20%;">地区</th>' +
                                    '<th style="width:25%;">付款对象</th>' +
                                    '<th style="width:25%">科目</th>' +
                                    '<th style="width:15%;">申请额度</th>' +
                                '</tr>' +
                            '</thead><tbody></tbody></table>';

                body_source += '<div class="ef-allTab-wrapper" id="artBody">' +
                        '<table class="fms-table partEditTable ellips-table">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th style="width:15%;">日期</th>' +
                                    '<th style="width:20%;">地区</th>' +
                                    '<th style="width:25%;">付款对象</th>' +
                                    '<th style="width:25%">科目</th>' +
                                    '<th style="width:15%;">申请额度</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>';
                for (var i = 0; i < tr_len; i++) {
                    body_source += '<tr>' +
                            '<td><%= date[' + i + '] %></td>' +
                            '<td class="ellipsis" title="<%= areaName[' + i + '] %>"><%= areaName[' + i + '] %></td>' +
                            '<td>' +
                                '<div class="paidFor_pos">' +
                                    '<span class="paidFor_outer ellipsis" style="display:block;width:90%;" title="<%= cusVal[' + i + ']%>"><%= cusVal[' + i + ']%></span>' +
                                    '<div class="tooltip" style="position:absolute; z-index:999999;display:none;line-height:15px;">' +
                                        '<p>开户行：<%=bankName[' + i + '] %></p>' +
                                        '<p>卡&nbsp;&nbsp;&nbsp;&nbsp;号：<%= cardNo[' + i + '] %></p>' +
                                        '<p>户主名：<%=accountHolder[' + i + ']%></p>' +
                                    '</div>' +
                               '</div>'+
                            '</td>' +
                            '<td class="ellipsis" title="<%= subName[' + i + '] %>"><%= subName[' + i + '] %></td>' +
                            '<td><%= moneyApply[' + i + '] %></td>' +
                        '</tr>'
                };
                body_source += '</tbody></table></div>';
                body_source += '<table class="fms-table partEditTable" id="footer_artBody">' +
                            '<thead>' +
                                '<tr>' +
                                     '<th style="width:15%;">日期</th>' +
                                    '<th style="width:20%;">地区</th>' +
                                    '<th style="width:25%;">付款对象</th>' +
                                    '<th style="width:25%">科目</th>' +
                                    '<th style="width:15%;">申请额度</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tfoot>' +
                                '<tr>' +
                                    '<td colspan="4" class="tr">' +
                                        '合计:' +
                                    '</td>' +
                                    '<td>' + money_sum + '</td>' +
                                '</tr>' +
                            '</tfoot>' +
                        '</table>';


                //判断是否选择了多次报销
                var payFor = '';
                if (oHeadData.Installment) {
                    payFor = '您可以分多次进行报销';
                } else {
                    payFor = '您需要一次性结束报销';
                }
                //操作部分
                var foot_source = '<div style="" class="mt10 tc">' +
                        '<span style="float:left;font-size:16px;color:#f00;font-weight:bold;">' + payFor + '</span>' +
                        '<button class="blueBtn  h26 w100 ml20" id="sureAgain">确定</button>' +
                        '<button class="redBtn  h26 w100 ml20" id="reset">取消</button>' +
                    '<div>';

               //head部分填充数据
                var render_head = template.compile(head_source);
                var html_head = render_head(head_data);
               //body部分填充数据
                var render_body = template.compile(body_source);
                var html_body = render_body(body_data);
                //传入artdialog中的数据
                var html = html_head + html_body + foot_source;
                art.dialog({
                    id: 'sureAgain',
                    drag: false,
                    content: html,
                    title: '二次确认页面',
                    lock: true
                });
                

                //获取头部数据-用于传递到后端
                var headJson = {
                    'CompanyID': oHeadData.CompanyId,
                    'BusiID': oHeadData.BusiID,
                    'FormID': oHeadData.FormID,
                    'Installment': oHeadData.Installment,
                    'ApplyCase':oHeadData.ApplyCase,
                    'DeptID': oHeadData.DeptID,
                    'UserID': oHeadData.UserID,
                    'TrueName': oHeadData.TrueName,
                    'Phone': oHeadData.Phone,
                    'Description': oHeadData.Description
                };

                //获取body数据-用于传递到后端cusType
                var bodyJson = [
                ]
                $('#expenseBody tbody tr').each(function (index, elem) {
                    //转化申请的金额进行转化
                    var str = body_data.moneyApply[index];
                    var no_com = '';
                    //如果为数字和'.'之外的字符则移除
                    for (var i = 0; i < str.length; i++) {
                        if (!isNaN(str[i]) || str[i] == '.') {
                            no_com += str[i];
                        }
                    };
                    var data_row = {};
                    data_row.Date = body_data.date[index];
                    data_row.Area = body_data.areaId[index];
                    data_row.CusName = body_data.cusName[index];
                    data_row.CusType= body_data.cusType[index];
                    data_row.CusID = body_data.cusId[index];
                    data_row.AccountHolder = body_data.accountHolder[index];
                    data_row.CardNo = body_data.cardNo[index];
                    data_row.BankName = body_data.bankName[index];
                    data_row.SubID = body_data.subId[index];
                    data_row.MoneyApply = no_com;
                    bodyJson.push(jsonToString(data_row));
                });
                //将json转换成string
                function jsonToString(o) {
                    var arr = [];
                    var fmt = function (s) {
                        if (typeof s == 'object' && s != null) return jsonToString(s);
                        return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
                    }
                    for (var i in o)
                        arr.push("'" + i + "':" + fmt(o[i]));
                    return '{' + arr.join(',') + '}';
                }
                jsonData = { 'headData': jsonToString(headJson), 'bodyData': '[' + bodyJson.join() + ']' };
                //二次确认页面相关操作
                //点击确定按钮
                $('#sureAgain').die('click').live('click', function () {
                    var $that = $(this);
                    $that.addClass('disableBtn')
                        .text('申请提交中...')
                        .attr('disabled', 'disabled');
                    $.ajax({
                        type: "post",
                        url: $.url_prefix+$.general+'method=AddOrder',
                        async: true,
                        data: jsonData,
                        dataType: "json",
                        success: function (data) {
                            if (data != null && data.error) {
                                errorMsg(data.msg)
                                return false;
                            }
                            if (data != null && data.status == 'OK') {
                               window.location.href = '/Workflow/CostReimbursement/ApplySuccess.html';
                            }
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        },
                        complete: function () {
                            $that.removeAttr('disabled')
                            .text('确定')
                            .removeClass('disableBtn');
                        }
                    });
                });
                //点击取消按钮
                $('#reset').live('click', function () {
                    art.dialog({ id: 'sureAgain' }).close();
                });
            });
        }
    };
    //手机号验证函数
    function phone_reg(el) {
        var reg = /(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/;
        var phoneNum = $(el).val();
        if (!reg.test(phoneNum)) {
            art.dialog({
                id: 'phone_msg',
                lock:true,
                drag: false,
                content: '请填写正确的手机号码',
            });
            art.dialog({ id: 'phone_msg' }).title('3秒后关闭').time(3);
            return false;
        }
        return true;
    };
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
    };
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    //申请条件不可重复
    function different_latitude(trs) {
        var flag = true;
        var len = trs.length;
        //创建数组存放条件字符串数组
        var strs = new Array();
        for (var i = 0; i < len; i++) {
            strs[i] = '';
            for (var j = 0; j < 4; j++) {
                var $td = $(trs[i]).find('td').eq(j);
                if (j == 2) {
                    strs[i] += $td.find('input').val() + $td.find('.cardNo').children('span').text();
                } else {
                    strs[i] += $td.find('input').val();
                }
            }
        }
        //对数组进行排序
        strs.sort();
        //比较相邻两个字符串是否相等
        for (var m = 0; m < strs.length - 1; m++) {
            if (strs[m] == strs[m + 1]) {
                flag = false;
                var msg = '申请条件不能相同';
                errorMsg(msg);
                break;
            }
        }
        return flag;
    }
    
    module.exports = expense;

});