<template>
    <div v-show="isEnabled"
         class="v-scroll"
    >
        <!--v-scroll="getList"-->
        <!--scroll-disabled="isLoading"-->
        <!--scroll-distance="scrollDistance"-->
        <!--scroll-enabled="isEnabled"-->
        <!--scroll-tombstone="tombstone"-->
        <!--scroll-scrolling-func="scrollingFunc"-->
        <!--v-scroll-position-->
        <div
            :id="'combScroll_'+_uid"
            ref="container"
            class="v-scroll-container"
        >
            <!--:style="{ 'transform': 'translate3d(0, ' + translate + 'px, 0)' }"-->
            <!-- 内容插槽 -->
            <!--<div ref="content" class="v-scroll-content">-->
            <transition-group name="modal" ref="content" class="v-scroll-content" tag="div">
                <slot></slot>
                <!-- <slot name="footer" :class="[]"></slot> -->
            <!--</div>-->
            </transition-group>
            <!-- 底部loading && 结束标识 -->
            <!--<div v-if="typeof endFunc == 'function' || (!refreshTag && (isLoading || (isShowText && scrollEndTxt && currentValue.length > 0)))" class="v-scroll-bottom">-->
            <div v-show="typeof endFunc == 'function' || (!refreshTag && (hasMore || (isShowText && scrollEndTxt && currentValue.length > 0)))"
                 class="v-scroll-bottom"
                 v-scrollor="getList"
            >
                <transition name="fade">
                    <!--<v-spinner v-show="isLoading" color="#BBBAC2" type="triple-bounce"></v-spinner>-->
                    <v-spinner v-show="hasMore" color="#BBBAC2" type="triple-bounce"></v-spinner>
                </transition>
                <transition name="fade">
                    <p class="v-scroll-bottom-txt" v-show="!isLoading && isShowText && scrollEndTxt && currentValue.length > 0">
                        <slot name="endText">·&nbsp;我是有底线的&nbsp;·</slot>
                    </p>
                </transition>
            </div>
            <!-- 默认为空样式的插槽 -->
            <div v-if="!hasData && currentValue.length <= 0" class="v-scroll-empty">
                <slot class="v-scroll-empty" name="empty">暂无数据</slot>
            </div>
        </div>
        <!-- 返回顶部 -->
        <transition name="fade">
            <div v-show="toper && goTopTag" @click="goTop" class="v-scroll-top icon icon-top"></div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import Vue from 'vue';
    import ScrollerJS from './v-scroller.js';
    import vSpinner from '../vendor/v-spinner/';
    import CONFIG from '../config';
    import * as api from '../js/core/api.js'; //eslint-disable-line
    import bus from '../vendor/eventbus.js';
    import * as utils from '../js/utils/utils.js';
    // import * as dom from '../js/utils/dom.js';
    Vue.use(ScrollerJS);

    /**
     * scroll 组件
     *              -- Author by Dio Zhu. on 2017.2.11
     * 添加了外部scroll事件，目的在于控制'END'字样显示，记录数一屏内不显示，超过一屏显示；
     *              -- Mod by Dio Zhu. on 2017.3.13
     * 封装了按limit + offset方式加载的函数，简化函数流程，调用时不用再设置一大堆的参数，只传入一个列表的api方法即可；
     * 注意外部函数一定要返回一个包含列表数据的Promise.resolve：return Promise.resolve(dat);
     * 取消了外部scroll事件，结束语同屏判断放在了getList函数中；
     *              -- Mod by Dio Zhu. on 2017.3.13
     * 添加了funcType，对应不同的分页类型，按各自需求传入参数，默认使用page方式：
     * section 方式：基本上nodejs使用的是这种方式
     *      第一页：offset: 0, limit: 10
     *      第二页：offset: 10, limit: 20
     * page 方式： 所有php的分页基本使用这种方式
     *      第一页：page: 1, pageNum: 10
     *      第二页：page: 2, pageNum: 10
     * limit 方式： 评论赞的微服务使用这种方式
     *      第一页：offset: 0, limit: 10
     *      第二页：offset:10, limit: 10
     * 添加了enabled参数，调整了组件加载机制，适应一个页面多个滚动条的情况；
     * 调整了为空判断、结束语判断等逻辑；
     *              -- Mod by Dio Zhu. on 2017.3.17
     * time 方式：秘语中上拉加载，用的是传最后跳的时间戳的方法
     *      第一页：oTime：-1，pageSize：10
     *      第二页：oTime: 第一次最后一条数据的时间（接口中有返回），pageSize：10
     *              -- xufeng on 2017.4.17
     */
    export default {
        name: 'v-scroller',

        props: {
            from: String,
            id: String,
            value: {
                type: Array,
                default: () => []
            },
            func: Function,             // 加载所需函数
            endFunc: Function,          // 加载完毕的回调函数，用于拉到最后，切换首页类目，进行瀑布流展示
            scrollingFunc: Function,    // 滚动时的回调函数，用于外部监听
            funcType: {             // 使用的分页类型，section：常用语nodejs的区间方式(0~10, 10~20)、page：常用于php的分页方式、time：时间分页方式（暂未实现）
                type: String,
                default: 'page'
            },
            enabled: {             // 当前滚动条是否可用
                type: Boolean,
                default: true
            },
            pullAbled: {            // 是否打开下拉刷新
                type: Boolean,
                default: false
            },
            toper: {
                type: Boolean,      // 返回顶部按钮
                default: false
            },
            scrollDistance: { // 滚动事件触发的位移距离
                type: Number,
                default: 100
            },
            tombstone: {
                type: Boolean,      // 是否开启墓碑模式
                default: false
            },
            hasDataParent: {
                type: Boolean,
                default: true
            },
            isGoInit: {
                type: Boolean,
                default: true
            },
            scrollEndFlowTag: {     // 结束提示语是否跟随显示，false：不满一屏不显示，true：只要没有数据就显示
                type: Boolean,
                default: false
            },
            endFuncEnable: {        // 是否开启加载完回调功能（endFunc）
                type: Boolean,
                default: false
            }
//            loading: {
//                type: Boolean,
//                default: false
//            },
//            isLoadMore: Boolean, // 加载提示
//            dataExist: Boolean,  // 是否有数据
//            classes: String      // 附加class
        },

        components: {
            'v-spinner': vSpinner
        },

        data () {
            return {
                pageHeight: 0,
                uid: this._uid,
                currentValue: this.value,

//                scrollTop: 0,               // 当前滚动位置
                goTopTag: false,            // 返回顶部按钮的显示标识

                oTime: -1,                  // 最后一条数据的时间戳(秘语)
                pageSize: CONFIG.LIMIT,     // 每一页的个数(秘语)
                offset: 0,                  // 当前页数(nodejs)
                limit: CONFIG.LIMIT,        // 每页显示记录数(nodejs)
                page: 1,                    // 当前页数(php)
                pageNum: CONFIG.LIMIT,      // 每页显示记录数(php)
                hasMore: true,              // 是否还有数据, 决定最底下是否显示" - 已加载完毕 - "样式
                hasMoreTotal: true,         // 用于打开endFunc时，判断外部是否还有需要加载的数据
                isLoading: false,           // 正在加载
//                listCount: 0,               // 数据列表计数，用于初始加载判断
                scrollEndTxt: false,        // 列表结束语显示标识
                refreshTag: false,          // 刷新的标识
                hasData: true,
                isEnabled: this.enabled,    // 可用标识
//                translate: 0,               // 下拉刷新的偏移量
//                refreshHeight: 0,           // refresh的dom高度
//                refreshTranslate: 0,        // refresh的dom位移
                scrollTarget: null          // 当前滚动dom
            };
        },

        computed: {
            isShowText () {
//                console.log('--------> ', this.dataExist, this.isLoadMore);
                return !!(this.hasData && !this.hasMore);
//                return !!(this.hasData && !this.hasMore && document.body.scrollTop > 100);
            }
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.$emit('input', val);
            },
            enabled (val) {
                console.log('v-scroll.watch.enabled! ');
//                this.isEnabled = !this._inactive && val;
                this.isEnabled = val;
//                if (val) this.$router.scrollTarget = this.scrollTarget; // 保存滚动容器
//                if (val === true && this.listCount <= 0) {
                if (val === true && this.value.length <= 0) {
//                    this.init();
                    this.refreshList();
                }
            }
        },

        created () {
            console.log(`[v-scrollor].${this._uid}.created...`);
            bus.$on('v-scroll.refreshList', this.refreshList); // 监听下拉刷新的事件
            bus.$on('v-scroll.getList', this.getList); // 监听上拉加载事件
//            this.init();
            if (!this.$route.meta || !this.$route.meta.keepAlive) this.init(); // 如果路由没有设定keepAlive，再执行init函数，否则会重复执行。 Author by Dio Zhu. on 2017.12.2
        },
        mounted () {
            this.pageHeight = window.screen.height;
            console.log(`[v-scrollor].${this._uid}.mounted...`, this.$route.name, this.$parent.$route.name);
        },

        activated () {
            console.log(`*[v-scrollor].${this._uid}.activated...`, this._inactive, this.$router.direct());
            this.isEnabled = this.enabled;
            // this.init(); // 如果当前页面是keep-alive的，这里重新初始化
            if (this.$router.direct()) { // in
                this.init(); // 如果当前页面是keep-alive的，这里重新初始化
            } else { // back
                // do nothing ...
            }

            // dom.addClass(window.document.documentElement, 'overflow'); // body绑定overflow样式
        },
        deactivated () {
            console.log(`*[v-scrollor].${this._uid}.deactivated...`, this._inactive);
            this.isEnabled = false;

            // dom.removeClass(window.document.documentElement, 'overflow'); // 移除overflow样式
        },
        beforeDestroy () {
            console.log(`*[v-scrollor].${this._uid}.beforeDestroy...`);
        },

        methods: {
            reset ({resetData = true, goTop = true} = {}) {
                // 初始化分页参数
                this.oTime = -1;
                this.pageSize = CONFIG.LIMIT;
                this.offset = 0;
                this.limit = CONFIG.LIMIT;
                this.page = 1;
                this.pageNum = CONFIG.LIMIT;
                this.hasMore = true;
                this.hasData = true;
                this.scrollEndTxt = false;
                // this.endFuncEnable = false; // 关闭瀑布流，如需调用，确保refresh前重新赋值

                if (resetData) this.currentValue = [];
                this.scrollTarget = window; // 直接设定滚动容器为window
                if (goTop && this.scrollTarget) this.scrollTarget.scrollTop = 0;
                this.hasMoreTotal = true;

                if (!this.fetcher) this.fetcher = api.getFetcher(this.func, this.funcType); // 初始化fetcher
                this.fetcher.init();
            },

            init () {
                console.log(`[v-scrollor].${this._uid}.init...`);
                this.reset(); // 重置

                if (!this.isGoInit) return false; // 是否一进来就自动加载

                // 初次加载
                // if (!this.tombstone) this.getList();

                const e = utils.requestAnimationFrame,
                    t = () => {
                        this.updateItems();
                        e(t);
                    };
                if (this.tombstone) t();
                // console.log(`[v-scrollor].${this._uid}.init...`, this.$refs.content.$el);
            },

            updateItems () {
                // console.log(`[v-scrollor].${this._uid}.updateItems: `);
                let e = this.$refs.container,
                    t = e.offsetTop,
                    i = window.scrollY,
                    n = i + window.innerHeight,
                    o = t;
                [].forEach.call(this.currentValue, (val, idx) => {
                    // console.log(`[v-scrollor].${this._uid}.updateItems.forEach: ${idx}`, o > i - 500, o < n + 500);
                    // console.log(`[v-scrollor].${this._uid}.updateItems.forEach: ${idx}`, o, i, n);
                    // o > i - 500 && o < n + 500 && (val.shown = !0);
                    o > i - 500 && o < n + 500 && this.$set(this.currentValue[idx], 'shown', !0);
                    o += val.height || 0;
                });
                this.$nextTick(this.updateItemsHeight);
            },
            updateItemsHeight () {
                [].forEach.call(this.currentValue, (val, idx) => {
                    let i = this.$refs.content.$el.children[idx];
                    // console.log(`[v-scrollor].${this._uid}.updateItemsHeight.forEach: ${idx}`, i.offsetHeight);
                    // let i = document.querySelector(`.item-${idx}`);
                    i && (val.height = i.offsetHeight);
                });
            },
            goTop () {
                let target = this.scrollTarget === window ? document.body : this.scrollTarget;
                console.log(`[v-scrollor].${this._uid}.getList.after: `, target.scrollHeight, target.offsetHeight);
                if (target.scrollTop > 0) {
                    target.scrollTop -= 1000;
                    setTimeout(this.goTop, 30);
                }
            },

            /**
             * 获取数据
             */
            getList () {
                console.log(`[v-scrollor].${this._uid}.getList.befor: !!!`);
                if (!this.isEnabled) return Promise.reject({});  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                if (this.isLoading) return Promise.reject({});  // 加载时不处理分页
                // 结束语判断
                // if (!this.scrollEndTxt && this.scrollTarget) this.scrollEndTxt = document.body.scrollHeight > document.body.offsetHeight;
                // let target = this.scrollTarget === window ? document.body : this.scrollTarget;
                // if (!this.scrollEndTxt && target) this.scrollEndTxt = this.scrollEndFlowTag ? true : target.scrollHeight > (target.offsetHeight * 5 / 4);

//                if (typeof this.func !== 'function' || !this.hasMore) return;  // 无效函数、无数据，直接返回
                /**
                 * 新增逻辑：如果指定了endFunc，在此触发回调；
                 * v1.01项目中的首页，每次滑到底部，触发此函数回调，切换标签，继续加载，流式布局，直至最后一个类目加载完毕，显示'我是有底线的'，结束所有加载；
                 *              -- Author by Dio Zhu. on 2017.12.5
                 */
                if (typeof this.func !== 'function') return Promise.reject({});  // 无效函数
                if (typeof this.endFunc === 'function' && !this.hasMore && this.hasMoreTotal && this.endFuncEnable) { // 如果有结束回调
                    try {
                        if (this.isLoading) return Promise.reject({});
                        if (this.isEnding) return Promise.reject({});
                        this.isEnding = true;
                        this.isLoading = true;
                        return this.endFunc().then(res => {
//                            console.log(`[v-scrollor].${this._uid}.endFunc.after: `, res);
                            if (res) {
                                console.log(`[v-scrollor].${this._uid}.endFunc.after: `, res);
                                this.reset({resetData: false, goTop: false}); // 重置，且不清数据！
//                                this.getList();
                            } else {
                                this.hasMoreTotal = false;
                            }
                            this.isEnding = false;
                            this.isLoading = false;
                            return Promise.resolve({});
                        });
                    } catch (e) {
                        console.error(`[v-scrollor].${this._uid}.endFunc.after.error: ${e}`);
                        return Promise.reject({});
                    }
                }
                if (!this.hasMore) return Promise.reject({});  // 无数据
                /**
                 * end mod. on 2017.12.5
                 */

                /**
                 * 数据获取及分页方式提取到api中，不再使用本页的数据获取函数。。。
                 * api的fetcher只负责数据分页获取及分页信息记录，有无数据及数据刷新、绑定在本组件中完成。。。
                 *              -- Author by Dio Zhu. on 2017.12.11
                 */
                try {
                    this.isLoading = true;
                    if (!this.fetcher) this.fetcher = api.getFetcher(this.func, this.funcType); // 初始化fetcher
                    return this.fetcher.fetch().then(res => {
                        console.log(`[v-scrollor].${this._uid}.getList.api.after.success: `, res);
                        if (res && res.length) { // 设定有、无数据的标识
                            this.hasData = true;
                            this.currentValue = this.currentValue.concat(res); // 数据绑定
                        } else if (!this.currentValue || !this.currentValue.length) {
                            this.hasData = false;
                        }
                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < this.fetcher.limit) this.hasMore = false; // 更多数据的标识
                    }).then(res => {
                        console.log(`[v-scrollor].${this._uid}.getList.after: `, this.scrollTarget);
                        if (this.scrollTarget === window) {  // 超出一屏才显示. mod by Dio Zhu. on 2017.12.12
                            console.log(`[v-scrollor].${this._uid}.getList.after: `, window.innerHeight, document.body.offsetHeight);
                            this.$nextTick(() => { this.scrollEndTxt = this.scrollEndFlowTag ? true : document.body.offsetHeight > (window.innerHeight * 5 / 4); });
                        } else if (this.scrollTarget) {
                            console.log(`[v-scrollor].${this._uid}.getList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
                            this.$nextTick(() => { this.scrollEndTxt = this.scrollEndFlowTag ? true : this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4); });
                        }
                        this.isLoading = false;
                        return Promise.resolve({});
                    });
                } catch (e) {
                    console.error(`[v-scrollor].${this._uid}.getList.after.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject({});
                }
            },

            refreshList () {
                // 添加了 || this._isDestroyed的判断，源于食上的详情页，非keepalive，从评论列表到发布评论再返回时，会初始化多个列表实例，造成多个请求。。。
                if (!this.isEnabled || this._isDestroyed) return;  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                console.log(`!!!v-scroll.${this._uid}.refreshList...`);
                if (typeof this.func !== 'function') return;  // 无效函数、无数据，直接返回
                this.refreshTag = true;

                /**
                 * 数据获取及分页方式提取到api中，不再使用本页的数据获取函数。。。
                 * api的fetcher只负责数据分页获取及分页信息记录，有无数据及数据刷新、绑定在本组件中完成。。。
                 *              -- Author by Dio Zhu. on 2017.12.11
                 */
                try {
                    this.isLoading = true;
                    if (!this.fetcher) this.fetcher = api.getFetcher(this.func, this.funcType); // 初始化fetcher
                    this.reset({resetData: false, goTop: true}); // 重置，不清除数据，回调之后按照分页数量删除数组内容，避免重新渲染时屏幕闪~ Author by Dio Zhu. on 2017.4.12
                    return this.fetcher.fetch().then(res => {
                        console.log(`[v-scrollor].${this._uid}.refreshList.api.after.success: `, res);
                        if (res && res.length) { // 设定有、无数据的标识
                            this.hasData = true;
                            this.currentValue = res; // 数据绑定
                        } else if (!this.currentValue || !this.currentValue.length) {
                            this.hasData = false;
                            this.currentValue = []; // 数据绑定
                        }
                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < this.fetcher.limit) this.hasMore = false; // 更多数据的标识
                    }).then(res => {
                        console.log(`[v-scrollor].${this._uid}.refreshList.after: `, this.scrollTarget);
                        if (this.scrollTarget === window) {  // 超出一屏才显示. mod by Dio Zhu. on 2017.12.12
                            console.log(`[v-scrollor].${this._uid}.refreshList.after: `, window.innerHeight, document.body.offsetHeight);
                            this.$nextTick(() => { this.scrollEndTxt = this.scrollEndFlowTag ? true : document.body.offsetHeight > (window.innerHeight * 5 / 4); });
                        } else if (this.scrollTarget) {
                            console.log(`[v-scrollor].${this._uid}.refreshList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
                            this.$nextTick(() => { this.scrollEndTxt = this.scrollEndFlowTag ? true : this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4); });
                        }
                        this.isLoading = false;
                        this.refreshTag = false;
// //                        }).then(res => { // 新增逻辑，如果只有一条记录，点击类目时，开启了endFunc，这里需要继续执行getList。 Author by Dio Zhu. on 2017.12.7
// //                            if (typeof this.endFunc === 'function' &&
// //                                !this.hasMore && this.hasMoreTotal && this.endFuncEnable &&
// //                                this.currentValue && this.currentValue.length <= 1
// //                            ) { // 如果有结束回调
// //                                console.log(`[v-scrollor].${this._uid}.refreshList.after.endFunc: `, typeof this.endFunc, this.endFuncEnable);
// //                                try {
// //                                    if (this.isLoading) return;
// //                                    if (this.isEnding) return;
// //                                    this.isEnding = true;
// //                                    this.isLoading = true;
// //                                    this.endFunc().then(res => {
// //             //                            console.log(`[v-scrollor].${this._uid}.endFunc.after: `, res);
// //                                        if (res) {
// //                                            console.log(`[v-scrollor].${this._uid}.refreshList.endFunc.after: `, res);
// //                                            this.reset({resetData: false, goTop: false}); // 重置，且不清数据！
// //                                            this.getList();
// //                                        } else {
// //                                            this.hasMoreTotal = false;
// //                                        }
// //                                        this.isEnding = false;
// //                                        this.isLoading = false;
// //                                    });
// //                                } catch (e) {
// //                                    console.error(`[v-scrollor].${this._uid}.refreshList.endFunc.after.error: ${e}`);
// //                                }
// //                            }
                    });
                } catch (e) {
                    console.error(`[v-scrollor].${this._uid}.refreshList.after.error: ${e}`);
                    this.isLoading = false;
                    this.refreshTag = false;
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $refresh-height: pxTorem(36px);

    .v-scroll {
        /*height: 100%;*/

        .modal-enter, .modal-leave-to { opacity: 0; transform: scale(0.9); }
        .modal-leave, .modal-enter-to { opacity: 1; transform: scale(1); }
        /*.modal-enter-active, .modal-leave-active { transition: opacity 3500ms }*/
        .modal-enter-active, .modal-leave-active { transition: all 350ms ease-in-out; }

    }

    .v-scroll-container {
        /*height: 100%;*/
        /*overflow: scroll;*/
        /*-webkit-overflow-scrolling: touch;*/

        /*ul {*/
        /*visibility: hidden;*/
        /*// transform: translate3d(0, -72px, 0);*/
        /*}*/

        /* 可以设置不同的进入和离开动画 */
        /* 设置持续时间和动画函数 */
        /*.slide-fade-enter-active {
            transition: all .2s ease;
        }
        .slide-fade-leave-active {
            transition: all .8s ease; // cubic-bezier(1.0, 0.5, 0.8, 1.0);
        }
        .slide-fade-enter, .slide-fade-leave-active {
            transform: translateY(-$refresh-height);
            height: 0;
            opacity: 0;
        }*/
    }

    .v-scroll-refresh {
        width: 100%;
        height: $refresh-height;
        position: absolute;
        padding: 0;
        /*background: #f2f2f4;*/
        display: flex;
        align-items: center;
        justify-content: center;

        .v-spinner {
            text-align: center;
        }
    }

    .v-scroll-content {
        /*border: red 1px solid;*/
    }

    .v-scroll-bottom {
        /*padding: pxTorem(20px) 0;*/
        height: pxTorem(45);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .v-spinner {
            text-align: center;
        }
    }
    .v-scroll-bottom-txt {
        text-align: center;
        font-size: pxTorem(15px);
        color: #c1c1c1;
    }
    .v-scroll-empty {
        width: 100%;
        min-height: pxTorem(100px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .v-scroll-top {
        width: pxTorem(38px);
        height: pxTorem(38px);
        position: fixed;
        z-index: 99;
        bottom: pxTorem(85px);
        right: pxTorem(22px);
        font-size: pxTorem(23px);
        text-align: center;
        line-height: pxTorem(38px);
        color: #fff;
        border-radius: 50%;
        background: #ccc;
        box-shadow: 0 0 pxTorem(3px) #999;
    }
    .null-search-box{
        padding:0 0 pxTorem(40px);
        background:#fff;
        color: #777E8C;
        position: fixed;
        top:pxTorem(181px);
        width:100%;
        .bg_icon{
            // background:url(../img/ico_nosearch.png) no-repeat 50% 50%;
            // background-size: pxTorem(70px);
        }
        .text{
            font-size: pxTorem(14px);
            color: #777E8C;
            letter-spacing: 0;
            line-height: 22px;
            text-align: center;
            .error-img{
                text-align:center;
                padding-bottom:pxTorem(35px);
                img{
                    width:pxTorem(70px);
                    height:pxTorem(70px);
                }
            }
            .error-content{
                color:#4A4A4A;
                font-size:pxTorem(16px);
                line-height:pxTorem(22px);
                text-align:center;
            }
        }
    }
</style>
