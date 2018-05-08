<template>
	<div class="edit-page" @mousedown="closeModal">
		<!--顶部导航栏-->
		<component :is="getNavBar"></component>
		<!--左侧素材列表-->
		<leftSide/>
		<!-- 工具栏 -->
		<toolbar/>
		<!--舞台-->
		<stage/>
		<!-- 页面控制 -->
		<rightPage/>

    <!--上传组合-->
    <upload-group/>
		<!--新增表单元素列表-->
    <add-form-element-list/>
		<!-- 模态框 -->
		<modalOver/>
		<saveas/>
		<wait/>
		<qrcode/>
		<alert/>
		<preview/>
		<containerEditor/>
		<cropper/>
		<login/>
		<register/>
		<coorp/>
		<!--tip模态 -->
		<containerTip/>

		<lockTip/>
		<forbiddenTip/>
		<Newpage/>
		<Colorset/>
		<guides/>
    <jianye-preview/>
		<Welcome/>
    <saleAction/>
    <new-user-guide v-if="modal.newUserGuide" @close="modal.newUserGuide=false"/>
    <!-- 商户下载付费框 -->
    <shanghuPay/>

	</div>
</template>
<script>
import $ from "jquery";
import EventBus from "@/common/eventBus.js";
import common from "@/common/common.js";
//主要组件
import navBar_main from "@/components/editor/nav/main";
import navBar_interaction from "@/components/editor/nav/interaction";
import leftSide from "@/components/editor/source/main";
import stage from "@/components/editor/stage/main";
import rightPage from "@/components/editor/source/rightPage";

import toolbar from "@/components/editor/tool/main";
import containerEditor from "@/components/editor/stage/containerEditor";
import addFormElementList from "@/components/editor/interaction/config/form/add.vue";
// 全屏模态框
import modalOver from "@/components/editor/modal/modalOver";
import saveas from "@/components/editor/modal/nav/saveas";
import wait from "@/components/editor/modal/wait";
import qrcode from "@/components/editor/modal/qrcode";
import alert from "@/components/editor/modal/alert";
import preview from "@/components/editor/modal/nav/preview";
import cropper from "@/components/editor/modal/cropper";
import login from "@/components/editor/modal/nav/login";
import register from "@/components/editor/modal/nav/register";
import coorp from "@/components/editor/modal/coorp";
import debug from "@/components/editor/modal/debug";
import Newpage from "@/components/editor/modal/newPage";
import Colorset from "@/components/editor/modal/colorset";
import guides from "@/components/editor/modal/guides";
import uploadGroup from "@/components/editor/modal/uploadGroup";
import Welcome from "@/components/editor/modal/welcome";
import newUserGuide from "@/components/editor/modal/guide/main";
import shanghuPay from "@/components/editor/modal/shanghuPay";
import saleAction from "@/components/editor/modal/saleAction";
//tip模态
import containerTip from "@/components/editor/modal/tip/containerTip";
import jianyePreview from "@/components/editor/modal/jianyePreview";
import lockTip from "@/components/editor/modal/tip/lock";
import forbiddenTip from "@/components/editor/modal/tip/forbidden";
//js
import socket from "@/common/socket.js";
export default {
  data() {
    return {
      modal: {
        newUserGuide: false
      }
    };
  },
  computed: {
    themeColor() {
      return this.$store.state.editor.themeColor;
    },
    isLogin() {
      let loginMode = this.$store.state.editor.loginMode;

      if (loginMode == "c_logged" || loginMode == "logged") {
        return true;
      } else {
        return false;
      }
    },
    getNavBar() {
      if (location.href.indexOf("jianye") != -1) {
        document.title = "简页 - 便捷的长图文设计营销工具";
        return navBar_interaction;
      } else {
        document.title = "图帮主 - 轻量级平面设计工具";
        if (!/www\./.test(location.href)) {
          document.title = "轻量级平面设计工具";
        }
        return navBar_main;
      }
    }
  },
  methods: {
    closeModal(e) {
      this.$store.commit("callModal");
    },
    incompatible() {
      this.$store.state.editor.tip.forbidden = true;
      this.$store.state.editor.modalOver = true;
      this.$store.state.editor.modalIsAlert = false;
    },
    initColor(color) {
      var Color = require("../assets/js/color");
      var themeColor = Color(color);
      var value = themeColor.getValue(), //明度
        saturation = themeColor.getSaturation(), //饱和度
        hue = themeColor.getHue(), //色相
        lightness = themeColor.getLightness(); //亮度

      this.$store.commit("initColor", {
        bgColor: themeColor.toCSS(),
        bgDark: themeColor.darkenByRatio(0.12).toCSS(),
        fontColor:
          (lightness > 0.75 && value > 0.78) ||
          (value > 0.9 && hue > 50 && hue < 180)
            ? "#3f4652"
            : "#fff"
      });
    }
  },
  watch: {
    themeColor: function(color) {
      this.initColor(color);
    },
    isLogin: function(val) {
      /*if (val) {
        window.location.reload();
      }*/
    }
  },
  components: {
    navBar_main,
    navBar_interaction,
    leftSide,
    stage,
    rightPage,
    toolbar,
    containerEditor,
    modalOver,
    saveas,
    wait,
    qrcode,
    alert,
    coorp,
    preview,
    cropper,
    Welcome,
    login,
    guides,
    register,
    containerTip,
    lockTip,
    forbiddenTip,
    debug,
    Newpage,
    Colorset,
    addFormElementList,
    uploadGroup,
    jianyePreview,
    newUserGuide,
    shanghuPay,
    saleAction
  },
  created() {
    var _self = this;
    var agent = window.navigator.userAgent;
    //console.log(agent);
    if (agent.indexOf("Chrome") != -1) {
      //谷歌浏览器,不做提示
    } else if (agent.indexOf("Safari") != -1) {
      //safari浏览器,读取版本号
      try {
        var agentID = parseInt(
          agent
            .split(" ")[11]
            .split("/")[1]
            .split(".")[0]
        );
        if (agentID < 10) {
          this.incompatible();
          this.$nextTick(function() {
            $("#browser_360").hide();
            $("#browser_safari").show();
          });
          return;
        }
      } catch (e) {
        this.incompatible();
        this.$nextTick(function() {
          $("#browser_360").hide();
          $("#browser_safari").show();
        });
        return;
      }
    } else {
      this.incompatible();
      return;
    }
    //初始化socket
    socket.init(this);

    EventBus.$on("stateChange", e => {
      if (e.type == "ready") {
        if (this.$store.state.docData.product == "jianye") {
          //是否显示新手指引
          if (common.getCookie("newuser-guide") == null) {
            this.modal.newUserGuide = true;
            common.setCookie("newuser-guide", new Date().toString(), 365);
          }
        }
      }
    });
  }
};
</script>

