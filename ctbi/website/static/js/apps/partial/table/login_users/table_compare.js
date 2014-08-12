/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 单日数据表格展示
 */
function table_show_compare(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'Date': {
                'index': 0,
                'title': '日期',
                'width': '100px',
                'sort': false,
                'filter': false,
            },
            'Users1d1Today': {
                'index': 1,
                'title': '日登陆人数',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users1d1Yesterday': {
                'index': 2,
                'title': '昨日登陆人数',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users1d1TodayMoM': {
                'index': 3,
                'title': '环比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users1d1Yesteryear': {
                'index': 4,
                'title': '去年同期',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users1d1TodayYoY': {
                'index': 5,
                'title': '同比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'TimesToday': {
                'index': 6,
                'title': '日登陆人次',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'TimesYesterday': {
                'index': 7,
                'title': '昨日登陆人次',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'TimesTodayMoM': {
                'index': 8,
                'title': '环比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'TimesYesteryear': {
                'index': 9,
                'title': '去年同期',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'TimesTodayYoY': {
                'index':10,
                'title': '同比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users7d1Today': {
                'index': 11,
                'title': '7天登陆1次',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users7d1Yesterday': {
                'index': 12,
                'title': '昨天人数',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users7d1TodayMoM': {
                'index': 13,
                'title': '环比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users7d1Yesteryear': {
                'index': 14,
                'title': '去年同期',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users7d1TodayYoY': {
                'index': 15,
                'title': '同比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d1Today': {
                'index': 16,
                'title': '21天登陆1次',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d1Yesterday': {
                'index': 17,
                'title': '昨天人数',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d1TodayMoM': {
                'index': 18,
                'title': '环比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d1Yesteryear': {
                'index': 19,
                'title': '去年同期',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d1TodayYoY': {
                'index': 20,
                'title': '同比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d2Today': {
                'index': 21,
                'title': '21天登陆2次',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d2Yesterday': {
                'index': 22,
                'title': '昨天人数',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d2TodayMoM': {
                'index': 23,
                'title': '环比',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d2Yesteryear': {
                'index': 24,
                'title': '去年同期',
                'width': '100px',
                'sort': false,
                'filter': false
            },
            'Users21d2TodayYoY': {
                'index': 25,
                'title': '同比',
                'width': '100px',
                'sort': false,
                'filter': false
            }
        },
        'row': '',
        'column_num': 26
    }
    var keys = get_key(table_data);
    var row_data = get_table_data(data, keys);
    table_data.row = row_data;
    log(data);
    $('.data_show').table(table_data);
    $('.choose_condition').show();
    //计算表格宽度
    table_w();
    //对表格添加class
    add_class();
    //筛选列
    filter_cloumn();
    //筛选行
    add_options(data);//添加筛选条件
    filter_row();
    //默认为全选状态
    $('.checkbox_wrap input').each(function () {
        $(this)[0].checked = true;
    })
    return table_data;
}
//获取key
function get_key(data) {
    var key_arr=[]
    for (var key in data.column) {
        key_arr.push(key);
    }
    return key_arr;
}
//计算表格宽度
function table_w() {
    var len = $('.table_header th:visible').length;
    $('.table_header_wrap,.table_con_wrap ').outerWidth(100*len+'px');
}
//对表格添加class
function add_class() {
    //标题
    $('.table_header th').each(function (index, el) {
        add_fun(index, el);
    });
    //内容
    var trs = $('.table_con tr');
    for (var i = 0, len = trs.length; i < len; i++) {
        $(trs[i]).children('td').each(function (index, el) {
            add_fun(index, el);
        });
    }
}
//添加class函数
function add_fun(i,el) {
    switch (i) {
        case 1: case 2: case 3:case 4:case 5:
                $(el).addClass('users1d1');
            break;
        case 6: case 7: case 8: case 9:case 10:
            $(el).addClass('times1d1');
            break;
        case 11: case 12: case 13:case 14:case 15:
            $(el).addClass('users7d1');
            break;
        case 16: case 17: case 18:case 19:case 20:
            $(el).addClass('users21d1');
            break;
        case 21: case 22: case 23:case 24:case 25:
            $(el).addClass('users21d2');
            break;
    }
}

//对表格列进行筛选排序
function filter_cloumn() {
    $('.checkbox_wrap').delegate('input', 'click', function () {
        var $cur_el=$(this),
            tip = $cur_el.attr('id');
        if ($cur_el[0].checked) {
            $('.'+tip).show()
        } else {
            $('.' + tip).hide()
        }
        table_w();
    });
}

//添加时间选择option
function add_options(data) {
    str = '';
    for (var i = 0, len = data.length; i < len; i++) {
        str += '<option>' + data[i].Date + '</option>';
    }
    $('.option_wrap').append(str);
}
//对表格行行进行筛选
function filter_row() {
    $('.option_wrap').change(function () {
        var cur_val = $(this).find("option:selected").text(),
            $trs = $('.table_con tr');
        if (cur_val == '全部') {
            $trs.show();
            return false;
        }
        for (var i = 0, len = $trs.length; i < len; i++) {
            var $cur_td=$($trs[i]).children('td:first')
            if (cur_val == $cur_td.text()) {
                $trs.hide();
                $cur_td.parent('tr').show()
                return false;
            }
        }
    })
}