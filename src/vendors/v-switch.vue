<template>
    <label :class="['v-switch', classes]">
        <div class="v-switch__label">{{ label }}</div>
        <input type="checkbox"
               @change="$emit('change', currentValue)"
               class="v-switch__input"
               v-model="currentValue">
        <div class="v-switch__core"></div>
    </label>
</template>
<script>
    import logger from '../js/utils/logger';

    /**
     * radio组件
     * @param {string[], object[]} options - 选项数组，格式：
     *      [{label: 'label', labelSub: 'sub title', value: 'value', disabled: true}]
     *      或
     *      ['ab', 'cd', 'ef']
     *              -- Author by Dio Zhu. on 2017.1.11
     */
    export default {
        name: 'v-switch',
        props: {
            id: String,
            label: String,
            classes: String,
            options: Object,
            value: Boolean
        },
        data () {
            return {
            };
        },
        computed: {
            currentValue: {
                get () {
                    return this.value;
                },
                set (val) {
                    this.$emit('input', val);
                }
            }
        },
        methods: {
            onClick: function () {
                logger.log('v-radio.onClick: ');
                if (this.cb && typeof this.cb === 'function') {
                    this.cb();
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $line-height: pxTorem(44px);
    $line-height-double: pxTorem(64px);
    $tit-color: #000;
    $tit-color-light: #737373;
    $placeholder-color: #007AFF;
    $color-grey: #d9d9d9;
    $color-white: #FFF;
    $color-blue:#4CD864;

    .v-switch {
        position: relative;
        height: 100%;
        @include box_flex;
        @include align_items(center);
        @include justify-content(space-between);
    }
    .v-switch__label {
        height: 100%;
        font-size: pxTorem(15px);
        line-height: $line-height;
        color: $tit-color;
        padding-left: pxTorem(15px);
        @include flex_grow(0);
        @include flex_shrink(0);
        @include flex_basis(auto);

        &.light {
            color: $tit-color-light;
        }
    }
    .v-switch__input {
        display: none;

        &:checked {
            + .v-switch__core {
                border-color: $color-blue;
                background-color: $color-blue;

                &::before {
                    transform: scale(0);
                }

                &::after {
                    transform: translateX(pxTorem(20px));
                }
            }
        }
    }
    .v-switch__core {
        margin-right: pxTorem(15px);

        display: inline-block;
        position: relative;
        width: pxTorem(52px);
        height: pxTorem(32px);
        border: pxTorem(1px) solid #d9d9d9;
        border-radius: pxTorem(16px);
        box-sizing: border-box;
        background: #FFF;

        @include flex_grow(0);
        @include flex_shrink(0);
        @include flex_basis(auto);

        &::before, &::after {
            content: " ";
            top: 0;
            left: 0;
            position: absolute;
            -webkit-transition: transform .3s;
            -moz-transition: transform .3s;
            -ms-transition: transform .3s;
            -o-transition: transform .3s;
            transition: transform .3s;
            border-radius: pxTorem(15px);
        }
        &::after {
            width: pxTorem(30px);
            height: pxTorem(30px);
            size: pxTorem(30px);
            background-color: $color-white;
            /*box-shadow: 0 pxTorem(1px) pxTorem(3px) rgba(0, 0, 0, .4);*/

            border: 1px solid rgba(0,0,0,0.10);

            -webkit-box-shadow: 0px pxTorem(3px) pxTorem(1px) 0px rgba(0,0,0,0.05), 0px pxTorem(2px) pxTorem(2px) 0px rgba(0,0,0,0.10), 0px pxTorem(3px) pxTorem(3px) 0px rgba(0,0,0,0.05);
            -moz-box-shadow: 0px pxTorem(3px) pxTorem(1px) 0px rgba(0,0,0,0.05), 0px pxTorem(2px) pxTorem(2px) 0px rgba(0,0,0,0.10), 0px pxTorem(3px) pxTorem(3px) 0px rgba(0,0,0,0.05);
            box-shadow: 0px pxTorem(3px) pxTorem(1px) 0px rgba(0,0,0,0.05), 0px pxTorem(2px) pxTorem(2px) 0px rgba(0,0,0,0.10), 0px pxTorem(3px) pxTorem(3px) 0px rgba(0,0,0,0.05);
        }

        &::before {
            size: pxTorem(50px) pxTorem(30px);
            background-color: #fdfdfd;
        }
    }

</style>
