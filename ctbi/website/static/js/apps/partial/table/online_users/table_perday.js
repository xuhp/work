/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 单日数据表格展示
 */
function table_show_perday(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'Time': {
                'index': 0,
                'title': '时间',
                'width': '50%',
                'sort': false,
                'filter': false,
            },
            'Users': {
                'index': 1,
                'title': '在线人数',
                'width': '50%',
                'sort': false,
                'filter': true
            }
        },
        'row': '',
        'column_num': 2
    }
    var row_data = get_table_data(data, ['Time', 'Users']);
    table_data.row = row_data;
    $('.table_wrap').table(table_data);
    log(table_data);
    return table_data;
}