<template>
	<div class="svg-tool">

		<span v-show="getSelectedItem.type=='svg'" class="tool-text" style="margin-right:5px" @click="showSize">尺寸</span>
		<size-box/>
		<div class="color-picker">
			<color-picker v-for="(item,index) in getColorArr" v-bind:key="index" :color="item.newColor" type="color" @onChange="setColor(item,arguments[0])"></color-picker>
		</div>

	</div>
</template>
<script>
import colorPicker from './../modal/colorPicker';
import sizeBox from './../modal/toolbar/size.vue';
import common from '@/common/common.js';
import eventBus from '@/common/eventBus.js';

export default {
	data() {
		return {
			colors: '#000'
		}
	},
	components: { colorPicker, sizeBox },
	computed: {
		//获取正在被选择的单个物体
		getSelectedItem() {
			return this.$store.state.stage.selectedItem;
		},
		//获取颜色数组
		getColorArr() {
			if (this.getSelectedItem.type == 'groupText') {
				//如果是组合文字,则获取组合文字本身的颜色和文字的颜色
				var svgColor = this.getSelectedItem.edit_data.color;
				var textColor = [];
				for (var i in this.getSelectedItem.edit_data.text) {
					var colorItem = this.getSelectedItem.edit_data.text[i].color;
					//判断当前颜色是否存在
					var find = false;
					for (var c in svgColor) {
						if (svgColor[c].oldColor == colorItem.oldColor) {
							find = true;
							break;
						}
					}
					if (find == false) {
						textColor.push(colorItem);

					}

				}
				var result = svgColor.concat(textColor);

				return result;
			} else {
				//其他类型的直接返回颜色数组
				return this.getSelectedItem.edit_data.color;
			}
		}
	},
	methods: {
		showSize() {
			this.callModal({ type: 'size' })
		},
		callModal(data) {
			this.$store.commit('callModal');
			this.$store.commit('callModal', data);
			console.log('callModal', data);
		},
		setColor(item, color) {
			if (this.getSelectedItem.type == 'groupText') {

				//是组合文字,首先替换组合文字svg的颜色
				item.newColor = color;
				//遍历文字元素
				for (var i in this.getSelectedItem.edit_data.text) {
					var textItem = this.getSelectedItem.edit_data.text[i];
					if (item.oldColor == textItem.color.oldColor) {

						textItem.color.newColor = item.newColor;
					}
				}
				eventBus.$emit('updateGroupTextElement', this.getSelectedItem)
			} else {
				//不是组合文字,直接修改当前颜色对象的newColor
				item.newColor = color;

				eventBus.$emit('elementChange', {
					type: 'update',
					targets: [this.getSelectedItem]
				});
			}


		}
	}
}
</script>
<style lang="scss">
.svg-tool {

	float: left;

	.color-picker {
		float: left;
	}
}
</style>


// WEBPACK FOOTER //
// svgTool.vue?71ffbb1d