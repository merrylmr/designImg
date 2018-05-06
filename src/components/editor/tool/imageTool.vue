<template>
	<div class="image-tool">

		<span class="tool-text" @click.stop="callModal({type:'imageFilter',modalOver:false})">
			<i class="ico-filter"></i>滤镜</span>
		<div class="split" style="margin:0"></div>
		<span class="tool-text" style="margin-right:5px" @click="showSize">尺寸</span>
		<size-box style="left:100px;" />

		<span class="tool-text changeImg">
			<label for="upload">换图</label>
			<form ref="changImgForm"><input type="file" ref="file" id="upload" @change="uploadFile"></form>
		</span>
		<span class="tool-text" @click="openCropper">裁剪</span>
		<span class="tool-text" @click="showRadiusSlide">圆角</span>
		<!-- modal -->
		<imageFilter/>

	</div>
</template>
<script>
import $ from "jquery";
import eventBus from "@/common/eventBus.js";
import imageFilter from "@/components/editor/modal/toolbar/imageFilter.vue";
import sizeBox from "./../modal/toolbar/size.vue";
export default {
  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },
  methods: {
    showSize() {
      this.callModal({ type: "size" });
    },
    openCropper() {
      eventBus.$emit("openImageCropper", this.selectedItem);
    },
    callModal(data) {
      this.$store.commit("callModal");
      this.$store.commit("callModal", data);
    },
    uploadFile() {
      console.log("换图", this.selectedItem);
      //检查登录
      var _self = this;
      if (this.$store.state.editor.loginMode == "visitor") {
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: "请登录后再执行操作！",
        });
        return;
      }
      //检查文件格式和大小
      var file = this.$refs.file.files[0];
      var size = file.size;
      if (/png|jpg|jpeg|bmp/.test(file.type)) {
        console.log("is image");
      } else {
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: "请选择图片文件！"
        });
        return;
      }
      //超出大小警告提示
      if (size > 10 * 1024 * 1024) {
        this.$store.commit("callModal", {
          type: "alert",
          cls: "danger",
          text: "请选择小于10M的图片重新上传",
          modalOver: true
        });
        return;
      }
      //小文件直接上传500k
      if (size < 0.5 * 1024 * 1024) {
        var form = new FormData();
        form.append("file", file);
        form.append("name", file.name);
        $.ajax({
          url: "/editor/upFile3.html",
          type: "POST",
          data: form,
          dataType: "json",
          xhr: function() {
            //用以显示上传进度
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
              xhr.upload.addEventListener(
                "progress",
                function(e) {
                  // _self.list.uploadingProgress = parseInt(e.loaded*100/size);
                },
                false
              );
            }
            return xhr;
          },
          async: true,
          processData: false,
          contentType: false,
          success: function(data) {
            _self.changeImg(data);
          },
          error: function(data) {
            _self.changeImg(data);
          }
        });
      } else {
        var unitSize = 0.5 * 1024 * 1024,
          loadedData = 0,
          total = Math.ceil(size / unitSize);
        var i = 0;
        chunkAjax(i);
        function chunkAjax(i) {
          var start = i * unitSize,
            end = Math.min(size, start + unitSize);
          var form = new FormData();
          form.append("file", file.slice(start, end));
          form.append("name", file.name);
          form.append("chunk", i); //当前是第几片（坑死我了）
          form.append("chunks", total); //总片数
          $.ajax({
            url: "/editor/upFile3.html",
            type: "POST",
            data: form,
            dataType: "json",
            xhr: function() {
              //用以显示上传进度
              var xhr = $.ajaxSettings.xhr();
              if (xhr.upload) {
                xhr.upload.addEventListener(
                  "progress",
                  function(e) {
                    // _self.list.uploadingProgress = parseInt((e.loaded+start)*100/size);
                  },
                  false
                );
              }
              return xhr;
            },
            async: true,
            processData: false,
            contentType: false,
            success: function(data) {
              i++;
              if (i < total) {
                chunkAjax(i);
              } else {
                _self.changeImg(data);
              }
            },
            error: function(data) {
              _self.changeImg(data);
            }
          });
        }
      }
      //重置input
      this.$refs.changImgForm.reset();
    },
    changeImg(data) {
      if (data.code != -1) {
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: data.message
        });
        return;
      }
      console.log(this.selectedItem);
      this.selectedItem.edit_data.url = data.src;
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    //调用圆角slide
    showRadiusSlide() {
      this.$store.commit("callModal");
      this.$store.state.editor.slide.data = [
        {
          title: "圆角",
          type: "imageRadius",
          max: 50,
          min: 0,
          val: this.selectedItem.edit_data.radius
        }
      ];
      this.$store.state.editor.slide.pos = { left: "270px" };
      this.$store.commit("callModal", { type: "slide", modalOver: false });
    },
    afterChangeHandle(data) {
      if (data.type == "imageRadius") {
        this.selectedItem.edit_data.radius = data.val;

        eventBus.$emit("elementChange", {
          type: "update",
          targets: [this.selectedItem],
          snap: data.snap
        });
      }
    }
  },
  components: { imageFilter, sizeBox },
  created() {
    eventBus.$on("afterChange", this.afterChangeHandle);
  },
  beforeDestroy() {
    eventBus.$off("afterChange", this.afterChangeHandle);
  }
};
</script>
<style lang="scss" scoped>
.image-tool {
  width: 306px;
  float: left;
  .ico-filter {
    display: inline-block;
    float: left;
    width: 30px;
    height: 30px;
    background: url(/assets/images/icon/ico-filter.png) no-repeat 3px
      50%;
  }
  .changeImg {
    width: 50px;
    label {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      text-align: center;
    }
  }
  input {
    width: 0;
    height: 0;
    visibility: hidden;
  }
}
</style>


// WEBPACK FOOTER //
// imageTool.vue?7110c8c7
