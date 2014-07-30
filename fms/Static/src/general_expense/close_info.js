define(function (require, exports, module) {

    //引入jquery
    var $ = require('jquery');
    var close_info = {
        init: function (taskId) {
            this._load_data(taskId);
        },
        //加载数据
        _load_data: function (taskId) {
            //对父frame进行操作
            var $a = $(window.parent.document).find('#taskList').find('a');
            $a.each(function (el, index) {
                //如果父元素列表项中a的taskid和url传进来的taskid相等
                if ($(this).attr('taskid') == taskId) {
                    //如果含有class  task-n,则将其替换为task-y
                    if ($(this).hasClass('task-n')) {
                        $(this).removeClass('task-n').addClass('task-y');
                    }
                };
            });
            //对父iframe的父iframe进行操作
            window.parent.changeTaskNum();
        }
    }
    module.exports = close_info;
});