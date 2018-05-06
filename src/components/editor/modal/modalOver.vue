<template>
	<div class="modal modal-over" v-show="overShow" @mousedown.stop="overClick"></div>
</template>
<script>
export default{
	computed:{
		overShow(){
			return this.$store.state.editor.modalOver;
		},
	},
	methods:{
		overClick(e){

			if(!this.$store.state.editor.modalIsAlert){
				e.stopPropagation();
			}
		},

	}
}
</script>


// WEBPACK FOOTER //
// modalOver.vue?6dd941d7