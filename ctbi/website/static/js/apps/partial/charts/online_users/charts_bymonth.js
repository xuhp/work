/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 多日数据图标展示
 */
var charts_bymonth = {
    init: function (data) {
        this._charts_show(data);
    },
    //图表展示
    _charts_show: function (data) {
        //显示图表
        var stock_data = this._get_stock_data(data);
        $('.charts_wrap').highcharts('StockChart', {
            rangeSelector: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                xDateFormat: '%Y/%m'
            },
            title: {
                text: '多月标准在线人数'
            },
            xAxis:{
                dateTimeLabelFormats:{
                    millisecond: '%H:%M:%S.%L',
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%m/%e',
                    week: '%m/%e',
                    month: '%Y/%m ',
                    year: '%Y'
                }
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
                    'key': 'StandardUsers',
                    'title': '标准在线人数'
                }
            ];
        $.each(names, function (i, name) {
            seriesOptions[i] = {
                name: name.title,
                data: []
            };
            for (var j = 0, len = orgin_data.length; j < len; j++) {
                var total_time = orgin_data[j].Date.toString()+'/00';
                //high_stock内部采用UTC时间计算
                console.log(total_time);
                var snap_arr = [+new Date(total_time), orgin_data[j][name.key]];
                seriesOptions[i].data.push(snap_arr);
            }
        })
        return seriesOptions
    }
}