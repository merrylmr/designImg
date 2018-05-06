<template>
	<transition name="fade-minimodal">
	<div class="ctip-modal modal-mini" v-show="containerTip"  @mousedown.stop="">
	<img src="/assets/images/ct.gif" alt="">
		<p>将图片拖放到图片容器可替换图片</p>
		<button @click="setContainerTip">知道了</button>
		<i @click="closeTip"></i>
	</div>
	</transition>
</template>
<script>
	import eventBus from '@/common/eventBus.js';
	import Cookies from 'js-cookie';
	export default{
		data(){
			return {
			}
		},
		computed:{
			containerTip(){
				return this.$store.state.editor.tip.container;
			},
		},
		methods:{
			closeTip(){
				this.$store.state.editor.tip.container = false;
			},
			setContainerTip(){
				this.closeTip();
				Cookies.set('containerTip',1,{expires:7});
			}
		},
	}
</script>
<style lang="scss">
.ctip-modal{
	width: 247px;
	height: 186px;
	left: 419px;
	top: 150px;
	color: #898989;
	p{
		font-size: 14px;
		padding-left: 18px;
		margin-top: -15px;
	}
	button{
		margin-left: 18px;
		width: 69px;
		height: 27px;
		line-height: 27px;
		text-align: center;
		background-color: #fff;
		border: 1px solid #c5c6c8;
		border-radius: 2px;
		color: #898989;
		font-size: 14px;
		margin-top: 10px;
	}
	i{
		position: absolute;
		top: 18px;
		right: 12px;
		width: 12px;
		height: 12px;
		cursor: pointer;
		background: url(/assets/images/close1.png) 0 0/cover no-repeat;
	}
}
</style>


// WEBPACK FOOTER //
// containerTip.vue?a9910d22
