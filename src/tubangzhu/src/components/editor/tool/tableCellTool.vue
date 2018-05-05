<template>
	<div class="table-cell-tool-bar">
		<color-picker class="item" :color="selectedTextColor" type="color" @onChange="setColor"></color-picker>

		<combo-box class="item" style="width: 170px;" type="font" inputAble="false" :selected="selectedTextFont" @onChange="setFontFamily"></combo-box>
		<combo-box class="item" style="width: 60px;" type="number" inputAble="false" :dataSource="fontSizeArrDataSource" :selected="selectedTextSize" @onChange="setFontSize"></combo-box>
		<!--<div class="split"></div>-->
		<span :class="{'tool-text':true,'tool-ico':true,'text-ico':true,'ico-italic':true,'active':nowTableItalicActive}" @click="setItalic"></span>
		<span class="tool-text tool-ico text-ico ico-align" style="background-position-x: -95px;" @click.stop="callModal({type:'align',modalOver:false})"></span>
		<span class="tool-text tool-ico text-ico ico-lh" @click.stop="callSlide('lineHeight',{type:'slide',modalOver:false})"></span>
		<span class="tool-text tool-ico text-ico ico-ls" @click.stop="callSlide('letterSpace',{type:'slide',modalOver:false})"></span>
		<align type="table" style="left:253px" :align="selectedTextAlign"></align>
	</div>
</template>
<script>
import $ from 'jquery';
import common from '@/common/common.js';
import eventBus from '@/common/eventBus.js';
import colorPicker from './../modal/colorPicker';
import comboBox from './../modal/comboBox';
import align from '@/components/editor/modal/toolbar/align'
export default {
	data() {
		return {

			//文字大小
			fontSizeArrDataSource: [],
		}
	},
	computed: {
		selectedCell() {
			//判断处于selected状态的cell
			var selectedCell = [];
			for (var i in this.nowEditTable.cellArr) {
				var item = this.nowEditTable.cellArr[i];
				if (item.selected) {
					selectedCell.push(item);
				}
			}
			return selectedCell;
		},
		selectedTextColor() {
			if (this.selectedCell.length > 0) {
				return this.selectedCell[0].cell.color.newColor;
			}
		},
		selectedTextAlign() {
			if (this.selectedCell.length > 0) {
				return this.selectedCell[0].cell.align;
			}
		},
		selectedTextFont() {
			if (this.selectedCell.length > 0) {
				return this.selectedCell[0].cell.fontFamily;
			}
		},
		selectedTextSize() {
			if (this.selectedCell.length > 0) {
				return common.fixNumber(this.selectedCell[0].cell.fontSize, 2);
			} else {
				return 12;
			}
		},
		nowTableItalicActive() {
			if (this.selectedCell.length > 0) {
				if (this.selectedCell[0].cell.italic == 0) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		},
		nowEditTable() {
			return this.$store.state.editor.nowEditTable
		},
		//获取当前的缩放比例
		getZoom() {
			return this.$store.state.stage.zoom / 100;
		},
	},
	components: { colorPicker, comboBox, align },
	methods: {
		callSlide(type, data) {
			if (this.selectedCell.length == 0) {
				return;
			}
			if (type == "lineHeight") {
				this.$store.state.editor.slide.data = [{
					title: '字行距',
					type: 'lineHeight',
					max: 1000,
					min: 100,
					val: this.selectedCell[0].cell.lineHeight,
				}];
				this.$store.state.editor.slide.pos = { left: "220px" };
			} else if (type == 'letterSpace') {
				this.$store.state.editor.slide.data = [{
					title: '字间距',
					type: 'letterSpace',
					max: 50,
					min: 0,
					val: this.selectedCell[0].cell.letterSpacing,
				}];
				this.$store.state.editor.slide.pos = { left: "250px" };
			}

			this.$store.commit('callModal')
			this.$store.commit('callModal', data)
		},
		callModal(data) {
			this.$store.commit('callModal')
			this.$store.commit('callModal', data)
		},
		setColor(color) {
			for (var i in this.selectedCell) {
				this.selectedCell[i].cell.color.oldColor = color;
				this.selectedCell[i].cell.color.newColor = color;
			}
		},
		setFontFamily(font) {
			for (var i in this.selectedCell) {
				this.selectedCell[i].cell.fontFamily = font.value;
			}
		},
		setFontSize(size) {
			for (var i in this.selectedCell) {
				this.selectedCell[i].cell.fontSize = size.value;
				//this.resizeFont(this.selectedCell[i]);
			}
		},
		setItalic() {
			var nowItalic = this.nowTableItalicActive
			for (var i in this.selectedCell) {
				if (nowItalic) {
					this.selectedCell[i].cell.italic = 0
				} else {
					this.selectedCell[i].cell.italic = 1;
				}

			}
		},
		/*resizeFont(cellItem){
			if(this.nowEditTable==null){
				return
			}
			var selector = "rect[data-col='"+cellItem.col+"'][data-row='"+cellItem.row+"'][data-id='"+this.nowEditTable.id+"']";

			var $cellItem = $(selector);

			if($cellItem.length>0) {
				//获取单元格rect

				var cellRect = $cellItem[0].getBoundingClientRect();
				this.updateHiddenText(cellItem);
				var hiddenRect =$('.table-hidden')[0].getBoundingClientRect();
				//console.log('hiddenRect',hiddenRect,cellItem.cell.text);
				while(cellRect.width<=hiddenRect.width+5 || cellRect.height<=hiddenRect.height+5){
					cellItem.cell.fontSize--;
					cellRect = $cellItem[0].getBoundingClientRect();
					this.updateHiddenText(cellItem);
					hiddenRect =$('.table-hidden')[0].getBoundingClientRect();
				}
				if(cellItem.cell.fontSize<5){
					cellItem.cell.fontSize = 5
				}
			}
			$('.table-hidden').contents().remove();
		},
		updateHiddenText(cellItem){
			//获取文字宽度rect
			$('.table-hidden').contents().remove();
			var $hiddenText = $('<p>'+cellItem.cell.text.replace(new RegExp('\n','gm'),'<br/>')+'</p>')
			$hiddenText.css('font-size',(cellItem.cell.fontSize * this.getZoom) + 'px');
			$('.table-hidden').append($hiddenText);
		},*/
		//afterChange回调
		afterChangeHandle(data) {
			console.log('afterChangeHandle', data);
			if (parseInt(data.val) != data.val) {
				return;
			}
			if (data.type == 'lineHeight') {
				//this.setLineHeight(data.val)
				for (var i in this.selectedCell) {
					this.selectedCell[i].cell.lineHeight = data.val;
				}
			} else if (data.type == 'letterSpace') {
				//this.setLetterSpacing(data.val)
				for (var i in this.selectedCell) {
					this.selectedCell[i].cell.letterSpacing = data.val;
				}
			}
		},
	},
	beforeDestroy() {
		eventBus.$off('afterChange', this.afterChangeHandle)

	},
	created() {

		//创建文字大小列表
		for (var i = 5; i <= 800; i++) {
			this.fontSizeArrDataSource.push({
				option: i,
				value: i
			});
		}
		eventBus.$on('afterChange', this.afterChangeHandle)
	}
}
</script>
<style lang="scss">
.table-cell-tool-bar {
	position: relative;
	float: left;
	width: 405px;
	.item {
		float: left;
	}
	.active {
		background-color: #e5e5e5 !important;
	}
}
</style>


// WEBPACK FOOTER //
// tableCellTool.vue?5dc1bc62