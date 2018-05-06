<template>
	<div class="slide-box modal-mini" @mousemove="handleMove" @mousedown.stop="" v-show="slideShow" :style="posStyle">
		<div v-for="(data,index) in slideData" class="item">
			<span class="title">{{data.title}}</span>
			<span class="back">
				<i @mousedown="handleDown(index,data.type)" :style="{'left':data.leftOps+'px'}">
				</i>
			</span>
			<input type="text" v-model="data.val" @change="handleInput(index,data.type)" @mousedown="willEdit">
		</div>
	</div>
</template>
<script>
import EventBus from "@/common/eventBus.js";
import $ from "jquery";
export default {
  data() {
    return {
      leftOps: [],
      inputData: [],
      dataIndex: 0,
      dataType: undefined,
      flag: false,
      x0: 0,
      x1: 0,
      moveX: 0
    };
  },

  created() {
    var _self = this;
    EventBus.$on("globalMouseUp", this.mouseUpHandle);
  },
  beforeDestroy() {
    EventBus.$off("globalMouseUp", this.mouseUpHandle);
  },
  props: ["data", "pos"],
  computed: {
    slideData() {
      this.initLeftops();
      return this.$props.data;
    },
    posStyle() {
      return this.$props.pos;
    },
    slideShow() {
      return this.$store.state.editor.modal["slide"];
    }
  },
  methods: {
    willEdit() {
      //使所有可编辑的元素失去雕件,以便input使用
      $("*[contenteditable]").blur();
      $("*[contenteditable]").attr("contenteditable", false);
      setTimeout(() => {
        $("*[contenteditable]").attr("contenteditable", true);
      }, 10);
    },

    mouseUpHandle() {
      if (this.slideShow) {
        this.handleUp();
      }
    },
    //初始化
    initLeftops() {
      for (var i = 0; i < this.$props.data.length; i++) {
        var val =
          130 *
            (this.$props.data[i].val - this.$props.data[i].min) /
            (this.$props.data[i].max - this.$props.data[i].min) -
          8;
        this.$props.data[i].leftOps = val;
      }
    },
    //事件处理
    handleInput(index, type) {
      this.dataIndex = index;
      this.dataType = type;
      if (
        this.slideData[this.dataIndex].val > this.slideData[this.dataIndex].max
      ) {
        this.slideData[this.dataIndex].val = this.slideData[this.dataIndex].max;
      }
      if (
        this.slideData[this.dataIndex].val < this.slideData[this.dataIndex].min
      ) {
        this.slideData[this.dataIndex].val = this.slideData[this.dataIndex].min;
      }
      //通知
      EventBus.$emit("afterChange", {
        val: this.slideData[this.dataIndex].val,
        type: this.dataType
      });
    },
    handleDown(index, type) {
      this.flag = true;
      this.dataIndex = index;
      this.dataType = type;
      this.x0 = event.clientX;
    },
    handleMove() {
      if (!this.flag) {
        return;
      }
      this.x1 = event.clientX;
      this.moveX = this.x1 - this.x0;
      //重置起点
      this.x0 = event.clientX;
      var newval = this.slideData[this.dataIndex].leftOps + this.moveX;
      if (newval > 122) {
        newval = 122;
      }
      if (newval < -8) {
        newval = -8;
      }
      this.setInput(newval);
      this.slideData[this.dataIndex].leftOps = newval;
      //通知
      EventBus.$emit("afterChange", {
        val: this.slideData[this.dataIndex].val,
        type: this.dataType,
        snap: false
      });
    },
    handleUp() {
      if (this.flag) {
        EventBus.$emit("afterChange", {
          val: this.slideData[this.dataIndex].val,
          type: this.dataType,
          snap: true
        });
        this.flag = false;
      }
    },
    //数据处理并通知
    setInput(left) {
      var val =
        (left + 8) *
          (this.slideData[this.dataIndex].max -
            this.slideData[this.dataIndex].min) /
          130 +
        this.slideData[this.dataIndex].min;
      this.slideData[this.dataIndex].val = parseInt(val);
    }
  }
};
</script>
<style lang="scss">
$blue: #00a2eb;
.slide-box {
  top: 47px;
  padding: 12px;
  z-index: 1000;
  .item {
    overflow: hidden;
    width: 260px;
    line-height: 32px;
    .title {
      display: inline-block;
      width: 47px;
      text-align: right;
      font-size: 14px;
    }
    .back {
      display: inline-block;
      width: 130px;
      height: 2px;
      background: #c8c8c8;
      margin-left: 10px;
      position: relative;
      vertical-align: middle;
      i {
        position: absolute;
        top: -8px;
        left: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid transparent;
        background: #515151;
        cursor: pointer;

        &:hover {
          background: #fff;
          border-color: #a8a8a8;
        }
      }
    }
    input {
      margin-left: 10px;
      display: inline;
      width: 46px;
      line-height: 30px;
      font-size: 14px;
      color: #515151;
      background-color: #e5e5e5;
      border-radius: 5px;
      text-align: center;
    }
  }
}
</style>


// WEBPACK FOOTER //
// slide.vue?2ed2b1ea