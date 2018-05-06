<template>
	<div class="image-filter-main modal-mini" v-show="show" @mousedown.stop="">
		<!--预置样式-->
		<div class="default">
			<!--上一个-->
			<div class="btn-block">
				<div class="control-btn prev" @click="setPage(-1)"></div>
			</div>
			<!--内容区域-->
			<div class="content">
				<div class="filter-group" :style="getFilterGroupStyle">
					<div class="item" v-for="(item,index) in filterThumbnail" v-html="item.html" @click="setFilter(item.filter)">

					</div>
				</div>
			</div>
			<!--下一个-->
			<div class="btn-block">
				<div class="control-btn next" @click="setPage(1)"></div>
			</div>
		</div>
		<!--参数调整-->
		<div class="setting">
			<div class="item">
				<div class="name">亮度</div>
				<input type="range" min="-100" max="100" :value="getSelectedItem.edit_data.filter.bright" @change="emitUpdate" @input="getSelectedItem.edit_data.filter.bright = arguments[0].target.value;updateHtml()"/>
				<div class="val" v-text="getSelectedItem.edit_data.filter.bright"></div>
			</div>

			<div class="item">
				<div class="name">对比度</div>
				<input type="range" min="-100" max="100" :value="getSelectedItem.edit_data.filter.contrast" @change="emitUpdate" @input="getSelectedItem.edit_data.filter.contrast = arguments[0].target.value;updateHtml()"/>
				<div class="val" v-text="getSelectedItem.edit_data.filter.contrast"></div>
			</div>

			<div class="item">
				<div class="name">饱和度</div>
				<input type="range" min="-100" max="100" :value="getSelectedItem.edit_data.filter.saturation" @change="emitUpdate" @input="getSelectedItem.edit_data.filter.saturation = arguments[0].target.value;updateHtml()"/>
				<div class="val" v-text="getSelectedItem.edit_data.filter.saturation"></div>
			</div>

			<div class="item">
				<div class="name">色相</div>
				<input type="range" min="-100" max="100" :value="getSelectedItem.edit_data.filter.hue" @change="emitUpdate" @input="getSelectedItem.edit_data.filter.hue = arguments[0].target.value;updateHtml()"/>
				<div class="val" v-text="getSelectedItem.edit_data.filter.hue"></div>
			</div>

			<div class="item">
				<div class="name">模糊</div>
				<input type="range" min="-100" max="100" :value="getSelectedItem.edit_data.filter.blur" @change="emitUpdate" @input="getSelectedItem.edit_data.filter.blur = arguments[0].target.value;updateHtml()"/>
				<div class="val" v-text="getSelectedItem.edit_data.filter.blur"></div>
			</div>

			<div class="item">
				<div class="name">负片冲印</div>
				<input type="range" min="-100" max="100" :value="getSelectedItem.edit_data.filter.film" @change="emitUpdate" @input="getSelectedItem.edit_data.filter.film = arguments[0].target.value;updateHtml()"/>
				<div class="val" v-text="getSelectedItem.edit_data.filter.film"></div>
			</div>
		</div>
	</div>
</template>
<script>
import common from "@/common/common.js";
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      filterThumbnail: [],
      //默认滤镜
      defaultFilter: [
        {
          //滤镜名称
          name: "原图",
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
        {
          //滤镜名称
          name: "清新",
          //亮度
          bright: 12,
          //对比度
          contrast: 1,
          //饱和度
          saturation: 11,
          //色相
          hue: 0,
          //模糊
          blur: 0,
          //负片冲印
          film: 29
        },
        {
          //滤镜名称
          name: "蓝调",
          //亮度
          bright: 14,
          //对比度
          contrast: -7,
          //饱和度
          saturation: -28,
          //色相
          hue: -35,
          //模糊
          blur: 0,
          //负片冲印
          film: 53
        },
        {
          //滤镜名称
          name: "日系",
          //亮度
          bright: 10,
          //对比度
          contrast: 4,
          //饱和度
          saturation: 11,
          //色相
          hue: 67,
          //模糊
          blur: -3,
          //负片冲印
          film: 78
        },
        {
          //滤镜名称
          name: "优雅",
          //亮度
          bright: 10,
          //对比度
          contrast: 18,
          //饱和度
          saturation: 6,
          //色相
          hue: 0,
          //模糊
          blur: -4,
          //负片冲印
          film: 55
        },
        {
          //滤镜名称
          name: "古典",
          //亮度
          bright: 13,
          //对比度
          contrast: 15,
          //饱和度
          saturation: -29,
          //色相
          hue: 0,
          //模糊
          blur: 0,
          //负片冲印
          film: 0
        },
        {
          //滤镜名称
          name: "阳光",
          //亮度
          bright: 10,
          //对比度
          contrast: -6,
          //饱和度
          saturation: 10,
          //色相
          hue: 0,
          //模糊
          blur: 0,
          //负片冲印
          film: 24
        },
        {
          //滤镜名称
          name: "盛夏",
          //亮度
          bright: 10,
          //对比度
          contrast: 14,
          //饱和度
          saturation: 18,
          //色相
          hue: -46,
          //模糊
          blur: 0,
          //负片冲印
          film: 30
        },
        {
          //滤镜名称
          name: "怀旧",
          //亮度
          bright: 8,
          //对比度
          contrast: 7,
          //饱和度
          saturation: -51,
          //色相
          hue: 55,
          //模糊
          blur: 1,
          //负片冲印
          film: 33
        },
        {
          //滤镜名称
          name: "森林",
          //亮度
          bright: 11,
          //对比度
          contrast: -14,
          //饱和度
          saturation: -18,
          //色相
          hue: 49,
          //模糊
          blur: 0,
          //负片冲印
          film: 69
        },
        {
          //滤镜名称
          name: "玫瑰",
          //亮度
          bright: 0,
          //对比度
          contrast: 27,
          //饱和度
          saturation: -24,
          //色相
          hue: -73,
          //模糊
          blur: -3,
          //负片冲印
          film: 27
        },
        {
          //滤镜名称
          name: "黑白",
          //亮度
          bright: 0,
          //对比度
          contrast: 20,
          //饱和度
          saturation: -100,
          //色相
          hue: 0,
          //模糊
          blur: 0,
          //负片冲印
          film: 0
        }
      ],
      //当前所在的页面
      page: 0
    };
  },
  watch: {
    show() {
      this.filterThumbnail = [];
      for (var i in this.defaultFilter) {
        var item = this.defaultFilter[i];
        var index = i;
        var html = this.getThumbnail(item, index);
        var str =
          '<svg width="56" height="56" version="1.1" xmlns="http://www.w3.org/2000/svg" style="background: #ececec;cursor:pointer" shape-rendering="crispEdges">' +
          html +
          "</svg>";
        var str2 = "<div>" + item.name + "</div>";
        this.filterThumbnail.push({
          html: str + str2,
          filter: item
        });
      }
    }
  },
  computed: {
    //获取当前选中的元素
    getSelectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    getFilterGroupStyle() {
      return {
        left: this.page * -262 + "px"
      };
    },
    show() {
      return this.$store.state.editor.modal["imageFilter"];
    }
  },
  methods: {
    emitUpdate() {
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.getSelectedItem]
      });
    },
    updateHtml() {
      eventBus.$emit("updateSelectedItemsHtml");
    },
    setFilter(item) {
      console.log("item", item);

      this.getSelectedItem.edit_data.filter.bright = item.bright;
      this.getSelectedItem.edit_data.filter.contrast = item.contrast;
      this.getSelectedItem.edit_data.filter.saturation = item.saturation;
      this.getSelectedItem.edit_data.filter.hue = item.hue;
      this.getSelectedItem.edit_data.filter.blur = item.blur;
      this.getSelectedItem.edit_data.filter.film = item.film;
      //eventBus.$emit('stageChange','filter');
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.getSelectedItem]
      });
    },
    setPage(page) {
      this.page = this.page + page;
      var maxPage =
        (this.defaultFilter.length - this.defaultFilter.length % 4) / 4;
      if (this.page < 0) {
        this.page = 0;
      } else if (this.page > maxPage - 1) {
        this.page = maxPage - 1;
      }
    },
    getThumbnail(item, index) {
      var str = "";
      var url = "";
      var filter = common.getFilterHtml(item);
      if (this.getSelectedItem.type == "image") {
        url =
          this.getSelectedItem.edit_data.url + "?x-oss-process=style/thumb56";
        var imgWidth = this.getSelectedItem.edit_config.originalWidth;
        var imgHeight = this.getSelectedItem.edit_config.originalHeight;
      } else if (this.getSelectedItem.type == "container") {
        if (
          this.getSelectedItem.edit_data.clipImg.length > 0 &&
          this.getSelectedItem.edit_data.clipImg[0].url != ""
        ) {
          var clipUrl = this.getSelectedItem.edit_data.clipImg[0].url;

          url = common.getImageURL(clipUrl, 56);
        } else {
          url = "/diy4/static/img/nopic.svg";
        }
        var imgWidth = this.getSelectedItem.edit_data.clipImg[0].width;
        var imgHeight = this.getSelectedItem.edit_data.clipImg[0].height;
      }

      if (imgWidth >= imgHeight) {
        var height = 56;
        var width =
          this.getSelectedItem.edit_config.originalWidth *
          (56 / this.getSelectedItem.edit_config.originalHeight);
      } else {
        var height =
          this.getSelectedItem.edit_config.originalHeight *
          (56 / this.getSelectedItem.edit_config.originalWidth);
        var width = 56;
      }
      //			var width = 56;
      //			var height = this.getSelectedItem.edit_config.originalHeight/56;

      var x = -width / 2 + 56 / 2;
      var y = 0;

      if (filter != "") {
        str =
          str +
          '<image preserveAspectRatio="none" width="' +
          width +
          '" height="' +
          height +
          '" x="' +
          x +
          '" y="' +
          y +
          '" xlink:href="' +
          url +
          '" filter="url(#temp_filter_' +
          index +
          "_" +
          this.getSelectedItem.id +
          ')"/>';
        str =
          str +
          '<defs><filter id="temp_filter_' +
          index +
          "_" +
          this.getSelectedItem.id +
          '">' +
          common.getFilterHtml(item) +
          "</filter></defs>";
      } else {
        str =
          str +
          '<image preserveAspectRatio="none" width="' +
          width +
          '" height="' +
          height +
          '" x="' +
          x +
          '" y="' +
          y +
          '" xlink:href="' +
          url +
          '"/>';
      }

      return str;
    }
  }
};
</script>
<style lang="scss">
.image-filter-main {
  width: 330px;
  height: 330px;
  .default {
    height: 100px;
    width: 100%;
    background: #ececec;
    .btn-block {
      float: left;
      width: 10%;
      height: 100%;

      .control-btn {
        display: inline-block;
        width: 18px;
        height: 18px;
        margin-left: 9px;
        margin-top: 35px;
        background: url(/assets/next.png) no-repeat 0 0;
        &:hover {
          opacity: 0.5;
        }
      }
      .prev {
        transform: scale(-1, 1);
      }
    }
    .content {
      overflow: hidden;
      float: left;
      width: 80%;
      height: 100%;
      white-space: nowrap;
      position: relative;
      .filter-group {
        position: absolute;
        left: 0;
        top: 0;
        transition: all 0.3s ease;
        .item {
          display: inline-block;
          margin: 4.8px;
          margin-top: 15px;
          div {
            text-align: center;
            color: #515151;
            cursor: default;
          }
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }
  .setting {
    height: 210px;
    .item {
      padding: 10px;
      color: #515151;
      font-size: 12px;
      .name {
        display: inline-block;
        padding-left: 7px;
        width: 55px;
      }

      input {
        display: inline-block;
        width: 210px;
        margin-left: 5px;
      }
      .val {
        display: inline-block;
        width: 30px;
        text-align: center;
      }
    }
  }
}
</style>


// WEBPACK FOOTER //
// imageFilter.vue?3e7a5ff1
