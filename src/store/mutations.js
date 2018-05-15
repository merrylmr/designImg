import $ from "jquery";
import eventBus from "@/common/eventBus.js";
import common from '@/common/common.js';

export default{
  setProduct(state, val) {
    state.docData.product = val;
  },
  //提交主题色
  themeColor(state, payload) {
    state.editor = {
      ...state.editor,
      ...payload
    };
  },
  //提交color蔟
  initColor(state, payload) {
    state.editor.color = payload
  },
  //更改docData
  setDocData(state, val) {
    state.docData = val;
  },
  //添加新页面
  addpage(state, val) {
    state
      .docData
      .page
      .push(val);
  },

  delPage(state, index) {
    state
      .docData
      .page
      .splice(index, 1)
  },
  copyPage(state, val) {
    state
      .docData
      .page
      .splice(val.index, 0, val.page)
  },
  //设置当前stage的鼠标状态
  setStageMouse(state, val) {
    for (var item in val) {
      state.stage.mouse[val[item].name] = val[item].val;
    }
  },
  //设置正在被单选的元素
  setSelected(state, val) {
    state.stage.selected = val;
  },
  //设置选择框的相关参数
  setSelectionBox(state, val) {
    for (var item in val) {
      state.stage.selectionBox[val[item].name] = val[item].val;
    }
  },
  //设置用户桌面显示的DPI
  setUserDPI(state, val) {
    state.editor.userDPI = val;
    state.docData.edit_config.userDPI = val;

  },
  //更新当前正在被单选的元素
  setselectedItem(state, val) {
    state.stage.selectedItem = val;
  },
  //更新多选选择框相关属性
  setSelectedItems(state, val) {
    if (val.items != undefined) {
      state.selectedItems.items = val.items
    }
    if (val.left != undefined) {
      state.selectedItems.left = val.left
    }
    if (val.top != undefined) {
      state.selectedItems.top = val.top
    }
    if (val.width != undefined) {
      state.selectedItems.width = val.width
    }
    if (val.height != undefined) {
      state.selectedItems.height = val.height
    }
  },
  //打开关闭左侧资源列表
  setSourceOpen(state) {
    state.editor.isSourceOpen = !state.editor.isSourceOpen;
  },
  //打开关闭左侧资源列表
  setPageOpen(state) {
    state.editor.isPageOpen = !state.editor.isPageOpen;
  },
  setConfigOpen(state, val) {
    state.editor.isConfigOpen = val;
  },
  //设置当前正在编辑的页
  setNowEditPage(state, val) {
    state.docData.editor.nowPage = val;
  },
  //添加元素到当前页,elementObj
  addElementToStage(state, val) {
    if (val.isBackground == false) {
      //普通元素
      state
        .docData
        .page[state.docData.editor.nowPage]
        .data
        .push(val.obj);
    } else {
      //删除旧的
      var oldBgID = state.docData.page[state.docData.editor.nowPage].edit_config.backgroundID;
      var data = state.docData.page[state.docData.editor.nowPage].data;
      for (var i = 0; i < data.length; i++) {
        if (data[i].id == oldBgID) {
          eventBus.$emit('elementChange', {
            type: 'remove',
            targets: [state.docData.page[state.docData.editor.nowPage].data[i]],
            step: false
          });
          state
            .docData
            .page[state.docData.editor.nowPage]
            .data
            .splice(i, 1);
          break;
        }
      }
      state.docData.page[state.docData.editor.nowPage].edit_config.backgroundID = val.obj.id;

      //添加新背景
      state
        .docData
        .page[state.docData.editor.nowPage]
        .data
        .unshift(val.obj);
    }
    //刷新当前页面index
    var nowPageData = state.docData.page[state.docData.editor.nowPage].data;
    for (var i = 0; i < nowPageData.length; i++) {
      nowPageData.index = i;
    }
    // if(val.isBackground){ 	//提交本页面所有的元素数据,更新他们的index 	var tempPageData =
    // JSON.parse(JSON.stringify(nowPageData)); 	var tempArr = [];
    //
    // 	for(var i =0;i<tempPageData.length;i++){ 		delete tempPageData.edit_config;
    // 		delete tempPageData.edit_data; 	} 	var params = { 		elements:tempArr,
    // 		tpl_id:state.docData.id, 		uid:0 	};
    // 	socket.editorEmit('elementSave',params); }
  },
  //添加最近使用的颜色
  addUsedColor(state, val) {
    //判断是否存在改颜色
    var searched = false;

    var colorArr = state.docData.edit_config.usedColor;
    //	console.log('colorArr',colorArr);
    for (var i = 0; i < colorArr.length; i++) {
      if (colorArr[i].toLowerCase() == val.toLowerCase()) {
        searched = true;
        break;
      }
    }
    if (searched == false) {
      state
        .docData
        .edit_config
        .usedColor
        .splice(0, 0, val.toLowerCase());
      //eventBus.$emit('stageChange','info');
      eventBus.$emit('infoChange', {
        type: 'usedColor'
      });
    }
  },
  //添加最近使用的背景颜色
  addUsedBgColor(state, val) {
    //判断是否存在改颜色
    var searched = false;
    var colorArr = state.docData.edit_config.usedBgColor;
    for (var i = 0; i < colorArr.length; i++) {
      if (colorArr[i].toLowerCase() == val.toLowerCase()) {
        searched = true;
        break;
      }
    }
    if (searched == false) {
      state
        .docData
        .edit_config
        .usedBgColor
        .splice(0, 0, val.toLowerCase());
      //eventBus.$emit('stageChange','info');
      eventBus.$emit('infoChange', {
        type: 'usedColor'
      });
    }

  },
  //设置待复制数据
  setCopyData(state, copyArr) {
    //深复制(粘贴的时候注意转换回obj)

    state.stage.copyData = copyArr;
  },
  //建立文档快照(用于撤销)
  addDocSnap(state, data) {
    //创建最近两次的快照
    state
      .stage
      .docSnap2
      .push(JSON.parse(JSON.stringify(state.docData)));
    if (state.stage.docSnap2.length > 2) {
      state
        .stage
        .docSnap2
        .splice(0, 1);
    }
    //如果当前的指针不是length-1,则删除从当前的index开始往后的所有步骤
    if (state.stage.docSnap.length > 0 && state.stage.docSnap.length - 1 != state.stage.docSnapIndex) {
      //计算需要执行删除的次数
      var removeNum = (state.stage.docSnap.length - 1) - state.stage.docSnapIndex;
      for (var i = 0; i < removeNum; i++) {
        state
          .stage
          .docSnap
          .splice(state.stage.docSnapIndex + 1, 1);
      }
    }
    if (data.step == undefined) {
      data.step = true;
    }

    //添加记录
    if (data.name == 'elementChange') {
      //创建元素更新快照
      var targetsSnap = [];
      for (var i in data.targets) {
        //获取更新后的元素数据
        var newData = data.targets[i];
        //获取更新前的元素数据(在docSnap2[0]查找该元素的上一次的数据)
        var oldData = null;
        for (var p in state.stage.docSnap2[0].page) {
          if (newData.page_id == state.stage.docSnap2[0].page[p].id) {
            for (var e in state.stage.docSnap2[0].page[p].data) {
              if (newData.id == state.stage.docSnap2[0].page[p].data[e].id) {
                oldData = JSON.parse(JSON.stringify(state.stage.docSnap2[0].page[p].data[e]));
                break;
              }
            }
          }
        }

        targetsSnap.push({
          newData: JSON.stringify(newData),
          oldData: JSON.stringify(oldData)
        })

      }
      //获取更新后的页面ID列表
      var newList = [];
      var pageData = state.docData.page[state.docData.editor.nowPage].data
      for (var p in pageData) {
        newList.push(pageData[p].id);
      }
      var oldList = [];
      var pageData = state.stage.docSnap2[0].page[state.stage.docSnap2[0].editor.nowPage].data
      for (var p in pageData) {
        oldList.push(pageData[p].id);
      }

      var snapItem = {
        name: data.name,
        type: data.type,
        step: data.step,
        targets: targetsSnap,
        newList: newList,
        oldList: oldList,
        // oldState:JSON.stringify(state.stage.docSnap2[0].editor),
        // newState:JSON.stringify(state.docData.editor)
      };
      state
        .stage
        .docSnap
        .push(snapItem);

    } else if (data.name == 'pageChange') {
      //创建元素更新快照
      var targetsSnap = [];
      for (var i in data.targets) {
        //获取更新后的元素数据
        var newData = JSON.parse(JSON.stringify(data.targets[i]));
        //					console.log('newData',newData); 获取更新前的元素数据(在docSnap2[0]查找该元素的上一次的数据)
        var oldData = null;

        for (var p = 0; p < state.stage.docSnap2[0].page.length; p++) {

          if (newData.id == state.stage.docSnap2[0].page[p].id) {
            oldData = JSON.parse(JSON.stringify(state.stage.docSnap2[0].page[p]));
          }
        }
        // console.log('***newData', newData, 'oldData', oldData, 'docSnap',
        // state.stage.docSnap2[0].page);

        targetsSnap.push({
          newData: JSON.stringify(newData),
          oldData: JSON.stringify(oldData)
        })
      }
      //获取更新后的页面ID列表
      var newList = [];
      var pageData = state.docData.page;
      for (var p in pageData) {
        newList.push(pageData[p].id);
      }
      var oldList = [];
      var pageData = state.stage.docSnap2[0].page;
      for (var p in pageData) {
        oldList.push(pageData[p].id);
      }
      var snapItem = {
        name: data.name,
        type: data.type,
        step: data.step,
        targets: targetsSnap,
        newList: newList,
        oldList: oldList,
        // oldState:JSON.stringify(state.stage.docSnap2[0].editor),
        // newState:JSON.stringify(state.docData.editor)
      };
      state
        .stage
        .docSnap
        .push(snapItem);

    } else if (data.name == 'stateChange') {
      if (data.type == 'ready') {
        //获取更新后的页面ID列表
        var newList = [];
        var pageData = state.docData.page[state.docData.editor.nowPage].data
        for (var p in pageData) {
          newList.push(pageData[p].id);
        }
        //获取page页面列表
        var pageList = [];
        for (var p in state.docData.page) {
          pageList.push(state.docData.page[p].id);
        }
        state
          .stage
          .docSnap
          .push({
            name: 'head',
            data: {
              pageList: pageList,
              elements: newList
            },
            step: true
          });
      } else if (data.type == 'loadPage') {
        state
          .stage
          .docSnap
          .push({
            name: data.name,
            type: data.type,
            oldIndex: data.data,
            newIndex: state.stage.docSnap2[0].editor.nowPage,
            step: data.step
          });
      }

    } else if (data.name == 'infoChange') {
      state
        .stage
        .docSnap
        .push({
          name: data.name,
          step: data.step,
          newData: JSON.stringify({
            edit_config: state.docData.edit_config,
            title: state.docData.title
          }),
          oldData: JSON.stringify({
            edit_config: state.stage.docSnap2[0].edit_config,
            title: state.stage.docSnap2[0].title
          })
        });
    }

    //只保留最近30次的操作记录
    if (state.stage.docSnap.length > 30) {
      state
        .stage
        .docSnap
        .splice(0, 1);
    }
    //将指针移动到最后一次
    state.stage.docSnapIndex = state.stage.docSnap.length - 1;
    // 			console.log('docSnap',state.stage.docSnap,'docSnapIndex',state.stage.docSn
    // a pIndex );

  },
  //撤销
  undo(state) {
    //取消所有选择
    state.stage.selectedItem = null;
    state.stage.selectionBox.items = [];

    let undoStep = true;
    while (undoStep) {

      undoStep = undoAction();
    }

    function undoAction() {
      //执行撤销
      if (state.stage.docSnapIndex > 0) {
        var snapItem = state.stage.docSnap[state.stage.docSnapIndex];
        console.log('撤销', snapItem);
        var eventTargets = [];
        var eventType = '';
        if (snapItem.name == "elementChange") {
          //遍历目标
          var pageIndex=-1;
          for (var i = 0; i < snapItem.targets.length; i++) {

            //获取快照内的元素对象
            var snapTarget = snapItem.targets[i];
            //获取该元素在docData内的引用
            var target = null;
            var targetIndex = -1;
            var newData = JSON.parse(snapTarget.newData);

            // pageIndex = -1;

            for (var p = 0; p < state.docData.page.length; p++) {
              for (var e = 0; e < state.docData.page[p].data.length; e++) {

                if (newData.id == state.docData.page[p].data[e].id) {
                  target = state.docData.page[p].data[e];
                  targetIndex = e;
                  pageIndex = p;
                  break;
                }
              }
            }

            if (snapItem.type == 'add') {

              eventTargets.push(state.docData.page[pageIndex].data[targetIndex]);
              state
                .docData
                .page[pageIndex]
                .data
                .splice(targetIndex, 1);

              for (var a = 0; a < state.docData.page[pageIndex].data.length; a++) {
                state.docData.page[pageIndex].data[a].index = a;
              }
              eventBus.$emit('updateItemHtml', target);

              eventType = 'remove';
            } else if (snapItem.type == 'remove') {

              console.log('恢复target', snapItem, newData, pageIndex);

              state
                .docData
                .page[pageIndex]
                .data
                .push(newData);
              for (var a = 0; a < state.docData.page[pageIndex].data.length; a++) {
                state.docData.page[pageIndex].data[a].index = a;
              }
              eventBus.$emit('updateItemHtml', newData)
              eventTargets.push(newData);
              eventType = 'add';
            } else if (snapItem.type == 'update') {
              var oldData = JSON.parse(snapTarget.oldData);
              if (target == null) {
                console.error('出现错误,target没有找到', snapTarget);
              }
              target.edit_config = oldData.edit_config;
              target.edit_data = oldData.edit_data;

              //							console.log('设置',target.id,'edit_config',oldData.edit_config);
              eventBus.$emit('updateItemHtml', target)
              eventTargets.push(target);
              eventType = 'update';
              for (var a = 0; a < state.docData.page[pageIndex].data.length; a++) {
                state.docData.page[pageIndex].data[a].index = a;
              }
            }

          }
          //state.docData.editor = JSON.parse(snapTarget.oldState); 发送事件
          eventBus.$emit('elementChange', {
            type: eventType,
            targets: eventTargets,
            snap: false
          });
          state.docData.page[pageIndex].data = common.sortArrayByList(state.docData.page[pageIndex].data, snapItem.oldList);
        } else if (snapItem.name == "pageChange") {
          //遍历目标
          var targetIndex = -1;
          var eventTargets = [];
          var eventType = '';
          for (var i = 0; i < snapItem.targets.length; i++) {
            //获取快照内的元素对象
            var snapTarget = snapItem.targets[i];
            //获取该元素在docData内的引用
            var target = null;

            var newData = JSON.parse(snapTarget.newData);

            console.log('准备搜索页面对象', state.docData.page);
            for (var p = 0; p < state.docData.page.length; p++) {
              console.log('   我要找的ID', newData.id);
              console.log('   当前页面ID', );
              if (newData.id == state.docData.page[p].id || newData.id == state.docData.page[p].front_id) {
                target = state.docData.page[p];
                targetIndex = p
                break;
              }
            }
            if (snapItem.type == 'add') {

              eventTargets.push(state.docData.page[targetIndex]);

              state
                .docData
                .page
                .splice(targetIndex, 1);

              eventType = 'remove';
            } else if (snapItem.type == 'remove') {

              state
                .docData
                .page
                .push(newData);
              eventTargets.push(newData);
              eventType = 'add';
            } else if (snapItem.type == 'update') {
              console.log
              var oldData = JSON.parse(snapTarget.oldData);
              target = oldData;
              eventTargets.push(target);
              eventType = 'update';
            }
          }

          state.docData.page = common.sortArrayByList(state.docData.page, snapItem.oldList);

          eventBus.$emit('pageChange', {
            type: eventType,
            targets: eventTargets,
            snap: false
          });
        } else if (snapItem.name == "infoChange") {
          state.docData.edit_config = JSON
            .parse(snapItem.oldData)
            .edit_config
          state.docData.title = JSON
            .parse(snapItem.oldData)
            .title
        } else if (snapItem.name == "stateChange") {
          if (snapItem.type == 'loadPage') {
            state.docData.editor.nowPage = snapItem.newIndex;
          }
        }

        state.stage.docSnapIndex = state.stage.docSnapIndex - 1;
        //指针移动完成,判断step是否为false,如果为false,返回true,以便于继续进行撤销
        if (state.stage.docSnap[state.stage.docSnapIndex].step == false) {
          return true;
        }

      }
      return false;
    }
  },
  //恢复
  redo(state) {
    //取消所有选择
    state.stage.selectedItem = null;
    state.stage.selectionBox.items = [];

    let redoStep = redoAction();
    while (redoStep) {

      redoStep = redoAction();
    }

    function redoAction() {

      //执行撤销
      if (state.stage.docSnapIndex < state.stage.docSnap.length - 1) {
        state.stage.docSnapIndex = state.stage.docSnapIndex + 1;
        var snapItem = state.stage.docSnap[state.stage.docSnapIndex];
        console.log('恢复', snapItem);
        if (snapItem.name == "elementChange") {
          var eventTargets = [];
          var eventType = '';
          //遍历目标
          var pageIndex
          for (var i in snapItem.targets) {
            //获取快照内的元素对象
            var snapTarget = snapItem.targets[i];
            //获取该元素在docData内的引用
            var target = null;
            var targetIndex = -1;
            pageIndex = -1;
            for (var p in state.docData.page) {
              var newData = JSON.parse(snapTarget.newData);
              if (newData.page_id == state.docData.page[p].id) {
                pageIndex = p;
                for (var e in state.docData.page[p].data) {
                  if (newData.id == state.docData.page[p].data[e].id) {
                    target = state.docData.page[p].data[e];
                    targetIndex = e;
                    break;
                  }
                }
              }
            }
            var newData = JSON.parse(snapTarget.newData);
            if (snapItem.type == 'add') {
              state
                .docData
                .page[pageIndex]
                .data
                .push(newData);
              for (var a = 0; a < state.docData.page[pageIndex].data.length; a++) {
                state.docData.page[pageIndex].data[a].index = a;
              }
              eventBus.$emit('updateItemHtml', newData)
              eventTargets.push(newData);

              eventType = 'add';
            } else if (snapItem.type == 'remove') {
              eventTargets.push(state.docData.page[pageIndex].data[targetIndex]);
              eventType = 'remove';
              state
                .docData
                .page[pageIndex]
                .data
                .splice(targetIndex, 1);
              for (var a = 0; a < state.docData.page[pageIndex].data.length; a++) {
                state.docData.page[pageIndex].data[a].index = a;
              }
              eventBus.$emit('updateItemHtml', target)

            } else if (snapItem.type == 'update') {

              target.edit_config = newData.edit_config;
              target.edit_data = newData.edit_data;
              for (var a = 0; a < state.docData.page[pageIndex].data.length; a++) {
                state.docData.page[pageIndex].data[a].index = a;
              }
              eventBus.$emit('updateItemHtml', target)

              eventTargets.push(target);
              eventType = 'update';
            }
          }
          eventBus.$emit('elementChange', {
            type: eventType,
            targets: eventTargets,
            snap: false
          });

          state.docData.page[pageIndex].data = common.sortArrayByList(state.docData.page[pageIndex].data, snapItem.newList);
          //state.docData.editor = JSON.parse(snapTarget.newState);
        } else if (snapItem.name == "pageChange") {
          //遍历目标
          var pageIndex
          var eventTargets = [];
          var eventType = '';
          for (var i in snapItem.targets) {
            //获取快照内的元素对象
            var snapTarget = snapItem.targets[i];
            //获取该元素在docData内的引用
            var target = null;
            var targetIndex = -1;
            var newData = JSON.parse(snapTarget.newData);
            for (var p in state.docData.page) {

              if (newData.id == state.docData.page[p].id) {
                target = state.docData.page[p];
                targetIndex = p;
              }
            }
            if (snapItem.type == 'add') {
              var newData = JSON.parse(snapTarget.newData);
              state
                .docData
                .page
                .push(newData);
              eventTargets.push(newData);
              eventType = 'add';
            } else if (snapItem.type == 'remove') {
              eventTargets.push(state.docData.page[targetIndex]);
              eventType = 'remove';
              state
                .docData
                .page
                .splice(targetIndex, 1);
            } else if (snapItem.type == 'update') {
              var newData = JSON.parse(snapTarget.newData);
              target = newData;
              eventTargets.push(target);
              eventType = 'update';
            }
          }
          //state.docData.editor = JSON.parse(snapTarget.newState);
          state.docData.page = common.sortArrayByList(state.docData.page, snapItem.newList);
          eventBus.$emit('pageChange', {
            type: eventType,
            targets: eventTargets,
            snap: false
          });
        } else if (snapItem.name == "infoChange") {
          state.docData.edit_config = JSON
            .parse(snapItem.newData)
            .edit_config
          state.docData.title = JSON
            .parse(snapItem.newData)
            .title
        } else if (snapItem.name == "stateChange") {
          if (snapItem.type == 'loadPage') {

            state.docData.editor.nowPage = snapItem.oldIndex;
          }
        }
        //在当前docSnap上+1,判断step
        return !snapItem.step;
      } else {
        return false;
      }

    }
  },
  //修改缩放比例
  setZoom(state, val) {

    eventBus.$emit('stopAllEdit');

    //eventBus.$emit('stageChange','zoom');???
    if (val.type == 'zoomIn') {
      //放大
      state.stage.zoom = state.stage.zoom + 5 - state.stage.zoom % 5;
      if (state.stage.zoom > 500) {
        state.stage.zoom = 500;
      }
    } else if (val.type == 'zoomOut') {
      //缩小
      if (state.stage.zoom % 5) {
        state.stage.zoom = state.stage.zoom - state.stage.zoom % 5;
      } else {
        state.stage.zoom = state.stage.zoom - 5;
      }
      if (state.stage.zoom < 5) {
        state.stage.zoom = 5;
      }
    } else if (val.type == 'normal') {
      //100%缩放
      state.stage.zoom = 100;
    } else if (val.type == 'custom') {
      //自定义缩放值(相对于舞台尺寸)
      var stageSize = {
        width: 0,
        height: 0
      };
      if (state.docData.edit_config.unit == "px") {
        //像素
        stageSize.width = state.docData.edit_config.width;
        stageSize.height = state.docData.edit_config.height;
      } else if (state.docData.edit_config.unit == "mm") {
        //毫米
        stageSize.width = (state.docData.edit_config.width * state.docData.edit_config.dpi / 25.4);
        stageSize.height = (state.docData.edit_config.height * state.docData.edit_config.dpi / 25.4);
      }
      //全画布平铺
      var areaWidth = parseFloat($('#stageArea').width());
      var areaHeight = parseFloat($('#stageArea').height());

      var zoomA = (areaWidth / stageSize.width);
      var zoomB = (areaHeight / stageSize.height);
      var zoom=Math.min(zoomA,zoomB);

      state.stage.zoom = parseInt(zoom * val.val);
    } else if (val.type == 'canvas_custom') {
      //相对于画布的原生缩放
      state.stage.zoom = val.val;
      console.log('相对于画布的原生缩放23333', val.val);
    }
    val.zoomType && (state.stage.zoomType = val.zoomType);
    eventBus.$emit('stateChange', {
      type: 'zoom'
    });
  },
  //设置文档尺寸,并自动缩放
  setDocSize(state, payload) {

    state.docData.edit_config = {
      ...state.docData.edit_config,
      ...payload
    }
    /*//计算新宽度和高度差别比例
     var zoomX = val.width / oldWidth;
     var zoomY = val.height / oldHeight;

     console.log('宽度:',val.width,'高度:',val.height);
     //修改left top width height rotateX rotateY
     var pageData = state.docData.page;
     for(var i = 0;i<pageData.length;i++){
     for(var a = 0;a<pageData[i].data.length;a++){
     var eleObj = pageData[i].data[a];
     eleObj.left = eleObj.left*zoomX;
     eleObj.top = eleObj.top*zoomY;
     eleObj.width = eleObj.width*zoomX;
     eleObj.height = eleObj.height*zoomY;
     eleObj.rotateX = eleObj.rotateX*zoomX;
     eleObj.rotateY = eleObj.rotateY*zoomY;
     }
     }
     state.docData.page = pageData;*/
    //eventBus.$emit('stageChange','stageResize');
    eventBus.$emit('infoChange', {
      type: 'stageSize'
    });
  },
  //更新当前页面的svg
  setNowPageSvg(state, val) {
    state.docData.page[state.docData.editor.nowPage].svg = val;
  },
  //设置文档文件名
  setDocTitle(state, val) {
    state.docData.title = val;
    //eventBus.$emit('stageChange','info');
    eventBus.$emit('infoChange', {
      type: 'title'
    });
  },
  /*请求模态框
   *不带参数，请求关闭模态框
   *必要参数type（模态框类型）,modalOver（是否需要全屏）
   *如果type==alert,则需要参数cls(消息框图标)和text（消息框内容）
   */
  callModal(state, data) {
    if (data == undefined) {
      for (var i in state.editor.modal) {
        state.editor.modal[i] = false;
      }
      state.editor.modalOver = false;

    } else {
      state.editor.modal[data.type] = true;
      state.editor.modalOver = data.modalOver;
      if (data.type == 'alert') {
        state.editor.modalInfo.cls = data.cls;
        state.editor.modalInfo.text = data.text;
        state.editor.modalInfo.fn = data.fn;
        state.editor.modalInfo.fx = data.fx;
      }
      if (data.notAlert) {
        state.editor.modalIsAlert = false;
      }
    }
  },
  setNowEditText(state, data) {
    state.editor.nowEditText = data;
  },
  setNowEditTable(state, data) {
    state.editor.nowEditTable = data;
  },
  setNowEditGroupText(state, data) {
    state.editor.nowEditGroupText = data;
  },
  //更新page的index
  updatePageIndex(state) {
    for (var i = 0; i < state.docData.page.length; i++) {
      if (state.docData.page[i] != undefined) {
        //更新index
        state.docData.page[i].index = i;
        //更新tpl_id
        state.docData.page.tpl_id = state.docData.id;
      }
    }
  }
}

