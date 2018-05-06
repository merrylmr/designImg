<!-- 排序 -->
<template>
	<div class="modal-mini layer-modal" v-show="layerShow" @mousedown.stop="">
		<p class="item1" @click="layer('up')"><i></i>上移<span>ctrl+]</span></p>
		<p class="item2" @click="layer('down')"><i></i>下移<span>ctrl+[</span></p>
		<p class="item3" @click="layer('top')"><i></i>置顶<span>shift+ctrl+]</span></p>
		<p class="item4" @click="layer('bottom')"><i></i>置底<span>shift+ctrl+[</span></p>
	</div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {};
  },
  computed: {
    layerShow() {
      return this.$store.state.editor.modal["layer"];
    }
  },
  methods: {
    layer(type) {
      console.log("发送一次");
      eventBus.$emit("layerChange", type);
    }
  }
};
</script>
<style lang="scss">
.layer-modal {
  padding: 6px;
  left: -35px;
  top: 39px;
  p {
    width: 170px;
    padding: 0 8px;
    line-height: 28px;
    font-size: 14px;
    color: #515151;
    cursor: pointer;
    position: relative;
    i {
      float: left;
      position: relative;
      top: 5px;
      margin-right: 8px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      background: url(/assets/images/icon/ico-layer.png) no-repeat 0
        0;
    }
    &.item2 i {
      background-position: -57px 0;
    }
    &.item3 i {
      background-position: -114px 0;
    }
    &.item4 i {
      background-position: -171px 0;
    }
    &:hover {
      background: #e7e7e7;
    }
    span {
      float: right;
      padding-right: 8px;
    }
  }
}
</style>


// WEBPACK FOOTER //
// layer.vue?264a9c2b
