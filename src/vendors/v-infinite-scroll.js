/**
 * Created by diozhu on 2017/2/11.
 */
import Vue from 'vue';

const ctx = '@@InfiniteScroll';

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
            element = directive.el;

        directive.scrollEventTarget = getScrollEventTarget(element);
        directive.scrollListener = throttle(doCheck.bind(directive), 200);
        directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener);

        // // 添加touch事件，实现下拉刷新
        // if (this.vm['pullAbled']) {
        //     if (directive.vm && directive.vm.$refs.content) {
        //         console.log('v-infinite-scroll.doBind: pullAbled = ', this.vm['pullAbled']);
        //         directive.pullEventTarget = directive.vm.$refs.content;
        //         directive.pullStartListener = throttle(pullStart.bind(directive), 50);
        //         directive.pullEventTarget.addEventListener('touchstart', directive.pullStartListener);
        //         directive.pullingListener = throttle(pulling.bind(directive), 10);
        //         directive.pullEventTarget.addEventListener('touchmove', directive.pullingListener);
        //         directive.pullEndListener = throttle(pullEnd.bind(directive), 50);
        //         directive.pullEventTarget.addEventListener('touchend', directive.pullEndListener);
        //     }
        // }

        let disabledExpr = element.getAttribute('infinite-scroll-disabled'),
            // enabledExpr = element.getAttribute('infinite-scroll-enabled'),
            disabled = false;

        // console.log('v-infinite-scroll.doBind: directive.scrollEventTarget = ', directive.vm, directive.scrollEventTarget, enabledExpr, Boolean(directive.vm[enabledExpr]));
        // if (enabledExpr && Boolean(directive.vm[enabledExpr])) directive.vm.$set(directive.vm, 'scrollTarget', directive.scrollEventTarget); // 保存滚动容器
        directive.vm.$set(directive.vm, 'scrollTarget', directive.scrollEventTarget); // 保存滚动容器

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

        let distanceExpr = element.getAttribute('infinite-scroll-distance'),
            distance = 0;
        if (distanceExpr) {
            distance = Number(directive.vm[distanceExpr] || distanceExpr);
            if (isNaN(distance)) {
                distance = 0;
            }
        }
        directive.distance = distance;

        let immediateCheckExpr = element.getAttribute('infinite-scroll-immediate-check'),
            immediateCheck = false;
        if (immediateCheckExpr) {
            immediateCheck = Boolean(directive.vm[immediateCheckExpr]);
        }
        directive.immediateCheck = immediateCheck;

        if (immediateCheck) {
            doCheck.call(directive);
        }

        let eventName = element.getAttribute('infinite-scroll-listen-for-event');
        if (eventName) {
            directive.vm.$on(eventName, function () {
                doCheck.call(directive);
            });
        }
    },

    // pullStart = function (e) {
    //     // console.log('[v-infinite-scroll.pullStart]', e.touches[0].clientY);
    //     if (!this.vm[this.el.getAttribute('infinite-scroll-enabled')]) return;
    //     this.startY = e.touches[0].clientY;
    //     this.startScrollTop = getScrollTop(this.scrollEventTarget);
    // },
    //
    // pulling = function (e) {
    //     if (!this.vm[this.el.getAttribute('infinite-scroll-enabled')]) return;
    //     if (this.startY < this.el.getBoundingClientRect().top && this.startY > this.el.getBoundingClientRect().bottom) return;
    //     this.currentY = e.touches[0].clientY;
    //     this.direction = this.currentY > (this.startY + 20) ? 'down' : 'up';
    //     let viewportScrollTop = getScrollTop(this.scrollEventTarget),
    //         refreshExpr = this.el.getAttribute('infinite-scroll-refresh-func'),
    //         translateExpr = this.el.getAttribute('infinite-scroll-refresh-translate'),
    //         distance = (this.currentY - this.startY);
    //     if (this.direction === 'down' && viewportScrollTop === 0 && refreshExpr) { // 下拉
    //         // console.log('[v-infinite-scroll.pulling]', this.vm[translateExpr]);
    //         e.preventDefault();
    //         e.stopPropagation();
    //         this.vm[translateExpr] = distance - this.startScrollTop;
    //         if (this.vm[translateExpr] < 0) this.vm[translateExpr] = 0;
    //         if (this.vm[translateExpr] > 30) this.vm['refreshTag'] = true;
    //         // if (this.vm[translateExpr] >= this.vm['refreshHeight']) this.vm[translateExpr] = this.vm['refreshHeight'];
    //         if (this.vm[translateExpr] >= this.vm['refreshHeight']) this.vm[translateExpr] = this.vm['refreshHeight'] + (this.vm[translateExpr] - this.vm['refreshHeight']) / 10;
    //     }
    // },
    //
    // pullEnd = function (e) {
    //     // console.log('this.vm[this.el.getAttribute(infinite-scroll-enabled)]: ', this.vm[this.el.getAttribute('infinite-scroll-enabled')]);
    //     if (!this.vm[this.el.getAttribute('infinite-scroll-enabled')]) return;
    //     let viewportScrollTop = getScrollTop(this.scrollEventTarget),
    //         translateExpr = this.el.getAttribute('infinite-scroll-refresh-translate'),
    //         refreshExpr = this.el.getAttribute('infinite-scroll-refresh-func');
    //     if (this.direction === 'down' && viewportScrollTop === 0 && refreshExpr) {
    //         // console.log('[v-infinite-scroll.down]!!!');
    //         if (this.vm[translateExpr] >= this.vm['refreshHeight']) this.vm[translateExpr] = this.vm['refreshHeight'];
    //         this.vm[refreshExpr]();
    //     }
    //     this.direction = '';
    // },

    doCheck = function (force) {
        let scrollEventTarget = this.scrollEventTarget,
            element = this.el,
            distance = this.distance;

        if (force !== true && this.disabled) return; //eslint-disable-line
        let viewportScrollTop = getScrollTop(scrollEventTarget),
            viewportBottom = viewportScrollTop + getVisibleHeight(scrollEventTarget),
            shouldTrigger = false;
        // console.log('=============>>>>>>>>---> ', scrollEventTarget, scrollEventTarget.scrollHeight, viewportBottom);

        if (scrollEventTarget === element) {
            shouldTrigger = scrollEventTarget.scrollHeight - viewportBottom <= distance;
        } else {
            let elementBottom = getElementTop(element) - getElementTop(scrollEventTarget) + element.offsetHeight + viewportScrollTop;
            shouldTrigger = viewportBottom + distance >= elementBottom;
        }
        // // 添加refresh方法，加在此处不完美，因加载事件是滚动条触发，到顶的时候如果静态直接拉会不响应，必须先上拉再下拉才会触发。。。Author by Dio Zhu. on 2017.3.22
        // let refreshExpr = element.getAttribute('infinite-scroll-refresh-func');
        // console.log('=============>>>>>>>>---> ', this.vm.$data.scrollTop, viewportScrollTop);
        // // this.vm.$data.scrollTop = viewportScrollTop;
        this.vm.$set(this.vm, 'scrollTop', viewportScrollTop); // 记录移动位置
        // if (viewportScrollTop === 0 && refreshExpr) {
        //     this.vm[refreshExpr]();
        //     return;
        // }
        if (shouldTrigger && this.expression) {
            this.expression();
        }
    };

// === infinite scrolll ===

let InfiniteScroll = {
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
    Vue.directive('InfiniteScroll', InfiniteScroll);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.infiniteScroll = InfiniteScroll;
    Vue.use(install); // eslint-disable-line
}

InfiniteScroll.install = install;
export default InfiniteScroll;
