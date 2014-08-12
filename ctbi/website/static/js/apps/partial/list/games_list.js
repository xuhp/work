/*
 *@Version:	    v1.0(2014-07-03)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 侧边栏列表
 */
//表格参数配置
var table_data = {
    'column': {
        'GameID': {
            'index': 0,
            'title': '游戏ID',
            'width': '25%',
            'sort': false,
            'filter': false,
        },
        'ShowName': {
            'index': 1,
            'title': '游戏名称',
            'width': '75%',
            'sort': false,
            'filter': true
        }
    },
    'row': '',
    'column_num': 2,
    'skin': 'dark_skin'
}
//app导航数据
var app_nav = [];
//获取dom
var $slide_head = $('.slide_head'),
    $app_ul_nav = $slide_head.find('.app_ul_nav');

var list={
    init: function (data) {
        //获取表格原始数据
        var row_data = get_data(data);
        table_data.row = row_data;
        log(row_data);
        this._table_parsing(table_data);
 		this._search(row_data);
 		this._list_nav(data);
    },
    //绘制表格
    _table_parsing: function (table_data) {
        //对外层元素进行布局
        adaption_w_h();
        $('.table_wrap').table(table_data);
        //对外层元素和table重新进行布局（主要是为了实现滚动条添加padding的效果）
        $(window).trigger('resize');
    },
    //应用搜索
 	_search: function (row_data) {
 	    $('.search_info input').keyup(function () {
 	        var $val = $(this).val(),
 	            data_search = get_search_data(row_data, $val);
 	        table_data.row = data_search;
 	        $('.table_wrap').empty().table(table_data);
 	    })
 	},
    //list_nav
 	_list_nav: function (data) {
 	    list_nav.init(data);
 	}
    
};
//创建表格
function create_table(data) {
    $('.table_wrap').table(data);
}
//获取搜索数据
function get_search_data(row_data,$val) {
    var search_data = [];
    for (var i = 0, len = row_data.length; i < len; i++) {
        if (row_data[i].values.ShowName.indexOf($val) >= 0 || row_data[i].values.GameID==$val) {
            search_data.push(row_data[i]);
        }
    }
    return search_data;
}
//获取表格数据
function get_data(data){
    var row_data=[];
 	for(var i=0,data_len=data.length;i<data_len;i++){
 	    for (var j = 0; j < data[i].length; j++) {
 	        data[i][j].ShowName = data[i][j].GameName + '(' + data[i][j].GameCode + ')';
 	        if (j == 0) {
 	            row_data[i] = {
 	                'values': {
 	                    'GameID': data[i][j].GameID,
 	                    'ShowName': data[i][j].ShowName
 	                },
                    'Sort':i
 	            }
 	        } else {
 	            row_data[i].values.ShowName +=  '<br />' + data[i][j].ShowName;
 	        }
 	    }
 	}
 	return row_data;
}
//获取应用title
function get_app_title(data,gameid) {
    for (var i = 0, data_len = data.length; i < data_len; i++) {
        for (var j = 0; j < data[i].length; j++) {
            data[i][j].ShowName = data[i][j].GameName + '(' + data[i][j].GameCode + ')';
            if (data[i][j].GameID == gameid) {
                return data[i][j].ShowName
            }
        }
    }
}
