/**
 * Created by diozhu on 2017/6/5.
 */
import Vue from 'vue';
import IScroll from 'iscroll/build/iscroll-infinite.js';
// import IScroll from 'iscroll';

const ctx = '@@Iscroll';

// === base ===
let isAttached = function (element) { //eslint-disable-line
        let currentNode = element.parentNode;
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
    doBind = function () { //eslint-disable-line
        let optionsExpr = this.el.getAttribute('iscroll-optoins'),
            options = Object(this.vm[optionsExpr] || optionsExpr);

        setTimeout(() => {
            console.log('v-iscroll.dobind: ', this);
            this.scroll = new IScroll(this.el, options);
        }, 1000);
    };

// === infinite scrolll ===

let Iscroll = {
    // bind (el, binding, vnode) {
    //     el[ctx] = {
    //         el,
    //         vm: vnode.context,
    //         expression: binding.value
    //     };
    //     const args = arguments;
    //     el[ctx].vm.$on('hook:mounted', function () {
    //         el[ctx].vm.$nextTick(function () {
    //             if (isAttached(el)) {
    //                 doBind.call(el[ctx], args);
    //                 return; // Add by Dio Zhu. on 2017.2.14
    //             }

    //             el[ctx].bindTryCount = 0;

    //             let tryBind = function () {
    //                 if (el[ctx].bindTryCount > 10) return; //eslint-disable-line
    //                 el[ctx].bindTryCount++;
    //                 if (isAttached(el)) {
    //                     doBind.call(el[ctx], args);
    //                 } else {
    //                     setTimeout(tryBind, 50);
    //                 }
    //             };

    //             tryBind();
    //         });
    //     });
    // },
    // update (el, binding, vnode, oldVnode) {
    //     console.log('v-iscroll.update: ');
    //     // 将scroll绑定到新的vnode上
    //     el[ctx].scroll = oldVnode.elm[ctx].scroll;
    //     // // 使用settimeout让refresh跳到事件流结尾，保证refresh时数据已经更新完毕
    //     // setTimeout(() => {
    //     //     el[ctx].scroll.refresh();
    //     // }, 0);
    // },
    bind (el, binding, vnode, oldVnode) {
        console.warn('!!! v-iscroll.bind: ', binding);
        // 判断输入参数
        // let vtype = binding.value ? [].toString.call(binding.value) : undefined;
        // 设置iscorll属性的参数
        let callBack, //eslint-disable-line
            optionsExpr = el.getAttribute('iscroll-optoins'),
            // iscrollOptions = vtype === '[object Object]' ? binding.value : optionsExpr;
            iscrollOptions = Object(vnode.context[optionsExpr] || optionsExpr); //eslint-disable-line
        // 阻止touchmove默认事件
        el.addEventListener('touchmove', event => { event.preventDefault(); });
        console.log('!!! v-iscroll.bind: ', el.getAttribute('id'), iscrollOptions);
        // 使用vnode绑定iscroll是为了让iscroll对象能够夸状态传递，避免iscroll重复建立
        // vnode.scroll = new IScroll(el, iscrollOptions);
        setTimeout(() => {
            vnode.scroll = new IScroll(el, iscrollOptions);
        }, 500);
    },
    // inserted: function (el, binding, vnode, oldVnode) {
    //     var callBack, //eslint-disable-line
    //         optionsExpr = el.getAttribute('iscroll-optoins'),
    //         iscrollOptions = Object(vnode.context[optionsExpr] || optionsExpr); //eslint-disable-line
    //     // var iscrollOptions = {};
    //     iscrollOptions = JSON.parse(JSON.stringify(iscrollOptions));
    //     // 判断输入参数
    //     var vtype = binding.value ? [].toString.call(binding.value) : undefined;
    //     switch (vtype) {
    //     case '[object Function]':
    //         callBack = binding.value;
    //         break;
    //     case '[object Object]':
    //         iscrollOptions = binding.value;
    //     // default:
    //     //     break;
    //     }
    //     console.log('!!! v-iscroll.inserted: ', el.getAttribute('id'), iscrollOptions);
    //     // 使用vnode绑定iscroll是为了让iscroll对象能够夸状态传递，避免iscroll重复建立
    //     vnode.scroll = new IScroll(el, iscrollOptions);
    //     // vnode.scroll = new IScroll('#' + el.getAttribute('id'), iscrollOptions);
    //     console.warn('========> ', vnode.scroll);

    //     // 如果指令传递函数进来，把iscroll实例传递出去
    //     if (callBack) callBack(vnode.scroll);
    // },
    componentUpdated: function (el, binding, vnode, oldVnode) {
        console.warn('!@#$%', el, vnode.scroll, oldVnode.scroll);
        // 将scroll绑定到新的vnode上
        vnode.scroll = oldVnode.scroll;

        // 使用settimeout让refresh跳到事件流结尾，保证refresh时数据已经更新完毕
        setTimeout(() => {
            vnode.scroll.refresh();
        }, 600);
    },
    unbind (el, binding, vnode, oldVnode) {
        // el[ctx].scrollEventTarget.removeEventListener('scroll', el[ctx].scrollListener);
        /**
         * 解除绑定时要把iscroll销毁
         */
        el[ctx].scroll = oldVnode.elm[ctx].scroll;
        el[ctx].scroll.destroy();
        el[ctx].scroll = null;
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('Iscroll', Iscroll);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Iscroll = Iscroll;
    Vue.use(install); // eslint-disable-line
}

Iscroll.install = install;
export default Iscroll;
