<template>
	<div class="common-left">
		<!-- <span class="tool-text" @click.stop="callModal({'type':'size',modalOver:false})">尺寸
			<size/>
		</span> -->
		<span class="tool-text" @click="favMaterial">{{text}}</span>
	</div>
</template>
<script>
	import size from '@/components/editor/modal/toolbar/size'	
	import Dispatch from '@/common/dispatch.js';	
	export default{
		components:{size},
		computed:{
			selectedItem() {
				return this.$store.state.stage.selectedItem;
			},
			groupId() {
				return this.$store.state.stage.groupId;
			},
			text() {
				return this.groupId > 0 ? '收藏到团队素材' : '收藏到我的素材' ;
			}
		},
		methods:{
			callModal(data){
				this.$store.commit('callModal');
				this.$store.commit('callModal',data);
			},
			favMaterial(){

				var _self = this;
				var data = {};
				data.type = this.selectedItem.type;
				data.teamId = this.groupId || 0;
				if(data.type=="image"){
					data.material = this.selectedItem.edit_data.url;
				}else{
					data.material = this.selectedItem.edit_data.svg;
				}
				Dispatch.favMaterial(data,function(data){
					console.log(data);
					if(data.status=='y'){
						_self.$store.commit('callModal',{
							type:'alert',
							modalOver:true,
							cls:'ok',
							text:data.info
						})
					}else{
						_self.$store.commit('callModal',
						{'type':'login','modalOver':true}
						)
					}
					
				})
			}
		}

	}
</script>
<style lang="scss">
	.common-left{
		float: left;
	}
</style>


// WEBPACK FOOTER //
// commonLeft.vue?54c99485