<template>
    <div class="v-spinner__triple-bounce">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
    </div>
</template>

<script>
export default {
    name: 'triple-bounce',

    props: {
        size: Number,
        color: String
    },

    computed: {
        bounceStyle () {
            return {
                backgroundColor: this.spinnerColor
            };
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    $color: #ACB3BF;
    .v-spinner__triple-bounce {

        .bounce1, .bounce2, .bounce3 {
            width: pxTorem(6px);
            height: pxTorem(6px);
            background-color: $color;
            display: inline-block;
            border-radius: 100%;
            animation: v-spinner__triple-bounce--scale 1.4s infinite ease-in-out both;
        }

        .bounce1 {
            animation-delay: -0.32s;
        }
        .bounce2 {
            animation-delay: -0.16s;
        }
    }

    @keyframes v-spinner__triple-bounce--scale {
        0%, 80%, 100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1.0);
        }
    }
</style>
