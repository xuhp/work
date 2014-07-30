define(function (require, exports, module) {
	return function(jquery){
		var common = require('/Static/src/common');
		require('/Static/src/plugin/stree/jquery.stree.core')(jquery);
		require('/Static/src/plugin/stree/css/stree.css');
		require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')(jquery);
		require('/Static/src/plugin/jScrollPane/jquery.mousewheel')(jquery);
		require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
		(function($){
			$.fn.subject = function(){
				//0,获取权限
				function getRights(){
   					 var roleKeys = $('#roleKeys').val();
					 var rights = {};
    				//判断是否出现添加一行按钮
    				if (roleKeys != undefined) {
						if(roleKeys.indexOf('SubjectHandler_Add') >= 0){
							rights.ifAdd = true;
						}else{
							rights.ifAdd = false;
						}
						if(roleKeys.indexOf('SubjectHandler_Edit') >= 0){
							rights.Edit = true;
						}else{
							rights.Edit = false;
						}
						if(roleKeys.indexOf('SubjectHandler_Delete') >= 0){
							rights.Delete = true;
						}else{
							rights.Delete = false;
						}
    				}
					return 	rights;
				}
				var rights = getRights();
				//1,引入科目树
				$('#outerTree').stree({
                    data: {
                        ajaxUrl: $.url_prefix+"/Ashx/SubjectHandler.ashx?method=GetListByTypeID",
                        stId: "1"
                    },
                    view: {
                        ulId: "outerTree",
                        tips: "outer",
                        til: "对外科目",
                        stretch:true
                    },
                    operate: {
                        isAdd: rights.ifAdd,
                        isEdit: rights.Edit,
                        isRemove: rights.Delete,
                        isTransfer: false,
                        addNode: addNode,
                        editNode: editNode,
                        removeNode: removeNode,
						callBack:callBack
                    }
                });
				$('#innerTree').stree({
                    data: {
                        ajaxUrl: $.url_prefix+"/Ashx/SubjectHandler.ashx?method=GetListByTypeID",
                        stId: "0"
                    },
                    view: {
                        ulId: "innerTree",
                        tips: "inner",
                        til: "对内科目",
                        stretch:true
                    },
                    operate: {
                        isAdd: rights.ifAdd,
                        isEdit: rights.Edit,
                        isRemove: rights.Delete,
                        isTransfer: false,
                        addNode: addNode,
                        editNode: editNode,
                        removeNode: removeNode,
						callBack:callBack
                    }
                });
				//调整宽度高度事件
                function adjustWH() {
                    var W = $("body").outerWidth(true);
					var H = $("body").outerHeight(true);
                    var divW = Math.floor((W-10) * 0.5);
					$(".sub-tree").width(divW).height(H);
					$(".stree").width(divW-20);
					$(".stree-wrap").width(divW).height(H-26);
                }
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
                        if (((w + 24) - aW) > 0) {//w为文本宽度，24为按钮的宽度，106为div的左右padding和,18为ul的左padding，level为层级
							maxWidth = w + 24 + 106 + surLevel*18;
							if((maxWidth-elemWidth)>0){
								elemWidth = maxWidth;	
							}							
                        }
                    });
					$(elem).width(elemWidth)
                }
				//2,调整宽度高度
				adjustWH&&adjustWH();
				//3,调整树的宽度			
				//4,调整滚动条
				var outerpane = $('#outerTreeWrap');
				var innerpane = $('#innerTreeWrap');
				outerpane.jScrollPane({});
				innerpane.jScrollPane({});
				var outerapi = outerpane.data('jsp');
				var innerapi = innerpane.data('jsp');
				$(window).resize(function(){   
					adjustWH(); 
					outerapi.reinitialise();
					innerapi.reinitialise(); 
				});
                //3,添加节点
                function addNode(cOrder, view, tree, callBack) {
                    var co = cOrder;
                    var childpid;
                    var childLevel;
                    if (co == -1) {
                        childLevel = 1;
                        childpid = 0;
                    } else {
                        childLevel = tree[co].level + 1;
                        childpid = tree[co].id;
                    }
                    var subForm = creatForm(view);
                    var addNodeFrame = art.dialog({
                        title: "添加" + (co == -1 ? "根" : "子") + view.til,
                        content: subForm,
                        lock: true,
                        init: function () {
							var stid = view.tips == 'inner' ? 0 : (view.tips == 'outer' ? 1 : -1);
                            validatorForm(childpid,stid,0);
                        }
                    });
                    $("#deter").bind("click", function () {
                        if ($.validator.control.fromAply("nodeForm")) {
                            //此处验证表单必填项，错误 return false
                            //表单验证		
                            //表单验证通过 
                            //建立新对象，将pid、name、level、desc、isopen依次加入	
                            var opt = {};
                            if (co == -1) {
                                opt.pid = '0';
                            } else {
                                opt.pid = tree[co].id;
                            }
                            opt.name = $('#node_Name').val();
                            opt.code = $('#node_Code').val();
                            opt.level = childLevel;
                            opt.stid = view.tips == 'inner' ? 0 : (view.tips == 'outer' ? 1 : -1);
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
                //4,编辑节点
                function editNode(cOrder, view, tree, callBack) {
                    var co = cOrder;
                    var curLevel = tree[co].level;
                    var curpid = tree[co].pid;
					var subid = tree[co].id;
                    var subForm = creatForm(view);
                    var editNodeFrame = art.dialog({
                        title: "修改" + view.til,
                        content: subForm,
                        lock: true,
                        init: function () {
							var stid = view.tips == 'inner' ? 0 : (view.tips == 'outer' ? 1 : -1);
                            validatorForm(curpid,stid,subid);
                        }
                    });
                    $('#node_Name').val(tree[co].name);
                    $('#node_Code').val(tree[co].code);
                    $('#node_Des').val(tree[co].desc);
                    $("#deter").bind("click", function () {
						if ($.validator.control.fromAply("nodeForm")) {
							//此处验证表单必填项，错误 return false
							//表单验证通过 
							//建立新对象，将id、pid、name、level、desc、isopen依次加入
							var opt = {};
							opt.name = $('#node_Name').val();
							opt.code = $('#node_Code').val();
							opt.level = curLevel;
							opt.id = tree[co].id;
							opt.pid = tree[co].pid;
							opt.stid = view.tips == 'inner' ? 0 : (view.tips == 'outer' ? 1 : -1);
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
                //5,删除节点
                function removeNode(cOrder, cSibNum, view, tree, callBack) {
                    var co = cOrder;
                    var cs = cSibNum;
                    if (cs == 1) {
						common.tips_error('<span class="fb">' + tree[co].name + ' </span>含有子' + view.til + '，不能删除！');
                        return false;
                    }
                    var removeNodeFrame = art.dialog({
                        title: '删除科目!',
                        content: '<div class="removeWrap">确认要删除 <span class="fb">' + tree[co].name + '</span> 吗？<p class="buttonwrap"><button id="deter" class="blueBtn h22 w45 mr15">确定</button><button id="cancel" class="redBtn h22 w45">取消</button></p></div>',
                        lock: true
                    });
                    $("#deter").bind("click", function () {
                        var opt = {};
                        opt.id = tree[co].id;
                        opt.stid = view.tips == 'inner' ? 0 : (view.tips == 'outer' ? 1 : -1);
                        delNodeAjax && delNodeAjax(opt, function (d) {
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
                //添加trees时的ajax请求
                function addNodeAjax(opt, backFn) {
                    $.ajax({
                        url: $.url_prefix+"/Ashx/SubjectHandler.ashx?method=Add",
                        cache: false,
                        async: false,
                        dataType: "json",
                        type: "POST",
                        data: { "name": opt.name, "code": opt.code, "level": opt.level, "pid": opt.pid, "stid": opt.stid, "desc": opt.desc },
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
                        url: $.url_prefix+"/Ashx/SubjectHandler.ashx?method=Edit",
                        cache: false,
                        async: false,
                        ddataType: "json",
                        type: "POST",
                        data: { "name": opt.name, "code": opt.code, "level": opt.level, "id": opt.id, "pid": opt.pid, "stid": opt.stid, "desc": opt.desc },
                        success: function (e) {
                            backFn && backFn(e);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    });
                }
                //删除trees时的ajax请求
                function delNodeAjax(opt, backFn) {
                    $.ajax({
                        url: "/Ashx/SubjectHandler.ashx?method=Delete",
                        cache: false,
                        async: false,
                        dataType: "json",
                        type: "POST",
                        data: { "id": opt.id, "stid": opt.stid },
                        success: function (d) {
                            backFn && backFn(d);
                        },
                        error: function (error) {
                            window.location.href = error.responseText;
                        }
                    })
                }
                //创建表单
                function creatForm(view) {
                    var subForm = '<div class="formwrap" style="width:520px;">';
                    subForm += '<form id="nodeForm" method="post" name="" action="" class="fms-form"><fieldset>';
                    subForm += '<div class="fms-form-item pt10"><div class="fl"><label for="node_Name" class="fms-label w110"><span class="fms-form-required">*</span>' + view.til + '名称：</label><input id="node_Name" name="node_Name" type="text" class="form-text form-normal w150" /></div><span class="validate node_Name_tip"></span></div>';
                    subForm += '<div class="fms-form-item"><div class="fl"><label for="node_Code" class="fms-label w110"><span class="fms-form-required">*</span>' + view.til + '代码：</label><input id="node_Code" name="node_Code" type="text" class="form-text form-normal w150" /></div><span class="validate node_Code_tip"></span></div>';
                    subForm += '<div class="fms-form-item"><div class="fl"><label for="node_Des" class="fms-label w110">' + view.til + '说明：</label><textarea id="node_Des" name="node_Des" maxlength="64" rows="3" class="form-textarea form-normal w250"></textarea></div><span class="validate node_Des_tip"></span></div>';
                    subForm += '</fieldset></form>';
                    subForm += '<div class="buttonWrap"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
                    subForm += '</div>';
                    return subForm;
                }
                //表单验证
                function validatorForm(pid,stid,subid) {
					var ajaxUrl = $.url_prefix+"/Ashx/SubjectHandler.ashx?method=GetCountByName&pid=" + pid + "&stid=" + stid + "&subid=" + subid;
					$.validator.ruleList["nodeForm"] = {};
					$.validator.tool.ajaxObj= {};
                    $.validator.formConfig({ formID: "nodeForm" }); 
                    $("#nodeForm").validator({
                        node_Name: {
                            tip: { tipShow: true, msg: "不能超过16个字符！" },
                            rules: { nosymbol: true, maxLen: 16, minLen: 2 },
                            msg: { nosymbol: "不能输入特殊字符哦！", maxLen: "最大16个字符！", minLen: "不能小于2个字符！" },
                            ajaxValidator: {
                                url: ajaxUrl,
                                cache: false,
                                datatype: "json",
                                type: "GET",
								beforesend:function(){
									$("#deter").text("正在提交...").removeClass("sureBtn").removeClass("pl10").attr("id","deter-on");
									return true;	
								},
                                //data: { "level": level.toString() },
                                success: function (json) {
									$("#deter-on").text("确定").addClass("sureBtn").addClass("pl10").attr("id","deter");
									if (json.error) {
                                        return false;
                                    } else {
                                        return true;
                                    }
                                },
                                onerror: "该科目名已被占用，请更换",
                                onwait: "正在校验，请稍候..."

                            }
                        },
						node_Code: {
							tip: { tipShow: true, msg: "不能超过16个字符！" },
                        	rules: { diaen: true, maxLen: 16, minLen: 2 },
                        	msg: { diaen: "只能是英文和数字!", maxLen: "最大16个字符！", minLen: "不能小于2个字符！" }	
						},
                        node_Des: {
                            required: false,
                            tip: { tipShow: true, msg: "不能超过64个字符！" },
                            rules: { maxLen: 64 },
                            msg: { maxLen: "最大64个字符" }
                        }
                    });
					
					
                }
				function callBack(elem){
					outerapi.reinitialise();
					innerapi.reinitialise(); 	
				}			
			}						
		})(jquery);					
	}	
});