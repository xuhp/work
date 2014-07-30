/*
 *@Description: 出差目的模板(可编辑版)
 *@date:        2014-05-06
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    function purpose_desc_edit_temp() {
        var purpose_desc_edit = template.compile('purpose_desc_temp', '<div class="box_header mt10 clearfix" > <h3>\u51fa\u5dee\u76ee\u7684\u63cf\u8ff0</h3> <button class="blueBtn h22 w100 fr" id="purpose_desc_add_row">\u65b0\u589e\u4e00\u884c</button> </div> <table class="allEditTable fms-table ellip-table" id="purpose_desc"> <thead> <tr> <th style="width:5%;">\u5e8f\u53f7</th> <th style="width:20%;">\u51fa\u5dee\u76ee\u7684</th> <th style="width:13.5%">\u8054\u7cfb\u5ba2\u6237\u5355\u4f4d</th> <th style="width:6.75%;">\u59d3\u540d</th> <th style="width:13.5%;">\u804c\u52a1</th> <th style="width:11.25%;">\u7535\u8bdd</th> <th style="width:20%">\u5b8c\u6210\u60c5\u51b5</th> <th style="width:10%;">\u64cd\u4f5c</th> </tr> </thead> <tbody> <%for(var i=0;i<purposesdata.length;i++){%> <tr> <td><%=i+1%></td> <td  class="travel_purpose" title="<%=purposesdata[i].PurposeDesc%>"><%=purposesdata[i].PurposeDesc%></td> <td colspan="4"> <p class="allEditTab-txtInput" style="width:98%;border:none;"> <span class="client_contact_name ellipsis" style="width:30%;display:inline-block;" title="<%=purposesdata[i].ContactName%>" nodeid="<%=purposesdata[i].ContactID%>"><%=purposesdata[i].ContactName%></span> <span style="width:15%;display:inline-block;" class="client_customer_name ellipsis" title="<%=purposesdata[i].CusName%>" nodeid="<%=purposesdata[i].CusID%>"><%=purposesdata[i].CusName%></span> <span style="width:30%;display:inline-block;" class="client_duty ellipsis" title="<%=purposesdata[i].Duty%>"><%=purposesdata[i].Duty%></span> <span style="width:25%;display:inline-block;" class="client_phone ellipsis" title="<%=purposesdata[i].Phone%>"><%=purposesdata[i].Phone%></span> </p> </td> <td class="client_Completion ellipsis"><input type="text" class="allEditTab-txtInput focus_change_height" readonly="true" /></td> <td><span class="redBtn h22 w45 purpose_del_btn">\u5220\u9664</span></td> </tr> <%}%> </tbody> </table>');
        return purpose_desc_edit;
    }
    exports.purpose_desc_edit_temp = purpose_desc_edit_temp;
})