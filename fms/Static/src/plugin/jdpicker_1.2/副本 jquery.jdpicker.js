define(function(require, exports, module){
  return function(jquery){
    (function($) { // Localise the $ function
        //var $ = require('../common/jquery');
        function DateInput(el, opts) {
            if (typeof(opts) != "object") opts = {};
            $.extend(this, DateInput.DEFAULT_OPTS, opts);
            this.input = $(el);
            this.bindMethodsToObj("show", "hide", "hideIfClickOutside", "keydownHandler", "selectDate");
            this.build();
            this.selectDate();
            this.hide();
            this.set_now_time();
            this.show_time();
            this.get_time();
            this.hide_time();
            this.clear_time();
            this.close_time();
        };

        DateInput.DEFAULT_OPTS = {
            month_names: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            short_month_names: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"],
            short_day_names: ["日","一", "二", "三", "四", "五", "六"],
            start_of_week: 0
        };

        DateInput.prototype = {
        build: function () {
            var monthNav = $('<p class="month_nav">' +
                '<span class="button prev" title="[Page-Up]">&#171;</span>' +
                ' <span class="month_name"></span> ' +
                '<span class="button next" title="[Page-Down]">&#187;</span>' +
                '</p>');
            this.monthNameSpan = $(".month_name", monthNav);
            $(".prev", monthNav).click(this.bindToObj(function() { this.moveMonthBy(-1); }));
            $(".next", monthNav).click(this.bindToObj(function() { this.moveMonthBy(1); }));
          
            var yearNav = $('<p class="year_nav">' +
                '<span class="button prev" title="[Ctrl+Page-Up]">&#171;</span>' +
                ' <span class="year_name"></span> ' +
                '<span class="button next" title="[Ctrl+Page-Down]">&#187;</span>' +
                '</p>');
            this.yearNameSpan = $(".year_name", yearNav);
            $(".prev", yearNav).click(this.bindToObj(function() { this.moveMonthBy(-12); }));
            $(".next", yearNav).click(this.bindToObj(function() { this.moveMonthBy(12); }));
          
            var nav = $('<div class="nav"></div>').append(monthNav, yearNav);
          
            var tableShell = "<table><thead><tr>";
            $(this.adjustDays(this.short_day_names)).each(function() {
                tableShell += "<th>" + this + "</th>";
            });
            tableShell += "</tr></thead><tbody></tbody></table>";

            var hourItem = "", mintueItem = "", secondItem = "", itemNum, m, timeTemp;
            for (itemNum = 0; itemNum < 24; itemNum++) {
                m = itemNum > 9 ? itemNum : "0" + itemNum;
                hourItem += "<span date='" + m + "'>" + m + "</span>";
            }
            for (itemNum = 0; itemNum < 60; itemNum++) {
                m = itemNum > 9 ? itemNum : "0" + itemNum;
                mintueItem += "<span date='" + m + "'>" + m + "</span>";
            }
            for (itemNum = 0; itemNum < 60; itemNum++) {
                m = itemNum > 9 ? itemNum : "0" + itemNum;
                secondItem += "<span date='" + m + "'>" + m + "</span>";
            }

            var timeshow = '<div class="data_time_hour time_item"><span>00</span> 时</div><div class="data_time_minute time_item"><span>00</span> 分</div><div class="data_time_second time_item"><span>00</span> 秒</div>';
            var timeTemp = '<div class="date_time"><div class="til">时间：</div>' + timeshow + '<div class="select_item select_item_hour" style="display:none;">' + hourItem + '</div><div class="select_item select_item_minute" style="display:none;">' + mintueItem + '</div><div class="select_item select_item_second" style="display:none;">' + secondItem + '</div></div>';

            var time_btn = '<div class="cur_time"><span class="data_ui_btn data_ui_btn_now" >现在时间</span><span class="data_ui_btn data_ui_btn_clear" >清空</span><span class="data_ui_btn data_ui_btn_close" >关闭</span></div>';
          
            this.dateSelector = this.rootLayers = $('<div class="date_selector"></div>').append(nav, tableShell, timeTemp, time_btn).appendTo('body');
          
            if ($.browser.msie && $.browser.version < 7) {
                // The ieframe is a hack which works around an IE <= 6 bug where absolutely positioned elements
                // appear behind select boxes. Putting an iframe over the top of the select box prevents this.
                this.ieframe = $('<iframe class="date_selector_ieframe" frameborder="0" src="#"></iframe>').insertBefore(this.dateSelector);
                this.rootLayers = this.rootLayers.add(this.ieframe);
            
                // IE 6 only does :hover on A elements
                $(".button", nav).mouseover(function() { $(this).addClass("hover") });
                $(".button", nav).mouseout(function() { $(this).removeClass("hover") });
            };
          
            this.tbody = $("tbody", this.dateSelector);
          
            this.input.change(this.bindToObj(function() { this.selectDate(); }));
            this.selectDate();
            this.now_time();
        },
        

        set_now_time: function () {
            var that = this;
            $('.data_ui_btn_now').unbind('click').bind('click', function () {
                that.now_time();
                that.change_select_date();
            })
        },

        show_time: function () {
            $('.data_time_hour span').unbind('click').bind('click',function () {
                $(".select_item").hide();
                $('.select_item_hour').show();
            });
            $('.data_time_minute span').unbind('click').bind('click',function () {
                $(".select_item").hide();
                $('.select_item_minute').show();
            });
            $('.data_time_second span').unbind('click').bind('click',function () {
                $(".select_item").hide();
                $('.select_item_second').show();
            });
        },

        hide_time: function () {
            $([window, document.body]).unbind('click').bind('click',function (event) {
                if (!$(event.target).parent().hasClass("time_item")) {
                    $(".select_item").hide();
                }
            });
        },

        get_time: function () {
            var that = this;
            $('.select_item_hour span').unbind('click').bind('click',function (e) {
                $('.data_time_hour span').text($(this).text());
                $(this).addClass('time_selectd').siblings('span').removeClass('time_selectd');
                that.change_select_date();
            });
            $('.select_item_minute span').unbind('click').bind('click',function () {
                $('.data_time_minute span').text($(this).text());
                $(this).addClass('time_selectd').siblings('span').removeClass('time_selectd');
                that.change_select_date();
            })
            $('.select_item_second span').unbind('click').bind('click',function () {
                $('.data_time_second span').text($(this).text());
                $(this).addClass('time_selectd').siblings('span').removeClass('time_selectd');
                that.change_select_date();
            })
        },

        change_select_date: function () {
            var num,now_val;
            $('.date_selector').each(function (index) {
                if ($(this).is(':visible')) {
                    num = index;
                    return false;
                }
            })
            now_val = $('.jdpicker').eq(num).val();
            if (now_val) {
                var timeString = this.get_set_time(event);
                var dataString = now_val.split(' ')[0];
                $('.jdpicker').eq(num).val(dataString + timeString).change();
            }
        },

        clear_time: function () {
            $('.data_ui_btn_clear').unbind('click').bind('click',function () {
                var num;
                $('.date_selector').each(function (index) {
                    if ($(this).is(':visible')) {
                        num = index;
                        return false;
                    }
                })
                $('.jdpicker').eq(num).val('');
            })
        },

        close_time: function () {
            $('.data_ui_btn_close').unbind('click').bind('click',function () {
                $('.date_selector').hide();
            })
        },

        now_time: function () {
            var myDate, h, m, s;
            myDate = new Date();
            h = myDate.getHours();
            m = myDate.getMinutes();
            s = myDate.getSeconds();
            h = h > 9 ? h : "0" + h;
            m = m > 9 ? m : "0" + m;
            s = s > 9 ? s : "0" + s;

            $('.data_time_hour span').text(h);
            $('.data_time_minute span').text(m);
            $('.data_time_second span').text(s);

            $('.select_item_hour span').removeClass('time_selectd').eq(h).addClass('time_selectd');
            $('.select_item_minute span').removeClass('time_selectd').eq(m).addClass('time_selectd');
            $('.select_item_second span').removeClass('time_selectd').eq(s).addClass('time_selectd');
        },

        selectMonth: function(date) {
            var newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          
            if (!this.currentMonth || !(this.currentMonth.getFullYear() == newMonth.getFullYear() &&
                                        this.currentMonth.getMonth() == newMonth.getMonth())) {
                // We have moved to a different month and so need to re-draw the table
                this.currentMonth = newMonth;
            
                // Work out the range of days we will draw
                var rangeStart = this.rangeStart(date), rangeEnd = this.rangeEnd(date);
                var numDays = this.daysBetween(rangeStart, rangeEnd);
                var dayCells = "";
            
                // Draw each of the days
                for (var i = 0; i <= numDays; i++) {
                    var currentDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i, 12, 00);
              
                    if (this.isFirstDayOfWeek(currentDay)) dayCells += "<tr>";
              
                    if (currentDay.getMonth() == date.getMonth()) {
                        dayCells += '<td class="selectable_day" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
                    } else {
                        dayCells += '<td class="unselected_month" date="' + this.dateToString(currentDay) + '">' + currentDay.getDate() + '</td>';
                    };
              
                    if (this.isLastDayOfWeek(currentDay)) dayCells += "</tr>";
                };
                this.tbody.empty().append(dayCells);
            
                // Write the month and year in the header
                this.monthNameSpan.empty().append(this.monthName(date));
                this.yearNameSpan.empty().append(this.currentMonth.getFullYear());
            
                $(".selectable_day", this.tbody).click(this.bindToObj(function(event) {
                    this.changeInput($(event.target).attr("date"));
                }));
            
                $("td[date=" + this.dateToString(new Date()) + "]", this.tbody).addClass("today");
            
                $("td.selectable_day", this.tbody).mouseover(function() { $(this).addClass("hover") });
                $("td.selectable_day", this.tbody).mouseout(function() { $(this).removeClass("hover") });
            };
          
            $('.selected', this.tbody).removeClass("selected");
            $('td[date=' + this.selectedDateString + ']', this.tbody).addClass("selected");
        },
        
        // Select a particular date. If the date is not specified it is read from the input. If no date is
        // found then the current date is selected. The selectMonth() function is responsible for actually
        // selecting a particular date.
        selectDate: function(date) {
            if (typeof(date) == "undefined") {
                date = this.stringToDate(this.input.val());
            };
            if (!date) date = new Date();
            this.selectedDate = date;
            this.selectedDateString = this.dateToString(this.selectedDate);
            this.selectMonth(this.selectedDate);
        },
        
        get_set_time: function (event) {
            var obj = event.srcElement ? event.srcElement : event.target;
            var this_date_time = $(obj).parents('.date_selector').find('.date_time');
            var h,m,s;
            h = this_date_time.find('.data_time_hour span').text();
            m = this_date_time.find('.data_time_minute span').text();
            s = this_date_time.find('.data_time_second span').text();
            var this_time = ' ' + h + ':' + m + ':' + s;
            return this_time;
        },
        // Write a date string to the input and hide. Trigger the change event so we know to update the
        // selectedDate.
        changeInput: function (dateString) {
            var timeString = this.get_set_time(event);
            var detail_val = dateString + timeString;
            this.input.val(detail_val).change();
        },
        
           
        show: function() {
          this.rootLayers.css("display", "block");
         $(document).live('click',this.hideIfClickOutside);

          //this.hideIfClickOutside();
          this.input.unbind("focus", this.show);
          $(document.body).keydown(this.keydownHandler);
          this.setPosition();
        },
        
        hide: function() {
          this.rootLayers.css("display", "none");
          $(document).unbind("click", this.hideIfClickOutside);
          this.input.focus(this.show);
          $(document.body).unbind("keydown", this.keydownHandler);
        },
        
        // We should hide the date selector if a click event happens outside of it
        hideIfClickOutside: function(event) {
            if (event.target != this.input[0] && !this.insideSelector(event)) {
            this.hide();
          };
        },
        
        // Returns true if the given event occurred inside the date selector
        insideSelector: function(event) {
          var offset = this.dateSelector.position();
          offset.right = offset.left + this.dateSelector.outerWidth();
          offset.bottom = offset.top + this.dateSelector.outerHeight();
          
          return event.pageY < offset.bottom &&
                 event.pageY > offset.top &&
                 event.pageX < offset.right &&
                 event.pageX > offset.left;
        },
        
        // Respond to various different keyboard events
        keydownHandler: function(event) {
          switch (event.keyCode)
          {
            case 9: // tab
            case 27: // esc
              this.hide();
              return;
            break;
            case 13: // enter
              this.changeInput(this.selectedDateString);
            break;
            case 33: // page up
              this.moveDateMonthBy(event.ctrlKey ? -12 : -1);
            break;
            case 34: // page down
              this.moveDateMonthBy(event.ctrlKey ? 12 : 1);
            break;
            case 38: // up
              this.moveDateBy(-7);
            break;
            case 40: // down
              this.moveDateBy(7);
            break;
            case 37: // left
              this.moveDateBy(-1);
            break;
            case 39: // right
              this.moveDateBy(1);
            break;
            default:
              return;
          }
          event.preventDefault();
        },
        
        stringToDate: function(string) {
          var matches;
          if (matches = string.match(/^(\d{1,2}) ([^\s]+) (\d{4,4})$/)) {
            return new Date(matches[3], this.shortMonthNum(matches[2]), matches[1], 12, 00);
          } else {
            return null;
          };
        },
        
        dateToString: function(date) {
          return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
          // return date.getDate() + " " + this.short_month_names[date.getMonth()] + " " + date.getFullYear();
        },
        
        setPosition: function() {
            var offset = this.input.offset();
            //计算距离底部的高度
            var top = offset.top;
            //计算窗体的高度
            var win_h = $(window).height();
            //计算输入框距离底端的距离，30为输入框的高度（包括padding和border）
            var bottom = win_h - top ;
            //日历插件高度
            var tip_h = 232;
            //如果提示框距离底部的高度太小则上翻,
            if (bottom <tip_h) {
                this.rootLayers.css({
                    top: top - tip_h - 8 + 'px',
                    left: offset.left
                });
            } else {
                this.rootLayers.css({
                    top: offset.top + this.input.outerHeight(),
                    left: offset.left
                });
            }
          
          if (this.ieframe) {
            this.ieframe.css({
              width: this.dateSelector.outerWidth(),
              height: this.dateSelector.outerHeight()
            });
          };
        },
        
        // Move the currently selected date by a particular number of days
        moveDateBy: function(amount) {
          var newDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() + amount);
          this.selectDate(newDate);
        },
        
        // Move the month of the currently selected date by a particular number of months. If we are moving
        // to a month which does not have enough days to represent the current day-of-month, then we 
        // default to the last day of the month.
        moveDateMonthBy: function(amount) {
          var newDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + amount, this.selectedDate.getDate());
          if (newDate.getMonth() == this.selectedDate.getMonth() + amount + 1) {
            // We have moved too far. For instance 31st March + 1 month = 1st May, not 30th April
            newDate.setDate(0);
          };
          this.selectDate(newDate);
        },
        
        // Move the currently displayed month by a certain amount. This does *not* move the currently
        // selected date, so we end up viewing a month with no visibly selected date.
        moveMonthBy: function(amount) {
          var newMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + amount, this.currentMonth.getDate());
          this.selectMonth(newMonth);
        },
        
        monthName: function(date) {
          return this.month_names[date.getMonth()];
        },
        
        // A hack to make "this" refer to this object instance when inside the given function
        bindToObj: function(fn) {
          var self = this;
          return function() { return fn.apply(self, arguments) };
        },
        
        // See above
        bindMethodsToObj: function() {
          for (var i = 0; i < arguments.length; i++) {
            this[arguments[i]] = this.bindToObj(this[arguments[i]]);
          };
        },
        
        // Finds out the array index of a particular value in that array
        indexFor: function(array, value) {
          for (var i = 0; i < array.length; i++) {
            if (value == array[i]) return i;
          };
        },
        
        // Finds the number of a given month name
        monthNum: function(month_name) {
          return this.indexFor(this.month_names, month_name);
        },
        
        // Finds the number of a given short month name
        shortMonthNum: function(month_name) {
          return this.indexFor(this.short_month_names, month_name);
        },
        
        // Finds the number of a given day name
        shortDayNum: function(day_name) {
          return this.indexFor(this.short_day_names, day_name);
        },
        
        // Works out the number of days between two dates
        daysBetween: function(start, end) {
          start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
          end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
          return (end - start) / 86400000;
        },
        
        /*
        changeDayTo: Given a date, move along the date line in the given direction until we reach the
        desired day of week.
        
        The maths is a bit complex, here's an explanation.
        
        Think of a continuous repeating number line like:
        
        .. 5 6 0 1 2 3 4 5 6 0 1 2 3 4 5 6 0 1 ..
        
        We are essentially trying to find the difference between two numbers
        on the line in one direction (dictated by the sign of direction variable).
        Unfortunately Javascript's modulo operator works such that -5 % 7 = -5,
        instead of -5 % 7 = 2, so we need to only work with the positives.
        
        To find the difference between 1 and 4, going backwards, we can treat 1
        as (1 + 7) = 8, so the different is |8 - 4| = 4. If we don't cross the 
        boundary between 0 and 6, for instance to find the backwards difference
        between 5 and 2, |(5 + 7) - 2| = |12 - 2| = 10. And 10 % 7 = 3.
        
        Going forwards, to find the difference between 4 and 1, we again treat 1
        as (1 + 7) = 8, and the difference is |4 - 8| = 4. If we don't cross the
        boundary, the difference between 2 and 5 is |2 - (5 + 7)| = |2 - 12| = 10.
        And 10 % 7 = 3.
        
        Once we have the positive difference in either direction represented as a
        absolute value, we can multiply it by the direction variable to get the difference
        in the desired direction.
        
        We can condense the two methods into a single equation:
        
          backwardsDifference = direction * (|(currentDayNum + 7) - dayOfWeek| % 7)
                              = direction * (|currentDayNum - dayOfWeek + 7|  % 7)
          
           forwardsDifference = direction * (|currentDayNum - (dayOfWeek + 7)| % 7)
                              = direction * (|currentDayNum - dayOfWeek - 7| % 7)
          
          (The two equations now differ only by the +/- 7)
          
                   difference = direction * (|currentDayNum - dayOfWeek - (direction * 7)| % 7)
        */
        changeDayTo: function(dayOfWeek, date, direction) {
          var difference = direction * (Math.abs(date.getDay() - dayOfWeek - (direction * 7)) % 7);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
        },
        
        // Given a date, return the day at the start of the week *before* this month
        rangeStart: function(date) {
          return this.changeDayTo(this.start_of_week, new Date(date.getFullYear(), date.getMonth()), -1);
        },
        
        // Given a date, return the day at the end of the week *after* this month
        rangeEnd: function(date) {
          return this.changeDayTo((this.start_of_week - 1) % 7, new Date(date.getFullYear(), date.getMonth() + 1, 0), 1);
        },
        
        // Is the given date the first day of the week?
        isFirstDayOfWeek: function(date) {
          return date.getDay() == this.start_of_week;
        },
        
        // Is the given date the last day of the week?
        isLastDayOfWeek: function(date) {
          return date.getDay() == (this.start_of_week - 1) % 7;
        },
        
        // Adjust a given array of day names to begin with the configured start-of-week
        adjustDays: function(days) {
          var newDays = [];
          for (var i = 0; i < days.length; i++) {
            newDays[i] = days[(i + this.start_of_week) % 7];
          };
          return newDays;
        }
      };

      $.fn.date_input = function(opts) {
        return this.each(function() { new DateInput(this, opts); });
      };

      $.date_input = {
        initialize: function(opts) {
          $("input.jdpicker").date_input(opts);
        },
		//增加一行之后初始化
		my_init:function(el,opts){
			$(el).date_input(opts);
		}
      };

      return DateInput;
      //module.exports = DateInput;
    })(jquery); // End localisation of the $ function
  }

});