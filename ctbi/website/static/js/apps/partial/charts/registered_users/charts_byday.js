/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 多日数据图表展示
 */
var charts_show_byday = {
    init: function (data) {
        this._charts_show(data);
    },
    //图表展示
    _charts_show: function (data) {
        //显示图表
        var stock_data = this._get_stock_data(data);
        console.log(stock_data);
        $('.charts_wrap').highcharts('StockChart', {
            rangeSelector: {
                selected: 1,
                inputDateFormat: '%Y/%m/%d',
                inputEditDateFormat: '%Y/%m/%d',
                buttons: [{
                    type: 'day',
                    count: 5,
                    text: '5天'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1月'
                }, {
                    type: 'all',
                    count: 1,
                    text: 'All'
                }],

            },
            credits: {
                enabled: false
            },
            tooltip: {
                xDateFormat: '%Y/%m/%d'
            },
            title: {
                text: '多日注册人数统计'
            },
            type: 'datetime',
            series: stock_data
        });
    },
    //获取stock数据
    _get_stock_data: function (orgin_data) {
        var seriesOptions = [],
            names = [
                {
                    'key': 'Users',
                    'title': '注册人数'
                }
            ];
        $.each(names, function (i, name) {
            seriesOptions[i] = {
                name: name.title,
                data: []
            };
            for (var j = 0, len = orgin_data.length; j < len; j++) {
                var total_time = orgin_data[j].Date.toString();
                //high_stock内部采用UTC时间计算
                var snap_arr = [+new Date(total_time) + 8 * 60 * 60 * 1000, orgin_data[j][name.key]];
                seriesOptions[i].data.push(snap_arr);
            }
        })
        return seriesOptions
    }
}