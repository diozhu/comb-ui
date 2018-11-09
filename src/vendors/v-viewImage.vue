<template>
    <!-- <div class="swiper-container swiperContainer" id="viewImage">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="item in imageUrls">
                <div class="swiper-zoom-container">
                    <img :src="item.url || item" alt="" :style="imgStyle">
                </div>
            </div>
        </div>
        <div class="swiper-count">
            <span>{{initIndex+1}}</span><em>/</em><span>{{imageUrls.length}}</span>
        </div>
    </div> -->

    <div class="swiper-container swiperContainer">
        <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="item in imageUrls">
                <div class="swiper-zoom-container">
                    <img :src="item.url || item" alt="">
                </div>
            </div>
            <!-- <div class="swiper-slide">
                <div class="swiper-zoom-container">
                    <img src="http://lorempixel.com/800/800/sports/1">
                </div>
            </div> -->
            <!-- <div class="swiper-slide">
                <div class="swiper-zoom-container">
                    <img src="http://lorempixel.com/800/400/sports/2">
                </div>
            </div>
            <div class="swiper-slide">
                <div class="swiper-zoom-container">
                    <img src="http://lorempixel.com/400/800/sports/3">
                </div>
            </div> -->
        </div>
	<!-- Add Pagination -->
	    <!-- <div class="swiper-pagination swiper-pagination-white"></div> -->
        <div class="swiper-count">
            <span>{{initIndex+1}}</span><em>/</em><span>{{imageUrls.length}}</span>
        </div>
	<!-- Add Navigation -->
        <!-- <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div> -->
	</div>
</template>

<script>
    //    require('../../static/js/vendor/swiper-3.4.1.min'); // get swiper.js
    // import * as utils from '../js/utils/utils.js';
    import Swiper from '../../static/js/vendor/swiper-3.4.2.min.js';

    export default {
        name: 'viewer',
        components: {

        },
        props: {
        },

        data () {
            return {
                swiper: '',
                initIndex: this.$route.query.idx || 0,
                imageUrls: [],

                imgStyle: {
                    transform: 'translate3d(0, 0, 0)',
                    width: '100%'
                },
                rote: 1,        // 默认放大比率
                maxRote: 3      // 最大放大比率
            };
        },

        mounted () {
            console.log('v-viewImage.mounted: ', this.initIndex, this.$root.img);
            this.$nextTick(() => {
                this.init();
            });
            // this.init();
        },
        computed: {

        },

        methods: {
            init () {
                if (!this.$root.img) this.$router.go(-1);

                let self = this;
                self.imageUrls = self.$root.img;

                if (self.swiper) {
                    self.swiper.destroy(false);
                    self.swiper = null;
                }
                self.swiper = new Swiper('.swiperContainer', {
                    mode: 'horizontal',
    //                initialSlide: self.initIndex,
                    initialSlide: self.$route.query.idx || 0,
                    observer: true,
                    observeParents: true,
                    touchMoveStopPropagation: true, // 不好使。。。首页的v-touch右划仍冲突，用上面的方式重新覆盖swiperight
                    zoom: true,
                    zoomMax: 3,
                    zoomMin: 1,
                    zoomToggle: true,
                    onSlideChangeEnd: function (e) { // 变更索引
                        self.initIndex = self.swiper ? self.swiper.activeIndex : self.initIndex;
                    }
                    // onTouchStart: function (o, e) {
                    //     self.onTouchStart(o, e);
                    // },
                    // onTouchMove: function (o, e) {
                    //     self.onTouchMove(o, e);
                    // },
                    // onTouchEnd: function (o, e) {
                    //     self.onTouchEnd(o, e);
                    // }

                    // onTouchStart: function (o, e) { // 判断手势
                    //     self.$logger.log('v-viewImage.swiper.onTouchStart: ');
                    //     self.direction = ''; // 手势类型，touchmove、touchend的时候返回，用于逻辑判断，包含：top、bottom、left、right、pinchin、pinchout
                    //     self.startTouches = self.currentTouches = []; // 手势起始触点
                    //     let now = new Date().getTime(),
                    //         delta = now - (self.tsTouchStart || now);
                    //     self.isDoubleTap = (delta > 0 && delta < self.tapMaxTime);
                    //     self.tsTouchStart = now;
                    //     [].forEach.call(e.touches, v => { self.startTouches.push({ clientX: v.clientX, clientY: v.clientY }); }); // 全部保存
                    //     self.fingerType = e.touches.length > 1 ? 'pinch' : 'swipe'; // 确定手势
                    // },
                    // onTouchMove: function (o, e) { // 判断手势、方向
                    //     self.$logger.log('v-viewImage.swiper.onTouchMove: ', self.fingerType, self.swiper.noSwiping);
                    //     // 根据上一次的手势判断当前的pinch类型，如果类型变化，需重置起始位置（startTouches），目的是确保每次缩放都是针对上次的
                    //     self.oldTouches = self.currentTouches ? self.currentTouches.slice(0) : self.startTouches.slice(0);
                    //     self.currentTouches = []; // 手势起始触点
                    //     [].forEach.call(e.touches, v => { self.currentTouches.push({ clientX: v.clientX, clientY: v.clientY }); }); // 全部保存
                    //     let x = self.currentTouches[0].clientX - self.startTouches[0].clientX,
                    //         y = self.currentTouches[0].clientY - self.startTouches[0].clientY,
                    //         dist = 0;
                    //     if (self.fingerType === 'pinch') {
                    //         // if (!self.swiper.noSwiping) self.swiper.noSwiping = true;
                    //         self.swiper.lockSwipes();
                    //         let oldDist = self._getPinchDist(self.oldTouches, self.currentTouches);
                    //         if ((self.direction === 'pinchout' && oldDist > 0) || (self.direction === 'pinchin' && oldDist <= 0)) {
                    //             self.startTouches = self.oldTouches.slice(0);
                    //         }
                    //         dist = self._getPinchDist(self.startTouches, self.currentTouches);
                    //         if (dist > 0) {
                    //             self.direction = 'pinchin';
                    //         } else {
                    //             self.direction = 'pinchout';
                    //         }
                    //         self.onPinch(e, self.direction, {x: x, y: y, dist: dist});
                    //     } else {
                    //         // if (self.swiper.noSwiping) self.swiper.noSwiping = false;
                    //         // if (e.target.style.width !== '100%') self.swiper.noSwiping = true;
                    //         if (e.target.style.width === '100%') self.swiper.unlockSwipes();
                    //         // self.$logger.log('v-viewImage.swiper.onTouchMove: ', e.target.style.width, self.swiper.noSwiping);
                    //         self.onPinchMove(e, self.direction, {x: x, y: y, dist: dist});
                    //     }
                    // },
                    // onTouchEnd: function (o, e) { // 判断手势、方向
                    //     self.$logger.log('v-viewImage.swiper.onTouchEnd: ', e.touches.currentX, e.touches.startX);
                    //     // if (e.zoom.currentScale !== 1) {
                    //     //     self.$logger.log('v-viewImage.swiper.zoom.onTouchEnd: ', e.touches);
                    //     //     return false;
                    //     // }
                    //     // 第一张再右滑就返回上一页
                    //     if (!self.initIndex && (o.touches.currentX - o.touches.startX > 10)) self.$router.go(-1);
                    // },

                    // onTap: function (e) {
                    //     self.$logger.log('v-viewImage.swiper.onTap: ', e);
                    // },
                    // onDoubleTap: function (e) {
                    //     self.$logger.log('v-viewImage.swiper.onDoubleTap: ', e);
                    // }
                });
    //            logger.log('v-viewImage.mounted: ', this.$root.img, this.swiper);
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
            },

            onTouchStart (o, e) {
                console.log('v-viewImage.swiper.onTouchStart: ');
                this.fingerType = e.touches.length > 1 ? 'pinch' : 'swipe'; // 确定手势
            },
            onTouchMove (o, e) {
                console.log('v-viewImage.swiper.onTouchMove: ', this.fingerType);
            },
            onTouchEnd (o, e) {
                console.log('v-viewImage.swiper.onTouchEnd: ');
            }
            // goToPre () {
            //     window.history.back();
            // },

//             pinchIn (e) { // 根据移动距离计算比率
// //                console.log('v-viewImage.pinchIn: ', e.distance);
//                 this.rote = (this.rote - e.distance / 60) > 1 ? this.rote - e.distance / 60 : 1;
//                 this.$set(this.imgStyle, 'width', this.rote * 100 + '%');
//                 console.log('v-viewImage.pinchIn: ', this.imgStyle.width);
//             },
//             pinchOut (e) {
// //                console.log('v-viewImage.pinchOut: ', e.distance);
//                 this.rote = (this.rote + e.distance / 60) < this.maxRote ? this.rote + e.distance / 60 : this.maxRote;
// //                this.imgStyle.width = this.rote * 100 + '%';
//                 this.$set(this.imgStyle, 'width', this.rote * 100 + '%');
//                 console.log('v-viewImage.pinchOut: ', this.imgStyle.width);
//             },

//             panStart (e) {
//                 console.log('v-viewImage.panStart: ');
//                 this.startX = e.srcEvent.touches ? e.srcEvent.touches[0].clientX : e.srcEvent.clientX;
//                 this.startY = e.srcEvent.touches ? e.srcEvent.touches[0].clientY : e.srcEvent.clientY;
// //                this.domLeft =
//             },
//             panMove (e) {
//                 console.log('v-viewImage.panMove: ', e);
//             },
//             panEnd (e) {
//                 console.log('v-viewImage.panEnd: ', e);
//             },
//             _getPinchDist (startTouchs, currentTouchs) {
//                 // console.log('#############', startTouchs, currentTouchs);
//                 if (!startTouchs || !currentTouchs || startTouchs.length < 2 || currentTouchs.length < 2) return NaN;
//                 let startCalX = startTouchs[0].clientX - startTouchs[1].clientX,
//                     startCalY = startTouchs[0].clientY - startTouchs[1].clientY,
//                     startDis = Math.pow(startCalX * startCalX + startCalY * startCalY, 0.5),
//                     currentCalX = currentTouchs[0].clientX - currentTouchs[1].clientX,
//                     currentCalY = currentTouchs[0].clientY - currentTouchs[1].clientY,
//                     currentDis = Math.pow(currentCalX * currentCalX + currentCalY * currentCalY, 0.5);
//                 return (startDis - currentDis);
//             },
//             onPinch (e, direction, positions) { // 缩放后的图，滑动位移
//                 // 依照pinch距离与屏幕宽比进行缩放，100% ~ 300%
//                 let obj = e.target,
//                     // currentSize = utils.getComputedStyle(obj).width, // contain = 300%
//                     currentSize = obj.style.width, // contain = 300%
//                     w = window.lib.flexible.rem * 10, // 使用flexible计算的屏幕宽度
//                     ratio = Math.round(positions.dist / (2 * w) * 100),
//                     currentRatio = currentSize.indexOf('%') > -1 ? currentSize.substr(0, currentSize.indexOf('%')) * 1 : 100,
//                     r;

//                 if (positions.dist === 'pinchout') { // 放
//                     // r = (currentRatio + ratio) > 300 ? 300 : (currentRatio + ratio);
//                     r = currentRatio + ratio;
//                 } else { // 缩
//                     r = currentRatio - ratio;
//                 }
//                 if (r > 300) r = 300;
//                 // obj.style.backgroundSize = r === 100 ? 'contain' : r + '%';
//                 // console.log(`v-viewImage.onPinch..., pinch: ${currentRatio} => ${ratio}`, r);
//                 if (r <= 100) { // 还原
//                     // obj.style.backgroundSize = 'contain';
//                     // obj.style.backgroundPosition = '50% 50%';
//                     this.imgStyle.width = '100%';
//                 } else {
//                     // obj.style.backgroundSize = r + '%';
//                     this.imgStyle.width = r + '%';
//                 }
//             },
//             onPinchMove (e, direction, positions) { // 缩放后的图，滑动位移
//                 let distX = parseInt((positions.x)),
//                     distY = parseInt((positions.y)),
//                     obj = e.target,
//                     minX = -(parseInt(utils.getComputedStyle(obj).width) - document.body.offsetWidth) / 2,
//                     maxX = 0,
//                     minY = -(parseInt(utils.getComputedStyle(obj).height) - document.body.offsetHeight) / 2,
//                     maxY = (parseInt(utils.getComputedStyle(obj).height) - document.body.offsetHeight) / 2,
//                     reg = /([-0-9\.]+)px\s?,\s?([-0-9\.]+)px\s?,\s?([-0-9\.]+)px\s?/ig,
//                     oldPos = reg.exec(obj.style.transform),
//                     oldX = parseInt(oldPos[0]) || 0,
//                     oldY = parseInt(oldPos[1]) || 0;
//                     // fx = parseFloat(pos[0]) + (distRatioX * 100),
//                     // fy = parseFloat(pos[1]) + (distRatioY * 100);
//                 distX += oldX;
//                 distY += oldY;
//                 if (distX < minX) distX = minX;
//                 if (distX > maxX) distX = maxX;
//                 if (distY < minY) distY = minY;
//                 if (distY > maxY) distY = maxY;
//                 console.log(`v-swipe.handleTouchMove => pic move: `, oldX, oldY, distX, distY, ' ::: ', minX, maxX, minY, maxY);
//                 // console.log(`v-swipe.handleTouchMove => pic move: 222: `, targetW, distRatioX);
//                 // console.log(`v-swipe.handleTouchMove => pic move: 333 : `, parseFloat(pos[0]), (distRatioX * 100));
//                 this.imgStyle.transform = 'translate3d(' + (distX) + 'px, ' + (distY) + 'px, 0)';
//                 // this.imgStyle.WebkitTransform = 'translate3d(' + distX + 'px, ' + distY + 'px, 0)';
//             }
        }
    };

</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../../static/js/vendor/swiper-3.4.2.min.css"; // get swiper.css

    @import "../scss/variables";
    @import "../scss/_mixins";

    .swiper-container {
        width: 100%;
        height: 100%;
        /*@include absolute(absolute);*/
        position: fixed;
        left: 0;
        top: 0;
        overflow-x: hidden;
        overflow-y: auto;

    }

    .swiper-slide {
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
    }
    .swiper-slide img {
        display: block;
        width: 100%;
        height: initial;
        margin: auto;
        position: absolute;
        left: 0;
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
