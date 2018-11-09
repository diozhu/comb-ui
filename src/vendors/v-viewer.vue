<template>
    <!-- Root element of PhotoSwipe. Must have class pswp. -->
    <div :id="id" class="pswp v-viewer" tabindex="-1" role="dialog" aria-hidden="true">
        <!-- Background of PhotoSwipe. It's a separate element as animating opacity is faster than rgba(). -->
        <div class="pswp__bg"></div>
        <!-- Slides wrapper with overflow:hidden. -->
        <div class="pswp__scroll-wrap">
            <!-- Container that holds slides.
                PhotoSwipe keeps only 3 of them in the DOM to save memory.
                Don't modify these 3 pswp__item elements, data is added later on. -->
            <div class="pswp__container">
                <div class="pswp__item"></div>
                <div class="pswp__item"></div>
                <div class="pswp__item"></div>
            </div>
            <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
            <div class="pswp__ui pswp__ui--hidden">
                <div class="pswp__top-bar">
                    <!--  Controls are self-explanatory. Order can be changed. -->
                    <div class="pswp__counter"></div>
                    <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>
                    <button class="pswp__button pswp__button--share" title="Share"></button>
                    <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                    <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
                    <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
                    <!-- element will get class pswp__preloader--active when preloader is running -->
                    <div class="pswp__preloader">
                        <div class="pswp__preloader__icn">
                        <div class="pswp__preloader__cut">
                            <div class="pswp__preloader__donut"></div>
                        </div>
                        </div>
                    </div>
                </div>
                <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                    <div class="pswp__share-tooltip"></div>
                </div>
                <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button>
                <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button>
                <div class="pswp__caption">
                    <div class="pswp__caption__center"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    // import Vue from 'vue';
    // import VueAwesomeSwiper from 'vue-awesome-swiper';
    // // mount with global
    // Vue.use(VueAwesomeSwiper);
    // mount with component(can't work in Nuxt.js/SSR)
    // import { swiper, swiperSlide } from 'vue-awesome-swiper';
    import bus from '../vendor/eventbus.js';
    import PhotoSwipe from 'photoswipe'; //eslint-disable-line
    import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default.js'; //eslint-disable-line
    // console.log('!!!!!!!!!!!!!!!!!!!', PhotoSwipe, PhotoSwipeUI_Default);

    export default {
        // components: { swiper, swiperSlide },

        name: 'viewer',

        props: {
            id: {
                type: String,
                default: 'vViewer'
            },
            value: {
                type: Array,
                default: () => []
            }
        },

        data () {
            return {
                swiper: '',
                initIndex: this.$route.query.idx || 0,
                images: [],

                imgStyle: {
                    transform: 'translate3d(0, 0, 0)',
                    width: '100%'
                },
                rote: 1,        // 默认放大比率
                maxRote: 3,      // 最大放大比率
                swiperOption: {
                    mode: 'horizontal',
                    initialSlide: this.$route.query.idx || 0,
                    observer: true,
                    observeParents: true,
                    touchMoveStopPropagation: true, // 不好使。。。首页的v-touch右划仍冲突，用上面的方式重新覆盖swiperight
                    zoom: true,
                    zoomMax: 3,
                    zoomMin: 1,
                    zoomToggle: true,
                    onSlideChangeEnd: function (e) { // 变更索引
                        this.initIndex = this.initIndex;
                    }
                }
            };
        },
        computed: {},

        mounted () {
            console.log('v-viewImage.mounted: ', this.initIndex, this.$root.img);
            this.$nextTick(() => {
                this.init();
            });
            // this.init();
            bus.$on('v-viewer.open', this.open); // 监听上拉加载事件
        },

        methods: {
            init () {
                console.log('v-viewer.init: ', this.images);
                // console.log('v-viewer.mounted: ', this.$root.img);
                if (!this.$root.img) this.$router.go(-1);
                // this.images = this.$root.img;
                this.images = [];
                this.$root.img.forEach(v => {
                    this.images.push({
                        src: v.url,
                        w: v.width * 2,
                        h: v.height * 2
                    });
                });
                this.open();
            },
            open () {
                // console.log('v-viewer.open: ', this.images);
                // this.galleryEle = document.querySelectorAll('.pswp')[0];
                this.galleryEle = document.getElementById(this.id);
                // console.log('v-viewer.open: ', this.galleryEle);
                this.galleryOptions = {
                    barsSize: { top: 44, bottom: 'auto' },
                    captionEl: false,
                    tapToClose: true,
                    tapToToggleControls: false,
                    pinchToClose: false,
                    closeOnScroll: false,
                    closeOnVerticalDrag: false,
                    shareEl: false, // 不显示分享图标
                    fullscreenEl: false, // 不显示全屏图标
                    closeEl: false, // 不显示关闭图标
                    history: false, // 不使用路由模式
                    index: this.initIndex // start at first slide
                };
                this.gallery = new PhotoSwipe(this.galleryEle, PhotoSwipeUI_Default, this.images, this.galleryOptions);

                let closeFunc = this.gallery.close;
                this.gallery.close = (params) => {
                    console.log('v-viewer.close: ');
                    closeFunc.call(this.gallery, params);
                    this.$router.go(-1);
                };
                console.log('v-viewer.open: ', this.gallery.close);
                this.gallery.init();
            },
            /**
             * index中用了右划翻页, 此处阻止冒泡.
             *              -- Author by Dio Zhu. on 2017.2.14
             */
            swipe: function (e) {
                console.log('swipe in viewImage...', this.swiper.activeIndex, this.swiper.previousIndex);
                e.srcEvent.stopPropagation();
                if (!this.swiper.previousIndex) {
                    this.$router.go(-1);
                }
            }
        }
    };

</script>
<style rel="stylesheet/scss" lang="scss">
    @import "~photoswipe/dist/photoswipe.css"; // get photoswipe.css
    @import "~photoswipe/dist/default-skin/default-skin.css"; // get photoswipe.css

    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-viewer {

        .pswp__top-bar {
            top: initial;
            bottom: 0;
            height: pxTorem(44px);

            .pswp__counter {
                height: pxTorem(44px);
                line-height: pxTorem(44px);
                font-size: pxTorem(13px);
                padding: 0 pxTorem(15px);
                left: 44%;
            }

            .pswp__button {
                background-size: pxTorem(264px) pxTorem(88px);
                width: pxTorem(44px);
                height: pxTorem(44px);
            }
            .pswp__button--close {
                background-position: 0 pxTorem(-44px);
            }
        }
    }

</style>
