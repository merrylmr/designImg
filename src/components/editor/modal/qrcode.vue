<template>
	<transition name="fade-modal">
	<div class="code-modal modal" v-if="codeShow" @mousedown.stop="">
		<div class="close-code" @click="closeModal"></div>
		<div class="code-box" id="text">
			<!-- <qrcode :background="background" :size="size" :cls="qrCls" :value="qrText"></qrcode> -->
			<div id="code"></div>
		</div>
		<p>{{qrTip}}</p>
	</div>
	</transition>
</template>
<script>
import $ from "jquery";
// import Qrcode from 'v-qrcode'
export default {
  data() {
    return {
      // qrCls: 'qrcode',
      //     size: 245,
      //     background: '#fff'
    };
  },

  computed: {
    codeShow() {
      return this.$store.state.editor.modal["code"];
    },
    qrText() {
      return this.$store.state.editor.qrcodeText;
    },
    qrTip() {
      return this.$store.state.editor.qrcodeTip;
    }
  },
  // components: {Qrcode},
  methods: {
    closeModal() {
      var fx = this.$store.state.editor.modalInfo.fx;
      if (typeof fx == "function") {
        fx();
        this.$store.state.editor.modalInfo.fx = undefined;
      }
      this.$store.commit("callModal");
    },
    qrcode() {
      $("#code").qrcode({
        text: this.qrText,
        width: 250,
        height: 250,
        render: "canvas",
        typeNumber: 0,
        foreground: "#333"
      });
    }
  },
  watch: {
    codeShow: function(val) {
      if (val) {
        this.$nextTick(function() {
          require("../../../assets/js/jquery.qrcode.min.js");
          this.qrcode();
        });
      }
    }
  }
};
</script>
<style lang="scss">
$blue: #00a2eb;
.code-modal {
  width: 320px;
  height: 340px;
  margin-top: -155px;
  margin-left: -150px;
  background: #fff;
  text-align: center;
  border-radius: 5px;
  .close-code {
    width: 12px;
    height: 12px;
    background: url(/assets/images/close1.png) 0 0 no-repeat transparent;
    position: absolute;
    zoom: 1;
    top: 12px;
    right: 13px;
    z-index: 2;
    cursor: pointer;
    &:hover {
      background-position: 0 -12px;
    }
  }
  .code-box {
    display: inline-block;
    // .qrcode{margin-left: 22px;}
  }
  p {
    margin-top: 10px;
    text-align: center;
    color: #666;
    font-size: 14px;
    padding: 0 20px;
  }
}
</style>



// WEBPACK FOOTER //
// qrcode.vue?9c58fd98
