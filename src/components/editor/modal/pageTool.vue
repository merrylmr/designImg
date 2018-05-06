<template>
	<div class="page-tool">
		<!-- 缩略图 -->
		<div class="thumbnail-tool" v-if="thumbnailShow" ref="flat" @mousewheel="handleMousewheel">
			<div class="close" @click="closeThumbnail">×</div>
			<div class="thumbnail" :style="{backgroundColor:getNowPageData.edit_config.backgroundColor}" v-html="getThumbnail"></div>
			<div class="box" :style="boxStyle" @mousedown="initMovePage"></div>
		</div>
		<!-- 舞台辅助工具栏 -->
		<div class="center" >
      <!-- 普通舞台辅助工具栏 -->
      <div class="zoom-wrap" v-if="this.$store.state.docData.product != 'jianye'">
        <div class="zoom-tool">
          <span class="zoom" @click="zoomIn" title="放大画布"></span>
          <span class="text">{{zoom}}%</span>
          <span class="scale" @click="zoomOut" title="缩小画布"></span>
          <span :class="['full',(isfull?'':'full2')]" @click="extraScale" title="适应画布/1:1缩放"></span>
          <span class="grid" @click="switchGrid" title="显示/隐藏网格"></span>
          <span class="guides" @click="openGuides" title="显示/隐藏参考线"></span>
        </div>
      </div>

      <!-- 简页专用辅助工具栏 -->
      <div class="zoom-tool-jianye" v-if="this.$store.state.docData.product == 'jianye'">
        <div class="btn-item btm-noradius" @click="zoomIn" title="放大画布">
          <i class="tbzico ico-zoomout"></i>
        </div>
        <div class="btn-item top-noradius" @click="zoomOut" title="缩小画布">
          <i class="tbzico ico-zoomin"></i>
        </div>
        <div class="padding"></div>
        <div class="btn-item btm-noradius" @click="switchGrid" title="显示/隐藏网格">
          <i class="tbzico ico-grid"></i>
        </div>
        <div class="btn-item top-noradius" @click="openGuides" title="显示/隐藏参考线">
          <i class="tbzico ico-guide"></i>
        </div>
        <div class="padding"></div>
        <div class="btn-item" title="上传PhotoShop文档" @click="onUploadPSDClick">
          <i class="tbzico ico-psupload"></i>
        </div>
      </div>
		</div>
		<!-- 客服 -->
		<div class="service">
			<span class="ico">
				<i class="tbzico ico-eService"></i><br/>客服</span>
			<div class="service-box" v-if="!coorp">
				<div class="text1">您好，欢迎加入{{qqname}}QQ服务群，我们将设有专门客服为您解答一切疑问</div>
				<div class="text2">
					<div class="p1">群号码</div>
					<div class="p2">
						<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=ce3398ac2f3c62a6ec9224de6ea18d8666c5b951dfa89f9258cf004eb12e8b74" title="图帮主服务群">{{qqnumber}}</a>
						<span v-clipboard="qqnumber" @success="afterCopy">复制号码</span>
					</div>
				</div>
			</div>
			<div class="service-box coorp" v-else>
				<div class="inner">
					<div class="title">{{coorpName}}客服</div>
					<a class="link" v-for="item in coorpService" :href="item.val" target="_blank">
						<i :class="['icon','icon-'+item.name]"></i>在线交谈

					</a>
				</div>
			</div>
		</div>
    <psd-uploader v-if="psdShow" @success="onPsdUploaded" @close="psdShow=false"/>
	</div>
</template>
<script>
import common from "@/common/common.js";
import eventBus from "@/common/eventBus.js";
import $ from "jquery";

import psdUploader from "@/components/editor/modal/psdUpload.vue";
export default {
  props: ["scroll", "stageStyle"],
  components: { psdUploader },
  data() {
    return {
      coorp: false,
      coorpService: [],
      coorpName: "",
      triggleClose: false,
      //拖动
      mouseDown: false,
      x: 0,
      y: 0,
      //缩略图位置参数
      sWidth: 110,
      padding: 15,

      pos: {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      psdShow: false
    };
  },
  watch: {
    scroll: function(val) {
      val || (this.triggleClose = false);
    }
  },
  computed: {
    //简页工具Style
    /*jianyeZoomToolStyle() {
      let stageStyle = this.$store.state.stage.stageStyle;
      let left = stageStyle.left + stageStyle.width + 375 + 10;
      if (left > $(window).width() - 50) {
        left = $(window).width() - 50;
      }
      return {
        left: left + "px"
      };
    },*/
    qqnumber() {
      return this.$store.state.docData.product == "jianye"
        ? "679723952"
        : "188123416";
    },
    qqname() {
      return this.$store.state.docData.product == "jianye" ? "简页" : "图帮主";
    },
    thumbnailShow() {
      return (
        this.scroll &&
        !this.triggleClose &&
        this.$store.state.docData.product != "jianye"
      );
    },
    zoom() {
      return this.$store.state.stage.zoom;
    },
    isfull() {
      return this.zoom == 100 ? true : false;
    },
    //获取舞台宽高
    getStageSize() {
      return {
        width: this.$store.state.docData.info.width,
        height: this.$store.state.docData.info.height
      };
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
    getThumbnail() {
      var page = this.$store.state.docData.page[
        this.$store.state.docData.editor.nowPage
      ];
      var html = "";
      var h = this.getSvgHeight * this.sWidth / this.getSvgWidth;
      if (page.thumbnail != undefined && page.thumbnail != "") {
        html =
          '<img width="' +
          this.sWidth +
          '" height="' +
          h +
          '"  src="' +
          page.thumbnail +
          '"/>';
      } else {
        html =
          '<svg width="' +
          this.sWidth +
          '" height="' +
          h +
          '"  style="background: ' +
          page.edit_config.backgroundColor +
          '"></svg>';
      }
      return html;
    },
    boxStyle() {
      var {
        width: w,
        height: h,
        top: t,
        left: l,
        pWidth,
        pHeight
      } = this.stageStyle;
      var scale = w / this.sWidth;
      var width = pWidth / scale;
      var height = pHeight / scale;
      var left = this.padding - l / scale;
      var top = this.padding - t / scale;
      this.pos.top = top;
      this.pos.left = left;
      this.pos.width = width;
      this.pos.height = height;
      return {
        top: top + "px",
        left: left + "px",
        width: width + "px",
        height: height + "px"
      };
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      if (this.$store.state.docData.page.length > 0) {
        return this.$store.state.docData.page[
          this.$store.state.docData.editor.nowPage
        ];
      } else {
        console.log("没有任何���面数据,无法完成载入");
        return [];
      }
    }
  },
  methods: {
    onPsdUploaded(e) {
      this.psdShow = false;
      console.log("psd上传结束", e);
      this.loadPsdElement(e);
    },
    onUploadPSDClick() {
      this.psdShow = true;
    },
    //加载PSD元素
    loadPsdElement(arr) {
      console.log("开始加载PSD", arr);
      let imageElementArr = [];
      for (let i in arr) {
        let item = arr[i];
        //创建一个新的element
        let imageElement = {
          //ID
          id: "shape_" + common.getNewID(),
          //所在页面
          page_id: this.getNowPageData.id,
          //元素类型
          type: "image",
          //元素数据
          edit_data: {
            url: item.url,
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
              width: item.width,
              height: item.height
            },
            //圆角
            radius: 0,

            //原始图片标识ID
            oldID: -1
          },
          //元素属性
          edit_config: {
            //尺寸
            width: item.width,
            height: item.height,
            originalWidth: item.width,
            originalHeight: item.height,
            //位置
            left: item.left,
            top: item.top,
            //旋转
            rotation: 0,
            rotateX: item.width / 2,
            rotateY: item.height / 2,
            //翻转
            flipX: false,
            flipY: false,
            //不透明度
            opacity: item.opacity,
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
          imageElement.edit_config.style.shadow.opacity = 40;
          imageElement.edit_config.style.shadow.distance = 3;
          imageElement.edit_config.style.shadow.strength = 2;
        }
        imageElementArr.push(imageElement);

        this.$store.commit("addElementToStage", {
          obj: imageElement,
          isBackground: false
        });
      }
      eventBus.$emit("elementChange", {
        type: "add",
        targets: imageElementArr
      });
    },
    openGuides() {
      this.$store.commit("callModal");
      this.$store.commit("callModal", { type: "guides" });
    },
    switchGrid() {
      this.$store.state.editor.grid = !this.$store.state.editor.grid;
    },
    initMovePage(e) {
      e.stopPropagation();
      e.preventDefault();
      this.mouseDown = true;
      this.x = e.clientX;
      this.y = e.clientY;
    },
    mouseMove(e) {
      if (this.mouseDown) {
        var { width: w, height: h, top: t, left: l } = this.stageStyle;
        var { top, left, width, height } = this.pos;
        var scale = w / this.sWidth;
        var mx = e.clientX - this.x;
        var my = e.clientY - this.y;
        var rect = this.$refs.flat.getBoundingClientRect();
        this.x = e.clientX;
        this.y = e.clientY;
        //计算位置差异
        top += my;
        left += mx;
        //避免溢出
        left < 0 && (left = 0);
        top < 0 && (top = 0);
        left + width > rect.width && (left = rect.width - width);
        top + height > rect.height && (top = rect.height - height);
        //修正鼠标溢出
        e.clientX < rect.left && (left = 0);
        e.clientX > rect.right && (left = rect.width - width);
        e.clientY < rect.top && (top = 0);
        e.clientY > rect.bottom && (top = rect.height - height);

        left >= 0 && (l = (this.padding - left) * scale);
        top >= 0 && (t = (this.padding - top) * scale);
        eventBus.$emit("pageMove", { left: l, top: t });
      }
    },
    handleMousewheel(e) {
      var { width: w, height: h, top: t, left: l } = this.stageStyle;
      var { top, left, width, height } = this.pos;
      var scale = w / this.sWidth;
      var rect = this.$refs.flat.getBoundingClientRect();
      //计算位置差异
      top -= e.wheelDelta / 10;
      //避免溢出
      top < 0 && (top = 0);
      top + height > rect.height && (top = rect.height - height);
      //修正鼠标溢出
      e.clientY < rect.top && (top = 0);
      e.clientY > rect.bottom && (top = rect.height - height);

      top >= 0 && (t = (this.padding - top) * scale);
      eventBus.$emit("pageMove", { left: l, top: t });
    },
    mouseUp(e) {
      if (this.mouseDown) {
        this.mouseDown = false;
      }
    },
    closeThumbnail() {
      this.triggleClose = true;
    },
    //放大
    zoomIn() {
      this.cancelSelected();
      this.$store.commit("setZoom", {
        type: "zoomIn"
      });
    },
    //缩小
    zoomOut() {
      this.cancelSelected();
      this.$store.commit("setZoom", {
        type: "zoomOut"
      });
    },
    //100%
    normal() {
      this.cancelSelected();
      this.$store.commit("setZoom", {
        type: "normal"
      });
    },
    //适应屏幕
    adaptive() {
      this.cancelSelected();

      this.$store.commit("setZoom", {
        type: "custom",
        val: 90
      });
    },
    //取消选择状态
    cancelSelected() {
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
    },
    extraScale() {
      this.isfull ? this.adaptive() : this.normal();
    },
    afterCopy() {
      event.stopPropagation();
      this.$store.commit("callModal", {
        type: "alert",
        modalOver: true,
        cls: "ok",
        text: "已成功复制到剪切板！"
      });
    }
  },
  mounted() {
    var _self = this;
    eventBus.$on("stateChange", function(e) {
      if (e.type == "ready") {
        if (_self.$store.state.editor.coorpId > 0) {
          console.log("init");
          _self.coorp = true;
          var temp = _self.$store.state.editor.coorpLinks;
          for (var i in temp) {
            var url = "";
            if (i == "qq") {
              temp[i].forEach(v=>{
                url =
                "http://wpa.qq.com/msgrd?v=3&uin=" + v + "&site=qq&menu=yes";
                _self.coorpService.push({ name: i, val: url });
              })
            } else {
              temp[i].forEach(v=>{
                url =
                "http://amos.alicdn.com/getcid.aw?v=2&uid=" + v + "&site=cntaobao&s=1&groupid=0&charset=utf-8";
                _self.coorpService.push({ name: i, val: url });
              })
              url =
                "http://amos.alicdn.com/getcid.aw?v=2&uid=" +
                temp[i] +
                "&site=cntaobao&s=1&groupid=0&charset=utf-8";
            }
          }
          _self.coorpName = _self.$store.state.editor.coorpName;
        }
      }
    });
    eventBus.$on('uploadPsd',e=>{
      this.onUploadPSDClick();
      this.$store.state.editor.isSourceOpen = false;
    });
    window.addEventListener("mousemove", this.mouseMove, false);
    window.addEventListener("mouseup", this.mouseUp, false);
  }
};
</script>
<style lang="scss">
$blue: #00a2eb;
.page-tool {
  position: absolute;
  height: 41px;
  right: 0px;
  left: 0;
  bottom: 0px;
  z-index: 50;

  .center {
    .zoom-wrap {
      pointer-events: all;
      width: 254px;
      height: 41px;
      position: absolute;
      top: 0;
      left: 50%;
      margin-left: -88px;
      .zoom-tool {
        width: 100%;
        height: 34px;
        background-color: #414750;
        border-radius: 21px;
        float: left;
        .zoom {
          display: inline-block;
          width: 34px;
          height: 34px;
          border-radius: 34px;
          background: url(/assets/images/zoom.png) 50% 9px no-repeat
            transparent;
          cursor: pointer;
          margin-left: 4px;
        }
        .text {
          display: inline-block;
          height: 34px;
          line-height: 34px;
          font-size: 12px;
          color: #fff;
          overflow: hidden;
          text-align: center;
          margin: 0 10px;
        }
        .scale {
          display: inline-block;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: url(/assets/images/zoom.png) 50% -54px no-repeat transparent;
          cursor: pointer;
        }
        .grid {
          display: inline-block;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: url(/assets/images/zoom.png) 50% -205px no-repeat transparent;
          cursor: pointer;
        }
        .full {
          display: inline-block;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: url(/assets/images/zoom.png) 50% -131px no-repeat transparent;
          cursor: pointer;
          &.full2 {
            background-position: 50% -170px;
          }
        }
        .guides {
          display: inline-block;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: url(/assets/images/zoom.png) 50% -236px no-repeat transparent;
          cursor: pointer;
        }
      }
    }

    .zoom-tool-jianye {
      position: fixed;
      right: 10px;
      top: 50%;
      transform: translate(0, -50%);

      z-index: 100;
      .btn-item {
        background-color: #43484d;
        color: #ffffff;
        width: 38px;
        height: 38px;
        line-height: 38px;
        text-align: center;
        border-radius: 3px;
        cursor: pointer;
        transition: 0.2s all;
        &:hover {
          background-color: #55595e;
          color: #00a0e9;
        }
      }
      .btm-noradius {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom: 1px solid #62666a;
      }
      .top-noradius {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        // border-top: 1px solid #62666a;
      }
      .padding {
        padding: 3px;
      }
    }
  }
  .service {
    position: absolute;
    right: 10px;
    bottom: 0;
    width: 41px;
    height: 41px;
    span.ico {
      display: block;
      height: 41px;
      background: #fff;
      cursor: pointer;
      font-size: 12px;
      color: #a2a2a2;
      padding-top: 4px;
      text-align: center;
      &:hover {
        color: #727272;
      }
    }
    .service-box {
      padding: 0 20px;
      width: 257px;
      height: 138px;
      background-color: #fff;
      border-radius: 8px;
      position: absolute;
      zoom: 1;
      top: 200px;
      left: -270px;
      box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: all 0.2s ease-in;
      .text1 {
        font-size: 12px;
        color: #656565;
        line-height: 1.5;
        border-bottom: 1px solid #dedede;
        padding: 10px 0;
      }
      .text2 {
        min-height: 66px;
        font-size: 12px;
        color: #656565;
        line-height: 1.5;
        border-bottom: 1px solid #dedede;
        padding: 12px 0 10px 55px;
        background: url(/assets/images/qqq.png) 0 6px no-repeat
          transparent;
        .p1 {
          font-size: 14px;
          color: #3b3b3b;
        }
        .p2 {
          a {
            font-size: 12px;
            color: $blue;
            margin-right: 10px;
          }
          span {
            font-size: 12px;
            color: $blue;
            cursor: pointer;
          }
        }
      }
      &:before {
        width: 24px;
        height: 100%;
        background: url(/assets/images/arrow10.png) 0 90% no-repeat
          transparent;
        display: block;
        position: absolute;
        zoom: 1;
        top: 0;
        right: -24px;
        z-index: 2;
        content: "";
      }
      &.coorp {
        font-size: 14px;
        color: #383735;
        padding: 6px;
        height: auto;
        width: 169px;
        margin: 0;
        left: -190px;
        box-sizing: border-box;
        top: auto;
        padding-left: 25px;
        .title {
          line-height: 38px;
        }
        .link {
          color: #383735;
          display: block;
          width: 108px;
          line-height: 32px;
          height: 32px;
          border-radius: 2px;
          border: 1px solid #9cd1e6;
          box-shadow: 0 2px 0 0 #e7e7e7;
          text-decoration: none;
          margin-bottom: 10px;
          text-align: center;
          .icon {
            display: inline-block;
            width: 20px;
            height: 22px;
            vertical-align: middle;
            margin: 0 5px 5px 0;
            &.icon-qq {
              background: url(/assets/images/qq.png) 0 0 no-repeat
                transparent;
            }
            &.icon-ww {
              background: url(/assets/images/ww.png) 0 0 no-repeat
                transparent;
            }
          }
        }
      }
    }
    &:hover {
      .service-box {
        bottom: 0;
        opacity: 1;
      }
    }
  }
  .thumbnail-tool {
    background-color: #414750;
    padding: 15px;
    position: absolute;
    left: 0;
    bottom: 0;
    overflow: hidden;
    img,
    svg {
      display: block;
      background-color: white;
    }
    .close {
      position: absolute;
      top: 0px;
      right: 2px;
      color: #fff;
      cursor: pointer;
      z-index: 1;
      &:hover {
        color: #efefef;
      }
    }
    .inner {
      position: relative;
    }
    .box {
      position: absolute;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }
  }
}
</style>



// WEBPACK FOOTER //
// pageTool.vue?1df311a7
