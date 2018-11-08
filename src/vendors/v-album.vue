<template>
    <div :class="['v-album', albumClass]">
        <!--:style="{background: 'url('+ img.url +')', 'background-size': 'cover', 'background-position': 'center', 'background-repeat': 'no-repeat'}"-->
        <div v-for="(img, idx) in formatedValues" :key="idx" v-if="idx<3" class="v-album__frm"
             :style="{backgroundImage: 'url(' + img.formatedUrl + ')', backgroundSize: 'cover'}"
             @click="handleClick($event, idx)"
        >
            <!--<img :src="img.url | thumb" class="v-album__img" >-->
            <div class="v-album__mask" v-if="idx === 2 && currentValue.length > 3"></div>
            <div class="v-album__num" v-if="idx === 2 && currentValue.length > 3">{{ currentValue.length - 3 }}+</div>
        </div>
    </div>
</template>
<script>
    import * as utils from '../js/utils/utils';

    /**
     * album组件
     * 传入图片list，布局由第一张图片的宽高比决定；
     * 点击可预览，需配置viewer嵌套路由；
     *              -- Author by Dio Zhu. on 2017.3.3
     */
    export default {
        name: 'v-album',

        props: {
            value: {
                type: Array,
                default: () => []
            }
        },

        data () {
            return {
                currentValue: this.value,
                images: []
            };
        },

        computed: {
            formatedValues () {
                this.currentValue.forEach((v, i) => {
                    v.formatedUrl = utils.thumb(v.url);
                });
                return this.currentValue;
            },
            albumClass () {
                let cls = '';
                if (this.currentValue.length < 1) return cls;

                // 布局方式
                if (this.currentValue.length > 3) {
                    cls = 'more';
                } else if (this.currentValue.length > 2) {
                    cls = 'three';
                } else if (this.currentValue.length > 1) {
                    cls = 'two';
                } else {
                    cls = 'one';
                }

                // 根据第一张图，判断横还是纵
                cls += (this.currentValue[0].width >= this.currentValue[0].height) ? ' v' : ' h';

                return cls;
            }
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.initImages();
            }
        },

        created () {
//            logger.log('v-album created...');
            this.initImages();
        },

        methods: {
            initImages () {
                this.images = [];
                this.currentValue.forEach(v => {
                    this.images.push({
                        src: v.url || v.src,
                        w: v.width || v.w,
                        h: v.height || v.h
                    });
                });
            },
            handleClick (e, idx) {
                this.$logger.log('v-album.handleClick: ', ...arguments);
                this.$emit('click', ...arguments);
            },
            goViewer (idx) {
                this.$logger.log('v-album.goViewer: ', idx);
//                this.$root.img = this.imgList;
                this.$root.pages = [];
                this.currentValue.forEach((v, i) => {
                    this.$root.pages.push(v.url);
                });
                this.$logger.log(this.$root.pages, '---------v-album');
                this.$root.sliderinit = {currentPage: idx};
//                this.$root.sliderinit.currentPage = idx;
                this.$router.push({name: 'viewer'});
//                this.$router.push({name: 'slider'});
//                this.$router.push({name: 'swipe'});
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-album {
        width: 100%;

        img {
            width: 100%;
        }

        &.one {
            height: pxTorem(220px);
            position: relative;

            &.h {
                img {
                    height: initial;
                }
            }
        }

        &.two {
            /*@include box_flex;
            @include align_items(center);
            @include justify-content(space-between);*/
            display: flex;
            align-items: center;
            justify-content: space-between;

            &.v {
                /*height: pxTorem(383px);*/
                //                @include flex-direction-column;
                flex-direction: column;

                .v-album__frm {
                    width: 100%;
                    height: pxTorem(190px);

                    /*.v-album__img {*/
                    /*width: initial;*/
                    /*height: 100%;*/
                    /*}*/
                }
            }
            &.h {
                //                @include flex-direction-row;
                flex-direction: row;

                .v-album__frm {
                    width: pxTorem(186px);
                    height: pxTorem(186px);
                }
            }
        }

        &.three,
        &.more {
            /*@include box_flex;
            @include align_items(center);
            @include justify-content(space-between);*/
            display: flex;
            align-items: center;
            justify-content: space-between;

            &.v {
                /*height: pxTorem(302px);*/
                //                @include flex-direction-row;
                flex-direction: row;
                flex-wrap: wrap;

                .v-album__frm {
                    /*width: pxTorem(186px);*/
                    width: 50%;
                    height: pxTorem(109px);

                    &:first-child {
                        width: 100%;
                        height: pxTorem(190px);
                    }

                    /*.v-album__img {*/
                    /*width: 100%;*/
                    /*height: initial;*/
                    /*}*/
                }
            }
            &.h {
                height: pxTorem(175px);
                //                @include flex-direction-column;
                flex-direction: column;
                flex-wrap: wrap;

                .v-album__frm {
                    /*width: pxTorem(86px);*/
                    width: 24%;
                    /*height: pxTorem(86px);*/
                    height: 50%;

                    &:first-child {
                        /*width: pxTorem(286px);*/
                        width: 76%;
                        height: 100%;
                    }
                }
            }
        }
    }

    .v-album__frm {
        height: 100%;
        overflow: hidden;
        position: relative;
        border: #FFF 1px solid;

        /*@include box_flex;
        @include justify-content(center);
        @include align_items(center);*/
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /*.v-album__img {*/
    /*width: 100%;*/
    /*height: initial;*/
    /*}*/

    .v-album__mask,
    .v-album__num{
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
    }

    .v-album__mask {
        background: #000;
        // @include opacity(.5);
        opacity: .5;
    }
    .v-album__num {
        font-size: pxTorem(17px);
        color: #FFF;

        /*@include box_flex;
        @include align_items(center);
        @include justify-content(center);*/
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
