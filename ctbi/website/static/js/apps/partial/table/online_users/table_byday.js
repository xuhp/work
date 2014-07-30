/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 多日数据表格展示
 */
//表格展示
function table_show_byday(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'Date': {
                'index': 0,
                'title': '时间',
                'width': '30%',
                'sort': false,
                'filter': false,
            },
            'AvgUsers': {
                'index': 1,
                'title': '平均在线人数',
                'width': '35%',
                'sort': false,
                'filter': true
            },
            'MaxUsers': {
                'index': 2,
                'title': '最高在线人数',
                'width': '35%',
                'sort': false,
                'filter': true
            }
        },
        'row': '',
        'column_num': 3
    }
    var row_data = get_table_data(data, ['Date', 'AvgUsers', 'MaxUsers']);
    table_data.row = row_data;
    $('.table_wrap').table(table_data);
    return table_data;
}