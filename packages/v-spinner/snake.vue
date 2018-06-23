<template>
    <div class="v-spinner__snake" :style="{
    'border-top-color': 'transparent',
    'border-right-color': spinnerColor,
    'border-left-color': spinnerColor,
    'border-bottom-color': spinnerColor
    }"></div>
</template>

<script>
export default {
    name: 'snake',

    props: {
        size: Number,
        color: String
    },

    computed: {
        spinnerColor () {
            return this.color || this.$parent.color || '#007AFF';
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    $color: #007AFF;
    .v-spinner__snake {
        width: pxTorem(28px);
        height: pxTorem(28px);
        animation: v-spinner__snake--rotate 0.8s infinite linear;
        border-width: pxTorem(2px);
        border-style: solid;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;

    }

    @keyframes v-spinner__snake--rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
