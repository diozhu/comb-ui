<template>
    <div class="v-image" :class="curValue.classes || classes" @click="onClick">
        <!-- <img v-lazy="curValue.url || value" :alt="curValue.alt"/> -->
        <img
            v-lazy="curValue.url || value"
            :src="thumb.url ? thumb.url : ''"
            :alt="curValue.alt"
            :class="[{thumb: thumb.url}, animation, {loading: thumb.url}]"
            :style="thumbStyle"
        />
        <!-- <img :src="curValue.url || value" :alt="curValue.alt"/> -->
    </div>
</template>

<script>
    // import {format} from '../js/utils/utils';
    import * as utils from '../js/utils/utils';

    /**
     * 缩略图，避免页面渲染时的空白以及提供给spider;
     * vue-lazyload组件在plugins中声明时添加了filter，在那里进行了渐进的loading赋值;
     * 此处thumb的模糊值要比loading时模糊，有个渐进的效果;
     *              -- mod by Dio Zhu. on 2018.8.15
     */
    export default {
        name: 'v-image',
        props: {
            value: {
                type: Object,
                default: () => { return { url: '', classes: '', alt: '', width: '', height: '', type: '', thumb: true }; }
            },
            alt: {
                type: String,
                default: ''
            },
            animation: { // 设定图片由thumb转为原图时的动画，默认fade(渐显)
                type: String,
                default: 'fade' // 默认：fade（渐显）、scale（缩放）、slide（滑动）
            },
            classes: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                curValue: {},
                thumb: {},
                thumbStyle: {}
            };
        },
        watch: {
            'value.url' (val) {
                // console.warn('v-image.watch.value.url: ', val);
                this.init(this.value);
            }
        },
        created () {
            // console.error('v-image的created:', this.value);
            this.init(this.value);
        },
        methods: {
            init (val) {
                // console.warn('v-image.init.value.url: ', val);
                this.$set(this, 'thumb', { // 缩略图，避免页面渲染时的空白以及提供给spider...mod by Dio Zhu. on 2018.8.15
                    url: utils.format(val.url, { thumb: true }),
                    classes: val.classes,
                    alt: val.alt
                });

                this.$set(this, 'curValue', {
                    url: utils.format(val.url, { width: val.width, height: val.height }),
                    classes: val.classes,
                    alt: val.alt
                });
                // console.log('v-image.init: ', this.thumb, this.curValue);
            },
            onClick () {
                this.$emit('click');
            }
        }
    };
</script>

<style lang="scss">
    .v-image {
        // 不改变图片现有的盒模型
        display: inline-block;
        // 给v-image设置宽高，图片100%，超出之后隐藏
        overflow: hidden;
        /* 设置宽度为100% */
        width: 100%;
        /*height: 100%;*/
        // 可能出现白边，设置可以解决，后期继续优化(针对图片设置的vertical-align:top也能解决)
        line-height: 1px;
        /* 图片在盒子自动居中 */
        /*text-align: center;*/
        vertical-align: top;
        margin-top: -1px;
        img {
            width: 100%;
            height: 100%;
            vertical-align: top;
        }

        .thumb {

            /* 渐显 */
            &.fade.loading { filter: blur(25px); }
            &.fade.loaded { animation: fadeOut 300ms linear; }

            /* 缩放 */
            &.scale.loading { filter: blur(50px); transform: scale(1.1); }
            &.scale.loaded { animation: scaleIn 300ms ease-out; }

            /* slide */
            &.slide {

                &.loading { filter: blur(25px); }

                ~.shadow {
                    width: 100%;
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    overflow: hidden;

                    img {
                        position: absolute;
                        left: 0;
                        bottom: 0;
                        filter: blur(25px);
                    }
                }

                &.loaded {
                    filter: none;

                    &~.shadow {
                        opacity: 0;
                        animation: slide 1000ms linear;
                    }
                }
            }
            /*&.slide.loading {*/
            /*!*filter: blur(50px);*!*/
            /*}*/
            /*&.slide.loaded {*/
            /*!*animation: slide 300ms linear;*!*/
            /*}*/
        }

        @keyframes fadeOut { 0% { filter: blur(50px); } 100% { filter: none; } }
        @keyframes scaleIn { 0% { filter: blur(50px); transform: scale(1.1); } 100% { filter: none; transform: scale(1); } }
        /*@keyframes slide { 0% { transform: translate3d(0, 0, 0); opacity: 1; } 100% { transform: translate3d(100%, 0, 0); opacity: 1; } }*/
        @keyframes slide { 0% { height: 100%; opacity: 1; } 100% { height: 1%; opacity: 1; } }
    }
</style>
