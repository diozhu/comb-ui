<template>
    <!--<div>-->
        <component
            class="v-animat"
            :is="type"
                   :tag="tag"
                   enter-active-class="fadeIn"
                   leave-active-class="fadeOut"
                   move-class="fade-move"
                   v-bind="$attrs"
                   v-on="hooks">
            <slot></slot>
        </component>
    <!--</div>-->
</template>
<script type="text/ecmascript-6">
    /**
     * v-animat
     */
    export default {
        name: 'v-animat',

        props: {
            duration: {
                type: Number,
                default: 300
            },
            group: {
                type: Boolean,
                default: false
            },
            tag: {
                type: String,
                default: 'div'
            }
        },
        computed: {
            type () {
                return this.group ? 'transition-group' : 'transition';
            },
            hooks () {
                return {
                    beforeEnter: this.setDuration,
                    afterEnter: this.cleanUpDuration,
                    beforeLeave: this.setDuration,
                    afterLeave: this.cleanUpDuration,
                    leave: this.setAbsolutePosition,
                    ...this.$listeners
                };
            }
        },

        created () {
            console.log('v-animat.created: ');
        },

        methods: {
            setDuration (el) {
                el.style.animationDuration = `${this.duration}ms`;
            },
            cleanUpDuration (el) {
                el.style.animationDuration = '';
            },
            setAbsolutePosition (el) {
                if (this.group) {
                    el.style.position = 'absolute';
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-animat {
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .fadeIn {
            animation-name: fadeIn;
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .fadeOut {
            /*position: absolute;*/
            animation-name: fadeOut;
        }
        .fade-move {
            transition: transform 0.3s ease-out;
        }
    }

</style>
