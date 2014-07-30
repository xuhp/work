define(function (require, exports, module) {
	return function(jquery){
		require('/Static/src/plugin/stree/css/stree.css');
		(function($){
			$.fn.partTree = function(config){
				var defaults = {
					ajaxUrl:"",
					id:"id",
					pid:"pid",
					name:"name",
					sign:"sign",
					elem:"#popBox",
					type:"1",
					end:true,
					creep:true,
					addFun:addFun		
				}
				function addFun(){}
				$.extend(defaults, config);
				this.attr("nodeid","");//设置节点id为空
				var partdara = [];//data初始化
				var treedata = [];
				//获取json的ajax请求
				function getPartAjax(backFn){
					$.ajax({
						url: defaults.ajaxUrl,
						cache: false,
						async: false,
						dataType: 'json',
						success: function(data){
							partdara = data;
						},
						error:function(error){
							window.location.href = error.responseText;
						}
					});
				}
				//1,获取数据但是暂不显示
				getPartAjax&&getPartAjax();
				//json排序
				function jsonSort(jsondata){
					var oldjson = jsondata;
					var newjson = [];
					var parentID = [0];
					var ls = [];
					while(newjson.length<oldjson.length){
						for(var i=0;i<parentID.length;i++){
							for(var t=0;t<oldjson.length;t++){
								if(oldjson[t][defaults.pid] == parentID[i]){
									newjson.push(oldjson[t]);
									ls.push(oldjson[t][defaults.id]);
								}
							}	
						}
						parentID = ls;
						ls = [];		
					}
					return newjson;								
				}
				//绘制树
				function drawTree(jsondata){
					var arrdata=jsonSort(jsondata);
					treedata = 	arrdata;		
					for (var i = 0; i < arrdata.length; i++) {
						var nodeidStr = arrdata[i][defaults.id];
						var idStr = defaults.sign+'_'+nodeidStr; 
						var nameStr = arrdata[i][defaults.name];
						var parenrID = arrdata[i][defaults.pid];
						var icon= '';
						if(defaults.type==1){
							icon='<span id="ico_'+idStr+'" class="button icon"></span>';	
						}
						//子菜单li		
						var switchIcon = '<span id="switch_'+idStr+'" class="button switch switch_part"></span>';
						var subitem = '<li id="'+idStr+'" class="'+defaults.sign+'-item" order="'+i+'"><div id="div_'+idStr+'" class="div_'+defaults.sign+'" order="'+i+'">'+switchIcon+'<a id="a_'+idStr+'" class="a_'+defaults.sign+'" title="'+nameStr+'" nodeid="'+nodeidStr+'" nodepid="'+parenrID+'"><input class="checknode" type="checkbox" />'+icon+'<span class="node-text">'+nameStr+'</span></a></div></li>';
						//根据pid进行绘制
						if(parenrID == '0'){
							$("#"+defaults.sign+"Tree").append(subitem);
						}else{
							var $treePid = $("#"+defaults.sign+"_"+parenrID);
							if($treePid.length>0){
								if($treePid.children().length == 1){
									var $switchID = $("#switch_"+defaults.sign+"_"+parenrID);
									 $switchID.addClass("switch_close");
									$treePid.append('<ul id="ul_'+idStr+'">'+subitem+'</ul>');
									$treePid.children().eq(1).hide(); 
								}else{
									$treePid.children().eq(1).append(subitem);
								}
							}							
						}						
					}
				}
				//创建弹出框
				function creatBox(jsondata){
					var box ='<div id="'+defaults.sign+'Box" class="'+defaults.sign+'box popbox"><div id="'+defaults.sign+'TreeWrap" class="streewrap clearfix"><ul id="'+defaults.sign+'Tree" class="stree clearfix"></ul></div><div class="buttonwrap"><button id="'+defaults.sign+'Deter" class="sureBtn blueBtn  h26 pl10 w180">确定</button></div>';
					$("body").append(box);
					drawTree&&drawTree(jsondata);
					//是否只能选择末节点
					if(defaults.end){
						$("#"+defaults.sign+"Tree li").each(function(index,el){
							var order = $(el).attr("order");
							var curID = treedata[order][defaults.id];
							for(var i=0;i<treedata.length;i++){
								if(treedata[i][defaults.pid] == curID){
									var $treeCheck = $(el).children("div").find(".checknode");
									$treeCheck.attr("disabled","disabled");
									break;	
								}
							}	
						});				
					}					
				}
				//调整位置
				function adjustPos(org){
					var winH = $(window).height();//当前窗口的高度
					var orgH = org.outerHeight(true);//输入框的高度
					var orgTop = org.offset().top;//相对当前窗口的顶部偏移
					var orgBom = winH - orgTop - orgH;
					if(orgBom < 224 ){
						$(defaults.elem).height(186);
						$("#"+defaults.sign+"TreeWrap").height(144);
					}else{
						$(defaults.elem).height(222);
						$("#"+defaults.sign+"TreeWrap").height(180);
					}
					if(orgBom >= 190){
						$(defaults.elem).css({
							"top":orgTop + orgH -1,
							"left":org.offset().left
						});						
					}else{
						$(defaults.elem).css({
							"top":orgTop -188 + 1,
							"left":org.offset().left
						});							
					}
					$(defaults.elem).show();	
				}
				//2,绑定点击事件
				this.die("mousedown").live("mousedown",function(event){
					var self = this;
					var selfID = $(self).attr("id");
//					console.log(selfID+" "+$(defaults.elem).length+" "+$(".popbox").length);
					if($(".popbox").length > 0){
						$(".popbox").hide();
					}
					if($(defaults.elem).length < 1){
						creatBox(partdara);
					}
					adjustPos($(self));
					var $popBox = $(defaults.elem);
					$popBox.find('.checknode').attr('checked',false);
					//点击确定赋值
					$("#"+defaults.sign+"Deter").die().live("click",function(){ 
						var $checkedInput = $(defaults.elem).find(".checknode:checked");
						var checkedLength = $checkedInput.length;
						if(checkedLength>0){
							var $checkedNode = $checkedInput.parent();
							var nodeid = $checkedNode.attr("nodeid");
							var nodetil = $checkedNode.attr("title");
							var singleTitle = nodetil;
							if (defaults.creep) {	
								var nodepid = $checkedNode.attr("nodepid");
								while(nodepid!="0"){
									var $pnode = $("#a_"+defaults.sign+'_'+nodepid);
									nodetil = $pnode.attr("title") + " - " + nodetil;
									nodepid = $pnode.attr("nodepid");									
								}
							}
							$(self).val(nodetil);
							$(self).attr("title", nodetil);
							$(self).attr("nodeid", nodeid);
							$(self).attr("stitle",singleTitle);
							defaults.addFun&&defaults.addFun();	
						}
						$(defaults.elem).hide();
						$("body").die("mousedown");												
					});
					//点击外围隐藏box
					$("body").die('mousedown').live('mousedown',function(event){
						if (!$(event.target).is(self)) {
							hideIfClickOutside(event);
						};															
					});					
					function hideIfClickOutside(event){
//						console.log(!insideSelector(event));
						if (!insideSelector(event)) {
							$popBox.hide();
							$("body").die("mousedown");
						};
					}
					function insideSelector(event) {							
						var mx = event.pageX;
						var my = event.pageY;
						var offset = $popBox.position();
						offset.right = offset.left + $popBox.outerWidth(true);
						offset.bottom = offset.top + $popBox.outerHeight(true);
						return my < offset.bottom &&
									my > offset.top &&
									mx < offset.right &&
									mx > offset.left;
					}
					event.stopPropagation();
				});
				//选择按钮只能单选
				$(defaults.elem).find(".checknode").die().live("click",function(event){
						$(defaults.elem).find('.checknode').attr('checked',false);     
						$(this).attr('checked',true);
						event.stopPropagation();							
				});
				//绑定鼠标滑过
				$("#"+defaults.sign+"Tree li div").die("mouseenter").live("mouseenter",function(){
					$(this).addClass("entered");	
				});
				$("#"+defaults.sign+"Tree li div").die("mouseleave").live("mouseleave",function(){
					$(this).removeClass("entered");	
				});						
				//绑定收缩伸展
				$("#"+defaults.sign+"Tree li div").die("click").live("click",nodeStretch);
				//绑定收缩伸展
				function nodeStretch(){
					var $switchUL = $(this).siblings("ul");
					if($switchUL.length>0){
						if($switchUL.css("display")!="none"){
							$(this).find(".switch").removeClass("switch_open").addClass("switch_close");
							$switchUL.slideUp(100);
						}else{
							$(this).find(".switch").removeClass("switch_close").addClass("switch_open");
							$switchUL.slideDown(100);
						}	
						
					}					
				}
			}
		})(jquery);					
	}	
});