/*
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
    $data_search_btn = $header.find('.data_search_btn'),
    $select=$header.find('.condition select'),
    $start_time_byday = $header.find('#start_time_byday'),
    $end_time_byday = $header.find('#end_time_byday'),
    $start_time_bymonth = $header.find('#start_time_bymonth'),
    $end_time_bymonth=$header.find('#end_time_bymonth'),
    $con = $('.container'),
    $data_show = $con.children('.data_show'),
    $charts = $('.charts_wrap'),
    $table = $('table_wrap');
    //获取url参数
    var curid = common.getUrlPara('curid');
    //下载数据
    var download_origin_data;

    //布局
    adaption_w_h();

    var op_game_users_bymonth = {
        init: function () {
            this._clear_value();
            this._jdpicker();
            this._search_condition_toggle();
            this._data_show();
            this._download_data();
        },
        //clearValue插件
        _clear_value: function () {
            $('.add_clear_btn').clearValue();
        },
        //日期插件
        _jdpicker: function () {
            $('#start_time_byday').jdPicker();
            $('#end_time_byday').jdPicker();
        },
        //搜索条件切换
        _search_condition_toggle: function () {
            var $bymonth = $('.bymonth'),
                $byday = $('.byday');
            $('.condition select').change(function () {
                var $val = $(this).children('option:selected').val();
                switch ($val) {
                    case '0':
                        $byday.show();
                        $bymonth.hide();
                        break;
                    case '1':
                        $byday.hide();
                        $bymonth.show();
                        break;
                }
            });
        },
        //数据展示
        _data_show: function () {
            $header.delegate('.data_search_btn', 'click', function () {
                //判断是按日期查询还是按月查询
                var $val = $select.children('option:selected').val();
                switch ($val) {
                    case '0':
                        search_byday();
                        break;
                    case '1':
                        search_bymonth();
                        break;
                }
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
    //根据日期搜索
    function search_byday() {
        var bengin_origin = $start_time_byday.val(),
                  end_origin = $end_time_byday.val();
        if (bengin_origin == 'undefined' || end_origin == 'undefined') {
            return false;
        }
        var begin = common.to_nosplit_date(bengin_origin),
            end = common.to_nosplit_date(end_origin);

        var this_url = url.domain + url.port + interFace.reg_siteusers_byday;
        var json_data = {
            'siteid': curid,
            'begin': begin,
            'end': end
        }
        console.log(this_url);
        console.log(json_data);
        //获取数据并执行相关操作
        var origin_data = get_origin_data({
            url: this_url,//url地址，必填
            data: json_data,//参数,选填
            loading: {
                open: 'true',
                elem: $con
            },//是否添加loading，选填，false(不添加loading),elem为需要添加loading的元素
            callback: {
                funName: callbackfn_byday,//回调函数
                options: {
                }
            }
        });
    }
    //根据月份搜索
    function search_bymonth() {
        var bengin_origin = $start_time_bymonth.val(),
                   end_origin = $end_time_bymonth.val();
        if (bengin_origin == 'undefined' || end_origin == 'undefined') {
            return false;
        }
        var begin = common.to_nosplit_month(bengin_origin),
            end = common.to_nosplit_month(end_origin);

        var this_url = url.domain + url.port + interFace.reg_siteusers_bymonth;
        var json_data = {
            'siteid': curid,
            'begin': begin,
            'end': end
        }
        console.log(this_url);
        //获取数据并执行相关操作
        var origin_data = get_origin_data({
            url: this_url,//url地址，必填
            data: json_data,//参数,选填
            loading: {
                open: 'true',
                elem: $con
            },//是否添加loading，选填，false(不添加loading),elem为需要添加loading的元素
            callback: {
                funName: callbackfn_bymonth,//回调函数
                options: {
                }
            }
        });
    }


    //根据时间进行排序
    function compare(a, b) {
        return a.Date - b.Date;
    }
    //将原始数据转换成可显示数据
    function get_show_data(orgin_data,date_type) {
        for (var i = 0, len = orgin_data.length; i < len; i++) {
            if (date_type == 'month') {
                orgin_data[i].Date = common.to_split_month(orgin_data[i].Date);
            } else {
                orgin_data[i].Date = common.to_split_date(orgin_data[i].Date);
            }
        }
        return orgin_data;
    }
    //回调函数
    function callbackfn_byday(data) {
        var data = get_show_data(data.sort(compare), 'date');
        if (data.length == 0) {
            $data_show.empty().append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
            download_origin_data = null;
        } else {
            $data_show.empty()
            //创建布局
            create_layout_frame();
            //图表展示
            charts_show_byday.init(data);
            //表格展示
            download_origin_data=table_show_byday(data);

            setTimeout(function () {
                $(window).trigger('resize');
            }, 10);
        }
    }
    function callbackfn_bymonth(data) {
        console.log(data);
        var data = get_show_data(data.sort(compare), 'month');
        if (data.length == 0) {
            $data_show.empty().append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
            download_origin_data = null;
        } else {
            $data_show.empty()
            //创建布局
            create_layout_frame();
            //图表展示
            charts_show_bymonth.init(data);
            //表格展示
            download_origin_data = table_show_bymonth(data);

            setTimeout(function () {
                $(window).trigger('resize');
            }, 10);
        }
    }
    
    //初始化页面
    op_game_users_bymonth.init();
});
