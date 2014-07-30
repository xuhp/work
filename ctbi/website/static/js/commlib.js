$(document).ready(function(){
	eventCommReg();
});


var eventCommReg = function(){
	WindowsResize.registerEvent();
};

var WindowsResize = {
	registerEvent: function(){
		setInterval(this.elementsResize(), 500);
	},
	elementsResize: function(){
		var height = $(window).innerHeight();
		$('body').height(height);
		this.adaption('body');
	},
	adaption: function(item){
		var eles = $(item).children(".self-adaption-height");
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != this.outerHTML){
				this.self_adaption_height(element);
				
			}
		}
		eles = $(item).children(".self-adaption-width");
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != this.outerHTML){
				this.self_adaption_width(element);
			}
		}
		eles = $(item).children(".inherit-parent-height");
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != this.outerHTML){
				this.inherit_parent_height(element);
			}
		}
		eles = $(item).children(".inherit-parent-width");
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != this.outerHTML){
				this.inherit_parent_width(element);
			}
		}
		eles = $(item).children();
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != this.outerHTML){
				this.adaption(element);
			}
		}
	},
	self_adaption_height: function(item){
		var p = $(item).parent();
		var amountHeight = p.outerHeight() - getNumByCss($(p),'padding-top') - getNumByCss($(p),'padding-bottom');
		var eles = p.children();
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != item.outerHTML){
				amountHeight -= $(element).outerHeight(true);
			}
		}
		$(item).outerHeight(amountHeight);
	},
	self_adaption_width: function(item){
		var p = $(item).parent();
		var amountWidth = p.outerWidth() - getNumByCss($(p),'padding-left') - getNumByCss($(p),'padding-right');
		var eles = p.children();
		for(var i=0; i< eles.length; i++){  
			var element = eles[i];
			if(element.nodeName != "SCRIPT" && element.outerHTML != item.outerHTML){
				amountWidth -= $(element).outerWidth(true);
			}
		}
		$(item).outerWidth(amountWidth);
	},
	inherit_parent_height: function(item){
		var p = $(item).parent();
		var amountHeight = p.outerHeight() - getNumByCss($(p),'padding-top') - getNumByCss($(p),'padding-bottom');
		$(item).outerHeight(amountHeight);
	},
	inherit_parent_width: function(item){
		var p = $(item).parent();
		var amountWidth = p.outerWidth() - getNumByCss($(p),'padding-left') - getNumByCss($(p),'padding-right');
		$(item).outerWidth(amountWidth);
	}
};

var getNumByCss = function(entity,cssName){
	var val = entity.css(cssName);
	if(val == ''){
		return 0;
	}else{
		return parseInt(val.replace('px',''));
	}
};

var contains = function(array,item){
	for (var i = array.length - 1; i >= 0; i--) {
		if(array[i] == item){
			return true;
		}
	};
	return false;
};

var stringToJson = function (stringValue){
	return (new Function("","return " + stringValue))();
};

var getUrlParameter = function(){
	var argsnum = arguments.length;
	if(argsnum == 0 || argsnum > 2) {
		console.log('args error');
		return null;
	}
	var name = arguments[0];
	var defaultValue = null;
	defaultValue = arguments[1];
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return decodeURIComponent(r[2]);return defaultValue;
};

var getCurrentPageName = function(){
	var strUrl = window.location.href;
	var arrUrl = strUrl.split("/");
	return arrUrl[arrUrl.length-1];
};

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}