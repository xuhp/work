/*
 *@Version:	    v1.0(2014-06-24)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 本文档用于对网站进行一些基础配置
 */
 
/* 接口url配置  */
var url={
	domain:'http://gs.ct108.org',
	port:':1400'
};

/*路由说明-页面*/
var src={
	site_map:'/site/sitemap/index',
	attention:'/site/attention/index',
	attention_manage:'/site/attention/manage',
	apphistory: '/site/apphistory/index',
    //在线人数
	op_gameusers_perday: '/app/onlineusers/op/gameusers_perday',//游戏单日在线人数走势
	op_gameusers_byday: '/app/onlineusers/op/gameusers_byday',//游戏多日在线人数走势
	op_gamestandard_bymonth: '/app/onlineusers/op/gamestandard_bymonth',//游戏多月标准在线走势
	op_hallusers_perday: '/app/onlineusers/op/hallusers_perday',//大厅单日在线人数
	op_hallusers_byday: '/app/onlineusers/op/hallusers_byday',//大厅多日在线人数
	op_hallstandard_bymonth: '/app/onlineusers/op/hallstandard_bymonth',//大厅多月标准在线走势
	op_cityusers2_perday: '/app/onlineusers/op/cityusers2_perday',//地级市（包含县区）单日在线人数
	op_cityusers2_byday: '/app/onlineusers/op/cityusers2_byday',//地级市（包含县区）多日在线人数
	op_citystandard2_bymonth: '/app/onlineusers/op/citystandard2_bymonth',//地级市（包含县区）多月标准在线
	op_cityusers1_perday: '/app/onlineusers/op/cityusers1_perday',//地级市（不包含县区）单日在线人数
	op_cityusers1_byday: '/app/onlineusers/op/cityusers1_byday',//地级市（不包含县区）多日在线人数详情
	op_citystandard1_bymonth: '/app/onlineusers/op/citystandard1_bymonth',//地级市（不包含县区）多月标准在线详情查询应用
	op_districtusers_perday: '/app/onlineusers/op/districtusers_perday',//县区单日在线人数详情查询应用
	op_districtusers_byday: '/app/onlineusers/op/districtusers_byday',//县区多日在线人数详情查询应用
	op_districtstandard_bymonth: '/app/onlineusers/op/districtstandard_bymonth',//县区多月标准详情查询应用
    //注册人数
	op_mobilegameusers_basic: '/app/registeredusers/op/mobilegameusers_basic',//手游注册人数基础走势查询应用
	op_hallusers_basic:'/app/registeredusers/op/hallusers_basic',//大厅注册人数基础走势查询应用
	op_cityusers1_basic: '/app/registeredusers/op/cityusers1_basic',//地级市（不包含县区）注册人数基础走势查询应用
	op_cityusers2_basic: '/app/registeredusers/op/cityusers2_basic',//地级市（包含县区）注册人数基础走势查询应用
	op_districtusers_basic: '/app/registeredusers/op/districtusers_basic',//县区注册人数基础走势查询应用
	op_siteusers_basic: '/app/registeredusers/op/siteusers_basic',//网站注册人数基础走势查询应用
    //登录人数
	op_tchallusers_perday: '/app/loginusers/op/tchallusers_perday',//同城游大厅登录人数单日查询应用
	op_tchallusers_byday: '/app/loginusers/op/tchallusers_byday',//同城游大厅登录人数多日查询应用
	op_tchallusers_compare: '/app/loginusers/op/tchallusers_compare',//同城游大厅登录人数同比环比应用
	op_tccityusers2_perday: '/app/loginusers/op/tccityusers2_perday',//同城游地级市（包含县区）登录人数单日查询应用
	op_tccityusers2_byday: '/app/loginusers/op/tccityusers2_byday',//同城游地级市（包含县区）登录人数多日查询应用
	op_tccityusers2_compare: '/app/loginusers/op/tccityusers2_compare',//同城游地级市（包含县区）登录人数同比环比应用
	op_tccityusers1_perday: '/app/loginusers/op/tccityusers1_perday',//同城游地级市（不包含县区）登录人数单日查询应用
	op_tccityusers1_byday: '/app/loginusers/op/tccityusers1_byday',//同城游地级市（不包含县区）登录人数多日查询应用
	op_tccityusers1_compare: '/app/loginusers/op/tccityusers1_compare',//同城游地级市（不包含县区）登录人数同比环比应用
	op_tcdistrictusers_perday: '/app/loginusers/op/tcdistrictusers_perday',//同城游县区登录人数单日查询应用
	op_tcdistrictusers_byday: '/app/loginusers/op/tcdistrictusers_byday',//同城游县区登录人数多日查询应用
	op_tcdistrictusers_compare: '/app/loginusers/op/tcdistrictusers_compare',//同城游县区登录人数同比环比应用
    

}
/*列表页面与操作页面对应关系*/
var page_mapped = {
   
    //在线人数
    gameusers_perday: src.op_gameusers_perday,
    gameusers_byday: src.op_gameusers_byday,
    gamestandard_bymonth: src.op_gamestandard_bymonth,
    hallusers_perday: src.op_hallusers_perday,
    hallusers_byday: src.op_hallusers_byday,
    hallstandard_bymonth: src.op_hallstandard_bymonth,
    cityusers2_perday: src.op_cityusers2_perday,
    cityusers2_byday: src.op_cityusers2_byday,
    citystandard2_bymonth: src.op_citystandard2_bymonth,
    cityusers1_perday: src.op_cityusers1_perday,
    cityusers1_byday:src.op_cityusers1_byday,
    citystandard1_bymonth: src.op_citystandard1_bymonth,
    districtusers_perday:src.op_districtusers_perday,
    districtusers_byday: src.op_districtusers_byday,
    districtstandard_bymonth: src.op_districtstandard_bymonth,
    //注册人数
    mobilegameusers_basic: src.op_mobilegameusers_basic,
    hallusers_basic: src.op_hallusers_basic,
    cityusers1_basic: src.op_cityusers1_basic,
    cityusers2_basic:src.op_cityusers2_basic,
    districtusers_basic: src.op_districtusers_basic,
    siteusers_basic: src.op_siteusers_basic,
    //登陆人数
    tchallusers_perday: src.op_tchallusers_perday,
    tchallusers_byday: src.op_tchallusers_byday,
    tchallusers_compare: src.op_tchallusers_compare,
    tccityusers2_perday: src.op_tccityusers2_perday,
    tccityusers2_byday: src.op_tccityusers2_byday,
    tccityusers2_compare: src.op_tccityusers2_compare,
    tccityusers1_perday: src.op_tccityusers1_perday,
    tccityusers1_byday: src.op_tccityusers1_byday,
    tccityusers1_compare: src.op_tccityusers1_compare,
    tcdistrictusers_perday: src.op_tcdistrictusers_perday,
    tcdistrictusers_byday: src.op_tcdistrictusers_byday,
    tcdistrictusers_compare: src.op_tcdistrictusers_compare,
}
/*路由说明-接口*/
var interFace={
	site_map_source:'/site/sitemap/datasource',
	get_attention:'/site/attention/getattention',//获取我的关注
	update_attention:'/site/attention/update',//更新我的关注
	add_attention: '/site/attention/add',//添加我的关注
	remove_attention: '/site/attention/remove',//移除指定appid的关注
	general_download: '/app/csv/report/normal',//普通csv文件下载
	recordhistory: '/site/apphistory/recordhistory',//添加应用的浏览记录
    //在线人数
	gameusers_perday: '/app/onlineusers/data/gameusers_perday',//获取单日的在线人数详情信息
	gameusers_byday: '/app/onlineusers/data/gameusers_byday',//获取多日的在线人数信息
	gamestandard_bymonth: '/app/onlineusers/data/gamestandard_bymonth',//获取多月的标准在线信息
	hallusers_perday: '/app/onlineusers/data/hallusers_perday',//大厅单日在线人数详情
	hallusers_byday: '/app/onlineusers/data/hallusers_byday',//大厅多日在线人数走势
	hallstandard_bymonth: '/app/onlineusers/data/hallstandard_bymonth',//大厅多月标准在线走势
	nationusers_perday: '/app/onlineusers/data/nationusers_perday',//全国单日在线人数详情查询应用
	nationusers_byday: '/app/onlineusers/data/nationusers_byday',//全国多日在线人数详情查询应用
	nationstandard_bymonth: '/app/onlineusers/data/nationstandard_bymonth',//全国多月标准在线详情查询应用
	cityusers2_perday: '/app/onlineusers/data/cityusers2_perday',//地级市（包含县区）单日在线人数详情查询应用
	cityusers2_byday: '/app/onlineusers/data/cityusers2_byday',//地级市（包含县区）多日在线人数详情查询应用
	citystandard2_bymonth: '/app/onlineusers/data/citystandard2_bymonth',//地级市（包含县区）多月标准在线详情查询应用
	cityusers1_perday: '/app/onlineusers/data/cityusers1_perday',//地级市（不包含县区）单日在线人数详情查询应用
	cityusers1_byday: '/app/onlineusers/data/cityusers1_byday',//地级市（不包含县区）多日在线人数详情查询应用
	citystandard1_bymonth: '/app/onlineusers/data/citystandard1_bymonth',//级市（不包含县区）多月标准在线详情查询应用
	districtusers_perday: '/app/onlineusers/data/districtusers_perday',//县区单日在线人数详情查询应用
	districtusers_byday: '/app/onlineusers/data/districtusers_byday',//县区多日在线人数详情查询应用
	districtstandard_bymonth: '/app/onlineusers/data/districtstandard_bymonth',//县区多月标准详情查询应用
    //注册人数
	reg_mobilegameusers_byday: '/app/registeredusers/data/mobilegameusers_byday',//手游注册,获取多日注册人数详情信息【接口】
	reg_mobilegameusers_bymonth: '/app/registeredusers/data/mobilegameusers_bymonth',//手游注册,获取多月注册人数详情信息【接口】
	reg_hallusers_byday: '/app/registeredusers/data/hallusers_byday',//大厅注册,获取多日注册人数详情信息【接口】
	reg_hallusers_bymonth: '/app/registeredusers/data/hallusers_bymonth',//大厅注册,获取多月注册人数详情信息【接口】
	reg_nationusers_byday: '/app/registeredusers/data/nationusers_byday',//全国注册,获取多日注册人数详情信息【接口】
	reg_nationusers_bymonth: '/app/registeredusers/data/nationusers_bymonth',//全国注册,获取多月注册人数详情信息【接口】
	reg_cityusers1_byday: '/app/registeredusers/data/cityusers1_byday',//地级市（不包含县区),获取多日注册人数详情信息【接口】
	reg_cityusers1_bymonth: '/app/registeredusers/data/cityusers1_bymonth',//地级市（不包含县区),获取多月注册人数详情信息【接口】
	reg_cityusers2_byday: '/app/registeredusers/data/cityusers2_byday',//地级市（包含县区）,获取多日注册人数详情信息【接口】
	reg_cityusers2_bymonth: '/app/registeredusers/data/cityusers2_bymonth',//地级市（包含县区）,获取多月注册人数详情信息【接口】
	reg_districtusers_byday: '/app/registeredusers/data/districtusers_byday',//县区注册,获取多日注册人数详情信息【接口】
	reg_districtusers_bymonth: '/app/registeredusers/data/districtusers_bymonth',//县区注册,获取多月注册人数详情信息【接口】
	reg_siteusers_byday: '/app/registeredusers/data/siteusers_byday',//网站注册,获取多日注册人数详情信息【接口】
	reg_siteusers_bymonth: '/app/registeredusers/data/siteusers_bymonth',//网站注册,获取多月注册人数详情信息【接口】
    //登陆人数
	login_tchallusers_perday: '/app/loginusers/data/tchallusers_perday',//同城游大厅,获取单日登录人数详情信息【接口】
	login_tchallusers_byday: '/app/loginusers/data/tchallusers_byday',//同城游大厅,获取多日登录人数详情信息【接口】
	login_tchallusers_compare: '/app/loginusers/data/tchallusers_compare',//同城游大厅,获取登录人数同比环比信息【接口】
	login_tcnationusers_perday: '/app/loginusers/data/tcnationusers_perday',//同城游全国,获取单日登录人数详情信息【接口】
	login_tcnationusers_byday: '/app/loginusers/data/tcnationusers_byday',//同城游全国,获取单日登录人数详情信息【接口】
	login_tcnationusers_compare: '/app/loginusers/data/tcnationusers_compare',//同城游全国,获取登录人数同比环比信息【接口】
	login_tccityusers2_perday: '/app/loginusers/data/tccityusers2_perday',//同城游地级市（包含县区）,获取单日登录人数详情信息【接口】
	login_tccityusers2_byday: '/app/loginusers/data/tccityusers2_byday',//同城游地级市（包含县区）,获取多日登录人数详情信息【接口】
	login_tccityusers2_compare: '/app/loginusers/data/tccityusers2_compare',//同城游地级市（包含县区）,获取登录人数同比环比信息【接口】
	login_tccityusers1_perday: '/app/loginusers/data/tccityusers1_perday',//同城游地级市（不包含县区）,获取单日登录人数详情信息【接口】
	login_tccityusers1_byday: '/app/loginusers/data/tccityusers1_byday',//同城游地级市（不包含县区）,获取多日登录人数详情信息【接口】
	login_tccityusers1_compare: '/app/loginusers/data/tccityusers1_compare',//同城游地级市（不包含县区）,获取登录人数同比环比信息【接口】
	login_tcdistrictusers_perday: '/app/loginusers/data/tcdistrictusers_perday',//同城游县区,获取单日登录人数详情信息【接口】
	login_tcdistrictusers_byday: '/app/loginusers/data/tcdistrictusers_byday',//同城游县区,获取多日登录人数详情信息【接口】
	login_tcdistrictusers_compare: ' /app/loginusers/data/tcdistrictusers_compare',//同城游县区,获取登录人数同比环比信息【接口】
    //充值
	pay_tcpaytrend: '/app/paydata/data/tcpaytrend',//同城游平台充值走势数据信息【接口】
	pay_tcpcpaytrend: '/app/paydata/data/tcpcpaytrend',//同城游PC端平台充值走势数据信息【接口】
	pay_tcpcpaytyperatio: '/app/paydata/data/tcpcpaytyperatio',//同城游PC端平台充值方式占比数据信息【接口】
	pay_tcmobilepaytrend: '/app/paydata/data/tcmobilepaytrend',//同城游移动端平台充值走势数据信息【接口】
	pay_tcmobilepaytyperatio: '/app/paydata/data/tcmobilepaytyperatio',//同城游移动端平台充值方式占比数据信息【接口】
}

/* 网站地图icon路径配置 */
var icon={
	path:'/Static/image/site/site_map/nav_icon/'
};

/* 错误提示 */
var tipsStr={
	ajax_system_error:'对不起，系统发生未知错误'
}