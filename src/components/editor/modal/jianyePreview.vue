<template>
    <transition name="fade">
        <div class="jianye-preview" v-if="show" @mousedown.stop="">
            <div class="content">
                <!--手机预览图-->
                <div class="phone">
                    <!--网页预览-->
                    <transition name="fade2">
                      <div class="web-preview" v-show="previewMode=='browser'" @click="previewMode='weixin'">
                          <img class="header" src="/assets/images/jianye-web-preview-header.png"/>
                          <iframe class="page" :src="previewUrl"/>
                      </div>
                    </transition>
                    <!--微信预览-->
                     <transition name="fade2">
                      <div class="weixin-preview" v-show="previewMode=='weixin'" @click="previewMode='browser'">
                          <div class="msg-content">
                              <div class="left">
                                  <div class="title">{{singlePageConfig.title}}</div>
                                  <div class="summary">{{singlePageConfig.summary}}</div>
                              </div>
                              <div class="right">
                                  <img class="thumb" :src="singlePageConfig.thumb"/>
                              </div>
                          </div>
                      </div>
                    </transition>
                    <!--切换-->
                    <div class="switch">
                        <div :class="['point',(previewMode=='browser'?'active':'')]" @click="previewMode='weixin'"></div>
                        <div :class="['point',(previewMode=='weixin'?'active':'')]" @click="previewMode='browser'"></div>
                    </div>
                </div>
                <!--二维码预览-->
                <div class="share">
                    <!--二维码-->
                    <div class="qrcode-img">
                      <div class="tip">
                        <p>微信扫码</p>
                        <p>将连接分享到朋友圈</p>
                        <p>可获取后台统计数据</p>
                      </div>
                        <div id="preview-code"></div>
                    </div>
                    <!--下载到电脑和手机-->
                    <div class="download">
                      <a target="_blank" :href="'/editorApi/template/download?tpl_id='+tplId+'&type=jpg'">
                        <button class="item-btn">
                            <i class="tbzico ico-work"></i>
                          <span>下载图片到电脑</span>
                        </button>
                      </a>
                      <button class="item-btn" @click="toMobile">
                          <i class="tbzico ico-ePhone"></i>
                        <span>下载图片到���机</span>
                      </button>
                    </div>
                    <!--分享到社交网络-->
                    <div class="share-to-social">
                        <div class="title">热门分享</div>
                        <div class="icon">

                            <div class="item icon1" v-clipboard="previewUrl" title="复制链接" @success="onLinkCopySucces">
                                <i class="tbzico ico-eLink"></i>
                            </div>

                            <div class="item icon2" title="分享到新浪微博" @click="share('weibo')">
                                <i class="tbzico ico-share-weibo"></i>
                            </div>

                            <div class="item icon3" title="分享到QQ" @click="share('qq')">
                                <i class="tbzico ico-fenxiang"></i>
                            </div>

                            <div class="item icon4" title="分享到QQ空间" @click="share('qzone')">
                                <i class="tbzico ico-qqspace"></i>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
            <div class="close-btn" @click="$store.commit('callModal')">
                <i class="tbzico ico-close"></i>
            </div>
        </div>
  </transition>
</template>
<script>
import $ from "jquery";
import socket from "@/common/socket.js";
export default {
  data() {
    return {
      previewMode: "browser"
    };
  },
  computed: {
    show() {
      return this.$store.state.editor.modal["jianyePreview"];
    },
    tplId() {
      return this.$store.state.docData.id;
    },
    previewUrl() {
      return (
        "http://" +
        location.host.replace("www.", "m.") +
        "/template/preview/" +
        this.tplId +
        ".html"
      );
    },
    singlePageConfig() {
      return this.$store.state.docData.edit_config.singlePageConfig;
    }
  },
  watch: {
    show: function(val) {
      if (val) {
        this.$nextTick(function() {
          require("../../../assets/js/jquery.qrcode.min.js");
          this.qrcode();
        });
      }
    }
  },
  methods: {
    toMobile() {
      var _self = this;
      var params = {
        tpl_id: this.tplId,
        uid: this.$store.state.editor.uid,
        type: "jpg"
      };
      if (this.format != "pdf") {
        params.page_id = this.$store.state.docData.page[
          this.$store.state.docData.editor.nowPage
        ].id;
      }
      console.log("params", params);
      socket.editorEmit("templateGetDownloadQrcodeUrl", params, function(data) {
        _self.$store.state.editor.qrcodeText = data.data.url;
        _self.$store.state.editor.qrcodeTip = "请使用“扫一扫”下载";
        _self.$store.commit("callModal", { type: "code", modalOver: true });
      });
    },
    onPageLoad() {
      console.log(this.$refs["page-preview"].contentWindow.Window.document);
    },
    qrcode() {
      $("#preview-code").qrcode({
        text: this.previewUrl,
        width: 140,
        height: 140,
        render: "canvas",
        typeNumber: 0,
        foreground: "#333"
      });
    },
    createQrCode(text) {},
    share(type) {
      let shareUrl = "";
      switch (type) {
        case "weibo":
          shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(
            this.previewUrl
          )}&title=${encodeURIComponent(this.singlePageConfig.title)}`;
          break;
        case "qq":
          shareUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(
            this.previewUrl
          )}&title=${encodeURIComponent(
            this.singlePageConfig.title
          )}&desc=${encodeURIComponent(
            this.singlePageConfig.summary
          )}&summary=${encodeURIComponent(this.singlePageConfig.summary)}`;
          break;
        case "qzone":
          shareUrl = `http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(
            this.previewUrl
          )}&title=${encodeURIComponent(
            this.singlePageConfig.title
          )}&desc=${encodeURIComponent(
            this.singlePageConfig.summary
          )}&summary=${encodeURIComponent(this.singlePageConfig.summary)}`;
          break;
      }
      console.log("shareUrl->", shareUrl);
      window.open(shareUrl);
    },
    onLinkCopySucces() {
      alert("复制成功!");
    }
  }
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s;
}
.fade-enter,
.fade-leave-to {
  transform: scale(1.5);

  opacity: 0;
}
.fade2-enter-active,
.fade2-leave-active {
  transition: all 0.5s;
}
.fade2-enter,
.fade2-leave-to {
  transform: rotateY(90deg);
  opacity: 0;
}
.jianye-preview {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.95);

  .content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    height: 700px;

    .phone,
    .share {
      display: inline-block;
    }
    .phone {
      width: 400px;
      height: 100%;
      position: relative;
      background: url(/assets/images/iphone.png) 40px 30px no-repeat;
      .web-preview,
      .weixin-preview {
        position: absolute;
        left: 62px;
        right: 63px;
        bottom: 123px;
        border: none;
        top: 100px;
      }
      .web-preview {
        background: white;
        border: none;
        .header {
          width: 100%;
          cursor: pointer;
        }
        .page {
          border: none;
          height: 450px;
          width: 275px;
          margin-top: -3px;
        }
      }
      .weixin-preview {
        position: relative;
        width: 276px;
        height: 100%;
        background: url(/assets/images/jianye-web-preview-weixin.png)
          no-repeat;
        background-size: 100%;

        .msg-content {
          &,
          * {
            cursor: pointer;
          }
          position: absolute;
          left: 21px;
          top: 81px;
          width: 209px;

          height: 100px;

          box-sizing: border-box;
          padding: 13px;
          .left {
            display: inline-block;
            width: 130px;
            .title {
              margin-bottom: 2px;
              font-size: 14px;
              color: #161616;
              width: 100%;
              height: 20px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .summary {
              font-size: 12px;
              color: #898989;
              width: 100%;
              height: 50px;
              overflow: hidden;
            }
          }
          .right {
            display: inline-block;
            width: 45px;

            .thumb {
              margin-top: 24px;
              width: 50px;
              height: 50px;
              max-width: 50px;
              object-fit: cover;
            }
          }
        }
      }
      .switch {
        position: absolute;
        left: 160px;
        bottom: 5px;

        height: 13px;

        .point {
          cursor: pointer;
          width: 11px;
          height: 11px;
          border-radius: 100%;
          background-color: #00a0e9;
          display: inline-block;
          margin: 2px;
          transition: all 0.2s;
        }
        .active {
          background-color: #c5c5c5;
        }
      }
    }
    .share {
      width: 162px;
      height: 100%;
      float: right;
      .qrcode-img {
        position: relative;
        width: 162px;
        height: 258px;
        background: url(/assets/images/jianye-qrcode.png) no-repeat;
        margin-top: 100px;
        .tip {
          text-align: center;
          font-size: 14px;
          padding: 12px;
          color: #676767;
        }
        #preview-code {
          position: absolute;
          left: 10px;
          top: 105px;
          width: 140px;
          height: 140px;
        }
      }
      .download {
        margin-top: 40px;
        .item-btn {
          width: 162px;
          height: 40px;
          margin: 4px 0;
          font-size: 14px;
          cursor: pointer;
          text-align: center;
          color: #676767;
          background-color: #fff;
          border: 1px solid #e9e9e9;
          box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);

          * {
            cursor: pointer;
          }
          i {
            color: #9fa0a0;
            margin-right: 2px;
            top: 1px;
            position: relative;
          }
          &:active {
            opacity: 0.7;
          }
        }
      }
      .share-to-social {
        margin-top: 20px;
        text-align: center;
        margin-left: -10px;
        .title {
          color: #a1a1a1;
          font-size: 13px;
          padding: 10px;
        }
        .icon {
          .item {
            display: inline-block;
            width: 32px;
            height: 32px;
            line-height: 32px;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            margin: 2px;
            transition: all 0.3s;
            position: relative;
            &:hover {
              opacity: 0.7;
            }
            &:hover::before {
              opacity: 1;
              transform: scale(1);
            }
            &::before {
              pointer-events: none;
              content: "";
              position: absolute;
              left: 0;
              right: 0;
              top: 0;
              bottom: 0;
              border-radius: 50%;
              border: 2px solid red;
              transform: scale(1.5);
              transition: all 0.3s;
              opacity: 0;
            }
          }
          .icon1 {
            background-color: #59c4f1;
            &::before {
              border-color: #59c4f1;
            }
          }
          .icon2 {
            background-color: #ec643d;
            &::before {
              border-color: #ec643d;
            }
          }
          .icon3 {
            background-color: #1cacff;
            &::before {
              border-color: #1cacff;
            }
          }
          .icon4 {
            background-color: #ffcb3c;
            &::before {
              border-color: #ffcb3c;
            }
          }
        }
      }
    }
  }
  .close-btn {
    background: #00a2eb;
    $size: 38px;
    width: $size;
    height: $size;
    text-align: center;
    line-height: $size;
    color: white;
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
    &:hover {
      opacity: 0.7;
    }
  }
}
</style>



// WEBPACK FOOTER //
// jianyePreview.vue?2916da32
