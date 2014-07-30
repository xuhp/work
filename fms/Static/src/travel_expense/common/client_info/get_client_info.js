/*
 *@Description: 用于获取联系客户信息
 *@date:        2014-04-28
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');

    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    var get_client_info = {
        init: function (elem) {
            this._pop_con();
            this._search_info();
            this._save_info(elem);
            this._close_dialog();
        },
        //弹出内容弹出框
        _pop_con: function () {
            var con = create_wrap();
            art.dialog({
                id: 'openD',
                title: '选择客户信息',
                lock: true,
                drag: false,
                content: con
            });
        },
        //单击查询按钮显示相关信息
        _search_info: function () {
            $('body').undelegate('.searchBtn', 'click').delegate('.searchBtn', 'click', function () {
                $('.loader-big').show();
                setTimeout(function () {
                    var company_name = $('#client_organization').val();
                    var client_name = $('#client_contact').val();
                    $.ajax({
                        type: "post",
                        url: $.url_prefix + '/Ashx/Common/CrmHandler.ashx?method=GetFinanceCustomerList&t=' + (+new Date()),
                        async: false,
                        dataType: "json",
                        data: {
                            'companyName': company_name,
                            'customerName': client_name
                        },
                        success: function (data) {
                            //错误验证
                            if (data != null && data.error) {
                                errorMsg(data.msg);
                                return false;
                            }
                            var client_info_body = $('.client_info_body');
                            var infos = get_info(data);
                            client_info_body.empty().append(infos);

                            //当返回的json数据为空时
                            $('.nullMsg').hide();
                            if (data.length == 0) {
                                if ($('.nullMsg').length == 0) {
                                    $('.client_info_wrap').append('<div class="nullMsg" style="font-size:20px;text-align:center;width:400px;margin:0 auto;margin-top:70px;"><p>请确保该条信息已存在于‘CRM’系统（客户单位和联系人不能为空）</p></div>');
                                    $('.nullMsg').stop(true, true).fadeIn(100)//.fadeOut(3000);
                                } else {
                                    $('.nullMsg').stop(true, true).fadeIn(100)//.fadeOut(3000);
                                }
                            }
                            //移除loading效果
                            $('.loader-big').hide();
                            //执行滚动条插件
                            $('.scroll-pane').jScrollPane();
                            //表格相关操作
                            tab_fn();
                        },
                        error: function (data) {
                            alert('失败')
                            //移除loading效果
                            $('.loader-big').hide();
                            alert("网络繁忙，请稍后再试！");
                        }
                    });
                    //移除loading效果
                    $('.loader-big').hide();
                }, 100);
            })
        },
        //单击确定按钮
        _save_info: function (elem) {
            $('.client_info_dialog .sureBtn ').die('click').live('click', function () {
                //获取选中信息
                var checked, tr, client_td, parent_id, parent_tr;

                var client = {};

                checked = $('.client_info_body').find('input:checked');

                if (!checked) {
                    return false;
                }

                tr = checked.parent().parent();

                client_td = tr.find('.client_name');
                client.client_id = client_td.attr('nodeid');
                client.client_name = client_td.text();
                client.job = tr.find('.job').text();
                client.phone_num = tr.find('.phone_num').text();

                parent_id = tr.attr('class').substr(6);
                parent_tr = $('#' + parent_id);
                client.company_id = parent_tr.attr('nodeid');
                client.company_name = parent_tr.find('.company_name').text();

                //插入展示信息
                var info = show_info(client);
                $(elem).empty().append(info);

                //关闭弹出框
                art.dialog({ id: 'openD' }).close();
            })
        },
        //单机关闭按钮
        _close_dialog: function () {
            $('body').delegate('.cancelBtn ', 'click', function () {
                art.dialog({ id: 'openD' }).close();
            })
        }
    }

    function create_wrap() {
        var wrap = '<div class="client_info_dialog">' +
                '<div class="client_info_top">' +
                    '<label class="w100" for="client_organization" title="客户单位">客户单位：</label>' +
                    '<input type="text" class="form-text form-normal"  id="client_organization"/>' +
                    '<label class="w100" for="client_contact" title="联系人">联系人：</label>' +
                    '<input type="text" class="form-text form-normal" id="client_contact" />' +
                    '<button class="searchBtn blueBtn  h26 pl10 w82 ">搜索</button>' +
                '</div>' +
                '<div class="client_con mt10">' +
                    '<table class="fms-table partEditTable client_info_top">' +
                        '<thead>' +
                            '<tr>' +
                                '<th style="width: 10%;">选择</th>' +
                                '<th style="width:20%;;">联系人姓名</th>' +
                                '<th style="width:35%;">职务</th>' +
                                '<th style="width:35%;">电话</th>' +
                            '</tr>' +
                        '</thead>' +
                    '</table>' +
                    '<div class="client_info_wrap scroll-pane" style="position:relative;">' +
                        '<table class="fms-table partEditTable client_info_body">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th style="width:10%;">选择</th>' +
                                    '<th style="width:20%;;">联系人姓名</th>' +
                                    '<th style="width:35%;">职务</th>' +
                                    '<th style="width:35%;">电话</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '</tbody>' +
                        '</table>' +
                        '<span class="loader-big" style="position:absolute;top:102px;left:256px;display:none;"></span>' +
                    '</div>' +
                 '</div>' +
                '<div class="client_info_btn" style="margin-top:20px;text-align:center;">' +
                    '<button class="sureBtn blueBtn  h26 pl10 w100 mr10">确定</button>' +
                    '<button class="cancelBtn redBtn  h26 pl10 w100">取消</button>' +
                '</div>' +
            '</div>';
        return wrap;
    };

    function get_info(client_info) {
        client_info.sort(compare);
        var infos = '';
        for (var i = 0; i < client_info.length; i++) {
            if (i == 0) {
                infos += get_info_head(client_info, i);
            }
            if (i > 0 && client_info[i].CompanyID != client_info[i - 1].CompanyID) {
                infos += get_info_head(client_info, i);
            }
            infos += '<tr class="child_row_' + client_info[i].CompanyID + '">' +
                '<td style="width:10%;"><input type="radio" name="radio" /></td>' +
                '<td class="client_name" style="width:20%;" nodeid="' + client_info[i].CustomerID + '">' + client_info[i].CustomerName + '</td>' +
                '<td class="job" style="width:35%;">' + client_info[i].Job + '</td>' +
                '<td class="phone_num" style="width:35%;">' + client_info[i].ContactNumber + '</td>' +
            '</tr>';
        }
        return infos;
    }

    function get_info_head(client_info, i) {
        var info_head = '';
        info_head = '<tr class="client_info_parent" id="row_' + client_info[i].CompanyID + '" nodeid="' + client_info[i].CompanyID + '">' +
                    '<td  colspan="4" style="text-align:left; ">' +
                        '<span class="client_info_opearte" ></span> ' +
                        '<span class="company_name">' + client_info[i].CompanyName + '</span> ' +
                '</td></tr>';
        return info_head;
    }

    //表格相关操作
    function tab_fn() {
        var client_info_body = $('.client_info_body');
        var client_info_parent = client_info_body.find('.client_info_parent');
        client_info_parent.click(function () {
            $(this)
                .toggleClass("selected")   // 展开部分高亮显示
                .siblings('.child_' + this.id).toggle();  // 展开相关子项
            //执行滚动条插件
            $('.scroll-pane').jScrollPane();
        });
        $('.client_info_body tr').click(function () {
            $(this).find(':radio').attr('checked', 'checked');
        })
    }

    //排序比较函数
    function compare(a, b) {
        return a.CompanyID - b.CompanyID;
    }

    //组装赋值信息
    function show_info(client) {
        var info = '<span class="client_contact_name ellipsis" style="width:30%;" nodeid="' + client.company_id + '">' + client.company_name + '</span>' +
            '<span style="width:15%;" class="client_customer_name ellipsis" nodeid="' + client.client_id + '">' + client.client_name + '</span>' +
            '<span style="width:30%;" class="client_duty ellipsis">' + client.job + '</span>' +
            '<span style="width:25%;" class="client_phone ellipsis">' + client.phone_num + '</span>';
        return info;
    }

    exports.get_client_info = get_client_info;
})