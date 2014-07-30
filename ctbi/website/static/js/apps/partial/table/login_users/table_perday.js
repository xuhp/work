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
            'Trange': {
                'index': 0,
                'title': 'ID',
                'width': '30%',
                'sort': false,
                'filter': false,
            },
            'Users': {
                'index': 1,
                'title': '登陆人数',
                'width': '35%',
                'sort': false,
                'filter': true
            },
            'Times': {
                'index': 2,
                'title': '登陆人次',
                'width': '35%',
                'sort': false,
                'filter': true
            }
        },
        'row': '',
        'column_num': 3
    }
    var row_data = get_table_data(data, ['Trange', 'Users', 'Times']);
    table_data.row = row_data;
    $('.table_wrap').table(table_data);
    return table_data;
}