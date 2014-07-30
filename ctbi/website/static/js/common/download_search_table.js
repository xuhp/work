/*
 *@Version:	    v1.0(2014-07-26)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 下载搜索表格数据
 */

var download_search_table = {
    init: function (data) {
        if (data == undefined) {
            alert('只有在有数据的时候才能下载。')
            return false;
        }
        var download_data = this._get_download_data(data);

        this._download(download_data);
    },
    //转化为下载所需数据
    _get_download_data: function (data) {
        var keys = get_key(data.column),
        len = keys.length,
        data_row = [];
        //获取表格标题
        var title_arr = [];
        for (var i = 0; i < len; i++) {
            title_arr[i] = data.column[keys[i]].title;
        }
        data_row.push(title_arr);
        //获取数据项
        for (var i = 0, data_len = data.row.length; i < data_len; i++) {
            var row_arr = [];
            for (var j = 0; j < len; j++) {
                row_arr[j] = data.row[i].values[keys[j]];
            }
            data_row.push(row_arr);
        }
        return download_data = {
            'data': JSON.stringify(data_row)
        }
    },
    //实现表格下载
    _download: function (parms) {
        var str = '<form id="form" style="display:none;" target="" method="post" action="' + url.domain + url.port + interFace.general_download + '">' +
       "<input type='hidden' name='data' value='" + parms.data + "'/>" +
       '<input type="hidden" name="exportData" value="' + (new Date()).getMilliseconds() + '"/>' +
       '</form>';
        $('body').append(str);
        $('form').submit();
    }
}
//获取key
function get_key(data) {
    var keys = [];
    for (var key in data) {
        keys.push(key);
    }
    return keys;
};