<!-- 对齐 -->
<template>
	<div class="modal-mini align-modal" v-show="alignShow" @mousedown.stop="">
		<span :class="{'active':(align=='left')}" @click="setAlign('left')"><i class="tbzico ico-eAlign"></i></span>
		<span :class="{'active':(align=='center')}" @click="setAlign('center')"><i class="tbzico ico-eAcenter"></i></span>
		<span :class="{'active':(align=='right')}" @click="setAlign('right')"><i class="tbzico ico-eAlign ico-reverseX"></i></span>
		<!--<span :class="['item4',{'active':(align=='justify')}]" v-if="type=='text'" @click="setAlign('justify')"></span>-->
	</div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {};
  },
  props: ["type", "align"],
  computed: {
    alignShow() {
      return this.$store.state.editor.modal["align"];
    },

    //获取当前正在编辑的文本
    nowEditText() {
      if (this.$store.state.stage.selectedItem != null) {
        return this.$store.state.stage.selectedItem;
      } else if (this.$store.state.editor.nowEditText != null) {
        return this.$store.state.editor.nowEditText;
      }
      return null;
    },
    //是否正在文本编辑模式
    editMode() {
      if (this.$store.state.stage.selectedItem != null) {
        return "selected";
      } else if (this.$store.state.editor.nowEditText != null) {
        return "edit";
      } else {
        return "no";
      }
    },
    selectedCell() {
      //判断处于selected状态的cell
      var selectedCell = [];
      for (var i in this.nowEditTable.cellArr) {
        var item = this.nowEditTable.cellArr[i];
        if (item.selected) {
          selectedCell.push(item);
        }
      }
      return selectedCell;
    },
    nowEditTable() {
      return this.$store.state.editor.nowEditTable;
    }
  },
  methods: {
    //设置对齐
    setAlign(align) {
      if (this.type == "groupText") {
        this.$store.state.editor.nowEditGroupText.text.align = align;
        return;
      } else if (this.type == "text") {
        eventBus.$emit("align-change", align);
      } else if (this.type == "table") {
        for (var i in this.selectedCell) {
          this.selectedCell[i].cell.align = align;
        }
      }
    }
  }
};
</script>
<style lang="scss">
.align-modal {
  padding: 5px 15px 5px 15px;
  top: 39px;
  z-index: 999;
  width: 131px;
  span {
    display: inline-block;
    font-size: 14px;
    color: #515151;
    cursor: pointer;
    position: relative;
    width: 31px;
    line-height: 31px;
    text-align: center;
    border-radius: 3px;
    i {
      font-size: 18px;
    }
    &:hover {
      background-color: #e5e5e5;
    }
  }
  .active {
    background-color: #e5e5e5;
  }
}
</style>


// WEBPACK FOOTER //
// align.vue?73dd548d