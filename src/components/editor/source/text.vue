<template>
	<div class="text-box u-scroll" @scroll="scroll" ref="textBox">

		<!--添加文本-->
		<div class="item add-text">
			<div class="box1">
				<div class="text1" @click="addElement('text','title')">添加标题文字</div>
				<div class="text2" @click="addElement('text','main')">添加正文文字</div>
			</div>
			<!--快速编辑-->
			<div :class="['item','quick-edit']" v-if="tabShow && getNowPageTextList.length>0">
				<textarea :id="'quick_edit_'+item.item.id" v-if="item.item.edit_data.textJson" placeholder="请输入文本" :rows="getRows(item)" :class="getTextareaClass(item.item)" v-for="item in getNowPageTextList" class="quick-edit-textarea" :key="'text_'+item.item.id" @mousedown="onTextClick(item.item)" @input="onTextInput(item)" @mousemove="onTextMousemove">{{getElementText(item)}}</textarea>
			</div>
			<div class="box2">
				<waterfall :line-gap="90" :watch="list.data">
					<waterfall-slot v-for="(item, index) in list.data" :width="item.owidth" :height="item.oheight" :key="index" :order="index">
						<a href="javascript:;" @click="addElement(item.type,item.url)" @dragstart="handleDragstart(item.type,item.url)">
							<img :src="item.thumb" alt="" width="84">
						</a>
					</waterfall-slot>
				</waterfall>
				<div class="loading" v-show="list.request">
					<div class="rect rect1"></div>
					<div class="rect rect2"></div>
					<div class="rect rect3"></div>
					<div class="rect rect4"></div>
					<div class="rect rect5"></div>
				</div>
				<div class="underline" v-show="list.isfull">就这么多了</div>
			</div>
			<div ref="boxBottom"></div>
		</div>

	</div>
</template>
<script>
import EventBus from "@/common/eventBus.js";
import Dispatch from "@/common/dispatch.js";
import Waterfall from "vue-waterfall/lib/waterfall";
import WaterfallSlot from "vue-waterfall/lib/waterfall-slot";
import $ from "jquery";
import autosize from "autosize";
import common from "@/common/common.js";
export default {
  data() {
    return {
      list: {
        data: [],
        isfull: false,
        request: false,
        page: 2 //瀑布流请求起始页码
      },

      //文字生成请求列表,2秒生成一次
      requestList: []
    };
  },
  watch: {
    getNowPageTextList(val) {
      autosize($(".quick-edit-textarea"));
    }
  },
  computed: {
    //是否显示tab
    tabShow() {
      if (
        this.getNowPageTextList.length == 0 ||
        this.$store.state.docData.quick_design == false
      ) {
        return false;
      } else {
        return true;
      }
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      if (this.$store.state.docData.page.length > 0) {
        return this.$store.state.docData.page[
          this.$store.state.docData.editor.nowPage
        ].data;
      } else {
        console.log("没有任何页面数据,无法完成载入");
        return [];
      }
    },
    //获取当前页的文本元素
    getNowPageTextList() {
      var textList = [];
      for (let i in this.getNowPageData) {
        if (this.getNowPageData[i].type == "text") {
          //判断是否为竖排文字
          let verticalText = true;
          let textJson = this.getNowPageData[i].edit_data.textJson;
          console.log("我正在判断是否为竖排文本", textJson);
          if (textJson != null) {
            //判断当前textJson是否所有行的text长度都是1
            let totalOneCharLine = 0;
            for (let a in textJson) {
              let lineItem = textJson[a];
              if (lineItem.text.length == 1) {
                totalOneCharLine++;
              }
            }
            console.log(
              "totalOneCharLine",
              totalOneCharLine,
              "total",
              textJson.length
            );
            console.log(
              "单行一个文字的行数:",
              totalOneCharLine,
              "总行数",
              textJson.length
            );
            if (
              !(
                totalOneCharLine > 1 &&
                textJson.length > 1 &&
                totalOneCharLine == textJson.length
              )
            ) {
              verticalText = false;
              console.warn("这是横排文字");
            } else {
              console.log("我R你", totalOneCharLine > 1);
            }
          } else {
            verticalText = false;
          }
          console.warn("verticalText", verticalText);

          textList.push({
            item: this.getNowPageData[i],
            verticalText
          });
        }
      }

      return textList.reverse();
    },
    //获取选中的元素
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },
  components: { Waterfall, WaterfallSlot },
  methods: {
    getRows(item) {
      if (item.verticalText) {
        return 3;
      } else {
        return item.item.edit_data.textJson.length;
      }
    },
    onTextMousemove(e) {
      let x = e.offsetX;
      let y = e.offsetY;
      let w = e.target.clientWidth;
      let h = e.target.clientHeight;
      if (Math.abs(w - x) < 20 && Math.abs(h - y) < 20) {
        e.target.style.cursor = "nw-resize";
      } else {
        e.target.style.cursor = "text";
      }
    },
    //获取文本元素的textarea文本
    getElementText(item) {
      let text = "";
      let textJson = item.item.edit_data.textJson;
      if (textJson == undefined || textJson.length == 0) {
        return "";
      }
      textJson.forEach((line, index) => {
        line.text.forEach(char => {
          text += char.char;
        });
        if (textJson.length - 1 != index && item.verticalText == false) {
          text += "\n";
        }
      });
      return text;
    },
    getTextareaClass(item) {
      if (this.selectedItem == null) {
        return [];
      }
      if (item.id == this.selectedItem.id) {
        return ["active"];
      }
      return [];
    },
    //选中文本元素
    onTextClick(item) {
      EventBus.$emit("stopAllEdit");
      this.$store.commit("setselectedItem", null);
      this.$store.commit("setSelectionBox", [{ name: "items", val: [] }]);
      this.$store.commit("setselectedItem", item);
    },
    //输入文本时
    onTextInput(item) {
      //判断是否存在于requestList
      let idx = common.findArrayIndex(this.requestList, "id", item.item.id);
      let value = event.target.value;
      //如果是竖排文字,则为每个文字增加换行符
      if (item.verticalText) {
        let newValue = "";
        for (let ii = 0; ii < value.length; ii++) {
          let char = value.charAt(ii);
          newValue += char;
          if (ii != value.length - 1) {
            newValue += "\n";
          }
        }
        value = newValue;
      }
      let obj = {
        item: item.item,
        value,
        id: item.item.id
      };
      if (idx == -1) {
        //添加
        this.requestList.push(obj);
      } else {
        //替换
        this.requestList[idx] = obj;
      }
    },
    //生成文本
    createText(item, value) {
      let inputText = value;
      let zoom = item.edit_config.width / item.edit_config.originalWidth;
      if (inputText.length == 0) {
        inputText = "请输入文本";
      }
      //获取第一行的style
      let lineStyle = {
        align: item.edit_data.textJson[0].align,
        lineHeight: item.edit_data.textJson[0].lineHeight
      };
      //获取第一个字符的style
      let charStyle = {
        color: item.edit_data.textJson[0].text[0].color,
        letterSpacing: item.edit_data.textJson[0].text[0].letterSpacing,
        bold: item.edit_data.textJson[0].text[0].bold,
        italic: item.edit_data.textJson[0].text[0].italic,
        underline: item.edit_data.textJson[0].text[0].underline,
        family: item.edit_data.textJson[0].text[0].family,
        size: item.edit_data.textJson[0].text[0].size * zoom
      };
      //生成textJson和html
      let newTextJson = [];
      let newHtml = $("<div></div>");

      let nowLine = Object.assign({}, lineStyle, { text: [] });
      let nowLineHtml = $("<p></p>");

      for (let ii = 0; ii < inputText.length; ii++) {
        let char = inputText.charAt(ii);
        //console.log('text', char, 'code', char.charCodeAt());

        //换行
        if (char.charCodeAt() == 10) {
          if (nowLine.text.length == 0) {
            nowLine.text.push(Object.assign({}, charStyle, { char: " " }));
            nowLineHtml.append("&nbsp;");
          }

          newTextJson.push(nowLine);
          //---
          nowLineHtml.css("font-family", charStyle.family);
          nowLineHtml.css("letter-spacing", charStyle.letterSpacing);
          nowLineHtml.css("font-size", charStyle.size);
          nowLineHtml.css("text-align", lineStyle.align);
          nowLineHtml.css("color", charStyle.color);
          nowLineHtml.css("line-height", lineStyle.lineHeight / 100);
          //包裹加粗倾斜
          if (charStyle.bold == 1) {
            nowLineHtml.wrap("b");
          }
          if (charStyle.italic == 1) {
            nowLineHtml.wrap("i");
          }
          if (charStyle.underline == 1) {
            nowLineHtml.wrap("u");
          }
          newHtml.append(nowLineHtml);
          //---
          nowLine = Object.assign({}, lineStyle, { text: [] });
          nowLineHtml = $("<p></p>");
        } else {
          nowLine.text.push(
            Object.assign({}, charStyle, {
              char
            })
          );
          //添加字符
          nowLineHtml.append(char);
        }
      }
      newTextJson.push(nowLine);
      //---
      nowLineHtml.css("font-family", charStyle.family);
      nowLineHtml.css("letter-spacing", charStyle.letterSpacing);
      nowLineHtml.css("font-size", charStyle.size);
      nowLineHtml.css("text-align", lineStyle.align);
      nowLineHtml.css("color", charStyle.color);
      nowLineHtml.css("line-height", lineStyle.lineHeight / 100);
      //包裹加粗倾斜
      if (charStyle.bold == 1) {
        nowLineHtml.wrap("b");
      }
      if (charStyle.italic == 1) {
        nowLineHtml.wrap("i");
      }
      if (charStyle.underline == 1) {
        nowLineHtml.wrap("u");
      }
      newHtml.append(nowLineHtml);
      //---

      if (newTextJson == null) {
        alert("文字生成出现异常!请重新创建(err:01)");
        return;
      }

      item.edit_data.textJson = newTextJson;

      item.edit_data.text = newHtml.html();
      EventBus.$emit("updateTextElement", {
        item,
        snap: true
      });
    },

    addElement(type, val) {
      if (type == "text") {
        EventBus.$emit("addElement", {
          type: type,
          font: val
        });
      } else {
        EventBus.$emit("addElement", {
          type: type,
          url: val
        });
      }
    },
    handleDragstart(type, url) {
      this.$store.state.editor.dragEvent.type = type;
      this.$store.state.editor.dragEvent.url = url;
    },
    scroll() {
      if (this.list.isfull || this.list.request) {
        return;
      } //加载完毕或请求中，返回
      var _self = this;
      var bottomHeight = this.$refs.boxBottom.offsetTop,
        scrollTop = event.target.scrollTop,
        boxHeight = this.$refs.textBox.offsetHeight;
      if (bottomHeight - boxHeight - scrollTop < 30) {
        //请求开示
        this.list.request = true;
        Dispatch.getTextList(this.list.page, function(data) {
          // 请求结束
          _self.list.request = false;
          _self.list.page++;
          if (data.length == 0) {
            _self.list.isfull = true;
            return;
          }
          var data = _self.list.data.concat(data);
          _self.list.data = data;
        });
      }
    }
  },
  created() {
    var _self = this;
    EventBus.$on("stateChange", e => {
      if (e.type == "ready") {
        if (this.$store.state.docData.product !== "jianye") {
          Dispatch.getTextList(1, function(data) {
            _self.list.data = data;
          });
        }
      }
    });

    //两秒生成一次文本
    setInterval(() => {
      if (this.requestList.length > 0) {
        this.requestList.forEach(item => {
          this.createText(item.item, item.value);
        });
        this.requestList = [];
      }
    }, 1000);
    //停止编辑
    EventBus.$on("stopEdit", () => {
      autosize.update($(".quick-edit-textarea"));
    });
  }
};
</script>
<style lang="scss">
$blue: #00a2eb;
.text-box {
  height: 100%;
  overflow-y: auto;
  padding-top: 20px;
  padding-left: 23px;
  .quick-edit {
    padding: 8px;
    textarea {
      border: 1px solid #6b6b6b;
      border-radius: 2px;
      line-height: 18px;
      background: #4d5155;
      color: white;
      width: 265px;
      max-width: 100%;
      padding: 5px;
      font-size: 12px;
      margin-left: -8px;
      margin-bottom: 3px;
      overflow: hidden;
      resize: vertical !important;
      position: relative;
      transition: background-color 0.2s;
      &:focus,
      &.active {
        background: #616569;
      }
    }
  }

  .box1 {
    width: 263px;
    padding-bottom: 15px;
    .text1,
    .text2 {
      transition: all 0.2s;
    }
    .text1 {
      font-size: 30px;
      color: #fff;
      text-align: center;
      cursor: pointer;
      height: 60px;
      line-height: 60px;
    }
    .text2 {
      font-size: 20px;
      color: #dcdcdc;
      text-align: center;
      cursor: pointer;
      height: 45px;
      line-height: 45px;
    }
  }
  .box2 {
    margin: 0 -3px;
    width: 270px;
    padding-top: 15px;
    .vue-waterfall-slot {
      padding: 3px;
    }
    .underline {
      padding: 30px;
      color: #757c86;
      text-align: center;
    }
    .loading {
      width: 80px;
      height: 40px;
      margin: 10px auto;
      text-align: center;
      .rect {
        animation: loading 1.2s infinite ease-in-out;
      }
      .rect {
        display: inline-block;
        width: 6px;
        height: 100%;
        background-color: $blue;
        &.rect1 {
          animation-delay: 0;
        }
        &.rect2 {
          animation-delay: 0.1s;
        }
        &.rect3 {
          animation-delay: 0.2s;
        }
        &.rect4 {
          animation-delay: 0.3s;
        }
        &.rect5 {
          animation-delay: 0.4s;
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// text.vue?e7695cd2