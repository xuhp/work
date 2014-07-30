define(function (require, exports, module) {
    var $ = require('jquery');
    function cd_dialog(con,id) {
        //弹出框
        var timer;
        art.dialog({
            id: 'cd_dialog',
            content: con,
            init: function () {
                var that = this, i = 3;
                var fn = function () {
                    if (i > 0) {
                        $(id).text('确定(' + i + ')');
                    } else {
                        $(id).text('确定');
                    }
                    //当i=0时，!i=false,执行后面的操作
                    !i && removeClass();
                    i--;
                };
                timer = setInterval(fn, 1000);
                fn();
            },
            close: function () {
                clearInterval(timer);
            },
            title: '二次确认',
            lock: true,
            drag: false
        });
        //移除disableBtn按钮
        function removeClass() {
            $(id).removeClass('disableBtn');
            $(id).removeAttr('disabled');
        }
    };
    exports.cd_dialog = cd_dialog;
})