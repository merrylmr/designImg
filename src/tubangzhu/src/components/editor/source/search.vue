<template>
	<div class="search-box u-scroll"  @scroll="scroll" ref="searchBox">
		<div class="search-list" >
			<p class="info" v-if="!searching">输入关键词查找素材，按回车键</p>
			<p class="info" v-else>{{list.keyword}}</p>
			<div class="list">
				<waterfall 
					:line-gap="88" 
					:watch="list.data" 
					align="left">
				  <!-- each component is wrapped by a waterfall slot -->
				  <waterfall-slot
				    v-for="(item, index) in list.data"
				    :width="item.owidth"
				    :height="item.oheight"
				    :key="index"
				    :order="index"
				  >
				   <a href="javascript:;" 
				   	draggable="true"
				   	@click="addElement(item.type,item.url,item)"
				   	@dragstart="handleDragstart(item.type,item.url,item)"
				   >
				   	<img :src="item.thumb" alt="">
				   </a>
				  </waterfall-slot>
				</waterfall>
			</div>
			<div class="loading" v-show="list.request">
				<div class="rect rect1"></div>
				<div class="rect rect2"></div>
				<div class="rect rect3"></div>
				<div class="rect rect4"></div>
				<div class="rect rect5"></div>
			</div>
			<div class="underline" v-show="list.isfull">就这么多了</div>
			<div class="box-bottom" ref="boxBottom"></div>
		</div>
	</div>
</template>
<script>
	import EventBus from '@/common/eventBus.js'
	import Dispatch from '@/common/dispatch.js'
	import Waterfall from 'vue-waterfall/lib/waterfall';
	import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';
	export default {
		data(){
			return {
				searching:false,
				list:{
					keyword:'',
					data:[],
					page:2,
					isfull:false,
					isempty:false,
					request:false,
				}
			}
		},
		components:{Waterfall,WaterfallSlot},
		methods:{
			pushSearchList(data){
				this.$nextTick(function(){
					this.list.request = false;
				})
				if(data.isfull){
					this.list.data = [];
					if(this.list.data.length>0){
						this.list.isfull = true;
					}else{
						this.list.isempty = true;
					}
					return;
				}
				this.list.data = data.data;
			},
			addElement(type,url,item){
				EventBus.$emit('addElement',{
					'type':type,
					'url':url,
					'item':item
				})
			},
			handleDragstart(type,url,item){
				this.$store.state.editor.dragEvent.type = type;
				this.$store.state.editor.dragEvent.url = url;
				this.$store.state.editor.dragEvent.item = item;
			},
			scroll(){
				if(this.list.isfull||this.list.request){return;}//加载完毕或请求中，返回
				var _self = this;
				var bottomHeight = this.$refs.boxBottom.offsetTop,
						scrollTop = event.target.scrollTop,
						boxHeight = this.$refs.searchBox.offsetHeight;
				if((bottomHeight-boxHeight-scrollTop)<30){
					//请求开示
					this.list.request = true;
					Dispatch.getSearchData(this.list.keyword,this.list.page,function(data){
						// 请求结束
						_self.list.request = false;
						_self.list.page++;
						if(data.length==0){
							_self.list.isfull = true;
							return ;
						}
						var data = _self.list.data.concat(data);
						_self.list.data = data;
					})
				}
			},
		},
		created(){
			var _self = this;
			EventBus.$on('pushSearchList',function(data){
				_self.pushSearchList(data);
			})
			// 进入等待状态并准备关键字
			EventBus.$on('pushSearchState',function(data){
				_self.list.request = true;
				_self.searching = true;
				_self.list.keyword = data;
			})
		}
	}
</script>
<style lang="scss">
$blue:#00a2eb;
.search-box{
	height: 100%;
	padding-top: 70px;
	overflow-y:auto;
	padding-left: 23px;
	.search-list{
		.loading{width: 80px;height: 40px;margin:10px auto;text-align: center;
			.rect{animation: loading 1.2s infinite ease-in-out;}
			.rect{display: inline-block;width: 6px;height: 100%;background-color: $blue;
				&.rect1{animation-delay:0}
				&.rect2{animation-delay:.1s}
				&.rect3{animation-delay:.2s}
				&.rect4{animation-delay:.3s}
				&.rect5{animation-delay:.4s}
			}
		}
		.info{
			margin-top: 8px;
			text-align: center;
			color: #d4d4d4;
			line-height: 1.7;
			width: 309px;
	    margin-left: -23px;
		}
		.underline{padding:30px;color: #757c86;text-align: center;}
		.list{
			padding-top: 20px;
		}
	}

}
</style>



// WEBPACK FOOTER //
// search.vue?c8b7ff36