<template>
    <div class="form-setting">
        <div class="setting-title">编辑表单</div>
        <accordion title="颜色设置" class="color-accordion">
            <div class="color-picker" @mouseup.stop="">
                <color-picker pos="left_panel" :color="getColor('text')" type="color" @onChange="setColor('text',arguments[0])"></color-picker>
                <color-picker pos="left_panel" :color="getColor('inputText')" type="color" @onChange="setColor('inputText',arguments[0])"></color-picker>
                <color-picker pos="left_panel" :color="getColor('textBg')" type="color" @onChange="setColor('textBg',arguments[0])"></color-picker>
                <color-picker pos="left_panel" :color="getColor('border')" type="color" @onChange="setColor('border',arguments[0])"></color-picker>
                <color-picker pos="left_panel"  :color="getColor('buttonBg')" type="color" @onChange="setColor('buttonBg',arguments[0])"></color-picker>
                <color-picker pos="left_panel" :color="getColor('buttonText')" type="color" @onChange="setColor('buttonText',arguments[0])"></color-picker>
                <div class="clear"></div>
            </div>
        </accordion>

        <accordion title="按钮设置">
            <div class="button-setting">
                <div class="ui-text-input">
                    <div class="label">按钮文字:</div>
                    <div class="text">
                        <input type="text" v-model="selectedItem.edit_data.data.submitText" @change="onInputChange"/>
                    </div>
                </div>
                <div class="ui-text-input">
                    <div class="label">按钮反馈:</div>
                    <div class="text">
                        <input type="text" v-model="selectedItem.edit_data.data.submitFeedback" @change="onInputChange"/>
                    </div>
                </div>
                <div class="ui-radio-group">
                    <div class="label">
                        提交设置:
                    </div>
                    <div class="radio">
                        <div class="item">
                            <input type="radio" value="unlimited" v-model="selectedItem.edit_data.data.submitType" @change="onInputChange"/>
                            <label></label>
                            <span>无限制提交</span>
                        </div>
                        <div class="item">
                            <input type="radio" value="once" v-model="selectedItem.edit_data.data.submitType" @change="onInputChange"/>
                            <label></label>
                            <span>仅允许提交一次</span>
                        </div>

                    </div>
                </div>
            </div>
        </accordion>
        <accordion title="填写项设置">
            <form-element-editor :listData="selectedItem.edit_data.data.list" />

        </accordion>


    </div>
</template>
<script>
import accordion from "@/components/editor/ui/accordion";

import colorPicker from "@/components/editor/modal/colorPicker";
import eventBus from "@/common/eventBus.js";
import formElementEditor from "@/components/editor/interaction/config/form/main.vue";
export default {
  components: {
    accordion,
    colorPicker,
    formElementEditor
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
    },
    getColor(type) {
      return this.selectedItem.edit_data.data.color[type];
    },
    setColor(type, val) {
      this.selectedItem.edit_data.data.color[type] = val;
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    }
  }
};
</script>
<style lang="scss">
.form-setting {
  position: relative;
  .clear {
    clear: both;
  }
  .color-accordion {
    .content {
      overflow: visible;
    }
    .color-picker {
      padding: 10px;
      height: 50px;
    }
  }
}
</style>
