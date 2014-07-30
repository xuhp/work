/*
 *@Version:	    v1.0(2014-07-01)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 用于实现网站的布局：拖动和打开关闭功能
 * 
 */
 ;(function($){
 	$.fn.layout=function(options){
 		var defaults={
 			dir:'W',//E(东),S(南),W(西),N(北)
 			resizer:false,//ture表示可拖动，false表示不可拖动
 			toggler:false,//ture表示可以点击打开关闭，false表示不能点击打开关闭
 			width:100//默认宽度
 		};
 		var opts=$.extend({},defaults,options);
 		return this.each(function(){
 			switch(opts.dir){
 				case 'E':
 					east_layout($(this),opts);
 					break;
 				case 'S':
 					south_layout($(this),opts);
 					break;
 				case 'W':
 					west_layout($(this),opts);
 					break;
 				case 'N':
 					north_layout($(this),opts);
 			}
 		});
 	}
 	//左侧
 	function west_layout($elem,opts){
 		//添加拖动条
 		if(opts.resizer){
 			$elem.after(create_layout_resizer('west'));
 		}
 		//元素高度计算
 		layout_h_W_E($elem);
 		//元素宽度计算
 		layout_w_W_E($elem);
 		//改变窗体大小执行函数
	 	$(window).resize(function(){
	 		layout_w_W_E($elem);
	 		layout_h_W_E($elem);
	 	});
	 	//拖动执行
	 	w_resizer($elem);
 	}
 	//创建拖动条，
 	function create_layout_resizer(dir){
 		return str='<div class="ui_layout_resizer ui_layout_resizer_'+dir+'" >'+
 		'&nbsp;</div>';
 	}
 	//左右计算高度
 	function layout_h_W_E($elem){
 		var h=$elem.parent().outerHeight();
 		$elem.outerHeight(h).siblings('div').outerHeight(h);
 		
 	}
 	//左右计算宽度
 	function layout_w_W_E($elem){
 		var $parent=$elem.parent(),
 			total_w=$parent.outerWidth(),
 			west_w=$parent.children('.ui_layout_west').outerWidth() || 0,
 			east_w=$parent.children('.ui_layout_east').outerWidth() || 0,
 			$resizer=$parent.children('.ui_layout_resizer'),
 			resizer_w=$($resizer[0]).outerWidth(),
 			resizer_len=$resizer.length,
 			$center=$parent.children('.ui_layout_center');
 		$center=$center.outerWidth(total_w-west_w-east_w-resizer_w*resizer_len);
 	}
 	//拖动
 	function w_resizer($elem){
 	    var $parent = $elem.parent(),
 			$resizer = $parent.children('.ui_layout_resizer_west'),
            resizer_h = $resizer.height(),
            resizer_w = $resizer.width(),
 			mouse_down_client={};
 		 $resizer.mousedown(function(e){
 			var offset=$resizer.offset();
 		 	mouse_down_client.X=e.clientX;
 		 	mouse_down_client.Y=e.clientY;
 		 	diff = mouse_down_client.X - offset.left;
            //创建拖动条
 		 	create_layout_resizer_move(offset, resizer_h, resizer_w)
 		 	//只有当mousedown的情况才执行mousemove事件
 		 	$(document).mousemove(function (e) {
 		 	    $('.ui_layout_resizer_move').css('left', e.clientX - diff);
	 		 	//$elem.outerWidth(e.clientX-diff);
	 		 	//layout_w_W_E($elem)
	 		 })
 		 });
 		 //mouseup的时候解绑mousemove函数
	  	 $(document).mouseup(function(e){
	  	     $(document).unbind('mousemove');

 		 })
 	}
     //创建拖动条,跟随鼠标移动
 	function create_layout_resizer_move(offset, resizer_h, resizer_w) {
 	    var $win = $(window),
            win_h = $(window).height(),
            win_w = $(window).width();
 	    var str = '<div class="ui_layout_resizer" style="width:' + win_w + 'px;height:' + win_h + 'px;position:absolute;z-index:9;"></div>' +
            '<div class="ui_layout_resizer_move" style="position:absolute;z-index:99;height:' + resizer_h + 'px; width:' + resizer_w + 'px;left:' + offset.left+ 'px ; top:'+offset.top+'; background:#f00;" >' +
 		'&nbsp;</div>';
 	    $('body').append(str);

 	}
 })(jQuery);
 





















