define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入财务数字
    var f = require('/Static/src/common/f_decmal');
    function add_up(numClass, sumId) {
        var $numClass = $(numClass);
        //当页面加载时执行累加
        addFun(numClass, sumId);
        //当数值变动的时候执行累加
        $numClass.live('change ', function () {
            addFun(numClass, sumId);
        });
        //累计
        function addFun(numClass, sumId) {
            var $numClass = $(numClass);
            var sum = 0;
            var this_num = '';
            var $this_val = '';
            $numClass.each(function () {
                $this_val = $(this).val() || $(this).text();
                this_num = ''
                //如果为数字和'.'之外的字符则移除
                for (var i = 0; i < $this_val.length; i++) {
                    if (!isNaN($this_val[i]) || $this_val[i] == '.') {
                        this_num += $this_val[i];
                    }
                };
                if (this_num == '') {
                    this_num = 0;
                }
                //如果类型为minus，则进行减法操作
                if ($(this).attr('this_type') == '20') {
                    sum -= parseFloat(this_num);
                } else {
                    sum += parseFloat(this_num);
                }
            });
            //将得到的值赋到td中
            $(sumId).text(sum.toFixed(2));
            //转化为财务数字
            f.f_decmal(sumId);
        }
    };
    exports.add_up = add_up;
})