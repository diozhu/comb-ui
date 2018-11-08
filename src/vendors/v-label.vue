<template>
    <div class="v-label">
        <i v-if="options.delable" :class="['v-label__icon', 'icon icon-del disc']" @click="$emit('delFunc', id, $event)"></i>
        <i v-if="options.iconClass" :class="['v-label__icon', options.iconClass]"></i>
        <div v-if="options && options.label" :class="['v-label__tit', options.labelClass]">{{ options.label }}</div>
        <div class="v-label__con">
            <p :id="id" :class="[{holder: !value}, options.descrClass]">{{ value? value: options.descr }}</p>
            <i v-if="cb" class="icon app icon-arrow-r v-label__arrow"></i>
        </div>
    </div>
</template>
<script>
//    import logger from '../js/utils/logger';

    /**
     * 标签（label）
     * 关于删除功能：
     *      须传入：options.delable=true，启用删除功能；
     *      须传入：id，触发函数会返回这个id作为唯一标示；
     *      须定义：调用组件的时候，使用@delFunc（函数名随意）方式接收组件$emit出去的消息；
     *      返回值：id、$event
     *          -- Author by Dio Zhu. on 2017.1.12
     */
    export default {
        props: {
            id: String,
            value: String,
            options: Object,
            cb: Function
        },
        data () {
            return {
            };
        },
        methods: {
//            onClick: function () {
//                logger.log('v-label.onClick: ');
//                if (this.cb && typeof this.cb === 'function') {
//                    this.cb();
//                }
//            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $line-height: pxTorem(44px);
    $tit-color: #000;
    $tit-color-light: #737373;
    $placeholder-color: #007AFF;

    .v-label {
        position: relative;
        height: 100%;
        margin-left: pxTorem(15px);
        @include box_flex;
        @include align_items(center);
        @include justify-content(space-between);
    }
    .v-label__icon {
        width: pxTorem(26px);
        height: pxTorem(26px);
        font-size: pxTorem(14px);
        line-height: pxTorem(26px);
        background: #007AFF;
        color: #FFF;
        text-align: center;
        margin-right: pxTorem(15px);

        &[class*='del'].disc {
            color: red;
            background: transparent;
            -webkit-border-radius: 50%;
            -moz-border-radius: 50%;
            border-radius: 50%;
            font-size: pxTorem(23px);
        }

        &.light {
            background: transparent;
            color: #C7C7CC;
            font-size: pxTorem(23px);
        }

        &.right {
            order: 9;
        }
    }
    .v-label__tit{
        height: 100%;
        font-size: pxTorem(15px);
        line-height: $line-height;
        color: $tit-color;
        @include flex_grow(0);
        @include flex_shrink(0);
        @include flex_basis(auto);

        &.light {
            color: $tit-color-light;
        }
        &.smaller {
            font-size: pxTorem(14px);
        }
        &.bigger {
            font-size: pxTorem(16px);
        }
        &.weighter {
            font-weight: bold;
        }

    }
    .v-label__con{
        margin-left: pxTorem(5px);
        margin-right: pxTorem(30px);
        overflow: hidden;
        @include flex_grow(1);
        @include flex_shrink(1);
        @include flex_basis(auto);

        >p{
            height: $line-height;
            line-height: $line-height;
            font-size: pxTorem(15px);
            color: #000;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;

            &.holder {
                color: #737373;
            }

            &.right {
                text-align: right;
            }
        }
    }

    .v-label__arrow {
        position: absolute;
        color: #ccc;
        font-size: pxTorem(14px);
        margin-top: pxTorem(-7px);
        right: pxTorem(10px);
        top:50%;
    }

</style>
