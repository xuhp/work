define(function (require, exports,module) {
    var $ = require('jquery');
    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');
    function budget(periodId, data) {
        var subIDs = '';
        if (arguments.length == 1) {
            var subElem = $('#about_detail').contents().find('.subName');
            for (var i = 0; i < subElem.length; i++) {
                if (i == 0) {
                    subIDs += subElem.eq(i).attr('subId');
                } else {
                    var subID = subElem.eq(i).attr('subId');
                    if (subIDs.indexOf(subID) == -1) {
                        subIDs += (',' + subElem.eq(i).attr('subId'));
                    }
                }
            }
        }
        if (arguments.length == 2) {
            for (var i = 0; i < data.subjects.length; i++) {
                if (i == 0) {
                    subIDs += data.subjects[i];
                } else {
                    subIDs +=','+ data.subjects[i];
                }
            }
        }
        $.ajax({
            type: "get",
            url: $.url_prefix+'/Ashx/BudgetHandler.ashx?method=GetListByPeriod',
            data: {
                'period': periodId,
                'subIDs': subIDs
            },
            async: false,
            cache:false,
            dataType: "json",
            success: function (data) {
                //创建配置信息
                if (data != null && data.error) {
                    errorMsg(data.msg);
                    return false;
                }
                nameSort(data);
                //弹出预算框
                popup_box(data);
                $('.scroll-pane').jScrollPane();
                //显示相关内容
                show_detail(data);
                //布局
                $('#budget_table tr').find('td:first').css('border-right', 'none');
                $('#budget_head tr').find('th:first').css('border-right', 'none');
                //显示影藏精细预算
                show_FineBudget();
                //查看更多
                see_more();

            },
            error: function (error) {
                window.location.href = error.responseText;
            }
        });
        //创建预算相关弹出框
        function popup_box(data) {
            //绘制table部分
            var table = '';
            //头部
            table = '<table id="budget_head" class="fms-table partEditTable" style="width:760px;">' +
                   '<thead>' +
                       '<tr>' +
                           '<th style="width:4%"></th>' +
                           '<th style="width:26%">科目</th>' +
                           '<th style="width:14%">静态预算</th>' +
                           '<th style="width:14%">动态预算</th>' +
                           '<th style="width:14%">冻结</th>' +
                           '<th style="width:14%">实扣</th>' +
                           '<th style="width:14%">剩余</th>' +
                       '</tr>' +
                   '</thead>' +
                   '</table>';
            //主体头部
            table += '<div class="con_budget scroll-pane"  style="width:760px;">' +
                '<table id="budget_table" class="fms-table partEditTable ellip-table"  style="width:760px;">' +
                    '<thead  style="height:0px;">' +
                        '<tr>'+
                           '<th style="width:4%"></th>' +
                           '<th style="width:26%">科目</th>' +
                           '<th style="width:14%">静态预算</th>' +
                           '<th style="width:14%">动态预算</th>' +
                           '<th style="width:14%">冻结</th>' +
                           '<th style="width:14%">实扣</th>' +
                           '<th style="width:14%">剩余</th>' +
                        '</tr>'+
                    '</thead>'+
                '<tbody>';

            //加载data中的数据

            //总预算
            var totalFineBudget = data[0].Amount.FineBudget;
            var total_len = totalFineBudget.length;
            table += '<tr  class="father_tr" id="total_tr">' +
                    '<td>';
            if (total_len > 0) {
                table +='<span class="budget_extend"></span>';
            }
            table += '</td>' +
                '<td style="text-align:left;">所有科目（总预算）</td>' +
                '<td class="finance_decmal" style="width:15%;">' + data[0].Amount.AmountStatic + '</td>' +
                '<td class="finance_decmal" style="width:15%;">' + data[0].Amount.AmountDynamic + '</td>' +
                '<td class="finance_decmal" style="width:15%;">' + data[0].Amount.AmountFreeze + '</td>' +
                '<td class="finance_decmal" style="width:15%;">' + data[0].Amount.AmountFact + '</td>' +
                '<td class="finance_decmal" style="width:15%;">' + data[0].Amount.AmountOverplus + '</td>' +
             '</tr>';
            //添加总预算精细预算
            for (var j = 0; j < total_len; j++) {
                table += '<tr class="child_total_tr child_tr none">' +
                    '<td></td>' +
                    '<td style="text-align:left;">' + data[0].Amount.FineBudget[j].ElaborateTypeName + '</td>' +
                    '<td class="finance_decmal">' +  data[0].Amount.FineBudget[j].Static + '</td>' +
                    '<td class="finance_decmal">' +  data[0].Amount.FineBudget[j].Dynamic + '</td>' +
                    '<td class="finance_decmal">' + data[0].Amount.FineBudget[j].Freeze + '</td>' +
                    '<td class="finance_decmal"">' + data[0].Amount.FineBudget[j].Fact + '</td>' +
                    '<td class="finance_decmal">' + data[0].Amount.FineBudget[j].Canpay + '</td>' +
                '</tr>';
            }
            //详细预算
            for (var i = 0; i < data[0].Detail.length; i++) {
                //获取精细预算相关
                var fineBudget = data[0].Detail[i].FineBudget;
                var len = fineBudget.length;
                //添加详细预算
                table += '<tr class="father_tr" id="tr_' + i + '" style="display:none;" related="' + data[0].Detail[i].Default + '">' +
                    '<td>';
                if(len>0){
                    table +='<span class="budget_extend"></span>';
                }
                table +='</td>' +
                    '<td subId="' + data[0].Detail[i].SubID + '" style="width:25%;text-align: left;" title="' + data[0].Detail[i].SubName + '">' + data[0].Detail[i].SubName + '</td>' +
                    '<td class="finance_decmal" style="width:15%;">' + data[0].Detail[i].Static + '</td>' +
                    '<td class="finance_decmal" style="width:15%;">' + data[0].Detail[i].Dynamic + '</td>' +
                    '<td class="finance_decmal" style="width:15%;">' + data[0].Detail[i].Freeze + '</td>' +
                    '<td class="finance_decmal" style="width:15%;">' + data[0].Detail[i].Fact + '</td>' +
                    '<td class="finance_decmal" style="width:15%;">' + data[0].Detail[i].Canpay + '</td>' +
                '</tr>';
                //添加精细预算
                for (var j = 0; j < len; j++) {
                    table += '<tr class="child_tr_' + i + ' child_tr none">' +
                        '<td></td>' +
                        '<td subId="' + data[0].Detail[i].FineBudget[j].ElaborateTypeID + '" style="text-align: left;" title="' + data[0].Detail[i].FineBudget[j].ElaborateTypeName + '">' + data[0].Detail[i].FineBudget[j].ElaborateTypeName + '</td>' +
                        '<td class="finance_decmal">' + data[0].Detail[i].FineBudget[j].Static + '</td>' +
                        '<td class="finance_decmal">' + data[0].Detail[i].FineBudget[j].Dynamic + '</td>' +
                        '<td class="finance_decmal">' + data[0].Detail[i].FineBudget[j].Freeze + '</td>' +
                        '<td class="finance_decmal"">' + data[0].Detail[i].FineBudget[j].Fact + '</td>' +
                        '<td class="finance_decmal">' + data[0].Detail[i].FineBudget[j].Canpay + '</td>' +
                    '</tr>';
                }
            }
            //尾部
            table += '</tbody>' +
                '</table></div>';

            //绘制更多按钮
            var see_more = '<div class="moreWrapper">查看更多</div>';


            //content  弹出部分
            var content =table + see_more;

            art.dialog({
                id: 'about_budget',
                drag: false,
                content: content,
                title: '预算相关',
                lock: true
            });
        }
        //显示匹配的详细预算
        function show_detail(data) {
            $('tr[related=true]').show();
            //获取详细预算的个数
            var father_trs = $('#budget_table tbody tr.father');
            //如果显示的详细预算的个数和总详细预算的个数相等，则影藏more
            if ($('#budget_table tbody tr:visible').length == father_trs.length) {
                $('.moreWrapper').hide();
            }

        }
        //点击查看更多按钮执行操作
        function see_more() {
            $('.moreWrapper').live('click', function () {
                $('#budget_table tbody tr').show();
                $(this).hide();
                $('.scroll-pane').jScrollPane();
            });
        }
        //显示影藏精细预算
        function show_FineBudget() {
            $('.father_tr').die('click').live('click', function () {
                var father_id = $(this).attr('id');
                var father_span = $(this).find('td').eq(0).find('span');
                var child_trs = $('.child_' + father_id);
                child_trs.each(function (index, elem) {
                    if ($(this).hasClass('none')) {
                        $(this).removeClass('none');
                        father_span.attr('class', 'budget_shrink');
                    } else {
                        $(this).addClass('none');
                        father_span.attr('class', 'budget_extend');
                    }
                })
                $('.scroll-pane').jScrollPane();
            })
        }
        //对获取到的内容数据根据名称进行排序
        function nameSort(arr) {
            var newArr = arr[0].Detail;
            newArr.sort(gCompare);
            return newArr;

        };
        function gCompare(item1, item2) {
            var name1 = item1.SubName;
            var name2 = item2.SubName;
            if (name1 < name2) {
                return -1;
            } else if (name1 > name2) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    exports.budget = budget;
})