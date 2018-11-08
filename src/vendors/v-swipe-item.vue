<template>
    <div class="v-swipe-item"
         @click="handleClick"
        :style="{backgroundImage: 'url(' + (value.formatedUrl || this.value.url) + ')', backgroundPosition: '50% 50%', backgroundRepeat: 'no-repeat', backgroundSize: 'contain'}"
    >
        <!--<img :src="value.formatedUrl || value.url">-->
    </div>
</template>
<script type="text/ecmascript-6">
    /**
     *              -- Author by Dio Zhu. on 2017.3.27
     */
    export default {
        name: 'v-swipe-item',

        directives: {},

        props: {
            value: {
                type: Object,
                default: () => { null; }
            }
        },

        data () {
            return {
            };
        },

        computed: {
        },

        watch: {
            '$route.name' (val) { // 如果使用了keep-alive，根据路由变化，判断组件的_inactive，设置isEnabled，避免事件重复触发
                if (!this._inactive) { // 激活
                    this.$logger.log('v-swipe-item.watch.in...');
                } else { // 失效
                    this.$logger.log('v-swipe-item.watch.back...');
                }
            }
        },

        created () {
            this.$logger.log('v-swipe-item.created...');
        },

        mounted () {
            this.init();
        },

        methods: {
            init () {
                this.$logger.log('v-swipe-item.init...');
            },
            handleClick () {
                this.$logger.log('v-swipe-item.handleClick...');
                // this.$router.go(-1);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-swipe-item {
        width: 100%;
        height: 100%;
        display: none;
        position: absolute;
        left: 0;
        top: 0;

        &.is-active {
            display: block;
            transform: none;
            position: absolute;
            left: 0;
            top: 0;
        }
    }
</style>
