define(function (require, exports, module) {
	return function(jquery){
		var s = require('/Static/src/common/s_decmal');
		(function($){
			$.fn.tableTree = function(config){
				var $self = $(this);
				var tree = [];
				var total = {"Freeze":0,"Fact":0};
				var defaults = {
					data:[],
					sign:"sign"		
				}
				$.extend(defaults, config);
				var arrUL = [];
				for(var i = 0; i < 3; i++){
					arrUL[i] = $("#tableTree_" + i);
				}
				//json排序
				function jsonSort(jsondata){
					var oldjson = jsondata;
					var newjson = [];
					var parentID = ["0"];
					var ls = [];
					var level = 0;
					while(newjson.length<oldjson.length){
						for(var i=0;i<parentID.length;i++){
							for(var t=0;t<oldjson.length;t++){
								if(oldjson[t].ParentSubID == parentID[i]){
									oldjson[t].level = level;
									newjson.push(oldjson[t]);
									ls.push(oldjson[t].SubID);
								}
							}	
						}
						parentID = ls;
						ls = [];
						level = level +1;
					}
					return newjson;
				}
				//动态绘制树
				function drawTree(jsondata){
					var arrdata = jsonSort(jsondata);
					var sign = defaults.sign;
					for (var i = 0; i < arrdata.length; i++) {
						var nodeidStr = arrdata[i].SubID;
						var idStr = sign + '_' + nodeidStr;
						var pidStr = arrdata[i].ParentSubID;
						var nameStr = arrdata[i].SubName;
						var factStr = arrdata[i].Fact;
						var freezeStr = arrdata[i].Freeze;
						//子菜单li		
						var subitem = '<li class="' + idStr + '"><div class="div_'+idStr+'" nodeid="'+nodeidStr+'"><span id="switch_'+idStr+'" class="button switch switch_part"></span><span class="node-text">'+nameStr+'</span></div></li>';
						var subitem2 = '<li class="' + idStr + '"><div class="div_'+idStr+'" nodeid="'+nodeidStr+'">' + s.decmal_num(freezeStr) + '</div></li>';
						var subitem3 = '<li class="' + idStr + '"><div class="div_'+idStr+'" nodeid="'+nodeidStr+'">' + s.decmal_num(factStr)  + '</div></li>';
						//根据pid进行绘制
						if(pidStr == '0'){
								arrUL[0].append(subitem);
								arrUL[1].append(subitem2);
								arrUL[2].append(subitem3);
								total.Freeze = total.Freeze + arrdata[i].Freeze;
								total.Fact = total.Fact + arrdata[i].Fact;								
						}else{
							var $treePid = arrUL[0].find("."+sign+"_"+pidStr);
							if($treePid.length>0){
								if($treePid.children().length == 1){
									var $switchID = $("#switch_"+sign+"_"+pidStr);
									$switchID.addClass("switch_close");
									$treePid.append('<ul class="ul_'+sign+"_"+pidStr+'" pid="'+pidStr+'" style="display:none;">'+subitem+'</ul>');
									arrUL[1].find("."+sign+"_"+pidStr).append('<ul class="ul_'+sign+"_"+pidStr+'" pid="'+pidStr+'" style="display:none;">'+subitem2+'</ul>');
									arrUL[2].find("."+sign+"_"+pidStr).append('<ul class="ul_'+sign+"_"+pidStr+'" pid="'+pidStr+'" style="display:none;">'+subitem3+'</ul>');
								}else{
									arrUL[0].find(".ul_"+sign+"_"+pidStr).append(subitem);
									arrUL[1].find(".ul_"+sign+"_"+pidStr).append(subitem2);
									arrUL[2].find(".ul_"+sign+"_"+pidStr).append(subitem3);
								}								
							}
						}
					}
					return arrdata;
				}
				//请求数据并绘制表格
				tree = drawTree(defaults.data);
				//收缩伸展事件
				function nodeStretch(){
					var $switchUL = $(this).siblings("ul");
					if($switchUL.length>0){
						var pid = $switchUL.attr("pid");
						if($switchUL.css("display")!="none"){
							$(this).find(".switch").removeClass("switch_open").addClass("switch_close");
							$(".ul_"+defaults.sign+"_"+pid).slideUp(100);
						}else{
							$(this).find(".switch").removeClass("switch_close").addClass("switch_open");
							$(".ul_"+defaults.sign+"_"+pid).slideDown(100);
						}	
						
					}					
				}
				//11,绑定事件
				for(var i = 0; i < 3; i++){
					//绑定收缩伸展
					arrUL[i].delegate("div","click",nodeStretch);
					//绑定鼠标滑过
					arrUL[i].delegate("div","mouseenter mouseleave",function(){
						var nodeid = $(this).attr("nodeid");
						$(".div_"+defaults.sign+"_"+nodeid).toggleClass("entered");
					});
				}
				return total;
			}
		})(jquery);					
	}	
});