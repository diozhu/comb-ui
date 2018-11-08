<template>
    <div :class="classStyle">
        <div class="v-search">
            <div class="v-search__bar">
                <!--<label :for="'vSearch'+'_'+_uid" class="v-search__frm" ref="frm" :autofocus="autofocus" @click.stop="onClick">-->
                <label class="v-search__frm" ref="frm" @click.stop="onClick">
                    <!--@focus="onFocus"-->
                    <input
                        type="search"
                        :id="'vSearch'+'_'+_uid"
                        :autofocus="autofocus"
                        ref="input"
                        :value="currentValue"
                        :placeholder="!visible? placeholder: ''"
                        @input="onInput"
                        @compositionstart="onCcompositionStart"
                        @compositionend="onCompositionEnd"
                        @blur="onBlur"
                        @keyup.enter="onEnter"
                        v-focus="visible"
                    >
                    <i class="icon icon-search"></i>
                    <i class="icon icon-error" v-show="visible" @click="visible = false, currentValue = ''"></i>
                </label>
                <a
                    class="v-search__bar_cancel"
                    @click="goBackFunc"
                    v-show="visible"
                    v-text="cancelText">
                </a>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import vField from '../vendor/v-field.vue';
    import Vue from 'vue';
    import vFocus from '../vendor/v-focus.js';
    Vue.use(vFocus);

    /**
     *
     *              -- Author by Dio Zhu. on 2017.1.11
     */
    export default {
        name: 'v-search',
        components: { vField },

        props: {
            id: String,
            value: String,
            autofocus: {
                type: Boolean,
                default: false
            },
            cancelText: {
                default: '取消'
            },
            placeholder: {
                default: '搜索'
            },
            result: Array,
            classStyle: {
                default: 'v-search-style-1'
            }
        },
        data () {
            return {
                visible: false,
                currentValue: this.value,
                isLock: false
            };
        },

        watch: {
            value (val) {
                this.$logger.log(`v-search.watch.value: ${val}`);
                this.currentValue = val;
            },

            currentValue (val) {
                this.$logger.log(`v-search.watch.currentValue: ${val}`);
                this.$emit('input', val);
            },

            visible (val) {
                this.$logger.log(`v-search.watch.visible: ${val}`);
//                this.currentValue = '';
//                if (val) this.$refs.input.focus(); // use v-focus
            }
        },

        activated () {
//            this.autofocus && this.$refs.input.focus();
            this.$logger.log('v-search.activated!');
            if (this.autofocus) {
                this.visible = true;
//                this.$refs.input.focus();
//                this.$nextTick(() => {  // use v-focus
//                    this.$refs.input.focus();
//                });
            }
        },

        mounted () {
            this.$logger.log('v-search.mounted!');
//            this.autofocus && this.$refs.input.focus();
            if (this.autofocus) {
                this.visible = true;
//                this.$refs.input.focus();
//                this.$nextTick(() => { // use v-focus
//                    this.$refs.input.focus();
//                });
            }
        },

        methods: {
            searchFocus () {
                this.visible = true;
                this.$logger.log('v-search.searchFocus: ', this.visible, this.placeholder);
            },
            onClick () {
                this.$logger.log('v-search.onClick: ');
                this.visible = true;
//                this.$refs.input.focus();
//                this.$nextTick().then(() => { // use v-focus
//                    this.$refs.input.focus();
//                });
            },
//            onFocus () {
//                this.$logger.log('v-search.onFocus: ');
//                this.visible = true;
// //                this.$refs.input.focus();
//                this.$nextTick(() => { // use v-focus
//                    this.$refs.input.focus();
//                });
//            },
            onBlur () {
                this.$logger.log('v-search.onBlur: ');
                this.visible = false;
            },
            onEnter () {
                this.$logger.log('v-search.onEnter: ');
                this.$emit('handle-search', this.currentValue);
            },
            /**
             * 个别ios输入中文的时候（ios10.3.2），会触发三次，第一次和第三次是中文，第二次是空。造成的结果在高德api中，连续三次调用了搜索，有时最后结果是空。。。
             * 在此通过键盘加锁的方式进行判断，不让中文状态的拼音去检索，选定中文后再执行，避免重复赋值的问题。
             *              -- Author by Dio Zhu. on 2017.6.18
             */
            onInput (e) {
                if (this.isLock) return;
                this.currentValue = e.target.value;
            },
            onCcompositionStart (e) {
                this.$logger.log('v-search.onCcompositionStart: ', e.target.value);
                this.isLock = true;
            },
            onCompositionEnd (e) {
                this.$logger.log('v-search.onCompositionEnd: ', e.target.value);
                this.isLock = false;
                this.currentValue = e.target.value;
            },
            goBackFunc () {
                this.visible = false;
                this.currentValue = '';
                window.history.go(-1);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";
    .v-search-style-1{
        .v-search {
            /*position: fixed;*/
            top: 0;
            left: 0;
            width: 100%;
            height: pxTorem(44px);
            padding: 0 pxTorem(15px);
            background: $body-bg;
            border-bottom: #DDDEE3 1px solid;

            input {
                width: 100%;
                height: pxTorem(28px);
                font-size: pxTorem(14px);
                /*background: #FFF;*/
                /*-webkit-border-radius: pxTorem(5px);*/
                /*-moz-border-radius: pxTorem(5px);*/
                /*border-radius: pxTorem(5px);*/
                /*padding-left: pxTorem(28px);*/

                appearance: none;
                border: 0;
                box-sizing: border-box;
                outline: 0;
                color: transparent;

                &::-webkit-input-placeholder {text-align: center;}
                &:-ms-input-placeholder{text-align: center;}

                &:focus {
                    color: #000;
                    transition: color 0.5s ease-in-out;
                }

                &:focus ~ .icon {
                    &.icon-search {
                        transform: translateX(pxTorem(-146px));
                        transition: transform 0.3s ease-in-out;
                    }
                    &.icon-error {
                        display: block;
                        /*-webkit-transform:rotate(90deg);*/
                        /*transition: transform 0.3s ease-in-out;*/
                    }
                }
            }

            .icon {
                position: absolute;
                font-size: pxTorem(12px);
                line-height: 1;
                top: 50%;
                color: #333;
                margin-top: pxTorem(-6px);

                &.icon-search {
                    width: pxTorem(12px);
                    height: pxTorem(12px);
                    left: 50%;
                    margin-left: pxTorem(-16px);
                }
                &.icon-error {
                    /*display: none;*/
                    width: pxTorem(14px);
                    height: pxTorem(14px);
                    right: pxTorem(54px);
                    text-align: center;
                    font-size: pxTorem(12px);
                    line-height: pxTorem(14px);
                    color: #FFF;
                    background: #b2b2b2;
                    border-radius: 50%;
                }
            }
        }

        .v-search__bar {
            position: relative;
            width: 100%;
            height: 100%;
            @include box_flex;
            @include align_items(center);
            @include justify-content(center);

            > label {
                @include flex_grow(1);
                @include flex_shrink(1);
                @include flex_basis(auto);
            }

            > a {
                @include flex_grow(0);
                @include flex_shrink(0);
                @include flex_basis(auto);
            }
        }

        .v-search__frm {
            width: 100%;
            height: pxTorem(28px);
            font-size: pxTorem(14px);
            background: #FFF;
            -webkit-border-radius: pxTorem(5px);
            -moz-border-radius: pxTorem(5px);
            border-radius: pxTorem(5px);
            padding-left: pxTorem(28px);
        }

        .v-search__bar_cancel {
            /*width: pxTorem(40px);*/
            /*height: pxTorem(18px);*/
            margin-left: pxTorem(10px);
            font-size: pxTorem(17px);
            line-height: 1;
            color: #007AFF;
        }
    }

    .v-search-style-2 {
        .v-search {
            /*position: fixed;*/
            top: 0;
            left: 0;
            width: 100%;
            height: pxTorem(50px);
            padding: 0 pxTorem(15px);
            background: #1B1B20;

            input {
                width: 100%;
                height: pxTorem(28px);
                font-size: pxTorem(12px);
                /*background: #FFF;*/
                /*-webkit-border-radius: pxTorem(5px);*/
                /*-moz-border-radius: pxTorem(5px);*/
                /*border-radius: pxTorem(5px);*/
                /*padding-left: pxTorem(28px);*/
                color:#fff;
                appearance: none;
                border: 0;
                box-sizing: border-box;
                outline: 0;
                // color: transparent;

                &::-webkit-input-placeholder {text-align: left;}
                &:-ms-input-placeholder{text-align: left;}

                // &:focus {
                //     color: #000;
                //     transition: color 0.5s ease-in-out;
                // }

                &:focus ~ .icon {
                    // &.icon-search {
                    //     transform: translateX(pxTorem(-146px));
                    //     transition: transform 0.3s ease-in-out;
                    // }
                    &.icon-error {
                        display: none;
                        /*-webkit-transform:rotate(90deg);*/
                        /*transition: transform 0.3s ease-in-out;*/
                    }
                }
            }

            .icon {
                position: absolute;
                font-size: pxTorem(15px);
                line-height: 1;
                top: 50%;
                color: #fff;
                margin-top: pxTorem(-6px);

                &.icon-search {
                    width: pxTorem(12px);
                    height: pxTorem(12px);
                    left: 0%;
                    // margin-left: pxTorem(-16px);
                }
                &.icon-error {
                    display: none;
                    width: pxTorem(14px);
                    height: pxTorem(14px);
                    right: pxTorem(54px);
                    text-align: center;
                    font-size: pxTorem(12px);
                    line-height: pxTorem(14px);
                    color: #FFF;
                    background: #b2b2b2;
                    border-radius: 50%;
                }
            }
        }

        .v-search__bar {
            position: relative;
            width: 100%;
            height: 100%;
            @include box_flex;
            @include align_items(center);
            @include justify-content(center);

            > label {
                @include flex_grow(1);
                @include flex_shrink(1);
                @include flex_basis(auto);
            }

            > a {
                @include flex_grow(0);
                @include flex_shrink(0);
                @include flex_basis(auto);
            }
        }

        .v-search__frm {
            width: 100%;
            height: pxTorem(28px);
            font-size: pxTorem(14px);
            // background: #FFF;
            // -webkit-border-radius: pxTorem(5px);
            // -moz-border-radius: pxTorem(5px);
            // border-radius: pxTorem(5px);
            padding-left: pxTorem(20px);
        }

        .v-search__bar_cancel {
            /*width: pxTorem(40px);*/
            /*height: pxTorem(18px);*/
            margin-left: pxTorem(10px);
            font-size: pxTorem(14px);
            line-height: 1;
            color: #fff;
        }
    }

</style>
