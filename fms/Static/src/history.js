define(function (require, exports, module) {
	return function(jquery){
		var common = require('/Static/src/common');
		(function($){
			$.fn.history = function(){
				var $dFrameWrap = $("#dFrameWrap");
				//业务选择
				//引入树选择插件
				require('/Static/src/plugin/stree/jquery.stree.part')(jquery);
				require('/Static/src/plugin/stree/css/stree.css');
				$("#his_Bus").partTree({
					ajaxUrl:$.url_prefix+"/Ashx/BusinessHandler.ashx?method=GetListUsing",
					sign:"bus",
					elem:"#busBox",
					addFun:addFun									
				});	
				function addFun(){
					var busID = $("#his_Bus").attr("nodeid");
					$("#his_BusID").val(busID);							
				}
				//申请人选择
				var auto = require('/Static/src/plugin/autocomplate/autocomplate');
				require('/Static/src/plugin/autocomplate/autocomplate.css');
				var url = $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=SearchUsers';
				var elem = $("#his_Person");
				auto.init(elem, url);
				$("#his_Person").change(function(){
					if($(this).val().length==0){
						$("#his_PersonID").attr("value","");	
					}
				});	
				//日期选择
				//引入日历插件
				require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
				require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')(jquery);	
				$.date_input.initialize();
				common.clearValue("#node_Creat_1,#node_Creat_2,#node_Close_1,#node_Close_2,#his_Bus");
				$('#hisBus .clearBtn').die('mouseup').live('mouseup', function () {
                	$("#his_Bus").attr("nodeid","");
					$("#his_BusID").val("");
            	});			
				//添加选项事件
				function addOption(ID,ajaxUrl,type){
					var str = "";
					$.ajax({
						type: "post",
						url: ajaxUrl,
						async: false,
						dataType: "json",
						success: function (data) {
							for (var i = 0; i < data.length; i++) {
									str += '<option '+type+'ID="' + data[i][type+'ID'] + '">'+data[i][type+'Name']+'</option>';													
							}
							$(ID).append(str);							
						},
						error: function (error) {
							if (error) {
								alert(error.msg);
							}
						}	
					})					
				}
				//调整高度
				function adjustwh(){		
					var W = $("body").outerWidth(true);
					var H = $("body").outerHeight(true);
					$("#hisTab").height(H - 160);
					$dFrameWrap.width(W-20).height(H-20);
				}
				//高宽调整
				adjustwh();
				$(window).resize(function(){   
					adjustwh(); 
				});
				//隔行变色及鼠标换色
				$(".fms-table tr:even").addClass("odd");
				$(".fms-table tr").bind({
					mouseenter:function(){
						$(this).addClass("over");
					},
					mouseleave:function(){
						$(this).removeClass("over");
					}
				});
				$(".popup_ul li").live("mousedown",function(){
					var value = $(this).attr("id");
					$("#his_PersonID").val(value);		
				});
				//点击详情事件
				$(".his-detail").bind("click",function(){
					showLayer();
					$dFrameWrap.show();
					var oid = $(this).attr("orderid");
					var fid = $(this).attr("formid");				
					var dFrame = window.frames[0];
					switch(fid){
						case "1":
							dFrame.location.href ="/Workflow/CostReimbursement/OrderDetail.aspx?orderid="+oid;
							break;
						case "2":
							dFrame.location.href ="/Workflow/TravelExpense/OrderDetail.aspx?orderid="+oid;
							break;
					}					
					return false;	
				});
				//关闭遮罩层	
				$("#close").bind("click",function(){
					$(".maskLayer").remove();
					$dFrameWrap.hide();
				});
				//遮罩层
				function showLayer(){
					var mask = '<div class="maskLayer"></div>';
					$("body").append(mask);
				}				
			}						
		})(jquery);					
	}	
});