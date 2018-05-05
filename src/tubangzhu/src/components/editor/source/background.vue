<template>
	<div class="background-box u-scroll" @scroll="scroll" ref="bgBox" @click="closeModal">
		<p class="title">背景色</p>
		<div class="color-modal" @click.stop="">
			<colorPicker :color="getBgcolor" type="background" posMode="absolute" @onChange="setBgcolor"  />
		</div>

		<p class="title bgimg-title">背景图</p>
		<div class="bgimg-box">
			<!-- 列表 -->
			<div class="bg-list">
				<ul>
					<li class="diybg">
						<!-- 待上传 -->
						<form ref="bgForm">
							<input type="file" @change="uploadBgFile" id="bgfile" ref="bgfile">
							<label for="bgfile" class="upload-wrap" v-show="!userImg.uploading&&!userImg.uploaded">自定义</label>
						</form>
						<!-- 上传中 -->
						<div class="uploading-wrap" v-show="userImg.uploading">
							<p>{{userImg.uploadingProgress}}%</p>
							<span :style="'width:'+userImg.uploadingProgress+'%'"></span>
						</div>
						<!-- 上传完成 -->
						<div :class="['uploaded-wrap',{selected:oldId==-1} ]" v-show="userImg.uploaded" @click="changeBgImg('background',userImg.file.src,userImg.file)" :style="'background:url('+getUserImg+') 50% 50% no-repeat #34393f;'">
							<label for="bgfile" class="uploaded-edit" @click.stop="">修改</label>
						</div>
					</li>
					<li v-for="(item, index) in bgImg.data" @click="changeBgImg(item.type,item.url,item)" :class="{selected:oldId==item.id}" :style="{background:'url('+item.url+') 50% 50% no-repeat'}">
					</li>
				</ul>
				<div class="loading" v-show="bgImg.request">
					<div class="rect rect1"></div>
					<div class="rect rect2"></div>
					<div class="rect rect3"></div>
					<div class="rect rect4"></div>
					<div class="rect rect5"></div>
				</div>
				<div class="underline" v-show="bgImg.isfull">就这么多了</div>
			</div>
		</div>
		<!-- 置底用于瀑布流判断 -->
		<div ref="boxBottom"></div>
	</div>
</template>
<script>
import $ from "jquery";
import colorPicker from "@/components/editor/modal/colorPicker";
import Dispatch from "@/common/dispatch.js";
import Waterfall from "vue-waterfall/lib/waterfall";
import WaterfallSlot from "vue-waterfall/lib/waterfall-slot";
import EventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      userImg: {
        uploaded: false,
        uploading: false,
        uploadingProgress: 0,
        file: {
          src: ""
        }
      },
      bgImg: {
        data: [],
        page: 2,
        isfull: false, //列表是否加载完毕
        request: false //是否请求数据中
      }
    };
  },
  components: { colorPicker, Waterfall, WaterfallSlot },
  methods: {
    setBgcolor(color) {
      var index = this.$store.state.docData.editor.nowPage;

      var pageItem = this.$store.state.docData.page[index];

      this.$store.state.docData.page[index].edit_config.backgroundColor = color;

      //删除当前背景
      for (var i in this.$store.state.docData.page[index].data) {
        var item = this.$store.state.docData.page[index].data[i];
        if (
          item.id ==
          this.$store.state.docData.page[index].edit_config.backgroundID
        ) {
          EventBus.$emit("elementChange", {
            type: "remove",
            targets: [this.$store.state.docData.page[index].data[i]],
            step: false
          });
          this.$store.state.docData.page[index].data.splice(i, 1);
          break;
        }
      }
      this.$store.state.docData.page[index].edit_config.backgroundID = "";

      //取消选择状态
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);

      EventBus.$emit("pageChange", {
        type: "update",
        targets: [pageItem]
      });
    },
    changeBgImg(type, url, item) {
      EventBus.$emit("addElement", {
        type: type,
        url: url,
        item: item
      });
    },
    scroll() {
      if (this.bgImg.isfull || this.bgImg.request) {
        return;
      } //加载完毕或请求中，返回
      var _self = this;
      var bottomHeight = this.$refs.boxBottom.offsetTop,
        scrollTop = event.target.scrollTop,
        boxHeight = this.$refs.bgBox.offsetHeight;
      if (bottomHeight - boxHeight - scrollTop < 30) {
        //请求开示
        this.bgImg.request = true;
        Dispatch.getBgList(this.bgImg.page, function(data) {
          // 请求结束
          _self.bgImg.request = false;
          _self.bgImg.page++;
          if (data.length == 0) {
            _self.bgImg.isfull = true;
            return;
          }
          var data = _self.bgImg.data.concat(data);
          _self.bgImg.data = data;
        });
      }
    },
    closeModal(e) {
      EventBus.$emit("closeModal");
    },
    uploadBgFile() {
      var _self = this;
      var file = this.$refs.bgfile.files[0];
      var size = file.size;
      this.$refs.bgForm.reset();
      if (
        this.$store.state.editor.loginMode != "c_logged" &&
        this.$store.state.editor.loginMode != "logged"
      ) {
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: "请登录后上传",
        });
        return;
      }
      //文件类型检查
      if (!/(png|jpg|jpeg|svg\+xml)$/i.test(file.type)) {
        this.initUploadFile({
          code: 0,
          message: "请选择图片文件！"
        });
        return;
      }
      //超出大小警告提示
      if (size > 20 * 1024 * 1024) {
        this.initUploadFile({
          code: 0,
          message: "请选择小于20M的图片重新上传!"
        });
        return;
      }
      this.userImg.uploading = true;
      this.userImg.uploaded = false;
      //小文件直接上传1m
      if (size < 1 * 1024 * 1024) {
        var form = new FormData();
        form.append("file", file);
        form.append("name", file.name);
        $.ajax({
          url: "/editor/upFile3/type/bg.html",
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
                  _self.userImg.uploadingProgress = parseInt(
                    e.loaded * 100 / size
                  );
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
            _self.initUploadFile(data);
          }
        });
      } else {
        var unitSize = 1 * 1024 * 1024,
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
            url: "/editor/upFile3/type/bg.html",
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
                    _self.userImg.uploadingProgress = parseInt(
                      (e.loaded + start) * 100 / size
                    );
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
                _self.initUploadFile(data);
              }
            }
          });
        }
      }
    },
    initUploadFile(data) {
      var _self = this;
      if (data.code != -1) {
        _self.userImg.uploading = false;
        _self.userImg.uploaded = false;
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: data.message
        });
      } else {
        var temp = new Image();
        temp.onload = function() {
          _self.userImg.file.width = temp.width;
          _self.userImg.file.height = temp.height;
          _self.userImg.file.src = data.src;
          _self.userImg.file.id = -1;
          _self.userImg.uploading = false;
          _self.userImg.uploaded = true;
          //通知vuex
          _self.nowPage.edit_config.customBackgroundUrl = data.src;
          //EventBus.$emit('stageChange','background')

          //及时修改页面背景图
          _self.changeBgImg("background", data.src, _self.userImg.file);
        };
        temp.src = data.src;
      }
    }
  },
  computed: {
    nowPage() {
      return this.$store.state.docData.page[
        this.$store.state.docData.editor.nowPage
      ];
    },
    getBgcolor() {
      var index = this.$store.state.docData.editor.nowPage;
      if (this.$store.state.docData.page[index] != undefined) {
        return this.$store.state.docData.page[index].edit_config
          .backgroundColor;
      } else {
        return "#000000";
      }
    },
    //获取应用的背景id
    oldId() {
      var nowPage = this.nowPage;
      var bgId = nowPage.edit_config.backgroundID;
      var oldId;
      if (bgId == "") {
        //无背景图被引用
        oldId = 0;
      } else {
        oldId = -1;
        for (var i = 0; i < nowPage.data.length; i++) {
          if (nowPage.data[i].id == bgId) {
            oldId = nowPage.data[i].edit_data.oldID;
            break;
          }
        }
      }
      return oldId;
    },
    //初始化用户自定义背景
    getUserImg() {
      var _self = this;
      var userImgUrl = this.nowPage.edit_config.customBackgroundUrl;
      if (userImgUrl != "") {
        var temp = new Image();
        temp.onload = function() {
          _self.userImg.file.width = temp.width;
          _self.userImg.file.height = temp.height;
          _self.userImg.file.src = userImgUrl;
          _self.userImg.file.id = -1;
          _self.userImg.uploading = false;
          _self.userImg.uploaded = true;
        };
        temp.src = userImgUrl;
      } else {
        this.userImg.uploaded = false;
        this.userImg.uploading = false;
        this.userImg.file = {};
      }
      return userImgUrl;
    }
  },
  created() {
    var _self = this;
    Dispatch.getBgList(1, function(data) {
      _self.bgImg.data = data;
    });
  }
};
</script>
<style lang="scss">
$blue: #00a2eb;
.background-box {
  height: 100%;
  overflow-y: auto;
  padding-top: 20px;
  padding-left: 23px;
  overflow-x: visible;
  .title {
    font-size: 14px;
    color: #c5c5c5;
    &.bgimg-title {
      margin-top: 60px;
    }
  }
  .color-modal {
    padding-top: 12px;
  }
  .bgimg-box {
    input {
      width: 1px;
      height: 1px;
      margin-right: -1px;
      visibility: hidden;
    }
    .upload-wrap {
      position: relative;
      overflow: hidden;
      display: block;
      width: 263px;
      height: 140px;
      padding-top: 90px;
      font-size: 14px;
      color: #71757a;
      text-align: center;
      cursor: pointer;
      z-index: 2;
      border-radius: 6px;
    } //瀑布流
    .bg-list {
      padding-top: 15px;
      .underline {
        padding: 30px;
        color: #dadada;
        text-align: center;
      }
      .loading {
        width: 80px;
        height: 40px;
        margin: 10px auto;
        text-align: center;
        .rect {
          animation: loading 1.2s infinite ease-in-out;
        }
        .rect {
          display: inline-block;
          width: 6px;
          height: 100%;
          background-color: $blue;
          &.rect1 {
            animation-delay: 0;
          }
          &.rect2 {
            animation-delay: 0.1s;
          }
          &.rect3 {
            animation-delay: 0.2s;
          }
          &.rect4 {
            animation-delay: 0.3s;
          }
          &.rect5 {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }
  .bg-list {
    ul {
      overflow: hidden;
      li {
        width: 82px;
        height: 82px;
        float: left;
        background-size: cover !important;
        border-radius: 6px;
        margin: 0 8px 8px 0;
        cursor: pointer;
        position: relative;
        &:after {
          content: "";
          position: absolute;
          z-index: 3;
          bottom: 10px;
          right: 10px;
          width: 28px;
          height: 28px;
          background: url(../../../assets/images/icon/ico-selected.png)
            no-repeat 50% 50% rgba(0, 0, 0, 0.67);
          border-radius: 50%;
          display: none;
        }
        &.selected:after {
          display: block;
        }
        &.diybg {
          input {
            position: absolute;
          }
          .upload-wrap {
            padding-top: 46px;
            width: 82px;
            height: 82px;
            border: 1px dashed #7a7a7a;
            background: url(../../../assets/images/icon/ico-add.png) 50% 30%
              no-repeat #32373e;
            &:hover {
              background: url(../../../assets/images/icon/ico-add2.png) 50% 30%
                no-repeat #32373e;
              color: #b7b7b7;
            }
          }
          .uploading-wrap {
            position: relative;
            overflow: hidden;
            display: block;
            width: 82px;
            height: 82px;
            padding-top: 20px;
            background: #34393f;
            border: 1px dashed #7b7b7b;
            font-size: 14px;
            color: #72767b;
            text-align: center;
            border-radius: 5px;
            z-index: 2;
            span {
              display: block;
              height: 10px;
              background: $blue;
              margin-top: 10px;
            }
          }
          .uploaded-wrap {
            position: relative;
            border-radius: 6px;
            overflow: hidden;
            display: block;
            width: 82px;
            height: 82px;
            background: #34393f;
            font-size: 14px;
            color: #72767b;
            text-align: center;
            z-index: 2;
            cursor: pointer;
            background-size: cover !important;
            &:after {
              content: "";
              position: absolute;
              z-index: 3;
              bottom: 10px;
              right: 10px;
              width: 28px;
              height: 28px;
              background: url(../../../assets/images/icon/ico-selected.png)
                no-repeat 50% 50% rgba(0, 0, 0, 0.67);
              border-radius: 50%;
              display: none;
            }
            .uploaded-edit {
              display: none;
              position: absolute;
              cursor: pointer;
              font-size: 12px;
              z-index: 3;
              top: 5px;
              left: 5px;
              width: 36px;
              line-height: 20px;
              height: 20px;
              color: #fff;
              text-align: center;
              background: rgba(0, 0, 0, 0.67);
              border-radius: 3px;
            }
            &.selected:after {
              display: block;
            }
            &:hover {
              .uploaded-edit {
                display: block;
              }
            }
          }
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// background.vue?51e5a6be