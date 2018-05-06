<template>
	<div class="nav" :style="{background:(pcMode==false?color.bgColor:'#262b30')}">
		<div class="logo" :style="{background:color.bgDark,color:color.fontColor,opacity:(pcMode==false?1:0)}">
			<a :href="logoLink" v-if="!isCoop">
				<img src="/assets/images/jianye.png" alt="">
			</a>
			<a :href="logoLink" class="coop-logo" v-else>{{coopLetter}}</a>
		</div>
		<div class="common">
			<span class="item none-bdr" :style="{color:color.fontColor}">尺寸：{{parseInt(pageSize.width)+pageSize.unit}}*{{parseInt(pageSize.height)+pageSize.unit}}</span>
			<!-- <span class="item bdr" @click.stop="newPage" :style="{color:color.fontColor}">
				<i class="tbzico ico-cross"></i>新建尺寸</span> -->
			<!-- modal -->
		</div>
		<div class="login" v-if="logState">
			<div class="center">
				<span :class="['item',{'disabled':!allowUndo}]" @click="undo" :style="{color:color.fontColor}">
					<i class="tbzico ico-eArrow2"></i>撤销</span>
				<span :class="['item',{'disabled':!allowRedo}]" @click="redo" :style="{color:color.fontColor}">
					<i class="tbzico ico-eArrow2 ico-reverseX"></i>恢复</span>
				<span class="item" v-if="logState" @click.stop="callModal({'type':'savebox','modalOver':false})" :style="{color:color.fontColor}">
					<i class="tbzico ico-eSave" style="margin-top: 3px;"></i>保存
				</span>
        <savebox style="left:calc(50% - 130px)"/>
          <!-- <span class="item" @click.stop="callModal({'type':'download','modalOver':false})" :style="{color:color.fontColor}">
					<i class="tbzico ico-eDownload"></i>下载</span> -->
				<span class="save-state" style="display: none;" :style="{color:color.fontColor}">所有操作已保存</span>

				<!-- modal -->
				<qrcode/>

        	<download/>
			</div>
			<div class="right">
				<span class="item bdr preview" @click.stop="previewFile" :style="{color:color.bgColor}">
					<i class="tbzico ico-erweima"></i>下载/发布</span>

				<span class="avatar item" :style="{color:color.fontColor}" @click="$store.commit('callModal',{type:'userset',modalOver:false})">
					<i class="tbzico ico-arrow3 ico180"></i>
					<span>{{username}}</span>
					<img :src="`/uploads/face/${uid}_180.png?_=${new Date().getTime()}`" onerror="this.src='/themes/pic/touxiang_tbz2.png'" alt="" v-if="uid>0">
				</span>
			</div>
			<Userset/>
		</div>
		<div class="logout" v-else :style="{color:color.fontColor}">
			未登录状态下仅供使用体验，登录后可进行保存，分享和下载
			<a href="javascript:;" @click.stop="callModal({'type':'login','modalOver':true})">快速登录</a>
		</div>
	</div>
</template>
<script>
import savebox from "@/components/editor/modal/nav/savebox";
import qrcode from "@/components/editor/modal/nav/qrcode";
import Userset from "@/components/editor/modal/nav/userSet";
import Comm from "@/common/common.js";
import EventBus from "@/common/eventBus.js";
import $ from "jquery";
import socket from "@/common/socket.js";
import download from "@/components/editor/modal/nav/download";
export default {
  data() {
    return {
      title: {
        active: true
      },
      printUrl: "/editorApi/member/submit-print",
      printShow: true,
      pcMode: false
    };
  },
  components: { savebox, Userset, qrcode, download },
  methods: {
    newPage() {
      this.$store.commit("callModal");
      this.$store.commit("callModal", { type: "newPage", modalOver: true });
    },
    //设置舞台尺寸
    setDocSize(width, height) {
      this.$store.commit("setDocSize", {
        width: width,
        height: height
      });
    },
    onTitleChange(e) {
      var titleName = e.target.innerText;
      if (titleName.length > 20) {
        titleName = titleName.slice(0, 20);
      }
      e.target.textContent = titleName;
      this.$store.commit("setDocTitle", titleName);
      this.title.active = false;
    },
    //撤销
    undo() {
      this.$store.commit("undo");
    },
    //恢复
    redo() {
      this.$store.commit("redo");
    },
    //激活编辑标题
    activeEdit() {
      if (this.title.active) {
        return;
      }
      this.title.active = true;
      this.$nextTick(function() {
        Comm.getDivtext(event.target);
      });
    },
    callModal(data) {
      var _self = this;
      if (data.type == "share") {
        //获取shareUrl
        EventBus.$emit("getShareUrl", this.$store.state.docData.id);
        //触发生成缩略图
        socket.editorEmit("templateUpdateThumbnail", {
          uid: this.$store.state.editor.uid,
          tpl_id: this.$store.state.docData.id
        });
        _self.$store.commit("callModal");
        _self.$store.commit("callModal", data);
      } else if (data.type == "download") {
        console.log("开始下载...");
        //关闭其他的
        _self.$store.commit("callModal");
        //开启等待
        _self.$store.commit("callModal", { type: "wait", modalOver: true });
        //开始保存
        socket.saveFile(function() {
          console.log("保存完成...", data);
          //保存成功
          _self.$store.commit("callModal");
          _self.$store.commit("callModal", data);
        });
      } else {
        _self.$store.commit("callModal");
        _self.$store.commit("callModal", data);
      }
    },
    //印刷
    printFile() {
      this.$store.commit("callModal");
      if (this.printable) {
        var _self = this,
          tplId = this.$store.state.docData.id;
        this.$store.commit("callModal", { type: "wait", modalOver: true });
        socket.saveFile(function() {
          //保存成功
          $.ajax({
            type: "GET",
            dataType: "json",
            url: _self.printUrl,
            data: { tpl_id: tplId },
            async: false,
            success: function(data) {
              _self.$store.commit("callModal");
              //普通版
              if (data.data.productLinks == undefined) {
                _self.$store.commit("callModal", {
                  type: "alert",
                  modalOver: true,
                  cls: "ok",
                  text: "保存成功，点击确定去印刷喽~",
                  fn: function() {
                    window.open(data.data.buyUrl);
                  }
                });
              } else {
                //商户版
                if (data.data.productLinks.length == 0) {
                  _self.$store.commit("callModal", {
                    type: "alert",
                    modalOver: true,
                    cls: "ok",
                    text: "提交成功"
                  });
                } else {
                  _self.$store.state.editor.coorpLinks = data.data.productLinks;
                  _self.$store.commit("callModal", {
                    type: "coorp",
                    modalOver: true
                  });
                }
              }
            }
          });
        }, true);
      } else {
        this.isCoop
          ? this.$store.commit("callModal", {
              type: "alert",
              modalOver: true,
              cls: "danger",
              text: "此模板已提交印刷，请勿重复提交！"
            })
          : this.$store.commit("callModal", {
              type: "alert",
              modalOver: true,
              cls: "danger",
              text: "此类模板不支持下单印刷"
            });
      }
    },
    previewFile() {
      //关闭其他的
      this.$store.commit("callModal");
      //开启等待
      this.$store.commit("callModal", { type: "wait", modalOver: true });
      //开始保存
      socket.saveFile(() => {
        //保存成功
        this.$store.commit("callModal");
        this.openQRCodeModal();
      }, true);
    },
    openQRCodeModal() {
      this.$store.commit("callModal", {
        type: "jianyePreview",
        modalOver: false
      });
      /*this.$store.state.editor.qrcodeText = `http://${document.domain.replace(
        "www.",
        "m."
      )}/jianye/preview/${this.$store.state.docData.id}.html`;

      this.$store.state.editor.qrcodeTip = "微信扫码 预览效果";*/
    }
  },
  computed: {
    username() {
      return this.$store.state.editor.username;
    },
    uid() {
      return this.$store.state.editor.uid;
    },
    isCoop() {
      var coopid = this.$store.state.editor.coorpId;
      return coopid > 0;
    },
    coopLetter() {
      var coopname = this.$store.state.editor.coorpName;
      return coopname.slice(0, 1);
    },
    color() {
      return this.$store.state.editor.color;
    },
    //获取文件名
    getTitle() {
      var title = this.$store.state.docData.title;
      if (title == "") {
        return "点击设置文件名";
      } else {
        return title;
      }
    },
    //允许撤销
    allowUndo() {
      var index = this.$store.state.stage.docSnapIndex;
      var snap = this.$store.state.stage.docSnap;
      if (snap.length > 0 && index > 0) {
        return true;
      } else {
        return false;
      }
    },
    //允许恢复
    allowRedo() {
      var index = this.$store.state.stage.docSnapIndex;
      var snap = this.$store.state.stage.docSnap;
      if (snap.length > 0 && snap.length > index + 1) {
        return true;
      } else {
        return false;
      }
    },
    logState() {
      let loginMode = this.$store.state.editor.loginMode;

      if (loginMode == "c_logged" || loginMode == "logged") {
        return true;
      } else {
        return false;
      }
    },
    pageUnit() {
      var unit = this.$store.state.docData.info.unit;
      return {
        unit: unit,
        text: unit == "px" ? "像素" : "毫米"
      };
    },
    printable() {
      return this.$store.state.docData.printable;
    },
    //logo-link
    logoLink() {
      var teamId = this.$store.state.stage.groupId;
      var ext = teamId > 0 ? "?branch=" + teamId : "";
      return "/" + ext;
    },
    pageSize() {
      return {
        width: this.$store.state.docData.edit_config.width,
        height: this.$store.state.docData.edit_config.height,
        unit: this.$store.state.docData.edit_config.unit
      };
    }
  },
  mounted() {
    if (navigator.userAgent.indexOf("tubangzhu") != -1) {
      this.pcMode = true;
    }
  }
};
</script>
<style lang="scss" scoped>
$blue: #00a2eb;
.nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 49px;
  background: $blue;
  z-index: 50;
  font-size: 14px;
  line-height: 49px;
  .logo {
    float: left;
    width: 66px;
    background: #008bd2;
    height: 49px;
    line-height: 49px;
    text-align: center;
    a {
      display: inline-block;
      vertical-align: middle;
      i {
        font-size: 30px;
      }
      img {
        margin-top: 12px;
      }
    }
    .coop-logo {
      font-size: 18px;
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 36px;
      vertical-align: middle;
      border: 2px solid rgba(255, 255, 255, 0.3);
      text-decoration: none;
      border-radius: 50%;
    }
  }
  .common {
    width: 309px;
    position: relative;
    z-index: 2;
    float: left;
    // padding-left: 23px;
    text-align: center;
    .item {
      line-height: 30px;
      float: none;
      display: inline-block;
      color: #fff;
      // margin-right: 15px;
      transition: all 0.2s ease-in;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      margin-top: 10px;
      padding: 0 8px;
      cursor: pointer;
      i {
        margin-right: 6px;
        font-size: 12px;
        position: relative;
        top: -1px;
      }
      &:hover {
        background: rgba(60, 60, 60, 0.3);
      }
      &.none-bdr {
        background: none !important;
        cursor: default;
      }
      &.bdr {
        line-height: 25px;
        background: none;
        border-radius: 15px;
        border: 2px solid;
        padding: 0 18px;
        font-size: 12px;
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
  .logout {
    position: absolute;
    left: 375px;
    right: 0;
    height: 100%;
    color: #fff;
    text-align: center;
    a {
      color: #ffde00;
      margin-left: 15px;
      &:hover {
        text-decoration: underline;
      }
    }
  }
  .login {
    position: absolute;
    left: 375px;
    right: 0;
    height: 100%;
    color: #fff;
    .center {
      float: left;
      width: calc(100% - 154px);
      text-align: center;
      color: #333;
      .save-state {
        opacity: 0.7;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        margin-left: 10px;
        position: absolute;
        top: 1px;
      }
      .item {
        line-height: 28px;
        height: 30px;
        display: inline-block;
        color: #fff;
        margin-right: 15px;
        transition: all 0.2s ease-in;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        margin-top: 9px;
        padding: 0 14px;
        cursor: pointer;
        &:hover {
          background: rgba(60, 60, 60, 0.3);
        }
        i {
          margin-right: 6px;
          font-size: 16px;
          position: relative;
          top: 1px;
        }
        &.none-bdr {
          background: none !important;
          cursor: default;
        }
      }
    }
    .right {
      position: absolute;
      top: -1px;
      right: 8px;
      .item {
        margin-right: 5px;
        color: #fff;
        cursor: pointer;
        font-size: 12px;
        i {
          vertical-align: middle;
          &.ico-skin-in {
            font-size: 14px;
          }
        }
        &.avatar {
          img {
            width: 30px;
            vertical-align: middle;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.5);
            position: relative;
            top: -2px;
          }
          i {
            font-size: 28px;
            margin-right: -4px;
          }
          span {
            padding-right: 3px;
            cursor: pointer;
          }
        }
        &.bdr {
          line-height: 27px;
          background: none;
          border-radius: 15px;
          display: inline-block;
          border: 2px solid;
          padding: 0 18px;
          margin-right: 15px;
          font-size: 12px;
          i {
            margin-right: 6px;
          }
          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
        &.preview {
          border-color: #fff;
          font-size: 14px;
          background: #fff !important;
        }
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// interaction.vue?935d2bce
