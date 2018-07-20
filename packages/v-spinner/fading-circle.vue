<template>
    <div :class="['v-spinner__fading-circle circle-color-' + _uid]">
        <div v-for="n in 12" :key="n" :class="['is-circle' + n]" class="circle"></div>
    </div>
</template>

<script>
export default {
    name: 'fading-circle',

    props: {
        size: Number,
        color: String
    },

    computed: {
        spinnerColor () {
            return this.color || this.$parent.color || '#007AFF';
        }
    },

    created () {
        //            this.$logger.log('fading-circle.created: ', this._uid);
        if (this.$isServer) return;
        this.styleNode = document.createElement('style');
        const css = `.circle-color-${this._uid} > div::before { background-color: ${this.spinnerColor}; }`;

        this.styleNode.type = 'text/css';
        this.styleNode.rel = 'stylesheet';
        this.styleNode.title = 'fading circle style';
        document.getElementsByTagName('head')[0].appendChild(this.styleNode);
        this.styleNode.appendChild(document.createTextNode(css));
    },

    destroyed () {
        if (this.styleNode) {
            this.styleNode.parentNode.removeChild(this.styleNode);
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .v-spinner__fading-circle {
        width: pxTorem(28px);
        height: pxTorem(28px);
        position: relative;

        .circle {
            background: transparent;
            border: 0;
            width: 100%;
            height: 100%;
            size: pxTorem(28px);
            position: absolute;

            &::before {
                width: 15%;
                height: 15%;
                content: " ";
                // background: $color;
                display: block;
                margin: 0 auto;
                size: pxTorem(8px);
                border-radius: 50%;
                animation: v-spinner__fading-circle--opacity 1.2s infinite ease-in-out both;
            }

            @for $i from 1 through 12 {
                &.is-circle#{$i} {
                    transform: rotate(#{360deg / 12 * $i});

                    &::before {
                        animation-delay: #{(-1.2s + 1.2s / 12 * $i)};
                    }
                }
            }
        }
    }

    @keyframes v-spinner__fading-circle--opacity {
        0%, 39%, 100% {
            opacity: 0;
        }
        40% {
            opacity: 1;
        }
    }

</style>
