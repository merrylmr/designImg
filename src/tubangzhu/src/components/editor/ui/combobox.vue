<template>
  <div class="ui-combo-box">
      <div class="viewer" ref="combobox" @click="openList">
          <div class="value">
              {{selectedItemText}}
          </div>
          <div class="icon">
              <div style="transform: scale(0.7);">
                  <i class="tbzico ico-eArrow"></i>
              </div>
          </div>
      </div>
      <div class="list" v-show="showList" ref="comboboxlist" :style="listStyle">
          <div :class="getListItemClass(index)" v-for="(item,index) in dataSource" @click="onListItemClickHandler(item)">
              {{item.item}}
          </div>
      </div>
  </div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
export default {
  props: ["dataSource", "value"],
  data() {
    return {
      showList: false,
      listPos: {
        left: 0,
        top: 0
      }
    };
  },
  computed: {
    getActiveIndex() {
      for (let i in this.dataSource) {
        if (this.dataSource[i].value == this.value) {
          return i;
        }
      }
      return -1;
    },
    selectedItemText() {
      if (this.getActiveIndex != -1) {
        return this.dataSource[this.getActiveIndex].item;
      }
    },
    listStyle() {
      return {
        left: this.listPos.left + "px",
        top: this.listPos.top + "px"
      };
    }
  },
  methods: {
    getListItemClass(index) {
      if (this.getActiveIndex == index) {
        return ["item", "active"];
      } else {
        return ["item"];
      }
    },
    openList() {
      this.showList = true;
      let rect = this.$refs.combobox.getBoundingClientRect();
      this.listPos = {
        left: rect.left - 68,
        top: rect.top - 18
      };
      //滚动
      this.$refs.comboboxlist.scrollTop = this.getActiveIndex * 32;
    },
    onListItemClickHandler(item) {
      this.$emit("input", item.value);
    }
  },
  mounted() {
    eventBus.$on("closeModal", () => {
      this.showList = false;
    });
  }
};
</script>

<style lang="scss" scoped>
.ui-combo-box {
  width: 100%;
  height: 32px;
  line-height: 32px;
  border: 1px solid #767b81;
  color: #fff;
  background-color: #676c73;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  * {
    cursor: pointer;
  }
  .viewer {
    display: flex;
    .value {
      flex: 1;
      padding-left: 5px;
    }
    .icon {
      width: 24px;
      background-color: #767b81;
      text-align: center;
      border-left: 1px solid #767b81;
      height: 30px;
      i {
        font-size: 12px;
        color: #fff;
      }
    }
  }
  .list {
    position: fixed;
    left: 0;
    top: 0;
    width: 200px;
    height: 300px;
    background-color: white;
    border: 1px solid #d6d6d6;
    z-index: 10000;
    color: #000;
    overflow-x: auto;
    .item {
      padding-left: 5px;
      cursor: pointer;
      transition: 0.2s all;
      &:hover,
      &.active {
        background-color: #00a2eb;
        color: white;
      }
    }
  }
}
</style>




// WEBPACK FOOTER //
// combobox.vue?645530d5