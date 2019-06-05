<template>
    <div ref="laya" class="v-laya" :style="style">&nbsp;</div>
</template>
<script>
    import * as dom from '../js/utils/dom.js';
    import _ from 'underscore';

    export default {
        name: 'v-laya',
        props: {
        },
        data () {
            return {
                dpr: window.lib.flexible.dpr || 1,
                ossUrl: '//static.91wuliu.com/laya',
                libs: [
                    'laya.core.js',
                    'laya.webgl.js',
                    'laya.ui.js',
                    'laya.physics.js'
                ],
                bundleJs: 'bundle.js',
                style: {},
                layaDOM: undefined // laya的dom对象
            };
        },
        // computed: {
        //     // layaDOM () {
        //     //     return document.getElementById('layaContainer');
        //     // }
        // },
        // watch: {
        //     layaDOM (val) {
        //         this.repaint();
        //     }
        // },
        created () {
            if (!window.Laya) {
                this.loadLibs(); // 加载类库
            }
        },
        mounted () {
            this.init();
            // this.$nextTick(() => {
            //     this.init();
            // });
        },
        methods: {
            init () {
                this.scrollEventBinding();
                // window.addEventListener();
                let obj = document.getElementById('layaCanvas');
                console.log('v-laya.init...', obj);
                 // 加载laya项目文件
                this.loadLibSync().then(() => {
                    let dom = document.getElementById('layaCanvas');
                    if (dom) {
                        setTimeout(() => {
                            this.repaint();
                        }, 0);
                        // this.repaint();
                        //     let p = obj.parentNode,
                        //         c = obj.cloneNode(true);
                        //     this.$el.appendChild(c);
                        //     p.removeChild(obj);
                        //     // this.$nextTick(() => {
                        //     //     p.removeChild(obj);
                        //     // });
                        // let o = obj.getBoundingClientRect();
                    }
                    // console.log('v-laya.init...', dom);
                });
            },
            scrollEventBinding () {
                let scrollEventTarget = dom.getScrollEventTarget(this.$el);
                scrollEventTarget.addEventListener('scroll', this.handleScrolling);
            },
            handleScrolling: _.throttle(function (e) { // 滚动容器滚动时，重置laya容器位置
                let c = this.$el.getBoundingClientRect();
                // this.layaDOM();
                this.keepPosition();
            }, 50),
            repaint () { // 重绘laya的“容器”（让laya的dom浮动在当前el）
                // let o = this.layaDOM.getBoundingClientRect();
                this.layaDOM = document.getElementById('layaCanvas');
                // let o = this.layaDOM.getBoundingClientRect();
                // console.warn('v-laya.repaint: ', o);
                // 调整容器大小
                this.style = {
                    // height: o.height + 'px'
                    height: this.layaDOM.offsetHeight + 'px'
                };
                // this.keepPosition();
                setTimeout(() => this.keepPosition(), 0);
            },
            keepPosition () {
                // 移动laya对象
                let c = this.$el.getBoundingClientRect();
                // console.log('v-laya.keepPosition: ---> ', c);
                // this.layaDOM.style.transformOrigin = '0px ' + c.top + 'px 0px';
                // this.layaDOM.style.transformOrigin = '0px ' + this.$el.offsetTop + 'px 0px';
                this.layaDOM.style.transform = 'translate3d(0, ' + c.top + 'px, 0)';
            },
            loadLibs () { // 加载依赖库
                [].forEach.call(this.libs, v => {
                    let script = document.createElement('script');
                    script.async = false;
                    script.src = this.ossUrl + '/libs/' + v;
                    document.body.appendChild(script);
                });
            },
            loadLibSync () { // 加载项目文件
                return new Promise(resolve => {
                    // 根据标识判断是否已加载
                    // 通过readyState返回promise，使加载过程异步变同步
                    let script = document.createElement('script');
                    if (script.readyState) { // IE
                        script.onreadystatechange = function () {
                            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                                script.onreadystatechange = null;
                                // callback();
                                resolve();
                            }
                        }
                    } else { // 其他浏览器
                        script.onload = function () {
                            // callback();
                            resolve();
                        }
                    }
                    script.src = this.ossUrl + '/js/' + this.bundleJs;
                    script.async = false;
                    document.body.appendChild(script);
                });
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";

    .v-laya {
        border: red 1px solid;

        // #layaCanvas {
        //     position: initial!important;
        // }
    }

</style>
