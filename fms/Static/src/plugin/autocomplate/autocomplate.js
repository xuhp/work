define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    var auto_complate = {
        init: function (elem, url) {
            this._auto_complate(elem, url);
            this._li_hover();
            //this._focus_move();
            this._focus_blur(elem);
        },
        //自动匹配
        _auto_complate: function (elem, url) {
            //当keyup的时候执行相关函数
            $(elem).bind('keyup click', function (event) {
                //获取指定人文本框中的内容
                var this_val = $(this).val();
                //如果文本框中没有输入任何文字，则不弹出任何数据
                if (this_val == '') {
                    return false;
                }
                var that = this;
                var elem_i = $(elem).index(this);
                //如果输入了内容则开始匹配
                $.ajax({
                    type: "post",
                    url: url,
                    data: { 'search': this_val },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        //错误验证
                        if (data != null && data.error) {
                            errorMsg(data.msg);
                            //关闭弹出框
                            art.dialog({ id: 'cd_dialog' }).close();
                            return false;
                        }
                        //插入弹出框
                        $('body').append(create_Popup(data, elem_i, elem, event));
                        //设置弹出框位置
                        set_position(that);
                        //选择指定人
                        select_name(elem_i, elem);
                        ////当单击的是上移键和下移键时不创建新下拉菜单
                        //if (!(event.keyCode == 38 || event.keyCode == 40)) {
                        //    $('body').append(create_Popup(data, elem_i, elem, event));
                        //    //设置弹出框位置
                        //    set_position(that);
                        //    //选择指定人
                        //    select_name(elem_i, elem);
                        //}
                    },
                    error: function (error) {
                        window.location.href = error.responseText;
                    }
                });
                return false;
            });
        },
        //鼠标hover事件
        _li_hover: function () {
            $(document).mousemove(function () {
                $('.popup_ul li').die('hover').live('hover', function () {
                    $(this).addClass('selected_li')
                    .siblings().removeClass('selected_li');
                });
            });
        },
        //键盘上下移动相关事件
        _focus_move: function () {
            $(document).unbind("keydown").bind("keydown", function (event) {
                if ($('.popup_ul').length > 0) {
                    //获取相关元素
                    var $ul = $(this);
                    //选择所有display属性不为none的li
                    var $li = $ul.find('li:not(:hidden)');
                    var $len = $li.length;
                    //count用于标志是否含有selected_li
                    var count = 0;
                    //index用于标志含有selected_li的li的下标
                    var index = 0;
                    //判断li中是否含有selected_li,如果不含有则说明是初次加载
                    for (var i = 0; i < $li.length; i++) {
                        if ($li.eq(i).hasClass('selected_li')) {
                            count += 1;
                            index = i;
                            break;
                        }
                    }
                    //判断当event.keyCode 为38时（即上方面键），焦点向上移动; 
                    if (event.keyCode == 38) {
                        key_up(count, $ul, $li, $len, index);
                        $('.nominator').blur();
                    }
                    //判断当event.keyCode 为40时（即下方面键），焦点向下移动; 
                    else if (event.keyCode == 40) {
                        //alert('哈哈哈啊哈');
                        key_down(count, $ul, $li, $len, index);
                        $('.nominator').blur();
                    }
                }
            })
        },
        _focus_blur: function (elem) {
            $(elem).live('focus', function () {
                //获取源数据
                var that = this;
                var origin_uid = $(that).attr('uid');
                $(that).live('blur', function () {
                    if ($(that).val() != '') {
                        if ($(that).attr('uid') == origin_uid) {
                            $(that).val($(that).attr('val_name'));
                        }
                    } else {
                        $(that).attr('uid', '');
                        $(that).attr('val_name', '');
                    }
                })
            });
        }
    }
    //创建弹出框
    function create_Popup(data, elem_i, elem, event) {
        //先移除原先的popup_ul
        $('.popup_ul').remove();
        var pop_ul = '<ul class="popup_ul" tr_num="'+elem_i+'">';
        for (var i = 0; i < data.length; i++) {
            pop_ul += '<li id="' + data[i].Uid + '">' +
                data[i].TrueName + '(' + data[i].UserName + ')'+
                '</li>';
        }
        hideIfClickOutside(elem, event)
        return pop_ul;
    }
    //为弹出框定位
    function set_position(elem) {
        //获取输入框的位置
        var offset = $(elem).offset(),
        x = offset.left,
        y = offset.top ,
        //输入框的padding为3+3=6
        top=y+ $(elem).height() + 6,
        //获取窗体的高度
        win_h = $(window).height(),
        //计算输入框距离底端的距离，24为输入框的高度（包括padding和border）,30为保存按钮的高度
        bottom = win_h - y - 24-30,
        //计算下拉菜单的高度
        ul_h = $('.popup_ul').height();

        //设置距离左边的距离
        $('.popup_ul').css('left', x);

        //正常情况下弹出框出现在下方
        $('.popup_ul').css('top', top);
        //如果ul_h > bottom 则将下拉菜单放在输入框的上方
        if (ul_h > bottom) {
            //20为.wrapper的padding-top
            $('.popup_ul').css('top',top-ul_h-24);
        }
        //如果弹出框高度即高于top又高于bottom则放在下方
        if (ul_h > bottom && ul_h > offset.top) {
            $('.popup_ul').css('top', top);
        }
    }
    //下移键盘相关操作
    function key_down(count, $ul, $li, $len, index) {
        //如果没有selected_li，则为第一个li加上此class
        if (count == 0) {
            $li.eq(0).addClass('selected_li');
        }
        //如果已经有selected_li,则每次向下移动一步
        if (count == 1) {
            //当li移动到最末端的时候，则返回头部
            if (index == $len - 1) {
                $li.eq(0).addClass('selected_li')
                .siblings().removeClass('selected_li');
                $('.popup_ul').scrollTop(0);
            } else {
                $li.eq(index + 1).addClass('selected_li')
                .siblings().removeClass('selected_li');
                //当selected_li移动到可见区域最底端的时候，滚动条开始滚动
                var top = $('.selected_li').position().top;
                if (top == 200) {
                    $('.popup_ul').scrollTop((index + 1) * 20 - 180);
                }
            }
        }
    }
    //上移键盘相关操作
    function key_up(count, $ul, $li, $len, index) {
        //如果没有selected_li，则为最后个li加上此class
        if (count == 0) {
            $li.eq($len - 1).addClass('selected_li');
            $('.popup_ul').scrollTop($len * 20 - 200);
        }
        //如果已经有selected_li,则每次向上移动一步
        if (count == 1) {
            //当li移动到最顶端时，则返回底部
            if (index == 0) {
                $li.eq($len - 1).addClass('selected_li')
                .siblings().removeClass('selected_li');;
                $('.popup_ul').scrollTop($len * 20 - 200);
            } else {
                $li.eq(index - 1).addClass('selected_li')
                .siblings().removeClass('selected_li');
                var top = $('.selected_li').position().top;
                if (top <= -10) {
                    $('.popup_ul').scrollTop((index - 1) * 20);
                }
            }
        }
    }
    //选择指定人，可以通过enter和click两种方式实现
    function select_name(elem_i, elem) {
        var name_li = $('.popup_ul li');
        ////enter事件
        //$(document).live('keydown', function (event) {
        //    if ($('.selected_li').length > 0 && $('.popup_ul').length > 0) {
        //        if (event.keyCode == 13) {
        //            var $li = $('.selected_li');
        //            //获取省份的名字和id
        //            var name = $li.text();
        //            var nameId = $li.attr('id');
        //            name_action(elem_i, elem, name, nameId);
        //        }
        //    }
        //});
        //click事件
        name_li.die('click').live('click', function () {
            var name = $(this).text();
            var nameId = $(this).attr('id');
            name_action(elem_i, elem, name, nameId);
        });
    }
    //选择人具体操作
    function name_action(elem_i, elem, name, nameId) {
        var tr_num = $('.popup_ul').attr('tr_num');
        if (elem_i == tr_num) {
            $(elem).eq(elem_i).val(name).attr({ 'uid': nameId,'val_name':name });
            $('.popup_ul').remove();
        }
    }
    //当单击弹出框以外的部分就关闭弹出框
    function hideIfClickOutside(elem, event) {
        $(document).live('click', function (e) {
            if (!insideSelector(event)) {
                hide_popup();
            };
        })
    }
    //判断鼠标的点击区域是否在弹出框内
    function insideSelector(event) {
        var $ul = $('.popup_ul');
        if ($ul.length) {
            var mx = event.pageX;
            var my = event.pageY;
            var offset = $ul.position();
            offset.right = offset.left + $ul.outerWidth(true);
            offset.bottom = offset.top + $ul.outerHeight(true);
            return my < offset.bottom &&
                        my > offset.top &&
                        mx < offset.right &&
                        mx > offset.left;
        }
    }
    //关闭弹出框
    function hide_popup() {
        $('.popup_ul').remove();
    };

    module.exports = auto_complate;
})