<template>
  <div class="nav" :style="{background:(pcMode==false?color.bgColor:'#262b30')}">
    <div class="logo" :style="{background:color.bgDark,color:color.fontColor,opacity:(pcMode==false?1:0)}">
      <a :href="logoLink" v-if="!isCoop">
        <i class="tbzico ico-eLogo"></i>
      </a>
      <a :href="logoLink" class="coop-logo" v-else>{{coopLetter}}</a>
    </div>
    <div class="common">
			<span class="item item-border"
            @click.stop="callModal({'type':'unit','modalOver':false})"
            :style="{color:color.fontColor}">页面尺寸</span>
      <span :class="['item','item-border','print',{'disabled':!printable}]"
            @click.stop="printFile"
            v-if="printShow && (logState!='c_logged' && logState!='c_visitor')"
            :style="{color:color.fontColor}">下单印刷
        <span class="action-tip" v-if="!isCoop && docDataId!=-1 && printable">印刷9.5折</span>
        </span>
      <div :class="['editTitle','item',{'active':title.active}]">
				<span :contenteditable="title.active"
              v-text="getTitle" @click="activeEdit"
              @blur="onTitleChange"
              :style="{color:color.fontColor}"></span>
        <i></i>
      </div>
      <!-- modal -->
      <pageUnit/>
    </div>
    <div class="login" v-if="logState=='logged' || logState=='c_logged' || logState=='c_visitor'">
      <div class="center">
				<span :class="['item',{'disabled':!allowUndo}]" @click="undo" :style="{color:color.fontColor}">
					<i class="tbzico ico-eArrow2"></i>撤销</span>
        <span :class="['item',{'disabled':!allowRedo}]" @click="redo" :style="{color:color.fontColor}">
					<i class="tbzico ico-eArrow2 ico-reverseX"></i>恢复</span>
        <span class="item" v-if="(logState!='c_logged' && logState!='c_visitor')"
              @click.stop="callModal({'type':'share','modalOver':false})" :style="{color:color.fontColor}">
					<i class="tbzico ico-eShare" style="margin-top: 1px;"></i>分享</span>
        <span class="item"
              v-if="((isCoop && coopDownload )|| !isCoop) && (logState!='c_logged' && logState!='c_visitor')"
              @click.stop="onDownloadClick" :style="{color:color.fontColor}">
					<i class="tbzico ico-eDownload"></i>下载</span>

        <!-- <span class="item" @click.stop="previewFile" :style="{color:color.fontColor}">
                    <i class="tbzico ico-ePreview"></i>预览</span> -->
        <span class="item" v-if="logState=='logged' || logState=='c_logged' || logState=='c_visitor'"
              @click.stop="callModal({'type':'savebox','modalOver':false})" :style="{color:color.fontColor}">
					<i class="tbzico ico-eSave" style="margin-top: 1px;"></i>保存
				</span>

        <span class="save-state" style="display: none;" :style="{color:color.fontColor}">所有操作已保存</span>
        <!-- modal -->
        <savebox/>
        <download/>
        <share/>
      </div>
      <div class="right">
        <span class="item" v-if="(logState!='c_logged' && logState!='c_visitor')" :style="{color:color.fontColor}"
              @click="$store.commit('callModal',{type:'colorset',modalOver:false})"><i
          class="tbzico ico-skin-in"></i></span>
        <span v-if="logState=='logged' || logState=='c_logged'" class="avatar item" :style="{color:color.fontColor}"
              @click="$store.commit('callModal',{type:'userset',modalOver:false})">
					<i class="tbzico ico-arrow3 ico180"></i><span>{{username}}</span>
					<img :src="userFace" onerror="this.src='/themes/pic/touxiang_tbz2.png'" alt="" v-if="uid>0">
				</span>
        <span class="item-text" v-if="logState=='c_visitor'" @click="onLoginBtnClickHandler">
					登录/注册
				</span>
        <span class="item-text black" v-if="logState=='c_visitor' || logState=='c_logged'"
              @click="onFinishedBtnClickHandler">

            <i class="tbzico ico-wancheng" style="margin-top: 1px;"></i>
					  <span v-text="onFinish=='insert'?'完成':'下载'"></span>

				</span>
        <span class="item-text black" @click="onExitHandler" v-if="logState=='c_visitor' || logState=='c_logged'">
					<i class="tbzico ico-tuichu1"></i>
					<span>退出</span>
				</span>
      </div>
      <Userset/>
    </div>
    <div class="logout" v-else :style="{color:color.fontColor}">
      您当前用户状态仅供设计体验，登录后可进行保存、下单、分享与下载等操作
      <a href="javascript:;" @click.stop="onLoginBtnClickHandler">登录/注册</a>
    </div>
    <!--第三方合作网站下载模态框-->
    <div class="croop-download-modal" v-show="downloadShow" @click="downloadShow=false">
      <a target="_blank" :href="downloadURL"><i class="tbzico ico-eCompute"></i>下载到电脑</a>
    </div>
  </div>
</template>
<script>

  import pageUnit from "@/components/editor/modal/nav/pageUnit";
  import download from "@/components/editor/modal/nav/download";
  import share from "@/components/editor/modal/nav/share";
  import savebox from "@/components/editor/modal/nav/savebox";
  import Userset from "@/components/editor/modal/nav/userSet";
  import Comm from "@/common/common.js";
  import EventBus from "@/common/eventBus.js";
  import $ from "jquery";
  import socket from "@/common/socket.js";
  export default {
    data() {
      return {
        title: {
          active: false
        },
        printUrl: "/editorApi/member/submit-print",
        printShow: true,
        pcMode: false,
        downloadShow: false
      };
    },
    components: {pageUnit, download, share, savebox, Userset},
    methods: {
      onDownloadClick() {
        if (this.isCoop && this.coopDownload) {
          // 商户版，请求支付信息获取接口
          this.$store.commit("callModal", {type: "wait", modalOver: true});
          // 请求订单数据
          this.$http
            .post("/editorApi/template/allow-download", {
              template_id: this.docDataId
            })
            .then(res => {
              if (res.body.error != 0) {
                console.error("订单创建失败", res.body);
                this.$store.commit("callModal");
                alert(res.body.msg);
              } else {
                console.log("订单创建成功", res.body);
                if (res.body.data.free == true) {
                  this.$store.commit("callModal");
                  this.callModal({type: "download", modalOver: false});
                }
                if (res.body.data.order_sn) {
                  console.log("弹出支付");
                  this.$store.commit("callModal");
                  this.callModal({type: "shanghuPay"});
                  this.$store.state.editor.coop_download_data = res.body.data;
                }
              }
            });
        } else {
          // 非商户版，直接弹出下载
          this.callModal({type: "download", modalOver: false});
        }
      },
      //登录/注册
      onLoginBtnClickHandler() {
        var modal =
          window.location.hostname.split(".")[0] === "www" ? "login" : "register";
        if (this.isCoop) {
          modal = "register";
        }
        this.callModal({type: modal, modalOver: true});
      },
      //完成
      onFinishedBtnClickHandler() {
        this.downloadShow = false;
        this.$store.commit("callModal", {type: "wait", modalOver: true});
        socket.saveFile(() => {
          //保存成功
          socket.requestTemplateThumbnails(e => {
            this.$store.commit("callModal");
            if (this.onFinish == "insert") {
              this.request({
                type: "finish",
                url: e.data
              });
            } else {
              this.downloadShow = true;
            }
          });
        }, true);
      },
      //退出
      onExitHandler() {
        this.request({
          type: "exit"
        });
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
        this.$nextTick(function () {
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
          //关闭其他的
          _self.$store.commit("callModal");
          //开启等待
          _self.$store.commit("callModal", {type: "wait", modalOver: true});
          //开始保存
          socket.saveFile(function () {
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
        if (this.logState !== "logged") {
          if (this.isCoop) {
            this.onLoginBtnClickHandler();
          } else {
            this.callModal({type: "login", modalOver: true});
          }
          return;
        }
        if (this.printable) {
          var _self = this,
            tplId = this.$store.state.docData.id;
          this.$store.commit("callModal", {type: "wait", modalOver: true});
          socket.saveFile(function () {
            //保存成功
            $.ajax({
              type: "GET",
              dataType: "json",
              url: _self.printUrl,
              data: {tpl_id: tplId},
              async: false,
              success: function (data) {
                _self.$store.commit("callModal");
                //普通版
                if (data.data.productLinks == undefined) {
                  _self.$store.state.editor.printBuyUrl = data.data.buyUrl;
                  $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: "/editorApi/connection/coupon",
                    async: false,
                    success: function (res) {
                      if (res.error == 0) {
                        if (res.data.status == 1) {
                          _self.$store.commit("callModal", {
                            type: "saleAction",
                            modalOver: true
                          });
                        } else {
                          _self.$store.commit("callModal", {
                            type: "alert",
                            modalOver: true,
                            cls: "ok",
                            text: "保存成功，点击确定去印刷喽~",
                            fn: function () {
                              window.open(_self.$store.state.editor.printBuyUrl);
                            }
                          });
                        }
                      } else if (res.error == -1) {
                        this.callModal({type: "login", modalOver: true});
                      } else {
                        _self.$store.commit("callModal", {
                          type: "alert",
                          modalOver: true,
                          cls: "danger",
                          text: "印刷请求提交失败，请关闭网页重新进入"
                        });
                      }
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
                    if (_self.$store.state.editor.coorpLinks.length == 1) {
                      _self.$store.commit("callModal", {
                        type: "alert",
                        modalOver: true,
                        cls: "ok",
                        text: "保存成功，点击确定去印刷喽~",
                        fn: function () {
                          window.open(_self.$store.state.editor.coorpLinks[0].url);
                        }
                      });
                    } else if (_self.$store.state.editor.coorpLinks.length > 1) {
                      _self.$store.commit("callModal", {
                        type: "coorp",
                        modalOver: true
                      });
                    } else {
                      alert("未设置下单印刷链接");
                    }
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
        this.$store.commit("callModal", {type: "preview", modalOver: false});
      },
      request(payload) {
        var proxyNode = document.createElement("iframe");
        proxyNode.name = "tbz_proxy_node";
        if (payload.type == "finish") {
          console.log("editor finish");
          proxyNode.src =
            this.openUrl + "?type=" + payload.type + "&url=" + payload.url;
        } else if (payload.type == "open") {
          proxyNode.src =
            this.openUrl +
            "?type=" +
            payload.type +
            "&access=" +
            payload.access +
            "&tplid=" +
            payload.tplid;
        } else {
          proxyNode.src = this.openUrl + "?type=" + payload.type;
        }
        proxyNode.style.display = "none";
        document.body.appendChild(proxyNode);
      }
    },
    computed: {
      downloadURL() {
        return `/editorApi/template/open-download?tpl_id=${
          this.docDataId
          }&access=${this.openAccessToken}`;
      },
      onFinish() {
        return this.$store.state.editor.open_on_finish || "insert";
      },
      openUrl() {
        return this.$store.state.editor.openUrl;
      },
      username() {
        return this.$store.state.editor.username;
      },
      uid() {
        return this.$store.state.editor.uid;
      },
      userFace() {
        return this.$store.state.editor.userFace;
      },
      isCoop() {
        var coopid = this.$store.state.editor.coorpId;
        return coopid > 0;
      },
      coopLetter() {
        var coopname = this.$store.state.editor.coorpName;
        return coopname.slice(0, 1);
      },
      coopDownload() {
        return this.$store.state.editor.coopAllowDownload;
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
      docDataId() {
        return this.$store.state.docData.id || -1;
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
        return this.$store.state.editor.loginMode;
      },
      openAccessToken() {
        return this.$store.state.editor.openAccessToken;
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
        return "/template/home/" + ext;
      }
    },
    mounted() {
      if (navigator.userAgent.indexOf("tubangzhu") != -1) {
        this.pcMode = true;
      }
      EventBus.$on("closeModal", () => {
        this.downloadShow = false;
      });
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
    .print {
      position: relative;
      .action-tip {
        position: absolute;
        right: -32px;
        top: -9px;
        color: #fff;
        background-color: #f63758;
        border-radius: 5px 0 5px 0;
        padding: 0 3px;
        font-size: 12px;
        font-weight: 900;
      }
    }
    .croop-download-modal {
      position: fixed;
      z-index: 10000;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
      top: 45px;
      right: 5px;
      padding: 10px;
      top: 50px;
      right: 94px;
      a {
        display: block;
        border: 1px solid #ccc;
        width: 190px;
        height: 41px;
        border-radius: 4px;
        font-size: 14px;
        line-height: 41px;

        padding-left: 50px;
        i {
          font-size: 18px;
          float: left;
          margin-right: 5px;
        }
        &:hover {
          color: #32c46e;
          border-color: #32c46e;
        }
      }
    }
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
      position: relative;
      z-index: 2;
      float: left;
      padding-left: 23px;
      padding-top: 10px;
      .item {
        float: left;
        color: #fff;
        margin-right: 15px;
        cursor: pointer;
        transition: all 0.2s ease-in;
        i {
          margin-right: 6px;
          font-size: 18px;
          position: relative;
          top: 1px;
        }
        &.disabled {
          opacity: 0.5;
        }
        &.item-border {
          display: inline-block;
          padding: 0 20px;
          line-height: 25px;
          border: 2px solid rgba(255, 255, 255, 0.7);
          border-radius: 15px;
          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }
      }
      .editTitle {
        display: inline-block;
        position: relative;
        padding: 0 20px;
        width: 162px;
        border: 2px solid rgba(255, 255, 255, 0);
        transition: all 0.2s ease-in;
        border-radius: 15px;
        height: 29px;
        float: left;
        span {
          outline: none;
          line-height: 25px;
          display: inline-block;
          width: 162px;
          white-space: nowrap;
          cursor: text;
          text-overflow: ellipsis;
          border: 2px solid rgba(255, 255, 255, 0);
          transition: all 0.2s ease-in;
          border-radius: 15px;
          overflow: hidden;
          position: absolute;
          left: 0;
          top: -2px;
          padding-left: 10px;
        }
        &.active {
          border: 2px solid rgba(255, 255, 255, 0.7);
          span {
            text-overflow: initial;
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
          color: #fff;
          margin: 0 20px;
          cursor: pointer;
          transition: all 0.2s ease-in;
          i {
            margin-right: 6px;
            font-size: 18px;
            position: relative;
            top: 1px;
          }
          &.disabled {
            opacity: 0.5;
          }
          &.item-border {
            display: inline-block;
            padding: 0 20px;
            line-height: 25px;
            border: 2px solid rgba(255, 255, 255, 0.7);
            border-radius: 15px;
            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          }
        }
      }
      .right {
        position: absolute;
        top: 0;
        right: 8px;
        .item-text {
          padding: 15px 15px;
          margin: 0px 5px;
          cursor: pointer;

          * {
            cursor: pointer;
          }
          &:hover {
            background-color: rgba(0, 0, 0, 0.1);
          }
          &.black {
            padding: 5px 10px;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 4px;
          }
        }
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
        }
      }
    }
  }
</style>


// WEBPACK FOOTER //
// main.vue?feb0b850
