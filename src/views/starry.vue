<template>
    <div class="page page-starry">
        <v-starry :value="0"></v-starry>
    </div>
</template>

<script>
    import vStarry from '../vendors/v-starry.vue';
    export default {
        components: { vStarry },
        data () {
            return {
            };
        },
        created () {
            this.init();
        },
        methods: {
            init () {
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";

    .page-starry {
        // background: darkcyan;
        background: url('//static.91wuliu.com/starry/starry-1.jpeg') no-repeat fixed;
        width: 100%;
        height: 500px;
    }
</style>
