<template>
    <div class="v-msgbox-wrapper">
        <transition name="msgbox-bounce">
            <!-- @touchstart.stop  -->
            <div class="v-msgbox" v-show="value" @touchmove.stop.prevent @touchend.stop>
                <div class="v-msgbox-header" v-if="title !== ''">
                    <div class="v-msgbox-title">{{ title }}</div>
                </div>
                <div class="v-msgbox-content" v-if="message !== ''">
                    <div :class="['v-msgbox-message', {mutil: message.length > 20}]" v-html="message"></div>
                    <div class="v-msgbox-input" v-show="showInput">
                        <input v-model="inputValue" :placeholder="inputPlaceholder" ref="input">
                        <div class="v-msgbox-errormsg" v-if="!!editorErrorMessage">{{ editorErrorMessage }}</div>
                    </div>
                </div>
                <div class="v-msgbox-btns">
                    <button :class="[ cancelButtonClasses ]" v-show="showCancelButton" @click="handleAction('cancel')">{{ cancelButtonText }}</button>
                    <button :class="[ confirmButtonClasses ]" v-show="showConfirmButton" @click="handleAction('confirm')">{{ confirmButtonText }}</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import Popup from '../js/utils/popup';

    let CONFIRM_TEXT = '确定',
        CANCEL_TEXT = '取消';

    export default {
        mixins: [ Popup ],

        props: {
            modal: {
                default: true
            },
            showClose: {
                type: Boolean,
                default: true
            },
            lockScroll: {
                type: Boolean,
                default: false
            },
            closeOnClickModal: {
                default: true
            },
            closeOnPressEscape: {
                default: true
            },
            inputType: {
                type: String,
                default: 'text'
            }
        },
        data () {
            return {
                title: '',
                message: '',
                type: '',
                showInput: false,
                inputValue: null,
                inputPlaceholder: '',
                inputPattern: null,
                inputValidator: null,
                inputErrorMessage: '',
                showConfirmButton: true,
                showCancelButton: false,
                confirmButtonText: CONFIRM_TEXT,
                cancelButtonText: CANCEL_TEXT,
                confirmButtonClass: '',
                confirmButtonDisabled: false,
                cancelButtonClass: '',
                editorErrorMessage: null,
                callback: null
            };
        },

        computed: {
            confirmButtonClasses () {
                let classes = 'v-msgbox-btn v-msgbox-confirm ' + this.confirmButtonClass;
                if (this.confirmButtonHighlight) {
                    classes += ' v-msgbox-confirm-highlight';
                }
                return classes;
            },
            cancelButtonClasses () {
                let classes = 'v-msgbox-btn v-msgbox-cancel ' + this.cancelButtonClass;
                if (this.cancelButtonHighlight) {
                    classes += ' v-msgbox-cancel-highlight';
                }
                return classes;
            }
        },

        watch: {
            inputValue () {
                if (this.$type === 'prompt') {
                    this.validate();
                }
            },

            value (val) {
                this.handleInputType(this.inputType);
                if (val && this.$type === 'prompt') {
                    setTimeout(() => {
                        if (this.$refs.input) {
                            this.$refs.input.focus();
                        }
                    }, 500);
                }
            },

            inputType (val) {
                this.handleInputType(val);
            },

            '$route.name' (val) {
                this.$logger.log(`v-message.${this._uid}.watch: $route!!!`, val, this._inactive, this.$router.direct());
                this.$nextTick(() => {
                    this.$logger.log(`v-message.${this._uid}.watch: $route!!!`, val, this._inactive, this.$router.direct());
                    if (!this._inactive) { // 激活时重新加载
//                        this.isEnabled = this.enabled;
//                        if (this.$router.direct()) { // in
//                            this.init(); // 如果当前页面是keep-alive的，这里重新初始化
//                        } else { // back
//                            // do nothing ...
//                        }
                    } else {
//                        this.isEnabled = false;
                    }
                });
            }
        },

        mounted () {
            this.$logger.log(`v-message.${this._uid}.mounted: `, this.message);
        },

        methods: {
            doClose () {
                this.value = false;
                this._closing = true;

                this.onClose && this.onClose();

                setTimeout(() => {
                    if (this.modal && this.bodyOverflow !== 'hidden') {
                        document.body.style.overflow = this.bodyOverflow;
                        document.body.style.paddingRight = this.bodyPaddingRight;
                    }
                    this.bodyOverflow = null;
                    this.bodyPaddingRight = null;
                }, 200);
                this.opened = false;

                if (!this.transition) {
                    this.doAfterClose();
                }
            },

            handleAction (action) {
                if (this.$type === 'prompt' && action === 'confirm' && !this.validate()) {
                    return;
                }
                var callback = this.callback;
                this.value = false;
                callback(action);
            },

            validate () {
                if (this.$type === 'prompt') {
                    let inputPattern = this.inputPattern,
                        inputValidator = this.inputValidator;
                    if (inputPattern && !inputPattern.test(this.inputValue || '')) {
                        this.editorErrorMessage = this.inputErrorMessage || '输入的数据不合法!';
                        this.$refs.input.classList.add('invalid');
                        return false;
                    }
                    if (typeof inputValidator === 'function') {
                        let validateResult = inputValidator(this.inputValue);
                        if (validateResult === false) {
                            this.editorErrorMessage = this.inputErrorMessage || '输入的数据不合法!';
                            this.$refs.input.classList.add('invalid');
                            return false;
                        }
                        if (typeof validateResult === 'string') {
                            this.editorErrorMessage = validateResult;
                            return false;
                        }
                    }
                }
                this.editorErrorMessage = '';
                this.$refs.input.classList.remove('invalid');
                return true;
            },

            handleInputType (val) {
                if (val === 'range' || !this.$refs.input) return;
                this.$refs.input.type = val;
            }
        }

    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";
    @import "../scss/_mixins";
    @import "../scss/_popup";

    .v-msgbox{
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate3d(-50%, -50%, 0);
        transform: translate3d(-50%, -50%, 0);
        background-color: #fff;
        width: pxTorem(270px);
        border-radius: pxTorem(12px);
        font-size: pxTorem(16px);
        -webkit-user-select: none;
        overflow: hidden;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transition: .2s;
        transition: .2s;

        padding: pxTorem(9px) 0 0;

        box-shadow: pxTorem(1px) pxTorem(1px) pxTorem(5px) 0 #8c8c8c;
    }

    .v-msgbox-header {
        padding: pxTorem(15px) 0 0;
    }
    .v-msgbox-content {
        padding: pxTorem(15px) pxTorem(15px) 0 ;
        /*min-height: pxTorem(36px);*/
        position: relative;
    }
    .v-msgbox-input {
        padding-top: pxTorem(15px);

        input {
            border: 1px solid #F5F5F5;
            border-radius: pxTorem(5px);
            padding: pxTorem(4px) pxTorem(5px);
            width: 100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            outline: none;
            @include placeholder-color(#C7C7CD); // 指定所有placeholder颜色，指定后，focus无法去除placeholder，只有输入后才会清除。 Author by Dio Zhu. on 2017.2.7

            &.invalid {
                border-color: #ff4949;
                &:focus {
                    border-color: #ff4949;
                }
            }
        }
    }

    .v-msgbox-errormsg {
        color: red;
        font-size: pxTorem(12px);
        min-height: pxTorem(18px);
        margin-top: pxTorem(2px);
    }
    .v-msgbox-title {
        text-align: center;
        padding: 0 pxTorem(7px);
        margin-bottom: 0;
        font-size: pxTorem(17px);
        line-height: pxTorem(22px);
        color: #030303;
        white-space: pre-wrap; // 可处理`符带的折行，请注意折行后要去除前面的空格，具体参考样例！  Author by Dio Zhu. on 2017.2.7
    }
    .v-msgbox-message {
        color: #030303;
        margin: 0;
        text-align: center;
        font-size: pxTorem(13px);
        line-height: 1.2;
        &.mutil{
            text-align: left;
        }
    }
    .v-msgbox-btns {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        height: pxTorem(43px);
        line-height: pxTorem(43px);
        margin-top: pxTorem(20px);
        border-top: 1px solid #BCBCBC;
    }
    .v-msgbox-btn {
        line-height: pxTorem(35px);
        display: block;
        background-color: #fff;
        -webkit-box-flex: 1;
        -ms-flex: 1;
        flex: 1;
        margin: 0;
        border: 0;
        font-size: pxTorem(17px);

        &:focus {
            outline: none;
        }

        &:active {
            background-color: #fff;
        }
    }
    .v-msgbox-cancel {
        width: 50%;
        border-right: 1px solid #BCBCBC;
        color: #007AFF;

        &:active {
            color: #000;
        }
    }
    .v-msgbox-confirm {
        color: #007AFF;
        width: 50%;

        &:active {
            color: #26a2ff;
        }
    }
    .msgbox-bounce-enter {
        opacity: 0;
        -webkit-transform: translate3d(-50%, -50%, 0) scale(0.7);
        transform: translate3d(-50%, -50%, 0) scale(0.7);
    }
    .msgbox-bounce-leave-active {
        opacity: 0;
        -webkit-transform: translate3d(-50%, -50%, 0) scale(0.9);
        transform: translate3d(-50%, -50%, 0) scale(0.9);
    }

</style>
