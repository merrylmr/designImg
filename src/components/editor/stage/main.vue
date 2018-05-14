<template>
	<div class="stageArea" id="stageArea" ref="stageArea" data-noselect
       :style="getStageAreaStyle"
       @mousedown="stageAreaMouseDown"
       @mousewheel="pageScroll">
		<!--svg舞台-->
		<div id="stage_canvas" class="stage" ref="stage" :style="stageCanvasStyle"
         data-noselect
         @dragover.prevent="handleDragover('stage')"
         @drop="handleDrop('stage')" >
			<!-- svg画布 -->
			<svg id="svg_canvas" ref="svg_canvas" data-noselect
           :viewBox="'0 0 '+getSvgWidth+' '+getSvgHeight"
           :width="getSvgWidth*getZoom"
           :height="getSvgHeight*getZoom"
           preserveAspectRatio="none"
           :style="{background:getNowPageData.edit_config.backgroundColor}"
           version="1.1" xmlns="http://www.w3.org/2000/svg">
				<!--滤镜-->
				<defs v-html="getFilterText"></defs>

				<!--元素-->
				<g v-for="(item,index) in getElements"
           :id="item.id" :ref="item.id" :key="item.id"
           :transform="getTransformString(item,false)"
           :style="getElementStyle(item)"
           :filter="item.edit_config.style.shadow.use?'url(#filter_shadow_'+item.id+')':''"
           v-show="item.edit_config.visible"
           @mouseenter="handleSvgMouseenter(item)"
           @mouseleave="handleSvgMouseleave(item)"
           @mousedown="svgItemSelected(item)"
           @dblclick="svgItemdblClick(item,arguments[0])"
           @dragover.prevent.stop="handleDragover('contain',item)"
           @drop.stop="handleDrop('contain',item)">
					<!--普通元素-->
					<g v-if="item.type!='interaction'" v-html="item.html"></g>
					<!--交互组件-->
					<g v-if="item.type=='interaction'">
						<foreignObject :width="item.edit_config.width" :height="item.edit_config.height">
							<iframe @load="onInteractionLoadHandler(item)" :ref="'interaction_'+item.id" :src="'/interaction/modules/'+item.edit_data.module+'/'" style="width:100%;height:100%;z-index:100;border:none" allowTransparency="true"></iframe>
						</foreignObject>
						<rect fill="rgba(0,0,0,0)" :width="item.edit_config.width" :height="item.edit_config.height"></rect>
					</g>
				</g>

				<!--矩形框-->
				<g id="rectBox">
					<rect class="box_trans" :id="'rect_'+item.id" :ref="'rect_'+item.id" v-for="item in getElements" :width="Math.abs(item.edit_config.width)" :height="Math.abs(item.edit_config.height)" :transform="getTransformString(item,true)" fill="none" stroke="rgba(0,0,0,0)" :opacity="item.opacity">
					</rect>
				</g>
				<!--网格-->
				<g id="grid" v-if="gridState" pointer-events="none" v-html="gridSvg">

				</g>
			</svg>
			<!--自由变形工具-->
			<div class="selection-tool" v-if="getSelectionAttr('show')" :style="getSelectionAttr('mainSyle')" @dblclick="onSelectionDblClick">
				<!--旋转-->
				<div v-if="getSelectionAttr('controlPointShow','rotate')" class="rotate" @mousedown="setControlPoint('rotate')" style="cursor:pointer"></div>
				<!--右-东-->
				<div v-if="getSelectionAttr('controlPointShow','e')" class="e point" @mousedown="setControlPoint('e')" :style="getSelectionAttr('cursor','e')"></div>
				<!--下-南-->
				<div v-if="getSelectionAttr('controlPointShow','s')" class="s point" @mousedown="setControlPoint('s')" :style="getSelectionAttr('cursor','s')"></div>
				<!--右下-东南-->
				<div v-if="getSelectionAttr('controlPointShow','se')" class="se point" @mousedown="setControlPoint('se')" :style="getSelectionAttr('cursor','se')"></div>
				<!--旋转角度提示-->
				<div class="rotate-text" v-if="$store.state.stage.mouse.controlPoint=='rotate'">{{getSelectedItem.edit_config.rotation}}°</div>
				<!-- 小锁 -->
				<span class="tbz-lock" ref="lock" title="点我解锁" v-show="lockShow" @click="unlock"></span>
			</div>
			<!--多选选择框-->
			<div class="selection-box" v-if="getSelectionBox.show" :style="getSelectionAttr('selectionBoxStyle')"></div>
			<!--当前悬停项目的选择框-->
			<div class="hover-element" v-if="hoverElement!=null" :style="getHoverElementStyle"></div>
			<!--出血线-->
			<div class="bleed" v-if="this.$store.state.docData.edit_config.bleed>0" :style="getBleedStyle"></div>
			<!--辅助线-->
			<div class="guide">
				<!--折页分割线-->
				<hr class="item" v-if="subLineGuide.length>0" v-for="(item,index) in subLineGuide" :style="getGuideItemStyle('subline',item)" />
				<!--移动辅助线组-->
				<hr class="item" v-for="(item,index) in guide" :style="getGuideItemStyle('move',item)" />
			</div>
			<!--舞台内编辑工具(文字编辑/容器/表格等)-->
			<div class="edit-tool">
				<!--文本编辑-->
				<text-editor v-show="$store.state.editor.nowEditText!=null"></text-editor>
				<group-text-editor v-show="nowEditGroupText!=null"></group-text-editor>
				<!--表格行列编辑器-->
				<table-editor v-show="showTableEditor"></table-editor>
			</div>
			<!--容器相关工具-->
			<div :class="['stage-mask',{'inited':initGrab}]" v-if="spaceDown||initGrab" @mousedown.stop="maskMousedown"></div>
			<!--舞台尺寸调整工具-->
			<div class="stage-resizer">
				<!--右侧-->
				<div class="control right" data-noselect v-if="docDataEditConfig.sizeAble=='2' || docDataEditConfig.sizeAble=='4'">
					<div class="control-bar" @mousedown="startMoveResizer('right')"></div>
					<div class="tip" :style="{
							opacity:(resizer=='right'?1:0),
							width:(resizer!='right'?'12px':'40px'),
							color:(resizer=='right'?'#414750':'#868686'),
							transform:(resizer=='right'?'rotate(90deg)':''),
							left:(resizer=='right'?'0px':''),
						}">
						{{(resizer!=null?parseInt(docDataEditConfig.width)+" "+docDataEditConfig.unit:'拖动调整宽度')}}
					</div>

				</div>
				<!--底部-->
				<div class="control bottom" data-noselect v-if="docDataEditConfig.sizeAble=='3' || docDataEditConfig.sizeAble=='4'">
					<div class="control-bar" @mousedown="startMoveResizer('bottom')"></div>
					<div class="tip" :style="{
							opacity:(resizer=='bottom'?1:0),
							color:(resizer=='bottom'?'#414750':'#868686')
						}">
						{{(resizer!=null?parseInt(docDataEditConfig.height)+" "+docDataEditConfig.unit:'拖动调整高度')}}
					</div>

				</div>
			</div>
		</div>
		<!--舞台缩放工具 -->
		<pageTool :scroll="stageAreaScroll" :stageStyle="stageStyle" />
		<!--缩略图生成工具-->
		<canvas id="thumbCanvas" width="800" height="600"></canvas>
		<!--参考线-->
		<div class="guides-canvas">
			<div :class="['guide-item',(item.type=='x'?'x':'y'),(item==guides.movingItem?'active':'')]" :style="getCustomGuideStyle(item)" v-for="(item,index) in getCustomGuides" :key="index" @mousedown="startMoveGuide(item)"></div>
		</div>
	</div>
</template>
<script>
import $ from "jquery";
import eventBus from "@/common/eventBus.js";
import pageTool from "./../modal/pageTool";
import textEditor from "./textEditor";
import groupTextEditor from "./groupTextEditor";
import tableEditor from "./tableEditor";
import socket from "@/common/socket.js";
import common from "@/common/common.js";
import Cookies from "js-cookie";

import {getElementHtml} from '@/components/common/renderItem.js';
import {createGridSvg} from '@/components/common/createGrid.js';

import onePage from'@/assets/json/onePage.json';

let islocal=false;
export default {
  //数据
  data() {
    return {
      //编组内编辑模式
      groupElementEdit: -1,
      initGrab: false,
      spaceDown: false,
      wheelPos: {
        x: 0,
        y: 0,
        type: ""
      },
      mousePos: {
        x: 0,
        y: 0
      },
      //定位舞台位置
      stageStyle: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        page_scale: 1
      },
      //定义多选选择框选择结束后标注功能
      selectionBoxRect: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        //鼠标按下时的leff,top,width,height
        oLeft: 0,
        oTop: 0,
        oWidth: 0,
        oHeight: 0
      },
      //鼠标按下时为false,move后为true,用于判断是否缩放或者resize
      moved: false,
      //是否显示滚动条
      stageAreaScroll: false,
      //辅助线显示
      guide: [],
      //折页辅助线
      subLineGuide: [],
      //当前shift键是否按下
      shiftIsDown: false,
      //当前鼠标悬停的元素，没有则为null
      hoverElement: null,
      //添加到舞台���物体与舞台的比例（默认20%,5）
      addScale: 5,
      update: 0,
      filterText: "",
      //在单选状态下,鼠标按下时,记录按下时这个元素的宽和高
      downConfig: {
        width: 0,
        height: 0
      },
      pageThumbnailTimer: null,
      templateThumbnailTimer: null,
      //网页svghtml代码
      gridSvg: "",
      //页面尺寸调整器活动状态
      resizer: null
    };
  },
  components: { pageTool, textEditor, groupTextEditor, tableEditor },
  //计算
  computed: {
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
    },

    getInteractionElements() {
      //获取交互组件
      return this.getNowPageData.data.filter(item => {
        return item.type == "interaction";
      });
    },
    getStageAreaStyle() {
      let styleObj = { left: this.isSourceOpen ? "375px" : "66px" };

      if (
        this.$store.state.editor.isPageOpen &&
        this.$store.state.docData.product != "jianye"
      ) {
        styleObj.right = "154px";
      } else if (this.$store.state.docData.product == "jianye") {
        styleObj.right = "0";
      } else {
        styleObj.right = "0";
      }
      return styleObj;
    },
    stageCanvasStyle() {
      let styleObj = {
        width: this.getSvgWidth * this.getZoom + "px",
        height: this.getSvgHeight * this.getZoom + "px",
        top: this.stageStyle.top + "px",
        left: this.stageStyle.left + "px"
      };
      if (this.stageStyle.transition) {
        styleObj.transition = "0.2s all";
      }

      return styleObj;
    },
    //获取参考线数组
    getCustomGuides() {
      return this.getNowPageData.edit_config.guides;
    },
    showTableEditor() {
      if (this.getSelectedItem == null) {
        return false;
      } else {
        if (this.getSelectedItem.type == "table") {
          return true;
        } else {
          return false;
        }
      }
    },
    //更新滤镜
    getFilterText() {
      var filterText = "";
      //写入图片滤镜
      var filterElements = this.getAllImageFilter;
      for (var i in filterElements) {
        var item = filterElements[i];
        filterText =
          filterText +
          '<filter id="filter_img_' +
          item.id +
          '">' +
          common.getFilterHtml(item) +
          "</filter>";
      }
      //写入阴影
      var shadowElements = this.getAllShadowElements;
      for (var i in shadowElements) {
        var item = shadowElements[i];
        filterText =
          filterText +
          '<filter id="filter_shadow_' +
          item.id +
          '" width="1000%" height="1000%">' +
          '<feGaussianBlur in="SourceAlpha" stdDeviation="' +
          item.edit_config.style.shadow.strength +
          '"/> ' +
          '<feOffset dx="' +
          item.edit_config.style.shadow.distance +
          '" dy="' +
          item.edit_config.style.shadow.distance +
          '" result="offsetblur"/>' +
          '<feComponentTransfer><feFuncA type="linear" slope="' +
          item.edit_config.style.shadow.opacity / 100 +
          '"/></feComponentTransfer>' +
          '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
          "</filter>";
      }
      //获取滤镜文本
      return filterText;
    },
    getElements() {
      //获取非交互组件
      return this.getNowPageData.data;
    },
    guides() {
      return this.$store.state.editor.guides;
    },
    isAllowDrop() {
      return this.$store.state.editor.dragEvent.allowDrop;
    },
    disallowDrop() {
      return this.$store.state.editor.dragEvent.disallowDrop;
    },
    /*getFilterRandomNum(){
			return this.$store.state.editor.filterRandomNum;
		},*/
    //获取所有图片元素，并获取他们的滤镜
    getAllImageFilter() {
      var fileterArr = [];
      for (var i = 0; i < this.getNowPageData.data.length; i++) {
        var item = this.getNowPageData.data[i];
        if (item.type == "image" || item.type == "container") {
          //如果是image元素，则读取他们的filter，如果有一个的值不为0，则加入滤镜
          if (
            item.edit_data.filter.bright != 0 ||
            item.edit_data.filter.contrast != 0 ||
            item.edit_data.filter.saturation != 0 ||
            item.edit_data.filter.hue != 0 ||
            item.edit_data.filter.blur != 0 ||
            item.edit_data.filter.film != 0
          ) {
            var tempFilter = item.edit_data.filter;
            tempFilter.id = item.id;
            fileterArr.push(tempFilter);
          }
        }
      }
      return fileterArr;
    },
    //获取所有开启阴影的元素
    getAllShadowElements() {
      var arr = [];
      for (var i = 0; i < this.getNowPageData.data.length; i++) {
        var item = this.getNowPageData.data[i];
        if (
          item.edit_config.style != undefined &&
          item.edit_config.style.shadow.use
        ) {
          arr.push(item);
        }
      }
      return arr;
    },
    //获取当前悬停项目选择框的样式
    getHoverElementStyle() {
      if (this.hoverElement == null) {
        return;
      } else {
        return {
          left: this.hoverElement.edit_config.left * this.getZoom + "px",
          top: this.hoverElement.edit_config.top * this.getZoom + "px",
          width: this.hoverElement.edit_config.width * this.getZoom + "px",
          height: this.hoverElement.edit_config.height * this.getZoom + "px",
          transform: "rotate(" + this.hoverElement.edit_config.rotation + "deg)"
        };
      }
    },
    //是否自动保存
    autoSave() {
      return this.$store.state.editor.autoSave;
    },
    //获取左侧列表是否打开
    isSourceOpen() {
      return this.$store.state.editor.isSourceOpen;
    },
    isPageOpen() {
      return this.$store.state.editor.isPageOpen;
    },
    //是否锁定编辑器
    lockEditor() {
      return this.$store.state.editor.lock;
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
        return this.$store.state.docData.page[
          this.$store.state.docData.editor.nowPage
        ];
    },
    //获取多选选择框
    getSelectionBox() {
      return this.$store.state.stage.selectionBox;
    },
    //获取正在被选择的单个物体
    getSelectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    lockShow() {
      if (this.getSelectedItem) {
        return this.getSelectedItem.edit_config.lock;
      } else if (this.getSelectionBox.items.length > 0) {
        if (this.getSelectionBox.items[0].edit_config.lock) {
          return true;
        } else {
          return false;
        }
      }
    },
    //获取mouse状态
    getMouse() {
      return this.$store.state.stage.mouse;
    },
    //获取当前正在单选或多选的对象,返回一个数组
    getSelectedItems() {
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
    //获取文档快照表
    getDocSnap() {
      return this.$store.state.stage.docSnap;
    },
    //获取当前的缩放比例
    getZoom() {
      return this.$store.state.stage.zoom / 100;
    },
    //获取svg的宽度
    getSvgWidth() {
      if (this.$store.state.docData.edit_config.unit == "px") {
        //像素
        return this.$store.state.docData.edit_config.width;
      } else if (this.$store.state.docData.edit_config.unit == "mm") {
        //毫米
        return (
          this.$store.state.docData.edit_config.width *
          this.$store.state.docData.edit_config.dpi /
          25.4
        );
      }
    },
    //获取svg的高度
    getSvgHeight() {
      if (this.$store.state.docData.edit_config.unit == "px") {
        //像素
        return this.$store.state.docData.edit_config.height;
      } else if (this.$store.state.docData.edit_config.unit == "mm") {
        //毫米
        return (
          this.$store.state.docData.edit_config.height *
          this.$store.state.docData.edit_config.dpi /
          25.4
        );
      }
    },
    //获取舞台宽高(真实宽高,没有经过zoom计算)
    getStageSize() {
      let dpi =   this.$store.state.docData.edit_config.dpi ;
      if (this.$store.state.docData.edit_config.unit == "px") {
        return {
          width: this.$store.state.docData.edit_config.width,
          height: this.$store.state.docData.edit_config.height
        };
      } else if (this.$store.state.docData.edit_config.unit == "mm") {
        return {
          width:
            this.$store.state.docData.edit_config.width *
            dpi/
            25.4,
          height:
            this.$store.state.docData.edit_config.height *
           dpi /
            25.4
        };
      }
    },
    //获取出血线样式
    getBleedStyle() {
      console.log("this.getZoom", this.getZoom);
      var bleed =
        this.$store.state.docData.edit_config.bleed *
        this.$store.state.docData.edit_config.dpi /
        25.4 *
        this.getZoom;
      return {
        width: this.getSvgWidth * this.getZoom - bleed * 2 + "px",
        height: this.getSvgHeight * this.getZoom - bleed * 2 + "px",
        left: bleed + "px",
        top: bleed + "px"
      };
    },
    //获取折页分割线外围样式
    getSplitSublineStyle() {
      return {
        height: this.getSvgHeight * this.getZoom + "px"
      };
    },
    //获取折页辅助线数量
    getSplitSubline() {
      return this.$store.state.docData.edit_config.splitSubline;
    },
    //获取非舞台物体对比辅助线(折页,手动添加辅助线)
    getGuideArr() {
      var guideArr = [];
      guideArr.push.apply(guideArr, this.subLineGuide);
      //后期可以将标尺的辅助线添加到这里
      return guideArr;
    },
    //获取当前正在编辑的文本
    nowEditText() {
      if (this.$store.state.stage.selectedItem != null) {
        return this.$store.state.stage.selectedItem;
      } else if (this.$store.state.editor.nowEditText != null) {
        return this.$store.state.editor.nowEditText;
      }
    },
    //获取当前正在编辑的组合文本
    nowEditGroupText() {
      return this.$store.state.editor.nowEditGroupText;
    },
    //当前表格的编辑模式,null为非编辑模式,true为编辑模式
    nowEditTable() {
      return this.$store.state.editor.nowEditTable;
    },

    //是否打开了grid
    gridState() {
      return this.$store.state.editor.grid && this.resizer == null;
    },
    docDataEditConfig() {
      return this.$store.state.docData.edit_config;
    },
    docData() {
      return this.$store.state.docData || {};
    }
  },
  //方法
  methods: {
    onSelectionDblClick() {
      let x = this.getMouse.downX;
      let y = this.getMouse.downY;
      //判断这个坐标对应的物体
      var svgCanvas = this.$refs.svg_canvas;
      var hitRect = svgCanvas.createSVGRect();

      hitRect.width = 1;
      hitRect.height = 1;
      hitRect.x = x;
      hitRect.y = y;

      var hitResult = svgCanvas.getIntersectionList(hitRect, null);
      console.log(hitResult);

      var hitList = [];
      var lockList = [];
      for (var i = 0; i < hitResult.length; i++) {
        var item = hitResult[i];
        //找到框元素,搜索他的belong对应的元素
        if ((item.id != item.id.indexOf("rect_")) != -1) {
          for (var a = 0; a < this.getNowPageData.data.length; a++) {
            if (this.getNowPageData.data[a].id == item.id.split("rect_")[1]) {
              if (this.getNowPageData.data[a].edit_config.lock == false) {
                hitList.push(this.getNowPageData.data[a]);
              } else {
                lockList.push(this.getNowPageData.data[a]);
              }
            }
          }
        }
      }
      if (hitList.length > 0) {
        let selectedItem = hitList[0];
        this.$store.commit("setselectedItem", selectedItem);
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
        //搜索当前选中的元素属于哪个组
        this.getNowPageData.edit_config.groups.forEach((groupItem, groupIndex) => {
          groupItem.forEach((groupEleItem, groupEleIndex) => {
            if (
              selectedItem.front_id == groupEleItem ||
              selectedItem.id == groupEleItem
            ) {
              this.groupElementEdit = groupIndex;
            }
          });
        });

        //如果是文本,则进入编辑模式
        /*if(selectedItem.type=='text'){
					this.startTextEdit(selectedItem);
				}*/
      }
    },
    onInteractionLoadHandler(item) {
      console.log("加载完成", item);
      this.$nextTick(() => {
        let iframeWindow = this.$refs["interaction_" + item.id][0]
          .contentWindow;
        iframeWindow.init(item.id, item.edit_data.data);
      });
    },
    //开始调节页面尺寸
    startMoveResizer(type) {
      this.resizer = type;
      this.stopTextEdit();
      this.stopGroupTextEdit();
      this.stopTableCellEdit();
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
    },
    //开始移动参考线
    startMoveGuide(item) {
      this.guides.moving = true;
      this.guides.movingItem = item;
      this.stopTextEdit();
      this.stopGroupTextEdit();
      this.stopTableCellEdit();
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
    },
    getCustomGuideStyle(item) {
      let styleObj = {};
      if (item.type == "x") {
        styleObj.left = item.pos * this.getZoom + this.stageStyle.left + "px";
      } else {
        styleObj.top = item.pos * this.getZoom + this.stageStyle.top + "px";
      }
      styleObj.borderColor = this.$store.state.docData.edit_config.guidesColor;
      return styleObj;
    },

    grabPage(mx, my) {
      var payload = {
        left: this.stageStyle.left + mx,
        top: this.stageStyle.top + my
      };
      this.pageMove(payload);
    },
    maskMousedown(e) {
      this.initGrab = true;
      this.mousePos = {
        x: e.clientX,
        y: e.clientY
      };
    },
    //鸟瞰图触发舞台位置变化
    pageScroll(e) {
        console.log('mousewell');
        console.log(e);

      if (this.$store.state.docData.product == "jianye") {
        this.stageStyle.top += e.wheelDelta * this.getZoom * 0.5;
      } else {
        var type = e.wheelDelta > 0 ? "zoomIn" : "zoomOut";
        this.wheelPos = {
          x: e.clientX,
          y: e.clientY,
          type
        };
        this.$store.commit("setZoom", { type, zoomType: 1 });
        this.$nextTick(() => {
          this.updateSelectionBoxPositionAndSize();
        });
      }
    },
    pageMove(payload) {
      this.stageStyle = {
        ...this.stageStyle,
        left: payload.left,
        top: payload.top
      };
    },
    // 舞台位置
    calcStageLocation(defaultPos) {

      var stageAreaWidth = 0,
        stageAreaHeight = $(window).height() - 50,
        diffWidth = 66,
        canvaWidth = this.getSvgWidth * this.getZoom,
        canvaHeight = this.getSvgHeight * this.getZoom;

      this.$nextTick(() => {
        //stageAreaWidth = $(window).width() - diffWidth;
        stageAreaWidth = $("#stageArea")[0].getBoundingClientRect().width;
        //wheel
        if (this.$store.state.stage.zoomType === 1) {
          this.$store.state.stage.zoomType = 0;

          var rect = this.$refs.stage.getBoundingClientRect();
          var lx = (this.wheelPos.x - rect.left) / this.getZoom,
            ly = (this.wheelPos.y - rect.top) / this.getZoom;
          var delta = this.wheelPos.type == "zoomIn" ? 0.05 : -0.05;
          var offsetX = this.getZoom * lx - (this.getZoom - delta) * lx;
          var offsetY = this.getZoom * ly - (this.getZoom - delta) * ly;
          this.stageStyle = {
            width: canvaWidth,
            height: canvaHeight,
            left: this.stageStyle.left - offsetX,
            top: this.stageStyle.top - offsetY,
            pWidth: stageAreaWidth,
            pHeight: stageAreaHeight
          };
          //判断stage & canva,是否显示鸟瞰图
          this.$nextTick(() => {
            var rect = this.$refs.stage.getBoundingClientRect();
            var areaRect = this.$refs.stageArea.getBoundingClientRect();

            if (
              rect.left < areaRect.left ||
              rect.top < areaRect.top ||
              rect.right > areaRect.right ||
              rect.bottom > areaRect.bottom
            ) {
              this.stageAreaScroll = true;
            } else {
              this.stageAreaScroll = false;
            }
          });
        } else {
          //button

          //判断stage & canva,是否显示鸟瞰图
          if (canvaWidth > stageAreaWidth || canvaHeight > stageAreaHeight) {
            this.stageAreaScroll = true;
          } else {
            this.stageAreaScroll = false;
          }

          this.stageStyle = {
            width: canvaWidth,
            height: canvaHeight,
            left: (stageAreaWidth - canvaWidth) / 2,
            top: (stageAreaHeight - canvaHeight) / 2,
            pWidth: stageAreaWidth,
            pHeight: stageAreaHeight
          };
        }
        if (defaultPos == "top") {
          this.stageStyle.top = 50;
        }
      });
    },
    //更新指定的item的的html
    updateItemHtml(item) {
      //console.log('A');
      item.html = getElementHtml(item, item.index);
      this.update++;
      item.edit_config.left++;
      item.edit_config.left--;
    },
    //更新selectedItems的html
    updateSelectedItemsHtml() {
      //console.log('b');
      for (var i in this.getSelectedItems) {
        this.getSelectedItems[i].html = getElementHtml(
          this.getSelectedItems[i],
          i
        );
      }
      this.update++;
    },
    updateAllItemsHtml() {
      //console.log('c');
      //console.log('页面,',this.getNowPageData);
      for (var i = 0; i < this.getNowPageData.data.length; i++) {
        this.getNowPageData.data[i].html = getElementHtml(
          this.getNowPageData.data[i],
          i
        );
      }
      this.update++;
    },
    //小锁解锁
    unlock() {
      if (this.getSelectedItem != null) {
        this.getSelectedItem.edit_config.lock = false;
      } else {
        this.getSelectionBox.items.forEach(function(item) {
          item.edit_config.lock = false;
        });
      }
    },
    getElementStyle(item) {
      var styleObj = {};
      if (item.edit_config.lock) {
        styleObj.cursor = "default";
      } else {
        styleObj.cursor = "move";
      }
      if (item.ismoving) {
        styleObj.opacity = item.edit_config.opacity / 2;
      } else if (this.groupElementEdit != -1) {
        let finded = false;
        for (let i in this.getNowPageData.edit_config.groups) {
          for (let a in this.getNowPageData.edit_config.groups[i]) {
            if (
              (this.getNowPageData.edit_config.groups[i][a] == item.front_id ||
                this.getNowPageData.edit_config.groups[i][a] == item.id) &&
              this.groupElementEdit == i
            ) {
              //判断进入编辑模式,而且当前选中的元素在group里
              finded = true;
              break;
            }
          }
        }
        if (finded) {
          styleObj.opacity = item.edit_config.opacity;
        } else {
          styleObj.opacity = item.edit_config.opacity / 4;
          styleObj.pointerEvents = "none";
        }
      } else {
        styleObj.opacity = item.edit_config.opacity;
      }
      return styleObj;
    },
    /*
		*框选对齐
		*/
    handleGroupAlign(type) {
      var pos = {
        left: [],
        top: [],
        right: [],
        bottom: [],
        cx: [],
        cy: []
      };
      //取boundingRect
      for (var i = 0; i < this.getSelectedItems.length; i++) {
        var item = this.getSelectedItems[i];
        var box = this.$refs["rect_" + item.id][0].getBoundingClientRect();
        pos.left.push(box.left);
        pos.right.push(box.right);
        pos.bottom.push(box.bottom);
        pos.top.push(box.top);
        pos.cx.push(box.left + box.width / 2);
        pos.cy.push(box.top + box.height / 2);
        box = null;
      }
      // 比较位置，取最大或最小值
      pos.left.unshift(Math.min.apply(null, pos.left));
      pos.right.unshift(Math.max.apply(null, pos.right));
      pos.top.unshift(Math.min.apply(null, pos.top));
      pos.bottom.unshift(Math.max.apply(null, pos.bottom));
      if (type == "left") {
        // 遍历取其他的item
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          var j = i + 1;
          if (pos.left[j] != pos.left[0]) {
            //对齐boundingRect
            var delta = pos.left[j] - pos.left[0];
            //对齐物体
            this.getSelectedItems[i].edit_config.left -= delta / this.getZoom;
          }
        }
      }
      if (type == "top") {
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          var j = i + 1;
          if (pos.top[j] != pos.top[0]) {
            //对齐boundingRect
            var delta = pos.top[j] - pos.top[0];
            //对齐物体
            this.getSelectedItems[i].edit_config.top -= delta / this.getZoom;
          }
        }
      }
      if (type == "right") {
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          var j = i + 1;
          if (pos.right[j] != pos.right[0]) {
            //对齐boundingRect
            var delta = pos.right[j] - pos.right[0];
            //对齐物体
            this.getSelectedItems[i].edit_config.left -= delta / this.getZoom;
          }
        }
      }
      if (type == "bottom") {
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          var j = i + 1;
          if (pos.bottom[j] != pos.bottom[0]) {
            //对齐boundingRect
            var delta = pos.bottom[j] - pos.bottom[0];
            //对齐物体
            this.getSelectedItems[i].edit_config.top -= delta / this.getZoom;
          }
        }
      }
      if (type == "hCenter") {
        this.handleGroupAlign("left");
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          var j = i + 1;
          var deltaLeft = (pos.right[0] - pos.left[0]) / 2;
          var deltaWidth = (pos.left[j] - pos.right[j]) / 2;
          //对齐物体
          this.getSelectedItems[i].edit_config.left +=
            (deltaLeft + deltaWidth) / this.getZoom;
        }
      }
      if (type == "vCenter") {
        this.handleGroupAlign("top");
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          var j = i + 1;
          var deltaTop = (pos.bottom[0] - pos.top[0]) / 2;
          var deltaHeight = (pos.top[j] - pos.bottom[j]) / 2;
          //对齐物体
          this.getSelectedItems[i].edit_config.top +=
            (deltaTop + deltaHeight) / this.getZoom;
        }
      }
      //水平与垂直居中分布
      if (type == "h" || type == "v" ) {
        let eleItems = this.getSelectedItems;
        const pos = [];
            // 排序
            eleItems = eleItems.sort((a, b) => {
              if (type === 'h') {
                return a.edit_config.left - b.edit_config.left;
              } else {
                return a.edit_config.top - b.edit_config.top;
              }
            });
            // 取boundingRect
                    var $stageArea = $("#stageArea");
        var leftOffset =
          this.$refs["stage"].offsetLeft +
          this.$refs["stageArea"].offsetLeft -
          $stageArea.scrollLeft();
        var topOffset =
          this.$refs["stage"].offsetTop +
          this.$refs["stageArea"].offsetTop -
          $stageArea.scrollTop();
            eleItems.forEach(eleItem => {
              const rect = this.$refs["rect_" + eleItem.id][0].getBoundingClientRect();
              const bbox = {
                left:(rect.left-leftOffset) / this.getZoom,
                top:(rect.top-topOffset) / this.getZoom,
                width:(rect.width-leftOffset) / this.getZoom,
                height:(rect.height-topOffset) / this.getZoom
              };
              console.log('bbox',bbox);
              pos.push(bbox);
            });
            let min, max;
            if (type === 'h') {
              min = pos[0].left + (pos[0].width / 2);
              max = pos[pos.length - 1].left + (pos[pos.length - 1].width / 2);
            } else {
              min = pos[0].top + (pos[0].height / 2);
              max = pos[pos.length - 1].top + (pos[pos.length - 1].height / 2);
            }
            const distance = max - min,
              interval = distance / (pos.length - 1);
            // 移动
            eleItems.forEach((eleItem, index) => {
              if (index !== 0 && index !== eleItems.length - 1) {
                if (type === 'h') {
                  eleItem.edit_config.left = min + (index * interval) - (pos[index].width / 2);
                } else {
                  eleItem.edit_config.top = min + (index * interval) - (pos[index].height / 2);
                }
              }
            });
      }
      /*if (type == "h") {
        var min = Math.min.apply(null, pos.cx),
          max = Math.max.apply(null, pos.cx),
          distance = max - min,
          length = pos.cx.length,
          interval = distance / (length - 1),
          setMin = false,
          setMax = false;
        var progress = min;
        //两个物体不执行分布
        if (length == 2) {
          return;
        }
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          if (pos.cx[i] == min && !setMin) {
            setMin = true;
            continue;
          }
          if (pos.cx[i] == max && !setMax) {
            setMax = true;
            continue;
          }
          var j = i + 1;
          progress += interval;
          var deltaInterval = pos.cx[i] - progress;
          //对齐物体
          this.getSelectedItems[i].edit_config.left -=
            deltaInterval / this.getZoom;
        }
      }
      //垂直居中分布
      if (type == "v") {
        var min = Math.min.apply(null, pos.cy),
          max = Math.max.apply(null, pos.cy),
          distance = max - min,
          length = pos.cx.length,
          interval = distance / (length - 1),
          setMin = false,
          setMax = false;
        var progress = min;
        //两个物体不执行分布
        if (length == 2) {
          return;
        }
        for (var i = 0; i < this.getSelectedItems.length; i++) {
          if (!setMin && pos.cy[i] == min) {
            setMin = true;
            continue;
          }
          if (!setMax && pos.cy[i] == max) {
            setMax = true;
            continue;
          }
          var j = i + 1;
          progress += interval;
          var deltaInterval = pos.cy[i] - progress;
          //对齐物体
          this.getSelectedItems[i].edit_config.top -=
            deltaInterval / this.getZoom;
        }
      }*/
      this.$nextTick(function() {
        this.updateSelectionBoxPositionAndSize();
        //eventBus.$emit('stageChange','move');
      });
    },
    /*
		*	容器提示
		*/
    handleSvgMouseenter(item) {
      this.hoverElement = item;
    },
    handleSvgMouseleave(item) {
      this.hoverElement = null;
      if (this.shiftIsDown) {
        return;
      }
    },
    //页面数据相关=============================
    /*
		 *@target 鼠标经过目标（stage,container）
		 *item:container对象(target=stage时，item=undefined)
		 */
    handleDragover(target, item) {
      console.log('dragOver');
      this.$store.state.editor.dragEvent.overTarget = target;
      var drag = this.$store.state.editor.dragEvent;
      if (
        target == "contain" &&
        this.$store.state.editor.dragEvent.type == "image" &&
        item.type == "container"
      ) {
        // 经过
        // 先销毁之前的数据
        if (this.$store.state.editor.dragEvent.overContain) {
          var temp = this.$store.state.editor.dragEvent.overContain;
          for (var i = 0; i < this.$store.state.editor.dragEvent.length; i++) {
            $(this.$refs[temp.id][0])
              .find("svg .kx-rect")
              .css("fill", "none");
          }
          this.$store.state.editor.dragEvent.index = -1;
        }
        //开始判断
        this.$store.state.editor.dragEvent.overContain = item;
        var x = event.clientX,
          y = event.clientY;
        var $svg = $(this.$refs[item.id][0]).find("svg");
        var rect = $svg.find(".kx-rect");
        this.$store.state.editor.dragEvent.length = rect.length;
        for (var i = 0; i < rect.length; i++) {
          var box = rect[i].getBoundingClientRect();
          if (common.mouseoverBox(x, y, box)) {
            $svg
              .find(".kx-rect")
              .eq(i)
              .css("fill", "rgba(0,0,0,.4)");
            this.$store.state.editor.dragEvent.index = i;
          } else {
            $svg
              .find(".kx-rect")
              .eq(i)
              .css("fill", "none");
          }
        }
      } else {
        //移出
        if (this.$store.state.editor.dragEvent.overContain) {
          var item = this.$store.state.editor.dragEvent.overContain;
          for (var i = 0; i < this.$store.state.editor.dragEvent.length; i++) {
            $(this.$refs[item.id][0])
              .find("svg .kx-rect")
              .css("fill", "none");
          }
          this.$store.state.editor.dragEvent.index = -1;
        }
      }
      event.preventDefault();
      event.stopPropagation();
    },
    /*
		 *@target 放置目标（stage,container）
		 *item:container对象(target=stage时，item=undefined)
		 */
    handleDrop(target, item) {
      console.log('handleDrop');
      if (
        target == "contain" &&
        this.$store.state.editor.dragEvent.type == "image" &&
        item.type == "container"
      ) {
        //当放置对象为container&&拖动对象为image
        //执行图片遮罩

        //销毁经过效果
        var contain = this.$store.state.editor.dragEvent.overContain;
        for (var i = 0; i < this.$store.state.editor.dragEvent.length; i++) {
          $(this.$refs[contain.id][0])
            .find("svg .kx-rect")
            .css("fill", "none");
        }
        //开始加载圆环
        //this.$store.state.editor.dragEvent.overContain.edit_data.loading = true;
        var url = this.$store.state.editor.dragEvent.url,
          temp = new Image(),
          _self = this;
        temp.onload = function() {
          //item.edit_data.loading=false;
          var imgWidth = temp.width,
            imgHeight = temp.height;
          var $svgItem = $(item.edit_data.svg),
            index = _self.$store.state.editor.dragEvent.index;

          var clipitem = {},
            $clipImg = $svgItem.find(".kx-image"),
            $rect = $svgItem.find(".kx-rect").eq(index),
            rectWidth = $rect[0].width.baseVal.value,
            rectHeight = $rect[0].height.baseVal.value,
            rectScale = rectWidth / rectHeight,
            imgScale = imgWidth / imgHeight,
            clipWidth,
            clipHeight;
          if (rectScale > imgScale) {
            //svg比图片宽
            clipWidth = rectWidth;
            clipHeight = imgHeight / imgWidth * rectWidth;
          } else {
            clipHeight = rectHeight;
            clipWidth = imgWidth / imgHeight * rectHeight;
          }
          var x = parseFloat($rect.attr("x")) || 0,
            y = parseFloat($rect.attr("y")) || 0;
          var viewArr = $svgItem.attr("viewBox").split(" "),
            translateX = x + rectWidth / 2 - clipWidth / 2,
            translateY = y + rectHeight / 2 - clipHeight / 2;

          //初始化
          clipitem.url = url;
          clipitem.width = clipWidth;
          clipitem.originalWidth = imgWidth;
          clipitem.height = clipHeight;
          clipitem.originalHeight = imgHeight;
          clipitem.left = translateX;
          clipitem.top = translateY;
          clipitem.rotation = 0;
          clipitem.rotateX = 0;
          clipitem.rotateY = 0;
          item.edit_data.clipImg.splice(index, 1, clipitem);
          //销毁全局变量
          _self.$store.state.editor.dragEvent.overContain = undefined;
          _self.$store.state.editor.dragEvent.index = -1;
          //创建快照
          _self.$nextTick(function() {
            //eventBus.$emit('stageChange','edit');
            eventBus.$emit("elementChange", {
              type: "update",
              targets: [item]
            });
          });
        };

        var src = "";
        if (
          common.float(this.$store.state.editor.dragEvent.item.width) > 800 ||
          common.float(this.$store.state.editor.dragEvent.item.height) > 800
        ) {
          src =common.getImageURL(url, 800);;
        } else {
          src = url;
        }

        temp.src = src;
      } else {
        //执行向舞台添加元素
        var stageRect = this.$refs.stage.getBoundingClientRect();
        this.$store.state.editor.dragEvent.drop = {
          target: target,
          x: event.x - stageRect.left,
          y: event.y - stageRect.top
        };
        eventBus.$emit("handleDrop");
      }
      event.preventDefault();
      event.stopPropagation();
    },
    //开始文本编辑模式
    //item:正在编辑的对象
    //grouptextID:正在编辑的组ID
    startTextEdit(item) {
      //console.log('开始编辑',item.data);
      //修改正在编辑的文本
      this.$store.commit("setNowEditText", item);
      //获取当前图形的boundingrect,用于修正编辑框出现时的偏移

      var rect = this.$refs[item.id][0].getBoundingClientRect();

      //隐藏正在编辑的文本
      item.edit_config.visible = false;
      //隐藏正在编辑的文本
      eventBus.$emit("startEdit", {
        rect
      });
      this.update++;
    },
    //结束文本编辑
    stopTextEdit() {
      if (this.$store.state.editor.nowEditText != null) {
        eventBus.$emit("stopEdit");
        const textElement = this.nowEditText;
        this.$nextTick(() => {
          this.updateTextSvg(textElement);
          this.$store.commit("setNowEditText", null);
        });
      }
    },
    //更新文本元素的svg数据
    updateTextSvg(textElement, snap = true, updateArea = false) {
      //获取svg转换结果
      var _self = this;
      socket.textToSvg(textElement.edit_data.textJson, textElement, function(
        e
      ) {
        //显示被隐藏的文本
        textElement.edit_config.visible = true;
        //获取svg的宽和高,重新设定
        var $svgText = $(e.data);
        //---------------------处理宽度----------------------
        //获取原始文本宽度
        let textWidth = parseFloat($svgText.attr("width"));
        //判断editAreaWidth是否小于 $svgText.attr('width')
        if (
          textElement.edit_data.editAreaWidth <
          parseFloat($svgText.attr("width"))
        ) {
          var addWidth = 50;
          if (_self.$store.state.docData.edit_config.unit == "mm") {
            //毫米

            addWidth = _self.$store.state.docData.edit_config.width;
          }
          textElement.edit_data.editAreaWidth =
            parseFloat($svgText.attr("width")) + addWidth;
        }
        //判断textJson是否多行,如果是,则恢复textRadian为0
        if (textElement.edit_data.textJson.length > 1) {
          textElement.edit_data.textRadian = 0;
        }
        if (updateArea) {
          textElement.edit_data.editAreaWidth = parseFloat(
            $svgText.attr("width")
          );
        }

        if (textElement.edit_data.textRadian == 0) {
          //修改宽
          $svgText.attr("width", textElement.edit_data.editAreaWidth);
          //修改viewBox
          const newViewBox = $svgText
            .attr("viewBox")
            .split(" ")
            .map((item, index) => {
              if (index == 2) {
                return textElement.edit_data.editAreaWidth;
              } else {
                return parseFloat(item);
              }
            })
            .join(" ");
          $svgText.attr("viewBox", newViewBox);
          //处理居中和居右

          const align = textElement.edit_data.textJson[0].align;
          if (align == "center") {
            //在最外行包裹g
            let x = textElement.edit_data.editAreaWidth / 2 - textWidth / 2;
            $svgText
              .children("g")
              .wrapAll(`<g id="offset" transform="translate(${x},0)"></g>`);
          } else if (align == "right") {
            let x = textElement.edit_data.editAreaWidth - textWidth;
            $svgText
              .children("g")
              .wrapAll(`<g id="offset" transform="translate(${x},0)"></g>`);
          }

          //---------------------处理宽度----------------------
          if (
            !(
              textElement.edit_data.textRadian != 0 &&
              textElement.edit_data.textJson.length == 1
            )
          ) {
            textElement.edit_config.originalWidth = parseFloat(
              $svgText.attr("width")
            );
            textElement.edit_config.originalHeight = parseFloat(
              $svgText.attr("height")
            );
            textElement.edit_config.width =
              textElement.edit_config.originalWidth;
            textElement.edit_config.height =
              textElement.edit_config.originalHeight;
          }
        } else {
          textElement.edit_data.editAreaWidth = parseFloat(
            $svgText.attr("width")
          );
        }

        textElement.edit_data.svg = $svgText[0].outerHTML;

        if (textElement.addSnap) {
          eventBus.$emit("elementChange", {
            type: "update",
            targets: [textElement],
            snap
          });
        } else {
          textElement.addSnap = true;
          eventBus.$emit("elementChange", {
            type: "add",
            targets: [textElement]
          });
        }
      });
    },
    //开始组合文本编辑模式
    //text:正在编辑的文本对象
    startGroupTextEdit(item, text, rect) {
      text.svg = "";
      this.$nextTick(function() {
        //console.log('亿?',item,text,rect);
        this.$store.commit("setNowEditGroupText", {
          item: item,
          text: text,
          rect: rect
        });
        eventBus.$emit("startGroupEdit");
      });

      //取消选择状态
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
    },
    //结束组合文本编辑模式
    stopGroupTextEdit() {
      if (this.nowEditGroupText != null) {
        this.updateGroupTextSvg(this.nowEditGroupText.item);
        this.$store.commit("setNowEditGroupText", null);
      }
    },
    //获取滤镜文本
    getFilterHtml(item) {
      return common.getFilterHtml(item);
    },

    //获取g元素的transform文本
    getTransformString(svgItem, isRect) {
      this.update;

      var left = svgItem.edit_config.left;
      var top = svgItem.edit_config.top;
      var rotate =
        "rotate(" +
        svgItem.edit_config.rotation +
        "," +
        svgItem.edit_config.rotateX +
        "," +
        svgItem.edit_config.rotateY +
        ")";

      var scaleX = 1;
      var scaleY = 1;

      if (isRect == false) {
        if (svgItem.edit_config.flipX == true) {
          scaleX = -1;
        }
        if (svgItem.edit_config.flipY == true) {
          scaleY = -1;
        }
      }

      var scale = "scale(" + scaleX + "," + scaleY + ")";

      var translate = "translate(" + left + "," + top + ")";
      return [translate, rotate, scale].join(" ");
    },
    //撤销
    undo() {
      if (this.lockEditor == false) {
        this.stopTextEdit();
        this.stopGroupTextEdit();
        this.stopTableCellEdit();
        this.$store.commit("undo");
      }
    },
    //恢复
    redo() {
      if (this.lockEditor == false) {
        this.stopTextEdit();
        this.stopGroupTextEdit();
        this.stopTableCellEdit();
        this.$store.commit("redo");
      }
    },
    //更新grouptext内的文本
    updateGroupTextSvg(item) {
      var _self = this;
      //正在更新组合文字
      var nowText = 0;
      var totalText = item.edit_data.text.length;
      for (var i = 0; i < item.edit_data.text.length; i++) {
        var textItem = item.edit_data.text[i];
        var textData = {
          align: "left",
          lineHeight: 100,
          text: []
        };
        for (var ii = 0; ii < textItem.text.length; ii++) {
          var char = textItem.text.charAt(ii);

          textData.text.push({
            family: textItem.fontFamily,
            size: textItem.fontSize,
            color: textItem.color.newColor,
            italic: 0,
            letterSpacing: 0,
            char: char
          });
        }
        socket.textToSvg([textData], item.edit_data.text[i], function(e) {
          e.target.svg = e.data;

          nowText++;
          if (nowText == totalText) {
            _self.$nextTick(function() {
              console.log("组合文字生成完成");
              _self.update++;
              //eventBus.$emit('stageChange','edit');
              //add的文字会生成一次文字,导致创建文字时会触发add和update两次事件,如果存在了addSnap,则说明这不是第一次添加差UN改建的

              if (item.addSnap == true) {
                eventBus.$emit("elementChange", {
                  type: "update",
                  targets: [item]
                });
              } else {
                item.addSnap = true;
                eventBus.$emit("elementChange", {
                  type: "add",
                  targets: [item]
                });
              }
            });
          }
        });
      }
    },
    //辅助操作=================
    //获取辅助线样式
    //type:辅助线类型
    //val:传入对象属性
    getGuideItemStyle(type, val) {
      if (type == "subline") {
        return {
          left: val.left + "px",
          height: this.getSvgHeight * this.getZoom + "px",
          width: "1px",
          borderLeft: "3px solid red"
        };
      } else if (type == "move") {
        //竖向分割线
        //
        if (val.left != undefined) {
          return {
            left: val.left * this.getZoom + "px",
            top: "0px",
            width: "1px",
            height: this.getSvgHeight * this.getZoom + "px",
            borderLeft: "3px solid red"
          };
        } else if (val.top != undefined) {
          return {
            top: val.top * this.getZoom + "px",
            left: "0px",
            width: this.getSvgWidth * this.getZoom + "px",
            height: "0px",
            borderTop: "3px solid red"
          };
        }
      }
    },

    //辅助线计算
    //now 当前正在被选择的rect对象
    //ele 当前正在被对比的rect对象

    //cx1 cx clientRect偏移(组选择设置为0)
    //cx2 rCx 旋转宽高偏移(组选择设置为0)
    //cy1 cy clientRect偏移(组选择设置为0)
    //cy2 rCy 旋转宽高偏移(组选择设置为0)

    calcGuide(nowObj, eleObj, isGroup) {
      if (isGroup) {
        var x =
          nowObj.left +
          nowObj.width / 2 -
          (eleObj.edit_config.left + eleObj.edit_config.width / 2);
        var y =
          nowObj.top +
          nowObj.height / 2 -
          (eleObj.edit_config.top + eleObj.edit_config.height / 2);
      } else {
        var x =
          nowObj.edit_config.left +
          nowObj.edit_config.width / 2 -
          (eleObj.edit_config.left + eleObj.edit_config.width / 2);
        var y =
          nowObj.edit_config.top +
          nowObj.edit_config.height / 2 -
          (eleObj.edit_config.top + eleObj.edit_config.height / 2);
      }

      //测试范围
      var testRange = 4;
      //计算结果
      var result = {
        left: null,
        top: null
      };
      var distance = 0;

      //计算相对舞台偏移
      var stageOffsetLeft = $("#stage_canvas").offset().left;
      var stageOffsetTop = $("#stage_canvas").offset().top;
      //获取两个元素的外边框
      var meRect = null;
      var anothorRect = this.$refs[
        "rect_" + eleObj.id
      ][0].getBoundingClientRect();

      //计算我自己的旋转偏移
      var meOffsetLeft = 0;
      var meOffsetTop = 0;
      if (isGroup == false) {
        //获取物体本身的clientRect
        meRect = this.$refs["rect_" + nowObj.id][0].getBoundingClientRect();
        var meBBox = this.$refs["rect_" + nowObj.id][0].getBBox();
        //如果我发生旋转,计算旋转后的宽高差
        meOffsetLeft = (meBBox.width * this.getZoom - meRect.width) / 2;
        meOffsetTop = (meBBox.height * this.getZoom - meRect.height) / 2;
      } else {
        meRect = nowObj;
      }
      //判断当前页元素数量,少于10个则不进行距离判断
      var eleNumThreshold = 10;
      if (this.getNowPageData.data.length > eleNumThreshold) {
        //获取我和他的矩形+testRange,检测矩形是否重合,无一重合就返回null
        var a = {
          left: meRect.left - testRange,
          right: meRect.right + testRange,
          top: meRect.top - testRange,
          bottom: meRect.bottom + testRange
        };
        var b = {
          left: anothorRect.left - testRange,
          right: anothorRect.right + testRange,
          top: anothorRect.top - testRange,
          bottom: anothorRect.bottom + testRange
        };
        if (
          a.right < b.left ||
          a.left > b.right ||
          a.top > b.bottom ||
          a.bottom < b.top
        ) {
          return {
            left: null,
            top: null
          };
        }
      }

      //开始判断
      //我的左边对齐他的右边
      distance = meRect.left - anothorRect.right;

      if (Math.abs(distance) < testRange) {
        //console.log('distance A',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.right - stageOffsetLeft - meOffsetLeft) / this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.right - stageOffsetLeft) / this.getZoom;
        //添加
        this.guide.push({ left: guidePosition });
      }

      //我的右边对齐他的左边
      distance = meRect.right - anothorRect.left;
      if (Math.abs(distance) < testRange) {
        //console.log('distance B',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.left - meRect.width - meOffsetLeft - stageOffsetLeft) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition = (anothorRect.left - stageOffsetLeft) / this.getZoom;
        //添加
        this.guide.push({ left: guidePosition });
      }

      //我的上边对齐他的下边
      distance = meRect.top - anothorRect.bottom;
      //	console.log('distance C',distance);
      if (Math.abs(distance) < testRange) {
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.bottom - meOffsetTop - stageOffsetTop) / this.getZoom;
        //计算参考���需要赋值的位置
        var guidePosition =
          (anothorRect.bottom - stageOffsetTop) / this.getZoom;
        //添加
        this.guide.push({ top: guidePosition });
      }

      //我的下边对齐他的上边
      distance = meRect.bottom - anothorRect.top;
      if (Math.abs(distance) < testRange) {
        //console.log('distance D',distance);
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.top - meRect.height - stageOffsetTop - meOffsetTop) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition = (anothorRect.top - stageOffsetTop) / this.getZoom;
        //添加
        this.guide.push({ top: guidePosition });
      }
      //我的左边对齐他的左边
      distance = meRect.left - anothorRect.left;
      if (Math.abs(distance) < testRange) {
        //console.log('distance E',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.left - stageOffsetLeft - meOffsetLeft) / this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition = (anothorRect.left - stageOffsetLeft) / this.getZoom;
        //添加
        this.guide.push({ left: guidePosition });
      }

      //我的右边对齐他的右边
      distance = meRect.right - anothorRect.right;
      if (Math.abs(distance) < testRange) {
        //console.log('distance F',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.right - meRect.width - stageOffsetLeft - meOffsetLeft) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.right - stageOffsetLeft) / this.getZoom;
        //添加
        this.guide.push({ left: guidePosition });
      }

      //我的上边对齐他的上边
      distance = meRect.top - anothorRect.top;
      if (Math.abs(distance) < testRange) {
        //console.log('distance G',distance);
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.top - stageOffsetTop - meOffsetTop) / this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition = (anothorRect.top - stageOffsetTop) / this.getZoom;
        //添加
        this.guide.push({ top: guidePosition });
      }

      //我的下边对齐他的下边
      distance = meRect.bottom - anothorRect.bottom;
      if (Math.abs(distance) < testRange) {
        //console.log('distance H',distance);
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.bottom - meRect.height - stageOffsetTop - meOffsetTop) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.bottom - stageOffsetTop) / this.getZoom;
        //添加
        this.guide.push({ top: guidePosition });
      }

      //我的左边对齐他的宽度一半
      distance = meRect.left - (anothorRect.right - anothorRect.width / 2);
      if (Math.abs(distance) < testRange) {
        //console.log('distance I',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.right -
            anothorRect.width / 2 -
            stageOffsetLeft -
            meOffsetLeft) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.right - anothorRect.width / 2 - stageOffsetLeft) /
          this.getZoom;
        //添加
        this.guide.push({ left: guidePosition });
      }
      //我的右边对齐他的宽度一半
      distance = meRect.right - anothorRect.width / 2 - anothorRect.left;
      if (Math.abs(distance) < testRange) {
        //console.log('distance J',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.right -
            anothorRect.width / 2 -
            meRect.width -
            stageOffsetLeft -
            meOffsetLeft) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.right - anothorRect.width / 2 - stageOffsetLeft) /
          this.getZoom;
        //添加
        this.guide.push({ left: guidePosition });
      }
      //我的上边对齐他的高度一半
      distance = meRect.top - anothorRect.bottom + anothorRect.height / 2;
      if (Math.abs(distance) < testRange) {
        //console.log('distance K',distance);
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.bottom -
            anothorRect.height / 2 -
            stageOffsetTop -
            meOffsetTop) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.bottom - anothorRect.height / 2 - stageOffsetTop) /
          this.getZoom;
        //添加
        this.guide.push({ top: guidePosition });
      }
      //我的下边对齐他的高度一半
      distance = meRect.bottom - anothorRect.top - anothorRect.height / 2;
      if (Math.abs(distance) < testRange) {
        //console.log('distance J',distance);
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.top -
            meRect.height -
            stageOffsetTop -
            meOffsetTop +
            anothorRect.height / 2) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.top + anothorRect.height / 2 - stageOffsetTop) /
          this.getZoom;
        //添加
        this.guide.push({ top: guidePosition });
      }

      //我的宽度一半对齐他的宽度一半
      distance =
        meRect.left +
        meRect.width / 2 -
        (anothorRect.right - anothorRect.width / 2);
      if (Math.abs(distance) < testRange) {
        //console.log('distance K',distance);
        //计算最终需要赋值的位置
        result.left =
          (anothorRect.right -
            anothorRect.width / 2 -
            stageOffsetLeft -
            meOffsetLeft -
            meRect.width / 2) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.right -
            anothorRect.width / 2 -
            stageOffsetLeft -
            meRect.width / 2) /
          this.getZoom;
        //添加
        this.guide.push({
          left:
            (anothorRect.right - anothorRect.width / 2 - stageOffsetLeft) /
            this.getZoom
        });
      }

      //我的高度一半对齐他的高度一半
      distance =
        meRect.top +
        meRect.height / 2 -
        anothorRect.bottom +
        anothorRect.height / 2;
      if (Math.abs(distance) < testRange) {
        //console.log('distance L',distance);
        //计算最终需要赋值的位置
        result.top =
          (anothorRect.bottom -
            anothorRect.height / 2 -
            stageOffsetTop -
            meOffsetTop -
            meRect.height / 2) /
          this.getZoom;
        //计算参考线需要赋值的位置
        var guidePosition =
          (anothorRect.bottom -
            anothorRect.height / 2 -
            stageOffsetTop -
            meRect.height / 2) /
          this.getZoom;
        //添加
        this.guide.push({
          top:
            (anothorRect.bottom - anothorRect.height / 2 - stageOffsetTop) /
            this.getZoom
        });
      }
      //---------------------------------------------------------------------------------------

      if (this.guide.length > 2) {
        this.guide = this.guide.slice(2, this.guide.length - 1);
      }

      return result;
    },
    calcCustomGuide(nowObj, isGroup) {
      //测试范围
      var testRange = 4;
      //计算结果
      var result = {
        left: null,
        top: null
      };
      var distance = 0;

      //计算相对舞台偏移
      var stageOffsetLeft = $("#stage_canvas").offset().left;
      var stageOffsetTop = $("#stage_canvas").offset().top;
      //获取两个元素的外边框
      var meRect = null;

      //计算我自己的旋转偏移
      var meOffsetLeft = 0;
      var meOffsetTop = 0;
      if (isGroup == false) {
        //获取物体本身的clientRect
        meRect = this.$refs["rect_" + nowObj.id][0].getBoundingClientRect();
        var meBBox = this.$refs["rect_" + nowObj.id][0].getBBox();
        //如果我发生旋转,计算旋转后的宽高差
        meOffsetLeft = (meBBox.width * this.getZoom - meRect.width) / 2;
        meOffsetTop = (meBBox.height * this.getZoom - meRect.height) / 2;
      } else {
        meRect = nowObj;
      }

      //对齐非物体辅助线
      var guideArr = this.getGuideArr;

      var distance = 0;
      for (var i = 0; i < guideArr.length; i++) {
        var guideItem = guideArr[i];
        if (guideItem.left != undefined) {
          //对齐我的左边
          distance = meRect.left - (guideItem.left + stageOffsetLeft);
          if (Math.abs(distance) < testRange) {
            result.left = (guideItem.left - meOffsetLeft) / this.getZoom;
          }
          //对齐我的右边
          distance = meRect.right - (guideItem.left + stageOffsetLeft);
          if (Math.abs(distance) < testRange) {
            result.left =
              (guideItem.left - meRect.width - meOffsetLeft) / this.getZoom;
          }
        }
      }

      //对齐舞台左边
      distance = meRect.left - stageOffsetLeft;
      if (Math.abs(distance) < testRange) {
        result.left = -meOffsetLeft / this.getZoom;
      }
      //对齐舞台右边
      distance =
        meRect.left -
        (stageOffsetLeft +
          this.getStageSize.width * this.getZoom -
          meRect.width);
      if (Math.abs(distance) < testRange) {
        result.left =
          (-meOffsetLeft +
            this.getStageSize.width * this.getZoom -
            meRect.width) /
          this.getZoom;
      }
      //对齐舞台上边
      distance = meRect.top - stageOffsetTop;
      if (Math.abs(distance) < testRange) {
        result.top = -meOffsetTop / this.getZoom;
      }
      //对齐舞台下边
      distance =
        meRect.top -
        (stageOffsetTop +
          this.getStageSize.height * this.getZoom -
          meRect.height);
      if (Math.abs(distance) < testRange) {
        result.top =
          (-meOffsetTop +
            this.getStageSize.height * this.getZoom -
            meRect.height) /
          this.getZoom;
      }

      //对齐参考线
      for (let i in this.getCustomGuides) {
        let guideItem = this.getCustomGuides[i];
        if (guideItem.type == "x") {
          //水平参考线,对齐线的左右侧
          distance =
            meRect.left - (stageOffsetLeft + guideItem.pos * this.getZoom);
          if (Math.abs(distance) < testRange) {
            //console.log('对齐参考线左侧');
            result.left = -(meOffsetLeft / this.getZoom) + guideItem.pos;
          }
          distance =
            meRect.left -
            (stageOffsetLeft + guideItem.pos * this.getZoom) +
            meRect.width;
          if (Math.abs(distance) < testRange) {
            //console.log('对齐参考线右侧');
            result.left =
              -(meOffsetLeft / this.getZoom) +
              guideItem.pos -
              meRect.width / this.getZoom;
          }
        } else {
          //垂直参考线,对齐线的上下侧
          distance =
            meRect.top - (stageOffsetTop + guideItem.pos * this.getZoom);
          if (Math.abs(distance) < testRange) {
            //console.log('对齐参考线上侧');
            result.top = -(meOffsetTop / this.getZoom) + guideItem.pos;
          }
          distance =
            meRect.top -
            (stageOffsetTop + guideItem.pos * this.getZoom) +
            meRect.height;
          if (Math.abs(distance) < testRange) {
            //console.log('对齐参考线下侧');
            result.top =
              -(meOffsetTop / this.getZoom) +
              guideItem.pos -
              meRect.height / this.getZoom;
          }
        }
      }
      return result;
    },

    //生成折页辅助线
    createSubLineGuide() {
      if (this.getSplitSubline != 0) {
        var bleed =
          this.$store.state.docData.edit_config.bleed *
          this.$store.state.docData.edit_config.dpi /
          25.4 *
          this.getZoom;
        this.subLineGuide = [];
        if (this.getSplitSubline.toString().indexOf(",") != -1) {
          //指定辅助线

          var splitArr = this.getSplitSubline.split(",");
          for (var i in splitArr) {
            var left =
              parseFloat(splitArr[i]) *
              (this.$store.state.docData.edit_config.dpi / 25.4) *
              this.getZoom;

            var guideObj = {
              left: left
            };
            this.subLineGuide.push(guideObj);
          }
        } else {
          //平均辅助线
          var splitItemWidth =
            (this.getSvgWidth * this.getZoom - bleed * 2) /
            (common.int(this.getSplitSubline) + 1);
          for (var val = 0; val < common.int(this.getSplitSubline); val++) {
            var guideObj = {
              left: splitItemWidth + splitItemWidth * val + bleed
            };
            this.subLineGuide.push(guideObj);
          }
        }
      }
    },
    //元素操作===============

    //添加元素到舞台
    //返回生成element的id
    //type:正在添加的元素类型
    //data:对应元素的数据(例如svg会带着svg xml数据,image带着url)
    //val:通用参数,object,多用途,目前用于传入isBackground(正在添加的元素是否为背景)和position(从左侧列表拖动到舞台松开鼠标后的坐标)
    addElementToStage(type, data, val) {
      //console.log('source',val.source);
      //取消物体选择
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      //退出文本编辑
      this.stopTextEdit();
      this.stopGroupTextEdit();
      this.stopTableCellEdit();
      var _self = this;
      //创建elementObject
      var elementObj = {
        //ID
        id: "",
        //所在页面
        page_id: this.getNowPageData.id,

        //元素类型
        type: type,
        //元素数据
        edit_data: data,
        //元素属性
        edit_config: {
          //尺寸
          width: 0,
          height: 0,
          originalWidth: 0,
          originalHeight: 0,
          //位置
          left: 0,
          top: 0,
          //旋转
          rotation: 0,
          rotateX: 0,
          rotateY: 0,
          //翻转
          flipX: false,
          flipY: false,
          //不透明度
          opacity: 1,
          //锁定
          lock: false,
          //是否显示
          visible: true,
          style: {
            shadow: {
              use: false,
              opacity: 40,
              distance: 1,
              strength: 1
            }
          }
        },
        //是否在移动
        ismoving: false,
        //层级
        index: this.getNowPageData.data.length - 1
      };

      if (this.$store.state.docData.edit_config.unit == "mm") {
        elementObj.edit_config.style.shadow.opacity = 40;
        elementObj.edit_config.style.shadow.distance = 3;
        elementObj.edit_config.style.shadow.strength = 2;
      }
      //加入到舞台

      //获取计数器当前的计数ID

      elementObj.id = "shape_" + common.getNewID();
      //不同元素获取宽高的方式不同,需要区分
      this.addScale = 5;
      switch (type) {
        //svg图像
        case "svg":
        case "pattern":
        case "container":
        case "grid":
          var $elementItem = $(data.svg);
          //获取到原始宽高
          elementObj.edit_config.width = parseFloat($elementItem.attr("width"));
          elementObj.edit_config.height = parseFloat(
            $elementItem.attr("height")
          );
          elementObj.edit_config.originalWidth = elementObj.edit_config.width;
          elementObj.edit_config.originalHeight = elementObj.edit_config.height;

          if (type == "pattern") {
            this.addScale = 2;
          }

          //获取舞台宽度,计算缩放比例
          var zoom = 1;

          //判断是否背景图片,背景图片则铺满
          if (val.isBackground == false) {
            //不是背景图
            if (elementObj.edit_config.width > elementObj.edit_config.height) {
              zoom =
                this.getStageSize.width /
                elementObj.edit_config.width /
                this.addScale;
            } else {
              zoom =
                this.getStageSize.height /
                elementObj.edit_config.height /
                this.addScale;
            }

            elementObj.edit_config.width = elementObj.edit_config.width * zoom;
            elementObj.edit_config.height =
              elementObj.edit_config.height * zoom;

            //初始化舞台上的九宫格图形的缩放大小
            if (type == "grid") {
              //注意，拉伸后重新计算owidth,oheight;
              elementObj.edit_data.owidth = elementObj.edit_config.width;
              elementObj.edit_data.oheight = elementObj.edit_config.height;
              elementObj.edit_data.viewX = elementObj.edit_config.originalWidth;
              elementObj.edit_data.viewY =
                elementObj.edit_config.originalHeight;
              elementObj.edit_data.vscale =
                elementObj.edit_data.viewX / elementObj.edit_data.owidth;
              //暂存数据（拉伸时上一次的总数据）
              elementObj.edit_data.mx = 0;
              elementObj.edit_data.my = 0;
              elementObj.edit_data.sx = 1;
              elementObj.edit_data.sy = 1;
            }
          } else {
            elementObj.edit_config.lock = true;
            //是背景图
            //如果背景图的宽高都大于舞台宽高
            var bgWidth = elementObj.edit_config.width;
            var bgHeight = elementObj.edit_config.height;
            //获取舞台宽高
            var stageWidth = this.getStageSize.width;
            var stageHeight = this.getStageSize.height;
            //获取宽高比例
            var scale = Math.max(stageWidth / bgWidth, stageHeight / bgHeight);
            if (bgWidth >= stageWidth && bgHeight >= stageHeight) {
              //元素宽度大于舞台宽度
              //元素高度大于舞台高度
              elementObj.edit_config.width =
                elementObj.edit_config.width * scale;
              elementObj.edit_config.height =
                elementObj.edit_config.height * scale;
            } else if (bgWidth > stageWidth && bgHeight < stageHeight) {
              //元素宽度大于舞台宽度
              //元素高度小于舞台高度
              elementObj.edit_config.width =
                elementObj.edit_config.width * (stageHeight / bgHeight);
              elementObj.edit_config.height = elementObj.edit_config.height;
            } else if (bgWidth < stageWidth && bgHeight > stageHeight) {
              //元素宽度小于舞台宽度
              //元素高度大于舞台高度
              elementObj.edit_config.width = elementObj.edit_config.width;
              elementObj.edit_config.height =
                elementObj.edit_config.height * (stageWidth / bgWidth);
            } else {
              //元素宽度小于舞台宽度
              //元素高度小于舞台高度
              elementObj.edit_config.width =
                elementObj.edit_config.width * scale;
              elementObj.edit_config.height =
                elementObj.edit_config.height * scale;
            }
          }

          //修改rotate中心坐标
          elementObj.edit_config.rotateX = elementObj.edit_config.width / 2;
          elementObj.edit_config.rotateY = elementObj.edit_config.height / 2;

          if (val.position != undefined) {
            elementObj.edit_config.left =
              parseFloat(val.position.left) / this.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              parseFloat(val.position.top) / this.getZoom -
              elementObj.edit_config.height / 2;
          } else {
            /*elementObj.edit_config.left = (this.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
            elementObj.edit_config.top = (this.getStageSize.height / 2) - (elementObj.edit_config.height / 2);*/
             if (val.isBackground == false) {
            elementObj.edit_config.left =
              -this.stageStyle.left / this.getZoom +
              this.stageStyle.pWidth / 2 / this.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              -this.stageStyle.top / this.getZoom +
              this.stageStyle.pHeight / 2 / this.getZoom -
              elementObj.edit_config.height / 2;
             }else{
               elementObj.edit_config.left = (this.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
            elementObj.edit_config.top = (this.getStageSize.height / 2) - (elementObj.edit_config.height / 2);
             }

          }

          //生成请求参数
          elementObj.tpl_id = this.$store.state.docData.id;
          elementObj.page_id = this.getNowPageData.id;

          _self.$store.commit("addElementToStage", {
            obj: elementObj,
            isBackground: val.isBackground
          });
          for (var a = 0; a < this.getNowPageData.data.length; a++) {
            this.getNowPageData.data[a].index = a;
          }
          if (val.isBackground) {
            //eventBus.$emit('stageChange', 'setBackground');
            //添加元素到舞台,并设置backgroundid
            eventBus.$emit("elementChange", {
              type: "add",
              targets: [elementObj],
              step: false
            });
            //更新backgroundID
            eventBus.$emit("pageChange", {
              type: "update",
              targets: [this.getNowPageData]
            });
            //更新本页所有元素的Index
            eventBus.$emit("elementChange", {
              type: "update",
              targets: this.getNowPageData.data,
              snap: false,
              update: false,
              commitType: "onlyIndex"
            });
          } else {
            //eventBus.$emit('stageChange', 'add');
            //添加元素到舞台
            eventBus.$emit("elementChange", {
              type: "add",
              targets: [elementObj]
            });
          }

          break;
        //位图
        case "image":
          if (val.source.imgTemp != undefined) {
            elementObj.imgTemp = val.source.imgTemp;
          }
          var finalWidth = parseFloat(val.source.width);
          var finalHeight = parseFloat(val.source.height);

          //图片加载完成,获取宽高
          elementObj.edit_config.originalWidth = finalWidth;
          elementObj.edit_config.originalHeight = finalHeight;

          elementObj.edit_config.width = finalWidth;
          elementObj.edit_config.height = finalHeight;
          elementObj.edit_data.clip = {
            left: 0,
            top: 0,
            width: finalWidth,
            height: finalHeight
          };

          var zoom = 1;
          //判断是否背景图片,背景图片则铺满
          if (val.isBackground == false) {
            //不是背景图

            if (elementObj.edit_config.width > elementObj.edit_config.height) {
              zoom =
                _self.getStageSize.width /
                elementObj.edit_config.width /
                _self.addScale;
            } else {
              zoom =
                _self.getStageSize.height /
                elementObj.edit_config.height /
                _self.addScale;
            }
            elementObj.edit_config.width = elementObj.edit_config.width * zoom;
            elementObj.edit_config.height =
              elementObj.edit_config.height * zoom;
          } else {
            elementObj.edit_config.lock = true;

            //如果背景图的宽高都大于舞台宽高
            var bgWidth = elementObj.edit_config.width;
            var bgHeight = elementObj.edit_config.height;
            //获取舞台宽高
            var stageWidth = _self.getStageSize.width;
            var stageHeight = _self.getStageSize.height;
            //获取宽高比例
            var scale = Math.max(stageWidth / bgWidth, stageHeight / bgHeight);
            if (bgWidth >= stageWidth && bgHeight >= stageHeight) {
              //元素宽度大于舞台宽度
              //元素高度大于舞台高度
              elementObj.edit_config.width =
                elementObj.edit_config.width * scale;
              elementObj.edit_config.height =
                elementObj.edit_config.height * scale;
            } else if (bgWidth > stageWidth && bgHeight < stageHeight) {
              //元素宽度大于舞台宽度
              //元素高度小于舞台高度
              elementObj.edit_config.width =
                elementObj.edit_config.width * scale;
              elementObj.edit_config.height =
                elementObj.edit_config.height * scale;
              console.log("B");
            } else if (bgWidth < stageWidth && bgHeight > stageHeight) {
              //元素宽度小于舞台宽度
              //元素高度大于舞台高度
              elementObj.edit_config.width = elementObj.edit_config.width;
              elementObj.edit_config.height =
                elementObj.edit_config.height * (stageWidth / bgWidth);
            } else {
              //元素宽度小于舞台宽度
              //元素高度小于舞台高度
              elementObj.edit_config.width =
                elementObj.edit_config.width * scale;
              elementObj.edit_config.height =
                elementObj.edit_config.height * scale;
            }
          }

          elementObj.edit_config.rotateX = elementObj.edit_config.width / 2;
          elementObj.edit_config.rotateY = elementObj.edit_config.height / 2;

          if (val.position != undefined) {
            elementObj.edit_config.left =
              parseFloat(val.position.left) / _self.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              parseFloat(val.position.top) / _self.getZoom -
              elementObj.edit_config.height / 2;
          } else {
               if (val.isBackground == false) {
                             elementObj.edit_config.left =
              -this.stageStyle.left / this.getZoom +
              this.stageStyle.pWidth / 2 / this.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              -this.stageStyle.top / this.getZoom +
              this.stageStyle.pHeight / 2 / this.getZoom -
              elementObj.edit_config.height / 2;
               }else{
                 elementObj.edit_config.left = (_self.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
            elementObj.edit_config.top = (_self.getStageSize.height / 2) - (elementObj.edit_config.height / 2);
               }

          }

          //生成请求参数
          elementObj.tpl_id = _self.$store.state.docData.id;
          elementObj.page_id = _self.getNowPageData.id;

          //手动保存
          _self.$store.commit("addElementToStage", {
            obj: elementObj,
            isBackground: val.isBackground
          });

          if (val.isBackground) {
            for (var a = 0; a < this.getNowPageData.data.length; a++) {
              this.getNowPageData.data[a].index = a;
            }
            eventBus.$emit("elementChange", {
              type: "add",
              targets: [elementObj],
              step: false
            });
            //更新backgroundID
            eventBus.$emit("pageChange", {
              type: "update",
              targets: [this.getNowPageData]
            });
            //更新本页所有元素的Index
            eventBus.$emit("elementChange", {
              type: "update",
              targets: this.getNowPageData.data,
              snap: false,
              commitType: "onlyIndex"
            });
          } else {
            //eventBus.$emit('stageChange', 'add');
            eventBus.$emit("elementChange", {
              type: "add",
              targets: [elementObj]
            });
          }

          /*	//删除加载事件
						this.onload = function () {}
					};*/
          //这里没有生成svg数据,去添加一个data-parent属性,注意getElementHtml时要给纯图片添加一个data-parent
          break;
        //文本
        case "text":
        case "groupText":
          var $elementItem = $(data.svg);
          //获取到原始宽高
          elementObj.edit_config.width = parseFloat($elementItem.attr("width"));
          elementObj.edit_config.height = parseFloat(
            $elementItem.attr("height")
          );
          elementObj.edit_config.originalWidth = elementObj.edit_config.width;
          elementObj.edit_config.originalHeight = elementObj.edit_config.height;
          //获取舞台宽度,计算缩放比例
          var zoom = 1;

          //不是背景图
          if (elementObj.edit_config.width > elementObj.edit_config.height) {
            zoom =
              this.getStageSize.width /
              elementObj.edit_config.width /
              this.addScale;
          } else {
            zoom =
              this.getStageSize.height /
              elementObj.edit_config.height /
              this.addScale;
          }

          elementObj.edit_config.width = elementObj.edit_config.width * zoom;
          elementObj.edit_config.height = elementObj.edit_config.height * zoom;

          //修改rotate中心坐标
          elementObj.edit_config.rotateX = elementObj.edit_config.width / 2;
          elementObj.edit_config.rotateY = elementObj.edit_config.height / 2;

          if (val.position != undefined) {
            elementObj.edit_config.left =
              parseFloat(val.position.left) / this.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              parseFloat(val.position.top) / this.getZoom -
              elementObj.edit_config.height / 2;
          } else {
            /*elementObj.edit_config.left = (this.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
						elementObj.edit_config.top = (this.getStageSize.height / 2) - (elementObj.edit_config.height / 2);*/
            elementObj.edit_config.left =
              -this.stageStyle.left / this.getZoom +
              this.stageStyle.pWidth / 2 / this.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              -this.stageStyle.top / this.getZoom +
              this.stageStyle.pHeight / 2 / this.getZoom -
              elementObj.edit_config.height / 2;
          }

          //生成请求参数
          elementObj.tpl_id = _self.$store.state.docData.id;
          elementObj.page_id = _self.getNowPageData.id;

          //手动保存
          _self.$store.commit("addElementToStage", {
            obj: elementObj,
            isBackground: false
          });

          for (var a = 0; a < this.getNowPageData.data.length; a++) {
            this.getNowPageData.data[a].index = a;
          }

          if (type == "groupText") {
            _self.updateGroupTextSvg(elementObj);
          } else {
            //进入编辑状态
            _self.$nextTick(function() {
              //进入生成textJson后退出
              //获取第一个文字的大小
              _self.startTextEdit(elementObj);
              _self.$nextTick(function() {
                _self.stopTextEdit();
              });
            });
          }

          break;
        //表格
        case "table":
          var defaultWidth = 500;
          var defaultHeight = 300;
          _self.addScale = 2;
          //图片加载完成,获取宽高
          elementObj.edit_config.width = defaultWidth;
          elementObj.edit_config.height = defaultHeight;

          elementObj.edit_config.originalWidth = defaultWidth;
          elementObj.edit_config.originalHeight = defaultHeight;

          var zoom = 1;
          //判断是否背景图片,背景图片则铺满

          if (elementObj.edit_config.width > elementObj.edit_config.height) {
            zoom =
              _self.getStageSize.width /
              elementObj.edit_config.width /
              _self.addScale;
          } else {
            zoom =
              _self.getStageSize.height /
              elementObj.edit_config.height /
              _self.addScale;
          }
          elementObj.edit_config.width = elementObj.edit_config.width * zoom;
          elementObj.edit_config.height = elementObj.edit_config.height * zoom;

          elementObj.edit_config.rotateX = elementObj.edit_config.width / 2;
          elementObj.edit_config.rotateY = elementObj.edit_config.height / 2;

          if (val.position != undefined) {
            elementObj.edit_config.left =
              parseFloat(val.position.left) / _self.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              parseFloat(val.position.top) / _self.getZoom -
              elementObj.edit_config.height / 2;
          } else {
            /*elementObj.edit_config.left = (_self.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
						elementObj.edit_config.top = (_self.getStageSize.height / 2) - (elementObj.edit_config.height / 2);*/
            elementObj.edit_config.left =
              -this.stageStyle.left / this.getZoom +
              this.stageStyle.pWidth / 2 / this.getZoom -
              elementObj.edit_config.width / 2;
            elementObj.edit_config.top =
              -this.stageStyle.top / this.getZoom +
              this.stageStyle.pHeight / 2 / this.getZoom -
              elementObj.edit_config.height / 2;
          }

          //生成请求参数
          elementObj.tpl_id = _self.$store.state.docData.id;
          elementObj.page_id = _self.getNowPageData.id;

          //手动保存
          _self.$store.commit("addElementToStage", {
            obj: elementObj,
            isBackground: val.isBackground
          });

          //eventBus.$emit('stageChange', 'add');
          eventBus.$emit("elementChange", {
            type: "add",
            targets: [elementObj]
          });

          break;
        //交互组件
        case "interaction":
          let defaultWidth = 0;
          let defaultHeight = 0;

          let defaultConfig = elementObj.edit_data.config;
          if (defaultConfig.defaultWidth == "auto") {
            defaultWidth = _self.getStageSize.width;
          } else {
            defaultWidth = defaultConfig.defaultWidth;
          }

          if (defaultConfig.defaultHeight == "auto") {
            defaultHeight = _self.getStageSize.height;
          } else {
            defaultHeight = defaultConfig.defaultHeight;
          }
          //图片加载完成,获取宽高
          elementObj.edit_config.width = defaultWidth;
          elementObj.edit_config.height = defaultHeight;

          elementObj.edit_config.originalWidth = defaultWidth;
          elementObj.edit_config.originalHeight = defaultHeight;

          elementObj.edit_config.rotateX = elementObj.edit_config.width / 2;
          elementObj.edit_config.rotateY = elementObj.edit_config.height / 2;

          /*if (val.position != undefined) {
						elementObj.edit_config.left = parseFloat(val.position.left) / _self.getZoom - (elementObj.edit_config.width / 2);
						elementObj.edit_config.top = parseFloat(val.position.top) / _self.getZoom - (elementObj.edit_config.height / 2);
					} else {
						elementObj.edit_config.left = (_self.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
						elementObj.edit_config.top = (_self.getStageSize.height / 2) - (elementObj.edit_config.height / 2);
						elementObj.edit_config.left = (-this.stageStyle.left/this.getZoom)+(this.stageStyle.pWidth/2/this.getZoom) - (elementObj.edit_config.width / 2);
						elementObj.edit_config.top =(-this.stageStyle.top/this.getZoom)+(this.stageStyle.pHeight/2/this.getZoom) - (elementObj.edit_config.height / 2);
					}*/

          if (elementObj.edit_data.module == "form") {
            let maxBottom = 0;
            for (let i = 0; i < this.getNowPageData.data.length; i++) {
              let eleItem = this.getNowPageData.data[i];

              let bottom = eleItem.edit_config.top + eleItem.edit_config.height;
              if (bottom > maxBottom) {
                maxBottom = bottom;
              }
            }
            elementObj.edit_config.left =
              _self.getStageSize.width / 2 - elementObj.edit_config.width / 2;
            elementObj.edit_config.top = maxBottom;
          } else {
            if (val.position != undefined) {
              elementObj.edit_config.left =
                parseFloat(val.position.left) / _self.getZoom -
                elementObj.edit_config.width / 2;
              elementObj.edit_config.top =
                parseFloat(val.position.top) / _self.getZoom -
                elementObj.edit_config.height / 2;
            } else {
              /*elementObj.edit_config.left = (_self.getStageSize.width / 2) - (elementObj.edit_config.width / 2);
						elementObj.edit_config.top = (_self.getStageSize.height / 2) - (elementObj.edit_config.height / 2);*/
              elementObj.edit_config.left =
                -this.stageStyle.left / this.getZoom +
                this.stageStyle.pWidth / 2 / this.getZoom -
                elementObj.edit_config.width / 2;
              elementObj.edit_config.top =
                -this.stageStyle.top / this.getZoom +
                this.stageStyle.pHeight / 2 / this.getZoom -
                elementObj.edit_config.height / 2;
            }
          }
          //生成请求参数
          elementObj.tpl_id = _self.$store.state.docData.id;
          elementObj.page_id = _self.getNowPageData.id;

          //手动保存
          _self.$store.commit("addElementToStage", {
            obj: elementObj,
            isBackground: val.isBackground
          });

          break;
      }

      //console.log('elementObj', elementObj);

      return elementObj.id;
    },

    //删除元素
    removeElement() {
      var items = this.getSelectedItems;
      //检查是否有一个或者多个被锁定
      for (let i in items) {
        if (items[i].edit_config.lock) {
          return;
        }
      }
      if (items != null && items.length > 0) {
        //eventBus.$emit('stageChange','remove');
        let temp_selectedGroup = this.selectedGroup;

        eventBus.$emit("elementChange", {
          type: "remove",
          targets: items,
          step: !(this.selectedGroup == -1)
        });

        for (var i = 0; i < items.length; i++) {
          //检查items[i]是否存在于groups内,如果存在则将其从对应组剔除
          let groups = this.getNowPageData.edit_config.groups;
          let newGroups = groups
            .map(groupItem => {
              return groupItem.filter(eleItem => {
                return eleItem != items[i].id && eleItem != items[i].front_id;
              });
            })
            .filter(item => {
              return item.length > 0;
            });
          this.getNowPageData.edit_config.groups = newGroups;
          //** end **/
          for (var a = 0; a < this.getNowPageData.data.length; a++) {
            if (this.getNowPageData.data[a].id == items[i].id) {
              if (
                this.getNowPageData.data[a].id ==
                this.getNowPageData.edit_config.backgroundID
              ) {
                this.getNowPageData.edit_config.backgroundID = "";
              }
              this.getNowPageData.data.splice(a, 1);
              break;
            }
          }
        }
        if (temp_selectedGroup) {
          eventBus.$emit("infoChange", { type: "group" });
        }
        //console.log('删除元素结束',this.getNowPageData.deleteElements);
        //取消选择状态
        this.$store.commit("setselectedItem", null);
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      }
    },
    //粘贴
    pasteElement() {
      let _self = this;
      let copyDataObj = {};
      let strogeData = localStorage.getItem("crossPageCopyData");
      if (strogeData != undefined && strogeData != "undefined") {
        copyDataObj = JSON.parse(localStorage.crossPageCopyData);
      } else {
        copyDataObj = this.$store.state.stage.copyData;
      }
      var copyObjArr = [];
      var CopyObjIdArr = [];

      let copyArr = copyDataObj.copyData;

      if (copyArr.length > 0) {
        let newGroupItem = [];
        for (var i = 0; i < copyArr.length; i++) {
          let copyObj = JSON.parse(copyArr[i]);
          CopyObjIdArr.push(copyObj.id);
          var from_page_id = copyObj.page_id;
          copyObj.edit_config.left = copyObj.edit_config.left + 10;
          copyObj.edit_config.top = copyObj.edit_config.top + 10;
          //更新计数
          copyObj.id = "shape_" + common.getNewID();
          copyObj.front_id=undefined;
          newGroupItem.push(copyObj.id);

          //生成请求参数
          copyObj.tpl_id = this.$store.state.docData.id;
          copyObj.page_id = this.getNowPageData.id;
          copyObjArr.push(copyObj);
          //if(this.autoSave==false){
          this.getNowPageData.data.push(copyObj);
        }

        if (copyDataObj.isGroup != -1) {
          this.getNowPageData.edit_config.groups.push(newGroupItem);
          console.log(
            "添加到group",
            newGroupItem,
            "->",
            this.getNowPageData.edit_config.groups
          );
          eventBus.$emit("infoChange", { type: "group", step: false });
        }

        //更新当前的选择内容
        if (copyObjArr.length == 1) {
          _self.$nextTick(function() {
            _self.$store.commit("setselectedItem", copyObjArr[0]);
            _self.$store.commit("setSelectionBox", [
              { name: "items", val: [] }
            ]);
          });
        } else if (copyObjArr.length > 1) {
          _self.$nextTick(function() {
            _self.$store.commit("setselectedItem", null);
            _self.$store.commit("setSelectionBox", [
              { name: "items", val: copyObjArr }
            ]);
            _self.updateSelectionBoxPositionAndSize();
          });
        }
        //eventBus.$emit('stageChange','paste');
        eventBus.$emit("elementChange", {
          type: "add",
          targets: copyObjArr
        });
      }
    },
    //移动正在选择的元素
    moveElement(left, top) {
      if (
        this.$store.state.editor.nowEditText != null ||
        this.nowEditGroupText != null ||
        this.nowEditTable != null
      ) {
        return;
      }
      var leftVal = left;
      var topVal = top;

      for (var i = 0; i < this.getSelectedItems.length; i++) {
        if (this.getSelectedItems[i].edit_config.lock == false) {
          this.getSelectedItems[i].edit_config.left =
            this.getSelectedItems[i].edit_config.left + leftVal;
          this.getSelectedItems[i].edit_config.top =
            this.getSelectedItems[i].edit_config.top + topVal;
        }
      }
      if (this.getSelectedItems.length > 0) {
        this.$nextTick(function() {
          this.updateSelectionBoxPositionAndSize();
        });
        //eventBus.$emit('stageChange','Multmove');
        eventBus.$emit("elementChange", {
          type: "update",
          targets: this.getSelectedItems
        });
      }
    },
    //选择变形工具相关=============================

    //框选模式即将结束,获取碰撞对象,并进入选择状态
    selectionBoxSelected(obj) {

      var svgCanvas = this.$refs.svg_canvas;
      var hitRect = svgCanvas.createSVGRect();

      if (obj == undefined) {
        hitRect.width = this.getSelectionBox.width;
        hitRect.height = this.getSelectionBox.height;
        hitRect.x = this.getSelectionBox.left;
        hitRect.y = this.getSelectionBox.top;
      } else {
        hitRect.width = obj.width;
        hitRect.height = obj.height;
        hitRect.x = obj.left;
        hitRect.y = obj.top;
      }

      var hitResult = svgCanvas.getIntersectionList(hitRect, null);

      console.log('hitResult:');
      console.log(hitResult);


      var hitList = [];
      var lockList = [];
      for (var i = 0; i < hitResult.length; i++) {
        var item = hitResult[i];
        //找到框元素,搜索他的belong对应的元素
        if ((item.id != item.id.indexOf("rect_")) != -1) {
          for (var a = 0; a < this.getNowPageData.data.length; a++) {
            if (this.getNowPageData.data[a].id == item.id.split("rect_")[1]) {
              if (this.getNowPageData.data[a].edit_config.lock == false) {
                hitList.push(this.getNowPageData.data[a]);
              } else {
                lockList.push(this.getNowPageData.data[a]);
              }
            }
          }
        }
      }

      //已经获取到选择结果了
      if (obj != undefined) {
        hitList = hitList.filter((item, index) => {
          if (index == 0) {
            return true;
          } else {
            return false;
          }
        });
      }
      //循环hitList,在groups内搜索,如果存在,则将组里的元素全部加入到hitList
      hitList.forEach(hitItem => {
        //搜索hitItem是否存在groups里
        this.getNowPageData.edit_config.groups.forEach(groupItem => {
          groupItem.forEach(groupEleItem => {
            if (
              groupEleItem == hitItem.front_id ||
              groupEleItem == hitItem.id
            ) {
              //把整个组的元素都加入hitList
              //判断是否已加入hitList,如果没有则寻找并加入
              groupItem.forEach(groupEleItem => {
                if (
                  groupEleItem != hitItem.front_id &&
                  groupEleItem != hitItem.id
                ) {
                  //查找groupEleItem的本身的元素
                  for (let a = 0; a < this.getNowPageData.data.length; a++) {
                    let eleItem = this.getNowPageData.data[a];
                    if (
                      eleItem.front_id == groupEleItem ||
                      eleItem.id == groupEleItem
                    ) {
                      //判断eleItem是否存在于hitList
                      if (
                        common.findArrayIndex(hitList, "id", eleItem.id) == -1
                      ) {
                        hitList.push(eleItem);
                      }

                      break;
                    }
                  }
                }
              });
            }
          });
        });
      });

      if (hitList.length == 1) {
        //只选择了一个
        //console.log('只选择了一个');
        this.$store.commit("setselectedItem", hitList[0]);
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      } else if (hitList.length > 1) {
        //选择多个,提交到vuex
        //console.log('选择多个,提交到vuex');
        this.$store.commit("setselectedItem", null);
        this.$store.commit("setSelectionBox", [
          { name: "items", val: hitList }
        ]);
      }
      // 框选锁定元素
      if (hitList.length == 0 && lockList.length == 1) {
        this.$store.commit("setselectedItem", lockList[0]);
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      }
      if (hitList.length == 0 && lockList.length > 1) {
        this.$store.commit("setselectedItem", null);
        this.$store.commit("setSelectionBox", [
          { name: "items", val: lockList }
        ]);
      }
    },
    //更新组选择外边框尺寸
    updateSelectionBoxPositionAndSize() {
      var Result = this.$store.state.stage.selectionBox.items;
      if (Result.length > 0) {
        var $stageArea = $("#stageArea");
        var leftOffset =
          this.$refs["stage"].offsetLeft +
          this.$refs["stageArea"].offsetLeft -
          $stageArea.scrollLeft();
        var topOffset =
          this.$refs["stage"].offsetTop +
          this.$refs["stageArea"].offsetTop -
          $stageArea.scrollTop();
        var finalLeft = null;
        var finalRight = null;
        var finalTop = null;
        var finalBottom = null;
        //遍历所有选中的items,获取四边框
        for (var c = 0; c < Result.length; c++) {
          //获取rect

          //console.log('ID',Result[c].id);
          var rect = this.$refs[
            "rect_" + Result[c].id
          ][0].getBoundingClientRect();

          var left = rect.left - leftOffset;
          var right = rect.right - leftOffset;
          var top = rect.top - topOffset;
          var bottom = rect.bottom - topOffset;

          if (finalLeft == null) {
            finalLeft = left;
          }
          if (finalRight == null) {
            finalRight = right;
          }
          if (finalTop == null) {
            finalTop = top;
          }
          if (finalBottom == null) {
            finalBottom = bottom;
          }

          if (left < finalLeft) {
            finalLeft = left;
          }
          if (top < finalTop) {
            finalTop = top;
          }

          if (right > finalRight) {
            finalRight = right;
          }
          if (bottom > finalBottom) {
            finalBottom = bottom;
          }
        }
        this.selectionBoxRect.left = finalLeft;
        this.selectionBoxRect.top = finalTop;
        this.selectionBoxRect.width = finalRight - finalLeft;
        this.selectionBoxRect.height = finalBottom - finalTop;
      }
    },
    //获取选择框的对应的属性
    getSelectionAttr(name, val) {
      //获取selction-tool整个外边框的style
      if (name == "mainSyle") {
        var borderColor = "";
        if (this.getSelectedItem != null) {
          var styleObj = {
            left: this.getSelectedItem.edit_config.left * this.getZoom + "px",
            top: this.getSelectedItem.edit_config.top * this.getZoom + "px",
            width:
              Math.abs(
                this.getSelectedItem.edit_config.width * this.getZoom + 1
              ) + "px",
            height:
              Math.abs(
                this.getSelectedItem.edit_config.height * this.getZoom + 1
              ) + "px",
            transform:
              "rotate(" + this.getSelectedItem.edit_config.rotation + "deg)",
            transformOrigin:
              this.getSelectedItem.edit_config.rotateX * this.getZoom +
              "px " +
              this.getSelectedItem.edit_config.rotateY * this.getZoom +
              "px",
            borderColor: this.getSelectedItem.edit_config.lock
              ? "#ff4d00"
              : "#00a2eb"
          };
          //如果当前选中的单个元素超出了舞台范围.则为pointer-events设置为auto
          let eleRect = this.$refs[
            "rect_" + this.getSelectedItem.id
          ][0].getBoundingClientRect();
          let stageRect = this.$refs["svg_canvas"].getBoundingClientRect();

          if (
            eleRect.left > stageRect.right ||
            eleRect.right < stageRect.left ||
            eleRect.top > stageRect.bottom ||
            eleRect.bottom < stageRect.top
          ) {
            styleObj.pointerEvents = "auto";
            styleObj.cursor = "move";
          }

          return styleObj;
        } else if (this.getSelectionBox.items.length > 0) {
            console.log(this.getSelectionBox);
          var styleObj = {
            left: this.selectionBoxRect.left + "px",
            top: this.selectionBoxRect.top + "px",
            width: this.selectionBoxRect.width + "px",
            height: this.selectionBoxRect.height + "px",
            cursor: this.getSelectionBox.items[0].edit_config.lock
              ? "default"
              : "move",
            borderColor: this.getSelectionBox.items[0].edit_config.lock
              ? "#ff4d00"
              : "#00a2eb"
          };
          if (this.shiftIsDown) {
            styleObj.pointerEvents = "none";
          } else {
            styleObj.pointerEvents = "auto";
          }

          return styleObj;
        } else {
          return {};
        }
      } else if (name == "show") {
        //是否显示外边框
        if (this.getSelectedItem != null) {
          if (
            this.getSelectionBox.width > 0 ||
            this.getSelectionBox.height > 0
          ) {
            return false;
          } else if (this.$store.state.editor.modal["cropper"]) {
            return false;
          } else {
            if (this.nowEditTable == null) {
              return true;
            } else {
              return false;
            }
          }
        } else if (this.getSelectionBox.items.length > 0) {
          return true;
        } else {
          return false;
        }
      } else if (name == "cursor") {
        //获取在当前角度下的真实箭头方向
        if (this.getSelectedItem != null) {
          //获取角度
          var angel = this.getSelectedItem.edit_config.rotation % 360;
        } else {
          var angel = 0;
        }

        //判定情况
        var curResult = "";
        var curObj = null;
        if (angel >= 0 && angel <= 45) {
          curObj = {
            e: "e",
            s: "s",
            se: "se"
          };
        } else if (angel >= 45 && angel <= 90) {
          curObj = {
            e: "se",
            s: "sw",
            se: "s"
          };
        } else if (angel >= 90 && angel <= 135) {
          curObj = {
            e: "s",
            s: "e",
            se: "sw"
          };
        } else if (angel >= 135 && angel <= 180) {
          curObj = {
            e: "e",
            s: "s",
            se: "se"
          };
        } else if (angel >= 180 && angel <= 225) {
          curObj = {
            e: "e",
            s: "s",
            se: "se"
          };
        } else if (angel >= 225 && angel <= 270) {
          curObj = {
            e: "se",
            s: "ne",
            se: "be"
          };
        } else if (angel >= 270 && angel <= 315) {
          curObj = {
            e: "s",
            s: "e",
            se: "ne"
          };
        } else if (angel >= 315 && angel <= 360) {
          curObj = {
            e: "e",
            s: "s",
            se: "se"
          };
        }
        var styleObj = {};
        if (curObj != null) {
          styleObj.cursor = curObj[val] + "-resize";
        }
        if (
          this.getSelectedItem != null &&
          this.getSelectedItem.type == "pattern"
        ) {
          if (val == "e") {
            styleObj.top = "-5px";
            styleObj.right = "-10px";
            styleObj.zIndex = 10000000;
          } else if (val == "se") {
            styleObj.right = "-10px";
            styleObj.bottom = "-10px";
          }
        }
        return styleObj;
      } else if (name == "selectionBoxStyle") {
        var styleObj = {
          left: this.getSelectionBox.left + "px",
          top: this.getSelectionBox.top + "px",
          width: this.getSelectionBox.width + "px",
          height: this.getSelectionBox.height + "px"
        };
        return styleObj;
        //			}else if(name=="selectionBoxRectStyle"){
        //				return {
        //					left:this.selectionBoxRect.left+'px',
        //					top:this.selectionBoxRect.top+'px',
        //					width:this.selectionBoxRect.width+'px',
        //					height:this.selectionBoxRect.height+'px'
        //				}
      } else if (name == "controlPointShow") {
        if (this.getSelectionBox.items.length > 0) {
          //判断角度是不是都是0
          /*var allRotateIsZero = true;
					for(var i in this.getSelectionBox.items){
						if(this.getSelectionBox.items[i].edit_config.rotation!=0){
							allRotateIsZero=false;
							break;
						}
					}*/
          if (val == "e" || val == "s" || val == "rotate") {
            return false;
            /*}else if(allRotateIsZero==false && val=='se'){
							return false;*/
          } else {
            return true;
          }
        } else if (this.getSelectedItem != null) {
          if (this.getSelectedItem.edit_config.lock == true) {
            return false;
          } else if (this.getSelectedItem.type == "text") {
            if (
              this.getSelectedItem.edit_data.textRadian != 0 &&
              this.getSelectedItem.edit_data.textJson.length == 1
            ) {
              if (
                this.getSelectedItem.edit_data.textRadian == 1 ||
                this.getSelectedItem.edit_data.textRadian == -1
              ) {
                return val == "e" || val == "rotate" ? true : false;
              } else if (
                this.getSelectedItem.edit_data.textRadian == 2 ||
                this.getSelectedItem.edit_data.textRadian == -2
              ) {
                return val == "se" || val == "rotate" ? true : false;
              }
            } else {
              return val == "s" ? false : true;
            }
          } else if (this.getSelectedItem.type == "groupText") {
            if (val == "e" || val == "s" || val == "rotate") {
              return false;
            } else {
              return true;
            }
          } else if (this.getSelectedItem.type == "container") {
            return val == "se" || val == "rotate" ? true : false;
          } else if (this.getSelectedItem.type == "pattern") {
            return val == "s" ? false : true;
          } else if (this.getSelectedItem.type == "grid") {
            if (this.getSelectedItem.edit_data.scaleH == false) {
              return val == "e" ? false : true;
            } else if (this.getSelectedItem.edit_data.scaleV == false) {
              return val == "s" ? false : true;
            } else {
              return true;
            }
          } else if (this.getSelectedItem.type == "table") {
            if (val == "rotate") {
              return false;
            } else {
              if (this.nowEditTable == null) {
                return true;
              } else {
                return false;
              }
            }
          } else if (this.getSelectedItem.type == "interaction") {
            return this.getSelectedItem.edit_data.config.control[val];
          } else {
            return true;
          }
        } else {
          return false;
        }
      }
    },

    //当变形工具控制点被单击时
    setControlPoint(p) {
      this.hoverElement = null;
      //如果当前选择的时文本且按下的位置是右边,则进入编辑模式开始拖动
      if (
        this.getSelectedItem != null &&
        this.getSelectedItem.type == "text" &&
        p == "e"
      ) {
        //进入
        if (
          !(
            this.getSelectedItem.edit_data.textRadian != 0 &&
            this.getSelectedItem.edit_data.textJson.length == 1
          )
        ) {
          this.startTextEdit(this.getSelectedItem);
          //取消选择状态
          this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
          this.$store.commit("setselectedItem", null);
          eventBus.$emit("startTextEditorResize");
        }
      }
      this.$store.commit("setStageMouse", [{ name: "controlPoint", val: p }]);
    },
    //更新旋转中心并修正translate
    setRotate(svgItem) {
      var dom = this.$refs["rect_" + svgItem.id][0];
      //1.记录设置旋转中心前的坐标
      var oldRect = dom.getBoundingClientRect();
      //2.设置新的旋转中心
      svgItem.edit_config.rotateX = svgItem.edit_config.width / 2;
      svgItem.edit_config.rotateY = svgItem.edit_config.height / 2;
      this.$nextTick(function() {
        //3.记录设置旋转中心后的坐标
        var newRect = dom.getBoundingClientRect();
        var cx = oldRect.left - newRect.left;
        var cy = oldRect.top - newRect.top;
        //4.获取计算后的坐标,将新坐标应用到translate
        svgItem.edit_config.left = svgItem.edit_config.left + cx / this.getZoom;
        svgItem.edit_config.top = svgItem.edit_config.top + cy / this.getZoom;
      });
    },

    //事件=============================

    stageAreaMouseDown(e) {
        console.log('stageAreaMouseDown');
      this.hoverElement = null;

      var dataset = $(e.target).data("noselect");
      console.log('dataset:');
      console.log(dataset);
      //关闭文本编辑框
      if (dataset != undefined) {
        this.stopTextEdit();
        this.stopGroupTextEdit();
        this.stopTableCellEdit();
        this.guides.movingItem = undefined;
      }

      this.moved = false;
      //通知其他面板关闭
      eventBus.$emit("closeModal");
      var cx = 0;
      var cy = 0;

      //如果正在移动参考线则return
      if (this.guides.moving) {
        return;
      }

      var cp = this.$store.state.stage.mouse.controlPoint;
      console.log('this.getSelectionBox:');
      console.log(this.getSelectionBox);
      //计算当前选择的物体的相对坐标
      if (this.getSelectionBox.items.length > 1) {
        //选择了多个元素,selctionbox的clientRect
        cx = this.getMouse.x - this.selectionBoxRect.left;
        cy = this.getMouse.y - this.selectionBoxRect.top;

        var zoom = this.getZoom;

        if (cp == "se") {
          // 组缩放数据准备
          for (var i in this.getSelectionBox.items) {
            var item = this.getSelectionBox.items[i];
            // var rect = this.$refs['rect_'+item.id][0].getBoundingClientRect();
            // var $stageArea = $('#stageArea');
            // var leftOffset = this.$refs['stage'].offsetLeft + this.$refs['stageArea'].offsetLeft - $stageArea.scrollLeft();
            // var topOffset = this.$refs['stage'].offsetTop + this.$refs['stageArea'].offsetTop - $stageArea.scrollTop();
            var g_leftRatio =
              Math.abs(
                item.edit_config.left * zoom - this.selectionBoxRect.left
              ).toFixed(2) / this.selectionBoxRect.width;
            var g_topRatio =
              Math.abs(
                item.edit_config.top * zoom - this.selectionBoxRect.top
              ).toFixed(2) / this.selectionBoxRect.height;
            var g_widthRatio =
              item.edit_config.width / this.selectionBoxRect.width;
            var g_heightRatio =
              item.edit_config.height / this.selectionBoxRect.height;

            item.edit_data.glRatio = g_leftRatio;
            item.edit_data.gtRatio = g_topRatio;
            item.edit_data.gwRatio = g_widthRatio;
            item.edit_data.ghRatio = g_heightRatio;
          }
        }
      } else if (this.getSelectedItems.length == 1) {
        //获取当前选择元素的left 和 top
        cx =
          this.getMouse.x -
          this.getSelectedItem.edit_config.left * this.getZoom;
        cy =
          this.getMouse.y - this.getSelectedItem.edit_config.top * this.getZoom;
        this.downConfig.width = this.getSelectedItem.edit_config.width;
        this.downConfig.height = this.getSelectedItem.edit_config.height;

        if (this.getSelectedItem.type == "table" && cp == "se") {
          this.getSelectedItem.edit_config.originalWidth = this.getSelectedItem.edit_config.width;
          this.getSelectedItem.edit_config.originalHeight = this.getSelectedItem.edit_config.height;
        }
      }

      //提交鼠标按下事件,鼠标按下时相对于stage的坐标
      this.$store.commit("setStageMouse", [
        { name: "isDown", val: true },
        { name: "downX", val: this.$store.state.stage.mouse.x },
        { name: "downY", val: this.$store.state.stage.mouse.y },
        { name: "parentX", val: cx },
        { name: "parentY", val: cy }
      ]);
      //向eventBus发送舞台鼠标按下
      eventBus.$emit("stageMouseDown", {
        mouseX: this.$store.state.stage.mouse.x,
        mouseY: this.$store.state.stage.mouse.y,
        vectorX: 0,
        vectorY: 0
      });
      //设置选择框状态
      if (
        this.$store.state.editor.nowEditText == null &&
        this.nowEditGroupText == null &&
        this.nowEditTable == null &&
        this.resizer == null
      ) {
        this.$store.commit("setSelectionBox", [{ name: "start", val: true }]);
        this.guides.movingItem = undefined;
      }

      //如果选中的时svg_canvas则说明没有选中任何对象
      if (dataset != undefined) {
        this.groupElementEdit = -1;
        //清空选择框选择的物体
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
        //清空当前正在单选的元素
        this.$store.commit("setselectedItem", null);

        //选中舞台之外的元素
      }
    },
    stageAreaMouseMove(e) {
      //如果表格正在编辑,返回
      var controlPoint = this.$store.state.stage.mouse.controlPoint;
      if (this.$store.state.stage.mouse.isDown) {
        if (this.hoverElement != null) {
          this.hoverElement = null;
        }
        var mousePx = Math.abs(this.getMouse.x - this.getMouse.downX);
        var mousePy = Math.abs(this.getMouse.y - this.getMouse.downY);

        console.log('mouserPx:'+mousePx,"mousePy:"+mousePy);

        if (this.getSelectedItems.length > 0 && (mousePx > 1 || mousePy > 1)) {
          this.moved = true;
        }

        /*console.log('getSelectedItem');
        console.log(this.getSelectedItem);*/
        if (
          this.getSelectedItem != null &&
          controlPoint == "" &&
          this.getSelectedItem.edit_config.lock
        ) {
          this.$store.commit("setselectedItem", null);
        }
      }

      //============================
      //获取或计算坐标
      var $stageArea = $("#stageArea");
      //获取相对于stageArea的坐标
      var selectionBoxX =
        e.clientX -
        this.$refs["stageArea"].offsetLeft +
        $stageArea.scrollLeft();
      var selectionBoxY =
        e.clientY - this.$refs["stageArea"].offsetTop + $stageArea.scrollTop();

      //获取相对于stage的坐标
      var stageMouseX =
        e.clientX -
        this.$refs["stage"].offsetLeft -
        this.$refs["stageArea"].offsetLeft +
        $stageArea.scrollLeft();
      var stageMouseY =
        e.clientY -
        this.$refs["stage"].offsetTop -
        this.$refs["stageArea"].offsetTop +
        $stageArea.scrollTop();

      //计算鼠标向量
      var vectorX = stageMouseX - this.$store.state.stage.mouse.x;
      var vectorY = stageMouseY - this.$store.state.stage.mouse.y;

      //计算鼠标按下后移动的距离
      var distanceX = this.getMouse.x - this.getMouse.downX;
      var distanceY = this.getMouse.y - this.getMouse.downY;

      //向eventBus发送舞台移动事件
      eventBus.$emit("stageMouseMove", {
        mouseX: stageMouseX,
        mouseY: stageMouseY,
        vectorX: vectorX,
        vectorY: vectorY
      });

      //提交鼠标坐标
      this.$store.commit("setStageMouse", [
        { name: "x", val: stageMouseX },
        { name: "y", val: stageMouseY },
        { name: "vectorX", val: vectorX },
        { name: "vectorY", val: vectorY }
      ]);

      //移动参考线
      if (this.guides.moving) {
        if (this.guides.movingItem.type == "x") {
          this.guides.movingItem.pos += vectorX / this.getZoom;
        } else {
          this.guides.movingItem.pos += vectorY / this.getZoom;
        }
      }

      //修改页面尺寸
      if (this.resizer != null) {
        let zoom = 1;
        let maxHeight = 0;
        if (this.$store.state.docData.product == "jianye") {
          maxHeight = 40000;
        } else if (this.docDataEditConfig.unit == "mm") {
          maxHeight = 2000;
        } else if (this.docDataEditConfig.unit == "px") {
          maxHeight = 5000;
        }
        if (this.docDataEditConfig.unit == "mm") {
          zoom = this.docDataEditConfig.dpi / 25.4;
        }
        if (this.resizer == "right") {
          let vecX = vectorX / this.getZoom;
          if (
            this.docDataEditConfig.width + vecX > 10 &&
            this.docDataEditConfig.width + vecX <= maxHeight
          ) {
            this.docDataEditConfig.width += vecX / zoom;
            this.stageStyle.left -= vecX * this.getZoom / 2;
          }
        } else if (this.resizer == "bottom") {
          let vecY = vectorY / this.getZoom;
          if (
            this.docDataEditConfig.height + vecY > 10 &&
            this.docDataEditConfig.height + vecY <= maxHeight
          ) {
            this.docDataEditConfig.height += vecY / zoom;
          }
        }
      }

      //============================

      //如果没有物体被选择,且鼠标被按下,则进入框选模式
      if (
        ((this.getSelectedItem == null ||
          this.getSelectedItem.edit_config.lock) &&
          this.getSelectionBox.start == true &&
          this.getSelectionBox.items.length == 0) ||
        (this.getSelectionBox.items.length > 0 &&
          this.getSelectionBox.items[0].edit_config.lock &&
          this.getSelectionBox.start == true)
      ) {
        //计算鼠标移动距离
        var moveX = this.getMouse.x - this.getMouse.downX;
        var moveY = this.getMouse.y - this.getMouse.downY;
        if (moveX != 0 || moveY != 0) {
          //取消框选
          this.$store.state.stage.selectionBox.items = [];
          this.getSelectionBox.show = true;

          if (moveX >= 0) {
            this.getSelectionBox.left = this.getMouse.downX;
            this.getSelectionBox.width = moveX;
          } else {
            this.getSelectionBox.left = this.getMouse.downX + moveX;
            this.getSelectionBox.width = -moveX;
          }
          if (moveY >= 0) {
            this.getSelectionBox.top = this.getMouse.downY;
            this.getSelectionBox.height = moveY;
          } else {
            this.getSelectionBox.top = this.getMouse.downY + moveY;
            this.getSelectionBox.height = -moveY;
          }
        }
      }
      //============================
      //			if(this.moved==false){
      //				return;
      //			}
      if (
        this.$store.state.editor.nowEditText != null ||
        this.nowEditGroupText != null ||
        this.nowEditTable != null
      ) {
        return;
      }
      //组件组拖拽
      if (this.getSelectionBox.items.length > 0 && this.getMouse.isDown) {
        if (controlPoint == "") {
          //实现组拖动
          //判断组内是否有锁定的元素,如果有,则不移动
          if (this.getSelectionBox.items[0].edit_config.lock == false) {
            var vx = this.selectionBoxRect.left;
            var vy = this.selectionBoxRect.top;

            this.selectionBoxRect.left =
              this.getMouse.x - this.getMouse.parentX;
            this.selectionBoxRect.top = this.getMouse.y - this.getMouse.parentY;

            vx = this.selectionBoxRect.left - vx;
            vy = this.selectionBoxRect.top - vy;

            for (var i = 0; i < this.getSelectionBox.items.length; i++) {
              this.getSelectionBox.items[i].edit_config.left =
                this.getSelectionBox.items[i].edit_config.left +
                vx / this.getZoom;
              this.getSelectionBox.items[i].edit_config.top =
                this.getSelectionBox.items[i].edit_config.top +
                vy / this.getZoom;
              this.getSelectionBox.items[i].ismoving = true;
            }
          }
        } else if (controlPoint == "se") {
          //实现组缩放
          var r =
            this.selectionBoxRect.width /
            (this.selectionBoxRect.width + vectorX);
          this.selectionBoxRect.width += vectorX;
          this.selectionBoxRect.height /= r;
          for (var i = 0; i < this.getSelectionBox.items.length; i++) {
            var item = this.getSelectionBox.items[i];
            var rotate = item.edit_config.rotation;
            // item.edit_config.rotation = 0;
            if (
              this.selectionBoxRect.width > 0 &&
              this.selectionBoxRect.height > 0
            ) {
              if (item.type == "grid") {
                item.edit_config.rotation = 0;
                item.edit_data.ratio = true;
                item.edit_data.mx = item.edit_data.moveX;
                item.edit_data.my = item.edit_data.moveY;
                item.edit_data.sx = item.edit_data.scaleX;
                item.edit_data.sy = item.edit_data.scaleY;
                item.edit_data.owidth = item.edit_config.width;
                item.edit_data.oheight = item.edit_config.height;
                item.edit_data.vscale =
                  item.edit_data.viewX / item.edit_data.owidth;

                item.edit_config.width =
                  this.selectionBoxRect.width * item.edit_data.gwRatio;
                item.edit_config.height =
                  this.selectionBoxRect.height * item.edit_data.ghRatio;
                item.edit_config.left =
                  (this.selectionBoxRect.width * item.edit_data.glRatio +
                    this.selectionBoxRect.left) /
                  this.getZoom;
                item.edit_config.top =
                  (this.selectionBoxRect.height * item.edit_data.gtRatio +
                    this.selectionBoxRect.top) /
                  this.getZoom;
                item.edit_config.rotation = rotate;
                item.edit_config.rotateX = item.edit_config.width / 2;
                item.edit_config.rotateY = item.edit_config.height / 2;

                item.edit_config.rotation = rotate;
              } else {
                item.edit_config.rotation = 0;
                item.edit_config.width =
                  this.selectionBoxRect.width * item.edit_data.gwRatio;
                item.edit_config.height =
                  this.selectionBoxRect.height * item.edit_data.ghRatio;
                item.edit_config.left =
                  (this.selectionBoxRect.width * item.edit_data.glRatio +
                    this.selectionBoxRect.left) /
                  this.getZoom;
                item.edit_config.top =
                  (this.selectionBoxRect.height * item.edit_data.gtRatio +
                    this.selectionBoxRect.top) /
                  this.getZoom;
                item.edit_config.rotation = rotate;
                item.edit_config.rotateX = item.edit_config.width / 2;
                item.edit_config.rotateY = item.edit_config.height / 2;
              }
            }
          }
          this.updateSelectedItemsHtml();
        }
        //this.updateSelectedItemsHtml();
      }

      //============================
      //如果正在拖动某个控制点（某个组件缩放/旋转）

      if (this.getSelectedItem != null && controlPoint != "") {
        //获取鼠标移动向量
        //史上最坑爹的公式!!!!!!一定要注意
        //解决物体旋转后,不按照移动的位置缩放
        var angel = this.getSelectedItem.edit_config.rotation * Math.PI / 180;
        var vecX =
          Math.cos(angel) * (this.getMouse.vectorX / this.getZoom) +
          Math.sin(angel) * (this.getMouse.vectorY / this.getZoom);
        var vecY =
          Math.cos(angel) * (this.getMouse.vectorY / this.getZoom) -
          Math.sin(angel) * (this.getMouse.vectorX / this.getZoom);



        //实现缩放
        switch (controlPoint) {
          case "e":
            //右中
            if (
              this.getSelectedItem.disableResize &&
              (this.getMouse.vectorX < 0 || this.getMouse.vectorY < 0)
            ) {
              break;
            }
            var scaleAble = true;
            if (
              this.getSelectedItem.type == "text" &&
              this.getSelectedItem.edit_data.textRadian != 0 &&
              this.getSelectedItem.edit_data.textJson.length == 1
            ) {
              scaleAble = true;
            } else if (this.getSelectedItem.type == "text") {
              scaleAble = false;
            }
            if (scaleAble) {
              //this.getSelectedItem.edit_config.width = this.getSelectedItem.edit_config.width+vecX;
              if (this.getSelectedItem.edit_config.rotation == 0) {
                var finalWidth =
                  this.downConfig.width +
                  (this.getMouse.x - this.getMouse.downX) / this.getZoom;
                this.getSelectedItem.edit_config.width = finalWidth;
              } else {
                this.getSelectedItem.edit_config.width =
                  this.getSelectedItem.edit_config.width + vecX;
              }
            }
            if (this.getSelectedItem.type == "grid") {
              this.getSelectedItem.edit_data.ratio = false;
              this.getSelectedItem.edit_data.viewX =
                this.getSelectedItem.edit_config.width *
                this.getSelectedItem.edit_data.vscale;
            }

            break;
          case "s":
            //南
            if (
              this.getSelectedItem.disableResize &&
              (this.getMouse.vectorX < 0 || this.getMouse.vectorY < 0)
            ) {
              break;
            }
            if (this.getSelectedItem.edit_config.rotation == 0) {
              var finalHeight =
                this.downConfig.height +
                (this.getMouse.y - this.getMouse.downY) / this.getZoom;
              this.getSelectedItem.edit_config.height = finalHeight;
            } else {
              this.getSelectedItem.edit_config.height =
                this.getSelectedItem.edit_config.height + vecY;
            }

            if (this.getSelectedItem.type == "grid") {
              this.getSelectedItem.edit_data.ratio = false;
              this.getSelectedItem.edit_data.viewY =
                this.getSelectedItem.edit_config.height *
                this.getSelectedItem.edit_data.vscale;
            }
            break;
          case "se":
            //按比例缩放,东南
            if (
              this.getSelectedItem.disableResize &&
              (this.getMouse.vectorX < 0 || this.getMouse.vectorY < 0)
            ) {
              break;
            }
            //重置九宫格的原始大小
            if (this.getSelectedItem.type == "grid") {
              this.getSelectedItem.edit_data.ratio = true;
              this.getSelectedItem.edit_data.mx = this.getSelectedItem.edit_data.moveX;
              this.getSelectedItem.edit_data.my = this.getSelectedItem.edit_data.moveY;
              this.getSelectedItem.edit_data.sx = this.getSelectedItem.edit_data.scaleX;
              this.getSelectedItem.edit_data.sy = this.getSelectedItem.edit_data.scaleY;
              this.getSelectedItem.edit_data.owidth = this.getSelectedItem.edit_config.width;
              this.getSelectedItem.edit_data.oheight = this.getSelectedItem.edit_config.height;
              this.getSelectedItem.edit_data.vscale =
                this.getSelectedItem.edit_data.viewX /
                this.getSelectedItem.edit_data.owidth;
            }

            //获取高度比值
            var heightRatio = this.downConfig.height / this.downConfig.width;
            //var finalWidthRatio =((this.getMouse.x-this.getMouse.downX)/this.getZoom);
            //console.log('修改前',[this.getSelectedItem.edit_config.height,this.downConfig.height,finalWidthRatio,heightRatio]);
            //宽
            this.getSelectedItem.edit_config.width =
              this.getSelectedItem.edit_config.width + vecX;
            //高,注意要乘以高度比值
            this.getSelectedItem.edit_config.height =
              this.getSelectedItem.edit_config.height + vecX * heightRatio;
            /*if(this.getSelectedItem.edit_config.width<0 || this.getSelectedItem.edit_config.height<0){
							console.log('修改后',[this.getSelectedItem.edit_config.height,this.downConfig.height,finalWidthRatio,heightRatio]);
						}*/

            //表格文字处理
            /*if(this.getSelectedItem.type=='table'){
							var textZoom = this.getSelectedItem.edit_config.width / this.getSelectedItem.edit_config.originalWidth;
							var cellArr = this.getSelectedItem.edit_data.cell;
							for(var row in cellArr){
								for(var col in cellArr[row]){
									cellArr[row][col].textScale =textZoom;
								}
							}
						}*/

            break;
          case "rotate":
            var px =
              (this.getSelectedItem.edit_config.left +
                this.getSelectedItem.edit_config.rotateX) *
              this.getZoom;
            var py =
              (this.getSelectedItem.edit_config.top +
                this.getSelectedItem.edit_config.rotateY) *
              this.getZoom;
            var mx = this.getMouse.x;
            var my = this.getMouse.y;

            var x = Math.abs(px - mx);
            var y = Math.abs(py - my);
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            var cos = y / z;
            var radina = Math.acos(cos); //用反三角函数求弧度
            var angle = Math.floor(180 / (Math.PI / radina)); //将弧度转换成角度
            if (mx > px && my > py) {
              //鼠标在第四象限
              angle = 180 - angle;
            }

            if (mx == px && my > py) {
              //鼠标在y轴负方向上
              angle = 180;
            }

            if (mx > px && my == py) {
              //鼠标在x轴正方向上
              angle = 90;
            }

            if (mx < px && my > py) {
              //鼠标在第三象限
              angle = 180 + angle;
            }

            if (mx < px && my == py) {
              //鼠标在x轴负方向
              angle = 270;
            }

            if (mx < px && my < py) {
              //鼠标在第二象限
              angle = 360 - angle;
            }
            if (common.approximate(angle, 0, 5)) {
              angle = 0;
            } else if (common.approximate(angle, 90, 5)) {
              angle = 90;
            } else if (common.approximate(angle, 180, 5)) {
              angle = 180;
            } else if (common.approximate(angle, 270, 5)) {
              angle = 270;
            } else if (common.approximate(angle, 360, 5)) {
              angle = 360;
            }
            this.getSelectedItem.edit_config.rotation = angle;

            break;
        }
        //如果小于结果,则按比例恢复为1:?
        var heightRatio =
          this.getSelectedItem.edit_config.height /
          this.getSelectedItem.edit_config.width;
        if (this.getSelectedItem.edit_config.width < 0) {
          this.getSelectedItem.edit_config.width = 1;
        }
        if (this.getSelectedItem.edit_config.height < 0) {
          this.getSelectedItem.edit_config.height = heightRatio;
        }
        if (this.getSelectedItem.edit_config.rotation == 0) {
          if (controlPoint == "e" || controlPoint == "s") {
            this.$nextTick(function() {
              try {
                //缩放辅助对齐
                var testRange = 4;
                //获取我自己的boundingrect
                var meRect = this.$refs[
                  "rect_" + this.getSelectedItem.id
                ][0].getBoundingClientRect();
                for (var e in this.getNowPageData.data) {
                  var elementItem = this.getNowPageData.data[e];
                  if (elementItem.id != this.getSelectedItem.id) {
                    var anothorRect = this.$refs[
                      "rect_" + elementItem.id
                    ][0].getBoundingClientRect();
                    //对齐右边和下边
                    var distance = 0;

                    //我的下边和她的下边
                    distance = anothorRect.bottom - meRect.bottom;
                    if (Math.abs(distance) < testRange) {
                      //计算我的bottom和他的bottom的差值,并加上
                      this.getSelectedItem.edit_config.height =
                        (anothorRect.bottom - meRect.top) / this.getZoom;
                    }
                    //我的右边对其他的右边
                    distance = anothorRect.right - meRect.right;
                    if (Math.abs(distance) < testRange) {
                      //计算我的bottom和他的bottom的差值,并加上
                      this.getSelectedItem.edit_config.width =
                        (anothorRect.right - meRect.left) / this.getZoom;
                    }
                    //我的右边对其他的左边
                    distance = anothorRect.left - meRect.right;
                    if (Math.abs(distance) < testRange) {
                      //计算我的bottom和他的bottom的差值,并加上
                      this.getSelectedItem.edit_config.width =
                        (anothorRect.left - meRect.left) / this.getZoom;
                    }
                  }
                }
              } catch (e) {
                //console.log('error',e);
              }
            });
          }
        }
        this.updateSelectedItemsHtml();
      }
      //============================

      //实现单元素拖动
      /*containerHit检测
			 **/

      if (
        this.getSelectedItem != null &&
        this.getMouse.isDown &&
        controlPoint == "" &&
        this.$store.state.editor.nowEditText == null &&
        this.nowEditGroupText == null &&
        this.nowEditTable == null &&
        distanceX != 0
      ) {
        if (this.getSelectedItem.edit_config.lock) {
          $(this.$refs.lock).addClass("lock-shake");
        } else {
          //鼠标坐标
          this.getSelectedItem.edit_config.left =
            (this.getMouse.x - this.getMouse.parentX) / this.getZoom;
          this.getSelectedItem.edit_config.top =
            (this.getMouse.y - this.getMouse.parentY) / this.getZoom;

          this.getSelectedItem.ismoving = true;
          //containerHit
          if (this.getSelectedItem.type == "image") {
            var hasContain = false,
              svgContainer = [];

            this.getNowPageData.data.forEach(function(item) {
              if (item.type == "container") {
                hasContain = true;
                svgContainer.push(item);
              }
            });

            if (hasContain) {
              var svgCanvas = this.$refs.svg_canvas;
              var hitRect = svgCanvas.createSVGRect();
              hitRect.width = 1;
              hitRect.height = 1;
              hitRect.x = this.getMouse.x;
              hitRect.y = this.getMouse.y;

              var hitResult = svgCanvas.getIntersectionList(hitRect, null);
              var hitIndex = -1; //碰撞index

              for (var i in hitResult) {
                if (
                  hitResult[i].localName == "rect" &&
                  hitResult[i].className.baseVal == "kx-rect"
                ) {
                  hitIndex = i;
                }
              }
              //没有检测到碰撞容器返回，并销毁hover效果
              if (hitIndex == -1) {
                var temp = this.$store.state.editor.stageOverContainer;
                if (temp != undefined) {
                  $(temp)
                    .find(".kx-rect")
                    .eq(this.$store.state.editor.dragEvent.index)
                    .css("fill", "none");
                }
                this.$store.state.editor.dragEvent.index = -1;
                this.$store.state.editor.dragEvent.overContain = undefined;
                this.$store.state.editor.stageOverContainer = null;
                return;
              }

              var item = hitResult[hitIndex].nearestViewportElement, //dom
                index = -1; //碰撞的字遮罩的index***
              if ($(item).find(".kx-rect").length == 1) {
                index = 0;
              } else {
                index =
                  $(
                    hitResult[hitIndex].parentElement.parentElement
                      .parentElement
                  ).index() - 1;
              }
              //获得了index，准备数据
              if (index < 0) {
                //销毁之前的hover效果
                $(item)
                  .find(".kx-rect")
                  .css("fill", "none");
                this.$store.state.editor.dragEvent.index = -1;
                this.$store.state.editor.dragEvent.overContain = undefined;
                this.$store.state.editor.stageOverContainer = null;
              } else {
                //销毁之前的hover效果
                $(this.$store.state.editor.stageOverContainer)
                  .find(".kx-rect")
                  .css("fill", "none");
                //添加hover效果
                $(item)
                  .find(".kx-rect")
                  .eq(index)
                  .css("fill", "rgba(0,0,0,.4)");
                this.$store.state.editor.dragEvent.index = index;
                for (var i = 0; i < svgContainer.length; i++) {
                  if (svgContainer[i].id == $(item).data("parent")) {
                    this.$store.state.editor.dragEvent.overContain =
                      svgContainer[i];
                  }
                }
                this.$store.state.editor.stageOverContainer = item;
              }
              return; //结束
            }
          }
        }
        //					this.updateSelectedItemsHtml();
      }

      //============================

      //辅助线修正
      //获取当前选择框工具div的clientbox
      //获取每个物体的clientbox

      if (
        this.getMouse.isDown &&
        controlPoint == "" &&
        this.getSelectedItems.length > 0
      ) {
        //辅助线感应范围(像素)
        var testRange = 6;
        this.guide = [];
        var pageData = this.getNowPageData.data;
        this.$nextTick(function() {
          //多元素修正
          if (this.getSelectionBox.items.length > 0) {
            //获取selectionBox的left right top bottom
            var cx = $("#stage_canvas").offset().left;
            var cy = $("#stage_canvas").offset().top;
            var selObjRect = {
              left: this.selectionBoxRect.left + cx,
              top: this.selectionBoxRect.top + cy,
              right:
                this.selectionBoxRect.left + this.selectionBoxRect.width + cx,
              bottom:
                this.selectionBoxRect.top + this.selectionBoxRect.height + cy,
              width: this.selectionBoxRect.width,
              height: this.selectionBoxRect.height
            };

            for (var i = 0; i < pageData.length; i++) {
              var eleItem = pageData[i];

              var isGroupObj = false;
              //判断是否属于组内

              for (var a = 0; a < this.getSelectionBox.items.length; a++) {
                if (this.getSelectionBox.items[a].id == eleItem.id) {
                  isGroupObj = true;
                  break;
                }
              }
              var vx = this.selectionBoxRect.left;
              var vy = this.selectionBoxRect.top;

              //计算customGuide----
              var customGuideResult = this.calcCustomGuide(selObjRect, true);

              if (customGuideResult.left != null) {
                this.selectionBoxRect.left =
                  customGuideResult.left * this.getZoom;
              }
              if (customGuideResult.top != null) {
                this.selectionBoxRect.top =
                  customGuideResult.top * this.getZoom;
              }
              vx = this.selectionBoxRect.left - vx;
              vy = this.selectionBoxRect.top - vy;

              for (var z = 0; z < this.getSelectionBox.items.length; z++) {
                this.getSelectionBox.items[z].edit_config.left =
                  this.getSelectionBox.items[z].edit_config.left +
                  vx / this.getZoom;
                this.getSelectionBox.items[z].edit_config.top =
                  this.getSelectionBox.items[z].edit_config.top +
                  vy / this.getZoom;
              }
              vx = this.selectionBoxRect.left;
              vy = this.selectionBoxRect.top;
              if (isGroupObj == false) {
                //cx,0,cy,0,不需要宽高修正

                var result = this.calcGuide(selObjRect, eleItem, true);

                if (result.left != null) {
                  this.selectionBoxRect.left = result.left * this.getZoom;
                }
                if (result.top != null) {
                  this.selectionBoxRect.top = result.top * this.getZoom;
                }
                vx = this.selectionBoxRect.left - vx;
                vy = this.selectionBoxRect.top - vy;

                for (var z = 0; z < this.getSelectionBox.items.length; z++) {
                  this.getSelectionBox.items[z].edit_config.left =
                    this.getSelectionBox.items[z].edit_config.left +
                    vx / this.getZoom;
                  this.getSelectionBox.items[z].edit_config.top =
                    this.getSelectionBox.items[z].edit_config.top +
                    vy / this.getZoom;
                }
              }
            }
            //单元素修正
          } else if (
            this.getSelectedItems.length == 1 &&
            this.getSelectedItems[0].edit_config.lock == false
          ) {
              console.log('one items');
            //计算customGuide
            var customGuideResult = this.calcCustomGuide(
              this.getSelectedItem,
              false
            );

            if (customGuideResult.left != null) {
              this.getSelectedItem.edit_config.left = customGuideResult.left;
            }
            if (customGuideResult.top != null) {
              this.getSelectedItem.edit_config.top = customGuideResult.top;
            }

            for (var i = 0; i < pageData.length; i++) {
              var eleItem = pageData[i];
              if (eleItem.id != this.getSelectedItem.id) {
                var result = this.calcGuide(
                  this.getSelectedItem,
                  eleItem,
                  false
                );
                if (result.left != null) {
                  this.getSelectedItem.edit_config.left = result.left;
                }
                if (result.top != null) {
                  this.getSelectedItem.edit_config.top = result.top;
                }
              }
            }
          }
        });
      }

      //============================
    },
    handleContainerMask() {
      var imgWidth = this.getSelectedItem.edit_config.width,
        imgHeight = this.getSelectedItem.edit_config.height;
      var item = this.$store.state.editor.dragEvent.overContain,
        svgdom = this.$store.state.editor.stageOverContainer;
      //销毁hover效果和dom
      $(svgdom)
        .find(".kx-rect")
        .css("fill", "none");
      this.$store.state.editor.stageOverContainer = null;

      var $svgItem = $(item.edit_data.svg),
        index = this.$store.state.editor.dragEvent.index;

      var clipitem = {},
        $clipImg = $svgItem.find(".kx-image"),
        $rect = $svgItem.find(".kx-rect").eq(index),
        rectWidth = $rect[0].width.baseVal.value,
        rectHeight = $rect[0].height.baseVal.value,
        rectScale = rectWidth / rectHeight,
        imgScale = imgWidth / imgHeight,
        clipWidth,
        clipHeight;
      if (rectScale > imgScale) {
        //svg比图片宽
        clipWidth = rectWidth;
        clipHeight = imgHeight / imgWidth * rectWidth;
      } else {
        clipHeight = rectHeight;
        clipWidth = imgWidth / imgHeight * rectHeight;
      }
      var x = parseFloat($rect.attr("x")) || 0,
        y = parseFloat($rect.attr("y")) || 0;
      var viewArr = $svgItem.attr("viewBox").split(" "),
        translateX = x + rectWidth / 2 - clipWidth / 2,
        translateY = y;
      //初始化
      clipitem.url = this.getSelectedItem.edit_data.url;
      clipitem.width = clipWidth;
      clipitem.height = clipHeight;
      clipitem.left = translateX;
      clipitem.top = translateY;
      clipitem.rotation = 0;
      clipitem.rotateX = 0;
      clipitem.rotateY = 0;

      item.edit_data.clipImg.splice(index, 1, clipitem);

      item.edit_config.rotation = this.getSelectedItem.edit_config.rotation;
      //销毁全局变量
      this.$store.state.editor.dragEvent.overContain = undefined;
      this.$store.state.editor.dragEvent.index = -1;
      //创建快照
      this.$nextTick(function() {
        //eventBus.$emit('stageChange','mask');
        eventBus.$emit("elementChange", {
          type: "update",
          targets: [item]
        });
      });
      this.removeElement();
      this.$store.state.editor.dragEvent.allowDrop = false;
    },
    IgnoreContainerMask() {
      var svgdom = this.$store.state.editor.stageOverContainer;
      //销毁hover效果
      $(svgdom)
        .find(".kx-rect")
        .css("fill", "none");
      this.$store.state.editor.dragEvent.overContain = undefined;
      this.$store.state.editor.dragEvent.index = -1;
      this.$store.state.editor.stageOverContainer = null;
      this.$store.state.editor.dragEvent.disallowDrop = false;
    },
    stageAreaMouseUp(e) {
      this.hoverElement = null;

      this.guides.moving = false;
      if (this.resizer != null) {
        this.$store.state.docData.edit_config.width = parseInt(
          this.$store.state.docData.edit_config.width
        );
        this.$store.state.docData.edit_config.height = parseInt(
          this.$store.state.docData.edit_config.height
        );
        //判断stage是否超出舞台,如果超出,则修改他的位置
        let stageBottom =
          $("#svg_canvas")
            .get(0)
            .getBoundingClientRect().bottom + 80;
        let bodyHeight = $("body").height();
        if (stageBottom > bodyHeight && this.resizer == "bottom") {
          this.stageStyle.top -= stageBottom - bodyHeight;
          this.stageStyle.transition = true;
          setTimeout(() => {
            this.stageStyle.transition = false;
          }, 300);
        }
        this.resizer = null;
        eventBus.$emit("infoChange", { type: "stageSize" });
      }

      $(this.$refs.lock).removeClass("lock-shake");
      this.getSelectedItems.forEach(function(item) {
        item.ismoving = false;
      });

      //容器更换图片
      if (this.$store.state.editor.dragEvent.overContain != undefined) {
        var _self = this;
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: "确定要替换容器里的图片吗？",
          fn: function() {
            _self.$store.state.editor.dragEvent.allowDrop = true;
          },
          fx: function() {
            _self.$store.state.editor.dragEvent.disallowDrop = true;
          }
        });
      }
      //检测是否正在框选模式下
      if (this.getSelectionBox.show == true && this.selectedGroup == -1) {
        //计算框选碰撞对象并选择
        this.selectionBoxSelected();
        this.updateSelectionBoxPositionAndSize();
      }
      var addSnap = true;
      //表格重绘制
      if (
        this.getSelectedItem != null &&
        this.getSelectedItem.type == "table" &&
        this.$store.state.stage.mouse.controlPoint == "se"
      ) {
        var textZoom =
          this.getSelectedItem.edit_config.width /
          this.getSelectedItem.edit_config.originalWidth;
        var notext = true;
        for (var row in this.getSelectedItem.edit_data.cell) {
          for (var col in this.getSelectedItem.edit_data.cell[row]) {
            if (this.getSelectedItem.edit_data.cell[row][col].text.length > 0) {
              notext = false;
            }
            this.getSelectedItem.edit_data.cell[row][col].fontSize =
              this.getSelectedItem.edit_data.cell[row][col].fontSize * textZoom;
            this.getSelectedItem.edit_data.cell[row][col].svg = "";
          }
        }
        this.updateTableTextSvg(this.getSelectedItem);
        if (notext == false) {
          addSnap = false;
        }
      }
      this.$store.commit("setStageMouse", [
        { name: "isDown", val: false },
        { name: "controlPoint", val: "" }
      ]);
      //提交选择框状态,关闭选择框显示
      this.$store.commit("setSelectionBox", [
        { name: "start", val: false },
        { name: "show", val: false },
        { name: "width", val: 0 },
        { name: "height", val: 0 }
      ]);
      var selObj = this.$store.state.stage.selectedItem;
      //如果当前选择了一个单个svg,则进行旋转修正
      if (selObj != null) {
        //更新旋转中心并修正translate
        this.setRotate(selObj);
      }

      if (
        this.$store.state.editor.nowEditText != null ||
        this.nowEditGroupText != null ||
        this.nowEditTable != null
      ) {
        return;
      }

      //判断舞台是否发生变更
      if (this.getSelectedItems.length > 0) {
        if (this.moved) {
            console.log('elementChange:');

          //eventBus.$emit('stageChange','dragGroup');
          eventBus.$emit("elementChange", {
            type: "update",
            targets: this.getSelectedItems,
            snap: addSnap,
            update: true
          });
        }
      }
      this.moved = false;
      this.guide = [];

      //向eventBus发送舞台鼠标松开
      eventBus.$emit("stageMouseUp");
    },
    svgItemSelected(item) {
        console.log('svgItemDOM');
      this.guides.movingItem = undefined;
      this.hoverElement = null;
      //清空状态，修复图片从列表拖到容器上面又放回去，回舞台点击容器会删除容器的bug
      this.$store.state.editor.dragEvent.overContain = undefined;
      //console.log('选中',item);
      if (this.nowEditText != null && item.id != this.nowEditText.id) {
        this.stopTextEdit();
      }
      //	if(this.nowEditGroupText!=null && item.id!=this.nowEditGroupText.id){
      //console.log('在这 A')
      this.stopGroupTextEdit();
      //}
      //if(this.nowEditTable!=null && item.id!=this.nowEditTable.id){
      //console.log('在这 B')
      this.stopTableCellEdit();
      //}
       console.log('this.groupElementEdit:');
       console.log(this.groupElementEdit);
      //如果在组选择状态
      if (this.groupElementEdit != -1) {
        let finded = false;
        for (let i in this.getNowPageData.edit_config.groups) {
          for (let a in this.getNowPageData.edit_config.groups[i]) {
            if (
              (this.getNowPageData.edit_config.groups[i][a] == item.front_id ||
                this.getNowPageData.edit_config.groups[i][a] == item.id) &&
              this.groupElementEdit == i
            ) {
              finded = true;
              break;
            }
          }
        }
        if (finded == false) {
          this.groupElementEdit = -1;
        }
      }

      //获取当前选择的组
      if (this.selectedGroup != -1) {
        this.groupElementEdit = -1;
      }
      if(!event.shiftKey){
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
        this.$store.commit("setselectedItem", null);
      }

      //判断当前是否有多选的
      var selctionBoxItems = this.getSelectedItems;

      if (selctionBoxItems.length > 1) {

        //多选状态
        if (event.shiftKey) {
          var find = false;
          for (
            var i = 0;
            i < this.$store.state.stage.selectionBox.items.length;
            i++
          ) {
            if (this.$store.state.stage.selectionBox.items[i].id == item.id) {
              find = true;
              this.$store.state.stage.selectionBox.items.splice(i, 1);
              this.updateSelectionBoxPositionAndSize();
              if (this.$store.state.stage.selectionBox.items.length == 1) {
                this.$store.commit(
                  "setselectedItem",
                  this.$store.state.stage.selectionBox.items[0]
                );
                this.$store.state.stage.selectionBox.items = [];
              }
              break;
            }
          }
          if (!find && item.edit_config.lock == false) {
            //检测组里的元素是否有groups的元素,如果有,则全部选择

            this.$store.state.stage.selectionBox.items.push(item);
            this.updateSelectionBoxPositionAndSize();
          }
        } else {
          //判断是否属于编组元素
          let groupObject = null;
          this.getNowPageData.edit_config.groups.forEach(groupItem => {
            groupItem.forEach(groupEleItem => {
              if (item.id == groupEleItem) {
                groupObject = [];
                //遍历groups内的所有元素ID,找到他们的元素对象
                for (let groupIndex in groupItem) {
                  for (let i = 0; i < this.getNowPageData.data.length; i++) {
                    let eleItem = this.getNowPageData.data[i];
                    if (
                      eleItem.front_id == groupItem[groupIndex] ||
                      eleItem.id == groupItem[groupIndex]
                    ) {
                      groupObject.push(eleItem);
                    }
                  }
                }
              }
            });
          });
          if (groupObject != null && this.groupElementEdit == -1) {

            this.$store.commit("setSelectionBox", [
              { name: "items", val: groupObject }
            ]);
            this.$store.commit("setselectedItem", null);

            this.updateSelectionBoxPositionAndSize();
          } else {

            this.$store.commit("setselectedItem", item);
          }
        }
      } else if (selctionBoxItems.length == 1) {
        //单选状态

        if (event.shiftKey) {
          var item0 = selctionBoxItems[0];
          if (item0.id != item.id && item.edit_config.lock == false) {
            this.$store.commit("setselectedItem", null);
            this.$store.state.stage.selectionBox.items = [item0, item];
            this.updateSelectionBoxPositionAndSize();
          }
        } else {
          //判断是否属于编组元素
          let groupObject = null;
          this.getNowPageData.edit_config.groups.forEach(groupItem => {
            groupItem.forEach(groupEleItem => {
              if (item.id == groupEleItem) {
                groupObject = [];
                //遍历groups内的所有元素ID,找到他们的元素对象
                for (let groupIndex in groupItem) {
                  for (let i = 0; i < this.getNowPageData.data.length; i++) {
                    let eleItem = this.getNowPageData.data[i];

                    if (
                      eleItem.front_id == groupItem[groupIndex] ||
                      eleItem.id == groupItem[groupIndex]
                    ) {
                      groupObject.push(eleItem);
                    }
                  }
                }
              }
            });
          });
          if (groupObject != null && this.groupElementEdit == -1) {
            this.$store.commit("setSelectionBox", [
              { name: "items", val: groupObject }
            ]);
            this.$store.commit("setselectedItem", null);

            this.updateSelectionBoxPositionAndSize();
          } else {
            this.$store.commit("setselectedItem", item);
          }
        }
      } else if (selctionBoxItems.length == 0) {
        //判断是否属于编组元素
        let groupObject = null;
        this.getNowPageData.edit_config.groups.forEach(groupItem => {
          groupItem.forEach(groupEleItem => {
            if (item.front_id == groupEleItem || item.id == groupEleItem) {
              groupObject = [];
              //遍历groups内的所有元素ID,找到他们的元素对象
              for (let groupIndex in groupItem) {
                for (let i = 0; i < this.getNowPageData.data.length; i++) {
                  let eleItem = this.getNowPageData.data[i];

                  if (
                    eleItem.front_id == groupItem[groupIndex] ||
                    eleItem.id == groupItem[groupIndex]
                  ) {
                    groupObject.push(eleItem);
                  }
                }
              }
            }
          });
        });
        if (groupObject != null && this.groupElementEdit == -1) {

          this.$store.commit("setSelectionBox", [
            { name: "items", val: groupObject }
          ]);
          this.$store.commit("setselectedItem", null);

          this.updateSelectionBoxPositionAndSize();
        } else {
          this.$store.commit("setselectedItem", item);
        }
      }
      if (item.type == "container") {
        if (Cookies.get("containerTip") != 1) {
          this.$store.state.editor.tip.container = true;
        }
      }
    },
    openImageCropper(item) {
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [item]
      });
      var eleRect = this.$refs["rect_" + item.id][0].getBoundingClientRect();
      if (item.edit_data.clipSize != undefined) {
        var zoomSizeX =
          item.edit_config.width / item.edit_data.clipSize.lastWidth;
        var zoomSizeY =
          item.edit_config.height / item.edit_data.clipSize.lastHeight;

        console.log("zoomSizeX", zoomSizeX, zoomSizeY);
        item.edit_config.width = item.edit_data.clipSize.width * zoomSizeX;
        item.edit_config.height = item.edit_data.clipSize.height * zoomSizeY;

        var zoomX =
          item.edit_config.width /
          (item.edit_data.clip.width - item.edit_data.clip.left);
        var zoomY =
          item.edit_config.height /
          (item.edit_data.clip.height - item.edit_data.clip.top);

        var tempClip = JSON.parse(JSON.stringify(item.edit_data.clip));
        item.edit_data.clip.left = 0;
        item.edit_data.clip.top = 0;
        item.edit_data.clip.width = item.edit_config.originalWidth;
        item.edit_data.clip.height = item.edit_config.originalHeight;

        eventBus.$emit("elementChange", {
          type: "update",
          targets: [item],
          snap: false
        });

        item.edit_data.clip = tempClip;
      }

      this.$store.commit("callModal");
      this.$store.commit("callModal", { type: "cropper" });

      this.$nextTick(function() {
        //1.获取#img-resize 的 boundingbox
        //2.获取item元素的boudingbox
        //3.计算差值
        this.setRotate(item);
        this.$nextTick(function() {
          this.$nextTick(function() {
            var cropperRect = $("#img-resize-rect")[0].getBoundingClientRect();

            var leftEx = cropperRect.left - eleRect.left;
            var topEx = cropperRect.top - eleRect.top;

            console.log("cropperRect", cropperRect, "eleRect", eleRect);
            item.edit_config.left -= leftEx / this.getZoom;
            item.edit_config.top -= topEx / this.getZoom;
            item.tempClipPos = {
              cx: leftEx / this.getZoom,
              cy: topEx / this.getZoom,
              oldClipLeft: item.edit_data.clip.left,
              oldClipTop: item.edit_data.clip.top
            };
          });
        });
      });
    },
    svgItemdblClick(item, event) {
      if (item.type == "text") {
        //获取文字textJson的第一个文字大小

        this.startTextEdit(item);
        //取消选择状态
        this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
        this.$store.commit("setselectedItem", null);
      } else if (item.type == "container") {
        this.startEditContainer(item);
      } else if (item.type == "image") {
        this.openImageCropper(item);
      } else if (item.type == "groupText") {
        var rectID = $(event.target).data("id");

        for (var i = 0; i < item.edit_data.text.length; i++) {
          if (item.edit_data.text[i].id == rectID) {
            //计算当前选中的target的boudingbox,减去左侧偏移
            var rect = {
              left: 0,
              top: 0,
              width: 0,
              height: 0
            };
            var boundingRect = event.target.getBoundingClientRect();
            var cx = $("#stage_canvas").offset().left;
            var cy = $("#stage_canvas").offset().top;
            rect.left = boundingRect.left - cx;
            rect.top = boundingRect.top - cy;
            rect.width = boundingRect.width;
            rect.height = boundingRect.height;
            this.startGroupTextEdit(item, item.edit_data.text[i], rect);
          }
        }
      } else if (item.type == "table") {
        //开始单元格编辑
        var row = $(event.target).data("row");
        var col = $(event.target).data("col");

        if (row != undefined && col != undefined) {

          this.$store.commit("setNowEditTable", item);
          eventBus.$emit("elementChange", {
            type: "update",
            targets: [item],
            snap: false
          });

          eventBus.$emit("stateChange", {
            type: "startEditTable",
            data: {
              row: row,
              col: col
            }
          });
        }
      }
    },
    startEditContainer(item) {
      //获取点击的字遮罩的index(前提是字遮罩中有图)
      var $svg = $(this.$refs[item.id][0]).find("svg"),
        index = -1;
      if ($svg.find(".kx-rect").length == 1) {
        if (item.edit_data.clipImg[0].url) {
          index = 0;
        } else {
          console.log("没有图编辑个鬼哦");
          return;
        }
      } else {
        eventBus.$emit("elementChange", {
          type: "update",
          targets: [item]
        });
        var x = event.clientX,
          y = event.clientY;
        var count = 0;
        var rect = $svg.find(".kx-rect");
        for (var i = 0; i < rect.length; i++) {
          var box = rect[i].getBoundingClientRect();
          if (common.mouseoverBox(x, y, box)) {
            if (item.edit_data.clipImg[i].url) {
              index = i;
            } else {
              console.log("没有图你点什么！");
              return;
            }
          } else {
            count++;
          }
        }
        if (count == 3) {
          for (var i = 0; i < rect.length; i++) {
            if (item.edit_data.clipImg[i].url) {
              index = i;
              break;
            }
          }
        }
      }

      console.log(index);
      //编辑容器开始
      var _self = this;
      _self.$store.commit("setselectedItem", null);
      _self.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      //计算旋转前svg的偏移
      var r = item.edit_config.rotation;
      item.edit_config.rotation = 0;
      this.$nextTick(function() {
        var oldRect = this.$refs["rect_" + item.id][0].getBoundingClientRect(),
          checkRect = $(this.$refs[item.id][0])
            .find(".kx-rect")
            [index].getBoundingClientRect();
        item.edit_config.rotation = r;

        eventBus.$emit("containerEdit", {
          item: item, //svg数据
          index: index, //字遮罩的index
          dom: _self.$refs[item.id][0], //svg的dom
          oldRect: oldRect, //旋转前svg的偏移
          checkRect: checkRect,
          scale: this.$store.state.stage.zoom / 100 //舞台缩放比例
        });
      });
    },
    updateTableTextSvg(item, emitEvent) {
      var _self = this;
      //已经生成svg的组合文字
      var nowText = 0;
      //总共需要生成的组合文字
      var totalText = 0;
      //所有的表格对象
      var tabelCellArray = [];

      for (var row in item.edit_data.cell) {
        for (var col in item.edit_data.cell[row]) {
          tabelCellArray.push({
            cell: item.edit_data.cell[row][col],
            row: row,
            col: col,
            item: item
          });
          if (item.edit_data.cell[row][col].text != "") {
            totalText++;
          }
        }
      }

      for (var i in tabelCellArray) {
        var textItem = tabelCellArray[i];
        if (textItem.cell.text.length > 0) {
          var textDataArr = [];
          var textData = {
            align: textItem.cell.align,
            lineHeight: 100,
            text: []
          };
          for (var ii = 0; ii < textItem.cell.text.length; ii++) {
            var char = textItem.cell.text.charAt(ii);
            if (char.charCodeAt() == 10) {
              //换行
              textDataArr.push(textData);
              textData = {
                align: textItem.cell.align,
                lineHeight: textItem.cell.lineHeight,
                text: []
              };
            } else {
              textData.text.push({
                family: textItem.cell.fontFamily,
                size: textItem.cell.fontSize,
                color: textItem.cell.color.newColor,
                italic: textItem.cell.italic,
                letterSpacing: textItem.cell.letterSpacing,
                char: char
              });
            }
          }
          textDataArr.push(textData);

          socket.textToSvg(textDataArr, textItem, function(e) {
            e.target.cell.svg = e.data;
            nowText++;
            if (nowText == totalText) {
              if (emitEvent != false) {
                _self.update++;
                eventBus.$emit("elementChange", {
                  type: "update",
                  targets: [item]
                });
              }
            }
          });
        }
      }
    },
    stopTableCellEdit() {
      if (this.nowEditTable != null) {
        var item = this.nowEditTable;
        console.log("更新表格文字");
        var cellArr = item.edit_data.cell;
        var isEmpty = true;
        for (var row in cellArr) {
          for (var col in cellArr[row]) {
            if (cellArr[row][col].text.length > 0) {
              isEmpty = false;
            }
          }
        }
        if (isEmpty == false) {
          this.updateTableTextSvg(item);
        }
        this.$store.commit("setNowEditTable", null);
      }
    },
    stageAreaKeyDown(e) {
      this.hoverElement = null;
      //console.log(document.activeElement.nodeName)
      if (e.shiftKey) {
        this.shiftIsDown = true;
        //$(this.$refs.selectionBoxRect).css('pointer-events','none')
      }
      if (e.keyCode == 46) {
        if (this.getSelectedItems.length > 0) {
          //删除元素
          this.removeElement();
        } else if (this.guides.movingItem != undefined) {
          for (let i in this.getCustomGuides) {
            if (this.guides.movingItem == this.getCustomGuides[i]) {
              this.getCustomGuides.splice(i, 1);
              break;
            }
          }
          this.$store.state.editor.guides.movingItem = undefined;
        }
      } else if (e.keyCode == 8) {
        if (document.activeElement.nodeName == "BODY") {
          return false;
        }
      } else if (e.keyCode == 67 && e.ctrlKey) {
        //复制
        if (this.getSelectedItems.length > 0) {
          var copyArr = [];
          for (var i = 0; i < this.getSelectedItems.length; i++) {
            var copyObj = JSON.parse(JSON.stringify(this.getSelectedItems[i]));
            switch (copyObj.type) {
              case "svg":
              case "pattern":
              case "grid":
                //获取所有的带ID参数的svg,在后面添加随机数
                var idArr = [];
                var $svgData = $(copyObj.edit_data.svg);
                $svgData.find("*[id]").each(function() {
                  var id = $(this).attr("id");
                  if (
                    id != "NO" &&
                    id != "zhong" &&
                    id != "shang" &&
                    id != "xia" &&
                    id != "zuo" &&
                    id != "you" &&
                    id != "zuoshang" &&
                    id != "zuoxia" &&
                    id != "youshang" &&
                    id != "youxia" &&
                    id != "G"
                  ) {
                    //判断oldID是否存在
                    var find = false;
                    for (var d in idArr) {
                      if (idArr[d].oldID == id) {
                        find = true;
                        break;
                      }
                    }
                    if (find == false) {
                      idArr.push({
                        oldID: id,
                        newID: id + "_c"
                      });
                    }
                  }
                });
                //替换ID
                var svgHtml = $svgData.html();
                for (var d in idArr) {
                  svgHtml = svgHtml.replace(
                    new RegExp('id="' + idArr[d].oldID, "gm"),
                    'id="' + idArr[d].newID
                  );
                  svgHtml = svgHtml.replace(
                    new RegExp("#" + idArr[d].oldID, "gm"),
                    "#" + idArr[d].newID
                  );
                }

                $svgData[0].innerHTML = svgHtml;
                copyObj.edit_data.svg = $svgData[0].outerHTML;
            }
            copyArr.push(JSON.stringify(copyObj));
          }
          let copyObj = {
            copyData: copyArr,
            isGroup: this.selectedGroup
          };
          this.$store.commit("setCopyData", copyObj);
          //写入localStorage,实现跨页面复制
          localStorage.removeItem("crossPageCopyData");
          localStorage.setItem("crossPageCopyData", JSON.stringify(copyObj));
        }
      } else if (e.keyCode == 88 && e.ctrlKey) {
        //剪贴
        if (
          this.getSelectedItems.length > 0 &&
          document.activeElement.nodeName != "INPUT" &&
          document.activeElement.nodeName != "TEXTAREA"
        ) {
          var copyArr = [];
          for (var i in this.getSelectedItems) {
            copyArr.push(JSON.stringify(this.getSelectedItems[i]));
          }
          let copyObj = {
            copyData: copyArr,
            isGroup: this.selectedGroup
          };
          this.$store.commit("setCopyData", copyObj);
          localStorage.removeItem("crossPageCopyData");
          localStorage.setItem("crossPageCopyData", JSON.stringify(copyObj));
          this.removeElement();
        }
      } else if (e.keyCode == 86 && e.ctrlKey) {
        //文本编辑时不进行元素复制
        if (
          this.$store.state.editor.nowEditText == null &&
          this.nowEditGroupText == null &&
          this.nowEditTable == null &&
          document.activeElement.nodeName == "BODY"
        ) {
          //粘贴
          this.pasteElement();
        }
      } else if (e.keyCode == 90 && e.ctrlKey) {
        //撤销
        this.undo();
      } else if (e.keyCode == 89 && e.ctrlKey) {
        //恢复
        this.redo();
      } else if (e.keyCode == 38 && e.shiftKey) {
        //加速上
        this.moveElement(0, -10);
      } else if (e.keyCode == 40 && e.shiftKey) {
        //加速下
        this.moveElement(0, 10);
      } else if (e.keyCode == 37 && e.shiftKey) {
        //加速左
        this.moveElement(-10, 0);
      } else if (e.keyCode == 39 && e.shiftKey) {
        //加速右
        this.moveElement(10, 0);
      } else if (e.keyCode == 38) {
        //上
        this.moveElement(0, -1);
      } else if (e.keyCode == 40) {
        //下
        this.moveElement(0, 1);
      } else if (e.keyCode == 37) {
        //左
        this.moveElement(-1, 0);
      } else if (e.keyCode == 39) {
        //右
        this.moveElement(1, 0);
      } else if (
        e.keyCode == 65 &&
        e.ctrlKey &&
        document.activeElement.nodeName != "INPUT" &&
        document.activeElement.nodeName != "TEXTAREA"
      ) {
        if (
          this.$store.state.editor.nowEditText == null &&
          this.nowEditGroupText == null &&
          this.nowEditTable == null
        ) {
          var _self = this;
          //全选  ctrl+A
          this.$store.commit("setselectedItem", null);
          //筛选过滤掉锁定的元素进行全选
          var itemArr = [],
            item = this.getNowPageData.data;
          for (var i = 0; i < item.length; i++) {
            item[i].edit_config.lock || itemArr.push(item[i]);
          }
          if (itemArr.length == 1) {
            //单选
            this.$store.commit("setselectedItem", itemArr[0]);
          } else {
            this.$store.commit("setSelectionBox", [
              { name: "items", val: itemArr }
            ]);
            this.updateSelectionBoxPositionAndSize();
          }
        }
      } else if (e.ctrlKey && e.shiftKey && e.keyCode == 83) {
        //另存为
        this.$store.commit("callModal", { type: "save", modalOver: true });
        return false;
      } else if (e.ctrlKey && e.keyCode == 83) {
        //保存
        if (
          this.$store.state.editor.nowEditText == null &&
          this.nowEditGroupText == null &&
          this.nowEditTable == null
        ) {
          if (this.$store.state.editor.modal.wait == false) {
            var _self = this;
            //关闭其他的
            this.$store.commit("callModal");
            //开启等待
            this.$store.commit("callModal", { type: "wait", modalOver: true });
            //开始保存
            socket.saveFile(function() {
              //保存成功
              _self.$store.commit("callModal");
            }, true);
          }
        }
        return false;
      } else if (e.ctrlKey && e.shiftKey && e.keyCode == 219) {
        //置底
        eventBus.$emit("layerChange", "bottom");
      } else if (e.ctrlKey && e.shiftKey && e.keyCode == 221) {
        //置顶
        eventBus.$emit("layerChange", "top");
      } else if (e.ctrlKey && e.keyCode == 219) {
        //下移
        eventBus.$emit("layerChange", "down");
      } else if (e.ctrlKey && e.keyCode == 221) {
        //上移
        eventBus.$emit("layerChange", "up");
      }
    },
    stageAreaKeyUp(e) {
      if (e.shiftKey == false) {
        this.shiftIsDown = false;
        //$(this.$refs.selectionBoxRect).css('pointer-events','auto')
      }
    },
    addElementHandle(data) {
      let tempUrl = data.url;
			data.url = data.url+'?t='+parseInt(Math.random()*1e6);
      //如果类型为背景,则根据后缀格式更改类型为bg-svg,bg_img
      if (data.type == "background") {
        if (data.url.indexOf(".svg") != -1) {
          data.type = "bg_svg";
        } else {
          data.type = "bg_image";
        }

      }
      switch (data.type) {
        //	$svgItem.prepend('<rect fill="rgba(0,0,0,0)" width="'+item.edit_config.originalWidth+'" height="'+item.edit_config.originalHeight+'"></rect>');
        //是否矩形选择,暂时不打开了,因为
        case "svg":
        case "bg_svg":
          this.$http.get(data.url).then(function(ajax_result) {
            //去除无用的信息,取出纯svg
            var $svgData = $(ajax_result.data);
            var svgData = null;
            for (var i = 0; i < $svgData.length; i++) {
              if ($svgData[i].nodeName == "svg") {
                svgData = $svgData[i];
                break;
              }
            }
            var $svgData = $(svgData);
            //如果没有width和height,则从viebox读取
            var viewBox = $svgData.attr("viewBox").split(" ");
            $svgData.attr("width", viewBox[2] + "px");
            $svgData.attr("height", viewBox[3] + "px");

            //转换style添加样式为标签添加样式
            $svgData.find("*[style]").each(function() {
              var styleArr = $(this)
                .attr("style")
                .split(";");
              for (var i = 0; i < styleArr.length; i++) {
                var styleItem = styleArr[i].split(":");
                if (styleItem.length == 2) {
                  $(this).attr(styleItem[0], styleItem[1]);
                }
              }
              //删除style
              $(this).attr("style", "");
            });

            //读取style标签(如果有)
            var styleText = $svgData
              .find("style")
              .text()
              .replace(new RegExp(" ", "gm"), "")
              .replace(new RegExp("	", "gm"), "")
              .split("\n");
            var styleArr = [];
            for (var i = 0; i < styleText.length; i++) {
              if (styleText[i] != "") {
                var styleItem = styleText[i].split("{");
                var tempValue = styleItem[1].replace("}", "").split(";");
                var valueArr = [];
                for (var c = 0; c < tempValue.length; c++) {
                  var valueItem = tempValue[c].split(":");
                  valueArr.push({
                    name: valueItem[0],
                    value: valueItem[1]
                  });
                }
                var temp_item = {
                  name: styleItem[0].replace(".", ""),
                  value: valueArr
                };
                if (
                  temp_item.name != undefined &&
                  temp_item.value != undefined
                ) {
                  styleArr.push(temp_item);
                }
              }
            }

            //读取class并读取里面的属性并添加标签
            $svgData.find("*[class]").each(function() {
              //读取class标签
              var classTagArr = $(this)
                .attr("class")
                .split(" ");

              for (var b = 0; b < classTagArr.length; b++) {
                //console.log('搜索tag对应的style对象',classTagArr[b]);
                //在styleArr搜索名为classTagArr[b]的对象
                for (var n = 0; n < styleArr.length; n++) {
                  if (styleArr[n].name == classTagArr[b]) {
                    //console.log('搜索到对应的style',styleArr[n]);
                    for (var j = 0; j < styleArr[n].value.length; j++) {
                      var t_name = styleArr[n].value[j].name;
                      var t_val = styleArr[n].value[j].value;
                      if (t_name != undefined && t_val != undefined) {
                        $(this).attr(
                          styleArr[n].value[j].name,
                          styleArr[n].value[j].value
                        );
                      }
                    }
                  }
                }
                //删除class
                $(this).removeClass(classTagArr[b]);
              }
            });

            //遍历所有可填充颜色的元素,查找fill未设置的元素,为其设置默认黑色#000000
            var svgNodeName = "rect,circle,ellipse,line,polygon,path";
            $svgData.find(svgNodeName).each(function() {
              if ($(this).attr("fill") == undefined) {
                $(this).attr("fill", "#000000");
              }
            });

            var colorObjArr = [];
            //分析svg内的所有fill属性

            $svgData.find("*[fill]").each(function() {
              //查找父级,一直到顶层,查找ID是否有NO的
              var $parentNode = $(this);
              var ignoreColor = false;
              while ($parentNode.get(0).nodeName != "svg") {
                $parentNode = $parentNode.parent();
                if ($parentNode.length == 0) {
                  break;
                }
                if ($parentNode.attr("id") == "NO") {
                  ignoreColor = true;
                  $(this).attr("data-ignoreColor", "");
                }
              }
              if (ignoreColor == false) {
                //获取当前dom填充色
                var fill = $(this).attr("fill");
                //判断是否是过渡色
                if (fill.indexOf("url") == -1 && fill.indexOf("#") != -1) {
                  //判断是否已存在
                  var find = false;
                  for (var i = 0; i < colorObjArr.length; i++) {
                    if (fill == colorObjArr[i].oldColor) {
                      find = true;
                      break;
                    }
                  }
                  if (find == false) {
                    colorObjArr.push({
                      oldColor: fill,
                      newColor: fill
                    });
                  }
                }
              }
            });

            //分析svg内的所有stroke属性
            $svgData.find("*[stroke]").each(function() {
              //查找父级,一直到顶层,查找ID是否有NO的
              var $parentNode = $(this);
              var ignoreColor = false;
              while ($parentNode.get(0).nodeName != "svg") {
                $parentNode = $parentNode.parent();
                if ($parentNode.length == 0) {
                  break;
                }
                if ($parentNode.attr("id") == "NO") {
                  ignoreColor = true;
                  $(this).attr("data-ignoreColor", "");
                }
              }
              if (ignoreColor == false) {
                //获取当前dom填充色
                var fill = $(this).attr("stroke");
                //判断是否是过渡色
                if (fill.indexOf("url") == -1 && fill.indexOf("#") != -1) {
                  //判断是否已存在
                  var find = false;
                  for (var i = 0; i < colorObjArr.length; i++) {
                    if (fill == colorObjArr[i].oldColor) {
                      find = true;
                      break;
                    }
                  }
                  if (find == false) {
                    colorObjArr.push({
                      oldColor: fill,
                      newColor: fill
                    });
                  }
                }
              }
            });

            //检测text和texcSpan,如果长度大于0,则删除,并提示
            if ($svgData.find("text,tspan").length > 0) {
              $svgData.find("text,tspan").remove();
              this.$store.commit("callModal", {
                type: "alert",
                modalOver: true,
                cls: "ok",
                text: "该SVG图像包含未���曲（打散）的文本,已被自动忽略。如果您希望显示这些文本，请在设计软件内将这些文字转曲（打散）"
              });
            }
            //获取所有的带ID参数的svg,在后面添加随机数
            var idArr = [];
            $svgData.find("*[id]").each(function() {
              var id = $(this).attr("id");
              if (
                id != "NO" &&
                id != "zhong" &&
                id != "shang" &&
                id != "xia" &&
                id != "zuo" &&
                id != "you" &&
                id != "zuoshang" &&
                id != "zuoxia" &&
                id != "youshang" &&
                id != "youxia" &&
                id != "G"
              ) {
                //判断oldID是否存在
                var find = false;
                for (var d in idArr) {
                  if (idArr[d].oldID == id) {
                    find = true;
                    break;
                  }
                }
                if (find == false) {
                  idArr.push({
                    oldID: id,
                    newID: id + "_" + common.getNewID()
                  });
                }
              }
            });
            //替换ID
            var svgHtml = $svgData.html();
            for (var d in idArr) {
              svgHtml = svgHtml.replace(
                new RegExp('id="' + idArr[d].oldID, "gm"),
                'id="' + idArr[d].newID
              );
              svgHtml = svgHtml.replace(
                new RegExp("#" + idArr[d].oldID, "gm"),
                "#" + idArr[d].newID
              );
            }

            $svgData[0].innerHTML = svgHtml;

            //添加元素到舞台
            if (colorObjArr.length > 10) {
              colorObjArr = [];
            }
            var edit_data = {};
            var type = "";

            if ($svgData.find("#zhong").length > 0) {
              type = "grid";
              edit_data.svg = $svgData.get(0).outerHTML;
              edit_data.color = colorObjArr;
              $("body").append(
                '<div id="tempcontain">' + $svgData[0].outerHTML + "</div>"
              );
              var $temp = $("#tempcontain svg");
              if ($svgData.find("#zuoshang").length > 0) {
                edit_data.gridNum = 9;
                edit_data.scaleH = true;
                edit_data.scaleV = true;
                (edit_data.zuo = {
                  width: $temp.find("#zuoshang")[0].getBBox().width,
                  height: $temp.find("#zuoshang")[0].getBBox().height
                }),
                  (edit_data.you = {
                    width: $temp.find("#youshang")[0].getBBox().width,
                    height: $temp.find("#youshang")[0].getBBox().height
                  }),
                  (edit_data.zhong = {
                    x: $temp.find("#zhong")[0].getBBox().x,
                    y: $temp.find("#zhong")[0].getBBox().y
                  }),
                  (edit_data.moveX = 0); //横向拉伸距离
                edit_data.moveY = 0; //纵向拉伸距离
                edit_data.scaleX = 1; //横向拉伸时中部缩放比例
                edit_data.scaleY = 1; //纵向拉伸时中部缩放比例
                edit_data.tx = 0; //横向拉伸时中部移动距离
                edit_data.ty = 0; //纵向拉伸时中部移动距离
                edit_data.owidth = 0; //svg宽度（等比缩放时更新）
                edit_data.oheight = 0; //svg高度（等比缩放时更新）
                edit_data.viewX = 0; //viewbox的x值
                edit_data.viewY = 0; //viewbox的y值
                edit_data.vscale = 1; //viewbox的缩放值
                //暂存数据
                edit_data.mx = 0;
                edit_data.my = 0;
                edit_data.sx = 1;
                edit_data.sy = 1;
                //原始图片标识ID
                edit_data.oldID = data.item.id;
                $("body")
                  .find("#tempcontain")
                  .remove();
              } else if ($svgData.find("#zuo").length > 0) {
                //横版三宫格
                edit_data.gridNum = 3;
                edit_data.scaleH = true;
                edit_data.scaleV = false;
                (edit_data.zuo = {
                  width: $temp.find("#zuo")[0].getBBox().width,
                  height: $temp.find("#zuo")[0].getBBox().height
                }),
                  (edit_data.you = {
                    width: $temp.find("#you")[0].getBBox().width,
                    height: $temp.find("#you")[0].getBBox().height
                  }),
                  (edit_data.zhong = {
                    x: $temp.find("#zhong")[0].getBBox().x,
                    y: $temp.find("#zhong")[0].getBBox().y
                  }),
                  (edit_data.moveX = 0);
                edit_data.scaleX = 1;
                edit_data.tx = 0;
                edit_data.owidth = 0; //svg宽度（等比缩放时更新）
                edit_data.oheight = 0; //svg高度（等比缩放时更新）
                edit_data.viewX = 0; //viewbox的x值
                edit_data.viewY = 0; //viewbox的y值
                edit_data.vscale = 1; //viewbox的缩放值
                //暂存数据
                edit_data.mx = 0;
                edit_data.sx = 1;
                $("body")
                  .find("#tempcontain")
                  .remove();
                console.log(edit_data, ".............");
                //原始图片标识ID
                edit_data.oldID = data.item.id;
              } else {
                //竖版三宫格
                edit_data.gridNum = 3;
                edit_data.scaleH = false;
                edit_data.scaleV = true;
                (edit_data.shang = {
                  width: $temp.find("#shang")[0].getBBox().width,
                  height: $temp.find("#shang")[0].getBBox().height
                }),
                  (edit_data.xia = {
                    width: $temp.find("#xia")[0].getBBox().width,
                    height: $temp.find("#xia")[0].getBBox().height
                  }),
                  (edit_data.zhong = {
                    x: $temp.find("#zhong")[0].getBBox().x,
                    y: $temp.find("#zhong")[0].getBBox().y
                  }),
                  (edit_data.moveY = 0);
                edit_data.scaleY = 1;
                edit_data.ty = 0;
                edit_data.owidth = 0; //svg宽度（等比缩放时更新）
                edit_data.oheight = 0; //svg高度（等比缩放时更新）
                edit_data.viewX = 0; //viewbox的x值
                edit_data.viewY = 0; //viewbox的y值
                edit_data.vscale = 1; //viewbox的缩放值
                //暂存数据
                edit_data.my = 0;
                edit_data.sy = 1;
                $("body")
                  .find("#tempcontain")
                  .remove();
                //原始图片标识ID
                edit_data.oldID = data.item.id;
              }
            } else if ($svgData.find("pattern").length > 0) {
              //这是个印章
              type = "pattern";
              edit_data = {
                svg: $svgData.get(0).outerHTML,
                color: colorObjArr,
                scaleH: true,
                scaleV: false,
                //原始图片标识ID
                oldID: data.item.id
              };

              //判断三宫格&九宫格
            } else {
              //处理用户上传的容器
              if ($svgData.find("g[clip-path]").length > 0) {
                var iscontainer = false;
                $svgData.find("g[clip-path]").each(function(i, item) {
                  $(item)
                    .find("g")
                    .each(function(i, g) {
                      if (
                        g.childElementCount == 2 &&
                        g.firstElementChild.tagName == "image" &&
                        g.lastElementChild.tagName == "rect"
                      ) {
                        iscontainer = true;
                        $(g).addClass("kx-frame");
                        $(g)
                          .find("image")
                          .addClass("kx-image");
                        $(g)
                          .find("rect")
                          .addClass("kx-rect");
                      }
                    });
                });
                if (iscontainer) {
                  //处理id重复问题
                  var svgdata = $svgData[0].outerHTML;
                  svgdata = svgdata
                    .replace(
                      /SVGID_1_/g,
                      "SVGID_1_" +
                        new Date()
                          .getTime()
                          .toString()
                          .slice(-4)
                    )
                    .replace(
                      /SVGID_2_/g,
                      "SVGID_2_" +
                        new Date()
                          .getTime()
                          .toString()
                          .slice(-5, -1)
                    );
                  var $svgData = $(svgdata);
                  $svgData
                    .find(".kx-rect")
                    .attr("transform", "matrix(1 0 0 1 0 0)");
                  //初始化遮罩图片数组
                  var arr = new Array($svgData.find(".kx-rect").length);
                  for (var i = 0; i < arr.length; i++) {
                    arr[i] = {
                      url: "",
                      width: 0,
                      height: 0,
                      rotation: 0,
                      rotateX: 0,
                      rotateY: 0,
                      left: 0,
                      top: 0
                    };
                  }
                  //添加元素到舞台
                  this.addElementToStage(
                    "container",
                    {
                      svg: $svgData[0].outerHTML,
                      clipImg: arr,
                      //loading:false,
                      color: colorObjArr,
                      filter: {
                        //亮度
                        bright: 0,
                        //对比度
                        contrast: 0,
                        //饱和度
                        saturation: 0,
                        //色相
                        hue: 0,
                        //模糊
                        blur: 0,
                        //负片冲印
                        film: 0
                      }
                    },
                    {
                      isBackground: false,
                      position: data.pos,
                      source: data.item
                    }
                  );
                  return;
                }
              }
              //这是个普通的svg
              type = "svg";

              edit_data = {
                svg: $svgData.get(0).outerHTML,
                color: colorObjArr,
                //原始图片标识ID
                oldID: data.item.id
              };
            }
            var isBackground = false;
            if (data.type == "bg_svg") {
              isBackground = true;
              //如果是背景,则删除之前的背景,并替换新的背景
            }

            var id = this.addElementToStage(type, edit_data, {
              isBackground: isBackground,
              position: data.pos,
              source: data.item
            });
          });
          break;
        case "image":
        case "bg_image":
          data.url = tempUrl;
          var imgObj = {
            url: data.url,
            filter: {
              //亮度
              bright: 0,
              //对比度
              contrast: 0,
              //饱和度
              saturation: 0,
              //色相
              hue: 0,
              //模糊
              blur: 0,
              //负片冲印
              film: 0
            },
            //裁剪
            clip: {
              left: 0,
              top: 0,
              width: 0,
              height: 0
            },
            //圆角
            radius: 0,

            //原始图片标识ID
            oldID: data.item.id
          };
          var isBackground = false;
          if (data.type == "bg_image") {
            isBackground = true;
          }
          var id = this.addElementToStage("image", imgObj, {
            isBackground: isBackground,
            position: data.pos,
            source: data.item
          });

          break;
        case "container":
          this.$http.get(data.url).then(function(ajax_result) {
            //去除无用的信息,取出纯svg
            var $data = $(ajax_result.data);
            var svgdata = null;
            for (var i = 0; i < $data.length; i++) {
              if ($data[i].nodeName == "svg") {
                svgdata = $data[i];
                break;
              }
            }

            var $svgData = $(svgdata);
            //如果没有width和height,则从viebox读取

            var viewBox = $svgData.attr("viewBox").split(" ");
            $svgData.attr("width", viewBox[2] + "px");
            $svgData.attr("height", viewBox[3] + "px");
            //读取style标签(如果有)
            var styleText = $svgData
              .find("style")
              .text()
              .replace(new RegExp(" ", "gm"), "")
              .replace(new RegExp("	", "gm"), "")
              .split("\n");
            var styleArr = [];
            for (var i = 0; i < styleText.length; i++) {
              if (styleText[i] != "") {
                var styleItem = styleText[i].split("{");
                var tempValue = styleItem[1].replace("}", "").split(";");
                var valueArr = [];
                for (var c = 0; c < tempValue.length; c++) {
                  var valueItem = tempValue[c].split(":");
                  valueArr.push({
                    name: valueItem[0],
                    value: valueItem[1]
                  });
                }
                var temp_item = {
                  name: styleItem[0].replace(".", ""),
                  value: valueArr
                };
                if (
                  temp_item.name != undefined &&
                  temp_item.value != undefined
                ) {
                  styleArr.push(temp_item);
                }
              }
            }

            //读取class并读取里面的属性并添加标签
            $svgData.find("*[class]").each(function() {
              //读取class标签
              var classTagArr = $(this)
                .attr("class")
                .split(" ");

              for (var b = 0; b < classTagArr.length; b++) {
                //console.log('搜索tag对应的style对象',classTagArr[b]);
                //在styleArr搜索名为classTagArr[b]的对象
                for (var n = 0; n < styleArr.length; n++) {
                  if (styleArr[n].name == classTagArr[b]) {
                    //console.log('搜索到对应的style',styleArr[n]);
                    for (var j = 0; j < styleArr[n].value.length; j++) {
                      var t_name = styleArr[n].value[j].name;
                      var t_val = styleArr[n].value[j].value;
                      if (t_name != undefined && t_val != undefined) {
                        $(this).attr(
                          styleArr[n].value[j].name,
                          styleArr[n].value[j].value
                        );
                      }
                    }
                  }
                }
                //删除class
                $(this).removeClass(classTagArr[b]);
              }
            });

            //遍历所有可填充颜色的元素,查找fill未设置的元素,为其设置默认黑色#000000
            var svgNodeName = "rect,circle,ellipse,line,polygon,path";
            $svgData.find(svgNodeName).each(function() {
              if ($(this).attr("fill") == undefined) {
                $(this).attr("fill", "#000000");
              }
            });

            var colorObjArr = [];
            //分析svg内的所有fill属性

            $svgData.find("*[fill]").each(function() {
              //查找父级,一直到顶层,查找ID是否有NO的
              var $parentNode = $(this);
              var ignoreColor = false;
              while ($parentNode.get(0).nodeName != "svg") {
                $parentNode = $parentNode.parent();
                if ($parentNode.length == 0) {
                  break;
                }
                if ($parentNode.attr("id") == "NO") {
                  ignoreColor = true;
                  $(this).attr("data-ignoreColor", "");
                }
              }
              if (ignoreColor == false) {
                //获取当前dom填充色
                var fill = $(this).attr("fill");
                //判断是否是过渡色
                if (fill.indexOf("url") == -1 && fill.indexOf("#") != -1) {
                  //判断是否已存在
                  var find = false;
                  for (var i = 0; i < colorObjArr.length; i++) {
                    if (fill == colorObjArr[i].oldColor) {
                      find = true;
                      break;
                    }
                  }
                  if (find == false) {
                    colorObjArr.push({
                      oldColor: fill,
                      newColor: fill
                    });
                  }
                }
              }
            });

            //分析svg内的所有stroke属性
            $svgData.find("*[stroke]").each(function() {
              //查找父级,一直到顶层,查找ID是否有NO的
              var $parentNode = $(this);
              var ignoreColor = false;
              while ($parentNode.get(0).nodeName != "svg") {
                $parentNode = $parentNode.parent();
                if ($parentNode.length == 0) {
                  break;
                }
                if ($parentNode.attr("id") == "NO") {
                  ignoreColor = true;
                  $(this).attr("data-ignoreColor", "");
                }
              }
              if (ignoreColor == false) {
                //获取当前dom填充色
                var fill = $(this).attr("stroke");
                //判断是否是过渡色
                if (fill.indexOf("url") == -1 && fill.indexOf("#") != -1) {
                  //判断是否已存在
                  var find = false;
                  for (var i = 0; i < colorObjArr.length; i++) {
                    if (fill == colorObjArr[i].oldColor) {
                      find = true;
                      break;
                    }
                  }
                  if (find == false) {
                    colorObjArr.push({
                      oldColor: fill,
                      newColor: fill
                    });
                  }
                }
              }
            });
            //容器预处理
            $svgData.find("g[clip-path]").each(function(i, item) {
              $(item)
                .find("g")
                .each(function(i, g) {
                  if (
                    g.childElementCount == 2 &&
                    g.firstElementChild.tagName == "image" &&
                    g.lastElementChild.tagName == "rect"
                  ) {
                    $(g).addClass("kx-frame");
                    $(g)
                      .find("image")
                      .addClass("kx-image");
                    $(g)
                      .find("rect")
                      .addClass("kx-rect");
                  }
                });
            });
            //处理id重复问题
            svgdata = $svgData[0].outerHTML;
            svgdata = svgdata
              .replace(
                /SVGID_1_/g,
                "SVGID_1_" +
                  new Date()
                    .getTime()
                    .toString()
                    .slice(-4)
              )
              .replace(
                /SVGID_2_/g,
                "SVGID_2_" +
                  new Date()
                    .getTime()
                    .toString()
                    .slice(-5, -1)
              );
            var $svgData = $(svgdata);
            $svgData.find(".kx-rect").attr("transform", "matrix(1 0 0 1 0 0)");
            //初始化遮罩图片数组
            var arr = new Array($svgData.find(".kx-rect").length);
            for (var i = 0; i < arr.length; i++) {
              arr[i] = {
                url: "",
                width: 0,
                height: 0,
                rotation: 0,
                rotateX: 0,
                rotateY: 0,
                left: 0,
                top: 0
              };
            }
            console.log(colorObjArr);
            //添加元素到舞台
            this.addElementToStage(
              "container",
              {
                svg: $svgData[0].outerHTML,
                clipImg: arr,
                //loading:false,
                color: colorObjArr,

                filter: {
                  //亮度
                  bright: 0,
                  //对比度
                  contrast: 0,
                  //饱和度
                  saturation: 0,
                  //色相
                  hue: 0,
                  //模糊
                  blur: 0,
                  //负片冲印
                  film: 0
                }
              },
              {
                isBackground: false,
                position: data.pos,
                source: data.item
              }
            );
          });
          break;
        case "text":
          //首次加载先到服务器请求,然后再添加元素到舞台

          //或者直接调用生成好的默认文本
          var textSvg = "";
          var inputText = "";

          if (data.font == "title") {
            textSvg =
              '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 192.47224130859377 31.55953212890625" xml:space="preserve" width="192.47224130859377" height="31.55953212890625" preserveAspectRatio="none" data-parent="shape_3"><rect fill="rgba(0,0,0,0)" width="192.47224130859377" height="31.55953212890625"></rect> <g transform="translate(0, 27.107215283203125)"> <g><path fill="#000000" d="M14.51-22.07L14.51-24.46L29.33-24.46L29.33-22.17Q27.99-10.79 23.57-4.80Q26.90-0.93 31.50 1.21Q30.40 2.53 29.45 3.60Q25.19 0.91 21.98-2.85Q18.42 1.12 12.37 4.36Q11.80 3.54 10.70 2.16Q16.80-0.80 20.39-4.85Q16.11-10.87 15.35-22.07L14.51-22.07M0.91-18.30L2.89-19.52Q5.76-15.31 8.61-10.86Q10.53-15.92 11.11-22.01L0.53-22.01L0.53-24.40L13.62-24.40L13.62-22.01Q12.54-13.88 10.18-8.35Q12.29-5.03 14.38-1.56L12.30 0.05Q10.54-2.94 8.87-5.70Q6.18-0.77 1.95 3.29Q0.98 2.25 0 1.53Q4.92-3.10 7.41-8.09Q3.93-13.77 0.91-18.30M26.68-22.07L17.67-22.07Q18.47-12.02 21.95-6.88Q25.6`-12.52 26.68-22.07Z"></path></g> <g><path fill="#000000" d="M57.80 4.11L57.80 2.75L35.59 2.75L35.59-7.98L38.29-7.98L38.29 0.36L46.60 0.36L46.60-10.68L32.57-10.68L32.57-13.07L46.60-13.07L46.60-18.74L34.83-18.74L34.83-21.13L46.60-21.13L46.60-26.76L49.37-26.76L49.37-21.13L61.23-21.13L61.23-18.74L49.37-18.74L49.37-13.07L63.37-13.07L63.37-10.68L49.37-10.68L49.37 0.36L57.80 0.36L57.80-7.98L60.51-7.98L60.51 4.11L57.80 4.11Z"></path></g> <g><path fill="#000000" d="M75.99-17.89Q79.86-21.95 81.87-26.76L84.14-26.07Q83.52-24.76 82.85-23.55L93.23-23.55L93.23-21.57Q91.04-18.39 87.96-15.98Q91.11-14.35 95.87-13.51Q95.37-12.70 94.77-11.19Q89.06-12.62 85.93-14.57Q82.49-12.38 77.12-10.49Q76.52-11.50 75.80-12.54Q80.68-13.83 84.11-15.89Q81.98-17.60 80.44-19.71Q79.18-17.95 77.75-16.41Q77.06-17.10 75.99-17.89M64.50-11.47Q68.41-18.39 70.32-26.76L72.65-26.32Q71.69-22.64 70.54-19.41L70.54 4.14L68.31 4.14L68.31-13.94Q67.01-11.14 65.51-8.79Q65.10-10.05 64.50-11.47M93.04-5.55L94.46-3.82Q86.94 2.06 77.09 4.45Q76.46 3.29 75.83 2.41Q85.68 0.08 93.04-5.55M73.03-2.66L73.03-21.73L75.20-21.73L75.20-2.66L73.03-2.66M90.21-9.30L91.69-7.60Q86.28-3.54 78.76-0.74Q78.00-1.90 77.34-2.69Q85.21-5.24 90.21-9.30M87.16-12.51L88.67-10.90Q83.85-7.66 78.41-5.74Q77.91-6.69 77.00-7.63Q82.44-9.17 87.16-12.51M90.37-21.60L81.70-21.60Q81.68-21.57 81.67-21.54Q83.54-18.85 86.03-17.18Q88.83-19.27 90.37-21.60Z"></path></g> <g><path fill="#000000" d="M108.96-13.64Q111.95-19.08 114.31-26.89L116.80-26.16Q115.92-23.63 114.99-21.32L127.72-21.32L127.72-18.99L124.04-18.99Q123.19-8.79 119.46-3.89Q122.51-0.63 128.19 1.31Q127.28 2.19 126.21 3.76Q120.79 1.18 117.82-1.97Q114.61 1.31 108.21 4.26Q107.45 3.16 106.35 2.03Q112.94-0.72 116.15-3.98Q113.24-8.02 112.16-14.82Q111.36-13.17 110.54-11.66Q109.75-12.79 108.96-13.64M98.58-14.14L106.45-14.14L106.45-22.01L97.98-22.01L97.98-24.21L108.90-24.21L108.90-10.24L106.45-10.24L106.45-11.94L101.03-11.94L101.03-1.53Q104.87-3.35 108.90-5.62Q109.12-4.11 109.40-3.07Q105.31-1.02 101.00 1.40Q99.84 2.22 99.18 2.88L97.48 0.71Q98.58-0.30 98.58-2.12L98.58-14.14M113.75-18.30Q114.85-10.32 117.81-5.96Q120.75-10.26 121.57-18.99L114.05-18.99L113.75-18.30Z"></path></g> <g><path fill="#000000" d="M129.51-21.35L144.61-21.35Q143.02-24.37 142.13-25.75L144.55-26.89Q145.43-25.53 147.19-22.48L144.93-21.35L159.72-21.35L159.72-19.02L153.91-19.02Q152.23-10.04 146.67-4.58Q150.86-1.53 159.97 0.90Q158.52 2.53 157.77 3.63Q148.89 0.57 144.66-2.78Q140.41 0.52 131.08 3.89Q130.27 2.78 129.20 1.43Q138.19-1.27 142.74-4.59Q137.00-10.73 135.44-19.02L129.51-19.02L129.51-21.35M151.22-19.02L137.96-19.02Q139.37-11.28 144.72-6.23Q149.84-10.98 151.22-19.02Z"></path></g> <g><path fill="#000000" d="M161.38-8.20L176.14-8.20L176.14-10.18L182.34-14.08L167.11-14.08L167.11-16.38L186.18-16.38L186.18-13.83L178.72-9.05L178.72-8.20L192.47-8.20L192.47-5.87L178.72-5.87L178.72-0.08Q178.72 3.92 174.73 3.92Q173.12 3.92 170.04 3.85Q169.91 2.66 169.66 1.05Q172.15 1.40 174.07 1.40Q176.14 1.40 176.14-0.83L176.14-5.87L161.38-5.87L161.38-8.20M162.58-22.07L177.05-22.07Q175.89-23.72 174.25-25.69L176.36-27.11Q178.34-24.94 179.63-23.08L178.14-22.07L191.40-22.07L191.40-15.69L188.85-15.69L188.85-19.78L165.10-19.78L165.10-15.69L162.58-15.69L162.58-22.07Z"></path></g> </g> </svg>';
            inputText =
              '<p style="font-size:36px;text-align:left"><font class="wrap">双击修改文字</font></p>';
          } else {
            textSvg =
              '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 178.76953125 35.05078125" xml:space="preserve" width="178.76953125" height="35.05078125" preserveAspectRatio="none" data-parent="shape_0"><g transform="translate(0, 30.111328125)"><g><path fill="#000000" d="M15.01 4.45L12.27 4.45L12.27-13.38L31.82-13.38L31.82 0.30Q31.82 4.10 27.91 4.13Q25.84 4.17 22.61 4.17Q22.43 3.04 22.08 1.46Q25.14 1.67 27.07 1.67Q29.07 1.67 29.07-0.16L29.07-1.92L15.01-1.92L15.01 4.45M9.18-17.74L20.53-17.74L20.53-20.16L11.53-20.16L11.53-22.38L20.53-22.38L20.53-24.73L10.30-24.73L10.30-26.95L20.53-26.95L20.53-30.11L23.38-30.11L23.38-26.95L34.10-26.95L34.10-24.73L23.38-24.73L23.38-22.38L33.19-22.38L33.19-20.16L23.38-20.16L23.38-17.74L34.80-17.74L34.80-15.52L9.18-15.52L9.18-17.74M10.90-4.24Q11.00-2.48 11.14-1.18Q7.35 1.35 4.71 3.39L3.09 1.07Q4.29-0.05 4.29-1.99L4.29-15.28L0-15.28L0-17.84L6.96-17.84L6.96-1.46Q8.93-2.79 10.90-4.24M29.07-11.13L15.01-11.13L15.01-8.70L29.07-8.70L29.07-11.13M15.01-4.10L29.07-4.10L29.07-6.52L15.01-6.52L15.01-4.10M3.97-28.92Q6.86-26.07 9.07-23.61L6.61-21.57Q4.18-24.70 1.86-27.12L3.97-28.92Z"></path></g><g><path fill="#000000" d="M38.85-12.46L42.01-12.46L42.01-18.86L44.33-18.86L44.33-12.46L47.71-12.46L47.71-10.14L44.33-10.14L44.33-5.33Q46.20-5.57 48.13-5.89Q47.95-4.55 47.88-3.46Q46.09-3.22 44.33-2.97L44.33 4.87L42.01 4.87L42.01-2.62Q39.16-2.20 36.28-1.74L35.89-4.31Q38.92-4.62 42.01-5.01L42.01-10.14L36.39-10.14L36.39-12.57Q37.72-16.33 39.16-22.13L36.07-22.13L36.07-24.38L39.73-24.38Q40.32-26.91 40.96-29.79L43.49-29.23Q42.82-26.67 42.22-24.38L48.59-24.38L48.59-22.13L41.63-22.13Q40.08-16.44 38.85-12.46M51.15 4.80L48.90 4.80L48.90-15.91L58.25-15.91L58.25 1.39Q58.25 4.48 55.41 4.48Q54.32 4.48 52.66 4.45Q52.49 3.67 52.17 2.27Q53.58 2.37 54.74 2.37Q56.00 2.37 56.00 0.97L56.00-3.11L51.15-3.11L51.15 4.80M61.31-29.55L60.71-28.78Q64.83-22.59 71.02-19.92Q69.82-18.51 69.19-17.49Q66.80-18.83 64.76-20.51L64.76-18.76L52.56-18.76L52.56-20.30Q50.48-18.58 48.23-17.14Q47.18-18.51 46.37-19.28Q53.37-23.36 57.66-29.55L61.31-29.55M66.55-16.54L68.94-16.54L68.94 0.58Q68.94 4.48 65.64 4.52Q63.84 4.55 61.52 4.45Q61.35 3.15 61.03 1.81Q63.25 2.09 64.83 2.09Q66.55 2.09 66.55 0.26L66.55-16.54M58.99-26.95Q56.36-23.64 53.30-20.97L64.20-20.97Q61.21-23.57 58.99-26.95M61.17-14.85L63.42-14.85L63.42-2.06L61.17-2.06L61.17-14.85M51.15-5.08L56.00-5.08L56.00-8.46L51.15-8.46L51.15-5.08M56.00-13.76L51.15-13.76L51.15-10.42L56.00-10.42L56.00-13.76Z"></path></g><g><path fill="#000000" d="M81.63-27.83L83.95-29.48Q87.89-27.05 92.60-17.03Q99.18-2.65 106.88 0.51L104.41 3.60Q96.71-0.97 90.18-15.66Q89.65-16.84 89.14-17.91Q85.06-3.94 73.97 3.81Q73.02 2.41 71.82 1.18Q83.23-6.01 87.19-21.57Q84.43-26.17 81.63-27.83Z"></path></g><g><path fill="#000000" d="M107.75-7.93Q111.66-13.94 113.10-20.51L108-20.51L108-22.90L113.34-22.90L113.34-29.79L115.80-29.79L115.80-22.90L120.59-22.90L120.59-20.51L115.80-20.51L115.80-14.29L117.32-15.87Q119.57-13.94 121.29-12.15L119.43-10.21Q117.74-12.13 115.80-14.08L115.80 4.48L113.34 4.48L113.34-14.55Q111.48-8.51 108.91-4.83Q108.42-6.35 107.75-7.93M120.55-17.42L142.49-17.42L142.49-14.96L132.79-14.96L132.79-0.26Q132.79 4.13 128.74 4.13Q126.84 4.17 124.07 4.10Q123.89 2.83 123.57 1.18Q126 1.46 128.00 1.46Q130.11 1.46 130.11-1.14L130.11-14.96L120.55-14.96L120.55-17.42M122.17-27.72L140.87-27.72L140.87-25.26L122.17-25.26L122.17-27.72M135.11-10.42L137.60-11.62Q140.94-5.22 143.16-0.40L140.34 0.83Q138.06-4.62 135.11-10.42M123.82-11.62L126.46-10.56Q123.57-4.13 120.73 0.86Q119.64 0.23 118.16-0.37Q120.97-4.90 123.82-11.62Z"></path></g><g><path fill="#000000" d="M143.82 1.63Q146.39-1.85 146.60-9.12L149.03-9.12Q148.92-6.94 148.68-4.97Q149.98-2.62 151.98-1.18L151.98-10.78L144.11-10.78L144.11-13.06L160.35-13.06L160.35-10.78L154.30-10.78L154.30-7.05L159.96-7.05L159.96-4.76L154.30-4.76L154.30 0.09Q156.66 1.04 159.68 1.11Q165.87 1.49 178.77 0.93Q178.38 2.09 177.79 3.71Q165.20 4.03 159.68 3.57Q151.84 3.36 148.11-1.95Q147.20 2.02 145.37 4.94Q144.67 3.29 143.82 1.63M146.29-28.35L158.66-28.35L158.66-14.82L156.34-14.82L156.34-15.91L148.61-15.91L148.61-14.82L146.29-14.82L146.29-28.35M161.68-21.81L166.78-21.81Q167.13-23.89 167.38-25.82L160.38-25.82L160.38-28.11L178.03-28.11L178.03-25.82L169.98-25.82Q169.66-23.75 169.28-21.81L176.17-21.81L176.17-6.91L173.85-6.91L173.85-19.53L164.00-19.53L164.00-6.91L161.68-6.91L161.68-21.81M167.77-18.02L170.09-18.02L170.09-13.62Q170.09-10.18 169.38-7.72Q174.80-3.81 177.36-1.60L175.46 0.26Q172.65-2.37 168.54-5.47Q168.33-5.08 168.12-4.73Q166.01-1.35 160.95 0.62Q160.14-0.40 159.05-1.46Q163.97-3.08 165.87-5.78Q167.77-8.46 167.77-13.73L167.77-18.02M148.61-18.02L156.34-18.02L156.34-21.11L148.61-21.11L148.61-18.02M156.34-26.24L148.61-26.24L148.61-23.19L156.34-23.19L156.34-26.24Z"></path></g></g></svg>';
            inputText =
              '<p style="font-size:24px;text-align:left"><font class="wrap">双击修改文字</font></p>';
          }
          this.addElementToStage(
            "text",
            {
              //编辑的html文本
              text: inputText,
              //生成的svg结果
              svg: textSvg,
              //生成的文字json
              textJson: null,
              //文字弧度模式(-2=向上突起 -1=向上轻微突起 0=无突起 1=向下轻微突起 2=乡下突起突cd起)
              textRadian: 0,
              //环绕字间距
              textRadianLetterSpacing: 100,
              //上次编辑时编辑区的宽度
              editAreaWidth: 0
            },
            {
              isBackground: false,
              position: data.pos,
              source: data.item
            }
          );
          break;
        case "groupText":
          this.$http.get(data.url).then(function(ajax_result) {
            //去除无用的信息,取出纯svg
            var $svgData = $(ajax_result.data);
            var svgData = null;
            for (var i = 0; i < $svgData.length; i++) {
              if ($svgData[i].nodeName == "svg") {
                svgData = $svgData[i];
                break;
              }
            }

            var $svgData = $(svgData);
            //如果没有width和height,则从viebox读取
            var viewBox = $svgData.attr("viewBox").split(" ");
            $svgData.attr("width", viewBox[2] + "px");
            $svgData.attr("height", viewBox[3] + "px");
            //转换style添加样式为标签添加样式
            $svgData.find("*[style]").each(function() {
              var styleArr = $(this)
                .attr("style")
                .split(";");
              for (var i = 0; i < styleArr.length; i++) {
                var styleItem = styleArr[i].split(":");
                if (styleItem.length == 2) {
                  $(this).attr(styleItem[0], styleItem[1]);
                }
              }
              //删除style
              $(this).attr("style", "");
            });

            //读取style标签(如果有)
            var styleText = $svgData
              .find("style")
              .text()
              .replace(new RegExp(" ", "gm"), "")
              .replace(new RegExp("	", "gm"), "")
              .split("\n");
            var styleArr = [];
            for (var i = 0; i < styleText.length; i++) {
              if (styleText[i] != "") {
                var styleItem = styleText[i].split("{");
                var tempValue = styleItem[1].replace("}", "").split(";");
                var valueArr = [];
                for (var c = 0; c < tempValue.length; c++) {
                  var valueItem = tempValue[c].split(":");
                  valueArr.push({
                    name: valueItem[0],
                    value: valueItem[1]
                  });
                }
                var temp_item = {
                  name: styleItem[0].replace(".", ""),
                  value: valueArr
                };
                if (
                  temp_item.name != undefined &&
                  temp_item.value != undefined
                ) {
                  styleArr.push(temp_item);
                }
              }
            }

            //读取class并读取里面的属性并添加标签
            $svgData.find("*[class]").each(function() {
              //读取class标签
              var classTagArr = $(this)
                .attr("class")
                .split(" ");

              for (var b = 0; b < classTagArr.length; b++) {
                //console.log('搜索tag对应的style对象',classTagArr[b]);
                //在styleArr搜索名为classTagArr[b]的对象
                for (var n = 0; n < styleArr.length; n++) {
                  if (styleArr[n].name == classTagArr[b]) {
                    //console.log('搜索到对应的style',styleArr[n]);
                    for (var j = 0; j < styleArr[n].value.length; j++) {
                      var t_name = styleArr[n].value[j].name;
                      var t_val = styleArr[n].value[j].value;
                      if (t_name != undefined && t_val != undefined) {
                        var attrName = styleArr[n].value[j].name;
                        var attrValue = styleArr[n].value[j].value;
                        $(this).attr(attrName, attrValue);

                        //去除display:none的元素
                        if (attrName == "display" && attrValue == "none") {
                          $(this).remove();
                        }
                      }
                    }
                  }
                }
                //删除class
                $(this).removeClass(classTagArr[b]);
              }
            });

            //遍历所有可填充颜色的元素,查找fill未设置的元素,为其设置默认黑色#000000
            var svgNodeName = "rect,circle,ellipse,line,polygon,path";
            $svgData.find(svgNodeName).each(function() {
              if ($(this).attr("fill") == undefined) {
                $(this).attr("fill", "#000000");
              }
            });

            //分析svg内的所有fill属性
            var colorObjArr = [];
            //分析svg内的所有fill属性
            $svgData.find("*[fill]").each(function() {
              //查找父级,一直到顶层,查找ID是否有NO的
              var $parentNode = $(this);
              var ignoreColor = false;
              while ($parentNode.get(0).nodeName != "svg") {
                $parentNode = $parentNode.parent();
                if ($parentNode.length == 0) {
                  break;
                }
                if ($parentNode.attr("id") == "NO") {
                  ignoreColor = true;
                  $(this).attr("data-ignoreColor", "");
                }
              }
              if (ignoreColor == false) {
                //获取当前dom填充色
                var fill = $(this).attr("fill");
                //判断是否是过渡色
                if (fill.indexOf("url") == -1 && fill.indexOf("#") != -1) {
                  //判断是否已存在
                  var find = false;
                  for (var i = 0; i < colorObjArr.length; i++) {
                    if (fill == colorObjArr[i].oldColor) {
                      find = true;
                      break;
                    }
                  }
                  if (find == false) {
                    colorObjArr.push({
                      oldColor: fill,
                      newColor: fill
                    });
                  }
                }
              }
            });
            //分析svg内的所有stroke属性
            $svgData.find("*[stroke]").each(function() {
              //查找父级,一直到顶层,查找ID是否有NO的
              var $parentNode = $(this);
              var ignoreColor = false;
              while ($parentNode.get(0).nodeName != "svg") {
                $parentNode = $parentNode.parent();
                if ($parentNode.length == 0) {
                  break;
                }
                if ($parentNode.attr("id") == "NO") {
                  ignoreColor = true;
                  $(this).attr("data-ignoreColor", "");
                }
              }
              if (ignoreColor == false) {
                //获取当前dom填充色
                var fill = $(this).attr("stroke");
                //判断是否是过渡色
                if (fill.indexOf("url") == -1 && fill.indexOf("#") != -1) {
                  //判断是否已存在
                  var find = false;
                  for (var i = 0; i < colorObjArr.length; i++) {
                    if (fill == colorObjArr[i].oldColor) {
                      find = true;
                      break;
                    }
                  }
                  if (find == false) {
                    colorObjArr.push({
                      oldColor: fill,
                      newColor: fill
                    });
                  }
                }
              }
            });

            //分析所有文本
            var textObjArr = [];
            $svgData
              .find("rect[fill='none'][width][height]")
              .each(function(index) {
                $(this).attr("fill", "rgba(0,0,0,0)");
                $(this).attr("data-id", index);
                //获取矩形的父级
                var parentID = $(this)
                  .parent()
                  .attr("id");
                //获取父级ID,并判断对齐方式
                var align = "left";
                if (parentID != undefined) {
                  if (parentID.indexOf("L") != -1) {
                    align = "left";
                  } else if (parentID.indexOf("R") != -1) {
                    align = "right";
                  }
                  if (parentID.indexOf("C") != -1) {
                    align = "center";
                  }
                } else {
                  align = "left";
                }

                //为当前矩形的父级添加id标识
                $(this)
                  .parent()
                  .attr("id", "text_" + index);
                //查找同级的text或者同级children的text
                var siblings = $(this).siblings("text");
                var children = $(this)
                  .siblings()
                  .find("text");

                var $textObj = null;
                if (siblings.length > 0) {
                  $textObj = siblings;
                } else if (children.length > 0) {
                  $textObj = children;
                }

                if ($textObj != null) {
                  var textObj = {
                    //文本矩形范围框
                    boxRect: {
                      left: 0,
                      top: 0,
                      width: 0,
                      height: 0
                    },
                    //文本实际位置计算结果(用于编辑组合文字时定位textarea)
                    resultRect: {
                      left: 0,
                      top: 0,
                      width: 0,
                      height: 0
                    },
                    align: align,
                    color: {
                      oldColor: "",
                      newColor: ""
                    },
                    text: "",
                    id: index,
                    fontSize: 0,
                    fontFamily: "",
                    //文字生成的svg结果
                    svg: ""
                  };

                  if ($(this).attr("x")) {
                    textObj.boxRect.left = parseFloat($(this).attr("x"));
                  }
                  if ($(this).attr("y")) {
                    textObj.boxRect.top = parseFloat($(this).attr("y"));
                  }
                  if ($(this).attr("width")) {
                    textObj.boxRect.width = parseFloat($(this).attr("width"));
                  }
                  if ($(this).attr("height")) {
                    textObj.boxRect.height = parseFloat($(this).attr("height"));
                  }

                  /*if($textObj.attr('x')){
									textObj.textRect.left = parseFloat($textObj.attr('x'));
								}
								if($textObj.attr('y')){
									textObj.textRect.top = parseFloat($textObj.attr('y'));
								}
								if($textObj.attr('width')){
									textObj.textRect.width = parseFloat($textObj.attr('width'));
								}
								if($textObj.attr('height')){
									textObj.textRect.height = parseFloat($textObj.attr('height'));
								}*/

                  if ($textObj.attr("font-size")) {
                    textObj.fontSize = parseFloat($textObj.attr("font-size"));
                  }

                  if ($textObj.attr("fill")) {
                    textObj.color.oldColor = textObj.color.newColor = $textObj.attr(
                      "fill"
                    );
                  }
                  if ($textObj.attr("font-family")) {
                    textObj.fontFamily = common.getFontFamilyName(
                      $textObj.attr("font-family")
                    );
                  }

                  if ($textObj.text()) {
                    textObj.text = $textObj.text();
                  }

                  textObjArr.push(textObj);

                  //删除文本
                  if (siblings.length > 0) {
                    siblings.remove();
                  } else if (children.length > 0) {
                    children.remove();
                  }
                } else {
                  console.warn("无法识别的组合文字图形");
                }
              });
            //添加元素到舞台
            if (colorObjArr.length > 10) {
              colorObjArr = [];
            }
            //添加元素到舞台
            var svgObj = {
              svg: svgData.outerHTML,
              color: colorObjArr,
              text: textObjArr
            };
            var id = this.addElementToStage("groupText", svgObj, {
              isBackground: false,
              position: data.pos,
              source: data.item
            });
            return id;
          });
          break;
        case "table":
          var tableObj = {
            //行属性
            row: [],
            //列属性
            col: [],
            //单元格数据
            cell: [],
            //表格样式规则
            style: []
          };
          //创建一个空的5行*4列表格
          var rowNum = 5;
          var colNum = 4;

          //添加行属性数据
          for (var n = 0; n < rowNum; n++) {
            tableObj.row.push({
              index: n,
              length: 10
            });
          }
          //添加行属性数据
          for (var n = 0; n < colNum; n++) {
            tableObj.col.push({
              index: n,
              length: 10
            });
          }
          //添加表格样式规则
          tableObj.style = JSON.parse(data.item.tableStyle);

          //如果是毫米,则进行处理
          var scaleZoom = 1;
          if (this.$store.state.docData.edit_config.unit == "mm") {
            scaleZoom = this.getSvgWidth / 400 / 2;
          }
          for (var i in tableObj.style) {
            var style_item = tableObj.style[i];
            //尺寸
            style_item.paddingLeft =
              style_item.paddingLeft != undefined
                ? style_item.paddingLeft * scaleZoom
                : 0;
            style_item.paddingRight =
              style_item.paddingRight != undefined
                ? style_item.paddingRight * scaleZoom
                : 0;
            style_item.paddingTop =
              style_item.paddingTop != undefined
                ? style_item.paddingTop * scaleZoom
                : 0;
            style_item.paddingBottom =
              style_item.paddingBottom != undefined
                ? style_item.paddingBottom * scaleZoom
                : 0;
            style_item.fontSize =
              style_item.fontSize != undefined
                ? parseInt(style_item.fontSize * scaleZoom)
                : parseInt(18 * scaleZoom);
            style_item.borderLeftWidth =
              style_item.borderLeftWidth != undefined
                ? style_item.borderLeftWidth * scaleZoom
                : 0;
            style_item.borderRightWidth =
              style_item.borderRightWidth != undefined
                ? style_item.borderRightWidth * scaleZoom
                : 0;
            style_item.borderTopWidth =
              style_item.borderTopWidth != undefined
                ? style_item.borderTopWidth * scaleZoom
                : 0;
            style_item.borderBottomWidth =
              style_item.borderBottomWidth != undefined
                ? style_item.borderBottomWidth * scaleZoom
                : 0;
            //其他属性
            style_item.fontFamily =
              style_item.fontFamily != undefined ? style_item.fontFamily : "d6";
            style_item.color =
              style_item.color != undefined ? style_item.color : "#000000";
            style_item.background =
              style_item.background != undefined
                ? style_item.background
                : "#FFFFFF";
            style_item.align =
              style_item.align != undefined ? style_item.align : "center";
            style_item.valign =
              style_item.valign != undefined ? style_item.valign : "middle";
          }
          console.log("style!!", tableObj.style);

          //添加单元格数据
          for (var r = 0; r < rowNum; r++) {
            var colCells = [];
            for (var c = 0; c < colNum; c++) {
              var style_item = common.getStyle(
                r,
                c,
                rowNum,
                colNum,
                tableObj.style
              );
              colCells.push({
                //文本
                text: "",
                //文本svg结果
                svg: "",
                //颜色
                color: {
                  oldColor: style_item.color,
                  newColor: style_item.color
                },
                //字体大小
                fontSize: style_item.fontSize,
                //字体
                fontFamily: style_item.fontFamily,
                //水平居中
                align: style_item.align,
                //垂直居中
                valign: style_item.valign,
                //倾斜
                italic: 0,
                //字间距
                letterSpacing: 0,
                //行间距
                lineHeight: 100
              });
            }
            tableObj.cell.push(colCells);
          }

          //遍历style,如果有color属性,则转换为old new格式
          for (var i in tableObj.style) {
            var styleItem = tableObj.style[i];

            //						if(styleItem.color!=undefined){
            //							styleItem.color = {
            //								oldColor:styleItem.color,
            //								newColor:styleItem.color
            //							}
            //						}
            delete styleItem.color;

            if (styleItem.background != undefined) {
              styleItem.background = {
                oldColor: styleItem.background,
                newColor: styleItem.background
              };
            }

            if (styleItem.borderTopColor != undefined) {
              styleItem.borderTopColor = {
                oldColor: styleItem.borderTopColor,
                newColor: styleItem.borderTopColor
              };
            }
            if (styleItem.borderBottomColor != undefined) {
              styleItem.borderBottomColor = {
                oldColor: styleItem.borderBottomColor,
                newColor: styleItem.borderBottomColor
              };
            }
            if (styleItem.borderLeftColor != undefined) {
              styleItem.borderLeftColor = {
                oldColor: styleItem.borderLeftColor,
                newColor: styleItem.borderLeftColor
              };
            }
            if (styleItem.borderRightColor != undefined) {
              styleItem.borderRightColor = {
                oldColor: styleItem.borderRightColor,
                newColor: styleItem.borderRightColor
              };
            }
          }
          console.log("tableStyle", tableObj.style);

          this.addElementToStage("table", tableObj, {
            isBackground: false,
            position: data.pos,
            source: data.item
          });
          break;
        case "interaction":
          let interActionEditData = {
            module: data.item.module,
            config: data.item.config,
            data: data.item.data
          };
          this.addElementToStage("interaction", interActionEditData, {
            isBackground: false,
            position: data.pos,
            source: data.item
          });
          break;
        case "group":
          this.stopTextEdit();
          this.stopGroupTextEdit();
          this.stopTableCellEdit();
          //计算偏移
            /*let offsetLeft =
              -this.stageStyle.left / this.getZoom +
              this.stageStyle.pWidth / 2 / this.getZoom -
              data.item.info.width / 2;
            let offsetTop =
              -this.stageStyle.top / this.getZoom +
              this.stageStyle.pHeight / 2 / this.getZoom -
              data.item.info.height/ 2;*/
              let offsetLeft = 0;
              let offsetTop =0
              let maxBottom = 0;
              let svgHeight = this.$store.state.docData.edit_config.height;
              for (let i = 0; i < this.getNowPageData.data.length; i++) {
                let eleItem = this.getNowPageData.data[i];

                let bottom = eleItem.edit_config.top + eleItem.edit_config.height;
                if (bottom > maxBottom) {
                  maxBottom = bottom;
                }
              }


              offsetTop = maxBottom;
          //计算缩放比例
          let ratio = this.getSvgWidth/ data.item.info.width;
          //添加元素到舞台,并将这些元素的id加入到groups中
          let tempEleArr = [];
          data.item.elements.forEach((eleItem,eleIndex)=>{
            eleItem.edit_config.left = offsetLeft+(eleItem.info.left*ratio);
            eleItem.edit_config.top = offsetTop+(eleItem.info.top*ratio);
            eleItem.edit_config.width *=ratio;
            eleItem.edit_config.height *=ratio;
            let elementObj = {
              //ID
              id:"shape_" + common.getNewID(),
              //所在页面
              page_id: this.getNowPageData.id,
              //元素类型
              type: eleItem.type,
              //是否在移动
              ismoving: false,
              //层级
              index: this.getNowPageData.data.length - 1,
              edit_config:eleItem.edit_config,
              edit_data:eleItem.edit_data
            };
            tempEleArr.push(elementObj);
            console.log('element ADD ->',elementObj);
            this.$store.commit("addElementToStage", {
              obj: elementObj,
              isBackground: false
            });
          });
          //记录元素添加动作
          eventBus.$emit("elementChange", {
              type: "add",
              targets: tempEleArr,
              step:false
          });
          //添加结束,判断是否超出舞台,增加高度
           for (let i = 0; i < this.getNowPageData.data.length; i++) {
                let eleItem = this.getNowPageData.data[i];

                let bottom = eleItem.edit_config.top + eleItem.edit_config.height;
                if (bottom > maxBottom) {
                  maxBottom = bottom;
                }
              }
           if (maxBottom > svgHeight) {
                this.$store.state.docData.edit_config.height = maxBottom;
                eventBus.$emit("infoChange", { type: "stageSize" });
                 eventBus.$emit("scrollToBottom");
          }
          //添加到编组
          let groupIDs = tempEleArr.map(item=>{
            return item.id;
          })
          this.getNowPageData.edit_config.groups.push(groupIDs)
          eventBus.$emit("pageChange", {
            type: "update",
            targets: [this.getNowPageData]
          });
          this.$store.commit("setSelectionBox", [{ name: "items", val: tempEleArr }]);
          this.$store.commit("setselectedItem", null);
          this.$nextTick(()=>{
            this.updateSelectionBoxPositionAndSize();
          });
        break;
      }
    },

    //生成当前页的svg图像
    updateNowPageSVG() {

      //生成新的svg代码
      var _self = this;

      //this.$store.commit('setNowPageSvg',this.$refs.svg_canvas.outerHTML);
      let $pageSvg = $(this.$refs.svg_canvas.outerHTML);
      //删除网格
      $pageSvg.children("#grid").remove();

      var params = {
        tpl_id: this.$store.state.docData.id,
        uid: this.$store.state.editor.uid,
        thumbnails: [
          {
            id: this.getNowPageData.id,
            svg: $pageSvg[0].outerHTML
          }
        ]
      };

      if (this.$store.state.docData.product != "jianye") {

        socket.editorEmit("pageThumbnail", params, function(e) {

          for (var i = 0; i < e.data.length; i++) {
            var thumbItem = e.data[i];
            //console.log('item', thumbItem);
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            for (var p = 0; p < _self.$store.state.docData.page.length; p++) {
              var page = _self.$store.state.docData.page[p];
              //console.log(page.id + '--' + thumbItem.id);
              if (page.id == thumbItem.id || page.front_id == thumbItem.id) {

                page.thumbnail = thumbItem.thumbnail+'?t='+timestamp;

              }
            }
          }
          _self.$store.state.docData.page.push({});
          _self.$store.state.docData.page.splice(
            _self.$store.state.docData.page.length - 1
          );
        });
      }
    },
    //创建socket交互
    createSocketAction() {
      var _self = this;
      //接收到模板数据
      eventBus.$on("socket_templateInfo", function(data) {
        //socket断开链接
        if (_self.$store.state.editor.lastDisconnect) {
          return;
        }

        //清空复制
        localStorage.removeItem("crossPageCopyData");
        //docData预处理,添加前端可识别的数据
        var docData = JSON.parse(JSON.stringify(data));

        localStorage.setItem('docData',JSON.stringify(docData));

        //如果是简页产品且singlePageConfig没有设置,则进行设置
        if (docData.product == "jianye") {
          if (docData.edit_config.singlePageConfig == undefined) {
            docData.edit_config.singlePageConfig = {
              thumb: "",
              title: "",
              summary: "",
              bgm_url: "",
              bgm_title: "",
              closeAd:"default"
            };
          }
          //是否已经去除广告
          docData.closeAd = data.isAdv;
        }
        //添加page需要的属性
        for (var i = 0; i < docData.page.length; i++) {
          //缩略图后面加时间戳
          if(docData.page[i].thumbnail !=''){
          docData.page[i].thumbnail = docData.page[i].thumbnail+'?t='+docData.page[i].thumbnail_updated_at;
          }

          if (docData.page[i].edit_config.backgroundColor == "") {
            docData.page[i].edit_config.backgroundColor = "#ffffff";
          }
          //如果backgroundID=0 则设置为空
          if (docData.page[i].edit_config.backgroundID == "0") {
            docData.page[i].edit_config.backgroundID = "";
          }
          //参考线
          if (docData.page[i].edit_config.guides == undefined) {
            docData.page[i].edit_config.guides = [];
          }

          if(!islocal){
            docData.page[i]["data"] = [];
            docData.page[i]["svg"] = "";
            docData.page[i]["loaded"] = false;
          }
//          docData.page[i]['deleteElements'] = [];
        }
        //更新页面index
        _self.$store.commit("updatePageIndex");
        //转换edit_config属性的类型
        docData.edit_config.bleed = common.float(docData.edit_config.bleed);

        docData.edit_config.dpi = common.float(docData.edit_config.dpi);
        docData.edit_config.height = common.float(docData.edit_config.height);
        docData.edit_config.width = common.float(docData.edit_config.width);
        docData.edit_config.canvasScale = common.int(
          docData.edit_config.canvasScale
        );
        docData.edit_config.pageAddable = common.bool(
          docData.edit_config.pageAddable
        );

        docData.edit_config.sizeAble = common.int(docData.edit_config.sizeAble);
        if (docData.edit_config.guidesColor == undefined) {
          docData.edit_config.guidesColor = "#BABABA";
        }
        docData.quick_design = common.bool(docData.quick_design);

        //编组属性

        docData.edit_config.userDPI[0] = common.int(
          docData.edit_config.userDPI[0]
        );
        docData.edit_config.userDPI[1] = common.int(
          docData.edit_config.userDPI[1]
        );

        //添加editor属性
        docData.editor = {};
        docData.editor.nowPage = 0;

        //写入userDPI
        docData.edit_config.userDPI = _self.$store.state.editor.userDPI;

        //console.log('写入DocData',docData);
        //传入vuex
        _self.$store.commit("setDocData", docData);
        //自适应舞台大小

        if (docData.edit_config.canvasScale == 0) {
          //console.log('自适应缩放');
          _self.$store.commit("setZoom", {
            type: "custom",
            val: 90
          });
        } else if (
          docData.edit_config.canvasScale > 0 &&
          docData.edit_config.canvasScale <= 100
        ) {
          //浏览器比例缩放
          //console.log('指定值缩放', docData.edit_config.canvasScale);
          _self.$store.commit("setZoom", {
            type: "custom",
            val: docData.edit_config.canvasScale
          });
        } else if (docData.edit_config.canvasScale == -1) {
          //console.log('标准100%尺寸');
          _self.$store.commit("setZoom", {
            type: "normal"
          });
        } else if (
          docData.edit_config.canvasScale > -100 &&
          docData.edit_config.canvasScale < -1
        ) {
          console.log("原生画布尺寸缩放", docData.edit_config.canvasScale);
          _self.$store.commit("setZoom", {
            type: "canvas_custom",
            val: Math.abs(docData.edit_config.canvasScale)
          });
        }

        _self.createSubLineGuide();
        //创建网格
        _self.gridSvg =createGridSvg(_self.getSvgWidth,_self.getSvgHeight,_self.getZoom);

        //读取cookie的本地设置,检查autoSave
        let setting = Cookies.get("tpl_" + _self.$store.state.docData.id);
        if (setting != undefined) {
          _self.$store.state.editor.autoSave = JSON.parse(setting).autoSave;
        }
        //本地测试
        if(islocal){
            _self.getNowPageData.data = onePage.msg.data;
          //生成当前页svg
          _self.updateAllItemsHtml();
          eventBus.$emit("stateChange", {
            type: "ready"
          });

          if(_self.getNowPageData.edit_config.groups==undefined){
            _self.getNowPageData.edit_config.groups=[]
          }
          _self.$store.state.editor.tplLoaded = true;
          _self.$store.commit("callModal");
           return;
        }

        //开始请求第一页的元素信息
        var params = {
          tpl_id: docData.id,
          page_id: docData.page[0].id,
          uid: _self.$store.state.editor.uid
        };
        socket.editorEmit("pageElements", params, function(e){
          //console.log('第一页元素载入成功',e);
          //预处理传回的元素,将纯文本转换为对应属性的值
          var resultData = common.formatElementData(
            e.data,
            _self.$store.state.docData.edit_config
          );



          if(_self.getNowPageData.edit_config.groups==undefined){
            _self.getNowPageData.edit_config.groups=[]
          }


          _self.getNowPageData.data =resultData;

          eventBus.$emit("stateChange", {
            type: "ready"
          });

          //关闭加载状态
          _self.$store.commit("callModal");
          docData.page[0].loaded = true;
          _self.$store.state.editor.tplLoaded = true;
          //生成当前页svg
          _self.updateAllItemsHtml();
        });
      });


    },
    //在数组内搜索指定属性,的值,并返回数组成员对象
    findArrayIndex(arr, name, val) {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i][name] == val) {
          return i;
        }
      }
      return -1;
    },
    //元素变更监听
    elementChangeHandle(e) {
        console.log('elementChangeHandle');
        console.log(e);
      if (e.step == undefined) {
        e.step = true;
      }
      //console.log("元素更新", e);
      var _self = this;
      if (e.update == undefined || e.update == true) {
        //更新元素html
        for (var i = 0; i < e.targets.length; i++) {
          this.updateItemHtml(e.targets[i]);
        }
      }

      //创建快照
      if (e.snap == undefined || e.snap == true) {
          console.log('span');
        this.$store.commit("    ", {
          name: "elementChange",
          type: e.type,
          targets: e.targets,
          //执行撤销或者恢复时,step如果为假,则继续向下撤销或者恢复,直到step为真.
          //请在中间操作设置step属性为false,以便撤销或者恢复一组动作
          step: e.step
        });
      }
      //this.updateThumbnail = true;
      this.$store.state.editor.saveChange = true;
      //如果是interaction元素更新,则init
      if (e.type != "remove") {
        e.targets.forEach(item => {
          if (item.type == "interaction") {
            this.$nextTick(() => {
              let iframeWindow = this.$refs["interaction_" + item.id][0]
                .contentWindow;
              iframeWindow.init(item.id, item.edit_data.data);
            });
          }
        });
      }

      //提交到自动保存队列
      if (this.autoSave) {
        socket.commit("elementChange", e);
      }
      this.updateThumbnail();
    },
    //页面变更监听
    pageChangeHandle(e) {
      //console.log("页面变更", e);
      if (e.step == undefined) {
        e.step = true;
      }
      //创建快照
      if (e.snap == undefined || e.snap == true) {
        this.$store.commit("addDocSnap", {
          name: "pageChange",
          type: e.type,
          targets: e.targets,
          step: e.step
        });
      }
      //更新页面EditConfig
      if (e.type == "update") {
        e.targets.forEach(pageItem => {
          let i = common.findArrayIndex(
            this.$store.state.docData.page,
            "id",
            pageItem.id
          );

          this.$store.state.docData.page[i].edit_config = pageItem.edit_config;
        });
      }

      this.$store.state.editor.saveChange = true;
      //提交到自动保存队列
      if (this.autoSave) {
        socket.commit("pageChange", e);
      }
      this.updateThumbnail();
    },
    //模板信息变更监听
    infoChangeHandle(e) {
      //console.log("信息变更", e);
      if (e.step == undefined) {
        e.step = true;
      }
      if (e.snap == undefined || e.snap == true) {
        if (
          e.type == "stageSize" ||
          e.type == "singlePage" ||
          e.type == "group"
        ) {
          this.$store.commit("addDocSnap", {
            name: "infoChange",
            step: e.step
          });
          this.gridSvg = createGridSvg(this.getSvgWidth,this.getSvgHeight,this.getZoom);
        }
      }
      this.$store.state.editor.saveChange = true;

      if (this.autoSave) {
        socket.commit("infoChange", e);
      }
      this.updateThumbnail();
    },
    //编辑器状态监听
    stateChangeHandle(e) {
      console.log('stateChange:stage main');
      if (e.step == undefined) {
        e.step = true;
      }

      //切换到新页面,全部渲染
      if (e.type == "loadPage") {
        this.updateAllItemsHtml();
        this.guides.movingItem = undefined;
      } else if (e.type == "zoom") {
        this.createSubLineGuide();
        this.gridSvg = createGridSvg(this.getSvgWidth,this.getSvgHeight,this.getZoom);
      } else if (e.type == "ready") {
        if (this.$store.state.docData.product == "jianye") {
          this.calcStageLocation("top");
        } else {
          this.calcStageLocation();
        }
      }
      if (e.snap == undefined || e.snap == true) {
        this.$store.commit("addDocSnap", {
          name: "stateChange",
          type: e.type,
          data: e.data,
          step: e.step
        });
      }
    },
    //触发缩略图生成
    updateThumbnail() {

      let _self = this;
      if(this.$store.state.docData.product != "jianye"){
        if (this.pageThumbnailTimer != null) {
          clearTimeout(this.pageThumbnailTimer);
        }
        this.pageThumbnailTimer = setTimeout(function() {
          //console.log('生成page缩略图');
          _self.$nextTick(function() {
            _self.updateNowPageSVG();

          });
          _self.pageThumbnailTimer = null;
        }, 1000);
      }

      if (this.pageThumbnailTimer != null) {
        clearTimeout(this.templateThumbnailTimer);
      }
      this.templateThumbnailTimer = setTimeout(function() {
        //console.log('生成template缩略图');
        if (_self.$store.state.editor.autoSave) {
          var params = {
            uid: _self.$store.state.editor.uid,
            tpl_id: _self.$store.state.docData.id
          };
          socket.editorEmit("templateUpdateThumbnail", params);
        }
        _self.templateThumbnailTimer = null;
      }, 15000);
    }
    //检测创建与更改类socket请求
    /*onElementSocketRequest(e){
			console.log('onElementSocketRequest',e);
		}*/
  },
  watch: {
    stageStyle(val){
       this.$store.state.stage.stageStyle = val;

    },
    isAllowDrop: function(newValue, oldValue) {
      if (newValue) {
        this.handleContainerMask();
      }
    },
    disallowDrop: function(newValue, oldValue) {
      if (newValue) {
        this.IgnoreContainerMask();
      }
    },
    getZoom: function() {
      this.calcStageLocation();
    },
    isSourceOpen: function() {
      this.calcStageLocation();
    },
    isPageOpen: function() {
      this.calcStageLocation();
    }
  },
  //网页渲染结束
  mounted() {
    var _self = this;
    window.addEventListener("resize", this.calcStageLocation);
    window.addEventListener("keydown", e => {
      e.code == "Space" && (this.spaceDown = true);
    });
    window.addEventListener("keyup", e => {
      e.code == "Space" && (this.spaceDown = false);
    });
    window.addEventListener("mousemove", e => {
      if (this.initGrab) {
        var mx = e.clientX - this.mousePos.x,
          my = e.clientY - this.mousePos.y;
        this.mousePos = {
          x: e.clientX,
          y: e.clientY
        };
        this.grabPage(mx, my);
      }
    });
    window.addEventListener("mouseup", e => {
      this.initGrab = false;
    });
    //加载弹窗
    this.$store.commit("callModal", {
      type: "wait",
      modalOver: true,
      notAlert: true
    });
    //注册按键监听
    $(document).keydown(this.stageAreaKeyDown);
    $(document).keyup(this.stageAreaKeyUp);
    //添加素材监听
    eventBus.$on("addElement", this.addElementHandle);
    eventBus.$on("setRotate", this.setRotate);
    //鼠标移动全局侦听

    eventBus.$on("globalMouseMove", this.stageAreaMouseMove);
    //鼠标松开全局侦听
    eventBus.$on("globalMouseUp", this.stageAreaMouseUp);
    eventBus.$on("pageMove", this.pageMove);

    //文本元素,在非编辑状态下,属性发生更新时重新提交生成
    eventBus.$on("updateTextElement", function(obj) {
      if (obj == undefined) {
        _self.updateTextSvg(_self.nowEditText, obj.snap, obj.updateArea);
      } else {
        _self.updateTextSvg(obj.item, obj.snap, obj.updateArea);
      }
    });

    //元素变更监听
    eventBus.$on("elementChange", this.elementChangeHandle);
    //页面变更监听
    eventBus.$on("pageChange", this.pageChangeHandle);
    //模板信息变更监听
    eventBus.$on("infoChange", this.infoChangeHandle);
    //编辑器状态监听
    eventBus.$on("stateChange", this.stateChangeHandle);

    //组合文字,刷新svg文本,一般用在颜色更改后调用
    eventBus.$on("updateGroupTextElement", function(item) {
      _self.updateGroupTextSvg(item);
    });

    //框选对齐
    eventBus.$on("handleGroupAlign", function(type) {
      _self.handleGroupAlign(type);
      eventBus.$emit("elementChange", {
        type: "update",
        targets: _self.getSelectedItems
      });
    });
    eventBus.$on("updateAllItemsHtml", function() {
      _self.updateAllItemsHtml();
    });
    eventBus.$on("updateItemHtml", function(item) {
      _self.updateItemHtml(item);
    });

    eventBus.$on("updateSelectedItemsHtml", function() {
      _self.updateSelectedItemsHtml();
      _self.update++;
    });
    eventBus.$on("updateNowPageSVG", function() {
      _self.updateNowPageSVG();
    });
    eventBus.$on("startEditContainer", function(item) {
      _self.startEditContainer(item);
    });

    eventBus.$on("stopAllEdit", function() {
      _self.stopTextEdit();
      _self.stopGroupTextEdit();
      _self.stopTableCellEdit();
    });
    eventBus.$on("openImageCropper", function(item) {
      _self.openImageCropper(item);
    });
    eventBus.$on("startTextEdit", item => {
      this.startTextEdit(item);
      //取消选择状态
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      this.$store.commit("setselectedItem", null);
      eventBus.$emit("startTextEditorResize");
    });
    eventBus.$on(
      "updateSelectionBoxPositionAndSize",
      this.updateSelectionBoxPositionAndSize
    );
    //滚动到页面底部
    eventBus.$on('scrollToBottom',()=>{

      this.$nextTick(()=>{
        let stageBottom =
          $("#svg_canvas")
            .get(0)
            .getBoundingClientRect().bottom + 80;
        let bodyHeight = $("body").height();

        this.stageStyle.top -= stageBottom - bodyHeight;
        this.stageStyle.transition = true;
        setTimeout(() => {
          this.stageStyle.transition = false;
        }, 300);
      })
    })



    //创建socket交互
    this.createSocketAction();
  }
};
</script>
<style lang="scss">
$guide-border-color: #bbbbbb; //右侧编辑器区域
.stageArea {
  position: absolute;
  top: 49px;
  right: 0;

  bottom: 0;
  background: #d7d8d9;

  z-index: 0;
  overflow: hidden;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none; //舞台区域
  .stage {
    position: absolute;
    .stage-resizer {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      border: 3px solid transparent;
      &:hover {
        border-image: url(/assets/images/guide-border.png) 4 4 round;
      }
      .control {
        //控制柄元件
        position: absolute;
        pointer-events: all;
        .control-bar::after {
          content: "";
          position: absolute;
          left: -5px;
          right: -5px;
          top: -5px;
          bottom: -5px;
        }
        &.right {
          right: 0;
          top: 50%;
          transform: translate(0%, -50%);
          background: red;
          div {
            display: inline-block;
          }
          .control-bar {
            display: inline-block;
            width: 5px;
            height: 35px;
            border: 1px solid #626262;
            background-color: white;
            margin-right: 3px;
            cursor: e-resize;
            position: absolute;
            left: 0;
            top: 50%;
            transform: translate(0, -50%);
            text-align: center;
            &:hover + .tip {
              opacity: 1 !important;
            }
          }
          .tip {
            color: #868686;
            line-height: 110%;
            position: absolute;
            left: 13px;
            top: 50%;
            transform: translate(0, -50%);
            opacity: 0;
          }
        }
        &.bottom {
          text-align: center;
          width: 80px;
          bottom: -30px;
          left: 50%;
          transform: translate(-50%, 0%);

          .control-bar {
            display: inline-block;
            width: 35px;
            height: 5px;
            border: 1px solid #626262;
            background-color: white;
            margin-bottom: 3px;
            cursor: n-resize;
            &:hover + .tip {
              opacity: 1 !important;
            }
          }
          .tip {
            color: #868686;
            opacity: 0;
          }
        }
      }
    }
    .stage-mask {
      cursor: -webkit-grab;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      z-index: 51;
      &.inited {
        cursor: -webkit-grabbing;
      }
    }
    #svg_canvas {
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
      g {
        transition: opacity 0.2s;
      }
    } //出血辅助线
    .bleed {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100px;
      height: 100px;
      border: 3px solid transparent;
      border-image: url(/assets/images/guide-border.png) 5 5 round;
      /*border-style:inherit;*/
      pointer-events: none;
    } //辅助线
    .guide {
      pointer-events: none;
      position: absolute;
      left: 0px;
      top: 0px; //辅助线item
      .item {
        position: absolute;
        top: 0px;

        border-image: url(/assets/images/guide-border.png) 5 5 round;

        margin: 0;
      }
    } //编辑工具
    .edit-tool {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-track {
    background-color: #ebebeb;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
  } //参考线
  .guides-canvas {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    .guide-item {
      position: absolute;
      border-style: solid;
      border-width: 1px;
      border-right: none !important;
      border-bottom: none !important;
      border-color: gray;
      pointer-events: all;
      transition: box-shadow 0.2s;
    }
    .guide-item::after {
      content: "";
      position: absolute;
      left: -5px;
      right: -5px;
      top: -5px;
      bottom: -5px;
    }

    .x {
      cursor: url(/assets/images/table-resize.png) 7.5 7.5, auto;
      width: 1px;
      height: 100%;
    }
    .y {
      cursor: url(/assets/images/table-resize-90.png) 7.5 7.5, auto;
      width: 100%;
      height: 1px;
    }
  }
} //选择框组件
.selection-box {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 60px;
  height: 60px;
  background: rgba(71, 210, 233, 0.2);
  border: 1px solid #00a2eb;
}

.selection-box-rect,
.hover-element {
  position: absolute;
  left: 0px;
  top: 0px;
  border: 1px dashed $guide-border-color;
  cursor: move;
}

.hover-element {
  pointer-events: none;
} //自由变形工具组件
.selection-tool {
  position: absolute;
  left: 0px;
  top: 0px;
  border: 1px solid #00a2eb;
  pointer-events: none;
  z-index: 2;
  .rotate-text {
    position: absolute;
    left: 50%;
    top: -42px;
    width: 30px;
    text-align: center;
    margin-left: -15px;
  }
  .container-tip {
    position: absolute;
    top: -15px;
    left: 0;
    font-size: 12px;
    line-height: 14px;
    color: #00a2eb;
    width: 150px;
  }
  .point {
    position: absolute;
    background: white;
    border: 1px solid #00a2eb;
    width: 10px;
    height: 10px;
    pointer-events: all;
  }
  .point:hover {
    background: #00a2eb;
  }
  .rotate {
    pointer-events: all;
    position: absolute;
    width: 16px;
    height: 16px;
    margin-left: -8px;

    left: 50%;
    top: -23px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 5px #aaa;
    background: url('http://www.tubangzhu.com/diy4/static/img/rotate-left.d17e641.png') center center
      no-repeat #fff;
  }
  .e {
    pointer-events: all;
    top: 50%;
    right: -5px;
    margin-top: -5px;
  }
  .s {
    pointer-events: all;
    left: 50%;
    bottom: -5px;
    margin-left: -5px;
  }
  .se {
    pointer-events: all;
    right: -5px;
    bottom: -5px;
  }
}

.tbz-lock {
  position: absolute;
  pointer-events: all;
  right: -9px;
  bottom: -5px;
  width: 18px;
  height: 23px;
  background: url('http://www.tubangzhu.com/diy4/static/img/ico-lock.c662223.png');
  cursor: pointer;
}

#thumbCanvas {
  opacity: 0;
  pointer-events: none;
}
</style>



// WEBPACK FOOTER //
// main.vue?6ae1b3ec
