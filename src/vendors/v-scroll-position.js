/**
 * 首先，各个页面的滚动条位置不固定，有的加在了refresh组件上，有的加在scroll组件，默认页面加载了.page上；
 * 若要通过此指令进行位置还原，需在各个滚动元素（组件）上添加此指令；
 * 此指令利用在绑定、插入钩子进行scroll监听、位置还原。
 * 位置数据记录在html标签的Attribute：scroll-position上，这样在页面回退的时候，该属性不会消失，也不需要使用全局变量或vuex；
 *
 * 问题：
 * 当指令加在：transition > keep-alive > router-view > .page 中时，无法捕获页面回退动作，此时无法触发那几个钩子；
 * 所以在router-view上也添加了一个指令，进行页面状态的监听；
 * 因为页面切入和回退都添加了动画，钩子还是被打断了，所以在app.vue的动画处理结束时手动触发了挂载钩子（inserted）；
 * 又因为会遇到第二个页面有可能是keep-alive的情况，所以在app.vue中需要判断，如果是进入，则需要清掉以前的attribute；
 *              -- Author by Dio Zhu. on 2017.5.19
 */
import Vue from 'vue';
import * as dom from '../js/utils/dom.js';
import bus from '../vendor/eventbus.js'; //eslint-disable-line

const ctx = '@@ScrollPosition'; //eslint-disable-line
let lockTags = {};  //eslint-disable-line

// === base ===

let throttle = function (fn, delay) { //eslint-disable-line
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
    getComputedStyle = Vue.prototype.$isServer ? {} : document.defaultView.getComputedStyle,

    getScrollEventTarget = function (element) { //eslint-disable-line
        var currentNode = element;
        // bugfix, see http://w3help.org/zh-cn/causes/SD9013 and http://stackoverflow.com/questions/17016740/onscroll-function-is-not-working-for-chrome
        while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
            var overflowY = getComputedStyle(currentNode).overflowY;
            if (overflowY === 'scroll' || overflowY === 'auto') {
                return currentNode;
            }
            currentNode = currentNode.parentNode;
        }
        return window;
    },

    isAttached = function (element) { //eslint-disable-line
        var currentNode = element.parentNode;
        while (currentNode) {
            if (currentNode.tagName === 'HTML') {
                return true;
            }
            if (currentNode.nodeType === 11) {
                return false;
            }
            currentNode = currentNode.parentNode;
        }
        return false;
    },

    doBind = function () {
        if (!this) return;
        // console.log(`[v-scroll-position].${this.vm._uid}.doBind: `, this.binded, this);
        if (this.binded) return; // eslint-disable-line
        this.binded = true;
        this.unbinded = false;

        let directive = this;
        directive.scrollEventTarget = directive.el;
        directive.scrollListener = throttle(doCheck.bind(directive), 50);
        directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener, false);

        bus.$on('v-scroll-position.scrollTo', scrollTo.bind(directive));
        // // 监听滚动容器，而非自身挂载点，改动太大。。。暂时不这么玩儿了。 Author by Dio Zhu. on 2017.8.10
        // directive.scrollEventTarget = getScrollEventTarget(directive.el);
        // if (directive.scrollEventTarget !== window && directive.scrollEventTarget.className !== directive.el.className) return;
        // console.log(`[v-scroll-position].${this.vm._uid}.doBind: `, directive.scrollEventTarget.className, lockTags);
        // directive.scrollListener = throttle(doCheck.bind(directive), 50);
        // directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener, false);
    },
    // 通知滚动容器滚动到指定位置，需要判断目的位置是否在屏幕内。 Author by Dio Zhu. on 2018.4.19
    scrollTo = function (val) { //eslint-disable-line
        if (!val || val < 0 || this.unbinded) return;
        let pos = this.el.getAttribute('scroll-position') ? this.el.getAttribute('scroll-position').split('-') : [0, 0],
            h = this.el.offsetHeight,
            max = this.el.scrollHeight - h,
            t = parseInt(val) - parseInt(h);
        if (val < h) return;
        // console.log(`[v-scroll-position].${this.vm._uid}.scrollTo: `, pos, val, t);
        pos[1] = t;
        // this.el.scrollTop = pos[1];
        let _self = this;
        (function (v, startTime) { // 缓动
            let deceleration = 0.0009;    // 速度递减
            function m () {
                let nowTime = Date.now(),
                    t = nowTime - startTime,
                    nowV = t * deceleration,
                    moveY = parseInt(_self.el.scrollTop) + (nowV) / 2 * t; // 距离递减~
                // console.log('m ---> ', _self.el.scrollTop, max, v, t, moveY);
                if (_self.el.scrollTop >= v || moveY > max) return;
                _self.el.scrollTop = parseInt(moveY);
                setTimeout(m, 10);
            }
            m();
        })(pos[1], Date.now());
    },

    doCheck = function (e) {
        // console.log(`[v-scroll-position].doCheck: `, e);
        // e.target.setAttribute('scroll-position', e.target.scrollLeft + '-' + e.target.scrollTop);
        if (this.scrollEventTarget === window) { // 判断滚动容器，在挂载点保存position的值
            this.el.setAttribute('scroll-position', document.body.scrollLeft + '-' + document.body.scrollTop);
        } else {
            this.el.setAttribute('scroll-position', e.target.scrollLeft + '-' + e.target.scrollTop);
        }
    },
    doInserted = function () { // 挂载时还原滚动位置
        if (!this) return;
        // console.log(`[v-scroll-position].${this.vm._uid}.doInserted: `, this.el.className);
        let directive = this.el,
            targets = directive.querySelectorAll('[scroll-position]');
        // console.log(`[v-scroll-position].${this.vm._uid}.doInserted: `, targets);
        if (targets.length > 0) {
            for (let i = 0, len = targets.length;i < len;i++) {
                resetPosition.call(this, targets[i]);
            }
        } else {
            resetPosition.call(this, directive);
        }
    },
    resetPosition = function (target, laz = false) {
        let pos = target.getAttribute('scroll-position') ? target.getAttribute('scroll-position').split('-') : [0, 0];
        // console.log('=====================>>> ');
        // console.log(`[v-scroll-position].${this.vm._uid}.resetPosition: `, this.scrollEventTarget ? this.scrollEventTarget.className : 'null', target.className, pos, laz);
        // console.log(`[v-scroll-position].${this.vm._uid}.resetPosition: `, this.scrollEventTarget, target, pos);
        if (laz) {
            if (this.scrollEventTarget === window) target = document.body;
            target.scrollLeft = pos[0];
            target.scrollTop = pos[1];
        } else {
            setTimeout(() => {
                if (this.scrollEventTarget === window) target = document.body;
                target.scrollLeft = pos[0];
                target.scrollTop = pos[1];
            }, 0);
        }
    },
    /**
     * 清除所有位置信息
     *              -- Author by Dio Zhu. on 2017.5.19
     */
    clearAll = function () { // 清除页面所有位置信息
        if (!this) return;
        // console.log(`[v-scroll-position].${this.vm._uid}.clearAll: `);
        let directive = this.el,
            targets = directive.querySelectorAll('[scroll-position]');
        if (targets.length > 0) {
            for (let i = 0, len = targets.length;i < len;i++) {
                targets[i].removeAttribute('scroll-position');
            }
        } else {
            if (directive.hasAttribute('scroll-position')) {
                directive.removeAttribute('scroll-position');
            }
        }
    },
    getPosition = function () { // 返回第一个滚动容器的坐标值。。。仅用于app.vue页面切换动画时位置的获取及还原~ mod by Dio Zhu. on 2018.8.1
        let directive = this.el,
            targets = directive.querySelectorAll('[scroll-position]');
        // console.warn(`[v-scroll-position].${this.vm._uid}.getPosition: `, targets);
        if (targets.length > 0) {
            let pos = targets[0].getAttribute('scroll-position') ? targets[0].getAttribute('scroll-position').split('-') : [0, 0];
            return pos;
        } else {
            if (directive.hasAttribute('scroll-position')) {
                let pos = directive.getAttribute('scroll-position') ? directive.getAttribute('scroll-position').split('-') : [0, 0];
                return pos;
            }
        }
        return [0, 0];
    },
    setPosition = function (el, pos) {
        let directive = el,
            targets = directive.querySelectorAll('[scroll-position]');
        if (!pos) pos = [0, 0];
        if (targets.length > 0) targets[0].scrollTop = pos[1];
        else directive.scrollTop = pos[1];
    };

// === infinite scrolll ===

let ScrollPosition = {
    bind (el, binding, vnode) {
        console.log(`[v-scroll-position].${vnode.context._uid}.bind!`, el.className);
        el[ctx] = {
            el,
            vm: vnode.context,
            expression: binding.value
        };
        const args = arguments;
        el[ctx].vm.$nextTick(() => {
            // 如果存在v-refresh、v-scroll，html添加overflow，否则移除. add by Dio Zhu. on 2017.8.9
            if (document.getElementsByClassName('v-refresh').length || document.getElementsByClassName('v-scroll').length) {
                dom.addClass(document.documentElement, 'overflow');
            } else {
                dom.removeClass(document.documentElement, 'overflow');
            }

            if (isAttached(el)) {
                setTimeout(() => { doBind.call(el[ctx], args); }, 0);
                return; // Add by Dio Zhu. on 2017.2.14
            }

            el[ctx].bindTryCount = 0;

            let tryBind = function () {
                if (el[ctx].bindTryCount > 10) return; //eslint-disable-line
                el[ctx].bindTryCount++;
                if (isAttached(el)) {
                    doBind.call(el[ctx], args);
                } else {
                    setTimeout(tryBind, 50);
                }
            };

            // tryBind();
            setTimeout(tryBind, 0);
        });
    },

    inserted (el) {
        // console.log(`[v-scroll-position].${el[ctx].vm._uid}.inserted!`, el.className);
        // doInserted.call(el[ctx], ...arguments);
        setTimeout(() => {
            doInserted.call(el[ctx], ...arguments);
        }, 0);
    },
    // update (el) {
    //     console.log('----- v-scroll-position.update!...', el);
    // },
    // componentUpdated (el) {
    //     console.log('----- v-scroll-position.componentUpdated!', el);
    // },

    unbind (el) {
        // console.log(`[v-scroll-position].${el[ctx].vm._uid}.unbind!`, el.className);
        el[ctx].unbinded = true;
        el[ctx].scrollEventTarget.removeEventListener('scroll', el[ctx].scrollListener);
        // clearAll.call(el[ctx], ...arguments); // 清除位置信息
        // 如果存在v-refresh、v-scroll，html添加overflow，否则移除. add by Dio Zhu. on 2017.8.9
        if (document.getElementsByClassName('v-refresh').length || document.getElementsByClassName('v-scroll').length) {
            dom.addClass(document.documentElement, 'overflow');
        } else {
            dom.removeClass(document.documentElement, 'overflow');
        }
    },
    // update (el) {
    //     console.log(`[v-scroll-position].update!`);
    // },
    // componentUpdated (el) {
    //     console.log(`[v-scroll-position].componentUpdated!`);
    // },

    getPos (el) {
        return getPosition.call(el[ctx], ...arguments);
    },
    setPos (el, pos) {
        setPosition.call(el[ctx], ...arguments);
    },
    clear (el) {
        // console.log(`[v-scroll-position].${el[ctx].vm._uid}.clear!`, el.className);
        clearAll.call(el[ctx], ...arguments);
    },
    reset (el) {
        // console.log(`###[v-scroll-position].${el[ctx].vm._uid}.reset!`, el.className);
        // resetPosition.call(el[ctx], ...arguments);
        // let targets = el.querySelectorAll('[scroll-position]');
        // if (targets.length > 0) {
        //     for (let i = 0, len = targets.length;i < len;i++) {
        //         let pos = targets[i].getAttribute('scroll-position') ? targets[i].getAttribute('scroll-position').split('-') : [0, 0];
        //         console.log(`###[v-scroll-position].${el[ctx].vm._uid}.reset: `, targets[i], pos);
        //         targets[i].scrollLeft = pos[0];
        //         targets[i].scrollTop = pos[1];
        //     }
        // } else {
        //     let pos = el.getAttribute('scroll-position') ? el.getAttribute('scroll-position').split('-') : [0, 0];
        //     console.log(`###[v-scroll-position].${el[ctx].vm._uid}.reset: `, el, pos);
        //     el.scrollLeft = pos[0];
        //     el.scrollTop = pos[1];
        // }
        resetPosition.call(el[ctx], el, true);
        // resetPosition.apply(el[ctx], [el, true]);
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('scroll-position', ScrollPosition);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.ScrollPosition = ScrollPosition;
    Vue.use(install); // eslint-disable-line
}

ScrollPosition.install = install;
export default ScrollPosition;

