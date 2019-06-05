<template>
    <div class="v-swipe"
         v-swipe="swipe"
         :swipe-direction="['left', 'right']"
         swipe-distance="20"
         swipe-prevent-default="true"
         swipe-stop-propagation="true"
         handle-touch-start="handleTouchStart"
         handle-touch-move="handleTouchMove"
         handle-touch-end="handleTouchEnd"
         handle-tap="handleTap"
         handle-double-tap="handleDoubleTap"
    >
        <v-swipe-item ref="items" v-for="(item, index) in listdata" :value="item" :key="index" @click="handleClick"></v-swipe-item>
    </div>
</template>
<script type="text/ecmascript-6">
    import * as dom from '../js/utils/dom.js';
    import vSwipe from './v-swipe.js';
    import vSwipeItem from './v-swipe-item.vue';
    import * as utils from '../js/utils/utils.js';
    /**
     *              -- Author by Dio Zhu. on 2017.3.27
     */
    export default {
        name: 'v-swipe',

        components: { vSwipeItem },
        directives: { vSwipe },

        props: {
        },

        data () {
            return {
                speed: 100,
                listdata: [],
                idx: 0
            };
        },

        computed: {
        },

        watch: {
            '$route.name' (val) { // 如果使用了keep-alive，根据路由变化，判断组件的_inactive，设置isEnabled，避免事件重复触发
                if (!this._inactive) { // 激活
                    console.log('v-swipe.watch.in...');
                } else { // 失效
                    console.log('v-swipe.watch.back...');
                }
            }
        },

        created () {
            console.log('v-swipe.created: listdata: ', this.listdata);
            // 测试数据 start
            if (!this.$root.swipes) {
                this.$root.swipes = {
                    idx: 2,
                    list: [
                        { formatedUrl: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', url: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', width: 3264, height: 2448 },
                        { formatedUrl: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', url: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', width: 2448, height: 3264 },
                        { formatedUrl: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', url: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', width: 2448, height: 3264 },
                        { formatedUrl: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', url: 'http://hy-sport-img.b0.upaiyun.com/upload_image/31383bcec5c838fbc9ca7b7bdaf42d08b75dc1d2.png', width: 2448, height: 3264 }
                    ]
                };
            }
            // 测试数据 end

            if (!this.$root.swipes) this.$router.go(-1); // 无值返回上一页
            this.listdata = this.$root.swipes.list;
            this.idx = this.$root.swipes.idx || 0;
            console.log('v-swipe.created: listdata: ', this.listdata, this.idx);
        },

        mounted () {
            this.init();
        },

        methods: {
            init () {
                console.log('v-swipe.init...');
                if (this.idx >= 0) {
                    this.goSlide();
                }
            },
            goSlide (direction) {
                console.log('v-swipe.slideTo...', this.idx, ...arguments);

                let currentItem = this.$refs.items[this.idx].$el,
                    nextItem,
                    ItemWidth = currentItem.clientWidth,
                    currentOffsetLeft = 0,
                    nextOffsetLeft = 0,
                    speed = this.speed,
                    newIndex = this.idx;

                if (direction === 'left') {
                    newIndex = this.idx < this.$refs.items.length ? this.idx + 1 : this.$refs.items.length;
                    currentOffsetLeft = -ItemWidth;
                } else if (direction === 'right') {
                    newIndex = this.idx > 0 ? this.idx - 1 : 0;
                    currentOffsetLeft = ItemWidth;
                } else {
                    // do nothing ...
                    newIndex = this.idx;
                }

                nextItem = this.$refs.items[newIndex].$el;
                console.log('v-swipe.slideTo...', this.idx, newIndex, currentItem, nextItem);
                if (direction) {
                    // currentItem.style.display = 'block';
                    dom.addClass(currentItem, 'is-active');
                    let callback = () => {
                        console.log('v-swipe.goSlide.currentItem.callback: ', currentItem);
                        dom.removeClass(currentItem, 'is-active');
                        this.idx = newIndex;
                    };
                    this.translate(currentItem, currentOffsetLeft, speed, callback);
                }
                // nextItem.style.display = 'block';
                dom.addClass(nextItem, 'is-active');
                let nextCallback = () => {
                    console.log('v-swipe.goSlide.nextItem.callback: ', nextItem);
                    nextItem.style.transform = `translate3d(0, 0, 0)`;
                };
                this.translate(nextItem, nextOffsetLeft, speed, nextCallback);
            },
            translate (element, offset, speed, callback) {
//                console.log('v-swipe.translate...', ...arguments);
                if (speed) {
                    this.animating = true;
                    // element.style.webkitTransition = '-webkit-transform ' + speed + 'ms ease-in-out';
                    element.style.transition = '-webkit-transform ' + speed + 'ms ease-in-out';
                    setTimeout(() => {
                        // element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
                        element.style.transform = `translate3d(${offset}px, 0, 0)`;
                    }, 50);

                    let called = false,
                        transitionEndCallback = () => { //eslint-disable-line
                            if (called) return;
                            called = true;
                            this.animating = false;
                            // element.style.webkitTransition = '';
                            // element.style.webkitTransform = '';
                            if (callback) {
                                callback.apply(this, arguments);
                            }
                            console.log('v-swipe.translate...cb...', element.style.webkitTransform);
                        };

                    dom.once(element, 'webkitTransitionEnd', transitionEndCallback);
                    setTimeout(transitionEndCallback, speed + 100); // webkitTransitionEnd maybe not fire on lower version android.
//                    console.log('v-swipe.translate...', element.style.webkitTransform);
                } else {
                    element.style.webkitTransition = '';
                    element.style.webkitTransform = `translate3d(${offset}px, 0, 0)`;
                }
            },

            swipe () {
                console.log('v-swipe.swipe...');
            },

            onPinch (e, direction, positions) { // 双指缩放
                // 依照pinch距离与屏幕宽比进行缩放，100% ~ 300%
                let obj = e.target,
                    currentSize = utils.getComputedStyle(obj).backgroundSize, // contain = 300%
                    w = window.lib.flexible.rem * 10, // 使用flexible计算的屏幕宽度
                    ratio = Math.round(positions.dist / (2 * w) * 100),
                    currentRatio = currentSize.indexOf('%') > -1 ? currentSize.substr(0, currentSize.indexOf('%')) * 1 : 100,
                    r;

                // console.log(`v-swipe.handleTouchMove..., pinch: ${currentRatio} => ${ratio}`);
                if (positions.dist === 'pinchout') { // 放
                    // r = (currentRatio + ratio) > 300 ? 300 : (currentRatio + ratio);
                    r = currentRatio + ratio;
                } else { // 缩
                    r = currentRatio - ratio;
                }
                if (r > 300) r = 300;
                if (r < 100) r = 100;
                // obj.style.backgroundSize = r === 100 ? 'contain' : r + '%';
                if (r === 100) { // 还原
                    obj.style.backgroundSize = 'contain';
                    obj.style.backgroundPosition = '50% 50%';
                } else {
                    obj.style.backgroundSize = r + '%';
                }
            },
            onPinchMove (e, direction, positions) { // 缩放后的图，滑动位移
                let obj = e.target,
                    currentSize = utils.getComputedStyle(obj).backgroundSize, // contain = 300%
                    pos = utils.getComputedStyle(obj).backgroundPosition.split('%'), // 默认：50% 50%，范围：0% ~ 100%
                    // ratio = currentSize.substr(0, currentSize.length - 1),
                    ratio = parseFloat(currentSize),    // 当前缩放比
                    targetW = parseInt(utils.getComputedStyle(obj).width),
                    targetH = parseInt(utils.getComputedStyle(obj).height),
                    maxX = targetW * ratio,
                    maxY = targetH * ratio,
                    distRatioX = -(positions.x / maxX) * window.lib.flexible.dpr * 2,
                    distRatioY = -(positions.y / maxY) * window.lib.flexible.dpr * 2,
                    fx = parseFloat(pos[0]) + (distRatioX * 100),
                    fy = parseFloat(pos[1]) + (distRatioY * 100);
                // console.log(`v-swipe.handleTouchMove => pic move: `, currentSize, maxX, pos, positions);
                // console.log(`v-swipe.handleTouchMove => pic move: 222: `, targetW, distRatioX);
                // console.log(`v-swipe.handleTouchMove => pic move: 333 : `, parseFloat(pos[0]), (distRatioX * 100));
                if (fx < 0) fx = 0;
                if (fx > 100) fx = 100;
                if (fy < 0) fy = 0;
                if (fy > 100) fy = 100;
                obj.style.backgroundPosition = (fx) + '% ' + (fy) + '%';
            },
            onSlide (e, direction, positions) { // 滑动切换图片
                let currentPage = this.$refs.items[this.idx].$el,
                    clientWidth = currentPage.clientWidth,
//                    currentOffset = this.idx * clientWidth,
                    currentOffset = 0,
                    nextOffset = 0,
                    nextPage;
                if (direction === 'left') {
                    nextPage = this.idx < this.$refs.items.length ? this.$refs.items[this.idx + 1].$el : this.$refs.items[this.$refs.items.length].$el;
                    nextOffset = clientWidth + positions.x;
                } else if (direction === 'right') {
                    nextPage = this.idx > 0 ? this.$refs.items[this.idx - 1].$el : this.$refs.items[0].$el;
                    nextOffset = -clientWidth + positions.x;
                }
                this.translate(currentPage, currentOffset + positions.x, 100);
                this.translate(nextPage, nextOffset, 100);
                dom.addClass(currentPage, 'is-active');
                dom.addClass(nextPage, 'is-active');
            },
            handleTouchStart (e) {
//                this.currentPage = e.target;
                console.log('v-swipe.handleTouchStart...');
            },
            handleTouchMove (e, direction, positions) {
                console.log(`v-swipe.handleTouchMove..., ${direction}, ${JSON.stringify(positions)}`);
                let currentSize = utils.getComputedStyle(e.target).backgroundSize; // contain = 300%
                if (direction === 'pinchin' || direction === 'pinchout') { // 缩放
                    this.onPinch(e, direction, positions);
                } else if (currentSize !== 'contain') { // 缩放状态下，移动图片，而不是切换
                    this.onPinchMove(e, direction, positions);
                } else { // 切换
                    this.onSlide(e, direction, positions);
                }
            },
            handleTouchEnd (e, direction, positions) {
                console.log('v-swipe.handleTouchEnd...', ...arguments);
                let obj = e.target,
                    currentSize = utils.getComputedStyle(obj).backgroundSize; // contain = 300%
                if (currentSize !== 'contain') { // 移动图片
                    // do nothing...
                } else { // 切换图片
                    this.goSlide(direction);
                }
            },
            handleTap (e) { // 点击图片返回上一页
                console.log('v-swipe.handleTap: ', e);
                this.$router.go(-1);
            },
            handleDoubleTap (e) { // 双击击图片恢复原始大小
                console.log('v-swipe.handleDoubleTap: ', e);
            },
            handleClick () {
                console.log('v-swipe.handleClick: ');
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-swipe {
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
    }
</style>
