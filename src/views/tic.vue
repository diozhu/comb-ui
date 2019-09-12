<template>
    <div class="page page-toast">
        <v-tic v-model="list"></v-tic>
    </div>
</template>

<script>
    import vTic from '../vendors/v-tic.vue';
    export default {
        components: { vTic },
        data () {
            return {
                list: []
            };
        },
        created () {
            this.init();
        },
        methods: {
            init () {
                this.list = [];
                for(let i = 1;i<=19800;i++) {
                    this.list.push(i);
                }
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";

    .page-toast {

    }
</style>
