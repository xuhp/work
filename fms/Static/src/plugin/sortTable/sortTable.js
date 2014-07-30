define(function (require, exports, module) {
	return function(jquery){
		(function($){
			$.sortTable = function(config){
				var defaults ={
					tilArr:[],//标题组
					idArr:[],//表格ID组
					backFun:backFun
				}
				function backFun(){}
				$.extend(defaults, config);
				//datatype数据类型
				//otype显示型式，0只排序，1只筛选，2皆有
				//sortcol首次排序的标志
				var tilArr = defaults.tilArr;//标题组
				var idArr = defaults.idArr;//表格ID组
				//将排序表格转为数组函数
				function tableArr(tableID){
					var oTable=document.getElementById(tableID);//获取表格的ID
					var oTbody=oTable.tBodies[0]; //获取表格的tbody
					var colDataRows=oTbody.rows; //获取tbody里的所有行的引用
					var aTRs=new Array(); //定义aTRs数组用于存放tbody里的行
					for(var i=0;i<colDataRows.length;i++){//依次把所有行放如aTRs数组
						aTRs.push(colDataRows[i]);
					}
					return aTRs;	
				}
				//获取子节点元素函数
				function textNode(elem){
					var con=$(elem).contents();
					var len=con.length;
					for(var i=0;i<len;i++){
						//当为文本节点，并且不为空时，输出值
						if(con[i].nodeType==3 && $.trim(con[i].nodeValue)!=='' ){
							var val=$.trim(con[i].nodeValue);
							return val;
						}else if(con[i].nodeType==1){
							//当为元素节点时
							var childVal=textNode(con[i]);
							if(childVal){
								return childVal;
							}
						}
					}
				}
				//插入sortBox函数
				function insertBox(i){
					var box = '<div id="sortBox_'+i+'" class="sortbox"></div>';
					$("body").append(box);		
				}
				//1,遍历标题，返回对应表格数据
				$(tilArr).each(function(index,elem){
					var tableID = idArr[index];//排序表格ID
					var $table = $("#"+tableID);//排序表格
					var $tbody = $table.children("tbody");//排序表格tbody
					var $self = $(elem);//标题表格
					var $aTH = $self.find("th");//所有th
					var $icon = $self.find(".icon-sort");
					var allTRs = tableArr(tableID); //表格转换成的全部数组
					var allData = [];//存储icon对应的td数据
					//2,遍历icon，返回对应td的数据放入allData；
					$icon.each(function(i,el){
						$(this).attr("sign","0");
						var $TH = $(el).parent();//要被排序的th
						var iCol = $aTH.index($TH);//在所有th中的次序
						var datatype = $(el).attr("datatype");					
						var thData = [];
						$TH.css("position","relative");
						for(var i=0;i<allTRs.length;i++){
							var curTd = allTRs[i].cells[iCol];//获取对应节点						
							var tdVal = textNode(curTd);//获取对应节点值
							var flag = false;//是否有相同值得标记
							if(thData.length > 0){
								for(var j=0;j<thData.length;j++){
									if(tdVal==thData[j]){//如果发现相同值
									flag = true;	
									}
								}
								if(!flag){
									thData.push(tdVal);	
								}	
							}else{
								thData.push(tdVal);	
							}
						}
						$(el).attr("datalength",thData.length);
						allData.push(thData);						
					});	
					//3,在body中插入一个sortBox并隐藏
					insertBox&&insertBox(index);
					var $sortBox = $("#sortBox_"+index);//筛选框
					//4,点击按钮事件
					$icon.unbind('click').bind("click",function(){
						var $TH = $(this).parent();//要被排序的th
						var $sIcon = $(this);
						var iCol = $aTH.index($TH);//在所有th中的次序
						var oCol = $icon.index($sIcon);//在所有icon中的次序
						var dLength = $(this).attr("datalength");//数组长度
						var datatype = $(this).attr("datatype");//数据类型
						var otype = $(this).attr("otype");//显示类型
						if(otype=="0"){
							$sortBox.css("height","50px");
							showSortList&&showSortList();//显示排序						
						}else if(otype=="1"){
							$sortBox.css("height","250px");
							var fTRs = showList($sIcon,iCol,oCol,datatype);//显示筛选列表						
						}else{
							$sortBox.css("height","300px");
							showSortList&&showSortList();//显示排序
							var fTRs = showList($sIcon,iCol,oCol,datatype);//显示筛选列表						
						}
						adjustPos($TH);
						//升序
						$("#sortUp").unbind().bind("click",function(){
							sortTab&&sortTab(tableID,iCol,0,datatype);
							hideBox();
						});
						//降序
						$("#sortDown").unbind().bind("click",function(){
							sortTab&&sortTab(tableID,iCol,1,datatype);
							hideBox();	
						});
						//5,点击确定显示筛选后的tr
						$("#deterBtn").unbind("click").bind("click",function(){
							var checkedLength = $("input.checknode:checked").length;//选中的个数
							if(checkedLength>0){
								var aTRs  = fTRs;//筛选前的tr数组
								var selectedArr = []//被选中的值数组
								var sTRs = [];//筛选后的tr数组
								$tbody.empty();
								$("input.checknode:checked").each(function(){
									var selectedText = $(this).next(".stext").text();
									selectedArr.push(selectedText);
								});
								for(var i=0;i<aTRs.length;i++){
									var curTd = aTRs[i].cells[iCol];//获取对应节点						
									var tdVal = textNode(curTd);//获取对应节点值值
									for(var j=0;j<selectedArr.length;j++){
										if(tdVal==selectedArr[j]){//如果发现相同值
											sTRs.push(aTRs[i]);	
										}	
									}
								}
								for(var k=0;k<sTRs.length;k++){
									$tbody.append(sTRs[k]);	
								}
								if(checkedLength==dLength){
									$icon.attr("sign","0");	
								}else{
									$icon.attr("sign","1");
									$sIcon.attr("sign","0")
								}
								hideBox();
								defaults.backFun&&defaults.backFun();	
							}else{
								alert("未选中！");
							}
						});
						//6,点击取消隐藏box
						var $cancelBtn = $sortBox.find("#cancelBtn");
						$cancelBtn.die("click").live("click",function(){
							hideBox();	
						});
						//7,点击外围隐藏box
						$("body").unbind("mousedown").bind('mousedown',function(event){
							hideIfClickOutside(event);							
						});
						//当点击外围时隐藏
						function hideIfClickOutside(event){
							if (!insideSelector(event)) {
								hideBox();
							};
						}
						//判断外围
						function insideSelector(event) {							
							var mx = event.pageX;
							var my = event.pageY;
							var offset = $sortBox.position();
							offset.right = offset.left + $sortBox.outerWidth(true);
							offset.bottom = offset.top + $sortBox.outerHeight(true);
							return my < offset.bottom &&
										my > offset.top &&
										mx < offset.right &&
										mx > offset.left;
						}
					});
					//8,显示排序列表
					function showSortList(){
						var btn = '<a id="sortUp" class="sort-item"><span class="icon icon-up"></span>升序</a>';
							btn += '<a id="sortDown" class="sort-item"><span class="icon icon-down"></span>降序</a>';
							$sortBox.append(btn);
					}
					//9,显示筛选列表事件
					function showList($sIcon,iCol,oCol,datatype){
						var btn = '	<a class="sort-item"><span class="icon icon-filter"></span>筛选</a>';
						btn += '	<div class="filterbox">';
						btn += '	<div id="all"><input id="allCheck" class="checkall" type="checkbox"><span>全选</span></div>';
						btn += '	<ul id="filterList" class="filter-list"></ul>';
						btn += '</div>';
						btn += '<div class="buttonwrap tc">';
						btn += '	<button id="deterBtn" class="blueBtn  h26 w70 mr15">确定</button>';
						btn += '	<button id="cancelBtn" class="redBtn  h26 w70">取消</button>';
						btn += '</div>';
						$sortBox.append(btn);
						var fTRs = allTRs;
						if($sIcon.attr("sign")=="0"){
							var sData = allData[oCol];
						}else{
							var partTRs = tableArr(tableID);
							fTRs = partTRs;
							var sData = [];
							for(var i=0;i<partTRs.length;i++){
								var curTd = partTRs[i].cells[iCol];//获取对应节点						
								var tdVal = textNode(curTd);//获取对应节点值值						
								var a = false;//是否有相同值得标记
								if(sData.length > 0){
									for(var j=0;j<sData.length;j++){
										if(tdVal==sData[j]){//如果发现相同值
										a = true;	
										}
									}
									if(!a){//如果没有相同值就加入
										sData.push(tdVal);	
									}	
								}else{//首次加入
									sData.push(tdVal);	
								}			
							}
						}
						//将数组填入列表中				
						for(var i=0;i<sData.length;i++){
							var listLi = '<li><input class="checknode" type="checkbox"><span class="stext">'+sData[i]+'</span></li>';
							$("#filterList").append(listLi);	
						}
						//6,全选或全不选
						$("#allCheck").die().live("click",function(){
							if($(this).attr("checked")){
								$("input.checknode").attr("checked",true);	
							}else{
								$("input.checknode").removeAttr("checked");
							}
						});
						//7,列表项全选时全选按钮选定
						$("input.checknode").die().live("click",function(){
							if($(this).attr("checked")){
								var checkedLength = $("input.checknode:checked").length;
								if(checkedLength == sData.length){
									$("#allCheck").attr("checked",true);	
								}	
							}else{
								if($("#allCheck").attr("checked")){
									$("#allCheck").removeAttr("checked");		
								}	
							}
						});
						return fTRs;
					}
					//8,排序事件
					function sortTab(sTableId,iCol,k,sDataType){
						var oTable=document.getElementById(sTableId);//获取表格的ID
						var oTbody=oTable.tBodies[0]; //获取表格的tbody
						var colDataRows=oTbody.rows; //获取tbody里的所有行的引用
						var aRows=new Array(); //定义aRows数组用于存放tbody里的行
						for(var i=0;i<colDataRows.length;i++){//依次把所有行放如aRows数组
							aRows.push(colDataRows[i]);
						}
						var sortCol = oTable.getAttribute("sortCol");
						if(sortCol==iCol){//非首次排序
							var kVal = oTable.getAttribute("kVal");
							if(kVal==k){
								return false;
							}else{
								aRows.reverse();	
							}						
						}else{ //首次排序					
	        				if(k==0){//升序
	        					aRows.sort(generateCompareTRs(iCol,sDataType));
	 						}else if(k==1){//降序
	 							aRows.sort(generateCompareTRs1(iCol,sDataType));
	 						}
	    				}
						var oFragment=document.createDocumentFragment();//创建文档碎片/
						for(var i=0;i<aRows.length;i++){ //把排序过的aRows数组成员依次添加到文档碎片
							oFragment.appendChild(aRows[i]);
						}
					    oTbody.appendChild(oFragment); //把文档碎片添加到tbody,完成排序后的显示更新为-1
					    oTable.setAttribute("sortCol",iCol);
					    oTable.setAttribute("kVal",k);
					}
					//比较函数，用于两项之间的排序
					//升序
					function generateCompareTRs(iCol,sDataType){
						return	function compareTRs(oTR1,oTR2){
								   var tValue1 = textNode(oTR1.cells[iCol]);
								   var tValue2 = textNode(oTR2.cells[iCol]); 
								   var vValue1=convert(tValue1,sDataType);
								   var vValue2=convert(tValue2,sDataType);
								   if(vValue1<vValue2){
									return -1;
								   }else if(vValue1>vValue2){
									return 1;
								   }else{
									return 0;
								   }
								};
					}; 
					//降序
					function generateCompareTRs1(iCol,sDataType){
						return  function compareTRs(oTR1,oTR2){
								   var tValue1 = textNode(oTR1.cells[iCol]);
								   var tValue2 = textNode(oTR2.cells[iCol]); 
								   var vValue1=convert(tValue1,sDataType);
								   var vValue2=convert(tValue2,sDataType);
								   if(vValue1>vValue2){
								   return -1;
								   }
								   else if(vValue1<vValue2){
								   return 1;
								   }
								   else{
								   return 0;
								   }
								};
					};				 
					//数据类型转换函数
					function convert(sValue,sDataType){
						switch(sDataType){
						  case "int":return parseInt(sValue);
						  case "float": return parseFloat(sValue.split(",").join(""));
						  case "date":return new Date(Date.parse(sValue));
						  default:return sValue.toString();
						}
					};
					//调整位置
					function adjustPos(org){
						$sortBox.css({
							"top":org.offset().top+org.outerHeight(true)+1,
							"left":org.offset().left
						});
						$sortBox.show();								
					}
					//隐藏函数
					function hideBox(){
						$sortBox.hide().empty();
						$("body").unbind("mousedown");	
					}
				});							 								
			}
		})(jquery);	
	}	
});