define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    function del_row(that) {
        var delForm = '<div>' +
                   '<p>确定要删除这一行吗?删除之后将无法恢复。</p>' +
                   '<div class="btnWrapper" style="padding-top: 20px;text-align: center;">' +
                       '<button class="blueBtn h22 w45" id="deterBtn">确定</button>' +
                       '<button class="redBtn h22 w45" style="margin-left:10px;" id="cancelBtn">取消</button>' +
                   '</div>'
        '</div>'

        art.dialog({
            id: 'testID',
            content: delForm,
            title: '删除提醒',
            lock: true,
            drag: false
        });
        //延迟三秒执行移除操作
        setTimeout(removeClass, 3000);

        $('#deterBtn').click(function () {
            that.parents('tr').remove();
            art.dialog({ id: 'testID' }).close();
        });
        $('#cancelBtn').click(function () {
            art.dialog({ id: 'testID' }).close();
        });
    }
    //移除disableBtn按钮
    function removeClass() {
        $('#deterBtn').removeClass('disableBtn');
    }
    exports.del_row = del_row;
});