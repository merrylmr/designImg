<template>
<transition name="fade-modal">
	<div class="alert-modal modal" v-if="alertShow" @mousedown.stop="">
		<div class="info">
			<span :class="['tbz-icon','tbz-'+alertInfo.cls]"></span>
			<span class="title">{{alertInfo.text}}</span>
		</div>
		<div class="btn-box">
			<button @click="sure">确定</button><button @click="cancle">取消</button>
		</div>
	</div>
	</transition>
</template>
<script>
	import Qrcode from 'v-qrcode'
	export default{
		computed:{
			alertShow(){
				return this.$store.state.editor.modal['alert'];
			},
			alertInfo(){
				return {
					cls:this.$store.state.editor.modalInfo.cls,
					text:this.$store.state.editor.modalInfo.text,
					fn:this.$store.state.editor.modalInfo.fn,
					fx:this.$store.state.editor.modalInfo.fx,
				}
			}
		},
		methods:{
			sure(){
				this.$store.commit('callModal');
				if(typeof this.alertInfo.fn =='function'){
					this.alertInfo.fn();
				}
			},
			cancle(){
				this.$store.commit('callModal');
				if(typeof this.alertInfo.fx =='function'){
					this.alertInfo.fx();
				}
			}
		}
	}
</script>
<style lang="scss">
$blue:#00a2eb;
	.alert-modal{
		width: 400px;
		height: 200px;
		margin-top: -150px;
		margin-left: -200px;
		overflow: hidden;
		&:before{
			content:"提示";
		}
		.info{
	    height: 110px;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	    .tbz-icon{
	    	width: 28px;
	    	height: 28px;
	    	&.tbz-danger{
	    		background: url(/assets/images//tbz-danger.png) center center no-repeat;
	    	}
	    	&.tbz-ok{
	    		background: url(/assets/images//tbz-ok.png) center center no-repeat;
	    	}
	    }
	    .title{
	    	font-size: 12px;
		    color: #5f5f5f;
		    padding-left: 8px;
		    display: inline-block;
		    max-width: 350px;
		    line-height: 20px;
		  }
		}
	}
</style>


// WEBPACK FOOTER //
// alert.vue?7e178728
