<template>
	<transition name="fade-minimodal">
	<div class="lock-modal modal-mini" v-show="lockTip"  @mousedown.stop="">
		<p>您已经对元素进行了锁定操作</p>
		<p><span>·</span>锁定的元素不能移动</p>
		<p><span>·</span>再点击一下即可解锁哦</p>
		<button @click="setLockTip">知道了</button>
	</div>
	</transition>
</template>
<script>
	import Cookies from 'js-cookie';
	export default{
		data(){
			return {
			}
		},
		computed:{
			lockTip(){
				return this.$store.state.editor.tip.lock;
			},
		},
		methods:{
			setLockTip(){
				this.$store.state.editor.tip.lock = false;
				Cookies.set('lockTip',1);
			}
		},
	}
</script>
<style lang="scss">
.lock-modal{
	width: 247px;
  right: 190px;
  top: 104px;
	color: #898989;
	padding:10px 0 18px 0;
	p{
		font-size: 14px;
		padding: 0 20px 0 18px;
		line-height: 27px;
		height: 27px;
		span{
			line-height: 27px;
			font-size: 16px;
			color: #ababab;
			font-weight: bold;
			vertical-align: top;
			padding:0 5px 0 0;
		}
		&:first-child{
			color: #00a2eb;
		}
	}
	button{
		margin-left: 18px;
		width: 69px;
		height: 27px;
		line-height: 27px;
		text-align: center;
		background-color: #00a2eb;
		border-radius: 2px;
		color: #fff;
		font-size: 14px;
		margin-top: 10px;
	}
}
</style>


// WEBPACK FOOTER //
// lock.vue?2c642e52