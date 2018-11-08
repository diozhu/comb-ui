<template>
    <v-touch v-on:swiperight="swipe" v-bind:swipe-options="{ direction: 'horizontal' }">
        <!--@touchstart.native="startDrag"-->
        <!--@touchmove.native="onDrag"-->
        <!--@touchend.native="endDrag"-->
        <v-cell
            v-clickoutside:touchstart="swipeMove"
            @click.native="swipeMove()"
            @touchstart.native="startDrag"
            @touchmove.native="onDrag"
            @touchend.native="endDrag"
            class="v-cell-swipe"
            :title="title"
            :icon="icon"
            :label="label"
            :to="to"
            :is-link="isLink"
            :reverse="reverse"
            ref="cell"
            :value="value"><!-- @click.native="swipeMove()" -->
            <div
                slot="right"
                class="v-cell-swipe__buttongroup"
                ref="right">
                <div
                    class="v-cell-swipe__button"
                    v-for="btn in right"
                    :style="btn.style"
                    @click.stop="btn.handler && btn.handler(item), swipeMove()"
                    v-html="btn.content"></div>
            </div>
            <!--<div-->
                <!--slot="left"-->
                <!--class="v-cell-swipe__buttongroup"-->
                <!--ref="left">-->
                <!--<a-->
                    <!--class="v-cell-swipe__button"-->
                    <!--v-for="btn in left"-->
                    <!--:style="btn.style"-->
                    <!--@click.stop="btn.handler && btn.handler(), swipeMove()"-->
                    <!--v-html="btn.content"></a>-->
            <!--</div>-->
            <slot></slot>
            <span v-if="$slots.title" slot="title">
                <slot name="title"></slot>
            </span>
            <span
                v-if="$slots.icon"
                slot="icon">
              <slot name="icon"></slot>
            </span>
        </v-cell>
    </v-touch>
</template>
<script>
    import logger from '../js/utils/logger';
    import {once} from '../js/utils/dom';
    import vCell from './v-cell.vue';
    import Clickoutside from '../js/utils/clickoutside';

    /**
     * 滑动Cell
     *              -- Created by Dio Zhu. on 2017.2.15
     */
    export default {
        name: 'v-cell-swipe',

        components: { vCell },

        directives: { Clickoutside },

        props: {
            item: {},
            to: [String, Object],   // 路由对象或href
            icon: String,           // 可传入iconfont名称不包含'icon-'部分
            reverse: Boolean,       // 图标反转标识
            title: String,          // 标题
            label: String,          // 子标题
            isLink: Boolean,        // 右侧箭头图标显示
            value: {},              // 右侧内容
            desc: String,           // 右侧注释，会被value覆盖
            left: Array,
            right: Array
        },

        data () {
            return {
                start: { x: 0, y: 0 }
            };
        },

        mounted () {
            logger.log('v-cell-swipe.monted: ');
            this.wrap = this.$refs.cell.$el.querySelector('.v-cell__wrapper');
//            this.leftElm = this.$refs.left;
            this.rightElm = this.$refs.right;
//            this.leftWrapElm = this.leftElm.parentNode;
            this.rightWrapElm = this.rightElm.parentNode;
//            this.leftWidth = this.leftElm.getBoundingClientRect().width;
            this.rightWidth = this.rightElm.getBoundingClientRect().width;

//            this.leftDefaultTransform = this.translate3d(-this.leftWidth - 1);
            this.rightDefaultTransform = this.translate3d(this.rightWidth);

            this.rightWrapElm.style.webkitTransform = this.rightDefaultTransform;
//            this.leftWrapElm.style.webkitTransform = this.leftDefaultTransform;
        },

        computed: {

        },

        methods: {
            swipe: function (e) {
                logger.log('v-cell-swipe.swipe: ', e);
                e.srcEvent.stopPropagation();
            }, // index中用了右划翻页, 此处阻止冒泡. -- Author by Dio Zhu. on 2017.2.14

            translate3d (offset) {
                return `translate3d(${offset}px, 0, 0)`;
            },

            swipeMove (offset = 0) {
                this.wrap.style.webkitTransform = this.translate3d(offset);
                this.rightWrapElm.style.webkitTransform = this.translate3d(this.rightWidth + offset);
//                this.leftWrapElm.style.webkitTransform = this.translate3d(-this.leftWidth + offset);
                if (offset === 0) { //  || offset < this.wrap.getBoundingClientRect().width 如果归位，恢复状态。 Add by Dio Zhu. on 2017.2.16
//                    logger.log('v-cell-swipe.swipeMove: ', offset, this.dragging, this.swiping, this.opened, this.offsetLeft);
                    this.opened = false;
                    this.swiping = false;
                } else {
                    this.swiping = true;
                }
            },

            swipeLeaveTransition (direction) { // 大于0左滑，小于0右划
                setTimeout(() => {
                    this.swipeLeave = true;

                    // left
                    if (direction > 0 && -this.offsetLeft > this.rightWidth * 0.4) { // 左滑 && 距离大于40%右按钮宽度
                        this.swipeMove(-this.rightWidth);
                        this.swiping = false;
                        this.opened = true;
                        return;
                        // right
                    } else if (direction < 0 && this.offsetLeft > this.leftWidth * 0.4) { // 右划 && 距离大于40%左按钮宽度
                        this.swipeMove(this.leftWidth);
                        this.swiping = false;
                        this.opened = true;
                        return;
                    }

                    this.swipeMove(0);
                    once(this.wrap, 'webkitTransitionEnd', _ => {
//                        logger.log('v-cell-swipe.swipeLeaveTransition.once: ');
                        this.wrap.style.webkitTransform = '';
                        this.rightWrapElm.style.webkitTransform = this.rightDefaultTransform;
//                        this.leftWrapElm.style.webkitTransform = this.leftDefaultTransform;
                        this.swipeLeave = false;
                        this.swiping = false;
                    });
                }, 0);
            },

            startDrag (evt) {
//                logger.log('v-cell-swipe.startDrag: ');
//                evt.preventDefault();   //
                evt = evt.changedTouches ? evt.changedTouches[0] : evt;
                this.dragging = true;
                this.start.x = evt.pageX;
                this.start.y = evt.pageY;
            },

            onDrag (evt) {
                // TODO：打开状态下，继续左滑，直接调用按钮func，参考ios下的邮箱，连续左滑即直接删除。。。
//                if (this.swiping) return;
                if (this.opened) {
//                    if (this.swiping) return;
                    !this.swiping && this.swipeMove(0);
//                    this.right && this.right[0] && this.right[0].handler && typeof this.right[0].handler === 'function' && this.right[0].handler();
//                    logger.log('this.leftDefaultTransform: ', -this.wrap.getBoundingClientRect().width);
//                    !this.swiping && this.swipeMove(-this.wrap.getBoundingClientRect().width);
//                    this.opened = false;  // 原意应该是打开状态如果左滑，直接划回去。。。但这样写有问题啊。。。得到move函数去判断。。。
                    return;
                }
                if (!this.dragging) return;
                let swiping;
                const e = evt.changedTouches ? evt.changedTouches[0] : evt;
                const offsetTop = e.pageY - this.start.y;
                const offsetLeft = this.offsetLeft = e.pageX - this.start.x;

//                if ((offsetLeft < 0 && -offsetLeft > this.rightWidth) ||    // 左滑 && 距离超过右边按钮宽度
//                    (offsetLeft > 0 && offsetLeft > this.leftWidth) ||      // 右划 && 距离超过左边按钮宽度
//                    (offsetLeft > 0 && !this.leftWidth) ||                  // 右划 && 无左按钮
//                    (offsetLeft < 0 && !this.rightWidth)) {                 // 左滑 && 无右按钮
//                    return;
//                }

                const y = Math.abs(offsetTop);
                const x = Math.abs(offsetLeft);

                swiping = !(x < 5 || (x >= 5 && y >= x * 1.73));    // 左右还是上下划
                if (!swiping) return;   // 只处理左右动作
//                evt.preventDefault();

                this.swipeMove(offsetLeft);
            },

            endDrag () {
//                logger.log('v-cell-swipe.endDrag: ');
                if (!this.swiping) return;
                this.swipeLeaveTransition(this.offsetLeft > 0 ? -1 : 1);    // 左滑：1， 右划：-1
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-cell-swipe .v-cell__wrapper, .v-cell-swipe .v-cell__left, .v-cell-swipe .v-cell__right {
        -webkit-transition: -webkit-transform 150ms ease-in-out;
        transition: -webkit-transform 150ms ease-in-out;
        transition: transform 150ms ease-in-out;
        transition: transform 150ms ease-in-out, -webkit-transform 150ms ease-in-out;
    }
    .v-cell-swipe__buttongroup {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .v-cell-swipe__button {
        height: 100%;
        /*display: inline-block;*/
        /*line-height: pxTorem(44px);*/
        padding: 0 pxTorem(18px) 0 pxTorem(22px);
        font-size: pxTorem(15px);
        line-height: 1;
        letter-spacing: pxTorem(4px);
        background: #fa5a5a;
        color: #FFF;
        display: flex;
        align-items: center;
        justify-content: center;
    }

</style>
