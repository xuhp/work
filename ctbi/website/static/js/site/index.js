/*
 *@Version:	    v1.0(2014-06-16)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * index.js
 * 用于首页
 */
$(function(){
	//获取dom
	var $win=$(window),
		$body=$('body'),
		$header=$('#header'),
		$tab_nav=$('.tab_nav'),
		$home=$tab_nav.find('.home'),
		$menu_nav=$('.menu_nav'),
		$menu_nav_ul=$menu_nav.children('.menu_nav_ul'),
		$container=$('#container'),
		$main_right=$('#main_right'),
		$slideNav=$('#slideNav'),
		$tab_menu=$('#tab_menu'),
		current=$tab_menu.find('#close_nav_con_current'),
		all=$tab_menu.find('#close_nav_con_all'),
		other=$tab_menu.find('#close_nav_con_other'),
		
		mask_layer=$('.mask_layer'),
		slide_frame_wrap=$('.slide_frame_wrap'),
		slide_frame=slide_frame_wrap.find('.slide_frame'),
		
		site_map_frame_wrap=$('.site_map_frame_wrap'),
		site_map_frame=site_map_frame_wrap.find('.site_map_frame');
	var index={
		init:function(){
			this._resize();
			this._menu_list();
			this._side_nav();
			this._tab_panel_switch();
			this._tab_con_close();
			this._right_menu();
			this._prevent_menu_default();
			this._close_right_menu();
			this._menu_close_nav_con();
			this._menu_nav_close_open();
			this._menu_nav_click();
			this._dialog();
		},
		//页面布局计算
		_resize:function(){
			//页面加载时马上触发，以后每次resize的时候重新计算
			$win.bind('resize',function(){
				//计算container宽度
				var $header_h=$header.outerHeight(true),
					$body_h=$body.outerHeight(true);
					$container.height($body_h-$header_h);
				//计算tab_nav_btn_wrap的宽度
				var $header_h=$header.width();
				$('.tab_nav_btn_wrap').width($header_h-240);
				$('.tab_nav_btn_wrap_inner').width($header_h-240-30);
				//tab_nav_on对应的nodeid
				var nodeid=$tab_nav.find('.tab_nav_on').attr('name').substring(7);
				common.tab_nav_btn_layout(nodeid)
			}).trigger('resize');
		},
		//页面菜单栏
		_menu_list:function(){
			//菜单栏操作
            var logo=$('.logo'),
			    menu_list = $('.menu_list');
		    //显示影藏下拉菜单
            logo.hover(
                function () {
                    menu_list.stop().slideDown(300);
                },
                function () {
                    menu_list.stop().slideUp(100);
                }
            );
		},
		//打开关闭左侧栏
		_side_nav:function(){
			var close_btn=$('.close_btn'),
				flexible=$('.flexible');
			//关闭
			close_btn.bind('click',function(){
				$slideNav.animate({'width':'5px'},100);
				$main_right.css('margin-right','5px');
				flexible.hide();
				setTimeout(function () {
				    $slideNav.addClass('can_over');
				},150);
			});
		    //打开
			$slideNav.mouseover(function () {
			    if ($(this).hasClass('can_over')) {
			        $slideNav.animate({ 'width': '35px' }, 100);
			        $main_right.css('margin-right', '35px');
			        flexible.show();
			        $(this).removeClass('can_over');
			    }
			});
		},
		//标签页切换
		_tab_panel_switch:function(){
			$tab_nav.delegate('.tab_nav_btn ','click',function(){
				var nav_name=$(this).attr('name'),
				    num=nav_name.substring(7);
				common.show_tabNav_con(num);
			});
		},
		//'x'按钮关闭标签页和对应内容区块
		_tab_con_close:function(){
			$tab_nav.delegate('.tab_nav_btn .close_tab_btn b','click',function(){
				var $parent_node=$(this).parents('.tab_nav_btn'),
					$elem=$parent_node.prev('.tab_nav_btn '),
					nav_name=$parent_node.attr('name'),
					num=nav_name.substring(7),
					con_name='con'+num,
					menu_name='menu_nav'+num;
				$parent_node.remove();
				$('div[name="'+con_name+'"]').remove();
				$('li[name="'+menu_name+'"]').remove();
				focus_position($elem);
				return false;
			});
		},
		//显示右键菜单栏
		_right_menu:function(){
			$tab_nav.delegate('.tab_nav_btn','mousedown',function(e){
				// 1 = 鼠标左键 left; 2 = 鼠标中键; 3 = 鼠标右键 
				if(e.which==3){
					var pos=mousePositon(e);
						name_num=$(e.target).attr('name').substring(7),
						nav_len=$tab_nav.find('.tab_nav_btn').length;
					$tab_menu
						.hide()
						.css({'left':(pos.x+5),'top':(pos.y+5)})
						.slideDown(300)
						.attr('name',name_num);
					//首页不能关闭
					//当选中的是首页时(_0)，如果其他tab全部为空则关闭其他和关闭所有设置为不可用，否则仅关闭设置为不可用
					//当选中的是其他页面时，如果除了首页只剩本身则关闭其他不可用
					remove_dis_close();
					if(name_num=='_0' && nav_len==1){
						current.attr('class','dis_close');
						all.attr('class','dis_close');
						other.attr('class','dis_close');
					}
					if(name_num=='_0' && nav_len!=1){
						current.attr('class','dis_close');
					}
					if(name_num!='_0' && nav_len==2){
						other.attr('class','dis_close');
					}
				}
			});
		},
		//阻止菜单栏按钮默认右键事件
		_prevent_menu_default:function(){
			$(document).bind('contextmenu',function(e){
				if($(e.target).hasClass('tab_nav_btn')){
					return false;
				}
			});
		},
		//关闭右键菜单栏、菜单导航栏
		_close_right_menu:function(){
			$(document).click(function(){
				$tab_menu.hide();
				$menu_nav_ul.hide();
			});
		},
		//右键菜单栏关闭操作
		_menu_close_nav_con:function(){
			//关闭当前
			$('#close_nav_con_current').click(function(){
				if($(this).attr('class')=='dis_close'){
					return false;
				}
				var name_num=$tab_menu.attr('name'),
					$elem=$('a[name="tab_btn'+name_num+'"]').prev('.tab_nav_btn');
				$('a[name="tab_btn'+name_num+'"]').remove();
				$('div[name="con'+name_num+'"]').remove();
				$('li[name="menu_nav'+name_num+'"]').remove();
				focus_position($elem);
			});
			//关闭其他,区分首页和其他页
			$('#close_nav_con_other').click(function(){
				var name_num=$tab_menu.attr('name'),
					nav_btn=$tab_nav.find('.tab_nav_btn'),
					nav_len=nav_btn.length,
					this_num;
				if(name_num=='_0'){
					$('.tab_nav_btn[name!="tab_btn_0"]').remove();
					$('.frame_wrap[name!="con_0"]').remove();
					$('.menu_nav_ul li[name!="menu_nav_0"]').remove();
					//focus_position($('.tab_nav_btn[name="tab_btn_0"]'));
				}else{
					for(var i=0;i<nav_len;i++){
						this_num=$(nav_btn[i]).attr('name').substring(7);
						if(this_num !='_0' && this_num!=name_num){
							$('.tab_nav_btn[name="tab_btn'+this_num+'"]').remove();
							$('.frame_wrap[name="con'+this_num+'"]').remove();
							$('.menu_nav_ul li[name="menu_nav'+this_num+'"]').remove();
						}
					}
				}
				focus_position($('.tab_nav_btn[name="tab_btn'+name_num+'"]'));
			});
			//关闭所有
			$('#close_nav_con_all').click(function(){
				$('.tab_nav_btn[name!="tab_btn_0"]').remove();
				$('.frame_wrap[name!="con_0"]').remove();
				$('.menu_nav_ul  li[name!="menu_nav_0"]').remove();
				focus_position($('.tab_nav_btn[name="tab_btn_0"]'));
			});
		},
		//菜单导航栏打开关闭
		_menu_nav_close_open:function(){
			$menu_nav.children('.menu_triangle').click(function(){
				$menu_nav_ul.slideDown(100);
				return false;
			});
		},
		//单击菜单导航栏，相关tab_nav和con获得焦点
		_menu_nav_click:function(){
			$menu_nav_ul.delegate('li','click',function(){
				var num=$(this).attr('name').substring(8);
				common.show_tabNav_con(num);
				common.tab_nav_btn_layout(num)
			});
		},
		//弹出框
		_dialog:function(){
			/*
			 * 网站地图弹出框
			 */
			$('.site_nav_btn').click(function(){
				//显示iframe
				mask_layer.show();
				site_map_frame_wrap.show();
				//打开src
				if($('#site_map_frame').attr('src')==undefined){
					var this_url=url.domain+url.port+src.site_map;
					common.frame_loading('site_map_frame',this_url);
				}
			});
			$('.close_site_map_frame_btn').click(function(){
				mask_layer.hide();
				site_map_frame_wrap.hide();
			});
			/*
			 * 公用弹出框
			 */
			//打开遮罩层及内容框架
			//侧边栏
			$slideNav.delegate('ul li .common_frame','click',function(){
				mask_layer.show();
				slide_frame_wrap.show();
			});
			//左上角下拉菜单
			$('.menu_list').delegate('li.common_frame','click',function(){
				mask_layer.show();
				slide_frame_wrap.show();
			})
			
			//关闭遮罩层及内容框架
			$('.close_slide_frame_btn').click(function(){
				mask_layer.hide();
				slide_frame_wrap.hide();
			});
			
			//关注
			$('.attention').click(function(){
				var this_url=url.domain+url.port+src.attention;
				common.frame_loading('slide_frame',this_url);
			});
			
			//历史
			$('.app_history').click(function(){
				var this_url=url.domain+url.port+src.apphistory;
				common.frame_loading('slide_frame',this_url)
			});
			
			//关注内容管理
			$('.attention_manage').click(function(){
				var this_url=url.domain+url.port+src.attention_manage;
				common.frame_loading('slide_frame',this_url)
			});
		}
	
	};
	//获取鼠标位置
	function mousePositon(e){
		return pos_obj={
			x:e.pageX,
			y:e.pageY
		};
	}
	//移除菜单栏li的dis_close类
	function remove_dis_close(){
		$tab_menu.find('li').each(function(){
			$(this).removeClass('dis_close');
		});
	}
	/* 关闭子页面，焦点定位
	* 关闭当前页:$elem为紧邻的前一个兄弟元素
	* 关闭所有：$elem为首页
	* 关闭其他：$elem为当前元素
	*/
	function focus_position($elem){
		var nodeid=$elem.attr('name').substring(7);
		common.show_tabNav_con(nodeid);
	}
	
	//初始化页面
	index.init();
});