/**
 * Created by diozhu on 2017/2/11.
 */
import Vue from 'vue';

const ctx = '@@Scroll';

// === base ===

let throttle = function (fn, delay) {
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

    getScrollTop = function (element) {
        if (element === window) {
            return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
        }

        return element.scrollTop;
    },

    getComputedStyle = Vue.prototype.$isServer ? {} : document.defaultView.getComputedStyle,

    getScrollEventTarget = function (element) {
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

    getVisibleHeight = function (element) {
        if (element === window) {
            return document.documentElement.clientHeight;
        }

        return element.clientHeight;
    },

    getElementTop = function (element) {
        if (element === window) {
            return getScrollTop(window);
        }
        return element.getBoundingClientRect().top + getScrollTop(window);
    },

    isAttached = function (element) {
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
        if (this.binded) return; // eslint-disable-line
        this.binded = true;

        let directive = this,
            element = directive.el,
            tombstoneExpr = element.getAttribute('scroll-tombstone'),
            tombstone = Boolean(directive.vm[tombstoneExpr]);

        directive.isBottom = false; // 到底标识

        directive.scrollEventTarget = getScrollEventTarget(element);
        if (tombstone !== true) { // 非墓碑模式才进行滚动监听翻页的操作，墓碑模式由v-infinite-scroll操纵，进行不间断触发
            directive.scrollListener = throttle(doCheck.bind(directive), 50);
            directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener);
        }
        console.log('v-scroll.doBind: directive.scrollEventTarget = ', this.vm, directive.scrollEventTarget.className);
        this.vm.$set(this.vm, 'scrollTarget', directive.scrollEventTarget); // 保存滚动dom

        let disabledExpr = element.getAttribute('scroll-disabled'),
            disabled = false;

        if (disabledExpr) {
            this.vm.$watch(disabledExpr, function (value) {
                directive.disabled = value;
                if (!value && directive.immediateCheck) {
                    doCheck.call(directive);
                }
            });
            disabled = Boolean(directive.vm[disabledExpr]);
        }
        directive.disabled = disabled;

        let distanceExpr = element.getAttribute('scroll-distance'),
            distance = 0;
        if (distanceExpr) {
            distance = Number(directive.vm[distanceExpr] || distanceExpr);
            if (isNaN(distance)) {
                distance = 0;
            }
        }
        directive.distance = distance;

        let immediateCheckExpr = element.getAttribute('scroll-immediate-check'),
            immediateCheck = false;
        if (immediateCheckExpr) {
            immediateCheck = Boolean(directive.vm[immediateCheckExpr]);
        }
        directive.immediateCheck = immediateCheck;

        if (immediateCheck) {
            doCheck.call(directive);
        }

        let eventName = element.getAttribute('scroll-listen-for-event');
        if (eventName) {
            directive.vm.$on(eventName, function () {
                doCheck.call(directive);
            });
        }
    },

    doCheck = function (force) {
        let scrollEventTarget = this.scrollEventTarget,
            element = this.el,
            distance = this.distance;

        if (force !== true && this.disabled) return; //eslint-disable-line
        let viewportScrollTop = getScrollTop(scrollEventTarget),
            viewportBottom = viewportScrollTop + getVisibleHeight(scrollEventTarget),
            shouldTrigger = false,
            scrollingFuncExpr = element.getAttribute('scroll-scrolling-func');

        // 添加了到底标识，如果到底，开启touch，辅助完成滚动触发的数据拉取。。。
        if (scrollEventTarget.scrollHeight < viewportBottom || scrollEventTarget.scrollHeight === viewportBottom) this.isBottom = true;
        else this.isBottom = false;

        // console.log('[v-scroll.js] ==> doCheck: ', scrollEventTarget.className, scrollEventTarget.scrollHeight, viewportBottom, distance, this.isBottom);
        // 添加了滚动回调，便于外部监听滚动过程，做一些处理，比如v1.0.1时滚动位置还原类目选中状态。。。 Author by Dio Zhu. on 2017.12.5
        if (scrollingFuncExpr && this.vm[scrollingFuncExpr] && typeof this.vm[scrollingFuncExpr] === 'function') {
            this.vm[scrollingFuncExpr](scrollEventTarget, viewportScrollTop);
        }

        if (scrollEventTarget === element) {
            shouldTrigger = scrollEventTarget.scrollHeight - viewportBottom <= distance;
        } else {
            let elementBottom = getElementTop(element) - getElementTop(scrollEventTarget) + element.offsetHeight + viewportScrollTop;
            shouldTrigger = viewportBottom + distance >= elementBottom;
        }
        // // 添加refresh方法，加在此处不完美，因加载事件是滚动条触发，到顶的时候如果静态直接拉会不响应，必须先上拉再下拉才会触发。。。Author by Dio Zhu. on 2017.3.22
        // let refreshExpr = element.getAttribute('scroll-refresh-func');
        // console.log('=============>>>>>>>>---> ', this.vm.$data.scrollTop, viewportScrollTop);
        // // this.vm.$data.scrollTop = viewportScrollTop;
        // this.vm.$set(this.vm, 'scrollTop', viewportScrollTop); // 记录移动位置
        // if (viewportScrollTop === 0 && refreshExpr) {
        //     this.vm[refreshExpr]();
        //     return;
        // }
        if (shouldTrigger && this.expression) {
            console.log('[v-scroll.js] ==> doCheck.trigger...');
            this.expression();
        }
    };

// === infinite scrolll ===

let Scroll = {
    bind (el, binding, vnode) {
        el[ctx] = {
            el,
            vm: vnode.context,
            expression: binding.value
        };
        const args = arguments;
        el[ctx].vm.$on('hook:mounted', function () {
            el[ctx].vm.$nextTick(function () {
                if (isAttached(el)) {
                    doBind.call(el[ctx], args);
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

                tryBind();
            });
        });
    },

    unbind (el) {
        el[ctx].scrollEventTarget.removeEventListener('scroll', el[ctx].scrollListener);
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('Scroll', Scroll);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Scroll = Scroll;
    Vue.use(install); // eslint-disable-line
}

Scroll.install = install;
export default Scroll;
