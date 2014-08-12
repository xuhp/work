var common={
	//frame loading效果,cur_win为ture时,则iframe在当前页面
    frame_loading: function (frameID, url, cur_win) {
        if (cur_win) {
            var iframe = document.getElementById(frameID);
        } else {
            var $this_win = $(window.document),
                $bottom_win = this.get_bottom($this_win),
                iframe = $bottom_win[0].getElementById(frameID);
        }
		$loading = $(iframe).siblings('.frame_loading');
		$loading.show();
		$(iframe).hide();
		$(iframe).attr('src', url);
		iframe.onload = function(){  
			$loading.hide(); 
			$(iframe).show();
		};
	},
	//显示当前tab_nav和con
	show_tabNav_con:function(num){
		var $win=$(window.document),
		this_win=this.get_bottom($win);
		this_win.find('a[name="tab_btn'+num+'"]').addClass('tab_nav_on')
		   .siblings().removeClass('tab_nav_on');
		this_win.find('.frame_wrap').hide();
		this_win.find('div[name="con'+num+'"]').show();
	},
    //将all转换成-1
	change_all: function (str) {
	    if (str == 'all') {
            return -1
	    }
	    return str;
	},
    //获取键值
	get_keys: function (data) {
	    var arr = [];
	    for (key in data) {
	        arr.push(key);
	    }
	    return arr;
	},
	//定位到最底层,主要为了解决iframe的跨越调用问题
	get_bottom:function($win){
		if($win.find('body').attr('class')=='bottom_frame'){
			return $win;
		}else{
			var $parent_win=$(window.parent.document);
			return this.get_bottom($parent_win);
		}
	},
    //将时间转换为毫秒数
	to_ms: function (date) {
	    return ((new Date(date)).getTime());
	},
    //获取UTC时间
	to_utc_time: function (date) {
	    var time_arr = date.split(' ');
	    log(time_arr);
	},
	//将毫秒转换为正常时间
	to_normal_date:function(ms){
		var time_str,
			ms=parseInt(ms);
		//获取数据
		var d=new Date(ms),
			year=d.getFullYear(),
			month =pad(d.getMonth() + 1,2),
			day = pad(d.getDate(),2),
			hours = pad(d.getHours(),2),
			minutes = pad(d.getMinutes(),2),
			seconds = pad(d.getSeconds(),2);
		time_str=year+'/'+month+'/'+day+' '+hours+':'+minutes+':'+seconds;	
		return time_str;
	},
    //将正常日期转换为无分隔
	to_nosplit_date: function (date) {
	    var date_arry = date.split('/');
	    return date_arry[0] + date_arry[1] + date_arry[2];
	},
    //将正常月份转换为无分隔
	to_nosplit_month: function (date) {
	    var date_arry = date.split('/');
	    return date_arry[0] + date_arry[1];
	},
    //将正常月份转换为无分隔
	to_split_month: function (date) {
	    var date = date.toString(),
            y = date.substring(0, 4),
            m = date.substring(4, 6);
	    return (y + '/' + m);
	},
    //将无分隔时间转换为用'/'分割时间
	to_split_date:function(date){
	    var date=date.toString(),
            y = date.substring(0, 4),
            m = date.substring(4, 6),
            d = date.substring(6, 8);
	    return (y + '/' + m + '/' + d);
	},
    //将简写时间转化为正常时间
	to_normal_time: function (time) {
	    var num = pad(time, 6).toString();
            h = num.substring(0, 2),
            s = num.substring(2, 4),
            m = num.substring(4);
	    return (h+':'+s+':'+m);
        
	},
    //获取url数据
	getUrlPara:function(){
	    var argsnum = arguments.length;
	    if (argsnum == 0 || argsnum > 2) {
	        log('args error');
	        return null;
	    }
	    var name = arguments[0];
	    var defaultValue = null;
	    defaultValue = arguments[1];
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	    var r = window.location.search.substr(1).match(reg);
	    if (r != null) return decodeURIComponent(r[2]); return defaultValue;
	},
    //将毫秒数转换为无分隔时间
	get_no_split_date: function (ms) {
	    var date = new Date(ms);
	    return '' + pad(date.getFullYear(),2) + pad(date.getMonth() + 1,2) + pad(date.getDate(),2);
	},
    //获取30天前的日期，无分隔
    //获取当前页面名称
	get_cur_page_name: function () {
	    var url = window.location.href,
	        strUrl = url.split('?')[0],
	        arrUrl = strUrl.split("/");
	    return arrUrl[arrUrl.length - 1];
	},
    /*tab_nav布局
	 * 设计思想：tab_nav采用的是display:inline-block布局模式，所以当一行显示不下去的时候就会换行
	 * 如果这个时候通过menu_ul_li进行选择，就无法显示到被影藏的tab_nav_btn。所以在这里就要判断，如果
	 * 选中的是被隐藏的的tab_nav_btn则将将她移动到home之后显示。
	 * 判断依据：
	 * offest.top
	 */
	tab_nav_btn_layout: function (nodeid) {
	    var $win = $(window.document),
	        this_win = this.get_bottom($win),
	        $this_tab_nav_btn = this_win.find('.tab_nav_btn[name="tab_btn' + nodeid + '"]'),
			offset = $this_tab_nav_btn.offset(),
	        $home = this_win.find('.home'),
            $menu_nav_ul = this_win.find('.menu_nav_ul');
	    if (offset.top > 10) {
	        //移动tab_nav
	        $remove_btn = $this_tab_nav_btn.remove();
	        $home.after($remove_btn);
	        //移动menu_nav_ul li
	        this_win.find('.menu_nav_ul  li[name="menu_nav' + nodeid + '"]').appendTo($menu_nav_ul);
	    }
	}
}

//补零
function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = '0' + num;
        len++;
    }
    return num;
}

function log(msg) {
    if (window["console"]) {
        if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)) {
            console.log(msg);
        } else {
            console.trace();
            console.log(msg);
        }
    }
}

//用于调整自适应布局
var flag = 0;
$(window).resize(function () {
    if (flag == 0) {
        resize_fn();
    }
    setTimeout(function () {
        flag = 0;
    },2000)
})

function resize_fn() {
    flag = 1;
    setTimeout(function () {
        $(window).trigger('resize');
    }, 1000)
}