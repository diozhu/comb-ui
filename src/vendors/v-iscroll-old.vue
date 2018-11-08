<template>
    <div v-show="isEnabled"
         class="v-iscroll"
    >
            <!-- v-iscroll="getList"
            iscroll-optoins="iscrollOptions" -->
        <div
            :id="'combScroll_'+_uid"
            ref="container"
            class="v-iscroll-container"
        >
            <!--:style="{ 'transform': 'translate3d(0, ' + translate + 'px, 0)' }"-->
            <!--@touchmove.prevent-->
            <!-- 内容插槽 -->
            <div
                 id="vIscrollContent"
                 ref="content"
                 class="v-iscroll-content"
            >
                <ul><li class="row"></li></ul>
                <slot></slot>
            </div>
            <!-- 底部loading && 结束标识 -->
            <div v-if="!refreshTag && (isLoading || (isShowText && scrollEndTxt && currentValue.length > 0))" class="v-iscroll-bottom">
                <transition name="fade">
                    <v-spinner v-show="isLoading" color="#BBBAC2" type="triple-bounce"></v-spinner>
                </transition>
                <transition name="fade">
                    <p class="v-iscroll-bottom-txt" v-show="!isLoading && isShowText && scrollEndTxt && currentValue.length > 0">·&nbsp;END&nbsp;·</p>
                </transition>
            </div>
            <!-- 默认为空样式的插槽 -->
            <div v-if="!hasData && currentValue.length <= 0" class="v-iscroll-empty">
                <slot class="v-iscroll-empty" name="empty">暂无数据</slot>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import Vue from 'vue';
    import Iscroll from './v-iscroll.js';
    import vSpinner from '../vendor/v-spinner/';
    import CONFIG from '../config';
//    import { mapState } from 'vuex';
//    import ScrollPosition from '../vendor/v-iscroll-position.js'; // 滚动条位置信息
    import bus from '../vendor/eventbus'; //eslint-disable-line

    Vue.use(Iscroll);

    /**
     * iscroll 组件
     *              -- Author by Dio Zhu. on 2017.2.11
     */
    export default {
        name: 'v-iscroll',

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

        components: {
            'v-spinner': vSpinner
        },

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

                isEnabled: this.enabled,    // 可用标识
//                translate: 0,               // 下拉刷新的偏移量
//                refreshHeight: 0,           // refresh的dom高度
//                refreshTranslate: 0,        // refresh的dom位移
                scrollTarget: null,          // 当前滚动dom
                iscrollOptions: {
                    mouseWheel: true,
                    // vScrollbar: true,
                    // click: true,
                    // preventDefault: true,
                    // tap: true,
                    // bounce: false,
                    // disableTouch: true,
                    infiniteElements: '#vIscrollContent .row',
                    // dataset: this.getList,
                    // dataFiller: this.updateList,
                    cacheSize: 1000
                }
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
//                this.$logger.log('--------> ', this.dataExist, this.isLoadMore);
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
                this.$logger.log('v-iscroll.watch.enabled! ');
                this.isEnabled = val;
            }
        },

        created () {
            // bus.$on('v-iscroll.refreshList', this.refreshList); // 监听下拉刷新的事件
            // bus.$on('v-iscroll.getList', this.getList); // 监听上拉加载事件
        },
        mounted () {
            this.$logger.log(`[v-iscroll].${this._uid}.mounted...`, this.$route.name, this.$parent.$route.name);
            this.init();
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
                this.$logger.log(`[v-iscroll].${this._uid}.init...`);

                this.reset(); // 重置

                // 初次加载
                this.getList();
//                // 滚动条位置还原
//                this.getPosition(this.timestamp);

//                this.$nextTick(() => {
// //                    this.scrollEndTxt = document.body.scrollHeight > document.body.offsetHeight;
//                    this.refreshHeight = 36 * window.lib.flexible.dpr; // 直接计算，按理说应该去获取dom实际高度，但因使用了v-if，使得高度获取挺费劲。。。暂时这么解决。。。
//                });
            },

            /**
             * 获取数据
             */
            getList () {
                this.$logger.log(`[v-iscroll].${this._uid}.getList.befor: !!!`);
                if (!this.isEnabled) return;  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                // // 结束语判断
                // if (!this.scrollEndTxt) this.scrollEndTxt = document.body.scrollHeight > document.body.offsetHeight;
                let target = this.scrollTarget;
                this.$logger.log(`[v-iscroll].${this._uid}.getList.befor: `, target);

                if (typeof this.func !== 'function' || !this.hasMore) return;  // 无效函数、无数据，直接返回

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

                            // // 结束语判断
                            // if (this.scrollTarget) {
                            //     this.$logger.log(`[v-iscroll].${this._uid}.getList.after: `, this.scrollTarget.scrollHeight, this.scrollTarget.offsetHeight);
                            //     this.scrollEndTxt = this.scrollTarget.scrollHeight > this.scrollTarget.offsetHeight;
                            // }
                        });
                    } catch (e) {
                        this.$logger.error(`[v-iscroll].${this._uid}.getList.after.error: ${e}`);
                    }
                }
            },

            updateList (el, data) {
                this.$logger.warn(`[v-iscroll].${this._uid}.updateList: `, el, data);
            },

            /** nodejs一般采用的区间方式 */
            getListBySection ({ refresh = false } = {}) { // nodejs方式
                this.$logger.log(`[v-iscroll].${this._uid}.getListBySection...`);
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
                        this.$logger.log(`[v-iscroll].${this._uid}.getListBySection.success: ${res}`, this.offset, this.limit);

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
                        this.$logger.error(`[v-iscroll].${this._uid}.getListBySection.error: ${e}`);
                        this.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    this.$logger.error(`[v-iscroll].${this._uid}.getListBySection.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject(e);
                }
            },
            /** go一般采用的区间方式 */
            getListByLimit ({ refresh = false } = {}) { // go方式
                this.$logger.log(`[v-iscroll].${this._uid}.getListByLimit...`);
                try {
                    this.isLoading = true;          // 开始加载
                    return this.func({
                        offset: this.offset,
                        limit: this.limit,
                        refresh: refresh
                    }).then(res => {
                        this.$logger.log(`[v-iscroll].${this._uid}.getListByLimit.success: ${res}`, this.offset, this.limit);

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
                        this.$logger.error(`[v-iscroll].${this._uid}.getListByLimit.error: ${e}`);
                        this.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    this.$logger.error(`[v-iscroll].${this._uid}.getListByLimit.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject(e);
                }
            },

            /** php一般采用的分页方式 */
            getListByPage ({ refresh = false } = {}) { // php方式
                this.$logger.log(`[v-iscroll].${this._uid}.getListByPage...`, this.page, this.pageNum);
                try {
                    this.isLoading = true;          // 开始加载
                    return this.func({
                        page: this.page,
                        pageNum: this.pageNum,
                        refresh: refresh
                    }).then(res => {
                        this.$logger.log(`[v-iscroll].${this._uid}.getListByPage.success: ${res}`);

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
                        this.$logger.error(`[v-iscroll].${this._uid}.getListByPage.error: ${e}`);
                        this.isLoading = false;
                        return Promise.reject(e);
                    });
                } catch (e) {
                    this.$logger.error(`[v-iscroll].${this._uid}.getListByPage.error: ${e}`);
                    this.isLoading = false;
                    return Promise.reject(e);
                }
            },

            /** 时间戳分页，秘语中的分页方式. Author by Feng Xu. on 2017.4.17 */
            getListByTime ({ refresh = false } = {}) {
                this.$logger.log(`[v-iscroll].${this._uid}.getListByTime...`, this.oTime, this.pageSize);
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
                        } else if (res.length <= 10) {
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
                if (!this.isEnabled) return;  // 当前滚动条非可用时，直接返回，用于同页面多个实例的时候
                this.$logger.log(`!!!v-iscroll.${this._uid}.refreshList...`);
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
                            this.$logger.log(`[v-iscroll].${this._uid}.refreshList.after: `, this.currentValue.length);
                            if (res && res.length) {
                                this.currentValue = res;
                            }
//                            // 刷新之后，去除之前的历史数据
//                            if (this.currentValue && res && this.currentValue.length > 0 && res.length > 0 && this.currentValue.length > res.length) {
//                                this.currentValue = this.currentValue.slice(this.currentValue.length - res.length, this.currentValue.length);
//                            }
                            // 结束语判断
                            // let target = this.scrollTarget;
                            // this.$logger.log(`[v-iscroll].${this._uid}.refreshList.after: `, target.scrollHeight, target.offsetHeight);
                            // this.scrollEndTxt = target.scrollHeight > target.offsetHeight;

                            this.refreshTag = false;
//                            this.inertia(this.translate);
                        }).catch(e => {
                            this.refreshTag = false;
                            this.$logger.error(`[v-iscroll].${this._uid}.refreshList.after.error: ${e}`);
                        });
                    } catch (e) {
                        this.refreshTag = false;
                        this.$logger.error(`[v-iscroll].${this._uid}.refreshList.after.error: ${e}`);
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

    .v-iscroll {
        height: 100%;
    }

    .v-iscroll-container {
        width: 100%;
        height: 100%;
        overflow: scroll;
        -webkit-overflow-scrolling: touch;
        position: absolute;
        top: 0;
        left: 0;

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

    .v-iscroll-refresh {
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

    .v-iscroll-content {
        /*border: red 1px solid;*/
        // height: 100%;
        position: absolute;
        z-index: 1;
        -webkit-tap-highlight-color: rgba(0,0,0,0);
        width: 100%;
        transform: translateZ(0);
        user-select: none;
        text-size-adjust: none;
    }

    .v-iscroll-bottom {
        padding: pxTorem(20px) 0;

        .v-spinner {
            text-align: center;
        }
    }
    .v-iscroll-bottom-txt {
        text-align: center;
        font-size: pxTorem(15px);
        color: #c1c1c1;
    }
    .v-iscroll-empty {
        width: 100%;
        min-height: pxTorem(100px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .v-iscroll-top {
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
