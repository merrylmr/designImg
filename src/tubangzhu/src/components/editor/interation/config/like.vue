<template>
  <div class="like-component-setting">
    <div class="setting-title">编辑点赞</div>
      <!--按钮颜色-->
      <accordion title="按钮颜色">
        <div class="color-picker" @mouseup.stop="">
			    <color-picker v-for="(item,index) in getColorArr" pos="left_panel" v-bind:key="index" :color="item" type="color" @onChange="setColor(index,arguments[0])"></color-picker>
		    </div>
      </accordion>
       
       <!--点赞次数-->
       <accordion title="点赞次数设置">
          <div class="like-limit-setting">
                <span>每人每天可点赞</span>
                <input type="text" v-model="limit"/>
                <span>次</span>
          </div>
       </accordion>
  </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import accordion from "@/components/editor/ui/accordion";
import colorPicker from "@/components/editor/modal/colorPicker";
export default {
  components: {
    accordion,
    colorPicker
  },
  computed: {
    getColorArr() {
      return this.$store.state.stage.selectedItem.edit_data.data.color;
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    //获取点赞数限制
    limit: {
      set(val) {
        if (parseInt(val) <= 0 || parseInt(val).toString() != val) {
          val = 1;
        }
        this.selectedItem.edit_data.data.limit = val;
        eventBus.$emit("elementChange", {
          type: "update",
          targets: [this.selectedItem]
        });
      },
      get() {
        return this.selectedItem.edit_data.data.limit;
      }
    }
  },
  methods: {
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
.like-component-setting {
  .color-picker {
    height: 50px;
    padding: 10px;
  }
  .like-limit-setting {
    padding: 10px;
    input {
      width: 40px;
      padding: 5px;
      font-size: 12px;
      border-radius: 3px;
      text-align: center;
      border: 1px solid #dbdbdb;
    }
  }
}
</style>




// WEBPACK FOOTER //
// like.vue?799c5810