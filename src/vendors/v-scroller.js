/**
 * Created by diozhu on 2017/2/11.
 */
import Vue from 'vue';

const ctx = '@@Scrollor';

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

    doBind = function () {
        if (this.binded) return; // eslint-disable-line
        this.binded = true;

        let directive = this,
            element = directive.el,
            tombstoneExpr = element.getAttribute('scroll-tombstone'),
            tombstone = Boolean(directive.vm[tombstoneExpr]);

        directive.isBottom = false; // 到底标识

        // directive.scrollEventTarget = getScrollEventTarget(element);
        console.log('[v-scrollor.js].doBind: ', this.vm);
        if (tombstone !== true) { // 非墓碑模式才进行滚动监听翻页的操作，墓碑模式由v-infinite-scroll操纵，进行不间断触发
            directive.scrollListener = new window.IntersectionObserver(entries => {
                doCheck.call(directive, entries);
            });
            // directive.scrollListener.observe(directive.scrollEventTarget);
            directive.scrollListener.observe(document.querySelector('.v-scroll-bottom'));
        }
    },

    doCheck = function (entries) {
        console.log('[v-scrollor.js] ==> doCheck: ', entries[0].intersectionRatio);
        if (entries[0].intersectionRatio <= 0) return; // 如果不可见，就返回
        if (this.expression) {
            this.expression().then(res => {
                let rct = entries[0].target.getBoundingClientRect();
                if (rct.top < window.innerHeight) { // 复验是否没填满页面，需要继续加载
                    console.log('[v-scrollor.js] ==> doCheck.after: ', rct.top, window.innerHeight);
                    doCheck.call(this, entries);
                }
            }).catch(e => {
                console.log('[v-scrollor.js] ==> doCheck.error: ', entries[0].intersectionRatio, e);
            });
        }
    };

// === infinite scrolll ===

let Scrollor = {
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
        console.log('[v-scrollor.js] ==> unbind...', ...arguments);
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('Scrollor', Scrollor);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Scrollor = Scrollor;
    Vue.use(install); // eslint-disable-line
}

Scrollor.install = install;
export default Scrollor;
