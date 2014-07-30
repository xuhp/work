define(function (require, exports, module) {
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);

    //获取订单id
    var orderid = getUrlParam('orderid');
    //获取公共基础样式
    var common = require('/Static/src/common');

    var order_detail = {
        init: function () {
            this._load();
            this._this_h();
            this._tab();
        },
        //页面加载时执行操作
        _load: function () {
            var url_one = $(".top_tab li a").eq(0).attr('href') + '?orderid=' + orderid;
            //加载第一个frame中的页面
            setTimeout(function () {
                load_frame(0, url_one);
            }, 100);
        },
        //tab切换
        _tab: function () {
            $(".top_tab li").live("click", function () {
                var curdex = $(".top_tab li").index(this);
                $(this).addClass("fms-tab-item-current").siblings().removeClass("fms-tab-item-current");
                $(".dataList").eq(curdex).siblings().hide().end().show();
                //加载frame
                if (!($('.container .dataList').eq(curdex).hasClass('loaded'))) {
                    var url = $(this).children('a').attr('href') + '?orderid=' + orderid;
                    load_frame(curdex, url);
                }
                //组织href默认跳转
                return false;
            });
        },
        //设置元素高度
        _this_h: function () {
            //dom加载完成后执行
            $(function () {
                set_height();
            });
            //窗体大小改变时执行
            $(window).resize(set_height);
            //计算高度
            function set_height() {
                var body_height = $('body').outerHeight();
                var top_tab_h = $('.top_tab').outerHeight();
                var footer_height = $('.footer').outerHeight();
                $('.dataList').height(body_height - top_tab_h - footer_height-20);
            }
        }
    }
    //获取request
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //加载相关frame页面
    function load_frame(index, url) {
        var this_frame = window.frames[index];
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
    };

    module.exports = order_detail;
})