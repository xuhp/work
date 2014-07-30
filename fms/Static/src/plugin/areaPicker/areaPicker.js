define(function (require, exports, module) {
    var $ = require('jquery');
    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
    var areaPicker = {
        init: function (elem,pData) {
            //this._focus_move(elem);
            this._createWrapper(elem);
            this._sureBtn_click(elem);
            this._resize(elem),
            this._province_click(pData),
            this._city_click(),
            this._site_click(),
            this._remove_wrapper(),
            this._remove_ul(),
            this._auto_complete(),
            this._area_li_hover()
        },
        //创建地区选择文本框,并添加到相应位置
        _createWrapper: function (elem) {
            //如果已经存在，需要先移除
            $('.areaWrapper').remove();
            //创建元素
            var wrapper = '<div class="areaWrapper clearfix" areaId="">' +
                '<input type="text" name="provinceAll" id="provinceAll" class="form-text form-normal fl mr10" title="— —请选择省份— —" value="— —请选择省份— —" />' +
                '<input type="text" name="cityAll" id="cityAll" class="form-text form-normal fl  mr10" title="— —请选择城市— —" value="— —请选择城市— —" />' +
                '<input type="text" name="siteAll" id="siteAll" class="form-text form-normal fl  mr10" title="— —请选择县区— —" value="— —请选择县区— —" />' +
                '<button class="blueBtn h22 w45 fl" style="margin-top:1px;" id="areaSureBtn">确定</button>' +
            '</div>';
            //添加到页面
            $('body').append(wrapper);
            set_wrapper_position(elem);
        },
        //改变窗体大小执行事件
        _resize: function (elem) {
            $(window).resize(function () {
                set_wrapper_position(elem);
            });
        },
        //单击省份选择文本框
        _province_click: function (data) {
            $('#provinceAll').die('click').live('click', function () {
                //移除兄弟兄弟ul,回到之前的val值
                $('.city_ul,.site_ul').remove();
                $('.areaWrapper .form-text').each(function () {
                    $(this).val($(this).attr('title'));
                });
                //将省份文本框中的内容清空
                $(this).val('');

                //如果已经存在province_ul,则不重新创建
                if (!($('.province_ul').length > 0)) {
                    //创建下拉菜单
                    var $ul = createProvince(data);
                    //添加下拉菜单
                    $('.areaWrapper').append($ul);
                    //设置下拉菜单位置
                    var this_id = 'provinceAll';
                    var ul_class = 'province_ul';
                    set_ul_position(this_id, ul_class);
                    //显示下拉菜单
                    $('.province_ul').slideDown(200);
                    //选择省份
                    selectProvince();
                };
            });
        },
        //单击城市选择文本框
        _city_click: function () {
            $('#cityAll').live('click', function () {
                //移除兄弟兄弟ul,回到之前的val值
                $('.province_ul,.site_ul').remove();
                $('.areaWrapper .form-text').each(function () {
                    $(this).val($(this).attr('title'));
                });
                //将文本框中的内容清空
                $(this).val('');
                //如果存在city_ul则不重新创建
                //如果#cityAll中没有name属性也不创建city_ul
                if ((!($('.city_ul').length > 0)) && (typeof ($('#cityAll').attr('name')) != 'undefined')) {
                    //弹出省份相对应的城市
                    var $url = $.url_prefix+'/Ashx/Common/AreaHandler.ashx?method=GetCityByProvinceID&province='
                        + $(this).attr('name');
                    $.ajax({
                        type: "post",
                        url: $url,
                        async: false,
                        dataType: "json",
                        cache: false,
                        beforeSend: function () {

                        },
                        success: function (data) {
                            //添加下拉菜单
                            var $ul = createCity(data);
                            $('.areaWrapper').append($ul);
                            //设置下拉菜单位置
                            var this_id = 'cityAll';
                            var ul_class = 'city_ul';
                            set_ul_position(this_id, ul_class);
                            $('.city_ul').slideDown(200);
                            //选择城市
                            selectCity();
                        },
                        error: function (data) {
                            //移除loading效果
                            alert("网络繁忙，请稍后再试！");
                        }
                    })
                }
            })
        },
        //单击县区选择文本框
        _site_click: function () {
            $('#siteAll').live('click', function () {
                //移除兄弟兄弟ul,回到之前的val值
                $('.city_ul,.province_ul').remove();
                $('.areaWrapper .form-text').each(function () {
                    $(this).val($(this).attr('title'));
                });
                //将文本框中的内容清空
                $(this).val('');

                //当已经存在site_ul时，则不重新创建
                if ((!($('.site_ul').length > 0)) && (typeof ($('#siteAll').attr('name')) != 'undefined')) {
                    //弹出省份相对应的县区
                    var $url = $.url_prefix+'/Ashx/Common/AreaHandler.ashx?method=GetDistrictByCityID&city='
                        + $(this).attr('name');
                    $.ajax({
                        type: "post",
                        url: $url,
                        async: false,
                        dataType: "json",
                        cache: false,
                        beforeSend: function () {
                        },
                        success: function (data) {
                            //添加下拉菜单
                            var $ul = createSite(data);
                            $('.areaWrapper').append($ul);
                            //设置下拉菜单位置
                            var this_id = 'siteAll';
                            var ul_class = 'site_ul';
                            set_ul_position(this_id, ul_class);
                            $('.site_ul').slideDown(200);
                            //选择城市
                            selectSite();
                        },
                        error: function (data) {
                            //移除loading效果
                            alert("网络繁忙，请稍后再试！");
                        }
                    })
                }
            })
        },
        //单击确定按钮
        _sureBtn_click: function (elem) {
            $('#areaSureBtn').die('click').live('click', function () {
                $('.areaWrapper .form-text').each(function () {
                    $(this).val($(this).attr('title'));
                });
                var areaName = '',
                    provinceName = $('#provinceAll').val(),
                    cityName = $('#cityAll').val(),
                    siteName = $('#siteAll').val();
                if (!(provinceName == '— —请选择省份— —')) {
                    areaName += provinceName;
                }
                if (!(cityName == '— —请选择城市— —')) {

                    areaName +=' - '+ cityName ;
                }
                if (!(siteName == '— —请选择县区— —')) {
                    areaName += ' - ' + siteName;
                }
                if (areaName != '') {
                    $(elem).val(areaName);
                    $(elem).attr('areaId', $('.areaWrapper').attr('areaid'));
                }
                $('.areaWrapper').remove();
            });
        },
        //移除地区选择文本框
        _remove_wrapper: function (event) {
            $(document).bind('click', function (event) {
                //当单击的dom元素是.areaPicker 或 .areaWrapper 里面的元素时，不执行移除命令
                if (!(
                        $(event.target).hasClass('areaWrapper') ||
                        $(event.target).hasClass('areaPicker') ||
                        $(event.target).parent().hasClass('areaWrapper') ||
                        $(event.target).parent().hasClass('province_ul') ||
                        $(event.target).parent().hasClass('city_ul') ||
                        $(event.target).parent().hasClass('site_ul')
                    )) {
                    $('.areaWrapper').remove();
                }
            });
        },
        //移除下拉菜单
        _remove_ul: function (event) {
            $('.areaWrapper').live('click', function (event) {
                //当单击的dom为areaWrapper（不包括后代元素）
                if ($(event.target).hasClass('areaWrapper')) {
                    $('.areaWrapper').find('ul').remove();
                    $('.areaWrapper .form-text').each(function () {
                        $(this).val($(this).attr('title'));
                    });
                }
            });
        },
        //自动匹配
        _auto_complete: function () {
            $('#provinceAll,#cityAll,#siteAll').live('keyup', function () {
                $('.areaWrapper ul li').hide()
                    .filter(":contains('" + ($(this).val()) + "')")
                    .show();
            }).keyup();
        },
        //键盘上下移动相关事件
        _focus_move: function (elem) {
            $(document).die('keydown').live('keydown', function (event) {
                if ($('.areaWrapper ul').length > 0) {
                    //获取相关元素
                    var $ul = $(this);
                    //选择所有display属性不为none的li
                    var $li = $ul.find('li:not(:hidden)');
                    var $len = $li.length;
                    //count用于标志是否含有selected_li
                    var count = 0;
                    //index用于标志含有selected_li的li的下标
                    var index = 0;
                    //判断li中是否含有selected_li,如果不含有则说明是初次加载
                    for (var i = 0; i < $li.length; i++) {
                        if ($li.eq(i).hasClass('selected_li')) {
                            count += 1;
                            index = i;
                            break;
                        }
                    }

                    //判断当event.keyCode 为38时（即上方面键），焦点向上移动; 
                    //if (event.keyCode == 38) {
                    //    key_up(count, $ul, $li, $len, index);
                    //}

                    //    //判断当event.keyCode 为40时（即下方面键），焦点向下移动; 
                    //else if (event.keyCode == 40) {
                    //    key_down(count, $ul, $li, $len, index);
                    //}
                }
            });
        },
        //鼠标hover事件
        _area_li_hover: function () {
            //只有在鼠标移动的时候才发生hover事件，不然会和键盘事件，鼠标事件发生冲突
            //$(document).mousemove(function () {
                $('.areaWrapper ul li').die('hover').live('hover', function () {
                    $(this).addClass('selected_li')
                    .siblings().removeClass('selected_li');
                });
            //});
        }
    }

    //设置.areaWrapper元素的位置
    function set_wrapper_position(elem) {
        //获取坐标
        var offset = $(elem).offset();
        var x = offset.left;
        var y = offset.top + $(elem).height() + 7;
        //设置创建元素位置
        var wrapper = $('.areaWrapper');
        wrapper.css({ 'left': x, 'top': y });
    };

    //设置ul下拉菜单的位置
    function set_ul_position(this_id, ul_class) {
        var that = $('#' + this_id),
            //获取指定输入框的offset值
            offset = that.offset(),
            top = offset.top,
            //获取窗体的高度
            win_h = $(window).height(),
            //计算输入框距离底端的距离，24为输入框的高度（包括padding和border）
            bottom = win_h - top - 24,
            //计算下拉菜单的高度
            ul_h = $('.' + ul_class).height();

        //如果ul_h > bottom 则将下拉菜单放在输入框的上方
        if (ul_h > bottom) {
            //20为.wrapper的padding-top
            $('.' + ul_class).css('top', -ul_h + 20);
        }
    }
    //创建省份下拉菜单
    function createProvince(data) {
        var $p_ul = '<ul class="province_ul">';
        for (var i = 0; i < data.length; i++) {
            if (i == 0) {
                $p_ul += '<li id="' + data[i].PrivinceID + '">' + data[i].ProvinceName + '</li>'
            } else {
                $p_ul += '<li id="' + data[i].PrivinceID + '">' + data[i].ProvinceName + '</li>'
            }
        };
        $p_ul += '</ul>';
        return $p_ul;
    };
    //选择省份执行操作方式,可以通过click和enter键两种方式实现
    function selectProvince() {
        var $proAll = $('.province_ul li');
        //enter事件
        $(document).live('keyup', function (event) {
            if ($('.selected_li').length > 0 && $('.province_ul').length > 0) {
                if (event.keyCode == 13) {
                    var $li = $('.selected_li');
                    //获取省份的名字和id
                    var provinceName = $li.text();
                    var provinceId = $li.attr('id');
                    pro_action(provinceName, provinceId);
                }
            }
        });
        //click事件
        $proAll.live('click', function () {
            var provinceName = $(this).text();
            var provinceId = $(this).attr('id');
            pro_action(provinceName, provinceId);
        });
    };
    //选择省份执行具体操作
    function pro_action(provinceName, provinceId) {
        //将省份名字添加到省份输入框当和title中
        $('#provinceAll').val(provinceName).attr('title', provinceName);
        //判断是否选择全国
        if (provinceId == '00') {
            $('#cityAll,#siteAll').val('全国').attr('title', '全国').attr('disabled', 'disabled');
            $('.areaWrapper').attr('areaId', '000000');
        } else {
            //将省份id标志到cityAll文本框中
            //移除siteAll标志
            //重置cityAll和siteAll的val
            $('#cityAll').attr('name', provinceId).val('— —请选择城市— —').attr('title', '— —请选择城市— —');
            $('#siteAll').removeAttr('name').val('— —请选择县区— —').attr('title', '— —请选择县区— —');

            //标志id，传递给后端
            $('.areaWrapper').attr('areaId', provinceId);
        }

        //移除省份下拉框
        $('.province_ul').remove();
    }

    //创建城市下来菜单
    function createCity(data) {
        var $c_ul = '<ul class="city_ul">';
        for (var i = 0; i < data.length; i++) {
            if (i == 0) {
                $c_ul += '<li id="' + data[i].CityID + '">' + data[i].CityName + '</li>';
            } else {
                $c_ul += '<li id="' + data[i].CityID + '">' + data[i].CityName + '</li>';
            }
        }
        $c_ul += '</ul>';
        return $c_ul;
    }
    //选择城市操作方式,可以通过click和enter键两种方式实现
    function selectCity() {
        var $cityAll = $('.city_ul li');
        //click事件
        $cityAll.live('click', function () {
            //获取城市的名字和id
            var cityName = $(this).text();
            var cityId = $(this).attr('id');
            //执行具体操作
            city_action(cityName, cityId);
        });
        //enter事件
        $(document).live('keyup', function (event) {
            if ($('.selected_li').length > 0 && $('.city_ul').length > 0) {
                if (event.keyCode == 13) {
                    var $li = $('.selected_li');
                    //获取省份的名字和id
                    var cityName = $li.text();
                    var cityId = $li.attr('id');
                    //执行具体操作
                    city_action(cityName, cityId);
                }
            }
        });
    }
    //选择城市执行具体操作
    function city_action(cityName, cityId) {
        //将城市名字添加到城市输入框当中
        $('#cityAll').val(cityName).attr('title', cityName);
        //将城市id标志到siteAll文本框当中
        //重置siteAll的val
        $('#siteAll').attr('name', cityId).val('— —请选择县区— —').attr('title', '— —请选择县区— —');
        //标志id，传递给后端
        $('.areaWrapper').attr('areaId', cityId);
        //移除城市下拉框
        $('.city_ul').remove();
    }

    //创建县区下拉菜单
    function createSite(data) {
        var s_ul = '<ul class="site_ul">';
        for (var i = 0; i < data.length; i++) {
            s_ul += '<li id="' + data[i].DistrictID + '">' + data[i].DistrictName + '</li>';
        }
        s_ul += '</ul>';
        return s_ul;
    }
    //选择县区操作方式,可以通过click和enter键两种方式实现
    function selectSite() {
        var $siteAll = $('.site_ul li');
        //click事件
        $siteAll.live('click', function () {
            var siteName = $(this).text();
            var siteId = $(this).attr('id')
            site_action(siteName,siteId);
        });
        //enter事件
        $(document).live('keyup', function (event) {
            if ($('.selected_li').length > 0 && $('.site_ul').length > 0) {
                if (event.keyCode == 13) {
                    var $li = $('.selected_li');
                    //获取省份的名字和id
                    var siteName = $li.text();
                    //执行具体操作
                    site_action(siteName,siteId);
                }
            }
        });
    };
    //选择县区具体操作
    function site_action(siteName,siteId) {
        $('#siteAll').val(siteName).attr('title', siteName);
        //标志id，传递给后端
        $('.areaWrapper').attr('areaId', siteId);
        $('.site_ul').remove();

    }
    //下移键盘相关操作
    function key_down(count, $ul, $li, $len, index) {
        //如果没有selected_li，则为第一个li加上此class
        if (count == 0) {
            $li.eq(0).addClass('selected_li');
        }
        //如果已经有selected_li,则每次向下移动一步
        if (count == 1) {
            //当li移动到最末端的时候，则返回头部
            if (index == $len - 1) {
                $li.eq(0).addClass('selected_li')
                .siblings().removeClass('selected_li');
                $('.areaWrapper ul').scrollTop(0);
            } else {
                $li.eq(index + 1).addClass('selected_li')
                .siblings().removeClass('selected_li');
                //当selected_li移动到可见区域最底端的时候，滚动条开始滚动
                var top = $('.selected_li').position().top;
                if (top == 200) {
                    $('.areaWrapper ul').scrollTop((index + 1) * 20 - 180);
                }
            }
        }
    }
    //上移键盘相关操作
    function key_up(count, $ul, $li, $len, index) {
        //如果没有selected_li，则为最后个li加上此class
        if (count == 0) {
            $li.eq($len - 1).addClass('selected_li');
            $('.areaWrapper ul').scrollTop($len * 20 - 200);
        }
        //如果已经有selected_li,则每次向上移动一步
        if (count == 1) {
            //当li移动到最顶端时，则返回底部
            if (index == 0) {
                $li.eq($len - 1).addClass('selected_li')
                .siblings().removeClass('selected_li');;
                $('.areaWrapper ul').scrollTop($len * 20 - 200);
            } else {
                $li.eq(index - 1).addClass('selected_li')
                .siblings().removeClass('selected_li');
                var top = $('.selected_li').position().top;
                if (top == -20) {
                    $('.areaWrapper ul').scrollTop((index - 1) * 20);
                }
            }
        }
    }


    module.exports = areaPicker;
});