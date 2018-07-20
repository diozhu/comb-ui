<template>
    <transition name="v-toast-pop">
        <div class="v-toast" v-show="visible" :class="customClass">
            <i class="v-toast-icon" :class="iconClass" v-if="iconClass !== ''"></i>
            <span class="v-toast-text" :style="{ 'padding-top': iconClass === '' ? '0' : '10px' }">{{ message }}</span>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        message: String,
        className: {
            type: String,
            default: ''
        },
        position: {
            type: String,
            default: 'middle'
        },
        iconClass: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            visible: false
        };
    },

    computed: {
        customClass () {
            let classes = [];
            if (this.position === 'top') {
                classes.push('is-placetop');
            } else if (this.position === 'bottom') {
                classes.push('is-placebottom');
            } else {
                classes.push('is-placemiddle');
            }
            classes.push(this.className);

            return classes.join(' ');
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    .v-toast {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
        /*width: 100%;*/
        max-width: 80%;
        position: fixed;
        padding: pxTorem(15px);
        border-radius: pxTorem(5px);
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        box-sizing: border-box;
        text-align: center;
        z-index: 2999;
        transition: opacity .3s linear;

        &.is-placebottom {
            bottom: pxTorem(50px);
            left: 50%;
            -webkit-transform: translate3d(-50%, 0, 0);
            transform: translate3d(-50%, 0, 0)
        }
        &.is-placemiddle {
            left: 50%;
            top: 50%;
            -webkit-transform: translate3d(-50%, -50%, 0);
            transform: translate3d(-50%, -50%, 0);
        }
        &.is-placetop {
            top: pxTorem(50px);
            left: 50%;
            -webkit-transform: translate3d(-50%, 0, 0);
            transform: translate3d(-50%, 0, 0);
        }
    }

    /* autoprefixer: off */
    .v-toast {
        z-index: 2999;
    }

    .v-toast-icon {
        display: block;
        text-align: center;
        font-size: pxTorem(50px);
        margin: 0 pxTorem(20px);
    }

    .v-toast-text {
        font-size: pxTorem(14px);
        line-height: 1;
        display: block;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
    }

    .v-toast-pop-enter, .v-toast-pop-leave-active {
        opacity: 0
    }

</style>
