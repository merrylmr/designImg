<template>
	<div class="commonTool">
      <span class="wrap-com">
        <signEditor v-if="show.signEditor" @close="show.signEditor=false"/>
        <span class="tool-text" @click="onEditSignClick" v-show="adminLevel" key="0">
          <span>标记</span>
        </span>
      </span>
      <span class="tool-text" @click="clone" v-show="getButtonShow('copy')" key="1">
        <span>复制</span>
      </span>
      <span class="tool-text tool-ico r-sort" @click.stop="callModal({type:'layer',modalOver:false})" v-show="getButtonShow('layer')" key="2">
        <i class="tbzico ico-eSort"></i>
        <!-- <span>排序</span> -->
      </span>
      <span class="tool-text tool-ico r-lock" @click="lock" :style="{color:lockState==false?'#515151':'#FC575E'}" v-show="getButtonShow('lock')" key="3">
        <i :class="['tbzico',lockState?'ico-eLock':'ico-eUnlock']"></i><br/>
        <!-- <span v-text="lockState?'解锁':'锁定'"></span> -->
      </span>
      <span class="tool-text tool-ico r-reverse" @click.stop="callModal({type:'revert',modalOver:false})" v-show="getButtonShow('flip')" key="4">
        <i class="tbzico ico-eReverse2"></i>
        <!-- <span>翻转</span> -->
      </span>

      <span class="tool-text tool-ico r-opacity" @click.stop="callSlide('alpha',{type:'slide',modalOver:false})" v-show="getButtonShow('opacity')" key="5">
        <i class="tbzico ico-eOpacity"></i>
        <!-- <span>透明度</span> -->
      </span>
      <span class="tool-text tool-ico r-shadow" @click.stop="callModal({type:'shadow',modalOver:false})" v-show="getButtonShow('shadow')" key="6">
        <i class="tbzico ico-eShadow"></i>
        <!-- <span>投影</span> -->
      </span>
      <span class="tool-text tool-ico r-del" @click="remove" style="margin-right:0px" v-show="getButtonShow('remove')" key="7">
        <i class="tbzico ico-eDel0"></i>
        <!-- <span>删除</span> -->
      </span>
      <span v-show="hideIcon" class="tool-text arrow" @click="onShowLessOrMoreButton" :style="arrowStyle" :key="8">
         <i class="tbzico ico-arrowRight"></i>
      </span>


		<layer/>
		<revert/>
		<shadow-tool/>
	</div>
</template>
<script>
import $ from "jquery";
import common from "@/common/common";
import eventBus from "@/common/eventBus.js";
import layer from "@/components/editor/modal/toolbar/layer";
import revert from "@/components/editor/modal/toolbar/revert";
import shadowTool from "@/components/editor/modal/toolbar/shadow";

import signEditor from "./modal/signEditor.vue";
import Cookies from "js-cookie";
export default {
  data() {
    return {
      btnShowMode: "more",
      //是否隐藏不常用图标以缩小工具栏展示
      windowWidth: 0,
      show: {
        signEditor: false
      }
    };
  },
  components: { layer, revert, shadowTool, signEditor },
  computed: {
    adminLevel() {
      return this.$store.state.editor.admin_level;
    },
    hideIcon() {
      return this.windowWidth < 1300;
    },
    arrowStyle() {
      if (this.btnShowMode == "less") {
        return {
          transform: "scaleX(1)"
        };
      } else {
        return {
          transform: "scaleX(-1)"
        };
      }
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      return this.$store.state.docData.page[
        this.$store.state.docData.editor.nowPage
      ];
    },
    //获取当前正在单选或多选的对象,返回一个数组
    selectedItems() {
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;
      if (selectedItem != null) {
        return [selectedItem];
      } else if (selectedItemsGroup.length > 0) {
        return selectedItemsGroup;
      } else {
        return [];
      }
    },
    //获取锁定解锁按钮状态,true=已锁定 false=未锁定
    lockState() {
      var items = this.selectedItems;
      //判断是单个还是多个
      if (items.length == 1) {
        //直接获取是锁定还是解锁
        return items[0].edit_config.lock;
      } else {
        //多个,遍历所有的元素,如果全都是true或者全都是false,则返回对应的,如果有不同的lock状态,则返回false
        var allLock = false;
        for (var i = 0; i < items.length; i++) {
          if (i == 0) {
            allLock = items[i].edit_config.lock;
          } else {
            if (items[i].edit_config.lock != allLock) {
              //有一个不同的!!!返回false
              return false;
            }
          }
        }
        return allLock;
      }
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      if (this.$store.state.docData.page.length > 0) {
        return this.$store.state.docData.page[
          this.$store.state.docData.editor.nowPage
        ];
      } else {
        console.log("没有任何页面数据,无法完成载入");
        return [];
      }
    },
    //获取正在被选择的单个物体
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    alphaData() {
      var alpha;
      alpha =
        this.selectedItems.length == 1
          ? this.selectedItems[0].edit_config.opacity * 100
          : 100;
      return [
        { title: "透明度", type: "alpha", max: 100, min: 0, val: parseInt(alpha) }
      ];
    },
    //获取当前guides的选择信息
    guides() {
      return this.$store.state.editor.guides;
    },
    //获取参考线数组
    getCustomGuides() {
      return this.getNowPageData.edit_config.guides;
    },
    //当前正在选择的组合,如果为空则返回false
    selectedGroup() {
      let items = this.$store.state.stage.selectionBox.items;
      let groups = this.getNowPageData.edit_config.groups;
      //遍历所有组,对比当前选中元素
      for (let groupIndex in groups) {
        let groupItem = groups[groupIndex];
        //计数器
        let counter = 0;
        //循环当前组的元素ID
        for (let eleIndex in groupItem) {
          let groupEleItem = groupItem[eleIndex];
          //循环选中的元素
          for (let selIndex in items) {
            let selItem = items[selIndex];
            if (
              selItem.id == groupEleItem ||
              selItem.front_id == groupEleItem
            ) {
              counter++;
            }
          }
          //判断counter是否和groupItem的数组长度相等,若相等,则说明当前选中的元素属于这个组
          if (counter == groupItem.length) {
            return groupIndex;
          }
        }
      }
      return -1;
    }
  },
  watch: {
    hideIcon(val) {
      if (val) {
        this.btnShowMode = "less";
      } else {
        this.btnShowMode = "more";
      }
    }
  },
  methods: {
    //编辑标记
    onEditSignClick() {
      this.show.signEditor = true;
    },
    onShowLessOrMoreButton() {
      this.$store.commit("callModal");
      if (this.btnShowMode == "more") {
        this.btnShowMode = "less";
      } else {
        this.btnShowMode = "more";
      }
    },
    //获取按钮显示状态
    getButtonShow(name) {
      if (this.selectedGroup != -1) {
        return (
          name == "remove" ||
          name == "shadow" ||
          name == "layer" ||
          name == "lock" ||
          name == "copy"
        );
      }
      if (name == "remove") {
        return true;
      } else if (
        name == "flip" &&
        this.selectedItem != null &&
        this.selectedItem.type == "interaction"
      ) {
        return false;
      } else if (
        name == "shadow" &&
        this.selectedItem != null &&
        this.selectedItem.type == "interaction"
      ) {
        return false;
      } else if (
        name == "opacity" &&
        this.selectedItem != null &&
        this.selectedItem.type == "interaction"
      ) {
        return false;
      } else if (
        name == "copy" &&
        this.selectedItem != null &&
        this.selectedItem.type == "interaction"
      ) {
        return false;
      } else {
        if (this.selectedItems.length > 0) {
          //判断是否在简化显示模式
          if (this.btnShowMode == "less") {
            if (
              name == "copy" ||
              name == "lock" ||
              name == "remove" ||
              name == "layer"
            ) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      }
    },
    //锁定与解锁
    lock() {
      var items = this.selectedItems;
      var getLockState = this.lockState;
      if (getLockState == false && Cookies.get("lockTip") != 1) {
        this.$store.state.editor.tip.lock = true;
      }
      for (var i = 0; i < items.length; i++) {
        items[i].edit_config.lock = !getLockState;
      }

      //eventBus.$emit('stageChange','lock');
      //eventBus.$emit('stageChange','remove');
      eventBus.$emit("elementChange", {
        type: "update",
        targets: this.selectedItems
      });
    },
    //克隆(复制后直接粘贴)
    clone() {
      var items = this.selectedItems;
      var copyObjArr = [];

      let newGroupItem = [];
      for (var i = 0; i < items.length; i++) {
        var copyObj = JSON.parse(JSON.stringify(items[i]));
        //修改位置
        copyObj.edit_config.left = copyObj.edit_config.left + 10;
        copyObj.edit_config.top = copyObj.edit_config.top + 10;

        //修改ID
        copyObj.id = "shape_" + common.getNewID();
        copyObj.front_id = undefined;
        newGroupItem.push(copyObj.id);
        this.getNowPageData.data.push(copyObj);
        copyObjArr.push(copyObj);
      }
      if (this.selectedGroup != -1) {
        this.getNowPageData.edit_config.groups.push(newGroupItem);
        eventBus.$emit("infoChange", { type: "group", step: false });
      }
      //更新当前的选择内容
      if (copyObjArr.length == 1) {
        this.$nextTick(function() {
          this.$store.commit("setselectedItem", copyObjArr[0]);
          this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
        });
      } else if (copyObjArr.length > 1) {
        this.$nextTick(function() {
          this.$store.commit("setselectedItem", null);
          this.$store.commit("setSelectionBox", [
            { name: "items", val: copyObjArr }
          ]);
        });
        this.$nextTick(() => {
          eventBus.$emit("updateSelectionBoxPositionAndSize");
        });
      }
      //eventBus.$emit('stageChange','clone');
      eventBus.$emit("elementChange", {
        type: "add",
        targets: copyObjArr
      });
    },
    //图层操作
    //参数:val Top:置顶 Bottom:置底 up:上一一层 down:下移一层
    layer(val) {
      //将选中的元素从nowPageData删除,并取index最高的元素,依据此index,进行图层操作
      var tempPageData = this.getNowPageData.data;
      var del = 0;
      var newPageData = [];
      var topIndex = 0;
      var bottomIndex = -1;

      for (var i in tempPageData) {
        if (typeof tempPageData[i] == "object") {
          var index = $.inArray(tempPageData[i], this.selectedItems);
          if (index == -1) {
            newPageData.push(tempPageData[i]);
          } else {
            if (bottomIndex == -1) {
              bottomIndex = i;
            }
            topIndex = i;
          }
        }
      }
      if (val == "up") {
        bottomIndex++;
        var added = 0;
        for (var i in this.selectedItems) {
          newPageData.splice(bottomIndex + added, 0, this.selectedItems[i]);
          added++;
        }
      } else if (val == "down") {
        bottomIndex--;
        if (bottomIndex < 0) {
          bottomIndex = 0;
        }
        if (
          this.getNowPageData.edit_config.backgroundID != "" &&
          bottomIndex == 0
        ) {
          bottomIndex = 1;
        }
        var added = 0;
        for (var i in this.selectedItems) {
          newPageData.splice(bottomIndex + added, 0, this.selectedItems[i]);
          added++;
        }
      } else if (val == "top") {
        for (var i in this.selectedItems) {
          newPageData.push(this.selectedItems[i]);
        }
      } else if (val == "bottom") {
        bottomIndex = 0;
        if (
          this.getNowPageData.edit_config.backgroundID != "" &&
          bottomIndex == 0
        ) {
          bottomIndex = 1;
        }
        var added = 0;
        for (var i in this.selectedItems) {
          newPageData.splice(bottomIndex + added, 0, this.selectedItems[i]);
          added++;
        }
      }
      //console.log(newPageData,'newPageData')
      this.getNowPageData.data = newPageData;

      for (var a = 0; a < this.getNowPageData.data.length; a++) {
        this.getNowPageData.data[a].index = a;
      }

      //eventBus.$emit('stageChange','layer');
      eventBus.$emit("elementChange", {
        type: "update",
        targets: this.selectedItems
      });
      eventBus.$emit("elementChange", {
        type: "update",
        targets: this.getNowPageData.data,
        snap: false,
        update: false,
        commitType: "onlyIndex"
      });
    },
    //翻转
    //参数:val x:水平翻转 y:垂直翻转
    flip(val) {
      var items = this.selectedItems;
      for (var i = 0; i < items.length; i++) {
        if (val == "x") {
          items[i].edit_config.flipX = !items[i].edit_config.flipX;
        } else if (val == "y") {
          items[i].edit_config.flipY = !items[i].edit_config.flipY;
        }
      }
      //eventBus.$emit('stageChange','flip');
      eventBus.$emit("elementChange", {
        type: "update",
        targets: this.selectedItems
      });
    },
    //设置透明度
    //参数:val 透明度 0-1 精确到后两位小数
    opacity(val, snap) {
      var items = this.selectedItems;
      console.log("透明度修改", items, val);
      for (var i = 0; i < items.length; i++) {
        items[i].edit_config.opacity = val;
      }
      //eventBus.$emit('stageChange','opacity');
      eventBus.$emit("elementChange", {
        type: "update",
        targets: this.selectedItems,
        snap: snap
      });
    },
    //删除
    remove() {
      var items = this.selectedItems;
      if (items.length > 0) {
        eventBus.$emit("elementChange", {
          type: "remove",
          targets: this.selectedItems
        });
        for (var i = 0; i < items.length; i++) {
          for (var a = 0; a < this.getNowPageData.data.length; a++) {
            if (this.getNowPageData.data[a].id == items[i].id) {
              this.getNowPageData.data.splice(a, 1);
              break;
            }
          }
        }

        //取消选择状态
        this.$store.commit("setselectedItem", null);
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      } else if (this.guides.movingItem != undefined) {
        for (let i in this.getCustomGuides) {
          if (this.guides.movingItem == this.getCustomGuides[i]) {
            this.getCustomGuides.splice(i, 1);
            break;
          }
        }
        this.$store.state.editor.guides.movingItem = undefined;
      }
    },
    callSlide(type, data) {
      this.$store.state.editor.slide.data = this.alphaData;
      /* var pos =
        this.$parent.$refs.toolbar.offsetWidth > 1094
          ? { right: "100px" }
          : { left: "218px", top: "85px" };*/
      this.$store.state.editor.slide.pos = { right: "5px" };
      this.$store.commit("callModal");
      this.$store.commit("callModal", data);
    },
    callModal(data) {
      this.$store.commit("callModal");
      this.$store.commit("callModal", data);
    },
    afterChangeHandle(data) {
      console.log("afterChangeAA", data);
      if (data.type == "alpha") {
        this.opacity(data.val / 100, data.snap);
      }
    },
    layerChangeHandle(data) {
      this.layer(data);
    },
    flipChangeHandle(data) {
      this.flip(data);
    }
  },
  beforeDestroy() {
    eventBus.$off("afterChange", this.afterChangeHandle);
    eventBus.$off("layerChange", this.layerChangeHandle);
    eventBus.$off("flipChange", this.flipChangeHandle);
  },
  created() {
    eventBus.$on("afterChange", this.afterChangeHandle);
    eventBus.$on("layerChange", this.layerChangeHandle);
    eventBus.$on("flipChange", this.flipChangeHandle);

    this.windowWidth = parseInt($(window).width());
    $(window).resize(e => {
      this.windowWidth = parseInt($(window).width());
    });
  }
};
</script>
<style lang="scss">
.commonTool {
  position: relative;
  .wrap-com {
    position: relative;
  }
  .tool-text {
    // line-height: normal;
    width: 35px;
    font-size: 12px;
    text-align: center;
    border: none;
    display: inline-block;
    margin-right: 0px;
    padding: 0;
    overflow: hidden;
    &:hover {
      opacity: 0.8;
      border: none;
    }
  }
  .arrow {
    i {
      font-size: 12px;
    }
  }
}
</style>



// WEBPACK FOOTER //
// commonTool.vue?38e06362