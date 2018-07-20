<template>
    <transition :name="currentTransition" v-on:after-enter="afterEnter" v-on:enter="enter" v-on:enter-cancelled="enterCancelled">
        <div v-show="currentValue" class="v-popup" :class="[position ? 'v-popup-' + position : '']">
            <div v-if="toolbar" class="v-popup__toolbar">
                <slot name="toolbar">
                    <span class="v-popup__action v-popup__cancel" @click="currentValue = false">取消</span>
                    <span class="v-popup__action v-popup__confirm" @click="confirm">确定</span>
                </slot>
            </div>
            <slot ref="slotor"></slot>
        </div>
    </transition>
</template>

<script type="text/babel">
import Popup from './v-popup.js';

/**
 *  因为在v-picker中加了mask蒙版，使用了线性背景（gradient）
 *  transition的slide中的translate3d在低版本系统中会对线性渲染有兼容性问题，所以这里默认用了fade模式。
 *              -- Author by Dio Zhu. on 2017.3.3.
 */
export default {
    name: 'v-popup',

    mixins: [Popup],

    props: {
        value: {
            type: Boolean,
            default: false
        },
        toolbar: {              // 是否显示操作按钮。 Author by Dio Zhu. on 2018.4.25
            type: Boolean,
            default: false
        },
        closeEnable: {          // 是否可以关闭当前组件的外部条件。 Author by Dio Zhu. on 2018.4.25
            type: Boolean,
            default: true
        },
        modal: {
            default: true
        },

        modalFade: {
            default: true
        },

        lockScroll: {
            default: false
        },

        closeOnClickModal: {
            default: true
        },

        popupTransition: {
            type: String,
            default: 'popup-fade' // popup-fade、popup-slide
        },

        position: {
            type: String,
            default: 'bottom'
        }
    },

    data () {
        return {
            currentValue: false,
            currentTransition: this.popupTransition
        };
    },

    watch: {
        currentValue (val) {
            /**
             * 取消滚动，避免弹出层响应window的scroll事件
             * 由于默认使用的window的滚动条，只有列表页才会使用容器滚动条，而window滚动条无法被屏蔽。
             * 所以在此打开了内容器，使得滚动失效。如果一直打开内容器，会造成页面内的input焦点时页面无法上推，被键盘挡住，所以关闭时取消内容器设定。
             *              -- Author by Dio Zhu. on 2017.4.6
             * 修改了滚动条容器，以前是window滚动条，后因为需要在滚动条中fixed，所以改成了div容器滚动条。
             *              -- Author by Dio Zhu. on 2017.5.16
             */
            let touchObj = document.getElementsByClassName('page')[0];
            // console.log('v-popup.watch.currentValue: ', val, touchObj);
            if (val && touchObj) {
                // touchObj.style.overflow = 'hidden';
                touchObj.style.overflowX = 'hidden';
                touchObj.style.overflowY = 'hidden';
            } else if (touchObj) {
                // touchObj.style.overflow = 'auto';
                touchObj.style.overflowY = 'auto';
                touchObj.style.overflowX = 'hidden';
            }
            this.$emit('input', val);
        },

        value (val) {
            this.currentValue = val;
            // this.$set(this, 'currentValue', val);
            // console.log('v-popup.watch.value: ', val);
        }
    },

    beforeMount () {
        if (this.popupTransition !== 'popup-fade') {
            this.currentTransition = `popup-slide-${this.position}`;
        }
    },

    mounted () {
        if (this.value) {
            this.rendered = true;
            this.currentValue = true;
            this.open();
        }
    },

    methods: {
        confirm () {
            // console.log('v-popup.methods.confirm: ', ...arguments);
            if (this.closeEnable) { // 查看外部条件是否允许关闭当前组件
                this.$emit('handleConfirm', this.currentValue);
                this.currentValue = false;
            } else {
                this.$emit('handleConfirm', false);
            }
        },
        touchHandler (e) {
            console.log('v-popup.methods.touchHandler: ', e);
            e = e || window.event;
            if (e && e.preventDefault) {
                e.preventDefault();
                e.stopPropagation();
            } else {
                e.returnvalue = false;
                return false;
            }
        },

        enter: function (el, done) {
            // console.log('v-popup.enter: ', el, done);
            let maskor = this.$el.querySelectorAll('.picker-center-mask')[0];

            if (maskor && maskor.style) {
                maskor.style.top = 0;
            }
            // console.log('v-popup.enter: ');
        },
        afterEnter (el) {
            // console.log('v-popup.afterEnter: ');
        },
        enterCancelled: function (el) {
            // console.log('v-popup.enterCancelled: ');
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    .v-modal-enter{ animation:v-modal-in .2s ease; }
    .v-modal-leave{ animation:v-modal-out .2s ease forwards; }
    @keyframes v-modal-in { 0% { opacity:0 } }
    @keyframes v-modal-out { to { opacity:0 } }
    .v-modal{
        position:absolute;
        left:0;
        bottom:0;
        width:100%;
        height:100%;
        opacity: 0.5;
        background:#000;
        transition: .5s;
        /*backface-visibility: hidden;*/
        /*transform: translate3d(0, 0, 0);*/
    }
    .v-popup {
        width: 100%;
        position: fixed;
        background: #fff;
        /*background: transparent;*/
        /*
                top: 50%;
                left: 50%;
                transform: translate3d(-50%, -50%, 0);
                backface-visibility: hidden;
                transition: .2s ease-out;
        */
        /*transition: .4s cubic-bezier(0.39, 0.575, 0.565, 1);*/
        transition: opacity .1s, transform .5s; // 解决ios渲染问题。 Mod by Keming Wen. on 2017.6.28
    }
    .v-popup-top {
        top: 0;
        right: auto;
        bottom: auto;
        left: 50%;
        transform: translate3d(-50%, 0, 0);
    }
    .v-popup-right {
        top: 50%;
        right: 0;
        bottom: auto;
        left: auto;
        transform: translate3d(0, -50%, 0);
    }
    .v-popup-middle{
        /*left: 50%;*/
        top: 50%;
        transform: translate(-50,-50%);
    }
    .v-popup-bottom {
        /*
                top: auto;
                right: auto;
                bottom: 0;
                left: 50%;
                transform: translate3d(-50%, 0, 0);
                visibility: hidden;
        */
        bottom: 0;
        left: 0;
        transform: translateY(100%);
        opacity: .99;  // 解决ios渲染问题。 Mod by Keming Wen. on 2017.6.28
    }
    .v-popup-left {
        top: 50%;
        right: auto;
        bottom: auto;
        left: 0;
        transform: translate3d(0, -50%, 0);
    }
    .popup-slide-top-enter, .popup-slide-top-leave-active {  transform: translate3d(-50%, -100%, 0);  }
    .popup-slide-right-enter, .popup-slide-right-leave-active {  transform: translate3d(100%, -50%, 0);  }
    .popup-slide-bottom-enter, .popup-slide-bottom-leave-active {  transform:  translate3d(-50%, 100%, 0);  }
    .popup-slide-left-enter, .popup-slide-left-leave-active {  transform:  translate3d(-100%, -50%, 0);  }
    .popup-fade-enter, .popup-fade-leave-active {  opacity: 0;  }

    .popup-fade-enter-to,
    .popup-slide-bottom-enter-to {
        visibility: visible;
    }

    .popup-fade-enter-to { // 解决ios渲染问题。 Mod by Keming Wen. on 2017.6.28
        transform: translateY(0);
        opacity: 1;
    }
    .v-popup__toolbar { // 操作栏
        height: pxTorem(40);
        border-bottom: #e3e3e3 1px solid;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .v-popup__action {
            margin: 0 pxTorem(15);
            font-size: pxTorem(15);
        }
    }
</style>
