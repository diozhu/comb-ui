<template>
    <!--v-on:tap="onTap" v-bind:tap-options="{threshold: 10}"-->
    <!--<v-touch ref="touch" :id="id" class="v-swipe-label"-->
    <!--v-on:swiperight="swipe" v-bind:swipe-options="{ direction: 'horizontal' }"-->
    <!--&gt;-->
    <!-- <div class="v-swipe-label" :class="{sticky: fixed && isSticky}"> -->
    <div :class="['v-swipe-label', {dark}]">
        <!--<div ref="container" class="v-swipe-label__container" :class="floatClass"-->
        <!--@touchstart.stop="touchStart" @touchmove.stop="touchMoving" @touchend.stop="touchEnd"-->
        <!-- <div ref="container" class="v-swipe-label__container" :class="{fixed: fixed && isFixed}" @touchend.stop> -->
        <!--  @touchstart.stop -->
        <div ref="container" class="v-swipe-label__container" @touchmove.stop @touchend.stop>
            <!-- <div ref="container" class="v-swipe-label__container" @touchstart.stop.prevent @touchmove.stop.prevent @touchend.stop.prevent> -->
            <!--<div class="v-swipe-label__content" :style="conStyle">-->
            <div ref="content" class="v-swipe-label__content" :style="{left: left + 'px'}">
                <!--<div ref="content" class="v-swipe-label__content" :style="{transform: 'translate3d(' + left + 'px, 0, 0)'}">-->
                <slot></slot>
            </div>
            <p v-if="showBottomLine" class="line"></p>
        </div>
        <!--<div :style="{clear: 'both', height: '1px'}"></div>-->
    </div>
    <!--<p>{{conStyle}}</p>-->
    <!--</v-touch>-->
</template>
<script>
    //    require('../../static/js/vendor/zepto.min'); // get zepto
    //    require('../../static/js/vendor/jquery.slim.min');
    //    require('exports-loader?$=jQuery!../../static/js/vendor/jquery.1.4.2.min');
    //    require('exports-loader?file!../../static/js/vendor/jquery.sticky'); // get jquery.sticky
    //    require('../../static/js/vendor/jquery.slim.min');
    //    require('../../static/js/vendor/jquery.sticky');
    //    import $ from 'jquery';
    //    import '../../static/js/vendor/jquery.sticky';
    //    import vSticky from '../vendor/v-sticky';

    /**
     * 滑动菜单
     *              -- Author by Dio Zhu. on 2017.2.14
     * 添加了fixed，默认false，设定true时，可根据滚动距离使当前菜单浮动置顶
     *              -- Author by Dio Zhu. on 2017.3.27
     */
    export default {
        name: 'v-swipe-label',

//        directives: { 'sticky': vSticky },
        props: {
            id: String,
            fixed: {
                type: Boolean,
                default: false
            },
            showBottomLine: {
                type: Boolean,
                default: false
            },
            dark: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                position: 0,     // 当前组件所在文档的位置，滚动时保存，避免脱离文档流后找不到对照点
                isSticky: false, // sticky方式浮动
                isFixed: false, // fixed方式浮动
                floatClass: '', // 浮动class，根据机型使用fixed或sticky
                startX: 0, // 初始位置
                lastX: 0, // 上一次位置

                lastMoveTime: 0, // 缓动
                lastMoveStart: 0, // 缓动
                stopMovingTag: false, // 缓动

                minl: 0,        // 滑动区间
                maxl: -8000,
                conStyle: {
                    left: '0px'
                },
                left: 0
            };
        },

        computed: {
            oh () {
                return this.$el.getBoundingClientRect().top;
            }
        },

        watch: {
            '$route.name' (val) { // 如果使用了keep-alive，根据路由变化，判断组件的_inactive，设置isEnabled，避免事件重复触发
                if (!this.fixed) return;
                if (!this._inactive) { // 激活
                    console.log('v-swipe-label.watch.in...');
                    window.addEventListener('scroll', this.scrollHandle);
                } else { // 失效
                    console.log('v-swipe-label.watch.back...');
                    window.removeEventListener('scroll', this.scrollHandle);
                }
            }
        },

        created () {
            console.log('v-swipe-label created...');
        },

        mounted () {
            this.$nextTick(() => {
                this.init();
//                console.log('v-swipe-label.mounted...', this.maxl, this.$refs.touch.recognizers); // 能后去到hammerjs对象，处理多事件合并
            });
        },

        methods: {
            init () {
                this.maxl = -(this.$refs.content.offsetWidth - this.$refs.container.offsetWidth); // 设定左滑界限

                /**
                 * 如果设定了fixed定位，监听滚动
                 */
                if (this.fixed) {
                    let scrollTarget = this.getScrollEventTarget(this.$el);
                    scrollTarget.addEventListener('scroll', this.throttle(this.scrollHandle, 10));
                    this.position = this.$el.getBoundingClientRect().top;
                }
            },

//             /**
//              * 节流
//              *              -- Author by Dio Zhu. on 2017.3.12
//              */
            throttle (fn, delay) {
                let now, lastExec, timer, context, args; //eslint-disable-line
                let execute = function () {
                    fn.apply(context, args);
                    lastExec = now;
                };
                return function () {
                    context = this;
                    args = arguments;
                    now = Date.now();

                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }

                    if (lastExec) {
                        let diff = delay - (now - lastExec);
                        if (diff < 0) {
                            execute();
                        } else {
                            timer = setTimeout(() => {
                                execute();
                            }, diff);
                        }
                    } else {
                        execute();
                    }
                };
            },
            getScrollEventTarget (element) {
                var currentNode = element;
                // bugfix, see http://w3help.org/zh-cn/causes/SD9013 and http://stackoverflow.com/questions/17016740/onscroll-function-is-not-working-for-chrome
                while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
                    var overflowY = document.defaultView.getComputedStyle(currentNode).overflowY;
                    if (overflowY === 'scroll' || overflowY === 'auto') {
                        return currentNode;
                    }
                    currentNode = currentNode.parentNode;
                }
                return window;
            }
//             /**
//              * 监听滚动，设定浮动，ios6以上使用sticky，其他机型用fixed
//              */
//             scrollHandle (e) {
//                 let t = e.target.scrollTop,
// //                let t = this.$el.getBoundingClientRect().top,
//                     isIos6 = function () { //eslint-disable-line
//                         let userAgent = window.navigator.userAgent,
//                             ios = userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/);
//                         return ios && ios[2] && (parseInt(ios[2].replace(/_/g, '.'), 10) >= 6);
//                     };
// //                if (this._uid === 11) console.log(this._uid + ':::::::::', t);
//                 if (this.fixed && t > this.position) {
//                     if (isIos6()) {
// //                        this.floatClass = 'sticky';
//                         this.isSticky = true;
//                     } else {
// //                        this.floatClass = 'fixed';
//                         this.isFixed = true;
//                     }
//                     // jquery.sticky.js 方式，不好使
//  //                    $(this.$refs.container).sticky({topSpacing:0, className:"float"}); //eslint-disable-line
//                 } else {
// //                    this.floatClass = '';
//                     this.isFixed = false;
//                     this.isSticky = false;
//  //                    $(this.$refs.container).unstick(); //eslint-disable-line
//                 }
//             },

//             swipe (e) {
//                 console.log('>>>>>>>>>>>>>  swipe in v-swipe-label...', e);
//                 e.srcEvent.stopPropagation();
//             },
// //            onTap: function (e) {
// //                console.log('v-swipe-label.onTap =============> ');
// //            },
//             touchStart: function (e) {
// //                e.stopPropagation();
// //                e.preventDefault();
// //                console.log('v-swipe-label.touchStart =============> ');
// //                console.log('v-swip-label.methods.touchStart: ', e);
//                 if (this.maxl >= 0) return; // 内容过小不滑动
//                 let touches = e.changedTouches[0];
//                 this.startX = this.lastX = touches.clientX;
//                 /**
//                  * 缓动
//                  */
//                 this.lastMoveStart = this.lastX;
//                 this.lastMoveTime = Date.now();
//                 this.stopMovingTag = true;
//             },
//             touchMoving: function (e) {
// //                console.log('v-swip-label.methods.touchMoving: ', e);
// //                e.stopPropagation();
// //                e.preventDefault();
//                 if (this.maxl >= 0) return; // 内容过小不滑动
//                 let touches = e.changedTouches[0],
//                     nowX = touches.clientX,
//                     moveX = nowX - this.lastX,
// //                    currentX = parseInt(this.conStyle.left) + moveX;
//                     currentX = parseInt(this.left) + moveX;

//                 // 范围限定
//                 if (currentX >= this.minl || currentX < this.maxl) {
//                     return;
//                 }

//                 // 设置top值移动content
// //                this.conStyle.left = currentX + 'px';
// //                this.$set(this.conStyle, 'left', currentX + 'px');
//                 this.left = currentX;
//                 this.lastX = nowX;

//                 /**
//                  * 缓动
//                  */
//                     // var nowTime = e.timeStamp || Date.now();
//                 let nowTime = Date.now();
//                 this.stopMovingTag = true;
//                 if (nowTime - this.lastMoveTime > 300) {
//                     this.lastMoveTime = nowTime;
//                     this.lastMoveStart = nowX;
//                 }
//             },
//             touchEnd: function (e) {
// //                e.stopPropagation();
// //                e.preventDefault();
//                 // e.srcEvent.stopPropagation();
//                 if (this.maxl >= 0) return; // 内容过小不滑动
// //                console.log('v-swip-label.methods.touchEnd: ', e);
//                 let _self = this,
//                     // touches = e.changedPointers[0],
//                     touches = e.changedTouches[0],
//                     nowX = touches.clientX,
//                     moveX = nowX - this.lastX,
// //                    currentX = parseInt(this.conStyle.left) + parseInt(moveX);
//                     currentX = parseInt(this.left) + parseInt(moveX);

// //                if (currentX >= _self.minl || currentX < _self.maxl)  return;

// //                console.log('v-swip-label.methods.touchEnd: ', currentX, _self.minl, _self.maxl);
//                 if (currentX >= _self.minl) currentX = _self.minl;
//                 if (currentX < _self.maxl) currentX = _self.maxl;

//                 // 设置top值移动content
// //                this.conStyle.left = currentX + 'px';
// //                this.$set(this.conStyle, 'left', currentX + 'px');
//                 this.left = currentX;
//                 this.lastX = nowX;

//                 /**
//                  * 缓动
//                  */
//                 // var nowTime = e.timeStamp || Date.now(),
//                 let nowTime = Date.now(),
//                     v = (nowX - this.lastMoveStart) / (nowTime - this.lastMoveTime); // 最后一段时间手指划动速度
//                 // console.log("**********: ", v);
//                 this.stopMovingTag = false;
//                 (function (v, startTime, currentX) {
//                     let dir = v > 0 ? -1 : 1,           // 加速度方向
//                         deceleration = dir * 0.0009;    // 速度递减
// //                        duration = v / deceleration;    // 速度消减至0所需时间
// //                        dist = v * duration / 2;        // 当前移动距离

//                     // console.log("*****1*****: ", v, dir, deceleration, duration, dist);

//                     function inertiaMove () {
//                         if (_self.stopMovingTag) {
//                             return;
//                         }

//                         // var nowTime = e.timeStamp || Date.now(),
//                         let nowTime = Date.now(),
//                             t = nowTime - startTime,
//                             nowV = v + t * deceleration;

//                         // console.log("*****2*****: ", nowTime, startTime, t, nowV);

//                         // 速度方向变化表示速度达到0了
//                         if (dir * nowV > 0) {
//                             return;
//                         }
//                         let moveX = (v + nowV) / 2 * t; // 距离递减~
// //                        console.log('=======3=======', currentX, moveX);
//                         // 范围限定
// //                        if ((currentX + moveX) >= _self.minl || (currentX + moveX) < _self.maxl) return;
//                         if ((currentX + moveX) >= _self.minl) {
//                             currentX = _self.minl;
//                             moveX = 0;
//                         }
//                         if ((currentX + moveX) < _self.maxl) {
//                             currentX = _self.maxl;
//                             moveX = 0;
//                         }

// //                        _self.conStyle.left = (currentX + moveX) + 'px';
//                         _self.left = currentX + moveX;

// //                        if (moveX === 0) return;
//                         setTimeout(inertiaMove, 10);
//                     }

//                     inertiaMove();
//                 })(v, nowTime, currentX);
//             }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-swipe-label {
        position: relative;
        width: 100%;
        /*min-height: pxTorem(38px);*/
        // z-index: 98!important;

        // &.sticky {
        //     position: -webkit-sticky;
        //     position: sticky;
        //     top: 0;
        //     left: 0;
        // }

        .line {
            width: 100%;
            height: 1px;
            position: absolute;
            bottom: pxTorem(0);
            // border-bottom: #3A3E39 1px solid;
            box-shadow: 0 1px 1px #3A3E39;
        }

    }
    .v-swipe-label__container {
        position: relative;
        width: 100%;
        /*min-height: pxTorem(38px);*/
        // overflow-y: hidden;
        // overflow-x: auto;
        /*overflow-x: hidden;*/
        // z-index: 99!important;

        // &.fixed {
        //     position: fixed;
        //     top: 0;
        //     left: 0;
        // }
    }
    .v-swipe-label__content {
        /*position: absolute;*/
        overflow-x: auto;
        /*overflow-x: hidden;*/
        /*overflow-y: hidden;*/
        white-space: nowrap;
        /*transform: translate3d(0, 0, 0);*/
        ::-webkit-scrollbar {
            height: 0;
        }
        >div {
            box-sizing: border-box;
            position: relative;
            display: inline-block;
            font-size: pxTorem(14px);
            line-height: pxTorem(38px);
            padding: 0 pxTorem(10px);
            margin: 0 pxTorem(10px);
            ::-webkit-scrollbar {
                height: 0;
            }
            // border-color: #fff;

            // @keyframes animat { 0%{ @include opacity(.5); } 10% { @include opacity(1)} }

        }
    }

    .dark {
        background: #1B1B20;
        .v-swipe-label__content {
            display: flex;

            .itm {
                flex: 1;
            }
        }
    }
</style>
