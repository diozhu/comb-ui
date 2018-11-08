<template>
    <div class="v-radiolist" @change="$emit('change', currentValue)" :class="[{tag: mode === 'tag'}]">
        <label class="v-radiolist-title" v-text="title" v-if="title"></label>
        <a v-for="(option, index) in options" class="v-radiolist-wrapper">
            <div class="v-radiolist-label">
                  <input
                      :id="'vRadio'+'_'+_uid+'_'+index"
                      class="v-radio-input"
                      type="radio"
                      v-model="currentValue"
                      :disabled="option.disabled"
                      :value="option.value || option">
                <label class="v-radio__core" :for="'vRadio'+'_'+_uid+'_'+index" v-text="option.label || option"></label>
            </div>
        </a>
    </div>
</template>
<script>
    import logger from '../js/utils/logger';

    /**
     * radio-tag组件
     * @param {string[], object[]} options - 选项数组，格式：
     *      [{label: 'label', labelSub: 'sub title', value: 'value', disabled: true}]
     *      或
     *      ['ab', 'cd', 'ef']
     *              -- Author by Dio Zhu. on 2017.2.21
     */
    export default {
        name: 'v-radio-tag',

        props: {
            title: String,
            align: String,
            options: {
                type: Array,
                required: true
            },
            mode: String,
            value: String
        },

        data () {
            return {
                currentValue: this.value
            };
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.$emit('input', val);
                logger.log('v-radio.watch.currentValue: ', val, this._uid);
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

    .v-radiolist {
        .v-radiolist-wrapper {
            /*min-height: pxTorem(40px);*/

            background-color: #fff;
            box-sizing: border-box;
            color: inherit;
            display: block;
            overflow: hidden;
            position: relative;
            text-decoration: none;

            @include box-flex;
            @include align_items(center);
        }

        .mint-cell {
            padding: 0;
        }
        .v-radiolist-label {
            width: 100%;
            display: block;
            padding: 0 pxTorem(15px);
        }
        .v-radiolist-title {
            font-size: pxTorem(15px);
            margin: pxTorem(8px);
            display: block;
            color: #888;
        }
        .v-radio {
            display: inline;
        }
        .v-radio.is-right {
            float: right;
        }
        .v-radio-label {
            vertical-align: middle;
            margin-left: pxTorem(15px);
            font-size: pxTorem(15px);
        }
        .v-radio-input {
            display: none;
        }
        .v-radio-input:checked + .v-radio-core {
            background-color: #26a2ff;
            border-color: #26a2ff;
        }
        .v-radio-input:checked + .v-radio-core::after {
            background-color: #fff;
            -webkit-transform: scale(1);
            transform: scale(1);
        }
        .v-radio-input[disabled] + .v-radio-core {
            background-color: #d9d9d9;
            border-color: #ccc;
        }
        .v-radio-core {
            display: inline-block;
            background-color: #fff;
            border-radius: 100%;
            border: pxTorem(1px) solid #ccc;
            position: relative;
            width: pxTorem(20px);
            height: pxTorem(20px);
            vertical-align: middle;
        }
        .v-radio-core::after {
            content: " ";
            border-radius: 100%;
            top: pxTorem(5px);
            left: pxTorem(5px);
            position: absolute;
            width: pxTorem(8px);
            height: pxTorem(8px);
            -webkit-transition: -webkit-transform .2s;
            transition: -webkit-transform .2s;
            transition: transform .2s;
            transition: transform .2s, -webkit-transform .2s;
            -webkit-transform: scale(0);
            transform: scale(0);
        }

        &.tag {
            /*margin: 0 pxTorem(15px);*/

            @include box_flex;
            @include align_items(center);
            @include justify-content(space-around);
            @include flex-direction-row;
            flex-wrap: wrap;

            .v-radiolist-wrapper {
                margin-top: pxTorem(10px);

                .v-radiolist-label {
                    width: pxTorem(85px);
                    height: pxTorem(30px);
                    padding: 0;
                    font-size: pxTorem(13px);
                    line-height: pxTorem(30px);
                    text-align: center;
                    /*border: #F55151 pxTorem(1px) solid;*/
                    /*color: #F55151;*/
                }
            }

            .v-radio__core {
                width: 100%;
                height: 100%;
                padding: 0;
                text-align: center;
                border: #F55151 pxTorem(1px) solid;
                font-size: pxTorem(15px);
                color: #F55151;
                position: absolute;
                left: 0;
                top: 0;
            }

            .v-radio-input:checked + .v-radio__core {
                background-color: #F55151;
                border-color: #F55151;
                color: #FFF;
            }

            .v-radio {
                width: 0;
                height: 0;

                .v-radio-core {
                    width: 0;
                    height: 0;
                }

            }
        }
    }
</style>
