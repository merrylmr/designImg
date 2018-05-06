<template>
<transition name="fade-modal">
	<div class="skin-modal modal" v-if="colorsetShow" @mousedown.stop="">
		<span class="close" @click="closeModal"><i class="tbzico ico-close"></i></span>
		<div class="title"><i class="tbzico ico-skin"></i>皮肤颜色</div>
		<ul >
				<li v-for="(color,index) in colorData.colorList"
				:class="{active:color==colorData.themeColor&&!colorData.isDiy}"
				:style="{backgroundColor:color}"
				@click="pickColor(color)">
					<i class="tbzico ico-ok"></i>
				</li>
				<li :class="['diycolor',{active:colorData.isDiy}]" @click="(picker=!picker)"><i class="tbzico ico-ok"></i></li>
		</ul>
		<div class="colorPicker" v-if="picker">
			<Picker :bindcolor="colorData.diyColor" @onChange="onChangeColor"/>
			<span class="sure" @click="sureDiy">确定</span>
		</div>

	</div>
	</transition>
</template>
<script>
	import Picker from './colorPicker/pallet'
	export default{
		data(){
			return {
				picker:false,
			}
		},
		components: { Picker },
		computed:{
			colorsetShow(){
				return this.$store.state.editor.modal['colorset'];
			},
			colorData(){
				var {colorList,isDiy,diyColor,themeColor} = this.$store.state.editor
				return{colorList,isDiy,diyColor,themeColor}
			}
		},

		methods:{
			closeModal(){
				this.$store.commit('callModal')
				this.picker = false;
			},
			pickColor(color){
				var postColor = color.replace(/#/,'');
				this.$http.post('/editorApi/v1/member/edit-skin',{color:postColor})
				.then((result)=>{
					if(result.data.error==0){
						this.picker = false;
						this.$store.commit('themeColor',{themeColor:color,isDiy:false})
					}
				})

			},
			onChangeColor(color){
				this.$store.commit('themeColor',{themeColor:color,isDiy:true,diyColor:color})
			},
			sureDiy(){
				var postColor = this.colorData.themeColor.replace(/#/,'');
				this.$http.post('/editorApi/v1/member/edit-skin',{color:postColor,diy:1})
				.then((result)=>{
					if(result.data.error==0){
						this.picker = false;
					}
				})
			}
		},
	}
</script>
<style lang="scss">
	.skin-modal{
		padding:0;
		width: 494px;
		height: 176px;
		margin-top: -88px;
		margin-left: -247px;
		border-radius: 5px;
		color: #fff;
		.title{
			border-radius: 5px 5px 0 0;
			padding-left: 15px;
			line-height: 34px;
			background-color: #48525e;
			i{font-size: 20px;margin-right: 8px;vertical-align: middle;}
		}
		ul{
			padding:20px 0 0 20px;
			li{
				width: 49px;
				height: 49px;
				float: left;
				border-radius: 5px;
				margin:0 2px 2px 0;
				cursor: pointer;
				line-height: 49px;
				text-align: center;
				i{display: none;font-size: 20px;}
				&.active{
					i{display: block;}
				}
				&.diycolor{
					background: url(/assets/images/diycolor.png);
				}
			}
		}
		.close{
			position: absolute;
			right: 10px;
			top: 10px;
			cursor: pointer;
			i{font-size: 12px;}
		}
		.colorPicker{
			position: absolute;
			width: 242px;
			height: 236px;
			background-color: #fff;
			top: 175px;
	    left: 400px;
	    box-shadow: 0 0 0 10px #fff;
	    color: #515151;
	    .sure{
	    	position: absolute;
	    	bottom:0;
	    	right:0;
	    	line-height: 26px;
	    	cursor: pointer;
	    	padding:0 15px;
	    	background-color: #ddd;
	    	transition:all .2s ease-in;
	    	&:hover{
	    		background-color: #c6c6c6;
	    	}
	    }
		}
	}
</style>


// WEBPACK FOOTER //
// colorset.vue?350fbfb0
