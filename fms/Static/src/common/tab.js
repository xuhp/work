
$(".logstype li").bind("click", function () {
    var curdex = $(".logstype li").index(this);
    $(this).addClass("fms-tab-item-current").siblings().removeClass("fms-tab-item-current");
    $(".logslist").eq(curdex).siblings().hide().end().show();
});