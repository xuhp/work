/*
 *@Version:	    v1.0(2014-07-16)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 右侧边栏导航切换
 */

//app导航数据
var app_nav = [];
//获取dom
var $slide_head, $app_ul_wrap, $app_ul_nav;
var list_nav = {
    init: function (data) {
        $slide_head = $('.slide_head');
        $app_ul_wrap = $('.app_ul_wrap', $slide_head);
        $app_ul_nav = $slide_head.find('.app_ul_nav');
        console.log($app_ul_wrap);
        this._app_nav_hover()
        this._open_app(data);
        this._ul_nav_change();
        //this._clearValue();
        this._close_app();
    },
    //label_tip插件应用
    _clearValue: function () {
        $('.add_clear_btn').clearValue();
    },
    //app_nav显示隐藏
    _app_nav_hover: function () {
        //$slide_head.mouseenter(function () {
        //    $app_ul_wrap.show();
        //})
        //$app_ul_wrap.mouseenter(function () {
        //    $app_ul_wrap.show();
        //}).mouseout(function () {
        //    $app_ul_wrap.hide();
        //});


        
    },
    //打开应用
    _open_app: function (data) {
        $('.table_wrap').delegate('.table_con tr', 'click', function () {
            var curid = $(this).children('td:first').text(),
               title = get_app_title(data, curid);
            //判断应用是否已经打开
            var index = get_cur_app_index(curid);
            if (index != -1) {
                //切换到相应iframe
                show_app(curid);
                //显示title
                show_cur_app_name(curid);
            } else {
                //添加app导航数据
                app_nav.push({
                    'nodeid': curid,
                    'title': title
                });
                //绘制app导航
                create_app_nav(app_nav);
                //添加iframe
                create_iframe(curid);
                //切换到相应iframe
                show_app(curid);
                //显示title
                show_cur_app_name(curid);
            }
        });
    },
    //点击ul_nav切换
    _ul_nav_change: function () {
        $app_ul_nav.delegate('.app_li', 'click', function () {
            var nodeid = $(this).attr('nodeid');
            //切换到相应iframe
            show_app(nodeid);
            //显示title
            show_cur_app_name(nodeid);
            $app_ul_nav.hide();
        })
    },
    //关闭app
    _close_app: function () {
        //关闭单个
        $app_ul_nav.delegate('.app_li .close_btn', 'click', function () {
            var $cur_li = $(this).parent('li'),
                remove_nodeid = $cur_li.attr('nodeid'),
                on_nodeid;

            //判断关闭的是否为第一个li
            var index = get_cur_app_index(remove_nodeid);
            if (index == 0) {
                on_nodeid = $cur_li.next('.app_li').attr('nodeid') || -1;
            } else {
                on_nodeid = $cur_li.prev('.app_li').attr('nodeid');
            }
            //关闭选中应用
            remove_app(index, remove_nodeid);
            //切换到相应iframe
            show_app(on_nodeid);
            //显示title
            show_cur_app_name(on_nodeid);
            //显示内容
            show_app(on_nodeid);

            //$app_ul_nav.hide();
            return false;
        });
        //关闭全部
        $app_ul_wrap.delegate('.total_close', 'click', function () {
            app_nav = [];
            //绘制app导航
            create_app_nav(app_nav);
            //显示title
            show_cur_app_name(-1);
            //移除内容
            $('.op_con').empty();
            $app_ul_nav.hide();
        });
    }
}

//获取应用应用li的位置,如果不存在则返回-1
function get_cur_app_index(nodeid) {
    for (var i = 0, len = app_nav.length; i < len; i++) {
        if (nodeid == app_nav[i].nodeid) {
            return i;
        }
    }
    return -1;
}
//移除app
function remove_app(index, nodeid) {
    app_nav.splice(index, 1);
    create_app_nav(app_nav);
    //移除con的内容
    $('.frame_wrap[nodeid="' + nodeid + '"]').remove();
}
//绘制app导航
function create_app_nav(data) {
    var len = data.length;
    $app_ul_nav.empty();
    //添加内容
    for (var i = 0; i < len; i++) {
        var str = '<li class="app_li" nodeid="' + data[i].nodeid + '">' + data[i].title + '<b class="close_btn">X</b></li>';
        $app_ul_nav.append(str);
    }
}
//创建iframe
function create_iframe(nodeid) {
    //根据url判断查询类型
    var cur_page_name = common.get_cur_page_name(window.location.href),
        this_src = page_mapped[cur_page_name] + '?curid=' + nodeid;
    var $op_con = $('.op_con');
    var con = '<div class="frame_wrap" nodeid="' + nodeid + '">' +
            '<span class="frame_loading"><b class="img_top"></b><img src="/Static/image/common/loading/frame_loading.gif"></span>' +
            '<iframe id="frame_' + nodeid + '" nodeid="' + nodeid + '" width="100%" height="100%" frameborder="0" border="0" src=' + this_src + ' style="display: inline;">您的浏览器不支持iframe</iframe>' +
        '</div>';
    $op_con.append(con);
    $('.frame_loading').css({ 'height': $op_con.height(), 'width': $op_con.width(), 'right': '0' });
    common.frame_loading('frame_' + nodeid, this_src, true);
}
//app切换
function show_app(nodeid) {
    $('.frame_wrap[nodeid="' + nodeid + '"] ').show().siblings('.frame_wrap').hide();
}
//app显示名称切换
function show_cur_app_name(nodeid) {
    var len = app_nav.length,
        $slide_h = $slide_head.children('h1');
    if (len == 0 || nodeid == -1) {
        $slide_h.text('未打开任何应用');
    }
    for (var i = 0; i < len; i++) {
        if (app_nav[i].nodeid == nodeid) {
            $slide_h.text(app_nav[i].title);
            return false;
        }
    }
}