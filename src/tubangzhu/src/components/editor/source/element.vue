<template>
	<div class="element-box u-scroll" ref="eleList" @scroll="scroll">
		<div class="search-box">
			<input type="text" placeholder="查找素材关键词" v-model="searchKey" @focus="searchFocus"  @keyup.enter="handleSearch">
			<i @click="handleSearch"></i>
		</div>
		<div class="sort-list" v-show="sort.show">
			<ul :style="sort.prop">
				<li v-for="(item,index) in sort.fold" :class="['grp-item'+index,{unactive:item.unactive},{'isnew':item.isNew}]" @click="toogleList(index,item.type,0)" :key="item.text">
					<i :class="['icon-'+item.type,'icon-fold',{'icon-group':item.isGroup}]"></i>
					<p>{{item.text}}</p>
				</li>
				<li v-for="(item,index) in sort.cate" :class="['item'+index,item.type,{unactive:item.unactive}]" @click="toogleList(index,item.type,1)" :style="{top:sort.li[index]+'px'}" :key="item.text">
					<i :class="'icon-'+item.type"></i>
					<p>{{item.text}}</p>
				</li>
			</ul>
		</div>
		<div class="element-list" v-show="list.isOpen" :data="list.height">
			<div :class="['line','corner'+list.index]"></div>
			<!-- 元素分类开始 -->
			<ul class="ele-cate" v-if="eleCate">
				<li v-for="item in eleCate" @click="checkListCateType(item.type)" :class="{active:item.type==list.cate}" :key="item.text">{{item.text}}</li>
			</ul>
			<!-- 元素分类结束 -->
			<div class="contain-tips" v-if="list.type=='contain'">容器怎么用？
				<a href="/guide/jiaocheng/4.html" target="_blank">点击这里秒懂 &gt;</a>
			</div>
			<!-- element-list -->
			<div class="list" @dragover.prevent="">
				<!-- 线条&表格 1行1个 -->
				<div class="line-list">
					<waterfall v-show="lineShow" :line-gap="263" :watch="lineData" align="left" @reflowed="reflow">
						<!-- each component is wrapped by a waterfall slot -->
						<waterfall-slot v-for="(item, index) in lineData" :width="item.owidth" :height="item.oheight" :key="index" :order="index">
							<a href="javascript:;" draggable="true" @click="addElement(item,item)" @dragstart="handleDragstart(item)">
								<img :src="item.thumb" alt="" :width="item.owidth" :height="item.oheight">
							</a>
						</waterfall-slot>
					</waterfall>
				</div>
				<!-- 表格 1行1个 -->
				<div class="table-list">
					<waterfall v-show="tableShow" :line-gap="263" :watch="tableData" align="left" @reflowed="reflow">
						<!-- each component is wrapped by a waterfall slot -->
						<waterfall-slot v-for="(item, index) in tableData" :width="item.owidth" :height="item.oheight" :key="index" :order="index">
							<a href="javascript:;" draggable="true" @click="addElement(item,item)" @dragstart="handleDragstart(item)">
								<img :src="item.thumb" alt="">
							</a>
						</waterfall-slot>
					</waterfall>
				</div>
				<!-- 默认 1行3个 -->
				<waterfall :line-gap="88" :watch="list.data" align="left" @reflowed="reflow">
					<!-- each component is wrapped by a waterfall slot -->
					<waterfall-slot v-for="(item, index) in list.data" :width="item.owidth" :height="item.oheight" :key="index" :order="index">
						<a href="javascript:;" draggable="true" @click="addElement(item,item)" @dragstart="handleDragstart(item)">
							<img :src="item.thumb" alt="" width="84">
						</a>
					</waterfall-slot>
				</waterfall>
			</div>
			<div :class="['loading',{'load-anim':list.request}]" v-show="list.request">
				<div class="rect rect1"></div>
				<div class="rect rect2"></div>
				<div class="rect rect3"></div>
				<div class="rect rect4"></div>
				<div class="rect rect5"></div>
			</div>
			<div class="underline" v-show="list.full">你已经触及了我的底线！</div>
		</div>
		<div class="tips" v-show="showTips">
			<span class="text" @click="scrollTop">{{type2text}}</span>
			<span class="closebtn" @click="toogleList()"></span>
		</div>
	</div>
</template>
<script>
	import Dispatch from '@/common/dispatch.js';
	import Waterfall from 'vue-waterfall/lib/waterfall';
	import WaterfallSlot from 'vue-waterfall/lib/waterfall-slot';
	import eventBus from '@/common/eventBus.js';
	import Comm from '@/common/common.js'
	import $ from 'jquery'
	export default{
	data(){
		return {
			searchKey:'',
			lastKey:'',
			searching:false,
			//分类数据
			sort:{
				show:true,
				'fold':[
					{text:'我的素材',type:'myel',unactive:false},
					// {text:'新年素材',type:'holiday',unactive:false,isNew:false},
					// {text:'团队素材'},
					// {text:'团队标志'}
				],
				'cate':[
					{text:'形状',type:"shape",unactive:false},
					{text:'线条&箭头',type:'line',unactive:false},
					{text:'电商',type:"element",unactive:false},
					{text:'标志',type:"sign",unactive:false},
					{text:'花纹',type:"grain",unactive:false},
					{text:'图片',type:"pic",unactive:false},
					{text:'条幅',type:"scroll",unactive:false},
					{text:'图标',type:"icon",unactive:false},
					{text:'插图',type:"ai",unactive:false},
					{text:'表格',type:'table',unactive:false},
					{text:'容器',type:"contain",unactive:false},
					{text:'免扣素材',type:'ps',unactive:false},
					// {text:'节日',type:'holiday',unactive:false},
				],
				'prop':{
					'height':0,
				},
				'li':[156,156,156,276,276,276,396,396,396,516,516,516],
			},
			//素材列表数据
			list:{
				'isOpen':false,
				'type':'',
				'cate':'',//二级分类
				'group':-1,
				'index':0,
				'times':0,//已经请求的次数
				'full':false,//列表是否加载完毕
				'request':false,//是否请求数据中
				'tipShow':false,
				'data':[]
			},
			//素材类别
			eleCates:{
				shape:[
					{text:'全部',type:''},
					{text:'方形',type:'方形'},
					{text:'圆形',type:'圆形'},
					{text:'心形',type:'心形'},
					{text:'星形',type:'星形'},
					{text:'多边形',type:'多边形'},
					{text:'花型',type:'花型'},
					{text:'盾牌',type:'盾牌'},
					{text:'微标',type:'微标'},
				],
				element:[//['电商元素','618','双11','促销']
					{text:'全部',type:''},
					{text:'元素',type:'电商元素'},
					{text:'618',type:'618'},
					{text:'双11',type:'双11'},
					{text:'促销',type:'促销'},
				],
				pic:[//['商务','科技','金融','生活','节日','人物','建筑','植物','自然','装饰','动物','交通','教育','医疗','运动','食品','旅游','艺术']
					{text:'全部',type:''},
					{text:'商务',type:'商务'},
					{text:'科技',type:'科技'},
					{text:'金融',type:'金融'},
					{text:'生活',type:'生活'},
					{text:'节日',type:'节日'},
					{text:'人物',type:'人物'},
					{text:'建���',type:'建筑'},
					{text:'植物',type:'植物'},
					{text:'自然',type:'自然'},
					{text:'装饰',type:'装饰'},
					{text:'动物',type:'动物'},
					{text:'交通',type:'交通'},
					{text:'教育',type:'教育'},
					{text:'医疗',type:'医疗'},
					{text:'运动',type:'运动'},
					{text:'食品',type:'食品'},
					{text:'旅游',type:'旅游'},
					{text:'艺术',type:'艺术'},
				],
				icon:[//['名片专用','商务','社交','科技','金融','人物','动物','运动','自然','交通','教育','地理','美食','标识','箭头','表情','国旗']
					{text:'全部',type:''},
					{text:'名片',type:'名片专用'},
					{text:'商务',type:'商务'},
					{text:'社交',type:'社交'},
					{text:'科技',type:'科技'},
					{text:'金融',type:'金融'},
					{text:'人物',type:'人物'},
					{text:'动物',type:'动物'},
					{text:'运动',type:'运动'},
					{text:'自然',type:'自然'},
					{text:'交通',type:'交通'},
					{text:'教育',type:'教育'},
					{text:'地理',type:'地理'},
					{text:'美食',type:'美食'},
					{text:'标识',type:'标识'},
					{text:'箭头',type:'箭头'},
					{text:'表情',type:'表情'},
					{text:'国旗',type:'国旗'},
				],
				ai:[//['商务','科技','金融','生活','节日','人物','建筑','植物','自然','装饰','动物','交通','教育','医疗','运动','食品','旅游','艺术']
					{text:'全部',type:''},
					{text:'商务',type:'商务'},
					{text:'科技',type:'科技'},
					{text:'金融',type:'金融'},
					{text:'生活',type:'生活'},
					{text:'节日',type:'节日'},
					{text:'人物',type:'人物'},
					{text:'建筑',type:'建筑'},
					{text:'植物',type:'植物'},
					{text:'自然',type:'自然'},
					{text:'装饰',type:'装饰'},
					{text:'动物',type:'动物'},
					{text:'交通',type:'交通'},
					{text:'教育',type:'教育'},
					{text:'医疗',type:'医疗'},
					{text:'运动',type:'运动'},
					{text:'食品',type:'食品'},
					{text:'旅游',type:'旅游'},
					{text:'艺术',type:'艺术'},
				],
				// holiday:[//['元旦','春节','元宵节','情人节','清明节','劳动节','端午节','国庆节','中秋节','圣诞节']
				// 	{text:'全部',type:''},
				// 	{text:'元旦',type:'元旦'},
				// 	{text:'春节',type:'春节'},
				// 	{text:'元宵节',type:'元宵节'},
				// 	{text:'情人节',type:'情人节'},
				// 	{text:'清明节',type:'清明节'},
				// 	{text:'劳动节',type:'劳动节'},
				// 	{text:'端午节',type:'端午节'},
				// 	{text:'国庆节',type:'国庆节'},
				// 	{text:'中秋节',type:'中秋节'},
				// 	{text:'圣诞节',type:'圣诞节'},
				// ],
				ps:[//['商务','科技','电商','人物','动物','食品','装饰','建筑','自然','水墨','特效']
					{text:'全部',type:''},
					{text:'商务',type:'商务'},
					{text:'科技',type:'科技'},
					{text:'电商',type:'电商'},
					{text:'人物',type:'人物'},
					{text:'动物',type:'动物'},
					{text:'食品',type:'食品'},
					{text:'装饰',type:'装饰'},
					{text:'建筑',type:'建筑'},
					{text:'自然',type:'自然'},
					{text:'水墨',type:'水墨'},
					{text:'特效',type:'特效'},
				],
			},
			//激活的素材类别type
			activeCateType:'',
			listHeight:0,
			lineData:[],
			lineShow:false,
			tableData:[],
			tableShow:false,
		}
	},
	components: { Waterfall, WaterfallSlot },
	computed: {
		showTips(){
			let flag;
			if(this.$store.state.docData.product !== "jianye"){
				flag = this.list.tipShow&&this.$parent.sourceBox.activeIndex==1
			}else{
				flag = this.list.tipShow&&this.$parent.sourceBox.activeIndex==3
			}
			return flag

		},
		//类型转换文字
		type2text() {
			if (!this.list.isOpen) { return ''; }
			if(this.list.type=="search"){
				return this.searchKey
			}
			var sortItem;
			var sort = this.sort.fold.concat(this.sort.cate);
			for (var i in sort) {
				if (sort[i].type == this.list.type) {
					sortItem = sort[i];
				}
			}
			if (this.list.cate != '') {
				return sortItem.text + '-' + this.list.cate
			}
			return sortItem.text;
		},
		//元素分类
		eleCate() {
			return this.eleCates[this.list.type]
		}
	},
	watch: {
		listHeight: function(val) {
			val += 60;
			//防止list关闭状态下sort的偏移
			if (!this.list.isOpen) { return; }
			//设置点击元素以下的元素的top
			this.sort.li = [156, 156, 156, 276, 276, 276, 396, 396, 396, 516, 516, 516];
			var index = this.list.index, _self = this;
			if (this.list.group == 0) {
				for (var i in this.sort.li) {
					var height = this.sort.li[i] + val
					this.sort.li.splice(i, 1, height)
					// this.sort.li[i] +=val;
				}
			} else {
				if (index >= 0 && index <= 2) {
					[3, 4, 5, 6, 7, 8, 9, 10, 11].forEach(function(i) {
						_self.sort.li[i] += val;
					})
				}
				if (index >= 3 && index <= 5) {
					[6, 7, 8, 9, 10, 11].forEach(function(i) {
						_self.sort.li[i] += val;
					})
				}
				if (index >= 6 && index <= 8) {
					[9, 10, 11].forEach(function(i) {
						_self.sort.li[i] += val;
					})
				}
			}
		},
	},
	methods: {
		searchFocus(e){
			e.target.select();
		},
		//执行搜索
		handleSearch() {
			if (!this.searchKey) {
				event.stopPropagation();
				this.$store.commit('callModal', {
					type: 'alert',
					modalOver: true,
					cls: 'danger',
					text: '请输入搜索关键字'
				})
				return;
			}
			if (this.lastkey == this.searchKey&&this.searching) {
				return;
			}
			this.list.times =0;
			this.lastkey = this.searchKey;
			this.searching = true;
			this.list.isOpen = true;
			this.list.type = 'search';
			this.list.tipShow = true;
			this.list.index = 0;
			this.sort.show = false;
			this.getMaterial(this.list.type, this.searchKey, 0, this.list.times);
		},
		checkListCateType(type) {
			//初始化
			this.list.times = 0;
			this.list.full = false;
			this.list.cate = type;
			this.getMaterial(this.list.type, this.list.cate, 0, this.list.times);
		},
		initfoldData(){
			this.sort.fold=[
				{text:'团队素材',type:'groupel',unactive:false,isGroup:true},
				{text:'团队标志',type:'groupLogo',unactive:false,isGroup:true},
				// {text:'新年素材',type:'holiday',unactive:false,isNew:false},
			]
		},
		addElement(item){
			eventBus.$emit('addElement',{
				'type':item.type,
				'url':item.url,
				'item':item
			})
		},
		scroll(){

			var tipTop = event.target.scrollTop-parseFloat(this.sort.prop.height);
			//显示分类tip
			this.list.tipShow = tipTop>100?true:false;
			if(this.searching){
				this.list.tipShow = true;
			}
			if(!this.list.isOpen||this.list.full||this.list.request){return;}//列表关闭或者加载完毕或请求中，返回
			var listTop = parseFloat(this.sort.prop.height) + this.listHeight ;

			if(listTop-event.target.scrollTop<850){
				if(this.searching){
					this.getMaterial(this.list.type,this.searchKey,1,this.list.times)//瀑布流请求搜索
				}else{
					this.getMaterial(this.list.type,this.list.cate,1,this.list.times)//瀑布流请求
				}
			}
		},
		reflow(){
			this.listHeight = $('.element-list').height();
		},
		//打开关闭element-list
		toogleList(index,type,group){
			var _self = this;
			if(this.list.type=="search"){
				this.sort.show  = true;
				this.list.tipShow = false;
				this.searching = false;
			}
			//关闭element-list
			if(this.list.isOpen){
				this.list.isOpen = false;
				this.list.times = 0;
				this.list.full = false;
				this.list.data=[];
				this.sort.li=[156,156,156,276,276,276,396,396,396,516,516,516];
				this.listHeight=0;
				for(var i in this.sort.fold){this.sort.fold[i].unactive=false;}
				for(var i in this.sort.cate){this.sort.cate[i].unactive=false;}
				return;
			}
			if(type=="holiday"){
				Comm.setCookie('editor_el_newyear',1,100)
				this.sort.fold[this.sort.fold.length-1].isNew = false;
				this.$parent.menu.forEach((item)=>{
					if(item.type==="material"){
						item.hasNew = false;
					}
				})
			}
			//初始化list数据
			this.listHeight = 150;
			this.list.isOpen = true;
			this.list.type = type;
			this.list.group = group;
			this.list.index = index;
			this.list.cate = '';
			//设置sortbox的高度 && 元素透明度
			for(var i in this.sort.fold){this.sort.fold[i].unactive=true;}
			for(var i in this.sort.cate){this.sort.cate[i].unactive=true;}
			if(group==0){
				this.sort.prop.height = '121px';
				for(var i in this.sort.fold){
					this.sort.fold[i].unactive=true;
					if(this.sort.fold[i].type==type){this.sort.fold[i].unactive=false}
				}
				for(var i in this.sort.cate){this.sort.cate[i].unactive=true;}
			}else{
				var h0 =138,h1=120;
				if(index>=0&&index<=2){
					this.sort.prop.height = h0+h1*1+'px';
				}
				if(index>=3&&index<=5){
					this.sort.prop.height = h0+h1*2+'px';
				}
				if(index>=6&&index<=8){
					this.sort.prop.height = h0+h1*3+'px';
				}
				if(index>=9){this.sort.prop.height = h0+h1*4+'px'}

				for(var i in this.sort.fold){this.sort.fold[i].unactive=true;}
				for(var i in this.sort.cate){
					this.sort.cate[i].unactive=true;
					if(this.sort.cate[i].type==type){this.sort.cate[i].unactive=false}
				}
			}
			this.getMaterial(type,'',0,0);
		},
		/*获取素材
		*@type(素材类型)
		*@cate(素材二级分类)
		*@num 获取素材次数，0为点击请求，1为瀑布流请求
		*@times 已经请求的次数
		*@cate 素材分类
		*/
		getMaterial(type, cate, num, times) {
			this.list.request = true;
			var id;
			//团队id
			if (type == "groupel" || type == "groupLogo") {
				id = this.$store.state.stage.groupId;
			}
			if(type == 'coopEl'){
				id = this.$store.state.editor.coorpId;
			}
			var _self = this;
			if (type == "line") {
				Dispatch.getLineData(function(data) {
					_self.lineData = data;
				})
				this.lineShow = true;
			} else {
				this.lineShow = false;
			}
			if (type == "table") {
				Dispatch.getTableData(function(data) {
					_self.tableData = data;
				})
				this.tableShow = true;
			} else {
				this.tableShow = false;
			}
			Dispatch.getElementList(type, cate, times, function(data) {
				_self.list.request = false;
				if (data.length > 0) {
					if (num == 0) {
						//初次加载数据
						_self.list.data = data;
					} else {
						//瀑布流数据
						var dataArr = _self.list.data.concat(data);
						_self.list.data = dataArr;
					}
					_self.list.times += 1;
				} else {
					_self.$nextTick(function() {
						_self.listHeight = $('.element-list').height();
					})
					_self.list.full = true;
				}
			}, id)
		},
		handleDragstart(item) {
			this.$store.state.editor.dragEvent.type = item.type;
			this.$store.state.editor.dragEvent.url = item.url;
			this.$store.state.editor.dragEvent.item = item;
			//预加载
			if (item.type == 'image') {
				if (item.width > 800 || item.height > 800) {

					item.imgTemp = new Image();
					item.imgTemp.src = item.url + "?x-oss-process=style/thumb800";
				} else {
					item.imgTemp = new Image();
					item.imgTemp.src = item.url
				}
			}
			//取消框选
			this.$store.state.stage.selectionBox.items = [];
		},
		handleDrop() {
			var type = this.$store.state.editor.dragEvent.type,
				url = this.$store.state.editor.dragEvent.url,
				dropTarget = this.$store.state.editor.dragEvent.drop;
			var pos = {
				left: dropTarget.x,
				top: dropTarget.y
			}
			//添加到舞台
			eventBus.$emit('addElement', {
				'type': type,
				'url': url,
				'pos': pos,
				'item': this.$store.state.editor.dragEvent.item
			})
		},
		scrollTop() {
			$(this.$refs.eleList).animate({
				scrollTop: 0
			}, 500);
		}
	},
	created() {
		eventBus.$on('stateChange', (e)=> {
			if (e.type == 'ready') {
				if (this.$store.state.stage.groupId > 0) {
					this.initfoldData()
				}
				if(this.$store.state.editor.coorpId>0){
					this.sort.fold = this.sort.fold.concat([
						{text:'商户素材',type:'coopEl',unactive:false},
					])
				}
				// var flag = Comm.getCookie('editor_el_newyear');
				// if(!flag){
				// 	_self.sort.fold[_self.sort.fold.length-1].isNew = true;
				// }
			}
		})

	},
	mounted() {
		var _self = this;
		$('.sort-list .item0').append('<span class="line"></div>')
		eventBus.$on('handleDrop', function() {
			_self.handleDrop();
		})
	},
}
</script>
<style lang="scss">
$blue:#00a2eb;
.element-box {
	height: 100%;
	overflow-y: auto;
	padding-top: 20px;
	padding-left: 23px;
	.search-box {
		width: 264px;
		height: 70px;
		padding: 0;
		position: relative;
		input {
			width: 263px;
			height: 40px;
			border-radius: 5px;
			background-color: rgba(255, 255, 255, .95);
			border: 0;
			padding-left: 10px;
			font-size: 12px;
			&:focus {
				background: #fff;
			}
		}
		i {
			width: 40px;
			height: 40px;
			background: url(../../../assets/images/search.png) 0 0 no-repeat transparent;
			border-top-right-radius: 5px;
			border-bottom-right-radius: 5px;
			position: absolute;
			zoom: 1;
			top: 0;
			right: 0;
			cursor: pointer;
			&:hover {
				background-position: 0 -40px;
			}
		}
	}
	.sort-list {
		ul {
			position: relative;
			width: 263px;
			li {
				position: absolute;
				width: 76px;
				height: 102px;
				cursor: pointer;
				zoom: 1;
				padding: 0;
				i {
					display: block;
					width: 76px;
					height: 70px;
					background: url(../../../assets/images/elsort.png) 0 0 no-repeat transparent;
					position: relative;
					zoom: 1;
					z-index: 3;
					transform: rotate(0deg);
					transform-origin: 0 100%;
					transition: all .15s linear;
					&.icon-shape{background-position: 0 0;}
					&.icon-element{background-position: -94px 0;}
					&.icon-sign{background-position: -187px 0;}
					&.icon-grain{background-position: 0 -119px;}
					&.icon-pic{background-position: -94px -119px;}
					&.icon-scroll{background-position: -187px -119px;}
					&.icon-icon{background-position: 0 -235px;}
					&.icon-ai{background-position: -94px -235px;}
					&.icon-ps{background-position: -187px -351px;}
					&.icon-contain{background-position: -94px -351px;}
					&.icon-line{background-position: 0 -458px;}
					&.icon-table{background-position: -187px -235px;}
					&.icon-fold{
						background: url(../../../assets/images/elGroup.png) 0 0 no-repeat transparent;
						&.icon-holiday{
							background: url(../../../assets/images/holiday1.png) 0 0 no-repeat transparent;
						}
					}
				}
				p {
					width: 76px;
					height: 32px;
					line-height: 32px;
					text-align: center;
					font-size: 14px;
					color: #fff;
				}
				.line {
					position: absolute;
					width: 263px;
					top: -20px;
					left: 0;
					height: 1px;
					background: #5e6266;
				}
				&.unactive {
					opacity: 0.25;
				}
				&:before,
				&:after {
					content: '';
					position: absolute;
					width: 76px;
					height: 70px;
					background: url(../../../assets/images/folder.png) 0 0 no-repeat transparent;
					top: 0;
					left: 0;
					z-index: 2;
					transform: rotate(0deg);
					transform-origin: 0 100%;
					transition: all .15s linear;
					opacity: 0;
				}
				&.grp-item0 {
					top: 18px;
					left: 0;
					i.icon-group {
						background-position: -94px 0;
					}
				}
				&.grp-item1 {
					top: 18px;
					left: 94px;
					i.icon-group {
						background-position: -94px 0;
					}
				}
				&.grp-item2 {
					top: 18px;
					left: 188px;
					i.icon-group {
						// background-position: -94px 0;
					}
				}// &.item0,&.item1,&.item2{top:156px;}
				// &.item3,&.item4,&.item5{top:276px;}
				// &.item6,&.item7,&.item8{top:396px;}
				&.item0,
				&.item3,
				&.item6,
				&.item9 {
					left: 0;
				}
				&.item1,
				&.item4,
				&.item7,
				&.item10 {
					left: 94px;
				}
				&.item2,
				&.item5,
				&.item8,
				&.item11 {
					left: 188px;
				}
				&:hover {
					i {
						transform: rotate(-6deg);
					}
					&:before {
						opacity: 1;
						transform: rotate(8deg);
					}
					&:after {
						opacity: 1;
						transform: rotate(1deg);
					}
				}
				&.isnew{
					p:before{
						content: '';
						width: 6px;
						height: 6px;
						position: absolute;
						border-radius: 50%;
						background: red;
						right: 4px;
						bottom: 20px;
						z-index: 20;
					}
				}
			}
		}
	}
	.element-list {
		position: relative;
		z-index: 5;
		background: #414750;
		.ele-cate {
			overflow: hidden;
			margin: 15px 0 0 -15px;
			li {
				float: left;
				width: 54px;
				background: #8e8e8e;
				color: #fff;
				line-height: 25px;
				font-size: 14px;
				cursor: pointer;
				margin-left: 15px;
				text-align: center;
				margin-bottom: 15px;
				&.active {
					background: #00a2eb;
				}
			}
		}
		.line {
			width: 263px;
			height: 1px;
			background: #656b75;
			margin-top: 12px;
			position: relative;
			&:before {
				content: '';
				position: absolute;
				top: -4px;
				left: 35px;
				width: 8px;
				height: 8px;
				background: #414750;
				border-top: 1px solid #656b75;
				border-right: 1px solid #656b75;
				transform: rotate(-45deg);
			}
			&.corner1:before,
			&.corner4:before,
			&.corner7:before,
			&.corner10:before {
				left: 130px;
			}
			&.corner2:before,
			&.corner5:before,
			&.corner8:before,
			&.corner11:before {
				left: 224px;
			}
		}
		.contain-tips {
			color: #acb1b8;
			padding-top: 12px;
			a {
				color: $blue;
			}
		}
		.list {
			padding: 15px 0 15px;
		}
		.underline {
			padding: 30px;
			color: #757c86;
			text-align: center;
		}
		.loading {
			width: 80px;
			height: 40px;
			margin: 10px auto;
			text-align: center;
			&.load-anim .rect {
				animation: loading 1.2s infinite ease-in-out;
			}
			.rect {
				display: inline-block;
				width: 6px;
				height: 100%;
				background-color: $blue;
				&.rect1 {
					animation-delay: 0
				}
				&.rect2 {
					animation-delay: .1s
				}
				&.rect3 {
					animation-delay: .2s
				}
				&.rect4 {
					animation-delay: .3s
				}
				&.rect5 {
					animation-delay: .4s
				}
			}
		}
	}
	.tips {
		position: fixed;
		top: 80px;
		left: 0;
		z-index: 5;
		text-align: center;
		width: 100%;
		.text {
			display: inline-block;
			line-height: 30px;
			border-radius: 3px;
			padding: 0 10px;
			background-color: #272c33;
			font-size: 14px;
			color: #fff;
			cursor: pointer;
		}
		.closebtn {
			position: absolute;
			zoom: 1;
			width: 30px;
			height: 30px;
			line-height: 30px;
			top: 0;
			left: 253px;
			border-radius: 3px;
			background-color: #272c33;
			cursor: pointer;
			background: url(../../../assets/images/icon/ico-close.png) center center no-repeat #272c33;
			&:hover {
				color: $blue;
			}
		}
	}
}

@keyframes loading {
	0%,
	40%,
	100% {
		transform: scaleY(0.6);
	}
	20% {
		transform: scaleY(1);
	}
}
</style>



// WEBPACK FOOTER //
// element.vue?38cbae8b