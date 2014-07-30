define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);
    //引入自动匹配插件
    var auto = require('/Static/src/plugin/autocomplate/autocomplate');
    require('/Static/src/plugin/autocomplate/autocomplate.css');
    //获取公司id
    var companyId = getUrlParam('companyid');
    //将url转码
    var url = decodeURI(window.location.href);
    var compamyName = url.split("=");
    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    //权限配置
    var roleKeys = $('#roleKeys').val();
    //判断是否出现添加一行按钮
    if (roleKeys != undefined && roleKeys.indexOf('StaffingHandler_AddFormBusiInfo') != -1) {
        $('#add_sfBtn').show();
    }
    var staffing = {
        init: function () {
            this._base();
            this._subNav();
            this._resize();
            this._add_row();
            this._sure_click();
            this._del_click();
            this._busi_tree();
            this._load_list();
            this._tr_click();
            this._tr_h_click();
            this._copy_to_other();
            this._choice_form();
        },
        //设置基础样式
        _base: function () {
            //设置元素高度
            this_h();
            //表格隔行变色
            changeColor();
            //确定取消按钮样式
            sure_rest_btn();
        },
        //当窗体大小改变时执行的操作
        _resize: function () {
            $(window).resize(function () {
                this_h();
                //滚动条
                $('.scroll-pane').jScrollPane();
            });
        },
        //添加面包屑导航
        _subNav: function () {
            //输出最后一个
            var subCon = '<span>' + compamyName[compamyName.length - 1] + '</span>';
            $('.fms-navsite').append(subCon);

        },
        //加载左侧业务名称和报销单
        _load_list: function () {
            $.ajax({
                type: "post",
                url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=GetStaffingRelation',
                data: { 'companyID': companyId },
                async: false,
                dataType: "json",
                success: function (data) {
                    if (data != null && data.error) {
                        errorMsg(data.msg)
                        return false;
                    }
                    $('.staffingTab tbody').append(createSidebar(data));
                    //各行变色
                    changeColor();
                    //确定取消按钮样式
                    sure_rest_btn();
                    //滚动条
                    $('.scroll-pane').jScrollPane();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //单击左侧添加一行按钮
        _add_row: function () {
            $('#add_sfBtn').click(function () {
                var $tbody = $('.addStaffingForm .staffingTab tbody');
                var trs = $tbody.find('tr');
                var len = trs.length;
                if (len > 0) {
                    //如果之前一行没有确定，则不允许添加新行
                    if ($tbody.find('.staffing-sure').length) {
                        var msg = '请先前些完成上一行！';
                        errorMsg(msg);
                        return false;
                    };
                    $tbody.find('tr:first').before(add_tr());
                } else {
                    $tbody.append(add_tr());
                }
                changeColor();
                sure_rest_btn();
                //滚动条
                $('.scroll-pane').jScrollPane();
            });
        },
        //单击确定按钮
        _sure_click: function () {
            $('.staffing-sure').live('click', function () {
                var that = this;
                var parent = $(this).parents('tr');
                //提交前表单验证，只有当两个框都填写之后才可以进行后续操作
                if (parent.find('.tree_business').val() == '') {
                    var msg = '请选择业务内型！';
                    errorMsg(msg)
                    return false;
                }
                if (parent.find('.staffingForm-select').val() == '-- 请选择报销单 --') {
                    var msg = '请选择报销单！';
                    errorMsg(msg)
                    return false;
                }
                //获取表单id
                var formId = parent.find('.staffingForm-select option:selected').attr('formid');
                //获取业务id
                var busiId = parent.find('.tree_business').attr('nodeid');
                //获取最后一层级业务名称
                var lastBusiName = parent.find('.tree_business').attr('stitle');
                //将数据传入到后端进行验证
                $.ajax({
                    type: "post",
                    url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=AddFormBusiInfo',
                    data: {
                        'formID': formId,
                        'busiID': busiId,
                        'companyID': companyId
                    },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if (data != null && data.error) {
                            errorMsg(data.msg)
                            return false;
                        }
                        //添加成功后执行操作
                        //获取包含表单的td
                        var form_td = $(that).parent('td').prev('td');
                        var fid = form_td.find('.staffingForm-select option:selected').attr('formid');
                        //设置formid
                        form_td.attr('formId', fid);
                        //获取sid
                        var sid = data.SID;
                        $(that).parents('tr').attr('id', sid);
                        createListSuccessed(that, lastBusiName);
                    },
                    error: function (error) {
                        window.location.href = error.responseText;
                    }
                });
            })
        },
        //单击删除按钮
        _del_click: function () {
            $('.staffing-del').live('click', function () {
                //获取删除行id
                var sid = $(this).parents('tr').attr('id');
                //在前端执行删除行操作
                var that = $(this);
                del_row(sid, that);
                changeColor();
                return false;
            });
        },
        //业务类型选择
        _busi_tree: function () {
            require('/Static/src/plugin/stree/jquery.stree.part')($);
            require('/Static/src/plugin/stree/css/stree.css');
            //业务
            $(".tree_business").partTree({
                ajaxUrl: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=GetListUsing",
                sign: "bus",
                elem: "#busBox"
            });
        },
        //单击左侧报销单，加载右侧配置
        _tr_click: function () {
            $('.slide_tr').die('click').live('click', function () {
                //获取sid和formId
                var that = this;
                var sid = $(this).attr('id');
                var formId = $(this).find('td:eq(1)').attr('formid');
                $.ajax({
                    type: "post",
                    url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=GetStaffingItemInfoBySID',
                    data: { 'sid': sid },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if (data != null && data.error) {
                            errorMsg(data.msg)
                            return false;
                        }
                        //添加高亮效果
                        add_selected(that);
                        //将右侧栏配置信息删除
                        $('.sideHeadTable tr').remove();
                        if (data.Items == '') {
                            //如果之前没有配置过，则进行配置
                            config(formId);
                        } else {
                            //如果配置过了，则只需要加载就可以了
                            loading_right(sid);
                        }
                        //展开第一项
                        $('.child_tr_0').show();
                        $('.staffing_tr_h a').eq(0).html('-点击收起');

                        //确定是否显示保存按钮
                        if (roleKeys != undefined && roleKeys.indexOf('StaffingHandler_SetStaffingItemInfo') != -1) {
                            $('.saveBtnWrapper').show();
                        } else {
                            $('.sideHeadTable input').attr('readonly', 'readonly');
                        }
                        //财务数字输入
                        f_decmal();
                        //使用自动匹配插件
                        auto_complate();
                        //保存配置信息
                        save_info(sid);
                    },
                    error: function (error) {
                        window.location.href = error.responseText;
                    }
                });
            });
        },
        //单击右侧表头，伸缩展开内容
        _tr_h_click: function () {
            $('.sideHeadTable').delegate('.staffing_tr_h', 'click', function () {
                $('.child_' + this.id).toggle();
                var this_a = $(this).find('a');
                if (this_a.text() == '+查看详情') {
                    this_a.text('-点击收起');
                } else {
                    this_a.text('+查看详情');
                }
            });
        },
        //复制功能
        _copy_to_other: function () {
            var $side_tab = $('.sideHeadTable');
            $side_tab.delegate('.copy_to_other', 'hover', function () {
                //ul显示影藏
                $(this).find('ul').toggle();
                //阻止冒泡操作
                $(this).click(function () {
                    return false;
                });
                //实现复制功能
                $(this).find('ul li').unbind('click').bind('click', function () {
                    var $p_tr = $(this).parents('tr');
                    var $p_tr_id = $p_tr.attr('id');
                    var $li_class = $(this).attr('class');
                    var $to_id = $li_class.slice(3);
                    $('.child_' + $p_tr_id).each(function (index, elem) {
                        var con = $(this).children().clone(false);
                        $('.child_' + $to_id).eq(index).empty().append(con)
                            .show();
                        //使用自动匹配操作
                        auto_complate()
                    })
                    $('#' + $to_id).find('a').text('-点击收起');
                });
            })
        },
        //侧边栏单据筛选
        _choice_form: function () {
            var list = $('.staffing-list'),
                show = list.children('.form_show'),
                choice = $('.choice_form');
            //显示影藏下拉菜单
            list.hover(
                function () {
                    choice.stop().slideDown(300);
                    $(this).removeClass('arrow_top').addClass('arrow_bottom');
                },
                function () {
                    choice.stop().slideUp(100);
                    $(this).removeClass('arrow_bottom').addClass('arrow_top');
                }
            );
            //选择相应菜单
            $('.choice_form ').delegate('a', 'click', function () {
                var nodeid = $(this).attr('nodeid'),
                    text = $(this).text(),
                    trs = $('.staffingTab tbody tr');
                    form_name = $('.staffing-list .form_show');
                //修改标题值
                form_name.text(text);
                //显示影藏相关单据
                if (nodeid == '0') {
                    trs.show();
                } else {
                    trs.hide();
                    $('td[formid="' + nodeid + '"]').parents('tr').show();
                }
            });
        }
    }
    //设置元素高度
    function this_h() {
        var $parenr_h = $('body').height();
        var $m_h = $parenr_h - 31;
        var $innerForm_h = $m_h - 60;
        $('.starffingMain').height($m_h);
        $('.innerStaffingForm').height($innerForm_h);
        $('.staffing-inner-fillIn').height($m_h - 27)
    }
    //表格各行变色
    function changeColor() {
        var $fmsTabBody = $('.fms-table tbody');
        $fmsTabBody.find('tr:odd').css('background', '#FAFAFA');
        $fmsTabBody.find('tr:even').css('background', '#fff')
    }
    //确定取消按钮样式
    function sure_rest_btn() {
        $('.staffing-btn').hide();
        var $sf_tab = $('.staffingTab');
        $sf_tab.find('tr').each(function () {
            $(this).live('mouseover', function () {
                $(this).find('.staffing-btn').show();
            });
            $(this).live('mouseleave', function () {
                $(this).find('.staffing-btn').hide();
            });
        });
    }
    //指定金额，财务数字输入
    function f_decmal() {
        //引入财务数字
        var f = require('/Static/src/common/f_decmal');
        //详细
        var elem = '.finance_decmal';
        f.f_decmal(elem);
    }
    //添加一行
    function add_tr() {
        var trs = '<tr>' +
                '<td style="width:45%;"><input class="allEditTab-txtInput tree_business" readonly="true" type="text" value="请选择业务类型" /></td>' +
                '<td  style="width:45%;">' +
                    '<select class="fms-select staffingForm-select">' +
                     '<option>-- 请选择报销单 --</option>';
        //动态加载单据信息
        $.ajax({
            type: "post",
            url: $.url_prefix + '/Ashx/Common/FormHandler.ashx?method=GetEffectiveRequisition',
            async: false,
            dataType: "json",
            success: function (data) {
                if (data != null && data.error) {
                    errorMsg(data.msg)
                    return false;
                }
                for (var i = 0; i < data.length; i++) {
                    trs += '<option formid="' + data[i].FormID + '">' + data[i].FormName + '</option>';
                }
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
        trs += '</select></td>' +
                '<td class="tr_opera" style="width:10%;"><span class="staffing-sure staffing-btn"></span></td>' +
              '</tr>';
        return trs;
    }
    //创建报销单据成功后执行操作
    function createListSuccessed(that, lastBusiName) {
        var $b_name = $(that).parents('tr').find('.allEditTab-txtInput').val();
        var $d_name = $(that).parents('tr').find('.staffingForm-select').val();
        //删除文本框和下拉菜单
        $(that).parents('tr').addClass('slide_tr').find('.allEditTab-txtInput').remove().end()
            .find('.staffingForm-select').remove();
        //添加文本类容
        $(that).parents('tr').find('td').each(function (index, elem) {
            if (index == 0) {
                $(elem).attr('title', $b_name);
                $(elem).text(lastBusiName);
            }
            if (index == 1) {
                $(elem).text($d_name);
            }
        })
        $(that).removeClass().addClass('staffing-del staffing-btn');
        sure_rest_btn();
    }
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //创建侧边栏信息
    function createSidebar(data) {
        var slide_trs = '';
        for (var i = 0; i < data.length; i++) {
            slide_trs += '<tr id="' + data[i].SID + '" class="slide_tr">' +
                '<td style="width:40%;" title="' + data[i].FullBusName + '">' + data[i].BusName + '</td>' +
                '<td  style="width:40%;" formId="' + data[i].FormID + '">' + data[i].FormName + '</td><td style="width:10%;" class="tr_opera">';
            //判断是否出现添加一行按钮
            if (roleKeys != undefined && roleKeys.indexOf('StaffingHandler_DelFormBusiInfo') != -1) {
                slide_trs += '<span class="staffing-del staffing-btn"></span>'
            }
            slide_trs += '</td>' + '</tr>';
        }
        return slide_trs;
    }
    //删除侧边栏行
    function del_row_data(sid, that) {
        $.ajax({
            type: "post",
            url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=DelFormBusiInfo',
            data: {
                'SID': sid
            },
            async: false,
            dataType: "json",
            success: function (data) {
                if (data != null && data.error) {
                    errorMsg(data.msg)
                    return false;
                }
                //删除数据行
                that.parents('tr').remove();
                $('.sideHeadTable tbody').remove();
                $('.saveBtnWrapper').hide();
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    };
    //删除侧边栏行
    function del_row(sid, that) {
        var delForm = '<div class="agreeAgain" style="text-align:center;">' +
                    '<p style="margin-bottom:10px;">确定要删除这一行吗?删除之后将无法恢复。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="deterBtn" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="cancelBtn">取消</button>' +
                    '</div>';
        //倒计时弹出框
        var con = delForm;
        var id = '#deterBtn';
        cd_dialog(con, id);

        $('#deterBtn').click(function () {
            //删除对应行数据
            del_row_data(sid, that);
            art.dialog({ id: 'cd_dialog' }).close();
        });
        $('#cancelBtn').click(function () {
            art.dialog({ id: 'cd_dialog' }).close();
        });
    }
    //配置右侧信息
    function config(formId) {
        $.ajax({
            type: "post",
            url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=GetRolesSectionsByFormID',
            data: { 'formID': formId },
            async: false,
            dataType: "json",
            success: function (data) {
                //创建配置信息
                if (data != null && data.error) {
                    errorMsg(data.msg)
                    return false;
                }
                $('.sideHeadTable').append(create_config(data));
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }
    //创建配置信息
    function create_config(data) {
        var r_trs = '';
        for (var i = 0; i < data.Sections.length; i++) {
            r_trs += '<tr  id="tr_' + i + '" class="staffing_tr_h">' +
                    '<td colspan="2">' + data.Sections[i].name +
                        '<a href="#">+查看详情</a>' +
                        '<div class="copy_to_other">' +
                            '<span>复制到</span>' +
                            '<ul>';
            if (i == 0) {
                r_trs += '<li class="to_tr_1">付款阶段</li>' +
                        '<li class="to_tr_2">报销阶段</li>';
            }
            if (i == 1) {
                r_trs += '<li class="to_tr_0">申请阶段</li>' +
                          '<li class="to_tr_2">报销阶段</li>';
            }
            if (i == 2) {
                r_trs += '<li class="to_tr_0">申请阶段</li>' +
                        '<li class="to_tr_1">付款阶段</li>';
            }
            r_trs += '</ul>' +
                        '</div>' +
                    '</td>' +
                  '</tr>';
            for (var j = 0; j < data.Roles.length; j++) {
                r_trs += '<tr  sectionsID="' + data.Sections[i].id + '"  class="tr_hide child_tr_' + i + '">' +
                            '<th id="' + data.Roles[j].RID + '">' + data.Roles[j].RoleName + '</th>' +
                            '<td>' +
                                '<span>指定人：</span><input type="text" class="allEditTab-txtInput nominator" uid="" />' +
                                '<span class="ml20">决定金额：</span><input type="text" class="allEditTab-txtInput finance_decmal" value="" />' +
                            '</td>' +
                        '</tr>';
            }
        }
        return r_trs;
    }
    //加载配置信息
    function loading_right(sid) {
        $.ajax({
            type: "post",
            url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=GetStaffingItemInfoBySID',
            data: { 'sid': sid },
            async: false,
            dataType: "json",
            success: function (data) {
                //创建配置信息
                if (data != null && data.error) {
                    errorMsg(data.msg)
                    return false;
                }
                $('.sideHeadTable').append(loading_config(data));
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }
    //根据加载的数据绘制右侧信息
    function loading_config(data) {
        var r_trs = '';
        for (var i = 0; i < data.Sections.length; i++) {
            r_trs += '<tr  id="tr_' + i + '" class="staffing_tr_h">' +
                    '<td colspan="2">' + data.Sections[i].name +
                        '<a href="#">+查看详情</a>' +
                        '<div class="copy_to_other">' +
                            '<span>复制到</span>' +
                            '<ul>';
            if (i == 0) {
                r_trs += '<li class="to_tr_1">付款阶段</li>' +
                        '<li class="to_tr_2">报销阶段</li>';
            }
            if (i == 1) {
                r_trs += '<li class="to_tr_0">申请阶段</li>' +
                          '<li class="to_tr_2">报销阶段</li>';
            }
            if (i == 2) {
                r_trs += '<li class="to_tr_0">申请阶段</li>' +
                        '<li class="to_tr_1">付款阶段</li>';
            }
            r_trs += '</ul>' +
                        '</div>' +
                    '</td>' +
                  '</tr>';
            for (var j = 0; j < data.Items.length; j++) {
                if (data.Items[j].Section == i + 1) {
                    r_trs += '<tr sectionsID="' + data.Sections[i].id + '" class="tr_hide child_tr_' + i + '">' +
                                '<th id="' + data.Items[j].RID + '">' + data.Items[j].RoleName + '</th>' +
                                 '<td>' +
                                '<span>指定人：</span><input type="text" class="allEditTab-txtInput nominator" val_name="' + data.Items[j].TrueName + '(' + data.Items[j].UserName + ')' + '" value="' + data.Items[j].TrueName + '(' + data.Items[j].UserName + ')' + '" uid="' + data.Items[j].UID + '"/>' +
                                '<span class="ml20">决定金额：</span><input type="text" class="allEditTab-txtInput finance_decmal" value="' + data.Items[j].Limit + '" />' +
                            '</td>' +
                            '</tr>';
                }
            }
        }
        return r_trs;
    }
    //自动匹配
    function auto_complate() {
        var elem = $('.nominator');
        var url = $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=SearchUsers';
        auto.init(elem, url);
    }
    //保存配置信息
    function save_info(sid) {
        $('#starffingSaveBtn').die('click').live('click', function () {
            //表单验证
            function onSubmit() {
                //获取右侧所有输入框
                var $input = $('.sideHeadTable tr :input');
                //需要验证的元素的个数
                var len = $input.length;
                //num用以统计为填写内容表单在所有元素中的顺序
                var num = 0;
                var msg = '请完善表单';
                $input.each(function (index, elem) {
                    if ($(this).val() == '') {
                        //弹出错误信息
                        errorMsg(msg);
                        //第一个错误元素获取焦点
                        $(this).focus();
                        art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
                        //获取顺序数
                        num = index;
                        return false;
                    }
                    num = index + 1;
                });
                if (num == len) {
                    return true;
                } else {
                    return false;
                }
            }
            if (!onSubmit()) {
                return false;
            }
            //创建JSON数组
            var parent = $('.sideHeadTable');
            var trs = parent.find('tr.tr_hide');
            var len = parent.find('tr').length;
            var th = parent.find('th');
            var nom = parent.find('.nominator');
            var fd_val = trs.find('.finance_decmal');
            var dataJson = [
            ];
            $(trs).each(function (index, el) {
                var data_row = {};
                data_row.SID = sid;
                data_row.RID = th.eq(index).attr('id');
                data_row.UID = nom.eq(index).attr('uid');
                data_row.Limit = no_comma(fd_val.eq(index).val());
                data_row.Section = trs.eq(index).attr('sectionsID');
                dataJson.push(jsonToString(data_row));
            });
            var dataJsonStr = "[" + dataJson.join() + "]";
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
            $.ajax({
                type: "post",
                url: $.url_prefix+'/Ashx/StaffingHandler.ashx?method=SetStaffingItemInfo',
                data: { "staffing": dataJsonStr },
                async: false,
                dataType: "json",
                success: function (data) {
                    //创建配置信息
                    if (data != null && data.error) {
                        errorMsg(data.msg)
                        return false;
                    }
                    art.dialog({
                        id: 'successMsg',
                        drag: false,
                        content: '保存成功',
                        title: '保存成功提示',
                        lock: true
                    });
                    art.dialog({ id: 'successMsg' }).title('3秒后关闭').time(3);
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        });
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
    //添加高亮效果
    function add_selected(that) {
        $(that).addClass('tr_selected')
            .siblings().removeClass('tr_selected');
    }
    //倒计时弹出框
    function cd_dialog(con, id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }

    module.exports = staffing;
})