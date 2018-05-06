<template>
	<div class="page-box" v-if="showPageList" :style="{marginRight:(isPageOpen?'0':'-154px'),}">
		<span :class="['close',{'turnoff':!isPageOpen}]" @click="tooglePage"></span>
		<div class="title">
			<i class="tbzico ico-epage"></i>页面</div>
		<div class="scroll-list">
			<div class="pageThumb" v-for="(page,index) in pagelist" :id="page.id" :ref="'thumb'+index" :data-update="page.thumbnail==undefined?'':page.thumbnail" :class="{'active':index==getNowPageIndex}" :style="getThumbBoxStyle(index)" @mousedown="startDrag(index)" :key="page.id">
				<div class="thumbnail" v-html="getThumbnail(page)" :style="{color:color.bgColor,backgroundColor: page.edit_config.backgroundColor }"></div>
				<span class="ico-opt copy" @click.stop="copyPage(index)" v-if="pageAddAble">复制</span>
				<span class="ico-opt del" @click.stop="delPage(index)" v-if="pageAddAble">删除</span>
				<hr v-show="toIndex==index && dragIndex!=index" />
			</div>
		</div>
		<a class="add-page" :style="{color:color.fontColor,background:color.bgColor}" href="javascript:;" v-if="pageAddable" @click="addNewPage">
			<i class="tbzico ico-eaddpage"></i>新建页面</a>
	</div>
</template>
<script>
import $ from "jquery";
import socket from "@/common/socket.js";
import eventBus from "@/common/eventBus.js";
import common from "@/common/common.js";
export default {
  data() {
    return {
      //正在拖动的index
      dragIndex: -1,
      //当前位置对应的index
      toIndex: -1,
      downY: 0,
      mouse: {
        x: 0,
        y: 0
      },
      moveStart: false,
      //开始拖动页面前,记录当前所有页面snap
      pageSnap: ""
    };
  },
  computed: {
    showPageList() {
      return (
        this.$store.state.editor.tplLoaded &&
        this.$store.state.docData.product != "jianye"
      );
    },
    color() {
      return this.$store.state.editor.color;
    },
    thumbHeight() {
      //获取舞台宽高
      var stageSize = {
        width: 0,
        height: 0
      };
      if (this.$store.state.docData.edit_config.unit == "px") {
        //像素
        stageSize.width = this.$store.state.docData.edit_config.width;
        stageSize.height = this.$store.state.docData.edit_config.height;
      } else if (this.$store.state.docData.edit_config.unit == "mm") {
        //毫米
        stageSize.width =
          this.$store.state.docData.edit_config.width *
          this.$store.state.docData.edit_config.dpi /
          25.4;
        stageSize.height =
          this.$store.state.docData.edit_config.height *
          this.$store.state.docData.edit_config.dpi /
          25.4;
      }
      var zoom = 133 / stageSize.width;
      return stageSize.height * zoom + 15;
    },
    isPageOpen() {
      return this.$store.state.editor.isPageOpen;
    },
    //获取mouse状态
    tplLoaded() {
      return this.$store.state.editor.tplLoaded;
    },
    //获取mouse状态
    getMouse() {
      return this.$store.state.stage.mouse;
    },
    //是否自动保存
    autoSave() {
      return this.$store.state.editor.autoSave;
    },
    //是否允许增加(复制,删除)页面
    pageAddAble() {
      return this.$store.state.docData.edit_config.pageAddable;
    },

    pagelist() {
      return this.$store.state.docData.page;
    },
    getNowPageIndex() {
      return this.$store.state.docData.editor.nowPage;
    },
    pageAddable() {
      return this.$store.state.docData.edit_config.pageAddable;
    },
    //获取舞台宽高(真实宽高,没有经过zoom计算)
    getStageSize() {
      if (this.$store.state.docData.edit_config.unit == "px") {
        return {
          width: this.$store.state.docData.edit_config.width,
          height: this.$store.state.docData.edit_config.height
        };
      } else if (this.$store.state.docData.edit_config.unit == "mm") {
        return {
          width:
            this.$store.state.docData.edit_config.width *
            this.$store.state.docData.edit_config.dpi /
            25.4,
          height:
            this.$store.state.docData.edit_config.height *
            this.$store.state.docData.edit_config.dpi /
            25.4
        };
      }
    }
  },
  methods: {
    tooglePage() {
      this.$store.commit("setPageOpen");
    },
    startDrag(index) {
      if ($(event.target).hasClass("pageThumb")) {
        this.downY =
          this.mouse.y -
          this.$refs["thumb" + index][0].getBoundingClientRect().top;
        this.dragIndex = index;
        this.pageSnap = JSON.stringify(this.pagelist);
      }
    },
    getThumbBoxStyle(index) {
      var styleObj = {};
      if (index == this.dragIndex && this.moveStart) {
        var scrollTop = $(".scroll-list").scrollTop();
        //console.log(scrollTop);
        styleObj.top =
          this.mouse.y + scrollTop - 57 - 70 - this.downY + 12 + "px";
        styleObj.zIndex = 100000;
        styleObj.opacity = 0.5;
        styleObj.boxShadow = "0px 5px 10px #000";
        styleObj.transform = "scale(1.1)";
        styleObj.transition = "transform 0.1s";
      } else {
        styleObj.top = index * this.thumbHeight + 12 + "px";
        styleObj.transition = "all 0.3s";
      }
      if (this.dragIndex != -1) {
        styleObj.cursor = "-webkit-grabbing";
      }
      return styleObj;
    },
    addNewPage() {
      var _self = this;
      /*if(this.autoSave){
				var params = {
					tpl_id:this.$store.state.docData.id,
					uid:this.$store.state.editor.uid,
					edit_config:{
						backgroundID:'',
						backgroundColor:'#FFFFFF',
						customBackgroundUrl:''
					},
				};
				socket.editorEmit('pageCreate',params,function(e){
					//console.warn('创建页面',e,'params',params);
					var page = {
						id:e.data.page_id,
						edit_config:{
							backgroundID:'',
							backgroundColor:'#FFFFFF',
							customBackgroundUrl:''
						},
						data:[],
						svg:'',
						deleteElements:[],
						loaded:false
					};
					_self.$store.commit('addpage',page);
					//更新页面index
					_self.$store.commit('updatePageIndex');
					_self.loadPage(_self.$store.state.docData.page.length-1);
					//提交更新
					eventBus.$emit('stageChange','newpage');


				})
			}else{*/

      var page = {
        id: "page_" + common.getNewID(),
        edit_config: {
          backgroundID: "",
          backgroundColor: "#FFFFFF",
          customBackgroundUrl: "",
          guides: [],
          groups: []
        },
        data: [],

        svg: "",
        //deleteElements:[],
        loaded: true
      };
      this.$store.commit("addpage", page);
      //更新页面index
      this.$store.commit("updatePageIndex");
      //提交更新
      //eventBus.$emit('stageChange','newpage');
      eventBus.$emit("pageChange", {
        type: "add",
        targets: [page]
      });

      //console.log('滚动底部');
      $(".scroll-list")[0].scrollTop = $(".scroll-list")[0].scrollHeight;
      $(".scroll-list")[0].scrollTop = $(".scroll-list")[0].scrollHeight;
    },
    delPage(index) {
      var _self = this;
      var pageLength = this.$store.state.docData.page.length;
      var editPage = this.$store.state.docData.editor.nowPage;
      if (pageLength == 1) {
        console.log("小主，已经是最后一页啦");
        return;
      }
      console.log("正在删除页面", index);

      var removePageID = this.$store.state.docData.page[index].id;
      console.log("removePageID", removePageID);
      //是否自动保存
      /*if(this.autoSave){
				var params = {
					tpl_id:this.$store.state.docData.id,
					uid:this.$store.state.editor.uid,
					ids:[removePageID]
				};
				socket.editorEmit('pageRemove',params,function(e){
					console.log('自动保存页面删除成功',e);
					//标记删除
					_self.$store.state.docData.editor.deletePages.push({
						id:removePageID,
						status:0
					});

					_self.delPageHandle(index,editPage,_nextEdit,pageLength);

					console.log('标记删除页面成功',_self.$store.state.docData.editor.deletePages);
				});
			}else{*/

      _self.delPageHandle(index, editPage, pageLength);
      //标记删除
    },
    delPageHandle(index, editPage, pageLength) {
      var _self = this;
      var page = this.$store.state.docData.page[index];
      if (index == editPage) {
        //删除页面为在编页面时
        var _nextEdit = index == pageLength - 1 ? index - 1 : index;
        _self.$store.commit("delPage", index);
        _self.loadPage(_nextEdit, function() {
          console.log("page", page);
          //eventBus.$emit('stageChange','delpage');
          eventBus.$emit("pageChange", {
            type: "remove",
            targets: [page]
          });
          _self.$store.commit("updatePageIndex");
          console.log("删除页面结束A", index);
        });
      } else if (index < editPage) {
        //删除页面小于在编页面的index
        _nextEdit = editPage - 1;
        _self.$store.commit("delPage", index);
        _self.$store.commit("updatePageIndex");
        _self.loadPage(_nextEdit, function() {
          //eventBus.$emit('stageChange','delpage');
          eventBus.$emit("pageChange", {
            type: "remove",
            targets: [page]
          });
          console.log("删除页面结束B", index);
        });
      } else {
        _self.$store.commit("delPage", index);
        _self.$store.commit("updatePageIndex");
        //eventBus.$emit('stageChange','delpage');
        eventBus.$emit("pageChange", {
          type: "remove",
          targets: [page]
        });
      }

      //提交index后的所有页
      var pageChangeArr = [];
      for (var i = index; i < _self.$store.state.docData.page.length; i++) {
        var item = _self.$store.state.docData.page[i];
        pageChangeArr.push(item);
      }
      if (pageChangeArr.length > 0) {
        eventBus.$emit("pageChange", {
          type: "update",
          targets: pageChangeArr
        });
      }
    },
    copyPage(index) {
      if (this.$store.state.docData.page[index].loaded == false) {
        this.loadPage(index, function() {
          this.copyPageHandle(index);
        });
      } else {
        this.copyPageHandle(index);
      }
    },
    copyPageHandle(index) {
      var _self = this;

      //更新页面index
      _self.$store.commit("updatePageIndex");
      //提交更新

      var _page = JSON.parse(
        JSON.stringify(_self.$store.state.docData.page[index])
      );
      _page.id = "page_" + common.getNewID();
      _page.data = _page.data.map(item => {
        let newId = "shape_" + common.getNewID();
        //搜索是否存在于_page.edit_config.groups中,如果存在则使用新的ID替换

        _page.edit_config.groups.forEach((groupItem, groupIndex) => {
          groupItem.forEach((groupEleItem, groupEleIndex) => {
            if (groupEleItem == item.id || groupEleItem == item.front_id) {
              _page.edit_config.groups[groupIndex][groupEleIndex] = newId;
            }
          });
        });

        return Object.assign(item, {
          id: newId,
          front_id: undefined,
          page_id: _page.id
        });
      });

      _self.$store.commit("copyPage", {
        index: index,
        page: _page
      });
      eventBus.$emit("pageChange", {
        type: "add",
        targets: [_page],
        step: false
      });

      eventBus.$emit("elementChange", {
        type: "add",
        targets: _page.data
      });
      //提交所有页面的index到socket
      for (let i = 0; i < _self.$store.state.docData.page.length; i++) {
        _self.$store.state.docData.page[i].index = i;
      }
      eventBus.$emit("pageChange", {
        type: "update",
        snap: false,
        targets: _self.$store.state.docData.page
      });

      _self.loadPage(index + 1);

      //}
    },
    loadPage(index, func) {
      //停止编辑动作
      eventBus.$emit("stopAllEdit");
      var _self = this;
      if (this.getNowPageIndex != index) {
        //eventBus.$emit('updateNowPageSVG');
        var pages = this.$store.state.docData.page;
        var _self = this;
        this.$store.state.editor.lock = true;
        var params = {
          tpl_id: this.$store.state.docData.id,
          page_id: pages[index].id,
          uid: this.$store.state.editor.uid
        };

        //	console.log('pages',pages,'params',params,'index',index);
        if (pages[index].loaded == false) {
          //console.log('初次载入页面数据');
          socket.editorEmit("pageElements", params, function(e) {
            //预处理传回的元素,将纯文本���换为对应属性的值
            var resultData = common.formatElementData(
              e.data,
              _self.$store.state.docData.edit_config
            );
            if (pages[index].edit_config.groups == undefined) {
              pages[index].edit_config.groups = [];
            }
            //console.log('resultData',resultData);
            pages[index].data = resultData;
            pages[index].loaded = true;
            _self.loadPageHandle(index);

            if (func != undefined) {
              func();
            }
            //eventBus.$emit('stageChange','loadpage');
            eventBus.$emit("stateChange", {
              type: "loadPage",
              data: index,
              snap: true
            });
          });
        } else {
          //console.log('直接读取页面数据');
          _self.loadPageHandle(index);

          //console.log('执行func');
          if (func != undefined) {
            func();
          }
          //eventBus.$emit('stageChange','loadpage');
          eventBus.$emit("stateChange", {
            type: "loadPage",
            data: index,
            snap: true
          });
        }
      } else {
        if (func != undefined) {
          func();
        }
      }
    },
    loadPageHandle(index) {
      var _self = this;
      _self.$store.commit("setNowEditPage", index);
      //取消选择状态
      _self.$store.commit("setselectedItem", null);
      _self.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);

      //更新页面index
      _self.$store.commit("updatePageIndex");
      //提交更新
    },
    getThumbnail(page) {
      //获取stage宽度,除以133,取zoom
      var zoom = 133 / this.getStageSize.width;
      var html = "";
      //	console.log('page.thumbnail',page.thumbnail)
      if (page.thumbnail != undefined && page.thumbnail != "") {
        if (page.thumbnail.indexOf("base64,") != -1) {
          html =
            '<img width="133" height="' +
            this.getStageSize.height * zoom +
            '" src="' +
            page.thumbnail +
            '"/>';
        } else {
          html =
            '<img width="133" height="' +
            this.getStageSize.height * zoom +
            '" src="' +
            page.thumbnail +
            '"/>';
        }
      } else {
        html =
          '<svg width="133" height="' +
          this.getStageSize.height * zoom +
          '" style="background: ' +
          page.edit_config.backgroundColor +
          '"></svg>';
      }
      return html;
    }
  },
  mounted() {
    var _self = this;
    eventBus.$on("globalMouseMove", function(e) {
      _self.mouse.x = e.pageX;
      _self.mouse.y = e.pageY;
      //如果正在拖动,则检测当前拖动到的位置
      if (_self.dragIndex != -1) {
        //console.log(_self.getMouse.vectorX,_self.getMouse.vectorY);
        if (
          Math.abs(_self.getMouse.vectorX) + Math.abs(_self.getMouse.vectorY) >
          2
        ) {
          _self.moveStart = true;
        }

        if (_self.moveStart) {
          var scrollTop = $(".scroll-list").scrollTop();
          var top = _self.mouse.y + scrollTop - 57 - 70 - _self.downY;
          //判断top所在位置对应的index

          if (top > 0) {
            var index = (top - top % _self.thumbHeight) / _self.thumbHeight;
          } else {
            var index = -1;
          }
          if (index > _self.pagelist.length - 1) {
            index = _self.pagelist.length - 1;
          }
          _self.toIndex = index;
        }
      }
    });
    eventBus.$on("globalMouseUp", function() {
      //执行数组交换
      //_self.pagelist = common.swapArrayItems(_self.pagelist,_self.dragIndex,_self.toIndex)

      //将页面信息取出,将其设为null,并添加到新位置
      if (_self.dragIndex != -1) {
        if (_self.moveStart) {
          //console.log('dragIndex',_self.dragIndex,'toIndex',_self.toIndex);
          //取出要插入的页面对象
          var pageObj = _self.pagelist[_self.dragIndex];
          _self.pagelist[_self.dragIndex] = null;

          _self.pagelist.splice(_self.toIndex + 1, 0, pageObj);

          //遍历删除为null的数组成员
          for (var i in _self.pagelist) {
            if (_self.pagelist[i] == null) {
              _self.pagelist.splice(i, 1);
              break;
            }
          }

          //根据this.pageSnap,取出差异
          var newPageSnap = JSON.parse(JSON.stringify(_self.pagelist));
          var oldPageSnap = JSON.parse(_self.pageSnap);

          var pageChangeArr = [];
          for (var i in newPageSnap) {
            delete newPageSnap[i].data;
            delete oldPageSnap[i].data;
            delete newPageSnap[i].svg;
            delete oldPageSnap[i].svg;

            if (
              JSON.stringify(newPageSnap[i]) != JSON.stringify(oldPageSnap[i])
            ) {
              //搜索oldPageSnap[i].id
              //pageChangeArr.push(i);
              for (var c in _self.pagelist) {
                if (_self.pagelist[c].id == oldPageSnap[i].id) {
                  pageChangeArr.push(_self.pagelist[c]);
                  break;
                }
              }
            }
          }

          _self.pageSnap = "";

          _self.$store.commit("updatePageIndex");
          if (pageChangeArr.length > 0) {
            eventBus.$emit("pageChange", {
              type: "update",
              targets: pageChangeArr
            });
          }

          if (_self.toIndex == -1) {
            console.log("加载第一页");
            _self.loadPage(0);
          } else {
            //console.log('加载页',_self.toIndex);
            //向上拖动+1,向下不用加
            if (_self.dragIndex < _self.toIndex + 1) {
              _self.loadPage(_self.toIndex);
            } else {
              _self.loadPage(_self.toIndex + 1);
            }
          }
        } else {
          _self.loadPage(_self.dragIndex);
        }

        _self.dragIndex = -1;
        _self.toIndex = -1;
        _self.moveStart = false;
      }
    });

    eventBus.$on("loadPage", function(index) {
      _self.loadPage(index);
    });
  }
};
</script>
<style lang="scss">
/*@import "/assets/css/common.scss";*/
$blue: #00a2eb;
.page-box {
  position: absolute;
  zoom: 1;
  right: 0;
  top: 49px;
  bottom: 0;
  width: 154px;
  background-color: #414750;
  z-index: 40;
  min-height: 481px;
  transition: all 0.3s ease;
  box-shadow: 0 0 12px 0px rgba(175, 170, 170, 0.29);
  .close {
    position: absolute;
    top: 50%;
    left: -19px;
    width: 19px;
    height: 89px;
    margin-top: -44.5px;
    background: url(/assets/images/icon/ico-turn1.png) no-repeat 0 0;
    transform: scaleX(-1);
    color: #fff;
    cursor: pointer;
    z-index: 50;
    &.turnoff {
      background: url(/assets/images/icon/ico-turn2.png) no-repeat 0 0;
    }
  }
  .title {
    line-height: 46px;
    text-align: center;
    font-size: 14px;
    color: #a09f9f;
    background: #545961;
    i {
      margin-right: 8px;
    }
  }
  .scroll-list {
    position: relative;
    padding: 0 10px;
    overflow-y: auto;
    height: calc(100vh - 200px);
  }
  .scroll-list::-webkit-scrollbar {
    display: none;
  }
  .pageThumb {
    width: 133px; // height: 81px;
    position: absolute;
    cursor: pointer;
    margin-bottom: 12px;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.2);

    hr {
      margin: 0;
      border: none;
      border-top: 3px solid yellow;
      position: absolute;
      bottom: -10px;
      width: 154px;
    }
    .thumbnail {
      height: auto;
      pointer-events: none;
      overflow: hidden;
      svg,
      img {
        display: block;
      }
      transition: opacity 0.2s;
    }
    .thumbnail:before {
      content: "";
      position: absolute;
      bottom: -6px;
      left: -10px;
      top: -6px;
      right: -10px;
      border: 6px solid;
      border-left-width: 10px;
      border-right-width: 10px;
      display: none;
    }
    &.active {
      .thumbnail:before {
        display: block;
      }
    }
    &.draging {
      position: absolute;
      left: 23px;
      transform: rotate(4deg);
      opacity: 0.8;
      top: 0px;
      z-index: 10;
    }
    .pagenum {
      position: absolute;
      right: 0;
      width: 20px;
      height: 20px;
      background: #666;
      color: #fff;
      text-align: center;
    }
    .ico-opt {
      position: absolute;
      zoom: 1;
      z-index: 10;
      width: 38px;
      height: 17px;
      line-height: 17px;
      // background: url(/assets/images/op-ico.png) 0 0 no-repeat;
      background-color: rgba(0, 0, 0, 0.3);
      text-align: center;
      color: #fff;
      top: 0;
      cursor: pointer;
      display: none;
      &.copy {
        background-position: -26px 0;
        left: 0;
      }
      &.del {
        background-position: 0 0;
        right: 0;
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
    &:hover {
      .ico-opt {
        display: block;
      }
    }
  }
  .add-page {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 41px;
    line-height: 41px;
    width: 154px;
    color: #fff;
    text-align: center;
    font-size: 14px;
    background-color: #00a2eb;
    z-index: 99;
    i {
      margin-right: 8px;
    }
  }
}
</style>



// WEBPACK FOOTER //
// rightPage.vue?1dcb15e8
