define(function (require, exports, module) {
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    var audit = {
        init: function () {
            this._common();
            this._refuseBtn_click();
            this._agreeBtn_click();
        },
        //加载流程公共部分
        _common: function () {
            var common = require('/Static/src/common/flow_common');
            common.init();
            //加载底部状态
            flow_state();
            //先将footer中的元素进行影藏，等待按需加载
            $('.footer').children().hide();
        },
        //点击拒绝按钮
        _refuseBtn_click: function () {
            $('#audit_refuse').die('click').live('click', function () {
                var refuse_con = '<div class="refuse_reason desc_wrapper">' +
                    '<label for="res_desc">不能输入超过一百个字符</label>'+
                    '<textarea id="res_desc" class="form-textarea form-normal description "></textarea>' +
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="ref_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="ref_cancel">取消</button>' +
                '</div>';
                //倒计时弹出框
                var con = refuse_con;
                var id = '#ref_sure';
                cd_dialog(con, id);
                //输入框验证
                textArea();
                //替换标题
                $('.aui_title').text('拒绝理由');
                //art.dialog({ id: 'cd_dialog' }).title('拒绝理由');
                //点击确定拒绝按钮提交信息
                $('#ref_sure').die('click').live('click', function () {
                    var reason = $('.description').val().replace(/<[^>].*?>/g, '');
                    if (!reason) {
                        var msg = '请填写拒绝理由';
                        errorMsg(msg);
                        return false;
                    }
                    sureBtn_click(reason);
                });

                //点击取消关闭弹出框
                $('#ref_cancel').die('click').live('click', function () {
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            })
        },
        //点击通过按钮
        _agreeBtn_click: function () {
            $('#audit_agree').die('click').live('click', function () {
                var agree_agin = '<div class="agreeAgain" style="text-algin:center;">' +
                    '<p>你确定要通过审核吗？通过之后将无法撤销。</p>'+
                    '<button class="blueBtn h26 w82 mr10 disableBtn" id="agree_sure" disabled="disabled">确定</button>' +
                    '<button class="redBtn h26 w82" id="agree_cancel">取消</button>' +
                    '</div>';
                //倒计时弹出框
                var con = agree_agin;
                var id = '#agree_sure';
                cd_dialog(con, id);
                //通过确定按钮
                $('#agree_sure').die('click').live('click', function () {
                    agree_sure();
                });
                //通过取消按钮
                $('#agree_cancel').die('click').live('click', function () {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                });
            })
        }
    }
    //判断状态，加载框架内容
    function flow_state() {
        var executed = require('/Static/src/common/flow_state');
        executed.executed();
    }
    //输入框验证
    function textArea() {
        var $description = $('.description');
        text($description);
        function text(elem) {
            var $label = $(elem).parents('.desc_wrapper').children('label');
            $(elem).die('focus').live('focus', function () {
                $label.hide();
            }).die('blur').live('blur', function () {
                if ($(elem).val() == '') {
                    $label.show();
                }
            }).die('keyup').live('keyup', function () {
                var $val = elem.val();
                if ($val.length > 100) {
                    //截取前100个字符
                    elem.val($val.substr(0, 100));
                }
            });
        }
    }
    //点击确定拒绝按钮提交信息
    function sureBtn_click(reason) {
        var attitude = false;
        var taskId = $('#about_detail').contents().find('.detailTop').attr('taskId');
        $.ajax({
            type: "post",
            url: $.url_prefix+$.general+'method=CheckOrder',
            data: {
                'attitude': attitude,
                'reason':reason,
                'taskId': taskId
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
                //操作成功提示
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
    }
    //点击通过确定按钮
    function agree_sure() {
        var reason = '';
        var taskId = $('#about_detail').contents().find('.detailTop').attr('taskId');
        var attitude = true;
        $.ajax({
            type: "post",
            url: $.url_prefix+$.general+'method=CheckOrder&'+Math.random(),
            data: {
                'attitude': attitude,
                'reason': reason,
                'taskId': taskId
            },
            async: false,
            cache: false,
            dataType: 'json',
            success: function (data) {
                //错误验证
                if (data != null && data.error) {
                    //关闭弹出框
                    art.dialog({ id: 'cd_dialog' }).close();
                    errorMsg(data.msg)
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
    //倒计时弹出框
    function cd_dialog(con, id) {
        var cd_dialog = require('/Static/src/common/cd_dialog');
        cd_dialog.cd_dialog(con, id);
    }

    module.exports = audit;
})