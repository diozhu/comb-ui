<template>
    <div class="page page-canvas-bitmap">
        <v-canvas-bitmap></v-canvas-bitmap>
    </div>
</template>

<script>
    import vCanvasBitmap from '../vendors/v-canvas-bitmap.vue';

    export default {
        components: { vCanvasBitmap },

        data () {
            return {
            };
        },
        created () {
        },
        methods: {
            openToast () {
                this.toast = this.$toast('提示文字，尽量限制在一行以内');
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";

    .page-canvas-bitmap {

    }
</style>
