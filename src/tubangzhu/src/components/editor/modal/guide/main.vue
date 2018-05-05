<template>
  <div class="new-user-guide">

        <!--第1步-->
        <div class="step step1" v-if="nowStep==1" key="1">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step1.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老���机不用学</a>
            </div>
        </div>
                <!--第2步-->
        <div class="step step2" v-if="nowStep==2" key="2">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step2.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第3步-->
        <div class="step step3" v-if="nowStep==3" key="3">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step3.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第4步-->
        <div class="step step4" v-if="nowStep==4" key="4">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step4.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第5步-->
        <div class="step step5" v-if="nowStep==5" key="5">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step5.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第6步-->
        <div class="step step6" v-if="nowStep==6" key="6">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step6.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第7步-->
        <div class="step step7" v-if="nowStep==7" key="7">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step7.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第8步-->
        <div class="step step8" v-if="nowStep==8" key="8">
            <img class="step-image" src="./../../../../assets/images/newuser-guide/step8.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>下一个</span></button>
                <a href="javascript:;" @click="onCloseClick">我是老司机不用学</a>
            </div>
        </div>
                <!--第9步-->
        <div class="step step9" v-if="nowStep==9" key="9">
                        <img class="step-image" src="./../../../../assets/images/newuser-guide/step9.png"/>
            <div class="guide-contronl">
                <button @click="onNextClick"><span>开始使用</span></button>
               
            </div>
        </div>

      <!--source panel 遮挡-->
      <div class="source-panel-mask">

      </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      nowStep: 1
    };
  },
  methods: {
    onNextClick() {
      this.nowStep++;
      if (this.nowStep > 9) {
        this.$emit("close");
      }
    },
    onCloseClick() {
      this.$emit("close");
    }
  }
};
</script>
<style lang="scss">
.new-user-guide {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 50;

  .guide-contronl {
    position: absolute;
    width: 300px;
    z-index: 100;

    button {
      position: absolute;
      left: 0;
      top: 0;
      width: 181px;
      height: 57px;
      background: none;
      color: white;
      background-image: url(./../../../../assets/images/newuser-guide/button.png);
      font-size: 18px;
      cursor: pointer;
      span {
        position: relative;
        top: -4px;
        cursor: pointer;
      }
      &:active {
        opacity: 0.6;
      }
    }
    a {
      position: absolute;
      left: 200px;
      top: 20px;
      color: #00a2eb;
      text-decoration: underline;
    }
  }
  .step {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0.7);
    img {
      position: absolute;
    }
    button {
      position: absolute;
    }
  }

  .step1 {
    .step-image {
      left: 0;
      top: 49px;
    }
    .guide-contronl {
      left: 500px;
      top: 600px;
    }
  }
  .step2 {
    .step-image {
      left: 0;
      top: 49px;
    }
    .guide-contronl {
      left: 460px;
      top: 250px;
    }
  }
  .step3 {
    .step-image {
      left: 0;
      top: 49px;
    }
    .guide-contronl {
      left: 500px;
      top: 500px;
    }
  }
  .step4 {
    .step-image {
      left: 0;
      top: 40px;
    }
    .guide-contronl {
      left: 520px;
      top: 250px;
    }
  }
  .step5 {
    .step-image {
      left: 0;
      top: 47px;
    }
    .guide-contronl {
      left: 520px;
      top: 250px;
    }
  }
  .step6 {
    .step-image {
      left: 0;
      top: 49px;
    }
    .guide-contronl {
      left: 520px;
      top: 250px;
    }
  }
  .step7 {
    .step-image {
      left: 375px;
      top: 50px;
      max-width: none;
    }
    .guide-contronl {
      left: 620px;
      top: 220px;
    }
  }
  .step8 {
    .step-image {
      left: 50%;
      transform: translateX(-300px);
      top: 0px;
    }
    .guide-contronl {
      left: 520px;
      top: 250px;
    }
  }
  .step9 {
    .step-image {
      right: 120px;
      top: 0px;
    }
    .guide-contronl {
      right: 270px;
      top: 200px;
    }
  }
  .source-panel-mask {
    position: absolute;
    width: 309px;
    top: 49px;
    bottom: 0;
    left: 66px;
    background-color: #404750;
  }
}
</style>



// WEBPACK FOOTER //
// main.vue?7f57f6d0