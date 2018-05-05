<template>
  <div class="upload-group" v-if="show" @mousedown.stop="">
      <div class="item">
          <span class="title">标签:</span>
          <input class="text-input" placeholder="输入标签方便用户检索" type="text" v-model="title"/>
      </div>
      <div class="item">
          <span class="title">类型:</span>
                    <label>
              <input type="radio" v-model="type" value="1"/>
             <span>图片组合</span>
          </label>
          <label>
              <input type="radio" v-model="type" value="2"/>
               <span>文字组合</span>
              
          </label>

      </div>
      <div class="item">
          <button @click="uploadGroupHandle">上传组合</button>
      </div>
  </div>
</template>
<script>
import $ from "jquery";
export default {
  data() {
    return {
      title: "",
      type: 1
    };
  },
  computed: {
    show() {
      return this.$store.state.editor.modal["uploadGroup"];
    },
    //获取当前的缩放比例
    getZoom() {
      return this.$store.state.stage.zoom / 100;
    }
  },
  methods: {
    uploadGroupHandle() {
      //获取当前选中的元素
      let eleItems = this.$store.state.stage.selectionBox.items;
      if (eleItems.length == 0) {
        alert("您还没有选择元素,请刷新浏览器重新操作");
        return;
      }
      //检测title是否输入
      if (this.title.length == 0) {
        alert("请输入标签");
        return;
      }
      //确认窗口
      let confirmResult = confirm(
        `请确认即将要上传的组合\n\n标签: ${this.title}\n类型: ${this.type == 1
          ? "图片组合"
          : "文字组合"}\n组合元素数: ${eleItems.length}\n\n确认要上传吗?`
      );
      //开始提交
      if (confirmResult) {
        //获取组合的宽度与高度
        let selectionBoxRect = this.getSelectionBoxRect();
        let submitData = {
          info: {
            width: selectionBoxRect.width,
            height: selectionBoxRect.height,
            type: this.type,
            tag: this.title
          },
          elements: []
        };
        //复制一份elementItems副本
        let newEleItems = JSON.parse(JSON.stringify(eleItems));
        //根据index排序
        newEleItems.sort(function(a, b) {
          return parseInt(a.index) - parseInt(b.index);
        });
        //格式化数据
        newEleItems = newEleItems.map(item => {
          return {
            info: {
              left: item.edit_config.left - selectionBoxRect.left,
              top: item.edit_config.top - selectionBoxRect.top
            },
            edit_config: item.edit_config,
            edit_data: item.edit_data,
            type: item.type
          };
        });
        submitData.elements = newEleItems;
        console.log(JSON.stringify(submitData));
        $.post("/editorApi/v1/element/create-group", submitData, function(e) {
          if (e.error == 0) {
            alert("组合上传成功");
          } else {
            alert("组合上传失败,请重试");
          }
        });
      }
    },
    getSelectionBoxRect() {
      let Result = this.$store.state.stage.selectionBox.items;
      var $stageArea = $("#stageArea");
      let stageDom = $("#stage_canvas")[0];
      var leftOffset =
        stageDom.offsetLeft +
        $stageArea[0].offsetLeft -
        $stageArea.scrollLeft();
      var topOffset =
        stageDom.offsetTop + $stageArea[0].offsetTop - $stageArea.scrollTop();
      var finalLeft = null;
      var finalRight = null;
      var finalTop = null;
      var finalBottom = null;
      //遍历所有选中的items,获取四边框
      for (var c = 0; c < Result.length; c++) {
        //获取rect

        //console.log('ID',Result[c].id);
        var rect = $("#rect_" + Result[c].id)[0].getBoundingClientRect();

        var left = rect.left - leftOffset;
        var right = rect.right - leftOffset;
        var top = rect.top - topOffset;
        var bottom = rect.bottom - topOffset;

        if (finalLeft == null) {
          finalLeft = left;
        }
        if (finalRight == null) {
          finalRight = right;
        }
        if (finalTop == null) {
          finalTop = top;
        }
        if (finalBottom == null) {
          finalBottom = bottom;
        }

        if (left < finalLeft) {
          finalLeft = left;
        }
        if (top < finalTop) {
          finalTop = top;
        }

        if (right > finalRight) {
          finalRight = right;
        }
        if (bottom > finalBottom) {
          finalBottom = bottom;
        }
      }

      return {
        left: finalLeft / this.getZoom,
        top: finalTop / this.getZoom,
        width: (finalRight - finalLeft) / this.getZoom,
        height: (finalBottom - finalTop) / this.getZoom
      };
    }
  }
};
</script>
<style lang="scss" scoped>
.upload-group {
  position: fixed;
  z-index: 9;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

  left: 380px;
  top: 100px;

  border-radius: 5px;
  padding: 5px;

  .item {
    .title {
      margin-right: 3px;
    }
    .text-input {
      border: 1px solid rgba(0, 0, 0, 0.2);
      padding: 5px;
    }
    padding: 5px;
    button {
      width: 100%;
      color: white;
      background-color: #00a2eb;
      border-radius: 3px;
      padding: 8px;
      box-sizing: border-box;
    }
  }
}
</style>





// WEBPACK FOOTER //
// uploadGroup.vue?2518e21c