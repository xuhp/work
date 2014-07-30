define(function (require, exports, module) {
	return function(jquery){
		var common = require('/Static/src/common');
		(function($){
			$.fn.daily = function(){	
				//申请人选择
				var auto = require('/Static/src/plugin/autocomplate/autocomplate');
				require('/Static/src/plugin/autocomplate/autocomplate.css');
				var url = $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=SearchUsers';
				var elem = $("#daily_Person");
				auto.init(elem, url);
				$("#daily_Person").change(function(){
					if($(this).val().length==0){
						$("#daily_PersonID").attr("value","");	
					}
				});					
				//日期选择
				//引入日历插件
				require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
				require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')(jquery);	
				$.date_input.initialize();
				common.clearValue("#node_Creat_1,#node_Creat_2");
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
								if(type=="Form"){
									str += '<option formid="' + data[i].FormID + '">'+data[i].FormName+'</option>';
								}else if(type=="Company"){
									str += '<option companyid="' + data[i].CompanyID + '">'+data[i].CompanyName+'</option>';
								}															
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
					$("#daily_PersonID").val(value);		
				});
				//调整高度
				function adjustwh(){		
					var W = $("body").outerWidth(true);
					var H = $("body").outerHeight(true);
					$("#dailyTab").height(H - 114);
				}
				adjustwh();
				$(window).resize(function(){   
					adjustwh(); 
				});							
			}			
		})(jquery);					
	}	
});