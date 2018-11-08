/**
 * Created by diozhu on 2017/2/11.
 */
import Vue from 'vue';

const ctx = '@@Fixed';

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

    // getScrollTop = function (element) {
    //     if (element === window) {
    //         return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
    //     }
    //
    //     return element.scrollTop;
    // },

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

    // getVisibleHeight = function (element) {
    //     if (element === window) {
    //         return document.documentElement.clientHeight;
    //     }
    //
    //     return element.clientHeight;
    // },
    //
    // getElementTop = function (element) {
    //     if (element === window) {
    //         return getScrollTop(window);
    //     }
    //     return element.getBoundingClientRect().top + getScrollTop(window);
    // },

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
        directive.scrollListener = throttle(doCheck.bind(directive), 10);
        // directive.scrollListener = doCheck.bind(directive);
        directive.scrollEventTarget.addEventListener('scroll', directive.scrollListener);
        console.log('v-fixed.doBind: ', this.vm, directive.scrollEventTarget);

        // let disabledExpr = element.getAttribute('scroll-disabled'),
        //     disabled = false;
        //
        // if (disabledExpr) {
        //     this.vm.$watch(disabledExpr, function (value) {
        //         directive.disabled = value;
        //         if (!value && directive.immediateCheck) {
        //             doCheck.call(directive);
        //         }
        //     });
        //     disabled = Boolean(directive.vm[disabledExpr]);
        // }
        // directive.disabled = disabled;
        //
        // let distanceExpr = element.getAttribute('scroll-distance'),
        //     distance = 0;
        // if (distanceExpr) {
        //     distance = Number(directive.vm[distanceExpr] || distanceExpr);
        //     if (isNaN(distance)) {
        //         distance = 0;
        //     }
        // }
        // directive.distance = distance;
        //
        // let immediateCheckExpr = element.getAttribute('scroll-immediate-check'),
        //     immediateCheck = false;
        // if (immediateCheckExpr) {
        //     immediateCheck = Boolean(directive.vm[immediateCheckExpr]);
        // }
        // directive.immediateCheck = immediateCheck;
        //
        // if (immediateCheck) {
        //     doCheck.call(directive);
        // }
        //
        // let eventName = element.getAttribute('scroll-listen-for-event');
        // if (eventName) {
        //     directive.vm.$on(eventName, function () {
        //         doCheck.call(directive);
        //     });
        // }
    },

    doCheck = function (force) {
        // let scrollEventTarget = this.scrollEventTarget;

        // if (force !== true && this.disabled) return; //eslint-disable-line
        // let viewportScrollTop = getScrollTop(scrollEventTarget);
        // console.log('=============>>>>>>>>---> ', scrollEventTarget, scrollEventTarget.scrollHeight, viewportBottom);

        // if (scrollEventTarget === element) {
        //     shouldTrigger = scrollEventTarget.scrollHeight - viewportBottom <= distance;
        // } else {
        //     let elementBottom = getElementTop(element) - getElementTop(scrollEventTarget) + element.offsetHeight + viewportScrollTop;
        //     shouldTrigger = viewportBottom + distance >= elementBottom;
        // }
        // // // 添加refresh方法，加在此处不完美，因加载事件是滚动条触发，到顶的时候如果静态直接拉会不响应，必须先上拉再下拉才会触发。。。Author by Dio Zhu. on 2017.3.22
        // // let refreshExpr = element.getAttribute('scroll-refresh-func');
        // // console.log('=============>>>>>>>>---> ', this.vm.$data.scrollTop, viewportScrollTop);
        // // // this.vm.$data.scrollTop = viewportScrollTop;
        // this.vm.$set(this.vm, 'scrollTop', viewportScrollTop); // 记录移动位置
        // // if (viewportScrollTop === 0 && refreshExpr) {
        // //     this.vm[refreshExpr]();
        // //     return;
        // // }
        // if (shouldTrigger && this.expression) {
        //     this.expression();
        // }

        let obj = this.vm.$el,
            h = document.body.offsetHeight - window.pageYOffset;
        obj.style.position = 'absolute';
        obj.style.overflow = 'hidden';
        obj.style.left = 0;
        // obj.style.bottom = 0;
        // obj.style.transform = 'translate3d(0, 0, 0)';
        // obj.style.top = window.pageYOffset + 'px';

        obj.style.transform = 'translate3d(0, -' + h + 'px, 0)';
        obj.style.webkitTransform = 'translate3d(0, -' + h + 'px, 0)';

        // obj.style.position = 'fixed';
        // obj.style.bottom = 0;
        // console.log('!!! doCheck: ', h);
    };

// === infinite scrolll ===

let Fixed = {
    bind (el, binding, vnode) {
        console.log('!!!!!!!!!!', vnode);
        el[ctx] = {
            el,
            // vm: vnode.context,
            vm: vnode.componentInstance,
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
    Vue.directive('Fixed', Fixed);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Fixed = Fixed;
    Vue.use(install); // eslint-disable-line
}

Fixed.install = install;
export default Fixed;
