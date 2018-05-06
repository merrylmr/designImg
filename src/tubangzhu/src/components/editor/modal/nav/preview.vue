<template>
	<div class="preview-modal" v-if="previewShow" id="preview">
		<div class="box"
			v-html="getPreviewSvg(activeIndex)"
			@mousedown.stop="callNext"
		></div>
		<div class="tool" @mousedown.stop="">
			<span class="esc" @click="exitPreview" title="退出预览"></span
			><span class="line"></span
			><span class="prev" @click="callPrev"></span
			><span class="text">{{activeIndex+1}}/{{pagelist.length}}</span
			><span class="next" @click="callNext"></span>
		</div>
	</div>
</template>
<script>
	import $ from 'jquery'
	export default{
		data(){
			return {
				activeIndex:0,
			}
		},
		watch:{
			previewShow(val){
				if(val){
					this.activeIndex = this.$store.state.docData.editor.nowPage;
				}
			}
		},
		computed:{
			previewShow(){
				return this.$store.state.editor.modal['preview'];
			},
			//获取svg的宽度
			getSvgWidth(){
				if(this.$store.state.docData.edit_config.unit=="px"){
					//像素
					return (this.$store.state.docData.edit_config.width+(this.$store.state.docData.edit_config.bleed*2));
				}else if(this.$store.state.docData.edit_config.unit=="mm"){
					//毫米
					return ((this.$store.state.docData.edit_config.width  * this.$store.state.docData.edit_config.dpi / 25.4) +(this.$store.state.docData.edit_config.bleed*2));
				}

			},
			//获取svg的高度
			getSvgHeight(){
				if(this.$store.state.docData.edit_config.unit=="px"){
					//像素
					return (this.$store.state.docData.edit_config.height+(this.$store.state.docData.edit_config.bleed*2));
				}else if(this.$store.state.docData.edit_config.unit=="mm"){
					//毫米
					return ((this.$store.state.docData.edit_config.height  * this.$store.state.docData.edit_config.dpi / 25.4)+(this.$store.state.docData.edit_config.bleed*2));
				}
			},
			pagelist(){
				return this.$store.state.docData.page;

			},
			nowPageIndex(){
				return this.$store.state.docData.editor.nowPage;
			}


			/*list(){
				var list={
					data:[],
					width:this.getSvgWidth,
					height:this.getSvgHeight,
				};

				var maxWidth = document.body.offsetWidth-200,
						maxHeight = document.body.offsetHeight-160;

				if(list.width>maxWidth||list.height>maxHeight){

					//进行缩放
					var sw = list.width/maxWidth,sh = list.height/maxHeight;
					var scale = sw>sh?sw:sh;
					var newWidth = list.width/scale,newHeight = list.height/scale;
					console.log(newWidth,newHeight)
					this.$store.state.docData.page.forEach(function(page){


						var $svg;
						if(page.svg!=''){
							$svg = $(page.svg)
						}else{
							$svg = $('<img src="'+page.thumbnail+'"/>')
						}


						$svg.attr({'width':newWidth,'height':newHeight});
						list.data.push($svg[0].outerHTML)
					})
				}else{
					//不缩放
					this.$store.state.docData.page.forEach(function(page,index){

						if(page.loaded){
							//生成该页的svg
							var oldPageIndex = this.$store.state.docData.editor.nowPage;
							//切换到改页
							this.$store.state.docData.editor.nowPage =index;
							//等待nextTick
							this.$nextTick()
							//改回去
							this.$store.state.docData.editor.nowPage = oldPageIndex
							list.data.push(page.svg)
						}else{
							list.data.push('<img src="'+page.thumbnail+'"/>')
						}
					})
				}

				return list;
			},*/
		},
		methods:{
			getPreviewSvg(activeIndex){
				var width = this.getSvgWidth;
				var height = this.getSvgHeight;
				var maxWidth = document.body.offsetWidth-200,
					maxHeight = document.body.offsetHeight-160;

				if(width>maxWidth||height>maxHeight) {

					//进行缩放
					var sw = width / maxWidth, sh = height / maxHeight;
					var scale = sw > sh ? sw : sh;
					var width = width / scale, height = height / scale;
				}
				var oldPageIndex = this.nowPageIndex;
				var page = this.pagelist[activeIndex];

				if(page.loaded){
					this.$store.state.docData.editor.nowPage = activeIndex;
					var $svg = $($('#svg_canvas')[0].outerHTML);
					$svg.attr('width',width);
					$svg.attr('height',height);
					return $svg[0].outerHTML
				}else{
					return '<img width="'+width+'" height="'+height+'" src="'+page.thumbnail+'"/>';
				}
				return '';
			},
			callNext(){
				console.log('下页');
				var totle = this.pagelist.length-1;
				if(totle==0){return}
				this.activeIndex<totle?this.activeIndex++:this.activeIndex=0;
			},
			callPrev(){
				console.log('上页');
				var totle = this.pagelist.length-1;
				if(totle==0){return}
				this.activeIndex==0?this.activeIndex=totle:this.activeIndex--;
				console.log(this.activeIndex)
			},
			exitPreview(){
				console.log('退出预览');
				this.$store.commit('callModal')
			}
		},
		mounted(){
		}
	}
</script>
<style lang="scss">
	$blue:#00a2eb;
	.preview-modal{
		position: fixed;
		top: 0;
		left:0;
		bottom: 0;
		right: 0;
		background: #000;
		z-index: 100;
		display: flex;
		justify-content:center;
		align-items:center;
		.tool{
	    height: 44px;
	    background-color: #414750;
	    border-radius: 3px;
	    position: absolute;
	    zoom: 1;
	    bottom: 30px;
	    left: 50%;
	    margin-left: -89px;
	    z-index: 2;
	    padding:7px 15px;
	    line-height: 30px;
	    span{
	    	display: inline-block;
	    	vertical-align: middle;
	    	&.esc{
	    		width: 26px;
			    height: 26px;
			    background: url(/assets/images/escfull.png) 0 0 no-repeat transparent;
			    cursor: pointer;
	    	}
	    	&.line{
			    width: 1px;
			    height: 30px;
			    background-color: #666a72;
			    margin-left: 14px;
	    	}
	    	&.prev{
	    		width: 30px;
			    height: 30px;
			    background: url(/assets/images/prevnext.png) 0 0 no-repeat transparent;
			    background-position: 10px -28px;
			    margin:0 5px 0 10px;
			    cursor: pointer;
			    &:hover{
			    	background-color: #525861;
			    }
	    	}
	    	&.text{
			    height: 30px;
			    text-align: center;
			    line-height: 30px;
			    font-size: 16px;
			    color: #fff;
	    	}
	    	&.next{
	    		width: 30px;
			    height: 30px;
			    background: url(/assets/images/prevnext.png) 0 0 no-repeat transparent;
			    background-position: -65px -28px;
			    cursor: pointer;
			    margin-left: 5px;
			     &:hover{
			    	background-color: #525861;
			    }
	    	}
	    }
		}
	}
</style>


// WEBPACK FOOTER //
// preview.vue?f9c3ec2a
