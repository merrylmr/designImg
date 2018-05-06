<template>
	<div class="combo-box">
		<!--编辑-->
		<div class="edit" v-html="getComboBoxViewHtml()" @click="showContent" @keyup.enter="changeValue">

		</div>
		<!--列表-->
		<div class="content" id="combo-box-list" v-show="show">
			<div class="list">
				<li v-for="item in dataSourceb" v-html="getComboItem(item)" @click="selectOption(item)" :class="{'active':(item.value==selected || item.option==selected)}" @mouseenter="onComboItemEnter(item)" @mouseleave="onComboItemLeave(item)"></li>
			</div>
			<div class="copyright-tip" v-show="showCopyright">
				<i class="tbzico ico-warning"></i>
				<p class="text">若该字体用于商业用途<br/>请与字体公司购买版权</p>
			</div>
		</div>
		<!--数值增减-->
		<div class="stepper">
			<div class="add icon" @click="itemStep('minus')"></div>
			<div class="minus icon" @click="itemStep('add')"></div>
		</div>
	</div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import $ from "jquery";
import common from "@/common/common.js";
export default {
  data() {
    return {
      //当前选中的value
      selectedValue: 0,
      //是否显示
      show: false,
      //显示版权提示
      showCopyright: false
    };
  },
  props: ["dataSource", "type", "selected"],
  computed: {
    //获取数据源
    dataSourceb() {
      /*
			* 数据对象格式
			* option:选项内容,纯文本或者图片url
			* value:对应变量
			* */
      if (this.$props.type == "font") {
        //生成fontlist
        let fontList = [];
        for (var i in common.fontList) {
          fontList.push({
            option: common.fontList[i][1],
            value: common.fontList[i][0],
            data: common.fontList[i]
          });
        }

        return fontList;
      }
      return this.$props.dataSource;
    }
  },
  methods: {
    onComboItemEnter(item) {
      if (this.type == "font") {
        this.showCopyright = false;
        for (let i in this.dataSourceb) {
          if (
            this.dataSourceb[i].data[0] == item.value &&
            this.dataSourceb[i].data[2]
          ) {
            this.showCopyright = true;
          }
        }
      }
    },
    onComboItemLeave(item) {
      if (this.type == "font") {
        this.showCopyright = false;
      }
    },
    //显示列表
    showContent() {
      //通知其他面板关闭
      eventBus.$emit("closeModal");
      this.show = true;
      this.$nextTick(() => {
        //获取当前被选中的项目是第几个激活的
        let selIndex = 0;
        let find = false;
        for (var i = 0; i < this.dataSourceb.length; i++) {
          if (this.dataSourceb[i].value == this.$props.selected) {
            find = true;
            break;
          } else {
            selIndex++;
          }
        }
        if (!find) {
          selIndex = 0;
        }
        console.log("selIndex", selIndex);
        $("#combo-box-list .list")[0].scrollTop = 27 * selIndex;
      });
    },
    //获取列表内容
    getComboItem(item) {
      if (this.$props.type == "font") {
        return `<div style="width:100%;height:100%;">
					<img style="min-height:14px;max-width:140px;vertical-align:middle" src="/static/img/font/${item.value}.svg"/>
				</div>`;
      } else if (this.$props.type == "number" || this.$props.type == "text") {
        return item.option;
      }
    },
    //选择项目
    selectOption(item) {
      this.$emit("onChange", item);
      //通知其他面板关闭
      //eventBus.$emit('closeModal');
      //this.show = false;
    },
    //获取当前已选择项目���html
    getComboBoxViewHtml() {
      if (this.$props.type == "font") {
        //老字体,显示微软雅黑
        var nowFont = this.$props.selected;
        if (
          this.$props.selected.indexOf("a") != -1 ||
          this.$props.selected.indexOf("b") != -1 ||
          this.$props.selected.indexOf("c") != -1
        ) {
          nowFont = "d6";
        }
        for (var i = 0; i < this.dataSourceb.length; i++) {
          var item = this.dataSourceb[i];
          if (item.value == nowFont) {
            return `<div style="width:100%;height:100%;line-height:28px;">
						<img style="height: 15px;vertical-align:middle;max-width: 90%;" src="/static/img/font/${item.value}.svg"/>
					</div>`;
          }
        }
      } else if (this.$props.type == "number") {
        return (
          '<input id="comboInputBox" type="number" style="width:100%;height:100%;line-height: 30px;" min="5" max="800" value="' +
          this.$props.selected +
          '"/>'
        );
      } else if (this.$props.type == "text") {
        return (
          '<div style="height:100%;line-height: 30px;">' +
          this.$props.selected +
          "</div>"
        );
      }
    },
    //按下回车修改值
    changeValue() {
      var value = parseFloat($("#comboInputBox").val());
      this.$emit("onChange", {
        option: value,
        value: value
      });
      //通知其他面板关闭
      eventBus.$emit("closeModal");
      this.show = false;
    },
    //箭头上下选择
    itemStep(type) {
      for (var i = 0; i < this.dataSourceb.length; i++) {
        var item = this.dataSourceb[i];
        if (item.value == this.$props.selected) {
          if (type == "add" && i < this.dataSourceb.length - 1) {
            item = this.dataSourceb[i + 1];
          } else if (type == "minus" && i > 0) {
            item = this.dataSourceb[i - 1];
          }
          this.$emit("onChange", item);
          //通知其他面板关闭
          eventBus.$emit("closeModal");
          this.show = false;
          break;
        }
      }
    }
  },
  created() {
    var _self = this;
    eventBus.$on("closeModal", function() {
      //关闭面板
      _self.show = false;
    });
  }
};
</script>
<style lang="scss">
.combo-box {
  line-height: 100%;
  min-width: 50px;
  padding: 5px;
  border-radius: 5px;
  position: relative;
  width: 100%;
  height: 30px;
  border: 1px solid white;
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
  &:hover {
    border: 1px solid #e9e9e9;
  }
  /*可编辑区域*/
  .edit {
    position: absolute;
    left: 5px;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  /*选项选择*/
  .content {
    position: absolute;
    left: 0;
    top: 30px;
    background: white;
    border-radius: 3px;

    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.2);
    width: 100%;

    z-index: 10000;
    .list {
      padding: 2px;
      max-height: 300px;
      overflow-x: hidden;
      overflow-y: auto;
      li {
        cursor: pointer;
        padding-left: 5px;
        display: block;
        width: 100%;
        height: 27px;
        line-height: 27px;
        &:hover {
          background: #e4e4e4;
        }
        &:active {
          background: #d8d8d8;
        }
      }
      .active {
        background: #e4e4e4;
      }
    }
    .copyright-tip {
      color: #a2a2a2;
      text-align: center;
      display: flex;
      padding: 4px;
      background: #f1f1f1;
      i {
        line-height: 33px;
        padding-left: 5px;
      }
      .text {
        margin-left: 1px;
        flex: 1;
        line-height: 16px;
      }
    }
  }
  /*增减*/
  .stepper {
    position: absolute;
    right: 2px;

    margin-top: -3px;
    width: 13px;
    height: 100%;
    .icon {
      background: url("/assets/images/stepper.png");
      width: 13px;
      height: 12px;
      position: absolute;
    }
    .add {
      top: 0px;
      background-position: 0% 0%;
      &:hover {
        background-position: 100% 0%;
      }
    }
    .minus {
      top: 12px;
      background-position: 0% 100%;
      &:hover {
        background-position: 100% 100%;
      }
    }
  }
}
</style>


// WEBPACK FOOTER //
// comboBox.vue?09769ce6
