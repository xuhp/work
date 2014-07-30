define(function (require, exports, module) {
	return function(jquery){
	
		var $ = require('jquery');
		var common = require('/Static/src/common');
		//引入artDialog
		require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
		require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);
		//引入日历插件
		require('/Static/src/plugin/jdpicker_1.1/jdpicker.css');
		require('/Static/src/plugin/jdpicker_1.1/jquery.jdpicker')($);

		(function($){
			$.fn.index = function(){
				var settip;
				var W = 0;
				var H = 0;
				var maskStatus = 0;
				var $dFrameWrap = $("#dFrameWrap");
				var $fFrameWrap = $("#fFrameWrap");
				var $vFrameWrap = $("#vFrameWrap");
				var $dFrame = $("#dFrame");
				var $fFrame = $("#fFrame");
				//1,加入滚动条并计算高度宽度
				var $win = $(window);
				var $body = $("body");
				var isResizing = false;
			    //用cookie设置右边栏的宽度
				var mainLeft_width = getCookie('mainLeft_width');
				if(mainLeft_width!=''){
					$('#mainLeft').width(mainLeft_width);
				}else{
					var ml_w=$('#mainLeft').width();
					setCookie('mainLeft_width',ml_w,365);
				}
				//设置页面的宽度和高度
			    $win.bind('resize', function () {
					if (!isResizing) {
						isResizing = true;
						var $outer = $('#index-page-outer');
						var $inner = $('#index-page-inner');
						var bW = $body.outerWidth(true);
						var bH = $body.outerHeight(true);
						$outer.width(bW).height(bH);
						var main_left_w = getCookie('mainLeft_width');
						if(bH>600){
							$inner.height(bH)
							$("#mainLeft,#mainRight").height(bH-70);	
						}else{
							$inner.height(600)
							$("#mainLeft,#mainRight").height(530);
						}
						if(bW>1250){
						    $inner.width(bW);
						    if (main_left_w == 100) {
						        $("#mainRight").width(bW - main_left_w - 5);
						        $("#mainLeft").width(main_left_w);
						    }else{
						        $("#mainLeft").width(main_left_w);
						        $("#mainRight").width(bW-main_left_w-5);
                            }								
						}else{
						    $inner.width(1250);
						    if (main_left_w == 100) {
						        $("#mainRight").width(1250 - main_left_w - 5);
						        $("#mainLeft").width(main_left_w);
						    } else {
						        $("#mainLeft").width(main_left_w);
						        $("#mainRight").width(1250 - main_left_w - 5);
						    }														
						}
						H = $("#mainRight").height();
						W = $("#mainRight").width();						
						$fFrameWrap.width(W-15).height(H-10);
						$dFrameWrap.width(W-15).height(H-10);
						isResizing = false;
					}	
				}).trigger('resize');
				$('body').css('overflow', 'hidden');
				if ($('#index-page-container').width() != $body.width()) {
					$win.trigger('resize');
				}				
				$("#loadCon").remove();
				//2,栏目切换
				$(".slide-item").bind("click",function(){					
					$(".slide-item.on").removeClass("on");
					$(this).addClass("on");
					var loadsrc = $(this).attr("href");
					if(maskStatus==0){
						showLayer();
					}else{
						$("#closeD").hide();
						$dFrameWrap.stop(true,true).hide();
						$dFrameWrap.css('left',-(W-10)).show();
					}
					$dFrameWrap.animate({left:"0px"},300,function(){
						$("#closeD").show();
						common.LoadIFrame2('dFrame',loadsrc)						
					});											
					if($(this).is("#taskItem")){
						clearInterval(settip);
						tasktip&&tasktip();	
					}else{
						movetip&&movetip();
					}
					return false;	
				});
				//遮罩层
				function showLayer(){
					maskStatus = 1;
					var mask = '<div class="maskLayer"></div>';
					var closeBtn = '<div id="closeD" class="btn_close">关闭</div>';
					$(".maskwrap").append(mask);
					$("#header").append(closeBtn);
					$dFrameWrap.css('left',-(W-10)).show();					
				}
				//3,关闭遮罩层	
				$("#closeD").live("click",function(){
					$(".maskLayer,#closeD").remove();
					$dFrameWrap.hide();
					maskStatus = 0;
					$(".slide-item.on").removeClass("on");
				});
			    //4,顶部栏目切换
				$(".top-item").bind("click", function () {
				    $(".top-item.on").removeClass("on");
				    $(this).addClass("on");
				    var loadsrc = $(this).attr("href");
				    common.LoadIFrame2("fFrame",loadsrc);
				    return false;
				});
				//5,logo切换到主页
				$("#topLogo").on("click",function(){
				    $(".top-item.on").removeClass("on");
				    var loadsrc = $(this).attr("href");
				    common.LoadIFrame2("fFrame",loadsrc);
				    return false;					
				});
				//6,显示任务条数
				function tasktip(){
					$.ajax({
						url: $.url_prefix+'/Ashx/TaskHandler.ashx?method=GetCountComplete',
						cache: false,
						async: false,
						dataType: 'json',
						type:"GET",
						success: function(data){
							if(data.Count==0){
								$("#taskTip").hide();
							}else{
								$("#taskTip").text(data.Count).show();	
							}	
						}
					});	
				}
				function movetip(){
					settip = setInterval(function(){
						tasktip();		 	
					},300000);		
				}
				tasktip&&tasktip();
				movetip&&movetip();
				//7,右浮动效果
				function fixedR(elem){
					var $obj = $(elem);
					var pW = $obj.find("a").width();
					var objW = 20 + pW;
					$obj.mouseenter(function () {
						$(this).find("a").show();
						$(this).stop().animate({
							width: objW + "px"
						},
						300);
					});
					$obj.mouseleave(function () {
						$(this).stop().animate({
							width: "10px"
						},
						300,
						function () {
							$(this).find("p").hide();
						});
					});

				}
				
				//8,点击详情事件
				$("#version").bind("click",function(){
					close_dialog();
					$vFrameWrap.show();
				});
				//9,关闭遮罩层2	
				$("#closeA").bind("click",function(){
					$vFrameWrap.hide();
				});

			    /*
                * create by xuhp
                */
			    //菜单栏操作
                var menu=$('.menu'),
				    menu_list = $('.menu_list');
			    //显示影藏下拉菜单
                menu.hover(
                    function () {
                        menu_list.stop().slideDown(300);
                    },
                    function () {
                        menu_list.stop().slideUp(100);
                    }
                );
				//导出报表
				var msg={
					w:300,
					h:270,
					url:'/Report/WaterReport.aspx',
					id:'WaterReport'
				}
				$('.export_report').click(function(){
					close_dialog();
					dialog('报表导出',msg)
					$.date_input.initialize('.jdpicker');
					//移除版本弹出
					//$(".maskLayer").remove();
					$vFrameWrap.hide();
				})
				//创建弹出框
				function dialog(title,msg){
					art.dialog({
						id: 'export_report',
						drag: false,
						content: '<iframe id="'+msg.id+'" width="'+msg.w+'px" height="'+msg.h+'px" frameborder="0" border="0" src="'+msg.url+'"></iframe>',
						title: title,
						lock: true,
						close: function () {
							$('.date_selector').hide();
						}
					});
				}
				//关闭页面所有对话框
				function close_dialog(){
					var list = art.dialog.list;
					for (var i in list) {
						list[i].close();
					};
				}
				//右侧导航栏伸展收缩
				var main_left=$('#mainLeft'),
					ml_w;
				$('.flexible').click(function(){
					ml_w=main_left.width();
					if (ml_w == '100') { 
					    ml_w = '50';
					}else{
					    ml_w = '100';
					}
					//每次点击重设cookie
				    //var ml_w=$('#mainLeft').width();
					setCookie('mainLeft_width',ml_w,365);
					$win.trigger('resize');
				})
				
				//设置cookie的值
				function setCookie(name,value,exdays){
					var d=new Date();
					d.setTime(d.getTime()+(exdays*24*60*60*1000));
					var expires='expries='+d.toGMTString();
					document.cookie=name+'='+value+'; '+expires;
				}
				//获取cookie值
				function getCookie(cname){
					var name=cname+'=';
					var ca=document.cookie.split(';');
					for(var i=0;i<ca.length;i++){
						var c=ca[i].trim();
						if(c.indexOf(name)==0){
							return c.substring(name.length,c.length);
						}
					}
					return '';
				}
			}
		})(jquery);	
	}		
});