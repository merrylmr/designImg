<template>
  <div class="shanghu-pay" v-if="show" @mousedown.stop="">
      <div class="pay-content">
          <div class="title">下载模板</div>
          <div class="grid">
              <div class="info">
                  <div class="item">模板分类:<span class="value">{{orderInfo.product}}</span></div>
                   <div class="item">模板编号:<span class="value">{{orderInfo.template_id}}</span></div>
                   <div class="item">模板价格:<span class="value">¥{{orderInfo.order_amount}}元</span></div>
              </div>
              <div class="pay-block">
                  <div class="tab-header">
                      <div :class="['item',tabIndex==0?'active':'']" @click="tabIndex=0">
                          <img src="/assets/images/alipay.png">
                          <span>支付宝支付</span>
                          </div>
                      <div :class="['item',tabIndex==1?'active':'']" @click="tabIndex=1">
                           <img src="/assets/images/wxpay.png">
                          <span>微信支付</span>
                      </div>
                  </div>
                  <div class="tab-content">
                      <!--支付宝支付-->
                      <div class="alipay" v-if="tabIndex==0">
                        <div class="pay-info">应付金额：<span class="price">{{orderInfo.order_amount}}</span> 元</div>
                        <a class="pay-btn" :href="'/pay/coop-download-alipay.html?order_sn='+orderInfo.order_sn" target="_blank">立即支付</a>
                      </div>
                      <!--weixin 支付-->
                      <div class="wxpay" v-else>
                        <div class="qrcode">
                          <qrcodeVue className="qrcode-img" size="130" :value="qrcodeSrc"/>
                          <img class="scan" src="/assets/images/scan.png">
                          <span class="tip">使用微信扫码支付</span>
                        </div>
                         <div class="pay-info">应付金额：<br><span class="price">{{orderInfo.order_amount}}</span> 元</div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="close-btn" @click="onCloseBtnClick"><i class="tbzico ico-close"></i>
      </div>

      </div>

  </div>
</template>
<script>
import qrcodeVue from "qrcode.vue";
export default {
  data() {
    return {
      // 当前选择的支付方式
      tabIndex: 0,
      timer: null,
      qrcodeSrc: "123"
    };
  },
  methods: {
    onCloseBtnClick() {
      this.$store.commit("callModal");
      //   this.$store.commit("callModal", { type: "shanghuPay" });
    }
  },
  components: { qrcodeVue },
  watch: {
    show(val) {
      if (val) {
        // 获取微信支付二维码
        this.$http
          .post("/editorApi/v1/pay/coop-download-weixin", {
            order_sn: this.orderInfo.order_sn
          })
          .then(res => {
            this.qrcodeSrc = res.body.data.url;
          });
        this.timer = setInterval(() => {
          // 查询支付状态
            this.$http
          .post("/editorApi/v1/pay/watch-coop-download-status", {
            buyType:1,
            order_sn: this.orderInfo.order_sn
          })
          .then(res => {
            if(res.body.error==0){
              // 支付成功，弹出下载
              clearInterval(this.timer);
               this.$store.commit('callModal')
              this.$store.commit('callModal',{'type':'download','modalOver':false})
            }
          });
        }, 1000);
      } else {
        clearInterval(this.timer);
      }
    }
  },
  computed: {
    show() {
      return this.$store.state.editor.modal["shanghuPay"];
    },
    orderInfo() {
      return this.$store.state.editor.coop_download_data;
    }
  }
};
</script>

<style lang="scss">
.shanghu-pay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  .pay-content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 420px;
    background-color: #fff;
    border-radius: 3px;
    padding: 25px;
    .title {
      font-size: 24px;
      color: #333333;
    }
    .grid {
      display: flex;
      margin-top: 25px;
      .info {
        flex: 1;
        color: #333333;
        font-size: 14px;
        .item {
          padding-left: 10px;
          padding-bottom: 20px;
          .value {
            padding-left: 10px;
            color: #666666;
          }
        }
      }
      .pay-block {
        flex: 1;
        background-color: #fff;
        height: 300px;
        border: 1px solid #cccccc;
        border-radius: 3px;
        overflow: hidden;
        .tab-header {
          display: flex;
          .item {
            flex: 1;
            text-align: center;
            height: 50px;
            line-height: 50px;
            background-color: #fafafa;
            color: #666666;
            font-size: 14px;
            border-left: 1px solid #cccccc;
            border-bottom: 1px solid #cccccc;
            cursor: pointer;
            * {
              cursor: pointer;
            }
            img {
              position: relative;
              top: 6px;
            }
            &.active {
              background: #fff;
              border-bottom: none;
            }
            &:first-child {
              border-left: none;
            }
          }
        }
        .tab-content{
            position: relative;

          .pay-info{
              font-size: 16px;
              color: #333333;
              .price{
                    font-size: 24px;
                color: #f75252;
              }
          }
          .alipay{
            text-align: center;
           padding: 40px;
            .pay-btn{
              background-color: #00a2eb;
              color:#fff;
              font-size:16px;
              padding:10px 40px;
              border-radius: 3px;
              line-height: 80px;
            }
          }
          .wxpay{
            padding: 10px;
            position: absolute;
            left:0;
            top:0;
            right:0;
            bottom: 0;
           .qrcode{
                position: absolute;
    left: 9px;
    top: 0;
    width: 50%;
              .qrcode-img{
                    position: absolute;
                    left: 18px;
                    top: 50px;
              }
              .scan{
                    position: absolute;
                    left: 10px;
                    top: 41px;
              }
              .tip{
                    position: absolute;
                    left: 27px;
                    top: 196px;
                    font-size: 14px;
                    color: #464646;
              }
           }
           .pay-info{
            position: absolute;
    left: 190px;
    top: 95px;
    width: 50%;
           }
          }
        }
      }
    }
  }
  .close-btn {
    position: absolute;
    $size: 25px;
    right: -($size/2);
    top: -($size/2);
    width: $size;
    height: $size;
    text-align: center;
    line-height: $size;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.7);
    i {
      font-size: 14px;
    }
    &:hover {
      opacity: 0.7;
    }
  }
}
</style>



// WEBPACK FOOTER //
// shanghuPay.vue?078c908a
