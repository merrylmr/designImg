<template>
	<div class="val-tool">
        <span class="tool-text yes btn" @click="yes"></span>
        <span class="tool-text no btn" @click="no"></span>
    </div>
</template>
<script>
import eventBus from '@/common/eventBus.js';
export default{
    computed:{
        getMode(){
            if(this.$store.state.editor.modal['cropper']){
                return 'cropper';
            }else if(this.$store.state.editor.containerEditor){
                return 'container';
            }
        }
    },
    methods:{
        yes(){
            if(this.getMode=='cropper'){
                eventBus.$emit("applyCrop",true);
            }else if(this.getMode=='container'){
                eventBus.$emit("applyContainer",true);
            }

        },
        no(){
            if(this.getMode=='cropper'){
                eventBus.$emit("applyCrop",false);
            }else if(this.getMode=='container'){
                eventBus.$emit("applyContainer",false);
            }

        }
    }
}
</script>
<style lang="scss">
    .val-tool{
        .btn{
            background:url(/assets/images/val-tool-btn.png);
            width: 30px;
        }
        .yes{
            background-position-x: -1px;
            background-position-y: 2px;
        }
        .no{
            background-position-x: -43px;
            background-position-y: 2px;
        }
    }
</style>


// WEBPACK FOOTER //
// valTool.vue?63cb7228
