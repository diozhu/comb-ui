<template>
    <div class="v-image" :class="curValue.classes || classes" @click="onClick">
        <!-- <img v-lazy="curValue.url || value" :alt="curValue.alt"/> -->
        <img
            v-lazy="curValue.url || value"
            :src="thumb.url || value"
            :alt="curValue.alt"
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
            value (val) {
                // console.warn('v-image.watch.value.url: ', val);
                this.init(val);
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
                    url: utils.format(val.url, { thumb: val.thumb }),
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
    }
</style>
