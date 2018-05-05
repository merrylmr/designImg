<template>
	<transition name="fade-minimodal">
	<div class="download-modal modal-mini" v-if="downloadShow"  @mousedown.stop="">
		<figure v-if="$store.state.docData.product != 'jianye'">
			<p >选择格式</p>
			<select v-model="format">
				<option v-for="item in formatList" :value="item.val">{{item.text}}</option>
			</select>
			<div class="line"></div>
		</figure>
		<a target="_blank" :href="'/editorApi/template/download?tpl_id='+tplId+'&type='+format" @click="toCompute"><i class="tbzico ico-eCompute"></i>下载到电脑</a>
		<a target="_blank" href="javascript:;" @click="toMobile"><i class="tbzico ico-ePhone"></i>下载到手机</a>
	</div>
	</transition>
</template>
<script>
	import socket from '@/common/socket.js'
	export default{
		data(){
			return {
				format:'jpg'
			}
		},
		computed:{
			formatList(){
				if(this.$store.state.docData.allowedPdf==1){
					return [
						{'val':'jpg','text':'JPG'},
						{'val':'png','text':'PNG'},
						{'val':'pdf','text':'PDF(打印和印刷)'},
					]
				}else{
					return [
						{'val':'jpg','text':'JPG'},
						{'val':'png','text':'PNG'},
					]
				}
			},
			downloadShow(){
				return this.$store.state.editor.modal['download'];
			},
			tplId(){
				return this.$store.state.docData.id;
			}
		},
		methods:{
			toCompute(){
				this.$store.commit('callModal')
			},
			toMobile(){
				var _self = this;
				var params = {
					tpl_id:this.tplId,
					uid:this.$store.state.editor.uid,
					type:this.format,
				}
				if(this.format!='pdf'){
					params.page_id = this.$store.state.docData.page[this.$store.state.docData.editor.nowPage].id
				}
				console.log('params',params)
				socket.editorEmit('templateGetDownloadQrcodeUrl',params, function(data){
					_self.$store.commit('callModal');
					_self.$store.state.editor.qrcodeText =data.data.url;
					_self.$store.state.editor.qrcodeTip = '请使用“扫一扫”下载';
					_self.$store.commit('callModal',{'type':'code','modalOver':true})
				})
			}
		}
	}
</script>
<style lang="scss">
	$blue:#00a2eb;
	.download-modal{
    width: 233px;
    padding-left: 23px;
    padding-bottom: 10px;
    left:calc(50% - 80px);
		p{
			padding: 15px 5px 10px 0;
	    font-size: 14px;
	    color: #333;
		}
		.line{
			margin-left:-23px;
			margin-top: 11px;
		}
		select{
			width: 189px;
	    height: 41px;
	    appearance: none;
	    background: url(../../../../assets/images/arrow7.png) 165px 50% no-repeat #fff;
	    border: 1px solid #ccc;
	    padding-left: 10px;
	    padding-right: 10px;
	    line-height: 40px;
	    color: #666;
	    font-size: 14px;
	    border-radius: 4px;
	    cursor: pointer;
	    transition: all .2s ease-in;
	    &:hover{
	    	border: 1px solid #00aeee;
    		background: url(../../../../assets/images/arrow8.png) 165px 50% no-repeat #fff;
	    }
		}
		a{
			display: block;
			border: 1px solid #ccc;
	    width: 190px;
	    height: 41px;
	    border-radius: 4px;
	    font-size: 14px;
	    line-height: 41px;
	    margin-top: 10px;
	    padding-left: 50px;
	    i{
	    	font-size: 18px;
	    	float: left;
	    	margin-right: 5px;
	    }
	    &:hover{
	    	color: #32c46e;
	    	border-color: #32c46e;
	    }
	    &:last-child{
	    	i{
	    		font-size: 20px;
	    	}
	    	&:hover{
		    	color: #00a2eb;
		    	border-color: #00a2eb;
		    }
	    }

		}

	}
</style>



// WEBPACK FOOTER //
// download.vue?bf28396c