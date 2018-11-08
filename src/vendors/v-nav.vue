<template>
    <div class="v-nav" v-if="value.length >= min">
        <div class="v-nav__item" v-for="(obj, idx) in value" @click="onClick(obj)">
            <!--{{ idx > 0 ? '>' : '' }}-->
            {{ obj.label }}
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    /**
     * nav组件
     *              -- Author by Dio Zhu. on 2017.5.5
     */
    export default {
        name: 'v-nav',

        props: {
            value: Array,
            min: {  // 最小显示个数
                type: Number,
                default: 1
            }
        },

        data () {
            return {
            };
        },

        computed: {
        },

        created () {
            this.$logger.log('v-nav.created...');
        },

        methods: {
            onClick (obj) {
                this.$emit('handleClick', obj);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-nav {
        min-height: pxTorem(36px);
        padding: 0 pxTorem(15px);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .v-nav__item {
        /*display: inline-block;*/
        position: relative;
        padding-right: pxTorem(12px);
        font-size: pxTorem(15px);
        line-height: 1.4;

        &::after {
            border: solid pxTorem(1px) #898989;
            border-bottom-width: 0;
            border-left-width: 0;
            content: " ";
            top:50%;
            right:pxTorem(5px);
            position: absolute;
            width: pxTorem(7px);
            height: pxTorem(7px);
            -webkit-transform: translateY(-50%) rotate(45deg);
            transform: translateY(-50%) rotate(45deg);
        }
    }
</style>
