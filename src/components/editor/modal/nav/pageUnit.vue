<template>
	<transition name="fade-minimodal">
		<div class="unit-modal modal-mini" v-if="unitShow" @mousedown.stop="">
			<div class="info">
				<p>当前尺寸</p>
				<div class="editor">
					<span>
						<span>宽度</span>({{pageSize.unitText}})</span>
					<input type="text" :value="pageSize.width" :readonly="pageSize.sizeAble==0" @input="inputSize('width')">
				</div>
				<div class="editor">
					<span>
						<span>高度</span>({{pageSize.unitText}})</span>
					<input type="text" :value="pageSize.height" :readonly="pageSize.sizeAble==0" @input="inputSize('height')">
				</div>
				<div class="ok">
					<button @click="setPageSize" :disabled="pageSize.sizeAble==0">确定</button>
				</div>
			</div>
			<div class="line"></div>
			<div class="bottom">
				<button @click="newPage">
					<i class="tbzico ico-size"></i>
					<span>新建尺寸</span>
				</button>
			</div>
		</div>
	</transition>
</template>
<script>
import eventBus from '@/common/eventBus.js';
export default {
	data() {
		return {
			width: null,
			height: null,
		}
	},
	computed: {
		unitShow() {
			return this.$store.state.editor.modal['unit'];
		},
		pageSize() {
			return {
				width: this.$store.state.docData.edit_config.width,
				height: this.$store.state.docData.edit_config.height,
				unit: this.$store.state.docData.edit_config.unit,
				unitText: this.$store.state.docData.edit_config.unit == 'px' ? '像素' : '毫米',
				sizeAble: this.$store.state.docData.edit_config.sizeAble
			}
		}
	},
	methods: {
		newPage() {
			this.$store.commit('callModal');
			this.$store.commit('callModal', { type: 'newPage', modalOver: true });
		},
		inputSize(type) {
			if (type == 'width') {
				this.width = parseInt(event.target.value);
			} else {
				this.height = parseInt(event.target.value);
			}
		},
		setPageSize() {
			if (this.pageSize.unit == 'mm') {
				this.width > 1000 && (this.width = 1000);
				this.width < 15 && (this.width = 15);
				this.height > 2000 && (this.height = 2000);
				this.height < 15 && (this.height = 15);
			} else {
				this.width > 5000 && (this.width = 5000);
				this.width < 40 && (this.width = 40);
				this.height > 5000 && (this.height = 5000);
				this.height < 40 && (this.height = 40);
			}
			this.$store.commit('setDocSize', {
				width: parseFloat(this.width),
				height: parseFloat(this.height),
			});
			//舞台居中
			this.$store.commit('setZoom', {
				type: 'normal'
			});
		}
	},
	created() {
		var _self = this;
		eventBus.$on('stateChange', function(e) {
			if (e.type == 'ready') {
				_self.width = _self.pageSize.width;
				_self.height = _self.pageSize.height;
			}
		})
	}
}
</script>
<style lang="scss">
.unit-modal {
	left: 23px;
	width: 180px;
	.info {
		padding: 15px 20px 10px 20px;
		span {
			font-size: 12px;
			color: #a7a7a7;
			margin-top: 3px;
			span {
				color: #515151;
			}
		}
		.editor {
			padding: 5px 0;
		}
		input {
			height: 24px;
			width: 65px;
			margin-left: 8px;
			border: 1px solid #cacaca;
			line-height: 25px;
			padding-left: 6px;
			color: #5c5c5c;
			transition: all .2s ease-in;
			border-radius: 3px;
			&:focus {
				border: 1px solid #00a2eb;
			}
			&[readonly] {
				background: #ECECEC;
			}
		}
		.ok {
			text-align: right;
			padding-top: 5px;
			button {
				color: white;
				padding: 4px 20px 4px 20px;
				margin-right: 8px;
				border-radius: 3px;
				background-color: #32c46e;
				&:hover {
					opacity: 0.8;
				}
			}
			button[disabled] {
				background-color: #d4d4d4;
			}
		}
	}
	.resize-box {}
	.bottom {
		padding: 11px 25px;
		overflow: hidden;
		button {
			width: 100%;
			height: 35px;
			font-size: 13px;
			color: white;
			background: #00a2eb;
			border-radius: 3px;
			i {
				font-size: 20px;
				vertical-align: middle;
			}
			span {
				vertical-align: middle;
				margin-left: 3px;
			}
			&:hover {
				opacity: 0.8;
			}
		}
	}
}
</style>


// WEBPACK FOOTER //
// pageUnit.vue?3e4d8922