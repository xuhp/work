/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 多月数据表格展示
 */
function table_show_bymonth(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'Date': {
                'index': 0,
                'title': '时间',
                'width': '50%',
                'sort': false,
                'filter': false,
                },
            'StandardUsers': {
                'index': 1,
                'title': '标准在线人数',
                'width': '50%',
                'sort': false,
                'filter': false
                }
            },
        'row': '',
        'column_num': 2
        }
        var row_data = get_table_data(data, ['Date', 'StandardUsers']);
        table_data.row = row_data;
        $('.table_wrap').table(table_data);
    return table_data;
}