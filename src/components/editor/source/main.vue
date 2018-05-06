<template>
	<div class="leftside">
		<span :class="['close',{'turnoff':!isSourceOpen}]" @click="toogleSourceList" v-if="$store.state.docData.product !== 'jianye'"></span>
		<div class="menu">
			<span class="activebg" :style="{top:24+67*sourceBox.activeIndex+'px'}">
				<i></i>
				<i></i>
			</span>
			<ul class="list">
				<li v-for="(item,index) in menu" :class="[item.type,{active:item.active},{hasnew:item.hasNew}]" :key="index" @click="changeSouceList(index)">{{item.text}}</li>
				<!-- <li class="help">
					<a href="http://www.tubangzhu.com/help.html" target="_blank">反馈</a>
				</li> -->
			</ul>
		</div>
		<div class="source" :style="{marginLeft:(isSourceOpen?'0':'-375px')}">
			<div class="wrap">
				<div class="source-box" :style="{marginTop:sourceBox.marginTop+'px'}" :class="{'box-animate':sourceBox.animate}">
					<jianye-setting v-if="$store.state.docData.product == 'jianye'"/>

					<textbox/>
					<!-- 组合 -->
					<Group v-if="$store.state.docData.product == 'jianye'"/>
					<!-- 素材 -->
					<material/>
					<!-- 背景 -->
					<background/>
					<!-- 模板 -->
					<!-- <templation/> -->
					<!-- 互动 -->
					<action v-if="$store.state.docData.product == 'jianye'"/>
					<!-- 上传 -->
					<upload/>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import jianyeSetting from "./setting";
import search from "./search";
import textbox from "./text";
import material from "./element";
import background from "./background";
import upload from "./upload";
import templation from "./template";
import action from "./action";
import Group from "./group";

import $ from "jquery";
import Dispatch from "@/common/dispatch.js";
import EventBus from "@/common/eventBus.js";
import Comm from "@/common/common.js";

export default {
  data() {
    return {
      menu: [
        { type: "setting", text: "设置", active: false },
        { type: "groupText", text: "文字", active: false },
        { type: "group", text: "组合", active: false },
        { type: "material", text: "素材", hasNew: false, active: false },
        { type: "background", text: "背景", active: false },
        { type: "action", text: "互动", active: false },
        { type: "upload", text: "上传", active: false }
      ],
      sourceBox: {
        height: 0,
        marginTop: 0,
        activeIndex: 0,
        animate: false
      },
      searchKey: "",
      lastKey: ""
    };
  },
  components: {
    jianyeSetting,
    search,
    textbox,
    material,
    background,
    upload,
    templation,
    action,
    Group
  },
  methods: {
    //切换右侧source列表的开关
    toogleSourceList() {
      this.$store.commit("setSourceOpen");
    },
    //列表切换
    changeSouceList(index) {
      EventBus.$emit("closeModal");
      this.sourceBox.animate = true;
      this.sourceBox.activeIndex = index;
      if (!this.$store.state.editor.isSourceOpen) {
        this.$store.state.editor.isSourceOpen = true;
      }
      this.setMarginTop();
      this.setMenuActive();
    },
    //设置列表的margintop
    setMarginTop() {
      this.sourceBox.marginTop =
        -this.sourceBox.height * this.sourceBox.activeIndex;
    },
    //设置激活的菜单项
    setMenuActive() {
      if (this.menu.length == 0) {
        return;
      }

      for (var i in this.menu) {
        this.menu[i].active = false;
      }

      this.menu[this.sourceBox.activeIndex].active = true;
    },
    searchFocus() {
      this.sourceBox.activeIndex = 0;
      this.setMarginTop();
      this.setMenuActive();
    },
    //执行搜索
    handleSearch() {
      if (!this.searchKey) {
        event.stopPropagation();
        this.$store.commit("callModal", {
          type: "alert",
          modalOver: true,
          cls: "danger",
          text: "请输入搜索关键字"
        });
        return;
      }
      if (this.lastkey == this.searchKey) {
        return;
      }
      this.lastkey = this.searchKey;
      // 通知搜索页面进入等待状态并准备关键字
      EventBus.$emit("pushSearchState", this.searchKey);
      var _self = this;
      Dispatch.getSearchData(this.searchKey, 1, function(data) {
        var pushData = {};
        pushData.data = data;
        pushData.isfull = data.length == 0 ? true : false;
        //通知搜索页面准备数据
        EventBus.$emit("pushSearchList", pushData);
      });
    }
  },
  computed: {
    //获取左侧列表是否打开
    isSourceOpen() {
      return this.$store.state.editor.isSourceOpen;
    },
    adminLevel() {
      return this.$store.state.editor.admin_level;
    },
    selectedItem() {
      return this.$store.state.stage.selectedItem;
    }
  },
  watch: {
    selectedItem(val) {
      if (val != undefined && val.type == "interaction") {
        this.changeSouceList(5);
      }
    }
  },
  mounted() {
    var _self = this;
    $(window).resize(function() {
      _self.sourceBox.height = $(".source-box").height();
      _self.sourceBox.animate = false;
      //重置sourceBox的marginTop
      _self.setMarginTop();
    });
    //

    this.sourceBox.height = $(".source-box").height();
    this.setMarginTop();

    EventBus.$on("stateChange", e => {
      if (e.type == "ready") {
        if (this.$store.state.docData.product !== "jianye") {
          this.menu.splice(5, 1);
          this.menu.splice(2, 1);
          this.menu.splice(0, 1);
        }
        // var flag = Comm.getCookie("editor_el_newyear");
        // if (!flag) {
        //   this.menu.forEach(item => {
        //     if (item.type === "material") {
        //       item.hasNew = true;
        //     }
        //   });
        // }
        //进入页面时激活的sourcelist(默认为page)
        this.setMenuActive();
      }
    });
  }
};
</script>
<style lang="scss">
$blue: #00a2eb;
.setting-title {
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 0 20px 0px;
  color: #fff;
  font-size: 14px;
}
.leftside {
  position: absolute;
  zoom: 1;
  left: 0;
  top: 49px;
  bottom: 0;
  background-color: #414750;
  z-index: 40;
  min-height: 481px;
  .close {
    position: absolute;
    top: 50%;
    right: -6px;
    width: 13px;
    height: 89px;
    margin-right: -6.5px;
    margin-top: -44.5px;
    background: url(/assets/images/icon/ico-turn1.png) no-repeat 0 0;
    color: #fff;
    cursor: pointer;

    &.turnoff {
      background: url(/assets/images/icon/ico-turn2.png) no-repeat 0 0;
    }
  }
  .menu {
    float: left;
    width: 66px;
    height: 100%;
    background: #262b30;
    position: relative;
    z-index: 49;
    .list {
      padding-top: 24px;
      height: 100%;
      li {
        cursor: pointer;
        width: 66px;
        background: url(/assets/images/icon/ico_menu.png) no-repeat 0 0;
        zoom: 1;
        height: 67px;
        text-align: center;
        padding-top: 37px;
        color: #8a9199;
        font-size: 14px;
        position: relative;
        &.group {
          background-position: 23px 15px;
        }
        &.groupText {
          background-position: 23px -55px;
        }
        &.material {
          background-position: 23px -195px;
        }
        &.background {
          background-position: 23px -264px;
        }
        &.upload {
          background-position: 23px -332px;
        }
        &.page {
          background-position: 23px -124px;
        }
        &.action {
          background-position: 20px -124px;
        }
        &.setting {
          background-position: 23px -400px;
        }
        &.help {
          background: url(/assets/images/icon/ico-help.png) no-repeat
            23px 15px;
          position: absolute;
          bottom: 10px;
          padding-top: 0;
          a {
            display: block;
            padding-top: 37px;
            color: #8a9199;
            font-size: 14px;
          }
        }
        &.active,
        &:hover {
          color: #fff;
          &.setting {
            background-position: -55px -400px;
          }
          &.group {
            background-position: -58px 15px;
          }
          &.groupText {
            background-position: -56px -55px;
          }
          &.material {
            background-position: -56px -195px;
          }
          &.background {
            background-position: -56px -264px;
          }
          &.upload {
            background-position: -56px -332px;
          }
          &.action {
            background-position: -54px -124px;
          }
          &.help {
            background: url(/assets/images/icon/ico-help.png) no-repeat
              23px -45px;
            a {
              color: #fff;
              font-size: 14px;
            }
          }
        }
        &.hasnew {
          &:after {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: red;
            content: "";
            top: 10px;
            right: 20px;
          }
        }
      }
    }
    .activebg {
      width: 66px;
      height: 67px;
      background-color: #414750;
      position: absolute;
      zoom: 1;
      left: 0;
      z-index: -1;
      transition: all 0.2s ease-in-out;
      i {
        position: absolute;
        right: 0;
        width: 16px;
        height: 16px;
        background: #414750;
        top: -16px;
        &:before {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          background: #262b30;
          border-radius: 0 0 8px 0;
        }
        &:last-child {
          top: auto;
          bottom: -16px;
          &:before {
            border-radius: 0 8px 0 0;
          }
        }
      }
    }
  }
  .source {
    position: relative;
    z-index: 48;
    float: left;
    width: 309px;
    height: 100%;
    transition: all 0.3s ease;
    transform: translate(0, 0);
    .wrap {
      width: 100%;
      height: 100%;
      .source-box {
        height: 100%;
        &.box-animate {
          transition: all 0.3s ease;
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// main.vue?164b2172
