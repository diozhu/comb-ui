<template>
    <div class="v-shade" :class="shadeWrapperClass" @click="hide"></div>
</template>
<script>
    import logger from '../js/utils/logger';

    /**
     * shade组件, 全局半透明黑色遮罩
     *              -- Author by Dio Zhu. on 2017.2.15
     */
    export default {
        name: 'v-shade',

        props: {
            id: String,
            display: {
                type: Boolean,
                default: false
            },
            classes: String     // 附加class
        },

        data () {
            return {
                displayed: false
            };
        },

        watch: {
            display () {
                this.displayed = this.display;
            }
        },

        computed: {
            shadeWrapperClass () {
                return {
                    'v-shade-wrapper': true,
                    'v-show': this.displayed
                };
            }
        },

        created () {
            logger.log('v-shade created...');
        },

        methods: {
            hide () {
                this.displayed = false;
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-shade {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 900;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .3);
    }

</style>
