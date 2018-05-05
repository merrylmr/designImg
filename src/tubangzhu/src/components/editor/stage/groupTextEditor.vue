<template>
	<div>
		<div class="group-text-editor" id="groupTextEditor" :style="getEditorStyle" data-noselect>
			<textarea class="group-text-editor-text" :style="getTextAreaStyle" @input="onTextChange"></textarea>
		</div>
		<div class="group-text-hidden"></div>
	</div>
</template>
<script>
	import eventBus from '@/common/eventBus.js';
	import $ from 'jquery';
	export default{
		data(){
			return{
				text:''
			}
		},
		computed:{
			//获取外边框风格样式
			getEditorStyle(){
				if(this.getNowEditGroupText==null){
					return;
				}
				var styleObj = {};

				styleObj.left = (this.getNowEditGroupText.rect.left)+'px';
				styleObj.top = (this.getNowEditGroupText.rect.top)+'px';
				styleObj.width = (this.getNowEditGroupText.rect.width)+'px';
				styleObj.height = (this.getNowEditGroupText.rect.height)+'px';

				return styleObj;
			},
			//获取textarea样式
			getTextAreaStyle(){
				if(this.getNowEditGroupText==null){
					return;
				}
				//计算原始尺寸和缩放后尺寸,得到缩放比例
				var zoom = (this.getNowEditGroupText.item.edit_config.width / this.getNowEditGroupText.item.edit_config.originalWidth)*this.getZoom;
				//将文本写入隐藏域并获取长度
				var $textObj = $('<span>'+this.getNowEditGroupText.text.text +'</span>');
				$textObj.css('font-family',this.getNowEditGroupText.text.fontFamily);
				$textObj.css('font-size',(this.getNowEditGroupText.text.fontSize*zoom)+'px');
				$('.group-text-hidden').html($textObj[0].outerHTML);


				var newZoom = this.getNowEditGroupText.rect.width / $('.group-text-hidden').find('span')[0].getBoundingClientRect().width;
				if(newZoom>1){
					newZoom=1;
				}
				console.log('newZoom',newZoom,this.getNowEditGroupText.rect.width,$('.group-text-hidden').find('span')[0].getBoundingClientRect().width);
			//	$('.group-text-hidden').html('');


				var styleObj = {};
				styleObj.color = this.getNowEditGroupText.text.color.newColor;
				styleObj.fontSize = (this.getNowEditGroupText.text.fontSize*zoom*newZoom*0.8)+'px';
				styleObj.textAlign = this.getNowEditGroupText.text.align;
				styleObj.fontFamily = this.getNowEditGroupText.text.fontFamily;
				return styleObj;
			},
			//获取正在编辑的组合文字对象
			getNowEditGroupText(){
				return this.$store.state.editor.nowEditGroupText;
			},
			//获取当前的缩放比例
			getZoom(){
				return this.$store.state.stage.zoom / 100;
			},
		},
		methods:{
			//当文本修改时
			onTextChange(e){
				if(this.getNowEditGroupText!=null){
					this.getNowEditGroupText.text.text = e.target.value.replace(new RegExp('\n','gm'),'');
				}
			}
		},
		created(){
			var _self = this;
			eventBus.$on('startGroupEdit',function (data) {

				if(_self.getNowEditGroupText!=null){
					_self.text = (_self.getNowEditGroupText!=null)?_self.getNowEditGroupText.text.text:'';
					console.log('_self.text',_self.text);
					$('.group-text-editor-text').val(_self.text);
					_self.$nextTick(function () {
						var text = $(".group-text-editor-text").get(0);
						var textLength = $(".group-text-editor-text").val().length;
						text.setSelectionRange(textLength, textLength)
						text.focus();
						//隐藏文字
						_self.$nextTick(function () {
							eventBus.$emit('updateAllItemsHtml');
						})
					})
				}
			});
		}
	}
</script>
<style lang="scss">
.group-text-editor{
	position: absolute;
	textarea{
		background: rgba(0,0,0,0.1);
		font-family: "microsoft yahei";
		border:1px solid #00a2eb;
		box-shadow: 0 0 5px white;
		resize:none;
		width:100%;
		height:100%
	}

}
.group-text-hidden{
	pointer-events: none;
	opacity:0;
	white-space: nowrap;
}
</style>


// WEBPACK FOOTER //
// groupTextEditor.vue?3e0cd561