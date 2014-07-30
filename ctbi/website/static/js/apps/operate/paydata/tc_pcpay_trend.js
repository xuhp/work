/*
*@Version:	    v1.0(2014-07-28)
*@Author:      xuhp
*@email:       xuhp@ct108.com
*@Description: 
* 同城游多日充值走势
*/
//获取dom

var $win = $(window),
$header = $('.header'),
$start_time = $header.find('#start_time'),
$end_time = $header.find('#end_time'),
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

var tc_pcpay_trend = {
    init: function (opts) {
        this._get_search_data(opts);
        this._jdpicker();
        this._clear_value();
        this._data_show();
        this._download_data();
    },
    //获取搜索条件数据
    _get_search_data: function (opts) {
        //获取充值方式
        paydata_common.get_paytype(opts.paytype);
        //地区选择
        paydata_common.get_areas(opts.areas);
        //充值渠道
        paydata_common.create_channel(opts.channels);
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
            var bengin_origin = $start_time.val(),
                end_origin = $end_time.val();
            if (bengin_origin == 'undefined' || end_origin == 'undefined') {
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
                    regtime = common.get_no_split_date(cur_ms);
                    break;
                case '注册30天内的用户':
                    regtime = common.get_no_split_date(cur_ms - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '注册90天内的用户':
                    regtime = common.get_no_split_date(cur_ms - 90 * 24 * 60 * 60 * 1000);
                    break;
            }
            console.log(regtime);

            var this_url = url.domain + url.port + interFace.pay_tcpaytrend;
            var json_data = {
                'begin': begin,
                'end': end,
                'maxamount': maxamount,
                'minamount': minamount,
                'regtime': regtime
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
function get_show_data(orgin_data) {
    for (var i = 0, len = orgin_data.length; i < len; i++) {
        orgin_data[i].Date = common.to_split_date(orgin_data[i].Date);
    }
    return orgin_data;
}
//回调函数
function callbackfn(data) {
    var data = get_show_data(data.sort(compare));
    if (data.length == 0) {
        $con.append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
        download_origin_data = null;
    } else {
        $('.data_wrap,.show_nav').show();
        //图表展示
        charts_show_byday.init(data);
        //表格展示
        download_origin_data = table_show_byday(data);

        setTimeout(function () {
            $(window).trigger('resize');
        }, 10)
    }
}

