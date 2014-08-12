/*
 *@Version:	    v1.0(2014-07-21)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 充值方式人数占比
 */

var charts_show_ratio_users = {
    init: function(data){
        this._charts_show(data);
    },
    //图表展示
    _charts_show: function (data) {

        var series_data = this._get_series_data(data);

        $('.users_charts_wrap ').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: '充值方式人数占比'
            },
            credits: {
                enabled: false,
                href: "http://www.ct108.com/",
                text: '畅唐科技'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: '占比',
                data: series_data
            }]
        });
    },
    //获取占比值数组
    _get_series_data: function (data) {
        log(data);
        var series_data = [],
            i = 0;
        while (i < 7) {
            if (i == 0) {
                series_data.push({
                    name: data[i].PayTypeName,
                    y: parseFloat(data[i].PerUsers),
                    sliced: true,
                    selected: true
                })
            } else {
                series_data.push([
                    data[i].PayTypeName, parseFloat(data[i].PerUsers)
                ])
            }
            i++;
        }
        var others = 0;
        for (var i = 7, len = data.length; i < len; i++) {
            others += parseFloat(data[i].PerUsers)
        }
        series_data.push(['others', others]);
        log(series_data);
        return series_data;
    }

}