/*
 *@Version:	    v1.0(2014-07-31)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 充值金额占比
 */
//表格展示
function table_show_ratio_money(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'PayTypeName': {
                'index': 0,
                'title': '充值方式',
                'width': '35%',
                'sort': false,
                'filter': false,
            },
            'PayAmount': {
                'index': 1,
                'title': '充值金额',
                'width': '35%',
                'sort': false,
                'filter': true
            },
            'PerAmount': {
                'index': 2,
                'title': '占比',
                'width': '30%',
                'sort': false,
                'filter': true
            }
        },
        'row': '',
        'column_num':3
    }
    var row_data = get_table_data(data, common.get_keys(table_data.column));
    log(row_data);
    table_data.row = row_data;
    $('.money_table_wrap').empty().table(table_data);
    return table_data;
}