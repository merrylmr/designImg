<template>
	<div data-noselect>
		<!--编辑框区域-->
		<div class="text-editor-selection" :style="getTextEditorStyle">
			<div id="textEditor" ref="textEditor" class="text-editor" :style="{marginTop:textEditorMarginTop+'px'}" :contenteditable="!resizing" @input="onTextChange" @blur="onBlur">
			</div>
		</div>
		<!--自由缩放工具-->
		<div class="text-selection-tool" ref="textSelectionTool" :style="getSelectionStyle">
			<div class="point" @mousedown="selectionPointMouseDown"></div>
			<!--加载提示-->
			<div class="load-state" v-if="loading">
				<i class="tbzico ico-loading"></i>
			</div>
		</div>
		<!--换行计算隐藏区域-->
		<div id="textEditorHidden" ref="textEditorHidden" class="text-editor-hidden" :style="getTempTextStyle">
		</div>
		<!--文本宽度区域计算-->
		<div id="textLineHidden" ref="textLineHidden">
		</div>

	</div>
</template>
<script>
import eventBus from "@/common/eventBus.js";
import $ from "jquery";
import common from "@/common/common.js";

export default {
  props: ["item"],
  data() {
    return {
      htmlJsonArr: [],
      width: 0,
      getSelectionStyle: {
        left: "0",
        top: "0",
        width: "0",
        height: "0"
      },
      getTextEditorStyle: {
        left: "0",
        top: "0",
        width: "0",
        transformOrigin: "0% 0%",
        transform: ""
      },
      svgRect: null,
      resizing: false,
      textEditorMarginTop: 0,
      loading: false
    };
  },
  computed: {
    //获取临时区域样式
    getTempTextStyle() {
      if (this.nowEditText != null) {
        var styleObj = {};
        var zoomX =
          this.nowEditText.edit_config.width /
          this.nowEditText.edit_config.originalWidth;

        styleObj.width = this.width + "px";

        styleObj.transform = "scale(" + this.getZoom + ")";
        styleObj.opacity = 0;
        styleObj.pointerEvents = "none";
        return styleObj;
      }
    },
    //获取当前的缩放比例
    getZoom() {
      return this.$store.state.stage.zoom / 100;
    },
    //获取当前正在编辑的文本
    nowEditText() {
      if (this.$store.state.editor.nowEditText != null) {
        return this.$store.state.editor.nowEditText;
      }
    },
    //获取编辑区宽度
    getWidth() {
      return this.nowEditText.edit_config.width * this.getZoom;
    },
    //获取编辑区高度
    getHeight() {
      return this.nowEditText.edit_config.height * this.getZoom;
    },
    //获取mouse状态
    getMouse() {
      return this.$store.state.stage.mouse;
    },
    //获取userDPI
    userDPI() {
      return this.$store.state.editor.userDPI;
    },
    //获取模板像素
    tplDPI() {
      return this.$store.state.docData.edit_config.dpi;
    },
    //获取当前文档,当前页的数据
    getNowPageData() {
      if (this.$store.state.docData.page.length > 0) {
        return this.$store.state.docData.page[
          this.$store.state.docData.editor.nowPage
        ];
      } else {
        console.log("没有任何页面数据,无法完成载入");
        return [];
      }
    }
  },
  methods: {
    //开始编辑
    startEdit() {
      //编辑预处理,重新计算文字大小
      var zoom =
        this.nowEditText.edit_config.width /
        this.nowEditText.edit_config.originalWidth;
      if (
        this.nowEditText.edit_data.textRadian != 0 &&
        this.nowEditText.edit_data.textJson.length == 1
      ) {
        zoom = 1;
      }
      //console.log('编辑text',this.nowEditText.edit_data.text );
      var $textItem = $("<div>" + this.nowEditText.edit_data.text + "</div>");

      if (this.nowEditText.edit_data.textJson == null) {
        $textItem.find("*").each(function() {
          if ($(this).css("font-size") != "") {
            $(this).css(
              "font-size",
              parseFloat($(this).css("font-size")) * zoom + "px"
            );
          }
        });
      } else {
        var size = this.nowEditText.edit_data.textJson[0].text[0].size;
        $textItem.find("*").each(function() {
          if ($(this).css("font-size") != "") {
            $(this).css("font-size", size * zoom + "px");
          }
        });
      }

      this.nowEditText.edit_data.text = $textItem.html();
      $("#textEditor").html(this.nowEditText.edit_data.text);

      this.$nextTick(function() {
        var editor = $("#textEditor").get(0);
        var sel, range;
        if (window.getSelection && document.createRange) {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(true);
          range.setEnd(editor, editor.childNodes.length);
          range.setStart(editor, editor.childNodes.length);
          sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (document.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(editor);
          range.collapse(true);
          range.select();
        }
      });

      if (this.nowEditText.edit_data.textJson != null) {
        //编辑预处理,重新计算文字大小
        var zoom =
          this.nowEditText.edit_config.width /
          this.nowEditText.edit_config.originalWidth;

        this.$nextTick(() => {
          $("#textLineHidden *").remove();
          var widthArr = [];
          ////console.log('textJson',JSON.stringify(this.nowEditText.edit_data.textJson,null,2));
          for (var i = 0; i < this.nowEditText.edit_data.textJson.length; i++) {
            var lineObj = this.nowEditText.edit_data.textJson[i];
            //清空隐藏域
            $("#textLineHidden *").remove();
            //添加字符
            for (var a = 0; a < lineObj.text.length; a++) {
              var text = lineObj.text[a];
              var char = "";
              if (text.char == " ") {
                char = "&nbsp;";
              } else {
                char = text.char;
              }
              //生成字符文本
              var $char = $("<span>" + char + "</span>");
              //字体
              $char.css("font-family", text.family);
              //字体大小
              $char.css("font-size", text.size * zoom);
              //斜体
              if (text.italic) {
                $char.css("font-style", "italic");
              }
              //字母间距
              $char.css("letter-spacing", text.letterSpacing);
              $("#textLineHidden").append($char);
            }
            var itemWidth = $("#textLineHidden")[0].getBoundingClientRect()
              .width;
            widthArr.push(itemWidth);
          }
          //取最大值
          var maxWidth = Math.max.apply(Math, widthArr);

          //判断非编辑模式下缩放文字的比例
          this.width =
            this.nowEditText.edit_data.editAreaWidth *
            (this.nowEditText.edit_data.editAreaWidth ==
            this.nowEditText.edit_config.width
              ? 1
              : zoom);

          this.updateInitPosition();
          $("#textLineHidden *").remove();
        });
      } else {
        //将textJson内的文本逐行添加到隐藏层,获取他们的boundingbox,取最宽的一行的值,赋值给this.width
        var addWidth = 50;
        if (this.$store.state.docData.edit_config.unit == "mm") {
          //毫米

          addWidth = this.$store.state.docData.edit_config.width;
        }
        this.width = this.nowEditText.edit_config.width + addWidth;
        this.updateInitPosition();
      }
      //ajax请求woff,实现加载动画

      this.loading = true;

      this.$nextTick(() => {
        let fontName = this.nowEditText.edit_data.textJson[0].text[0].family;
        $.ajax({
          url: "/static/font/" + fontName + ".woff",
          complete: () => {
            this.loading = false;
          }
        });
      });
    },
    //更新初始化编辑器位置
    updateInitPosition() {
      //更新位置
      this.updateEditorPosition();
      this.$nextTick(function() {
        this.onTextChange();
        this.$nextTick(function() {
          //修正旋转后发生的偏差
          this.fixPosition();
          //全选
          /*$('#textEditor').focus();
					 document.execCommand('selectAll', false, true);*/
        });
      });
    },
    //修正位置(旋转后偏移)
    fixPosition() {
      ////console.log('位置已修正!!');
      var editorRect = this.$refs.textSelectionTool.getBoundingClientRect();

      var cx = editorRect.left - this.svgRect.left;
      var cy = editorRect.top - this.svgRect.top;

      this.getSelectionStyle.left =
        parseFloat(this.getSelectionStyle.left) - cx + "px";
      this.getSelectionStyle.top =
        parseFloat(this.getSelectionStyle.top) - cy + "px";

      this.getTextEditorStyle.left =
        parseFloat(this.getTextEditorStyle.left) - cx + "px";
      this.getTextEditorStyle.top =
        parseFloat(this.getTextEditorStyle.top) - cy + "px";
    },
    //转换html为文字生成服务可识别的json
    getHtmlJson(item, html) {
      var _self = this;
      //记录隐藏域left和top
      var hiddenRect = $("#textEditorHidden")[0].getBoundingClientRect();
      //转换html代码为jquery对象
      var $html = $(html);
      //每行外面包一个font
      ////console.log('$html',$html);
      $html.contents().wrap("<font></font>");
      //遍历每行数据,子元素进行find,获取他们的nodetype,如果=3则为文本
      $html.each(function(line) {
        //查找本行的所有标签
        $(this)
          .find("*")
          .contents()
          .each(function() {
            ////console.log('this:',$(this));

            //判断是否是文本节点,如果是,则将文字分割为单个span
            ////console.log('type:',this.nodeType,'name:',this.nodeName,'text',$(this).text());
            //获取文字分割结果
            var $warpText = $(
              "<div>" + _self.warpSpan($(this).text()) + "</div>"
            );
            $warpText.find("span").addClass("char");
            $warpText.find("span").attr("data-line", line);

            if (this.nodeType == 3) {
              $(this).replaceWith($warpText.html());
            }
            //如果检测到空格,则添加一个空文本
            if (this.nodeName == "BR") {
              $(this).replaceWith(
                '<span class="char" data-line="' + line + '">&nbsp;</span>'
              );
            }
          });
      });

      $("#textEditorHidden").empty();
      //同步宽高
      /*$('#textEditorHidden').width(this.getWidth);
			$('#textEditorHidden').height(this.getHeight);*/
      //将处理结果添加到隐藏域
      $("#textEditorHidden").append($html);

      //遍历所有span元素,为他们加上left,top信息
      $("#textEditorHidden")
        .find(".char")
        .each(function() {
          var spanRect = $(this)[0].getBoundingClientRect();
          var left = spanRect.left - hiddenRect.left;
          var top = spanRect.top - hiddenRect.top;
          $(this).attr("data-left", left);
          $(this).attr("data-top", top);
        });

      //开始生成json
      //结果数组
      var htmlJson = [];
      //当前正在添加的行(包含本行每个的字符)
      var nowLine = {
        align: "",
        lineHeight: 100,
        text: []
      };
      //上次字符的left位置记录(如果当前行的left比上次小,而index并没有更改,说明文字超出换行了,创建一个新的nowLine)
      var lastLeft = null;
      //上次的行line,如果line发生更改,说明当前字符为下一行的内容,创建一个新的nowLine
      var lastLine = 0;
      $("#textEditorHidden")
        .find(".char")
        .each(function() {
          //获取当前字符的信息
          var char = $(this).text();

          //过滤字符

          var ignoreCharArr = [10, 9];
          var ignore = false;
          for (var d in ignoreCharArr) {
            if (ignoreCharArr[d] == char.charCodeAt()) {
              ignore = true;
              break;
            }
          }
          if (ignore == false) {
            //&nbsp;编码特殊处理

            //替换符号[被替换,替换为]
            var charReplaceArr = [[160, 32], [8226, 183]];
            for (var t = 0; t < charReplaceArr.length; t++) {
              if (char.charCodeAt() == charReplaceArr[t][0]) {
                char = String.fromCharCode(charReplaceArr[t][1]);
              }
            }

            var left = parseFloat($(this).data("left"));
            var top = parseFloat($(this).data("top"));
            var line = parseInt($(this).data("line"));

            //如果lastLeft为空,则取第一个字符的left作为left值
            if (lastLeft == null) {
              lastLeft = left;
            }

            //获取行对象的参数
            var $line = $("#textEditorHidden")
              .children("p")
              .eq(line);
            var lineLetterSpacing = $line.css("letter-spacing");
            var lineAlign = $line.css("text-align");
            var lineAlignLast = $line.css("text-align-last");
            if ($line[0] == undefined) {
              return;
            }
            var lineLineHeight = $line[0].style.lineHeight;

            //如果line与上次不一样,则创建一个新行
            if (lastLine != line) {
              ////console.log('新行')
              //修改新行
              lastLine = line;
              //到了新行,肯定要获取新行的第一个left
              lastLeft = left;
              //切换新行前,保存当前行的数据
              if (nowLine.text.length > 0) {
                htmlJson.push(nowLine);
              }

              //重建一个新行的数组,他是空的
              nowLine = {
                align: "",
                lineHeight: 100,
                text: []
              };
            }

            //设置行属性
            if (nowLine.align == "") {
              if (lineAlign == "start") {
                ////console.warn('   设置居左');
                nowLine.align = "left";
              } else {
                nowLine.align = lineAlign;
              }
            }
            ////console.log('lineAlignLast',lineAlignLast)
            if (lineAlignLast != undefined && lineAlignLast != "auto") {
              nowLine.align = "justify";
            }

            //获取style等信息,创建一个charObject对象
            var charObject = {
              char: char,
              family: "a1",
              color: "#000000",
              size: 12,
              italic: 0,
              letterSpacing: 0,
              bold: 0,
              underline: 0
            };
            //从this出发,向父级查找,记录所有样式
            var $parentNode = $(this);

            while ($parentNode.attr("id") != "textEditorHidden") {
              var color = null;

              var italic = null;

              var $color = $parentNode.attr("color");
              var $fontStyle = $parentNode.css("font-style");
              if ($color != undefined) {
                color = $color;
              }
              if ($parentNode[0].style.color != "") {
                color = $parentNode[0].style.color;
              }

              if ($fontStyle == "italic") {
                charObject.italic = 1;
              }
              if (color != null) {
                charObject.color = color;
              }

              var size = $parentNode.css("font-size");
              if (size != undefined) {
                charObject.size = parseFloat(size);
              }

              var $fontFamily = $parentNode.attr("face");
              var $fontFamily2 = $parentNode.css("font-family");
              //console.log('$fontFamily2', $fontFamily2);
              if ($fontFamily != undefined) {
                charObject.family = $fontFamily;
              } else if (
                $fontFamily2 != undefined &&
                $fontFamily2.indexOf(`microsoft yahei`) == -1
              ) {
                charObject.family = $fontFamily2;
              }
              //判断是字体库的字体

              var p = new RegExp("(.)(\\d+)", ["i"]);
              var m = p.exec(charObject.family);
              if (m == null) {
                charObject.family = "a1";
                console.error("非法的字体");
              }

              //加粗
              if ($parentNode[0].nodeName == "B") {
                charObject.bold = 1;
              }
              //倾斜
              if ($parentNode[0].nodeName == "U") {
                charObject.underline = 1;
              }
              var $textDecoration = $parentNode.css("text-decoration");
              //console.log('textDecoration', $textDecoration != 'none');
              if ($textDecoration == "underline") {
                charObject.underline = 1;
              }

              $parentNode = $parentNode.parent();
            }
            //写入文字间距
            if (lineLetterSpacing != "") {
              charObject.letterSpacing = parseInt(lineLetterSpacing);
            }

            //如果当前字符的left小于lastLeft,则创建一个newLine,如果lastIndex
            //left值不变,故意是一行字被挤压到一列了,也算作换行
            if (lastLeft > left || lastLeft == left) {
              ////console.log('换行', lastLeft, left);
              //获取上一行的align,放到这里
              var lastLineAlign = nowLine.align;

              lastLeft = left;
              //切换新行前,保存当前行的数据
              if (nowLine.text.length > 0) {
                htmlJson.push(nowLine);
              }
              //重建一个新行的数组,他是空的
              nowLine = {
                align: lastLineAlign,
                lineHeight: 100,
                text: []
              };
            } else {
              //记录本次的left
              lastLeft = left;
            }
            //设置行高
            if (lineLineHeight != "") {
              nowLine.lineHeight = parseFloat(lineLineHeight) * 100;
            }

            //添加当前字符到本行的数据
            nowLine.text.push(charObject);
          }
        });
      //遍历结束后,最后一行的数据还没有被添加,进行添加
      if (nowLine.text.length > 0) {
        htmlJson.push(nowLine);
      }

      //console.log('结果输出!', JSON.stringify(htmlJson, null, 2));
      return htmlJson;
    },
    //事件--
    //文本框内容修改事件
    onTextChange(e) {
      if (this.nowEditText != null) {
        var html = this.$refs.textEditor.innerHTML;
        //console.log(html);
        if (html == "") {
          //空的文本,���充文本
          $("#textEditor").html('<p style="font-size: 24px;"><br></p>');
          //删除这个文本元素
          var textElement = this.nowEditText;
          this.$store.commit("setNowEditText", null);

          this.getNowPageData.data.splice(
            $.inArray(textElement, this.getNowPageData.data),
            1
          );
        } else {
          this.nowEditText.edit_data.text = html;
          let textJson = this.getHtmlJson(this.nowEditText, html);
          if (textJson != null) {
            this.nowEditText.edit_data.textJson = textJson;
          } else {
            alert("文字生成出现异常!请重新创建(err:02)");
            return;
          }

          //更新原始宽高为当前的宽度和高度
          if (
            !(
              this.nowEditText.edit_data.textRadian != 0 &&
              this.nowEditText.edit_data.textJson.length == 1
            )
          ) {
            this.nowEditText.edit_config.width = this.nowEditText.edit_config.originalWidth;
            this.nowEditText.edit_config.height = this.nowEditText.edit_config.originalHeight;
          }
        }
        this.updateEditorSize();
      }
    },
    //失去焦点
    onBlur() {
      if (this.$refs.textEditor != null) {
        this.$refs.textEditor.focus();
      }
    },
    //为子元素添加span标签
    warpSpan(text) {
      var result = "";
      for (var ii = 0; ii < text.length; ii++) {
        var char = text.charAt(ii);
        //console.log('char',char,'code',char.charCodeAt())
        if (char.charCodeAt() == 32) {
          result = result + "<span>&nbsp;</span>";
        } else {
          result = result + "<span>" + char + "</span>";
        }
      }
      return result;
    },
    //更新选择框位置
    updateEditorPosition() {
      if (this.nowEditText != null) {
        //更新编辑框
        this.getSelectionStyle.left =
          this.nowEditText.edit_config.left * this.getZoom + "px";
        this.getSelectionStyle.top =
          this.nowEditText.edit_config.top * this.getZoom + "px";

        //更新内容

        this.getTextEditorStyle.left =
          this.nowEditText.edit_config.left * this.getZoom + "px";
        this.getTextEditorStyle.top =
          this.nowEditText.edit_config.top * this.getZoom + "px";
      }
    },
    //更新编辑器marginTop
    updateEditorMarginTop() {
      this.$nextTick(function() {
        //查找第一行字号最大的文字
        var fontSize = parseFloat(
          $("#textEditor")
            .children("p")
            .css("font-size")
        );
        var lineHeight = parseFloat(
          $("#textEditor")
            .children("p")
            .css("line-height")
        );

        this.textEditorMarginTop = -((lineHeight - fontSize) / 2);
      });
    },
    //更新选择框尺寸
    updateEditorSize() {
      if (this.nowEditText != null) {
        //更新编辑框
        var styleObj = {};
        var rect = this.$refs.textEditorHidden.getBoundingClientRect();
        var totalWidth = 0;
        var totalHeight = 0;

        /*var lastTop = -1;
				$('#textEditorHidden').find('.char').each(function(){
					if(lastTop!=$(this).data('top')){
						lastTop = $(this).data('top');
						var charRect = $(this)[0].getBoundingClientRect();
						totalHeight+=charRect.height;

					}
				})*/
        //遍历textEditorHidden下的每个char,获取宽高

        var zoomX =
          this.nowEditText.edit_config.width /
          this.nowEditText.edit_config.originalWidth;

        this.getSelectionStyle.width = rect.width + "px";
        //console.log('更新前',this.getSelectionStyle.height)
        this.getSelectionStyle.height = rect.height + "px";
        //console.log('更新后',this.getSelectionStyle.height)
        this.getSelectionStyle.transformOrigin = "0% 0%";
        this.getSelectionStyle.transform =
          "rotate(" + this.nowEditText.edit_config.rotation + "deg)";

        //更新内容
        var styleObj = {};

        //计算width缩放后尺寸
        var zoomX =
          this.nowEditText.edit_config.width /
          this.nowEditText.edit_config.originalWidth;
        ////console.log('A:',this.width);
        this.getTextEditorStyle.width = this.width + "px";
        //计算width缩放后尺寸

        this.getTextEditorStyle.transformOrigin = "0% 0%";
        this.getTextEditorStyle.transform =
          "rotate(" +
          this.nowEditText.edit_config.rotation +
          "deg) scale(" +
          this.getZoom +
          ")";
      }
    },
    //按下拖动点开始缩放
    selectionPointMouseDown() {
      this.resizing = true;
    }
  },
  created() {
    var _self = this;
    //监听---
    //检测hidden改变时,刷新hidden
    //在非编辑模式下,按下右侧拖动点,进入编辑模式并开始resize编辑框
    eventBus.$on("startTextEditorResize", function(obj) {
      _self.resizing = true;
    });

    //进入编辑模式
    eventBus.$on("startEdit", function(obj) {
      _self.svgRect = obj.rect;

      _self.startEdit(obj.width);

      _self.updateEditorMarginTop();
    });
    //富文本操作-针对选中文本-(execCommand原生支持的操作,包括修改文字颜色,字体大小,字体等)
    eventBus.$on("text-edit", function(e) {
      console.log(e.type);
      //判断更改字体时,未选中状态,则自动全部选中
      if (e.type == "FontName" || e.type == "foreColor") {
        var selectionType = window.getSelection().type.toLowerCase();
        if (selectionType != "range") {
          $("#textEditor").focus();
          document.execCommand("selectAll", false, true);
        }
      }
      if (e.type == "FontName") {
        //ajax请求woff,实现加载动画
        _self.loading = true;
        this.$nextTick(() => {
          let fontName = e.val;
          $.ajax({
            url: "/static/font/" + fontName + ".woff",
            complete: () => {
              _self.loading = false;
            }
          });
        });
      }
      document.execCommand(e.type, false, e.val);
      document.execCommand("unselect", false, true);
    });
    //富文本操作-针对行-(添加style到选中的文本的父级标签中)
    eventBus.$on("text-edit-line-style", function(e) {
      document.execCommand("formatblock", false, "p");
      //获取当前选中的所有行
      var nodeArr = [];
      var startNode = window.getSelection().anchorNode;
      if (startNode == undefined) {
        return;
      }
      while (startNode.nodeName != "P") {
        startNode = startNode.parentNode;
      }
      var endNode = window.getSelection().focusNode;
      while (endNode.nodeName != "P") {
        endNode = endNode.parentNode;
      }

      //获取ref textEditor
      var textEditorChild = _self.$refs.textEditor.childNodes;
      //定位startNode和endNode所在索引
      var startIndex = -1;
      var endIndex = -1;

      for (var i = 0; i <= textEditorChild.length; i++) {
        var childItem = textEditorChild[i];

        if (childItem == startNode) {
          startIndex = i;
        } else if (childItem == endNode) {
          endIndex = i;
        }
      }
      if (endIndex == -1) {
        endIndex = startIndex;
      }

      //设置在该区域内的所有dom的style
      for (var i = startIndex; i <= endIndex; i++) {
        for (var a in e) {
          textEditorChild[i].style[a] = e[a];
        }
      }

      _self.onTextChange();
    });
    //富文本操作-针对全部标签的css样式
    eventBus.$on("text-edit-all", function(e) {
      $("#textEditor")
        .find("p")
        .css(e.type, e.val);
      _self.onTextChange();
      //如果行高被更改
      if (e.type == "line-height") {
        _self.updateEditorMarginTop();
      }
    });
    //富文本操作-属性操作
    eventBus.$on("text-edit-property", function(e) {
      if (e.name == "fontFamily") {
        //设置字体
        for (var i = 0; i < _self.nowEditText.edit_data.textJson.length; i++) {
          for (
            var a = 0;
            a < _self.nowEditText.edit_data.textJson[i].text.length;
            a++
          ) {
            _self.nowEditText.edit_data.textJson[i].text[a].family = e.value;
          }
        }
      }
      _self.$store.commit("setNowEditText", _self.nowEditText);
      _self.onTextChange();
    });

    //结束编辑
    eventBus.$on("stopEdit", () => {
      //写入编辑器宽度
      _self.nowEditText.edit_data.editAreaWidth = this.width;
      //console.warn('写入宽度', _self.nowEditText.edit_data.editAreaWidth);
      //在更新一下textjson
      _self.onTextChange();
    });
    //缩放舞台时更新缩放数据
    //缩放时停止一切编辑
    /*eventBus.$on('stageChange',function(e){
			if(e=='zoom'){
				_self.$nextTick(function () {
					_self.updateEditorSize();
					_self.updateEditorPosition();
				})
			}
		});*/
    //舞台移动鼠标移动事件监听
    eventBus.$on("stageMouseMove", function(e) {
      if (_self.getMouse.isDown && _self.resizing == true) {
        var angel = _self.nowEditText.edit_config.rotation * Math.PI / 180;
        var vecX =
          Math.cos(angel) * (e.vectorX / _self.getZoom) +
          Math.sin(angel) * (e.vectorY / _self.getZoom);
         console.log('vecX'+vecX);
        _self.width = _self.width + vecX;

        _self.$nextTick(function() {
          _self.updateEditorSize();
          _self.onTextChange();
        });
      }
    });
    eventBus.$on("updateTextHtml", function() {
      ////console.log('更新字体');
      _self.onTextChange(null);
    });
    eventBus.$on("setTextEditorHtml", function(e) {
      ////console.log('更新字体');
      $("#textEditor").html(e);
    });
    eventBus.$on("setTextEditorWidth", function(val) {
      //console.log('我勒个去');
      _self.width = val;
      _self.$nextTick(function() {
        _self.updateEditorPosition();
        _self.$nextTick(function() {
          _self.updateEditorSize();
          _self.onTextChange();
        });
      });
    });
    //舞台移动鼠标松开监听
    eventBus.$on("globalMouseUp", function(e) {
      _self.resizing = false;
    });

    //捕获粘贴
    $(window).bind("paste", function(e) {
      console.log(_self.nowEditText);
      if (_self.nowEditText != null) {
        var ignoreCharArr = [9, 10];

        var pastedText = e.originalEvent.clipboardData.getData("Text");
        var result = "";
        //替换空格为nbsp
        for (var ii = 0; ii < pastedText.length; ii++) {
          var char = pastedText.charAt(ii);

          if (char.charCodeAt() == 32 || char.charCodeAt() == 160) {
            char = "&nbsp;";
          }
          result = result + char;
        }
        document.execCommand("insertHtml", true, result);
        return false;
      }
    });
  }
};
</script>
<style lang="scss">
*:focus {
  outline: none;
}

/*selection缩放工具*/

.text-selection-tool {
  position: absolute;
  border: 1px solid #00a2eb;
  pointer-events: none;
  .point {
    position: absolute;
    right: -5px;
    bottom: 50%;
    margin-bottom: -5px;
    background: white;
    border: 1px solid #00a2eb;
    width: 10px;
    height: 10px;
    pointer-events: all;
    cursor: w-resize;
  }
  .point:hover {
    background: #00a2eb;
  }
  .load-state {
    width: 100%;
    height: 100%;
    position: relative;
    i {
      position: absolute;
      left: 50%;
      top: 50%;
      font-size: 32px;
      margin-left: -16px;
      margin-top: -16px;
      color: #00a2eb;
      animation: 1s rotate infinite ease-in-out;
    }
    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}

/*文本输入框*/

.text-editor-selection {
  position: absolute;
  left: 0;
  top: 0;

  .text-editor {
    width: 100%;
    height: 100%;
    word-wrap: break-word;
    word-break: break-all;
    p {
      margin: 0;
      padding: 0;
    }
    b,
    b * {
      font-weight: 900;
    }
    cursor: text;
    * {
      cursor: text;
    }
  }
}

/*隐藏域*/

.text-editor-hidden {
  word-wrap: break-word;
  word-break: break-all;
  b,
  b * {
    font-weight: 900;
  }
}

#textEditor p,
#textEditorHidden p {
  line-height: 100%;
  letter-spacing: 0px;
}

#textLineHidden {
  position: absolute;
  left: 0;
  top: 0;
}
</style>




// WEBPACK FOOTER //
// textEditor.vue?f1b455a8
