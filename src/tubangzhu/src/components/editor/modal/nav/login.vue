<template>
	<transition name="fade-modal">
	<div class="login-modal modal" v-if="loginShow" @mousedown.stop="">
		<span class="close" @click="closeModal"><i class="tbzico ico-close"></i></span>
		<div class="wechat" v-show="type==0">
			<div class="title"><i class="tbzico ico-weChat"></i>微信登录</div>
			<div :class="['code',{jianye:$store.state.docData.product == 'jianye'}]">
				<div class="imgwrap">
					<img :src="img" width="150" alt="">
				</div>
				<p>手机打开微信&nbsp;&nbsp;扫二维码登录</p>
			</div>
			<div class="bottom" @click="(type=2)" v-show="showOtherLoginMethods"><i></i>其他方式登录</div>
		</div>
		<div class="mobile" v-show="type==2">
			<div class="box">
				<div class="back" @click="(type=0)"><span><i></i>返回</span></div>
				<form class="formBox" @submit.prevent="login">
					<div class="input">
						<input type="text" id="name" class="name" name="name" placeholder="手机号/邮箱" v-model="loginData.name">
						<label for="name"></label>
					</div>
					<div class="input">
						<input type="password" id="pwd" class="pwd" name="password" placeholder="输入密码" v-model="loginData.password">
						<label for="pwd"></label>
					</div>
					<p class="forget"><a href="/index/password.html" target="_blank">忘记密码？</a></p>
					<input type="submit" class="btn" value="登录">
				</form>
			</div>
			<div class="bottom">
				<a href="javascript:;" v-for="item in otherLink" @click="loginOther(item)" :class="item.type"></a>
			</div>
		</div>
		<div class="bind" v-show="type==1">
			<div class="box">
				<div class="title"><span><i></i>绑定手机</span></div>
				<p class="later">绑定以后下次可以手机登录<span @click="closeModal">以后再说</span></p>
				<form class="formBox bindform" @submit.prevent="submit">
					<div class="input bind-input">
						<input type="text" id="mobile" class="mobile" name="mobile" placeholder="输入手机号" v-model="phone">
					</div>
					<div class="input bind-input">
						<input type="text" id="valid" class="valid" name="code" placeholder="短信验证码" v-model="code">
						<span :class="{active:validActive}" @click="getValid">{{validText}}</span>
					</div>
					<div class="input bind-input">
						<input type="password" id="password"  name="password" placeholder="设置密码" v-model="password">
					</div>
					<div class="input bind-input">
						<input type="password" id="re-pwd"  name="password_repeat" placeholder="确认密码" v-model="repwd"/>
					</div>
					<input type="submit" class="btn" value="确定"/>
				</form>
			</div>
		</div>
		<div class="tip" v-show="tipshow">{{tip}}</div>
	</div>
	</transition>
</template>
<script>
import $ from "jquery";
export default {
  data() {
    return {
      type: 0,
      otherLink: [
        { href: "/oauth/auth?authclient=qq", type: "qq" },
        { href: "/oauth/auth?authclient=weibo", type: "weibo" }
        // {href:'/oauth/zbj/state/tbz_www.html',type:'bajie'}
      ],
      loginData: {
        name: "",
        password: ""
      },
      img: "",
      phone: "",
      password: "",
      code: "",
      repwd: "",

      timer: null,
      timeCount: 60,
      validActive: true,
      validText: "获取验证码",
      tipshow: false,
      tip: "",
      showOtherLoginMethods: false
    };
  },
  computed: {
    loginShow() {
      return this.$store.state.editor.modal["login"];
    }
  },
  methods: {
    initCode() {
      this.img = `/wechat/qrcode.html?${(Math.random() * 10e6)
        .toString()
        .slice(0, 6)}`;
      console.log("img", this.img);
    },
    closeModal() {
      this.$store.commit("callModal");
    },
    loginOther(payload) {
      var { href, type } = payload;
      if (type == "weibo") {
        var iWidth = 750;
        var iHeight = 550;
      } else if (type == "qq") {
        var iWidth = 750;
        var iHeight = 400;
      } else {
        return;
      }
      var iTop = 100;
      var iLeft = (window.screen.availWidth - 10 - iWidth) / 2;
      window.open(
        href,
        "newWindow",
        "width=" +
          iWidth +
          ", height=" +
          iHeight +
          ", top=" +
          iTop +
          ", left=" +
          iLeft +
          ", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no"
      );
    },
    getValid() {
      var self = this;
      if (this.validActive) {
        if (/^1(3|4|5|7|8)\d{9}$/.test(this.phone)) {
          this.tipshow = false;
          var params = {};
          params.mobile = this.phone;
          params.type = "register";
          $.get("/sms", params, function(result) {
            if (result.error == 0) {
              self.validActive = false;
              self.tipshow = true;
              self.tip = "验证码已发送";

              self.timer = window.setInterval(function() {
                self.timeCount--;
                if (self.timeCount === 0) {
                  self.timeCount = 60;
                  self.validText = "获取验证码";
                  self.validActive = true;
                  window.clearInterval(self.timer);
                  return;
                }
                self.validText = self.timeCount + "s后重新获取";
              }, 1000);
            } else {
              self.tipshow = true;
              self.tip = result.msg;
            }
          });
        } else {
          this.tipshow = true;
          this.tip = "请输入正确的手机号码";
        }
      }
    },
    submit() {
      if (!/^1(3|4|5|7|8)\d{9}$/.test(this.phone)) {
        this.tipshow = true;
        this.tip = "请输入正确的手机号码";
        return;
      }
      if (this.password != this.repwd) {
        this.tipshow = true;
        this.tip = "两次输入的密码不一致";
        return;
      }
      if (this.code.length != 4) {
        this.tipshow = true;
        this.tip = "验证码格式错误";
        return;
      }
      var formData = JSON.stringify({
        mobile: this.phone,
        password: this.password,
        password_repeat: this.repwd,
        code: this.code
      });
      this.$http.post("/member/bind-mobile.html", formData).then(
        response => {
          // success callback
          var result = response.data;
          if (result.error == 0) {
            // this.callModal();
            // this.$store.commit('callModal', {
            // 	type: 'alert',
            // 	modalOver: true,
            // 	cls: 'ok',
            // 	text: '绑定手机成功！',
            // })
            window.location.reload();
          } else {
            this.tipshow = true;
            this.tip = result.msg;
          }
        },
        response => {
          console.log("error", response);
        }
      );
    },
    login() {
      var self = this;
      var formData = JSON.stringify(this.loginData);
      this.$http.post("/editorApi/v1/member/login", formData).then(
        response => {
          // success callback
          var result = response.data;
          if (result.error == 0) {
            window.location.reload();
          } else {
            self.tipshow = true;
            self.tip = result.msg;
          }
        },
        response => {
          console.log("error", response);
        }
      );
    },
    watchWechat() {
      this.initCode();
      this.timer = setInterval(() => {
        $.post(
          "/wechat/session.html",
          {},
          result => {
            console.log(result, "session");
            if (result.error == 0) {
              // 如果已经绑定过手机则跳转
              if (
                result.data.isMob == 1 ||
                this.$store.state.docData.product == "jianye"
              ) {
                window.location.reload();
              } else {
                this.type = 1;
              }
            }
          },
          "json"
        );
      }, 2000);
    },
    removeWatch() {
      clearInterval(this.timer);
    }
  },
  watch: {
    type: function(val) {
      val == 0 ? this.watchWechat() : this.removeWatch();
    },
    loginShow: function(val) {
      val ? this.watchWechat() : this.removeWatch();
    }
  },
  mounted() {
    this.showOtherLoginMethods = location.host.indexOf("jianye") == -1;
  },
  unMounted() {
    this.removeWatch();
  }
};
</script>
	<style lang="scss">
.login-modal {
  top: 45%;
  margin-top: -180px;
  width: 306px;
  left: calc(50% - 153px);
  padding: 0;
  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 10px;
    height: 10px;
    cursor: pointer;
    z-index: 1;
    color: #999;
    i {
      font-size: 12px;
    }
  }
  .later {
    line-height: 26px;
    color: #adadad;
    width: 249px;
    margin: 0 auto;
    padding-bottom: 8px;
    span {
      float: right;
      color: #00a2eb;
      cursor: pointer;
      &:hover {
        color: #0a8bc5;
      }
    }
  }
  .tip {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    margin-top: 10px;
    text-align: center;
    line-height: 41px;
    height: 41px;
    background: #ff500c;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
  }
  .wechat {
    border-radius: 4px;
    overflow: hidden;
    text-align: center;
    .title {
      color: #40c484;
      font-size: 18px;
      line-height: 75px;
      i {
        color: #52ac43;
        font-size: 24px;
        margin-right: 5px;
      }
    }
    .code {
      font-size: 0;
      .imgwrap {
        height: 150px;
      }
      p {
        color: #5d5d5d;
        font-size: 12px;
        line-height: 41px;
      }
      &.jianye {
        padding-bottom: 20px;
      }
    }
    .bottom:hover {
      background: #cfcfcf;
    }
  }
  .box {
    border-radius: 4px;
    overflow: hidden;
    padding-bottom: 20px;
    .back {
      padding: 10px;
      font-size: 12px;
      color: #5d5d5d;
      i {
        transform: scaleX(-1);
        display: inline-block;
        width: 18px;
        height: 18px;
        vertical-align: text-top;
        margin-right: 5px;
        background: url(../../../../assets/images/circleArrow.png) 50% 50%/cover
          no-repeat;
      }
      span {
        cursor: pointer;
      }
    }
    .title {
      padding: 10px;
      font-size: 12px;
      color: #5d5d5d;
      i {
        display: inline-block;
        width: 18px;
        height: 18px;
        vertical-align: text-top;
        margin-right: 5px;
        background: url(../../../../assets/images/phone.png) 50% 50%/contain
          no-repeat;
      }
    }
    form {
      padding-top: 30px;
      text-align: center;
      &.bindform {
        padding-top: 0;
        padding-bottom: 30px;
      }
      .input {
        position: relative;
        display: inline-block;
        label {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 20px;
          height: 20px;
          cursor: pointer;
          background: url(../../../../assets/images/login.png) 0 0 no-repeat;
          &[for="pwd"] {
            background-position: 0 -52px;
          }
        }
        input {
          width: 249px;
          height: 44px;
          line-height: 44px;
          padding-left: 40px;
          background: #fff;
          font-size: 14px;
          margin-bottom: 15px;
          border-radius: 3px;
          border: 1px solid #dcdcdc;
        }
        &.bind-input {
          overflow: hidden;
          width: 249px;
          input {
            height: 42px;
            line-height: 42px;
            padding-left: 8px;
            margin-bottom: 8px;
            &.valid {
              width: 140px;
              float: left;
            }
          }
          span {
            position: absolute;
            top: 0;
            right: 0px;
            width: 104px;
            height: 42px;
            line-height: 42px;
            background: #bcbcbc;
            color: #6c6c6c;
            text-align: center;
            font-size: 14px;
            cursor: pointer;
            border-radius: 3px;
            &.active {
              background-color: #00a2eb;
              color: #fff;
            }
          }
        }
      }
      .forget {
        text-align: right;
        color: #adadad;
        padding-right: 25px;
        a {
          cursor: pointer;
          font-size: 12px;
        }
      }
      .btn {
        margin-top: 10px;
        text-align: center;
        line-height: 44px;
        height: 44px;
        background: #00a2eb;
        border-radius: 3px;
        color: #fff;
        font-size: 16px;
        width: 249px;
        transition: all 0.2s ease-in;
        &:hover {
          background-color: #24a4de;
        }
      }
    }
  }
  .bottom {
    height: 55px;
    line-height: 55px;
    background: #eaeaea;
    color: #5d5d5d;
    font-size: 14px;
    text-align: center;
    i {
      display: inline-block;
      width: 30px;
      height: 30px;
      vertical-align: text-top;
      margin-right: 5px;
      background: url(../../../../assets/images/circleArrow.png) no-repeat;
    }
    a {
      display: inline-block;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin: 10px 6px;
      background: url(../../../../assets/images/other-ico.png) no-repeat 10px
        #fff;
      &.weibo {
        background-position: -50px;
      }
      &.bajie {
        background-position: -110px;
      }
    }
  }
}
</style>



// WEBPACK FOOTER //
// login.vue?b6ea255c