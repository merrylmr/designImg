<template>
	<transition name="fade-minimodal">
		<div class="newpage-modal modal-mini" v-if="$store.state.editor.modal['newPage']" @mousedown.stop="">
			<div class="choice">
				<div class="title">创建新尺寸</div>
				<ul>
					<li v-for="(item,index) in list" @click="(active=index)" :style="getStyle(index)">
						<i class="tbzico ico-img"></i>
						<span class="t1" :style="getStyle(index)">{{item.title}}</span>
						<span class="t2" v-if="index!=0">{{item.size[0]}}x{{item.size[1]}}mm</span>
					</li>
				</ul>
				<p>{{sizeInfo[unit]}}</p>
			</div>
			<div class="form">
				<div class="title pageTitle">标题</div>
				<form action="/diy4/0/0" method="GET" target="_blank">
					<input type="text" name="title" v-model="title" class="name">
					<div class="item">
						<label for="width">宽度</label><input type="text" name="width" class="box" v-model="list[active].size[0]"></div>
					<div class="item">
						<label for="height">高度</label><input type="text" name="height" class="box" v-model="list[active].size[1]"></div>
					<div class="item">
						<label for="unit">单位</label><input readonly type="hidden" name="unit" value="mm">
						<span class="j-unit" @click="(modal = !modal)">{{sizeText[unit]}}</span>
						<i class="tbzico ico-down"></i>
						<div class="selectPannel" v-show="modal">
							<p @click="changeUnit('mm')">毫米</p>
							<p @click="changeUnit('px')">像素</p>
						</div>
					</div>
					<input name="dpi" type="hidden" v-if="list[active].dpi!=undefined" :value="list[active].dpi" />
					<p class="info">
						<i class="tbzico ico-care"></i>
						<span>{{printInfo[unit]}}</span>
					</p>
					<button type="submit" class="btn-sure" :style="{background:color.bgColor,color:color.fontColor}" @mouseover="btnHover('in')" @mouseout="btnHover('out')" @click="$store.commit('callModal')">确定</button>
					<span class="reset" @click="$store.commit('callModal')">取消</span>
				</form>
			</div>
		</div>
	</transition>
</template>
<script>
import eventBus from "@/common/eventBus.js";
export default {
  data() {
    return {
      unit: "mm",
      active: 0,
      list: [
        { title: "自定义", size: [200, 200] },
        { title: "A4", size: [210, 297] },
        { title: "A4", size: [148, 210] },
        { title: "A3", size: [297, 420] },
        { title: "名片", size: [56, 92] },
        { title: "宣传单", size: [216, 291] },
        { title: "易拉宝", size: [800, 2000], dpi: 72 },
        { title: "工作证", size: [91, 131] }
      ],
      sizeInfo: {
        mm: "单位为毫米时，输入尺寸最小15*15，最大2000*2000",
        px: "单位为像素时，输入尺寸最小40*40，最大5000*5000"
      },
      printInfo: {
        mm: "单位选择毫米时，可以支持打印和印刷",
        px: "单位选择像素时，可以用于网页展示和传播"
      },
      sizeText: {
        mm: "毫米",
        px: "像素"
      },
      title: "点击输入标题",
      modal: false
    };
  },
  computed: {
    color() {
      return this.$store.state.editor.color;
    }
  },
  methods: {
    changeUnit(unit) {
      this.unit = unit;
      this.modal = false;
    },
    getStyle(index) {
      var { fontColor: color, bgColor: background } = this.color;
      return index === this.active ? { background, color } : {};
    },
    btnHover(type) {
      event.target.style.backgroundColor =
        type == "in" ? this.color.bgDark : this.color.bgColor;
    }
  },
  created() {}
};
</script>
<style lang="scss">
.newpage-modal {
  width: 812px;
  height: 410px;
  top: 50%;
  left: 50%;
  background-color: #f4f4f4;
  margin-left: -406px;
  margin-top: -205px;
  overflow: hidden;
  .choice {
    float: left;
    width: 600px;
    background: #e8e8e8;
    height: 410px;
    padding: 26px;
    .title {
      font-size: 14px;
      color: #666666;
    }
    ul {
      margin: 0 -5px;
      overflow: hidden;
      padding-top: 20px;
      li {
        float: left;
        width: 127px;
        height: 127px;
        margin: 0 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        background: #d0d0d0;
        color: #666;
        .t1 {
          color: #333232;
        }
        span {
          display: block;
        }
        i {
          font-size: 50px;
          margin: 20px 0 10px 0;
          display: inline-block;
        }
      }
    }
    p {
      color: #666;
      background: #fff;
      line-height: 38px;
      font-style: italic;
      width: 400px;
      text-align: center;
      margin: 15px auto 0;
      border-radius: 4px;
    }
  }
  .form {
    height: 410px;
    float: right;
    width: 212px;
    padding: 20px 0 0 20px;
    color: #989898;
    .title {
      font-size: 14px;
      line-height: 26px;
      padding-bottom: 5px;
    }
    form {
      input {
        color: #666;
        font-size: 16px;
        &.name {
          border-bottom: 1px solid #d8d8d8;
          display: block;
          line-height: 32px;
          background: transparent;
          width: 172px;
          margin-bottom: 10px;
        }
        &.box {
          border: 2px solid #dedede;
          line-height: 39px;
          padding-left: 5px;
          width: 78px;
          border-radius: 4px;
        }
      }
      .item {
        display: inline-block;
        margin-right: 7px;
        margin-bottom: 10px;
        width: 78px;
        position: relative;
        label {
          line-height: 32px;
          font-size: 14px;
        }
        span {
          border: 2px solid #dedede;
          line-height: 39px;
          padding-left: 8px;
          width: 78px;
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          font-size: 16px;
          color: #666;
          display: inline-block;
        }
        i {
          position: absolute;
          width: 20px;
          height: 20px;
          top: 40px;
          right: 5px;
          color: #bdbdbd;
          pointer-events: none;
          font-size: 25px;
        }
        .selectPannel {
          border-radius: 3px;
          position: absolute;
          width: 100%;
          background-color: #dfdfdf;
          top: 76px;
          padding: 8px;
          font-size: 16px;
          color: #666;
          width: 78px;
          p {
            line-height: 30px;
            padding-left: 4px;
            cursor: pointer;
            &:hover {
              background-color: #f5f5f5;
            }
          }
        }
      }
      .info {
        line-height: 21px;
        width: 168px;
        i {
          color: #ff734e;
          font-size: 13px;
          margin-right: 1px;
        }
      }
      button {
        width: 80px;
        height: 43px;
        font-size: 16px;
        font-weight: bold;
        line-height: 43px;
        margin-right: 11px;
        border-radius: 4px;
        transition: all 0.3s ease-in;
        margin-top: 46px;
      }
      .reset {
        text-align: center;
        cursor: pointer;
        display: inline-block;
        width: 80px;
        height: 43px;
        font-size: 16px;
        font-weight: bold;
        margin-right: 11px;
        border-radius: 4px;
        transition: all 0.3s ease-in;
        margin-top: 46px;
        border: 2px solid #b7b7b7;
        color: #b7b7b7;
        line-height: 39px;
        background: transparent;
        &:hover {
          color: #fff;
          background: #b7b7b7;
        }
      }
    }
  }
}
</style>


// WEBPACK FOOTER //
// newPage.vue?ee245744