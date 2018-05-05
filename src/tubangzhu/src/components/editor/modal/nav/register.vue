<template>
	<transition name="fade-modal">
	<div class="register-modal modal" v-if="registerShow" @mousedown.stop=";" style="height:433px">
		<span class="modal-close" @click="closeModal"></span>
		<iframe src="/index/iframe-login" frameborder="0" width="365px" height="453px"></iframe>
	</div>
	</transition>
</template>
<script>
export default {
  computed: {
    registerShow() {
      return this.$store.state.editor.modal["register"];
    }
  },
  methods: {
    closeModal() {
      this.$store.commit("callModal");
    }
  }
};
</script>
<style lang="scss">
.register-modal {
  width: 365px;
  margin-top: -225px;
  margin-left: -182px;
  padding: 0;
}
</style>


// WEBPACK FOOTER //
// register.vue?67016d82