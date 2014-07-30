/*
jdPicker 1.2.1
*/
jdPicker = (function($) { 

function jdPicker(el, opts) {
  if (typeof(opts) != "object") opts = {};
  $.extend(this, jdPicker.DEFAULT_OPTS, opts);
  
  this.input = $(el);
  this.bindMethodsToObj("show", "hide", "hideIfClickOutside", "keydownHandler", "selectDate");
  this.build();
  this.selectDate();
  
  this.hide();
};
/*jdPicker.DEFAULT_OPTS = {
  month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  short_month_names: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  short_day_names: ["S", "M", "T", "W", "T", "F", "S"],
  error_out_of_range: "Selected date is out of range",
  selectable_days: [0, 1, 2, 3, 4, 5, 6],
  non_selectable: [],
  rec_non_selectable: [],
  start_of_week: 1,
  show_week: 0,
  select_week: 0,
  week_label: "",
  date_min: "",
  date_max: "",
  date_format: "YYYY/mm/dd"
};*/
jdPicker.DEFAULT_OPTS = {
  month_names:["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  short_month_names: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  short_month_names2: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  short_day_names: ["日", "一", "二", "三", "四", "五", "六"],
  error_out_of_range: "选择的日期不符合规则",
  selectable_days: [0, 1, 2, 3, 4, 5, 6],
  non_selectable: [],
  rec_non_selectable: [],
  start_of_week: 1,
  show_week: 0,
  select_week: 0,
  week_label: "周",
  date_min: "",
  date_max: "",
  date_format: "YYYY/mm/dd",
  time_format:"hh:mm:ss",
  timeShow:0
};
jdPicker.prototype = {
  build: function() {
	var that=this;
	this.wrapp = this.input.wrap('<div class="jdpicker_w">');
	
	switch (this.date_format){
		case "dd/mm/YYYY": 
			this.reg = new RegExp(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); 
			this.date_decode = "new Date(matches[3], parseInt(matches[2]-1), matches[1]);";
			this.date_encode = 'this.strpad(date.getDate()) + "/" + this.strpad(date.getMonth()+1) + "/" + date.getFullYear();';
			this.date_encode_s = 'this.strpad(date.getDate()) + "/" + this.strpad(date.getMonth()+1)';
		break;
		case "FF dd YYYY": 
			this.reg = new RegExp(/^([a-zA-Z]+) (\d{1,2}) (\d{4})$/); 
			this.date_decode = "new Date(matches[3], this.indexFor(this.month_names, matches[1]), matches[2]);"; 
			this.date_encode = 'this.month_names[date.getMonth()] + " " + this.strpad(date.getDate()) + " " + date.getFullYear();';
			this.date_encode_s = 'this.month_names[date.getMonth()] + " " + this.strpad(date.getDate());';
		break;
		case "dd MM YYYY": 
			this.reg = new RegExp(/^(\d{1,2}) ([a-zA-Z]{3}) (\d{4})$/); 
			this.date_decode = "new Date(matches[3], this.indexFor(this.short_month_names, matches[2]), matches[1]);"; 
			this.date_encode = 'this.strpad(date.getDate()) + " " + this.short_month_names[date.getMonth()] + " " + date.getFullYear();'; 
			this.date_encode_s = 'this.strpad(date.getDate()) + " " + this.short_month_names[date.getMonth()];'; 
		break;
		case "MM dd YYYY": 
			this.reg = new RegExp(/^([\u4E00-\uFA29]{2,4}) (\d{1,2}) (\d{4})$/); 
			this.date_decode = "new Date(matches[3], this.indexFor(this.short_month_names, matches[1]), matches[2]);"; 
			this.date_encode = 'this.short_month_names[date.getMonth()] + " " + this.strpad(date.getDate()) + " " + date.getFullYear();'; 
			this.date_encode_s = 'this.short_month_names[date.getMonth()] + " " + this.strpad(date.getDate());'; 
		break;
		case "dd FF YYYY": 
			this.reg = new RegExp(/^(\d{1,2}) ([a-zA-Z]+) (\d{4})$/); 
			this.date_decode = "new Date(matches[3], this.indexFor(this.month_names, matches[2]), matches[1]);"; 
			this.date_encode = 'this.strpad(date.getDate()) + " " + this.month_names[date.getMonth()] + " " + date.getFullYear();'; 
			this.date_encode_s = 'this.strpad(date.getDate()) + " " + this.month_names[date.getMonth()];'; 
		break;
		case "YYYY-mm-dd":
			this.reg = new RegExp(/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/);
			this.date_decode = "new Date(matches[1], parseInt(matches[2]-1), matches[3]);";
			this.date_encode = 'date.getFullYear() + "-" + this.strpad(date.getMonth()+1) + "-" + this.strpad(date.getDate());';
			this.date_encode_s = 'this.strpad(date.getMonth()+1) + "-" + this.strpad(date.getDate());';
			break;
		case "YYYY/mm/dd": 
		default: 
			this.reg = new RegExp(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/); 
			this.date_decode = "new Date(matches[1], parseInt(matches[2]-1), matches[3]);"; 
			this.date_encode = 'date.getFullYear() + "/" + this.strpad(date.getMonth()+1) + "/" + this.strpad(date.getDate());'; 
			this.date_encode_s = 'this.strpad(date.getMonth()+1) + "/" + this.strpad(date.getDate());'; 
		break;
	}
	
	if(this.date_max != "" && this.date_max.match(this.reg)){
		var matches = this.date_max.match(this.reg);
		this.date_max = eval(this.date_decode);
	}else
		this.date_max = "";
	
	if(this.date_min != "" && this.date_min.match(this.reg)){
		var matches = this.date_min.match(this.reg);
		this.date_min = eval(this.date_decode);
	}else
		this.date_min = "";
	
    var monthNav = $('<p class="month_nav">' +
      '<span class="button prev" title="[Page-Up]">&#171;</span>' +
      ' <span class="month_name"></span> ' +
      '<span class="button next" title="[Page-Down]">&#187;</span>' +
      '</p>');
	  
    this.monthNameSpan = $(".month_name", monthNav);
    $(".prev", monthNav).click(this.bindToObj(function() { this.moveMonthBy(-1); }));
    $(".next", monthNav).click(this.bindToObj(function() { this.moveMonthBy(1); }));
	this.monthNameSpan.click(this.bindToObj(function(){
		if($('select', this.monthNameSpan).length>0){return};
		this.monthNameSpan.empty().append(this.getMonthSelect());		
		$('select', this.monthNameSpan).change(this.bindToObj(function(){
			this.moveMonthBy(parseInt($('select :selected', this.monthNameSpan).val()) - this.currentMonth.getMonth());
		}));
	}));
	
    var yearNav = $('<p class="year_nav">' +
      '<span class="button prev" title="[Ctrl+Page-Up]">&#171;</span>' +
      ' <span class="year_name" id="year_name"></span> ' +
      '<span class="button next" title="[Ctrl+Page-Down]">&#187;</span>' +
      '</p>');
	  
    this.yearNameSpan = $(".year_name", yearNav);
    $(".prev", yearNav).click(this.bindToObj(function() { this.moveMonthBy(-12); }));
    $(".next", yearNav).click(this.bindToObj(function() { this.moveMonthBy(12); }));
    
    this.yearNameSpan.click(this.bindToObj(function(){
    	
    	if($('.year_name input', this.rootLayers).length==0){
			var initialDate = this.yearNameSpan.html();
			
			var yearNameInput = $('<input type="text" class="text year_input" value="'+initialDate+'" />');
			this.yearNameSpan.empty().append(yearNameInput);
			
			$(".year_input", yearNav).keyup(this.bindToObj(function(){
				if($('input',this.yearNameSpan).val().length == 4 && $('input',this.yearNameSpan).val() != initialDate && parseInt($('input',this.yearNameSpan).val()) == $('input',this.yearNameSpan).val()){
					this.moveMonthBy(parseInt(parseInt(parseInt($('input',this.yearNameSpan).val()) - initialDate)*12));
				}else if($('input',this.yearNameSpan).val().length>4)
					$('input',this.yearNameSpan).val($('input',this.yearNameSpan).val().substr(0, 4));
			}));
			
			$('input',this.yearNameSpan).focus();
			$('input',this.yearNameSpan).select();
    	}
		
    }));

	var error_msg = $('<div class="error_msg"></div>');
	
    var nav = $('<div class="nav"></div>').append(error_msg, monthNav, yearNav);
    
    var tableShell = "<table><thead><tr>";
	
	if(this.show_week == 1) {tableShell +='<th class="week_label">'+(this.week_label)+'</th>';}
	
    $(this.adjustDays(this.short_day_names)).each(function() {
      tableShell += "<th>" + this + "</th>";
    });
	
    tableShell += "</tr></thead><tbody></tbody></table>";
	if(this.timeShow === 1 && this.select_week == 0){		
		tableShell += this.timeHourTemp();	
		tableShell += '<div class="curr_time"><button class="data_ui_btn data_ui_btn_now" type="button">现在时间</button><button class="data_ui_btn data_ui_btn_clear" type="button">清空</button><button class="data_ui_btn data_ui_btn_close" type="button">关闭</button></div>';			 
	}
    var style = (this.input.context.type=="hidden")?' style="display:block; position:static; margin:0 auto"':'';    

    this.dateSelector = this.rootLayers = $('<div class="date_selector" '+style+'></div>').append(nav, tableShell).insertAfter(this.input);
    
	if(this.timeShow ===1 && this.select_week == 0){		
		this.timeBtnBind(this.dateSelector);
	}
	
    if(this.timeShow === 1 && this.select_week == 0){
		this.timeHourBind(this.dateSelector);		
	}
    this.tbody = $("tbody", this.dateSelector);

    this.input.change(this.bindToObj(function() { this.selectDate(); }));
	
    this.selectDate();
	
  },
  timeBtnBind:function(obj){
	  var that=this;
  		$(".data_ui_btn_now", obj).click(function(){
			that.changeInput(that.dateToString(new Date),1);	
		});
		$(".data_ui_btn_clear", obj).click(function(){
			that.input.val("");
		});
		$(".data_ui_btn_close", obj).click(function(){
			that.hide();	
		});
  },
  timeHourTemp:function(){
		var hourItem="",mintueItem="",secondItem="",itemNum,m,timeTemp;
		for(itemNum=0;itemNum<24;itemNum++ ){
			m=itemNum>9?itemNum:"0"+itemNum;
			hourItem+="<span date='"+m+"'>"+m+"</span>";	
		}
		for(itemNum=0;itemNum<60;itemNum++ ){
			m=itemNum>9?itemNum:"0"+itemNum;
			mintueItem+="<span date='"+m+"'>"+m+"</span>";	
		}
		for(itemNum=0;itemNum<60;itemNum++ ){
			m=itemNum>9?itemNum:"0"+itemNum;
			secondItem+="<span date='"+m+"'>"+m+"</span>";	
		}
		
		timeTemp='<div class="data_time_hour time_item"><span>00</span> 时</div><div class="data_time_minute time_item"><span>00</span> 分</div>';
		if(this.time_format == "hh:mm:ss"){			
			timeTemp+='<div class="data_time_second time_item"><span>00</span> 秒</div>';
		}
		var timeTemp='<div class="date_time"><div class="til">时间：</div>'+timeTemp+'<div class="select_item select_item_hour none">'+hourItem+'</div><div class="select_item select_item_mintue none">'+mintueItem+'</div><div class="select_item select_item_second none">'+secondItem+'</div></div>';

	return timeTemp;
  },
  timeHourBind:function(obj){
	  var $h = $(".data_time_hour span",obj),
		  $m = $(".data_time_minute span",obj),
		  $s = $(".data_time_second span",obj),
		  $sh = $(".select_item_hour",obj),
		  $sm = $(".select_item_mintue",obj),
		  $ss = $(".select_item_second",obj),
		  that=this;
	  var allHide = function(){
		  $(".time_item span",obj).removeClass("on");
		  $sh.hide();
		  $sm.hide();
		  $ss.hide();		  
	  },clickH = function(O,B){
		  var curr=O.html();
		  allHide();
		  O.addClass("on");
		  B.find("span").removeClass("selected");
		  B.find("span").each(function(index, element) {
            if($(this).html()==curr){
				$(this).addClass("selected");	
			}
          });
		  B.show();
	  };  
	  $h.click(function(){
		  clickH($(this),$sh);		  
	  });
	  $m.click(function(){
		  clickH($(this),$sm);
	  });
	  $s.click(function(){
		  clickH($(this),$ss);
	  });
	  $(".select_item_hour span",obj).click(function(){
			$h.html($(this).html());
			that.changeInput();	
			allHide();
		});
		$(".select_item_mintue span",obj).click(function(){
			$m.html($(this).html());
			that.changeInput();
			allHide();			
		});
		$(".select_item_second span",obj).click(function(){
			$s.html($(this).html());
			that.changeInput();	
			allHide();
		});
  },
  selectMonth: function(date) {
	
    var newMonth = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if(this.isNewDateAllowed(newMonth)){
		if (!this.currentMonth || !(this.currentMonth.getFullYear() == newMonth.getFullYear() &&
									this.currentMonth.getMonth() == newMonth.getMonth())) {
		  
		  this.currentMonth = newMonth;
		  
		  var rangeStart = this.rangeStart(date), rangeEnd = this.rangeEnd(date);
		  var numDays = this.daysBetween(rangeStart, rangeEnd);
		  var dayCells = "";
		  
		  for (var i = 0; i <= numDays; i++) {
			var currentDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i, 12, 00);
			
			if (this.isFirstDayOfWeek(currentDay)){
			
				var firstDayOfWeek = currentDay;
				var lastDayOfWeek = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate()+6, 12, 00);
			
				if(this.select_week && this.isNewDateAllowed(firstDayOfWeek)){
					dayCells += "<tr date='" + this.dateToString(currentDay) + "' class='selectable_week'>";
				}else{
					dayCells += "<tr>";}
					
				if(this.show_week==1){
					dayCells += '<td class="week_num">'+this.getWeekNum(currentDay)+'</td>';}
			}
			if ((this.select_week == 0 && currentDay.getMonth() == date.getMonth() && this.isNewDateAllowed(currentDay) && !this.isHoliday(currentDay)) || (this.select_week==1 && currentDay.getMonth() == date.getMonth() && this.isNewDateAllowed(firstDayOfWeek))) {
			  dayCells += '<td class="selectable_day" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
			} else {
				if(this.select_week != 1){
					if(currentDay.getMonth() == date.getMonth()){
						dayCells += '<td class="unselected_month" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
					}else{
						dayCells += '<td class="unselected_month"></td>';
					}
				}else{
					dayCells += '<td class="unselected_month" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
				}
			  
			};
			
			if (this.isLastDayOfWeek(currentDay)) dayCells += "</tr>";
		  };
		  this.tbody.empty().append(dayCells);
		  
		  this.monthNameSpan.empty().append(this.monthName(date));
		  this.yearNameSpan.empty().append(this.currentMonth.getFullYear());
		  
		  if(this.select_week == 0){
			  $(".selectable_day", this.tbody).click(this.bindToObj(function(event) {
				this.changeInput($(event.target).attr("date"));
			  }));
		  }else{
			  $(".selectable_week", this.tbody).click(this.bindToObj(function(event) {
				this.changeInput($(event.target.parentNode).attr("date"));
			  }));
		  }
		  
		  $("td[date='" + this.dateToString(new Date()) + "']", this.tbody).addClass("today");
		  if(this.select_week == 1){
			  $("tr", this.tbody).mouseover(function() { $(this).addClass("hover"); });
			  $("tr", this.tbody).mouseout(function() { $(this).removeClass("hover"); });
		  }else{
			  $("td.selectable_day", this.tbody).mouseover(function() { $(this).addClass("hover"); });
			  $("td.selectable_day", this.tbody).mouseout(function() { $(this).removeClass("hover"); });
		  }
		};
		
		$('.selected', this.tbody).removeClass("selected");
		$('td[date="' + this.selectedDateString + '"], tr[date="' + this.selectedDateString + '"]', this.tbody).addClass("selected");
	}else{
		this.show_error(this.error_out_of_range);}
  },
  
  selectDate: function(date) {
    if (typeof(date) == "undefined") {
      date = this.stringToDate(this.input.val().replace(/\s{1}\d{2}:\d{2}[:\d{2}]?/,""));
    };
    if (!date) {date = new Date();}
	if(this.select_week == 1 && !this.isFirstDayOfWeek(date)){
		date = new Date(date.getFullYear(), date.getMonth(), (date.getDate() - date.getDay() + this.start_of_week), 12, 00);}	
	
	if(this.isNewDateAllowed(date)){
		this.selectedDate = date;
		this.selectedDateString = this.dateToString(this.selectedDate);
		this.selectMonth(this.selectedDate);
	}else if((this.date_min) && this.daysBetween(this.date_min, date)<0){
			this.selectedDate = this.date_min;
			this.selectMonth(this.date_min);
			this.input.val(" ");
	}else{
			this.selectMonth(this.date_max);
			this.input.val(" ");
	}
  },
  
  isNewDateAllowed: function(date){
	return ((!this.date_min) || this.daysBetween(this.date_min, date)>=0) && ((!this.date_max) || this.daysBetween(date, this.date_max)>=0);
  },

  isHoliday: function(date){
	return ((this.indexFor(this.selectable_days, date.getDay())===false || this.indexFor(this.non_selectable, this.dateToString(date))!==false) || this.indexFor(this.rec_non_selectable, this.dateToShortString(date))!==false);
  },
  timeHour:function(curr){
	  var tiemTemp,myDate,h,m,s,th,tm,ts;
	  myDate = new Date();
	  h=myDate.getHours();
	  m=myDate.getMinutes();
	  s=myDate.getSeconds();
	  h=h>9?h:"0"+h;
	  m=m>9?m:"0"+m;	  
	  s=s>9?s:"0"+s;
	  th=this.dateSelector.find(".data_time_hour span").html();
	  tm=this.dateSelector.find(".data_time_minute span").html();
	  ts=this.dateSelector.find(".data_time_second span").html();
	  if(this.time_format == 'hh:mm:ss'){
		  if(curr === 1){
			  timeTemp=h+":"+m+":"+s;
			  this.dateSelector.find(".data_time_hour span").html(h);
			  this.dateSelector.find(".data_time_minute span").html(m);
			  this.dateSelector.find(".data_time_second span").html(s);
		  }else{
			timeTemp=th+":"+tm+":"+ts;  
		 }
		  		  
	 }else{
		 if(curr === 1){
			  timeTemp=h+":"+m;
			  this.dateSelector.find(".data_time_hour span").html(h);
			  this.dateSelector.find(".data_time_minute span").html(m);

		  }else{
			timeTemp=th+":"+tm;  
		 }
	 }	 
	return  timeTemp;
  },
  changeInput: function(dateString,curr) {	
	var timeSec,date;
	if(typeof(dateString) == "undefined"){
		if(this.input.val() ==""){
			return;
		}
		if(this.timeShow == 1){
			dateString = this.input.val().replace(/\s{1}\d{2}:\d{2}[:\d{2}]*/,"");	
		}
			
	}
	date=dateString;
	if(!this.isNewDateAllowed(this.stringToDate(dateString))){
		this.show_error(this.error_out_of_range);
		return;
	}
	if(this.timeShow ){
		if(curr ===1){
			dateString =dateString+" "+this.timeHour(1);			
		}else{
			dateString =dateString+" "+this.timeHour();
		}		
	}
	
	this.input.val(dateString);
	this.selectDate();
	$('.selected', this.tbody).removeClass("selected");
	if(this.select_week == 1){		
		$('tr[date="' + date + '"]', this.tbody).addClass("selected");
	}else{
		$('td[date="' + date + '"]', this.tbody).addClass("selected");
	}
    if(this.input.context.type!="hidden" && !(this.timeShow === 1 && this.select_week == 0)){
	   this.hide();
	}
  },
  
  show: function() {
	 
	$('.error_msg', this.rootLayers).css('display', 'none');
	if(this.select_week == 0 && this.timeShow == 1 && this.input.val() == "" ){
		this.timeHour(1);
	}   
	this.rootLayers.slideDown();
    $([window, document.body]).click(this.hideIfClickOutside);
    this.input.unbind("focus", this.show);
	this.input.attr('readonly', true);
    $(document.body).keydown(this.keydownHandler);
    this.setPosition();
  },
  
  hide: function() {

	if(this.input.context.type!="hidden"){
		this.input.removeAttr('readonly');
		this.rootLayers.slideUp();
		$([window, document.body]).unbind("click", this.hideIfClickOutside);
		this.input.focus(this.show);
		$(document.body).unbind("keydown", this.keydownHandler);
	}
  },
  
  hideIfClickOutside: function(event) {
    if (event.target != this.input[0] && event.target.nodeName.toLowerCase() !="option" && !this.insideSelector(event)) {
      this.hide();
    };
	if(!(event.target.nodeName.toLowerCase() == "span" && $(event.target).parent().hasClass("select_item")) && !$(event.target).parent().hasClass("time_item")){
		$(".date_time .select_item").hide();
		$(".date_time .time_item span").removeClass("on");
	}
  },
  
  insideSelector: function(event) {
    var offset = this.dateSelector.offset();
    offset.right = offset.left + this.dateSelector.outerWidth();
    offset.bottom = offset.top + this.dateSelector.outerHeight();

    return event.pageY < offset.bottom &&
           event.pageY > offset.top &&
           event.pageX < offset.right &&
           event.pageX > offset.left;
  },
  
  keydownHandler: function(event) {
    switch (event.keyCode)
    {
      case 9: 
      case 27:
        this.hide();
        return;
      break;
      case 13:
		if(this.isNewDateAllowed(this.stringToDate(this.selectedDateString)) && !this.isHoliday(this.stringToDate(this.selectedDateString)))
	        this.changeInput(this.selectedDateString);
      break;
      case 33:
        this.moveDateMonthBy(event.ctrlKey ? -12 : -1);
      break;
      case 34:
        this.moveDateMonthBy(event.ctrlKey ? 12 : 1);
      break;
      case 38:
        this.moveDateBy(-7);
      break;
      case 40:
        this.moveDateBy(7);
      break;
      case 37:
        if(this.select_week == 0) this.moveDateBy(-1);
      break;
      case 39:
        if(this.select_week == 0) this.moveDateBy(1);
      break;
      default:
        return;
    }
    event.preventDefault();
  },
  
  stringToDate: function(string) {
    var matches;
	
    if (matches = string.match(this.reg)) {
      if(matches[3]==0 && matches[2]==0 && matches[1]==0)
    	return null;
      else
        return eval(this.date_decode);
    } else {
      return null;
    };
  },
  
  dateToString: function(date) {
    return eval(this.date_encode);
  },

  dateToShortString: function(date){
    return eval(this.date_encode_s);
  },
  
  setPosition: function() {
    var offset = this.input.offset();
    /*this.rootLayers.css({
      top: offset.top + this.input.outerHeight(),
      left: offset.left
    });*/
    this.rootLayers.css({
      top:  this.input.outerHeight(),
      left: 0
    });
    if (this.ieframe) {
      this.ieframe.css({
        width: this.dateSelector.outerWidth(),
        height: this.dateSelector.outerHeight()
      });
    };
  },
  
  moveDateBy: function(amount) {
    var newDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() + amount);
    this.selectDate(newDate);
  },
  
  moveDateMonthBy: function(amount) {
    var newDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + amount, this.selectedDate.getDate());
    if (newDate.getMonth() == this.selectedDate.getMonth() + amount + 1) {
      newDate.setDate(0);
    };
    this.selectDate(newDate);
  },
  
  moveMonthBy: function(amount) {
	if(amount<0)
		var newMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + amount+1, -1);
    else
		var newMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + amount, 1);
    this.selectMonth(newMonth);
  },
  
  monthName: function(date) {
    return this.month_names[date.getMonth()];
  },
  
  getMonthSelect:function(){
  	var month_select = '<select>';
	for(var i = 0; i<this.month_names.length; i++){
		if(i==this.currentMonth.getMonth())
			month_select += '<option value="'+(i)+'" selected="selected">'+this.month_names[i]+'</option>';
		else
			month_select += '<option value="'+(i)+'">'+this.month_names[i]+'</option>';
	}
	month_select += '</select>';
	
	return month_select;
  },
  
  bindToObj: function(fn) {
    var self = this;
    return function() { return fn.apply(self, arguments) };
  },
  
  bindMethodsToObj: function() {
    for (var i = 0; i < arguments.length; i++) {
      this[arguments[i]] = this.bindToObj(this[arguments[i]]);
    };
  },
  
  indexFor: function(array, value) {
    for (var i = 0; i < array.length; i++) {
      if (value == array[i]) return i;
    };
	return false;
  },
  
  monthNum: function(month_name) {
    return this.indexFor(this.month_names, month_name);
  },
  
  shortMonthNum: function(month_name) {
    return this.indexFor(this.short_month_names, month_name);
  },
  
  shortDayNum: function(day_name) {
    return this.indexFor(this.short_day_names, day_name);
  },
  
  daysBetween: function(start, end) {
	 if(typeof(start) != "object"){
		 start=this.isNewDateAllowed(this.stringToDate(start));
	}	  
    start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return (end - start) / 86400000;
  },
  
  changeDayTo: function(dayOfWeek, date, direction) {
    var difference = direction * (Math.abs(date.getDay() - dayOfWeek - (direction * 7)) % 7);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
  },
  
  rangeStart: function(date) {
    return this.changeDayTo(this.start_of_week, new Date(date.getFullYear(), date.getMonth()), -1);
  },
  
  rangeEnd: function(date) {
    return this.changeDayTo((this.start_of_week - 1) % 7, new Date(date.getFullYear(), date.getMonth() + 1, 0), 1);
  },
  
  isFirstDayOfWeek: function(date) {
    return date.getDay() == this.start_of_week;
  },
  
  getWeekNum:function(date){
	date_week= new Date(date.getFullYear(), date.getMonth(), date.getDate()+6);
	var firstDayOfYear = new Date(date_week.getFullYear(), 0, 1, 12, 00);
	var n = parseInt(this.daysBetween(firstDayOfYear, date_week)) + 1;
	return Math.floor((date_week.getDay() + n + 5)/7) - Math.floor(date_week.getDay() / 5);
  },
  
  isLastDayOfWeek: function(date) {
    return date.getDay() == (this.start_of_week - 1) % 7;
  },
  
  show_error: function(error){
	$('.error_msg', this.rootLayers).html(error);
	$('.error_msg', this.rootLayers).slideDown(400, function(){
		setTimeout("$('.error_msg', this.rootLayers).slideUp(200);", 2000);
	});
  },
  
  adjustDays: function(days) {
    var newDays = [];
    for (var i = 0; i < days.length; i++) {
      newDays[i] = days[(i + this.start_of_week) % 7];
    };
    return newDays;
  },
  
  strpad: function(num){
	if(parseInt(num)<10)	return "0"+parseInt(num);
	else	return parseInt(num);
  }
  
};

$.fn.jdPicker = function(opts) {
  return this.each(function() { new jdPicker(this, opts); });
};
$.jdPicker = { initialize: function(opts) {
  $("input.jdpicker").jdPicker(opts);
} };

return jdPicker;
})(jQuery); 

$($.jdPicker.initialize);