<!-- 翻转 -->
<template>
	<div class="modal-mini revert-modal" v-show="revertShow" @mousedown.stop="">
		<p @click="flip('x')"><i class="tbzico ico-eReverse"></i> 水平翻转</p>
		<p @click="flip('y')"><i class="tbzico ico-eReverse ico90"></i>垂直翻转</p>
	</div>
</template>
<script>
	import eventBus from '@/common/eventBus.js';
	export default{
		computed:{
			revertShow(){
				return this.$store.state.editor.modal['revert'];
			},
		},
		methods:{
			flip(type){
				eventBus.$emit('flipChange',type);
				console.log('触发翻转:',type)
			}
		}
	}
</script>
<style lang="scss">
	.revert-modal{
		padding: 6px;
		width: 124px;
		left: 160px;
    top: 39px; 
    z-index: 999;
    p{
    	font-size: 14px;
    	padding:0 8px;
    	color: #515151;
    	cursor:pointer;
    	line-height: 28px;
    	i{
    		margin-right: 12px;
    		float: left;
    	}
    	&:hover{
    		background: #e7e7e7;
    	}
    }
	}
</style>


// WEBPACK FOOTER //
// revert.vue?2fae9443