define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //获取url中的值
    //审核结果
    var mode = getUrlParam('mode');
    var taskId = getUrlParam('taskid');
    //判断状态，加载框架内容
    function executed() {
        $.ajax({
            type: "post",
            url: $.url_prefix+$.general+'method=GetTaskInfo',
            data: { 'taskID': taskId },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg)
                    return false;
                }
                if (data.RefuseResult && mode!='r') {
                    //订单被拒绝理由
                    art.dialog({
                        id: 'refuseResult',
                        drag: false,
                        content: data.RefuseResult,
                        title: '订单被拒绝理由',
                        lock: true
                    });
                    art.dialog({ id: 'refuseResult' }).title('3秒后关闭').time(3);
                }
                //添加底部元素
                $('.footer').append(create_footer(data));
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    }
    //通过获取的值不同，创建不同的底部元素
    function create_footer(data) {
        var foot_con = '';
        $('.footer').empty();
        if (mode!='r') {
            //未完成
            foot_con += '<button class="sureBtn blueBtn  h26 pl10 w100 mr10" id="audit_agree">同意</button>' +
                 '<button class="cancelBtn redBtn  h26 pl10 w100" id="audit_refuse">拒绝</button>';
        } else {
            if (data.Attitude == "True") {
                //审核通过
                foot_con += '<p class="state_blue">审核已通过</p>'
            } else {
                //审核未通过
                foot_con += '<span class="state_red" style="display:inline-block;margin-right:20px;">审核未通过</span>' +
                    '<span><label class="fb">未通过理由: </label>' + data.Reason + '</span>';
            }

        }
        return foot_con;
    }
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //错误提示效
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

    exports.executed = executed;
})