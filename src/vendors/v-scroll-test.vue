<template>
    <div v-show="isEnabled"
         class="v-scroll"
    >
        <div
            :id="'combScroll_'+_uid"
            ref="container"
            class="v-scroll-container"
            v-scroll="getList"
            scroll-disabled="isLoading"
            scroll-distance="scrollDistance"
            scroll-enabled="isEnabled"
            scroll-tombstone="tombstone"
            v-scroll-position
        >
            <!--:style="{ 'transform': 'translate3d(0, ' + translate + 'px, 0)' }"-->
            <!-- 内容插槽 -->
            <div ref="content" class="v-scroll-content">
                <slot></slot>
                <!-- <slot name="footer" :class="[]"></slot> -->
            </div>
            <!-- 底部loading && 结束标识 -->
            <div v-if="!refreshTag && (isLoading || (isShowText && scrollEndTxt && currentValue.length > 0))" class="v-scroll-bottom">
                <transition name="fade">
                    <v-spinner v-show="isLoading" color="#BBBAC2" type="triple-bounce"></v-spinner>
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
            <!-- <div v-if="!hasDataParent && currentValue.length <= 0" class="null-search-box">
                <div class="bg_icon"></div>
                <div class="text" v-if="!from">
                    <div class="error-img">
                    </div>
                    <div class="error-content">
                        暂无数据
                    </div>
                </div>
                <div class="text" v-if="from">没搜索到相关内容！</div>
            </div> -->
            <!--
             <div v-if="!hasData && currentValue.length <= 0" class="null-search-box">
                <div class="bg_icon"></div>
                <div class="text" v-if="!from">
                    <div class="error-img">
                         <img src="../assets/pic_cont.png" />
                    </div>
                    <div class="error-content">
                        暂无数据
                    </div>
                </div>
                <div class="text" v-if="from">没搜索到相关内容！</div>
            </div>-->
        </div>
        <!-- 返回顶部 -->
        <transition name="fade">
            <div v-show="toper && goTopTag" @click="goTop" class="v-scroll-top icon icon-top"></div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import Vue from 'vue';
    import Scroll from './v-scroll';
    import vSpinner from '../vendor/v-spinner/';
    import CONFIG from '../config';
//    import { mapState } from 'vuex';
//    import ScrollPosition from '../vendor/v-scroll-position.js'; // 滚动条位置信息
    import bus from '../vendor/eventbus';
    // import * as dom from '../js/utils/dom.js';

    Vue.use(Scroll);

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
        name: 'v-scroll',

        props: {
            from: String,
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

            /**
             *  如果当前页面使用了keep-alive，根据路由变化，判断组件的_inactive，设置isEnabled，避免事件重复触发
             *  加上nexttick是因为改版后（vue、vue-router），_inactive的渲染顺序变了。。。
             *  暂时这么处理，并非最佳方案，需要考虑更好的实现。。。
             *                  -- Author by Dio Zhu. on 2017.5.15
             *  之前的滚动记录需要记录在vuex上，现在改为标签属性方式，在v-scroll-position中处理，所以不需要在此进行滚动还原
             *                  -- Author by Dio Zhu. on 2017.5.25
             */
            // '$route.name' (val) {
            //     console.log(`v-scroll.${this._uid}.watch: $route!!!`, val, this._inactive, this.$router.direct());
            //     this.$nextTick(() => {
            //         console.log(`v-scroll.${this._uid}.watch: $route!!!`, val, this._inactive, this.$router.direct());
            //         if (!this._inactive) { // 激活时重新加载
            //             this.isEnabled = this.enabled;
            //             if (this.$router.direct()) { // in
            //                 this.init(); // 如果当前页面是keep-alive的，这里重新初始化
            //             } else { // back
            //                 // do nothing ...
            //             }
            //         } else {
            //             this.isEnabled = false;
            //         }
            //     });
/*
                this.$nextTick(() => {
                    console.log(`v-scroll.${this._uid}.watch: $route!!!`, val, this._inactive);
                    if (!this._inactive) { // 激活时重新加载，这里可根据实际需要进行重新定义
                        this.isEnabled = this.enabled;
//                        if (this.isEnabled) this.$router.scrollTarget = this.scrollTarget; // 保存滚动容器
//                        // 如果保存了位置信息，还原"容器"的滚动条位置，window的走route的scrollBehavior
//                        if (this.position && this.position[this.timestamp] && this.position[this.timestamp].y >= 0) {
//                        console.log(`v-scroll.${this._uid}.watch: $route!!!`, this.position[this.timestamp]);
// //                        let y = this.position[this.timestamp].y || 0;
// //                        this.$nextTick(() => {
// // //                            this.$el.scrollTop = y;
// //                            this.scrollTarget.scrollTop = y;
// //                        });
//                        if (this.scrollTarget && this.scrollTarget !== window) {
//                            this.$nextTick(() => {
//                                this.scrollTarget.WebKitOverflowScrolling = 'auto'; // 避免ios容器白屏，再次点击才出现的问题。。。
//                                this.scrollTarget.scrollTop = this.position[this.timestamp].y || 0;
//                                this.scrollTarget.WebKitOverflowScrolling = 'touch';
//                            });
//                        }
//                        } else { // 如果没保存过信息，说明是新页面，重新加载数据。按理说应该使用activated钩子，组件没有此方法，如果用$parent又无法保证嵌套调用，所以采用此方式~
//                            this.currentValue = [];
//                            this.refreshList();
//                            this.$emit('reset', true);
//                        }
//                        this.currentValue = [];
                        this.$nextTick().then(() => {
                            ScrollPosition.inserted(this.scrollTarget);
                        });
                    } else { // 失效
                        this.isEnabled = false;
                    }
                });
*/
            // }
        },

        created () {
            console.log(`[v-scroll].${this._uid}.created...`);
            bus.$on('v-scroll.refreshList', this.refreshList); // 监听下拉刷新的事件
            bus.$on('v-scroll.getList', this.getList); // 监听上拉加载事件
//            this.init();
            if (!this.$route.meta || !this.$route.meta.keepAlive) this.init(); // 如果路由没有设定keepAlive，再执行init函数，否则会重复执行。 Author by Dio Zhu. on 2017.12.2
        },
        mounted () {
            this.pageHeight = window.screen.height;
            console.log(`[v-scroll].${this._uid}.mounted...`, this.$route.name, this.$parent.$route.name);
        },

        activated () {
            console.log(`*[v-scroll].${this._uid}.activated...`, this._inactive, this.$router.direct());
            this.isEnabled = this.enabled;
            // this.init(); // 如果当前页面是keep-alive的，这里重新初始化
            if (this.$router.direct()) { // in
                if (!this.isGoInit) {
                    return false;
                }
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

                this.reset(); // 重置

                // 初次加载
                if (!this.tombstone) this.getList();
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
                // console.log(`[v-scroll].${this._uid}.getList.befor: !!!`);
                if (!this.isEnabled) return;  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                // 结束语判断
                // if (!this.scrollEndTxt && this.scrollTarget) this.scrollEndTxt = document.body.scrollHeight > document.body.offsetHeight;
                if (!this.scrollEndTxt && this.scrollTarget) this.scrollEndTxt = this.scrollEndFlowTag ? true : this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);
                let target = this.scrollTarget;

                if (typeof this.func !== 'function' || !this.hasMore) return;  // 无效函数、无数据，直接返回

                console.log(`[v-scroll].${this._uid}.getList.befor: `, target);
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
                        func().then(res => {
                            // 数据绑定
                            if (res && res.length) {
                                this.currentValue = this.currentValue.concat(res);
                            }
//                        }).then(res => { // 放在上面无法正确判断渲染后的高度对比，又不想用nextTick。 mod by Dio Zhu. on 2017.6.14
                            // 可以试试在上面加上return Promis.resove();，之前上面那句不好使是忘记了返回Promis对象。。。回头试试。。。Dio Zhu. on 2017.6.30
                            // 结束语判断
                            if (this.scrollTarget) {
                                console.log(`[v-scroll].${this._uid}.getList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
                                // 判断页面是否加载完毕 2017-06-30 孙乐卿
                                this.$nextTick(() => {
                                    this.scrollEndTxt = this.scrollEndFlowTag ? true : this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);
                                });
                            }
                        });
                    } catch (e) {
                        console.error(`[v-scroll].${this._uid}.getList.after.error: ${e}`);
                    }
                }
            },

            /** nodejs一般采用的区间方式 */
            getListBySection ({ refresh = false } = {}) { // nodejs方式
                console.log(`[v-scroll].${this._uid}.getListBySection...`);
                try {
                    this.isLoading = true;          // 开始加载

                    let offset = this.offset,
                        limit = this.offset + this.limit;

                    if (this.tombstone) this.offset += this.limit; // 如果是墓碑模式，为保持持续滚动不卡，需要前置分页信息

                    return this.func({
                        offset: offset,
                        limit: limit,
                        refresh: refresh
                    }).then(res => {
                        console.log(`[v-scroll].${this._uid}.getListBySection.success: ${res}`, this.offset, this.limit);

                        if (res && res.length > 0) {
                            this.hasData = true;              // 数据标识
                            if (!this.tombstone) this.offset += res.length;      // 非墓碑模式的区间递增
//                            this.listCount += res.length;   // list计数
                        } else if (this.offset <= 0) {
                            this.hasData = false;             // 无数据
                        }

                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < this.limit) this.hasMore = false;
                        this.isLoading = false;
                        return Promise.resolve(res);
                    }).catch(e => {
                        console.error(`[v-scroll].${this._uid}.getListBySection.error: ${e}`);
                        this.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    console.error(`[v-scroll].${this._uid}.getListBySection.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject(e);
                }
            },
            /** go一般采用的区间方式 */
            getListByLimit ({ refresh = false } = {}) { // go方式
                console.log(`[v-scroll].${this._uid}.getListByLimit...`);
                try {
                    this.isLoading = true;          // 开始加载
                    return this.func({
                        offset: this.offset,
                        limit: this.limit,
                        refresh: refresh
                    }).then(res => {
                        console.log(`[v-scroll].${this._uid}.getListByLimit.success: ${res}`, this.offset, this.limit);

                        if (res && res.length > 0) {
                            this.hasData = true;            // 数据标识
                            this.offset += res.length;      // 区间递增
//                            this.listCount += res.length;   // list计数
                        } else if (this.offset <= 0) {
                            this.hasData = false;           // 无数据
                        }

                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < this.limit) this.hasMore = false;
                        this.isLoading = false;
                        return Promise.resolve(res);
                    }).catch(e => {
                        console.error(`[v-scroll].${this._uid}.getListByLimit.error: ${e}`);
                        this.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    console.error(`[v-scroll].${this._uid}.getListByLimit.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject(e);
                }
            },

            /** php一般采用的分页方式 */
            getListByPage ({ refresh = false } = {}) { // php方式
                console.log(`[v-scroll].${this._uid}.getListByPage...`, this.page, this.pageNum);
                try {
                    this.isLoading = true;          // 开始加载
                    return this.func({
                        page: this.page,
                        pageNum: this.pageNum,
                        refresh: refresh
                    }).then(res => {
                        console.log(`[v-scroll].${this._uid}.getListByPage.success: ${res}`);

                        if (res && res.length > 0) {
                            this.hasData = true;            // 数据标识
                            this.page += 1;                 // 区间递增
//                            this.listCount += res.length;   // list计数
                        } else if (this.page <= 1) {
                            this.hasData = false;           // 无数据
                        }

                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < this.pageNum) this.hasMore = false;
                        this.isLoading = false;
                        return Promise.resolve(res);
                    }).catch(e => {
                        console.error(`[v-scroll].${this._uid}.getListByPage.error: ${e}`);
                        this.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    console.error(`[v-scroll].${this._uid}.getListByPage.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject(e);
                }
            },

            /** 时间戳分页，秘语中的分页方式. Author by Feng Xu. on 2017.4.17 */
            getListByTime ({ refresh = false } = {}) {
                console.log(`[v-scroll].${this._uid}.getListByTime...`, this.oTime, this.pageSize);
                var self = this;
                try {
                    self.isLoading = true;          // 开始加载
                    return self.func({
                        oTime: self.oTime,
                        pageSize: self.pageSize,
                        refresh: refresh
                    }).then(({res = [], last = -1} = {}) => {
                        if (res && res.length > 0) {
                            self.hasData = true;// 数据标识
                            self.oTime = last;                 // 区间递增
//                            this.listCount += res.length;   // list计数
                        // } else if (res.length <= 10) {
                        } else if (!this.currentValue.length) {
                            self.hasData = false;           // 无数据
                        }

                        /** 只返回数据, 根据请求数和返回数判断是否没数据了 */
                        if (!res || res.length < 10) self.hasMore = false;
                        self.isLoading = false;
                        return Promise.resolve(res, last);
                    }).catch(e => {
                        self.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    self.isLoading = false;
                    return Promise.reject(e);
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
                                this.scrollEndTxt = this.scrollEndFlowTag ? true : this.scrollTarget.scrollHeight > (this.scrollTarget.offsetHeight * 5 / 4);
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
