/*
 *@Version:	    v1.0(2014-06-26)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 关注页面
 */
 $(function(){
 	//获取dom
	var $con=$('.container'),
		$header=$('.header'),
		this_url=url.domain+url.port + interFace.get_attention,
		data_all = get_origin_data({
		    url: this_url,//url地址，必填
		    async: false,//是否同步，默认为同步
		}),
		data_len = data_all.length;

	data_all.sort(function (a,b) {
	    return a.Sort - b.Sort;
	})
	
	var attention={
		init:function(){
			this._label_tip();
			this._load_parsing();
			this._open_app();
			this._app_search();
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
		//打开app
		_open_app:function(){
			$con.delegate('.add_nav_con','click',function(){
				var nodeid=$(this).parents('.app').attr('nodeid'),
					cur_data=get_cur_data(nodeid);
				//如果应用可用，则打开应用，否则提示应用不可用
				if(cur_data.Available){
					add_nav_con({
						title:cur_data.AppTitle,
						url:cur_data.AppUrl,
						id:cur_data.AppID
					})
				}else{
					alert('应用不可用');	
				}
			});
		},
		//app搜索
		_app_search:function(){
			$header.delegate('#app_search','keyup',function(){
				var	$val=$(this).val();
				//重新获取搜索数据
				var data_search=get_search_data($val);
				//展示数据
				create_con(data_search);
			})
		}
		
	}
	//创建app
	function create_con(data){
		var len=data.length,
			str='';
		for(var i=0;i<len;i++){
			str+='<div class="app" nodeid="'+data[i].AppID+'">'+
					'<a class="add_nav_con">';
				if(data[i].Available){
					str+='<img src="'+url.domain+url.port+icon.path+data[i].AppIcon+'">';
				}else{
					str+='<img src="'+url.domain+url.port+icon.path+'default.jpg">';
				}
			str+='</a>' +
			'<p class="app_info">' +
				'<a class="add_nav_con" title="' + data[i].AppTitle + '">' + data[i].AppTitle + '</a>' +
			'</p></div>'; 
		}
		$con.empty().append(str);
	}
	//获取当前app数据
	function get_cur_data(nodeid){
		for(var i=0;i<data_len;i++){
			if(data_all[i].AppID==nodeid){
				return data_all[i];
			}
		}
	}
	//获取搜索匹配数据
	function get_search_data($val){
		var data_search=[];
		for(var i=0;i<data_len;i++){
			if(data_all[i].AppTitle.indexOf($val)>=0){
				data_search.push(data_all[i]);
			}
		}
		return data_search;
	}
	
	
	attention.init();
 });