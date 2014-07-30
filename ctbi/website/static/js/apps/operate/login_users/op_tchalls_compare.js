/*
 *@Version:	    v1.0(2014-07-15)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 同比环比
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
    //获取url参数
    var curid = common.getUrlPara('curid');
    //下载数据
    var download_origin_data;

    //布局
    adaption_w_h();

    var op_compare = {
        init: function () {
            this._jdpicker();
            this._clear_value();
            this._data_show();
            this._download_data();
        },
        //日期插件
        _jdpicker: function () {
            $('#start_time').jdPicker();
            $('#end_time').jdPicker();
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
                if (bengin_origin == 'undefined' || end_origin == 'undefined') {
                    return false;
                }
                var begin = common.to_nosplit_date(bengin_origin),
                    end = common.to_nosplit_date(end_origin);

                var this_url = url.domain + url.port + interFace.login_tchallusers_compare;
                var json_data = {
                    'hallid': curid,
                    'begin': begin,
                    'end': end
                }

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

    //根据时间进行排序
    function compare(a, b) {
        return a.Date - b.Date;
    }
    //将原始数据转换成可显示数据
    function get_show_data(full_data) {
        var key_arr = ['Times', 'Users1d1', 'Users7d1', 'Users21d1', 'Users21d2'];
        for (var i = 0, len = full_data.length; i < len; i++) {
            for (j = 0, key_len = key_arr.length; j < key_len; j++) {
                //YoY同比，MoM环比
                full_data[i][key_arr[j] + 'TodayMoM'] = (full_data[i][key_arr[j] + 'Yesterday'] - full_data[i][key_arr[j] + 'Today']) / full_data[i][key_arr[j] + 'Today']  || '-';
                full_data[i][key_arr[j] + 'TodayYoY'] = (full_data[i][key_arr[j] + 'Yesteryear'] - full_data[i][key_arr[j] + 'Today']) / full_data[i][key_arr[j] + 'Today'] || '-';
            }
        }
        return full_data;
    }
    //回调函数
    function callbackfn(data) {
        var full_data = get_show_data(data.sort(compare));
        if (data.length == 0) {
            $data_show.empty().append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
            download_origin_data = null;
        } else {
            $data_show.empty();
            //表格展示
            download_origin_data = table_show_compare(data);

            setTimeout(function () {
                $(window).trigger('resize');
            }, 1000)
        }
    }

    //初始化页面
    op_compare.init();
});
