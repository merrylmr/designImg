<template>
	<div class="setting-box u-scroll">
    <div class="setting-title">简页设置</div>
     <div class="main-settting">
        <accordion title="单页设置">
            <div class="single-page-setting">
                <div class="box1">
                    <div class="thumb">
                        <div class="pic" @click="uploadThumb">
                          <img :src="thumbSrc"/>
                        </div>
                        <div class="text">修改封面图</div>
                    </div>
                    <div class="title">
                        <textarea v-model="singlePageTitle" maxlength="28" @change="onInputChange"></textarea>
                        <span class="word-number">{{singlePageTitle.length}}/24</span>
                    </div>
                </div>
                <div class="box2">
                    <div class="description">
                        <textarea rows="3" maxlength="42" v-model="singlePageSummary" @change="onInputChange"></textarea>
                        <span class="word-number">{{singlePageSummary.length}}/42</span>
                    </div>
                </div>
            </div>
        </accordion>
        <accordion title="广告设置">
          <div class="ad-setting">
            <!-- @click="adMode=item.value"-->
            <div class="item" v-for="item in adModeArr" @click="singlePageCloseAd=item.value">
             <div class="item-content">
                <span class="radio-ico">
                <input type="radio" :value="item.value" v-model="singlePageCloseAd"/>
                <label class="radio-point"></label>
                 <div class="white-bg"></div>
                <span class="label">{{item.name}}</span>
              </span>
             </div>
              <!--不显示广告 begin-->
              <div v-if="singlePageCloseAd=='hidden' && item.value=='hidden'" class="ad-hidden">
                <!--未购买 begin-->
                <div class="not-pay" v-if="!closeAd">
                  <div class="sub1">
                    <b>500</b><span style="vertical-align: middle;">简币</span>
                  </div>
                  <div class="sub2">
                    关闭当前简页广告
                  </div>
                  <div class="sub3">
                    <button class="pay-btn" @click="onPayCloseAd">立即支付</button>
                  </div>
                </div>
                <!--未购买 end-->

                <!--已购买 begin-->
                <div class="pay" v-if="closeAd">
                  <div class="icon">
                    <i class="tbzico ico-warning"></i>
                  </div>
                  <div class="tip">当前简页广告已隐藏</div>
                </div>
                <!--已购买 end-->
              </div>
              <!--不显示广告 end-->
            </div>
          </div>
        </accordion>
        <accordion title="背景音乐">
            <player/>
        </accordion>

    </div>
	</div>
</template>
<script>
import accordion from "@/components/editor/ui/accordion";
import common from "@/common/common.js";
import eventBus from "@/common/eventBus.js";
import player from "@/components/editor/interaction/config/player.vue";
export default {
  data() {
    return {
      adModeArr: [
        {
          name: "默认广告",
          value: "default"
        },
        {
          name: "不显示广告",
          value: "hidden"
        }
      ]
    };
  },
  components: {
    accordion,
    player
  },
  computed: {
    closeAd() {
      return this.$store.state.docData.closeAd;
    },
    singlePageConfig() {
      return this.$store.state.docData.edit_config.singlePageConfig;
    },
    singlePageCloseAd: {
      get: function() {
        return (
          this.$store.state.docData.edit_config.singlePageConfig.closeAd ||
          "default"
        );
      },
      set: function(v) {
        this.$store.state.docData.edit_config.singlePageConfig.closeAd = v;
        this.onInputChange();
      }
    },
    singlePageTitle: {
      get: function() {
        return this.$store.state.docData.title;
      },
      set: function(v) {
        let inputText = v.replace(/\n/g, "");
        this.$store.state.docData.edit_config.singlePageConfig.title = inputText;
        this.$store.state.docData.title = inputText;
      }
    },
    thumbSrc() {
      if (this.singlePageConfig.thumb == "") {
        return "/static/img/default_jianye_thumb.png";
      } else {
        return this.singlePageConfig.thumb;
      }
    },
    singlePageSummary: {
      get: function() {
        return this.singlePageConfig.summary;
      },
      set: function(v) {
        let inputText = v.replace(/\n/g, "");
        this.$store.state.docData.edit_config.singlePageConfig.summary = inputText;
      }
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },

  methods: {
    onPayCloseAd() {
      this.$http
        .post("/editorApi/member/remove-ad", {
          template_id: this.$store.state.docData.id
        })
        .then(result => {
          console.log("支付结果", result);
          if (result.body.msg == "简币不足请充值") {
            //不足
            this.$store.commit("callModal", {
              type: "alert",
              modalOver: true,
              cls: "danger",
              text: "简币不足,点击确定去充值吧~",
              fn: () => {
                window.open("/member/settings/3");
                this.$store.commit("callModal", {
                  type: "alert",
                  modalOver: true,
                  cls: "ok",
                  text: "请在新窗口完成支付,然后点击确定",
                  fn: () => {
                    this.onPayCloseAd();
                  }
                });
              }
            });
          } else if (result.body.msg == "OK") {
            this.$store.state.docData.closeAd = true;
            this.$store.commit("callModal", {
              type: "alert",
              modalOver: true,
              cls: "ok",
              text: "购买成功,广告已隐藏"
            });
          } else {
            this.$store.commit("callModal", {
              type: "alert",
              modalOver: true,
              cls: "danger",
              text: result.body.msg
            });
          }
        });
    },
    //所有input发生更改触发
    onInputChange(e) {
      eventBus.$emit("infoChange", {
        type: "singlePage",
        snap: false
      });
    },
    uploadThumb() {
      let self = this;
      common.uploadFile({
        url: "/editor/upFile3/source/24/target/editorForm.html",
        success: function(res) {
          console.log("文件上传成功", res);
          self.singlePageConfig.thumb = res.src;
          eventBus.$emit("infoChange", {
            type: "singlePage",
            snap: false
          });
        },
        error: function(res) {
          alert("文件上传失败(" + res.message + ")");
        }
      });
    }
  },
  created() {
    common.vue = this;
  }
};
</script>
<style lang="scss">
.setting-box {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  box-sizing: border-box;

  .main-settting {
    .single-page-setting {
      padding: 10px;
      textarea {
        width: 100%;
        height: 100%;
        resize: none;
        padding: 5px;
        font-size: 12px;

        border: 1px solid #767b81;
        background: #676c73;
        color: white;
      }
      .word-number {
        position: absolute;
        right: 5px;
        bottom: 5px;
        opacity: 0.2;
        font-size: 12px;
      }
      .box1 {
        display: flex;
        .thumb {
          cursor: pointer;
          width: 80px;
          height: 80px;
          position: relative;
          .pic {
            cursor: pointer;
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background: white;
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          .text {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 2px;
            text-align: center;
            pointer-events: none;
          }
        }
        .title {
          margin-left: 5px;
          flex: 1;
          height: 80px;

          position: relative;
        }
      }
      .box2 {
        margin-top: 5px;
        .description {
          position: relative;
        }
      }
    }
    .ad-setting {
      padding: 10px;
      .ad-hidden {
        width: 100%;
        height: 120px;
        background-image: url("/assets/images//ad-hidden-bg.png");
        text-align: center;
        .not-pay {
          color: white;
          font-size: 13px;
          .sub1 {
            padding-top: 18px;
            b {
              font-size: 20px;
              font-weight: 900;
              margin: 0 5px;
              vertical-align: middle;
            }
          }
          .sub2 {
            padding-top: 3px;
          }
          .sub3 {
            padding-top: 8px;
            .pay-btn {
              padding: 5px 10px;
              background-color: #00a2eb;
              color: white;
              border-radius: 3px;
              font-size: 14px;
            }
          }
        }
        .pay {
          text-align: center;
          font-size: 14px;
          padding-top: 26px;
          .icon {
            i {
              font-size: 32px;
            }
          }
          .tip {
            padding-top: 5px;
          }
        }
      }
      .item {
        .item-content {
          padding: 10px 5px;
          margin-bottom: 1px;
          background-color: #676c73;
          cursor: pointer;
          &:hover {
            background-color: #797d84;
          }
          .radio-ico {
            position: relative;

            .white-bg {
              position: absolute;
              left: 0;
              top: 1px;
              background: #fff;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              pointer-events: none;
            }
            label {
              position: absolute;
              left: 4px;
              top: 5px;
              background: #00a2eb;
              width: 8px;
              height: 8px;
              border-radius: 50%;

              pointer-events: none;
              opacity: 0;
              z-index: 5;
            }

            .label {
              padding-left: 20px;
              pointer-events: none;
            }
            input {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              z-index: 10;
              opacity: 0;
              cursor: pointer;
            }
            input:checked + label {
              opacity: 1;
            }
          }
          &.disable {
            pointer-events: none;
            .label,
            .white-bg {
              opacity: 0.5;
            }
          }
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// setting.vue?f8247e46
