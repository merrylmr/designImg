<template>
  <div class="button-component-setting">
    <div class="setting-title">编辑按钮</div>
    <!--按钮颜色-->
      <accordion title="按钮颜色">
        <div class="color-picker" @mouseup.stop="">
			    <color-picker v-for="(item,index) in getColorArr" pos="left_panel" v-bind:key="index" :color="item" type="color" @onChange="setColor(index,arguments[0])"></color-picker>
		    </div>
      </accordion>

       <!--按钮文本-->
       <accordion title="按钮文本">
            <div class="button-setting">
                <!--按钮文本-->
                <div class="ui-text-input">
                    <div class="label">修改文本:</div>
                    <div class="text">
                        <input type="text" v-model="selectedItem.edit_data.data.text" @input="onInputChange"/>
                    </div>
                </div>
                <!--文字大小-->
                <div class="ui-text-input">
                    <div class="label">字体大小:</div>
                    <div class="text">
                         <combo-box :dataSource="buttonFontSizeArr" v-model="selectedItem.edit_data.data.fontSize" @input="onInputChange"></combo-box>
                    </div>
                </div>
               
            </div>
        </accordion>
        <!--按钮链接-->
       <accordion title="按钮链接">
            <div style="padding:10px;height:50px">
                <!--网址-->
                <div class="label-text">
                  <div class="label">http://</div>
                  <input type="text" placeholder="请输入网址" v-model="selectedItem.edit_data.data.url" @input="onInputChange"/>
                </div>

            </div>
        </accordion>
  </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import accordion from "@/components/editor/ui/accordion";
import colorPicker from "@/components/editor/modal/colorPicker";
import comboBox from "@/components/editor/ui/combobox";
export default {
  data() {
    return {
      buttonFontSizeArr: []
    };
  },
  components: {
    accordion,
    colorPicker,
    comboBox
  },
  computed: {
    getColorArr() {
      return this.$store.state.stage.selectedItem.edit_data.data.color;
    },
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

    setColor(index, color) {
      let newArr = [...this.getColorArr];
      newArr[index] = color;
      this.selectedItem.edit_data.data.color = newArr;
      
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    }
  },
  mounted() {
    for (let i = 12; i < 100; i++) {
      this.buttonFontSizeArr.push({
        item: i + "px",
        value: i
      });
    }
  }
};
</script>
<style lang="scss">
.button-component-setting {
  .color-picker {
    height: 50px;
    padding: 10px;
  }
  * {
    $placeholder-color: rgb(160, 160, 160);
    ::-webkit-input-placeholder {
      /* WebKit browsers */
      color: $placeholder-color;
    }
    :-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: $placeholder-color;
    }
    ::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: $placeholder-color;
    }
    :-ms-input-placeholder {
      /* Internet Explorer 10+ */
      color: $placeholder-color;
    }
  }
}

/**带标签的文本编辑 */
.label-text {
  display: flex;
  height: 30px;
  line-height: 30px;

  .label {
    color: #d1d1d1;
    width: 50px;
    padding-left: 5px;
  }
  input[type="text"] {
    background-color: #676c73;
    flex: 1;

    color: #fff;
    padding: 0px 5px;
    height: 100%;
    border: none;
    transition: all 0.2s;
  }
}
</style>



// WEBPACK FOOTER //
// button.vue?d9abbd90