<template>
	<transition name="fade-minimodal">
	<div class="share-modal modal-mini" v-if="shareShow"  @mousedown.stop="">
		<div class="topInfo">
			<p class="t1">通过三方平台分享</p>
			<div class="list">
				<a href="javascript:;" class="sina" target="_blank" @click="shareTo('weibo')"></a>
				<a href="javascript:;" class="weixin" @click="shareTo('weixin')"></a>
				<a href="javascript:;" class="qzone" target="_blank" @click="shareTo('qzone')"></a>
				<a href="javascript:;" class="qq" target="_blank" @click="shareTo('qq')"></a>
			</div>
		</div>
		<!-- <div class="line"></div>
		<div class="midInfo">
			<p class="t1">通过E-mali分享</p>
			<div class="sendmail">
				<input type="email" placeholder="输入邮箱地址" v-model="mailUrl">
				<a href="javascript:;" @click="sendMail">发送</a>
				邮箱格式错误提醒node
				<p class="errinfo" v-if="mailErr">邮箱格式不正确</p>
			</div>
		</div> -->
		<div class="line"></div>
		<div class="botInfo">
			<p class="t1">通过链接分享</p>
			<p class="t2">地址：<span>{{shareInfo.url}}</span></p>
			<button v-clipboard="shareInfo.url" @success="afterCopy"><i class="tbzico ico-eLink"></i>复制地址</button>
		</div>
	</div>
	</transition>
</template>
<script>
	import Dispatch from '@/common/dispatch.js'
	import EventBus from '@/common/eventBus.js'
	export default{
		data(){
			return {
				shareInfo:{
					data:'这里有海量免费的素材和模板，只需用鼠标拖拉拽，5分钟轻松搞定名片、宣传单、海报、PPT、朋友圈等图片设计，从此设计不再求人，图帮主——最便捷的在线设计软件！',
					desc:'这里有海量免费的素材和模板，只需用鼠标拖拉拽，5分钟轻松搞定名片、宣传单、海报、PPT、朋友圈等图片设计，从此设计不再求人，图帮主——最便捷的在线设计软件！',
					summary:'图帮主-最便捷的在线设计软件',
					url:'',
				},
				mailUrl:'',
				mailErr:false,
				config:{
					weibo:['新浪微博',"http://service.weibo.com/share/share.php?url={0}&title={2}"],
					qzone:['QQ空间',"http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={0}&title={1}&desc={2}&summary={3}"],
					qq:['QQ好友',"http://connect.qq.com/widget/shareqq/index.html?url={0}&title={1}&desc={2}&summary={3}"],
					renR:['人人网',"http://share.renren.com/share/buttonshare.do?link={0}&title={1}{2}"],
					hi:['百度空间',"http://apps.hi.baidu.com/share/?url={0}&title={1}&content={2}"],
					kx:['开心网',"http://www.kaixin001.com/repaste/share.php?rtitle={1}&rurl={0}&rcontent={2}"],
					txwb:['腾讯微博',"http://v.t.qq.com/share/share.php?title={1}&url={0}&source={2}"],
					douban:['豆瓣',"http://www.douban.com/recommend/?url={0}&title={1}&comment={2}"],
					bsh:['搜狐白社会',"http://bai.sohu.com/appLogin.jsp?bru=/app/share/blank/add.do?link={0}&title={1}"],
					souhu:['搜狐微博',"http://t.sohu.com/third/post.jsp?url={0}&title={1}&content=utf-8&pic="],
					wangY:['网易微博',"http://t.163.com/article/user/checkLogin.do?link={0}&source={1}&info={2}&title={1}"]
				},
			}
		},
		computed:{
			shareShow(){
				return this.$store.state.editor.modal['share'];
			},
		},
		methods:{
			sendMail(){
				if(/^\w+\@\w+\.\w{2,4}$/.test(this.mailUrl)){
					this.mailErr = false;
				}else{
					this.mailErr = true;
				}
			},
			shareTo(type){
				if(type=='weixin'){
					this.$store.state.editor.qrcodeText = this.shareInfo.url;
					this.$store.state.editor.qrcodeTip = '请打开手机微信，使用“扫一扫”分享';
					this.$store.commit('callModal',{'type':'code','modalOver':true})
				}else{
					var link = this.config[type][1];
					var data = this.shareInfo;
					event.target.href = link.replace(/\{0}/g, data.url).replace(/\{1}/g,encodeURIComponent(data.data)).replace(/\{2}/g, encodeURIComponent(data.desc)).replace(/\{3}/g, encodeURIComponent(data.summary));

				}
			},
			afterCopy(){
				this.$store.commit('callModal',{
					type:'alert',
					modalOver:true,
					cls:'ok',
					text:'已成功复制到剪切板！'
				})
			}
		},
		mounted(){
			var _self = this;
			EventBus.$on('getShareUrl',function(data){
				Dispatch.getShareUrl(function(data){
				if(data.error==0){_self.shareInfo.url = data.data.url;}
			},data);
			})


		}
	}
</script>
<style lang="scss">
	.share-modal{
		left:calc(50% - 210px);
    width: 307px;
    .t1{
    	font-size: 14px;
    	color: #515151;
    }
    .topInfo{
    	padding: 15px 15px 0;
    	.list{
    		font-size: 0;
		    padding-top: 10px;
		    padding-bottom: 15px;
		    a{
		    	width: 38px;
			    height: 38px;
			    background: url(/assets/share.png) 0 0 no-repeat transparent;
			    display: inline-block;
			    margin-right: 15px;
			    &.weixin{background-position: -54px 0;}
			    &.qzone{background-position: -107px 0;}
			    &.qq{background-position: -160px 0;}
			    &:hover{opacity: .6}
		    }
    	}
    }
    .midInfo{
    	padding: 10px 15px 0;
    	p{
		    &.errinfo{
		    	padding-top: 10px;
			    font-size: 12px;
			    color: #e11921;
		    }
    	}
    	.sendmail{
    		padding-top: 10px;
		    padding-bottom: 15px;
		    input{
		    	width: 195px;
			    height: 41px;
			    border: 1px solid #ccc;
			    border-radius: 5px;
			    margin-right: 9px;
			    padding-left: 5px;
		    }
		    a{
		    	width: 59px;
			    height: 41px;
			    border-radius: 5px;
			    background-color: #32c46e;
			    text-align: center;
			    font-size: 14px;
			    color: #fff;
			    line-height: 40px;
			    display: inline-block;
			    transition: background-color .2s ease-in;
		    }
    	}
    }
    .botInfo{
    	padding: 10px 15px 15px;
    	.t2{
    		font-size: 12px;
		    color: #a7a7a7;
		    padding: 5px 0;
		    overflow: hidden;
		    text-overflow: ellipsis;
		    word-wrap: normal;
		    white-space: nowrap;
    	}
    	button{
    		display: inline-block;
		    border-radius: 4px;
		    border:1px solid #ccc;
		    background: none;
		    font-size: 12px;
		    text-align: center;
		    line-height: 32px;
		    color: #626262;
		    i{
		    	font-size: 14px;
		    	margin-right: 2px;
		    }
		    &:hover{
		    	color: #32c46e;
		    	border-color: #32c46e;
		    }
		    padding: 0 5px;
		    margin-top: 5px;
    	}
    }
	}
</style>


// WEBPACK FOOTER //
// share.vue?2620a26c
