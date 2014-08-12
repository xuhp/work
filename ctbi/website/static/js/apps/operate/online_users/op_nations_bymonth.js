﻿/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 在线用户操作页面,多月，两个日期
 */
//获取dom
$(function () {
    var $win = $(window),
    $header = $('.header'),
    $start_time = $header.find('#start_time'),
    $end_time = $header.find('#end_time'),
    $data_search_btn = $header.find('.data_search_btn'),
    $con = $('.container'),
    $data_show = $con.children('.data_show'),
    $charts = $('.charts_wrap'),
    $table = $('table_wrap');
    //下载数据
    var download_origin_data;

    //布局
    adaption_w_h();

    var op_game_users_bymonth = {
        init: function () {
            this._clear_value();
            this._data_show();
            this._download_data();
        },
        //clearValue插件
        _clear_value: function () {
            $('.add_clear_btn').clearValue();
        },
        //数据展示
        _data_show: function () {
            $header.delegate('.data_search_btn', 'click', function () {
                var bengin_origin = $start_time.val(),
                    end_origin = $end_time.val();
                //日期判断
                if (!date_judgment.bymonth(bengin_origin, end_origin)) {
                    return false;
                }
                var begin = common.to_nosplit_month(bengin_origin),
                    end = common.to_nosplit_month(end_origin);

                var this_url = url.domain + url.port + interFace.nationstandard_bymonth;
                var json_data = {
                    'begin': begin,
                    'end': end
                }
                log(this_url);
                log(json_data);

                //获取数据并执行相关操作
                var origin_data = get_origin_data({
                    url: this_url,//url地址，必填
                    data: json_data,//参数,选填
                    loading: {
                        open: 'true',
                        elem: $con
                    },//是否添加loading，选填，false(不添加loading),elem为需要添加loading的元素
                    callback: {
                        funName: callbackfn,//回调函数
                        options: {
                        }
                    }
                });
            })
        },
        //下载数据
        _download_data: function () {
            $('.download').click(function () {
                download_search_table.init(download_origin_data);
            });

        }
    }
    //创建布局框架
    function create_layout_frame() {
        var str = '<div  class="pane ui_layout_center charts_wrap inherit_parent_height"></div>' +
            '<div class="pane ui_layout_east table_wrap inherit_parent_height"></div>';
        $data_show.append(str);
        $('.ui_layout_east').layout({
            resizer: true,
            dir: 'E'
        });
    }
   
    //根据时间进行排序
    function compare(a, b) {
        return a.Date - b.Date;
    }
    //将原始数据转换成可显示数据
    function get_show_data(orgin_data) {
        for (var i = 0, len = orgin_data.length; i < len; i++) {
            orgin_data[i].Date = common.to_split_month(orgin_data[i].Date);
        }
        return orgin_data;
    }
    //回调函数
    function callbackfn(data) {
        var data = get_show_data(data.sort(compare));
        log(data);
        if (data.length == 0) {
            $data_show.empty().append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
            download_origin_data = null;
        } else {
            $data_show.empty()
            //创建布局
            create_layout_frame();
            //图表展示
            charts_bymonth.init(data);
            //表格展示
            download_origin_data = table_show_bymonth(data);
        }
    }
    
    //初始化页面
    op_game_users_bymonth.init();
});
