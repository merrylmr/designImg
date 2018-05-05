<template>
    <div class="single-page-config-editor"  v-if="show" @mouseup="closeModal">
        <div class="setting-content">
            <component :is="getConfigComponent"></component>
        </div>
    </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import formCofig from "@/components/editor/interaction/config/form.vue";
import buttonCofig from "@/components/editor/interaction/config/button.vue";
import countdownConfig from "@/components/editor/interaction/config/countdown.vue";
import likeConfig from "@/components/editor/interaction/config/like.vue";
import voteConfig from "@/components/editor/interaction/config/vote.vue";
import slideConfig from "@/components/editor/interaction/config/slide.vue";
import videoConfig from "@/components/editor/interaction/config/video.vue";
export default {
  computed: {
    show() {
      return this.$store.state.docData.product == "jianye";
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    getConfigComponent() {
      if (this.selectedItem == null) {
        return;
      }
      if (this.selectedItem.type == "interaction") {
        switch (this.selectedItem.edit_data.module) {
          case "form":
            return formCofig;
          case "button":
            return buttonCofig;
          case "countdown":
            return countdownConfig;
          case "like":
            return likeConfig;
          case "vote":
            return voteConfig;
          case "slide":
            return slideConfig;
          case "video":
            return videoConfig;
        }
      } else {
        return;
      }
    }
  },
  methods: {
    closeModal() {
      eventBus.$emit("closeModal");
    }
  }
};
</script>
<style lang="scss" >
.single-page-config-editor {
  padding: 16px;

  transition: top 0.3s ease;
  .align-content {
    padding: 10px;
    text-align: center;
    button {
      i {
        font-size: 14px;
      }
      width: 32px;
      height: 32px;
      background-color: #e6e6e6;
      color: #808080;
      border-radius: 3px;
      padding: 7px;
      margin: 0 3px 0 3px;
      &:hover {
        background-color: #d3d3d3;
      }
    }
    .split {
      position: relative;
      margin: 8px;
      &::after {
        content: "";
        position: absolute;
        left: 0;
        width: 1px;
        top: -5px;
        bottom: -5px;
        border-left: 1px solid #e6e6e6;
      }
    }
  }
  .setting-content {
    // overflow-y: auto;
    width: 100%;
    height: 100%; // overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    &::-webkit-scrollbar-corner {
      background-color: #e4e4e4;
    }
    &::-webkit-scrollbar-thumb:vertical {
      background-color: #8b8b8b;
    }
    &::-webkit-scrollbar-thumb:horizontal {
      background-color: #8b8b8b;
    }
    /* UI组件 */
    .ui-text-input {
      display: flex;
      height: 32px;
      margin-top: 5px;

      .label {
        padding: 0 8px 0 0;
        color: #fff;
        height: 32px;
        line-height: 32px;
      }
      .text {
        flex: 1;

        input {
          width: 100%;
          height: 30px;
          margin-top: 1px;
          border: 1px solid #767b81;
          padding: 5px;
          background: #676c73;
          color: white;
          transition: all 0.2s;
          &:focus {
            border-color: #00a2eb;
            background: white;
            color: black;
          }
        }
      }
      padding-bottom: 5px;
    }
    .ui-radio-group {
      margin-top: 10px;
      .label {
        color: #fff;
      }
      .radio {
        padding-left: 60px;
        .item {
          position: relative;
          margin-bottom: 8px;
          input {
            opacity: 0;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
          }
          label {
            pointer-events: none;
            position: absolute;
            left: 4px;
            bottom: 4px;
            width: 8px;
            height: 8px;
            background: #00a2eb;
            border-radius: 100%;
            opacity: 0;
            transition: all 0.2s;
          }
          span:after {
            content: "";
            text-align: center;
            pointer-events: none;
            position: absolute;
            left: 0;
            bottom: 0;
            width: 16px;
            height: 16px;
            border: 1px solid #adadad;
            border-radius: 100%;
          }
          span {
            margin-left: 20px;
          }
          input:checked + label {
            opacity: 1;
          }
        }
      }
    }
    /* UI组件 */
  }
  .button-setting {
    padding: 10px;
  }
}
</style>



// WEBPACK FOOTER //
// singlePageConfigEditor.vue?262bc122