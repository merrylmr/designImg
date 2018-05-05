<template>
  <div class="vote-setting">
    <div class="setting-title">编辑投票</div>
      <!--颜色设置-->
       <accordion title="颜色设置">
            <div class="color-picker" @mouseup.stop="">
			    <color-picker pos="left_panel" v-for="(item,index) in getColorArr" v-bind:key="index" :color="item" type="color" @onChange="setColor(index,arguments[0])"></color-picker>
		    </div>
      </accordion>
      <!--内容设置-->
      <accordion title="内容设置">
           <div class="content-setting">
               <!--按钮文字-->
               <div class="btn-text-wrap">
                   <span>按钮文字</span>
                   <input type="text" v-model="selectedItem.edit_data.data.buttonText" @input="onInputChange"/>
               </div>
                <!--内容编辑-->
                <div class="info-wrap">
                    <!--缩略图-->
                    <div class="thumb" @click="onChangeThumb" v-show="selectedItem.edit_data.config.voteItem.thumb">
                        <img :src="selectedItem.edit_data.data.thumb"/>
                        <span class="tip">修改图片</span>
                    </div>
                    <!--信息输入-->
                    <div class="info">
                        <input type="text" v-model="selectedItem.edit_data.data.title" @input="onInputChange"  v-show="selectedItem.edit_data.config.voteItem.title"/>
                        <textarea rows="5" v-model="selectedItem.edit_data.data.summary" @input="onInputChange"  v-show="selectedItem.edit_data.config.voteItem.summary"></textarea>
                    </div>
                </div>

           </div>
      </accordion>
      <!--投票次数-->
      <accordion title="投票次数">
          <div class="vote-limit-setting">
                <span>每人每天可点</span>
                <input type="text" v-model="limit"/>
                <span>次</span>
          </div>
       </accordion>
              <!--截止时间-->
       <accordion title="截止时间设置">
           <div class="time-setting-wrap">
                 <time-picker :value="new Date(selectedItem.edit_data.data.finishTime*1000)" @input="onInputDateTime"/>
           </div>
       </accordion>
  </div>
</template>
<script>
import timePicker from "@/components/editor/ui/timePicker";
import accordion from "@/components/editor/ui/accordion";
import colorPicker from "@/components/editor/modal/colorPicker";
import eventBus from "@/common/eventBus.js";
import common from "@/common/common.js";
export default {
  components: { accordion, colorPicker, timePicker },
  computed: {
    getColorArr() {
      return this.$store.state.stage.selectedItem.edit_data.data.color;
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      return this.$store.state.docData.page[
        this.$store.state.docData.editor.nowPage
      ];
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
    onInputDateTime(newDate) {
      let timestamp = Date.parse(newDate) / 1000;

      let targets = [];
      for (let i = 0; i < this.getNowPageData.data.length; i++) {
        let item = this.getNowPageData.data[i];
        console.log("item->", item);
        if (item.type == "interaction" && item.edit_data.module == "vote") {
          item.edit_data.data.finishTime = timestamp;
          targets.push(item);
        }
      }
      //修改所有投票时间
      eventBus.$emit("elementChange", {
        type: "update",
        targets: targets
      });
    },
    onChangeThumb() {
      let selectedItem = this.selectedItem;
      let self = this;
      common.uploadFile({
        url: "/editor/upFile3/source/24/target/editorForm.html",
        success: function(res) {
          selectedItem.edit_data.data.thumb = res.src;
          eventBus.$emit("elementChange", {
            type: "update",
            targets: [selectedItem]
          });
        },
        error: function(res) {
          alert("文件上传失败(" + res.msg + ")");
        }
      });
    },
    onInputChange(e) {
      eventBus.$emit("elementChange", {
        type: "update",
        targets: [this.selectedItem]
      });
    },
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
.vote-setting {
  .color-picker {
    height: 50px;
    padding: 10px;
  }
  .content-setting {
    padding: 10px;
    .btn-text-wrap {
      display: flex;
      font-size: 12px;
      line-height: 26px;
      padding: 5px;
      padding-bottom: 10px;
      position: relative;
      span {
        color: #d1d1d1;
      }
      input {
        margin-left: 5px;
        flex: 1;
        padding: 5px;
        border: 1px solid #767b81;
        background: #676c73;
        color: white;
      }
      &::before {
        content: "";
        border-bottom: 1px dashed #6f747a;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }
    .info-wrap {
      margin-top: 5px;
      padding: 5px;
      display: flex;
      .thumb {
        $size: 80px;
        width: $size;
        height: $size;

        position: relative;
        cursor: pointer;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .tip {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          text-align: center;
          padding: 3px;
          color: white;
          background-color: rgba(0, 0, 0, 0.6);
        }
      }
      .info {
        flex: 1;

        padding-left: 3px;
        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 5px;

          border: 1px solid #767b81;
          background: #676c73;
          color: white;
          resize: none;
        }
        textarea {
          margin-top: 3px;
        }
      }
    }
  }
  .vote-limit-setting {
    padding: 10px;
    input {
      width: 40px;
      padding: 5px;
      font-size: 12px;
      border-radius: 3px;
      text-align: center;
      border: 1px solid #767b81;
      background: #676c73;
      color: white;
    }
  }
  .time-setting-wrap {
    padding: 5px;
    text-align: center;
    display: flex;

    input {
      background: transparent;
      font-size: 12px;
      -webkit-appearance: none;
      color: white;
    }
    input[type="date"] {
      width: 135px;
    }
    input[type="time"] {
      width: 125px;
    }
  }
}
</style>



// WEBPACK FOOTER //
// vote.vue?842b3b36