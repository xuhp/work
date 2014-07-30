/*
 *@Version:	    v1.0(2014-06-30)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 用于清除输入框中的value
 * html部分 
 * <div class="add_clear_val">
 * 	<input type="text" class="clear_this_val" />
 * </div>
 */
 ;(function($){
 	$.fn.clearValue=function(options){
 		var defaults={
 		};
 		var opts=$.extend({},defaults,options);
 		return this.each(function(){
 			var $this=$(this);
 			$this.mouseenter(function(){
 				if($('.clearBtn').length==0){
 					create_clear_btn($this);
 				}
 			});
 			$this.mouseout(function(){
 				//如果进入了clearBtn,那么添加removeMark标志,不移除按钮
 				$('.clearBtn').mouseenter(function(){
 					$(this).addClass('removeMark');
 				});
 				//如果clearBtn没有removeMark属性，则说明已经移出了input框的范围
 				//使用setTimeout是为了放置还没有添加removeMark标志就已经执行了remove操作
 				setTimeout(function () {
                    if (!($('.clearBtn').hasClass('removeMark'))) {
                        $('.clearBtn').remove();
                    }
                }, 1);
                $('.clearBtn').mouseout(function(){
	 				$(this).removeClass('removeMark');
	 			});
	 			//移除移除对应文本框中的类容
	 			$('.clearBtn').click(function(){
	 				$this.val('');
	 			});
 			});
 		});
 		//创建清除按钮
 		function create_clear_btn($elem){
 			var clear_btn='<div class="clearBtn" style="width:14px;height:14px;cursor:pointer;position:absolute;z-index:9999;">' +
 					'<img src="/Static/image/common/icon/removeTxt.png" /></div>';
 			$('body').append(clear_btn);
 			set_clear_btn_position($elem);
 		};
 		//定位清除按钮位置
 		function set_clear_btn_position($elem){
 			var offset = $elem.offset(),
            	top = offset.top,
            	left = offset.left,
            	width = $elem.outerWidth(),
           		height = $elem.outerHeight(),
            	clearBtn = $('.clearBtn'),
	            //设置删除按钮的top,clearBtn的宽高均为14px
	            clearBtnTop = top + (height / 2) - 8,
	            //设置left,17为learBtn的width+padding+border
	            clearBtnLeft = left + width - 17;
            clearBtn.css({ left: clearBtnLeft, top: clearBtnTop });
 		}
 	};
 })(jQuery);
 