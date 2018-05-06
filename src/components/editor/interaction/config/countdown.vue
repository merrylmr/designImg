<template>
  <div class="countdown-setting">
    <div class="setting-title">编辑倒计时</div>
    <accordion title="颜色设置">
 <div class="color-picker" @mouseup.stop="">
			    <color-picker v-for="(item,index) in getColorArr" pos="left_panel" v-bind:key="index" :color="item" type="color" @onChange="setColor(index,arguments[0])"></color-picker>
		    </div>
    </accordion>
    
       <!--截止时间-->
       <accordion title="截止时间设置">
           <div class="time-setting-wrap">
                   <!-- <input type="date" :value="date" ref="date" @input="onInputDate"/>
                   <input type="time" :value="time" ref="time" @input="onInputDate"/> -->
                   <time-picker :value="selectedItem.edit_data.data.date" @input="onInputDateTime"/>
           </div>
       </accordion>
  </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import accordion from "@/components/editor/ui/accordion";
import timePicker from "@/components/editor/ui/timePicker";
import colorPicker from "@/components/editor/modal/colorPicker";
export default {
  components: {
    accordion,
    timePicker,
    colorPicker
  },

  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    getColorArr() {
      return this.selectedItem.edit_data.data.color;
    }
  },
  methods: {
    onInputDateTime(newDate) {
      this.selectedItem.edit_data.data.date = newDate.toString();
      console.log("设置新事件", newDate.toString());
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
  }
};
</script>
<style lang="scss" scoped>
.countdown-setting {
  .color-picker {
    height: 50px;
    padding: 10px;
  }
  .time-setting-wrap {
    padding: 8px;
    text-align: center;
    display: flex;

    input {
      background: transparent;
      font-size: 12px;
      -webkit-appearance: none;
      color: white;
    }
    input[type="date"] {
      width: 135px;
    }
    input[type="time"] {
      width: 125px;
    }
  }
}
</style>



// WEBPACK FOOTER //
// countdown.vue?b49a8e82