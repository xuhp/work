define(function (require, exports, module) {
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //获取订单id
    var orderId = getUrlParam('orderid');
    var taskId = getUrlParam('taskid');
    var modeId = getUrlParam('mode');
    var borrow = {
        init: function () {
            this._common();
            this._foot_state();
            this._borrow_top();
        },
        //加载流程公共部分
        _common: function () {
            var common = require('/Static/src/common/flow_common');
            common.init();
        },
        //获取底部状态
        _foot_state: function () {
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
                    //添加底部元素
                    $('.footer').append(create_footer(data, modeId));
                    //先将footer中的元素进行影藏，等待按需加载
                    $('.footer').children().hide();
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
        },
        //结束借款按钮
        _borrow_top: function () {
            $('#borrow_stop').die('click').live('click', function () {
                var agree_agin = '<div class="agreeAgain" style="text-algin:center;">' +
                    '<p>你确定要结束借款吗？结束之后将无法继续。</p>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="agree_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="agree_cancel">取消</button>' +
                    '</div>';
                //倒计时弹出框
                var con = agree_agin;
                var id = '#agree_sure';
                cd_dialog(con, id);
                //确定结束借款
                $('#agree_sure').die('click').live('click', function () {
                    agree_sure();
                });
                //取消结束借款
                $('#agree_cancel').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            });
        }
    }

    //确定结束借款
    function agree_sure() {
        $.ajax({
            type: "post",
            url: $.url_prefix+$.general+'method=TaskComplete',
            data: {
                'taskID': taskId
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    errorMsg(data.msg);
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    return false;
                }
                //关闭弹出框
                art.dialog({ id: 'cd_dialog' }).close();
                //弹出操作成功信息
                infoMsg();
                //刷新页面
                $('#success_btn').live('click', function () {
                    art.dialog({ id: 'infoMsg' }).close();
                });
            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
    };
    //创建底部信息
    function create_footer(data, modeId) {
        var foot_con = '';
        $('.footer').empty();
        if (modeId != 'r') {
            //未完成
            foot_con += '<button class="redBtn  h26 w100 mr10" id="borrow_stop">结束借款</button>'
        } else {
            //借款已结束
            foot_con += '<span class="state_red" style="display:inline-block;margin-right:20px;">借款已结束</span>';
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
    //去除字符串中的‘,’号
    function no_comma(str) {
        var no_comma_str = '';
        for (var i = 0; i < str.length; i++) {
            if (!isNaN(str[i]) || str[i] == '.') {
                no_comma_str += str[i];
            }
        }
        return no_comma_str;
    }
    //倒计时弹出框
    function cd_dialog(con,id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }
    //操作成功提示
    function infoMsg() {
        var msg = '<div class="tc" style="width:100px;">' +
                        '<p>操作成功</p>' +
                        '<button class="blueBtn h22 w45 mt10" id="success_btn">确定</button>' +
                    '</div>';
        art.dialog({
            id: 'infoMsg',
            drag: false,
            content: msg,
            title: '信息提示页面',
            lock: true,
            close: function () {
                //关闭弹窗重新加载页面
                location.reload();
            }
        });
    }
   
    module.exports = borrow;
})