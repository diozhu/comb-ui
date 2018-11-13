<template>
    <div class="v-scroll-picker" :class="[classes]">

        <div class="v-scroll-picker" @click="show">
            <span v-if="currentId">{{selectedOption.name}}</span>
            <span v-else>请选择</span>
            <i class="fa fa-angle-down"></i>
        </div>
        <div class="v-scroll-picker-wrapper" :class="{'v-show': displayed}">
            <div class="v-scroll-picker-title">
                <span @click="hide">取消</span>
                <span @click="select">确定</span>
            </div>
            <div class="v-scroll-picker-content">
                <ul>
                    <li v-for="option in opts">
                        <span>{{ option.name }}</span>
                    </li>

                </ul>
                <div class="v-scroll-pinker-mask"></div>
                <div class="v-scroll-indicator"></div>
            </div>

        </div>
        <v-shade :display="displayed"></v-shade>

    </div>
</template>
<script>
    import IScroll from 'iscroll';
    import _ from 'underscore';
    import vShade from './v-shade.vue';

    /**
     * v-scroll-picker组件
     *              -- Author by Dio Zhu. on 2017.2.15
     */
    export default {
        name: 'v-scroll-picker',

        components: {
            'v-shade': vShade
        },

        props: {
            id: String,
            display: {
                type: Boolean,
                default: false
            },
            // 下拉选项数组对象
//            options: {
//                type: Array,
//                default () {
//                    let ary = [];
//                    for (let i = 0;i < 100;i++) {
//                        ary.push({
//                            id: i + 1,
//                            name: `测试数据${i}`
//                        });
//                    }
//                    return ary;
//                },
//                coerce (options) {
//                    options = JSON.parse(JSON.stringify(options));
//                    for (let i = 0;i < 3;i++) {
//                        let placeAry = {
//                            id: null,
//                            name: ''
//                        };
//                        options.unshift(placeAry);
//                        options.push(placeAry);
//                    }
//                    return options;
//                }
//
//            },
            options: Array,
            // 选中option的id
            selectedId: {
                type: [Number, String],
                default: 10
            },
            classes: String     // 附加class
        },

        data () {
            return {
                displayed: false,
                currentId: 1
            };
        },

        watch: {
            display () {
                this.displayed = this.display;
            },
            selectedId () {
                this.currentId = this.selectedId || 1;
            }
        },

        computed: {
            opts () {
                let arr = this.options;
                for (let i = 0;i < 3;i++) {
                    let blankObj = { id: null, name: '' };
                    arr.unshift(blankObj);
                    arr.push(blankObj);
                }
                return arr;
            },
            selectedOption () {
                let _self = this;
                return _.find(this.options, function (v) {
                    return v.id === _self.selectedId;
                });
            }
        },

        created () {
            console.log('v-scroll-picker created...');
            this.rem2px = lib.flexible.rem2px('1rem').replace(/px/, '') * 1;  // eslint-disable-line no-undef
        },

        mounted () {

        },

        methods: {
            show () {
                let _self = this;
                this.displayed = true;
                // 此处异步调用的目的是使得dom元素渲染好之后再执行scroll初始化
                setTimeout(() => {
                    _self.myScroll = new IScroll('.v-scroll-picker-content', {

                        // 按距离滚动
                        snap: 'li'
                    });

                    console.log('===============>>> ', _self.myScroll, this.rem2px);

                    let selectedIndex = 0;

                    if (this.currentId) {
                        selectedIndex = _.find(this.options, function (v) {
                            return v.id === _self.currentId;
                        });
                    }

                    this.myScroll.scrollTo(0, -1 * (selectedIndex - 3) * this.rem2px);
                }, 0);
            },
            select () {
                let selectedOptionIndex = Math.abs(this.myScroll.y) / this.rem2px;

                // TODO 此处还需处理placeholder的配置数量问题
                this.currentId = this.options[selectedOptionIndex + 3].id;

                this.hide();
            },
            hide () {
                this.displayed = false;
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $line-height: pxTorem(34px);
    $block-height: pxTorem(238px); // 216px
    $center-top: pxTorem(102px);
    .v-scroll-picker {
        font-size: inherit;
    }

    .v-scroll-picker-wrapper {
        display: none;
        background-color: #fbf9fe;
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        overflow: hidden;
        z-index: 999;

        &.v-show {
            display: block !important;
        }


        .v-scroll-picker-title {
            display: flex;
            height: $line-height;
            // @include font-dpr(16px);
            font-size: pxTorem(16px);

            align-items: center;

            span {
                flex: 1;
            }
        }

        .v-scroll-picker-content {
            position: relative;
            height: $block-height;
            overflow: hidden;
            // @include font-dpr(20px);
            font-size: pxTorem(20px);

            ul {
                margin: 0;
                padding: 0;

                li {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: $line-height;
                    text-align: center;

                    span {
                        font-size: pxTorem(21px);
                    }
                }
            }

            .v-scroll-pinker-mask {

                height: $block-height;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;

                background-image: linear-gradient(180deg, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6)), linear-gradient(0deg, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
                background-position: top, bottom;
                background-size: 100% $line-height*3;
                background-repeat: no-repeat;
            }

            .v-scroll-indicator {
                width: 100%;
                height: $line-height;
                position: absolute;
                left: 0;
                top: $center-top;
                //z-index: 3;
                background-image: -webkit-linear-gradient(top, #d0d0d0, #d0d0d0, transparent, transparent), -webkit-linear-gradient(bottom, #d0d0d0, #d0d0d0, transparent, transparent);
                background-image: linear-gradient(180deg, #d0d0d0, #d0d0d0, transparent, transparent), linear-gradient(0deg, #d0d0d0, #d0d0d0, transparent, transparent);
                background-position: top, bottom;
                background-size: 100% 1px;
                background-repeat: no-repeat;
            }
        }

    }

</style>
