/*
 *@Version:	    v1.0(2014-07-31)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 充值统计走势
 */
//表格展示
function table_show_trend(data) {
    //显示表格
    //表格参数配置
    var table_data = {
        'column': {
            'Date': {
                'index': 0,
                'title': '日期',
                'width': '12%',
                'sort': false,
                'filter': false,
            },
            'Money': {
                'index': 1,
                'title': '充值总额',
                'width': '12%',
                'sort': false,
                'filter': true
            },
            'PayNum': {
                'index': 2,
                'title': '充值笔数',
                'width': '12%',
                'sort': false,
                'filter': true
            },
            'PayUsers': {
                'index': 3,
                'title': '充值人数',
                'width': '12%',
                'sort': false,
                'filter': true
            },
            'PerUserTimes': {
                'index': 4,
                'title': '人均充值笔数',
                'width': '12%',
                'sort': false,
                'filter': true
            },
            'PerUserMoney': {
                'index': 5,
                'title': '人均充值额度',
                'width': '12%',
                'sort': false,
                'filter': true
            },
            'PerTimesMoney': {
                'index': 6,
                'title': '平均单笔充值额度',
                'width': '16%',
                'sort': false,
                'filter': true
            }
        },
        'row': '',
        'column_num': 7
    }
    var row_data = get_table_data(data, common.get_keys(table_data.column));
    log(row_data);
    table_data.row = row_data;
    $('.wrap_table').empty().table(table_data);
    return table_data;
}