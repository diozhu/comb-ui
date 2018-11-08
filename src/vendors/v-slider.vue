<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/_mixins";
    .slider-container {
        margin: 0 auto;
        overflow: hidden;
        position: fixed;
        z-index: 1;
        /*height: pxTorem(200px);*/
        /*height: 100%;*/
        width: 100%;
        white-space: nowrap;
    }
    .slider-wrapper {
        box-sizing: content-box;
        height: 100%;
        position: relative;
        transition-property: transform;
        width: 100%;
        z-index: 1;
        @include box_flex;
    }
    /*预览样式*/
    .slider-item {
        @include center(center);
        font-size: pxTorem(18px);
        background: #fff;
        overflow-x: hidden;
        overflow-y: auto;
        @include box_flex;
        @include pack(center);
        -webkit-justify-content: center;
        justify-content: center;
        @include align;
        -webkit-align-items: center;
        align-items: center;
        background: #000;
        flex-shrink: 0;
        height: 100%;
        position: relative;
        width: 100%;
    }
    .slider-item img {
        display: block;
        width: 100%;
        height: initial;
        margin: auto;
    }
    .slider-pagination {
        position: absolute;
        text-align: center;
        transform: translate3d(0px, 0px, 0px);
        /* transition: all 350ms ease 0s; */
        z-index: 10;
    }
    .slider-pagination-bullets{
        bottom: 10px;
        left: 0;
        width: 100%;
    }
    .slider-pagination-bullet{
        background: #000 none repeat scroll 0 0;
        border-radius: 100%;
        display: inline-block;
        height: 8px;
        opacity: 0.2;
        width: 8px;
        cursor: pointer;
        margin: 0 5px;
    }
    .slider-pagination-bullet-active {
        background: #fff none repeat scroll 0 0;
        opacity: 1;
    }
    .swiper-count{
        position: absolute;
        left:0;
        bottom: 0;
        height: pxTorem(44px);
        width: 100%;
        z-index:999;
        @include center(center);
        color:#fff;
        line-height:pxTorem(44px);
        font-size:pxTorem(19px);
    }
</style>

<template>
    <div class='slider-container' :class = 'basicdata.containerClass' :style="{'height': basicdata.height}">
        <div class="slider-wrapper"
             :style="styleobj"
             @touchmove="swipeMove"
             @touchstart="swipeStart"
             @touchend="swipeEnd"
             @webkitTransitionEnd = "onTransitionEnd"
             @transitionend = "onTransitionEnd"
        >
            <!-- 正常滚动 -->
            <template v-if="!sliderinit.loop">
                <!--预览-->
                <template v-for="item in pages" v-if="sliderinit.isPreview">
                    <div class="slider-item">
                        <img :src="item">
                    </div>
                </template>
                <!--带title的轮播图-->
                <template v-for="item in pages" v-else>
                    <div class="slider-item" v-if="item.title" :style="{background: 'url('+ item.url +')', 'background-size': 'cover', 'background-position': 'center', 'background-repeat': 'no-repeat'}">
                        {{item.title}}
                    </div>
                </template>
            </template>

            <!-- 无缝滚动 -->
            <template v-if="sliderinit.loop">
                <template>
                    <div class="slider-item" :style="{background: 'url('+ pages[pages.length-1].url +')', 'background-size': 'cover', 'background-position': 'center', 'background-repeat': 'no-repeat'}">{{pages[pages.length-1].title}}</div>
                </template>
                <!-- 无缝滚动copy最后项 -->
                <template v-for="item in pages">
                    <div class="slider-item" :style="{background: 'url('+ item.url +')', 'background-size': 'cover', 'background-position': 'center', 'background-repeat': 'no-repeat'}">{{item.title}}</div>
                </template>
                <!-- 无缝滚动copy第一项 -->
                <template>
                    <div class="slider-item" :style="{background: 'url('+ pages[0].url +')', 'background-size': 'cover', 'background-position': 'center', 'background-repeat': 'no-repeat'}">{{pages[0].title}}</div>
                </template>
            </template>


        </div>
        <!--预览底部的数字-->
        <div class="swiper-count" v-if="sliderinit.isPreview">
            <span>{{sliderinit.currentPage + 1}}</span><em>/</em><span>{{pages.length}}</span>
        </div>
        <!--轮播图小点-->
        <div class="slider-pagination slider-pagination-bullets" v-else>
            <template v-for="n in pagenums">
                <span @click='slide(n-1)' class="slider-pagination-bullet" :class="n-1 === sliderinit.currentPage? 'slider-pagination-bullet-active':''"></span>
            </template>
        </div>
    </div>
</template>

<script>
    import detectPrefixes from '../js/utils/detect-prefixes';
    export default {
        props: [],
        data () {
            return {
                basicdata: {
                    poswidth: '0',
                    posheight: '0',
                    start: {},
                    end: {},
                    sliderinit: {},
                    pages: [],
                    height: 0,
                    tracking: false,
                    animation: false,
                    containerClass: {
                        'swiper-container-vertical': false
                    },
                    setIntervalid: '',
                    prefixes: detectPrefixes(),
                    transitionEnding: false
                }
            };
        },
        created () {
            this.$logger.log(this.$root.pages, '-------this.$root.pages');
            this.$logger.log(this.$root.sliderinit, '-------this.$root.sliderinit');
            this.pages = this.$root.pages;
            this.sliderinit = this.$root.sliderinit;
        },
        computed: {
            // 动画执行obj
            styleobj: function () {
                let style = {};
                style['transform'] = 'translate3D(' + this.basicdata.poswidth + ',' + this.basicdata.posheight + ',0)';
                style[this.basicdata.prefixes.transition + 'TimingFunction'] = 'ease';
                style[this.basicdata.prefixes.transition + 'Duration'] = (this.basicdata.animation ? this.sliderinit.slideSpeed || 300 : 0) + 'ms';
                return style;
            },
            // pagenum滑动数
            pagenums: function () {
                return this.pages.length;
            },
            // 组件的核心，计算当前父级需要进行的偏移,每次要遍历节点
            currentWidth: {
                get: function () {
                    let $slider;
                    let lastPage = this.sliderinit.currentPage;

                    if (this.sliderinit.loop) {
                        lastPage = this.sliderinit.currentPage + 1;
                    }
                    // 获取slideritem子集
                    for (let item in this.$el.children) {
                        if (/slider-wrapper/ig.test(this.$el.children[item].className)) {
                            $slider = this.$el.children[item];
                        }
                    }
                    // 遍历子集
                    let $sliderChildren = $slider.children; // 取出slider下的所有item
                    this.$logger.log(lastPage, '最后一页数');
                    let offsetLeft = $sliderChildren[lastPage].offsetLeft;
                    if (this.sliderinit.loop) {
                        offsetLeft = $sliderChildren[lastPage].offsetLeft;
                    }
                    this.$logger.log(offsetLeft, '最后一页的offsetleft');
                    return offsetLeft;
                },
                set: function (value) {
                    return value;
                }
            }
        },
        mounted () {
            let that = this;
            // 起始跳到指定页 无样式
            that.slide(this.sliderinit.currentPage, 'animationnone');
            // 定制事件
            that.$on('slideTo', (num) => {
                this.slide(num);
            });
            that.$on('slideNext', () => {
                this.next();
            });
            that.$on('slidePre', () => {
                this.pre();
            });
            /* 设置高度 */
            if (that.sliderinit.isPreview) {
                that.basicdata.height = 100 + '%';
            } else if (!that.sliderinit.isPreview && that.sliderinit.height) {
                that.basicdata.height = that.sliderinit.height / 37.5 + 'rem';
            }
            this.$logger.log(that.height);
            // 自动轮播 支持无缝滚动
            that.clock().begin(that);
        },
        methods: {
            swipeStart (e) {
                // let that = this;
                if (this.basicdata.transitionEnding) {
                    return;
                }
                this.basicdata.animation = false;
                // 暂停自动滚动
                if (this.sliderinit.autoplay) {
                    let that = this;
                    this.clock().stop(that);
                }
                // 阻止页面滚动
                // document.addEventListener('touchmove', that.preventDefault(e));
                this.$logger.log(e, 'v-slider');
                if (e.type === 'touchstart') {
                    if (e.touches.length > 1) {
                        this.basicdata.tracking = false;
                        return;
                    } else {
                        this.basicdata.tracking = true;
                        /* Hack - would normally use e.timeStamp but it's whack in Fx/Android */
                        this.basicdata.start.t = new Date().getTime();
                        this.basicdata.start.x = e.targetTouches[0].clientX;
                        this.basicdata.start.y = e.targetTouches[0].clientY;
                        this.basicdata.end.x = e.targetTouches[0].clientX;
                        this.basicdata.end.y = e.targetTouches[0].clientY;
                    }
                }
            },
            swipeMove (e) {
                if (this.basicdata.tracking) {
                    if (e.type === 'touchmove') {
                        e.preventDefault();
                        this.basicdata.end.x = e.targetTouches[0].clientX;
                        this.basicdata.end.y = e.targetTouches[0].clientY;
                    }
                    this.$logger.log(this.basicdata.end.x - this.basicdata.start.x, '移动的距离');
                    this.$logger.log(this.currentWidth, '宽度');
                    this.basicdata.poswidth = -(this.currentWidth) + this.basicdata.end.x - this.basicdata.start.x + 'px';
                    this.$logger.log(this.basicdata.poswidth, '最后的距离');
                }
            },
            swipeEnd (e) {
                this.basicdata.tracking = false;
                let now = new Date().getTime();
                let deltaTime = now - this.basicdata.start.t;
                this.$logger.log(deltaTime, '移动的时间');
                let deltaX = this.basicdata.end.x - this.basicdata.start.x;
                this.$logger.log(deltaX, 'deltaX');
                if (deltaX === 0) {
                    window.history.back();
                    return;
                }
                let deltaY = this.basicdata.end.y - this.basicdata.start.y;

                // 自动滚动重启
                if (this.sliderinit.autoplay) {
                    let that = this;
                    setTimeout(function () {
                        that.clock().begin(that);
                    }, this.sliderinit.autoplay);
                }

                // 解除阻止
                document.removeEventListener('touchmove', this.preventDefault(e));
                /* work out what the movement was */
                if (deltaTime > this.sliderinit.thresholdTime) {
                    this.slide(this.sliderinit.currentPage);
                    /* gesture too slow */
                    return;
                }
                if ((deltaX > this.sliderinit.thresholdDistance) && (Math.abs(deltaY) < this.sliderinit.thresholdDistance)) { // 滑动的距离大于滑动距离的阈值
                    // swipe right //delatX为正数
                    this.pre();
                    return;
                } else if ((-deltaX > this.sliderinit.thresholdDistance) && (Math.abs(deltaY) < this.sliderinit.thresholdDistance)) {
                    // swipe left deltaX为负数
                    this.next();
                    return;
                }
            },
            pre () {
                if (this.sliderinit.currentPage >= 1) {
                    this.sliderinit.currentPage -= 1;
                    this.slide();
                } else if (this.sliderinit.loop && this.sliderinit.currentPage === 0) {
                    this.sliderinit.currentPage -= 1;
                    this.basicdata.transitionEnding = true;
                    this.slide();
                } else {
                    this.slide();
                }
            },
            next () {
                if (this.sliderinit.currentPage < this.pagenums - 1) {
                    this.sliderinit.currentPage += 1;
                    this.slide();
                } else if (this.sliderinit.loop && this.sliderinit.currentPage === this.pagenums - 1) {
                    this.sliderinit.currentPage += 1;
                    this.basicdata.transitionEnding = true;
                    this.slide();
                } else {
                    this.slide();
                }
            },
            slide (pagenum, type) {
                let that = this;
                // 执行动画
                that.basicdata.animation = true;
                // 无样式滚动
                if (type === 'animationnone') {
                    that.basicdata.animation = false;
                }
                if (pagenum || pagenum === 0) {
                    that.sliderinit.currentPage = pagenum;
                }

                that.basicdata.poswidth = -that.currentWidth + 'px';
                this.$logger.log(that.currentWidth, '最后的宽度slider');

                // 广播事件
                if (that.sliderinit.currentPage < 0 || that.sliderinit.currentPage >= that.pagenums) {
                    return;
                }
                that.$emit('slide', that.sliderinit.currentPage);
            },
            clock: function () {
                // 暂时这么写，写了自调用，但是vue不支持，欢迎小伙伴提供新的思路
                return {
                    begin: function (that) {
                        if (that.sliderinit.autoplay) {
                            if (that.basicdata.setIntervalid) {
                                return;
                            }
                            that.basicdata.setIntervalid = setInterval(function () {
                                that.next();
                                if (that.sliderinit.currentPage === that.pagenums - 1 && !that.sliderinit.loop) {
                                    clearInterval(that.basicdata.setIntervalid);
                                    that.basicdata.setIntervalid = 0;
                                }
                            }, that.sliderinit.autoplay);
                        }
                    },
                    stop: function (that) {
                        clearInterval(that.basicdata.setIntervalid);
                        that.basicdata.setIntervalid = 0;
                    }
                };
            },
            // 阻止页面滚动
            preventDefault (e) {
                e.preventDefault();
            },
            // 无限循环中transitionEnd
            onTransitionEnd () {
                if (this.sliderinit.loop) {
                    this.basicdata.transitionEnding = false;
                    if (this.sliderinit.currentPage < 0) {
                        this.slide(this.pagenums + this.sliderinit.currentPage, 'animationnone');
                    } else if (this.sliderinit.currentPage >= this.pagenums) {
                        this.slide(0 + this.sliderinit.currentPage - this.pagenums, 'animationnone');
                    }
                }
            }
        }
    };
</script>
