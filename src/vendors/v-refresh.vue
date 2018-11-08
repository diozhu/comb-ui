<template>
    <div class="v-refresh" :id="'vRefresh_'+_uid">
        <div tag="div" ref="container" class="v-refresh__container"
             v-refresh="refresh"
             refresh-enabled="refreshTag"
             refresh-translate="translate"
             v-scroll-position
        >
            <!-- 下拉刷新 -->
            <transition name="slide-fade">
                <div v-show="refreshTag" :id="'vRefresher' + _uid" class="v-refresh__spinner" :style="[
                  { 'transform': 'translate3d(0, ' + refreshTranslate + 'px, 0)' },
                  { '-webkit-transform': 'translate3d(0, ' + refreshTranslate + 'px, 0)' }
                  ]">
                    <v-spinner color="#BBBAC2" type="triple-bounce"> </v-spinner>
                </div>
            </transition>
            <!-- 内容插槽 -->
            <div ref="content" class="v-refresh__content" :style="[
                 { 'transform': translate ? 'translate3d(0, ' + translate + 'px, 0)' : '' },
                 { '-webkit-transform': translate ? 'translate3d(0, ' + translate + 'px, 0)' : '' }
                 ]">
                <slot></slot>
            </div>
        </div>
    </div>
    <!--</v-touch>-->
</template>
<script type="text/ecmascript-6">
    import Vue from 'vue';
    import vSpinner from '../vendor/v-spinner/';
    import { mapState } from 'vuex';
    import Refresh from './v-refresh';
    import bus from '../vendor/eventbus';
    // import * as dom from '../js/utils/dom.js';

    Vue.use(Refresh);

    /**
     * 下拉刷新组件
     *              -- Author by Dio Zhu. on 2017.4.21
     */
    export default {
        name: 'v-refresh',

        props: {
            func: Function,         // 加载所需函数
            toper: {                // 返回顶部
                type: Boolean,
                default: false
            },
            value: {                // 当前滑动标识，支持左滑右划，v-model绑定
                type: Number,
                default: 0
            },
            swipeLength: {             // 可滑动最大范围
                type: Number,
                default: 1
            }
        },

        components: { vSpinner },

        data () {
            return {
                uid: this._uid,
                currentValue: this.value,   // 当前滑动标识
                refreshTag: false,          // 刷新的标识

                startY: 0,
                startScrollTop: 0,
                direction: '',              // 方向
                translate: 0,               // 下拉刷新的偏移量
                refreshHeight: 0,           // refresh的dom高度
                refreshTranslate: 0,        // refresh的dom位移

                pullTarget: null          // 当前滚动dom
            };
        },

        computed: {
            ...mapState({
                position: state => state.status.position
            }),

            timestamp () { // 时间戳，滚动位置记录的key
                return this.$route.query.timestamp || -1;
            }
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.$emit('input', val);
            },

            translate (val) {
                // this.$logger.log(`v-refresh.${this._uid}.watch.translate: ${val}, ${val - this.refreshHeight}`);
                if (val >= this.refreshHeight) {
                    this.refreshTranslate = 0;
                } else {
                    this.refreshTranslate = val - (this.refreshHeight);
                }
            },
            refreshTag (val) {
                this.$emit('handleRefreshTag', val);
            }
        },

        created () {
            this.$logger.log(`v-refresh.${this._uid}.created...`, this.$route);
//            this.init();
            if (!this.$route.meta || !this.$route.meta.keepAlive) this.init(); // 如果路由没有设定keepAlive，再执行init函数，否则会重复执行。 Author by Dio Zhu. on 2017.12.2
        },
        mounted () {
            this.$logger.log(`v-refresh.${this._uid}.mounted...`);
        },
        activated () {
            this.$logger.log(`*[v-refresh].${this._uid}.activated...`, this._inactive);
            // this.init(); // 如果当前页面是keep-alive的，这里重新初始化
            if (this.$router.direct()) { // in
                this.init(); // 如果当前页面是keep-alive的，这里重新初始化
            } else { // back
                // do nothing ...
            }
            // dom.addClass(window.document.documentElement, 'overflow'); // body绑定overflow样式
        },
        deactivated () {
            this.$logger.log(`*[v-refresh].${this._uid}.deactivated...`, this._inactive);
            this.isEnabled = false;
            // dom.removeClass(window.document.documentElement, 'overflow'); // 移除overflow样式
        },

        methods: {
            reset ({resetData = true} = {}) {
            },

            init () {
                this.$logger.log(`v-refresh.${this._uid}.init...`);
                // dom.addClass(window.document.documentElement, 'overflow'); // body绑定overflow样式

                this.$nextTick(() => {
                    this.refreshHeight = 36 * window.lib.flexible.dpr; // 直接计算，按理说应该去获取dom实际高度，但因使用了v-if，使得高度获取挺费劲。。。暂时这么解决。。。
                });
            },
            /**
             * 惯性
             *              -- Author By Dio Zhu. on 2017.3.23
             */
            inertia (val) {
                let _self = this,
                    startTime = Date.now(),
                    deceleration = 0.09; // 减速配比
                function go () {
                    // if (_self.refreshTag) return;
                    let nowTime = Date.now(),
                        t = nowTime - startTime,
                        v = val / t / deceleration;
//                    _self.$logger.log('============>', val, t, v);
                    if (_self.refreshTag || Math.floor(v) === 0) {
                        _self.translate = 0;
                        return;
                    }
                    _self.translate = v;
                    setTimeout(go, 10);
                }
                setTimeout(go, 10);
            },

            /**
             * 获取数据
             * mod: 先运行this.func，可以恢复参数，然后再通知v-scroll.refresh！！！
             *              -- Author by Dio Zhu. on 2017.12.7
             */
            refresh () {
                this.$logger.log(`v-refresh.${this._uid}.refresh.befor: `); //eslint-disable-line

//                bus.$emit('v-scroll.refreshList'); // 不能放这儿。。。应该先运行this.func，完成数据初始化，再调用refreshList重新拉取数据。。。Author by Dio Zhu. on 2017.12.7

                if (typeof this.func === 'function') {
                    this.refreshTag = true;
                    try {
                        this.func().then(res => {
                            bus.$emit('v-scroll.refreshList');
                            this.refreshTag = false;
                            this.inertia(this.translate);
                            this.$logger.log(`v-refresh.${this._uid}.refresh.after: `);
                        }).catch(e => {
                            this.refreshTag = false;
                            this.inertia(this.translate);
                            this.$logger.error(`v-refresh.${this._uid}.refresh.after.error: ${e}`);
                        });
                    } catch (e) {
                        this.refreshTag = false;
                        this.inertia(this.translate);
                        this.$logger.error(`v-refresh.${this._uid}.refresh.after.error: ${e}`);
                    }
                } else {
                    bus.$emit('v-scroll.refreshList');
                    this.refreshTag = false;
                    this.inertia(this.translate);
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $refresh-height: pxTorem(36px);

    /*.v-touch { // 重置外层手势的touch-action*/
        /*touch-action: none !important;*/

        /*.page {*/
            /*touch-action: none !important;*/
        /*}*/
    /*}*/

    .v-refresh {
        height: 100%;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }

    .v-refresh__container {
        height: 100%;
        overflow: auto;
        /*overflow-x: hidden;*/
        /*overflow-y: auto;*/
        -webkit-overflow-scrolling: touch;
        /*touch-action: pan-x !important;*/
        background: $body-bg;
        /*border: #ff8f4f 10px solid;*/

        /*ul {*/
        /*visibility: hidden;*/
        /*// transform: translate3d(0, -72px, 0);*/
        /*}*/

        /* 可以设置不同的进入和离开动画 */
        /* 设置持续时间和动画函数 */
        .slide-fade-enter-active {
            transition: all .2s ease;
        }
        .slide-fade-leave-active {
            transition: all .8s ease; // cubic-bezier(1.0, 0.5, 0.8, 1.0);
        }
        .slide-fade-enter, .slide-fade-leave-active {
            transform: translateY(-$refresh-height);
            height: 0;
            opacity: 0;
        }

        &:after {
            comtent:'';
            display:table;
            clear:both;
        }
    }

    .v-refresh__spinner {
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

</style>
