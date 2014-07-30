/*
* 此js 为流程框架页面通用js
*/
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //获取公共基础样式
    var common = require('/Static/src/common');
    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
    //执行滚动条插件

    //获取url中的orderid和taskid并传递到内页
    var orderid = getUrlParam('orderid');
    var taskid = getUrlParam('taskid');
    var mode = getUrlParam('mode');
    var flow_com = {
        init: function () {
            this._load();
            this._this_h();
            this._budget();
            this._tab();
            this._resize();
            this._parent_class();
        },
        //页面加载时执行操作
        _load: function () {
            //页面布局
            conHeight();
            var url_one = $(".top_tab li a").eq(0).attr('href') + '?orderid=' + orderid + '&taskid=' + taskid + '&modeid=' + mode;
            var url_two = $(".top_tab li a").eq(1).attr('href') + '?orderid=' + orderid + '&taskid=' + taskid + '&modeid=' + mode;
            //$('.loading').eq(0).remove();
            //如果选项卡为三个，同时加载第一个和第二个（预算相关）
            setTimeout(function () {
                if ($('.top_tab li').length == 3) {
                    //加载两个页面
                    load_frame(0, url_one);
                    load_frame(1, url_two);
                } else {
                    //加载第一个frame中的页面
                    load_frame(0, url_one);
                }
                //移除loaded，使详情页面需要再次加载
                $('.container .dataList').eq(1).removeClass('loaded');
            },100)
        },
        _this_h: function () {
            //dom加载完成后执行
            $(function () {
                set_height();
            });
            //窗体大小改变时执行
            $(window).resize(set_height);
            //计算高度
            function set_height() {
                var body_height = $('body').height();
                var top_tab_h = $('.top_tab').outerHeight(true);
                var footer_height = $('.footer').outerHeight(true);
                $('.dataList').height(body_height - top_tab_h - footer_height - 15);
            }
        },
        //预算相关
        _budget: function () {
            var b = require('/Static/src/common/about_budget');
            $('.budget').live('click', function () {
                var periodId = $('#about_detail').contents().find('.detailTop').attr('periodid');
                b.budget(periodId);
                //引入财务数字
                var f = require('/Static/src/common/f_decmal');
                //详细
                var elem = '.finance_decmal';
                f.f_decmal(elem);
            });
        },
        //tab切换
        _tab: function () {
            $(".top_tab li").live("click", function () {
                var curdex = $(".top_tab li").index(this);
                $(this).addClass("fms-tab-item-current").siblings().removeClass("fms-tab-item-current");
                $(".dataList").eq(curdex).siblings().hide().end().show();
                //加载frame
                if (!($('.container .dataList').eq(curdex).hasClass('loaded'))) {
                    var url = $(this).children('a').attr('href') + '?orderid=' + orderid + '&taskid=' + taskid + '&modeid=' + mode;
                    load_frame(curdex, url);
                }
                //组织href默认跳转
                return false;
            });
        },
        //resize
        _resize: function () {
            $(window).resize(function () {
                //页面布局
                conHeight();
            });
        },
        //判断父iframe对应元素的class
        _parent_class: function () {
            //如果此任务已经执行过
            if (mode == 'r') {
                //对父frame进行操作
                var $a=$(window.parent.document).find('#taskList').find('a');
                $a.each(function (el, index) {
                    //如果父元素列表项中a的taskid和url传进来的taskid相等
                    if ($(this).attr('taskid') == taskid) {
                        //如果含有class  task-n,则将其替换为task-y
                        if ($(this).hasClass('task-n')) {
                            $(this).removeClass('task-n').addClass('task-y');
                            //对父iframe的父iframe进行操作
                            window.parent.changeTaskNum();
                        }
                    };
                });
            }
        }
    }
    //加载相关frame页面
    function load_frame(index, url) {
        //将加载过的frame父div添加loaded标志
        $('.container .dataList').eq(index).addClass('loaded');
        //获取要加载的iframe的id
        var frame_id = $('.dataList').eq(index).children('iframe').attr('id');
        //打开链接，添加loading
        common.LoadIFrame(frame_id, url);
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
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //计算高度
    function conHeight() {
        var winH = $(window.parent.document).find('#taskFrame').height();
        var topH = $('.top_tab').outerHeight(true);
        var footH = $('.footer').outerHeight(true);
        var conH = winH - topH - footH - 20;
        $('.container').height(conH);
    }

    module.exports = flow_com;
})