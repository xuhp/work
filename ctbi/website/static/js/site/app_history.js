/*
 *@Version:	    v1.0(2014-06-26)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 历史页面
 */
 $(function(){
 	var $table=$('.history_table');
 	var history={
 		init:function(){
 			this._tr_color();
 			this._to_normal_date();
 			this._open_app();
 		},
 		//隔行变色
 		_tr_color:function(){
 			$table.find("tr:odd").css("background","#5a5a5a");
 			$table.find("tr:even").css("background", "#454545");
 		},
 		//格式化日式
 		_to_normal_date:function(){
 			$('.history_table .visit_time').each(function(){
 				var ms=$(this).text();
 				//使用Common.js中的日期转换函数
 				$(this).text(common.to_normal_date(ms));
 			})
 		},
 		//访问app
 		_open_app:function(){
 			$table.delegate('.add_nav_con','click',function(){
				var $this=$(this),
					nodeid=$this.attr('nodeid'),
					url=$this.attr('app_url'),
					title=$(this).parent('td').siblings('.title').text();
				add_nav_con({
					title:title,
					url:url,
					id:nodeid
				})
			});
 		}
 	}
 	//页面初始化
 	history.init();
 });