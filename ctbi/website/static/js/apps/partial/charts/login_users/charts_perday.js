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
        var categories_arr = this._get_xAxis(data);
        //显示图表
        var series_data = this._get_series_data(data);

        $('.charts_wrap').highcharts({
            title: {
                text:'大厅单日登陆人数'
            },
            credits: {
                enabled: false,
                href: "http://www.ct108.com/",
                text: '畅唐科技'
            },
            xAxis: {
                categories: categories_arr
            },
            yAxis: {
                title: {
                    text: '人数 (个)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ''
            },
            series: series_data
        });
    },
    //获取x周坐标
    _get_xAxis: function (data) {
        var categories = [];
        for (var i = 0, len = data.length; i < len; i++) {
            categories[i] = data[i].Trange;
        }
        return categories;
    },
    //获取显示数据
    _get_series_data: function (data) {
        var seriesOptions = [],
            names = [
                {
                    'key': 'Users',
                    'title': '登陆人数（人）'
                }, {
                    'key': 'Times',
                    'title': '登陆人次（次）'
                }
            ];
        $.each(names, function (i, name) {
            seriesOptions[i] = {
                name: name.title,
                data: []
            };
            for (var j = 0, len = data.length; j < len; j++) {
                seriesOptions[i].data[j] = data[j][name.key];
            }
        })
        return seriesOptions
    }
}