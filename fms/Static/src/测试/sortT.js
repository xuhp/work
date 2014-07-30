	define(function (require, exports, module) {
	return function(jquery){
		require('/Static/src/plugin/sortTable/sortTable')(jquery);
		require('/Static/src/plugin/sortTable/css/sort.css');
		require('/Static/src/plugin/stree/jquery.stree.part')(jquery);
		require('/Static/src/plugin/stree/css/stree.css');
		require('/Static/src/plugin/stree/jquery.stree.table')(jquery);
		var common = require('/Static/src/common');
		var s = require('/Static/src/common/s_decmal');
		(function($){
			$.fn.sortT = function(){
				var tilArr = ["#budgetTitle","#budgetTitle2"];
				var idArr = ["budgetTable","budgetTable2"];
				$.sortTable({
					tilArr:tilArr,
					idArr:idArr
				});
				//业务选择
                $(".app-bus").partTree({
                    ajaxUrl:"/Static/tests/data/tree2.js",
                    sign: "bus",
                    elem: "#busBox"
                });	
				$("#node_Sub").partTree({
					ajaxUrl:"/Static/tests/data/tree2.js",
					sign:"sub",
					elem:"#subBox"								
				});
				var oBudget = [
					{
						"BusID": 0,
						"CreateDate": 0,
						"CreateTime": 0,
						"Fact": -300,
						"Freeze": -200,
						"ParentSubID": 0,
						"PeriodID": 0,
						"SubID": 1,
						"SubName": "啊打死打伤的"
					},
					{
						"BusID": 0,
						"CreateDate": 0,
						"CreateTime": 0,
						"Fact": -300,
						"Freeze": -200,
						"ParentSubID": 1,
						"PeriodID": 0,
						"SubID": 2,
						"SubName": "大嵩岛"
					},
					{
						"BusID": 0,
						"CreateDate": 0,
						"CreateTime": 0,
						"Fact": 300,
						"Freeze": 200,
						"ParentSubID": 2,
						"PeriodID": 0,
						"SubID": 3,
						"SubName": "使肤色地方撒旦"
					},
					{
						"BusID": 0,
						"CreateDate": 0,
						"CreateTime": 0,
						"Fact": 300,
						"Freeze": 200,
						"ParentSubID": 0,
						"PeriodID": 0,
						"SubID": 15,
						"SubName": "业务费用"
					},
					{
						"BusID": 0,
						"CreateDate": 0,
						"CreateTime": 0,
						"Fact": 300,
						"Freeze": 200,
						"ParentSubID": 0,
						"PeriodID": 0,
						"SubID": 20,
						"SubName": "宣传费"
					},
					{
						"BusID": 0,
						"CreateDate": 0,
						"CreateTime": 0,
						"Fact": 300,
						"Freeze": 200,
						"ParentSubID": 15,
						"PeriodID": 0,
						"SubID": 2155,
						"SubName": "12323213"
					}
				]
				$("#treeTable").tableTree({
					data:oBudget
				});
				//console.log(common.toTime(12332));
				//console.log(s.decmal_num(-123));
			}
		})(jquery);	
	}	
});