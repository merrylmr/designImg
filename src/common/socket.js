import $ from 'jquery';
import socketIO from 'socket.io-client'
import eventBus from '@/common/eventBus.js';
import comm from '@/common/common.js';

import  docData from  '@/assets/json/doc.json';




var socket = {
    state: {
        //socketIO对象
        io: null,
        //计数器
        counter: 0,
        //请求列表
        requestList: [],
        //自动保存队列
        saveList: [],
        comitLock: false,
        //vue对象
        vue: null,
        //是否是临时模板
        tempTpl: false
    },
    //初始化socket功能,向服务器请求url并返回相关token
    init(vue) {
        document.socketDebug = '暂无socket调试信息';

        this.state.vue = vue;
        var _self = this;
        var url = window.location.href;
        var urlArr1 = url.split('/diy4/');
        var urlArr = urlArr1[1].split('/');
        var tpl_id = urlArr[0] ?
            urlArr[0] :
            0;
        var tpl_mode = urlArr[1] ?
            urlArr[1] :
            0;
        var tpl_extra = {};
        var tpl_extra_str = '';
        var host = document.domain;
        var keys = [
            'title',
            'width',
            'height',
            'unit',
            'dpi',
            'branch',
            'diy_product',
            'diy_layout',
            'access',
        ];
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var v = comm.getQueryString(k);
            if (v) {
                tpl_extra[k] = v;
            }
        }
        for (var k in tpl_extra) {
            tpl_extra_str += '&tpl_extra[' + k + ']=' + tpl_extra[k];
        }

      let result={"error":0,
        "data":{"conn_id":1531957,
          "uid":187438,
          "username":"lmr",
          "userFace":"http://image.tubangzhu.com/uploads/face/187438_180.png",
          "tpl_id":"1079550",
          "tpl_mode":0,
          "team_id":0,
          "coop_id":0,
          "coop_name":"",
          "coop_service":{"qq":"","ww":""},
          "open_id":0,
          "open_url":"",
          "open_on_finish":"insert",
          "refresh_url":"http://www.tubangzhu.com/diy4/1079550/0/",
          "team_color":[],
          "theme_color":"#cfbaaa",
          "theme_diy_color":"#00a2eb",
          "theme_color_is_diy":false,
          "theme_color_list":["#00a2eb","#288add","#31a66b","#da434e","#e56281","#b1639f","#6b51c0","#595ca0","#3074c1","#00829a","#159c77","#4fb0ac","#7ac5c4","#9bb7d6","#804d4d","#f0bc59","#cfbaaa"],
          "socket_server":"//socket.tubangzhu.com",
          "socket_api_server":"http://socket-api.tubangzhu.com:8090",
          "access_token":"XfelZjw3VHYE87GrxrTcJPq4Y2-A6tGp",
          "admin_level":0},"msg":"OK",
        "apiVersion":"v0",
        "coopId":0,
        "product":"tubangzhu"};

      if (result.error == 0) {
        //console.log('socketinit');
        console.log(result);
        var data = result.data;
        var groupId = data.team_id;
        var groupColor = data.team_color;
        var uid = data.uid;

        var {
          username,
          theme_color_is_diy: isDiy,
          theme_color_list: colorList,
          theme_diy_color: diyColor,
          theme_color: themeColor
        } = data

        _self.state.vue.$store.state.stage.groupId = groupId;
        //_self.state.vue.$store.state.docData.product = result.product;
        //_self.state.vue.$store.commit('setProduct', result.product)
        //data.open_id  >0

        if (data.open_id > 0) {
          //第三方网站 cooperation=c
          _self.state.vue.$store.state.editor.openUrl = data.open_url;
          _self.state.vue.$store.state.editor.loginMode = uid > 0 ?
            'c_logged' :
            'c_visitor';
        } else {
          //主站
          _self.state.vue.$store.state.editor.loginMode = uid > 0 ?
            'logged' :
            'visitor';
        }

        if (tpl_mode == 1) {
          //官方模板编辑关闭自动保存
          _self.state.vue.$store.state.editor.autoSave = false;
        }

        _self.state.vue.$store.state.editor.uid = uid;
        _self.state.vue.$store.state.editor.userFace = data.userFace;
        _self.state.vue.$store.state.editor.coorpId = data.coop_id;
        _self.state.vue.$store.state.editor.coorpName = data.coop_name;
        _self.state.vue.$store.state.editor.coopAllowDownload = data.coop_allow_download;
        _self.state.vue.$store.state.editor.coorpLinks = data.coop_service;
        _self.state.vue.$store.state.editor.openId = data.open_id;
        _self.state.vue.$store.state.editor.tpl_mode = tpl_mode;
        _self.state.vue.$store.state.editor.open_on_finish = data.open_on_finish;
        _self.state.vue.$store.state.editor.openAccessToken = tpl_extra.access || '';
        _self.state.vue.$store.state.editor.admin_level = (data.admin_level == 1 ? true : false)
        _self.state.vue.$store.state.editor = {
          ..._self.state.vue.$store.state.editor,
          username,
          isDiy,
          colorList,
          diyColor,
          themeColor,
        }

        //window.userInfo = data;

        var newUrl = '';
        if (data.refresh_url && 0) {
          newUrl = data.refresh_url;
        } else {
          if (data.tpl_mode) {
            newUrl = '/diy4/' + data.tpl_id + '/' + data.tpl_mode + '/';
          } else {
            newUrl = '/diy4/' + data.tpl_id + '/0/';
          }
        }

        try {
          window
            .history
            .replaceState({}, '', newUrl);
        } catch (e) {
          window.location.href = newUrl;
          return;
        }

        //静态数据
        // _self.staticData();

        /**
         * 调试使用
         */
        _self.initSocket(data.socket_server + '/?conn_server=' + data.socket_api_server + '&uid=' + data.uid + '&tpl_id=' + data.tpl_id + '&conn_id=' + data.conn_id + '&access_token=' + data.access_token);
      } else {

        _self
          .state
          .vue
          .$store
          .commit('callModal');
        _self
          .state
          .vue
          .$store
          .commit('callModal', {
            type: 'alert',
            modalOver: true,
            cls: 'danger',
            text: result.msg,
            fn: function () {
              history.go(-1);
            }
          })
      }
        //ajax请求socket连接参数
    },

    staticData(){
      setTimeout(()=>{
        eventBus.$emit('socket_templateInfo', docData.msg.data);
      },1000);
    },

    //初始化socket
    initSocket(socketURL) {
        var _self = this;
        //连接socket服务器
        this.state.io = socketIO(socketURL);
        this
            .state
            .io
            .on('connect', function (data) {
                if (_self.state.vue.$store.state.editor.autoSave) {
                    //console.warn('socket连接已建立');
                    if ($('.save-state').text() == '网络不稳定,请尝试保存模板') {

                        _self.state.saveList = [];
                        $('.save-state').text('网络已恢复');
                        setTimeout(function () {
                            //console.log('在这B');
                            $('.save-state').fadeOut();
                        }, 3000);

                    }
                }

            });
        this
            .state
            .io
            .on('disconnect', function () {
                _self.state.vue.$store.state.editor.lastDisconnect = true;
                if (_self.state.vue.$store.state.editor.autoSave) {
                    //console.warn('socket连接已丢失');
                    $('.save-state').text('网络不稳定,请尝试保存模板');
                    $('.save-state').fadeIn();
                }
            });
        this
            .state
            .io
            .on('fileUploadConnected', function (data) {
                _self
                    .state
                    .vue
                    .$store
                    .commit('callModal');
            });
        this
            .state
            .io
            .on('fileUploaded', function (data) {
              console.log('fileUploaded:');
              console.log(data);
                _self.state.vue.$store.state.editor.uploadPush = data;
            });
        this
            .state
            .io
            .on('editorEmit', function (data) {
                // 如果服务器返回错误,提示刷新页面
                if (data.msg != undefined && data.msg.error != 0) {
                    // //console.log('出错',data); 错误,触发一次saveFile
                    _self.saveFile();
                    _self
                        .state
                        .vue
                        .$store
                        .commit('callModal', {
                            type: 'alert',
                            modalOver: true,
                            cls: 'danger',
                            text: '系统错误,请保存模板并刷新页面(错误代码:' + data.msg.msg + ')'
                        });

                    document.socketDebug = {
                        data: data,
                        docData: _self.state.vue.$store.state.docData
                    };
                }
                //查找在resuestList内的对象
                var requestObj = null;
                for (var i = 0; i < _self.state.requestList.length; i++) {

                    if (_self.state.requestList[i].requestId == data.requestId) {
                        //找到了!
                        requestObj = _self.state.requestList[i];
                        //将请求从列表内删除
                        _self
                            .state
                            .requestList
                            .splice(i, 1);
                        break;
                    }
                }

                if (data.callback == 'textToSvg') {
                    requestObj.func({
                        target: requestObj.target,
                        data: data.svg
                    });
                } else if (data.callback == 'templateInfo') {
                    //判断是否是非正式模板
                    if (data.msg.data.mode == '0') {
                        _self.state.tempTpl = true;
                    }
                    eventBus.$emit('socket_templateInfo', data.msg.data);
                } else {
                  //pageElements 页面相关
                    var itemData = data.msg.data;
                    eventBus.$emit('socket_' + data.callback, itemData);
                    if (requestObj.func != undefined) {
                        requestObj.func({
                            data: itemData
                        });
                    }
                }
            });
        //自动保存延时
        setInterval(function () {
            if (_socket.state.saveList.length > 0 && _socket.state.comitLock == false && _self.state.vue.$store.state.editor.autoSave && _self.state.tempTpl == false) {
                //console.info('开始自动保存');
                _socket.state.comitLock = true;
                _socket.commitAutoSaveItem();
            }
        }, 5000)
    },
    //数据更新
    editorEmit: function (action, data, func) {
        var sendData = data;
        sendData.action = action;

        var requestId = comm.getNewID();
        //将本次请求加入请求列表,等待返回
        this
            .state
            .requestList
            .push({
                requestId: requestId,
                data: sendData,
                target: null,
                //超时计数器,每秒遍历全部request,在这基础上+1,如果大于5,判定本次请求超时,终止编辑器操作
                timeTick: 0,
                func: func
            });
        sendData.requestId = requestId;
        try {
            this
                .state
                .io
                .compress(false)
                .emit('editorEmit', sendData);
            console.log('sendData');
            console.log(sendData);
        } catch (e) {
            //location.reload();
        }
    },
    //保存文件
    saveFile(func, noCheck) {
        // //console.log('saveChange', this.state.vue.$store.state.editor.saveChange);
        if (this.state.vue.$store.state.editor.saveChange || noCheck == true) {
            //遍历所有元素,搜索 {"svg":""}  如果发现,则返回假

            const textRequestList = this
                .state
                .requestList
                .filter((item) => {
                    return item == 'texttosvg';
                })
            // //console.log('textRequestList', textRequestList)
            if (textRequestList.length > 0) {
                if (window.confirm('您操作的太快啦,还有一些元素正在生成,在此时保存可能会丢失数据\n\n单击[确定]取消本次保存并请您稍后再试\n单击[取消]强制保存(可能会丢失数据)')) {
                    func();
                    return;
                }
            }
            var _self = this;
            //创建保存参数
            var docData = this.state.vue.$store.state.docData;
            //            //console.log(JSON.stringify(docData, null, 2));
            var pageArr = [];
            for (var i = 0; i < docData.page.length; i++) {
                var obj = {
                    tpl_id: docData.id,
                    id: docData.page[i].id,
                    edit_config: docData.page[i].edit_config,
                    index: i
                };
                if (docData.page[i].loaded) {
                    var elementsArr = [];
                    for (var el = 0; el < docData.page[i].data.length; el++) {
                        var elementObj = docData.page[i].data[el];
                        elementObj.index = el;
                        elementsArr.push(elementObj);
                    }
                    obj.elements = elementsArr;
                }
                pageArr.push(obj);
            }
            //将删除的页面加入pageArr让后台标记删除

            //替换edit_config下的singlePageConfig的换行
            let tplEditConfig = docData.edit_config;
            if (tplEditConfig.singlePageConfig != undefined) {
                tplEditConfig.singlePageConfig.title = tplEditConfig.singlePageConfig.title.replace(/\n/g, "");
                tplEditConfig.singlePageConfig.summary = tplEditConfig.singlePageConfig.summary.replace(/\n/g, "");
            }

            var params = {
                tpl_id: docData.id,
                uid: this.state.vue.$store.state.editor.uid,
                title: docData.title,
                edit_config: tplEditConfig,
                pages: pageArr
            };

            //发起保存请求
            this.editorEmit('templateSave', params, function (e) {
                if (func != undefined) {
                    func();
                }
                _self.state.vue.$store.state.editor.saveChange = false;
                // if (_self.state.saveList.length > 0) {     //_self.state.saveList = [];
                // //console.log('在这C');     //$('.save-state').fadeOut(); }

            });
        } else {
            // //console.info('上次保存后没有进行过更改,跳过保存,直接执行回调');
            if (func != undefined) {
                func();
            }
            if (_socket.state.saveList.length > 0) {
                _self.state.saveList = [];
                //console.log('在这D');
                $('.save-state').fadeOut();
            }
        }

    },

    //获取生成图片
    requestTemplateThumbnails(callback) {
        this.editorEmit('templateThumbnails', {}, function (e) {
            if (callback != undefined) {
                callback(e);
            }
        });
    },
    //提交到自动保存队列
    commit(name, event) {
        //转换为正式模板
        if (this.state.tempTpl) {

            this.saveFile(() => {
                //console.warn('已转换为正式模板')
                this.state.tempTpl = false;
            }, true);
        }
        if ((name == 'elementChange' || name == 'pageChange') && event.type == 'update' && event.commitType == undefined) {
           console.log('elementChange socket:');

            //获取参数的target文本
            var eventTargetStr = '';
            var targets = event.targets;

            if (targets != undefined) {
                for (var item in targets) {

                    eventTargetStr = eventTargetStr + '*' + targets[item].id;

                    console.log(eventTargetStr);
                }
            }
            console.log(this.state.saveList);

            var findTargets = false;
            for (var i = 0; i < this.state.saveList.length; i++) {
                var targets = this.state.saveList[i].event.targets;
                var type = this.state.saveList[i].event.type;
                if (type == 'update' && targets != undefined) {

                    var targetsStr = '';
                    for (var item in targets) {
                        targetsStr = targetsStr + '*' + targets[item].id;
                    }
                    //console.log('eventTargetStr', 'targetsStr');
                    if (eventTargetStr == targetsStr) {
                        //update事件重复,删除当前 i 位置的,然后添加新的
                        findTargets = true;
                        this
                            .state
                            .saveList
                            .splice(i, 1);
                        this
                            .state
                            .saveList
                            .splice(i, 0, {
                                //事件类型
                                name: name,
                                //事件数据
                                event: JSON.parse(JSON.stringify(event))
                            });
                    }
                }
            }
            if (findTargets == false) {
                this
                    .state
                    .saveList
                    .push({
                        //事件类型
                        name: name,
                        //事件数据
                        event: JSON.parse(JSON.stringify(event))
                    });
            }

        } else {
            this
                .state
                .saveList
                .push({
                    //事件类型
                    name: name,
                    //事件数据
                    event: JSON.parse(JSON.stringify(event))
                });
        }
        $('.save-state').fadeIn();
        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
            $('.save-state').text(this.state.saveList.length + ' 个操作未保存');
        }
    },
    //处理自动保存
    commitAutoSaveItem() {
      console.log('autoChange Commit');
        //获取自动保存队列
        var saveList = this.state.saveList;
        if (saveList.length > 0) {
            var event = saveList[0].event;
            var name = saveList[0].name;

            //console.warn('正在保存队列', event, name);
            if (name == 'elementChange') {
                if (event.type == 'add') {
                    //新增元素
                    var elements = [];
                    for (var i in event.targets) {
                        //获取当前元素的index
                        let index = this.getElementIndex(event.targets[i]);
                        //console.log('我的index', index);
                        elements.push({
                            id: event.targets[i].id,
                            type: event.targets[i].type,
                            edit_config: event.targets[i].edit_config,
                            edit_data: event.targets[i].edit_data,
                            index
                        });
                    }
                    var params = {
                        uid: this.state.vue.$store.state.editor.uid,
                        tpl_id: this.state.vue.$store.state.docData.id,
                        page_id: event.targets[0].page_id,
                        elements: elements
                    };
                    this.editorEmit('elementCreate', params, function () {
                        saveList.splice(0, 1);
                        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                            $('.save-state').text(saveList.length + ' 个操作未保存');
                        }
                        _socket.commitAutoSaveItem();
                    });
                } else if (event.type == 'update') {
                    //更新元素
                    var elements = [];
                    for (var i in event.targets) {
                        let index = this.getElementIndex(event.targets[i]);
                        var obj = {
                            id: event.targets[i].id,
                            type: event.targets[i].type,
                            edit_config: event.targets[i].edit_config,
                            edit_data: event.targets[i].edit_data,
                            index
                        };
                        if (event.commitType == 'onlyIndex') {
                            //console.log('只提交Index');
                            delete obj.edit_config;
                            delete obj.edit_data;
                        }
                        elements.push(obj);
                    }
                    var params = {
                        uid: this.state.vue.$store.state.editor.uid,
                        tpl_id: this.state.vue.$store.state.docData.id,
                        page_id: event.targets[0].page_id,
                        elements: elements
                    };
                    this.editorEmit('elementSave', params, function () {
                        saveList.splice(0, 1);
                        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                            $('.save-state').text(saveList.length + ' 个操作未保存');
                        }
                        _socket.commitAutoSaveItem();
                    });
                } else if (event.type == 'remove') {
                    //删除元素
                    var ids = [];
                    for (var i in event.targets) {
                        ids.push(event.targets[i].id);
                    }
                    var params = {
                        uid: this.state.vue.$store.state.editor.uid,
                        tpl_id: this.state.vue.$store.state.docData.id,
                        page_id: event.targets[0].page_id,
                        ids: ids
                    };
                    this.editorEmit('elementRemove', params, function () {
                        saveList.splice(0, 1);
                        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                            $('.save-state').text(saveList.length + ' 个操作未保存');
                        }
                        _socket.commitAutoSaveItem();
                    });
                }
            } else if (name == 'pageChange') {
                if (event.type == 'add') {
                    //新增页面
                    var params = {
                        uid: this.state.vue.$store.state.editor.uid,
                        tpl_id: this.state.vue.$store.state.docData.id,
                        index: event.targets[0].index,
                        edit_config: event.targets[0].edit_config,
                        page_id: event.targets[0].id
                    };
                    var _self = this;

                    this.editorEmit('pageCreate', params, function (e) {
                        // 查找oldID对应的页.更改为新的ID,并遍历当前页,改成新的pageID

                        saveList.splice(0, 1);
                        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                            $('.save-state').text(saveList.length + ' 个操作未保存');
                        }
                        _socket.commitAutoSaveItem();
                    });
                } else if (event.type == 'update') {
                    //更新页面
                    var pages = [];
                    for (var i in event.targets) {
                        pages.push({
                            id: event.targets[i].id,
                            edit_config: event.targets[i].edit_config,
                            index: event.targets[i].index
                        })
                    }
                    var params = {
                        uid: this.state.vue.$store.state.editor.uid,
                        tpl_id: this.state.vue.$store.state.docData.id,
                        pages: pages
                    };
                    this.editorEmit('pageSave', params, function () {
                        saveList.splice(0, 1);
                        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                            $('.save-state').text(saveList.length + ' 个操作未保存');
                        }
                        _socket.commitAutoSaveItem();
                    });
                } else if (event.type == 'remove') {
                    //删除页面
                    var ids = [];
                    //console.log('event', event)
                    for (var i = 0; i < event.targets.length; i++) {
                        ids.push(event.targets[i].id)
                    }
                    var params = {
                        uid: this.state.vue.$store.state.editor.uid,
                        tpl_id: this.state.vue.$store.state.docData.id,
                        ids: ids
                    };
                    this.editorEmit('pageRemove', params, function () {
                        saveList.splice(0, 1);
                        if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                            $('.save-state').text(saveList.length + ' 个操作未保存');
                        }
                        _socket.commitAutoSaveItem();
                    });
                }
            } else if (name == 'infoChange') {
                var params = {
                    uid: this.state.vue.$store.state.editor.uid,
                    tpl_id: this.state.vue.$store.state.docData.id,
                    title: this.state.vue.$store.state.docData.title,
                    edit_config: this.state.vue.$store.state.docData.edit_config
                };
                this.editorEmit('templateSave', params, function () {
                    saveList.splice(0, 1);
                    if ($('.save-state').text() != '网络不稳定,请尝试保存模板') {
                        $('.save-state').text(saveList.length + ' 个操作未保存');
                    }
                    _socket.commitAutoSaveItem();
                });
            }
        } else {
            //console.warn('所有元素/页面已保存完毕');
            $('.save-state').text('所有操作已保存');
            setTimeout(function () {
                if (saveList.length == 0) {
                    //console.log('在这A');
                    $('.save-state').fadeOut();
                }
            }, 3000)
            this.state.comitLock = false;
        }
    },
    //获取元素的index索引
    getElementIndex(element) {
        let page = this.state.vue.$store.state.docData.page;
        for (let pageIndex in page) {
            for (let elementIndex in page[pageIndex].data) {
                if (page[pageIndex].data[elementIndex].id == element.id) {
                    return elementIndex;
                }
            }
        }
        return -1;
    },
    //转换文字为svg
    textToSvg: function (data, target, func) {
        //获取本次请求的ID
        var requestId = comm.getNewID();
        //将本次请求加入请求列表,等待返回
        this
            .state
            .requestList
            .push({
                requestId: requestId,
                data: 'texttosvg',
                target: target,
                func: func
            });
        //向服务器发送请求
        try {
            this
                .state
                .io
                .compress(false)
                .emit('textToSvg', {
                    requestId: requestId,
                    textData: data
                });
        } catch (e) {
            //location.reload();
        }
    }
};
var _socket=socket;
export default socket;


