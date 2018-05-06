<template>
	<div>
		<!--表头编辑器-->
		<div class="table-rc-editor" :style="getTableEditorStyle">
			<!--行控制器-->
			<div class="col-controller controller" :style="getColWidth" v-show="cellEditing==false">
				<!--表头控制器-->
				<div class="item" v-for="(item,index) in getCol" :style="getControllerStyle(item,index,getCol.length,'col')">
					<div class="item-menu" @click="showMenu(item,index,'col')"></div>
				</div>
				<!--尺寸控制器-->
				<div class="resize" v-for="(item,index) in getColList" :style="getResizeStyle(item,index,'col')" @mousedown.stop="setResize(index,'col')"></div>
			</div>
			<!--列控制器-->
			<div class="row-controller controller" v-show="cellEditing==false">
				<!--表头控制器-->
				<div class="item" v-for="(item,index) in getRow" :style="getControllerStyle(item,index,getRow.length,'row')">
					<div class="item-menu" @click="showMenu(item,index,'row')"></div>
				</div>
				<!--尺寸控制器-->
				<div class="resize" v-for="(item,index) in getRowList" :style="getResizeStyle(item,index,'row')" @mousedown.stop="setResize(index,'row')"></div>
			</div>
			<!--添加行-->
			<div class="add-col add" @mousedown.stop="addCell('col')" v-show="cellEditing==false"></div>
			<!--添加列-->
			<div class="add-row add" @mousedown.stop="addCell('row')" v-show="cellEditing==false"></div>
			<!--单元格编辑器-->
			<div class="table-cell-editor" v-show="cellEditing" data-noselect>
				<textarea :id="'cell-'+(nowEditTable!=null?nowEditTable.id:'none')+'-'+item.row+'-'+item.col" :class="{'item':true,'active':item.selected}" v-for="(item,index) in cellArr" :style="getCellStyle(item)" v-model="item.cell.text" @mousedown="cellDownHandle(item)" @mouseup="cellUpHandle(item)"></textarea>
			</div>
		</div>
		<!--表格菜单-->
		<div class="table-menu-editor" v-show="tableMenuShow" :style="{left:menu.left+'px',top:menu.top+'px'}">
			<li @mousedown.stop="removeCell">删除</li>
		</div>
		<!--隐藏域,检测文本宽度是否超出单元格,如果超出则while不断地减小字号-->
		<span class="table-hidden"></span>
	</div>
</template>
<script>
import $ from 'jquery';
import eventBus from '@/common/eventBus.js';
export default {
	data() {
		return {
			menu: {
				left: 0,
				top: 0,
				item: null,
				index: 0,
				controller: null
			},
			resize: {
				controller: '',
				index: 0
			},
			cellArr: [],
			//鼠标按下textarea时,记录这个textarea的boundingbox
			downTextAreaRect: {
				left: 0,
				top: 0,
				right: 0,
				bottom: 0
			},
			downCellItem: {}
		}
	},
	computed: {
		//当前正在编辑的单元格
		cellEditing() {
			if (this.$store.state.editor.nowEditTable == null) {
				return false;
			} else {
				return true;
			}
		},
		nowEditTable() {
			return this.$store.state.editor.nowEditTable;
			//				if(this.getSelectedItem!=null && this.getSelectedItem.type=='table' && this.getSelectedItem.type=='table'){
			//					return this.getSelectedItem;
			//				}else{
			//					return null;
			//				}
		},
		tableMenuShow() {
			return this.$store.state.editor.modal['tableMenu'];
		},
		//获取mouse状态
		getMouse() {
			return this.$store.state.stage.mouse;
		},
		getSelectedItem() {
			return this.$store.state.stage.selectedItem;
		},
		//获取当前的缩放比例
		getZoom() {
			return this.$store.state.stage.zoom / 100;
		},
		getTableEditorStyle() {
			if (this.getSelectedItem != null && this.getSelectedItem.type == 'table') {
				return {
					width: (this.getSelectedItem.edit_config.width * this.getZoom) + 'px',
					height: (this.getSelectedItem.edit_config.height * this.getZoom) + 'px',
					left: (this.getSelectedItem.edit_config.left * this.getZoom) + 'px',
					top: (this.getSelectedItem.edit_config.top * this.getZoom) + 'px'
				}
			} else {
				return {};
			}
		},
		getCol() {
			if (this.getSelectedItem != null && this.getSelectedItem.type == 'table') {
				return this.getSelectedItem.edit_data.col;
			} else {
				return [];
			}
		},
		getColList() {
			var arr = [{
				index: -1,
				length: 0
			}];
			return arr.concat(this.getCol)
		},
		getRow() {
			if (this.getSelectedItem != null && this.getSelectedItem.type == 'table') {
				return this.getSelectedItem.edit_data.row;
			} else {
				return [];
			}
		},
		getRowList() {
			var arr = [{
				index: -1,
				length: 0
			}];
			return arr.concat(this.getRow)
		},
		getColWidth() {
			var styleObj = {};
			if (this.getSelectedItem != null && this.getSelectedItem.type == 'table') {
				styleObj.width = (5 + (this.getSelectedItem.edit_config.width * this.getZoom)) + 'px';
			}

			return styleObj;
		}
	},
	methods: {
		cellDownHandle(item) {
			this.downCellItem = item;
			var rect = event.target.getBoundingClientRect();
			var cx = $('#stage_canvas').offset().left
			var cy = $('#stage_canvas').offset().top
			this.downTextAreaRect.left = rect.left - cx;
			this.downTextAreaRect.right = rect.right - cx;
			this.downTextAreaRect.top = rect.top - cy;
			this.downTextAreaRect.bottom = rect.bottom - cy;
		},
		cellUpHandle(item) {
			//如果当前选中的单元格少于两个,则去除所有的selected状态,并把item设置为selected

			if (this.nowEditTable == null) {
				return
			}

			var selectedNum = 0;
			for (var i in this.cellArr) {
				var cellItem = this.cellArr[i]
				if (cellItem.selected) {
					selectedNum++;
				}
			}

			if (selectedNum < 2) {
				for (var i in this.cellArr) {
					var cellItem = this.cellArr[i]
					cellItem.selected = false;
				}
				item.selected = true;
			}
		},
		resizeFont(cellItem) {
			if (this.nowEditTable == null) {
				return
			}
			var selector = "rect[data-col='" + cellItem.col + "'][data-row='" + cellItem.row + "'][data-id='" + this.nowEditTable.id + "']";
			var $cellItem = $(selector);
			if ($cellItem.length > 0) {
				//获取单元格rect
				var cellRect = $cellItem[0].getBoundingClientRect();
				this.updateHiddenText(cellItem);
				var hiddenRect = $('.table-hidden')[0].getBoundingClientRect();

				while (cellRect.width <= hiddenRect.width + 5 || cellRect.height <= hiddenRect.height + 5) {
					cellItem.cell.fontSize--;
					cellRect = $cellItem[0].getBoundingClientRect();
					this.updateHiddenText(cellItem);
					hiddenRect = $('.table-hidden')[0].getBoundingClientRect();
				}
				if (cellItem.cell.fontSize < 5) {
					cellItem.cell.fontSize = 5
				}
			}
			$('.table-hidden').contents().remove();
		},
		updateHiddenText(cellItem) {
			//获取文字宽度rect
			$('.table-hidden').contents().remove();
			var $hiddenText = $('<p>' + cellItem.cell.text.replace(new RegExp('\n', 'gm'), '<br/>') + '</p>')
			$hiddenText.css('font-size', (cellItem.cell.fontSize * this.getZoom) + 'px');
			$('.table-hidden').append($hiddenText);
		},
		getCellStyle(cellItem) {
			if (this.nowEditTable == null) {
				return
			}
			var selector = "rect[data-col='" + cellItem.col + "'][data-row='" + cellItem.row + "'][data-id='" + this.nowEditTable.id + "']";
			var $cellItem = $(selector);
			if ($cellItem.length > 0) {
				var cx = $('#stage_canvas').offset().left;
				var cy = $('#stage_canvas').offset().top
				var cellRect = $cellItem[0].getBoundingClientRect();

				var styleObj = {
					width: cellRect.width + 'px',
					height: cellRect.height + 'px',
					paddingTop: (cellRect.height / 2 - cellItem.cell.fontSize / 2) + 'px',
					left: (cellRect.left - cx - this.getSelectedItem.edit_config.left * this.getZoom) + 'px',
					top: (cellRect.top - cy - this.getSelectedItem.edit_config.top * this.getZoom) + 'px',
				};

				styleObj.color = cellItem.cell.color.newColor;
				styleObj.fontSize = (cellItem.cell.fontSize * this.getZoom) + 'px';
				styleObj.textAlign = cellItem.cell.align;

				styleObj.letterSpacing = cellItem.cell.letterSpacing + 'px';
				styleObj.lineHeight = cellItem.cell.lineHeight / 100;

				styleObj.fontFamily = cellItem.cell.fontFamily;
				if (cellItem.cell.italic == 1) {
					styleObj.fontStyle = 'italic';
				}
				return styleObj
			}
		},
		getResizeStyle(item, index, controller) {
			var styleObj = {};
			if (this.getSelectedItem != null && this.getSelectedItem.type == 'table') {
				//获取总长度
				var totalLength = 0;
				//计算最终结果
				if (controller == 'col') {
					if (index == -1) {
						return {
							left: '0px',
							top: '0px'
						}
					}
					this.getCol.map(function(item) {
						totalLength += item.length;
					})
					//累计当前index到0的全部长度
					var nowLength = 0
					for (var i in this.getCol) {
						if (i < index) {
							var ratio = this.getCol[i].length / totalLength;
							var resultLength = (this.getSelectedItem.edit_config.width * ratio * this.getZoom);
							nowLength += resultLength;
						}
					}

					styleObj.left = nowLength + 'px'
					styleObj.top = "0px";
				} else {
					if (index == -1) {
						return {
							left: '0px',
							top: '0px'
						}
					}
					this.getRow.map(function(item) {
						totalLength += item.length;
					})
					//累计当前index到0的全部长度
					var nowLength = 0
					for (var i in this.getRow) {
						if (i < index) {
							var ratio = this.getRow[i].length / totalLength;
							var resultLength = (this.getSelectedItem.edit_config.height * ratio * this.getZoom);
							nowLength += resultLength;
						}
					}
					styleObj.top = nowLength + 'px'
					styleObj.left = "0px";
				}
			}
			return styleObj;


		},
		getControllerStyle(item, index, length, controller) {
			var styleObj = {};
			if (this.getSelectedItem != null && this.getSelectedItem.type == 'table') {
				//获取总长度
				var totalLength = 0;

				//计算最终结果
				if (controller == 'col') {
					this.getCol.map(function(item) {
						totalLength += item.length;
					})
					//获取比例
					var ratio = item.length / totalLength;
					var resultLength = (this.getSelectedItem.edit_config.width * ratio * this.getZoom);
					styleObj.width = resultLength + 'px'
				} else {
					this.getRow.map(function(item) {
						totalLength += item.length;
					})
					//获取比例
					var ratio = item.length / totalLength;
					var resultLength = (this.getSelectedItem.edit_config.height * ratio * this.getZoom);
					styleObj.height = resultLength + 'px'
				}

				//
				//					if (index == length - 1) {
				//						styleObj.border = 'none';
				//					}
			}
			return styleObj;
		},
		showMenu(item, index, controller) {
			this.$store.commit('callModal', { type: 'tableMenu' });
			this.menu.left = this.getMouse.x;
			this.menu.top = this.getMouse.y;
			this.menu.item = item;
			this.menu.index = index;
			this.menu.controller = controller;
		},
		removeCell() {
			console.log('删除');
			if (this.menu.controller == 'row') {
				if (this.getRow.length == 1) {
					this.$store.commit('callModal');
					this.$store.commit('callModal', {
						type: 'alert',
						modalOver: true,
						cls: 'ok',
						text: '请至少保留一个单元格'
					})

					return;
				}
				//减去对应的宽度/高度
				var newLength = this.getRow[this.menu.index].length;
				var totalLength = 0;
				this.getRow.map(function(item) {
					totalLength += item.length;
				})
				var ratio = newLength / totalLength;
				this.getSelectedItem.edit_config.height -= ratio * this.getSelectedItem.edit_config.height;

				//删除行控制器
				this.getRow.splice(this.menu.index, 1);
				var cellData = this.getSelectedItem.edit_data.cell;
				for (var row in cellData) {
					if (row == this.menu.index) {
						cellData.splice(row, 1);
						break;
					}
				}

			} else {
				if (this.getCol.length == 1) {
					this.$store.commit('callModal');
					this.$store.commit('callModal', {
						type: 'alert',
						modalOver: true,
						cls: 'ok',
						text: '请至少保留一单元格'
					})

					return;
				}

				//减去对应的宽度/高度
				var newLength = this.getCol[this.menu.index].length;
				var totalLength = 0;
				this.getCol.map(function(item) {
					totalLength += item.length;
				})
				var ratio = newLength / totalLength;
				this.getSelectedItem.edit_config.width -= ratio * this.getSelectedItem.edit_config.width;

				this.getCol.splice(this.menu.index, 1);
				var cellData = this.getSelectedItem.edit_data.cell;
				for (var row in cellData) {
					for (var col in cellData[row]) {
						if (col == this.menu.index) {
							cellData[row].splice(col, 1);
							break;
						}
					}
				}
			}
			this.$store.commit('callModal');
			//eventBus.$emit('stageChange','removeCell');
			eventBus.$emit('elementChange', {
				type: 'update',
				targets: [this.getSelectedItem]
			});
		},
		addCell(controller) {

			var cellData = this.getSelectedItem.edit_data.cell;


			if (controller == 'row') {
				var firstCell = this.getSelectedItem.edit_data.cell[this.getSelectedItem.edit_data.cell.length - 1][0]
				var newRow = [];
				for (var i in this.getCol) {
					newRow.push({
						//文本
						text: '',
						//文本svg结果
						svg: '',
						//颜色
						color: {
							oldColor: firstCell.color.oldColor,
							newColor: firstCell.color.newColor
						},
						//字体大小
						fontSize: firstCell.fontSize,
						//字体
						fontFamily: firstCell.fontFamily,
						//水平居中
						align: firstCell.align,
						//垂直居中
						valign: firstCell.valign,
						italic: firstCell.italic,
						//字间距
						letterSpacing: firstCell.letterSpacing,
						//行间距
						lineHeight: firstCell.lineHeight,
					});
				}
				cellData.push(newRow);

				var newLength = this.getRow[this.getRow.length - 1].length;
				this.getRow.push({
					index: this.getCol.length,
					length: newLength
				});

				//表格高度增加
				//获取表格整体的长度(行或列)
				//计算比例 = newLength/总体长度
				//宽或高*计算比例
				var totalLength = 0;
				this.getRow.map(function(item) {
					totalLength += item.length;
				})
				var ratio = newLength / totalLength;
				this.getSelectedItem.edit_config.height += ratio * this.getSelectedItem.edit_config.height;

			} else {
				var firstCell = this.getSelectedItem.edit_data.cell[0][this.getSelectedItem.edit_data.cell[0].length - 1]
				var newCol = [];
				for (var i in this.getRow) {
					cellData[i].push({
						//文本
						text: '',
						//文本svg结果
						svg: '',
						//颜色
						color: {
							oldColor: firstCell.color.oldColor,
							newColor: firstCell.color.newColor
						},
						//字体大小
						fontSize: firstCell.fontSize,
						//字体
						fontFamily: firstCell.fontFamily,
						//水平居中
						align: firstCell.align,
						//垂直居中
						valign: firstCell.valign,
						italic: firstCell.italic,
						//字间距
						letterSpacing: firstCell.letterSpacing,
						//行间距
						lineHeight: firstCell.lineHeight,
					});
				}
				var newLength = this.getCol[this.getCol.length - 1].length;
				this.getCol.push({
					index: this.getCol.length,
					length: newLength
				})
				//表格高度增加
				//获取表格整体的长度(行或列)
				//计算比例 = newLength/总体长度
				//宽或高*计算比例
				var totalLength = 0;
				this.getCol.map(function(item) {
					totalLength += item.length;
				})
				var ratio = newLength / totalLength;
				this.getSelectedItem.edit_config.width += ratio * this.getSelectedItem.edit_config.width;
			}
			//eventBus.$emit('stageChange','table-add');
			eventBus.$emit('elementChange', {
				type: 'update',
				targets: [this.getSelectedItem]
			});
		},
		setResize(index, controller) {
			this.resize.controller = controller;
			this.resize.index = index;
		}

	},
	created() {
		var _self = this;
		eventBus.$on('globalMouseMove', function() {
			if (_self.getSelectedItem != null) {
				//拖动表头
				if (_self.resize.controller != '') {
					if (_self.resize.controller == 'col') {
						var totalLength = 0;
						_self.getCol.map(function(item) {
							totalLength += item.length;
						})
						var px_length = (_self.getMouse.vectorX * (totalLength / _self.getSelectedItem.edit_config.width)) / _self.getZoom;

						if (_self.resize.index - 1 == -1) {
							if (_self.getCol[0].length - px_length > 0) {
								_self.getSelectedItem.edit_config.left += _self.getMouse.vectorX / _self.getZoom
								_self.getSelectedItem.edit_config.width -= _self.getMouse.vectorX / _self.getZoom
								_self.getCol[0].length -= px_length;
							}


						} else if (_self.resize.index - 1 == _self.getCol.length - 1) {
							if (_self.getCol[_self.getCol.length - 1].length + px_length > 0) {
								console.log('列,尾格,向右拉伸');
								_self.getSelectedItem.edit_config.width += _self.getMouse.vectorX / _self.getZoom
								_self.getCol[_self.getCol.length - 1].length += px_length;
							}

						} else {
							if (_self.getCol[_self.resize.index - 1].length + px_length > 0 && _self.getCol[_self.resize.index].length - px_length > 0) {
								_self.getCol[_self.resize.index - 1].length += px_length;
								_self.getCol[_self.resize.index].length -= px_length;
							}
						}






					} else {
						var totalLength = 0;
						_self.getRow.map(function(item) {
							totalLength += item.length;
						})
						var px_length = _self.getMouse.vectorY * (totalLength / _self.getSelectedItem.edit_config.height) / _self.getZoom;

						if (_self.resize.index - 1 == -1) {
							if (_self.getRow[0].length - px_length > 0) {
								console.log('行,首格,向上拉伸');
								if (_self.getRow[0].length - px_length > 0) {
									_self.getSelectedItem.edit_config.top += _self.getMouse.vectorY / _self.getZoom
									_self.getSelectedItem.edit_config.height -= _self.getMouse.vectorY / _self.getZoom
									_self.getRow[0].length -= px_length;
								}
							}

						} else if (_self.resize.index - 1 == _self.getRow.length - 1) {
							if (_self.getRow[_self.getRow.length - 1].length + px_length > 0) {
								console.log('行,尾格,向下拉伸');
								_self.getSelectedItem.edit_config.height += _self.getMouse.vectorY / _self.getZoom
								_self.getRow[_self.getRow.length - 1].length += px_length;
							}

						} else {
							if (_self.getRow[_self.resize.index - 1].length + px_length > 0 && _self.getRow[_self.resize.index].length - px_length > 0) {
								_self.getRow[_self.resize.index - 1].length += px_length;
								_self.getRow[_self.resize.index].length -= px_length;
							}
						}





					}
					eventBus.$emit('elementChange', {
						type: 'update',
						targets: [_self.getSelectedItem],
						snap: false
					});
					//eventBus.$emit('updateSelectedItemsHtml');
				}
				//框选单元格
				if (_self.cellEditing && _self.getMouse.isDown) {
					//虚拟选择框
					var cx = $('#stage_canvas').offset().left
					var cy = $('#stage_canvas').offset().top

					var a = {};

					var mouseCx = _self.getMouse.x - _self.getMouse.downX;
					var mouseCy = _self.getMouse.y - _self.getMouse.downY;


					if (mouseCx > 0) {
						a.left = (_self.getMouse.downX)
						a.right = (_self.getMouse.downX + (_self.getMouse.x - (_self.nowEditTable.edit_config.left * _self.getZoom) - _self.getMouse.parentX))
					} else {
						a.left = (_self.getMouse.downX + (_self.getMouse.x - (_self.nowEditTable.edit_config.left * _self.getZoom) - _self.getMouse.parentX))
						a.right = (_self.getMouse.downX)
					}

					if (mouseCy > 0) {
						a.top = (_self.getMouse.downY)
						a.bottom = (_self.getMouse.downY + (_self.getMouse.y - (_self.nowEditTable.edit_config.top * _self.getZoom) - _self.getMouse.parentY))
					} else {
						a.top = (_self.getMouse.downY + (_self.getMouse.y - (_self.nowEditTable.edit_config.top * _self.getZoom) - _self.getMouse.parentY))
						a.bottom = (_self.getMouse.downY)
					}
					var allUnSelected = true;

					for (var i in _self.cellArr) {
						var cellItem = _self.cellArr[i]
						var selector = "rect[data-col='" + cellItem.col + "'][data-row='" + cellItem.row + "'][data-id='" + _self.getSelectedItem.id + "']";
						var $cellItem = $(selector);
						var cellRect = $cellItem[0].getBoundingClientRect();
						var b = {
							left: (cellRect.left - cx),
							right: (cellRect.left + cellRect.width - cx),
							top: (cellRect.top - cy),
							bottom: (cellRect.top + cellRect.height - cy),
						};

						//console.log('down',a.left,b.left)

						//当前单元格
						if (a.right < b.left || a.left > b.right || a.top > b.bottom || a.bottom < b.top) {
							cellItem.selected = false;
						} else {
							cellItem.selected = true;
							var allUnSelected = false;
						}
					}
					if (allUnSelected) {
						_self.downCellItem.selected = true;
					}



				}
			}
		});
		eventBus.$on('globalMouseUp', function() {
			if (_self.getSelectedItem != null) {
				if (_self.resize.controller != '') {
					eventBus.$emit('elementChange', {
						type: 'update',
						targets: [_self.getSelectedItem],
					});
				}
				_self.resize.controller = '';
				_self.resize.index = -1;
				//eventBus.$emit('updateSelectedItemsHtml');


			}
		});
		eventBus.$on('stateChange', function(e) {
			if (e.type == 'startEditTable') {
				//进入编辑模式
				//获取cellArray
				if (_self.nowEditTable != null) {
					var cellArr = [];
					var cellData = _self.nowEditTable.edit_data.cell
					for (var row in cellData) {
						for (var col in cellData[row]) {
							var cellItem = {
								row: row,
								col: col,
								cell: cellData[row][col]
							}
							if (row == e.data.row && col == e.data.col) {
								cellItem.selected = true;
							} else {
								cellItem.selected = false;
							}

							cellArr.push(cellItem)
						}
					}
					_self.cellArr = cellArr;
				} else {
					_self.cellArr = [];
				}
				_self.nowEditTable.cellArr = _self.cellArr;
				console.log('进入单元格编辑模式', _self.nowEditTable);
				_self.$nextTick(function() {
					var text = $('#cell-' + _self.nowEditTable.id + '-' + e.data.row + '-' + e.data.col).get(0);
					var textLength = $('#cell-' + _self.nowEditTable.id + '-' + e.data.row + '-' + e.data.col).val().length;
					text.setSelectionRange(textLength, textLength)
					text.focus();
					/*for(var i in _self.cellArr){
						_self.resizeFont(_self.cellArr[i]);
					}*/

				});
			}
		});
	}
}
</script>
<style lang="scss" scoped="">
.table-rc-editor {
	position: absolute;
	pointer-events: none;
	.controller {
		border: 1px solid #d8d8d8;
		background: #f1f1f1;
		pointer-events: auto;
	}
	.col-controller {
		left: 0;
		top: 0;
		width: 100%;
		height: 24px;
		margin-top: -26px;
		margin-right: 2px;
		position: relative;
		.item {
			height: 100%;
			border-right: 1px solid #d8d8d8;
			display: inline-block;
			white-space: nowrap;

			position: relative;
			.item-menu {
				width: 15px;
				height: 15px;
				background: url('/assets/images//arrow12.png') no-repeat 3px 5px;
				border: 1px solid transparent;
				position: absolute;
				left: 50%;
				top: 50%;
				margin-left: -7.5px;
				margin-top: -7.5px;
				cursor: pointer;
				&:hover {
					background-color: #FFFFFF;
					border: 1px solid #d8d8d8;
				}
			}
		}
		.resize {
			position: absolute;
			height: 24px;
			width: 5px;
			margin-left: -2.5px;
			background: transparent;
			cursor: url(/assets/images/table-resize.png) 7.5 7.5, auto;
		}
	}
	.row-controller {
		left: 0;
		top: 0;
		height: 100%;
		width: 24px;
		margin-left: -26px;
		margin-top: 2px;

		.item {
			width: 100%;
			border-bottom: 1px solid #d8d8d8;
			white-space: nowrap;
			position: relative;
			.item-menu {
				width: 15px;
				height: 15px;
				background: url('/assets/images//arrow13.png') no-repeat 5px 3px;
				border: 1px solid transparent;
				position: absolute;
				left: 50%;
				top: 50%;
				margin-left: -7.5px;
				margin-top: -7.5px;
				cursor: pointer;
				&:hover {
					background-color: #FFFFFF;
					border: 1px solid #d8d8d8;
				}
			}
		}
		.resize {
			position: absolute;
			width: 24px;
			height: 5px;
			margin-top: -2.5px;
			background: transparent;
			margin-left: -24px;
			cursor: url(/assets/images/table-resize-90.png) 7.5 7.5, auto;
		}
	}
	.add-col {
		background: url('/assets/images//addcell.png') no-repeat;
		right: 0;
		top: 0;
		margin-top: -26px;
		margin-right: -15px;
		width: 13px;
		height: 24px;
		position: absolute;
		cursor: pointer;
		pointer-events: auto;
		&:hover {
			background-position: -13px 0px;
		}
	}
	.add-row {
		background: url('/assets/images//addcell90.png') no-repeat;
		margin-left: -26px;
		margin-bottom: -15px;
		bottom: 0;
		left: 0;
		width: 24px;
		height: 13px;
		position: absolute;
		pointer-events: auto;
		cursor: pointer;
		&:hover {
			background-position: 0px -13px;
		}
	}
}

.table-cell-editor {
	position: absolute;
	left: 0;
	top: 0;
	pointer-events: auto;
	.item {
		position: absolute;
		border: 1px solid rgba(0, 0, 0, 0.2);
		background: transparent;
		resize: none;
		width: 100%;
		height: 100%
	}
	.active {
		background: rgba(71, 210, 233, 0.2);
		border: 1px solid #00a2eb;
	}
}

.table-menu-editor {
	position: absolute;
	border: 1px solid #d8d8d8;
	background: white;
	z-index: 200000;
	li {
		width: 60px;
		height: 20px;
		line-height: 20px;
		list-style: none;
		padding-left: 5px;
		font-size: 14px;
		margin: 3px;

		&:hover {
			background: #e0e0e0;
		}
	}
}
</style>


// WEBPACK FOOTER //
// tableEditor.vue?8da76094
