/*
 *@Version:	    v1.0(2014-07-10)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 获取适合表格展示的数据
 */
function get_table_data(data, opts) {
    var row_data=[];
    for (var i = 0, len = data.length; i < len; i++) {
        row_data[i] = {
            'values': {
            },
            'Sort':i
        }
        for (var j = 0, opts_len = opts.length; j < opts_len; j++) {
            row_data[i].values[opts[j]] = data[i][opts[j]]
        }
    }
    return row_data;
}



