<template>
    <div class="ui-accordion">
        <div class="heading" @click="onHeadingClickHandler">
            <span class="left">{{title}}</span>
            <span class="right" :style="open?'transform:scale(1,-1)':'transform:scale(1,1)'">
                <i class="tbzico ico-arrow3 ico180"></i>
            </span>
        </div>
        <div class="content" v-show="open">
            <slot></slot>
        </div>
    </div>
</template>
<script>
export default {
  props: ["title"],
  data() {
    return {
      open: true
    };
  },
  methods: {
    getContentStyle() {
      let styleObj = {
        maxHeight: this.open ? "2000px" : "0px",

        opacity: this.open ? "1" : "0"
      };

      return styleObj;
    },
    onHeadingClickHandler() {
      this.open = !this.open;
    }
  }
};
</script>
<style lang="scss" scoped>
.ui-accordion {
  border-radius: 3px;
  margin-bottom: 5px;
  // overflow: hidden;
  .heading {
    height: 35px;
    line-height: 35px;
    color: #ffffff;
    background: #4c525a;
    font-size: 14px;
    padding: 0 10px 0 10px;
    cursor: pointer;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
    display: flex;
    .left {
      flex: 1;
      cursor: pointer;
    }
    .right {
      cursor: pointer;
      display: inline-block;

      i {
        font-size: 28px;
        vertical-align: middle;
      }
    }
  }
  .content {
    //overflow: hidden;
    background: #545961;
    color: #fff;

    position: relative;
    border-radius: 0 0 3px 3px;
  }
}
</style>




// WEBPACK FOOTER //
// accordion.vue?8c020024