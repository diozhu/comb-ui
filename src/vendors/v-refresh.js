/**
 * Created by diozhu on 2017/2/11.
 */
import Vue from 'vue';
import * as utils from '../js/utils/utils';

const ctx = '@@vRefresh';

// === base ===

let isAttached = function (element) {
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
    throttle = function (fn, delay) {
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

    doBind = function () {
        if (this.binded) return; // eslint-disable-line
        this.binded = true;

        let directive = this,
            element = directive.el;
        // 添加touch事件，实现下拉刷新
        // console.log('v-refresh.doBind ...', element);
        directive.pullEventTarget = element;
        // this.vm.$set(this.vm, 'pullTarget', directive.pullEventTarget);

        // if (typeof directive.vm.$props.func === 'function') { // 取消此处判定，目的是为了不指定func时，依然可以下拉显示loading动画。 Author by Dio Zhu. on 2017.6.12
        directive.pullStartListener = throttle(pullStart.bind(directive), 50);
        directive.pullingListener = throttle(pulling.bind(directive), 10);
        directive.pullEndListener = throttle(pullEnd.bind(directive), 50);
        directive.pullEventTarget.addEventListener('touchstart', directive.pullStartListener, utils.supportsPassive() ? {passive: false} : false);
        directive.pullEventTarget.addEventListener('touchmove', directive.pullingListener, utils.supportsPassive() ? {passive: false} : false);
        directive.pullEventTarget.addEventListener('touchend', directive.pullEndListener, utils.supportsPassive() ? {passive: false} : false);
        // }
    },

    pullStart = function (e) {
        // console.log('[v-refresh.pullStart]', e.touches[0].clientY, getScrollTop(this.pullEventTarget));
        // if (!this.vm[this.el.getAttribute('refresh-enabled')]) return;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.startScrollTop = getScrollTop(this.pullEventTarget);
        // if (this.startScrollTop === 0) {
        //     e.preventDefault(); // 解决移动端卡死问题，实际上是touchend没有触发
        // }
        this.pulling = true; // 移动端多个touch容器会有卡死现象，添加此标识解决touchstart、touchend不执行，只执行touchmove的问题。Author by Dio Zhu. on 2017.11.4
        // return true;
    },

    pulling = function (e) {
        if (!this.pulling) return;
        // console.log('[v-refresh.pulling] this.direction： ', this.direction, this.el.className, this.startX, this.startY);
        // if (!this.vm[this.el.getAttribute('refresh-enabled')]) return;
        if (this.startY < this.el.getBoundingClientRect().top && this.startY > this.el.getBoundingClientRect().bottom) return true;
        this.currentX = e.touches[0].clientX;
        this.currentY = e.touches[0].clientY;
        // this.direction = this.currentY > (this.startY + 20) ? 'down' : 'up';
        // this.direction = (this.currentY - this.startY) > 50 && Math.abs(this.currentY - this.startY) > Math.abs(this.currentX - this.startX) ? 'down' : 'up';
        this.direction = (this.currentY - this.startY) > 0 && Math.abs(this.currentY - this.startY) > Math.abs(this.currentX - this.startX) ? 'down' : 'up';
        let viewportScrollTop = getScrollTop(this.pullEventTarget),
            translateExpr = this.el.getAttribute('refresh-translate'),
            distance = (this.currentY - this.startY);
        // console.log(`[v-refresh.pulling]: ${this.direction}, ${viewportScrollTop}, ${distance - this.startScrollTop}`);
        if (this.direction === 'down' && viewportScrollTop < 10) e.preventDefault(); // 阻止微信内页面下拉
        if (this.direction === 'down' && viewportScrollTop === 0 && this.expression) { // 下拉
            // console.log('[v-refresh.pulling]!!!', this.vm[translateExpr]);
            e.preventDefault();
            e.stopPropagation();
            this.vm[translateExpr] = distance - this.startScrollTop;
            if (this.vm[translateExpr] < 0) this.vm[translateExpr] = 0;
            if (this.vm[translateExpr] > 30) this.vm['refreshTag'] = true;
            // if (this.vm[translateExpr] >= this.vm['refreshHeight']) this.vm[translateExpr] = this.vm['refreshHeight'];
            if (this.vm[translateExpr] >= this.vm['refreshHeight']) this.vm[translateExpr] = this.vm['refreshHeight'] + (this.vm[translateExpr] - this.vm['refreshHeight']) / 10;
            // console.log(`[v-refresh.pulling]: ${this.direction}, ${viewportScrollTop}, ${distance - this.startScrollTop}`);
        } else {
            pullEnd.call(this, e);
            // this.direction = '';
            // this.vm[translateExpr] = 0; // 还原位置，防止android下拖拽后上拉造成的卡死。 mod by Dio Zhu. on 2018.3.20
            // this.pulling = false; // 移动端多个touch容器会有卡死现象，添加此标识解决touchstart、touchend不执行，只执行touchmove的问题
            // this.vm['refreshTag'] = false;
        }
        this.touching = true;
        setTimeout(() => {
            if (this.touching) {
                pullEnd.call(this, e);
                // this.direction = '';
                // this.vm[translateExpr] = 0; // 还原位置，防止android下拖拽后上拉造成的卡死。 mod by Dio Zhu. on 2018.3.20
                // this.pulling = false; // 移动端多个touch容器会有卡死现象，添加此标识解决touchstart、touchend不执行，只执行touchmove的问题
                // this.vm['refreshTag'] = false;
            }
        }, 500);
        setTimeout(() => {
            this.touching = false;
        }, 600);
        // return true;
    },

    pullEnd = function (e) {
        console.log('[v-refresh].pullEnd: ', this.direction);
        // if (!this.vm[this.el.getAttribute('refresh-enabled')]) return;
        let viewportScrollTop = getScrollTop(this.pullEventTarget),
            translateExpr = this.el.getAttribute('refresh-translate');
        if (this.direction === 'down' && viewportScrollTop === 0 && this.expression) {
            // console.log('[v-refresh.down]!!!');
            if (this.vm[translateExpr] >= this.vm['refreshHeight']) this.vm[translateExpr] = this.vm['refreshHeight'];
            this.expression();
        } else {
            this.vm[translateExpr] = 0;
        }
        this.direction = '';
        this.pulling = false; // 移动端多个touch容器会有卡死现象，添加此标识解决touchstart、touchend不执行，只执行touchmove的问题
        this.vm['refreshTag'] = false;
        // return true;
    };

// === infinite scrolll ===

let Refresh = {
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
        el[ctx].pullEventTarget.removeEventListener('touchstart', el[ctx].pullStartListener);
        el[ctx].pullEventTarget.removeEventListener('touchmove', el[ctx].pullingListener);
        el[ctx].pullEventTarget.removeEventListener('touchend', el[ctx].pullEndListener);
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('Refresh', Refresh);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.refresh = Refresh;
    Vue.use(install); // eslint-disable-line
}

Refresh.install = install;
export default Refresh;
