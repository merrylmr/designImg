<template>
  <div class="sale-action" v-if="show" @mousedown.stop="">
      <span class="close" @click="onClose">×</span>
      <div class="top_half">
          <img src="../../../assets/images/coupon_ticket.png" alt="">
          <div class="text">下单印刷立享9.5折，限时优惠，等你来领！</div>
      </div>
      <div class="btn_box">
        <button @click="onCouponsClick">好的，去领券</button>
        <button @click="onPrintClick">不了，直接印刷</button>
      </div>
  </div>
</template>
<script>
export default {
    computed:{
        show() {
            return this.$store.state.editor.modal["saleAction"];
        },
    },
    methods:{
        /**
         * 领券
         */
        onCouponsClick(){
            window.open('/activity/coupon')
            // 关闭当前窗口
            this.$store.commit('callModal');
        },
        /**
         * 直接印刷
         */
        onPrintClick(){
            window.open(this.$store.state.editor.printBuyUrl);
            // 关闭当前窗口
            this.$store.commit('callModal');
        },
        onClose(){
            this.$store.commit('callModal');
        }
    }
}
</script>

<style lang="scss">
.sale-action{
    position: absolute;
    width: 472px;
    height: 304px;
    border-radius: 5px;
    overflow: hidden;
    left:50%;
    top:50%;
    transform:translate(-50%,-50%);
    z-index: 10000;
    background-color: #fff;
    text-align: center;
    .close{
        font-size: 18px;
        color: #fff;
        position: absolute;
        top: 6px;
        right: 10px;
        cursor: pointer;
    }
    .top_half{
        height: 230px;
        background-image: repeating-linear-gradient(135deg,#00a2eb,#00a2eb 15px,#1aabed 15px,#1aabed 35px);
        padding-top: 26px;
        .text{
            font-size: 16px;
            color: #fff;
            line-height: 58px;
        }
    }
    .btn_box{
        height: 74px;
        padding-top: 18px;
        background-color: #fff;
        button{
            width: 135px;
            height: 37px;
            line-height: 37px;
            display: inline-block;
            background-color: #15b2f9;
            margin: 0 38px;
            color: #fff;
            font-size: 16px;
            border-radius: 5px;
        }
    }
}
</style>



// WEBPACK FOOTER //
// saleAction.vue?40e4f6f7