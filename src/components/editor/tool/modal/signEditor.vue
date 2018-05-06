<template>
  <div class="sign-editor" tabindex="1" @click.stop="">
      <!--标记编辑-->
      <div class="title">
          <p class="big">标记编辑</p>
          <p class="small">请告诉我这个元素是什么</p>
      </div>
      <!--内容-->
      <div class="content">
            <!--通用标签-->
            <div class="item">
                <!-- <div class="label">通用:</div> -->
                <div class="input">
                    <select :value="sign" @input="setSign">
                        <option v-for="item in defaultSign" :value="item.val">{{item.text}}</option>
                    </select>
                </div>
            </div>
            
            <!--<div class="item">
                <div class="label">自定义:</div>
                <div class="input">
                    <input type="text" placeholder="选填"/>
                </div>
            </div>
          
            <button class="clear-btn">删除标记</button> -->
      </div>
  </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import { mapGetters } from "vuex";
import $ from "jquery";
export default {
  data() {
    return {
      defaultSign: [
        { text: "无标记", val: "" },
        { text: "新年签-头像", val: "新年签-头像" },
        { text: "新年签-昵称", val: "新年签-昵称" },
        { text: "新年海报-祝福语", val: "新年海报-祝福语" },
        { text: "新年海报-名字", val: "新年海报-名字" }
      ]
    };
  },
  computed: {
    ...mapGetters(["selectedItem"]),
    sign() {
      if (
        this.selectedItem == null ||
        this.selectedItem.edit_config.sign == undefined
      ) {
        return "";
      } else {
        return this.selectedItem.edit_config.sign;
      }
    }
  },
  methods: {
    emitClose(e) {
      $(document).unbind("click", this.emitClose);
      this.$emit("close");
    },
    setSign() {
      let val = event.target.value;

      if (this.selectedItem != null) {
        this.selectedItem.edit_config.sign = val;
        eventBus.$emit("elementChange", {
          type: "update",
          targets: [this.selectedItem]
        });
      }
    }
  },
  mounted() {
    $(document).click(this.emitClose);
    eventBus.$on("closeModal", this.emitClose);
  }
};
</script>

<style lang="scss">
.sign-editor {
  position: absolute;
  left: 0;
  top: 40px;
  width: 200px;

  background-color: white;
  border-radius: 5px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  .title {
    background-color: #00a2eb;
    color: white;
    padding: 10px;
    .big {
      font-size: 16px;
    }
    .small {
      font-size: 12px;
      opacity: 0.6;
    }
  }
  .content {
    padding: 10px;
    .item {
      display: flex;
      margin-bottom: 3px;
      .label {
        width: 25%;
        text-align: right;
        margin-right: 3px;
        padding: 3px;
      }
      .input {
        flex: 1;
        select,
        input {
          width: 100%;
        }
      }
      input,
      select {
        border: 1px solid #e2e2e2;
        background-color: white;
        border-radius: 3px;
        padding: 3px;
        -webkit-appearance: none;
      }
    }
    .clear-btn {
      width: 100%;
      padding: 5px;
      background-color: #e74c3c;
      color: white;
      border-radius: 3px;
    }
  }
}
</style>



// WEBPACK FOOTER //
// signEditor.vue?004e36fb