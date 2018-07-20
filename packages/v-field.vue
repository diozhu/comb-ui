<template>
    <!--<div class="v-field">-->
    <!--<div v-if="label" class="v-field__tit">{{label}}</div>-->
    <!--<textarea-->
    <!--@change="$emit('change', currentValue)"-->
    <!--ref="textarea"-->
    <!--class="v-field__textarea"-->
    <!--:placeholder="placeholder"-->
    <!--:rows="rows"-->
    <!--:disabled="disabled"-->
    <!--:readonly="readonly"-->
    <!--v-model="currentValue"></textarea>-->
    <!--<div v-if="limit" class="v-field__limit">{{len || 0}}/{{limit}}</div>-->
    <!--</div>-->
    <v-cell
        class="v-field"
        :class="[{'has-limit': type === 'textarea' && limit}]"
        :title="title"
        :isLink="isLink"
        v-clickoutside="doCloseActive"
    >
        <textarea v-if="type === 'textarea'"
                  ref="textarea"
                  class="v-field__core textarea"
                  :placeholder="placeholder"
                  :rows="rows"
                  :disabled="disabled"
                  :readonly="readonly"
                  v-model="currentValue"
                  @change="$emit('change', currentValue)"
                  :field="field"
                  v-validator="validator"
        ></textarea>
        <slot name="after" class="multi-after"></slot>
        <div v-if="type === 'textarea' && limit"
             class="v-field__limit"
             :class="{'alarm': currentValue.length && alarm && limit && limit - currentValue.length < alarm}"
        >
            {{currentValue.length || 0}}/{{limit}}
        </div>
        <input v-if="type !== 'textarea'"
               ref="input"
               :type="type === 'mobile' ? 'tel' : type"
               :number="type === 'number'"
               class="v-field__core input"
               :class="[
                   state
               ]"
               :placeholder="placeholder"
               :disabled="disabled"
               :readonly="readonly"
               :value="currentValue"
               @input="handleInput"
               @focus="active = true, state = ''"
               @change="$emit('change', currentValue)"
               :field="field"
               v-validator="validator"
        />
        <i v-if="clearEnable"
           v-show="type !== 'textarea' && active"
           class="icon icon-error"
           @click="handleClear"
        ></i>
        <slot name="right"></slot>
    </v-cell>
</template>
<script>
import vCell from './v-cell.vue';
import clickoutside from '../src/utils/clickoutside';
import * as utils from '../src/utils/utils';
import Vue from 'vue';
import Validator from './v-validator.js';

Vue.use(Validator);

export default {
    name: 'v-field',

    components: {vCell},
    directives: {clickoutside},
    props: {
        value: String,          // 绑定表单输入值
        type: {                 // field类型
            type: String,
            default: 'text'
        },
        title: String,          // 标题
        clearEnable: {          // 是否显示最后的清除图标
            type: Boolean,
            default: true
        },
        validateable: {            // 是否开启校验，针对type为email、tel
            type: Boolean,
            default: true
        },
        rows: String,           // 类型为 textarea 时可指定高度（显示行数）
        // label: String,          // 标签
        placeholder: String,    // 占位内容
        readonly: Boolean,
        disabled: Boolean,
        attr: Object,           // 设置原生属性，例如 :attr="{ maxlength: 10 }"
        limit: Number,           // 字数限制
        alarm: Number,           // 字数最后几个字改变样式
        isLink: Boolean,        // 右侧箭头图标显示
        field: String, // validator 标识
        validator: Object       // validator 数据
    },

    data () {
        return {
            imeFlag: false, // 输入框状态(IME)，根据onCompositionStart、onCompositionEnd方法获取，用于中文状态判断字数
            state: '',      // 当前表单状态提示：接收：warning、error、success

            active: false,
            currentValue: this.value,
            len: 0,
            old: ''
        };
    },

    watch: {
        value (val) {
            this.currentValue = val;
        },

        currentValue (val) {
            this.len = val ? val.length : 0;
            // if (this.limit && this.len > this.limit) {
            //     this.currentValue = val.substr(0, this.limit);
            //     return;
            // }
            if (this.limit && this.len > this.limit) {
                this.currentValue = this.old;
                return;
            }
            this.old = this.currentValue;
            this.$emit('input', val);
        },

        attr: {
            immediate: true,
            handler (attrs) {
                this.$nextTick(() => {
                    const target = [this.$refs.input, this.$refs.textarea];
                    target.forEach(el => {
                        if (!el || !attrs) return;
                        Object.keys(attrs).map(name => el.setAttribute(name, attrs[name]));
                    });
                });
            }
        }
    },

    methods: {
        doCloseActive () {
            this.active = false;
        },

        handleClear () {
            if (this.disabled || this.readonly) return;
            this.currentValue = '';
            this.$refs.input.focus();
        },

        handleInput (e) {
            this.currentValue = e.target.value;

            /**
             * validateable校验
             *              -- Author By Dio Zhu. on 2017.5.10
             */
            if (this.validateable && this.type === 'email') {
                this.state = utils.validateEmail(this.currentValue) ? 'success' : 'error';
            } else if (this.validateable && this.type === 'tel') { // 座机 || 手机
                this.state = (utils.validateTel(this.currentValue) || utils.validateMobile(this.currentValue)) ? 'success' : 'error';
            } else if (this.validateable && this.type === 'mobile') { // 手机
                this.state = utils.validateMobile(this.currentValue) ? 'success' : 'error';
            }
        }

    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    .v-field {
        display: block;
        input {
            opacity: 1;
        }
        /*统一颜色*/
        input,
        textarea {
            &::-webkit-input-placeholder { /* WebKit browsers */
                color: #bebebe;
                font-size: pxTorem(14px);
            }
        }

        .icon.icon-error {
            background: #b2b2b2;
            color: #FFF;
            border-radius: 50%;
            padding: pxTorem(2px);
            font-size: pxTorem(14px);
            opacity: .7;
        }
    }

    .v-field__tit {
        width: 100%;
        height: pxTorem(44px);
        font-size: pxTorem(15px);
        line-height: pxTorem(44px);
        margin-left: pxTorem(15px);
        border-bottom: #DDDEE3 pxTorem(1px) solid;
    }

    .v-field__core {

        &.textarea {
            width: 100%;
            min-height: pxTorem(100px);
            appearance: none;
            overflow: auto;
            resize: none;
            vertical-align: top;
            display: block;
            background: #FFF;
            padding: pxTorem(15px) 0;
            font-size: pxTorem(15px);
            line-height: pxTorem(22px);
        }

        &.input {
            width: 100%;
            height: 100%;
            font-size: pxTorem(15px);
            padding-right: pxTorem(15px);
        }
    }

    .has-limit {
        .v-cell__value {
            padding-bottom: pxTorem(33px);
        }
    }

    .v-field__limit {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: pxTorem(14px);
        color: #777E8C;
        text-align: right;
        padding: pxTorem(10px) pxTorem(15px);
    }

    .limit-outer .v-field__limit {
        background: transparent;
        border-top: #DDDEE3 pxTorem(1px) solid;
    }

    .v-field.multi {

        .v-cell__value {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            > div {
                padding: pxTorem(10) pxTorem(10) 0 pxTorem(10);
                font-size: pxTorem(14);
                color: #000;
            }
        }
    }
</style>
