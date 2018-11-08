<template>
    <!--:class="[-->
    <!--{list: mode === 'list'},-->
    <!--{cards: mode === 'cards'},-->
    <!--{tags: mode === 'tags'}]"-->
    <dl class="v-radio"
        :class="[mode]"
        @change="$emit('change', currentValue)"
    >
        <dt class="v-radio__title" v-if="label" :class="[labelClasses]">{{ label }}</dt>
        <!--<dd class="v-radio__value" :class="[{'m-l': !label}]">-->
        <dd class="v-radio__value">
            <label v-for="(option, idx) in options"
                   v-if="!limit || idx < limit"
                   :class="[
                       {slot: $slots['slot' + idx]},
                       {reverse: reverse},
                       {checked:  option == currentValue || option.value == currentValue || option.value == currentValue.value},
                       {disabled: option.disabled}
                       ]"
            >
                <input type="radio"
                       class="v-radio__input"
                       v-model="currentValue"
                       :disabled="option.disabled"
                       :value="option.value != undefined ? option.value : option"
                >
                <div class="v-radio__label">
                    <slot :name="'slot' + idx">{{ option.label || option }}<p v-if="option.sublabel">{{option.sublabel}}</p></slot>
                    <!--<slot :name="'slot' + idx"><span>{{ option.label || option }}</span></slot>-->
                    <slot :name="'link' + idx"></slot>
                </div>
                <i v-if="mode != 'tags'"
                   class="v-radio__icon icon icon-check" :class="[radioClasses, {right: reverse}]"></i>
            </label>
        </dd>
    </dl>
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
     * 修改input的value绑定条件，如果值是0，以前的逻辑不识别。。。
     *              -- Author by Dio Zhu. on 2018.5.16
     */
    export default {
        name: 'v-radio',
        props: {
            id: String,
            label: String,
            labelClasses: String,   // 标题的样式
            radioClasses: String,   // 选框的样式
            options: {
                type: Array,
                required: true
            },
            reverse: {              // 选框的位置是否需要前置，默认在右边
                type: Boolean,
                default: false
            },
            mode: {             // 是否使用标签形式: list、tags、cards
                type: String,
                default: 'list'
            },
            value: String | Number,
            limit: Number
        },
        data () {
            return {
                currentValue: this.value,
                className: this.classes
            };
        },
        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.$emit('input', val);
//                logger.log('v-radio.watch.currentValue: ', val, this.$parent);
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

    $line-height: pxTorem(41px);
    $line-height-double: pxTorem(64px);
    $tit-color: #000;
    $tit-color-light: #737373;
    $placeholder-color: #007AFF;
    $color-white: #FFF;
    $icon-color: #007AFF;

    .v-radio {
        position: relative;
        // height: 100%;
        /*@include box_flex;
        @include align_items(center);
        @include justify-content(space-between);
        @include flex-direction-column();*/
        display: flex;
        align-items: stretch;
        justify-content: space-between;
        flex-direction: row;

        dt, dd {
            display: block;
        }
        dt {
            width: 24%;
            flex-grow: 0;
            flex-shrink: 0;
            flex-basis: auto;
            display: flex;
            align-items: center;
        }
        dd {
            width: 76%;
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: auto;
            /*display: flex;*/
            /*align-items: flex-start;*/
            /*justify-content: space-between;*/
            /*flex-direction: column;*/

            .icon {
                /*display: none;*/
                color: transparent;
                /*order: -1;*/

                &.right {
                    order: 9;
                }

                &.disk {
                    width: pxTorem(20);
                    height: pxTorem(20);
                    text-align: center;
                    font-size: pxTorem(16);
                    font-weight: 700;
                    line-height: pxTorem(20);
                    color: transparent;
                    background: transparent;
                    border: #D2D2D2 pxTorem(1) solid;
                    margin-top: pxTorem(-1);
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                }
            }

        }
    }

    .v-radio {

        &.list, &.cards {

            label {
                /*flex-grow: 1;*/
                /*flex-shrink: 1;*/
                /*flex-basis: auto;*/
                display: flex;
                align-items: center;
                justify-content: flex-start;

                &.reverse {

                    .icon {
                        order: -1;
                    }
                }

                .v-radio__label {
                    flex-grow: 1;
                    flex-shrink: 1;
                    flex-basis: auto;
                    display: flex;
                    justify-content: center;
                    flex-direction: column;

                    p {
                        line-height: 1;
                        margin-top: pxTorem(5px);
                    }
                }

                .v-radio__icon {
                    flex-grow: 0;
                    flex-shrink: 0;
                    flex-basis: auto;
                }

                .v-radio__input:checked ~ .v-radio__icon {
                    /*display: block;*/
                    color: #7ED321;

                    &.disk {
                        color: #FFF;
                        background: #7ED321;
                        border: #7ED321 pxTorem(1) solid;
                    }

                    &::after {
                        border-color: $color-white;
                        transform: rotate(45deg) scale(1);
                    }
                }

            }
        }

        &.tags {
            dd {
                padding: 0;
                margin: pxTorem(15px) 0 0 pxTorem(15px);
                display: flex;
                align-items: center;
                justify-content: flex-start;
                flex-wrap: wrap;
            }

            label {
                margin: 0 pxTorem(5px) pxTorem(5px) 0;
                flex-grow: 0;
                flex-shrink: 0;
                flex-basis: auto;
                display: flex;
                align-items: center;
                justify-content: flex-start;

                .v-radio__label {
                    min-height: pxTorem(30px);
                    border: #F55151 pxTorem(1px) solid;
                    font-size: pxTorem(15px);
                    color: #F55151;
                    padding: 0 pxTorem(15px);
                    box-sizing: border-box;

                    flex-grow: 0;
                    flex-shrink: 0;
                    flex-basis: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .v-radio__input:checked ~ .v-radio__label {
                    /*display: block;*/
                    background: #F55151;
                    color: #FFF;

                    &::after {
                        border-color: $color-white;
                        transform: rotate(45deg) scale(1);
                    }
                }
            }
        }

        &.cards {

            label {
                background: #F8F9F8;
                border-radius: pxTorem(6);
                margin: 0 0 pxTorem(5) 0;

                .v-radio__label {
                    padding: 0 pxTorem(15px);
                    font-weight: 700;
                }
            }
        }

        &.horizontal {
            dd {
                display: flex;
                flex-direction: row;
            }
            .v-radio__icon {
                margin: 0 pxTorem(12);
            }
        }
    }

    .v-radio.cards {

        .disabled {
            .v-radio__label, .v-radio__icon { opacity: .3; }
        }
    }

    .v-radio__title {
        margin-left: pxTorem(15px);
        font-size: pxTorem(15px);
    }
    .v-radio__value {
        /*padding: pxTorem(15px) pxTorem(6px) pxTorem(6px);*/
    }
    .v-radio__label {
        min-height: $line-height;
        /*line-height: $line-height;*/
        font-size: pxTorem(14px);
    }
    .v-radio__icon {
        margin-right: pxTorem(13px);
        font-size: pxTorem(20px);
        color: #007AFF;

        &.icon-check {
            font-size: pxTorem(15px);
        }
        &.show {
            display: block;
        }
    }

</style>
