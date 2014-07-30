/*
 *@Version:	    v1.0(2014-06-27)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 用于对关注内容进行管理
 * 提示：
 * 1. 在对数据进行处理的时候数据的下标和sort值相等
 */
$(function(){
    var $header = $('.header'),
		$table = $('.attention_table'),
		$table_tbody = $table.find('tbody'),
		this_url = url.domain + url.port + interFace.get_attention,
		//将获取到的数据先进性排序，然后对sort进行重置
        data_origin = resort(get_origin_data({
            url: this_url,//url地址，必填
            async: false,//是否同步，false为同步
        }).sort(compare));

	var attention_manage={
		init:function(){
			this._load_parsing();
			this._jdpicker();
			this._clear_value();
			this._app_search();
			this._app_rename();
			this._app_unfollow();
			this._app_to_top();
			this._app_to_bottom();
			this._app_up();
			this._app_down();
			this._save_app_change();
		},
		//加载页面时显示数据
		_load_parsing:function(){
			//创建内容
			create_con(data_origin);
		},
		//日期插件
		_jdpicker:function(){
			$('#attention_time').jdPicker();
		},
		//clearValue插件
		_clear_value:function(){
			$('.add_clear_btn').clearValue();
		},
		//app搜索
		_app_search:function(){
			$('.app_search_btn').click(function(){
				var $this=$(this),
					app_name=$header.find('#app_name').val(),
					attention_time=$header.find('#attention_time').val();
				var data_search=get_search_data(app_name,attention_time);
				//创建内容
				create_con(data_search);
			});
		},
		//重命名
		_app_rename:function(){
			$table_tbody.delegate('.app_rename','click',function(){
				var $p_tr=$(this).parents('tr'),
					$app_name=$p_tr.find('.app_name'),
					//用于处理重复点击重命名
					$val=$app_name.text() || $app_name.find('input').val(),
					nodeid=$p_tr.attr('nodeid'),
					index=get_index(data_origin,nodeid);
				//添加修改框
				$app_name.empty().append(create_app_input($val,nodeid));
				//确定重命名
				$app_name.find('.sure').click(function(){
					var snap_val=$app_name.find('input').val();
					$app_name.empty().text(snap_val);
					data_origin[index].AppTitle=snap_val;
				})
				//取消重命名
				$app_name.find('.cancel').click(function(){
					$app_name.empty().text($val);
				});

			});
		},
		//取消关注
		_app_unfollow:function(){
			$table_tbody.delegate('.app_unfollow','click',function(){
				var $p_tr=$(this).parents('tr'),
					nodeid=$p_tr.attr('nodeid'),
					index=get_index(data_origin,nodeid);
					
				data_origin.splice(index,1);
				//重绘数据
				data_origin=resort(data_origin.sort(compare));
				//移除本行
				$p_tr.remove();
				tr_color();
			})
		},
		//置顶
		_app_to_top:function(){
			$table_tbody.delegate('.app_to_top','click',function(){
				var $p_tr=$(this).parents('tr'),
					nodeid=$p_tr.attr('nodeid'),
					index=get_index(data_origin,nodeid);
				
				data_origin[index].Sort=-1;
				//重置数据
				data_origin=resort(data_origin.sort(compare));
				create_con(data_origin);
			});
		},
		//至尾
		_app_to_bottom:function(){
			$table_tbody.delegate('.app_to_bottom','click',function(){
				var $p_tr=$(this).parents('tr'),
					nodeid=$p_tr.attr('nodeid'),
					index=get_index(data_origin,nodeid);
					
				data_origin[index].Sort=data_origin.length;
				//重绘数据
				data_origin=resort(data_origin.sort(compare));
				create_con(data_origin);
			})
		},
		//上移
		_app_up:function(){
			$table_tbody.delegate('.app_up','click',function(){
				var $p_tr=$(this).parents('tr'),
					nodeid=$p_tr.attr('nodeid'),
					index=get_index(data_origin,nodeid);
					
				data_origin[index].Sort=index-1;
				data_origin[index-1].Sort=index;
				//重绘数据
				data_origin=resort(data_origin.sort(compare));
				create_con(data_origin);
			})
		},
		//下移
		_app_down:function(){
			$table_tbody.delegate('.app_down','click',function(){
				var $p_tr=$(this).parents('tr'),
					nodeid=$p_tr.attr('nodeid'),
					index=get_index(data_origin,nodeid);
					
				data_origin[index].Sort=index+1;
				data_origin[index+1].Sort=index;
				//重绘数据
				data_origin=resort(data_origin.sort(compare));
				create_con(data_origin);
			})
		},
		//保存修改
		_save_app_change:function(){
			$('.save_btn').click(function(){
				var this_url=url.domain+url.port + interFace.update_attention,
					this_data={
						'attentions':JSON.stringify(get_update_data(data_origin))
					},
					$this = $(this);

				get_origin_data({
				    url: this_url,//url地址，必填
				    data: this_data,//参数,选填
				    async: true,//是否同步，默认为异步
				    loading: {
				        open: true,
				        elem: $('html')
				    }
				})
			});
		}
	}
	//创建内容
	function create_con(data){
		var str='',
			len=data.length;
		for(var i=0;i<len;i++){
			str+='<tr nodeid="'+data[i].AppID+'">'+
				'<td class="app_name">'+data[i].AppTitle;
			//判断应用是否可用
			if(!data[i].Available){
				str+=' (应用已失效)';
			}
			str+='</td>'+
				'<td>'+common.to_normal_date(data[i].ATime)+'</td>'+
				'<td><a class="app_rename">重命名</a>' +
				'<a class="app_unfollow">取消关注</a>';
			//对首行和尾行进行特殊处理
			switch(i){
				case 0:
					str+='<a class="app_down">下移</a>' +
						'<a class="app_to_bottom">至尾</a>';
					break;
				case len-1:
					str+='<a class="app_to_top">置顶</a>' +
						'<a class="app_up">上移</a>';
					break;
				default :
					str+='<a class="app_to_top">置顶</a>' +
						'<a class="app_up">上移</a>' +
						'<a class="app_down">下移</a>' +
						'<a class="app_to_bottom">至尾</a>';
			}
			str+='</td></tr>';
		}
		$table_tbody.empty().append(str);
		//隔行变色
		tr_color();
	}
	//获取搜索数据
	function get_search_data(app_name,attention_time){
		var len=data_origin.length,
			data_snap=[];
			data_search=[];
		//对应用名称进行匹配
		for(var i=0;i<len;i++){
			if(app_name=='' || data_origin[i].AppTitle.indexOf(app_name)>=0){
				data_snap.push(data_origin[i]);
			}
		}
		//对关注时间进行匹配
		for(var i=0,s_len=data_snap.length;i<s_len;i++){
			if(attention_time=='' || common.to_normal_date(data_snap[i].ATime).indexOf(attention_time)>=0){
				data_search.push(data_snap[i]);
			}
		}
		return data_search;
	}
	//获取当前数据的位置
	function get_index(data,nodeid){
		var len=data.length;
		for(var i=0;i<len;i++){
			if(data[i].AppID==nodeid){
				return i;
			}
		}
	}
	//重置sort()
	function  resort(data){
		var len=data.length;
		for(var i=0;i<len;i++){
			data[i].Sort=i;
		}
		return data;
	}
	//根据sort进行排序
	function compare(a,b){
		return a.Sort-b.Sort;
	}
	//更新数据重组
	function get_update_data(data){
		var update_data=[];
		for(var i=0,len=data.length;i<len;i++){
			var single_data={
				'UID':data[i].UID,
				'AppID':data[i].AppID,
				'AppTitle':data[i].AppTitle,
				'Sort':data[i].Sort,
				'ATime':0
			};
			update_data.push(single_data);
		}
		return update_data;
	}
	//隔行变色
	function tr_color(){
	    $table_tbody.find("tr:odd").css("background", "#454545");
	    $table_tbody.find("tr:even").css("background", "#5A5A5A");
	}
	//创建修改应用输入框
	function create_app_input($val,nodeid){
		str='<input class="little_input now_app_name" type="text" value="'+$val+'" style="width:80%"/>' +
			'<span class="sure"><img src="/Static/image/common/icon/sure.png"/></span>'+
			'<span class="cancel"><img class="cancel" src="/Static/image/common/icon/cancel.png"/></span>';
		return str;
	}
	
	//初始化页面
	attention_manage.init();
});