<template>
	<div class="form-element-editor" ref="formElementEditor" >
    
    <div :class="getItemClass(index)" v-for="(item,index) in listData" :style="itemPaddingStyle(index)" @mousemove="onEditorMouseMove">
          <div class="item-content" :style="itemContentStyle(index)">
            <div class="title"  @mousedown="onTabNameClick(index)">
            <span class="left" @mousedown="onFormItemMousedown(item,index)">
              <i class="tbzico ico-option"></i>
              <span class="name">{{item.name}}</span>
            </span>
            <span>
              <span class="right" :style="getRightIconStyle(index)" >
                <i class="tbzico ico-down"></i>
              </span>
              <span class="right" >
                <span class="type">{{getTypeName(item.type)}}</span>
              </span>
            </span>
          </div>
          <div style="clear:both"></div>
          <div class="content" :style="getFormElementContentStyle(index)">
            <component :is="getFormElementComponent(item)" :itemData="item" @onEvent="(e)=>{onFormElementComponentEventHandler(e,item,index)}"/>
          </div>
        </div>

      </div>
 
	
    <!--新增表单元素-->
    <div class="add-form-element-btn" @click="onAddFormElementClickHandler">
      <i class="tbzico ico-cross"></i>
      <span>新增填写项</span>
    </div>
    
	</div>
</template>
<script>
import textInput from "./text.vue";
import radioList from "./radio.vue";
import imgRadioList from "./imgradio.vue";
import imgCheckList from "./imgcheck.vue";
import selectList from "./select.vue";
import checkList from "./check.vue";

import addressSelector from "./address.vue";
import eventBus from "@/common/eventBus.js";
import common from "@/common/common.js";
export default {
  data() {
    return {
      activeIndex: -1,
      movingIndex: -1,
      posY: 0,
      downPosY: 0,
      moved: false
    };
  },
  components: {
    textInput,
    radioList,
    checkList,
    selectList,
    addressSelector,
    imgRadioList,
    imgCheckList
  },
  computed: {
    //获取mouse状态
    getMouse() {
      return this.$store.state.stage.mouse;
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    listData() {
      return this.selectedItem.edit_data.data.list;
    }
  },
  methods: {
    onTabNameClick(index) {
      console.log("");
      if (this.activeIndex == index) {
        this.activeIndex = -1;
      } else {
        this.activeIndex = index;
      }
    },
    getItemClass(index) {
      if (index != this.activeIndex) {
        return ["item"];
      } else {
        return ["item", "active"];
      }
    },
    itemPaddingStyle(index) {
      if (this.movingIndex != -1 && this.moved) {
        //计算当前移动到的新位置(上移动-16)

        let to;
        if (this.posY - this.downPosY > 0) {
          to = parseInt(this.posY / 33);
        } else {
          to = parseInt((this.posY - 16) / 33);
        }
        if (to < 0) {
          to = 0;
        } else if (to > this.listData.length - 1) {
          to = this.listData.length - 1;
        }
        console.log("to ->", to);
        if (index == this.movingIndex) {
          if (this.movingIndex == to) {
            console.log("   a");
            return {
              paddingBottom: "33px"
            };
          } else {
            console.log("   b");
            return {
              paddingBottom: "0px"
            };
          }
        } else {
          if (index == to) {
            if (this.posY < 0) {
              console.log("   c");
              return {
                paddingTop: "33px"
              };
            } else {
              console.log("   d");
              return {
                paddingBottom: "33px"
              };
            }
          }
        }
      }
    },
    itemContentStyle(index) {
      if (index == this.movingIndex && this.moved) {
        return {
          position: "absolute",
          left: "10px",
          top: this.posY + "px",
          width: "257px",
          zIndex: 1000,
          border: "1px solid #00a2eb"
        };
      }
    },
    onEditorMouseMove() {
      if (this.movingIndex != -1) {
        this.moved = true;
        this.activeIndex = -1;
      }
      let offsetTop = this.$refs.formElementEditor.getBoundingClientRect().top;
      this.posY = event.clientY - offsetTop - 16;
    },
    formEditorMouseup() {
      this.moved = false;
      if (this.movingIndex != -1) {
        //计算当前移动到的新位置
        let to = parseInt(this.posY / 33);
        if (to < 0) {
          to = 0;
        } else if (to > this.listData.length - 1) {
          to = this.listData.length - 1;
        }

        //移动逻辑start
        let tempArray = JSON.parse(JSON.stringify(this.listData));

        let tempArrayItem = tempArray[this.movingIndex];
        tempArray[this.movingIndex] = null;

        if (to > this.movingIndex) {
          tempArray.splice(to + 1, 0, tempArrayItem);
        } else {
          tempArray.splice(to, 0, tempArrayItem);
        }

        tempArray = tempArray.filter(item => {
          return item != null;
        });

        this.selectedItem.edit_data.data.list = tempArray;
        //移动逻辑end

        eventBus.$emit("elementChange", {
          type: "update",
          targets: [this.selectedItem]
        });

        this.movingIndex = -1;
      }
    },
    onFormItemMousedown(item, index) {
      //this.activeIndex = -1;
      this.movingIndex = index;
      this.downPosY = this.posY;
    },
    //项目的下拉框按钮(开启与关闭activeIndex)
    onTabDropdownIconClick(index) {
      if (this.activeIndex == index) {
        this.activeIndex = -1;
      } else {
        this.activeIndex = index;
      }
    },
    onAddFormElementClickHandler() {
      this.$store.commit("callModal");
      this.$store.commit("callModal", { type: "formList" });
    },
    getTypeName(type) {
      let typeList = {
        text: "小文本框",
        textarea: "大文本框",
        select: "下拉框",
        date: "日期选择框",
        checklist: "多选项",
        imgchecklist: "图片多选",
        address: "地址",
        radiolist: "单选项",
        imgradiolist: "图片单选"
      };
      return typeList[type];
    },
    getRightIconStyle(index) {
      if (this.activeIndex == index) {
        return {
          transform: "rotate(180deg)"
        };
      }
    },

    getFormElementContentStyle(index) {
      if (index != this.activeIndex) {
        return {
          height: 0,
          opacity: 0,
          transform: "translateX(-10px)"
        };
      }
    },
    getFormElementComponent(item) {
      switch (item.type) {
        case "text":
        case "textarea":
          return textInput;
        case "radiolist":
          return radioList;
        case "select":
          return selectList;
        case "address":
          return addressSelector;
        case "checklist":
          return checkList;
        case "imgradiolist":
          return imgRadioList;
        case "imgchecklist":
          return imgCheckList;
      }
    },
    onFormElementComponentEventHandler(e, item, index) {
      switch (e.type) {
        case "remove":
          this.selectedItem.edit_data.data.list = this.listData.filter(
            (i_item, i_index) => {
              return i_index != index;
            }
          );

          break;
      }
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    }
  },
  mounted() {
    eventBus.$on("globalMouseUp", this.formEditorMouseup);
    eventBus.$on("newFormElementAdded", newIndex => {
      this.activeIndex = newIndex;
    });
  }
};
</script>
<style lang="scss">
.form-element-editor {
  padding: 10px;
  position: relative;

  .item {
    margin-bottom: 2px;
    .item-content {
      margin-top: -1px;
      background: #676c73;

      font-size: 13px;

      .title {
        cursor: move;

        padding: 0 10px 0 10px;
        height: 33px;
        line-height: 33px;
        display: flex;
        .left {
          cursor: move;
          color: #fff;
          flex: 1;
          i {
            font-size: 14px;
            color: #fff;
          }
          .name {
            margin-left: 3px;
            font-size: 14px;

            cursor: pointer;
          }
          * {
            cursor: move;
          }
        }
        .right {
          * {
            cursor: pointer;
          }
          float: right;
          transition: all 0.2s;
          i {
            color: #bdbdbd;
          }
          .type {
            margin-left: 5px;
            font-size: 12px;

            color: #bdbdbd;
          }
        }
      }
      .content {
        overflow: hidden;
        transition: all 0.3s;
      }
    }
  }
  .active {
    .item-content {
      background: #fff;
      .title {
        .left {
          color: #515151;
          i {
            color: #9e9e9e;
          }
        }
        .right {
          i {
            color: #a8a8a8;
          }
          .type {
            color: #bdbdbd;
          }
        }
      }
    }
  }
  .add-form-element-btn {
    background-color: #00a0ea;
    color: white;
    text-align: center;
    padding: 8px;
    border-radius: 3px;
    box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    i {
      vertical-align: middle;
      font-size: 12px;
      margin-right: 2px;
    }
    span {
      vertical-align: middle;
    }
    &:hover {
      opacity: 0.8;
    }
    &:active {
      opacity: 0.9;
    }
  }
  /**带标签的文本编辑 */
  .label-text {
    border: 1px solid #dbdbdb;
    display: flex;
    height: 30px;
    line-height: 28px;

    margin: 0 10px 4px 10px;
    .label {
      background: #efefef;
      color: #909090;
      width: 50px;
      padding-left: 5px;
      border-right: 1px solid #dbdbdb;
    }
    input[type="text"] {
      flex: 1;
      background: #fff;
      color: #000;
      padding: 0px 5px;
      height: 100%;
      border: none;
    }
  }
  /**每行显示*文本编辑**/
  .input-text {
    background-color: #f3f3f3;
    border: 1px solid #d6d6d6;
    color: #515151;
    padding: 4px 6px;
    margin: 0 10px 4px 10px;

    input {
      border: 1px solid #d6d6d6;
      padding: 4px;
      border-radius: 3px;
      margin: 0px 6px;
      width: 35px;
      text-align: center;
    }
  }
  /**带删除按钮的项目文本编辑框 */
  .item-text {
    display: flex;
    height: 30px;
    line-height: 30px;

    margin: 0 10px 4px 10px;

    input[type="text"] {
      flex: 1;
      border: 1px solid #d6d6d6;
      background: #fff;
      color: #515151;
      padding: 0px 5px;
      height: 100%;
    }
    .remove {
      cursor: pointer;
      width: 22px;
      color: #ff6d6c;
      text-align: center;
      border-radius: 50%;
      margin-left: 5px;
      height: 22px;
      margin-top: 3px;
      line-height: 22px;
      i {
        font-size: 20px;
      }
      &:hover {
        color: #ff9b9a;
      }
    }
  }

  .item-img-text {
    display: flex;
    height: 75px;
    line-height: 30px;

    margin: 4px 10px 4px 10px;
    .pic {
      min-width: 75px;
      min-height: 75px;
      position: relative;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
      }
      .change-tip {
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
        text-align: center;
        height: 18px;
        line-height: 18px;
        font-size: 12px;
      }
    }
    input[type="text"] {
      flex: 1;
      border: 1px solid #dbdbdb;
      color: #515151;
      margin-left: 5px;
      height: 30px;
      padding: 0px 5px;
    }
    .remove {
      cursor: pointer;
      width: 22px;
      color: #fff;

      text-align: center;
      border-radius: 50%;
      margin-left: 5px;
      height: 22px;
      margin-top: 3px;
      line-height: 22px;
      i {
        font-size: 20px;
      }
      &:hover {
        color: #ff9b9a;
      }
    }
  }

  .bottom-content {
    .remove-btn {
      background: none;
      color: #ff6d6c;
      i {
        font-size: 14px;
      }
    }
    margin: 10px;
    .left {
      float: left;
    }
    .right {
      float: right;
    }
    .clear {
      clear: both;
    }
  }
}
</style>



// WEBPACK FOOTER //
// main.vue?6e7dd45a