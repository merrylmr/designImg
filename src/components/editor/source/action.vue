<template>
	<div class="action-box">
    <!-- <button @click="addTestData">添加交互组件</button> -->
		<div class="action-edit" :style="left">
				<singlePageConfigEditor/>
        <div class="close-btn" @click="onCloseBtnClickHandler">
          <i class="tbzico ico-close"></i>
        </div>
		</div>
		<div v-for="(item,index) in group" :class="['wrapper',{active:index==activeGroup}]">
			<div class="title" @click="checkIndex(index)">
				{{item.title}} <i :class="['tbzico','ico-arrow3',{ico180:index!==activeGroup}]"></i>
			</div>
			<div class="list u-scroll" v-if="index==activeGroup&&(item.data.length>0||item.full)" ref="box" @scroll="scroll">
				<!-- 表单展示列表 -->
				<div class="list-wrap" v-if="item.type=='form'" ref="waterfall">
					<div class="card" v-for="(data,i) in item.data" :key="data.id" @click="addElement(data)">
						<a class="bg" :style="{backgroundImage:`url(${data.url}`,width:data.owidth,height:data.oheight}">
						</a>
						<span class="tag" :style="{backgroundColor:data.tagColor}">{{data.tags}}</span>
					</div>
				</div>
				<!-- float列表 -->
				<div class="list-wrap" v-else-if="item.type=='like'" ref="waterfall">
					<div class="like-card" v-for="(data,i) in item.data" :key="data.id" @click="addElement(data)" :style="{width:data.owidth+'px',height:data.oheight+'px'}">
						<p draggable="true" @dragstart="handleDragstart(data)">
							<img :src="data.url" alt="" :width="data.owidth">
						</p>
					</div>
				</div>
				<!-- 单行列表 -->
				<div class="list-wrap hehe" v-else-if="item.type=='video'||item.type=='slide'" ref="waterfall">
					<div class="block-card" v-for="(data,i) in item.data" :key="data.id" @click="addElement(data)" :style="{width:data.owidth+'px',height:data.oheight+'px'}">
						<p draggable="true" @dragstart="handleDragstart(data)">
							<img :src="data.url" alt="" :width="data.owidth">
						</p>
					</div>
				</div>
				<!-- 瀑布流展示列表 -->
				<div class="list-wrap" v-else ref="waterfall">
					<Waterfall  :line-gap="135" :watch="item.data" align="left">
						<WaterfallSlot v-for="(row,i) in item.data" :width="row.owidth" :height="row.oheight" :key="row.id" :order="index" >
							<p draggable="true" @click="addElement(row)" @dragstart="handleDragstart(row)">
								<img :src="row.url" alt="" width="100%">
							</p>
						</WaterfallSlot>
					</Waterfall>
				</div>

				<div class="underline" v-show="item.full">你已经触及了我的底线！</div>
			</div>
		</div>
	</div>
</template>
<script>
import Dispatch from "@/common/dispatch.js";
import Waterfall from "vue-waterfall/lib/waterfall";
import WaterfallSlot from "vue-waterfall/lib/waterfall-slot";
import EventBus from "@/common/eventBus.js";
import common from "@/common/common.js";

import singlePageConfigEditor from "@/components/editor/source/singlePageConfigEditor";
var _colors = ["#a568ff", "#6587ff", "#ff6876"],
  _i = 0;

export default {
  name: "action",
  components: { Waterfall, WaterfallSlot, singlePageConfigEditor },
  data() {
    return {
      request: false,
      group: [
        {
          title: "表单",
          type: "form",
          url: "/editor/getMaterial4/query/t-18-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        },
        {
          title: "跳转按钮",
          type: "button",
          url: "/editor/getMaterial4/query/t-21-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        },
        {
          title: "点赞",
          type: "like",
          url: "/editor/getMaterial4/query/t-23-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        },
        {
          title: "投票",
          type: "vote",
          url: "/editor/getMaterial4/query/t-24-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        },
        {
          title: "倒计时",
          type: "count",
          url: "/editor/getMaterial4/query/t-22-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        },
        {
          title: "视频",
          type: "video",
          url: "/editor/getMaterial4/query/t-26-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        },
        {
          title: "幻灯片",
          type: "slide",
          url: "/editor/getMaterial4/query/t-27-r-1000-c--p-1.html",
          data: [],
          page: 1,
          full: 0
        }
      ],
      activeGroup: 0
    };
  },
  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    left() {
      return {
        marginLeft:
          this.selectedItem && this.selectedItem.type == "interaction"
            ? "0"
            : "-375px"
      };
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      return this.$store.state.docData.page[
        this.$store.state.docData.editor.nowPage
      ];
    }
  },
  methods: {
    /*addTestData() {
      //let tableStyle = JSON.parse(prompt("请输入"));
      let tableStyle = {
        module: "slide",
        config: {
          control: {
            s: true,
            e: true,
            se: true,
            rotate: false
          },
          defaultWidth: 750,
          defaultHeight: 400
        },
        data: {
          //是否显示操作点
          pointShow: true,
          //图片数据
          pic: [
            "/static/img/slide_0001.jpg",
            "/static/img/slide_0002.jpg",
            "/static/img/slide_0003.jpg"
          ]
        }
      };

      // let tableStyle = {
      //   module: "video",
      //   config: {
      //     control: {
      //       s: true,
      //       e: true,
      //       se: true,
      //       rotate: false
      //     },
      //     defaultWidth: 750,
      //     defaultHeight: 750
      //   },
      //   data: {
      //     content: `<iframe height=498 width=510 src='http://player.youku.com/embed/XMzI5NzQ2ODU5Mg==' frameborder=0 'allowfullscreen'></iframe>`
      //   }
      // };
      console.log(JSON.stringify(tableStyle, null, 2));
      this.addElement({
        url: "",
        tableStyle
      });
    },*/
    onCloseBtnClickHandler() {
      this.$store.commit("setselectedItem", null);
    },
    scroll(e) {
      var _group = this.group[this.activeGroup];
      if (_group.full || this.request) {
        return;
      }
      var t1 = e.target.scrollTop,
        box = this.$refs.box[0].offsetHeight,
        waterfall = this.$refs.waterfall[0].offsetHeight,
        offset = waterfall - box - t1;
      if (offset < 50) {
        this.request = true;
        _group.page++;
        this.loadData();
      }
    },
    checkIndex(i) {
      if (this.activeGroup == i) {
        this.activeGroup = -1;
      } else {
        this.activeGroup = i;
        if (this.group[i].data.length == 0 && this.group[i].full == 0) {
          this.loadData();
        }
      }
    },
    loadData() {
      var _group = this.group[this.activeGroup];
      Dispatch.getActionData({
        url: _group.url,
        page: _group.page,
        type: _group.type
      }).then(result => {
        var _data = result.data;
        if (_data.length == 0) {
          _group.full = 1;
        } else {
          if (this.activeGroup == 0) {
            _data.forEach(item => {
              item.tagColor = _colors[_i++];
              _i == 2 && (_i = 0);
              item.tableStyle = JSON.parse(item.tableStyle);
            });
          } else if (this.activeGroup == 2) {
            //点赞素材的处理
            _data.forEach(item => {
              let _scale = item.width / item.height;
              if (_scale > 1.5) {
                item.owidth = 135;
                item.oheight = item.height * 129 / item.width + 6;
              } else {
                item.owidth = 90;
                item.oheight = 90 + 6;
              }
              item.tableStyle = JSON.parse(item.tableStyle);
            });
          }else if (this.activeGroup == 5 || this.activeGroup == 6) {
            //视频幻灯的处理
            _data.forEach(item => {
							item.owidth = 263;
							item.oheight = item.height * 263 / item.width;
              item.tableStyle = JSON.parse(item.tableStyle);
            });
          } else {
            _data.forEach(item => {
              item.owidth = 135;
              item.oheight = item.height * 129 / item.width + 6;
              item.tableStyle = JSON.parse(item.tableStyle);
            });
          }
          _group.data = _group.data.concat(_data);
        }
        this.request = false;
      });
    },
    addElement({ url, tableStyle }) {
      tableStyle = JSON.parse(JSON.stringify(tableStyle));
      switch (tableStyle.module) {
        case "form":
          //判断当前页是否已经插入表单元素
          for (let i in this.getNowPageData.data) {
            if (
              this.getNowPageData.data[i].type == "interaction" &&
              this.getNowPageData.data[i].edit_data.module == "form"
            ) {
              this.$store.commit("callModal", {
                type: "alert",
                modalOver: true,
                cls: "danger",
                text: "一个简页只能添加一个表单"
              });
              return;
            }
          }
          console.log("tableStyle", tableStyle);
          tableStyle.data.list = tableStyle.data.list.map(item => {
            if (item.type == "address") {
              item.front_id = "input_" + common.getNewID();
              item.items.province.front_id = "input_" + common.getNewID();
              item.items.city.front_id = "input_" + common.getNewID();
              item.items.area.front_id = "input_" + common.getNewID();
              item.items.address.front_id = "input_" + common.getNewID();
              return item;
            } else {
              return Object.assign(item, {
                front_id: "input_" + common.getNewID()
              });
            }
          });
          break;
        case "vote":
          //查找已经添加的投票样式
          let voteSkin = "";
          for (let i in this.getNowPageData.data) {
            if (
              this.getNowPageData.data[i].type == "interaction" &&
              this.getNowPageData.data[i].edit_data.module == "vote"
            ) {
              voteSkin = this.getNowPageData.data[i].edit_data.data.skin;
              break;
            }
          }

          if (voteSkin != "" && voteSkin != tableStyle.data.skin) {
            this.$store.commit("callModal", {
              type: "alert",
              modalOver: true,
              cls: "danger",
              text: "一个简页只能添加一种投票样式"
            });
            return;
          }
          tableStyle.data.front_id = "input_" + common.getNewID();
          var dateObject = new Date();
          dateObject.setMonth(dateObject.getMonth() + 1);

          tableStyle.data.finishTime = Date.parse(dateObject) / 1000;
          console.log("tableStyle.data.finishTime", tableStyle.data.finishTime);
          break;
        case "like":
          tableStyle.data.front_id = "input_" + common.getNewID();
          break;
        case "countdown":
          var dateObject = new Date();
          dateObject.setMonth(dateObject.getMonth() + 1);
          tableStyle.data.date = dateObject.toString();
          break;
      }

      EventBus.$emit("addElement", {
        type: "interaction",
        url,
        item: tableStyle
      });
    },
    handleDragstart(type, url, item) {
      this.$store.state.editor.dragEvent.type = type;
      this.$store.state.editor.dragEvent.url = url;
      this.$store.state.editor.dragEvent.item = item;
      //预加载
      if (item.type == "image") {
        if (item.width > 800 || item.height > 800) {
          item.imgTemp = new Image();
          item.imgTemp.src = common.getImageURL(item.url, 800);
        } else {
          item.imgTemp = new Image();
          item.imgTemp.src = item.url;
        }
      }
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>
<style lang="scss">
.action-box {
  height: 100%;
  position: relative;
  .action-edit {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #414750;
    transition: 0.2s ease-in-out;
    z-index: 10;
    .close-btn {
      position: absolute;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      right: 0;
      top: 0;
      cursor: pointer;
      color: #afafaf;
      background-color: #4e535b;
      i {
        font-size: 12px;
      }
      &:hover {
        background-color: #00a2eb;
        color: #fff;
      }
    }
    &::-webkit-scrollbar {
      width: 2px;
      height: 5px;
    }
    &::-webkit-scrollbar-corner {
      background-color: rgba(255, 255, 0, 0.5);
    }
    &::-webkit-scrollbar-thumb:vertical {
      background-color: rgba(255, 255, 255, 0.5);
    }
    &::-webkit-scrollbar-thumb:horizontal {
      background-color: rgba(255, 255, 255, 0.5);
    }
    &[readonly] {
      background: #e1e1e1;
      cursor: not-allowed;
    }
    overflow: auto;
    height: 100%;
  }
  .wrapper {
    height: 46px;
    transition: height ease-in-out 0.2s;
    overflow: hidden;
    margin-bottom: 1px;
    &.active {
      height: calc(100vh - 47 * 6px - 50px);
    }
    .title {
      height: 46px;
      background: #545961;
      color: #fff;
      font-size: 14px;
      line-height: 45px;
      padding: 0 23px;
      cursor: pointer;
      position: relative;
      z-index: 2;
      i {
        font-size: 35px;
        float: right;
      }
      &:hover {
        background: #5c6168;
      }
    }
    .list {
      height: calc(100vh - 47 * 6px - 50px);
      overflow-y: auto;
      padding: 15px 0 15px 20px;
      .vue-waterfall {
        .vue-waterfall-slot {
          padding: 3px;
          p {
            cursor: pointer;
          }
        }
      }
      .underline {
        padding: 30px;
        color: #757c86;
        text-align: center;
        z-index: 2;
      }
      .card {
        width: 263px;
        height: 247px;
        position: relative;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        .bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-position: 50% 0;
          background-size: cover;
          background-repeat: no-repeat;
          box-shadow: 0 -20px 50px 0 rgba(109, 107, 107, 0.5);
          transition: 3s ease;
        }
        .tag {
          position: absolute;
          top: 0;
          left: 0;
          width: 37px;
          line-height: 18px;
          height: 18px;
          color: #fff;
          text-align: center;
        }
        &:hover {
          width: 243px;
          margin-left: 10px;
        }
      }

      .like-card {
        float: left;
        padding-right: 6px;
        p {
          cursor: pointer;
        }
      }
			.block-card {
				margin-bottom: 15px;
        p {
          cursor: pointer;
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// action.vue?77a306b0