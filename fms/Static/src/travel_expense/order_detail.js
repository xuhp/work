/*
 *@Description: 历史详情页面框架
 *@date:        2014-04-30
 *@Version:	    v1.0
 *@Author:      xuhp
 *@e-mail:      xuhp@ct108.com
 */
define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);
    //引入公共js
    var travel_common = require('/Static/src/travel_expense/travel_common');
    var errorMsg = travel_common.errorMsg;
    var confirm_dialog = travel_common.confirm_dialog;
    var getUrlParam=travel_common.getUrlParam;
    //引入内容框架相关js
    var frame_oprate = require('/Static/src/travel_expense/common/frame_oprate');
    frame_oprate.init();
    var url_para = frame_oprate.get_url_para();
    //输入框验证
    var label_tip = require('/Static/src/common/label_tip');
    var order_detail = {
        init: function () {
            this._export();
        },
        //到处报表
        _export: function () {
            var commonA =$('.footer a');
            var commonHref = commonA.attr('href')+'orderid=' +getUrlParam('orderid');
            commonA.attr('href', commonHref);
        }
    }
    module.exports = order_detail;
})