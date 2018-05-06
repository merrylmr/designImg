<template>
	<div class="wait-modal modal" v-show="waitShow" @mousedown.stop="">
		<div class="loading">
			<div class="rect rect1"></div>
			<div class="rect rect2"></div>
			<div class="rect rect3"></div>
			<div class="rect rect4"></div>
			<div class="rect rect5"></div>
		</div>
		<p>数据处理中...</p>
	</div>
</template>
<script>
	export default{
		computed:{
			waitShow(){
				return this.$store.state.editor.modal['wait'];
			},
		}
	}
</script>
<style lang="scss">
$blue:#00a2eb;
.wait-modal{
	width: 400px;
	height: 130px;
	margin-top: -65px;
	margin-left: -200px;
	background: #fff;
	border-radius: 5px;
	.loading{width: 80px;height: 40px;margin:10px auto;text-align: center;
		.rect{display: inline-block;width: 6px;height: 100%;background-color: $blue;animation: loading 1.2s infinite ease-in-out;
			&.rect1{animation-delay:0}
			&.rect2{animation-delay:.1s}
			&.rect3{animation-delay:.2s}
			&.rect4{animation-delay:.3s}
			&.rect5{animation-delay:.4s}
		}
	}
	p{
		color: #969696;
		text-align: center;
	}
}
</style>


// WEBPACK FOOTER //
// wait.vue?de2871e6