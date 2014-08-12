/*
 *@Version:	    v1.0(2014-07-28)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 同城游多日充值走势
 */
//获取dom
$(function () {
    var $win = $(window),
    $header = $('.header'),
    $data_search_btn = $header.find('.data_search_btn'),
    $con = $('.container'),
    $data_show = $con.children('.data_show'),
    $charts = $('.wrap_charts'),
    $table = $('wrap_table');
    //获取url参数
    var curid = common.getUrlPara('curid');
    //下载数据
    var download_origin_data;

    //布局
    adaption_w_h();

    var tc_pay_trend = {
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
                $('.no_data').remove();
                $('.data_wrap,.show_nav,.total_data').hide();
                //获取时间
                var bengin_origin = $('#start_time').val(),
                    end_origin = $('#end_time').val();
                //日期判断
                if (!date_judgment.byday(bengin_origin, end_origin)) {
                    return false;
                }
                var begin = common.to_nosplit_date(bengin_origin),
                    end = common.to_nosplit_date(end_origin);
                //获取充值额度
                var minamount = $('#minamount').val() || -1,
                    maxamount = $('#maxamount').val() || -1;
                //获取用户注册时间
                var reg_val = $('.regtime  option:selected').text(),
                    cur_ms = new Date().getTime(),
                    regtime;
                switch (reg_val) {
                    case '不限注册时间':
                        regtime = -1;
                        break;
                    case '注册30天内的用户':
                        regtime = common.get_no_split_date(cur_ms - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '注册90天内的用户':
                        regtime = common.get_no_split_date(cur_ms - 90 * 24 * 60 * 60 * 1000);
                        break;
                }

                var this_url = url.domain + url.port + interFace.pay_tcpaytrend;
                var json_data = {
                    'begindate': begin,
                    'enddate': end,
                    'maxamount': maxamount,
                    'minamount': minamount,
                    'regtime': regtime
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
    
    //回调函数
    function callbackfn(data) {
        data.Details = data.Details.sort(compare);
        var origin_data = paydata_common.get_trend_data(data);
        if (data.Details.length == 0) {
            $con.append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
            download_origin_data = null;
        } else {
            $('.total_data,.data_wrap,.show_nav').show();
            //总计列表展示
            paydata_common.total_data_show(origin_data.Totals);
            //图表展示
            charts_show_trend.init(origin_data.Details);
            //表格展示
            download_origin_data = table_show_trend(origin_data.Details);

        }
    }

    //初始化页面
    tc_pay_trend.init();
});
