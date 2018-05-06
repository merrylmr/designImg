<template>
	<div class="upload-box u-scroll">
		<span class="tip">支持jpg、png、svg图片，不超过20M</span>
		<form ref="uploadForm">
			<input
				type="file"
				@change="initUpload"
				id="file"
				ref="file"
				multiple="multiple"
			>
	<span v-if="showPsdUpload" class="psd-upload" @click="onUploadPsdClick" :style="{background:color.bgColor,color:color.fontColor}">上传Photoshop文档</span>
			<label for="file" :style="{background:color.bgColor,color:color.fontColor}">从电脑上选择图片</label>
			<span class="phone-upload" @click="getUploadUrl" :style="{background:color.bgColor,color:color.fontColor}">手机上传</span>
  	</form>
		<div class="upload-list" v-if="list.init">
			<waterfall
					:line-gap="88"
					:watch="list.data"
					align="left">
					<!-- each component is wrapped by a waterfall slot -->
					<waterfall-slot
						v-for="(item, index) in list.data"
						:width="item.owidth"
						:height="item.oheight"
						:key="index"
						:order="index"
						:class="{'temp':item.type=='temp'}"
					>
					 <a href="javascript:;"
						draggable="true"
						@click="addElement(item.type,item.url,item)"
						@dragstart="handleDragstart(item.type,item.url,item)"
					 >
						<img :src="item.thumb" alt="" :width="item.owidth">
					 </a>
					 <span class="del" @click="delUploadFile(index,item.id)"><i></i></span>
					 <p class="progressbar">
					 	<span :style="{width:list.uploadingProgress+'%'}"></span>
					 </p>
					</waterfall-slot>
				</waterfall>
		</div>
	</div>
</template>
<script>
import $ from "jquery";
import common from "@/common/common.js";
import socket from "@/common/socket.js";
import EventBus from "@/common/eventBus.js";
import Dispatch from "@/common/dispatch.js";
import Waterfall from "vue-waterfall/lib/waterfall";
import WaterfallSlot from "vue-waterfall/lib/waterfall-slot";
export default {
  data() {
    return {
      list: {
        data: [],
        uploadingProgress: 0,
        init: false
      },
      uploading: false,
      temp: {
        owidth: 87,
        oheight: 40,
        type: "temp",
        url: false
      },
      uploadUrl: "/tbz/uploadFile.html",
      multiFile: {
        length: 0, //文件总数
        index: 0 //当前上传文件
      }
    };
  },
  components: { Waterfall, WaterfallSlot },
  computed: {
    uploadPush() {
      return this.$store.state.editor.uploadPush;
    },
    color() {
      return this.$store.state.editor.color;
    },
    showPsdUpload(){
      return this.$store.state.editor.coorpId>0 && this.$store.state.editor.tpl_mode==="1";
    }
  },
  methods: {
    onUploadPsdClick(){
      EventBus.$emit("uploadPsd");
    },
    getUploadUrl() {
      var _self = this;
      $.ajax({
        type: "GET",
        dataType: "json",
        url: "/tbz/getMobileUploadUrl.html",
        success: function(data) {
          _self.callCode(data);
        }
      });
    },
    addElement(type, url, item) {
      console.log(type, url, item, "upload");
      EventBus.$emit("addElement", {
        type: type,
        url: url,
        item: item
      });
    },
    callCode(data) {
      var _self = this;
      if (data.status == "noLogin") {
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: data.info,
        });
        return;
      }
      this.$store.state.editor.qrcodeText = data.url;
      this.$store.state.editor.qrcodeTip = "用微信“扫一扫”获取手机相册图片";
      // this.$store.state.editor.modalInfo.fx = function(){
      // 	Dispatch.getUploadedFile(function(data){
      // 		if(data.length==0){return;}
      // 		else{
      // 			//剔除错误数据
      // 			var tempArr = [];
      // 			for (var i = 0; i < data.length; i++) {
      // 				if(data[i].owidth!=undefined){
      // 					tempArr.push(data[i])
      // 				}
      // 			};
      // 			_self.list.data = tempArr;
      // 		}
      // 	})
      // }
      this.$store.commit("callModal", { type: "code", modalOver: true });
    },
    handleDragstart(type, url, item) {
      this.$store.state.editor.dragEvent.type = type;
      this.$store.state.editor.dragEvent.url = url;
      this.$store.state.editor.dragEvent.item = item;
      //预加载
      if (item.type == "image") {
        if (item.width > 800 || item.height > 800) {
          item.imgTemp = new Image();
          item.imgTemp.src = common.getImageURL(item.url, 800);
        } else {
          item.imgTemp = new Image();
          item.imgTemp.src = item.url;
        }
      }
    },
    delUploadFile(index, id) {
      var url = "/member/delFile/id/" + id + ".html";
      this.$http.post(url).then(function(data) {
        if (data.data.status == "y") {
          this.list.data.splice(index, 1);
        } else {
          console.log("删除图片失败", data.data);
        }
      });
    },
    onprogress(e) {
      console.log(e.loaded);
    },
    initUpload() {
      var _self = this;
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
      //超出大小警告
      var isImg = true,
        tooBig = false;
      [].map.call(this.$refs.file.files, (item, index) => {
        /(png|jpg|jpeg|svg\+xml)$/i.test(item.type) || (isImg = false);
        item.size > 20 * 1024 * 1024 && (tooBig = true);
      });
      if (!isImg) {
        this.$store.commit("callModal", {
          type: "alert",
          cls: "danger",
          text: "请上传jpg,png,svg格式图片文件",
          modalOver: true
        });
        return;
      }
      if (tooBig) {
        this.$store.commit("callModal", {
          type: "alert",
          cls: "danger",
          text: "请选择小于20M的图片重新上传",
          modalOver: true
        });
        return;
      }
      this.list.init = true;
      this.multiFile.length = this.$refs.file.files.length;
      this.multiFile.index = 0;
      this.uploadFile();
    },
    uploadFile() {
      if (this.multiFile.index < this.multiFile.length) {
        this.uploading = true;
        var _self = this;
        var file = this.$refs.file.files[this.multiFile.index];
        var size = file.size;

        this.uploading = true;
        // 小文件直接上传1M
        if (size < 1 * 1024 * 1024) {
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
                    _self.list.uploadingProgress = parseInt(
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
            },
            error: function(data) {
              _self.initUploadFile(data);
            }
          });
        } else {
          var unitSize = 1 * 1024 * 1024,
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
                      _self.list.uploadingProgress = parseInt(
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
              },
              error: function(data) {
                _self.initUploadFile(data);
              }
            });
          }
        }
      } else {
        this.$refs.uploadForm.reset();
      }
    },
    initUploadFile(data) {
      this.uploading = false;
      var _self = this;
      if (data.code != -1) {
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: data.message
        });
        return;
      }
      var loadedData = {};
      var img = new Image();
      img.onload = function() {
        loadedData.owidth = 84;
        loadedData.width = data.owidth;
        loadedData.height = data.oheight;
        loadedData.oheight = img.height * 84 / img.width + 4;
        if (loadedData.oheight < 20) {
          loadedData.oheight = 20;
        }
        loadedData.thumb = data.thumb;
        loadedData.id = data.id;
        _self.list.data.unshift(loadedData);
        if (_self.list.data.length == 1) {
          _self.list.init = true;
        }
        //继续上传
        _self.multiFile.index++;
        _self.uploadFile();
      };
      img.src = data.thumb;
      loadedData.url = data.src;
      if (/.svg$/i.test(data.name)) {
        loadedData.type = "svg";
      } else {
        loadedData.type = "image";
      }
    }
  },
  watch: {
    uploading: function(newval) {
      if (newval) {
        this.list.data.unshift(this.temp);
      } else {
        this.list.data.shift();
      }
    },
    uploadPush: function(val) {
      if (val) {
        this.initUploadFile(val);
      }
    }
  },
  created() {
    var _self = this;
    Dispatch.getUploadedFile(function(data) {
      //console.log('initdata',data)
      if (data.length == 0) {
        return;
      } else {
        //剔除错误数据
        var tempArr = [];
        for (var i = 0; i < data.length; i++) {
          if (data[i].owidth != undefined) {
            tempArr.push(data[i]);
          }
        }
        var newdata = _self.list.data.concat(tempArr);
        _self.list.data = newdata;
        _self.list.init = true;
      }
    });
  }
};
</script>
<style lang="scss">
.upload-box {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-top: 20px;
  padding-left: 23px;
  overflow-x: hidden;
  .tip {
    color: #a6a7a9;
    padding-top: 5px;
    text-align: center;
    display: inline-block;
    width: 263px;
  }
  input {
    width: 0px;
    height: 0px;
    visibility: hidden;
  }
  form {
    overflow: hidden;
    width: 263px;
  }
  label {
    float: left;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    background-color: #00aeee;
    font-size: 14px;
    color: #fff;
    text-align: center;
    border-radius: 5px;
    width: 171px;
  }
  .phone-upload {
    float: right;
    width: 87px;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    background-color: #00aeee;
    font-size: 14px;
    color: #fff;
    text-align: center;
    border-radius: 5px;
    cursor: pointer;
  }
    .psd-upload {
    float: left;
    width: 100%;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    background-color: #00aeee;
    font-size: 14px;
    color: #fff;
    text-align: center;
    border-radius: 5px;
    cursor: pointer;
  }
  .upload {
    display: block;
    width: 263px;
    height: 40px;
    line-height: 40px;
    margin-top: 10px;
    position: relative;
    overflow: hidden;
    background-color: #00aeee;
    font-size: 14px;
    color: #fff;
    text-align: center;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: #0097e9;
    }
  }
  .upload-list {
    padding-top: 15px;
    .vue-waterfall-slot {
      &:hover .del {
        display: block;
      }
      .progressbar {
        display: none;
      }
      &.temp {
        a {
          display: none;
        }
        .progressbar {
          display: block;
          position: absolute;
          top: 10px;
          left: 0;
          height: 8px;
          width: 90%;
          background: #e9e9e9;
          span {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            background: #00a2eb;
            height: 8px;
          }
        }
      }
    }
    .del {
      position: absolute;
      zoom: 1;
      width: 20px;
      height: 20px;
      top: 0;
      right: 4px;
      border-radius: 3px;
      background-color: rgba(0, 0, 0, 0.5);
      cursor: pointer;
      display: none;
      i {
        float: left;
        display: inline;
        width: 10px;
        height: 9px;
        background: url(/assets/images/close.png) 0 0 no-repeat
          transparent;
        margin-top: 5px;
        margin-left: 5px;
      }
      &:hover i {
        background-position: -10px 0;
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// upload.vue?16501ac0
