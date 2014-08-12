/*
 *@Version:	    v1.0(2014-07-26)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 对数据搜索的日期字段进行判断
 */
var date_judgment = {
    byday: function (start, end) {
        //日期不能为空
        if (start == '' || end == '') {
            alert(tipsStr.search_tip);
            return false;
        }
        //控制日期范围，不能大于90天
        var diff = (+new Date(end)) - (+new Date(start));
        if (diff < 0) {
            alert(tipsStr.date_diff);
            return false;
        }
        if (diff > 90 * 24 * 60 * 60 * 1000) {
            alert(tipsStr.gt_90day);
            return false;
        }
        return true;
    },
    bymonth: function (start, end) {
        //日期不能为空
        if (start == '' || end == '') {
            alert(tipsStr.search_tip);
            return false;
        }
        //控制日期范围，不能大于24个月
        var start_arr = start.split('/'),
            end_arr = end.split('/');
        var diff = (parseInt(end_arr[0]) - parseInt(start_arr[0])) * 12 + parseInt(end_arr[1]) - parseInt(start_arr[1]);
        if (diff < 0) {
            alert(tipsStr.date_diff);
            return false;
        }
        if (diff > 24) {
            alert(tipsStr.gt_24month);
            return false;
        }
        return true;
    }
}
