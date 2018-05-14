import $ from "jquery";
import common from "@/common/common.js";

/**
 * 获取当前遍历元素的svg数据(遍历添加到svg画布时,设置v-html)
 * @param item
 * @param index
 * @returns {string}
 */
function getElementHtml(item, index) {
  //console.log('更新',item);
  //生成的html结果
  var html = "";
  //边缘选择范围
  let selectedPadding = 20;
  let paddingHtml =
    '<rect fill="rgba(0,0,0,0)" width="' +
    (item.edit_config.width + selectedPadding) +
    '" height="' +
    (item.edit_config.height + selectedPadding) +
    '" x="' +
    -(selectedPadding / 2) +
    '" y="' +
    -(selectedPadding / 2) +
    '"></rect>';

  switch (item.type) {
    case "svg":
      var $svgItem = $(item.edit_data.svg);

      //修改宽高(abs 绝对值防止翻转时报错)
      $svgItem.attr("width", Math.abs(item.edit_config.width));
      $svgItem.attr("height", Math.abs(item.edit_config.height));
      //设置缩放属性
      $svgItem.attr("preserveAspectRatio", "none");
      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      //console.log('itemSVG',item.edit_config.width)
      //$svgItem.prepend('<rect fill="rgba(0,0,0,0)" width="' + item.edit_config.originalWidth + '" height="' + item.edit_config.originalHeight + '"></rect>');
      //替换填充颜色
      $svgItem.find("*[fill]").each(function() {
        //判断是否有ignorecolor的
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("fill");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("fill", colorItem.newColor);
              break;
            }
          }
        }
      });
      //替换线条颜色
      $svgItem.find("*[stroke]").each(function() {
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("stroke");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("stroke", colorItem.newColor);
              break;
            }
          }
        }
      });
      //设置svg元素对应的父组件ID
      $svgItem.attr("data-parent", item.id);

      html = paddingHtml + $svgItem.get(0).outerHTML;
      break;
    case "pattern":
      var $svgItem = $(item.edit_data.svg);

      //修改宽高(abs 绝对值防止翻转时报错)
      $svgItem.attr("width", Math.abs(item.edit_config.width));
      $svgItem.attr("height", Math.abs(item.edit_config.height));
      //计算缩放
      var zoomX = item.edit_config.width / item.edit_config.originalWidth;
      var zoomY = item.edit_config.height / item.edit_config.originalHeight;
      var zoom = zoomY;

      $svgItem.attr(
        "viewBox",
        "0 0 " +
        Math.abs(item.edit_config.width / zoom) +
        " " +
        Math.abs(item.edit_config.height / zoom)
      );
      //设置缩放属性
      $svgItem.attr("preserveAspectRatio", "none");

      //修改#G的width
      $svgItem
        .find("#G")
        .attr("width", Math.abs(item.edit_config.width / zoom));

      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      //$svgItem.prepend('<rect fill="rgba(0,0,0,0)" width="' + item.edit_config.originalWidth + '" height="' + item.edit_config.originalHeight + '"></rect>');
      //替换填充颜色
      $svgItem.find("*[fill]").each(function() {
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("fill");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("fill", colorItem.newColor);
              break;
            }
          }
        }
      });
      //替换线条颜色
      $svgItem.find("*[stroke]").each(function() {
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("stroke");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("stroke", colorItem.newColor);
              break;
            }
          }
        }
      });

      //设置svg元素对应的父组件ID
      $svgItem.attr("data-parent", item.id);

      html = paddingHtml + $svgItem.get(0).outerHTML;

      break;
    case "grid":
      var $svgItem = $(item.edit_data.svg);

      //修改宽高(abs 绝对值防止翻转时报错)
      $svgItem.attr("width", Math.abs(item.edit_config.width));
      $svgItem.attr("height", Math.abs(item.edit_config.height));
      //设置缩放属性
      $svgItem.attr("preserveAspectRatio", "none");
      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      //$svgItem.prepend('<rect fill="rgba(0,0,0,0)" width="' + item.edit_config.originalWidth + '" height="' + item.edit_config.originalHeight + '"></rect>');
      //替换填充颜色
      $svgItem.find("*[fill]").each(function() {
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("fill");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("fill", colorItem.newColor);
              break;
            }
          }
        }
      });
      //替换线条颜色
      $svgItem.find("*[stroke]").each(function() {
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("stroke");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("stroke", colorItem.newColor);
              break;
            }
          }
        }
      });
      /*横三宫格变换*/
      if (item.edit_data.gridNum == 3 && item.edit_data.scaleV == false) {
        if (item.edit_data.ratio == false) {
          //变换数据准备
          var x = item.edit_data.zuo.width + item.edit_data.you.width;
          item.edit_data.moveX =
            (item.edit_config.width - item.edit_data.owidth) *
            item.edit_data.vscale +
            item.edit_data.mx;
          item.edit_data.scaleX =
            item.edit_data.sx *
            (item.edit_config.width * item.edit_data.vscale - x) /
            (item.edit_data.owidth * item.edit_data.vscale - x);
          item.edit_data.tx =
            item.edit_data.zhong.x * (1 - item.edit_data.scaleX);
        }
        $svgItem.attr(
          "viewBox",
          "0 0 " +
          Math.abs(item.edit_data.viewX) +
          " " +
          Math.abs(item.edit_data.viewY)
        );
        $svgItem
          .find("#zuo")
          .attr("transform", "translate(0,0) scale(1,1)");
        $svgItem
          .find("#you")
          .attr(
            "transform",
            "translate(" + item.edit_data.moveX + ",0) scale(1,1)"
          );
        $svgItem
          .find("#zhong")
          .attr(
            "transform",
            "translate(" +
            item.edit_data.tx +
            ",0) scale(" +
            item.edit_data.scaleX +
            ",1)"
          );
      }
      /*竖三宫格变换*/
      if (item.edit_data.gridNum == 3 && item.edit_data.scaleH == false) {
        if (item.edit_data.ratio == false) {
          //变换数据准备
          var y = item.edit_data.shang.height + item.edit_data.xia.height;
          item.edit_data.moveY =
            (item.edit_config.height - item.edit_data.oheight) *
            item.edit_data.vscale +
            item.edit_data.my;
          item.edit_data.scaleY =
            item.edit_data.sy *
            (item.edit_config.height * item.edit_data.vscale - y) /
            (item.edit_data.oheight * item.edit_data.vscale - y);
          item.edit_data.ty =
            item.edit_data.zhong.y * (1 - item.edit_data.scaleY);
        }
        $svgItem.attr(
          "viewBox",
          "0 0 " +
          Math.abs(item.edit_data.viewX) +
          " " +
          Math.abs(item.edit_data.viewY)
        );
        $svgItem
          .find("#shang")
          .attr("transform", "translate(0,0) scale(1,1)");
        $svgItem
          .find("#xia")
          .attr(
            "transform",
            "translate(0," + item.edit_data.moveY + ") scale(1,1)"
          );
        $svgItem
          .find("#zhong")
          .attr(
            "transform",
            "translate(0," +
            item.edit_data.ty +
            ") scale(1," +
            item.edit_data.scaleY +
            ")"
          );
      }
      /*九宫格变换*/
      if (
        item.edit_data.gridNum == 9 &&
        item.edit_data.scaleV == true &&
        item.edit_data.scaleH == true
      ) {
        if (item.edit_data.ratio == false) {
          //变换数据准备
          var x = item.edit_data.zuo.width + item.edit_data.you.width,
            y = item.edit_data.zuo.height + item.edit_data.you.height;
          item.edit_data.moveX =
            (item.edit_config.width - item.edit_data.owidth) *
            item.edit_data.vscale +
            item.edit_data.mx;
          item.edit_data.moveY =
            (item.edit_config.height - item.edit_data.oheight) *
            item.edit_data.vscale +
            item.edit_data.my;
          item.edit_data.scaleX =
            item.edit_data.sx *
            (item.edit_config.width * item.edit_data.vscale - x) /
            (item.edit_data.owidth * item.edit_data.vscale - x);
          item.edit_data.scaleY =
            item.edit_data.sy *
            (item.edit_config.height * item.edit_data.vscale - y) /
            (item.edit_data.oheight * item.edit_data.vscale - y);
          item.edit_data.tx =
            item.edit_data.zhong.x * (1 - item.edit_data.scaleX);
          item.edit_data.ty =
            item.edit_data.zhong.y * (1 - item.edit_data.scaleY);
        }
        $svgItem.attr(
          "viewBox",
          "0 0 " +
          Math.abs(item.edit_data.viewX) +
          " " +
          Math.abs(item.edit_data.viewY)
        );
        $svgItem
          .find("#zuoshang")
          .attr("transform", "translate(0,0) scale(1,1)");
        $svgItem
          .find("#youshang")
          .attr(
            "transform",
            "translate(" + item.edit_data.moveX + ",0) scale(1,1)"
          );
        $svgItem
          .find("#zuoxia")
          .attr(
            "transform",
            "translate(0," + item.edit_data.moveY + ") scale(1,1)"
          );
        $svgItem
          .find("#youxia")
          .attr(
            "transform",
            "translate(" +
            item.edit_data.moveX +
            "," +
            item.edit_data.moveY +
            ") scale(1,1)"
          );

        $svgItem
          .find("#shang")
          .attr(
            "transform",
            "translate(" +
            item.edit_data.tx +
            ",0) scale(" +
            item.edit_data.scaleX +
            ",1)"
          );
        $svgItem
          .find("#zuo")
          .attr(
            "transform",
            "translate(0," +
            item.edit_data.ty +
            ") scale(1," +
            item.edit_data.scaleY +
            ")"
          );
        $svgItem
          .find("#you")
          .attr(
            "transform",
            "translate(" +
            item.edit_data.moveX +
            "," +
            item.edit_data.ty +
            ") scale(1," +
            item.edit_data.scaleY +
            ")"
          );
        $svgItem
          .find("#xia")
          .attr(
            "transform",
            "translate(" +
            item.edit_data.tx +
            "," +
            item.edit_data.moveY +
            ") scale(" +
            item.edit_data.scaleX +
            ",1)"
          );

        $svgItem
          .find("#zhong")
          .attr(
            "transform",
            "translate(" +
            item.edit_data.tx +
            "," +
            item.edit_data.ty +
            ") scale(" +
            item.edit_data.scaleX +
            "," +
            item.edit_data.scaleY +
            ")"
          );
      }
      //统一垫底rect
      $svgItem.prepend(
        '<rect fill="rgba(0,0,0,0)" width="' +
        Math.abs(item.edit_data.viewX) +
        '" height="' +
        Math.abs(item.edit_data.viewY) +
        '"></rect>'
      );
      //设置svg元素对应的父组件ID
      $svgItem.attr("data-parent", item.id);
      html = paddingHtml + $svgItem.get(0).outerHTML;
      //html += '<rect fill="rgba(0,0,0,0)" width="' + (item.edit_config.width + selectedPadding) + '" height="' + (item.edit_config.height + selectedPadding) + '" x="' + (-(selectedPadding / 2)) + '" y="' + (-(selectedPadding / 2)) + '"></rect>';
      break;
    case "image":
      var imgUrl = "";


      if (
        item.edit_config.originalWidth > 800 ||
        item.edit_config.originalHeight > 800
      ) {
        imgUrl = common.getImageURL(item.edit_data.url, 800);
      } else {
        imgUrl = item.edit_data.url;
      }

      //生成svg代码
      var html1 =
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none">';
      var html2 =
        '<g><image class="source" xlink:href="' + imgUrl + '"/></g>';
      var html3 = "";
      if (item.edit_data.radius > 0) {
        html3 = `
							<defs>
								<clipPath id="radius_${item.id}">
									<rect x="0" y="0" width="${item.edit_config
          .originalWidth}" height="${item.edit_config
          .originalHeight}" rx="${item.edit_data.radius}%" />
								</clipPath>
							</defs>`;
      }
      var html4 = "</svg>";
      var svgHtml = html1 + html3 + html2 + html4;
      var $svgItem = $(svgHtml);
      //	$svgItem.prepend('<rect fill="rgba(0,0,0,0.6)" width="'+item.edit_config.originalWidth+'" height="'+item.edit_config.originalHeight+'"></rect>');

      //设置尺寸
      $svgItem.attr("width", item.edit_config.width);
      $svgItem.attr("height", item.edit_config.height);
      $svgItem.attr(
        "viewbox",
        item.edit_data.clip.left +
        " " +
        item.edit_data.clip.top +
        " " +
        item.edit_data.clip.width +
        " " +
        item.edit_data.clip.height
      );
      $svgItem.attr("data-parent", item.id);
      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      //设置滤镜
      if (
        item.edit_data.filter.bright != 0 ||
        item.edit_data.filter.contrast != 0 ||
        item.edit_data.filter.saturation != 0 ||
        item.edit_data.filter.hue != 0 ||
        item.edit_data.filter.blur != 0 ||
        item.edit_data.filter.film != 0
      ) {
        $svgItem
          .find(".source")
          .attr("filter", "url(#filter_img_" + item.id + ")");
      }

      //设置圆角
      if (item.edit_data.radius > 0) {
        $svgItem
          .find("image")
          .attr("clip-path", "url(#radius_" + item.id + ")");
      }

      $svgItem
        .find(".source")
        .attr("width", item.edit_config.originalWidth);
      $svgItem
        .find(".source")
        .attr("height", item.edit_config.originalHeight);

      html = paddingHtml + $svgItem.get(0).outerHTML;
      //html += '<rect fill="rgba(0,0,0,0)" width="' + (item.edit_config.width + selectedPadding) + '" height="' + (item.edit_config.height + selectedPadding) + '" x="' + (-(selectedPadding / 2)) + '" y="' + (-(selectedPadding / 2)) + '"></rect>';
      break;
    case "container":
      var $svgItem = $(item.edit_data.svg);
      //修改宽高(abs 绝对值防止翻转时报错)
      $svgItem.attr("width", Math.abs(item.edit_config.width));
      $svgItem.attr("height", Math.abs(item.edit_config.height));
      $svgItem.attr("data-type", item.type);
      //设置缩放属性
      $svgItem.attr("preserveAspectRatio", "none");
      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      $svgItem.prepend(
        '<rect fill="rgba(0,0,0,0)" width="' +
        item.edit_config.originalWidth +
        '" height="' +
        item.edit_config.originalHeight +
        '"></rect>'
      );
      //设置svg元素对应的父组件ID
      $svgItem.attr("data-parent", item.id);

      if (item.edit_data.color != undefined) {
        //替换填充颜色
        $svgItem.find("*[fill]").each(function() {
          if ($(this).data("ignorecolor") == undefined) {
            //获取当前dom填充色
            var fill = $(this).attr("fill");
            //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
            for (var i = 0; i < item.edit_data.color.length; i++) {
              var colorItem = item.edit_data.color[i];
              if (fill == colorItem.oldColor) {
                $(this).attr("fill", colorItem.newColor);
                break;
              }
            }
          }
        });
        //替换线条颜色
        $svgItem.find("*[stroke]").each(function() {
          if ($(this).data("ignorecolor") == undefined) {
            //获取当前dom填充色
            var fill = $(this).attr("stroke");
            //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
            for (var i = 0; i < item.edit_data.color.length; i++) {
              var colorItem = item.edit_data.color[i];
              if (fill == colorItem.oldColor) {
                $(this).attr("stroke", colorItem.newColor);
                break;
              }
            }
          }
        });
      }
      var sizeWarning = false;

      for (var i = 0; i < item.edit_data.clipImg.length; i++) {
        //执行遮罩
        if (item.edit_data.clipImg[i].url) {
          var clipImg = item.edit_data.clipImg[i];
          var transform =
            "translate(" +
            clipImg.left +
            " " +
            clipImg.top +
            ") rotate(" +
            clipImg.rotation +
            "," +
            clipImg.rotateX +
            "," +
            clipImg.rotateY +
            ")";



          $svgItem
            .find(".kx-image")
            .eq(i)
            .attr({
              width: clipImg.width,
              height: clipImg.height,
              "xlink:href":common.getImageURL(clipImg.url, 800),
              transform: transform
            });
          //设置滤镜
          if (
            item.edit_data.filter.bright != 0 ||
            item.edit_data.filter.contrast != 0 ||
            item.edit_data.filter.saturation != 0 ||
            item.edit_data.filter.hue != 0 ||
            item.edit_data.filter.blur != 0 ||
            item.edit_data.filter.film != 0
          ) {
            $svgItem
              .find(".kx-image")
              .eq(i)
              .attr("filter", "url(#filter_img_" + item.id + ")");
          }
          $svgItem
            .find(".kx-frame")
            .eq(i)
            .siblings()
            .css("display", "none");
        }
      }
      html = $svgItem.get(0).outerHTML;
      break;
    case "text":
      item.disableResize = false;
      var $svgItem = $(item.edit_data.svg);
      //处理文字弧度radian
      if (
        item.edit_data.textRadian != 0 &&
        item.edit_data.textJson.length == 1
      ) {
        //获取本行所有文字
        var $chars = $svgItem.children("g").children("g");
        //获取最大的文字高度
        var maxHeight = 0;
        $chars.each(function() {
          var charHeight = parseFloat($(this).data("height"));
          if (charHeight > maxHeight) {
            maxHeight = charHeight;
          }
        });

        var x1 = 0;
        var y1 = 0;

        var x4 = item.edit_config.width;
        var y4 = y1;

        //---------------------------
        var curve;
        //创建贝塞尔对象
        if (
          item.edit_data.textRadian == 2 ||
          item.edit_data.textRadian == -2
        ) {
          var value = 0;
          if (item.edit_data.textRadian == 2) {
            value = 70;
          } else {
            value = -70;
          }
          var x2 = x1 + (x4 - x1) / 2;
          var y2 = y1 + (y4 - y1) / 2;

          var rotatedPoint = common.rotatePoint(
            { x: x2, y: y2 },
            { x: x1, y: y1 },
            value
          );
          x2 = rotatedPoint.x;
          y2 = rotatedPoint.y;

          var x3 = x1 + (x4 - x1) / 2;
          var y3 = y1 + (y4 - y1) / 2;

          var rotatedPoint = common.rotatePoint(
            { x: x3, y: y3 },
            { x: x4, y: y4 },
            -value
          );
          x3 = rotatedPoint.x;
          y3 = rotatedPoint.y;

          curve = common.getCubicBezierCurvePoints(
            x1,
            y1,
            x2,
            y2,
            x3,
            y3,
            x4,
            y4
          );
        } else {
          var x2 = x1 + (x4 - x1) / 2;
          var value = 0;
          if (item.edit_data.textRadian == 0) {
            value = y1;
          } else if (item.edit_data.textRadian == -1) {
            value = y1 - 160;
          } else if (item.edit_data.textRadian == 1) {
            value = y1 + 160;
          }
          curve = common.getQuadBezierPoints(x1, y1, x2, value, x4, y4);
        }

        //遍历点,获取最大y坐标
        var maxY = 0;
        var posY = 0;
        var lineDistance = 0;

        for (var i = 0; i < curve.length; i++) {
          var pos = curve[i];

          if (item.edit_data.textRadian > 0) {
            if (maxY < pos.y) {
              maxY = pos.y;
            }
          } else if (item.edit_data.textRadian < 0) {
            if (maxY > pos.y) {
              maxY = pos.y;
            }
          }
          if (i < curve.length - 1) {
            lineDistance += common.distance(
              curve[i].x,
              curve[i].y,
              curve[i + 1].x,
              curve[i + 1].y
            );
          }
        }
        item.lineDistance = lineDistance;
        if (item.edit_data.textRadian < 0) {
          maxY = Math.abs(maxY);
          posY = maxY + maxHeight;
        }

        item.edit_config.height = maxY + maxHeight;

        var getTextPathPoints = "";
        for (var i = 0; i < curve.length; i++) {
          var pos = curve[i];
          getTextPathPoints =
            getTextPathPoints + " " + pos.x + "," + (pos.y + posY);
        }
        var startPos = curve.length / 2;
        var endPos =
          curve.length / 2 +
          ($chars.length + 1) * item.edit_data.textRadianLetterSpacing;

        var distance = endPos - startPos;

        for (var i = 0; i < $chars.length; i++) {
          var $char = $chars.eq(i);
          var hide = false;
          var curveStartPos = curve.length / 2 - distance / 2;
          var posA = parseInt(
            curveStartPos + (i + 1) * item.edit_data.textRadianLetterSpacing
          );
          if (curve[posA + 1] == undefined) {
            hide = true;
          } else {
            var pos = curve[posA];
            var posAdd = curve[posA + 1];
          }
          if (hide == false) {
            $char.show();
            var angel = 0;
            var italic = "";
            if (
              $char.attr("transform") != undefined &&
              $char.attr("transform").indexOf("skewX") != -1
            ) {
              italic = " skewX(-15)";
            }
            if (item.edit_data.textRadian == -1) {
              //向下突起
              angel = common.getAngle(pos.x, pos.y, posAdd.x, posAdd.y);
              var left =
                (pos.x + posAdd.x) / 2 -
                parseFloat($char.data("width")) / 2;
              var top = (pos.y + posAdd.y) / 2 + maxY;
              $char.attr(
                "transform",
                "translate(" +
                left +
                " " +
                top +
                ") rotate(" +
                (angel - 90) +
                "," +
                parseFloat($char.data("width")) / 2 +
                "," +
                -parseFloat($char.data("height")) / 2 +
                ")" +
                italic
              );
            } else if (item.edit_data.textRadian == -2) {
              //向上突起
              angel = common.getAngle(pos.x, pos.y, posAdd.x, posAdd.y);
              var left =
                (pos.x + posAdd.x) / 2 -
                parseFloat($char.data("width")) / 2;
              var top = (pos.y + posAdd.y) / 2 + maxY;
              $char.attr(
                "transform",
                "translate(" +
                left +
                " " +
                top +
                ") rotate(" +
                (angel - 90) +
                "," +
                parseFloat($char.data("width")) / 2 +
                "," +
                -parseFloat($char.data("height")) +
                ")" +
                italic
              );
            } else if (item.edit_data.textRadian > 0) {
              //向下突起
              angel = common.getAngle(pos.x, pos.y, posAdd.x, posAdd.y);
              var left =
                (pos.x + posAdd.x) / 2 -
                parseFloat($char.data("width")) / 2;
              var top = (pos.y + posAdd.y) / 2 + posY;
              $char.attr(
                "transform",
                "translate(" +
                left +
                " " +
                top +
                ") rotate(" +
                (angel - 90) +
                "," +
                parseFloat($char.data("width")) / 2 +
                ",0)" +
                italic
              );
            }

            var charWidth = parseFloat($char.data("width")) * 0.7;
            try {
              var pos_a =
                curve[
                  parseInt(
                    curveStartPos +
                    (i + 1) * item.edit_data.textRadianLetterSpacing
                  )
                  ];
              var pos_b =
                curve[
                  parseInt(
                    curveStartPos +
                    (i + 2) * item.edit_data.textRadianLetterSpacing
                  )
                  ];
              var pos_distance = pos_b.x - pos_a.x;
            } catch (e) {
              var pos_distance = charWidth;
            }

            if (charWidth > pos_distance) {
              var zoom = pos_distance / charWidth;

              item.disableResize = true;
            }
          } else {
            $char.hide();
          }
        }

        // if(this.$store.state.stage.mouse.controlPoint!=''){
        // 	$svgItem.children('g').css('opacity',0.5);
        // 	$svgItem.append('<polygon points="'+getTextPathPoints+'" style="fill:none;stroke:rgba(0,0,0,0.2);"/>')
        // }

        //$svgItem.append('<polygon points="'+getTextPathPoints+'" style="fill:none;stroke:rgba(0,0,0,0.2);"/>')
        $svgItem.attr("width", item.edit_config.width);
        $svgItem.attr("height", item.edit_config.height);
        $svgItem.attr(
          "viewBox",
          "0 0 " + item.edit_config.width + " " + item.edit_config.height
        );
        $svgItem.prepend(
          '<rect fill="rgba(0,0,0,0)" width="' +
          item.edit_config.width +
          '" height="' +
          item.edit_config.height +
          '"></rect>'
        );
      } else {
        //设置缩放属性
        $svgItem.attr("width", item.edit_config.width);
        $svgItem.attr("height", item.edit_config.height);
        $svgItem.attr("preserveAspectRatio", "none");
        $svgItem.prepend(
          '<rect fill="rgba(0,0,0,0)" width="' +
          item.edit_config.originalWidth +
          '" height="' +
          item.edit_config.originalHeight +
          '"></rect>'
        );
      }

      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      //设置svg元素对应的父组件ID
      $svgItem.attr("data-parent", item.id);

      html = $svgItem.get(0).outerHTML;
      //html += '<rect fill="rgba(0,0,0,0)" width="' + (item.edit_config.width + selectedPadding) + '" height="' + (item.edit_config.height + selectedPadding) + '" x="' + (-(selectedPadding / 2)) + '" y="' + (-(selectedPadding / 2)) + '"></rect>';
      break;
    case "groupText":
      var $svgItem = $(item.edit_data.svg);
      //修改宽高(abs 绝对值防止翻转时报错)
      var width = Math.abs(item.edit_config.width);
      var height = Math.abs(item.edit_config.height);
      $svgItem.attr("width", width);
      $svgItem.attr("height", height);
      //设置缩放属性
      $svgItem.attr("preserveAspectRatio", "none");
      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      $svgItem.prepend(
        '<rect fill="rgba(0,0,0,0)" width="' +
        item.edit_config.originalWidth +
        '" height="' +
        item.edit_config.originalHeight +
        '"></rect>'
      );
      //替换颜色
      $svgItem.find("*[fill]").each(function() {
        if ($(this).data("ignorecolor") == undefined) {
          //获取当前dom填充色
          var fill = $(this).attr("fill");
          //搜索item.edit_data.color,查找oldColor=Fill的颜色,并把newColor加到这里
          for (var i = 0; i < item.edit_data.color.length; i++) {
            var colorItem = item.edit_data.color[i];
            if (fill == colorItem.oldColor) {
              $(this).attr("fill", colorItem.newColor);
              break;
            }
          }
        }
      });

      //将text加入到组合文字
      for (var i = 0; i < item.edit_data.text.length; i++) {
        var $textItem = $(item.edit_data.text[i].svg);

        var textWidth = parseFloat($textItem.attr("width"));
        var textHeight = parseFloat($textItem.attr("height"));

        var boxWidth = item.edit_data.text[i].boxRect.width;
        var boxHeight = item.edit_data.text[i].boxRect.height;

        //如果文字宽度超出矩形范围,则进行缩小计算
        if (boxWidth < textWidth) {
          var zoom = boxWidth / textWidth;
          textWidth = textWidth * zoom;
          textHeight = textHeight * zoom;
        }

        //水平对齐坐标
        var left = 0;
        if (item.edit_data.text[i].align == "left") {
          left = item.edit_data.text[i].boxRect.left;
        } else if (item.edit_data.text[i].align == "center") {
          left =
            item.edit_data.text[i].boxRect.left +
            item.edit_data.text[i].boxRect.width / 2 -
            textWidth / 2;
        } else if (item.edit_data.text[i].align == "right") {
          left =
            item.edit_data.text[i].boxRect.left +
            item.edit_data.text[i].boxRect.width -
            textWidth;
        }

        //垂直对齐坐标
        var top =
          item.edit_data.text[i].boxRect.top +
          item.edit_data.text[i].boxRect.height / 2 -
          textHeight / 2;

        $textItem.attr("x", left);
        $textItem.attr("y", top);
        //console.log('left',left,item.edit_data.text[i].boxRect.left,item.edit_data.text[i].boxRect.width,textWidth);
        $textItem.attr("width", textWidth);
        $textItem.attr("height", textHeight);
        $textItem.attr("pointer-events", "none");

        //替换颜色
        $textItem
          .find("[fill]")
          .attr("fill", item.edit_data.text[i].color.newColor);

        //将计算结果写入resultRect,提供给组合文字编辑组件使用,用于定位

        item.edit_data.text[i].resultRect = {
          left: left,
          top: top,
          width: textWidth,
          height: textHeight
        };

        //如果文字宽度超出矩形范围,则进行缩小计算
        /*var boxWidth = item.edit_data.text[i].boxRect.width;
         var textWidth = parseFloat($textItem.attr('width'));
         if(boxWidth<textWidth){
         console.log('缩小');
         var zoom = boxWidth / textWidth;
         $textItem.attr('width',parseFloat($textItem.attr('width'))*zoom);
         $textItem.attr('height',parseFloat($textItem.attr('height'))*zoom);
         }*/

        $svgItem.append($textItem);
      }

      //设置svg元素对应的父组件ID
      $svgItem.attr("data-parent", item.id);
      //console.log('创建组合文字',$svgItem);
      html = paddingHtml + $svgItem.get(0).outerHTML;
      //html += '<rect fill="rgba(0,0,0,0)" width="' + (item.edit_config.width + selectedPadding) + '" height="' + (item.edit_config.height + selectedPadding) + '" x="' + (-(selectedPadding / 2)) + '" y="' + (-(selectedPadding / 2)) + '"></rect>';
      break;
    case "table":
      var $svgItem = $(
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none"></svg>'
      );
      $svgItem.prepend(
        '<rect fill="rgba(0,0,0,0)" width="' +
        item.edit_config.width +
        '" height="' +
        item.edit_config.height +
        '"></rect>'
      );
      //修改宽高(abs 绝对值防止翻转时报错)
      $svgItem.attr("width", Math.abs(item.edit_config.width));
      $svgItem.attr("height", Math.abs(item.edit_config.height));
      //设置缩放属性
      $svgItem.attr("preserveAspectRatio", "none");
      //如果有水平翻转和垂直翻转,则为svg增加负的x y值
      if (item.edit_config.flipX) {
        $svgItem.attr("x", -item.edit_config.width);
      }
      if (item.edit_config.flipY) {
        $svgItem.attr("y", -item.edit_config.height);
      }
      //渲染表格
      var table_data = item.edit_data.cell;
      var row_controller = item.edit_data.row;
      var column_controller = item.edit_data.col;
      var style = item.edit_data.style;
      var width = item.edit_config.width;
      var height = item.edit_config.height;

      //获取总共行高和列宽(比例值的总和!!!!!)
      var total_row_height = 0;
      var total_column_width = 0;

      for (var i = 0; i < row_controller.length; i++) {
        total_row_height = total_row_height + row_controller[i].length;
      }
      for (var i = 0; i < column_controller.length; i++) {
        total_column_width =
          total_column_width + column_controller[i].length;
      }

      var $defs = $("<defs></defs>");

      //遍历表格数据
      for (var row = 0; row < table_data.length; row++) {
        var row_item = table_data[row];
        //当前表列读取头位置
        for (var column = 0; column < row_item.length; column++) {
          //获取样式
          var style_item = common.getStyle(
            row,
            column,
            table_data.length,
            row_item.length,
            style
          );
          //初始化样式,填充没有定义的样式
          style_item.paddingLeft =
            style_item.paddingLeft != undefined
              ? style_item.paddingLeft
              : 0;
          style_item.paddingRight =
            style_item.paddingRight != undefined
              ? style_item.paddingRight
              : 0;
          style_item.paddingTop =
            style_item.paddingTop != undefined ? style_item.paddingTop : 0;
          style_item.paddingBottom =
            style_item.paddingBottom != undefined
              ? style_item.paddingBottom
              : 0;

          style_item.fontSize =
            style_item.fontSize != undefined ? style_item.fontSize : 18;
          style_item.fontFamily =
            style_item.fontFamily != undefined
              ? style_item.fontFamily
              : "d6";

          style_item.color =
            style_item.color != undefined
              ? style_item.color
              : { oldColor: "#000000", newColor: "#000000" };
          style_item.background =
            style_item.background != undefined
              ? style_item.background
              : { oldColor: "#FFFFFF", newColor: "#FFFFFF" };
          style_item.align =
            style_item.align != undefined ? style_item.align : "center";
          style_item.valign =
            style_item.valign != undefined ? style_item.valign : "middle";

          var cell = row_item[column];
          var row_RAC_obj = row_controller[row];
          var column_RAC_obj = column_controller[column];
          var cell_column_width = 0;
          var cell_row_height = 0;
          cell_row_height = row_RAC_obj.length;
          cell_column_width = column_RAC_obj.length;

          var cell_x = 0;
          var cell_y = 0;
          for (var i = 0; i < column; i++) {
            cell_x = cell_x + column_controller[i].length;
          }
          for (var i = 0; i < row; i++) {
            cell_y = cell_y + row_controller[i].length;
          }
          //获取当前单元格左边的padding right 和 上边的 padding bottom

          var cell_x_final =
            cell_x / total_column_width * width + style_item.paddingLeft;
          var cell_y_final =
            cell_y / total_row_height * height + style_item.paddingTop;

          var row_height_final =
            cell_row_height / total_row_height * height -
            style_item.paddingLeft -
            style_item.paddingBottom;
          var column_width_final =
            cell_column_width / total_column_width * width -
            style_item.paddingTop -
            style_item.paddingRight;

          var $cellItem = $("<g></g>");
          $cellItem.attr(
            "clip-path",
            "url(#clip_" + item.id + "_" + row + "_" + column + ")"
          );
          var svg_rect = null;

          if (style_item.specialShape == undefined) {
            //默认矩形
            //svg_rect = svg.rect(column_width_final, row_height_final).x(cell_x_final).y(cell_y_final).fill(style_item.background)
            if (column_width_final > 0 && row_height_final > 0) {
              $cellItem.append(
                '<rect data-col="' +
                column +
                '" data-row="' +
                row +
                '" data-id="' +
                item.id +
                '" fill="' +
                style_item.background.newColor +
                '" width="' +
                column_width_final +
                '" height="' +
                row_height_final +
                '" x="' +
                cell_x_final +
                '" y="' +
                cell_y_final +
                '"></rect>'
              );
            }
          } else if (style_item.specialShape == "rect1") {
            var bound_height = 15;
            //绘制半圆角矩形
            //svg.rect(column_width_final, bound_height*2).x(cell_x_final).y(cell_y_final).fill(style_item.background).radius(bound_height);
            if (column_width_final > 0 && bound_height * 2 > 0) {
              $cellItem.append(
                '<rect fill="' +
                style_item.background.newColor +
                '" width="' +
                column_width_final +
                '" height="' +
                bound_height * 2 +
                '" x="' +
                cell_x_final +
                '" y="' +
                cell_y_final +
                '" rx="' +
                bound_height +
                '" ry="' +
                bound_height +
                '"></rect>'
              );
            }
            if (
              column_width_final > 0 &&
              row_height_final - bound_height > 0
            ) {
              //绘制底部矩形
              //svg_rect = svg.rect(column_width_final, row_height_final-bound_height).x(cell_x_final).y(cell_y_final+bound_height).fill(style_item.background)
              $cellItem.append(
                '<rect data-col="' +
                column +
                '" data-row="' +
                row +
                '" data-id="' +
                item.id +
                '" fill="' +
                style_item.background.newColor +
                '" width="' +
                column_width_final +
                '" height="' +
                (row_height_final - bound_height) +
                '" x="' +
                cell_x_final +
                '" y="' +
                (cell_y_final + bound_height) +
                '"></rect>'
              );
            }
          }
          //边框填充
          var padding = 5;
          //添加文字
          if (
            cell.svg != "" &&
            (this.nowEditTable == null || this.nowEditTable.id != item.id)
          ) {
            var $textItem = $(cell.svg);

            $defs.append(
              '<clipPath id="clip_' +
              item.id +
              "_" +
              row +
              "_" +
              column +
              '"><rect x="' +
              cell_x_final +
              '" y="' +
              cell_y_final +
              '" width="' +
              column_width_final +
              '" height="' +
              row_height_final +
              '"/></clipPath>'
            );

            if (this.$store.state.stage.mouse.controlPoint == "se") {
              var textZoom =
                item.edit_config.width / item.edit_config.originalWidth;
              $textItem.attr(
                "width",
                parseFloat($textItem.attr("width") * textZoom)
              );
              $textItem.attr(
                "height",
                parseFloat($textItem.attr("height") * textZoom)
              );
              console.log("textZoom", textZoom);
            }

            //如果宽度大于本身宽度,则设置相等的宽度
            if (column_width_final < $textItem.attr("width")) {
              if (column_width_final < 0) {
                $textItem.attr("width", 0);
              }
            }

            if (row_height_final < $textItem.attr("height")) {
              if (row_height_final < 0) {
                $textItem.attr("height", 0);
              }
            }

            //水平位置确认
            if (cell.align == "left") {
              //水平居左
              $textItem.attr("x", cell_x_final + padding);
            } else if (cell.align == "center") {
              //水平居中

              $textItem.attr(
                "x",
                cell_x_final +
                column_width_final / 2 -
                $textItem.attr("width") / 2
              );
            } else if (cell.align == "right") {
              //水平居右
              $textItem.attr(
                "x",
                cell_x_final +
                (column_width_final - $textItem.attr("width")) -
                padding
              );
            }
            //垂直位置确认
            if (cell.valign == "top") {
              //垂直居上
              $textItem.attr("y", cell_y_final + padding);
            } else if (cell.valign == "middle") {
              //垂直居中
              $textItem.attr(
                "y",
                cell_y_final +
                row_height_final / 2 -
                parseFloat($textItem.attr("height")) / 2
              );
            } else if (cell.valign == "bottom") {
              //垂直居下
              $textItem.attr(
                "y",
                cell_y_final +
                row_height_final -
                parseFloat($textItem.attr("height")) -
                padding
              );
            }
            $textItem.attr("pointer-events", "none");

            $cellItem.html($cellItem.html() + $textItem[0].outerHTML);
          }

          //左边线条
          if (style_item.borderLeftColor != undefined) {
            var x1 = cell_x_final + style_item.borderLeftWidth / 2;
            var y1 = cell_y_final;
            var x2 = cell_x_final + style_item.borderLeftWidth / 2;
            var y2 = cell_y_final + row_height_final;
            /*var line = svg.line(x1, y1, x2, y2);
             line.stroke({
             width: style_item.borderLeftWidth,
             color: style_item.borderLeftColor
             });*/

            $cellItem.append(
              '<line stroke="' +
              style_item.borderLeftColor.newColor +
              '" x1="' +
              x1 +
              '" y1="' +
              y1 +
              '" x2="' +
              x2 +
              '" y2="' +
              y2 +
              '" stroke-width="' +
              style_item.borderLeftWidth +
              '"></line>'
            );
          }
          //顶边线条
          if (style_item.borderTopColor != undefined) {
            var x1 = cell_x_final;
            var y1 = cell_y_final + style_item.borderTopWidth / 2;
            var x2 = cell_x_final + column_width_final;
            var y2 = cell_y_final + style_item.borderTopWidth / 2;
            /*var line = svg.line(x1, y1, x2, y2);
             line.stroke({
             width: style_item.borderTopWidth,
             color: style_item.borderTopColor
             });*/
            $cellItem.append(
              '<line stroke="' +
              style_item.borderTopColor.newColor +
              '" x1="' +
              x1 +
              '" y1="' +
              y1 +
              '" x2="' +
              x2 +
              '" y2="' +
              y2 +
              '" stroke-width="' +
              style_item.borderTopWidth +
              '"></line>'
            );
          }
          //底边线条
          if (style_item.borderBottomColor != undefined) {
            var x1 = cell_x_final;
            var y1 =
              cell_y_final +
              row_height_final -
              style_item.borderBottomWidth / 2;
            var x2 = cell_x_final + column_width_final;
            var y2 =
              cell_y_final +
              row_height_final -
              style_item.borderBottomWidth / 2;
            /*var line = svg.line(x1, y1, x2, y2);
             line.stroke({
             width: style_item.borderBottomWidth,
             color: style_item.borderBottomColor
             });*/
            $cellItem.append(
              '<line stroke="' +
              style_item.borderBottomColor.newColor +
              '" x1="' +
              x1 +
              '" y1="' +
              y1 +
              '" x2="' +
              x2 +
              '" y2="' +
              y2 +
              '" stroke-width="' +
              style_item.borderBottomWidth +
              '"></line>'
            );
          }
          //右边线条
          if (style_item.borderRightColor != undefined) {
            var x1 =
              cell_x_final +
              column_width_final -
              style_item.borderRightWidth / 2;
            var y1 = cell_y_final;
            var x2 =
              cell_x_final +
              column_width_final -
              style_item.borderRightWidth / 2;
            var y2 = cell_y_final + row_height_final;
            /*var line = svg.line(x1, y1, x2, y2);
             line.stroke({
             width: style_item.borderRightWidth,
             color: style_item.borderRightColor
             });*/
            $cellItem.append(
              '<line stroke="' +
              style_item.borderRightColor.newColor +
              '" x1="' +
              x1 +
              '" y1="' +
              y1 +
              '" x2="' +
              x2 +
              '" y2="' +
              y2 +
              '" stroke-width="' +
              style_item.borderRightWidth +
              '"></line>'
            );
          }
          $svgItem.append($cellItem);
        }
      }
      $svgItem.append($defs);
      //$svgItem.prepend('<rect fill="rgba(0,0,0,0.5)" width="'+item.edit_config.originalWidth+'" height="'+item.edit_config.originalHeight+'"></rect>');

      html = paddingHtml + $svgItem.get(0).outerHTML;
      //html += '<rect fill="rgba(0,0,0,0)" width="' + (item.edit_config.width + selectedPadding) + '" height="' + (item.edit_config.height + selectedPadding) + '" x="' + (-(selectedPadding / 2)) + '" y="' + (-(selectedPadding / 2)) + '"></rect>';
      break;
      break;
  }

  return html;
}

export {
  getElementHtml
 }

