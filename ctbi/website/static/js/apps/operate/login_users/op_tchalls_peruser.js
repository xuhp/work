/*
 *@Version:	    v1.0(2014-07-08)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 单日，一个按钮
 */
//获取dom
$(function () {
    var $win = $(window),
    $header = $('.header'),
    $selected_time = $header.find('#selected_time'),
    $data_search_btn = $header.find('.data_search_btn'),
    $con = $('.container'),
    $data_show = $con.children('.data_show');
    //获取url参数
    var curid = common.getUrlPara('curid');
    //下载数据
    var download_origin_data;

    //布局
    adaption_w_h();

    var op_game_users_perday = {
        init: function () {
            this._jdpicker();
            this._clear_value();
            this._data_show();
            this._download_data();
        },
        //日期插件
        _jdpicker: function () {
            $('#selected_time').jdPicker();
        },
        //clearValue插件
        _clear_value: function () {
            $('.add_clear_btn').clearValue();
        },
        //数据展示
        _data_show: function () {
            $header.delegate('.data_search_btn', 'click', function () {
                var date_orgin = $selected_time.val(),
                    date = common.to_nosplit_date(date_orgin);
                if (date_orgin == '') {
                    alert(tipsStr.search_tip);
                    return false;
                }

                var times = $('#min_times').val();
                var reg = /^[0-9]*[1-9][0-9]*$/;
                if (!reg.test(times)) {
                    alert('请填入正确的登陆下限次数！')
                    return false;
                };
                
                var this_url = url.domain + url.port + interFace.login_tchallusers_peruser;
                var json_data = {
                    'hallid': curid,
                    'date': date,
                    'times':times
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
                        options: {  //回调函数参数
                           
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
   
    
    //回调函数
    function callbackfn( data) {
        var data = data;
        if (data.length == 0) {
            $('.table_show').hide();
            $('#copy_btn').hide();
            $data_show.append('<div class="no_data">对不起，您搜索的条件内没有数据！</div>');
            download_origin_data = null;
            $('#userid_con').val('');
        } else {
            $('.table_show').show();
            $('#copy_btn').show();
            $('.no_data').remove();
            //表格展示
            download_origin_data = table_show_peruser(data);
            //获取用户id
            get_userid(data);
            //复制用户id
            if ($('#ZeroClipboardMovie_1').length == 0) {
                copy_userid();
            }
        }
    }
    //获取用户id
    function get_userid(data) {
        var userids = '';
        for (var i = 0, len = data.length; i < len; i++) {
            userids += (data[i].Uid + '<br />');
        }
        $('#userid_con').val(userids);
    }
    //复制用户id
    function copy_userid() {
        clip = new ZeroClipboard.Client();
        clip.setHandCursor(true);
        
        clip.addEventListener('mouseOver', function (client) {
            clip.setText(document.getElementById('userid_con').value);
        });

        clip.addEventListener('complete', function (client, text) {
            alert("用户id已经复制，你可以使用Ctrl+V 粘贴。");
        });

        clip.glue('copy_btn');
    }

    //初始化页面
    op_game_users_perday.init();
});
