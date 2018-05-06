<template>
	<div class="image-tool">
		<span class="tool-text" v-show="showFilter" @click.stop="callModal({type:'imageFilter',modalOver:false})">
			<i class="ico-filter"></i>滤镜</span>
		<span class="tool-text" @click="startEditContainer">裁剪</span>
		<div class="split" style="margin:0" v-show="getColorArr.length>0"></div>
		<div class="color-picker">
			<color-picker v-for="(item,index) in getColorArr" v-bind:key="index" :color="item.newColor" type="color" @onChange="setColor(item,arguments[0])"></color-picker>
		</div>

		<!-- modal -->
		<imageFilter/>
	</div>
</template>
<script>
import eventBus from '@/common/eventBus.js';
import colorPicker from '@/components/editor/modal/colorPicker.vue';
import imageFilter from '@/components/editor/modal/toolbar/imageFilter.vue';
export default {
	methods: {
		callModal(data) {
			this.$store.commit('callModal')
			this.$store.commit('callModal', data)
		},
		setColor(item, color) {
			item.newColor = color;
			eventBus.$emit('elementChange', {
				type: 'update',
				targets: [this.getSelectedItem]
			});
		},
		startEditContainer() {
			eventBus.$emit('startEditContainer', this.getSelectedItem);
		}
	},
	computed: {
		showFilter() {
			if (this.getSelectedItem.edit_data.clipImg[0].url == '') {
				return false;
			} else {
				return true;
			}
		},
		//获取正在被选择的单个物体
		getSelectedItem() {
			return this.$store.state.stage.selectedItem;
		},
		//获取颜色数组
		getColorArr() {
			//其他类型的直接返回颜色数组
			return this.getSelectedItem.edit_data.color;

		}
	},
	components: { imageFilter, colorPicker }
}
</script>
<style lang="scss">
.image-tool {
	width: 500px;
	float: left;
	.color-picker {
		display: inline-block;
		float: left;
	}
	.tool-text {
		margin-right: 5px;
	}
	.ico-filter {
		display: inline-block;
		float: left;
		width: 30px;
		height: 30px;
		background: url(/assets/images/icon/ico-filter.png) no-repeat 3px 50%;
	}
}
</style>


// WEBPACK FOOTER //
// containerTool.vue?25d0cf56
