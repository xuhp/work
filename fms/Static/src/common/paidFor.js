define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    var $id = '';

    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    //转化传入的cusType
    var cusType = {
                '0': '未知',
                '1': '个人',
                '2': '单位'
            }

    function paidFor() {
        //创建元素：顶部搜索和底部按钮
        var paidForD = '<div class="paidForDialog">' +
                '<div class="paidFor-top">' +
                    '<label class="w100" for="paidF_cusName" title="客户的名称">客户名：</label>' +
                    '<input type="text" class="form-text form-normal w135 mr10"  id="paidF_cusName"/>' +
                    '<label class="w100" for="paidF_hostName" title="银行卡开户人的名字">户主名：</label>' +
                    '<input type="text" class="form-text form-normal w135 mr10" id="paidF_hostName" />' +
                    '<label class="w100" for="paidF_cardNum" title="银行卡号">卡号：</label>' +
                    '<input type="text" class="form-text form-normal w135 mr10" id="paidF_cardNum" />' +
                    '<button class="searchBtn blueBtn  h26 pl10 w82 ">搜索</button>' +
                '</div>' +
                '<div class="paidF_con mt10">' +
                    '<table class="fms-table partEditTable bankInfoTop">' +
                        '<thead>' +
                            '<tr>' +
                                '<th style="width: 50px;">选择</th>' +
                                '<th style="width:200px;">开户行</th>' +
                                '<th style="width:200px;">卡号</th>' +
                                '<th style="width:150px;">户主名</th>' +
                            '</tr>' +
                        '</thead>' +
                    '</table>' +
                    '<div class="bankInfoW scroll-pane" style="position:relative;">' +
                        '<table class="fms-table partEditTable bankInfoTab">' +
                            '<thead>' +
                                    '<tr>' +
                                    '<th style="width: 50px;">选择</th>' +
                                    '<th style="width:200px;">开户行</th>' +
                                    '<th style="width:200px;">卡号</th>' +
                                    '<th style="width:150px;">户主名</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '</tbody>' +
                        '</table>' +
                        '<span class="loader-big" style="position:absolute;top:102px;left:286px;display:none;"></span>'+
                    '</div>' +
                '</div>' +
                '<div class="paidForBtn" style="margin-top:20px;text-align:center;">' +
                    '<button class="sureBtn blueBtn  h26 pl10 w100 mr10">确定</button>' +
                    '<button class="cancelBtn redBtn  h26 pl10 w100">取消</button>' +
                '</div>' +
            '</div>';


        //弹出框
        $('.paidFor').die('click').live('click', function () {
            $id = $(this).parents('tr').attr('id');
            art.dialog({
                id: 'openD',
                title: '选择付款对象',
                lock: true,
                drag:false,
                content: paidForD
            });
        });


        //单击查询按钮显示信息
        $('.paidForDialog .searchBtn').die('click').live('click', function () {
            $('.loader-big').show();
            setTimeout(function () {
                //获取url的值
                var cardNo = $('#paidF_cardNum').val();
                var cusName = $('#paidF_cusName').val();
                var accountHolder = $('#paidF_hostName').val();
                var $url = $.url_prefix+'/Ashx/Common/CrmHandler.ashx?method=GetCustomerInfo';
                $.ajax({
                    type: "post",
                    url: $url,
                    async: false,
                    dataType: "json",
                    data: {
                        'cardNo': cardNo,
                        'customerName': cusName,
                        'accountHolder': accountHolder
                    },
                    cache: false,
                    success: function (data) {
                        //错误验证
                        if (data != null && data.error) {
                            errorMsg(data.msg);
                            return false;
                        }
                        //获取网页中的元素
                        var $pfDialog = $('.paidForDialog');
                        var $paidF_con = $pfDialog.find('.paidF_con');
                        //插入数据
                        var $infos = getInfo(data);
                        $pfDialog.find('.bankInfoTab tbody').empty().append($infos);
                        //当返回的json数据为空时
                        $('.nullMsg').hide();
                        if (data.length == 0) {
                            if ($('.nullMsg').length == 0) {
                                $('.bankInfoW').append('<div class="nullMsg" style="font-size:20px;margin-top:70px;text-align:center;"><p>sorry，您搜索的内容为空</p><p>请联系"CRM"系统管理员添加相应数据</p><div>');
                                $('.nullMsg').stop(true, true).fadeIn(100)//.fadeOut(3000);
                            } else {
                                $('.nullMsg').stop(true, true).fadeIn(100)//.fadeOut(3000);
                            }
                        }
                        //移除loading效果
                        $('.loader-big').hide();
                        //执行滚动条插件
                        $('.scroll-pane').jScrollPane();
                    },
                    error: function (data) {
                        //移除loading效果
                        $('.loader-big').hide();
                        alert("网络繁忙，请稍后再试！");
                    }

                });

                //表格相关操作与样式
                tab_fn();

                //单击保存按钮操作
                $('.paidForBtn .sureBtn').die('click').live('click', function () {
                    var that = $('#' + $id).find('.paidFor');
                    //获取焦点元素
                    var $checked = $('.bankInfoTab').find('input:checked');
                    //在对应的对象选择框当中添加付款对象名称和类型
                    //获取焦点元素对应的tr元素
                    var $cardTr = $checked.parents('tr');
                    var $class_name = $cardTr.attr('class');
                    var $id_name = $class_name.substr(6);
                    var $cusTr = $('#' + $id_name);

                    //添加付款对象信息
                    var $cusSpan = $cusTr.find('span');
                    var cusInfo = $cusSpan.eq(1).html() + '(' + $cusSpan.eq(2).html() + ')';
                    that.attr({
                        'value': cusInfo,
                        'cusName': $cusSpan.eq(1).html(),
                        'cusType': $cusSpan.eq(2).attr('cusType'),
                        'cusId': $cusTr.attr('cusId')
                    });

                    //移除原有的银行卡号信息
                    that.siblings('.tooltip').remove();

                    //添加银行卡号信息
                    var $cardTd = $checked.parent('td').siblings();
                    var cardInfo = '<div class="tooltip" style="position:absolute; z-index:9">' +
                        '<p class="bankName">开户行：' +
                            '<span> ' + $cardTd.eq(0).html() + '</span>' +
                        '</p>' +
                        '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：' +
                            '<span>' + $cardTd.eq(1).html() + '</span>' +
                            '</p>' +
                        '<p class="AccountHolder">户主名： ' +
                            '<span>' + $cardTd.eq(2).html() + '</span>' +
                        '</p>' +
                    '</div>';
                    that.parent('.paidFor_pos').append(cardInfo);
                    $('.tooltip').hide();
                    art.dialog({ id: 'openD' }).close();
                });
            }, 100);
        });
        //单击取消按钮进行关闭
        $('.paidForBtn .cancelBtn').live('click', function () {
            art.dialog({ id: 'openD' }).close();
        });
        //获取信息
        function getInfo(cusInfo) {
            var infos = '';
            for (var i = 0; i < cusInfo.length; i++) {
                infos += '<tr   class="cusInfo_parent" id="row_' + i + '" cusId="' + cusInfo[i].CusID + '">' +
                    '<td  colspan="4" style="text-align:left; ">' +
                        '<span class="cusInfo_opearte" ></span> ' +
                        '<span class="cusInfo_name">' + cusInfo[i].CusName + '</span> ' +
                        '<span class="cusInfo_type" cusType="' + cusInfo[i].CusType + '">' + cusType[cusInfo[i].CusType] + '</span></td>'
                '</tr>';
                for (var j = 0; j < cusInfo[i].BankInfo.length; j++) {

                    infos += '<tr class="child_row_' + i + '">' +
                            '<td><input type="radio" name="radio" /></td>' +
                            '<td>' + cusInfo[i].BankInfo[j].BankName + '</td>' +
                            '<td>' + cusInfo[i].BankInfo[j].CardNo + '</td>' +
                            '<td>' + cusInfo[i].BankInfo[j].AccountHolder + '</td>' +
                        '</tr>'
                }
            }
            return infos;
        };

        //表格相关操作
        function tab_fn() {
            var $bankInfoTab = $('.bankInfoTab');
            var $cusInfo_parent = $bankInfoTab.find('.cusInfo_parent');
            $cusInfo_parent.click(function () {
                $(this)
                    .toggleClass("selected")   // 展开部分高亮显示
                    .siblings('.child_' + this.id).toggle();  // 展开相关子项
                //执行滚动条插件
                $('.scroll-pane').jScrollPane();
            }).click();
            $('.bankInfoTab tr').click(function () {
                $(this).find(':radio').attr('checked', 'checked');
            })
        }
        //错误提示效
        function errorMsg(msg) {
            art.dialog({
                id: 'errorMsg',
                drag: false,
                content: msg,
                title: '错误提示页面',
                lock: true
            });
            art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
        }
    };

    module.exports = paidFor;
})