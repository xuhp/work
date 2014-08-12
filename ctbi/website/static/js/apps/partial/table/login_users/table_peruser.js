/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 登陆情况分析
 */
function table_show_peruser(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'Uid': {
                'index': 1,
                'title': '用户ID',
                'width': '50%',
                'sort': false,
                'filter': true
            },
            'Times': {
                'index': 2,
                'title': '登陆人次',
                'width': '50%',
                'sort': false,
                'filter': true
            }
        },
        'row': '',
        'column_num': 2
    }
    var row_data = get_table_data(data, common.get_keys(table_data.column));
    table_data.row = row_data;
    $('.table_show').empty().table(table_data);
    return table_data;
}