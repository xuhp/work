define(function (require, exports, module) {	
	return function(jquery){
		var common = require('/Static/src/common');
		require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')(jquery);
		require('/Static/src/plugin/jScrollPane/jquery.mousewheel')(jquery);
		require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
		(function($){
			$.fn.tasklist = function(){
				var self = this;
				var pi= 1;
				var opt = {formid:"", orderid:"", uid: "", begindate: "", enddate: "",complete: 0};
				var $taskMore = $("#taskMore");
				var $taskLoad = $("#taskLoad");
				var noMore = '<span class="noMore">已经木有任务喽！</span>';
				//获取json的ajax请求
				function getTasktAjax(option,page,opt,backFn){
					if(option==0){
						opt = {formid:"", orderid:"", uid: "", begindate: "", enddate: "",complete: 0};					
					}					
					$.ajax({
						url: $.url_prefix+"/Ashx/TaskHandler.ashx?method=GetTaskPage",
						cache: false,
						async: false,
						dataType: 'json',
						data: { "indexpage": page, "formid": opt.formid, "orderid":opt.orderid, "uid": opt.uid, "begindate": opt.begindate, "enddate": opt.enddate,"complete": opt.complete},
						success: function(data){
							backFn&&backFn(data);
						},
						error:function(error){
							 window.location.href = error.responseText;
						}
					});
				}
				//绘制树
				function drawTree(jsondata){			
					if(jsondata.length>=1){
						$(jsondata).each(function(index,el){
							var taskIS ="";
							var taskLiTil = "";
							if(el.IsComplete){	
								taskIS = "task-y";
								taskLiTil = "操作日期：" + common.toDate2(el.CompleteDate);					
							}else{
								taskIS = "task-n";	
							}
							var taskDateStr = ToDate(el.TaskDate);
							var taskTimeStr = taskDateStr +" "+ToTime(el.TaskTime);
							var taskitem = '<li class="task-li" title="' + taskLiTil + '"><a id="task_'+el.TaskID+'" class="task-item '+taskIS+'" href="'+el.OperateUrl+'" taskid="'+el.TaskID+'" orderid="'+el.OrderID+'">';
								taskitem += '<div class="task-info">'+
									'<span class="fl w110 formname">'+el.FormName +'</span>'+
									'<span class="fr w70 tr" title="分支ID：' + el.BAID + '"><b class="icon icon-file"></b>'+el.OrderID+'</span>'+
								'</div>';
								taskitem += '<div class="task-info"><span class="task-desc colorCA w160">'+el.Message+'</span></div>';
								taskitem+='<div class="task-info">'+
									'<span class="fl w50">'+el.ProName+'</span>'+
									'<span class="fr w65 tr" title="'+taskTimeStr+'">'+taskDateStr+'</span>'+
								'</div>';
								taskitem += '</a></li>';
								$(self).append(taskitem);
								$taskMore.show();		
						});	
					}else{
						if($(".noMore").length<=0){
							$(".more-wrap").append(noMore);	
						}					
					}					
					$taskLoad.hide();	
				}
				//显示任务
				function showTask(flag,option){//flag表示是否清空列表，option表示是否为搜索后的结果
					if(flag==0){
						pi = 1//page次序
						$(self).empty();	
					}
					$(".noMore").remove();
					$taskMore.hide();
					$taskLoad.show();
					getTasktAjax&&getTasktAjax(option,pi,opt,function(data){
						drawTree&&drawTree(data[0].data);	
					});	
				}
				//1,首次显示任务
				showTask&&showTask(0,0);
				//2,绑定点击搜索时间
				$("#searchTask").bind("click",taskSearch);
				//搜索任务
				function taskSearch(){
					//引入弹出框插件
					require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')(jquery);
					require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
					//引入申请人插件
					var auto = require('/Static/src/plugin/autocomplate/autocomplate');
					require('/Static/src/plugin/autocomplate/autocomplate.css');
					//引入日历插件
    				require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
  					require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')($);
					require('/Static/src/plugin/DValidator/css/validator.css');
					var searchForm = creatForm();
					var	searchFrame = art.dialog({
						title:"搜索任务",
						content:searchForm,
						lock: true,
						init:function(){
							var url = $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=SearchUsers';
							var elem = $("#node_Person");
							auto.init(elem, url);
							$.date_input.initialize();
							common.clearValue("#node_Start,#node_End");
						},
						close:function(){
							$(".date_selector").hide();
						}
					});
					$("#deter").bind("click",function(){				
						opt.formid = $("#node_Name").find("option:selected").attr("formid");
						opt.orderid = $("#node_orderID").val();
						opt.uid = $("#node_Person").attr("uid");
						opt.begindate = $("#node_Start").val()==""?"":DateTo($("#node_Start").val());
						opt.enddate = $("#node_End").val()==""?"":DateTo($("#node_End").val());
						var selNum = selectStatus();
						var regNum = /^\+?[0-9]*$/;　　//正整数
						opt.complete = selNum;
						searchFrame.close();
						showTask&&showTask(0,1);
						$taskMore.removeClass("task-more").addClass("task-more-s");
						api.reinitialise();							
					})
					$("#cancel").bind("click",function(){
						searchFrame.close();
					});
					//禁止两个都不选
					$("input[name='node_Status']").bind("click",function(){
						var $nodeStatus = $("input[name='node_Status']:checked");
						var	selectLength = $nodeStatus.length;
						if(selectLength == 0){
							$(this).attr("checked",true);	
						}
					});
					//只能键入数字
					$("#node_orderID").keyup(function(event){
						var str = $(this).val();
						var str_num = "";
						for (var i = 0; i < str.length; i++) {
            				if ((!isNaN(str[i]))&&str[i] && str[i]!=' ') {
                				str_num += str[i];
            				}
        				};
						$(this).val(str_num)
					});
				}
				//创建表单
				function creatForm(){
					var str = "";
					$.ajax({
						type: "post",
						url: $.url_prefix+'/Ashx/Common/FormHandler.ashx?method=GetEffectiveRequisition',
						async: false,
						dataType: "json",
						success: function (data) {
							for (var i = 0; i < data.length; i++) {
								str += '<option formid="' + data[i].FormID + '">'+data[i].FormName+'</option>';
							}
						},
						error: function (error) {
							window.location.href = error.responseText;
						}
					});
					var searchForm = '<div id="searchBox" class="searchbox">';
						searchForm += '<form id="nodeForm" method="post" name="" action="" class="fms-form"><fieldset>';
						searchForm += '<div class="fms-form-item"><div class="fl"><label for="node_Name" class="fms-label w100">表单：</label><select id="node_Name" name="node_Name" type="text" class="fms-select w150"><option formid="">请选择</option>'+str+'</select></div></div>';
						searchForm += '<div class="fms-form-item"><div class="fl"><label for="node_orderID" class="fms-label w100">表单ID：</label><input id="node_orderID" name="node_orderID" type="text" class="form-text form-normal w150" uid="" /></div></div>';
						searchForm += '<div class="fms-form-item"><div class="fl"><label for="node_Person" class="fms-label w100">申请人：</label><input id="node_Person" name="node_Person" type="text" class="form-text form-normal w150" uid="" /></div></div>';
						searchForm += '<div class="fms-form-item"><div class="fl pr"><label for="node_Date" class="fms-label w100">操作时间：</label><input id="node_Start" name="node_Date" type="text" class="form-text form-normal w80 jdpicker" readonly /></div><span class="fl h24 gap">--</span><div class="fl pr"><input id="node_End" name="node_Date" type="text" class="form-text form-normal w80 jdpicker " readonly /></div></div>';
						searchForm += '<div class="fms-form-item"><div class="fl"><label for="node_Status" class="fms-label w100">状态：</label><label for="node_Untreated" class="pr10 pt4 fl"> <input id="node_Untreated" class="checknode" name="node_Status" type="checkbox" value="1" checked="checked" /><b class="fms-b">未处理</b></label> <label for="node_Treated" class="pr10 pt4 fl"> <input id="node_Treated" class="checknode" name="node_Status" type="checkbox" value="2" checked="checked" /> <b class="fms-b">已处理</b></label></div></div>';	
						searchForm += '</fieldset></form>';
						searchForm += '<div class="buttonwrap tc"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
						searchForm += '</div>';
					return searchForm;
				}
				//3,判断选择的处理状态
				function selectStatus(){
					var $nodeStatus = $("input[name='node_Status']:checked");
					var	selectLength = $nodeStatus.length;
					var selNum = 0;
						if(selectLength == 1){
							selNum = parseInt($nodeStatus.val());
						}
						return selNum;
				}
				//4,绑定点击刷新
				$("#refreshTask").bind("click",function(){
					showTask&&showTask(0,0);
					$taskMore.removeClass("task-more-s").addClass("task-more");
					tasktip&&tasktip();	
					api.reinitialise();			
				});
				//5,绑定点击显示更多
				$(".task-more").live("click",function(){
					pi = pi + 1;
					showTask&&showTask(1,0);
					api.reinitialise();
				});
				$(".task-more-s").live("click",function(){
					pi = pi + 1;
					showTask&&showTask(1,1);
					api.reinitialise();	
				});
				//6,点击节点获取子页面
				$("#taskList a").live("click",function(){
					$("#taskList a.selected").removeClass("selected");
					$(this).addClass("selected");
					var alink = $(this).attr("href");
					var taskID = $(this).attr("taskid");
					var orderID= $(this).attr("orderid");
					var taskFrame = window.frames["taskFrame"];
					var loadsrc =alink+"?orderid="+orderID+"&taskid="+taskID ;
					common.LoadIFrame2("taskFrame",loadsrc);
					return false;	
				});
				//7,调整高度
				function adjustWH(){		
					var W = $("body").outerWidth(true);
					var H = $("body").outerHeight(true);
					$("#taskSide").height(H);
					$("#taskListWrap").height(H - 56);
					$("#taskFrameWrap").width(W-220-10).height(H);
				}
				adjustWH();
				var pane = $('.scroll-pane')
				pane.jScrollPane({});
				var api = pane.data('jsp');
				$(window).resize(function(){   
					adjustWH();
					api.reinitialise(); 
				});				
				//日期转换成字符串
				function DateTo(str){
					var DateStr = str;
					var arys= DateStr.split('-');
					var d = new Date(arys[0], arys[1], arys[2]);
					for(var i=1; i<3; i++){
						if(arys[i].length==1){
							arys[i] = "0" + arys[i];
						}
					}
					var myDate = arys.join("");
					return myDate;					 	
				}
				//字符串转换成日期
				function ToDate(str){
					var DateStr = typeof(str)=="string"?str:str.toString();
					var myDate = DateStr.substr(0,4)+"/"+DateStr.substr(4,2)+"/"+DateStr.substr(6,2);
					return 	myDate;
				}
				//字符串转换成具体时间
				function ToTime(str){
					var TimeStr = typeof(str)=="string"?str:str.toString();
					var myTime = TimeStr.substr(0,2)+":"+TimeStr.substr(2,2)+":"+TimeStr.substr(4,2);
					return 	myTime;
				}
                //显示任务条数
				function tasktip(){
					var $taskTip = $(window.parent.document).find("#taskTip");
					$.ajax({
						url: $.url_prefix+'/Ashx/TaskHandler.ashx?method=GetCountComplete',
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							if(data.Count==0){
								$taskTip.hide();
							}else{
								$taskTip.text(data.Count).show();	
							}	
						}
					});	
				}
			}
		})(jquery);					
	}	
});