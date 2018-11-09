<template>
    <!-- v-show="isEnabled" -->
    <div class="v-scroll"
    >
        <div
            :id="'combScroll_'+_uid"
            ref="container"
            class="v-scroll-container"
            v-scroll-position
        >
            <!-- 内容插槽 -->
            <div ref="content" class="v-scroll-content">
                <slot></slot>
            </div>
            <!-- 底部loading && 结束标识 -->
            <v-intersect @enter="getList" :threshold="[0, 1]">
                <div v-if="hasMore || (isShowText && scrollEndTxt && currentValue.length > 0)" class="v-scroll-bottom">
                    <transition name="fade">
                        <v-spinner v-show="hasMore" color="#BBBAC2" type="triple-bounce"></v-spinner>
                    </transition>
                    <transition name="fade">
                        <p class="v-scroll-bottom-txt" v-show="isShowText && scrollEndTxt && currentValue.length > 0">·&nbsp;END&nbsp;·</p>
                    </transition>
                </div>
            </v-intersect>
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
    // import Scroll from './v-scroll';
    import vSpinner from '../vendor/v-spinner/';
    import CONFIG from '../config';
    import vIntersect from '../vendor/v-intersect.vue';
//    import { mapState } from 'vuex';
//    import ScrollPosition from '../vendor/v-scroll-position.js'; // 滚动条位置信息
    import bus from '../vendor/eventbus';
    import * as api from '../js/core/api.js'; //eslint-disable-line
    import * as dom from '../js/utils/dom.js';

    // import Vue from 'vue';
    // Vue.use(Scroll);

    /**
     * scroll-io 组件，使用intersectionObserver方式替代之前的事件监听方式
     * 根据底下的loading动画的dom可见与否，判断是否需要加载，实现无尽滚动
     * 由于intersectionObserver的实现为异步方式，且执行权限较低，而且兼容性不好（虽说使用了polyfill），需要在ios各版本下测试后使用。。。
     *              -- Author by Dio Zhu. on 2017.2.11
     */
    export default {
        name: 'v-scroll',

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
            }
//            loading: {
//                type: Boolean,
//                default: false
//            },
//            isLoadMore: Boolean, // 加载提示
//            dataExist: Boolean,  // 是否有数据
//            classes: String      // 附加class
        },

        components: { vSpinner, vIntersect },

        data () {
            return {
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
                hasData: true,              // 是否存在数据, 决定是否显示特定样式的"空白页"
                hasMore: true,              // 是否还有数据, 决定最底下是否显示" - 已加载完毕 - "样式
                isLoading: false,           // 正在加载
//                listCount: 0,               // 数据列表计数，用于初始加载判断
                scrollEndTxt: false,        // 列表结束语显示标识
                refreshTag: false,          // 刷新的标识

                isEnabled: this.enabled    // 可用标识
//                translate: 0,               // 下拉刷新的偏移量
//                refreshHeight: 0,           // refresh的dom高度
//                refreshTranslate: 0,        // refresh的dom位移
                // scrollTarget: null          // 当前滚动dom
            };
        },

        computed: {
//            ...mapState({
//                position: state => state.status.position
//            }),

//            timestamp () { // 时间戳，滚动位置记录的key
//                return this.$route.query.timestamp || -1;
//            },

            isShowText () {
//                console.log('--------> ', this.dataExist, this.isLoadMore);
                return !!(this.hasData && !this.hasMore);
//                return !!(this.hasData && !this.hasMore && document.body.scrollTop > 100);
            }
        },

        watch: {
            value (val) {
                this.currentValue = val;

                // 取消此方式刷新数据，如果要刷新，使用eventbus。 mod by Dio Zhu. on 2017.7.1
//                if (val.length < 1 && this.isEnabled && !this.isLoading && !this.refreshTag) { // 客户端直接清空listdata，触发刷新事件
//                    console.log(`[v-scroll].${this._uid}.watch: value`, val);
//                    this.refreshList();
//                }
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
            console.log(`[v-scroll].${this._uid}.created...`);
            bus.$on('v-scroll.refreshList', this.refreshList); // 监听下拉刷新的事件
            bus.$on('v-scroll.getList', this.getList); // 监听上拉加载事件
            if (!this.$route.matched.some(record => record.meta.keepAlive)) this.init(); // 非keep-alive时执行，否则放在activated中初始化. add by Dio Zhu. on 2017.9.11
        },
        mounted () {
            console.log(`[v-scroll].${this._uid}.mounted...`, this.$route.name, this.$parent.$route.name, this.$store.state.route.name);
            // let ob = new window.IntersectionObserver((res) => {
            //     console.warn('@@@@@@@@', res);
            // });
            console.log(`###### [v-scroll].${this._uid}.mounted...`, 'IntersectionObserver' in window);
        },

        activated () {
            console.log(`*[v-scroll].${this._uid}.activated...`, this._inactive);
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
            console.log(`*[v-scroll].${this._uid}.deactivated...`, this._inactive);
            this.isEnabled = false;

            // dom.removeClass(window.document.documentElement, 'overflow'); // 移除overflow样式
        },
        beforeDestroy () {
            console.log(`*[v-scroll].${this._uid}.beforeDestroy...`);
        },

        methods: {
            reset ({resetData = true} = {}) {
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

                if (resetData) this.currentValue = [];
            },

            init () {
                console.log(`[v-scroll].${this._uid}.init...`);

                // dom.addClass(window.document.documentElement, 'overflow'); // body绑定overflow样式
                this.scrollTarget = dom.getScrollEventTarget(this.$refs.container);

                this.reset(); // 重置

                // // 初次加载
                // if (!this.tombstone) this.getList();
//                // 滚动条位置还原
//                this.getPosition(this.timestamp);

//                this.$nextTick(() => {
// //                    this.scrollEndTxt = document.body.scrollHeight > document.body.offsetHeight;
//                    this.refreshHeight = 36 * window.lib.flexible.dpr; // 直接计算，按理说应该去获取dom实际高度，但因使用了v-if，使得高度获取挺费劲。。。暂时这么解决。。。
//                });
            },

            goTop () {
                let target = this.scrollTarget;
                console.log(`[v-scroll].${this._uid}.getList.after: `, target.scrollHeight, target.offsetHeight);
                if (target === window) {
                    window.scrollTo(0, 0);
                } else {
//                    target.scrollTop = 0;
                    if (target.scrollTop > 0) {
                        target.scrollTop -= 1000;
                        setTimeout(this.goTop, 30);
                    }
                }
            },

            /**
             * 获取数据
             */
            getList () {
                console.log(`[v-scroll].${this._uid}.getList.befor: !!!`);
                if (!this.isEnabled) return;  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                if (this.isLoading) return;  // 加载时不处理分页
                // 结束语判断
                // if (!this.scrollEndTxt && this.scrollTarget) this.scrollEndTxt = document.body.scrollHeight > document.body.offsetHeight;
                if (!this.scrollEndTxt && this.scrollTarget) this.scrollEndTxt = this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);

                if (typeof this.func !== 'function' || !this.hasMore) return;  // 无效函数、无数据，直接返回

//                 let func = null;
//                 if (this.funcType === 'section') {
//                     func = this.getListBySection;
//                 } else if (this.funcType === 'limit') {
//                     func = this.getListByLimit;
//                 } else if (this.funcType === 'page') {
//                     func = this.getListByPage;
//                 } else if (this.funcType === 'time') {
//                     func = this.getListByTime;
//                 }

//                 if (typeof func === 'function') {
//                     try {
//                         func().then(res => {
//                             // 数据绑定
//                             if (res && res.length) {
//                                 this.currentValue = this.currentValue.concat(res);
//                             }
// //                        }).then(res => { // 放在上面无法正确判断渲染后的高度对比，又不想用nextTick。 mod by Dio Zhu. on 2017.6.14
//                             // 可以试试在上面加上return Promis.resove();，之前上面那句不好使是忘记了返回Promis对象。。。回头试试。。。Dio Zhu. on 2017.6.30
//                             // 结束语判断
//                             if (this.scrollTarget) {
//                                 console.log(`[v-scroll].${this._uid}.getList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
//                                 // 判断页面是否加载完毕 2017-06-30 孙乐卿
//                                 this.$nextTick(() => {
//                                     this.scrollEndTxt = this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);
//                                 });
//                             }
//                         });
//                     } catch (e) {
//                         console.error(`[v-scroll].${this._uid}.getList.after.error: ${e}`);
//                     }
//                 }

                try {
                    this.isLoading = true;
                    if (!this.fetcher) this.fetcher = api.getFetcher(this.func, this.funcType);
                    return this.fetcher.fetch().then(res => {
                        console.log(`[v-scroll].${this._uid}.getList.api.after.success: `, res);
                        if (res && res.length) {
                            this.hasData = true;
                            this.currentValue = this.currentValue.concat(res); // 数据绑定
                        } else if (!this.currentValue || !this.currentValue.length) {
                            this.hasData = false;
                        }
                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < this.fetcher.limit) this.hasMore = false;
                    }).then(res => {
                        console.log(`[v-scroll].${this._uid}.getList.after: `, this.scrollTarget);
                        if (this.scrollTarget) {
                            console.log(`[v-scroll].${this._uid}.getList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
                            // 判断页面是否加载完毕 2017-06-30 孙乐卿
                            this.$nextTick(() => {
                                this.scrollEndTxt = this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);
                            });
                        }
                        this.isLoading = false;
                    });
                } catch (e) {
                    console.error(`[v-scroll].${this._uid}.getList.after.error: ${e}`);
                    this.isLoading = false;
                }
            },

            refreshList () {
                // 添加了 || this._isDestroyed的判断，源于食上的详情页，非keepalive，从评论列表到发布评论再返回时，会初始化多个列表实例，造成多个请求。。。
                if (!this.isEnabled || this._isDestroyed) return;  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                console.log(`!!!v-scroll.${this._uid}.refreshList...`);
                if (typeof this.func !== 'function') return;  // 无效函数、无数据，直接返回

                this.refreshTag = true;
                let func = null;
                if (this.funcType === 'section') {
                    func = this.getListBySection;
                } else if (this.funcType === 'limit') {
                    func = this.getListByLimit;
                } else if (this.funcType === 'page') {
                    func = this.getListByPage;
                } else if (this.funcType === 'time') {
                    func = this.getListByTime;
                }

                if (typeof func === 'function') {
                    try {
//                        this.reset(); // 重置如果先清除数据，待接口返回后渲染，屏幕会白屏一段时间。。。
                        this.reset({resetData: false}); // 重置，不清除数据，回调之后按照分页数量删除数组内容，避免重新渲染时屏幕闪~ Author by Dio Zhu. on 2017.4.12

                        func({refresh: true}).then(res => {
                            console.log(`[v-scroll].${this._uid}.refreshList.after: `, this.currentValue.length);
                            if (res && res.length) {
                                this.currentValue = res;
                            } else { // 如果删除了第一条，然后调用此方法，返回的是空数据。 mod by Dio Zhu. on 2017.7.1
                                this.currentValue = [];
                            }
//                            // 刷新之后，去除之前的历史数据
//                            if (this.currentValue && res && this.currentValue.length > 0 && res.length > 0 && this.currentValue.length > res.length) {
//                                this.currentValue = this.currentValue.slice(this.currentValue.length - res.length, this.currentValue.length);
//                            }
                            this.refreshTag = false;
//                            this.inertia(this.translate);
                        }).then(res => {
                            // 结束语判断
                            if (this.scrollTarget) {
                                console.log(`[v-scroll].${this._uid}.refreshList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
                                this.scrollEndTxt = this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);
                            }
                        }).catch(e => {
                            this.refreshTag = false;
                            console.error(`[v-scroll].${this._uid}.refreshList.after.error: ${e}`);
                        });
                    } catch (e) {
                        this.refreshTag = false;
                        console.error(`[v-scroll].${this._uid}.refreshList.after.error: ${e}`);
                    }
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
        height: 100%;
    }

    .v-scroll-container {
        height: 100%;
        overflow: scroll;
        -webkit-overflow-scrolling: touch;

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
        padding: pxTorem(20px) 0;

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
</style>
