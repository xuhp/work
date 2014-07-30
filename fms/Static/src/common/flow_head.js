define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //转化传入的cusType
    var installment = {
        'True': '多次报销',
        'False':'一次报销'
    }
    function flowH(data, orderId, taskId) {
        //如果报销模式为非多次报销，则将结束报销申请按钮影藏
        if (data.headData.Installment == 'False') {
            $(window.parent.document).find("#flow_stop").remove();
        }
        //头部
        var head_source = '<div class="mutate-table-wrapper detailTop" taskId="' + taskId + '" orderId="' + orderId + '" periodId="' + data.PeriodID + '" >' +
            '<table style="width:100%;" class="ellip-table">' +
                '<tr>' +
                    '<td  colspan="6">' +
                        '<div class="top_td"><span class="label">公司: </span>' +
                        '<span class="mr20" title="' + data.headData.CompanyName + '">' + data.headData.CompanyName + '</span></div>' +
                        '<div class="top_td">' +
                             '<span class="label">部门: </span>' +
                            '<span class="mr20" id="deptName" title="' + data.headData.DeptName + '" deptId="' + data.headData.DeptID + '">' + data.headData.DeptName + '</span>' +
                        '</div>' +
                         '<div class="top_td">' +
                             '<span class="label">业务类型: </span>' +
                             '<span class="mr20" title="' + data.headData.BusName + '">' + data.headData.BusName + '</span>' +
                        '</div>' +
                         '<div class="top_td">' +
                             '<span class="label">姓名: </span>' +
                             '<span class="mr20" title="' + data.headData.TrueName + '">' + data.headData.TrueName + '</span>' +
                        '</div>' +
                        '<div class="top_td">' +
                            '<span class="label">手机: </span>' +
                            '<span class="mr20" title="' + data.headData.Phone + '">' + data.headData.Phone + '</span>' +
                        '</div>' +
                        '<div class="top_td">' +
                            '<span class="label">报销模式: </span>' +
                            '<span class="mr20" id="installment" title="' + installment[data.headData.Installment] + '">' + installment[data.headData.Installment] + '</span>' +
                        '</div>' +
                    '</td>' +
                '</tr>' +
                '<tr>' +
                    '<td colspan="6" class="break-word">' +
                        '<span class="label">申请说明: </span>' +
                        '<span>' +data.headData.Description + '</span>' +
                    '</td>' +
                '</tr>'
        if (data.headData.VerifDesc) {
            head_source += '<tr class="verif_tr">' +
                    '<td colspan="6" class="break-word">' +
                        '<span class="label">核定说明: </span>' +
                        '<span>' + data.headData.VerifDesc + '</span>' +
                    '</td>' +
                '</tr>';
        }
        head_source += '</table>' +
        '</div>';
        return head_source;
    }
    exports.flowH = flowH;
});