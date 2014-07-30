/*
 *@Description: 差旅报销日志模板
 *@date:        2014-04-30
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    function travel_log_temp() {
        var travel_log = template.compile('travel_log', '<div id="full-page-container"> <table class="fms-table noBorderTable ellip-table" id="daily"> <thead> <tr> <th style="width:17%;"></th> <th style="width:11%;">\u65e5\u671f</th> <th style="width:9%;">\u65f6\u95f4</th> <th style="width:33%;">\u64cd\u4f5c\u4e8b\u4ef6</th> <th style="width:15%;">\u64cd\u4f5c\u4eba</th> <th style="width:15%;">\u4e0b\u4e00\u4e2a\u64cd\u4f5c\u4eba</th> </tr> </thead> <tbody> <%for(var i=0;i<data.length;i++){%> <tr> <td class="tl"><span class="flow fl"><%=i+1%></span><span class="fl text-middle"><%=data[i].HistoryStatus%></span></td> <td class="operateDate"><%=data[i].OperateDate%></td> <td class="operateTime"><%=data[i].OperateTime%></td> <td class="tl" title="<%=data[i].Event%>"><%=data[i].Event%></td> <td><%=data[i].OperateUser%></td> <td><%=data[i].NextUser%></td> </tr> <%}%> </tbody> </table> </div>');
        return travel_log;
    }
    exports.travel_log_temp = travel_log_temp;
})
