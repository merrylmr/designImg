<template>
	<div class="pallet-panel" @mousemove="palletMouseMove" id="pallet-panel">
		<div class="top">
			<div class="bright" @mousedown="dragMode = 'bright';palletMouseMove(arguments[0])">
				<canvas ref="pallet_bright" width="200" height="200" />
				<button :style="{left:bright.left+'px',top:bright.top+'px'}"></button>
			</div>
			<div class="hue" @mousedown="dragMode = 'hue';palletMouseMove(arguments[0])">
				<canvas ref="pallet_hue" width="50" height="200" />
				<button :style="{top:hue.top+'px'}"></button>
			</div>
		</div>
		<div class="bottom">
			<div class="selected-color" :style="getSelectedColorStyle">&nbsp;</div>
			颜色代码:
			<input type="text" class="hex-text" v-model="color" @input="onInputColor" />
		</div>
	</div>
</template>
<script>
import common from '@/common/common';
import eventBus from '@/common/eventBus.js';
import $ from 'jquery';
var maskImg = null;
export default {
	props: ['bindcolor'],
	data() {
		return {
			mouse: {
				x: 0,
				y: 0,
				vectorX: 0,
				vectorY: 0
			},
			dragMode: '',
			hue: {
				val: 0,
				top: 0
			},
			bright: {
				left: 0,
				top: 0
			},
			color: '',
			firstOpen: true
		}
	},
	computed: {
		getSelectedColorStyle() {
			var styleObj = {
				background: this.color
			}
			return styleObj;
		},
		getColor() {
			return this.$props.bindcolor;
		}
	},
	mounted() {
		//注册鼠标松开
		eventBus.$on('globalMouseUp', this.palletMouseUp)
		//组件渲染完成
		var c = this.$refs.pallet_hue;
		var ctx = c.getContext("2d");
		var img = new Image();
		img.src = "/static/img/hue.png";
		img.onload = function() {
			ctx.drawImage(img, 0, 0, 35, 200);
		}
		var mask = new Image();
		mask.src = "/static/img/bright.png";
		var _self = this;
		mask.onload = function() {
			maskImg = mask;
			//初始化完成!!
			_self.setPalletPosition(_self.getColor);
			_self.color = _self.getColor;

		}
	},
	methods: {
		onInputColor() {
			if (this.color.indexOf('#') == -1) {
				this.color = '#' + this.color
			}
			console.log('this.color', this.color);
			var rgb = common.hexToRgb(this.color);

			if (rgb != null) {
				var color = this.color.toLowerCase();
				this.setPalletPosition(this.color);
				this.color = color.toLowerCase()
				this.$emit('onChange', this.color);
			}

		},
		palletMouseMove(e) {
			//记录offsetLeft和offsetTop
			var $obj = $('#pallet-panel').offset();

			//记录鼠标坐标与移动偏移
			this.mouse.vectorX = e.clientX - this.mouse.x;
			this.mouse.vectorY = e.clientY - this.mouse.y;
			this.mouse.x = e.clientX;
			this.mouse.y = e.clientY;

			if (this.dragMode == 'hue') {
				//减去了固定的偏移值,如果编辑器改版,记得修改下面的偏移
				this.hue.top = this.mouse.y - $obj.top;
				if (this.hue.top < 1) {
					this.hue.top = 1;
				} else if (this.hue.top > 200) {
					this.hue.top = 200;
				}
				//根据位置计算hue值
				this.hue.val = this.hue.top / 200;
				this.makeBright(this.hue.val);
				this.updateColor();
			} else if (this.dragMode == 'bright') {
				//减去了固定的偏移值,如果编辑器改版,记得修改下面的偏移
				this.bright.left = this.mouse.x - $obj.left;
				this.bright.top = this.mouse.y - $obj.top;
				if (this.bright.left < 1) {
					this.bright.left = 1;
				}
				if (this.bright.left > 200) {
					this.bright.left = 200;
				}
				if (this.bright.top < 0) {
					this.bright.top = 0;
				}
				if (this.bright.top > 200) {
					this.bright.top = 200;
				}
				this.updateColor();
			}


		},
		palletMouseUp() {
			this.dragMode = '';
			this.$emit('onChange', this.color);
		},
		//生成当前hue的颜色图像
		makeBright(hue) {

			//转换hsl到rgb
			var rgb = common.hslToRgb(hue, 1, 0.5);
			//绘制bright
			var c = this.$refs.pallet_bright;
			var ctx = c.getContext("2d");
			var img = ctx.createImageData(200, 200);
			for (var i = 0; i < img.data.length; i += 4) {
				var r = rgb[0];
				var g = rgb[1];
				var b = rgb[2];
				var a = 255;

				img.data[i] = r;
				img.data[i + 1] = g;
				img.data[i + 2] = b;
				img.data[i + 3] = a;
			}
			ctx.putImageData(img, 0, 0);

			ctx.drawImage(maskImg, 0, 0, 200, 200);
		},
		//设置颜色位置
		setPalletPosition(hex) {

			//转换hex为rgb
			var rgb = common.hexToRgb(hex);
			if (rgb == null) {
				console.log('非法的hex');
				return;
			}
			//rgb转换hsl
			var hsl = common.rgbToHsl(rgb[0], rgb[1], rgb[2]);

			//定位hue
			this.hue.val = hsl[0];
			this.hue.top = parseInt(hsl[0] * 200);
			this.makeBright(hsl[0]);
			//遍历当前bright的所有像素数据,查找相同的值

			var c = this.$refs.pallet_bright;
			var ctx = c.getContext("2d");
			var img = ctx.getImageData(0, 0, 200, 200).data;

			var left = 0;
			var top = 0;
			for (var i = 0; i < img.length; i += 4) {
				left = left + 1;
				if (left == 200) {
					left = 0;
					top = top + 1;
				}
				var r = img[i];
				var g = img[i + 1];
				var b = img[i + 2];
				if (common.approximate(r, rgb[0], 4) && common.approximate(g, rgb[1], 4) && common.approximate(b, rgb[2], 4)) {
					break;
				}
			}
			this.bright.left = left;
			this.bright.top = top;

		},
		updateColor() {
			//获取当前像素的颜色值
			var c = this.$refs.pallet_bright;
			var ctx = c.getContext("2d");
			var img = ctx.getImageData(this.bright.left - 1, this.bright.top, 1, 1).data;
			this.color = common.rgbToHex(img[0], img[1], img[2]);
			if (this.color == undefined) {
				this.color = '#000000';
				alert('暂不支持该颜色,请手动调出此颜色');
			}
		}
	}
}
</script>
<style lang="scss">
.pallet-panel {
	.top {
		.bright {
			position: relative;
			width: 200px;
			height: 200px;
			float: left;
			button {
				position: absolute;
				left: 0;
				top: 0;
				width: 16px;
				height: 16px;
				margin-top: -8px;
				margin-left: -8px;
				background: none;
				box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
				border-radius: 50%;
				border: 2px solid white;
			}
			canvas {
				pointer-events: none;
			}
		}
		.hue {
			position: relative;
			float: left;
			width: 20px;
			height: 200px;
			margin-left: 5px;
			button {
				position: absolute;
				left: 0;
				top: 0;
				width: 35px;
				height: 16px;
				margin-top: -8px;
				background: none;
				box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
				border-radius: 5px;
				border: 2px solid white;
			}
			canvas {
				pointer-events: none;
			}
		}
	}
	.bottom {
		padding-top: 210px;
		line-height: 24px;

		.hex-text {
			border: 1px solid #c5c5c5;
			box-shadow: 0 0 5px #dddddd;
			height: 24px;
			width: 65px;
			padding: 2px;
			border-radius: 3px;
			display: inline-block;
		}
		.selected-color {
			display: inline-block;

			background: red;
			width: 24px;
			height: 24px;
			border-radius: 3px;
		}
	}
}
</style>


// WEBPACK FOOTER //
// pallet.vue?61ee3b2c