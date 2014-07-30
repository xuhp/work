/*
 *@Version:	    v1.0(2014-06-20)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 网站导航页
 */
$(function(){
	//获取dom
	var $con=$('.container'),
		$header=$('.header'),
		$navsite=$('.navsite');
	
	var	this_url= url.domain+url.port + interFace.site_map_source,
		data_all=get_origin_data({
		    url: this_url,//url地址，必填
		    async: false,//是否同步，false为同步
		}),//所有数据
		data_search={"Groups":[]};//搜索数据
		
    //给data_all的最外层加入id,统一对数据的操作
    data_all.ID='wrap00';
	var site_nav={
	    init: function () {
	        this._clear_value();
			this._apps_open_close();
			this._label_tip();
			this._load_parsing();
			this._go_to_child_groups();
			this._open_app();
			this._navsite();
			this._app_search();
		},
	    //清除input内容
		_clear_value: function () {
		    $('#app_search').clearValue();
		},
		//apps打开关闭
		_apps_open_close:function(){
			$con.delegate('.category_title','click',function(){
				var $apps=$(this).siblings('.apps');
				if($apps.is(':hidden')){
					$apps.slideDown(300);
					$(this).children('span')
						.removeClass('triangle_left_white')
						.addClass('triangle_top_white ');
				}else{
					$apps.slideUp(300);
					$(this).children('span')
						.removeClass('triangle_top_white')
						.addClass('triangle_left_white ');
				}
			});
		},
		//输入框label提示，使用label_tip插件
		_label_tip:function(){
			$('#app_search').label_tip();
		},
		//加载页面时显示数据
		_load_parsing:function(){
			//创建应用层
			create_con(data_all);
		},
		//点击进入下一层
		_go_to_child_groups:function(){
			$con.delegate('.child_groups','click',function(){
				var $app=$(this).parents('.app'),
					nodeid=$app.attr('nodeid'),
					title=$app.find('.app_info a').text(),
				    data_cur=get_cur_data(data_all,nodeid),//获取当前数据
				    nav_obj;
				//重绘应用层
				create_con(data_cur);
				//修改面包屑导航数据
				var data_navsite=[{id:'wrap00',title:'网站地图导航'}];
				var data_navsite_cur=revise_navsite_data(data_all,nodeid,data_navsite);
				//重绘面包屑导航
				create_navsite(data_navsite_cur);
			});
		},
		//打开app
		_open_app:function(){
			$con.delegate('.add_nav_con','click',function(){
				var nodeid=$(this).parents('.app').attr('nodeid'),
					cur_data=get_cur_data(data_all,nodeid);
				add_nav_con({
					title:cur_data.Tooltip,
					url:cur_data.Url,
					id:cur_data.ID
				})
			});
		},
		//面包屑导航操作
		_navsite:function(){
			$navsite.delegate('.navsite_a','click',function(){
				var nodeid=$(this).attr('nodeid'),
					title=$(this).text(),
					obj={id:nodeid,title:title};
				//获取当前数据
				var data_cur=get_cur_data(data_all,nodeid);
				//重绘应用层
				create_con(data_cur);
				//修改面包屑导航数据
				var data_navsite=[{id:'wrap00',title:'网站地图导航'}];
				var data_navsite_cur=revise_navsite_data(data_all,nodeid,data_navsite);
				//重绘面包屑导航
				create_navsite(data_navsite_cur);
			})
		},
		//app搜索
		_app_search:function(){
			$header.delegate('#app_search','keyup',function(){
				//将搜索数据清空
				data_search={"Groups":[]};
				var	$val=$(this).val();
				//重新获取搜索数据
				get_search_data(data_all,$val,'root');
				//展示数据
				create_con(data_search);
				//修改面包屑导航
				$navsite.text('搜索中...');
			})
		}
	};
	//获取当前应用数据
	function get_cur_data(data_all,nodeid){
		//判断nodeid是否为最外层,如果是则返回所有数据
		if(nodeid=='wrap00'){
			return data_all;
		}
		var g_len=data_all.Groups.length;
		//循环Groups
		for(var i=0;i<g_len;i++){
			//循环Groups中的Navs
			var a_len=data_all.Groups[i].Navs.length;
			for(var j=0;j<a_len;j++){
				if(data_all.Groups[i].Navs[j].ID==nodeid){
					return data_all.Groups[i].Navs[j];
				}
				//如果获取了数据则返回出来，否则继续循环
				var data_cur=get_cur_data(data_all.Groups[i].Navs[j],nodeid);
				//如果存在匹配值则
				if(data_cur){
					return data_cur;
				}
			}
		}
		//如果不存在
		return false;
	}
	//创建应用元素并添加到页面
	function create_con(data){
		var str='',
			g_len=data.Groups.length;
		//第一层循环输出框架和标题
		for(var i=0;i<g_len;i++){
			str+='<div class="apps_wrapper">'+
				'<h3 class="category_title" nodeid="'+data.Groups[i].ID+'">'+
					'<span class="triangle_top_white"></span>'+data.Groups[i].Title+'</h3>'+
				'<div class="apps clearfix">';
				//第二层循环输出app
				var a_len=data.Groups[i].Navs.length;
				for(var j=0;j<a_len;j++){
					str+='<div class="app" nodeid="'+data.Groups[i].Navs[j].ID+'">';
					//如果NavType为nav，则还含有子app
					//否则为app,点击直接打开应用
					if(data.Groups[i].Navs[j].NavType=='nav'){
						str+='<a class="child_groups"><img src="'+
						url.domain+url.port+icon.path+data.Groups[i].Navs[j].Icon+'"></a>'+
						'<p class="app_info"><a class="child_groups" title="' + data.Groups[i].Navs[j].Title + '">' + data.Groups[i].Navs[j].Title + '</a></p>';
					}else{
						str+='<a class="add_nav_con"><img src="'+
						url.domain+url.port+icon.path+data.Groups[i].Navs[j].Icon+'"></a>'+
						'<p class="app_info"><a class="add_nav_con" title="' + data.Groups[i].Navs[j].Title + '">' + data.Groups[i].Navs[j].Title + '</a></p>';
					}
					str+='</div>';
				}
			str+='</div></div>';
		}
		$con.empty().append(str);	
	};
	
	//修改面包屑导航数据
	function revise_navsite_data(data_all, nodeid, data_navsite_cur) {
	    var g_len = data_all.Groups.length;
		for(var i=0;i<g_len;i++){
			var data_snap=data_navsite_cur,
				a_len=data_all.Groups[i].Navs.length;
			for(var j=0;j<a_len;j++){
				var single_data={
					id:data_all.Groups[i].Navs[j].ID ,
					title:data_all.Groups[i].Navs[j].Title
				}
				var cur_arr=data_snap.concat(single_data);
				if (data_all.Groups[i].Navs[j].ID == nodeid) {
				    return cur_arr;
				}
				var this_data = revise_navsite_data(data_all.Groups[i].Navs[j], nodeid, cur_arr);
				if(this_data){
					return this_data;
				}
			}
		}
		return false;
	}
	//创建网站地图导航面包屑
	function create_navsite(data_navsite_cur){
		//如果为最外层则会返回false,此时需要重新进行赋值
		if(!data_navsite_cur){
			data_navsite_cur=[{id:'wrap00',title:'网站地图导航'}];
		}
		var len=data_navsite_cur.length,
			str='';
		for(var i=0;i<len-1;i++){
			str+='<a class="navsite_a" nodeid="'+data_navsite_cur[i].id+'">'+data_navsite_cur[i].title+'</a>'+
			'<span class="songti"> > </span>';
		}
		//对数组的最后一项进行特殊设置
		str+='<span>'+data_navsite_cur[len-1].title+'</span>';
		
		$navsite.empty().append(str);
	}
	
	//获取符合搜索要求的数据,将数据格式拼凑成和源数据一样，公用创建函数
	function get_search_data(data_all,$val,groups_title){
		//当$val为空时，直接退出函数
		if($val==''){
			return false;
		}
		var	g_len=data_all.Groups.length;
		for(var i=0;i<g_len;i++){
			var a_len=data_all.Groups[i].Navs.length,
				new_data={
					'Title':groups_title,
					'ID':data_all.Groups[i].ID,
					'Navs':[]
				}
			for(var j=0;j<a_len;j++){
				//创建数据的title部分
				var this_title=data_all.Groups[i].Navs[j].Title;
				    
				//如果匹配则将数据插入到Groups中
				if(this_title.indexOf($val)>=0){
					var single_data={
						'ID':data_all.Groups[i].Navs[j].ID,
						'Title':data_all.Groups[i].Navs[j].Title,
						'Icon':data_all.Groups[i].Navs[j].Icon,
						'NavType':data_all.Groups[i].Navs[j].NavType,
						'Allow':data_all.Groups[i].Navs[j].Allow,
						'Url':data_all.Groups[i].Navs[j].Url,
						'Tooltip':data_all.Groups[i].Navs[j].Tooltip
					}
					new_data.Navs.push(single_data);
					
				}
				//继续循环
				var new_title=groups_title+' > '+ this_title;
				get_search_data(data_all.Groups[i].Navs[j],$val,new_title);
			}
			
			//如果new_data的Groups中包含数据，则插入到data_search中
			if(new_data.Navs.length>0){
				data_search.Groups.push(new_data);
			}
		}
	}
	site_nav.init();
});