define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
	var common={
		//加载框架
		LoadIFrame:function(frameID,url){
			var iframe = document.getElementById(frameID);
			var $loading = $(iframe).siblings('.loading');
			$loading.show();
			$(iframe).hide(); 
			iframe.src = url;
			if (iframe.attachEvent){    
			    iframe.attachEvent('onload', function () {
					$loading.hide();
					$(iframe).show();
					iframe.contentWindow.focus();
				});
			} else {    
				iframe.onload = function(){       
					$loading.hide(); 
					$(iframe).show();
					iframe.contentWindow.focus();
				};
			}
		},
		LoadIFrame2:function(frameID,url){
			var iframe = document.getElementById(frameID);
			var $loadWrap = $(iframe).siblings('.loadWrap');
			$loadWrap.show();
			iframe.src = url;
			if (iframe.attachEvent){    
			    iframe.attachEvent('onload', function () {
					$loadWrap.hide();
					$(iframe).contents().find('body').focus();
				});
			} else {    
				iframe.onload = function(){       
					$loadWrap.hide(); 
					$(iframe).contents().find('body').focus();
				};
			}
		},
		//字符串转换成/形式的日期
		toDate: function(str){
			var DateStr = typeof(str)=="string"?str:str.toString();
			var myDate = DateStr.substr(0,4)+"/"+DateStr.substr(4,2)+"/"+DateStr.substr(6,2);
			return 	myDate;
		},
		//字符串转换成年月日形式的日期式
		toDate2: function(str){
			var DateStr = typeof(str)=="string"?str:str.toString();
			var myDate = DateStr.substr(0,4)+"年"+DateStr.substr(4,2)+"月"+DateStr.substr(6,2)+"日";
			return 	myDate;				
		},
		//字符串转换成年-的日期式
		toDate3: function(str){
			var DateStr = typeof(str)=="string"?str:str.toString();
			var myDate = DateStr.substr(0,4)+"-"+DateStr.substr(4,2)+"-"+DateStr.substr(6,2);
			return 	myDate;				
		},
		//字符串转换成具体时间
		toTime: function(str){
			var TimeStr = typeof(str)=="string"?str:str.toString();
			var lackLen = 6 - TimeStr.length;
			for(var i=0;i<lackLen;i++){
				TimeStr = "0" + TimeStr;
			} 
			var myTime = TimeStr.substr(0,2)+":"+TimeStr.substr(2,2)+":"+TimeStr.substr(4,2);
			return 	myTime;
		},
		tips_error:	function(msg){				
			var tipbox = '<div class="tips-wrap">';
				tipbox += '<div class="tips-con"><span class="tips-icon tips-error"></span><p class="tips-text">'+msg+'</p></div>';
				tipbox += '<div class="buttonwrap tc mt15"><button id="tipsDeter" class="sureBtn blueBtn  h26 pl10 w100">确定</button></div>';	
				tipbox += '</div>';
			var tipDialogs = art.dialog({
					lock: true,
					drag: false,
					resize: false,
					content: tipbox,
			});
			$("#tipsDeter").bind("click",function(){
				tipDialogs.close();	
			});
		},
		tips_succeed:function(msg,backcall){				
			var tipbox = '<div class="tips-wrap">';
				tipbox += '<div class="tips-con"><span class="tips-icon tips-succeed"></span><p class="tips-text">'+msg+'</p></div>';
				tipbox += '</div>';
			var tipDialogs = art.dialog({
						time:1,
						title: '1秒自动关闭!',
						content:tipbox,
						close:backcall	
			});
		},
		tips_warning:function(msg,backcall){				
			var tipbox = '<div class="tips-wrap">';
				tipbox += '<div class="tips-con"><span class="tips-icon tips-warning"></span><p class="tips-text">'+msg+'</p></div>';
				tipbox += '<div class="buttonwrap tc mt15"><button id="tipsDeter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="tipsCancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';	
				tipbox += '</div>';
			var tipDialogs = art.dialog({
					lock: true,
					drag: false,
					resize: false,
					content: tipbox,
			});
			$("#tipsDeter").bind("click",function(){
				tipDialogs.close();
				backcall&&backcall();	
			});
			$("#tipsCancel").bind("click",function(){
				tipDialogs.close();	
			});
		},
	    //对象文本提示框
		toolTip: function (threshold) {
		    var x = 0,
               y = 30;
		    $('.paidFor,.paidFor_outer').live('mouseover', function () {
		        var td = $(this).parents('td');
		        //获取指定输入框的offset值
		        var offset = td.offset();
		        var top = offset.top;
		        //计算窗体的高度
		        var win_h = $(window).height();
		        //计算td的高度
		        var td_h = td.outerHeight(true);
		        //计算输入框距离底端的距离，30为输入框的高度（包括padding和border）
		        var bottom = win_h - top - td_h;
		        //提示框的高度
		        var tip_h = 55;
		        //如果提示框距离底部的高度太小则上翻,
		        if ((bottom - tip_h) < threshold) {
		            var h = -(tip_h + 6);
		            $(this).siblings('.tooltip')
                        .css({
                            'top': h + 'px',
                            'left': x + 'px'
                        }).show();
		        } else {
		            $(this).siblings('.tooltip')
                        .css({
                            'top': y + 'px',
                            'left': x + 'px'
                        }).show();
		        }

		    }).live('mouseout', function () {
		        $(this).siblings('.tooltip').hide();
		    });
		},
		//清除input中的值
		clearValue: function(ele){
			$(ele).bind('mouseenter', function () {
                //创建删除按钮
                if ($('.clearBtn').length == 0) {
                    createElem(this);
                }
            })
            $(ele).bind('mouseout', function () {
                //移除删除按钮
                $('.clearBtn').die('mouseenter').live('mouseenter', function () {
                    $(this).addClass('removeMark');
                })
                setTimeout(function () {
                    if (!($('.clearBtn').hasClass('removeMark'))) {
                        $('.clearBtn').remove();
                    }
                }, 1)
                //if (!($('.clearBtn').hasClass('removeMark'))) {
                //    $('.clearBtn').remove();
                //}
            })
            $('.clearBtn').live('mouseout', function () {
                $(this).removeClass('removeMark');
            })
            //移除相应文本框当中的类容
            $('.clearBtn').die('click').live('click', function () {
                $(this).siblings('input:text').val('');
            })
            //窗体大小改变是重置remove元素的位置
            //$(window).resize(function () {
            //    setRemovePosition();
            //})
            //创建remove元素
            function createElem(elem) {
                var removeIcon = '<div class="clearBtn" style="width:14px;height:14px;cursor:pointer;position:absolute;z-index:9999;"><img src="/Static/images/base/icon/removeTxt.png" /></div>'
                $(elem).parent().append(removeIcon);
                setRemovePosition(elem);
            }
            //设置清除元素的位置
            function setRemovePosition(el) {
                var elem = $(el);
                var offset = elem.position();
                var top = offset.top;
                var left = offset.left;
                var width = elem.outerWidth();
                var height = elem.outerHeight();
                var clearBtn = $('.clearBtn');
                //设置删除按钮的top,clearBtn的宽高均为14px
                var clearBtnTop = top + (height / 2) - 7;
                //设置left,17为learBtn的width+padding+border
                var clearBtnLeft = left + width - 17;
                clearBtn.css({ left: clearBtnLeft, top: clearBtnTop });
            }			
		}
	}
	module.exports = common;
})