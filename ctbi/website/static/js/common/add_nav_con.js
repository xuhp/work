/*
 *@Version:	    v1.0(2014-06-18 21:40)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 用于实现自动添加tab_nav、con和menu_nav
 * title为显示的标题，必填
 * url为跳转的页面地址，必填
 * id为唯一标志，必填
 * 触发的class统一为add_nav_con
 */
function add_nav_con(opts) {
	var defaults={
			title:'tab',
			url:'http://www.ct108.com/',
			id:'000'
		};
	//设置有效值
	opts.title=opts.title || defaults.title;
	opts.url=opts.url || defaults.url;
	opts.id=opts.id || defaults.id;
	var $this_win=$(window.document),
		$win,$tab_nav,$menu_nav,$con,last_num,con_str,
		flag=false,//false代表本应用没有打开
		//获取首页节点
		$win=common.get_bottom($this_win),//基于common公共js
		$tab_nav=$win.find('.tab_nav_btn_wrap_inner'),
		$menu_nav=$win.find('.menu_nav_ul'),
		$home=$win.find('.tab_nav').find('a[name="tab_btn_0"]'),
		$con=$win.find('#main_right'),
		$close_frame=$win.find('.close_slide_frame_btn'),
		mask_layer=$win.find('.mask_layer'),
		site_map_frame_wrap=$win.find('.site_map_frame_wrap'),
		slide_frame_wrap=$win.find('.slide_frame_wrap');
	//添加内容，如果本页面已经添加则只需要打开当前页，如果本页面没有添加则添加并获得焦点
	$tab_nav.find('.tab_nav_btn').each(function(){
		if($(this).attr('name')==('tab_btn_'+opts.id)){
			flag=true;
			return false;
		}
	});
	//当本应用没有被打开时，打开该应用
	if(!flag){
		$home.after('<a href="#" class="tab_nav_btn" name="tab_btn_'+opts.id+'">'+
			opts.title+'<span class="close_tab_btn "><b></b></span></a>');
		$menu_nav.append('<li name="menu_nav_'+opts.id+'"><a>'+opts.title+'</a></li>');
		con_str='<div class="frame_wrap" name="con_'+opts.id+'">'+
					'<span class="frame_loading"><b class="img_top"></b>' +
					'<img src="/Static/image/common/loading/frame_loading.gif" /></span>'+
		            '<iframe  id="con_'+opts.id+'" width="100%" height="100%" frameborder="0" border="0" src="'+opts.url+'">' +
		            '您的浏览器不支持iframe</iframe>'+
		        '</div>';
		$con.append(con_str);
		common.frame_loading('con_' + opts.id, opts.url + '?appid=' + opts.id );
	}
	console.log(opts.id);
	//当前页面获得焦点
	common.show_tabNav_con('_' + opts.id);
	common.tab_nav_btn_layout('_' + opts.id);
	//关闭网站导航弹出框
	mask_layer.hide();
	site_map_frame_wrap.hide();
	slide_frame_wrap.hide();

    //添加历史记录
    this_url = url.domain + url.port + interFace.recordhistory,
	get_origin_data({
	    url:this_url,
	    data: {
	        'appid': opts.id
	    }
	});
}