<template>
	<div class="cropper-editor" v-if="show" @mousedown.stop="">
		<div class="modal-over"></div>
		<div class="img-modal" :style="getImgModalStyle">
			<div class="img-resize" :style="getImgResizeStyle" @mousedown.stop="moving=true">
				<div id="img-resize-rect"></div>
				<!--left and top-->
				<div class="point lt" @mousedown.stop="resizing='lt'"></div>
				<!--left and bottom-->
				<div class="point lb" @mousedown.stop="resizing='lb'"></div>
				<!--right and top-->
				<div class="point rt" @mousedown.stop="resizing='rt'"></div>
				<!--right and bottom-->
				<div class="point rb" @mousedown.stop="resizing='rb'"></div>

				<!--center top-->
				<div class="point t" @mousedown.stop="resizing='t'"></div>
				<!--center bottom-->
				<div class="point b" @mousedown.stop="resizing='b'"></div>
				<!--center left-->
				<div class="point l" @mousedown.stop="resizing='l'"></div>
				<!--center right-->
				<div class="point r" @mousedown.stop="resizing='r'"></div>
			</div>
		</div>

	</div>
</template>
<script>
import $ from "jquery";
import common from "@/common/common.js";
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      resizing: "",
      moving: false
    };
  },
  watch: {
    show(val) {
      if (val) {
        //判断是否使用过裁剪,如果没有则自动添加
        if (
          this.getSelectedItem.edit_data.clip.left == 0 &&
          this.getSelectedItem.edit_data.clip.top == 0 &&
          this.getSelectedItem.edit_data.clip.width ==
            this.getSelectedItem.edit_config.originalWidth &&
          this.getSelectedItem.edit_data.clip.height ==
            this.getSelectedItem.edit_config.originalHeight
        ) {
          this.$nextTick(function() {
            this.$nextTick(function() {
              var ratioVal = this.getSelectedItem.edit_data.clip.width / 10;
              this.getSelectedItem.edit_data.clip.left = ratioVal;
              this.getSelectedItem.edit_data.clip.top = ratioVal;
              this.getSelectedItem.edit_data.clip.width =
                this.getSelectedItem.edit_config.originalWidth - ratioVal * 2;
              this.getSelectedItem.edit_data.clip.height =
                this.getSelectedItem.edit_config.originalHeight - ratioVal * 2;
            });
          });
        }
      }
    }
  },
  computed: {
    show() {
      return this.$store.state.editor.modal["cropper"];
    },
    //获取当前的缩放比例
    getZoom() {
      return this.$store.state.stage.zoom / 100;
    },
    //获取mouse状态
    getMouse() {
      return this.$store.state.stage.mouse;
    },
    getImgSrc() {
      var item = this.getSelectedItem;
      if (
        item.edit_config.originalWidth > 800 ||
        item.edit_config.originalHeight > 800
      ) {
        return common.getImageURL(item.edit_data.url, 800);
      } else {
        return item.edit_data.url;
      }
    },
    getSelectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    getImgModalStyle() {
      var styleObj = {};
      var px = $("#stage_canvas").offset().left;
      var py = $("#stage_canvas").offset().top;

      styleObj.width =
        this.getSelectedItem.edit_config.width * this.getZoom + "px";
      styleObj.height =
        this.getSelectedItem.edit_config.height * this.getZoom + "px";
      styleObj.left =
        px + this.getSelectedItem.edit_config.left * this.getZoom + "px";
      styleObj.top =
        py + this.getSelectedItem.edit_config.top * this.getZoom + "px";
      var scale = [1, 1];
      if (this.getSelectedItem.edit_config.flipX) {
        scale[0] = -1;
      }
      if (this.getSelectedItem.edit_config.flipY) {
        scale[1] = -1;
      }

      styleObj.transform =
        "rotate(" +
        this.getSelectedItem.edit_config.rotation +
        "deg) scale(" +
        scale[0] +
        "," +
        scale[1] +
        ")";

      return styleObj;
    },
    getImgResizeStyle() {
      var styleObj = {};

      var zoomX =
        this.getSelectedItem.edit_config.width /
        this.getSelectedItem.edit_config.originalWidth;
      var zoomY =
        this.getSelectedItem.edit_config.height /
        this.getSelectedItem.edit_config.originalHeight;

      styleObj.width =
        this.getSelectedItem.edit_data.clip.width * zoomX * this.getZoom + "px";
      styleObj.height =
        this.getSelectedItem.edit_data.clip.height * zoomY * this.getZoom +
        "px";
      styleObj.left =
        this.getSelectedItem.edit_data.clip.left * zoomX * this.getZoom + "px";
      styleObj.top =
        this.getSelectedItem.edit_data.clip.top * zoomY * this.getZoom + "px";

      styleObj.background = "url('" + this.getImgSrc + "') no-repeat";
      styleObj.backgroundSize =
        this.getSelectedItem.edit_config.width * this.getZoom +
        "px " +
        this.getSelectedItem.edit_config.height * this.getZoom +
        "px";
      styleObj.backgroundPosition =
        -this.getSelectedItem.edit_data.clip.left * zoomX * this.getZoom +
        "px " +
        -this.getSelectedItem.edit_data.clip.top * zoomY * this.getZoom +
        "px";
      return styleObj;
    }
  },
  methods: {
    applyCrop() {
      this.getSelectedItem.edit_data.clipSize = {
        width: this.getSelectedItem.edit_config.width,
        height: this.getSelectedItem.edit_config.height,
        left: this.getSelectedItem.edit_config.left,
        top: this.getSelectedItem.edit_config.top
      };

      this.getSelectedItem.edit_data.clipSize.lastLeft = this.getSelectedItem.edit_data.clip.left;
      this.getSelectedItem.edit_data.clipSize.lastTop = this.getSelectedItem.edit_data.clip.top;

      var zoomAX =
        this.getSelectedItem.edit_config.width /
        this.getSelectedItem.edit_config.originalWidth;
      var zoomAY =
        this.getSelectedItem.edit_config.height /
        this.getSelectedItem.edit_config.originalHeight;
      var zoomX =
        this.getSelectedItem.edit_data.clip.width /
        this.getSelectedItem.edit_config.originalWidth;
      var zoomY =
        this.getSelectedItem.edit_data.clip.height /
        this.getSelectedItem.edit_config.originalHeight;
      //更新尺寸
      this.getSelectedItem.edit_config.width =
        this.getSelectedItem.edit_config.width * zoomX;
      this.getSelectedItem.edit_config.height =
        this.getSelectedItem.edit_config.height * zoomY;
      this.getSelectedItem.edit_config.rotateX =
        this.getSelectedItem.edit_config.width / 2;
      this.getSelectedItem.edit_config.rotateY =
        this.getSelectedItem.edit_config.height / 2;

      this.getSelectedItem.edit_data.clipSize.lastWidth = this.getSelectedItem.edit_config.width;
      this.getSelectedItem.edit_data.clipSize.lastHeight = this.getSelectedItem.edit_config.height;

      //				var cx = (this.getSelectedItem.edit_data.clip.left*zoomAX);
      //				var cy = (this.getSelectedItem.edit_data.clip.top*zoomAY)
      //
      //
      //				var left = this.getSelectedItem.edit_config.left+cx
      //				var top = this.getSelectedItem.edit_config.top+cy
      //
      //				//旋转修正
      //
      //
      //
      //				this.getSelectedItem.edit_config.left = left;
      //				this.getSelectedItem.edit_config.top = top;
      //
      //				var clipLeftEx = (this.getSelectedItem.edit_data.clip.left - this.getSelectedItem.tempClipPos.oldClipLeft)*zoomAX;
      //				var clipTopEx = (this.getSelectedItem.edit_data.clip.top - this.getSelectedItem.tempClipPos.oldClipTop)*zoomAY;
      //
      //				var angel = this.getSelectedItem.edit_config.rotation * Math.PI / 180;
      //				var cx2 = Math.cos(angel)*(clipLeftEx)+Math.sin(angel)*(clipTopEx);
      //				var cy2 = Math.cos(angel)*(clipTopEx)-Math.sin(angel)*(clipLeftEx);

      var cropperRect = $("#img-resize-rect")[0].getBoundingClientRect();
      var cx = $("#stage_canvas").offset().left;
      var cy = $("#stage_canvas").offset().top;

      var newLeft = (cropperRect.left - cx) / this.getZoom;
      var newTop = (cropperRect.top - cy) / this.getZoom;

      console.log("newLeft", newLeft, "newTop", newTop);
      this.getSelectedItem.edit_config.left = newLeft;
      this.getSelectedItem.edit_config.top = newTop;

      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.getSelectedItem],
        snap: false
      });

      this.$nextTick(function() {
        var newRect = $(
          "#rect_" + this.getSelectedItem.id
        )[0].getBoundingClientRect();
        var leftEx = cropperRect.left - newRect.left;
        var topEx = cropperRect.top - newRect.top;
        this.getSelectedItem.edit_config.left += leftEx / this.getZoom;
        this.getSelectedItem.edit_config.top += topEx / this.getZoom;
        console.log("leftEx", leftEx, "topEx", topEx);
        eventBus.$emit("elementChange", {
          type: "update",
          targets: [this.getSelectedItem]
        });
      });

      this.$store.commit("callModal");
    },
    globalMouseMoveHandle() {
      if (this.resizing != "") {
        var angel = this.getSelectedItem.edit_config.rotation * Math.PI / 180;
        var zoomX =
          this.getSelectedItem.edit_config.width /
          this.getSelectedItem.edit_config.originalWidth;
        var zoomY =
          this.getSelectedItem.edit_config.height /
          this.getSelectedItem.edit_config.originalHeight;
        var vecX =
          Math.cos(angel) * (this.getMouse.vectorX / this.getZoom) +
          Math.sin(angel) * (this.getMouse.vectorY / this.getZoom);
        var vecY =
          Math.cos(angel) * (this.getMouse.vectorY / this.getZoom) -
          Math.sin(angel) * (this.getMouse.vectorX / this.getZoom);

        //this.resizing == 'rb' || this.resizing == 'rt' ||
        if (this.resizing == "r") {
          if (this.getSelectedItem.edit_config.flipX) {
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;
          } else {
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;
          }
          //this.resizing == 'lt' || this.resizing == 'lb' ||
        } else if (this.resizing == "l") {
          if (this.getSelectedItem.edit_config.flipX) {
            this.getSelectedItem.edit_data.clip.left -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;
          } else {
            this.getSelectedItem.edit_data.clip.left += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;
          }
        } else if (this.resizing == "b") {
          //this.resizing == 'rb' || this.resizing == 'lb' ||
          if (this.getSelectedItem.edit_config.flipY) {
            this.getSelectedItem.edit_data.clip.height -= vecY / zoomY;
          } else {
            this.getSelectedItem.edit_data.clip.height += vecY / zoomY;
          }
          //this.resizing == 'lt' || this.resizing == 'rt' ||
        } else if (this.resizing == "t") {
          if (this.getSelectedItem.edit_config.flipY) {
            this.getSelectedItem.edit_data.clip.top -= vecY / zoomY;
            this.getSelectedItem.edit_data.clip.height += vecY / zoomY;
          } else {
            this.getSelectedItem.edit_data.clip.top += vecY / zoomY;
            this.getSelectedItem.edit_data.clip.height -= vecY / zoomY;
          }
        } else if (this.resizing == "lt") {
          var heightRatio =
            this.getSelectedItem.edit_data.clip.height /
            this.getSelectedItem.edit_data.clip.width;

          if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.left += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top +=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.left -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top -=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.left += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top +=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.left -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top -=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          }
        } else if (this.resizing == "rt") {
          var heightRatio =
            this.getSelectedItem.edit_data.clip.height /
            this.getSelectedItem.edit_data.clip.width;

          if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top -=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top +=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top -=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.top +=
              vecX * heightRatio / zoomY;
            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          }
        } else if (this.resizing == "lb") {
          var heightRatio =
            this.getSelectedItem.edit_data.clip.height /
            this.getSelectedItem.edit_data.clip.width;

          if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.left += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.left -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.left += vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.left -= vecX / zoomX;
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          }
        } else if (this.resizing == "rb") {
          var heightRatio =
            this.getSelectedItem.edit_data.clip.height /
            this.getSelectedItem.edit_data.clip.width;

          if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == false
          ) {
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == false &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.width += vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height +=
              vecX * heightRatio / zoomY;
          } else if (
            this.getSelectedItem.edit_config.flipX == true &&
            this.getSelectedItem.edit_config.flipY == true
          ) {
            this.getSelectedItem.edit_data.clip.width -= vecX / zoomX;

            this.getSelectedItem.edit_data.clip.height -=
              vecX * heightRatio / zoomY;
          }
        }

        var left = this.getSelectedItem.edit_data.clip.left;
        var top = this.getSelectedItem.edit_data.clip.top;

        var right = this.getSelectedItem.edit_data.clip.width;
        var bottom = this.getSelectedItem.edit_data.clip.height;

        if (this.getSelectedItem.edit_data.clip.width < 0) {
          this.getSelectedItem.edit_data.clip.width = 0;
        }
        if (this.getSelectedItem.edit_data.clip.height < 0) {
          this.getSelectedItem.edit_data.clip.height = 0;
        }
        if (this.getSelectedItem.edit_data.clip.left < 0) {
          this.getSelectedItem.edit_data.clip.left = 0;
        }
        if (this.getSelectedItem.edit_data.clip.top < 0) {
          this.getSelectedItem.edit_data.clip.top = 0;
        }
        if (
          right >
          this.getSelectedItem.edit_config.originalWidth -
            this.getSelectedItem.edit_data.clip.left
        ) {
          this.getSelectedItem.edit_data.clip.width =
            this.getSelectedItem.edit_config.originalWidth -
            this.getSelectedItem.edit_data.clip.left;
        }
        if (
          bottom >
          this.getSelectedItem.edit_config.originalHeight -
            this.getSelectedItem.edit_data.clip.top
        ) {
          this.getSelectedItem.edit_data.clip.height =
            this.getSelectedItem.edit_config.originalHeight -
            this.getSelectedItem.edit_data.clip.top;
        }

        if (left > this.getSelectedItem.edit_config.originalWidth) {
          this.getSelectedItem.edit_data.clip.left = this.getSelectedItem.edit_config.originalWidth;
        }
        if (top > this.getSelectedItem.edit_config.originalHeight) {
          this.getSelectedItem.edit_data.clip.top = this.getSelectedItem.edit_config.originalHeight;
        }
      } else if (this.moving) {
        var angel = this.getSelectedItem.edit_config.rotation * Math.PI / 180;
        var vecX =
          Math.cos(angel) * (this.getMouse.vectorX / this.getZoom) +
          Math.sin(angel) * (this.getMouse.vectorY / this.getZoom);
        var vecY =
          Math.cos(angel) * (this.getMouse.vectorY / this.getZoom) -
          Math.sin(angel) * (this.getMouse.vectorX / this.getZoom);
        var zoomX =
          this.getSelectedItem.edit_config.width /
          this.getSelectedItem.edit_config.originalWidth;
        var zoomY =
          this.getSelectedItem.edit_config.height /
          this.getSelectedItem.edit_config.originalHeight;
        if (this.getSelectedItem.edit_config.flipX) {
          this.getSelectedItem.edit_data.clip.left -= vecX / zoomX;
        } else {
          this.getSelectedItem.edit_data.clip.left += vecX / zoomX;
        }
        if (this.getSelectedItem.edit_config.flipY) {
          this.getSelectedItem.edit_data.clip.top -= vecY / zoomY;
        } else {
          this.getSelectedItem.edit_data.clip.top += vecY / zoomY;
        }

        var right = this.getSelectedItem.edit_data.clip.width;
        var bottom = this.getSelectedItem.edit_data.clip.height;

        if (
          right >
          this.getSelectedItem.edit_config.originalWidth -
            this.getSelectedItem.edit_data.clip.left
        ) {
          this.getSelectedItem.edit_data.clip.left =
            this.getSelectedItem.edit_config.originalWidth -
            this.getSelectedItem.edit_data.clip.width;
        }
        if (
          bottom >
          this.getSelectedItem.edit_config.originalHeight -
            this.getSelectedItem.edit_data.clip.top
        ) {
          this.getSelectedItem.edit_data.clip.top =
            this.getSelectedItem.edit_config.originalHeight -
            this.getSelectedItem.edit_data.clip.height;
        }
        if (this.getSelectedItem.edit_data.clip.left < 0) {
          this.getSelectedItem.edit_data.clip.left = 0;
        }
        if (this.getSelectedItem.edit_data.clip.top < 0) {
          this.getSelectedItem.edit_data.clip.top = 0;
        }

        //console.log('clip Position:',this.getSelectedItem.edit_data.clip.left,this.getSelectedItem.edit_data.clip.top);
      }
    },
    globalMouseUpHandle() {
      this.resizing = "";
      this.moving = false;
    }
  },
  mounted() {
    var _self = this;
    eventBus.$on("globalMouseMove", this.globalMouseMoveHandle);
    eventBus.$on("globalMouseUp", this.globalMouseUpHandle);
    eventBus.$on("applyCrop", function(e) {
      if (_self.show) {
        if (e) {
          //应用
          _self.applyCrop();
        } else {
          //取消应用
          _self.$store.commit("undo");
          _self.$store.commit("callModal");
        }
      }
    });
  }
};
</script>
<style lang="scss">
.cropper-editor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 8;

  .img-modal {
    position: absolute;
    pointer-events: all;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .modal-over {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  .img-resize {
    position: absolute;

    cursor: move;
    #img-resize-rect {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: transparent;
      cursor: move;
    }
    .lt {
      left: -5px;
      top: -5px;
      cursor: nw-resize;
    }
    .lb {
      left: -5px;
      bottom: -5px;
      cursor: ne-resize;
      background-position-y: 20px !important;
    }
    .rt {
      right: -5px;
      top: -5px;
      cursor: ne-resize;
      background-position-x: 20px !important;
    }
    .rb {
      right: -5px;
      bottom: -5px;
      cursor: nw-resize;
      background-position-x: 20px !important;
      background-position-y: 20px !important;
    }
    .l {
      left: 0;
      top: 50%;
      background-position-y: -20px !important;
      margin-top: -10px;
      margin-left: -5px;
      cursor: ew-resize;
    }
    .r {
      right: 0;
      top: 50%;
      background-position-x: 20px !important;
      background-position-y: -20px !important;
      margin-top: -10px;
      margin-right: -5px;
      cursor: ew-resize;
    }
    .t {
      left: 50%;
      top: 0;
      background-position-x: -20px !important;
      margin-left: -10px;
      margin-top: -6px;
      cursor: ns-resize;
    }
    .b {
      bottom: 0;
      left: 50%;
      background-position-y: 20px !important;
      background-position-x: -20px !important;
      margin-left: -10px;
      margin-bottom: -6px;
      cursor: ns-resize;
    }
    .point {
      position: absolute;
      width: 20px;
      height: 20px;
      background: url(/assets/images/cropper_icon.png);
      pointer-events: all;
    }
  }
}
</style>


// WEBPACK FOOTER //
// cropper.vue?9f0fc5ca
