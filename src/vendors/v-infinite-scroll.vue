<template>
    <div class="v-infinite-scroll" @touchstart.stop @touchmove.stop @touchend.stop>
        <v-scroll ref="scroll" v-model="currentValue" :func="getList" func-type="section" :enabled="enabled" :scrollDistance="scrollDistance" :tombstone="tombstone">
            <!--:style="{transform: translate}"-->
            <div ref="container"
                 class="v-infinite-scroll__container"
                 :transform-position="y"
                 :style="{transform: translate}"
            >
                <slot></slot>
                <!--:style="{height: height + 'px'}"-->
                <ul class="v-infinite-scroll__content"
                >
                    <!--:key="item.id || idx"-->
                    <!--:style="{top: '' + item.top + 'px'}"-->
                    <!--:style="{transform: 'translate3d(0, ' + (y + item.top) + 'px, 0)'}"-->
                    <li v-for="(item, idx) in listVisible"
                        :style="{transform: 'translate3d(0, ' + (item.top) + 'px, 0)'}"
                    >
                        <!--<div v-show="tombstone"-->
                             <!--class="item tombstone"-->
                             <!--:style="{opacity: +!item.loaded}"-->
                        <!--&gt;-->
                            <!--<slot name="tombstone"><div class="icon"><p></p></div><div class="con"><p></p><p></p></div></slot>-->
                        <!--</div>-->
                        <div class="item"
                             :style="{opacity: +item.loaded}"
                        >
                            <slot name="item" :data="item.data"></slot>
                        </div>
                    </li>
                </ul>
                <ul class="v-infinite-scroll__pool">
                    <li v-for="(item, idx) in listData"
                        v-if="!item.tomb && !item.height"
                        :ref="'item' + idx"
                    >
                        <div class="item">
                            <slot name="item" :data="item.data"></slot>
                        </div>
                    </li>
                    <li>
                        <div ref="tomb" class="item tombstone">
                            <slot name="tombstone"><div class="icon"><p></p></div><div class="con"><p></p><p></p></div></slot>
                        </div>
                    </li>
                </ul>
            </div>
        </v-scroll>
    </div>
</template>
<script type="text/ecmascript-6">
    import vScroll from './v-scroll.vue';
    import CONFIG from '../config';
    import _ from 'underscore';
    import bus from './eventbus'; //eslint-disable-line

    // 使用requestAnimationFrame比setTimeout效率高，1000/60是为了达到每秒60帧的效率才能让人眼感觉到流畅~
    const rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); }; //eslint-disable-line

    /**
     * infinite scroll 组件，dom可回收的无限滚动。。。
     *              -- Author by Dio Zhu. on 2017.5.26
     * 之前的做法是让v-scroll-container的overflow：auto，使其出现滚动条，然后根据滚动位置进行数据加载；
     * 问题出现在ios设备上，ios的滚动条在滚动时会屏蔽一切计算。。。现象就是滚滚的就会出现白屏，原因是渲染被暂停了，等不滚了，才开始渲染。。。
     * 可以把滚动条加载到足够大，比如一次加载50条，屏幕上就会创建150个dom，会减轻此问题出现几率，但因为加载dom过多，且都需要独立渲染，所以效率。。。
     * 现屏蔽容器的滚动条，完全使用mousewheel和touch事件进行控制，避开ios滚动条。。。
     *              -- Author by Dio Zhu. on 2017.6.5
     */
    export default {
        name: 'v-infinite-scroll',

        props: {
            id: String,
            value: {
                type: Array,
                default: () => []
            },
            func: Function,         // 加载所需函数
            funcType: {             // 使用的分页类型，section：常用语nodejs的区间方式(0~10, 10~20)、page：常用于php的分页方式、time：时间分页方式（暂未实现）
                type: String,
                default: 'page'
            },
            enabled: {             // 当前滚动条是否可用
                type: Boolean,
                default: true
            },
            toper: {
                type: Boolean,      // 返回顶部按钮
                default: true
            },
            tombstone: {
                type: Boolean,      // 是否开启墓碑模式
                default: true
            },
            scrollDistance: {       // 滚动事件触发的位移距离
                type: Number,
                default: 200
            }
        },

        components: { vScroll },

        data () {
            return {
                uid: this._uid,
                start: 0,               // 开始显示的序号
                size: CONFIG.LIMIT,     // 每次加载的数量，用于墓碑的显示
                height: 0,              // 容器内容高度（仅for中的内容，不包含slot）
                totalHeight: 0,         // 容器总内容高度（加上slot）
                currentValue: this.value,
                scrollTarget: null,

                translate: 'translate3d(0, 0, 0)', // 容器滚动
                y: 0,                   // 整体位移偏移
//                startY: 0,              // touchstart时容器的初始位置
//                pointY: 0,              // touchstart时鼠标的起始位置
//                distY: 0,               // touchmove的过程位置
//                startTime: 0,           // touchstart开始时间
                ease: {                 // 动画
                    quadratic: {
                        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fn: function (k) {
                            return k * (2 - k);
                        }
                    },
                    circular: {
                        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                        fn: function (k) {
                            return Math.sqrt(1 - (--k * k));
                        }
                    },
                    back: {
                        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        fn: function (k) {
                            let b = 4;
                            return (k = k - 1) * k * ((b + 1) * k + b) + 1;
                        }
                    },
                    bounce: {
                        style: '',
                        fn: function (k) {
                            if ((k /= 1) < (1 / 2.75)) {
                                return 7.5625 * k * k;
                            } else if (k < (2 / 2.75)) {
                                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
                            } else if (k < (2.5 / 2.75)) {
                                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
                            } else {
                                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
                            }
                        }
                    },
                    elastic: {
                        style: '',
                        fn: function (k) {
                            let f = 0.22,
                                e = 0.4;

                            if (k === 0) { return 0; }
                            if (k === 1) { return 1; }

                            return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
                        }
                    }
                },            // 动画

                listData: []    // 异步的列表数据，每次加载先在此添加，保证滚动流畅，异步获取真实数据
            };
        },

        computed: {
            listVisible () { // 可视的数组
//                console.log(`v-infinite-scroll.${this._uid}.computed.listVisible: `, this.listData, Math.max(0, this.start - this.size), Math.min(this.currentValue.length, this.start + this.size));
                return this.listData.slice(Math.max(0, this.start - this.size), Math.min(this.listData.length, this.start + this.size));
            },
            tombHeight () {
//                console.log(`v-infinite-scroll.${this._uid}.computed.tombHeight: `, this.tombstone, this.$refs, this.$refs.tomb);
                return this.tombstone ? this.$refs.tomb && this.$refs.tomb.offsetHeight : 0;
            },
            wrapperHeight () { // 容器高度
                return this.$el.offsetHeight;
            }
        },

        watch: {
            value (val) {
//                console.log(`v-infinite-scroll.${this._uid}.watch.value: `, val);

                this.currentValue = val;

                if (val.length) { // 非第一次加载，计算高度
                    this.loadList();
                } else { // 初始化
                    this.init();
                }
            },
            currentValue (val) {
                this.$emit('input', val);
            },
            listData (val) {
                if (val && val.length > this.currentValue.length) { // 如果是墓碑序列大于真实数据，触发加载
                    console.log(`v-infinite-scroll.${this._uid}.watch.listData: get more ~~~`);
                    bus.$emit('v-scroll.getList'); // 触发滚动条组件的数据获取方法
                }
            }
        },

        created () {
            console.log(`v-infinite-scroll.${this._uid}.created...`);
        },
        mounted () {
            console.log(`v-infinite-scroll.${this._uid}.mounted...`);
//            this.init();

            this.$nextTick().then(() => { // 滚动元素
                this.initEvent();
            });
        },
        destroyed () {
            this.scrollTarget.removeEventListener('scroll', this.onScroll.bind(this));
        },

        methods: {
            init () { // 初始化
                console.log(`v-infinite-scroll.${this._uid}.init...`);
                this.reset();
                this.load();
            },

            initEvent () { // 初始化监听事件
//                this.scrollTarget = this.$refs.scroll.$data.scrollTarget;
                this.scrollTarget = this.$refs.container;
//                this.scrollTarget.addEventListener('scroll', _.throttle(this.onScroll.bind(this), 50));

                // 鼠标滚轮
                this.scrollTarget.addEventListener('mousewheel', _.throttle(this.onMousewheel.bind(this), 50));
                // touch事件
//                this.scrollTarget.addEventListener('touchstart', _.throttle(this.onTouchStart.bind(this), 10));
//                this.scrollTarget.addEventListener('touchmove', _.throttle(this.onTouchMove.bind(this), 20));
//                this.scrollTarget.addEventListener('touchend', _.throttle(this.onTouchEnd.bind(this), 10));
                this.scrollTarget.addEventListener('touchstart', this.onTouchStart.bind(this));
                this.scrollTarget.addEventListener('touchmove', this.onTouchMove.bind(this));
                this.scrollTarget.addEventListener('touchend', this.onTouchEnd.bind(this));
            },

            getScrollTarget () { // 获取当前滚动容器

            },

            reset () { // 重置
                console.log(`v-infinite-scroll.${this._uid}.reset...`);
            },

            load () {
                console.log(`v-infinite-scroll.${this._uid}.load...`);
                if (this.tombstone) {
                    this.listData.length += this.size;
                    this.loadList();
                } else if (!this.loading) {
                    bus.$emit('v-scroll.getList'); // 触发滚动条组件的数据获取方法
                }
            },

            getList () { // 不能直接获取，需要通过scroll组件回调
                console.log(`v-infinite-scroll.${this._uid}.getList...`);

//                // 判断墓碑标识
//                if (this.tombstone) { // 如果墓碑模式，补充进异步列表，并计算高度
//                    this.listData.length += this.size;
//                    this.computedList();
// //                    return this.computedList();
//                } else { // 否则直接调用func，获取数据，再通过watch返回的value变化，计算高度
//                    if (typeof this.func === 'function') {
//                        return this.func(...arguments).then(res => {
//                            this.updateVisual(); // 跟新可视范围
//                            return Promise.resolve(res);
//                        }).catch(e => {
//                            return Promise.reject(e);
//                        });
//                    } else {
//                        return Promise.reject('未定义返回函数！');
//                    }
//                }

                if (typeof this.func === 'function') {
                    return this.func(...arguments).then(res => {
                        this.updateVisual(); // 跟新可视范围
                        return Promise.resolve(res);
                    }).catch(e => {
                        return Promise.reject(e);
                    });
                } else {
                    return Promise.reject('未定义返回函数！');
                }
            },

            loadList () { // 计算高度、位置
                console.log(`v-infinite-scroll.${this._uid}.loadList...`);
                let list = [],
                    start = 0,
                    end = this.tombstone ? this.listData.length : this.currentValue.length;
                for (let i = start;i < end;i++) {
                    if (this.listData[i] && this.listData[i].loaded) continue;
                    this.$set(this.listData, i, {
                        data: this.currentValue[i] || {},
                        height: 0,
                        top: -500,
                        tomb: !this.currentValue[i],
                        loaded: !!this.currentValue[i]
                    });
                    list.push(this.$nextTick().then(() => {
                        this.updateDomHeight(i);
                    }));
                }

                return Promise.all(list).then(() => { // 检查完高度后，重置dom位置
                    this.updateDomPosition();
                });
            },

            updateDomHeight (idx) { // 计算高度
//                console.log(`v-infinite-scroll.${this._uid}.updateDomHeight...`);
                let item = this.listData[idx],
                    dom = this.$refs['item' + idx];
                if (dom && dom[0]) { // 实际dom高度
                    item.height = dom[0].offsetHeight;
                } else { // 墓碑高度
                    item.height = this.tombHeight;
                }
            },

            updateDomPosition () { // 计算dom位置、内容高度、可视范围
                console.log(`v-infinite-scroll.${this._uid}.updateDomPosition...`);
                this.height = 0;
                for (let i = 0, len = this.listData.length;i < len;i++) {
                    let pre = this.listData[i - 1];
                    this.listData[i].top = pre ? pre.top + pre.height : 0;
                    this.height += this.listData[i].height;
                }
                this.totalHeight = this.height + this.$refs.container.offsetHeight; // 计算包含slot内容的总高度

                // 还原滚动位置

                // 更新可视范围
                this.updateVisual();
            },

            updateVisual () { // 更新可视范围
//                console.log(`v-infinite-scroll.${this._uid}.updateVisual...`);
//                let scrollTarget = this.$refs.scroll.$data.scrollTarget;
//                if (!scrollTarget) return;

//                let top = this.scrollTarget.scrollTop;
                let top = -this.y - this.$refs.container.offsetHeight;
                for (let i = 0, len = this.listData.length;i < len;i++) {
                    if (this.listData[i].top > top) {
//                        console.log(`v-infinite-scroll.${this._uid}.updateVisual...1`, i, top, this.listData[i].top, this.start);
//                        this.start = Math.max(0, i - 1);
                        this.$set(this, 'start', Math.max(0, i - 1));
//                        console.log(`v-infinite-scroll.${this._uid}.updateVisual..2.`, i, top, this.listData[i].top, this.start);
                        break;
                    }
                }
            },

            onScroll (e) {
//                console.log(`v-infinite-scroll.${this._uid}.onScroll...`);
/*
                if (this.scrollTarget.scrollTop + this.scrollTarget.offsetHeight > this.height - this.scrollDistance) {
                    this.load();
//                    bus.$emit('v-scroll.getList'); // 因为要保持流畅，所以这里手动触发滚动条组件的数据获取方法
                }
                this.updateVisual();
*/
                let center = -(this.totalHeight - this.$el.offsetHeight) / 2;
//                let center = -(this.totalHeight - this.$el.offsetHeight);
//                console.log(`v-infinite-scroll.${this._uid}.onScroll...`, center);
                if (this.y < center) {
                    this.load();
                }

                this.updateVisual();
            },

            onMousewheel (e) {
//                console.log(`v-infinite-scroll.${this._uid}.onMousewheel...`, e);
                let wheelDeltaY = -e.deltaY,
                    newY = this.y + Math.round(wheelDeltaY);
//                console.log(`v-infinite-scroll.${this._uid}.onMousewheel...`, wheelDeltaY, newY, this.$el.offsetHeight);

                if (newY > 0) {
                    newY = 0;
                } else if (newY <= -(this.totalHeight - this.$el.offsetHeight)) {
                    newY = -(this.totalHeight - this.$el.offsetHeight);
                }
                this._translate(0, newY);

                this.onScroll();
            },

            onTouchStart (e) {
//                e.stopPropagation();
                e.preventDefault();

//                console.log(`v-infinite-scroll.${this._uid}.onTouchStart...`);
                if (!this.enabled) return;

                let point = e.touches ? e.touches[0] : e;
//                console.log(`v-infinite-scroll.${this._uid}.onTouchStart...`, point.pageY);
                this.isAnimating = false;
                this.moved = false;
                this.startY = this.y;
                this.distY = 0;
                this.pointY = point.pageY;
                this.startTime = new Date().getTime();
            },
            onTouchMove (e) {
                e.stopPropagation();
                e.preventDefault();

                let point = e.touches ? e.touches[0] : e,
                    deltaY = point.pageY - this.pointY,
                    newY = this.startY + deltaY;
                this.distY = deltaY;
//                console.log(`v-infinite-scroll.${this._uid}.onTouchMove...${newY}`);
                if (newY > 0) {
                    newY = 0;
                } else if (newY <= -(this.totalHeight - this.$el.offsetHeight)) {
                    newY = -(this.totalHeight - this.$el.offsetHeight);
                }
                this.moved = true;
                this._translate(0, newY);

//                this.onScroll();
            },
            onTouchEnd (e) {
//                e.stopPropagation();
                e.preventDefault();

                let duration = new Date().getTime() - this.startTime,
                    newY = Math.round(this.y),
                    time = 0,
                    momentumY = 0,
                    deceleration = 0.002,
                    easing = ''; // this.ease.circular;
//                console.log(`v-infinite-scroll.${this._uid}.onTouchEnd...`);

                this._translate(0, newY);

                this.onScroll();

                if (duration < 300) {
                    console.log(`v-infinite-scroll.${this._uid}.onTouchEnd...`, duration);
                    momentumY = this._momentum(this.y, this.startY, duration, this.totalHeight, this.wrapperHeight, deceleration) || {
                        destination: newY,
                        duration: 0
                    };
                    newY = momentumY.destination;
                    time = momentumY.duration;
                }

                if (newY !== this.y) {
                    this._animate(0, Math.round(newY), time, easing);
                }
            },

            _translate (x, y) { // 移动到指定位置
                if (this.y === y) return;
//                console.log(`v-infinite-scroll.${this._uid}._translate...${x}, ${y}`);
                if (y > 0) {
                    y = 0;
                } else if (y <= -(this.totalHeight - this.$el.offsetHeight)) {
                    y = -(this.totalHeight - this.$el.offsetHeight);
                }

                this.translate = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
                this.y = y;
            },
            _momentum (current, start, time, lowerMargin, wrapperSize, deceleration) { // 趋势计算
                let distance = current - start,
                    speed = Math.abs(distance) / time,
                    destination,
                    duration;

                deceleration = deceleration === undefined ? 0.0006 : deceleration;

                destination = Math.pow(speed, 2);
                destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
                duration = speed / deceleration;

//                if (destination < lowerMargin) {
//                    destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
//                    distance = Math.abs(destination - current);
//                    duration = distance / speed;
//                } else if (destination > 0) {
//                    destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
//                    distance = Math.abs(current) + destination;
//                    duration = distance / speed;
//                }

                return {
                    destination: Math.round(destination),
                    duration: duration
                };
            },
            _animate (destX, destY, duration, easingFn) { // 动画
                let that = this,
                    startY = this.y,
                    startTime = new Date().getTime(),
                    destTime = startTime + duration;

                if (!easingFn) easingFn = this.ease.circular.fn;

                function step () {
                    var now = new Date().getTime(),
                        newY,
                        easing;

                    if (now >= destTime) {
                        that.isAnimating = false;
                        that._translate(0, destY);

//                        if (!that.resetPosition(that.options.bounceTime)) {
//                            that._execEvent('scrollEnd');
//                        }

                        return;
                    }

                    now = (now - startTime) / duration;
                    easing = easingFn(now);
                    newY = (destY - startY) * easing + startY;
                    that._translate(0, Math.round(newY));

                    if (that.isAnimating) {
//                        setTimeout(step, 1000 / 60);
                        rAF(step);
                    }

//                    if (that.options.probeType == 3) {
//                        that._execEvent('scroll');
//                    }
                    that.onScroll();
                }

                this.isAnimating = true;
                step();
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $refresh-height: pxTorem(36px);

    .v-infinite-scroll {
        height: 100%;
        overflow: hidden;

        .v-scroll {
            overflow: hidden;

            .v-scroll-container {
                overflow: hidden;
            }
        }

        .v-scroll-content {
            position: relative;
            user-select: none;
            -webkit-overflow-scrolling: touch;
            z-index: 1;
        }
    }

    .v-infinite-scroll__container {
        -webkit-overflow-scrolling: touch;
        contain: layout;
    }

    .v-infinite-scroll__content {
        -webkit-transform-style: preserve-3d; /*设置内嵌的元素在 3D 空间如何呈现：保留 3D*/
        -webkit-backface-visibility: hidden; /*（设置进行转换的元素的背面在面对用户时是否可见：隐藏）*/
    }

    .v-infinite-scroll__content,
    .v-infinite-scroll__pool {

        >li {
            width: 100%;
            position: absolute;
            /*will-change: transform; // 优化。。。应在js中willChange动态定义。。。*/
            -webkit-transform-style: preserve-3d; /*设置内嵌的元素在 3D 空间如何呈现：保留 3D*/
            -webkit-backface-visibility: hidden; /*（设置进行转换的元素的背面在面对用户时是否可见：隐藏）*/
        }

        .tombstone {
            position: absolute;
            width: 100%;
            height: 100%;
            min-height: pxTorem(50px);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;

            > div {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .icon {
                width: pxTorem(32px);
                height: pxTorem(32px);
                margin-left: pxTorem(15px);
                border: #ccc 1px solid;
                border-radius: 50%;
            }
            .con {
                width: 80%;
                margin: pxTorem(15px);

                > p {
                    width: 100%;
                    height: pxTorem(12px);
                    margin-top: pxTorem(10px);
                    background: #ccc;

                    &:first-child {
                        width: pxTorem(50px);
                        margin-top: 0;
                    }
                }
            }
        }
    }

    .v-infinite-scroll__pool {

        .tombstone {
            top: pxTorem(-1000px);
            visibility: hidden;
        }
    }
</style>
