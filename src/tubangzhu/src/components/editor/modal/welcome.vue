<template>
	<div class="welcome-modal" v-if="show">
		<p>早上好</p>
	</div>
</template>
<script>
	export default{
		computed:{
			show(){
				return this.$store.state.editor.modal['welcome'];
			},
		}
	}
</script>
<style lang="scss">
$blue:#00a2eb;
.welcome-modal{
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: #d7d8d9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: #00a2eb;
}
</style>



// WEBPACK FOOTER //
// welcome.vue?3523d832