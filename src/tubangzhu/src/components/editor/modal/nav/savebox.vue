<template>
	<transition name="fade-minimodal">
		<div class="savebox-modal modal-mini" v-if="saveboxShow" @mouseup.stop="" @mousedown.stop="">
			<p @mouseup.stop="saveFile">保存
				<span>ctrl+s</span>
			</p>
			<p @mouseup.stop="callModal({'type':'save','modalOver':true})">另存为...
				<span>shift+ctrl+s</span>
			</p>
			<div class="line"></div>
			<div class="auto-box">
				<span>自动保存</span>
				<span class="back" @mousemove.stop="handleMove" @mouseup.stop="handleUp" @mouseleave.stop="handleUp" :style="{background:autoSave?'#32c46e':'#e7e7e7'}">
					<i @mousedown.stop="handleDown" :style="{left:move+'px'}"></i>
				</span>
			</div>
		</div>
	</transition>
</template>
<script>
import EventBus from '@/common/eventBus.js';
import socket from '@/common/socket.js';
import Cookies from 'js-cookie';
export default {
	data() {
		return {
			move: 0,
			mousemove: 0,
			flag: false,
			x0: 0,
			x1: 0,
		}
	},
	computed: {
		saveboxShow() {
			return this.$store.state.editor.modal['savebox'];
		},
		autoSave: {
			get: function() {

				return this.$store.state.editor.autoSave;
			},
			set: function(val) {
				this.$store.state.editor.autoSave = !this.$store.state.editor.autoSave;
				Cookies.set('tpl_' + this.$store.state.docData.id, {
					autoSave: this.$store.state.editor.autoSave
				});
				console.log('设置cookie', {
					autoSave: this.$store.state.editor.autoSave
				});
			}
		},
		docData() {
			return this.$store.state.docData;
		}
	},
	methods: {
		handleDown() {
			this.flag = true;
			this.x0 = event.clientX;

		},
		handleMove() {
			if (!this.flag) { return; }
			this.x1 = event.clientX;
			this.mousemove = this.x1 - this.x0;
			if (this.autoSave) {
				this.move = 42 + this.mousemove;
			} else {
				this.move = this.mousemove;
			}

		},
		handleUp() {
			this.flag = false;
			//点击
			if (this.mousemove == 0) {
				if (event.type == 'mouseleave') { return }
				this.autoSave = 0;
				this.checkAutosave();
			} else {
				//拖动
				if (this.autoSave) {
					if (this.mousemove < 21) {
						this.autoSave = 1;
					}
				} else {
					if (this.mousemove > 21) {
						this.autoSave = 1;
					}
				}
				this.checkAutosave();
				this.mousemove = 0
			}
			if (this.$store.state.editor.nowEditText == null && this.$store.state.editor.nowEditGroupText == null && this.$store.state.editor.nowEditTable == null) {
				var _self = this;
				this.$store.commit('callModal', { type: 'wait', modalOver: true });
				//切换自动手动保存时保存全部文件
				socket.saveFile(function() {
					//保存成功
					_self.$store.commit('callModal');
					_self.$store.commit('callModal', { type: 'savebox' });
				})
			}
		},

		checkAutosave() {
			this.move = this.autoSave ? 42 : 1;
		},
		callModal(data) {
			this.$store.commit('callModal')
			this.$store.commit('callModal', data)
		},
		//保存
		saveFile() {
			var _self = this;
			//关闭其他的
			this.$store.commit('callModal');

			//开始保存
			if (this.$store.state.editor.nowEditText == null && this.$store.state.editor.nowEditGroupText == null && this.$store.state.editor.nowEditTable == null) {
				//开启等待
				this.$store.commit('callModal', { type: 'wait', modalOver: true });
				socket.saveFile(function() {
					//保存成功
					_self.$store.commit('callModal');
				}, true)
			}
		},
	},
	created() {
		//初始化
		EventBus.$on('stateChange', (e) => {
			if (e.type == 'ready') {
				this.checkAutosave();
			}
		})
	}
}
</script>
<style lang="scss">
.savebox-modal {
	left: calc(50% + 20px);
	width: 186px;
	padding-top: 12px;
	p {
		margin: 0 12px;
		line-height: 29px;
		cursor: pointer;
		padding-left: 10px;
		span {
			float: right;
			padding-right: 5px;
		}
		&:hover {
			background: #e7e7e7;
		}
	}
	.line {
		margin-top: 10px;
	}
	.auto-box {
		margin: 0 12px;
		line-height: 49px;
		padding-left: 10px;
		.back {
			display: inline-block;
			width: 65px;
			height: 24px;
			border-radius: 12px;
			background: #D0D0D0;
			vertical-align: middle;
			cursor: pointer;
			margin-left: 25px;
			position: relative;
			i {
				position: absolute;
				top: 1px;
				width: 22px;
				height: 22px;
				border-radius: 50%;
				background: #fff;
				transition: all .2s ease-out;
			}
		}
	}
}
</style>


// WEBPACK FOOTER //
// savebox.vue?7efc0c13