<template>
	<transition name="fade">
		<div v-show="showTools" class="toolbar" id="toolbar" :style="getToolStyle" @click="closeModal" @mousedown.stop="" ref="toolbar">
			<!--左侧组件-->
			<div class="left">
				<components :is="toolComponents"></components>
				<components :is="singleSelectd"></components>
				<components :is="groupSelectd"></components>
			</div>
			<!--右侧组件-->
			<div class="right">
				<components :is="notEditState"></components>
			</div>
			<!-- slide组件 -->
			<slide :data="slide.data" :pos="slide.pos"></slide>
		</div>
	</transition>
</template>
<script>
import defaultTool from "./defaultTool";
import containerTool from "./containerTool";
import imageTool from "./imageTool";
import svgTool from "./svgTool";
import tableTool from "./tableTool";
import tableCellTool from "./tableCellTool";
import textTool from "./textTool";
import grouptextTool from "./grouptextTool";
import commonLeft from "./commonLeft";
import groupTool from "./groupTool";
import commonTool from "./commonTool";
import guidesTool from "./guidesTool";
import interactionAlignTool from "./interactionAlignTool";
import valTool from "./valTool";

import eventBus from "@/common/eventBus.js";
//组件
import slide from "@/components/editor/modal/slide";
export default {
  data() {
    return {};
  },
  components: {
    imageTool,
    svgTool,
    textTool,
    commonTool,
    defaultTool,
    grouptextTool,
    commonLeft,
    slide,
    groupTool,
    tableTool,
    tableCellTool,
    containerTool,
    valTool,
    guidesTool,
    interactionAlignTool
  },
  computed: {
    getToolStyle() {
      let styleObj = { left: this.isSourceOpen ? "375px" : "66px" };

      if (
        this.$store.state.editor.isPageOpen &&
        this.$store.state.docData.product != "jianye"
      ) {
        styleObj.right = "154px";
      } else {
        styleObj.right = "0";
      }
      return styleObj;
    },
    //当前正在编辑的单元格
    nowEditTable() {
      return this.$store.state.editor.nowEditTable;
    },
    slide() {
      return this.$store.state.editor.slide;
    },
    //获取当前正在编辑的文本
    nowEditText() {
      return this.$store.state.editor.nowEditText;
    },
    //获取左侧列表是否打开
    isSourceOpen() {
      return this.$store.state.editor.isSourceOpen;
    },
    //获取正在编辑的组合文字对象
    nowEditGroupText() {
      return this.$store.state.editor.nowEditGroupText;
    },
    //获取当前guides的选择信息
    guides() {
      return this.$store.state.editor.guides;
    },
    //当前是否显示工具栏
    showTools() {
      //获取当前正在选择的组或者组件
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;
      //获取文本编辑状态

      if (
        this.nowEditText != null ||
        this.nowEditGroupText != null ||
        this.nowEditTable != null
      ) {
        //正在编辑文本,显示
        return true;
      } else if (this.$store.state.editor.containerEditor) {
        return true;
      } else if (selectedItem != null || selectedItemsGroup.length > 0) {
        //当前选中了单个或多个���象,显示
        return true;
      } else if (this.guides.movingItem != undefined) {
        return true;
      } else {
        return false;
      }
    },
    //获取当前需要显示的面板
    toolComponents() {
      //获取当前正在选择的组或者组件
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;
      //获取文本编辑状态

      if (selectedItem != null) {
        if (this.$store.state.editor.modal["cropper"]) {
          return valTool;
        }

        if (
          selectedItem.type == "svg" ||
          selectedItem.type == "groupText" ||
          selectedItem.type == "pattern" ||
          selectedItem.type == "grid"
        ) {
          //svg与组合文字
          return svgTool;
        } else if (selectedItem.type == "container") {
          return containerTool;
        } else if (selectedItem.type == "image") {
          //图片
          return imageTool;
        } else if (selectedItem.type == "text") {
          //文本
          return textTool;
        } else if (selectedItem.type == "table") {
          if (this.nowEditTable == null) {
            //表格
            return tableTool;
          } else {
            console.log("单元格编辑工具");
            return tableCellTool;
          }
        } else if (selectedItem.type == "container") {
          //滤镜
          return containerTool;
        } else if (selectedItem.type == "interaction") {
          //交互组件对齐
          return interactionAlignTool;
        }
      } else if (this.nowEditText != null) {
        return textTool;
      } else if (this.nowEditGroupText != null) {
        return grouptextTool;
      } else if (this.$store.state.editor.containerEditor) {
        return valTool;
      } else if (this.guides.movingItem != undefined) {
        return guidesTool;
      } else {
        return defaultTool;
      }
    },
    singleSelectd() {
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;

      if (
        selectedItemsGroup.length == 0 &&
        selectedItem != null &&
        (selectedItem.type == "svg" ||
          selectedItem.type == "image" ||
          selectedItem.type == "grid" ||
          selectedItem.type == "pattern") &&
        this.$store.state.editor.modal["cropper"] == false
      ) {
        return commonLeft;
      }
    },
    groupSelectd() {
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;

      if (
        this.nowEditText == null &&
        this.nowEditGroupText == null &&
        selectedItemsGroup.length > 0
      ) {
        return groupTool;
      }
    },
    notEditState() {
      if (
        this.nowEditText == null &&
        this.nowEditGroupText == null &&
        this.$store.state.editor.modal["cropper"] == false &&
        !this.$store.state.editor.containerEditor
      ) {
        return commonTool;
      }
    }
  },
  methods: {
    closeModal(e) {
      // if(this.nowEditText){
      // e.stopPropagation();
      // }
      if (e.target.id == "toolbar") {
        //通知其他面板关闭
        eventBus.$emit("closeModal");
      }
    }
  }
};
</script>
<style lang="scss">
$padding: 8px;
.toolbar {
  position: absolute;
  zoom: 1;
  background-color: #fff;
  color: #515151;
  top: 49px;
  left: 375px;
  right: 0;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9;
  transition: all 0.3s ease;
  padding: 5px;
  display: flex;
  flex-wrap: wrap;

  /*padding-left: $padding;
  padding-right: $padding;
  padding-bottom: $padding;*/
  .left {
    flex: 1;
    .color-picker-item .box {
      width: 28px;
      height: 28px;
      margin-top: 2px;
      margin-right: 7px;
      border-radius: 5px;
      box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
    }
    //padding-top: $padding;
  }
  .right {
    //padding-top: $padding;
  }
  .tool-text {
    float: left;
    padding: 0 9px;
    border: 1px solid transparent;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: #515151;
    border-radius: 3px;
    margin-right: 5px;
    position: relative;
    z-index: 1000;
    span {
      cursor: pointer;
    }
    &:hover {
      border: 1px solid #e2e3e5;
    }
    &.tool-ico {
      width: 30px;
      position: relative;
			overflow: visible;
      i {
        position: relative;
      }
      &.common-ico {
        background: url(/assets/images//icon/ico4.png) no-repeat 0 50%;
      }
      &.text-ico {
        background: url(/assets/images//icon/ico-text.png) no-repeat 0
          50%;
      }
      &:before {
        font-size: 12px;
        line-height: 25px;
        content: "";
        position: absolute;
        padding: 0 5px;
        top: 34px;
        left: 50%;
        transform: translateX(-50%);
        background: #414750;
        border-radius: 3px;
        color: #fff;
        white-space: nowrap;
        display: none;
      }
      &:after {
        content: "";
        background: #414750;
        width: 8px;
        height: 8px;
        transform: rotate(45deg) translateX(-50%);
        position: absolute;
        top: 34px;
        left: 50%;
        display: none;
      }
      &.ico-italic {
        background-position: 7px 50%;
        &:before {
          content: "斜体";
        }
      }
      &.ico-align {
        background-position: -285px 50%;
        &:before {
          content: "对齐";
        }
      }
      &.ico-lh {
        background-position: -365px 50%;
        &:before {
          content: "行距";
        }
      }
      &.ico-ls {
        background-position: -400px 50%;
        &:before {
          content: "间距";
        }
      }
      &.c-italic {
        i {
          left: -2px;
        }
        &:before {
          content: "斜体";
        }
      }
      &.c-underline {
        i {
          left: -2px;
        }
        &:before {
          content: "下划线";
        }
      }
      &.c-bold {
        i {
          left: -2px;
          font-weight: bold;
        }
        &:before {
          content: "加粗";
        }
      }
      &.c-shadow {
        &:before {
          content: "文字投影";
        }
      }
      &.c-upper {
        i {
          left: -9px;
          font-size: 29px;
        }
        &:before {
          content: "大小写切换";
        }
      }
      &.c-align {
        i {
          left: -2px;
          font-size: 18px;
        }
        &:before {
          content: "对齐";
        }
      }
      &.c-lh {
        &:before {
          content: "行高";
        }
      }
      &.c-ls {
        &:before {
          content: "字间距";
        }
      }
      &.c-radian {
        i {
          left: -8px;
          font-size: 28px;
        }
        &:before {
          content: "环绕";
        }
      } //框选对齐样式
      &.galign-ico {
        background: url(/assets/images//icon/ico-groupAlign.png)
          no-repeat 0 50%;
      }
      &.ico-gl {
        background-position: 6px 50%;
        &:before {
          content: "左对齐";
        }
      }
      &.ico-ghc {
        background-position: -28px 50%;
        &:before {
          content: "水平居中对齐";
        }
      }
      &.ico-gr {
        background-position: -62px 50%;
        &:before {
          content: "右对齐";
        }
      }
      &.ico-gt {
        background-position: -118px 50%;
        &:before {
          content: "顶对齐";
        }
      }
      &.ico-gvc {
        background-position: -154px 50%;
        &:before {
          content: "垂直居中对齐";
        }
      }
      &.ico-gb {
        background-position: -186px 50%;
        &:before {
          content: "底对齐";
        }
      }
      &.ico-gv {
        background-position: -244px 50%;
        &:before {
          content: "垂直居中分布";
        }
      }
      &.ico-gh {
        background-position: -278px 50%;
        &:before {
          content: "水平居中分布";
        }
      }
			&.r-sort{
				&:before {
          content: "排序";
        }
			}
			&.r-lock{
				&:before {
          content: "锁定";
        }
			}
			&.r-reverse{
				&:before {
          content: "翻转";
        }
			}
			&.r-opacity{
				&:before {
          content: "透明度";
        }
			}
			&.r-shadow{
				&:before {
          content: "阴影";
        }
			}
			&.r-del{
				&:before {
          content: "删除";
        }
			}
      &:hover {
        // border: 1px solid transparent;
        &:before,
        &:after {
          display: block;
        }
      }
    }
  }
  .split {
    float: left;
    padding: 0 4px;
    height: 30px;
    margin-left: 12px;
    border-left: 1px solid #ddd;
  }
}

.fade-enter,
.fade-leave-active {
  top: 0px;
}
</style>



// WEBPACK FOOTER //
// main.vue?38517a7e
