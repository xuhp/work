/*
 *@Description: 头部模板
 *@date:        2014-04-29
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    function header_temp() {
        var header = template.compile('header', '<div class="mutate-table-wrapper detailTop" periodid="<%=periodid%>"> <table style="width: 100%;" class="ellip-table"> <tbody> <tr> <td colspan="6"> <div class="top_td"> <span class="label">\u516c\u53f8: </span><span class="mr20" title="<%=headdata.CompanyName%>"><%=headdata.CompanyName%></span> </div> <div class="top_td"> <span class="label">\u59d3\u540d: </span><span class="mr20" title="<%=headdata.TrueName%>"><%=headdata.TrueName%></span> </div> <div class="top_td"> <span class="label">\u624b\u673a: </span><span class="mr20" title="<%=headdata.Phone%>"><%=headdata.Phone%></span> </div> <div class="top_td"> <span class="label">\u90e8\u95e8: </span><span class="mr20" id="deptName" title="<%=headdata.DeptName%>" deptid="<%=headdata.DeptID%>"><%=headdata.DeptName%></span> </div> <div class="top_td"> <span class="label">\u4e1a\u52a1\u7c7b\u578b: </span><span class="mr20" title="<%=headdata.BusName%>"><%=headdata.BusName%></span> </div> <div class="top_td"> <span class="label">\u51fa\u5dee\u7c7b\u578b: </span><span class="mr20 travel_type" nodeid="<%=headdata.ApplyCase%>"></span> </div> </td> </tr> <tr> <td colspan="6" class="break-word"><span class="label">\u7533\u8bf7\u8bf4\u660e: </span><span><%=headdata.Description%></span></td> </tr> <%if(headdata.ClaimDesc){%> <tr> <td colspan="6" class="break-word"><span class="label">\u62a5\u9500\u8bf4\u660e: </span><span><%=headdata.ClaimDesc%></span></td> </tr> <%}%> <%if(headdata.VerifDesc){%> <tr> <td colspan="6" class="break-word"><span class="label">\u6838\u5b9a\u8bf4\u660e: </span><span><%=headdata.VerifDesc%></span></td> </tr> <%}%> </tbody> </table> </div>');
        return header;
    }
    exports.header_temp = header_temp;
})