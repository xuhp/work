//充值方式配置
var channel_obj = {
    'Halls': '指定大厅渠道',
    'HallsPlatform': '所有大厅渠道',
    'SitePlatform': '所有网站渠道',
    'Games':'指定游戏渠道'
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
    },
    //充值走势数据转化
    get_trend_data: function (origin_data) {
        //var new_data = {
        //    'Statis': {
        //        'TotalMoney': 0,
        //        'TotalPayNum': 0,
        //        'TotalPayUsers': 0,
        //        'PerDayMoney': 0,
        //        'PerDayUsers': 0,
        //        'PerUserMoney': 0,
        //        'PerTimesMoney': 0,
        //    },
        //    'Details': {

        //    }
        //}
        for (var i = 0, len = origin_data.length; i < len; i++) {
            origin_data[i].PerUserTimes = origin_data[i].PayNum / origin_data[i].PayUsers;
            origin_data[i].PerUserMoney = origin_data[i].Money / origin_data[i].PayUsers;
            origin_data[i].PerTimesMoney = origin_data[i].Money / origin_data[i].PayUsers;
        }
    }
}
//创建弹出框
function create_channel_pop(channels) {
    var channels_data = channels.data;
    var keys = get_keys(channels.data);
    var str = '<div class="channel_wrap"><ul>'+
        '<li> <input type="radio" name="channel" id="curid_all"  nodeid="all" /><label for="curid_all">所有渠道</label></li>';
    for (var i = 0, len = keys.length; i < len; i++) {
        if (typeof (channels_data[keys[i]]) == 'number') {
            str += '<li><input type="radio" name="channel" id="curid_' + channels_data[keys[i]] + '" nodeid="' + channels_data[keys[i]] + '"><label for="curid_' + channels_data[keys[i]] + '">' + channel_obj[keys[i]] + '</label></li>'
        } else {
            str += '<li class="has_options"><input type="radio" name="channel" id="curid_"><label for="curid_">' + channel_obj[keys[i]] + '</label>： <br><select class="select_opts">';
            var cur_data = channels_data[keys[i]];
            for (var j = 0, options_len = cur_data.length; j < options_len; j++) {
                str += '<option nodeid="' + cur_data[j][channels.id] + '">' + cur_data[j][channels.name] + '(' + cur_data[j][channels.id] + ')' + '</option>';
            }
            str+='</select></li>';
        }
    }
    str += '</ul>' +
        '<a class="sure_select">确定</a>'+
        '</div>';
    $('#channeltype').after(str);
    //使用下拉框插件
    $(".select_opts").select2({
        placeholder: "Select a State",
        allowClear: true
    });
}
//获取key
function get_keys(channeldata) {
    var arr = [];
    for (key in channeldata) {
        arr.push(key);
    }
    return arr;
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