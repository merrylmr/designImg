<template>
  <transition name="fade">


  <div class="add-form-element-list" v-show="show" @mousedown.stop="">
      <div class="title">
          <div class="text">选择样式</div>
          <div class="close" @click="onCloseBtnClickHandler">
              <i class="tbzico ico-close"></i>
          </div>
      </div>
      <div class="content">
        <div class="item" v-for="item in list" @click="addFormElement(item.value)">
          <img :src="item.url"/>
        </div>
      </div>
  </div>
  </transition>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import common from "@/common/common.js";
export default {
  data() {
    return {
      list: [
        //小文本框
        {
          url: "/static/img/form/xwbk.png",
          value: {
            type: "text",
            name: "文本",
            module_tip: "请输入文本",
            required: false,
            verify: "",
            value: ""
          }
        },
        //大文本框
        {
          url: "/static/img/form/dwbk.png",
          value: {
            type: "textarea",
            name: "文本",
            module_tip: "请输入文本",
            required: false,
            verify: "",
            value: ""
          }
        },
        //单选项
        {
          url: "/static/img/form/dxx.png",
          value: {
            type: "radiolist",
            name: "单选项",
            items: ["项目1", "项目2", "项目3", "项目4"],
            num_each_line: 1,
            value: ""
          }
        },
        //多选项
        {
          url: "/static/img/form/duoxuanxiang.png",
          value: {
            type: "checklist",
            name: "多选项",
            items: ["项目1", "项目2", "项目3", "项目4"],
            module_min: 1,
            module_max: 4,
            num_each_line: 1,
            value: []
          }
        },
        //下拉框
        {
          url: "/static/img/form/xlk.png",
          value: {
            type: "select",
            name: "下拉框",
            items: ["项目1", "项目2", "项目3", "项目4"],
            value: "default"
          }
        },
        //地址
        {
          url: "/static/img/form/dz.png",
          value: {
            type: "address",
            name: "地址",
            required: false,
            items: {
              province: {
                use: true,
                value: "default"
              },
              city: {
                use: true,
                value: "default"
              },
              area: {
                use: true,
                value: "default"
              },
              address: {
                use: true,
                value: ""
              }
            }
          }
        },
        //图片单选
        {
          url: "/static/img/form/tpdx.png",
          value: {
            type: "imgradiolist",
            name: "图片单选",
            items: [
              {
                value: "项目1",
                url: "/static/img/default_form_img.png"
              },
              {
                value: "���目2",
                url: "/static/img/default_form_img.png"
              }
            ],
            value: []
          }
        }
        //图片多选
        /*{
          url: "/static/img/form/tupianduoxuan.png",
          value: {
            type: "imgchecklist",
            name: "图片多选",
            items: [
              {
                value: "项目1",
                url: "/static/img/default_form_img.png"
              },
              {
                value: "项目2",
                url: "/static/img/default_form_img.png"
              }
            ],
            module_min: 1,
            module_max: 2
          }
        }*/
      ]
    };
  },
  computed: {
    show() {
      return this.$store.state.editor.modal["formList"];
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },
  methods: {
    addFormElement(val) {
      let newVal = JSON.parse(JSON.stringify(val));

      if (newVal.type == "address") {
        newVal.front_id = "input_" + common.getNewID();
        newVal.items.province.front_id = "input_" + common.getNewID();
        newVal.items.city.front_id = "input_" + common.getNewID();
        newVal.items.area.front_id = "input_" + common.getNewID();
        newVal.items.address.front_id = "input_" + common.getNewID();
      } else {
        newVal.front_id = "input_" + common.getNewID();
      }
      this.selectedItem.edit_data.data.list = this.selectedItem.edit_data.data.list.concat(
        [newVal]
      );
      this.$store.commit("callModal");
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
      eventBus.$emit(
        "newFormElementAdded",
        this.selectedItem.edit_data.data.list.length - 1
      );
    },
    onCloseBtnClickHandler() {
      this.$store.commit("callModal");
    }
  }
};
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.add-form-element-list {
  position: absolute;
  background: #414750;
  color: #fff;
  width: 320px;
  height: 100%;
  left: 375px;
  top: 49px;
  z-index: 50;

  display: flex;
  flex-direction: column;
  .title {
    position: relative;
    .text {
      padding: 15px;
      text-align: center;
      flex: 1;
      font-size: 14px;
      color: #fff;
    }
    .close {
      position: absolute;
      width: 24px;
      height: 24px;
      text-align: center;
      line-height: 24px;
      right: 0;
      top: 0;
      cursor: pointer;
      color: #afafaf;
      background-color: #4e535b;
      i {
        font-size: 12px;
      }
      &:hover {
        background-color: #00a2eb;
        color: #fff;
      }
    }
  }
  .content {
    overflow-y: scroll;
    padding-bottom: 50px;
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
    &[readonly] {
      background: #e1e1e1;
      cursor: not-allowed;
    }
    .item {
      background-color: white;
      border-radius: 5px;
      border: 1px solid #d5d5d5;
      margin: 5px 10px;
      overflow: hidden;
      text-align: center;
      position: relative;
      cursor: pointer;
      padding: 5px 0px;
      &:hover::after {
        cursor: pointer;
        content: "添加";
        background-color: #00a0e9;
        color: white;
        font-size: 14px;
        border-radius: 5px;
        padding: 5px 10px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      &:hover::before {
        cursor: pointer;
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(0, 0, 0, 0.2);
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>




// WEBPACK FOOTER //
// add.vue?f2d70dd8