<template>
	<div class="color-picker-item">
		<!--色块 begin-->
		<div :class="['box',{'box-focus':isShow}]" ref="colorBox" :style="getBoxStyle" @mousedown.left="show"></div>
		<!--色块 end-->
		<!--调色板 begin   isShow-->
		<div class="pallet" :style="palletStyle" v-if="isShow">
			<!--选项卡头部 begin-->
			<div class="header">
				<div :class="['item','color-left','no-select',{'active':(tabIndex=='default')}]" @click="setTabPage('default')">常用颜色</div>
				<div :class="['item','color-right','no-select',{'active':(tabIndex=='pallet')}]" @click="setTabPage('pallet')">调色板</div>
			</div>
			<!--选项卡头部 end-->
			<!--选项卡内容 start-->
			<div class="content">
				<components :is="tabCom" @onChange="onChangeColor" :bindcolor="getColor" :bindtype="getType"></components>
			</div>
			<!--选项卡内容 end-->

		</div>
		<!--调色板 end-->
	</div>
</template>
<script>
import $ from "jquery";
import eventBus from "@/common/eventBus.js";

import defaultCom from "./colorPicker/default";
import palletCom from "./colorPicker/pallet";

export default {
  data() {
    return {
      //是否显示调色盘
      isShow: false,
      //正在显示的面板
      tabIndex: "default",
      //正在显示的tab组件
      tabCom: defaultCom,
      //面板打开后颜色是否发生过改变
      colorChanged: false
    };
  },
  created() {
    var _self = this;
    eventBus.$on("closeModal", function() {
      //关闭面板
      _self.close();
    });
  },
  components: { defaultCom, palletCom },
  props: ["color", "type", "mult", "pos", "posMode"],
  computed: {
    palletStyle() {
      if (this.$props.posMode == "absolute") {
        return {
          position: "absolute",
          left: "0",
          top: "40px"
        };
      }
      let colorRect = this.$refs.colorBox.getBoundingClientRect();
      console.log("colorRect", colorRect);
      if (this.getPos == "left") {
        return {
          left: colorRect.left + "px",
          top: colorRect.top + 40 + "px"
        };
      } else if (this.getPos == "left_panel") {
        return {
          left: colorRect.left - 70 + "px",
          top: colorRect.top + "px"
        };
      } else {
        return {
          left: colorRect.left - 230 + "px",
          top: colorRect.top + 40 + "px"
        };
      }
    },
    getPos() {
      if (this.$props.pos == undefined) {
        return "left";
      } else {
        return this.$props.pos;
      }
    },
    getColor() {
      return this.$props.color;
    },
    getType() {
      //color = usedColor background = usedBgColor
      return this.$props.type;
    },
    getMult() {
      //color = usedColor background = usedBgColor
      return this.$props.mult;
    },
    getBoxStyle() {
      if (this.getMult == undefined) {
        return { background: this.getColor };
      } else {
        return { background: "url('/static/img/mult_colors.png')" };
      }
    }
  },
  methods: {
    //打开调色板
    show() {
      //通知其他面板关闭
      eventBus.$emit("closeModal");
      //打开我的调色板
      this.isShow = true;
    },
    //关闭调色板
    close() {
      if (this.isShow == true) {
        this.isShow = false;
        if (this.colorChanged) {
          this.colorChanged = false;
          //将颜色加入到最近使用
          if (this.getType == "color") {
            this.$store.commit("addUsedColor", this.getColor);
          } else if (this.getType == "background") {
            this.$store.commit("addUsedBgColor", this.getColor);
          }
        }
      }
    },
    //切换tab页面
    setTabPage(val) {
      this.tabIndex = val;
      if (val == "default") {
        this.tabCom = defaultCom;
      } else {
        this.tabCom = palletCom;
      }
    },
    //新的颜色
    onChangeColor(color) {
      console.log("颜色改变", color);
      this.$emit("onChange", color);
      this.colorChanged = true;
      //eventBus.$emit('stageChange','color');
    }
  }
};
</script>
<style lang="scss">
.color-picker-item {
  float: left;
  position: relative;
  z-index: 10000;

  .box {
    transition: all 0.2s;
    width: 32px;
    height: 32px;

    margin-right: 5px;
    border-radius: 6px;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
  .box-focus {
    transform: scale(1.1);
  }
  .pallet {
    position: fixed;
    width: 262px;

    border-radius: 8px;
    padding: 10px;
    background: #fff;
    font-size: 12px;
    z-index: 10000;
    color: #737373;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
    .header {
      .item {
        float: left;
        cursor: pointer;
        width: 50%;
        height: 32px;
        line-height: 28px;
        text-align: center;
        font-size: 14px;
        color: #8a8a8a;
      }
      .color-left {
        border: 1px solid #d0d0d0;
        border-right: none;
      }
      .color-right {
        border: 1px solid #d0d0d0;
      }
      .active {
        color: #515151;
        background: #dcdcdc;
      }
    }
    .content {
      margin-top: 50px;
    }
  }
  &:focus {
    outline: none;
  }
}
</style>


// WEBPACK FOOTER //
// colorPicker.vue?79e4d43a