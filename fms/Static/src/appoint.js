define(function (require, exports, module) {
    return function (jquery) {
        require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')(jquery);
        require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
        require('/Static/src/plugin/stree/jquery.stree.part')(jquery);
        require('/Static/src/plugin/stree/css/stree.css');
        require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')(jquery);
        require('/Static/src/plugin/jScrollPane/jquery.mousewheel')(jquery);
        require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
        var common = require('/Static/src/common');
        (function ($) {
            $.fn.appoint = function () {
                var num = 0;//新增详细委托数
                var djson = [];//已有详细委托数据
                var flag = false;//委托类型,ture为全部委托,false为详细委托
                var oldFlag = false;//第一次加载时委托类型
                var dflag = false;//已有详细委托是否进行过删除
                var sflag = false;//已有委托状态,ture为生效,false为不生效
                var oldUid;//已有全部委托对象id；
                var $appTab = $("#appTab");
                var $appInfoTab = $("#appInfoTab");
                var $appStatus = $("#appStatus");
                var $appStatusDes = $("#appStatusDes");
                var $appTabWrap = $("#appTabWrap");
                var $appWrapAll = $("#app-wrap-a");
                //调整高宽事件
                function adjustwh() {
                    var W = $("body").outerWidth(true);
                    var H = $("body").outerHeight(true);
                    $("#appTab").width(W-2).height(H - 212);
                    $("#appInfoTab").width(W-2).height(H - 75);
                }
                //1,调整宽度高度
                adjustwh && adjustwh();
                //获取委托状态ajax请求
                function getStatusAjax() {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/appointHandler.ashx?method=GetStatusByUID",
                        cache: false,
                        async: false,
                        dataType: 'json',
                        type: "POST",
                        success: function (data) {
                            sflag = data.Status;
                            if (sflag) {
                                $("#appStatus").text("生效");
                                if (data.TypeID == 1) {
                                    $("#appStatusDes").text("所有业务委托");
                                } else if(data.TypeID == 2){
                                    $("#appStatusDes").text("详细业务委托");
                                };
                            } else {
                                $("#appStatus").text("未生效");
                            }
                            if (data.TypeID == 1) {
                                $("#app_All").attr("checked", true);
                                $("#appTabWrap").hide();
                                flag = true;
                                oldFlag = true;
                            } else if (data.TypeID == 2) {
                                $("#app_Detail").attr("checked", true);
                                $("#app-wrap-a").hide();
                                flag = false;
                                oldFlag = false;
                            }
                            $("#app_Person_A").val(data.ForUName).attr("uid", data.UID).attr("val_name",data.ForUName);
                                oldUid = data.UID;
                            $("#loadCon").remove();
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });                    
                }
                //2,页面打开首次显示委托状态
                getStatusAjax && getStatusAjax();
                //3,引入申请人插件
                var auto = require('/Static/src/plugin/autocomplate/autocomplate');
                require('/Static/src/plugin/autocomplate/autocomplate.css');
                var url = $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=SearchUsers';
                var elem = $("#app_Person_A");
                auto.init(elem, url);
                //4,切换至委托设置
                $("#set").bind("click",function(){
                    $(this).addClass("fms-tab-item-current");
                    $("#all").removeClass("fms-tab-item-current");
                    $("#appAll").hide();
                    $("#appSet").show();
                });
                //获取全部委托列表ajax请求
                function getAllListAjax(backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/AppointHandler.ashx?method=GetInfoAppiont",
                        cache: false,
                        async: false,
                        dataType: 'json',
                        type: "POST",
                        success: function (data) {
                            backFn && backFn(data);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });
                }
                //显示全部委托列表事件
                function showAllList() {
                    getAllListAjax && getAllListAjax(function (data) {
                        $("#appInfoTable tbody").empty();
                        if (data.length > 0) {
                            $(data).each(function (index, el) {
                                var DB = '<tr>';
                                DB += '<td class="pw30">' + el.UserName + '</td><td title="'+el.BusiName+'">' + el.BusiName + '</td><td class="pw20">' +el.ForUserName + '</td>';
                                DB += '</tr>';
                                $("#appInfoTable tbody").append(DB);
                            });
                            //隔行变色及鼠标换色
                            $(".fms-table tr:even").addClass("odd");
                            $(".fms-table tr").bind({
                                mouseenter: function () {
                                    $(this).addClass("over");
                                },
                                mouseleave: function () {
                                    $(this).removeClass("over");
                                }
                            });
                            infoApi.reinitialise();
                        }
                    });
                }
                //5，切换至全部委托信息
                $("#all").bind("click",function(){
                    $(this).addClass("fms-tab-item-current");
                    $("#set").removeClass("fms-tab-item-current");
                    $("#appSet").hide();
                    $("#appAll").show();
                    showAllList&&showAllList();
                    infoApi.reinitialise();

                });
                //获取委托列表ajax请求
                function getListAjax(backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/AppointHandler.ashx?method=GetListByUid",
                        cache: false,
                        async: false,
                        dataType: 'json',
                        type: "POST",
                        success: function (data) {
                            backFn && backFn(data);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });
                }
                //显示委托列表事件
                function showList() {
                    getListAjax && getListAjax(function (data) {
                        $("#appTable tbody").empty();
                        if (data.length > 0) {
                            $(data).each(function (index, el) {
                                djson[index] = {};
                                djson[index].bussid = el.BusiID;
                                djson[index].uid = el.ForUID;
                                djson[index].typeid = 2;
                                var DB = '<tr>';
                                DB += '<td title="'+el.BusiName+'">' + el.BusiName + '</td><td class="pw30">' + el.ForUName + '</td><td class="pw20"><button aid="' + el.AID + '" class="redBtn h22 w45 delete">删除</button></td>';
                                DB += '</tr>';
                                $("#appTable tbody").append(DB);
                            });
                            //隔行变色及鼠标换色
                            $(".fms-table tr:even").addClass("odd");
                            $(".fms-table tr").bind({
                                mouseenter: function () {
                                    $(this).addClass("over");
                                },
                                mouseleave: function () {
                                    $(this).removeClass("over");
                                }
                            });
                        }
                    });
                }
                //6,显示委托列表
                showList && showList();
                //7,增加一行
                $("#addBtn").bind("click",function(){
                    var DB = '<tr>';
                    DB += '<td><input name="app_Bus" type="text" class="app_Bus form-text form-normal w150" readonly /></td><td class="pw30"><input name="app_Person_D" type="text" class="app_Person_D form-text form-normal w150"/></td><td class="pw20"><button class="redBtn h22 w45 delete2">删除</button></td>';
                    DB += '</tr>';
                    $("#appTable tbody").append(DB);
                    var elem2 = $(".app_Person_D");
                    auto.init(elem2, url);
                    num = num + 1;
                    api.reinitialise();
                });
                //8,业务选择
                $(".app_Bus").partTree({
                    ajaxUrl: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=GetListUsing",
                    sign: "bus",
                    elem: "#busBox"
                });
                //删除委托ajax请求
                function AppDelAjax(aid, backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/AppointHandler.ashx?method=Delete",
                        cache: false,
                        async: false,
                        dataType: 'json',
                        type: "POST",
                        data: { "id": aid },
                        success: function (data) {
                            backFn && backFn(data);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });
                }                
                //9,点击删除未保存委托事件
                $(".delete2").live("click",function(){
                    $(this).parent().parent().remove();
                    num = num - 1;
                    api.reinitialise();
                });
                //10,点击删除已保存委托事件
                $(".delete").live("click", function () {
                    var $curEL = $(this);
                    var curdex = $('.delete').index(this);
                    common.tips_warning("确定删除这一行么？", function () {
                        $curEL.parent().parent().remove();                       
                        djson.splice(curdex,1);  
                        dflag = true;
                        api.reinitialise();
                    });
                });
                function jsonStr(json){
                    var jsonstr ="[";
                    for(var i=0;i<json.length;i++){
                        jsonstr+="{\"uid\":"+json[i].uid+",\"bussid\":"+json[i].bussid+",\"typeid\":"+json[i].typeid+",\"status\":"+json[i].status+"},";
                    }
                    if(json.length>0){
                        jsonstr=jsonstr.substring(0,jsonstr.length-1);   
                    }                    
                    jsonstr+="]";
                    return jsonstr;
                }
                //保存委托数据的ajax请求
                function saveAppAjax(json, backFn) {
                    var jsonstr = jsonStr(json);
                    $.ajax({
                        url: $.url_prefix+"/Ashx/AppointHandler.ashx?method=Add",
                        cache: false,
                        async: false,
                        dataType: 'json',
                        type: "POST",
                        data: { "json": jsonstr },
                        success: function (data) {
                            backFn && backFn(data);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });
                }
                //保存委托数据ajax请求后的操作
                function saveAppBack(json){
                    saveAppAjax && saveAppAjax(json, function (data) {
                        if (!data.error) {
                            common.tips_succeed("保存成功！", function () { window.location.reload(); });
                        } else {
                            common.tips_error(data.msg);
                        }
                    });
                }
                //保存委托数据事件
                function saveApp(status){
                    var ajson = [];
                    var njson = [];
                    var pl = 0;
                    var bl = 0;
                    if (flag) {//全部业务委托
                        if ($("#app_Person_A").val() == "") {
                            common.tips_error("请选择委托对象！");
                        } else {
                            ajson[0] = {};
                            ajson[0].uid = parseInt($("#app_Person_A").attr("uid"));
                            ajson[0].bussid = 0;
                            ajson[0].typeid = 1;
                            ajson[0].status = status;
                            if((status != sflag) || (oldUid!=ajson[0].uid) || (oldFlag == false)){//当状态相同(false)且已有数据没有变(false)且原有保存类型为true时不会执行此函数
                                saveAppBack&&saveAppBack(ajson);
                            }
                        }                        
                    }else{
                        if(num>0){
                            for (var i = 0; i < num; i++) {
                                if ($(".app_Person_D").eq(i).val() == "") {
                                    pl = pl + 1;
                                }
                                if ($(".app_Bus").eq(i).val() == "") {
                                    bl = bl + 1;
                                }
                            }
                            if (bl > 0) {
                                common.tips_error("请选择业务！(也可选择删除未填选项)");
                            } else {
                                if (pl > 0) {
                                    common.tips_error("请选择委托对象！(也可选择删除未填选项)");
                                } else {
                                    for (var i = 0; i < num; i++) {
                                        ajson[i] = {};
                                        ajson[i].bussid = parseInt($(".app_Bus").eq(i).attr("nodeid"));
                                        ajson[i].uid = parseInt($(".app_Person_D").eq(i).attr("uid"));
                                        ajson[i].typeid = 2;
                                        ajson[i].status = status;
                                    }
                                    njson = ajson.concat(djson);
                                    for (var i = 0; i < njson.length; i++) {
                                        njson[i].status = status;
                                    }
                                    saveAppBack&&saveAppBack(njson);
                                }
                            } 
                        }else{
                            if((status != sflag) || (dflag) || (oldFlag == true)){//当状态相同(false)且已有数据没有变(false)且原有保存类型为false时不会执行此函数
                                for (var i = 0; i < djson.length; i++) {
                                    djson[i].status = status;                                    
                                }
                                saveAppBack&&saveAppBack(djson);
                            }
                        }                              
                    };
                }
                //11,点击保存事件
                $("#saveBtn").bind("click", function () {
                    saveApp&&saveApp(true);
                });
                $("#effectBtn").bind("click", function () {
                    saveApp&&saveApp(false);
                });
                //显示委托全部
                function show1() {
                    $("#appTabWrap").fadeOut(300, function () {
                        $("#app-wrap-a").fadeIn(300);
                    });
                }
                //显示委托详细
                function show2() {
                    $("#app-wrap-a").fadeOut(300, function () {
                        $("#appTabWrap").fadeIn(300);
                    });
                }
                //12,点击单选按钮切换相应内容
                var $appType = $(".app-type");
                $appType.bind("click", function () {
                    var appVal = $(this).val();
                    if (appVal == 1) {
                        show1 && show1();                       
                        flag = true;
                    } else if (appVal == 2) {
                        show2 && show2();                        
                        flag = false;
                    }
                });
                //13,调整滚动条
                var pane = $('#appTab');
                var infoPane = $('#appInfoTab');
                pane.jScrollPane({}); 
                infoPane.jScrollPane({});              
                var api = pane.data('jsp'); 
                var infoApi = infoPane.data('jsp');
                //14,窗口改变事件
                $(window).resize(function () {
                    adjustwh();
                    api.reinitialise();
                    if($("#appAll").css("display")!="none"){
                       infoApi.reinitialise(); 
                    }
                    
                });
            }
        })(jquery);
    }
});