/*
*@Version:	    v1.0(2014-08-01)
*@Author:      xuhp
*@email:       xuhp@ct108.com
*@Description: 
* 同城游PC端平台充值方式占比应用
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

var tc_mobilepay_type_radio = {
    init: function (opts) {
        this._get_search_data(opts);
        this._jdpicker();
        this._clear_value();
        this._data_show();
        this._download_data();
    },
    //获取搜索条件数据
    _get_search_data: function (opts) {
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
            //日期判断
            if (!date_judgment.byday(bengin_origin, end_origin)) {
                return false;
            }
            var begin = common.to_nosplit_date(bengin_origin),
                end = common.to_nosplit_date(end_origin);

            //获取充值渠道
            var gameid = $('#channeltype').attr('channelid');

            var this_url = url.domain + url.port + interFace.pay_tcmobilepaytyperatio;
            var json_data = {
                'begindate': begin,
                'enddate': end,
                'gameid': common.change_all(gameid)
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

//根据金额排序
function money_compare(a, b) {
    return (b.PayAmount - a.PayAmount);
}
//根据人数排序
function users_compare(a, b) {
    return (b.PayUsers - a.PayUsers)
}

//回调函数
function callbackfn(data) {
    log(data);
    var origin_data = paydata_common.get_ratio_data(data);
    log(origin_data);
    if (origin_data.Details.length == 0) {
        $con.append('<div class="no_data">对不起，您搜索的时间段内没有数据！</div>');
        download_origin_data = null;
    } else {

        $('.data_wrap,.show_nav').show();

        //充值金额占比
        origin_data.Details = origin_data.Details.sort(money_compare);
        table_show_ratio_money(origin_data.Details);
        charts_show_ratio_money.init(origin_data.Details);

        //充值人数占比
        origin_data.Details = origin_data.Details.sort(users_compare);
        table_show_ratio_users(origin_data.Details);
        charts_show_ratio_users.init(origin_data.Details);

    }
}

