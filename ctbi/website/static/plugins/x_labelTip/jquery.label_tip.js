/*
 *@Version:	    v1.0(2014-06-23 10:00)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 用于实现输入框的提示功能
 *1. html结构 label和输入框在同一个父元素中，并且同级只有一个label
 *<div>
 *	<label for="xx"><input type="text" id="xx" /> //for和id要对应
 *</div>
 */
 ;(function($){
 	$.fn.label_tip=function(options){
 		var defaults={
 			status:'1' //‘1’表示获取焦点隐藏提示内容，‘2’表示当输入框的内容不为空时隐藏提示内容
 		};
 		var opts=$.extend({},defaults,options);
 		return this.each(function(){
 			var $this=$(this),
 				$label=$this.siblings('label');
			//用于解决回退时候，如果input中原本是有内容，会发生tip内容和文本内容同时存在的问题
			if ($this.val() != '') {
	            $label.hide();
	        }
 			//根据不同的状态，实现不同的效果	
 			switch(opts.status){
 				case '1':
 					foucus_hide($this,$label);
 				break;
 				case '2':
 					nonempty_hide($this,$label);
 				break;
 			}
 		});
 	};
 	//当status为1时
	function foucus_hide($this,$label){
	 	$this.focus(function(){
	 		$label.hide();
	 	}).blur(function(){
	 		if($this.val()==''){
	 			$label.show();
	 		}
	 	});
	}
	//当status为2时
	function nonempty_hide($this,$label){
		$this.keydown(function(){
			if($this.val()!=''){
	 			$label.hide();
	 		}
		}).keyup(function(){
			if($this.val()==''){
	 			$label.show();
	 		}
		});
	}
 })(jQuery);
 
 
