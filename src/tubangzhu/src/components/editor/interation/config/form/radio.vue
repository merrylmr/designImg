<!--单选-->
<template>
  <div class="radio-form-element">
      <!--标题-->
      <div class="label-text">
        <div class="label">标题</div>
        <input type="text" placeholder="请输入标题" v-model="itemData.name" @change="onInputChange"/>
	  </div>
      <!--项目-->
      <div class="item-text" v-for="(item,index) in itemData.items">
        <input type="text" placeholder="请输入项目" v-model=" itemData.items[index]" @change="onInputChange"/>
        <div class="remove" @click="onRemoveItemHandler(index)">
            <i class="tbzico ico-remove3"></i>
        </div>
	  </div>
      <!--添加-->
      <button class="add-btn" @click="onAddBtnClickHandler">
          <i class="tbzico ico-cross"></i>
          <span>增加选项</span>
      </button>
      <!--每行显示*项-->
      <div class="input-text">
        <span>每行显示</span><input type="text" v-model="itemData.num_each_line" @change="onInputChange"/></span><span>项</span>
      </div>
      <div class="bottom-content">

      <span class="right">
      <button class="remove-btn" @click="onRemoveHandler">
      <i class="tbzico ico-remove1"></i>
      </button>
      </span>
      <div class="clear"></div>

    </div>
  </div>
</template>
<script>
import checkbox from "@/components/editor/ui/checkbox";
import eventBus from "@/common/eventBus.js";
export default {
  props: ["itemData"],
  computed: {
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },
  components: {
    checkbox
  },
  methods: {
    //所有input发生更改触发
    onInputChange(e) {
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    onRemoveHandler() {
      this.$emit("onEvent", {
        type: "remove"
      });
    },
    onRemoveItemHandler(index) {
      if (this.$props.itemData.items.length <= 1) {
        alert("请至少保留 1 项");
        return;
      }
      this.$props.itemData.items = this.$props.itemData.items.filter(
        (i_item, i_index) => {
          return index != i_index;
        }
      );
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
    onAddBtnClickHandler() {
      this.$props.itemData.items = this.$props.itemData.items.concat(["新项目"]);
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    }
  }
};
</script>
<style lang="scss">
.radio-form-element {
  padding: 5px 10px;
  .add-btn {
    width: 206px;
    margin: 0 10px 4px 10px;
    box-sizing: border-box;
    padding: 5px;
    background: #f3f3f3;
    border: 1px solid #dbdbdb;
    color: #515151;
    font-size: 12px;
    i {
      font-size: 12px;
      color: #979797;
    }
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>



// WEBPACK FOOTER //
// radio.vue?0509b25c