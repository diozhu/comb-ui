<template>
    <div class="page page-weather">
        <div class="banner">
            <v-weather :value="0"></v-weather>
        </div>
    </div>
</template>

<script>
    import vWeather from '../vendors/v-weather.vue';
    export default {
        components: { vWeather },
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

    .page-weather {
        .banner {
            width: 100%;
            height: 160px;
            border: #cccccc 1px solid;
            background-color:deepskyblue;
        }
    }
</style>
