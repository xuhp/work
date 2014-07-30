/*
 *@Description: 内容框架相关操作，包括tab切换，预算相关，loading等
 *@date:        2014-04-30
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //获取公共基础样式
    var common = require('/Static/src/common');
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var getUrlParam = travel_common.getUrlParam;
    var errorMsg = travel_common.errorMsg;
    //获取数据
    var order_data = travel_common.get_data();

    //获取url中的orderid和taskid并传递到内页
    var orderid = getUrlParam('orderid');
    var taskid = getUrlParam('taskid');
    var mode = getUrlParam('mode');
    if (!taskid) {
        taskid = 888, mode = 'h';
    }
    var frame_oprate = {
        init: function () {
            this._load();
            this._this_h();
            this._budget();
            this._tab();
            this._parent_class();
        },
        //页面加载时执行操作
        _load: function () {
            var url_one = $(".top_tab li a").eq(0).attr('href') + '?orderid=' + orderid + '&taskid=' + taskid + '&mode=' + mode;
            var url_two = $(".top_tab li a").eq(1).attr('href') + '?orderid=' + orderid + '&taskid=' + taskid + '&mode=' + mode;
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
            }, 100)
        },
        _this_h: function () {
            set_height();
            $(window).resize(set_height);
            //计算高度
            function set_height() {
                var body_height = $('body').height();
                var top_tab_h = $('.top_tab').outerHeight(true);
                var footer_height = $('.footer').outerHeight(true);
                $('.dataList').height(body_height - top_tab_h - footer_height - 20);
            }
        },
        //预算相关
        _budget: function () {
            var b = require('/Static/src/common/about_budget');
            $('.budget').click('click', function () {
                var periodid = $('#about_detail').contents().find('.detailTop').attr('periodid');
                b.budget(periodid, order_data);
                //引入财务数字
                var f = require('/Static/src/common/f_decmal');
                //详细
                var elem = '.finance_decmal';
                f.f_decmal(elem);
            });
        },
        //tab切换
        _tab: function () {
            $(".top_tab li").click("click", function () {
                var curdex = $(".top_tab li").index(this);
                $(this).addClass("fms-tab-item-current").siblings().removeClass("fms-tab-item-current");
                $(".dataList").eq(curdex).siblings().hide().end().show();
                //加载frame
                if (!($('.container .dataList').eq(curdex).hasClass('loaded'))) {
                    var url = $(this).children('a').attr('href') + '?orderid=' + orderid + '&taskid=' + taskid + '&mode=' + mode;
                    load_frame(curdex, url);
                }
                //组织href默认跳转
                return false;
            });
        },
        //判断父iframe对应元素的class
        _parent_class: function () {
            //如果此任务已经执行过
            if (mode == 'r') {
                //对父frame进行操作
                var $a = $(window.parent.document).find('#taskList').find('a');
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
        },
        //获取底部状态
        get_footer_status: function () {
            var footer_status;
            $.ajax({
                type: "post",
                url: $.url_prefix + $.travel + 'method=GetTaskInfo',
                data: { 'taskID': taskid },
                async: false,
                cache: false,
                dataType: 'json',
                success: function (data) {
                    //错误验证
                    if (data != null && data.error) {
                        errorMsg(data.msg)
                        return false;
                    }

                    //只有在报销申请和借款申请当中会起作用
                    if (data.RefuseResult && mode != 'r') {
                        //订单被拒绝理由
                        art.dialog({
                            id: 'refuseResult',
                            drag: false,
                            content: data.RefuseResult,
                            title: '拒绝理由',
                            lock: true
                        });
                        art.dialog({ id: 'refuseResult' }).time(3);
                    }

                    footer_status=data;
                },
                error: function (error) {
                    window.location.href = error.responseText;
                }
            });
            return footer_status;
        },
        //获取url参数
        get_url_para: function () {
            var url_para = {};
            url_para.orderid = orderid;
            url_para.taskid = taskid;
            url_para.mode = mode;
            return url_para;
        },
        //操作成功提示
        infoMsg: function () {
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

    module.exports = frame_oprate;
})