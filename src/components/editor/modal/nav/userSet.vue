<template>
	<transition name="fade-minimodal">
	<div class="userset-modal modal-mini" v-if="userShow&&isJianye" @mousedown.stop="">
		<div class="title"><i class="tbzico ico-setbd"></i><span>{{username}}</span></div>
		<p>
			<a :href="`/member/settings/2${brand}`" rel="nofollow">修改头像</a>
			<span class="split">|</span>
			<a :href="`/member/settings/0${brand}`" rel="nofollow">修改昵称</a>
		</p>
		<a :href="`/member/settings/3${brand}`" rel="nofollow" target="_blank" class="item j-personalInfo"><i class="tbzico ico-bill"></i>充值简币</a>
		<a href="/logout.html" rel="nofollow" class="item item-out"><i class="tbzico ico-out"></i></i>退出登录</a>
	</div>
	<div class="userset-modal modal-mini" v-else-if="userShow&&!isJianye" @mousedown.stop="">
		<div class="title"><i class="tbzico ico-setbd"></i><span>{{username}}</span></div>
		<p>
			<a :href="`/member/settings/2${brand}`" rel="nofollow">修改头像</a>
			<span class="split">|</span>
			<a :href="`/member/settings/0${brand}`" rel="nofollow">修改昵称</a>
			<span class="split">|</span>
			<a :href="`/member/settings/1${brand}`" rel="nofollow">修改密码</a>
		</p>
		<a :href="`/member/settings/0${brand}`" rel="nofollow" target="_blank" class="item"><i class="tbzico ico-phone"></i>绑定手机</a>
		<a :href="`/member/settings/0${brand}`" rel="nofollow" target="_blank" class="item"><i class="tbzico ico-email"></i>绑定邮箱</a>
		<a :href="`/member/settings/3${brand}`" rel="nofollow" target="_blank" class="item j-personalInfo"><i class="tbzico ico-bill"></i>充值图币</a>
		<a href="/logout.html" rel="nofollow" class="item item-out"><i class="tbzico ico-out"></i></i>退出登录</a>
	</div>
	</transition>
</template>
<script>
	export default{
		computed:{
			isJianye(){
				return this.$store.state.docData.product == 'jianye';
			},
			userShow(){
				return this.$store.state.editor.modal['userset'];
			},
			username(){
				return this.$store.state.editor.username
			},
			brand(){
				var teamId = this.$store.state.stage.groupId;
				return teamId>0?`?brand=${teamId}`:''
			}
		},
		methods:{

		},
	}
</script>
<style lang="scss">
	.userset-modal{
		position: fixed;
		z-index: 200;
		top: 50px;
		right: 10px;
		width: 204px;
		padding-bottom: 10px;
		border-radius: 5px;
		background: #fff;
		color: #6e6f70;
		font-size: 12px;
		box-shadow: 0 0 5px 0 rgba(0,0,0,.2);
		.title{
			border-radius: 5px 5px 0 0;
			padding-left: 15px;
			line-height: 43px;
			background-color: #f1f1f1;
			span{
				height: 43px;
			}
			i{
				cursor: pointer;
				padding-right: 15px;
				color: #afafaf;
				float: right;
			}
		}
		p{
			line-height: 40px;
			padding-left: 15px;
			.split{
				padding-left: 15px;
				color: #d1d1d1;
				padding: 0 2px;
			}
		}
		.item{
			display: block;
			padding-left: 15px;
			line-height: 36px;
			i{vertical-align: middle;margin-right: 10px;}
			&.item-out{
				color: #ff5400;
				margin-top: 5px;
				&:hover{
					i{
						color:#ff5400;
					}
				}
			}
			&:hover{
				background: #f2f2f2;
				i{
					color:#31a66b;
				}
			}
		}
	}
</style>



// WEBPACK FOOTER //
// userSet.vue?c2e13978