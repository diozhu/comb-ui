<template>
    <button
        :type="nativeType"
        class="v-btn"
        :class="[
            '' + type,
            '' + size,
            '' + styles,
            {
                'is-disabled': disabled
            }
        ]"
        :style="cusStyle"
        :disabled="disabled"
        @click="handleClick"
    >
        <label class="v-btn__text"
            ><i class="icon icon-loading" v-if="loading" :class="loading ? 'move' : ''"></i><slot class="move"></slot
        ></label>
    </button>
</template>
<script>
export default {
    name: 'v-button',

    props: {
        nativeType: String, // 原生type属性透传
        type: {
            type: String,
            default: 'default',
            validator(value) {
                return ['default', 'danger', 'primary', 'info'].indexOf(value) > -1;
            }
        },
        styles: {
            // 按钮样式：默认、平角、原型
            type: String,
            default: 'radius',
            validator(value) {
                return ['radius', 'rectangle', 'circle'].indexOf(value) > -1;
            }
        },
        cusClass: String,
        cusStyle: String,
        disableClass: String,
        disabled: Boolean,
        loading:{
            type:Boolean,
            default: false
        },
        size: {
            type: String,
            default: 'normal',
            validator(value) {
                return ['normal', 'small', 'full'].indexOf(value) > -1;
            }
        }
    },
    data() {
        return {};
    },
    methods: {
        handleClick(evt) {
            // console.log('evt:', evt);
            this.$emit('click', evt);
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import '../scss/variables';
@-webkit-keyframes rotating {
    0% {
        -webkit-transform: rotateZ(0);
        transform: rotateZ(0);
    }
    100% {
        -webkit-transform: rotateZ(360deg);
        transform: rotateZ(360deg);
    }
}
@keyframes rotating {
    0% {
        -webkit-transform: rotateZ(0);
        transform: rotateZ(0);
    }
    100% {
        -webkit-transform: rotateZ(360deg);
        transform: rotateZ(360deg);
    }
}
.v-btn {
    width: 100%;
    /*height: 100%;*/
    display: block;
    //@include circle-corner(pxTorem(4px))
    background: #3395ff;
    color: #ffffff;
    .move {
        display: inline-block;
        -webkit-animation: rotating 2s linear infinite;
        animation: rotating 2s linear infinite;
    }
    .v-btn__text {
        font-size: pxTorem(16px);
        line-height: 2;
    }
    /* 颜色 */
    &.default {
        border: #3395ff 0.02667rem solid;
        background: #3395ff;
        color: #ffffff;
    }
    &.danger {
        border: #fa5a5a 0.02667rem solid;
        background: #fa5a5a;
        color: #ffffff;
    }
    &.primary {
        border: #f7b64b 0.02667rem solid;
        background: #f7b64b;
        color: #ffffff;
    }
    &.info {
        border: #3395ff pxTorem(1px) solid;
        background: transparent;
        color: #3395ff;
    }

    /* 大小 */
    &.normal {
        /*margin: pxTorem(15px);*/
    }
    &.small {
        width: initial;
        height: initial;
        padding: 0 pxTorem(15px);
        display: inline-block;

        .v-btn__text {
            font-size: pxTorem(12px);
        }
    }
    &.full {
        border-radius: 0;
    }

    /* 风格 */
    &.radius {
        border-radius: pxTorem(4px);
    }
    &.rectangle {
        border-radius: 0;
    }
    &.circle {
        border-radius: pxTorem(100px);
    }

    &:active {
        opacity: 0.6;
    }

    &.is-disabled {
        border: #85bffe 1px solid;
        background: #85bffe;
    }
}
</style>
