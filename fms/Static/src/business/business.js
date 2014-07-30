define(function (require, exports, module) {
	return function(jquery){
		var common = require('/Static/src/common');
		require('/Static/src/plugin/stree/jquery.stree.core')(jquery);
		require('/Static/src/plugin/stree/css/stree.css');
		require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')(jquery);
		require('/Static/src/plugin/jScrollPane/jquery.mousewheel')(jquery);
		require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
		(function($){
			$.fn.business = function(config){
                var defaults = {Url:"Main.aspx"};
                $.extend(defaults,config);
				//获取权限事件
				function getRights(){
   					 var roleKeys = $('#roleKeys').val();
					 var rights = {};
    				//判断是否出现添加一行按钮
    				if (roleKeys != undefined) {
						if(roleKeys.indexOf('BusinessHandler_Add') >= 0){
							rights.ifAdd = true;
						}else{
							rights.ifAdd = false;
						}
						if(roleKeys.indexOf('BusinessHandler_Edit') >= 0){
							rights.Edit = true;
						}else{
							rights.Edit = false;
						}
						if(roleKeys.indexOf('BusinessHandler_Delete') >= 0){
							rights.Delete = true;
						}else{
							rights.Delete = false;
						}
						if(roleKeys.indexOf('BusinessHandler_Transfer') >= 0){
							rights.Transfer = true;
						}else{
							rights.Transfer = false;
						}
    				}
					return 	rights;
				}
				//0,获取权限
				var rights = getRights();
				//调整高宽事件
				function adjustWH() {
                    var W = $("body").outerWidth(true);
					var H = $("body").outerHeight(true);
					$(".sub-tree").height(H);
					$(".stree-wrap").height(H-26);
					$("#busFrameWrap").width(W - 280 - 10).height(H); 
                }
				//1,调整宽度高度
				adjustWH&&adjustWH();				
				//2,引入业务树
				$('#busMainTree').stree({
                    data: {
                        ajaxUrl: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=GetListALL"
                    },
                    view: {
                        ulId: "busMainTree",
                        tips: "bus",
                        til: "业务",
                        stretch:false
                    },
                    operate: {
                        isAdd: rights.ifAdd,
                        isEdit: rights.Edit,
                        isRemove: rights.Delete,
                        isTransfer: rights.Transfer,
                        addNode: addNode,
                        editNode: editNode,
                        removeNode: removeNode,
                        transferNode: transferNode,
						callBack:callBack
                    }
                });
				//调整树宽度事件
				function adjustTree(elem) {
					var elemWidth = $(elem).width();
					var maxWidth = 0;
                    $(elem).find(".node-text:visible").each(function (i,el) {
						var $curA = $(el).parent();
						var $curDIV = $(el).parent().parent();
                        var w = $(el).width();
                        var aW = $curA.width();
						var surLevel = $(el).attr("hie");
                        if (((w + 24) - aW) > 0) {
							maxWidth = w + 24 + 106 + surLevel*18;//w为文本宽度，24为按钮的宽度，106为div的左右padding和,18为ul的左padding，level为层级
							if((maxWidth-elemWidth)>0){
								elemWidth = maxWidth;	
							}							
                        }
                    });
					$(elem).width(elemWidth);
                }
				//3,调整树的宽度			
				//4,调整滚动条
				var buspane = $('#busTreeWrap');
				buspane.jScrollPane({});
				var busapi = buspane.data('jsp');
				//5,窗口改变事件
				$(window).resize(function(){   
					adjustWH();
					busapi.reinitialise(); 
				});
                //6,添加节点
                function addNode(cOrder, view, tree, callBack) {
                    var co = cOrder;
                    var childLevel;
                    if (co == -1) {
                        childLevel = 1;
                    } else {
                        childLevel = tree[co].level + 1;
                    }
                    var subForm = creatForm(view);
                    var addNodeFrame = art.dialog({
                        title:"添加"+(co== -1?"根":"子")+view.til,
                        content: subForm,
                        lock: true,
                        init: function () {
                            validatorForm(childLevel);
                        }
                    });
                    $("#deter").bind("click", function () {
                        if ($.validator.control.fromAply("nodeForm")) {
                            //表单验证通过 
                            //建立新对象，将pid、name、level、desc、isopen依次加入	
                            var opt = {};
                            if (co == -1) {
                                opt.pid = '0';  
                            } else {
                                opt.pid = tree[co].id; 
                            }
                            opt.name = $('#node_Name').val();
                            opt.level = childLevel;
                            opt.desc = $('#node_Des').val();
                            addNodeAjax && addNodeAjax(opt, function (a) {
                                if (!(a.error)) {
                                    addNodeFrame.close();
                                    callBack && callBack();
                                } else {
                                    common.tips_error(a.msg);
                                }
                            });
                        }

                    });
                    $("#cancel").bind("click", function () {
                        addNodeFrame.close();
                    });
                }
                //7,编辑节点
                function editNode(cOrder, view, tree, callBack) {
                    var co = cOrder;
                    var curLevel = tree[co].level;
                    var subForm = creatForm(view);
                    var editNodeFrame = art.dialog({
                        title: "修改" + view.til,
                        content: subForm,
                        lock: true,
                        init: function () {
                            validatorForm(curLevel);
                            $('#node_Name').val(tree[co].name);
                            $('#node_Des').val(tree[co].desc);
                        }
                    });
                    $("#deter").bind("click", function () {
                        if ($.validator.control.fromAply("nodeForm")) {
                            //表单验证通过 
                            //建立新对象，将id、pid、name、level、desc、isopen依次加入
                            var opt = {};
                            opt.id = tree[co].id;
                            opt.name = $('#node_Name').val();
                            opt.level = curLevel;
                            opt.pid = tree[co].pid;
                            opt.desc = $('#node_Des').val();
                            if (tree[co].hasOwnProperty("isopen")) {
                                opt.isopen = tree[co].isopen;
                            }
                            editNodeAjax && editNodeAjax(opt, function (e) {
                                if (!(e.error)) {
                                    editNodeFrame.close();
                                    callBack && callBack(opt);
                                } else {
                                    common.tips_error(e.msg);
                                }
                            });
                        }
                    });
                    $("#cancel").bind("click", function () {
                        editNodeFrame.close();
                    });
                }
                //8,删除节点
                function removeNode(cOrder, cSibNum, view, tree, callBack) {
                    var co = cOrder;
                    var cs = cSibNum;
                    if (cs == 1) {
                        var tipsFrame = art.dialog({
                            title: '提示',
                            content: '<span class="fb">' + tree[co].name + ' </span>含有子' + view.til + '，不能删除！',
                            lock: true
                        });
                        return false;
                    }
                    var removeNodeFrame = art.dialog({
                        title: '删除业务!',
                        content: '<div class="removeWrap">确认要删除 <span class="fb">' + tree[co].name + '</span> 吗？<p class="buttonwrap"><button id="deter" class="blueBtn h22 w45 mr15">确定</button><button id="cancel" class="redBtn h22 w45">取消</button></p></div>',
                        lock: true
                    });
                    $("#deter").bind("click", function () {
                        var delId = tree[co].id;
                        delNodeAjax && delNodeAjax(delId, function (d) {
                            if (!(d.error)) {
                                callBack && callBack();
                            } else {
                                common.tips_error(d.msg);
                            }
                            removeNodeFrame.close();
                        });
                    });
                    $("#cancel").bind("click", function () {
                        removeNodeFrame.close();
                    });
                }
                //9,移交节点
                function transferNode(cOrder, view, tree, hideLi, callBack) {
                    var co = cOrder;
                    var tOrder;
                    var partentid = -1;
                    var pLevel = 0;
                    var sLevel = 0;
                    var checkbox = '<input class="checknode" type="checkbox" />';
                    var transferTree = creatList(view);
                    var transferNodeFrame = art.dialog({
                        title: "移交" + view.til,
                        content: transferTree,
                        lock: true,
                        init: function () {
                            adjustList(co, view, tree, hideLi, checkbox);
                        }
                    });
                    $(".checknode").bind("click", function () {
                        $('.checknode').attr('checked', false);
                        $(this).attr('checked', true);
                        tOrder = $(this).parent().parent().attr("order");
                        if (tOrder == "-1") {
                            partentid = 0;
                            pLevel = 0;
                            sLevel = 1;
                        } else {
                            partentid = tree[tOrder].id;
                            pLevel = tree[tOrder].level;
                            sLevel = pLevel + 1;

                        }
                    });
                    $("#deter").bind("click", function () {
                        if (partentid == -1) {
                            common.tips_error("请选择要指定的父节点");
                            return false;
                        } else {
                            var opt = {};
                            opt.id = tree[co].id
                            opt.pid = partentid;
                            opt.level = sLevel;
                            if (tree[co].hasOwnProperty("isopen")) {
                                opt.isopen = tree[co].isopen;
                            }
                            //获取选中部分的所有子节点
                            var childArr = '[';
                            var orderArr = [];
                            var pidLevel = tree[co].level;
                            $("#" + hideLi).find("p").not(":eq(0)").each(function () {
                                var io = $(this).attr("order");
                                var tLevel = tree[io].level - pidLevel + sLevel;
                                childArr += '{"id":' + tree[io].id + ',"level":' + tLevel + '},';    
                                orderArr.push({ order: io, level: tLevel });
                            });
                            if (childArr.length > 1)
                                childArr = childArr.substring(0, childArr.length - 1);
                            childArr += ']';
                            transferNodeAjax && transferNodeAjax(opt, childArr, function (t) {
                                if (!(t.error)) {
                                    transferNodeFrame.close();
                                    callBack && callBack(tOrder);
                                } else {
                                    common.tips_error(t.msg);
                                }
                            });
                        }
                    });
                    $("#cancel").bind("click", function () {
                        transferNodeFrame.close();
                    });
                }
                //添加trees时的ajax请求
                function addNodeAjax(opt, backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=Add",
                        dataType: "json",
                        type: "POST",
                        data: { "name": opt.name, "level": opt.level, "pid": opt.pid, "tid": 1, "desc": opt.desc},
                        success: function (a) {
                            backFn && backFn(a);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    })
                }
                //编辑trees时的ajax请求
                function editNodeAjax(opt, backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=Edit",
                        dataType: "json",
                        type: "POST",
                        data: { "id": opt.id, "name": opt.name, "level": opt.level, "pid": opt.pid, "tid": 1, "desc": opt.desc },
                        success: function (e) {
                            backFn && backFn(e);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });
                }
                //删除trees时的ajax请求
                function delNodeAjax(delId, backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=Delete",
                        dataType: "json",
                        type: "POST",
                        data: { "id": delId },
                        success: function (d) {
                            backFn && backFn(d);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    })
                }
                //移交trees时的ajax请求
                function transferNodeAjax(opt, childArr, backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/BusinessHandler.ashx?method=Transfer", 
                        dataType: "json",
                        type:"POST",
                        data: { "id": opt.id, "pid": opt.pid, "level": opt.level, "childarr": childArr=='[]' ? '' : childArr },
                        success: function (t) {
                            backFn && backFn(t);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    })
                }
                //创建移交列表
                function creatList(view) {
                    var copyTree = $("#" + view.ulId).html();
                    var transferTree = '<div class="transferWrap clearfix">';
                    transferTree += '<ul id="transferTree" class="stree clearfix">' + copyTree + '</ul>';
                    transferTree += '<div class="buttonwrap tc"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
                    transferTree += '</div>';
                    //添加选择框
                    return transferTree;
                }
                //调整列表
                function adjustList(co, view, tree, hideLi, checkbox) {
                    //去除被选中部分
                    $("#" + hideLi).hide();
                    //去除废用部分
                    $("#transferTree li a.inherit").parent().parent().remove();
                    $("#transferTree").find("ul").hide();
                    $("#transferTree").find(".switch_open").removeClass("switch_open").addClass("switch_close");
                    //添加选择框
                    $("#transferTree li div a").prepend(checkbox);
                    //父节点禁掉
                    $("#a_" + view.tips + "_" + tree[co].pid).children("input").attr("disabled", "disabled");
                    if ($("#ul_" + view.tips + "_" + tree[co].pid).children().length == 1) {
                        $("#switch_" + view.tips + "_" + tree[co].pid).removeClass("switch_open");
                    }
					$("#transferTree").find("ul").each(function(i,el){
						if($(el).children().length <= 0){
							$(el).siblings("div").children(".switch").removeClass("switch_close").removeClass("switch_open");	
						}	
					});
                    //对于非根目录节点可选择添加到根目录
                    if (tree[co].level != 1) {
                        var addCheck = '<div class="croot" order="-1"><a>' + checkbox + '<span class="button icon"></span><span class="node-text">移交到根目录</span></a></div>';
                        $(".transferWrap").prepend(addCheck);
                    }
                    $("#transferTree li div").removeClass("entered").bind("mouseenter mouseleave", function () {
                        $(this).toggleClass("entered");
                    });
                    $("#transferTree .switch").bind("click", function () {
                        var $switchUL = $(this).parent().siblings("ul");
                        var ci = $(this).siblings("p").eq(0).attr("order");
                        if ($switchUL.css("display") != "none") {
                            $(this).removeClass("switch_open").addClass("switch_close");
                            $switchUL.slideUp(100);
                        } else {
                            $(this).find(".ico").addClass("on");
                            $(this).removeClass("switch_close").addClass("switch_open");
                            $switchUL.slideDown(100);
                        }
                    });
                }
                //创建表单
                function creatForm(view) {
                    var subForm = '<div class="formwrap" style="width:520px;height:158px;overflow:hidden;">';
                    subForm += '<form id="nodeForm" method="post" name="" action="" class="fms-form"><fieldset>';
                    subForm += '<div class="fms-form-item pt10"><div class="fl"><label for="node_Name" class="fms-label w100"><span class="fms-form-required">*</span>' + view.til + '名称：</label><input id="node_Name" name="node_Name" type="text" class="form-text form-normal w150" /></div><span class="validate node_Name_tip"></span></div>';
                    subForm += '<div class="fms-form-item"><div class="fl"><label for="node_Des" class="fms-label w100">' + view.til + '说明：</label><textarea id="node_Des" name="node_Des" maxlength="64" rows="3" class="form-textarea form-normal w250"></textarea></div><span class="validate node_Des_tip"></span></div>';
                    subForm += '</fieldset></form>';
                    subForm += '<div class="buttonWrap"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
                    subForm += '</div>';
                    return subForm;
                }
                //表单验证
                function validatorForm() {
                    $.validator.ruleList["nodeForm"] = {};
                    $.validator.formConfig({ formID: "nodeForm" });
                    $("#nodeForm").validator({
                        node_Name: {
                            tip: { tipShow: true, msg: "不能超过16个字符！" },
                            rules: { nosymbol: true, maxLen: 16, minLen: 2 },
                            msg: { nosymbol: "不能输入特殊字符哦！", maxLen: "最大16个字符！", minLen: "不能小于2个字符！" }
                        },
                        node_Des: {
                            required: false,
                            tip: { tipShow: true, msg: "不能超过64个字符！" },
                            rules: { maxLen: 64 },
                            msg: { maxLen: "最大64个字符！" }
                        }
                    });
                }
				//10,点击显示对应子页面
                $("#busMainTree a").live("click", function () {
                    $("#busMainTree li div.selected").removeClass("selected");
                    $(this).parent().addClass("selected");
                    var nid = $(this).attr("nodeid");
                    var loadsrc = defaults.Url+"?&period=0&operateid=0&bid=" + nid;
                    common.LoadIFrame2("busFrame", loadsrc);
                });
				//回调函数
				function callBack(elem){					
					busapi.reinitialise();				
				}
			}						
		})(jquery);					
	}	
});