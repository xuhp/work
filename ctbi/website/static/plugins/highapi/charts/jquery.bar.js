/*
 *@Version:	    v1.0(2014-07-02)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 柱状图 —— 横向
 */
 ;(function($){
 	$.fn.highcharts_bar=function(options){
 		var defaults={
			title:'柱状图-横向',
			sideTip:'',
			unit:'',
			source:''
		};
		var opts=$.extend({},defaluts,options);
		
		var xaxis = [];
	    var series = [];
	
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
	            chart: {
	                type: 'bar'
	            },
	            title: {
	                text: opts.title,
	                x: -20
	            },
	            subtitle: {
	                text: '',
	                x: -20
	            },
	            xAxis: {
	                categories: xaxis
	            },
	            yAxis: {
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
	    });
 	}
 })(jQuery);