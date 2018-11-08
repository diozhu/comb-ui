/**
 * 利用路由跳转前记录跳转信息，在对应钩子里面重新渲染一个已经被卸载的$el对象，动画在_animate.scss中，动画渲染完后卸载。。。
 * 普通页面没问题，滚动页面时，重新挂载背景板的时候会闪。。。暂未解决，感兴趣的可以试试
 * 这个解决后可以尝试读取touch位置，模拟手滑翻页的中间跟随动画，而不是一滑到底就翻页。。。
 *              -- Author by Dio Zhu. on 2017.8.28
 */
import * as dom from '../js/utils/dom.js'; //eslint-disable-line
import ScrollPosition from './v-scroll-position.js'; //eslint-disable-line
let transition = {};
transition.install = (Vue, router, options = {}) => {
    console.log('[v-transition].installing...');
    let binding = {}, //eslint-disable-line
        opts = {}, //eslint-disable-line
        route, //eslint-disable-line
        instances, //eslint-disable-line
        transitionType, //eslint-disable-line
        // coord = { x: 0, y: 0 }, // 按下坐标
        loadingWrapor = document.getElementById('loading-wrapper'), // 菊花对象，要跟随page一起转场看着才舒服~
        _initOptions = (p = {}) => { // 默认配置
            opts = {
                duration: '0.3', // 动画时长
                firstEntryDisable: false, // 值为true时禁用首次进入的渐进动画
                firstEntryDuration: '.6', // 首次进入渐进动画时长
                forwardAnim: 'fadeInRight', // 前进动画
                backAnim: 'fadeInLeft', // 后退动画
                sameDepthDisable: false, // url级别相同时禁用动画
                tabs: [], // name填写对应路由的name,以实现类似app中点击tab页面水平转场效果，如tab[1]到tab[0]，会使用forwardAnim动画，tab[1]到tab[2]，会使用backAnim动画
                tabsDisable: false, // 值为true时，tabs间的转场没有动画
                disable: false, // 禁用转场动画
                shadow: true // 为false，转场时没有阴影层次效果
            };
            for (let k in p) { if (p.hasOwnProperty(k)) opts[k] = p[k]; }
        },
        _addAnimate = function (el) {
            console.log(`[v-transition._addAnimate]`, el.className, ' ==> ', transitionType, ', nodeType: ', el.nodeType);
            // 菊花的转场动画，跟page一起跑才舒服一些。。。
            // if (transitionType !== 'back') { // 后退不要菊花。。。
            loadingWrapor.style.animationDuration = opts.duration + 's';
            dom.addClass(loadingWrapor, 'animated');
            if (transitionType === 'forward') dom.addClass(loadingWrapor, opts.forwardAnim);
            if (transitionType === 'back') dom.addClass(loadingWrapor, opts.backAnim);
            // }

            // tpl
            let tpl = document.getElementById('transitionTpl');
            if (tpl && transitionType === 'back') dom.addClass(tpl, 'top');
            else if (tpl) dom.removeClass(tpl, 'top');

            // 禁用转场动画配置
            if (opts.disable) transitionType = '';
            // if (opts.shadow) el.style.boxShadow = '0 3px 10px rgba(0, 0, 0, .156863), 0 3px 10px rgba(0, 0, 0, .227451)';

            // 设置首次进入的渐进显示时长
            if (transitionType === 'first') {
                el.style.animationDuration = opts.firstEntryDuration + 's';
                el.classList.add('fadeIn');
            }
            // 转场动画时长
            if (transitionType) el.style.animationDuration = opts.duration + 's';
            el.classList.add('animated');

            let anim = '';
            if (transitionType === 'forward') anim = opts.forwardAnim;
            else if (transitionType === 'back') anim = opts.backAnim;
            // if (anim) el.classList.add(anim);
            dom.addClass(el, anim);

            let style = document.getElementById('transitionStyle');
            if (!style) {
                style = document.createElement('style');
                style.type = 'text/css';
                style.id = 'transitionStyle';
                let head = document.head || document.getElementsByTagName('head')[0];
                head.appendChild(style);
            }
        },
        _removeAnimate = function (el) { //eslint-disable-line
            setTimeout(() => {
                console.log(`[v-transition._removeAnimate]`, el.className, ' ===>>> ', transitionType);
                // 移除当前page的动画
                el.classList.remove(opts.forwardAnim);
                el.classList.remove(opts.backAnim);
                el.style.animationDuration = '';
                el.style.boxShadow = '';

                // if (transitionType === 'back') return;
                // 移除菊花动画
                dom.removeClass(loadingWrapor, opts.forwardAnim);
                dom.removeClass(loadingWrapor, opts.backAnim);

                // 清空背景板
                let vuegBac = document.getElementById('transitionTpl');
                console.log('[v-transition._removeAnimate].setTimeout: vuegBac = ', vuegBac);
                if (vuegBac) {
                    // vuegBac.innerHTML = '';
                    vuegBac.classList = ['transition-tpl'];
                }

                let style = document.getElementById('transitionStyle');
                if (style) {
                    let coordAnim = ['touchPoint'],
                        anim = '';
                    if (transitionType === 'forward') anim = opts.forwardAnim;
                    else if (transitionType === 'back') anim = opts.backAnim;
                    if (coordAnim.findIndex(item => item === anim) !== -1) style.innerHTML = '';
                }
            }, opts.duration * 1000 + 300); // 加300毫秒延迟 因为有时动画还没完成就被移除了
            setTimeout(() => {
                dom.removeClass(el, 'fadeIn');
            }, opts.firstEntryDuration * 1000);
        },
        hangUp = function () { // beforeDestroy、deactivated
            if (!this.$el) return;
            if (!dom.hasClass(this.$el, 'animated')) return;
            console.log('[v-transition].hangUp: ', this.$el.className, instances['default'], this);

            let vm = instances['default'];
            if (vm) {
                // 获取组件配置
                if (vm.$data && vm.$data.TRANSITION_CONFIG) for (let k in vm.$data.TRANSITION_CONFIG) { opts[k] = vm.$data.TRANSITION_CONFIG[k]; }; // 配置信息覆盖

                // 禁用转场则不设置底色
                if (opts.disable) return;

                // 每次重新挂载vue都会清空被挂载元素，所有每次都要再添加进去
                let vuegBac = document.getElementById('transitionTpl');
                // 不存在就插入
                if (!vuegBac) {
                    let bacgrEle = document.createElement('div');
                    bacgrEle.id = 'transitionTpl';
                    vm.$el.parentElement.appendChild(bacgrEle);
                    vuegBac = bacgrEle;
                }

                vuegBac.innerHTML = '';
                vuegBac.classList = ['transition-tpl'];
                vuegBac.appendChild(this.$el);
                // vuegBac.innerHTML = this.$el.outerHTML;
                if (transitionType === 'forward') ScrollPosition.reset(this.$el); // 前进时，恢复被挂起的当前页的滚动条位置
                // console.log(vuegBac)
                console.log('[v-transition.hangUp] this.$el ', this.$el.className);
                if (transitionType !== 'forward') {
                    _addAnimate(this.$el); // 添加转场动画
                    _removeAnimate(this.$el); // 动画完成后移除class
                    // this.$nextTick().then(() => {
                    //     ScrollPosition.inserted(this.$el);
                    // });
                }
            }
        },
        addEffect = function (ins = this) { // mounted、activated，router.afterEach后获得新页面的组件，组件渲染或激活后触发addEffect
            if (instances && instances.default && instances.default._uid !== this._uid) return;
            if (!route || !this.$el || !this.$el.parentElement) return;
            // if (dom.hasClass(this.$el, 'animated')) return; // 解决 mounted 和 activated重复执行问题
            console.log('[v-transition].addEffect: ', this.$el.className);
            // console.log('[v-transition].addEffect: ', this._uid, transitionType);
            _initOptions(options); // 初始化配置
            // if (this.$data && this.$data.TRANSITION_CONFIG) Object.keys(this.$data.TRANSITION_CONFIG).forEach(k => { opts[k] = this.$data.TRANSITION_CONFIG[k]; }); // 配置信息覆盖
            if (this.$data && this.$data.TRANSITION_CONFIG) for (let k in this.$data.TRANSITION_CONFIG) { opts[k] = this.$data.TRANSITION_CONFIG[k]; }; // 配置信息覆盖

            // _addAnimate(this.$el); // 添加转场动画
            if (transitionType !== 'back') { // 非回退： 进入、刷新
                ScrollPosition.clear(this.$el); // 进入时清除上次的位置信息
                _addAnimate(this.$el); // 添加转场动画
                _removeAnimate(this.$el); // 动画完成后移除class
                // setTimeout(() => { ScrollPosition.clear(this.$el); }, 0); // 进入时清除上次的位置信息
            }
        };

    _initOptions(options);

    Vue.directive('transition', {
        bind (el, _binding, vnode, oldVnode) {
            console.log('[v-transition].directive.bind!!!', el, _binding, vnode, oldVnode);
            binding = _binding;
        }
    });

    Vue.mixin({
        mounted: addEffect,
        activated: addEffect,
        beforeDestroy: hangUp,
        deactivated: hangUp
    });

    router.beforeEach((to, from, next) => {
        // console.log('[v-transition].router.beforeEach: ', to.matched[0], router.direct(to.query.timestamp));
        route = to;
        // transitionType = router.direct(to, from) ? 'forward' : 'back';
        let direct = router.direct(to, from);
        if (direct === 1) transitionType = 'forward';
        else if (direct === -1) transitionType = 'back';
        else transitionType = 'first';
        console.log('[v-transition].router.beforeEach: ', router.direct(to, from), transitionType);

        // 获取进场的组件instances，{default:component}
        let matched = to.matched[0];
        if (matched && matched.instances) instances = matched.instances;
        else instances = null;
        next();
    });

    // router.afterEach(route => {
    //     // console.log('[v-transition].router.afterEach: ', router.direct());
    //     console.log('[v-transition].router.afterEach: ', window.history);
    // });
};
// module.exports = transition;
export default transition;
