<template>
	<transition name="fade-minimodal">
	<div class="wechatCode-modal modal-mini" v-if="codeShow" @mousedown.stop="">
		<div class="code-box" id="text">
			<div id="code"></div>
		</div>
		<p>{{qrTip}}</p>
	</div>
	</transition>
</template>
<script>
	import $ from 'jquery'
	export default{
		computed:{
			codeShow(){
				return this.$store.state.editor.modal['wechatCode'];
			},
			qrText(){
				return this.$store.state.editor.qrcodeText;
			},
			qrTip(){
				return this.$store.state.editor.qrcodeTip;
			}
		},
		methods:{
			closeModal(){
				var fx = this.$store.state.editor.modalInfo.fx;
				if(typeof fx =='function'){
					fx();
					this.$store.state.editor.modalInfo.fx=undefined
				}
				this.$store.commit('callModal')
			},
			qrcode(){
				$('#code').qrcode({
					text: this.qrText,
          width:120,
          height:120,
          render:'canvas',
          typeNumber:0,
          // correctLevel:1,
          foreground:'#333'
				});
			}
		},
		watch:{
			codeShow:function(val){
				if(val){
					this.$nextTick(function(){
            require ('../../../../assets/js/jquery.qrcode.min.js');
            this.qrcode();
          })
				}
			}
		}
	}
</script>
<style lang="scss">
$blue:#00a2eb;
.wechatCode-modal{
	width: 150px;
	padding:15px;
	background: #fff;
	text-align: center;
	border-radius: 5px;
	left: calc(50% - 100px);
	.code-box{
		display: inline-block;
		// .qrcode{margin-left: 22px;}
	}
	p{
		margin-top: 10px;
		text-align: center;
    color: #666;
    font-size: 14px;
	}
}
</style>



// WEBPACK FOOTER //
// qrcode.vue?d52a4446