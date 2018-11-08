import Vue from 'vue';
import * as dom from '../js/utils/dom.js';
import * as utils from '../js/utils/utils.js'; //eslint-disable-line

const ctx = '@@sticky';

let listenAction;

// === base ===
let doBind = function () {
        if (this.binded) return; // eslint-disable-line
        this.binded = true;

        console.log(`[v-sticky].${this.vm._uid}.bind!`, this.expression);
        // console.log(`[v-sticky].${this.vm._uid}.bind!!!`, dom.getScrollEventTarget(this.el));
        // this.vm.$nextTick(() => {
        // setTimeout(() => {
        //     console.log(`[v-sticky].${this.vm._uid}.bind!!!`, dom.getScrollEventTarget(this.el));
        // }, 0);
        const params = this.expression || {};
        // const stickyTop = params.stickyTop || 0;
        const zIndex = params.zIndex || 1000;
        // const elStyle = this.el.style;

        this.el.style.position = '-webkit-sticky';
        this.el.style.position = 'sticky';
        // this.el.style.transform = 'translate3d(0, 0, 0)';

        // 如果浏览器支持 css sticky（Currently Safari, Firefox and Chrome Canary）
        this.isSticky = false;
        let dpr = window.lib && window.lib.flexible && window.lib.flexible.dpr || 1;
        if (~this.el.style.position.indexOf('sticky')) {
        // if (~this.el.style.position.indexOf('stickayaaaaaaa')) {
            this.isSticky = true;
            // elStyle.top = `${stickyTop}px`;
            if (this.modifiers.top) this.el.style.top = this.expression * dpr + 'px';
            if (this.modifiers.bottom) this.el.style.bottom = this.expression * dpr + 'px';
            this.el.style.zIndex = zIndex;
            // return;
        } else {
            // 如果浏览器不支持sticky，初始化位置
            const elementChild = this.el.firstElementChild.style;
            // elementChild.cssText = `left: 0; right: 0; index: ${zIndex}`;
            elementChild.cssText = `left: 0; index: ${zIndex}; transform: translate3d(0, 0, 0);`;
            if (this.modifiers.top) elementChild.cssText += ` top: ${this.expression * dpr}px;`;
            // if (this.modifiers.top) elementChild.cssText += ` top: 0px;`;
            if (this.modifiers.bottom) elementChild.cssText += ` position: fixed; bottom: ${this.expression * dpr}px;`;
            // if (this.modifiers.bottom) elementChild.cssText += ` position: absolute; bottom: ${this.expression * dpr}px;`;
        }

        this.prefixes = dom.getDetectPrefixes();
        this.active = false; // 浮动标识

        this.scrollEventTarget = dom.getScrollEventTarget(this.el);
        this.scrollListener = utils.throttle(doCheck.bind(this), 20);
        console.log(`[v-sticky].${this.vm._uid}.bind!!!!!`, this.scrollEventTarget.className);
        this.scrollEventTarget.addEventListener('scroll', this.scrollListener);
    },
    doCheck = function () { //eslint-disable-line
        // console.log(`[v-sticky].${this.vm._uid}.doCheck!`);
        // console.log(`[v-sticky].${this.vm._uid}.doCheck!`, this.vm[this.el.getAttribute('sticky-disabled')]);
        if (this.vm[this.el.getAttribute('sticky-disabled')]) { // 禁用标识，refresh组件提供，拉动页面时避免卡住的现象。。。mod by Dio Zhu. on 2018.3.20
            reset.call(this);
            return;
        }
        const offsetTop = this.el.getBoundingClientRect().top;
        // if (offsetTop > this.expression) return;
        // console.log(`[v-sticky].${this.vm._uid}.doCheck!`, this.modifiers, offsetTop, this.expression);
        if (offsetTop <= this.expression) {
            sticky.call(this);
        } else {
            reset.call(this);
        }
        let sevent = this.el.getAttribute('sticky-handle-change'); // 回调：是否被定位（Boolean）、移动的距离（正负）
        if (sevent && this.vm[sevent]) this.vm[sevent](this.active, offsetTop);
    },
    sticky = function () {
        if (this.active) return;
        if (!this.el.style.height) {
            this.el.style.height = `${this.el.offsetHeight}px`;
        }
        // console.log(`[v-sticky].${this.vm._uid}.sticky: `, this.el.style.height, this.el.firstElementChild.style.position, this.el.firstElementChild.style.cssText);
        if (this.isSticky) { // 如果浏览器支持sticky

        } else { // 如果浏览器不支持sticky
            this.el.firstElementChild.style.position = 'fixed';
        }
        dom.addClass(this.el, 'sticky');
        this.active = true;
    },
    reset = function () {
        if (!this.active) return;
        if (this.isSticky) { // 如果浏览器支持sticky

        } else { // 如果浏览器不支持sticky
            this.el.firstElementChild.style.position = 'initial';
        }
        dom.removeClass(this.el, 'sticky');
        this.active = false;
    };

let Sticky = {
    bind (el, binding, vnode) {
        el[ctx] = {
            el,
            vm: vnode.context,
            expression: binding.value || 0,
            modifiers: binding.modifiers
        };
        const args = arguments;
        el[ctx].vm.$on('hook:mounted', function () {
            el[ctx].vm.$nextTick(function () {
                if (dom.isAttached(el)) {
                    doBind.call(el[ctx], args);
                    return; // Add by Dio Zhu. on 2017.2.14
                }

                el[ctx].bindTryCount = 0;

                let tryBind = function () {
                    if (el[ctx].bindTryCount > 10) return; //eslint-disable-line
                    el[ctx].bindTryCount++;
                    if (dom.isAttached(el)) {
                        doBind.call(el[ctx], args);
                    } else {
                        setTimeout(tryBind, 50);
                    }
                };

                tryBind();
            });
        });
    },

    unbind () {
        window.removeEventListener('scroll', listenAction);
    },

    update (el, binding) {
        const params = binding.value || {};
        el.style.top = `${params.stickyTop}px`;
        el.style.zIndex = params.zIndex;
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('sticky', Sticky);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Sticky = Sticky;
    Vue.use(install); // eslint-disable-line
}

Sticky.install = install;
export default Sticky;
