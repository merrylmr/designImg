<template>
	<div class="default-color">
		<!--最近使用 begin-->
		<div>
			<div class="title">最近使用</div>
			<div class="list">
				<div :class="['item',{'selected':(getColor==item)}]" v-for="item in (getType=='color'?getUsedColor:getUsedBgColor)" :style="{'background':item}" :title="item" @click="onChangeColor(item)"></div>
			</div>
		</div>
		<!--最近使用 end-->
		<div style="clear:both"></div>
		<!--团队颜色 begin-->
		<div v-if="isGroup">
			<div class="title">团队颜色</div>
			<div class="list">
				<div :class="['item',{'selected':(getColor==item)}]" v-for="item in getGroupColor" :style="{'background':item}" :title="item" @click="onChangeColor(item)"></div>
			</div>
		</div>
		<!--团队颜色 end-->
		<div style="clear:both"></div>
		<!--预设颜色 begin-->
		<div>

			<div class="title">预设颜色</div>
			<div class="list">
				<div :class="['item',{'selected':(getColor==item)}]" v-for="item in defaultColor" :style="{'background':item}" :title="item" @click="onChangeColor(item)"></div>
			</div>
		</div>
		<!--预设颜色 end-->
	</div>
</template>
<script>
	export default{
		data(){
			return{
				defaultColor:["#000000", "#191919", "#333333", "#4D4D4D", "#666666", "#808080", "#999999", "#B3B3B3", "#CCCCCC", "#E5E5E5", "#FFFFFF", "#910000", "#E60012", "#F08200", "#FFF100", "#009944", "#006986", "#0081B9", "#00A0E9", "#1D2088", "#7D4698", "#941C61", "#F8C5AB", "#F8C6C6", "#FCE3CD", "#EBEAC1", "#E1EFD8", "#C9E7E0", "#D4ECF3", "#D3EDFB", "#D3DDF1", "#DDD0E7", "#E7D4E0", "#DF7C57", "#F29B96", "#F8C399", "#EBDF92", "#B3D9AD", "#85C0D2", "#91CCE8", "#AED0EE", "#A2BCE2", "#B1A7D1", "#D0A6B9", "#CB4829", "#EA5350", "#F6AE69", "#EACD6A", "#8BC180", "#2EA7C2", "#64B0D4", "#95B7E1", "#7484B5", "#837FBB", "#BA7A99", "#9C1D22", "#C7000A", "#F39800", "#DFB743", "#5DAB59", "#2286A1", "#318FB4", "#356BB3", "#455896", "#644498", "#9D4C75", "#4F0102", "#A40001", "#6E3B1D", "#896D2B", "#004F2C", "#00585E", "#006993", "#014099", "#0F0964", "#552277", "#6C2559"],
			}
		},
		props:['bindcolor','bindtype'],
		computed:{
			//usedcolor 和 usedBgColor
			getType(){
				return this.$props.bindtype;
			},
			//获取用户最近使用的自定义颜色
			getUsedColor(){
				return this.$store.state.docData.edit_config.usedColor;
			},
			//获取用户最近使用的背景颜色
			getUsedBgColor(){
				return this.$store.state.docData.edit_config.usedBgColor;
			},
			//获取到当前选择的颜色
			getColor(){
				return this.$props.bindcolor;
			},
			//获取团队颜色eventBus
			getGroupColor(){
				return this.$store.state.stage.groupColor;
			},
			isGroup(){
				return this.$store.state.stage.groupId>0?true:false;
			}
		},
		methods:{
			//新的颜色
			onChangeColor(color){
				this.$emit('onChange',color)
			}
		}
	}
</script>
<style lang="scss">
	.default-color{
		margin-top:-5px;
		.title{
			height:32px;
			line-height:32px;
		}
		.list{
			.item{
				width:22px;
				height:22px;
				background: rgb(249, 104, 120);
				float: left;
				cursor: pointer;
				border-left:1px solid #dcdcdc;
				border-top:1px solid #dcdcdc;
				&:hover{
					transform: scale(1.1);
					box-shadow: 0 0 5px rgba(0,0,0,0.5);
					border:none;
				}
			}
			.selected{

			}
		}
	}
</style>


// WEBPACK FOOTER //
// default.vue?18cfcde4