/*
 *@Version:	    v1.0(2014-07-02)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 折线图
 */
 ;(function($){
     $.fn.highcharts_line = function (options) {
		var defaults={
			title:'折线图',
			sideTip:'',
			unit: '',
            min:null,
            source: '',
            xstep: null
		};
		var opts=$.extend({},defaults,options);
		
		var xaxis = [];//x轴坐标值
		var series = [];//数据分类
		
		if(opts.source.length > 0){
		    for(key in opts.source[0]['data']){
		        xaxis.push(key);
		    }
		    xaxis.sort();
		    for(var i = 0; i < opts.source.length; i++){
		        var item = {};
		        item["name"] = opts.source[i]["name"];
		        item["data"] = [];
		        for(var j = 0; j < xaxis.length; j++){
		            num = opts.source[i]['data'][xaxis[j]];
		            item['data'].push(num);
		        }
		        series.push(item);
		    }
		}
		
		return this.each(function(){
		    $(this).highcharts({
		        title: {
		            text: opts.title,
		            x: -20
		        },
		        credits: {
		            enabled: false,
		            href: "http://www.ct108.com/",
		            text: '畅唐科技'
		        },
		        scrollbar: {
		            enabled: true
		        },
		        subtitle: {
		            text: '',
		            x: -20
		        },
		        xAxis: {
		            tickPixelInterval: 200,
		            categories: xaxis
		        },
		        yAxis: {
		            min: opts.min,
		            title: {
		                text: opts.sideTip
		            },
		            plotLines: [{
		                value: 0,
		                width: 1,
		                color: '#808080'
		            }]
		        },
		        tooltip: {
		            valueSuffix: opts.unit
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            borderWidth: 0
		        },
		        series: series
		    });
		})
 	}
 })(jQuery);