<template>
    <div class="guides-tool">
        <color-picker :color="guidesColor" type="color" @onChange="setColor"></color-picker>
    </div>
</template>
<script>
import colorPicker from './../modal/colorPicker';
export default {
    computed: {
        guidesColor() {
            return this.$store.state.docData.edit_config.guidesColor;
        },
    },
    methods: {
        setColor(color) {
            this.$store.state.docData.edit_config.guidesColor = color;
        }
    },
    components: {
        colorPicker
    }
}
</script>

<style lang="scss" scoped>
.guides-tool {

    float: left;
}
</style>




// WEBPACK FOOTER //
// guidesTool.vue?0d1fb906