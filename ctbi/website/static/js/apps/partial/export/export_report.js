/*
 *@Version:	    v1.0(2014-08-07)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 报表导出应用，通用js
 */
var export_report = {
    init: function (para) {
        this._click_report_btn(para);
    },
    _click_report_btn: function (para) {
        var that = this;
        $('.data_search_btn').click(function () {
            //判断是否有数据
            var $val = $('#selected_time').val();
            if ($val == '') {
                alert('请选择月份');
                return false;
            }
            //修改按钮样式
            $(this).attr('disabled','disabled')
                .text('导出中...')
                .addClass('dis_btn');
            var ck = 'report'+(+new Date());
            //设置cookie,1天失效
            setCookie(ck, '1', 10);
            log(ck);
            //开始报表下载
            that._download(common.to_nosplit_month($val), ck, para);
            //检测cookie
            that._detect_cookie(ck);
        });
    },
    //没500ms检测cookie值是否存在。
    //如果存在则说明,后端表格还未生成完成，继续检查
    //如果不存在则说明后端表格数据已经生成完成，结束按钮导出中...的的状态
    _detect_cookie: function (ck) {
        function detect() {
            var cookie_str = getCookie(ck);
            log(cookie_str);
            if (cookie_str == '1') {
                setTimeout(detect, 500);
            } else {
                //修改按钮样式
                $('.data_search_btn').attr('disabled','')
                    .text('导出报表')
                    .removeClass('dis_btn');
            }
        }
        setTimeout(detect, 500);
    },
    //实现报表下载
    _download: function (month, ck, para) {
        var str = '<form id="form" style="display:none;"  method="post" action="' + url.domain + url.port + interFace[para.interFace] + '" style="position:absolute;">' +
       "<input type='hidden' name='month' value='" + month + "'/>" +
       "<input type='hidden' name='ck' value='" + ck + "'/>" +
       '</form>';
        $('body').append(str);
        $('form').submit();
    }
}

//设置cookie
function setCookie(name, value, seconds) {
    seconds = seconds || 0;   //seconds有值就直接赋值，没有为0，这个根php不一样。
    var expires = "";
    if (seconds != 0) {      //设置cookie生存时间
        var date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    document.cookie = name + "=" + escape(value) + expires + "; path=/";   //转码并赋值
}

//获取cookie值
function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
