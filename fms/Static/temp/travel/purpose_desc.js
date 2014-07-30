/*
 *@Description: 出差目的模板
 *@date:        2014-04-29
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    function purpose_desc_temp() {
        var purpose_desc = template.compile('purpose_desc_temp', '<div class="box_header mt10 clearfix" > <h3>\u51fa\u5dee\u76ee\u7684\u63cf\u8ff0</h3> </div> <table class="allEditTable fms-table ellip-table" id="purpose_desc"> <thead> <tr> <th style="width:5%;">\u5e8f\u53f7</th> <th style="width:35%;">\u51fa\u5dee\u76ee\u7684</th> <th style="width:20%">\u8054\u7cfb\u5ba2\u6237\u5355\u4f4d</th> <th style="width:10%;">\u59d3\u540d</th> <th style="width:15%;">\u804c\u52a1</th> <th style="width:15%;">\u7535\u8bdd</th> </tr> </thead> <tbody> <%for(var i=0;i<purposesdata.length;i++){%> <tr> <td><%=i+1%></td> <td title="<%=purposesdata[i].PurposeDesc%>"><%=purposesdata[i].PurposeDesc%></td> <td class="client_contact_name" title="<%=purposesdata[i].ContactName%>" nodeid="<%=purposesdata[i].ContactID%>"><%=purposesdata[i].ContactName%></td> <td class="client_customer_name " title="<%=purposesdata[i].CusName%>" nodeid="<%=purposesdata[i].CusID%>"><%=purposesdata[i].CusName%></td> <td class="client_duty ellipsis" title="<%=purposesdata[i].Duty%>"><%=purposesdata[i].Duty%></td> <td class="client_phone ellipsis"><%=purposesdata[i].Phone%></td> </tr> <%}%> </tbody> </table>');
        return purpose_desc;
    }
    exports.purpose_desc_temp = purpose_desc_temp;
})