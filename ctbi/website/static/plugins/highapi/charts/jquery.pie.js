/*
 *@Version:	    v1.0(2014-07-02)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 饼图
 */
 ;(function($){
 	$.fn.highcharts_pie=function(options){
 		var defaults={
 			title:'饼图',
			source:''
 		}
 		var opts=$.extend({},defaluts,options);
 		
 		var xaxis = [];
		var series = [{'type':'pie','name':'','data':[]}];
		
		for(key in opts.source['data']){
		    xaxis.push(key);
		}
		xaxis.sort();
		series[0]["name"] = opts.source["name"];
		for(var j = 0; j < xaxis.length; j++){
		    item = [];
		    item[0] = xaxis[j];
		    num = opts.source['data'][xaxis[j]];
		    item[1] = num;
		    series[0]['data'].push(item);
		}
		
		return this.each(function(){
			$this.highcharts({
		        chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false
		        },
		        title: {
		            text: opts.title
		        },
		        tooltip: {
		            pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
		        },
		        plotOptions: {
		            pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: true,
		                    color: '#000000',
		                    connectorColor: '#000000',
		                    format: '<b>{point.name}</b>: {point.percentage:.2f} %'
		                }
		            }
		        },
		        series: series
		    });
		})
 	}
 })(jQuery);