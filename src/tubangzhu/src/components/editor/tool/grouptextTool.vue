<template>
	<div class="group-text-tool-bar">
		<color-picker class="item" :color="selectedFontColor" type="color" @onChange="onColorChange"></color-picker>
		<div class="split"></div>
		<combo-box class="item" style="width: 170px;" type="font" inputAble="false" :selected="nowSelectedFontFamily" @onChange="setFontFamily"></combo-box>
		<div class="split"></div>
		<span class="tool-text tool-ico text-ico ico-align" style="background-position-x: -95px;" @click.stop="callModal({type:'align',modalOver:false})"></span>
		<!-- modal -->
		<align type="groupText" style="left:210px" :align="nowAlign"></align>
	</div>
</template>
<script>
import align from '@/components/editor/modal/toolbar/align'
import colorPicker from './../modal/colorPicker';
import eventBus from '@/common/eventBus.js';
import comboBox from './../modal/comboBox';
export default {
	data() {
		return {

		}
	},
	computed: {
		//绑定正在选择的颜色
		selectedFontColor() {
			if (this.getNowEditGroupText != null) {
				return this.getNowEditGroupText.text.color.newColor;
			} else {
				return '#000000';
			}
		},
		//获取正在编辑的组合文字对象
		getNowEditGroupText() {
			return this.$store.state.editor.nowEditGroupText;
		},
		nowSelectedFontFamily() {
			return this.getNowEditGroupText.text.fontFamily;
		},
		nowAlign() {
			return this.getNowEditGroupText.text.align;
		}
	},
	created() {

	},
	components: { colorPicker, comboBox, align },
	methods: {
		callModal(data) {
			this.$store.commit('callModal')
			this.$store.commit('callModal', data)
		},
		//命令-----
		//设置对齐
		setAlign(align) {
			this.$store.state.editor.nowEditGroupText.text.align = align;
		},
		//设置字体
		setFontFamily(val) {
			this.$store.state.editor.nowEditGroupText.text.fontFamily = val.value;
		},
		//事件-----
		//当颜色选择器选择新颜色时
		onColorChange(color) {
			this.$store.state.editor.nowEditGroupText.text.color.newColor = color;
			console.log('玛雅', this.$store.state.editor.nowEditGroupText);
			//				eventBus.$emit('elementChange',{
			//					type:'update',
			//					targets:[this.$store.state.editor.nowEditGroupText.item]
			//				});
		}
	}
}
</script>
<style lang="scss" scoped="">
.group-text-tool-bar {
	position: relative;
	float: left;
	width: 350px;
	.item {
		display: inline-block;
	}
	.combo-box {
		float: left;
	}
}
</style>


// WEBPACK FOOTER //
// grouptextTool.vue?e0bd13ee