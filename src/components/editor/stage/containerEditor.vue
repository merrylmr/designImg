<template>
	<div class="container-editor" v-if="containerShow" @mousemove="handleMousemove" @mouseup="handleMouseup">
		<div class="container-modal" :style="modalStyle">

			<!-- 图片层 -->
			<div class="under" :style="imgStyle" ref="under" @mousedown="handleMousedown('move')">
				<img :src="item.img" alt="" :style="innerImgStyle">
				<span class="img-resize" @mousedown.stop="handleMousedown('scale')"></span>
			</div>
			<!-- svg层 -->
			<div class="svg-layer" v-html="getSvgdata()" :style="svgStyle"></div>

			<!--缩放工具框-->
			<div class="resize" :style="imgStyle">
				<span class="img-resize" @mousedown.stop="handleMousedown('scale')"></span>
			</div>

		</div>
		<div class="layer"></div>
	</div>
</template>
<script>
import $ from "jquery";
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      //元数据
      data: {},
      //svg的clipimg数据(用于同步舞台数据)
      svg: {
        svgdata: "",
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      // 初始化数据
      item: {
        rotate: 0,
        scale: 0,
        //svg属性
        flipX: 1,
        flipY: 1,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        rx: 0,
        ry: 0,
        //image属性
        img: "",
        imgWidth: 0,
        imgHeight: 0,
        imgLeft: 0,
        imgTop: 0,
        imgRight: 0,
        imgBottom: 0
      },
      //操作数据
      opt: {
        type: "", //操作类型（move,scale)
        //针对MouseMove事件分类
        _move: false,
        _scale: false,
        moveX: 0,
        moveY: 0,
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0
      },
      //检测碰撞用的数据
      check: {
        imgLeft: 0,
        imgTop: 0,
        imgRight: 0,
        imgBottom: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }
    };
  },
  computed: {
    containerShow() {
      return this.$store.state.editor.containerEditor;
    },
    svgStyle() {
      return {
        width: this.item.width + "px",
        height: this.item.height + "px",
        transform:
          "translate(" + this.item.left + "px," + this.item.top + "px) "
      };
    },
    imgStyle() {
      return {
        width: this.item.imgWidth + "px",
        height: this.item.imgHeight + "px",
        transform:
          "translate(" + this.item.imgLeft + "px," + this.item.imgTop + "px) "
      };
    },
    innerImgStyle() {
      return {
        width: this.item.imgWidth + "px",
        height: this.item.imgHeight + "px"
      };
    },
    modalStyle() {
      var scalex = this.item.flipX;
      var scaley = this.item.flipY;
      return {
        transform:
          "rotate(" +
          this.item.rotate +
          "deg) scale(" +
          scalex +
          "," +
          scaley +
          ")",
        "transform-origin": this.item.rx + "px " + this.item.ry + "px"
      };
    }
  },
  methods: {
    //初始化
    initdata(data) {
      this.$store.state.editor.containerEditor = true;
      this.data = data;
      var i = data.index;
      //svg
      this.svg.svgdata = $(data.dom).find("svg")[0].outerHTML;
      this.svg.width = data.item.edit_data.clipImg[i].width;
      this.svg.height = data.item.edit_data.clipImg[i].height;
      this.svg.left = data.item.edit_data.clipImg[i].left;
      this.svg.top = data.item.edit_data.clipImg[i].top;
      //item
      this.item.flipX = data.item.edit_config.flipX ? -1 : 1;
      this.item.flipY = data.item.edit_config.flipY ? -1 : 1;
      this.item.rotate = data.item.edit_config.rotation;
      this.item.left = data.oldRect.left;
      this.item.top = data.oldRect.top;
      this.item.rx = data.oldRect.left + data.oldRect.width / 2;
      this.item.ry = data.oldRect.top + data.oldRect.height / 2;

      this.item.width = data.item.edit_config.width * data.scale;
      this.item.height = data.item.edit_config.height * data.scale;
      this.item.right = this.item.left + this.item.width;
      this.item.bottom = this.item.top + this.item.height;
      this.item.img = data.item.edit_data.clipImg[i].url;
      var img_url = $(data.dom)
        .find(".kx-image")
        .attr("xlink:href");
      this.item.img = img_url;
      //计算图片宽高
      var $rect = $(data.dom)
        .find(".kx-rect")
        .eq(i);
      var rectWidth = $rect[0].width.baseVal.value;
      var rectHeight = $rect[0].height.baseVal.value;

      var w1 = parseFloat(
        $(data.dom.firstChild)
          .find("svg")
          .attr("width")
      );

      var w2 = $(data.dom.firstChild)
        .find("svg")
        .attr("viewBox")
        .split(" ")[2];

      var svgScale = parseFloat(w2) / (w1 * data.scale);

      this.item.scale = svgScale;
      this.item.imgWidth = data.item.edit_data.clipImg[i].width / svgScale;
      this.item.imgHeight = data.item.edit_data.clipImg[i].height / svgScale;
      //计算图片位移
      this.item.imgLeft =
        this.item.left + data.item.edit_data.clipImg[i].left / svgScale;
      this.item.imgTop =
        this.item.top + data.item.edit_data.clipImg[i].top / svgScale;
      this.item.imgRight = this.item.imgLeft + this.item.imgWidth;
      this.item.imgBottom = this.item.imgTop + this.item.imgHeight;
      //初始化检测碰撞用的数据
      this.check.top = data.checkRect.top;
      this.check.bottom = data.checkRect.bottom;
      this.check.left = data.checkRect.left;
      this.check.right = data.checkRect.right;

      this.check.imgTop = this.item.imgTop;
      this.check.imgBottom = this.item.imgBottom;
      this.check.imgLeft = this.item.imgLeft;
      this.check.imgRight = this.item.imgRight;
    },
    applyContainer() {
      var i = this.data.index;
      this.data.item.edit_data.clipImg[i].width =
        this.svg.width + 0.0000000000001;
      this.$store.state.editor.containerEditor = false;

      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.data.item]
      });
    },
    getSvgdata() {
      if (!this.svg.svgdata) {
        return;
      }
      var $svg = $(this.svg.svgdata);
      var transform = "translate(" + this.svg.left + " " + this.svg.top + ")";
      var i = this.data.index;
      $svg.attr("width", this.item.width);
      $svg.attr("height", this.item.height);
      $svg.find(".kx-image").attr({
        width: this.svg.width,
        height: this.svg.height,
        transform: transform
      });
      $svg.children("g").each(function(a, b) {
        if (a != i) {
          $(b)
            .children()
            .remove();
        }
      });
      return $svg[0].outerHTML;
    },
    //操作
    handleMousedown(type) {
      this.opt.type = type;
      this.opt.x0 = event.clientX;
      this.opt.y0 = event.clientY;
    },
    handleMousemove() {
      if (!this.opt.type) {
        return;
      }
      this.opt.x1 = event.clientX;
      this.opt.y1 = event.clientY;
      //计算鼠标位移
      this.opt.moveX = (this.opt.x1 - this.opt.x0) * this.item.flipX;
      this.opt.moveY = (this.opt.y1 - this.opt.y0) * this.item.flipY;
      //相对物体坐标的位移
      var deg = (this.item.rotate % 360) * Math.PI / 180;
      var mx = Math.cos(deg) * this.opt.moveX + Math.sin(deg) * this.opt.moveY,
        my = Math.cos(deg) * this.opt.moveY - Math.sin(deg) * this.opt.moveX;

      if (this.opt.moveX != 0 && this.opt.type == "move") {
        this.opt._move = true;
        //移动图片操作开始
        var left = this.check.imgLeft + mx,
          top = this.check.imgTop + my,
          bottom = this.check.imgBottom + my,
          right = this.check.imgRight + mx;
        if (top <= this.check.top && bottom >= this.check.bottom) {
          //更新x0,y0
          this.opt.x0 = this.opt.x1;
          this.opt.y0 = this.opt.y1;
          //移动under图片
          this.item.imgTop = top;
          this.item.imgBottom = bottom;
          //更新图片碰撞框
          this.check.imgTop = top;
          this.check.imgBottom = bottom;
          //移动svg图片
          this.svg.top += my * this.item.scale;
          // this.svg.left+=mx*this.item.scale;
        }
        if (left <= this.check.left && right >= this.check.right) {
          //更新x0,y0
          this.opt.x0 = this.opt.x1;
          this.opt.y0 = this.opt.y1;
          //移动under图片
          this.item.imgLeft = left;
          this.item.imgRight = right;
          //更新图片碰撞框
          this.check.imgLeft = left;
          this.check.imgRight = right;
          //移动svg图片
          this.svg.left += mx * this.item.scale;
        }
      } else if (this.opt.moveX != 0 && this.opt.type == "scale") {
        this.opt._scale = true;
        //缩放图片操作开始
        var width = this.item.imgWidth + mx,
          height = this.item.imgHeight * width / this.item.imgWidth;

        var right = this.check.imgRight + mx,
          bottom = this.check.imgBottom + (height - this.item.imgHeight);
        if (bottom >= this.check.bottom && right >= this.check.right) {
          this.check.imgBottom = bottom;
          this.check.imgRight = right;
          //更新x0,y0
          this.opt.x0 = this.opt.x1;
          this.opt.y0 = this.opt.y1;
          //缩放
          this.item.imgWidth = width;
          this.item.imgHeight = height;
          //缩放svg图片
          this.svg.width = width * this.item.scale;
          this.svg.height = height * this.item.scale;
        }
      }
    },
    handleMouseup() {
      if (!this.opt.type) {
        return;
      }
      this.opt.type = "";
      this.opt._move = false;
      this.opt._move = false;
      var clipitem = {},
        i = this.data.index;
      //初始化
      clipitem.url = this.data.item.edit_data.clipImg[i].url;
      clipitem.width = this.svg.width;
      clipitem.height = this.svg.height;
      clipitem.left = this.svg.left;
      clipitem.top = this.svg.top;
      clipitem.rotation = 0;
      clipitem.rotateX = 0;
      clipitem.rotateY = 0;
      this.data.item.edit_data.clipImg.splice(i, 1, clipitem);
    }
  },
  mounted() {
    var _self = this;
    eventBus.$on("containerEdit", function(data) {
      _self.initdata(data);
    });
    eventBus.$on("applyContainer", function(e) {
      if (e) {
        _self.applyContainer();
      } else {
        _self.$store.state.editor.containerEditor = false;
        _self.$store.commit("undo");
      }
    });
  }
};
</script>
<style lang="scss">
.container-editor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 8;
  .container-modal {
    position: relative;
    z-index: 2;
    .svg-layer {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
    }
    .under {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0.5;
      cursor: move;
      img {
        pointer-events: none;
      }
    }
    .resize {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 2;
      border: 1px solid #00a2eb;
      pointer-events: none;
      .img-resize {
        width: 10px;
        height: 10px;
        position: absolute;
        background-color: #fff;
        cursor: se-resize;
        bottom: -5px;
        right: -5px;
        z-index: 2;
        border: 1px solid #00a2eb;
        pointer-events: auto;
      }
    }
  }
  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
}
</style>


// WEBPACK FOOTER //
// containerEditor.vue?1cfeac04