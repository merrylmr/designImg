<template>
  <div class="psd-upload">
      <div class="content">
          <!--关闭按钮-->
          <div class="close-btn" @click="onCloseClick">
              <i class="tbzico ico-close1"/>
          </div>
          <!--上传状态-->
          <div class="upload-state">
              <!--待上传-->
              <div class="upload-ready" v-if="uploadProcess==0" @click="onUploadClick">
                  <img src="./../../../assets/images/upload.png"/>
              </div>
              <!--上传中-->
              <div class="uploading" v-if="uploadProcess>0">
                  <!--进度条-->
                  <div class="process-bar">
                      <div class="value-bar" :style="{width:uploadProcess+'%'}"></div>
                  </div>
                  <!--进度提示-->
                  <div class="value">{{uploadProcess}} %</div>
              </div>
          </div>
          <!--上传提示-->
          <div class="upload-tip">
              <div class="icon">
                  <i class="tbzico ico-warning"/>
              </div>
              <div class="text">
                  <span v-if="$store.state.docData && $store.state.docData.product=='jianye'">建议分辨率:72dpi，宽度：750px</span><br/>请将图层样式,混合模式图层与蒙版图层栅格化
              </div>
          </div>
      </div>
  </div>
</template>
<script>
import common from "@/common/common.js";
export default {
  data() {
    return {
      //上传进度
      uploadProcess: 0
    };
  },
  methods: {
    onCloseClick() {
      this.$emit("close");
    },
    onUploadClick() {
      common.uploadFile({
        url: "/editor/upFile3/source/25/target/editorForm.html",
        success: res => {
          console.log("文件上传成功", res);
          if (res.data == false) {
            alert("不支持的PSD文件,请尝试使用Photoshop CC 2017以下版本保存");
          } else {
            this.$emit("success", JSON.parse(res.data));
          }
        },
        error: res => {
          alert("上传失败,请检查网络");
          this.$emit("close");
        },
        process: val => {
          this.uploadProcess = parseInt(val * 100);
        }
      });
    }
  },
  created(){
        common.vue = this;
  }
};
</script>

<style lang="scss" scoped>
.psd-upload {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
  .content {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 330px;

    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 5px;
    .upload-state {
      height: 230px;
      text-align: center;
      position: relative;
      .upload-ready,
      .uploading {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 165px;
        height: 168px;
      }
      .upload-ready {
        cursor: pointer;
      }
      .uploading {
        background-color: #f1f1f1;
        .process-bar {
          background: #d8d8d8;
          width: 120px;
          height: 11px;
          margin: auto;
          margin-top: 73px;
          position: relative;
          .value-bar {
            position: absolute;
            left: 0;
            top: 0;
            width: 0%;
            height: 100%;
            background-color: #29c9ff;
          }
        }
        .value {
          margin-top: 8px;
          color: #a3a3a3;
        }
      }
    }
    .upload-tip {
      padding: 10px;
      border-radius: 3px;
      background-color: #f3f3f3;
      text-align: center;
      .icon {
        color: #ff9429;
        i {
          font-size: 20px;
        }
      }
      .text {
        margin-top: 3px;
        color: #7f7f7f;
      }
    }

    .close-btn {
      color: #fff;
      position: absolute;
      right: -35px;
      top: -5px;
      $size: 30px;
      width: $size;
      height: $size;
      line-height: $size;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 20px;
      }
      &:hover {
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// psdUpload.vue?8262b1ea