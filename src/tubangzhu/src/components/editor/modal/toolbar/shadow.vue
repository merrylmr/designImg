<template>
	<div class="shadow-panel modal-mini" v-if="show" @mousedown.stop="">

		<div class="scroll">

			<div class="item">
				<div class="name">不透明度</div>
				<input type="range" min="0" max="100" :value="getShadow.opacity" @input="setShadow('opacity',false)" @change="setShadow('opacity',true)"/>
				<input type="text" :value="getShadow.opacity" @change="setShadow('opacity',true)">
			</div>

			<div class="item">
				<div class="name">距离</div>
				<input type="range" min="0" max="100" :value="getShadow.distance" @input="setShadow('distance',false)"  @change="setShadow('distance',true)"/>
				<input type="text" :value="getShadow.distance" @change="setShadow('distance')">
			</div>

			<div class="item">
				<div class="name">扩散</div>
				<input type="range" min="0" max="100" :value="getShadow.strength" @input="setShadow('strength',false)" @change="setShadow('strength',true)"/>
				<input type="text" :value="getShadow.strength" @change="setShadow('strength')">
			</div>

		</div>
		<div class="line"></div>
		<div class="switch">
			<div class="switch-box">
				<span>是否显示投影</span>
				<span class="back"
				      @mousedown.stop="handleDown"
				      :style="{background:getShadow!=null&&getShadow.use?'#32c46e':'#D2D2D2'}">
				<i :style="{left:(getShadow!=null&&getShadow.use?42:1)+'px'}"></i>
			</span>
			</div>

		</div>
	</div>
</template>

<script>
	import eventBus from '@/common/eventBus.js';
	export default{

		computed:{
			show(){
				return this.$store.state.editor.modal['shadow'] && this.getSelectedItems.length>0;
			},
			//获取当前正在单选或多选的对象,返回一个数组
			getSelectedItems(){
				var selectedItem = this.$store.state.stage.selectedItem;
				var selectedItemsGroup = this.$store.state.stage.selectionBox.items;
				if(selectedItem!=null){
					return [selectedItem];
				}else if(selectedItemsGroup.length>0){
					return selectedItemsGroup;
				}else{
					return [];
				}
			},
			//获取当前的阴影开启状态
			getShadow(){
				if(this.getSelectedItems.length>0){
					return this.getSelectedItems[0].edit_config.style.shadow
				}else{
					return null;
				}
			}
		},
		methods:{
			handleDown(){
				if(this.getSelectedItems.length==0){
					return;
				}
				var useBool = !this.getShadow.use;
				for(var i=0;i<this.getSelectedItems.length;i++){
					this.getSelectedItems[i].edit_config.style.shadow.use = useBool;
				}
				eventBus.$emit('elementChange',{
					type:'update',
					targets:this.getSelectedItems
				});
			},
			setShadow(property,snap){
				if(this.getSelectedItems.length==0){
					return;
				}
				for(var i=0;i<this.getSelectedItems.length;i++){
					this.getSelectedItems[i].edit_config.style.shadow.use = true;
						this.getSelectedItems[i].edit_config.style.shadow[property] = parseFloat(event.target.value);
				}
				eventBus.$emit('elementChange',{
					type:'update',
					targets:this.getSelectedItems,
					snap:snap
				});
			}
		}
	}
</script>

<style lang="scss">
.shadow-panel{
	width:280px;
	position: absolute;
	right: 50px;
	top: 39px;
	color:#515151;
	overflow: hidden;
	.line{
		margin:5px 0;
	}
}
.switch-box{
	font-size:14px;
	margin-top: 5px;
	line-height: 40px;
	.back{
		margin-top: 8px;
		float: right;
		display: inline-block;
		width: 65px;
		height: 24px;
		border-radius: 12px;
		background: #D2D2D2;
		vertical-align: middle;
		cursor:pointer;
		margin-left: 10px;
		position: relative;
		i{
			position: absolute;
			top: 1px;
			width: 22px;
			height: 22px;
			border-radius:50%;
			background: #fff;
			transition:all .2s ease-out;
		}
	}
}
.scroll{
	height:126px;
	padding:12px 0 12px 12px;
	.item{
		color:#515151;
		font-size: 14px;
		padding-bottom: 10px;
		.name{
			display: inline-block;
			width:65px;
			text-align: right;
		}

		input{
			display: inline-block;
			width:125px;
			margin-left:5px;
		}
		.val{
			display: inline-block;
			width: 30px;
			text-align: center;
		}
	}
	input[type=text]{
		margin-left: 10px;
		display: inline;
		width: 46px;
		line-height: 30px;
		font-size: 14px;
		color: #515151;
		background-color: #e5e5e5;
		border-radius: 5px;
		text-align: center;
	}
}
.switch{
	height:40px;
	padding:0 10px 0 20px;
}
</style>


// WEBPACK FOOTER //
// shadow.vue?627ce82e