define(function (require, exports, module) {
    //引入jquery
    var $ = require('jquery');
    //引入artDialog
    require('/Static/src/plugin/artDialog/artDialog4.1.6/skins/default.css');
    require('/Static/src/plugin/artDialog/artDialog4.1.6/artDialog.source')($);
    //引入自动匹配插件
    var auto = require('/Static/src/plugin/autocomplate/autocomplate');
    require('/Static/src/plugin/autocomplate/autocomplate.css');

    //引入滚动条插件
    require('/Static/src/plugin/jScrollPane/jquery.jscrollpane')($);
    require('/Static/src/plugin/jScrollPane/jquery.mousewheel')($);
    require('/Static/src/plugin/jScrollPane/css/jquery.jscrollpane.css');

    //执行滚动条插件
    var pane = $('.scroll-pane')
    pane.jScrollPane({});
    var api = pane.data('jsp');

    var dependence = {
        init: function () {
            this._elem_h();
            this._load_dep();
            this._li_hover();
            this._tree_open_close();
            this._tree_oc_all();
            this._add_tree();
            this._del_tree();
            this._eduit_tree();
            this._transfer();
            this._sure_click();
        },
        //加载从属关系树
        _load_dep: function () {
            $.ajax({
                type: "post",
                url: $.url_prefix+'/Ashx/SlaveRelationHandler.ashx?method=GetSlaveRelationInfo',
                async: false,
                dataType: "json",
                success: function (data) {
                    if (data != null && data.error) {
                        errorMsg(data.msg);
                        return false;
                    }
                    //将data中的数据按照Sort进行排序
                    data.sort(function (a, b) {
                        return a.Sort - b.Sort;
                    })
                    //创建树
                    $('.user_root > ul').append(create_tree(data));
                    //权限配置
                    var roleKeys = $('#roleKeys').val();
                    //判断是否出现添加一行按钮
                    if (roleKeys == undefined || roleKeys.indexOf('SlaveRelationHandler_AddSlaveRelationInfo') == -1) {
                        $('.btn_wrapper,.add_user,.del_user,.editor_user，.transfer_user').remove();
                    } else {
                        $('.btn_wrapper').show();
                    }
                },
                error: function (error) {
                    //创建树
                    window.location.href = error.responseText;
                }
            });
        },
        //设置元素高度
        _elem_h: function () {
            //dom加载完成后执行
            $(function () {
                set_height();
                //滚动条
                api.reinitialise();
            });
            //窗体大小改变时执行
            $(window).resize(function () {
                //滚动条
                set_height();
                api.reinitialise();
            });
        },
        //li 鼠标hover事件
        _li_hover: function () {
            $('.about_user').live('mouseover', function () {
                $('.about_user').removeClass('current');
                $(this).addClass('current');
            })
        },
        //树展开关闭
        _tree_open_close: function () {
            $('.has_ul > .about_user').die('click').live('click', function () {
                var $ul = $(this).siblings('ul');
                if ($ul.is(":visible")) {
                    $(this).find('.oc_state').addClass('expanded').removeClass('collapsed');
                    $ul.slideUp(200);
                } else {
                    $(this).find('.oc_state').addClass('collapsed').removeClass('expanded');
                    $ul.slideDown(200);
                }
                setTimeout(function () {
                    api.reinitialise();
                },500);
                return false;
            })
        },
        //树展开开关闭全部
        _tree_oc_all: function () {
            //展开全部
            $('.openAll').die('click').live('click', function () {
                openAll();
            });
            //关闭全部
            $('.closeAll').die('click').live('click', function () {
                closeAll();
            });
        },
        //添加树节点
        _add_tree: function () {
            $('.add_user').die('click').live('click', function () {
                //获取祖先元素about_user,可以唯一确定
                var p_div = $(this).parents('.about_user');
                var s_ul=p_div.siblings('ul');
                var p_li = p_div.parent('li');
                var p_uid = p_li.attr('uid');
                //创建弹出类容
                var addForm = '<span style="margin-right:15px;">公司人员:</span>' +
                    '<input type="text" class="allEditTab-txtInput nominator" value="" uid="" style="width:200px;">'+
                    '<div class="btnWrapper" style="padding-top: 20px;margin-left:65px;">' +
                       '<button class="blueBtn h22 w45" id="sureBtn">确定</button>' +
                       '<button class="redBtn h22 w45" style="margin-left:10px;" id="cancelBtn">取消</button>' +
                   '</div>';
                //弹出对话框
                art.dialog({
                    id: 'addForm',
                    content: addForm,
                    title: '创建节点',
                    close: function () {
                        $('.popup_ul').remove();
                    },
                    lock: true,
                    drag: false
                });
                //人员选择自动匹配
                auto_complate();
                //单击弹出框确定按钮
                $('#sureBtn').click(function () {
                    //添加一行
                    var $nom = $('.nominator');
                    if ($nom.attr('uid') == '') {
                        $nom.val('');
                        return false;
                    }
                    //验证添加的节点在原网页中是否已经存在
                    var pre_li = $('li');
                    for (var i = 0; i < pre_li.length; i++) {
                        if (pre_li.eq(i).attr('uid') == $nom.attr('uid')) {
                            var msg = '您所添加的信息已经存在，请重新选择！';
                            errorMsg(msg);
                            $nom.val('').focus();
                            return false;
                        }
                    }
                    //判断是否存在ul
                    if (s_ul.length > 0) {
                        s_ul.append(add_row(p_uid, $nom));
                        //添加伸展关闭按钮
                        if (!p_li.has('.user_root')) {//非根节点添加has_ul,跟展开关闭有关。
                            p_li.addClass('has_ul');
                        }
                    } else {
                        //如果不存在则先创建
                        p_li.append('<ul class="ul_' + p_uid + '"></ul>');
                        $('.ul_' + p_uid).append(add_row(p_uid, $nom));
                        //添加伸展关闭按钮
                        p_li.addClass('has_ul');
                        
                    }
                    //将添加的子项点开
                    $(s_ul).slideDown(200);
                    //关闭弹出框
                    art.dialog({ id: 'addForm' }).close();
                    //滚动条

                    setTimeout(function () {
                        api.reinitialise();
                    }, 500);

                });
                //单击弹出框取消按钮
                $('#cancelBtn').click(function () {
                    //关闭弹出框
                    art.dialog({ id: 'addForm' }).close();
                });
                //阻止父元素发生点击事件
                return false;
            });
        },
        //删除树节点
        _del_tree: function () {
            $('.del_user').die('click').live('click', function () {
                var $li = $(this).parents('.about_user').parent('li');
                //删除相关行
                del_li($li);
                //滚动条
                setTimeout(function () {
                    api.reinitialise();
                }, 500);
                return false;
            });
        },
        //修改树节点
        _eduit_tree: function () {
            $('.editor_user').die('click').live('click', function () {
                //获取源数据
                var $p_div = $(this).parents('.about_user');
                var $p_li = $p_div.parent('li');
                var $uid = $p_li.attr('uid');
                var $userName = $p_div.children('.usr_name').text();
                //创建弹出类容
                var addForm = '<span style="margin-right:15px;">公司人员:</span>' +
                    '<input type="text" class="allEditTab-txtInput nominator" val_name="' + $userName + '" value="' + $userName + '" uid="' + $uid + '" style="width:200px;">' +
                    '<div class="btnWrapper" style="padding-top: 20px;margin-left:65px;">' +
                       '<button class="blueBtn h22 w45" id="sureBtn">确定</button>' +
                       '<button class="redBtn h22 w45" style="margin-left:10px;" id="cancelBtn">取消</button>' +
                   '</div>';
                //弹出对话框
                art.dialog({
                    id: 'addForm',
                    content: addForm,
                    title: '创建节点',
                    lock: true,
                    drag: false
                });
                //人员选择自动匹配
                auto_complate();
                //单击弹出框确定按钮
                $('#sureBtn').click(function () {
                    var $nom = $('.nominator');
                    var $nom_uid =$nom.attr('uid');
                    //验证添加的节点在原网页中是否已经存在
                    var pre_li = $('li');
                    if ($nom_uid == '') {
                        var msg = '您所添加的信息不能为空！';
                        errorMsg(msg);
                        $nom.focus();
                        return false;
                    }
                    for (var i = 0; i < pre_li.length; i++) {
                        if (pre_li.eq(i).attr('uid') == $nom_uid) {
                            var msg = '您所添加的信息已经存在，请重新选择！';
                            errorMsg(msg);
                            $nom.val('').focus();
                            return false;
                        }
                    }
                    //对选择的值进行重新赋值
                    $p_li.attr('uid', $nom_uid);
                    $p_div.children('.usr_name').text($nom.attr('value'));
                    //判断重新编辑的元素是否含有子元素
                    if ($p_li.children('ul').length) {
                        var $c_ul = $p_li.children('ul');
                        $c_ul.attr('class', 'ul_' + $nom_uid);
                        var $c_li = $c_ul.children('li');
                        $c_li.each(function (index, elem) {
                            $(this).attr('parentUid', $nom_uid);
                        });
                    }
                    //关闭弹出框
                    art.dialog({ id: 'addForm' }).close();
                });
                //单击弹出框取消按钮
                $('#cancelBtn').click(function () {
                    //关闭弹出框
                    art.dialog({ id: 'addForm' }).close();
                });

                //阻止父元素发生点击事件
                return false;
            })
        },
        //移交事件
        _transfer: function () {
            $(document).delegate('.transfer_user', 'click', function () {
                //创建移交树
                var allTree = create_transfer_tree();
                //将树添加到弹出框中
                var transferNodeFrame = art.dialog({
                    id: 'transferNode',
                    title: '移交',
                    content: allTree,
                    lock: true,
                    close: function () {
                        $('#transfer_tree').remove();
                    }
                });
                //对取得的内容进行筛选
                var $li = $(this).parents('.about_user').parent('li');
                var $li_uid = $li.attr('uid');
                //获取需要移交的节点
                var $transfer_li = $('#transfer_tree').find('[uid=' + $li_uid + ']');
                var part_tree = $transfer_li;
                //判断是否含有ul
                if ($transfer_li.siblings().length == 0) {
                    $transfer_li.parent('ul').remove();
                } else {
                    $transfer_li.remove();
                }
                is_has_ul();
                //移除所有操作按钮
                $('#transfer_tree').find('.user_opera').remove();
                //对每个li添加input框
                var checkbox = '<span class="checkWrapper"><input type="radio" class="checknode" name="checknode"/></span>';
                $('#transfer_tree').find('.usr_name,.user_head').before(checkbox);

                //单击确定按钮进行移交操作
                sure_transfer(part_tree, $li, $li_uid);
                //单击取消按钮，取消移交操作
                cancel_transfer();
                //滚动条
                setTimeout(function () {
                    api.reinitialise();
                }, 500);
                //阻止父元素发生点击事件
                return false;
            })
            
            //对选择框添加点击事件
            $(document).delegate('.checknode', 'click', function (event) {
                var checkedUid=$(this).parents('.about_user').parent('li').attr('uid');
                $('#transfer_tree').attr('transferId', checkedUid);
                event.stopPropagation();
            })
        },
        //单击确定按钮
        _sure_click: function () {
            $('#save_dep').live('click', function () {
                var dataJson = [];
                var $all_li = $('.user_root li');
                $all_li.each(function (index, el) {
                    var data_row = {};
                    data_row.UID = $(this).attr('uid');
                    data_row.ParentUID = $(this).attr('parentUid');
                    data_row.Sort = index;
                    dataJson.push(jsonToString(data_row));
                });
                var dataJsonStr = "[" + dataJson.join() + "]";
                //将json转换成string
                function jsonToString(o) {
                    var arr = [];
                    var fmt = function (s) {
                        if (typeof s == 'object' && s != null) return jsonToString(s);
                        return /^(string|number)$/.test(typeof s) ? "'" + s + "'" : s;
                    }
                    for (var i in o)
                        arr.push("'" + i + "':" + fmt(o[i]));
                    return '{' + arr.join(',') + '}';
                }
                $.ajax({
                    type: "post",
                    url: $.url_prefix+'/Ashx/SlaveRelationHandler.ashx?method=AddSlaveRelationInfo',
                    data: { "slaveRelation": dataJsonStr },
                    async: false,
                    dataType: "json",
                    success: function (data) {
                        if (data != null && data.error) {
                            errorMsg(data.msg)
                            return false;
                        }
                        var msg = '保存成功！';
                        art.dialog({
                            id: 'errorMsg',
                            drag: false,
                            content: msg,
                            title: '错误提示页面',
                            lock: true
                        });
                        art.dialog({ id: 'errorMsg' }).title('3秒后关闭').time(3);
                    },
                    error: function (error) {
                        window.location.href = error.responseText;
                    }
                });
            })
       }
    }
    //创建移交树
    function create_transfer_tree() {
        var copyTree = $('.user_ul').html();
        var transferTree = '<ul id="transfer_tree" class="user_ul" style="width:400px;height:380px;display:block;overflow:auto;">' + copyTree + '</ul>';
        transferTree += '<div class="buttonwrap mt10 tc"><button id="deter" class="sureBtn blueBtn  h26 pl10 w100 mr15">确定</button><button id="cancel" class="cancelBtn redBtn  h26 pl10 w100">取消</button></div>';
        transferTree += '</div>';
        return transferTree;
    }
    //确定移交
    function sure_transfer(part_tree, $li, $li_uid) {
        $('#deter').die('click').live('click', function () {
            var transferId = $('#transfer_tree').attr('transferId');
            //判断是否进行了节点选择
            if (transferId=='') {
                var msg = '请选择移交节点';
                errorMsg(msg);
                return false;
            }
            //判断选中节点是否含有ul,添加节点
            var $target_li=$('.user_wrapper').find('[uid=' + transferId + ']');
            var $target_ul=$target_li.children('ul');
            if ($target_ul.length) {
                $target_ul.append(part_tree);
            } else {
                $target_li.append('<ul class="ul_' + transferId + '"></ul>');
                $target_li.children('ul').append(part_tree);
                $target_li.addClass('has_ul');
            }
            //删除节点
            if ($li.siblings().length) {
                $li.remove();
            } {
                $li.parent('ul').remove();
            }
            //修改parentuid
            $('.user_wrapper').find('[uid=' + $li_uid + ']').attr('parentUID', transferId);
            //删除has_ul
            is_has_ul();
            art.dialog({ id: 'transferNode' }).close();
        })
    }
    //取消移交
    function cancel_transfer() {
        $(document).delegate('#cancel', 'click', function () {
            art.dialog({ id: 'transferNode' }).close();
        })
    }

    //展开全部
    function openAll() {
        $('.oc_state').addClass('collapsed').removeClass('expanded');
        $('.has_ul  ul').slideDown(100);
        setTimeout(function () {
            api.reinitialise();
        }, 500);
    }
    //关闭全部
    function closeAll() {
        $('.oc_state').addClass('expanded').removeClass('collapsed');
        $('.has_ul  ul').hide();
        api.reinitialise();
    }
    //创建从属关系树
    function create_tree(data) {
        var depend_tree = '';
        //data为所有的JSON数据，node为当前节点
        createNode(data, { 'UID': 0, 'ParentUID': -1 });
        //添加展开关闭图标
        is_has_ul();
        //关闭所有树
        closeAll();
        return depend_tree;
    }

    //递归创建所有树节点
    function createNode(data, node)
    {
        for (var i = 0; i < data.length; i++)
        {
            //如果有节点的parentUID等于当前节点的UID,则将其添加到当前节点中
            if (data[i].ParentUID == node.UID) {
                var this_li = create_li(data[i]);
                if ($('.ul_' + node.UID).length > 0) {
                    $('.ul_' + node.UID).append(this_li);
                } else {
                    //如果li不含有ul，则必须先创建相关的ul
                    $('li[uid='+node.UID+']').append('<ul class="ul_'+node.UID+'"></ul>');
                    $('.ul_' + node.UID).append(this_li);
                }
                createNode(data,data[i]);
            }
        }
    }

    //获取数据,创建li
    function create_li(node) {
        var $li = '';
        $li += '<li uid="' + node.UID + '" parentUid="' + node.ParentUID + '">' +
                    '<div class="about_user">' +
                        '<span class="collapsed  oc_state"></span>' +
                        '<span class="usr_name">' + node.TrueName + '(' + node.UserName + ')' + '</span>' +
                        '<span class="user_opera">' +
                            '<a class="add_user"></a>' +
                            '<a class="del_user"></a>' +
                            '<a class="editor_user"></a>' +
                            '<a class="transfer_user"></a>' +
                        '</span>' +
                    '</div>' +
        '</li>';
        return $li;
    }

    //自动匹配
    function auto_complate() {
        var elem = $('.nominator');
        var url = $.url_prefix+'/Ashx/Common/SSOHandler.ashx?method=SearchUsers';
        auto.init(elem, url);
    }

    //添加一行
    function add_row(p_uid, $nom) {

        var $li = '';
        $li += '<li uid="' + $nom.attr('uid') + '" parentUid="' + p_uid + '">' +
                    '<div class="about_user">' +
                        '<span class="collapsed  oc_state"></span>' +
                        '<span class="usr_name">' + $nom.val() + '</span>' +
                        '<span class="user_opera">' +
                            '<a class="add_user"></a>' +
                            '<a class="del_user"></a>' +
                            '<a class="editor_user"></a>' +
                            '<a class="transfer_user"></a>'+
                        '</span>' +
                    '</div>' +
        '</li>';
        return $li;
    }

    //为li添加、删除has_ul
    function is_has_ul() {
        $('.user_root li').each(function (index, el) {
            if ($(this).children('ul').length > 0) {
                $(this).attr('class', 'has_ul')
            } else {
                $(this).removeClass();
            }
        })
    }

    //删除树节点函数
    function del_li($li) {
        var delForm = '<div>' +
                  '<p>你确定要删除这一行以及它对应的子项吗？</p>' +
                  '<div class="btnWrapper" style="padding-top: 20px;text-align: center;">' +
                      '<button class="blueBtn h22 w45" id="deterBtn">确定</button>' +
                      '<button class="redBtn h22 w45" style="margin-left:10px;" id="cancelBtn">取消</button>' +
                  '</div>'
        '</div>';

        art.dialog({
            id: 'delForm',
            content: delForm,
            title: '删除提醒',
            lock: true,
            drag: false
        });
        $('#deterBtn').click(function () {
            //获取兄弟节点的长度
            var len = $li.siblings('li').length;
            if (len > 0) {
                //如果兄弟li的个数大于0，则只移除相关的li
                $li.remove();
            } else {
                //否则还需移除对应的ul
                $li.parent('ul').remove();
            }
            art.dialog({ id: 'delForm' }).close();
            //重新添加has_ul
            is_has_ul()
        });
        $('#cancelBtn').click(function () {
            art.dialog({ id: 'delForm' }).close();
        });
    }

    //错误提示效果
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

    //计算高度
    function set_height() {
        var body_height = $('body').height();
        $('.user_wrapper').height(body_height);
        $('.user_inner_wrapper').height(body_height - 30);
    }

    module.exports = dependence;
})