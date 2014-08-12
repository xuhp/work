//充值方式配置
var channel_obj = {
    'Halls': '指定大厅渠道',
    'HallsPlatform': '所有大厅渠道',
    'SitePlatform': '所有网站渠道',
    'Games':'指定游戏渠道'
}
//金额总计配置
var total_list_obj = {
    'TotalMoney': '充值总额',
    'TotalPayNum': '总充值笔数',
    'UsersPerday': '总充值人数（单日去重）',
    'UsersByday': '总充值人数（范围去重）',
    'PerDayMoney': '日均充值笔数',
    'PerDayUsersPerDay': '日均充值人数(单日去重)',
    'PerDayUsersByDay': '日均充值人数(范围去重)',
    'PerUserMoneyPerDay': '人均充值额度(单日去重)',
    'PerUserMoneyByDay': '人均充值额度(范围去重)',
    'PerDayMoney': '日均充值额度',
    'TotalPerTimesMoney':'单笔平均额度'
}

var paydata_common = {
    //获取充值方式
    get_paytype: function (paytype) {
        var str = '';
        for (var i = 0, len = paytype.length; i < len; i++) {
            str += '<option nodeid="' + paytype[i].PayTypeID + '">' + paytype[i].PayTypeName + '</option>';
        }
        $('.paytype').append(str);
    },
    //获取地区
    get_areas: function (areadata) {
        var $province = $('.provinces'),
            $cities = $('.cities'),
            $districts = $('.districts');

        var provicedata = get_province_data(areadata);
        //创建省份列表
        create_area_option(provicedata, $province);
        //创建相关城市列表
        $province.change(function () {
            var nodeid = $(this).children('option:selected').attr('nodeid');
            $cities.empty().append('<option nodeid="all">所有市</option>');
            $districts.empty().append('<option nodeid="all">所有县区</option>');
            if (nodeid != 'all') {
                var citydata = get_city_data(areadata, nodeid);
                create_area_option(citydata, $cities);
            }

        });
        //创建相关县区列表
        $cities.change(function () {
            var nodeid = $(this).children('option:selected').attr('nodeid');
            $districts.empty().append('<option nodeid="all">所有县区</option>');
            if (nodeid != 'all') {
                var districtdata = get_district_data(areadata, nodeid);
                create_area_option(districtdata, $districts);
            }
        });
        //创建相关县区列表
        $cities.change(function () {
            var nodeid = $(this).children('option:selected').attr('nodeid');
            $districts.empty().append('<option nodeid="all">所有县</option>');
            if (nodeid != 'all') {
                var districtdata = get_district_data(areadata, nodeid);
                create_area_option(districtdata, $districts);
            }
        });
    },
    //充值渠道
    create_channel: function (channels) {
        $('#channeltype').click(function () {
            var $channel_wrap = $('.channel_wrap');
            if ($channel_wrap.length > 0) {
                $channel_wrap.show();
            } else {
                //创建弹出框
                create_channel_pop(channels);
            }
        });
        //关闭弹出框
        $(document).click(function (e) {
            var $cur_elem = $(e.target);
            if (!($cur_elem.hasClass('channel_wrap') || $cur_elem.parents('div').hasClass('channel_wrap')) && (!($cur_elem.hasClass('channeltype')))) {
                $('.channel_wrap').hide();
            }
        });
        var $channeltype = $('#channeltype');
        //选择相关数据
        $('.search_condition').delegate('.sure_select', 'click', function () {
            var $radio_checked = $('.channel_wrap').find(':radio:checked'),
                nodeid = $radio_checked.attr('nodeid'),
                $val = $radio_checked.siblings('label').text();
            switch (nodeid) {
                case 'children':
                    var cur_id = $radio_checked.siblings('.select_opts').eq(1).val();
                    $cur_val = $radio_checked.siblings('.select_opts').find('option:selected').text();
                    $channeltype.attr({ 'channelid': cur_id, 'channeltype': 'hall' })
                        .val($cur_val);
                    break;
                default:
                    $channeltype.attr({ 'channelid': nodeid, 'channeltype': channeltype_obj[nodeid] })
                        .val($val);
            }
            $('.channel_wrap').hide();
        })

    },
    //充值走势数据转化
    get_trend_data: function (origin_data) {
        console.log(origin_data);
        var details = origin_data.Details,
            len = details.length,
            total_money = 0,
            total_paynum = 0,
            total_user = 0;
        for (var i = 0; i < len; i++) {
            details[i].Money = details[i].Money / 100;
            //人均充值笔数
            details[i].PerUserTimes = Math.round(details[i].PayNum / details[i].PayUsers) || 0;
            //人均充值额度
            details[i].PerUserMoney = parseFloat((details[i].Money / (details[i].PayUsers)).toFixed(2)) || 0;
            //平均单笔充值额度
            details[i].PerTimesMoney = parseFloat((details[i].Money / details[i].PayNum).toFixed(2)) || 0;

            total_money += details[i].Money;
            total_paynum += details[i].PayNum;
            total_user += details[i].PayUsers;

            details[i].Date = common.to_split_date(details[i].Date);
            details[i].Money = parseFloat((details[i].Money).toFixed(2));
        }
        origin_data.Totals = {};
        //充值总额
        origin_data.Totals.TotalMoney = total_money;
        //充值总笔数
        origin_data.Totals.TotalPayNum = total_paynum;
        //总充值人数（单日去重）
        origin_data.Totals.UsersPerday = total_user;
        //总充值人数（范围去重）
        origin_data.Totals.UsersByday = origin_data.Users;
        //日均充值笔数
        origin_data.Totals.PerDayMoney = Math.round(total_paynum / len);
        //日均充值人数(单日去重)
        origin_data.Totals.PerDayUsersPerDay = Math.round(total_user / len);
        //日均充值人数(范围去重)
        origin_data.Totals.PerDayUsersByDay = Math.round(origin_data.Users / len);
        //人均充值额度（单日去重）
        origin_data.Totals.PerUserMoneyPerDay = (total_money / total_user).toFixed(2);
        //人均充值额度（范围去重）
        origin_data.Totals.PerUserMoneyByDay = (total_money / origin_data.Users).toFixed(2);
        //日均充值额度
        origin_data.Totals.PerDayMoney = (total_money / len).toFixed(2);
        //单笔平均额度
        origin_data.Totals.TotalPerTimesMoney = (total_money / total_paynum).toFixed(2);
        return origin_data;
    },
    //总计列表数据展示
    total_data_show: function (data) {
        //创建总计列表
        var total_list = create_total_list(data);
        $('.total_data_ul').empty().append(total_list);
    },
    //充值占比数据转化
    get_ratio_data: function (origin_data) {
        var new_data = {
            'Totals': {
                'TotalPayAmount': 0,
                'TotalPayUsers':0
            },
            'Details': origin_data
        }
        var total_pay_amout = 0,
            total_pay_users = 0,
             len = origin_data.length
        //计算总额
        for (var i = 0; i < len; i++) {
            total_pay_amout += origin_data[i].PayAmount;
            total_pay_users += origin_data[i].PayUsers;
        }
        new_data.Totals.TotalPayAmount = total_pay_amout;
        new_data.Totals.TotalPayUsers = total_pay_users;

        //计算占比
        for (var i = 0; i < len; i++) {
            new_data.Details[i].PerAmount = ((new_data.Details[i].PayAmount / total_pay_amout) * 100).toFixed(2) + '%';
            new_data.Details[i].PerUsers = ((new_data.Details[i].PayUsers / total_pay_users) * 100).toFixed(2) + '%';
        }
        return new_data;
    }
}
//创建总计列表
function create_total_list(data) {
    var keys = common.get_keys(data),
        str = '';
    for (var i = 0, len = keys.length; i < len; i++) {
        str += '<li><label>' + total_list_obj[keys[i]] + '：</label></ br>' +
            '<span>' + data[keys[i]]+ '</span>';
    }
    return str;
}
//获取值id的名字

//创建弹出框
function create_channel_pop(channels) {
    var channels_data = channels.data;
    var keys = common.get_keys(channels.data);
    var str = '<div class="channel_wrap"><ul>'+
        '<li> <input type="radio" name="channel" id="curid_all"  nodeid="all" checked="checked" /><label for="curid_all">所有渠道</label></li>';
    for (var i = 0, len = keys.length; i < len; i++) {
        if (typeof (channels_data[keys[i]]) == 'number') {
            str += '<li><input type="radio" name="channel" id="curid_' + channels_data[keys[i]] + '" nodeid="' + channels_data[keys[i]] + '"><label for="curid_' + channels_data[keys[i]] + '">' + channel_obj[keys[i]] + '</label></li>'
        } else {
            str += '<li class="has_options"><input type="radio" nodeid="children" name="channel" id="curid_"><label for="curid_">' + channel_obj[keys[i]] + '</label>： <br><select class="select_opts">';
            var cur_data = channels_data[keys[i]];
            for (var j = 0, options_len = cur_data.length; j < options_len; j++) {
                str += '<option value="' + cur_data[j][channels.id] + '">' + cur_data[j][channels.name] + '(' + cur_data[j][channels.id] + ')' + '</option>';
            }
            str+='</select></li>';
        }
    }
    str += '</ul>' +
        '<a class="sure_select">确定</a>'+
        '</div>';
    log(str);
    $('#channeltype').after(str);
    //使用下拉框插件
    $(".select_opts").select2({
        placeholder: "Select a State",
        allowClear: true
    });
}


//创建地区列表选项
function create_area_option(areadata,$elem) {
    var str = '';
    for (var i = 0, len = areadata.length; i < len; i++) {
        str += '<option nodeid="' + areadata[i].areaid + '">' + areadata[i].areaname + '</option>';
    }
    $elem.append(str);
}
//获取省数据
function get_province_data(areadata) {
    var temp = [];
    for (var i = 0, len = areadata.length; i < len; i++) {
        var snap = {
            'areaid': areadata[i].ProvinceID,
            'areaname': areadata[i].ProvinceName
        };
        temp.push(snap);
    }
    quickSort(temp);
    return unique(temp);
}

//获取城市数据
function get_city_data(areadata, provinceid) {
    var temp = [];
    for (var i = 0, len = areadata.length; i < len; i++) {
        if (areadata[i].ProvinceID == provinceid) {
            temp.push({
                'areaid': areadata[i].CityID,
                'areaname': areadata[i].CityName
            });
        }
    }
    quickSort(temp);
    return unique(temp);
}

//获取县区数据
function get_district_data(areadata, cityid) {
    var temp = [];
    for (var i = 0, len = areadata.length; i < len; i++) {
        if (areadata[i].CityID == cityid) {
            temp.push({
                'areaid': areadata[i].DistrictID,
                'areaname': areadata[i].DistrictName
            });
        }
    }
    quickSort(temp);
    return unique(temp);
}

//去除数组中的重复项
function unique(origin_arr) {
    var new_arr = [],
        len = origin_arr.length-1
    for (var i = 0 ; i < len; i++) {
        if (origin_arr[i].areaid == origin_arr[i + 1].areaid) {
            continue;
        }
        new_arr.push(origin_arr[i]);
    }
    new_arr.push(origin_arr[len])
    return new_arr;
}

//快速排序
function quickSort(arr) {
    if (arr.length <= 1) { return arr; }
    var pivotIndex = Math.floor(arr.length / 2);
    var pivot = arr.splice(pivotIndex, 1)[0].areaid;
    var left = [];
    var right = [];
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].areaid < pivot) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }
    return quickSort(left).concat([pivot], quickSort(right));
}