<template>
    <div class="v-timeline" :class="[{horizontal: horizontal}, {vertical: !horizontal} , {liner: showLine}]">
        <dl v-for="(item, idx) in flows" :class="[
            {start: idx === 0},
            {end: idx === flows.length - 1},
            {checked: item.value < value},
            {current: item.value === value}
            ]">
            <!--<dt class="icon" :class="item.value !== value ? 'icon-disk' : 'icon-disk-check'"></dt>-->
            <!--<dt class="icon" :class="[-->
                <!--{'icon-input-del': item.value < value},-->
                <!--{'icon-disk-check': item.value === value},-->
                <!--{'icon-disk': item.value > value}-->
            <!--]"></dt>-->
            <dt class="line"></dt>
            <dd>
                <slot name="item" :data="item">{{ item.label }}</slot>
            </dd>
        </dl>
    </div>
</template>
<script>
    export default {
        name: 'v-timeline',

        components: {},

        props: {
            value: String | Number,
            flows: {
                type: Array,
                default: () => { return []; }
            },
            horizontal: {
                type: Boolean,
                default: false
            },
            showLine: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                currentValue: this.value
            };
        },

        computed: {
        },

        watch: {
            value (val) {
                this.currentValue = val;
            }
        },

        created () {
            this.$logger.log('v-timeline.created... ');
        },

        methods: {
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";


    .v-timeline {
        display: flex;
        flex-direction: column;

        > dl {
            position: relative;
            flex: 1 1 auto;
            display: flex;
            flex-direction: row;

            > dt {
                width: pxTorem(16px);
                position: relative;
                font-size: pxTorem(16px);
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;

                &:after { // 圆点儿
                    background: #FFF;

                    content: '';
                    width: pxTorem(10px);
                    height: pxTorem(10px);
                    border: #d8d8d8 1px solid;
                    border-radius: 50%;
                }
            }

            > dd {
                flex: 1 1 auto;
                font-size: pxTorem(13px);
                line-height: 1;
                color: #000;
            }

            &:before { // 连线
                content: '';
                width: pxTorem(1px);
                height: 100%;
                background: #DDDEE3;
                position: absolute;
                top:initial;
                right: initial;
                left: pxTorem(8px);
                bottom: 0;
            }
            &.start:before {
                height: 50%;
                top: initial;
                bottom: 0;
            }
            &.end:before {
                height: 50%;
                top: 0;
                bottom: initial;
            }

        }

        .checked {
            .line:after {
                background: #d8d8d8;
            }
        }
        .current {
            .line:after {
                width: pxTorem(9px);
                height: pxTorem(9px);
                border: 0;
                background-color: #007aff;
                box-shadow: 0 0 0 pxTorem(3px) #B3D8FD;
                -webkit-animation: timeline 2s infinite;
                animation: timeline 2s infinite;
            }
        }
    }


    .v-timeline.horizontal {
        flex-direction: row;

        > dl {
            text-align: center;
            flex-direction: column-reverse;

            > dt {
                width: initial;
            }

            > dd {
                padding-bottom: pxTorem(10px);
            }
        }

        &.liner {
            padding: 0;

            dl {
                /*border-bottom: #858585 1px solid;*/
                &:before {
                    content: '';
                    width: 100%;
                    height: pxTorem(1px);
                    background: #DDDEE3;
                    position: absolute;
                    top:initial;
                    right: initial;
                    left: 0;
                    bottom: pxTorem(5px);
                }
                &.start:before {
                    width: 50%;
                    height: pxTorem(1px);
                    left: initial;
                    right: 0;
                }
                &.end:before {
                    width: 50%;
                    height: pxTorem(1px);
                    left: 0;
                    right: initial;
                }
            }
        }
    }

</style>
