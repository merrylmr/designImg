<template>
	<div class="table-text-tool-bar">
		<div class="color-picker">
			<color-picker v-for="(item,index) in getColorArr" v-bind:key="index" :color="item.newColor" type="color" @onChange="onColorChange(item,arguments[0])"></color-picker>
		</div>
	</div>
</template>
<script>
	import colorPicker from './../modal/colorPicker';
	import eventBus from '@/common/eventBus.js';
	import comboBox from './../modal/comboBox';
	import common from '@/common/common.js';
	export default{
		data(){
			return{
				//字体列表
				fontFamilyArr:[
					["a1","微软雅黑",0],
					["a9","方正兰亭超细黑简体",27],
					["a25","兰亭黑简体",54],
					["a26","兰亭粗黑简体",81],
					["a0","宋体",1323],
					["a2","隶书",108],
					["a3","方正大黑简体",135],
					["a4","方正报宋简体",189],
					["a5","方正北魏楷书简体",216],
					["a6","方正行楷简体",270],
					["a7","方正卡通简体",324],
					["a8","方正楷体简体",351],
					["a10","方正隶变简体",378],
					["a11","方正隶书简体",405],
					["a12","方正启体简体",459],
					["a13","方正书宋简体",486],
					["a14","方正舒体简体",513],
					["a15","方正魏碑简体",540],
					["a16","方正细珊瑚简体",594],
					["a17","方正粗圆简体",621],
					["a18","方正准圆简体",675],
					["a19","方正细圆简体",702],
					["a20","方正小宋标简体",729],
					["a21","方正正中黑简体",783],
					["a22","方正正黑简体",810],
					["a23","方正粗倩简体",837],
					["a24","方正综艺简体",864],
					["a27","方正谭黑简体",1242],
					["a28","造字工房力黑",1269],
					["a29","造字工房尚黑",1296],
					["a32","逼格青春简体",1458],
					["a35","迷你简双线体",1539],
					["a37","铁山楷书",1593],
					["a38","金砖黑简",1620],
					["a39","范笑歌楷书简",1647],
					["c1","arial",918],
					["c2","bookmanOldStyle",945],
					["c3","carolingia",972],
					["c4","century",999],
					["c5","century725BT",1026],
					["c6","centuryExpdBT",1053],
					["c7","compactaBdBT",1080],
					["c8","copprplGothBT",1107],
					["c9","creampuff",1134],
					["c10","DiskusDMed",1161],
					["c11","EmbassyBT",1188],
					["c12","EngraversGothicBT",1215],
					["c13","aGENCYFB",1377],
					["c14","cASTELLAR",1404],
					["c15","cOMPACTALTBT",1431],
				],
				//字体列表dataSource格式
				fontFamilyArrDataSource:[],
				//文字大小
				fontSizeArrDataSource:[],
			}
		},
		components:{colorPicker,comboBox},
		computed:{
			//当前正在编辑的单元格
			nowEditTable(){
				return this.$store.state.editor.nowEditTable;
			},
			//获取正在被选择的单个物体
			getSelectedItem(){
				return this.$store.state.stage.selectedItem;
			},
			//获取当前的单元格
			nowEditCell(){
				if(this.nowEditTable==null){
					console.log('没表格');
					return null;
				}
				return this.nowEditTable.cell;
			},
			nowTableFontSize(){
				if(this.getSelectedItem==null || this.getSelectedItem.type!='table'){
					return '';
				}else{
					var result = parseInt(common.px2pt(this.getSelectedItem.edit_data.cell[0][0].fontSize,this.userDPI,this.tplDPI));
					return result;
				}
			},
			nowTableItalicActive(){
				if(this.getSelectedItem==null || this.getSelectedItem.type!='table'){
					return '';
				}else{
					if(this.getSelectedItem.edit_data.cell[0][0].italic==0){
						return false;
					}else{
						return true;
					}

				}
			},
			//获取当前表格的字体
			nowTableFontFamily(){
				if(this.getSelectedItem==null || this.getSelectedItem.type!='table'){
					return '';
				}else{
					return this.getSelectedItem.edit_data.cell[0][0].fontFamily;
				}
			},
			//获取表格所有的颜色对象
			getColorArr(){
				if(this.getSelectedItem==null || this.getSelectedItem.type!='table'){
					return [];
				}else{
					var colorArr = [];
					//获取文字颜色
					/*var cellArr = this.getSelectedItem.edit_data.cell;
					for(var row in cellArr){
						for(var col in cellArr[row]){
							if(this.colorInArray(colorArr,cellArr[row][col].color)==false){
								colorArr.push(cellArr[row][col].color);
								console.log('添加颜色',cellArr[row][col].color);
							}
						}
					}*/
					//从style读取颜色
					var style =  this.getSelectedItem.edit_data.style;
					for(var i in style){

						if(style[i].background!=undefined && this.colorInArray(colorArr,style[i].background)==false){
							colorArr.push(style[i].background);

						}
						if(style[i].borderTopColor!=undefined && this.colorInArray(colorArr,style[i].borderTopColor)==false){
							colorArr.push(style[i].borderTopColor);
						}
						if(style[i].borderBottomColor!=undefined && this.colorInArray(colorArr,style[i].borderBottomColor)==false){
							colorArr.push(style[i].borderBottomColor);
						}
						if(style[i].borderLeftColor!=undefined && this.colorInArray(colorArr,style[i].borderLeftColor)==false){
							colorArr.push(style[i].borderLeftColor);
						}
						if(style[i].borderRightColor!=undefined && this.colorInArray(colorArr,style[i].borderRightColor)==false){
							colorArr.push(style[i].borderRightColor);
						}
					}

					console.log('colorArrcolorArrcolorArr',colorArr);
					return colorArr;
				}
			},
			//获取userDPI
			userDPI(){
				return this.$store.state.editor.userDPI;
			},
			//获取模板像素
			tplDPI(){
				return this.$store.state.docData.edit_config.dpi;
			},
		},
		methods: {
			//搜索颜色是否存在一个数组
			colorInArray(arr, color){
				for (var i in arr) {
					if (arr[i].oldColor == color.oldColor) {
						return true;
					}
				}
				return false;
			},
			onColorChange(item, color){
				console.log('item',item,'color',color);
				var styleArr = this.getSelectedItem.edit_data.style;
				var pro = ['color','background','borderTopColor','borderBottomColor','borderLeftColor','borderRightColor'];

				for(var i in styleArr){
					for(var c in pro) {

						var nitem = styleArr[i][pro[c]];
						//console.log('替换!',pro[c],nitem)
						if (nitem != undefined && item.oldColor == nitem.oldColor) {

							nitem.newColor = color;
						}
					}
				}
				eventBus.$emit('elementChange',{
					type:'update',
					targets:[this.getSelectedItem]
				});

			},
			setFontFamily(font){
				var isEmpty = true;
				var cellArr = this.getSelectedItem.edit_data.cell;
				for(var row in cellArr){
					for(var col in cellArr[row]){
						if(cellArr[row][col].text.length>0){
							isEmpty=false
						}
						cellArr[row][col].fontFamily = font.value;
					}
				}
				//判断该表格是否为空,如果空则触发update,如果不是则等待文字触发update

				if(isEmpty){
					eventBus.$emit('elementChange',{
						type:'update',
						targets:[this.getSelectedItem]
					});
				}else{
					eventBus.$emit('updateTableTextSvg',this.getSelectedItem);
				}

			},
			setFontSize(item){
				var pxSize = common.pt2px(item.value,this.userDPI,this.tplDPI);
				var cellArr = this.getSelectedItem.edit_data.cell;
				var isEmpty = true;
				for(var row in cellArr){
					for(var col in cellArr[row]){
						if(cellArr[row][col].text.length>0){
							isEmpty=false
						}
						cellArr[row][col].fontSize = pxSize;
					}
				}
				if(isEmpty){
					eventBus.$emit('elementChange',{
						type:'update',
						targets:[this.getSelectedItem]
					});
				}else{
					eventBus.$emit('updateTableTextSvg',this.getSelectedItem);
				}
			},
			setItalic(item){
				var setItalic = 0;
				if(this.nowTableItalicActive==false){
					setItalic=1
				}
				console.log(setItalic);
				var isEmpty = true;
				var cellArr = this.getSelectedItem.edit_data.cell;
				for(var row in cellArr){
					for(var col in cellArr[row]){
						if(cellArr[row][col].text.length>0){
							isEmpty=false
						}
						cellArr[row][col].italic = setItalic;
					}
				}
				if(isEmpty){
					eventBus.$emit('elementChange',{
						type:'update',
						targets:[this.getSelectedItem]
					});
				}else{
					eventBus.$emit('updateTableTextSvg',this.getSelectedItem);
				}
			}
		},
		created(){
			//创建字体列表
			for(var i =0;i<this.fontFamilyArr.length;i++){
				this.fontFamilyArrDataSource.push({
					option:-(this.fontFamilyArr[i][2]),
					value:this.fontFamilyArr[i][0]
				});
			}
			//创建文字大小列表
			for(var i =5;i<=800;i++){
				this.fontSizeArrDataSource.push({
					option:i,
					value:i
				});
			}
		}
	}
</script>
<style lang="scss">
	.table-text-tool-bar{
		position: relative;
		float: left;
		.color-picker{
			float:left;
		}
		.item{
			display: inline-block;
		}
		.combo-box{
			float: left;
		}
		.active{
			background-color:#e5e5e5 !important;
		}

	}
</style>


// WEBPACK FOOTER //
// tableTool.vue?d41b9388