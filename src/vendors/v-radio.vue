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
            <!--
            TODO: 这个会不会影响其他组件，是个问题，稍后测试下
                checked：默认选中状态
                    当服务器传递空过来的时候，不默认选中
                    Modified by 刘俊俊 2018.6.12
            -->
            <label v-for="(option, idx) in options" :key="idx"
                   v-if="!limit || idx < limit"
                   :class="[
                       {slot: $slots['slot' + idx]},
                       {reverse: reverse},
                       {checked: currentValue !== '' && (option == currentValue || option.value == currentValue || option.value == currentValue.value)},
                       {disabled: option.disabled}
                       ]"
            >
                <input type="radio"
                       class="v-radio__input"
                       v-model="currentValue"
                       :disabled="disabled"
                       :value="option.value != undefined ? option.value : option"
                >
                <div class="v-radio__label">
                    <slot :name="'slot' + idx">{{ option.label || option }}<p v-if="option.sublabel">{{option.sublabel}}</p>
                        <!-- <img v-if="give && parseFloat(option.give) === 1" src="../assets/give-icon.png" alt="赠"> -->
                        <img v-if="give && parseFloat(option.give) === 1" alt="赠" src="data:image/png;base64,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">
                    </slot>
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
            labelClasses: String, // 标题的样式
            radioClasses: String, // 选框的样式
            options: {
                type: Array,
                required: true
            },
            reverse: { // 选框的位置是否需要前置，默认在右边
                type: Boolean,
                default: false
            },
            mode: { // 是否使用标签形式: list、tags、cards
                type: String,
                default: 'list'
            },
            value: String | Number,
            limit: Number,
            disabled: {
                type: Boolean,
                default: false
            },
            give: String
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
                //                console.log('v-radio.watch.currentValue: ', val, this.$parent);
            }
        },
        methods: {
            onClick: function () {
                console.log('v-radio.onClick: ');
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
