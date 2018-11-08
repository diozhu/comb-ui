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
    @import "../../scss/variables";
    @import "../../scss/mixins";

    $color: #ACB3BF;
    .v-spinner__triple-bounce {

        .bounce1, .bounce2, .bounce3 {
            width: pxTorem(6px);
            height: pxTorem(6px);
            background-color: $color;
            display: inline-block;
            -webkit-border-radius: 100%;
            -moz-border-radius: 100%;
            border-radius: 100%;
            -webkit-animation: v-spinner__triple-bounce--scale 1.4s infinite ease-in-out both;
            -o-animation: v-spinner__triple-bounce--scale 1.4s infinite ease-in-out both;
            animation: v-spinner__triple-bounce--scale 1.4s infinite ease-in-out both;
        }

        .bounce1 {
            -webkit-animation-delay: -0.32s;
            -moz-animation-delay: -0.32s;
            -o-animation-delay: -0.32s;
            animation-delay: -0.32s;
        }
        .bounce2 {
            -webkit-animation-delay: -0.16s;
            -moz-animation-delay: -0.16s;
            -o-animation-delay: -0.16s;
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
