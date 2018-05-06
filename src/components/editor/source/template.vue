<template>
	<div class="temp-box u-scroll" ref="bgBox" @scroll="scroll">
		<div class="list" v-if="inList">
			<div class="navbar">
			 <button v-for="(item,index) in navbar" :style="index==activeNavbar&&({background:color.bgColor,color:color.fontColor})" @click="checkNavbar(index)">{{item}}</button>
			</div>
			<div class="realted-box" v-if="initRelated&&activeNavbar==0" >
				<waterfall :line-gap="lineGap" :watch="relatedData" align="left" tag="ul">
					<waterfall-slot
						v-for="(item, index) in relatedData"
						:width="item.width"
						:height="item.height+10"
						:key="index"
						:order="index"
						class="templist"
					>
					 <a :href="`/diy4/${+item.id}/`" @click="viewTempalte(item)" target="_blank">
						<img :src="item.thumbnail" alt="" :width="item.width" :height="item.height" />
						<div class="info">
							<span class="view"><i class="tbzico ico-eye"></i>{{item.num_view_total}}</span>
							<span class="price" v-text="item.price_coin>0?`${item.price_coin}图币`:'免费'"></span>
						</div>
						<span class="corner" v-if="item.template_count&&item.template_count>1">{{item.template_count}}</span>
					 </a>

					</waterfall-slot>
				</waterfall>
			</div>
			<div class="fav-box" v-else ref="listBox">
				<waterfall :line-gap="lineGap" :watch="favData" align="left" tag="ul">
					<waterfall-slot
						v-for="(item, index) in favData"
						:width="item.width"
						:height="item.height+10"
						:key="index"
						:order="index"
						class="templist"
					>
					 <a :href="`/diy4/${+item.id}/`" @click="viewTempalte(item)" target="_blank">
						<img :src="item.thumbnail" alt="" :width="item.width" :height="item.height" />
						<div class="info">
							<span class="view"><i class="tbzico ico-eye"></i>{{item.num_view_total}}</span>
							<span class="price" v-text="item.price_coin>0?`${item.price_coin}`:'免费'"></span>
						</div>
						<span class="corner">{{item.template_count}}</span>
					 </a>

					</waterfall-slot>
				</waterfall>
			</div>
		</div>
		<div class="detail-box u-scroll" v-else>
			<button @click="()=>{this.inList=true}"><i class="tbzico ico-arrow-left"></i>返回</button>
			<div class="detail">
				<ul>
					<li v-for="(item,index) in detailData">
						<a href=""><img :src="item.thumbnail" width="263" alt=""></a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
<script>
	import socket from '@/common/socket.js'
	import EventBus from '@/common/eventBus.js'
	import Dispatch from '@/common/dispatch.js'
	import Waterfall from 'vue-waterfall/lib/waterfall';
	import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';

	export default {
		data(){
			return{
				navbar:['推荐模板','我的收藏'],
				activeNavbar:0,
				relatedData:[],
				favData:[],
				detailData:[],
				initRelated:false,
				initFav:false,
				dataType:'h',//[h,v]判断图片的横版|竖版
				//p瀑布流
				favRender:false,
				favPage:1,
				favFull:false,

				inList:true,
			}
		},
		components:{Waterfall,WaterfallSlot},
		computed:{
			color(){
				return this.$store.state.editor.color;
			},
			lineGap(){
				var {width,height} = this.$store.state.docData.edit_config;
				return width>height?263:175
			},
		},
		methods:{
			checkNavbar(index){
				if(this.activeNavbar==index){return}
				this.activeNavbar = this.activeNavbar==0?1:0;
				//初始化我的收藏
				if(index==1&&!this.initFav){
					this.favRender = true;
					Dispatch.getFavTemplate(this.favPage,(result)=>{
						if(result.error==0){
							this.initFav = true;
							if(result.data.length<20){
								this.favFull = true;
							}
							result.data.map((item)=>{
								item.height = item.height*263/item.width;
								item.width = 263
							})

							this.favData = result.data;
							this.favRender = false;
							this.favPage++;
						}
					})
				}
			},
			viewTempalte(item){
				if(item.template_count>1){
					event.preventDefault();
					Dispatch.getTemplateDetail(item.id,(result)=>{
						this.inList = false;
						this.detailData = result.data;
					})
				}
			},
			scroll(){
				if(this.activeNavbar==0||this.favFull||this.favRender){return;}//加载完毕或请求中，返回
				var height = this.$refs.listBox.offsetHeight,
						boxHeight = this.$refs.bgBox.offsetHeight,
						scrollHeight = event.target.scrollTop;
				if(boxHeight+scrollHeight-36>height){
					//请求
					this.favRender = true;
					Dispatch.getFavTemplate(this.favPage,(result)=>{
						if(result.error==0){
							if(result.data.length<20){
								this.favFull = true;
							}
							result.data.map((item)=>{
								item.height = item.height*263/item.width;
								item.width = 263
							})

							this.favData = this.favData.concat(result.data);
							this.favRender = false;
							this.favPage++;
						}
					})
				}
			}
		},
		created(){
			EventBus.$on('stateChange', (e)=>{
				if(e.type=="ready"){
					Dispatch.getRelatedTemplate(this.$store.state.docData.product,(result)=>{
						if(result.error!=0){
							this.$store.commit('callModal', { type: 'alert', modalOver: true, cls: 'danger', 'text': result.msg });
							return;
						}
						this.initRelated = true;
						result.data.map((item)=>{
							item.height = item.height*this.lineGap/item.width;
							item.width = this.lineGap
						})
						//数据是否请求完毕
						if(result.data.length<20){
							this.favFull=true
						}
						this.relatedData = result.data;
					})
				}
			})

		}
	}
</script>
<style lang="scss">
	.temp-box{
		height: 100%;
		overflow-y:auto;
		padding-top: 28px;
		padding-left: 23px;
		overflow-x:hidden;
		position: relative;
		.navbar{
			padding-left: 25px;
			margin-bottom: 22px;
			button{
				line-height: 36px;
				color: #d7d8d9;
				background: #5e6367;
				text-align: center;
				padding:0 20px;
				margin:0 6px;
				border-radius: 4px;
				transition:background .2s ease;
				&:hover{
					background: #545356;
				}
				&.active{
					background: #00a2eb;
				}
			}
		}
		.templist {
			a{
				display: block;
				position: relative;
				overflow: hidden;
				.info{
					position: absolute;
					left: 0;
					top: 100%;
					pointer-events:none;
					width: 100%;
					height: 100%;
					transition:top .2s ease-in-out;
					background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.6) 100%);
					span{
						position: absolute;
						bottom: 0;
						color: #fff;
						height: 28px;
						line-height: 28px;
						i{color: #d8d8d8;vertical-align: middle;margin-right: 4px;}
						&.view{
							left: 12px;
						}
						&.price{
							right: 10px;
						}
					}
				}
				.corner{
					position: absolute;
					top: 0;
					right: 0;
					width: 106px;
					height: 77px;
					color: #fff;
					font-size: 14px;
					text-align: right;
					background: url(/assets/images/corner.png) 50% 50% no-repeat;
					transition:transform .2s ease-in-out;
					transform:scale(0);
					transform-origin:top right;
				}
				&:hover{
					.info{top: 0;}
					.corner{transform:scale(1);}
				}
			}
		}
		.detail-box{
			position: absolute;
	    top: 0;
	    z-index: 1001;
	    width: 100%;
	    background: #414750;
	    left: 0;
	    padding-left: 23px;
	    padding-top: 16px;
	    height: 100%;
	    overflow-y:auto;
	    button{
	    	line-height: 36px;
	    	width: 78px;
	    	text-align: center;
	    	font-size: 14px;
	    	color: #d7d8d9;
	    	margin-bottom: 16px;
	    	background: #5e6367;
	    	border-radius: 4px;
	    	i{
	    		font-size: 14px;
	    		vertical-align: middle;
	    		margin-right: 5px;
	    	}
	    }
	    li{
	    	padding-bottom: 10px;
	    }
		}
	}
</style>



// WEBPACK FOOTER //
// template.vue?c9ac92b4
