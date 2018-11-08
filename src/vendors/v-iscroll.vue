<template>
    <div ref="scrollView" class="v-iscroll wrapper" :class="wrapperClass" :style="wrapperStyle">
        <div ref="scroller" class="scroller" :class="scrollerClass" :style="scrollerStyle">
            <slot></slot>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import Vue from 'vue';

    export default {
        name: 'v-iscroll',
        props: {
            options: {
                type: Object,
                default () { return {}; }
            },
            wrapperClass: {
                type: Object,
                default () { return {}; }
            },
            wrapperStyle: {
                type: Object,
                default () { return {}; }
            },
            scrollerClass: {
                type: Object,
                default () { return {}; }
            },
            scrollerStyle: {
                type: Object,
                default () { return {}; }
            }
        },
        mounted () {
            const events = [
                'beforeScrollStart',
                'scrollCancel',
                'scrollStart',
                'scrollEnd',
                'scroll',
                'flick',
                'zoomStart',
                'zoomEnd'
            ];
            setTimeout(() => {
                let key,
                    value,
                    attributes = this.$refs.scrollView.attributes;
                this.$refs.scrollView.scrollTop = 0;
                for (key in attributes) {
                    value = attributes[key];
                    if (value instanceof global.Attr && value.name.indexOf('data-v-') > -1) {
                        this.$refs.scroller.attributes.setNamedItem(document.createAttribute(value.name));
                    }
                }
                try {
                    global.location.hash && this.iscroll.scrollToElement(global.location.hash, 0);
                } catch (e) {
                }
            }, 0);
            this.$nextTick(() => {
                const IScroll = Vue._IScroll;
                this.iscroll = new IScroll(this.$refs.scrollView, this.options);
                events.forEach(event => {
                    this.iscroll.on(event, () => this.$emit(event, this.iscroll));
                });
                this._registPullEvents();
            });
        },
        beforeDestroy () {
            this.iscroll && this.iscroll.destroy();
            this.iscroll = null;
        },
        methods: {
            _registPullEvents () {
                const {iscroll} = this;
                iscroll.on('scrollEnd', e => {
                    if (iscroll.y <= iscroll.maxScrollY) {
                        this.$emit('pullUp', iscroll);
                    } else if (iscroll.y >= 0) {
                        this.$emit('pullDown', iscroll);
                    }
                });
            },
            zoom () {
                this.$nextTick(() => this.iscroll.zoom.apply(this.iscroll, arguments));
            },
            goToPage () {
                this.$nextTick(() => this.iscroll.goToPage.apply(this.iscroll, arguments));
            },
            next () {
                this.$nextTick(() => this.iscroll.next.apply(this.iscroll, arguments));
            },
            prev () {
                this.$nextTick(() => this.iscroll.prev.apply(this.iscroll, arguments));
            },
            scrollToElement () {
                this.$nextTick(() => this.iscroll.scrollToElement.apply(this.iscroll, arguments));
            },
            scrollBy () {
                this.$nextTick(() => this.iscroll.scrollBy.apply(this.iscroll, arguments));
            },
            scrollTo () {
                this.$nextTick(() => this.iscroll.scrollTo.apply(this.iscroll, arguments));
            },
            refresh () {
                this.$nextTick(() => this.iscroll.refresh.apply(this.iscroll, arguments));
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-iscroll {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 1;
        top: 0;
        bottom: 0;
        left: 0;
        overflow: hidden;
        // background: #ccc;

        .scroller {
            position: absolute;
            z-index: 1;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
            width: 100%;
            transform: translateZ(0);
            -webkit-touch-callout: none;
            user-select: none;
            text-size-adjust: none;

            ul {
                width: 100%;
                position: relative;
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    position: absolute;
                    width: 100%;
                    top: 0;
                    left: 0;
                    transform: translateZ(0);
                    padding: 0;
                    height: pxTorem(40px);
                    line-height: 1;
                    // border-bottom: 1px solid #ccc;
                    // border-top: 1px solid #fff;
                    // background-color: #fafafa;
                    // font-size: 16px;
                }
            }
        }
    }

</style>
