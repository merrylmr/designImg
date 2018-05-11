<template>
  <div id="app">
    <!--DPI获取器-->
    <div class="dpi-getter" ref="dpi_getter"></div>
    <!--字体加载器,每个字体都加载一次-->
    <!-- <div id="font-loader" class="font-loader"></div> -->
    <router-view></router-view>

  </div>
</template>

<script>
  import $ from "jquery";
  import eventBus from "@/common/eventBus.js";
  import socket from "@/common/socket.js";
  import cookie from "js-cookie";
  export default {
    name: "tbz",
    methods: {
      //获取用户桌面DPI并更新到editor.userDPI
      setUserDPI() {
        //获取桌面DPI
        var arrDPI = [0, 0];
        if (window.screen.deviceXDPI != undefined) {
          arrDPI[0] = window.screen.deviceXDPI;
          arrDPI[1] = window.screen.deviceYDPI;
        } else {
          var tmpNode = this.$refs.dpi_getter;
          arrDPI[0] = parseInt(tmpNode.offsetWidth);
          arrDPI[1] = parseInt(tmpNode.offsetHeight);
        }
        this.$store.commit("setUserDPI", arrDPI);
      }
    },
    mounted() {
      var _self = this;
      //获取用户桌面DPI并更新到editor.userDPI
      this.setUserDPI();

      //注册全局mouseMove
      /*$(window).mousedown(function(e) {
        eventBus.$emit("globalMouseDown", e);
      });*/
      $(window).mousemove(function(e) {
        eventBus.$emit("globalMouseMove", e);
      });
      $(window).mouseup(function(e) {
        eventBus.$emit("globalMouseUp", e);
      });
      window.onbeforeunload = function(e) {
        return "请确认您已经保存了当前模板";
      };
      //interaction 交互组件数据接受接口
      window.sendInteractionMsg = function(id, data) {
        console.log('svgItemSelected',id);
        //获取元素对象
        let element = undefined;
        _self.$store.state.docData.page.forEach(pageItem => {
          pageItem.data.forEach(eleItem => {
            if (eleItem.id == id) {
              element = eleItem;
            }
          });
        });
        switch (data.type) {
          case "updateHeight":
            //更新表单组件的高度
            element.edit_config.height = data.value;
            //更新模板高度,获取所有元素的rect的bottom
            _self.$nextTick(() => {
              let zoom = _self.$store.state.stage.zoom / 100;
              let nowPageData =
                _self.$store.state.docData.page[
                  _self.$store.state.docData.editor.nowPage
                  ].data;
              let svgHeight = _self.$store.state.docData.edit_config.height;
              let maxBottom = 0;

              for (let i = 0; i < nowPageData.length; i++) {
                let eleItem = nowPageData[i];

                let bottom = eleItem.edit_config.top + eleItem.edit_config.height;
                if (eleItem.type == "interaction" && bottom > maxBottom) {
                  maxBottom = bottom;
                }
              }

              if (maxBottom > svgHeight) {
                _self.$store.state.docData.edit_config.height = maxBottom;
                eventBus.$emit("infoChange", { type: "stageSize" });
                if (
                  element.id.indexOf("shape") != -1 &&
                  element.scrolled == undefined
                ) {
                  element.scrolled = true;
                  eventBus.$emit("scrollToBottom");
                }
              }
            });
            break;
        }

        console.info("sendInteractionMsg", element, data);
      };
    }
  };
</script>
<style>
  .dpi-getter {
    width: 1in;
    height: 1in;
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 99;
    visibility: hidden;
  }

  /*.font-loader{
      position: absolute;
      left:0;
      top:0;
      z-index: 10000000;
    }*/
</style>

