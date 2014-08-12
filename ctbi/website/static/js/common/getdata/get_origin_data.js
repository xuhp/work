/*
 *@Version:	    v1.0(2014-07-10)
 *@Author:      xuhp
 *@email:       xuhp@ct108.com
 *@Description: 
 * 获取原始数据
 */
function get_origin_data(options) {
    
    var defaults = {
        url: '',//url地址，必填
        data: '',//参数,选填
        async:true,//是否同步，默认为异步
        loading: {
            open: false,
            elem:''
        },//是否添加loading，选填，false(不添加loading),elem为需要添加loading的元素
        callback:{
            funName:function () {//回调函数，选填
            },
            options: {
            }
        }
    }
    var opts = $.extend(true, {}, defaults, options),
        this_data;
    if (opts.loading.open) {
        create_loading(opts.loading.elem);
    }
    $.ajax({
        type: "post",
        url: opts.url+'?t='+(+new Date()),
        dataType: "json",
        data: opts.data,
        cache: false,
        async: opts.async,
        success: function (json) {
            //当error为true时输出错误信息
            //当error为false的时候输出数据
            if(json.error){
                alert(json.data);
            }else{
                this_data = json.data;
                log(this_data);
                //执行回调函数
                opts.callback.funName(this_data, opts.callback.options);
            }
          
        },
        complete: function () {
            if (opts.loading.open) {
                setTimeout(function () {
                    $('.frame_loading').remove();
                },500)
            }
        },
        error: function (error) {
            alert(tipsStr.ajax_system_error);
        }
    })
    return this_data;
}

function create_loading($elem) {
    var str = '<div class="frame_loading">' +
            '<span class="frame_loading"><b class="img_top"></b>' +
            '<img src="/Static/image/common/loading/frame_loading.gif" /></span>' +
        '</div>';
    $elem.append(str);
    $elem.css('position', 'relative');
    $('.frame_loading').css({ 'position': 'absolute', 'top': 0, 'left': 0, 'width': $elem.width(), 'height': $elem.height(), 'z-index': 99999 });
}