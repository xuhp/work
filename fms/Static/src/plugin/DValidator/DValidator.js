define(function(require,exports,module){
	return function(jquery){
		// JavaScript Document
		(function($, undefined) {
			$.validator={
				defaults:{//针对控件
					required:true,
					msgRequired:"必选项",
					tip:{tipShow:false,msg:""},//获得焦点提示
					rules:{},//规则
					msg:{},//错误信息
					msgType:1,//提示框显示模式
					adAction:"blur",//验证动作
					ajaxValidator:false,//ajax
					error:function(){return true;}//验证错误事件
				},	
				formDefaults:{//针对控件
					formID:false,
					msgTipID:false,
					start:function(){return true;},
					end:function(){return true;}
				},		
				regex:{
						intege:/^-?[1-9]\d*$/,					//整数
						intege1:/^[1-9]\d*$/,					//正整数
						intege2:/^-[1-9]\d*$/,					//负整数
						num:/^([+-]?)\d*\.?\d+$/,			//数字
						num1:/^[1-9]\d*|0$/,					//正数（正整数 + 0）
						num2:/^-[1-9]\d*|0$/,					//负数（负整数 + 0）
						decmal:/^([+-]?)\d*\.\d+$/,			//浮点数
						decmal1:/^[1-9]\d*.\d*|0.\d*[1-9]\d*$/,　　	//正浮点数
						decmal2:/^-([1-9]\d*.\d*|0.\d*[1-9]\d*)$/,　 //负浮点数
						decmal3:/^-?([1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0)$/,　 //浮点数
						decmal4:/^[1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0$/,　　 //非负浮点数（正浮点数 + 0）
						decmal5:/^(-([1-9]\d*.\d*|0.\d*[1-9]\d*))|0?.0+|0$/,　　//非正浮点数（负浮点数 + 0）
						email:/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/, //邮件
						color:/^[a-fA-F0-9]{6}$/,				//颜色
						chinese:/^[\u4E00-\u9FA5\uF900-\uFA2D]+$/,					//仅中文
						ascii:/^[\x00-\xFF]+$/,				//仅ACSII字符
						zipcode:/^\d{6}$/,						//邮编
						mobile:/^(13[0-9]|15[012356789]|18[0256789]|147)[0-9]{8}$/,				//手机
						notempty:/^\S+$/,						//非空
						picture:/(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/,	//图片
						rar:/(.*)\.(rar|zip|7zip|tgz)$/,								//压缩文件
						date:/^((0?\d)|(1[012]))\/([012]?\d|30|31)\/\d{1,4}$/, 		
						qq:/^[1-9]*[1-9][0-9]*$/,				//QQ号码
						tel:/^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/,	//电话号码的函数(包括验证国内区号,国际区号,分机号)
						username:/^\w+$/,						//用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
						letter:/^[A-Za-z]+$/,					//字母
						letter_u:/^[A-Z]+$/,					//大写字母
						letter_l:/^[a-z]+$/,					//小写字母
						diaen: /^[A-Za-z0-9]+$/,					//英文和数字
						nosymbol:/[^\s;|,|\/|\[|\]|\}|\{|%|@|\*|!|\']+$/, //去除特殊符号
						
					isCardID:function(num,$obj){ 			
						var iSum=0,sId=$obj.val(),
						info="";				
						if(!/^\d{17}(\d|x)$/i.test(sId)){return false;}
						sId=sId.replace(/x$/i,"a");
						sBirthday=sId.substr(6,4)+"-"+Number(sId.substr(10,2))+"-"+Number(sId.substr(12,2));
						var d=new Date(sBirthday.replace(/-/g,"/"));
						if(sBirthday!=(d.getFullYear()+"-"+ (d.getMonth()+1) + "-" + d.getDate())){return false;}
						for(var i = 17;i>=0;i --) {iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11);}
						if(iSum%11!=1){return false;}
						return true; 
					},
					required:function(num,$obj){
						if($.validator.tool.emptyVal($obj)<=0){
							return false;
						}
						return true;
					},	
					minLen: function(num,$obj) {
						if ($.validator.tool.isLength($obj.val()) < num) {
							return false;
						}
						return true;
					},		
					maxLen: function(num,$obj) {
						if ($.validator.tool.isLength($obj.val()) > num) {
							return false;
						}
						return true;
					},
					maxMoneyLen:function(num,$obj){	
						if ($.validator.tool.isMoneyLength($obj.val()) > num) {
							return false;
						}
						return true;	
					},
					min: function(num,$obj) {            
						if ($obj.val() < num) {
							return false;
						}
						return true;
					},
					max: function(num,$obj) {            
						if ($obj.val() > num) {
							return false;
						}
						return true;
					},
					select:function(num,$obj){//radio check 返回个数
						var rVal = $.validator.tool.RCinput($obj);
						if (rVal < num) {
							return false;
						}
						return true;
					},		
					isTime:function(str){//短时间，形如 (13:04:06)			
						var a = str.match(/^(\d{1,2})(:)?(\d{1,2})\2(\d{1,2})$/);
						if (a == null) {return false}
						if (a[1]>24 || a[3]>60 || a[4]>60)
						{
							return false;
						}
						return true;
					},					
					isDate:function(str){//短日期，形如 (2003-12-05)			
						var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/); 
						if(r==null)return false; 
						var d= new Date(r[1], r[3]-1, r[4]); 
						return true;
					},			
					isDateTime:function(str){//长时间，形如 (2003-12-05 13:04:06)			
						var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/; 
						var r = str.match(reg); 
						if(r==null) return false; 
						var d= new Date(r[1], r[3]-1,r[4],r[5],r[6],r[7]); 
						return true;
					},
					callRegex:function(rule,val,$obj){//判断正则		
						var that=$.validator.regex;  
						if(that[rule]) {		
							if($.isFunction(that[rule])){
								return that[rule](val,$obj);
							}else{
								if((that[rule]).test($obj.val())){
									return true;
								}
							} 
							 
						}
						return false;						
					}		
				},
				tool:{
					ajaxObj:{},//对象验证
					ajaxSettings:function(obj,setting){
					var settings={	
						isvalid : false,
						lastValid : "",
						type : "GET",
						url : "",
						addidvalue : true,
						datatype : "html",
						data : "",
						async : true,
						cache : false,
						beforesend : function(){return true;},
						success : function(){return true;},
						complete : function(){},
						processdata : false,
						error : function(){},
						buttons : null,
						onerror:"服务器校验没有通过",
						onwait:"正在等待服务器返回数据",
						validatetype:"AjaxValidator"
					};
						this.ajaxObj[obj]=$.extend(true,settings,setting);
					},
					ajaxValid : function(returnObj){
						var id=returnObj;
						var obj = id;
						var srcjo = $("#"+id);
						var setting=this.ajaxObj[returnObj];
						var ls_url = setting.url;
						var errorType="error";
						if(!ls_url){
							return;	
						}
						if(setting.addidvalue){
							var parm = "clientid="+id+"&"+id+"="+encodeURIComponent(srcjo.val());
							ls_url = ls_url + (ls_url.indexOf("?")>0?("&"+ parm) : ("?"+parm));
						}
						$.ajax(
						{	
							mode : "abort",
							type : setting.type, 
							url : ls_url, 
							cache : setting.cache,
							data : setting.data, 
							async : setting.async, 
							dataType : setting.datatype, 
							success : function(data){
								if(setting.success(data)){						
									$.validator.messages.showTip(obj, "", "ok");
									setting.isvalid = true;
								}
								else
								{
									$.validator.messages.showTip(obj, setting.onerror, errorType);
									setting.isvalid = false;
								}
							},
							complete : function(){
								if(setting.buttons && setting.buttons.length > 0){setting.buttons.attr({"disabled":false})};
								setting.complete;
							}, 
							beforeSend : function(xhr){
								//再服务器没有返回数据之前，先回调提交按钮
								if(setting.buttons && setting.buttons.length > 0){setting.buttons.attr({"disabled":true})};
								var isvalid = setting.beforesend(xhr);
								if(isvalid)
								{
									setting.isvalid = false;		//如果前面ajax请求成功了，再次请求之前先当作错误处理
									$.validator.messages.showTip(obj, setting.onwait, errorType);
								}
								setting.lastValid = "-1";
								return isvalid;
							}, 
							error : function(){
								$.validator.messages.showTip(obj, setting.onerror, errorType);
								setting.isvalid = false;
								setting.error();
							},
							processData : setting.processdata 
						});
					},
					emptyVal:function($obj){//返回默认空值 
						var type=$obj.attr("type"),inputName;
						switch(type){
						case "text":
							return $obj.val().length || 0;
							break;
						case "select":
							return $obj.val() || 0;
							break;
						case "radio":
							inputName = $obj.attr("name");
							return $("input[name='" + inputName + "']:checked").length || 0;
							break;
						case "checkbox":
							inputName = $obj.attr("name");
							return $("input[name='" + inputName + "']:checked").length || 0;
							break;	
						}
						return $obj.val().length || 0;
					},
					isLength: function(str) { //验证长度（包括中文）
						return str.length;
					},
					isMoneyLength: function(str){
						var moneyReg = new RegExp(",","g");
						var numindex = parseInt(str.indexOf("."),10);
						var head = str.substring(0,numindex);
						head = head.replace(moneyReg,"");
						return  head.length;		
					},
					RCinput: function($obj) { //radio 判断
						var inputName, type = $obj.attr("type");				
						if (!type) {
							return false;
						}
						switch (type) {
							case "radio":
								inputName = $obj.attr("name");
								return $("input[name='" + inputName + "']:checked").length || 0;
								break;
							case "checkbox":
								inputName = $obj.attr("name");
								return $("input[name='" + inputName + "']:checked").length || 0;
								break;	
							default:
								return false;
								break;
						}
		
					}
												
				},
				messages: {
					getIdTip:function(id){
						return $("."+id+"_tip");
					},
					showTip: function(id, str, sty) {
						var $obj =this.getIdTip(id);
						
						var box, sty = sty || "error";
						box = '<span class="' + sty + '"><label>' + str + '</label></span>';
						$obj.html(box);
						
					},
					reShowTip: function(id,type) {
						var $obj; 
						
						if(type==2){
							$obj=id;
						}else{
							$obj =this.getIdTip(id);
						}
						$obj.html("");
					}
				},
				control:{
					tip: {
						deTip: function($obj, str) {
							var errorStr = str || "error",
							obj = $obj.attr('id');					
							$.validator.messages.showTip(obj, errorStr, "tip");					
						}
					},			
					combo:function(formID,arg){//生成公共列表 rulelist
						var subList=$.validator.ruleList[formID],lsobj;
						if(!arg){return;}
						if(!!subList){					
							for(var i in arg){
								if(subList[i]){
									subList[i]=$.extend(true,subList[i],arg[i]);
								}else{
									subList[i]=$.extend({},$.validator.defaults,arg[i]);
								}	
							}	
						}else{
							subList=$.validator.ruleList[formID]={};		
							for(var r in arg){
								subList[r]=$.extend({},$.validator.defaults,arg[r]);							
							}
						}
					},
					tipFoucs:function(formID,i){								
						var curF=$.validator.ruleList[formID][i],$obj=$("#"+i);
						if ( curF.tip.tipShow) {							
							$.validator.control.tip.deTip($obj, curF.tip.msg);
						}
					},
					init: function(formID,arg){
						var formIDList;						
						formIDList=$.validator.ruleList[formID];
						if(!formIDList && !arg){
							return;	
						}				
						for (var i in arg) {		
							(function(i){								
									var curRule=formIDList[i];							
									var rule = curRule.rules,$obj=$("#" + i);
									if(!!curRule.bindtype){//已初始化的控件不再初始化
										return;	
									}
									curRule.bindtype=true;
									if($obj.size()<=0){
										return;	
									}					
									if($obj.attr("type") == "radio" || $obj.attr("type") == "checkbox"){
										$obj=$("input[name='" + $obj.attr("name") + "']")			
									}
									
									
										$obj.bind("focus",function() {	//提示									
											$.validator.control.tipFoucs(formID,i,false);
										});
									
									
									if (!!rule){ //规则	
			
										$obj.bind(curRule.adAction,function() {	
																	
											var msgID = i,
											errorFlag = true,
											errorType = curRule.msgType || 1;
											errorType = errorType == 1 ? "error": "other";
											if(!!curRule.msgId){
												msgID=curRule.msgId;
											}
											if ( curRule.tip.tipShow && $(this).val().length <= 0) {
											   $.validator.messages.reShowTip(msgID);
											} else {
												if ($.validator.tool.emptyVal($(this)) <= 0) {//无值 不验证
													 return;	
												}										
												for (var r in rule) {									
													if (!$.validator.regex.callRegex(r,rule[r], $(this))) {
														errorFlag = false;
														$.validator.messages.showTip(msgID, curRule.msg[r], errorType);
														curRule.error();												
														break;
													}
												}
												if(!errorFlag){//验证错误 不继续验证其他
													return;	
												}
											
												if(curRule.ajaxValidator){ //ajax验证

													if(!$.validator.tool.ajaxObj[i]){
														$.validator.tool.ajaxSettings(i,curRule.ajaxValidator);
													}									
													$.validator.tool.ajaxValid(i);	     
												}else{		
													$.validator.messages.showTip(msgID, "", "ok");	
												}                                
				
											}
										});
									} 
								})(i);	
							}
						},
						fromAply: function(formID) { //验证表单		
							var data = $.validator.ruleList[formID],
							result = true,
							that = $.validator;
							if(!data){
								return false;	
							}
		
							for (var i in data) {
								var r, rule,
									$obj = $("#" + i),
									errorObj = i,
									errorType,
									oldTip;
								if (i!="formConfig" && $obj.size()>0) {							
									rule = data[i].rules;
									oldTip=data[i].tip.tipShow;
									errorType = data[i].msgType || 1;
									errorType = errorType == 1 ? "error": "other";
									if(!!data[i].msgId){
										errorObj=data[i].msgId;
									}					
									if ($.validator.tool.emptyVal($obj) > 0) {//有值 则验证	
											for (var r in rule) {
		
												
												if (!$.validator.regex.callRegex(r,rule[r], $obj)) {
													result = false;
													data[i].tip.tipShow=false;								
													$("#"+errorObj).focus();
													data[i].tip.tipShow=oldTip;
													setTimeout(function(){that.messages.showTip(errorObj, data[i].msg[r], errorType)},1);
													break;
												}
											}								
									}else{
										if(data[i].required){
											result = false;
											data[i].tip.tipShow=false;								
											$("#"+errorObj).focus();
											data[i].tip.tipShow=oldTip;
											setTimeout(function(){that.messages.showTip(errorObj, data[i].msgRequired, errorType)},1);	
										}
									}	
									if(!!$.validator.tool.ajaxObj[i] && $.validator.tool.ajaxObj[i].isvalid===false){
										result = false;								
										data[i].tip.tipShow=false;								
										$("#"+errorObj).focus();
										data[i].tip.tipShow=oldTip;
										
									}
									if (!result) {break;}							
									that.messages.showTip(errorObj, "", "ok");							
								}
							}					
							if (result) {
							   return true;
							}else{
								return false;	
							}
						}
					},
					ruleList:{},
					formConfig:function(arg){
						var subList,formID;
						var formC=$.extend({},$.validator.formDefaults,arg);
						if(!formC.formID){return;}
						formID=arg.formID;
						if(!$.validator.ruleList[formID]){
							$.validator.ruleList[formID]={};					
						}	
						
						$.validator.ruleList[formID]["formConfig"]={};
						subList=$.validator.ruleList[formID]["formConfig"];
						for(var i in formC){					
							subList[i]=formC[i];
						}
						$("#"+formID).submit(function() {						
							if($.isFunction(subList.start)){
								subList.start();
							};
							
							var vf=$.validator.control.fromAply(formID);
							
							if($.isFunction(subList.end)){
								subList.end();
							};	
							return vf;			
						}); 
					},
					addMethod:function(name,methond){			//增加方法
						$.validator.regex[name]=methond;
					}
			};
			
			$.fn.extend({		
				validator:function(arg,start,end){					
							return this.each(function(){
								var obj,formID;
								if (this.tagName.toLowerCase() == "form") {
									formID=this.id;
								}
								
								if(!formID){
									return;
								}
								
								if(arg){							
									$.validator.control.combo(formID,arg);							
									$.validator.control.init(formID,arg);	              
								}
							});				
				}
			});
		})(jquery);
	}
});