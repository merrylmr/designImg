<template>
	<div class="size-modal modal-mini" v-show="sizeShow" @mousedown.stop="">
		<div class="item">
			<span>宽度({{unit}})</span>
			<input type="text" v-model="newWidth">
			<i @mousedown.stop="changeSize('width',newWidth++)"></i>
			<i @mousedown.stop="changeSize('width',newWidth--)"></i>
		</div>
		<div class="item">
			<span>高度({{unit}})</span>
			<input type="text" v-model="newHeight">
			<i @mousedown.stop="changeSize('height',newHeight++)"></i>
			<i @mousedown.stop="changeSize('height',newHeight--)"></i>
		</div>
		<button @click="closeModal">确定</button>
	</div>
</template>
<script>
import EventBus from '@/common/eventBus.js';
export default {
	data() {
		return {
			newWidth: 0,
			newHeight: 0
		}
	},
	watch: {
		sizeShow(val) {
			var obj = this.$store.state.stage.selectedItem;
			if (obj != null && val) {

				var width = 0;
				var height = 0;
				if (this.unit == 'mm') {
					width = (obj.edit_config.width / (this.$store.state.docData.edit_config.dpi / 25.4));
					height = (obj.edit_config.height / (this.$store.state.docData.edit_config.dpi / 25.4));
				} else {
					width = (obj.edit_config.width);
					height = (obj.edit_config.height);
				}
				width = (width.toFixed(2));
				height = (height.toFixed(2));
				this.newWidth = width;
				this.newHeight = height;
			}
		}
	},
	computed: {
		getSelectedItem() {
			return this.$store.state.stage.selectedItem
		},
		sizeShow() {
			return this.$store.state.editor.modal['size'];
		},
		unit() {
			return this.$store.state.docData.edit_config.unit;
		},
	},
	methods: {
		changeSize(m, value) {
			value = parseFloat(value);
			var obj = this.$store.state.stage.selectedItem;
			if (obj == null) {
				return;
			}
			if (m == 'height') {
				if (this.unit == 'mm') {
					obj.edit_config.height = parseFloat((value * this.$store.state.docData.edit_config.dpi / 25.4));
				} else {
					obj.edit_config.height = parseFloat((value));
				}
			} else if (m == 'width') {
				if (this.unit == 'mm') {
					obj.edit_config.width = parseFloat((value * (this.$store.state.docData.edit_config.dpi / 25.4)));
				} else {
					obj.edit_config.width = parseFloat(value);
				}
			}
			EventBus.$emit('elementChange', {
				type: 'update',
				targets: [obj]
			});
		},
		closeModal() {
			//修改结果
			this.changeSize('width', this.newWidth);
			this.changeSize('height', this.newHeight);
			this.$store.commit('callModal')
		},
	}
}
</script>
<style lang="scss">
.size-modal {
	padding: 11px 15px;
	width: 215px;
	left: 5px;
	top: 50px;
	.item {
		line-height: 33px;
		position: relative;
		input {
			width: 105px;
			height: 32px;
			line-height: 32px;
			margin-left: 10px;
			background-color: #fff;
			border: 0;
			vertical-align: top;
			font-size: 14px;
			color: #515151;
			padding-left: 4px;
			border: 1px solid #cdcdcd;
			margin-bottom: 10px;
		}
		i {
			width: 22px;
			height: 16px;
			position: absolute;
			zoom: 1;
			top: 0;
			right: 0;
			background: url(../../../../assets/images/updown2.png) 6px 5px no-repeat #fff;
			cursor: pointer;
			border: 1px solid #cdcdcd;
			&:last-child {
				top: 16px;
				background-position: 6px -11px;
			}
			&:hover {
				background-color: #e9e9e9;
			}
		}
	}
	button {
		display: block;
		vertical-align: top;
		width: 185px;
		height: 32px;
		padding: 0;
		background-color: #18a3de;
		font-size: 14px;
		color: #fff;
		line-height: 32px;
		text-align: center;
		border-radius: 3px;
	}
}
</style>


// WEBPACK FOOTER //
// size.vue?9aff01bc