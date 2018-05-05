<template>
  <div class="interaction-align-tool">
      	<!-- 左对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gl"  @click="handleGroupAlign('left')"></span>
		<!-- 水平居中对齐 -->
		<span class="tool-text tool-ico galign-ico ico-ghc" @click="handleGroupAlign('center')"></span>
		<!-- 右对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gr"@click="handleGroupAlign('right')"></span>
		<div class="split" ></div>
		<!-- 顶对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gt"  @click="handleGroupAlign('top')"></span>
		<!-- 垂直居中对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gvc"  @click="handleGroupAlign('v_center')"></span>
		<!-- 底对齐 -->
		<span class="tool-text tool-ico galign-ico ico-gb" @click="handleGroupAlign('bottom')"></span>

  </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
export default {
  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    //获取舞台宽高(真实宽高,没有经过zoom计算)
    getStageSize() {
      if (this.$store.state.docData.edit_config.unit == "px") {
        return {
          width: this.$store.state.docData.edit_config.width,
          height: this.$store.state.docData.edit_config.height
        };
      } else if (this.$store.state.docData.edit_config.unit == "mm") {
        return {
          width:
            this.$store.state.docData.edit_config.width *
            this.$store.state.docData.edit_config.dpi /
            25.4,
          height:
            this.$store.state.docData.edit_config.height *
            this.$store.state.docData.edit_config.dpi /
            25.4
        };
      }
    }
  },
  methods: {
    handleGroupAlign(align) {
      switch (align) {
        case "left":
          //左对齐
          this.selectedItem.edit_config.left = 0;
          break;
        case "center":
          //居中对齐
          this.selectedItem.edit_config.left =
            this.getStageSize.width / 2 -
            this.selectedItem.edit_config.width / 2;
          break;
        case "right":
          //居右对齐
          this.selectedItem.edit_config.left =
            this.getStageSize.width - this.selectedItem.edit_config.width;
          break;
        case "top":
          //顶部对齐
          this.selectedItem.edit_config.top = 0;
          break;
        case "v_center":
          //垂直居中
          this.selectedItem.edit_config.top =
            this.getStageSize.height / 2 -
            this.selectedItem.edit_config.height / 2;

          break;
        case "bottom":
          //底部对齐
          this.selectedItem.edit_config.top =
            this.getStageSize.height - this.selectedItem.edit_config.height;
          break;
      }
    }
  }
};
</script>



// WEBPACK FOOTER //
// interactionAlignTool.vue?677c21d8