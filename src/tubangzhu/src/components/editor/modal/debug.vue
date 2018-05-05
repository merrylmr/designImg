<template>
	<div class="debug-panel">
		<span v-for="(item,index) in docSnap" :style="{'opacity':(item.step==true?1:0.6)}">
			<span v-if="index==docSnapIndex">➤</span>
			{{item.name}} {{item.type!=''?item.type:'|'+item.type}}
			<!--<span style="color:gray" v-if="item.targets!=undefined" v-text="str2obj(item.targets,'old')"></span>-->
			<!--<span style="color:green" v-if="item.targets!=undefined" v-text="str2obj(item.targets,'new')"></span>-->
			<hr/>
		</span>
	</div>
</template>
<script>
import eventbus from '@/common/eventBus.js';
export default {
	computed: {
		docSnap() {
			//console.log(this.$store.state.stage.docSnap);
			return this.$store.state.stage.docSnap;
		},
		docSnapIndex() {
			return this.$store.state.stage.docSnapIndex;
		}
	},
	methods: {
		str2obj(targets, type) {
			if (targets.length > 0) {
				var target;
				if (type == 'old') {

					target = targets[0].oldData
				} else if (type == 'new') {

					target = targets[0].newData
				}
				if (target == null || target == 'null') {
					return '-'
				} else {
					var res = parseInt(JSON.parse(target).edit_config.left);
					if (isNaN(res)) {
						res = '-'
					}
					return res;
				}
			} else {
				console.log('F');
				return '-'
			}


		}
	}
}
</script>
<style lang="scss">
.debug-panel {
	position: fixed;
	bottom: 5px;
	right: 10px;
	background: white;
	padding: 10px;
	box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.3);
	border-radius: 4px;
	z-index: 10000;
	button {
		background: #008891;
		color: white;
		padding: 5px;
		border: none;
		border-radius: 3px;
	}
}
</style>


// WEBPACK FOOTER //
// debug.vue?27727d46