<template>
  <div class="video-setting">
      <div class="setting-title">编辑视频</div>
      <accordion title="视频通用代码">
          <div class="code-item">
            <textarea rows="4" placeholder="在这里粘贴视频通用代码" v-model="selectedItem.edit_data.data.content" @input="onInputChange"></textarea>
             <div class="tip">
                <a href="#" target="_blank">如何获取通用代码?</a>
            </div>
          </div>
         
      </accordion>
  </div>
</template>
<script>
import common from "@/common/common.js";
import eventBus from "@/common/eventBus.js";
import accordion from "@/components/editor/ui/accordion";
export default {
  components: {
    accordion
  },
  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },
  methods: {
    //所有input发生更改触发
    onInputChange(e) {
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    }
  }
};
</script>

<style lang="scss">
.video-setting {
  .code-item {
    padding: 10px;
  }
  .tip {
    text-align: right;
    padding-top: 5px;
    a {
      color: #00a2eb;
      &:hover {
        opacity: 0.5;
      }
    }
  }
  textarea {
    width: 100%;
    height: 100%;
    resize: none;
    padding: 5px;
    font-size: 12px;

    border: 1px solid #767b81;
    background: #676c73;
    color: white;

    &::-webkit-input-placeholder {
      /* WebKit browsers */
      color: #b1b4b9;
    }
  }
}
</style>




// WEBPACK FOOTER //
// video.vue?83c0a368