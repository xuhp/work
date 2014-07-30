define(function (require, exports, module) {
	return function(jquery){
		require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')(jquery);
		require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
		require('/Static/src/plugin/DValidator/DValidator')(jquery);
		require('/Static/src/plugin/DValidator/css/validator.css');
		(function($){
			$.fn.stree = function(config){
				var self = this;
				var tree = [];
				var defaults = {	
					data: {
						ajaxUrl:"",
						stId:""
					},
					view:{
						ulId:"Tree",
						tips:"item",
						til:"节点",
						stretch:true	
					},
					operate:{
						isAdd:false,
						isEdit:false,
						isRemove:false,
						isTransfer:false,
						addNode:addNode,
						editNode:editNode,
						removeNode:removeNode,
						transferNode:transferNode,
						callBack:callBack
					}
				}
				function addNode(){}
				function editNode(){}
				function removeNode(){}
				function transferNode(){}
				function callBack(){}
				$.extend(defaults, config);
				//获取json的ajax请求
				function getTreeAjax(data,backFn){
					$.ajax({
						url: data.ajaxUrl,
						cache: false,
						async: false,
						dataType: 'json',
						type: "GET",
						data: { "typeID": data.stId }, 
						success: function(treedata){
							backFn&&backFn(treedata);
						},
						error:function(error){
							 window.location.href = error.responseText;
						}
					});
				}
				//json排序
				function jsonSort(jsondata){
					var oldjson = jsondata;
					var newjson = [];
					var parentID = ["0"];
					var ls = [];
					var hie = 0;
					while(newjson.length<oldjson.length){
						for(var i=0;i<parentID.length;i++){
							for(var t=0;t<oldjson.length;t++){
								if(oldjson[t].pid == parentID[i]){
									oldjson[t].hie = hie;
									newjson.push(oldjson[t]);
									ls.push(oldjson[t].id);
								}
							}	
						}
						parentID = ls;
						ls = [];
						hie = hie +1;
					}
					jsondata = newjson;
					return jsondata;
				}
				//判断操作权限
				function isOperate(idStr){
					var addStr = '';
					var editStr = '';
					var removeStr = '';
					var transferStr =  '';
					if(defaults.operate.isAdd){
						addStr = '<span id="addBtn_'+idStr+'" class="button operate add" title="添加";"></span>';	
					}
					if(defaults.operate.isEdit){
						editStr = '<span id="editBtn_'+idStr+'" class="button operate edit" title="编辑"></span>';
					}
					if(defaults.operate.isRemove){
						removeStr = '<span id="removeBtn_'+idStr+'" class="button operate remove" title="删除"></span>';
					}
					if(defaults.operate.isTransfer){
						transferStr = '<span id="transferBtn_'+idStr+'" class="button operate transfer" title="移交"></span>';
					}
						var operatestr = addStr+removeStr+editStr+transferStr;
						return operatestr 
				}
				//动态绘制树
				function drawTree(jsondata,tips){
					$(self).empty();
					var arrdata = jsonSort(jsondata);
					var operateStr = '';
					var subitem = '';
					var switchIcon = '';
					var codeStr = '';
					var openArr = new Array();
					var inheritArr = new Array();
					//判断操作权限
					for (var i = 0; i < arrdata.length; i++) {
						//防止内容溢出			
						var idStr = tips+'_'+arrdata[i].id;
						var parenrID = arrdata[i].pid;
						var nameStr = arrdata[i].name;
						var levelStr = arrdata[i].level;
						var descStr = arrdata[i].desc;
						var nodeidStr = arrdata[i].id;
						var hieStr = arrdata[i].hie;
						operateStr = isOperate(idStr);
						if(arrdata[i].hasOwnProperty("isinherit")){
							inheritArr.push({AID:"a_"+idStr,value:arrdata[i].isinherit,inherit:arrdata[i].inherit});						 	
						}
						//子菜单li
						if(arrdata[i].hasOwnProperty("code")){
							codeStr = '['+arrdata[i].code+']';
						}
						//子菜单li		
						switchIcon = '<span id="switch_'+idStr+'" class="button switch"></span>';
							//根据pid进行绘制
						if(parenrID == '0'){
							subitem = '<li id="Tree_'+idStr+'" level="'+levelStr+'"><div id="div_'+idStr+'" order="'+i+'" creepname="'+nameStr+'">'+switchIcon+'<a id="a_'+idStr+'" title="'+descStr+'" nodeid="'+nodeidStr+'" nodename="'+nameStr+'"><span id="ico_'+idStr+'" class="button icon"></span><span class="node-text" hie="'+hieStr+'">'+nameStr+codeStr+'</span></a><p order="'+i+'">'+operateStr+'</p></div></li>';
							$(self).append(subitem);
						}else{
							var $tipsTreePid = $("#Tree_"+tips+'_'+parenrID);
							var $tipsTreePidDiv = $("#div_"+tips+'_'+parenrID);
							var creepname = $tipsTreePidDiv.attr("creepname");
							subitem = '<li id="Tree_'+idStr+'" level="'+levelStr+'"><div id="div_'+idStr+'" order="'+i+'" creepname="'+creepname+'-'+nameStr+'">'+switchIcon+'<a id="a_'+idStr+'" title="'+descStr+'" nodeid="'+nodeidStr+'" nodename="'+nameStr+'"><span id="ico_'+idStr+'" class="button icon"></span><span class="node-text" hie="'+hieStr+'">'+nameStr+codeStr+'</span></a><p order="'+i+'">'+operateStr+'</p></div></li>';
							if($tipsTreePid.length>0){
								if($tipsTreePid.children().length == 1){
									var $switchID = $("#switch_"+tips+'_'+parenrID);
									var pOrder = $tipsTreePidDiv.attr("order");								
									if(arrdata[pOrder].hasOwnProperty("isopen")){
										if(arrdata[pOrder].isopen==0){
											$switchID.addClass("switch_close");
											$tipsTreePid.append('<ul id="ul_'+tips+'_'+arrdata[i].pid+'" class="clearfix" style="display:none;">'+subitem+'</ul>');
										}else{
											$switchID.addClass("switch_open");
											$tipsTreePid.append('<ul id="ul_'+tips+'_'+arrdata[i].pid+'" class="clearfix">'+subitem+'</ul>');
										}
									}else{
										arrdata[pOrder].isopen = 0;
										$switchID.addClass("switch_close");
										$tipsTreePid.append('<ul id="ul_'+tips+'_'+arrdata[i].pid+'" class="clearfix" style="display:none;">'+subitem+'</ul>');	
									}
								}else{
									$tipsTreePid.children().eq(1).append(subitem);
								}
							}
						}
					}
					if(inheritArr.length!=0){
						$(inheritArr).each(function(index,el){
							if(el.value){
								$("#"+el.AID).addClass("inherit").siblings("p").remove();		
							}else{
								$("#"+el.AID).addClass("inherit-no");
							}
							$("#"+el.AID).attr("inherit",el.inherit);	
							
						})
					}	
					return arrdata;
				}
				//判断获取地址是否为空
				if(defaults.data.ajaxUrl==""){
					art.dialog({
						icon: 'error',
						lock: true,
						content: "请求地址为空哦！"
					});
					return false;
				}
				//获取json后的操作
				getTreeAjax&&getTreeAjax(defaults.data,function(treedata){
					tree = drawTree(treedata,defaults.view.tips);			
				});
				function changeTree(cjson,ojson){
					var changejson = cjson;
					var oldjson = ojson;
					for(var i=0;i<changejson.length;i++){
						for(var j=0;j<oldjson.length;j++){
							if(changejson[i].id==oldjson[j].id){	
								if(oldjson[j].hasOwnProperty("isopen")){
									changejson[i].isopen = oldjson[j].isopen;	
								}															
								break;	
							}					
						}	
					}
					return changejson;
				}
				//绑定鼠标滑过
				$("#"+defaults.view.ulId+" li div").die().live("mouseenter mouseleave",nodeHover);
				//鼠标滑过
				function nodeHover(){
					$(this).toggleClass("entered");
					$(this).children("p").toggleClass("show");
				}
				//改变滚动条
				function changeSrcoll(){
					setTimeout(function(){
						defaults.operate.callBack&&defaults.operate.callBack("#"+defaults.view.ulId);		 	
					},200);										
				}
				//绑定收缩伸展
				function nodeStretch(){
					var $switchUL = $(this).siblings("ul");
					var ci = $(this).attr("order");
					if($switchUL.length>0){
						var ulHeight =  $switchUL.height();
						var totalHeight = $(self).height();
						if($switchUL.css("display")!="none"){
							$(this).find(".switch").removeClass("switch_open").addClass("switch_close");
							$switchUL.slideUp(100);
							tree[ci].isopen = 0;
							$(self).height(totalHeight - ulHeight);	
						}else{
							$(this).find(".ico").addClass("on");
							$(this).find(".switch").removeClass("switch_close").addClass("switch_open");
							$switchUL.slideDown(100);
							tree[ci].isopen = 1;
							$(self).height(totalHeight + ulHeight);
						}
						changeSrcoll();
					}						
				}
				function nodeStretch2(){
					var $switchUL = $(this).parent().siblings("ul");
					var ci = $(this).parent().attr("order");
					if($switchUL.length>0){
						var ulHeight =  $switchUL.height();
						var totalHeight = $(self).height();
						if($switchUL.css("display")!="none"){
							$(this).removeClass("switch_open").addClass("switch_close");
							$switchUL.slideUp(100);
							tree[ci].isopen = 0;
							$(self).height(totalHeight - ulHeight);	
						}else{
							$(this).find(".ico").addClass("on");
							$(this).removeClass("switch_close").addClass("switch_open");
							$switchUL.slideDown(100);
							tree[ci].isopen = 1;
							$(self).height(totalHeight + ulHeight);
						}
						changeSrcoll();
					}						
				}
				//绑定收缩伸展
				if(defaults.view.stretch){
					$("#"+defaults.view.ulId+" div").die().live("click",nodeStretch);
				}else{
					$("#"+defaults.view.ulId+" .switch").die().live("click",nodeStretch2);	
				}
				
				//判断添加
				if(defaults.operate.isAdd){
					$("#"+defaults.view.ulId+" .add").live("click",function(event){
						var cOrder = $(this).parent().attr("order");
						defaults.operate.addNode&&defaults.operate.addNode(cOrder,defaults.view,tree,function(){
							getTreeAjax&&getTreeAjax(defaults.data,function(ajaxdata){
								tree[cOrder].isopen = 1;
								var chengedjson = changeTree(ajaxdata,tree);
								tree = drawTree(chengedjson,defaults.view.tips);
								$(self).height("auto");
								changeSrcoll();			
							});
						});
						event.stopPropagation();
					});
					$("#addBtn_"+defaults.view.tips+"_0").bind("click",function(){
						defaults.operate.addNode&&defaults.operate.addNode(-1,defaults.view,tree,function(){
							getTreeAjax&&getTreeAjax(defaults.data,function(ajaxdata){
								var chengedjson = changeTree(ajaxdata,tree);
								tree = drawTree(chengedjson,defaults.view.tips);
								$(self).height("auto");
								changeSrcoll();				
							});
						});
					});
				}
				//判断编辑
				if(defaults.operate.isEdit){
					$("#"+defaults.view.ulId+" .edit").live("click",function(event){
						var cOrder = $(this).parent().attr("order");
						defaults.operate.editNode&&defaults.operate.editNode(cOrder,defaults.view,tree,function(opt){
							tree.splice(cOrder,1,opt);	
							tree = drawTree(tree,defaults.view.tips);
						});
						event.stopPropagation();
					});
				}
				//判断删除
				if(defaults.operate.isRemove){
					$("#"+defaults.view.ulId+" .remove").live("click",function(event){
						var cOrder = $(this).parent().attr("order");
						var cSibNum = $(this).parent().parent().siblings().length;
						defaults.operate.removeNode&&defaults.operate.removeNode(cOrder,cSibNum,defaults.view,tree,function(){
							tree.splice(cOrder,1);
							tree = drawTree(tree,defaults.view.tips);
							$(self).height("auto");
							changeSrcoll();
						});
						event.stopPropagation();
					});
				}
				//判断移交
				if(defaults.operate.isTransfer){
					$("#"+defaults.view.ulId+" .transfer").live("click",function(event){
						var cOrder = $(this).parent().attr("order");
						var hideLi = $(this).parent().parent().parent().attr("id");
						defaults.operate.transferNode&&defaults.operate.transferNode(cOrder,defaults.view,tree,hideLi,function(tOrder){
							getTreeAjax&&getTreeAjax(defaults.data,function(ajaxdata){
								if(tOrder != "-1"){
									tree[tOrder].isopen = 1;
								}								
								var chengedjson = changeTree(ajaxdata,tree);
								tree = drawTree(chengedjson,defaults.view.tips);
								$(self).height("auto");
								changeSrcoll();		
							});
						});
						event.stopPropagation();
					});
				}
				return tree;
			}
		})(jquery);
	}
});


