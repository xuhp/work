define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    var  daily= {
        init: function (orderId) {
            this._create_daily(orderId);
            this._full_scroll();
        },
        _create_daily: function (orderId) {
            $('body').append('<span class="loader-big"></span>');
            $.ajax({
                type: "post",
                url: $.url_prefix+$.general+'method=GetFlowLog',
                data: {'orderID': orderId},
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg)
                        return false;
                    }
                    //创建元素
                    $('#daily tbody').append(create_daily(data));
                    //转化日期格式
                    $('#daily tbody tr .operateDate').each(function () {
                        $(this).text(ToDate($(this).text()));
                    });
                    //转化时间格式
                    $('#daily tbody tr .operateTime').each(function () {
                        $(this).text(ToTime($(this).text()));
                    });
                    $('.loader-big').remove();
                    //表格各行变色
                    tabColor();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        _full_scroll: function () {
            $(function () {
                var win = $(window);
                // Full body scroll
                var isResizing = false;
                win.bind(
                    'resize',
                    function () {
                        if (!isResizing) {
                            isResizing = true;
                            var container = $('#full-page-container');
                            // Temporarily make the container tiny so it doesn't influence the
                            // calculation of the size of the document
                            container.css(
                                {
                                    'width': 1,
                                    'height': 1
                                }
                            );
                            // Now make it the size of the window...
                            container.css(
                                {
                                    'width': win.width(),
                                    'height': win.height()
                                }
                            );
                            isResizing = false;
                            container.jScrollPane(
                                {
                                    'showArrows': true
                                }
                            );
                        }
                    }
                ).trigger('resize');

                // Workaround for known Opera issue which breaks demo (see
                // http://jscrollpane.kelvinluck.com/known_issues.html#opera-scrollbar )
                $('body').css('overflow', 'hidden');

                // IE calculates the width incorrectly first time round (it
                // doesn't count the space used by the native scrollbar) so
                // we re-trigger if necessary.
                if ($('#full-page-container').width() != win.width()) {
                    win.trigger('resize');
                }

                // Internal scrollpanes
                $('.scroll-pane').jScrollPane({ showArrows: true });
            });

        }
    }
    //创建日志
    function create_daily(data) {
        var trs = '';
        var len=data.length;
        for (var i = 0; i < len; i++) {
            trs += '<tr>';
            /*处理首行*/
            //如果只有一条数据，则添加flowOnly
            if (len == 1) {
                trs += '<td class="tl"><span class="flow flowOnly fl">1</span><span class="fl text-middle">' + data[0].HistoryStatus + '</span></td>'
            } else {
                //如果大于两条则对首条和最后一条做特殊处理
                switch (i) {
                    case 0:
                        trs += '<td class="tl"><span class="flow flowTop fl">' + (i + 1) + '</span><span class="fl text-middle">' + data[i].HistoryStatus + '</span></td>';
                        break;
                    case len - 1:
                        trs += '<td class="tl"><span class="flow flowBottom fl">' + (i + 1) + '</span><span class="fl text-middle">' + data[i].HistoryStatus + '</span></td>';
                        break;
                    default:
                        trs += '<td class="tl"><span class="flow fl">' + (i + 1) + '</span><span class="fl text-middle">' + data[i].HistoryStatus + '</span></td>';
                }
            }
            trs += '<td class="operateDate">' + data[i].OperateDate + '</td>' +
                '<td  class="operateTime">' + data[i].OperateTime + '</td>' +
                '<td class="tl" title="' + data[i].Event + '">' + data[i].Event + '</td>' +
                '<td>' + data[i].OperateUser + '</td>' +
                '<td>' + data[i].NextUser + '</td>' +
                '</tr>';
        }
        return trs;
    }
    //表格各行变色
    function tabColor() {
        var $tbody = $('.fms-table tbody');
        $tbody.find('tr:odd').css('background', '#F0F0F0');
    }
    //字符串转换成日期
    function ToDate(str){
        var DateStr = typeof(str)=="string"?str:str.toString();
        var myDate = DateStr.substr(0,4)+"/"+DateStr.substr(4,2)+"/"+DateStr.substr(6,2);
        return 	myDate;
    }
    //字符串转换成具体时间
    function ToTime(str){
        var TimeStr = typeof (str) == "string" ? str : str.toString();
        var lackLen = 6 - TimeStr.length;
        for (var i = 0; i < lackLen; i++) {
            TimeStr = "0" + TimeStr;
        }
        var myTime = TimeStr.substr(0, 2) + ":" + TimeStr.substr(2, 2) + ":" + TimeStr.substr(4, 2);
        return myTime;
    }
    //错误提示效果
    function errorMsg(msg) {
        art.dialog({
            id: 'errorMsg',
            drag: false,
            content: msg,
            title: '错误提示页面',
            lock: true
        });
        art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
    }

    module.exports = daily;
});