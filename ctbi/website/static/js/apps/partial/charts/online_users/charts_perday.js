/*
 *@Version:	    v1.0(2014-07-16)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 每日数据图表展示
 */
var charts_show_perday = {
    init: function (data) {
        this._charts_show(data);
    },
    //图表展示
    _charts_show: function (data) {
        //显示图表
        var stock_data = this._get_stock_data(data);
        $('.charts_wrap').highcharts('StockChart', {
            rangeSelector: {
                selected: 1,
                inputDateFormat: '%H:%M:%S',
                inputEditDateFormat: '%H:%M:%S',
                buttons: [{
                    type: 'hour',
                    count: 1,
                    text: '1h'
                }, {
                    type: 'day',
                    count: 1,
                    text: '1D'
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
                xDateFormat: "%H:%M:%S"
            },
            title: {
                text: '在线人数统计'
            },
            type: 'datetime',
            series: stock_data
        });
    },
    //获取显示数据
    _get_stock_data: function (orgin_data) {
        var seriesOptions = [],
            names = [
                {
                    'key': 'Users',
                    'title': '在线人数'
                }
            ];
        $.each(names, function (i, name) {
            seriesOptions[i] = {
                name: name.title,
                data: []
            };
            for (var j = 0, len = orgin_data.length; j < len; j++) {
                var time = orgin_data[j].Time;
                var total_time = common.to_split_date(orgin_data[j].Date).toString() + ' ' + time
                //high_stock内部采用UTC时间计算
                var snap_arr = [+new Date(total_time) + 8 * 60 * 60 * 1000, orgin_data[j].Users];
                seriesOptions[i].data.push(snap_arr);
            }
        })
        return seriesOptions
    }
}