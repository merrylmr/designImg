<template>
	<div class="text-tool-bar">
		<color-picker class="item" :color="nowColor" type="color" @onChange="onColorChange"></color-picker>
		<div class="split"></div>
		<combo-box class="item" style="width: 170px;" type="font" inputAble="false" :selected="nowSelectedFontFamily" @onChange="setFontFamily"></combo-box>
		<div class="split"></div>
		<combo-box class="item" style="width: 80px;" type="number" inputAble="false" :dataSource="fontSizeArrDataSource" :selected="nowSelectedFontSize" @onChange="setFontSize"></combo-box>

		<div class="split"></div>
		<!--收起更多按钮 begin-->
		<span class="tool-text no-margin" style="transform:scaleX(-1)" v-show="btnShowMode=='right'"  @click.stop="btnShowMode='left'">
			<i class="tbzico ico-arrowRight"></i>
		</span>
		<!--收起更多按钮 end-->
		<span :class="['tool-text','tool-ico','c-bold',{'active':getBoldActive}]" v-show="btnShowMode=='left'" @click="setBold">
			<i class="tbzico ico-eBold"></i>
		</span>
		<span :class="['tool-text','tool-ico','c-italic',{'active':getItalicActive}]" v-show="btnShowMode=='left'" @click="setItalic">
			<i class="tbzico ico-eItalic"></i>
		</span>
		<span :class="['tool-text','tool-ico','c-underline',{'active':getUnderlineActive}]" v-show="btnShowMode=='right'" @click="setUnderLine">
			<i class="tbzico ico-eUnderline"></i>
		</span>
		<span :class="['tool-text','tool-ico','c-upper',{'active':getCaseActive}]" v-show="btnShowMode=='right'" @click="setCase">
			<i class="tbzico ico-eUpper"></i>
		</span>
		<span :data-disable="getRadian" :title="getRadian?'在开启文字弧度的情况下,不支持修改此属性':''" class="tool-text tool-ico c-align" @click.stop="callModal({type:'align',modalOver:false})" v-show="btnShowMode=='left'">
			<i :class="getAlignIconClass"></i>
		</span>
		<span class="tool-text tool-ico c-radian" @click="callModal({type:'textRadian',modalOver:false})" v-show="btnShowMode=='right'" style="margin-right:10px" >
			<i class="tbzico ico-eRound"></i>
		</span>
		<!--展开更多按钮 begin-->
		<span class="tool-text" v-show="btnShowMode=='left'" @click.stop="btnShowMode='right'">
			<i class="tbzico ico-arrowRight"></i>
		</span>
		<!--展开更多按钮 end-->
		<div class="split" style="margin:0"></div>
		<span class="tool-text" :data-disable="getRadian" @click.stop="callSlide('fontLength',{type:'slide',modalOver:false})" :title="getRadian?'在开启文字弧度的情况下,仅支持单行文本,不支持修改此属性':''">字距设置</span>
		<!-- modal -->
		<align type="text" :align="nowAlign" style="left:370px"></align>
		<text-radian></text-radian>
	</div>
</template>
<script>
import align from "@/components/editor/modal/toolbar/align";
import textRadian from "@/components/editor/modal/toolbar/textRadian";
import colorPicker from "./../modal/colorPicker";
import comboBox from "./../modal/comboBox";
import eventBus from "@/common/eventBus.js";
import common from "@/common/common.js";
import socket from "@/common/socket.js";
import $ from "jquery";
export default {
  data() {
    return {
      //文字大小
      fontSizeArrDataSource: [],
      btnShowMode: "left"
    };
  },
  created() {
    var _self = this;
    //创建文字大小列表
    for (var i = 5; i <= 800; i++) {
      this.fontSizeArrDataSource.push({
        option: i,
        value: i
      });
    }

    eventBus.$on("afterChange", this.afterChangeHandle);
    eventBus.$on("align-change", this.alignChangeHandle);
  },
  beforeDestroy() {
    eventBus.$off("afterChange", this.afterChangeHandle);
    eventBus.$off("align-change", this.alignChangeHandle);
  },
  computed: {
    getRadian() {
      if (this.nowEditText != null) {
        if (this.nowEditText.edit_data.textRadian != 0) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    },
    //是否加粗
    getBoldActive() {
      if (this.nowEditText.edit_data.textJson != null) {
        var val = this.nowEditText.edit_data.textJson[0].text[0].bold;
        return val;
      } else {
        return false;
      }
    },
    //是否下划线
    getUnderlineActive() {
      if (this.nowEditText.edit_data.textJson != null) {
        var val = this.nowEditText.edit_data.textJson[0].text[0].underline;
        return val;
      } else {
        return false;
      }
    },
    //是否倾斜
    getItalicActive() {
      if (this.nowEditText.edit_data.textJson != null) {
        var val = this.nowEditText.edit_data.textJson[0].text[0].italic;
        //console.log('val',val);
        return val;
      } else {
        return false;
      }
    },
    //是否大写
    getCaseActive() {
      if (this.nowEditText.edit_data.textJson != null) {
        //获取第一个字母文字,判断大小写
        var textJson = this.nowEditText.edit_data.textJson;
        var noLetter = true;

        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            var char = textJson[i].text[a].char;
            //判断是字母,
            if (/^[a-zA-Z]+$/.test(char)) {
              noLetter = false;
              if (/^[a-z]+$/.test(char)) {
                return false;
              }
            }
          }
        }

        if (noLetter) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    getAlignIconClass() {
      if (this.nowEditText.edit_data.textJson != null) {
        var val = this.nowEditText.edit_data.textJson[0].align;
        if (val == "left") {
          return ["tbzico", "ico-eAlign"];
        } else if (val == "center") {
          return ["tbzico", "ico-eAcenter"];
        } else if (val == "right") {
          return ["tbzico", "ico-eAlign", "ico-reverseX"];
        }
      } else {
        return ["tbzico", "ico-eAlign"];
      }
    },
    nowColor: {
      get() {
        if (this.nowEditText.edit_data.textJson != null) {
          var defaultColor = this.nowEditText.edit_data.textJson[0].text[0]
            .color;
          return defaultColor;
        }
        return "#000000";
      },
      set(val) {
        this.nowEditText.edit_data.textJson[0].text[0].color = val;
      }
    },
    //当前对齐方式
    nowAlign() {
      if (
        this.nowEditText.edit_data.textJson != undefined &&
        this.nowEditText.edit_data.textJson.length > 0
      ) {
        //console.log('获取对齐方式',this.nowEditText.edit_data.textJson[0].align);
        return this.nowEditText.edit_data.textJson[0].align;
      } else {
        return "";
      }
    },
    //行高
    lhData() {
      var defaultVal = 100;
      if (this.nowEditText.edit_data.textJson != null) {
        //获取第一行字的lineHeight
        var defaultLineHeight = this.nowEditText.edit_data.textJson[0]
          .lineHeight;
        //遍历搜索,所有的行的lineHeight是否一致
        var textJson = this.nowEditText.edit_data.textJson;
        var finded = false;
        for (var i = 0; i < textJson.length; i++) {
          if (textJson[i].lineHeight != defaultLineHeight) {
            finded = true;
            break;
          }
        }
        //finded=false,则一致,将defaultLineHeight加入到defaultVal
        if (finded == false) {
          defaultVal = defaultLineHeight;
        }
      }
      return [
        {
          title: "字行距",
          type: "lineHeight",
          max: 1000,
          min: 0,
          val: defaultVal
        }
      ];
    },
    //字间距
    lsData() {
      var defaultVal = 0;
      if (this.nowEditText.edit_data.textJson != null) {
        //获取第一个字的letterSpacing
        var defaultLetterSpacing = this.nowEditText.edit_data.textJson[0]
          .text[0].letterSpacing;

        //遍历搜索,所有的行的lineHeight是否一致
        var textJson = this.nowEditText.edit_data.textJson;
        var finded = false;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            if (textJson[i].text[a].letterSpacing != defaultLetterSpacing) {
              finded = true;
              break;
            }
          }
        }
        if (finded == false) {
          defaultVal = defaultLetterSpacing;
        }
      }
      return [
        {
          title: "字间距",
          type: "letterSpace",
          max: 100,
          min: -20,
          val: defaultVal
        }
      ];
    },
    //获取当前选中的字体
    nowSelectedFontFamily() {
      if (this.nowEditText.edit_data.textJson != null) {
        var font = this.nowEditText.edit_data.textJson[0].text[0].family;
        return font;
      }
      return "a1";
    },
    //获取当前选中字体的文字大小
    nowSelectedFontSize() {
      if (this.nowEditText.edit_data.textJson != null) {
        var zoom =
          this.nowEditText.edit_config.width /
          this.nowEditText.edit_config.originalWidth;
        if (
          this.nowEditText.edit_data.textRadian != 0 &&
          this.nowEditText.edit_data.textJson.length == 1
        ) {
          zoom = 1;
        }
        var size = this.nowEditText.edit_data.textJson[0].text[0].size;

        var result = common.fixNumber(
          common.px2pt(size, this.userDPI, this.tplDPI) * zoom,
          2
        );

        //将像素转换为pt
        return result;
      }
      return 10;
    },

    //获取当前正在编辑的文本
    nowEditText() {
      if (this.$store.state.stage.selectedItem != null) {
        return this.$store.state.stage.selectedItem;
      } else if (this.$store.state.editor.nowEditText != null) {
        return this.$store.state.editor.nowEditText;
      }
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
    //获取userDPI
    userDPI() {
      return this.$store.state.editor.userDPI;
    },
    //获取模板像素
    tplDPI() {
      return this.$store.state.docData.edit_config.dpi;
    }
  },
  components: { colorPicker, comboBox, align, textRadian },
  methods: {
    //align回调
    alignChangeHandle(data) {
      this.setAlign(data);
    },
    //afterChange回调
    afterChangeHandle(data) {
      console.log("afterChangeHandle", data);
      if (data.type == "lineHeight") {
        this.setLineHeight(data.val, data.snap);
      } else if (data.type == "letterSpace") {
        this.setLetterSpacing(data.val, data.snap);
      }
    },
    callSlide(type, data) {
      if (event.target.dataset.disable == "true") {
        this.$store.commit("callModal");
        return;
      }
      if (type == "fontLength") {
        this.$store.state.editor.slide.data = this.lsData.concat(this.lhData);
        this.$store.state.editor.slide.pos = { left: "400px" };
      }

      this.$store.commit("callModal");
      this.$store.commit("callModal", data);
    },
    callModal(data) {
      if (event.target.dataset.disable == "true") {
        this.$store.commit("callModal");
        return;
      }
      this.$store.commit("callModal");
      this.$store.commit("callModal", data);
    },
    //命令-----

    //计算文字大小,并更新到textJson(仅用于非编辑模式下更新textJson)
    updateFontSize() {
      if (
        this.nowEditText.edit_data.textRadian != 0 &&
        this.nowEditText.edit_data.textJson.length == 1
      ) {
        return;
      }
      var zoom =
        this.nowEditText.edit_config.width /
        this.nowEditText.edit_config.originalWidth;
      this.nowEditText.edit_data.editAreaWidth =
        this.nowEditText.edit_data.editAreaWidth *
        (this.nowEditText.edit_data.editAreaWidth ==
        this.nowEditText.edit_config.width
          ? 1
          : zoom);

      var size = this.nowEditText.edit_data.textJson[0].text[0].size * zoom;

      var textJson = this.nowEditText.edit_data.textJson;
      for (var i = 0; i < textJson.length; i++) {
        for (var a = 0; a < textJson[i].text.length; a++) {
          textJson[i].text[a].size = size;
        }
      }
    },
    //设置大小写
    setCase() {
      //获取第一个字母文字,判断大小写
      var textJson = this.nowEditText.edit_data.textJson;
      //lower=小写 upper=大写
      var _case = "lower";
      for (var i = 0; i < textJson.length; i++) {
        for (var a = 0; a < textJson[i].text.length; a++) {
          var char = textJson[i].text[a].char;
          //判断是字母,
          if (/^[A-Za-z]+$/.test(char)) {
            if (/^[a-z]+$/.test(char)) {
              _case = "lower";
            } else {
              _case = "upper";
            }
            break;
          }
        }
      }
      //遍历textJson,转换大小写
      for (var i = 0; i < textJson.length; i++) {
        for (var a = 0; a < textJson[i].text.length; a++) {
          if (_case == "upper") {
            textJson[i].text[a].char = textJson[i].text[a].char.toLowerCase();
          } else {
            textJson[i].text[a].char = textJson[i].text[a].char.toUpperCase();
          }
        }
      }
      //获取text,遍历文字节点,转换大小写
      var $tempHtml = $("<div></div>");
      $tempHtml.append(this.nowEditText.edit_data.text);
      $tempHtml
        .children("p")
        .find("*")
        .contents()
        .each(function() {
          if (this.nodeType == 3) {
            if (_case == "upper") {
              $(this).replaceWith(
                $(this)
                  .text()
                  .toLowerCase()
              );
            } else {
              $(this).replaceWith(
                $(this)
                  .text()
                  .toUpperCase()
              );
            }
          }
        });
      this.nowEditText.edit_data.text = $tempHtml.html();

      if (this.editMode == "selected") {
        this.updateFontSize();
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        //如果正在编辑状态,修改
        eventBus.$emit("setTextEditorHtml", this.nowEditText.edit_data.text);
      }
    },
    //设置加粗
    setBold() {
      if (this.editMode == "selected") {
        this.updateFontSize();
        //获取第一个元素的itatlc
        console.log(this.nowEditText.edit_data.textJson[0].text[0].bold);
        var nowBold = this.nowEditText.edit_data.textJson[0].text[0].bold;
        console.log("bold", nowBold);
        //遍历textJson,修改文字大小
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            if (nowBold == 0) {
              textJson[i].text[a].bold = 1;
            } else {
              textJson[i].text[a].bold = 0;
            }
          }
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:03)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;

        //遍历html所有带style并带font-size的属性
        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");

        if (nowBold == 1) {
          //关闭倾斜
          $text
            .find("b")
            .contents()
            .unwrap();
        } else {
          //打开倾斜
          $text
            .children("p")
            .contents()
            .wrap("<b></b>");
        }
        this.nowEditText.edit_data.text = $text.html();
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        eventBus.$emit("text-edit", {
          type: "bold",
          val: null
        });
      }
    },
    //设置下划线
    setUnderLine() {
      if (this.editMode == "selected") {
        this.updateFontSize();
        //获取第一个元素的itatlc
        console.log(this.nowEditText.edit_data.textJson[0].text[0].underLine);
        var nowUnderLine = this.nowEditText.edit_data.textJson[0].text[0]
          .underline;

        //遍历textJson,修改文字大小
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            if (nowUnderLine == 0) {
              textJson[i].text[a].underline = 1;
            } else {
              textJson[i].text[a].underline = 0;
            }
          }
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:04)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;
        console.log("处理前", this.nowEditText.edit_data.text);
        //遍历html所有带style并带font-size的属性
        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");

        if (nowUnderLine == 1) {
          //关闭倾斜
          $text
            .find("u")
            .contents()
            .unwrap();
        } else {
          //打开倾斜
          $text
            .children("p")
            .contents()
            .wrap("<u></u>");
        }
        this.nowEditText.edit_data.text = $text.html();
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        eventBus.$emit("text-edit", {
          type: "underline",
          val: null
        });
      }
    },
    //设置颜色
    setColor(color) {
      if (this.editMode == "selected") {
        this.updateFontSize();
        //遍历textJson,修改文字颜色
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            textJson[i].text[a].color = color;
          }
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:05)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;
        //遍历html所有带style并带font-size的属性

        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");

        //删除所有font的颜色属性
        $text.find("font").attr("color", "");
        $text.find("font").css("color", "");
        //删除所有font
        if ($text.find(".warp").length > 0) {
          //添加颜色
          $text.find(".warp").css("color", color);
        } else {
          //添加颜色
          $text.children("p").css("color", color);
        }

        this.nowEditText.edit_data.text = $text.html();
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        eventBus.$emit("text-edit", {
          type: "foreColor",
          val: color
        });
      }
    },
    //设置倾斜
    setItalic() {
      if (this.editMode == "selected") {
        this.updateFontSize();
        //获取第一个元素的itatlc
        console.log(this.nowEditText.edit_data.textJson[0].text[0].italic);
        var nowItalic = this.nowEditText.edit_data.textJson[0].text[0].italic;
        console.log("italic", nowItalic);
        //遍历textJson,修改文字大小
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            if (nowItalic == 0) {
              textJson[i].text[a].italic = 1;
            } else {
              textJson[i].text[a].italic = 0;
            }
          }
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:06)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;
        console.log("处理前", this.nowEditText.edit_data.text);
        //遍历html所有带style并带font-size的属性
        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");

        if (nowItalic == 1) {
          //关闭倾斜
          $text
            .find("i")
            .contents()
            .unwrap();
        } else {
          //打开倾斜
          $text
            .children("p")
            .contents()
            .wrap("<i></i>");
        }
        this.nowEditText.edit_data.text = $text.html();
        console.log("处理后", this.nowEditText.edit_data.text);
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        eventBus.$emit("text-edit", {
          type: "italic",
          val: null
        });
      }
    },
    //设置对齐
    setAlign(align) {
      var styleObj = {};
      if (align == "justify") {
        styleObj = {
          textAlign: "",
          textAlignLast: "justify"
        };
      } else {
        styleObj = {
          textAlign: align,
          textAlignLast: ""
        };
      }

      if (this.editMode == "selected") {
        this.updateFontSize();
        //遍历textJson,修改文字对齐
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          textJson[i].align = align;
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:07)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;
        //遍历html所有带style并带font-size的属性
        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");
        if (align == "justify") {
          $text.children("p").css("text-align", "");
          $text.children("p").css("text-align-last", "justify");
        } else {
          $text.children("p").css("text-align", align);
          $text.children("p").css("text-align-last", "");
        }

        this.nowEditText.edit_data.text = $text.html();
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        console.log("设置样式", styleObj);
        eventBus.$emit("text-edit-all", {
          type: "text-align",
          val: styleObj.textAlign
        });
        eventBus.$emit("text-edit-all", {
          type: "text-align-last",
          val: styleObj.textAlignLast
        });
      }
    },

    //设置字号
    setFontSize(item) {
      var pxSize = common.pt2px(item.value, this.userDPI, this.tplDPI);
      if (this.editMode == "selected") {
        //遍历textJson,修改文字大小
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            textJson[i].text[a].size = pxSize;
          }
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:08)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;
        //遍历html所有带style并带font-size的属性
        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");
        $text.find("*[style]").each(function() {
          if ($(this).css("font-size") != "") {
            $(this).css("font-size", pxSize + "px");
          }
        });
        this.nowEditText.edit_data.text = $text.html();
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: true,
          updateArea: true
        });
      } else if (this.editMode == "edit") {
        console.log("设置字号");
        var cloneJson = JSON.parse(
          JSON.stringify(this.nowEditText.edit_data.textJson)
        );
        //修改他们的文字大小
        for (var i = 0; i < cloneJson.length; i++) {
          for (var a = 0; a < cloneJson[i].text.length; a++) {
            cloneJson[i].text[a].size = pxSize;
          }
        }
        eventBus.$emit("text-edit-all", {
          type: "font-size",
          val: pxSize + "px"
        });
        //提交到服务器,等待返回
        // socket.textToSvg(cloneJson, null, function(e) {
        // 	//获取新的宽度
        // 	var $width = parseFloat($(e.data).attr('width'));
        // 	//修改textEditor的宽度
        // 	eventBus.$emit('setTextEditorWidth', $width + 10);
        // 	console.log('新宽度:', $width);
        // 	eventBus.$emit('text-edit-all', {
        // 		type: 'font-size',
        // 		val: pxSize + 'px'
        // 	});
        // })
      }
    },

    //设置行距
    setLineHeight(val, snap) {
      // if (this.editMode == 'selected') {
      // 	this.updateFontSize();

      // 	//遍历textJson,修改文字大小
      // 	var textJson = this.nowEditText.edit_data.textJson;
      // 	for (var i = 0; i < textJson.length; i++) {
      // 		textJson[i].lineHeight = val;
      // 	}
      // 	this.nowEditText.edit_data.textJson = textJson;

      // 	//遍历html所有带style并带font-size的属性
      // 	var $text = $('<div>' + this.nowEditText.edit_data.text + '</div>');
      // 	$text.children('p').each(function() {
      // 		$(this).css('line-height', val / 100)
      // 	});
      // 	this.nowEditText.edit_data.text = $text.html();
      // 	//提交文字生成请求

      // 	eventBus.$emit('updateTextElement', {
      // 		item: this.nowEditText, snap
      // 	});

      // } else if (this.editMode == 'edit') {
      // 	eventBus.$emit('text-edit-all', {
      // 		type: 'line-height',
      // 		val: (val / 100)
      // 	});
      // }

      //如果没有处在编辑模式,则进入编辑模式
      if (this.editMode == "selected") {
        console.log("进入文字编辑模式");
        eventBus.$emit("startTextEdit", this.nowEditText);
      }
      eventBus.$emit("text-edit-all", {
        type: "line-height",
        val: val / 100
      });
    },
    //设置文字间距
    setLetterSpacing(val, snap) {
      // if (this.editMode == 'selected') {
      // 	this.updateFontSize();
      // 	//遍历textJson,修改文字大小
      // 	var textJson = this.nowEditText.edit_data.textJson;
      // 	for (var i = 0; i < textJson.length; i++) {
      // 		for (var a = 0; a < textJson[i].text.length; a++) {
      // 			textJson[i].text[a].letterSpacing = val;
      // 		}
      // 	}

      // 	this.nowEditText.edit_data.textJson = textJson;
      // 	//遍历html所有带style并带font-size的属性
      // 	var $text = $('<div>' + this.nowEditText.edit_data.text + '</div>');
      // 	$text.children('p').each(function() {
      // 		$(this).css('letter-spacing', val + 'px')
      // 	});
      // 	this.nowEditText.edit_data.text = $text.html();
      // 	console.log('写入文字间距', $text.html());
      // 	//提交文字生成请求
      // 	eventBus.$emit('updateTextElement', {
      // 		item: this.nowEditText, snap
      // 	});

      // } else if (this.editMode == 'edit') {
      // 	eventBus.$emit('text-edit-line-style', {
      // 		letterSpacing: val + 'px'
      // 	});
      // }
      //如果没有处在编辑模式,则进入编辑模式
      if (this.editMode == "selected") {
        eventBus.$emit("startTextEdit", this.nowEditText);
      }
      // eventBus.$emit('text-edit-all', {
      // 	letterSpacing: val + 'px'
      // });
      eventBus.$emit("text-edit-all", {
        type: "letter-spacing",
        val: val + "px"
      });
    },
    //设置字体
    setFontFamily(val) {
      if (this.editMode == "selected") {
        this.updateFontSize();
        //遍历textJson,修改字体
        var textJson = this.nowEditText.edit_data.textJson;
        for (var i = 0; i < textJson.length; i++) {
          for (var a = 0; a < textJson[i].text.length; a++) {
            textJson[i].text[a].family = val.value;
          }
        }
        if (textJson == null) {
          alert("文字生成出现异常!请重新创建(err:10)");
          return;
        }
        this.nowEditText.edit_data.textJson = textJson;
        //修改html
        var $text = $("<div>" + this.nowEditText.edit_data.text + "</div>");
        //删除所有face属性
        $text.find("font[face]").attr("face", null);
        //包裹新字体
        $text
          .find(".defaultFace")
          .contents()
          .unwrap();
        $text
          .children("p")
          .contents()
          .wrap('<font class="defaultFace" face="' + val.value + '"></font>');
        this.nowEditText.edit_data.text = $text.html();
        //提交文字生成请求
        eventBus.$emit("updateTextElement", {
          item: this.nowEditText,
          snap: false
        });
      } else if (this.editMode == "edit") {
        eventBus.$emit("text-edit", {
          type: "FontName",
          val: val.value
        });
      }
    },
    //事件-----
    //当颜色选择器选择新颜色时
    onColorChange(color) {
      this.nowColor = color;
      this.setColor(color);
    }
  }
};
</script>
<style lang="scss">
.text-tool-bar {
  position: relative;
  float: left;
  width: 600px;
  .combo-box {
    float: left;
  }
  .item {
    display: inline-block;
  }
  .align-icon {
    background: url(../../../assets/images/icon/ico-align.png) no-repeat;
  }
  .active {
    background-color: #e5e5e5 !important;
  }
  .no-padding {
    padding: 0;
  }
  .no-margin {
    margin: 0;
  }
}

*[data-disable] {
  opacity: 0.5;
}
</style>


// WEBPACK FOOTER //
// textTool.vue?dcac9484