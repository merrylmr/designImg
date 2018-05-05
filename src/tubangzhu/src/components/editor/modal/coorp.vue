<!-- 商户版印刷链接 -->
<template>
	<div class="coorp-modal modal" v-show="coorp" @mousedown.stop="">
		<p class="title">{{coorpName}}下单链接</p>
		<span class="close" @click="closeModal"></span>
		<div class="link-wrap" v-if="wrapShow">
			<a v-for="item in coorpLinks" :href="item.url" target="_blank">
				<img :src="item.logo" :alt="item.title">
			</a>
		</div>
	</div>
</template>
<script>
	export default{
		computed:{
			coorp(){
				return this.$store.state.editor.modal['coorp'];
			},
			coorpName(){
				return this.$store.state.editor.coorpName;
			},
			coorpLinks(){
        var data = this.$store.state.editor.coorpLinks;
				return this.$store.state.editor.coorpLinks;
			},
      wrapShow(){
        return this.coorpLinks&&this.coorpLinks.length>0
      }
		},
		methods:{
			closeModal(){
				this.$store.commit('callModal')
			}
		}
	}
</script>
<style lang="scss">
$blue:#00a2eb;
.coorp-modal{
  width: 544px;
  margin-top: -153px;
  margin-left: -272px;
  padding-top: 0;
  p{
    line-height: 46px;
    font-size: 16px;
    padding-left: 20px;
    background: #00a2eb;
    color: #fff;
  }
  .close{
    position: absolute;
    width: 19px;height: 19px;
    top:15px;
    right: 13px;
    cursor:pointer;
    background: url(../../../assets/images/icon/ico-close.png) no-repeat center center;
  }
  .link-wrap{
    padding: 22px 0 15px 22px;
    a{display: inline-block;padding:0 17px 21px 0;
      img{
        width: 153px;
        height: 80px;
      }
    }
  }
}
</style>


// WEBPACK FOOTER //
// coorp.vue?0a8adb02