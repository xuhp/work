	define(function (require, exports, module) {
	return function(jquery){
		var common = require('/Static/src/common');
		var s = require('/Static/src/common/s_decmal');
		(function($){
			$.fn.budget = function(config){
				var defaults = {
					subUrl:"Main.aspx",
					bid:"",
					period: "",
					operateid: "",
					busName:"",
					isCreat:false,
					isInherit:true
				}
				$.extend(defaults, config);
				//调整高宽事件
				function adjustwh(){		
					var W = $("body").outerWidth(true);
					var H = $("body").outerHeight(true);
					$("#budgetTab").height(H - 260);
				}
				//0,调整高宽
				adjustwh&&adjustwh();
				//获取权限事件
				var Rights = {isAdd:true,isAddA:true,isUpdateA:true,isUpdate:true};
				function getRights(){
   					var roleKeys = $('#roleKeys').val();
   					var KeyArr = roleKeys.split(","); 					
    				//判断是否出现添加一行按钮
    				if (roleKeys != undefined) {
    					Rights.isAdd=inArr(KeyArr,"BudgetHandler_Add");
    					Rights.isAddA=inArr(KeyArr,"BudgetHandler_AddAmount");
    					Rights.isUpdateA=inArr(KeyArr,"BudgetHandler_UpdateAmountDynamic");
    					Rights.isUpdate=inArr(KeyArr,"BudgetHandler_UpdateUpdateDynamic");
						if(!Rights.isAdd){
							$("#addBudget").remove();
						}
						if(!Rights.isAddA){
							$("#creatCycle").remove();
						}
    				}
    				
				}
				function inArr(arr,name){
    				for (var i = 0; i < arr.length; i++) {
    					var x =arr[i];
    					if(name==x){
    						return true;
    					}   					
    				};
    				return false;
    			}
				//9,获取权限
				getRights&&getRights();	
				//至此开始进行预算的请求、绘制和操作				
				var aBudget = [];//总预算	
				var dBudget = [];//详细预算
				var oBudget = [];//所有冻结实扣预算
				var EditBudget = [];//判断是否编辑
				var aBudgetLog = [];//总预算日志
				var eBudgetTypes = [];//时间维度
				var beginDate;//开始时间
				var endDate;//结束时间
				var dLength = 0;
				var slideBtnN = '<span class="icon slideNo nomargin"></span>';
				var slideBtnD = '<span class="icon slideNo slideDownBtn nomargin"></span>';
				var slideBtnU = '<span class="icon slideNo slideUpBtn nomargin"></span>';
				$("#busName").html('<span class="budget-til ellipsis">'+defaults.busName+' </span>业务').attr("title",(defaults.busName+"业务"));//添加业务名称
				//获取预算的ajax请求
				function getBudgetAjax(period,operateid,bid,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=GetBudgetByBId&period='+period+'&operateid='+operateid+'&bid='+bid,
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});
				}
				//名称排序
				function gSort(arr,name){
					var newArr = arr;
					newArr.sort(gCompare(name));
					return newArr;
				}
				function gCompare(name){
					return function Compare(item1,item2){
								var name1 = item1[name];
								var name2 = item2[name];
								if(name1 < name2){
									return -1;
								}else if(name1 > name2){
									return 1;
								}else{
									return 0;
								}	
							}
				}	 
				require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')(jquery);
				require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
				require('/Static/src/plugin/DValidator/DValidator')(jquery);
				require('/Static/src/plugin/DValidator/css/validator.css');
				//绘制预算数据
				function drawBudget(data){
					aBudget = data.Amount;
					dBudget = gSort(data.Detail,'SubName');
					oBudget = data.Other;
					EditBudget = data.Edit;
					eBudgetTypes = data.elaborateBudgetTypes;
					if(data.Amount==null){
						if(defaults.isCreat){
							creatCycle&&creatCycle();
							$("#addBudget,#viewMoney").remove();		
						}else{
							$("body").html('<h3 class="tc fb">木有数据！！！</h3>');							
						}
					}else{
						if((!defaults.isCreat)||defaults.isInherit){
							$("#creatCycle").remove();		
						}
						beginDate = aBudget.BeginDate;
						endDate = aBudget.EndDate;
						dLength = dBudget.length;
						var $amount = $("#tr_0");
						var $budgetTable = $("#budgetTableD tbody");
						var addBtn = "";
						//绘制总预算
						$amount.empty();
						var ADB = '<td id="td1_0" class="w20 tc nopadding">';
						if(aBudget.FineBudget.length>0){
							ADB += slideBtnD;
						}else{
							ADB += slideBtnN;
						}
							ADB += '</td><td class="tl strong" title="所有科目（总预算）">所有科目（总预算）</td><td class="pw13 tr strong">'+s.decmal_num(aBudget.AmountStatic)+'</td><td id="AmountDynamic" class="pw15 tr strong" order="-1">'+s.decmal_num(aBudget.AmountDynamic)+'</td>';
							ADB += '<td class="pw12 tr strong">'+s.decmal_num(aBudget.AmountFreeze)+'</td><td class="pw12 tr strong">'+s.decmal_num(aBudget.AmountFact)+'</td><td class="pw12 tr strong">'+s.decmal_num(aBudget.AmountOverplus)+'</td>';
							ADB += '<td class="w60 last tc nopadding"><a id="addFineBudgetA" class="addFineBudget" order="-1" dbid="0">新增</a></td>';
						$amount.append(ADB);
						//绘制详细预算
						$budgetTable.empty();
						$(dBudget).each(function(index,el){
							//添加所有框架外的div
							var DB = '<tr id="tr_'+el.DBID+'" class="budget-tr" order="'+index+'" dbid="'+el.DBID+'" name="'+el.SubName+'"><td id="td1_'+el.DBID+'" class="w20 tc nopadding">';
							if(dBudget[index].FineBudget.length>0){
								DB += slideBtnD;
							}else{
								DB += slideBtnN;
							}								
								DB += '</td><td class="tl" title="'+el.SubName+'">'+el.SubName+'</td><td class="pw13 tr">'+s.decmal_num(el.Static)+'</td><td class="dynamic pw15 tr" order="'+index+'">'+s.decmal_num(el.Dynamic)+'</td>';
								DB += '<td class="pw12 tr">'+s.decmal_num(el.Freeze)+'</td><td class="pw12 tr">'+s.decmal_num(el.Fact)+'</td><td class="pw12 tr">'+s.decmal_num(el.Canpay)+'</td>';
								DB += '<td class="w60 last tc nopadding"><a class="addFineBudget addFineBudgetD" order="'+index+'" dbid="'+el.DBID+'">新增</a></td>';
								DB += '</tr>';
							$budgetTable.append(DB);								
						});
						if((!Rights.isAdd)||($("#addBudget").length<1)){
							$("#budgetTableA .addFineBudget,#budgetTableD .addFineBudget").remove();
						}							
						if(EditBudget.EditButton && (EditBudget.EditStatus!="None")){
							if(Rights.isUpdateA){
								$("#AmountDynamic").append('<span class="modify modify-all" title="修改"></span>');
							}
							if(Rights.isUpdate){
								$("#budgetTableD .dynamic").append('<span class="modify modify-detail" title="修改"></span>');
							}
						}
						$("#budgetTableD tr:even").addClass("odd");
						//获取总预算日志
						getLogAjax&&getLogAjax(defaults.bid,"0",beginDate,"0",function(data){
							aBudgetLog = data;
							drawLog&&drawLog(data);	
						});
					}
				}
				//1,页面加载后首次请求数据
				if(defaults.bid>0){
					getBudgetAjax&&getBudgetAjax(defaults.period,defaults.operateid,defaults.bid,function(data){
						drawBudget&&drawBudget(data[0]);
					});					
				}else{
					$("body").html('<h3 class="tc fb">请点击左边业务节点获取数据！！！</h3>');	
				}
				//创建新周期
				function creatCycle(){
					getTimeAjax&&getTimeAjax(function(data){	
						var cycForm = '<div style="width:420px;height:164px;overflow:hidden;">';
							cycForm += '	<form id="cycForm" method="post" name="" action="" class="fms-form"><fieldset>';
							cycForm += '		<div class="fms-form-item pt10"><div class="fl"><label class="fms-label w100">开始时间：</label><span class="fms-text date">'+common.toDate2(data.BeginDate)+'</span></div><span class="validate node_Sub_tip"></span></div>';
							cycForm += '		<div class="fms-form-item"><div class="fl"><label class="fms-label w100">结束时间：</label><spa class="fms-text date">'+common.toDate2(data.EndDate)+'</span></div><span class="validate node_Bus_tip"></span></div>';
							cycForm += '		<div class="fms-form-item"><div class="fl"><label for="="node_Money" class="fms-label w100"><span class="fms-form-required">*</span>总静态预算：</label><input id="node_Money" name="node_Money" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_tip"></span></div>';	
							cycForm += '	</fieldset></form>';
							cycForm += '	<div class="buttonwrap" style="padding-left:110px;"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确认</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
							cycForm += '<div>';
						var cycFrame = art.dialog({
							title: '创建新周期!',
							content:cycForm,
							lock: true,
							drag: false,
							resize: false,
							init:function(){
								s.s_decmal("#node_Money");
								$.validator.ruleList["cycForm"]={};
								$.validator.formConfig({formID:"cycForm"}); 
								$("#cycForm").validator({
									node_Money:{
										tip:{tipShow:true,msg:"不得超过10位数字！"}, 
										rules:{decmal1:true,maxMoneyLen:10}, 
										msg:{decmal1:"请填写金额！",maxMoneyLen:"最大10位数字！"}
									}  	
								});	
							}
						});
						$("#deter").bind("click",function(){
							if($.validator.control.fromAply("cycForm")){
								var verifyList = '<div style="width:260px;height:114px;overflow:hidden;">';
									verifyList += '<ul class="verify-list mb15">';
									verifyList += '<li><span class="fms-label w82 fb">开始时间：</span><span class="date">'+common.toDate2(data.BeginDate)+'</span></li>';
									verifyList += '<li><span class="fms-label w82 fb">结束时间：</span><span class="date">'+common.toDate2(data.EndDate)+'</span></li>';
									verifyList += '<li><span class="fms-label w82 fb">总静态预算：</span><span>'+$("#node_Money").val()+'</span></li>';
									verifyList += '</ul>';
									verifyList += '<div class="buttonwrap tc"><button id="verifyDeter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="verifyCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
									verifyList += '</div>';
								var verify = art.dialog({
									title: '确认创建新周期!',
									content:verifyList,
									lock: true,
									drag: false,
									resize: false
								});
								$("#verifyDeter").bind("click",function(){
									var opt = {};
									opt.begindate = data.BeginDate;
									opt.enddate = data.EndDate;
									opt.static = $("#node_Money").val();
									opt.busid = defaults.bid;
									creatCycleAjax&&creatCycleAjax(opt,function(data){
										if(!(data.error)){									
											verify.close();
											cycFrame.close();
											common.tips_succeed(data.msg,function(){
												window.location.href = defaults.subUrl+"?&period=0&operateid=0&bid="+defaults.bid;
											});															
										}else{
											verify.close();
											common.tips_error(data.msg);
										}										
									});								
								});
								$("#verifyCancel").bind("click",function(){
									verify.close();	
								});									
							}								
						});
						$("#cancel").bind("click",function(){
							cycFrame.close();			
						});												
					});
				}
				//添加总预算时获取预算开始时间和结束时间
				function getTimeAjax(backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=GetDate&busid='+defaults.bid,
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});								
				}
				//添加总预算请求
				function creatCycleAjax(opt,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=AddAmount',
						cache: false,
						async: false,
						dataType: 'json',
						data:{"begindate":opt.begindate,"enddate":opt.enddate,"static":opt.static,"busid":opt.busid},
						type:"post",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});						
				}
				//获取预算日志的ajax请求
				function getLogAjax(busid,type,bid,subid,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetLogHandler.ashx?method=GetLog&busid='+busid+'&type='+type+'&bid='+bid+'&subid='+subid,
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});					
				}
				//获取精细预算日志的ajax请求
				function getFineLogAjax(busid,type,bid,subid,elaborateTypeID,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetLogHandler.ashx?method=GetLog&busid='+busid+'&type='+type+'&bid='+bid+'&subid='+subid+'&elaborateTypeID='+elaborateTypeID,
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});					
				}
				//绘制预算日志
				function drawLog(data){
					var $budgetLog = $("#budgetLogTable tbody");
					$budgetLog.empty();
					$(data).each(function(index,el){
						var operate = el.Operate;
						if(el.Operate==1){
							operateType = "追加";
						}else if(el.Operate==2){
							operateType = "减少";
						}
						//添加所有框架外的div
						var DB = '<tr>';
							DB += '<td class="pw20 tc"><span class="date" title="'+common.toTime(el.CreateTime)+'">'+common.toDate2(el.CreateDate)+'</span></td><td class="w100 tc">'+operateType+'</td>';
							DB += '<td class="pw15 tr">'+s.decmal_num(el.Money)+'</td><td class="tl last" title="'+el.Description+'">'+el.Description+'</td>';
							DB += '</tr>';
							$budgetLog.append(DB);	
					});
					$("#budgetLogTable tr:odd").addClass("odd");				
				}
				//2,点击行显示对应详细预算日志
				//2.1总预算日志
				$("#budgetTableA").delegate(".budget-tr","click",function(){
					$(".budget-tr.selected,.fineBudget-tr.selected").removeClass("selected");
					$(this).addClass("selected");
					$("#subName").html('<span class="budget-til ellipsis">总预算</span>变更日志').attr("title","总预算变更日志");
					drawLog&&drawLog(aBudgetLog);
					logAPI.reinitialise();		
				});
				//2.2详细预算日志
				$("#budgetTableD").delegate(".budget-tr","click",function(){
					//选中框
					$(".budget-tr.selected,.fineBudget-tr.selected").removeClass("selected");
					$(this).addClass("selected");
					//显示日志
					var order = $(this).attr("order");
					var SubID = dBudget[order].SubID;
					var SubName = dBudget[order].SubName;
					$("#subName").html('<span class="budget-til ellipsis">'+SubName+'</span>变更日志').attr("title",(SubName+"变更日志"));					
					//获取详细预算日志
					getLogAjax&&getLogAjax(defaults.bid,"1",beginDate,SubID,function(data){
						drawLog&&drawLog(data);				
					});
					logAPI.reinitialise();	
				});
				//3.1,点击展开精细预算
				$(".budget-table").delegate(".slideDownBtn","click",function(event){
					$(this).removeClass("slideDownBtn").addClass("slideUpBtn");
					var trID = $(this).parent().parent().attr("id");
					dwawFineBudget(trID);
					tabAPI.reinitialise();
					event.stopPropagation();
				});
				//3.2,绘制精细预算
				function dwawFineBudget(trID){
					var $trID = $(document.getElementById(trID));
					var dbID = $trID.attr("dbid");
					var order = $trID.attr("order");
					var $childTr = $("#tr_pid_"+dbID);
					if($childTr.length<1){
						if(order=="-1"){
							var fBudget = gSort(aBudget.FineBudget,'ElaborateTypeID');
						}else{
							var fBudget = gSort(dBudget[order].FineBudget);
						}						
						var TR = '<tr id="tr_pid_'+dbID+'" class="fine-budget-tr"><td colspan="8" class="nopadding last"><table id="fineBudget_'+dbID+'" class="innerTable2 budget-table ellip-table">';
						$(fBudget).each(function(index,el){
							var DB = '<tr id="fineTr_'+el.EBID+'" class="fineBudget-tr" porder="'+order+'" order="'+index+'" dbid="'+el.EBID+'">';
								DB += '<td class="w20 tc nopadding"></td><td class="tl ti2em">'+el.ElaborateTypeName+'</td><td class="pw13 tr">'+s.decmal_num(el.Static)+'</td><td class="fine-dynamic pw15 tr" order="'+index+'">'+s.decmal_num(el.Dynamic);
								var EditRoot=eval("("+el.EditRoot+")"); 								 
								if(EditRoot.EditButton && (EditRoot.EditStatus!="None")){
									DB += '<span class="modify fine-modify" title="修改"></span>';
								}
								DB += '</td><td class="pw12 tr">'+s.decmal_num(el.Freeze)+'</td><td class="pw12 tr">'+s.decmal_num(el.Fact)+'</td><td class="pw12 tr">'+s.decmal_num(el.Canpay)+'</td><td class="w60 last tc nopadding"></td>';
								DB += '</tr>';
							TR += DB;
						});
						TR += "</table></td></tr>"
						$trID.after(TR);
						$("#fineBudget_"+dbID+" tr:odd").addClass("odd");
						if(!Rights.isUpdateA){
							$("#budgetTableA").find(".fine-modify").remove();
						}
						if(!Rights.isUpdate){
							$("#budgetTableD").find(".fine-modify").remove();
						}
						$("#fineBudget_"+dbID).delegate("tr","click",function(){
							//选中框
							$(".budget-tr.selected,.fineBudget-tr.selected").removeClass("selected");
							$(this).addClass("selected");
							var pindex = $(this).attr("porder");
							var index = $(this).attr("order");
							if(pindex=="-1"){
								var fBudget = aBudget.FineBudget;
								var logTil = "总预算";
							}else{
								var fBudget = dBudget[pindex].FineBudget;
								var logTil = dBudget[pindex].SubName;							
							}											
							var logTil2 = fBudget[index].ElaborateTypeName;
							$("#subName").html('<span class="budget-til ellipsis">'+logTil+'</span><span class="budget-til2 ellipsis">'+logTil2+'</span>精细预算变更日志').attr("title",(logTil+logTil2+"精细预算变更日志"));
							var SubID = fBudget[index].SubID;
							var elaborateTypeID = fBudget[index].ElaborateTypeID;
							//获取精细预算日志
							getFineLogAjax&&getFineLogAjax(defaults.bid,"2",beginDate,SubID,elaborateTypeID,function(data){
								drawLog&&drawLog(data);				
							});
							logAPI.reinitialise();
						});
					}else{
						$childTr.show(0);
					}
				}
				//点击关闭精细预算
				$(".budget-table").delegate(".slideUpBtn","click",function(event){
					$(this).removeClass("slideUpBtn").addClass("slideDownBtn");
					var dbID = $(this).parent().parent().attr("dbid");
					$("#tr_pid_"+dbID).hide(0,function(){
						tabAPI.reinitialise();						 
					});
					event.stopPropagation();
				});
				require('/Static/src/plugin/stree/jquery.stree.part')(jquery);
				require('/Static/src/plugin/stree/jquery.stree.table')(jquery);
				require('/Static/src/plugin/stree/css/stree.css');
				//可操作点击事件
				function editBudget(){
					//4.1,绑定创建新周期
					$("#creatCycle").bind("click",function(){
						creatCycle&&creatCycle();
					});
					//4.2,绑定新增详细预算
					$("#addBudget").bind("click",function(){
						addBudget&&addBudget();
					});
					//4.3,绑定总预算预算变更
					$("#budgetTableA").delegate(".modify-all","click",function(event){
						modifyABudget&&modifyABudget();
						event.stopPropagation();
					});
					//4.4,绑定详细预算变更
					$("#budgetTableD").delegate(".modify-detail","click",function(event){
						var $modify = $(this);
						var ID = $modify.parent().parent().attr("id");
						modifyBudget&&modifyBudget(ID,dBudget);
						event.stopPropagation();
					});
					//4.5,绑定总预算新增精细预算
					$("#budgetTableA").delegate("#addFineBudgetA","click",function(event){
						addFineBudget(-1,0,0,dBudget);
						event.stopPropagation();
					});
					//4.6,绑定详细预算新增精细预算
					$("#budgetTableD").delegate(".addFineBudgetD","click",function(event){
						var index = $(this).attr("order");
						var dbid = $(this).attr("dbid");
						addFineBudget(index,dbid,1,dBudget);
						event.stopPropagation();
					});	
					//4.7,绑定总预算精细预算变更
					$("#budgetTableA").delegate(".fine-modify","click",function(event){
						var $modify = $(this);
						var ID = $modify.parent().parent().attr("id");
						modifyFineBudget&&modifyFineBudget(ID,dBudget);
					});
					//4.8,绑定详细预算精细预算变更
					$("#budgetTableD").delegate(".fine-modify","click",function(event){
						var $modify = $(this);
						var ID = $modify.parent().parent().attr("id");
						modifyFineBudget&&modifyFineBudget(ID,dBudget);	
					});				
				}
				//4,判断是显示哪些操作				
				editBudget();
				//新增详细预算
				function addBudget(){
					var addForm = '<div id="addFormWrap" style="width:420px;overflow:hidden;position:relative;">';
						addForm += '	<form id="addForm" method="post" name="" action="" class="fms-form"><fieldset>';
						addForm += '		<div class="fms-form-item pt10"><div class="fl"><label for="node_Sub" class="fms-label w100"><span class="fms-form-required">*</span>科目：</label><input id="node_Sub" name="node_Sub" type="text" class="form-text form-normal w150" readonly /></div><span class="validate node_Sub_tip"></span></div>';
						addForm += '		<div id="tipsBudget" class="fms-form-item" style="display:none;"><div class="fl mr15"><span class="fms-label w100">已冻结：</span><b id="sub_Freeze"></b></div><div class="fl"><span class="fms-label w100">已实扣：</span><b id="sub_Fact"></b></div></div>';
						addForm += '		<div class="fms-form-item"><div class="fl"><label for="node_Money" class="fms-label w100"><span class="fms-form-required">*</span>静态预算：</label><input id="node_Money" name="node_Money" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_tip"></span></div>';	
						addForm += '		<div id="dynamicBudget" class="fms-form-item" style="display:none;"><div class="fl"><label for="node_Money_D" class="fms-label w100"><span class="fms-form-required">*</span>动态预算：</label><input id="node_Money_D" name="node_Money_D" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_D_tip"></span></div>';	
						addForm += '	</fieldset></form>';
						addForm += '	<div class="buttonwrap" style="padding-left:110px;"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
						addForm += '<div>';
					var addFrame = art.dialog({
						title: '新增详细预算!',
						content:addForm,
						lock: true,
						drag: false,
						resize: false,
						init:function(){
							s.s_decmal("#node_Money,#node_Money_D");
							$("#node_Sub").partTree({
								ajaxUrl:$.url_prefix+"/Ashx/SubjectHandler.ashx?method=GetListByTypeID&TypeID=0",
								sign:"sub",
								elem:"#subBox",
								end:false,
								addFun:addFun									
							});
							function addFun(){
								var vaule = $("#node_Sub").val();
								var $tipsBudget = $("#tipsBudget");
								var periodID = aBudget.PeriodID;
								var subID = $("#node_Sub").attr("nodeid");
								if(vaule!=""){					
									$tipsBudget.slideDown(100);
									getBudgetRelated&&getBudgetRelated(periodID,subID,function(data){
										$("#sub_Fact").text(s.decmal_num(data.Fact));
										$("#sub_Freeze").text(s.decmal_num(data.Freeze));
									});	
								}else{
									$tipsBudget.slideUp(100);
								}
									
							}
							$.validator.ruleList["addForm"]={};
							$.validator.formConfig({formID:"addForm"}); 
							$("#addForm").validator({
								node_Sub:{
									tip:{tipShow:true,msg:"请选择科目!"}
								},
								node_Money:{
									tip:{tipShow:true,msg:"不得超过10位数字！"}, 
										rules:{decmal4:true,maxMoneyLen:10}, 
										msg:{decmal4:"请填写金额！",maxMoneyLen:"最大10位数字！"}
								},
								node_Money_D:{
									tip:{tipShow:true,msg:"不得超过10位数字！"}, 
									rules:{decmal4:true,maxMoneyLen:10}, 
									msg:{decmal4:"请填写金额！",maxMoneyLen:"最大10位数字！"}
								} 	
							});
							var $dynamicBudget = $("#dynamicBudget")
							$("#node_Money").keyup(function(){
								if($(this).val()=="0"){
									if($dynamicBudget.css("display")=="none"){
										$("#node_Money_D").val("");
										$dynamicBudget.slideDown(100);	
									}									
								}else{
									if($dynamicBudget.css("display")!="none"){
										$dynamicBudget.slideUp(100);	
									}
									$("#node_Money_D").val(s.decmal_num($(this).val()));											
								}									
							});
						}
					});
					$("#deter").bind("click",function(){
						if($.validator.control.fromAply("addForm")){
							var staticVal = $("#node_Money").val();
							if(staticVal=="0.00"){
								var dynamicVal = $("#node_Money_D").val();
							}else{
								var dynamicVal = staticVal;
							}
							if((staticVal=="0.00")&&(dynamicVal=="0.00")){
								common.tips_warning("静态预算和动态预算不能同时为0！");
							}else{
								var verifyList = '<div style="width:320px;">';
									verifyList += '<ul class="verify-list mb15">';
									verifyList += '<li class="ellipsis"><span class="fms-label w82 fb">科目：</span><span title="'+$("#node_Sub").val()+'">'+$("#node_Sub").val()+'</span></li>';
									verifyList += '<li><span class="fms-label w82 fb">静态预算：</span>'+staticVal+'</li>';
									verifyList += '<li><span class="fms-label w82 fb">动态预算：</span>'+dynamicVal+'</li>';
									verifyList += '</ul>';
									verifyList += '<div class="buttonwrap tc"><button id="verifyDeter" class="sureBtn blueBtn h26 pl10 w100 mr15">确定</button><button id="verifyCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
									verifyList += '</div>';
								var verify = art.dialog({
									title: '确认新增详细预算!',
									content:verifyList,
									lock: true,
									drag: false,
									resize: false
								});
								$("#verifyDeter").bind("click",function(){
									var opt = {};
									opt.begindate = aBudget.BeginDate;
									opt.enddate = aBudget.EndDate;
									opt.busid = defaults.bid;
									opt.subid = $("#node_Sub").attr("nodeid");
									opt.Static = staticVal;
									opt.Dynamic = dynamicVal;
									opt.PeriodID = aBudget.PeriodID;
									addBudgetAjax&&addBudgetAjax(opt,function(data){
										if(!(data.error)){									
											verify.close();
											addFrame.close();
											common.tips_succeed(data.msg,function(){
												getBudgetAjax&&getBudgetAjax(defaults.period,defaults.operateid,defaults.bid,function(data){
													drawBudget&&drawBudget(data[0]);
												});	
												tabAPI.reinitialise();
												logAPI.reinitialise();	
											});											
										}else{
											verify.close();
											common.tips_error(data.msg);
										}
									});	
								});
								$("#verifyCancel").bind("click",function(){
									verify.close();	
								});	
							}
						}						
					});
					$("#cancel").bind("click",function(){
						addFrame.close();
					});	
				}
				//新增详细预算ajax
				function addBudgetAjax(opt,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=Add',
						cache: false,
						async: false,
						dataType: 'json',
						data:{"begindate":opt.begindate,"enddate":opt.enddate,"busid":opt.busid,"subid":opt.subid,"static":opt.Static,"dynamic":opt.Dynamic,"PeriodID":opt.PeriodID},
						type:"post",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});							
				}
				//获取相关预算ajax请求
				function getBudgetRelated(periodID,subID,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=GetBudgetItemOne&periodID='+periodID+'&subID='+subID,
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});						
				}
				//总预算变更
				function modifyABudget(){
					var modifyForm = '<div style="width:530px;height:192px;overflow:hidden;">';
						modifyForm += '<form id="modifyForm" method="post" name="" action="" class="fms-form"><fieldset>';
						modifyForm += showOperate();
						modifyForm += '<div class="fms-form-item"><div class="fl"><label for="node_Money" class="fms-label w100"><span class="fms-form-required">*</span>变更额度：</label><input id="node_Money" name="node_Money" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_tip"></span></div>';
						modifyForm += '<div class="fms-form-item"><div class="fl"><label for="node_Des" class="fms-label w100"><span class="fms-form-required">*</span>变更理由：</label><textarea id="node_Des" name="node_Des" maxlength="64" rows="3" class="form-textarea form-normal w250"></textarea></div><span class="validate node_Des_tip"></span></div>';	
						modifyForm += '</fieldset></form>';
						modifyForm += '<div class="buttonwrap" style="padding-left:110px;"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
						modifyForm += '<div>';
					var	modifyFrame = art.dialog({
						title:'<span class="budget-til ellipsis" style="color:#FFFFE7;">总预算</span>变更',
						content:modifyForm,
						lock: true,
						drag: false,
						resize: false,
						init:function(){
							s.s_decmal("#node_Money");
							$.validator.ruleList["modifyForm"]={};
							$.validator.formConfig({formID:"modifyForm"}); 
							$("#modifyForm").validator({
								node_Plus:{rules:{select:1},msg:{select:"请选择操作类型"},msgType:2},
								node_Money:{
										tip:{tipShow:true,msg:"不得超过10位数字！"}, 
										rules:{decmal1:true,maxMoneyLen:10}, 
										msg:{decmal1:"请填写金额！",maxMoneyLen:"最大10位数字！"}
								} ,
								node_Des:{
									tip:{tipShow:true,msg:"不得超过100个字符！"}, 
									rules:{maxLen:100}, 
									msg:{maxLen:"最大100个字符"}
								}  	
							});
						}
					});
					$("#deter").bind("click",function(){
						if($.validator.control.fromAply("modifyForm")){
							var $nodeType = $("input[name='node_Type']:checked")
							var verifyList = '<div style="width:260px;height:114px;overflow:hidden;">';
								verifyList += '<ul class="verify-list mb15">';
								if(EditBudget.EditStatus == "ALL"){
									verifyList += '<li><span class="fms-label w82 fb">变更方式：</span>'+$nodeType.siblings("b").text();+'</li>';
								}else if(EditBudget.EditStatus == "Subduction"){
									verifyList += '<li><span class="fms-label w82 fb">变更方式：</span>减少</li>';					
								}
								verifyList += '<li><span class="fms-label w82 fb">变更额度：</span>'+$("#node_Money").val()+'</li>';
								verifyList += '<li class="ellipsis"><span class="fms-label w82 fb">变更理由：</span><span title="'+$("#node_Des").val()+'">'+$("#node_Des").val()+'</span></li>';
								verifyList += '</ul>';
								verifyList += '<div class="buttonwrap tc"><button id="verifyDeter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="verifyCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
								verifyList += '</div>';
							var verify = art.dialog({
								title: '确认总预算变更!',
								content:verifyList,
								lock: true,
								drag: false,
								resize: false
							});
							$("#verifyDeter").bind("click",function(){
								var opt = {};
								opt.busid = defaults.bid;
								opt.id = aBudget.PeriodID;
								if(EditBudget.EditStatus == "ALL"){
									opt.operate = parseInt($nodeType.val());
								}else if(EditBudget.EditStatus == "Subduction"){
									opt.operate = 2;				
								}						
								opt.dynamic = $("#node_Money").val();
								opt.desc = encodeURIComponent($("#node_Des").val());
								modifyABudgetAjax&&modifyABudgetAjax(opt,function(data){
									if(!(data.error)){									
										verify.close();
										modifyFrame.close();
										common.tips_succeed(data.msg,function(){
											getBudgetAjax&&getBudgetAjax(defaults.period,defaults.operateid,defaults.bid,function(data){
												drawBudget&&drawBudget(data[0]);
											});
											logAPI.reinitialise();
										});												
									}else{
										verify.close();
										common.tips_error(data.msg);
									}
											
								});											
							});
							$("#verifyCancel").bind("click",function(){
								verify.close();	
							});	
						}						
					});
					$("#cancel").bind("click",function(){
						modifyFrame.close();
					});
				}
				//修改总预算ajax请求
				function modifyABudgetAjax(opt,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=UpdateAmountDynamic',
						cache: false,
						async: false,
						dataType: 'json',
						data:{"busid":opt.busid,"id":opt.id,"operate":opt.operate,"dynamic":opt.dynamic,"desc":opt.desc},
						type:"post",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});											
				}
				//显示操作类型
				function showOperate() {
					var operStr = '';
					if(EditBudget.EditStatus == "ALL"){
						operStr = '<div class="fms-form-item operatype pt10"> <div class="fl"> <label class="fms-label w100"><span class="fms-form-required">*</span>变更方式：</label><label for="node_Plus" class="pr10 pt4 fl"> <input name="node_Type" type="radio" id="node_Plus" value="1"/> <b>追加</b></label> <label for="node_Minus" class="pr10 pt4 fl"> <input name="node_Type" type="radio" id="node_Minus" value="2" /> <b>减少</b></label> </div> <span class="validate node_Plus_tip"></span> </li></div>';
					}else if(EditBudget.EditStatus == "Subduction"){
						operStr = '<div class="fms-form-item operatype pt10"> <div class="fl"> <label class="fms-label w100"><span class="fms-form-required">*</span>变更方式：</label><label for="node_Minus" class="pr10 pt4 fl"><b>减少</b></label> </div> </li></div>';						
					}
					return 	operStr;
				}
				//详细预算变更
				function modifyBudget(ID,dBudget){
					var $elem = $(document.getElementById(ID));
					var index = $elem.attr("order");
					var dbid = $elem.attr("dbid");
					var SubName = '<div title="'+dBudget[index].SubName+' 预算变更"><span class="budget-til ellipsis" style="color:#FFFFE7;">'+dBudget[index].SubName+'</span>预算变更</div>';					
					var modifyForm = '<div style="width:530px;height:192px;overflow:hidden;">';
						modifyForm += '<form id="modifyForm" method="post" name="" action="" class="fms-form"><fieldset>';
						modifyForm += showOperate();
						modifyForm += '<div class="fms-form-item"><div class="fl"><label for="node_Money" class="fms-label w100"><span class="fms-form-required">*</span>变更额度：</label><input id="node_Money" name="node_Money" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_tip"></span></div>';
						modifyForm += '<div class="fms-form-item"><div class="fl"><label for="node_Des" class="fms-label w100"><span class="fms-form-required">*</span>变更理由：</label><textarea id="node_Des" name="node_Des" maxlength="64" rows="3" class="form-textarea form-normal w250"></textarea></div><span class="validate node_Des_tip"></span></div>';	
						modifyForm += '</fieldset></form>';
						modifyForm += '<div class="buttonwrap" style="padding-left:110px;"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
						modifyForm += '<div>';
					var	modifyFrame = art.dialog({
						title:SubName,
						content:modifyForm,
						lock: true,
						drag: false,
						resize: false,
						init:function(){
							s.s_decmal("#node_Money");
							$.validator.ruleList["modifyForm"]={};
							$.validator.formConfig({formID:"modifyForm"}); 
							$("#modifyForm").validator({
								node_Plus:{rules:{select:1},msg:{select:"请选择操作类型！"},msgType:2},
								node_Money:{
										tip:{tipShow:true,msg:"不得超过10位数！"}, 
										rules:{decmal1:true,maxMoneyLen:10}, 
										msg:{decmal1:"请填写金额！",maxMoneyLen:"最大10位数！"}
								} ,
								node_Des:{
									tip:{tipShow:true,msg:"不得超过100个字符！"}, 
									rules:{maxLen:100}, 
									msg:{maxLen:"最大100个字符"}
								}  	
							});
						}
					});
					$("#deter").bind("click",function(){
						if($.validator.control.fromAply("modifyForm")){
							var $nodeType = $("input[name='node_Type']:checked")
							var verifyList = '<div style="width:260px;height:114px;overflow:hidden;">';
								verifyList += '<ul class="verify-list mb15">';
								if(EditBudget.EditStatus == "ALL"){
									verifyList += '<li><span class="fms-label w82 fb">变更方式：</span>'+$nodeType.siblings("b").text();+'</li>';
								}else if(EditBudget.EditStatus == "Subduction"){
									verifyList += '<li><span class="fms-label w82 fb">变更方式：</span>减少</li>';					
								}								
								verifyList += '<li><span class="fms-label w82 fb">变更额度：</span>'+$("#node_Money").val()+'</li>';
								verifyList += '<li class="ellipsis"><span class="fms-label w82 fb">变更理由：</span><span title="'+$("#node_Des").val()+'">'+$("#node_Des").val()+'</span></li>';
								verifyList += '</ul>';
								verifyList += '<div class="buttonwrap tc"><button id="verifyDeter" class="sureBtn blueBtn h26 pl10 w100 mr15">确定</button><button id="verifyCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
								verifyList += '</div>';
							var verify = art.dialog({
								title: '确认详细预算变更!',
								content:verifyList,
								lock: true,
								drag: false,
								resize: false
							});
							$("#verifyDeter").bind("click",function(){
								var opt = {};
								opt.busid = defaults.bid;
								opt.subid = dBudget[index].SubID;
								opt.id = dBudget[index].DBID;
								opt.periodid = aBudget.PeriodID;
								if(EditBudget.EditStatus == "ALL"){
									opt.operate = parseInt($nodeType.val());
								}else if(EditBudget.EditStatus == "Subduction"){
									opt.operate = 2;				
								}						
								opt.dynamic = $("#node_Money").val();
								opt.desc = encodeURIComponent($("#node_Des").val());
								modifyBudgetAjax&&modifyBudgetAjax(opt,function(data){
									if(!(data.error)){									
										verify.close();
										modifyFrame.close();
										common.tips_succeed(data.msg,function(){
											var el = data.Data;
											var fBudget = dBudget[index].FineBudget;
											el.FineBudget = fBudget;
											dBudget.splice(index,1,el);
											var BTN = '';
											if($elem.find(".slideDownBtn").length>0){
												BTN = slideBtnD;
											}else if($elem.find(".slideUpBtn").length>0){
												BTN = slideBtnU;
											}else{
												BTN = slideBtnN;
											}
											var DB = '<td class="w20 tc nopadding">'+BTN+'</td>';
												DB += '<td class="tl" title="'+el.SubName+'">'+el.SubName+'</td>';
												DB += '<td class="pw13 tr">'+s.decmal_num(el.Static)+'</td><td class="dynamic pw15 tr" order="'+index+'">'+s.decmal_num(el.Dynamic)+'<span class="modify modify-detail" title="修改"></span></td>';
												DB += '<td class="pw12 tr">'+s.decmal_num(el.Freeze)+'</td><td class="pw12 tr">'+s.decmal_num(el.Fact)+'</td><td class="pw12 tr">'+s.decmal_num(el.Canpay)+'</td>';
												DB += '<td class="w60 last tc nopadding">';
												if((Rights.isAdd)||($("#addBudget").length>0)){
													DB += '<a class="addFineBudget addFineBudgetD" order="'+index+'" dbid="'+el.DBID+'">新增</a>';
												}
												DB += '</td>';
											$elem.empty().append(DB);

											//获取详细预算日志
											getLogAjax&&getLogAjax(defaults.bid,"1",beginDate,opt.subid,function(data){
												drawLog&&drawLog(data);				
											});
											logAPI.reinitialise();	
										});										
									}else{
										verify.close();
										common.tips_error(data.msg);
									}											
								});											
							});
							$("#verifyCancel").bind("click",function(){
								verify.close();	
							});	
						}						
					});
					$("#cancel").bind("click",function(){
						modifyFrame.close();
					});
				}
				//修改详细预算ajax请求
				function modifyBudgetAjax(opt,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=UpdateDynamic',
						cache: false,
						async: false,
						dataType: 'json',
						data:{"busid":opt.busid,"subid":opt.subid,"id":opt.id,"periodid":opt.periodid,"operate":opt.operate,"dynamic":opt.dynamic,"desc":opt.desc},
						type:"post",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});											
				}
				//新增精细预算
				function addFineBudget(index,dbid,type,dBudget){
					if(index=="-1"){
						var SubName = '<span class="budget-til ellipsis" style="color:#FFFFE7;">总预算</span>新增精细预算';
					}else{
						var SubName = '<div title="'+dBudget[index].SubName+' 新增精细预算"><span class="budget-til ellipsis" style="color:#FFFFE7;">'+dBudget[index].SubName+'</span>新增精细预算</div>';
					}				
					var addForm = '<div id="addFormWrap" style="width:420px;overflow:hidden;position:relative;">';
						addForm += '	<form id="addForm" method="post" name="" action="" class="fms-form"><fieldset>';
						addForm += '		<div class="fms-form-item pt10"><div class="fl"><label for="node_Time" class="fms-label w100"><span class="fms-form-required">*</span>时间维度：</label><select id="node_Time" name="node_Time" type="text" class="fms-select w150" />';
						for (var i = 0; i < eBudgetTypes.length; i++) {
							addForm += '<option value="'+eBudgetTypes[i].ElaborateTypeID+'">'+eBudgetTypes[i].ElaborateTypeName+'</option>';
						};
						addForm += '		</select></div><span class="validate node_Time_tip"></span></div>';
						addForm += '		<div id="tipsBudget" class="fms-form-item" style="display:none;"><div class="fl mr15"><span class="fms-label w100">已冻结：</span><b id="sub_Freeze"></b></div><div class="fl"><span class="fms-label w100">已实扣：</span><b id="sub_Fact"></b></div></div>';
						addForm += '		<div class="fms-form-item"><div class="fl"><label for="node_Money" class="fms-label w100"><span class="fms-form-required">*</span>静态预算：</label><input id="node_Money" name="node_Money" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_tip"></span></div>';	
						addForm += '		<div id="dynamicBudget" class="fms-form-item" style="display:none;"><div class="fl"><label for="node_Money_D" class="fms-label w100"><span class="fms-form-required">*</span>动态预算：</label><input id="node_Money_D" name="node_Money_D" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_D_tip"></span></div>';	
						addForm += '	</fieldset></form>';
						addForm += '	<div class="buttonwrap" style="padding-left:110px;"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
						addForm += '<div>';
					var addFrame = art.dialog({
						title: SubName,
						content:addForm,
						lock: true,
						drag: false,
						resize: false,
						init:function(){
							s.s_decmal("#node_Money,#node_Money_D");
							addFun();
							$("#node_Time").change(function(){
								addFun();
							});							
							$.validator.ruleList["addForm"]={};
							$.validator.formConfig({formID:"addForm"}); 
							$("#addForm").validator({
								node_Time:{
									rules:{min:0},msg:{min:"请选择时间维度！"}
								},
								node_Money:{
									tip:{tipShow:true,msg:"不得超过10位数字！"}, 
										rules:{decmal4:true,maxMoneyLen:10}, 
										msg:{decmal4:"请填写金额！",maxMoneyLen:"最大10位数字！"}
								},
								node_Money_D:{
									tip:{tipShow:true,msg:"不得超过10位数字！"}, 
									rules:{decmal4:true,maxMoneyLen:10}, 
									msg:{decmal4:"请填写金额！",maxMoneyLen:"最大10位数字！"}
								} 	
							});
							var $dynamicBudget = $("#dynamicBudget")
							$("#node_Money").keyup(function(){
								if($(this).val()=="0"){
									if($dynamicBudget.css("display")=="none"){
										$("#node_Money_D").val("");
										$dynamicBudget.slideDown(100);	
									}									
								}else{
									if($dynamicBudget.css("display")!="none"){
										$dynamicBudget.slideUp(100);	
									}
									$("#node_Money_D").val(s.decmal_num($(this).val()));											
								}
									
							});
							function addFun(){
								var elaborateTypeID = $("#node_Time option:selected").attr("value");
								var $tipsBudget = $("#tipsBudget");
								var periodID = aBudget.PeriodID;
								if(index=="-1"){
									var subID = 0;
								}else{
									var subID = dBudget[index].SubID;
								}	
								if(elaborateTypeID!=""){					
									$tipsBudget.slideDown(100);
									getFineBudgetRelated&&getFineBudgetRelated(periodID,subID,elaborateTypeID,function(data){
										$("#sub_Fact").text(s.decmal_num(data.Fact));
										$("#sub_Freeze").text(s.decmal_num(data.Freeze));
									});	
								}else{
									$tipsBudget.slideUp(100);
								}
									
							}
						}
					});
					$("#deter").bind("click",function(){
						if($.validator.control.fromAply("addForm")){
							var value = $("#node_Time option:selected").text();
							var staticVal = $("#node_Money").val();
							if(staticVal=="0.00"){
								var dynamicVal = $("#node_Money_D").val();
							}else{
								var dynamicVal = staticVal;
							}
							if((staticVal=="0.00")&&(dynamicVal=="0.00")){
								common.tips_warning("静态预算和动态预算不能同时为0！");
							}else{
								var verifyList = '<div style="width:320px;">';
									verifyList += '<ul class="verify-list mb15">';
									verifyList += '<li class="ellipsis"><span class="fms-label w82 fb">时间维度：</span><span title="'+value+'">'+value+'</span></li>';
									verifyList += '<li><span class="fms-label w82 fb">静态预算：</span>'+staticVal+'</li>';
									verifyList += '<li><span class="fms-label w82 fb">动态预算：</span>'+dynamicVal+'</li>';
									verifyList += '</ul>';
									verifyList += '<div class="buttonwrap tc"><button id="verifyDeter" class="sureBtn blueBtn h26 pl10 w100 mr15">确定</button><button id="verifyCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
									verifyList += '</div>';
								var verify = art.dialog({
									title: '确认新增精细预算!',
									content:verifyList,
									lock: true,
									drag: false,
									resize: false
								});
								$("#verifyDeter").bind("click",function(){
									var value = $("#node_Time option:selected").attr("value");
									var opt = {};
									if(index=="-1"){
										opt.budgetID = aBudget.PeriodID;
										opt.SubID = 0;
									}else{
										opt.budgetID = dBudget[index].DBID;
										opt.SubID = dBudget[index].SubID;
									}								
									opt.BudgetType = type;
									opt.elaborateTypeID = value;
									opt.begindate = beginDate;
									opt.enddate = endDate;
									opt.busid = defaults.bid;								
									opt.Static = staticVal;
									opt.Dynamic = dynamicVal;
									opt.PeriodID = aBudget.PeriodID;
									addFineBudgetAjax&&addFineBudgetAjax(opt,function(data){
										if(!(data.error)){									
											verify.close();
											addFrame.close();
											common.tips_succeed(data.msg,function(){
												var el = data.Data;
												if(index=="-1"){
													aBudget.FineBudget.push(el);
												}else{
													dBudget[index].FineBudget.push(el);
												}
												var trID = 	"tr_"+dbid;
												$("#tr_pid_"+dbid).remove();								
												$("#td1_"+dbid).empty().append(slideBtnU);
												dwawFineBudget(trID);
												tabAPI.reinitialise();
											});											
										}else{
											verify.close();
											common.tips_error(data.msg);
										}
									});	
								});
								$("#verifyCancel").bind("click",function(){
									verify.close();	
								});
							}	
						}						
					});
					$("#cancel").bind("click",function(){
						addFrame.close();
					});					
				}
				//新增精细预算ajax
				function addFineBudgetAjax(opt,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=AddElaborateBudget',
						cache: false,
						async: false,
						dataType: 'json',
						data:{"budgetID":opt.budgetID,"BudgetType":opt.BudgetType,"elaborateTypeID":opt.elaborateTypeID,"begindate":opt.begindate,"enddate":opt.enddate,"busid":opt.busid,"SubID":opt.SubID,"Static":opt.Static,"Dynamic":opt.Dynamic,"PeriodID":opt.PeriodID},
						type:"post",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							//window.location.href = error.responseText;
						}
					});							
				}
				//获取精细预算相关ajax请求
				function getFineBudgetRelated(periodID,subID,elaborateTypeID,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=GetElaborateBudget&periodID='+periodID+'&subID='+subID+'&elaborateTypeID='+elaborateTypeID,
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});						
				}
				//精细预算变更
				function modifyFineBudget(ID,dBudget){
					var $elem = $(document.getElementById(ID));
					var index = $elem.attr("order");
					var pindex = $elem.attr("porder");
					var dbid = $elem.attr("dbid");
					if(pindex=="-1"){
						var fBudget = aBudget.FineBudget;
						var SubName = '<div title="'+fBudget[index].ElaborateTypeName+' 精细预算变更"><span class="budget-til ellipsis" style="color:#FFFFE7;">总预算</span><span class="budget-til2 ellipsis" style="color:#FFFFE7;">'+fBudget[index].ElaborateTypeName+'</span>精细预算变更</div>';
					}else{
						var fBudget = dBudget[pindex].FineBudget;
						var SubName = '<div title="'+dBudget[pindex].SubName+fBudget[index].ElaborateTypeName+' 精细预算变更"><span class="budget-til ellipsis" style="color:#FFFFE7;">'+dBudget[pindex].SubName+'</span><span class="budget-til2 ellipsis" style="color:#FFFFE7;">'+fBudget[index].ElaborateTypeName+'</span>精细预算变更</div>';
					}
					var modifyForm = '<div style="width:530px;height:192px;overflow:hidden;">';
						modifyForm += '<form id="modifyForm" method="post" name="" action="" class="fms-form"><fieldset>';
						modifyForm += showOperate();
						modifyForm += '<div class="fms-form-item"><div class="fl"><label for="node_Money" class="fms-label w100"><span class="fms-form-required">*</span>变更额度：</label><input id="node_Money" name="node_Money" type="text" class="form-text form-normal w150" /></div><span class="validate node_Money_tip"></span></div>';
						modifyForm += '<div class="fms-form-item"><div class="fl"><label for="node_Des" class="fms-label w100"><span class="fms-form-required">*</span>变更理由：</label><textarea id="node_Des" name="node_Des" maxlength="64" rows="3" class="form-textarea form-normal w250"></textarea></div><span class="validate node_Des_tip"></span></div>';	
						modifyForm += '</fieldset></form>';
						modifyForm += '<div class="buttonwrap" style="padding-left:110px;"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
						modifyForm += '<div>';
					var	modifyFrame = art.dialog({
						title:SubName,
						content:modifyForm,
						lock: true,
						drag: false,
						resize: false,
						init:function(){
							s.s_decmal("#node_Money");
							$.validator.ruleList["modifyForm"]={};
							$.validator.formConfig({formID:"modifyForm"}); 
							$("#modifyForm").validator({
								node_Plus:{rules:{select:1},msg:{select:"请选择操作类型！"},msgType:2},
								node_Money:{
										tip:{tipShow:true,msg:"不得超过10位数！"}, 
										rules:{decmal1:true,maxMoneyLen:10}, 
										msg:{decmal1:"请填写金额！",maxMoneyLen:"最大10位数！"}
								} ,
								node_Des:{
									tip:{tipShow:true,msg:"不得超过100个字符！"}, 
									rules:{maxLen:100}, 
									msg:{maxLen:"最大100个字符"}
								}  	
							});
						}
					});
					$("#deter").bind("click",function(){
						if($.validator.control.fromAply("modifyForm")){
							var $nodeType = $("input[name='node_Type']:checked")
							var verifyList = '<div style="width:260px;height:114px;overflow:hidden;">';
								verifyList += '<ul class="verify-list mb15">';
								if(EditBudget.EditStatus == "ALL"){
									verifyList += '<li><span class="fms-label w82 fb">变更方式：</span>'+$nodeType.siblings("b").text();+'</li>';
								}else if(EditBudget.EditStatus == "Subduction"){
									verifyList += '<li><span class="fms-label w82 fb">变更方式：</span>减少</li>';					
								}								
								verifyList += '<li><span class="fms-label w82 fb">变更额度：</span>'+$("#node_Money").val()+'</li>';
								verifyList += '<li class="ellipsis"><span class="fms-label w82 fb">变更理由：</span><span title="'+$("#node_Des").val()+'">'+$("#node_Des").val()+'</span></li>';
								verifyList += '</ul>';
								verifyList += '<div class="buttonwrap tc"><button id="verifyDeter" class="sureBtn blueBtn h26 pl10 w100 mr15">确定</button><button id="verifyCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
								verifyList += '</div>';
							var verify = art.dialog({
								title: '确认精细预算变更!',
								content:verifyList,
								lock: true,
								drag: false,
								resize: false
							});
							$("#verifyDeter").bind("click",function(){
								var opt = {};
								opt.subid = fBudget[index].SubID;
								opt.id = fBudget[index].EBID;
								opt.elaborateTypeID = fBudget[index].ElaborateTypeID;
								opt.busid = defaults.bid;
								opt.periodid = aBudget.PeriodID;
								if(EditBudget.EditStatus == "ALL"){
									opt.operate = parseInt($nodeType.val());
								}else if(EditBudget.EditStatus == "Subduction"){
									opt.operate = 2;				
								}						
								opt.dynamic = $("#node_Money").val();
								opt.desc = encodeURIComponent($("#node_Des").val());
								modifyFineBudgetAjax&&modifyFineBudgetAjax(opt,function(data){
									if(!(data.error)){									
										verify.close();
										modifyFrame.close();
										common.tips_succeed(data.msg,function(){
											var el = data.Data;
											if(pindex=="-1"){
												aBudget.FineBudget.splice(index,1,el);
											}else{
												dBudget[pindex].FineBudget.splice(index,1,el);
											}						
											var DB = '<td class="w20 tc nopadding"></td><td class="tl ti2em">'+el.ElaborateTypeName+'</td>';
												DB += '<td class="pw13 tr">'+s.decmal_num(el.Static)+'</td><td class="fine-dynamic pw15 tr" order="'+index+'">'+s.decmal_num(el.Dynamic)+'<span class="modify fine-modify" title="修改"></span></td>';
												DB += '<td class="pw12 tr">'+s.decmal_num(el.Freeze)+'</td><td class="pw12 tr">'+s.decmal_num(el.Fact)+'</td><td class="pw12 tr">'+s.decmal_num(el.Canpay)+'</td>';
												DB += '<td class="w60 last tc nopadding"></td>';
											$elem.empty().append(DB);
											//获取精细预算日志
											getFineLogAjax&&getFineLogAjax(defaults.bid,"2",beginDate,opt.subid,opt.elaborateTypeID,function(data){
												drawLog&&drawLog(data);				
											});
											logAPI.reinitialise();
										});										
									}else{
										verify.close();
										common.tips_error(data.msg);
									}											
								});

							});
							$("#verifyCancel").bind("click",function(){
								verify.close();	
							});	
						}
					});
					$("#cancel").bind("click",function(){
						modifyFrame.close();
					});
				}
				//修改精细预算ajax请求
				function modifyFineBudgetAjax(opt,backFn){
					$.ajax({
						url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=UpdateElaborateDynamic',
						cache: false,
						async: false,
						dataType: 'json',
						data:{"busid":opt.busid,"subid":opt.subid,"devid":opt.devid,"id":opt.id,"periodid":opt.periodid,"operate":opt.operate,"dynamic":opt.dynamic,"desc":opt.desc,"elaborateTypeID":opt.elaborateTypeID},
						type:"post",
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});											
				}
				//绘制所有冻结实扣情况
				function drawNonBudget(){					
					var nonBudgetTable = '<div style="width:650px;height:350px;">';
						nonBudgetTable += '<div class="outer-title"><table class="innerTable budget-title ellip-table"><thead><tr><th class="nopadding">科目</th><th class="pw20">冻结</th><th class="pw20 nopadding last">实扣</th></tr></thead></table></div>';
						nonBudgetTable += '<div id="allBudgetTable" class="outer-content" style="height:250px;"><table id="nonBudgetTable" class="innerTable budget-table ellip-table"><tbody><tr>';
						nonBudgetTable += '<td class="nopadding"><ul id="tableTree_0" class="stree-t"></ul></td>';
						nonBudgetTable += '<td class="pw20 tr nopadding"><ul id="tableTree_1" class="stree-t2"></ul></td>';
						nonBudgetTable += '<td class="pw20 tr nopadding last"><ul id="tableTree_2" class="stree-t2"></ul></td>';						
						nonBudgetTable += '</tr></tbody></table></div>';
						nonBudgetTable += '<div class="outer-content"><table id="allBudgetCount" class="innerTable budget-table ellip-table"><tbody></tbody></table></div>';
						nonBudgetTable += '<div class="buttonwrap tc mt10"><button id="viewClose" class="redBtn h26 w100">关闭</button></div>';
						nonBudgetTable += '</div>';
					var nonBudget = art.dialog({
						title: '所有冻结实扣情况',
						content:nonBudgetTable,
						lock: true,
						drag: false,
						resize: false,
						init:function(){							
							//绘制其他详细预算
							if(oBudget.length == 0){
								$("#nonBudgetTable tbody").html('<tr><td colspan="3" class="tc last">木有数据哦！</td></tr>');
							}else{
								var total = $("#allBudgetTable").tableTree({
									data:oBudget
								});
								factTotal = (total.Fact).toFixed(2);
								freezeTotal = (total.Freeze).toFixed(2);
								var TDB = '<tr><td class="fb tr">统计：</td><td class="pw20 fb tr">'+s.decmal_num(freezeTotal)+'</td><td class="pw20 fb tr last">'+s.decmal_num(factTotal)+'</td></tr>';
								$("#allBudgetCount tbody").append(TDB);								
							}
						
						}
					});
					$("#viewClose").bind("click",function(){
						nonBudget.close();	
					});						
				}
				//查看所有冻结冻结情况
				$("#viewMoney").click(function(){
					drawNonBudget&&drawNonBudget();		
				});
				//设置滚动条
				require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')(jquery);
				require('/Static/src/plugin/jScrollPane/jquery.mousewheel')(jquery);
				require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
				var tabPane = $('#budgetTab');
				var logPane = $('#budgetLogTab');
				tabPane.jScrollPane({});				
				logPane.jScrollPane({});
				var tabAPI = tabPane.data('jsp');
				var logAPI = logPane.data('jsp');		
				//5,调整滚动条
				tabAPI.reinitialise();
				logAPI.reinitialise();	
				//6,窗口改变事件
				$(window).resize(function(){   
					adjustwh();
					tabAPI.reinitialise();
					logAPI.reinitialise(); 
				});
				//7,鼠标换色
				$(".budget-tr,.fineBudget-tr,#budgetLogTable tr").live({
					mouseenter:function(){
						$(this).addClass("over");
					},
					mouseleave:function(){
						$(this).removeClass("over");
					}
				});
				//8,日期下拉框
				$("#budgetCycle").change(function(){
					var value = $("#budgetCycle option:selected").attr("value");
					window.location.href = defaults.subUrl+"?&period="+value+"&bid="+defaults.bid;
				})		 								
			}
		})(jquery);	
	}	
});