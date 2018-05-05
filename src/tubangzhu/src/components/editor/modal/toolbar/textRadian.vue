<template>
	<div class="radian-panel modal-mini" v-show="show" @mousedown.stop="">
		<!--<button @click="setTextRadian(-2)">向上环绕</button><br/>-->
		<!--<button @click="setTextRadian(-1)">向上轻微环绕</button><br/>-->
		<!--<button @click="setTextRadian(0)">无环绕</button><br/>-->
		<!--<button @click="setTextRadian(1)">向下环绕</button><br/>-->
		<!--<button @click="setTextRadian(2)">向下轻微环绕</button><br/>-->
		<!--<label>环绕间距:<input type="range" min="-50" max="50" :value="getRadianLetterSpacing" @change="setTextRadianLetterSpacing"/></label>-->
		<div class="radian-btn-group">
			<div :class="['item',{'active':getRadian==-2}]" style="background-position-x: 7px;" @click="setTextRadian(-2)"></div>
			<div :class="['item',{'active':getRadian==-1}]" style="background-position-x: -55px;" @click="setTextRadian(-1)"></div>
			<div :class="['item',{'active':getRadian==0}]" style="background-position-x: -116px;" @click="setTextRadian(0)"></div>
			<div :class="['item',{'active':getRadian==1}]" style="background-position-x: -179px;" @click="setTextRadian(1)"></div>
			<div :class="['item',{'active':getRadian==2}]" style="background-position-x: -239px;" @click="setTextRadian(2)"></div>
		</div>
		<hr/>
		<div class="letter-spacing-bar">
			<div class="name">环绕间距</div>
			<input type="range" min="0" max="500" :value="getRadianLetterSpacing" @input="setTextRadianLetterSpacing(false)" @change="setTextRadianLetterSpacing(true)" />
			<input type="text" :value="getRadianLetterSpacing" @change="setTextRadianLetterSpacing(true)" />
		</div>
	</div>
</template>
<script>
import $ from "jquery";
import eventBus from "@/common/eventBus.js";
import socket from "@/common/socket.js";
export default {
  computed: {
    show() {
      return (
        this.$store.state.editor.modal["textRadian"] && this.nowEditText != null
      );
    },
    //获取当前正在编辑的文本
    nowEditText() {
      if (this.$store.state.stage.selectedItem != null) {
        return this.$store.state.stage.selectedItem;
      } else if (this.$store.state.editor.nowEditText != null) {
        return this.$store.state.editor.nowEditText;
      }
    },
    getRadian() {
      if (this.nowEditText != null) {
        return this.nowEditText.edit_data.textRadian;
      } else {
        return 0;
      }
    },
    getRadianLetterSpacing() {
      if (this.nowEditText != null) {
        return this.nowEditText.edit_data.textRadianLetterSpacing;
      } else {
        return 0;
      }
    },
    //获取当前正在单选或多选的对象,返回一个数组
    getSelectedItems() {
      var selectedItem = this.$store.state.stage.selectedItem;
      var selectedItemsGroup = this.$store.state.stage.selectionBox.items;
      if (selectedItem != null) {
        return [selectedItem];
      } else if (selectedItemsGroup.length > 0) {
        return selectedItemsGroup;
      } else {
        return [];
      }
    }
  },
  methods: {
    setTextRadian(val) {
      if (this.nowEditText != null) {
        var oldTextRadian = this.nowEditText.edit_data.textRadian;
        if (val == 0) {
          //水平排列,重新生成svg
          this.nowEditText.edit_data.textRadian = val;
          eventBus.$emit("updateTextElement", { item: this.nowEditText });
          return;
        }

        if (this.nowEditText.edit_data.textJson.length > 1) {
          this.$store.commit("callModal", {
            type: "alert",
            cls: "danger",
            modalOver: true,
            text: "多行文本不支持文字环绕,请只保留一行文字后再试"
          });
          return;
        }

        if (oldTextRadian == 0) {
          this.nowEditText.edit_config.width *= 2;
          this.nowEditText.edit_config.height *= 2;

          //						for(var line = 0;line<this.nowEditText.edit_data.textJson.length;line++){
          //							this.nowEditText.edit_data.textJson[line].align='center'
          //						}
          //						var $text = $('<div>'+this.nowEditText.edit_data.text+'</div>');
          //						$text.children('p').css('text-align','center');
          //						$text.children('p').css('text-align-last','');
          //						this.nowEditText.edit_data.text = $text.html();
        }
        //更新文字svg
        var _self = this;
        socket.textToSvg(
          this.nowEditText.edit_data.textJson,
          this.nowEditText,
          function(e) {
            _self.nowEditText.edit_data.svg = e.data;
            _self.nowEditText.edit_data.textRadian = val;
            eventBus.$emit("elementChange", {
              type: "update",
              targets: [_self.nowEditText]
            });
          }
        );
      }
    },
    setTextRadianLetterSpacing(snap) {
      var val = event.target.value;
      this.nowEditText.edit_data.textRadianLetterSpacing = val;
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.nowEditText],
        snap: snap
      });
    }
  }
};
</script>
<style lang="scss">
.radian-panel {
  width: 340px;
  height: 150px;
  padding: 10px;
  top: 39px;
  left: 299px;
  .radian-btn-group {
    text-align: center;
    padding-top: 5px;
    padding-bottom: 5px;
    .item {
      background: url(../../../../assets/images/text-radian.png) no-repeat 0px
        50%;
      width: 50px;
      height: 50px;
      border: 1px solid #dddddd;
      border-radius: 4px;
      margin-left: 4px;
      margin-right: 4px;
      cursor: pointer;
      &:hover {
        opacity: 0.7;
      }
    }
    .active {
      background-color: #dddddd;
    }
  }
  hr {
    border-color: #ddd;
    margin-left: 10px;
    margin-right: 10px;
  }
  .letter-spacing-bar {
    padding: 5px;

    color: #515151;
    font-size: 14px;
    .name {
      display: inline-block;
      padding-left: 7px;
      width: 65px;
    }

    input[type="range"] {
      display: inline-block;
      width: 170px;
      margin-left: 5px;
    }
    .val {
      display: inline-block;
      width: 30px;
      text-align: center;
    }
  }
  input[type="text"] {
    margin-left: 10px;
    display: inline;
    width: 46px;
    line-height: 30px;
    font-size: 14px;
    color: #515151;
    background-color: #e5e5e5;
    border-radius: 5px;
    text-align: center;
  }
}
</style>


// WEBPACK FOOTER //
// textRadian.vue?05c8e4dd