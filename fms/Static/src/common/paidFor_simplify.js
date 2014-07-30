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

    function paidFor(taskId) {
        //创建元素：底部按钮
        var paidForD = '<div class="paidForDialog">' +
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
                    '<div class="bankInfoW scroll-pane">' +
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
                    '</div>' +
                '</div>' +
                '<div class="paidForBtn" style="margin-top:20px;text-align:center;">' +
                    '<button class="sureBtn blueBtn  h26 pl10 w100 mr10">确定</button>' +
                    '<button class="cancelBtn redBtn  h26 pl10 w100">取消</button>' +
                '</div>' +
            '</div>';
        //弹出框
        $('input.paidFor').die('click').live('click', function () {
            $id = $(this).parents('tr').attr('id');
            art.dialog({
                id: 'openD',
                title: '选择付款对象',
                lock: true,
                drag: false,
                content: paidForD
            });
            //添加付款对象信息
            paid_con(taskId);
        });


        //获取付款对象信息
        function paid_con(taskId) {
            //获取url的值
            var $url = $.url_prefix+'/Ashx/Common/CrmHandler.ashx?method=GetPayForByTaskID';
            $.ajax({
                type: "post",
                url: $url,
                data:{'taskID':taskId},
                async: false,
                dataType: "json",
                cache: false,
                success: function (data) {
                    //获取网页中的元素
                    var $pfDialog = $('.paidForDialog');
                    var $paidF_con = $pfDialog.find('.paidF_con');

                    //插入数据
                    var $infos = getInfo(data);
                    $pfDialog.find('.bankInfoTab tbody').empty().append($infos);
                    //执行滚动条插件
                    $('.scroll-pane').jScrollPane();
                },
                error: function (error) {
                    window.location.href = error.responseText;
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
                    'cusId': $cusTr.attr('cusId'),
                    'pfId': $cardTr.attr('pfId')
                });

                //移除原有的银行卡号信息
                that.siblings('.tooltip').remove();

                //添加银行卡号信息
                var $cardTd = $checked.parent('td').siblings();
                var cardInfo = '<div class="tooltip" style="position:absolute; z-index:9">' +
                    '<p class="bankName">开户行：<span> ' + $cardTd.eq(0).html() + '</span></p>' +
                    '<p class="cardNo">卡&nbsp;&nbsp;&nbsp;&nbsp;号：<span>' + $cardTd.eq(1).html() + '</span></p>' +
                    '<p class="AccountHolder">户主名： <span>' + $cardTd.eq(2).html() + '</span></p>' +
                '</div>';
                that.parent('.paidFor_pos').append(cardInfo);
                $('.tooltip').hide();
                art.dialog({ id: 'openD' }).close();
            });

        };
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

                    infos += '<tr class="child_row_' + i + '" pfId="' + cusInfo[i].BankInfo[j].PFID + '" >' +
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
            });
            $('.bankInfoTab tr').click(function () {
                $(this).find(':radio').attr('checked', 'checked');
            })
        }
    };

    module.exports = paidFor;
})