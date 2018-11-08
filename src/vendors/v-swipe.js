/**
 * Created by diozhu on 2017/2/11.
 */
import Vue from 'vue';
import * as utils from '../js/utils/utils';

const ctx = '@@Swipe';

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

    isAttached = function (element) {
        var currentNode = element.parentNode;
        while (currentNode) {
            if (currentNode.tagName === 'HTML') {
                return true;
            }
            if (currentNode.nodeType === 11) { // DocumentFragment node
                return false;
            }
            currentNode = currentNode.parentNode;
        }
        return false;
    },

    doBind = function () { // bind once
        if (this.binded) return; // eslint-disable-line
        this.binded = true;
        this.fingerType = ''; // 手势：swipe、pinch
        this.direction = ''; // 手势类型：up、left、down、right、pinchin、pinchout等
        this.tapRangeLimit = 10; // 判断tap点击的最大范围（px）
        this.tapLimitTime = 100; // 判断tap点击的最小间隔时长（ms）
        this.tapMaxTime = 250; // 判断tap点击的最大间隔时长，超过此时间不认做tap（ms）
        this.oldTouches = [];
        this.startTouches = [];
        this.currentTouches = []; // 手势起始触点
        this._t = new Date().getTime();
        let directive = this,
            element = directive.el;

        directive.distance = element.getAttribute('swipe-distance') || 20; // 修正距离
        directive.preventDefault = Boolean(element.getAttribute('swipe-prevent-default')); //
        directive.stopPropagation = Boolean(element.getAttribute('swipe-stop-propagation')); //
        console.log('[v-swipe].doBind: ', directive);

        directive.swipeEventTarget = element;
        // directive.startListener = throttle(swipeStart.bind(directive), 10);
        // directive.movingListener = throttle(swiping.bind(directive), 10);
        // directive.endListener = throttle(swipeEnd.bind(directive), 10);
        directive.startListener = throttle(_touchStart.bind(directive), 20);
        directive.movingListener = throttle(_touchMove.bind(directive), 20);
        directive.endListener = throttle(_touchEnd.bind(directive), 20);

        directive.swipeEventTarget.addEventListener('touchstart', directive.startListener, utils.supportsPassive() ? {passive: false} : false);
        directive.swipeEventTarget.addEventListener('touchmove', directive.movingListener, utils.supportsPassive() ? {passive: false} : false);
        directive.swipeEventTarget.addEventListener('touchend', directive.endListener, utils.supportsPassive() ? {passive: false} : false);
    },

    _touchStart = function (e) { //eslint-disable-line
        if (this.stopPropagation) e.stopPropagation();
        if (this.preventDefault) e.preventDefault();

        this.direction = ''; // 手势类型，touchmove、touchend的时候返回，用于逻辑判断，包含：top、bottom、left、right、pinchin、pinchout
        this.startTouches = this.currentTouches = []; // 手势起始触点
        let now = new Date().getTime(),
            delta = now - (this.tsTouchStart || now);
        this.isDoubleTap = (delta > 0 && delta < this.tapMaxTime);
        this.tsTouchStart = now;

        [].forEach.call(e.touches, v => { this.startTouches.push({ clientX: v.clientX, clientY: v.clientY }); }); // 全部保存
        // console.log(`[v-swipe]._touchStart ===> `, this);
        this.fingerType = e.touches.length > 1 ? 'pinch' : 'swipe'; // 确定手势

        let touchEvent = this.el.getAttribute('handle-touch-start'); //
        if (touchEvent && this.vm[touchEvent]) this.vm[touchEvent](e);
    },
    _touchMove = function (e) { //eslint-disable-line
        // if (this.startY < this.el.getBoundingClientRect().top && this.startY > this.el.getBoundingClientRect().bottom) return true; // 超出范围
        if (!this.startTouches || this.startTouches.length < 1) return false;
        // if (this.startY < this.el.getBoundingClientRect().top && this.startY > this.el.getBoundingClientRect().bottom) return true; // 超出范围
        if (this.stopPropagation) e.stopPropagation();
        if (this.preventDefault) e.preventDefault();
        // console.log(`[v-swipe].swiping!!!: ${this.direction}`, this.el.className, this.distance, this.stopPropagation, this.preventDefault);
        // this.currentX = e.touches[0].clientX;
        // this.currentY = e.touches[0].clientY;
        // let x = this.currentX - this.startX,
        //     y = this.currentY - this.startY;
        // this.currentTouches = e.touches;

        // 根据上一次的手势判断当前的pinch类型，如果类型变化，需重置起始位置（startTouches），目的是确保每次缩放都是针对上次的
        this.oldTouches = this.currentTouches ? this.currentTouches.slice(0) : this.startTouches.slice(0);
        this.currentTouches = []; // 手势起始触点
        [].forEach.call(e.touches, v => { this.currentTouches.push({ clientX: v.clientX, clientY: v.clientY }); }); // 全部保存
        // console.log(`[v-swipe].swiping!!!: ${this.fingerType}, ${this.direction}`, this.startTouches, this.currentTouches);
        let x = this.currentTouches[0].clientX - this.startTouches[0].clientX,
            y = this.currentTouches[0].clientY - this.startTouches[0].clientY,
            dist = 0;
        if (x < this.tapRangeLimit && y < this.tapRangeLimit) return false; // 触摸精度不满足
        // console.log(`[v-swipe].swiping!!!: ${this.fingerType}, ${this.direction}`, this.startTouches, this.currentTouches);
        // if (this.fingerType === 'swipe') { // 单指滑动
        //     // x = this.currentTouches[0].clientX - this.startTouches[0].clientX;
        //     // y = this.currentTouches[0].clientY - this.startTouches[0].clientY;
        //     if (Math.abs(x) > Math.abs(y) && x >= this.distance) { // right
        //         this.direction = 'right';
        //     } else if (Math.abs(x) > Math.abs(y) && x <= -this.distance) { // left
        //         this.direction = 'left';
        //     } else if (Math.abs(x) < Math.abs(y) && y >= this.distance) { // up
        //         this.direction = 'down';
        //     } else if (Math.abs(x) < Math.abs(y) && y <= -this.distance) { // down
        //         this.direction = 'up';
        //     }
        //     // console.log(`[v-swipe].swiping: ${this.fingerType}, ${x}, ${y}, ${this.direction}`);
        // } else { // 多指，按两指取pinch间距，返回两指移动距离和
        //     // console.log(`[v-swipe].swiping: ${this.fingerType}, ${this.direction}`, this.oldTouches, this.currentTouches);
        //     let oldDist = _getPinchDist(this.oldTouches, this.currentTouches);
        //     if ((this.direction === 'pinchout' && oldDist > 0) || (this.direction === 'pinchin' && oldDist <= 0)) {
        //         this.startTouches = this.oldTouches.slice(0);
        //     }
        //     dist = _getPinchDist(this.startTouches, this.currentTouches);
        //     if (dist > 0) {
        //         this.direction = 'pinchin';
        //     } else {
        //         this.direction = 'pinchout';
        //     }
        // }
        if (Math.abs(x) > Math.abs(y) && x >= this.distance) { // right
            this.direction = 'right';
        } else if (Math.abs(x) > Math.abs(y) && x <= -this.distance) { // left
            this.direction = 'left';
        } else if (Math.abs(x) < Math.abs(y) && y >= this.distance) { // up
            this.direction = 'down';
        } else if (Math.abs(x) < Math.abs(y) && y <= -this.distance) { // down
            this.direction = 'up';
        }
        // console.log(`[v-swipe].swiping!!!: ${this.direction}`, this.el.className, this.distance, x, y, this.stopPropagation, this.preventDefault);
        let touchEvent = this.el.getAttribute('handle-touch-move'); // 回调：e、手势类型、移动距离（正负）
        if (this.direction && touchEvent && this.vm[touchEvent]) this.vm[touchEvent](e, this.direction, {x: x, y: y, dist: dist});
    },
    _touchEnd = function (e) { //eslint-disable-line
        if (this.stopPropagation) e.stopPropagation();
        if (this.preventDefault) e.preventDefault();

        // console.log(`[v-swipe].swipeEnd: ${this.direction} === ${this.direction}`, this.currentTouches[0].clientX, this.startTouches[0].clientX);

        let x = this.currentTouches[0].clientX - this.startTouches[0].clientX,
            y = this.currentTouches[0].clientY - this.startTouches[0].clientY;
            // isTap = Math.abs(x) < this.tapRangeLimit && Math.abs(y) < this.tapRangeLimit,
            // tapEvent = this.el.getAttribute('handle-tap'),
            // doubleTapEvent = this.el.getAttribute('handle-double-tap'),
            // ts = new Date().getTime(),
            // delta = ts - (this.tsTouchStart || ts);

        // // doubleTap模拟doubleClick
        // // if (this.tsTouchEnd - ts <= this.tapMaxTime && isTap && this.vm[doubleTapEvent] && typeof this.vm[doubleTapEvent] === 'function') {
        // if (this.isDoubleTap && this.vm[doubleTapEvent] && typeof this.vm[doubleTapEvent] === 'function') {
        //     console.log(`[v-swipe].swipeEnd: onDoubleTap!!!`);
        //     this.vm[doubleTapEvent](e);
        //     return false;
        // }
        // // tap模拟click事件
        // this.tsTouchEnd = ts;
        // if (delta <= this.tapMaxTime && isTap && this.vm[tapEvent] && typeof this.vm[tapEvent] === 'function') {
        //     console.log(`[v-swipe].swipeEnd: onTap!!!`);
        //     this.vm[tapEvent](e);
        //     return false;
        // }

        let direction = this.el.getAttribute('swipe-direction');
        // console.log(`[v-swipe].swipeEnd: ${this.direction} === ${direction}`, direction.split(','), typeof this.expression);
        // console.log(`[v-swipe].swipeEnd: ==> ${direction} === ${this.direction}`, x, y, this.distance);
        // if (this.direction === direction && typeof this.expression === 'function') {
        //     this.expression();
        // }
        [].forEach.call(direction.split(','), dic => {
            if (dic === this.direction && (Math.abs(x) >= this.distance || Math.abs(y) >= this.distance) && typeof this.expression === 'function') {
                console.log(`[v-swipe].swipeEnd: ==> ${dic} === ${this.direction}`, x, y, this.distance);
                this.expression(this.direction);
            }
        });
        let touchEvent = this.el.getAttribute('handle-touch-end'); //
        if (this.direction && touchEvent && this.vm[touchEvent]) { // 如果需要返回事件
            // let x = this.currentX - this.startX,
            //     y = this.currentY - this.startY;
            this.vm[touchEvent](e, this.direction, {x: x, y: y});
        }
    },

    swipeStart = function (e) { //eslint-disable-line
        if (this.stopPropagation) e.stopPropagation();
        if (this.preventDefault) e.preventDefault();
        this.direction = ''; // 手势类型，touchmove、touchend的时候返回，用于逻辑判断，包含：top、bottom、left、right、pinchin、pinchout
        this.startTouches = this.currentTouches = []; // 手势起始触点
        let now = new Date().getTime(),
            delta = now - (this.tsTouchStart || now);
        this.isDoubleTap = (delta > 0 && delta < this.tapMaxTime);
        this.tsTouchStart = now;

        [].forEach.call(e.touches, v => { this.startTouches.push({ clientX: v.clientX, clientY: v.clientY }); }); // 全部保存
        this.fingerType = e.touches.length > 1 ? 'pinch' : 'swipe'; // 确定手势

        let touchEvent = this.el.getAttribute('handle-touch-start'); //
        if (touchEvent && this.vm[touchEvent]) this.vm[touchEvent](e);
    },

    /**
     * 根据坐标计算手势
     *              -- Author by Dio Zhu. on 2017.6.28
     * @return
     * true: pinchin
     * false: pinchout
     */
    _getPinchDist = function (startTouchs, currentTouchs) {
        // console.log('#############', startTouchs, currentTouchs);
        if (!startTouchs || !currentTouchs || startTouchs.length < 2 || currentTouchs.length < 2) return NaN;
        let startCalX = startTouchs[0].clientX - startTouchs[1].clientX,
            startCalY = startTouchs[0].clientY - startTouchs[1].clientY,
            startDis = Math.pow(startCalX * startCalX + startCalY * startCalY, 0.5),
            currentCalX = currentTouchs[0].clientX - currentTouchs[1].clientX,
            currentCalY = currentTouchs[0].clientY - currentTouchs[1].clientY,
            currentDis = Math.pow(currentCalX * currentCalX + currentCalY * currentCalY, 0.5);
        return (startDis - currentDis);
    },

    swiping = function (e) { //eslint-disable-line
        // console.log(`[v-swipe].swiping: ${this.fingerType}, ${this.direction}`);
        if (this.startY < this.el.getBoundingClientRect().top && this.startY > this.el.getBoundingClientRect().bottom) return true; // 超出范围
        if (this.stopPropagation) e.stopPropagation();
        if (this.preventDefault) e.preventDefault();
        // this.currentX = e.touches[0].clientX;
        // this.currentY = e.touches[0].clientY;
        // let x = this.currentX - this.startX,
        //     y = this.currentY - this.startY;
        // this.currentTouches = e.touches;

        // 根据上一次的手势判断当前的pinch类型，如果类型变化，需重置起始位置（startTouches），目的是确保每次缩放都是针对上次的
        this.oldTouches = this.currentTouches ? this.currentTouches.slice(0) : this.startTouches.slice(0);
        this.currentTouches = []; // 手势起始触点
        [].forEach.call(e.touches, v => { this.currentTouches.push({ clientX: v.clientX, clientY: v.clientY }); }); // 全部保存
        let x = this.currentTouches[0].clientX - this.startTouches[0].clientX,
            y = this.currentTouches[0].clientY - this.startTouches[0].clientY,
            dist = 0;
        // console.log(`[v-swipe].swiping: ${this.fingerType}, ${x}, ${y}, ${this.direction}`);
        if (x < this.tapRangeLimit && y < this.tapRangeLimit) return false; // 触摸精度不满足
        if (this.fingerType === 'swipe') { // 单指滑动
            // x = this.currentTouches[0].clientX - this.startTouches[0].clientX;
            // y = this.currentTouches[0].clientY - this.startTouches[0].clientY;
            if (Math.abs(x) > Math.abs(y) && x >= this.distance) { // right
                this.direction = 'right';
            } else if (Math.abs(x) > Math.abs(y) && x <= -this.distance) { // left
                this.direction = 'left';
            } else if (Math.abs(x) < Math.abs(y) && y >= this.distance) { // up
                this.direction = 'down';
            } else if (Math.abs(x) < Math.abs(y) && y <= -this.distance) { // down
                this.direction = 'up';
            }
        } else { // 多指，按两指取pinch间距，返回两指移动距离和
            // console.log(`[v-swipe].swiping: ${this.fingerType}, ${this.direction}`, this.oldTouches, this.currentTouches);
            let oldDist = _getPinchDist(this.oldTouches, this.currentTouches);
            if ((this.direction === 'pinchout' && oldDist > 0) || (this.direction === 'pinchin' && oldDist <= 0)) {
                this.startTouches = this.oldTouches.slice(0);
            }
            dist = _getPinchDist(this.startTouches, this.currentTouches);
            if (dist > 0) {
                this.direction = 'pinchin';
            } else {
                this.direction = 'pinchout';
            }
        }
        // console.log(`[v-swipe].swiping: ${this.fingerType}, ${x}, ${y}, ${this.direction}`);
        let touchEvent = this.el.getAttribute('handle-touch-move'); // 回调：e、手势类型、移动距离（正负）
        if (this.direction && touchEvent && this.vm[touchEvent]) this.vm[touchEvent](e, this.direction, {x: x, y: y, dist: dist});
    },

    swipeEnd = function (e) { //eslint-disable-line
        if (this.stopPropagation) e.stopPropagation();
        if (this.preventDefault) e.preventDefault();

        console.log(`[v-swipe].swipeEnd: ${this.direction} === ${this.direction}`, this.currentTouches[0].clientX, this.startTouches[0].clientX);

        let x = this.currentTouches[0].clientX - this.startTouches[0].clientX,
            y = this.currentTouches[0].clientY - this.startTouches[0].clientY,
            isTap = Math.abs(x) < this.tapRangeLimit && Math.abs(y) < this.tapRangeLimit,
            tapEvent = this.el.getAttribute('handle-tap'),
            doubleTapEvent = this.el.getAttribute('handle-double-tap'),
            ts = new Date().getTime(),
            delta = ts - (this.tsTouchStart || ts);

        // doubleTap模拟doubleClick
        // if (this.tsTouchEnd - ts <= this.tapMaxTime && isTap && this.vm[doubleTapEvent] && typeof this.vm[doubleTapEvent] === 'function') {
        if (this.isDoubleTap && this.vm[doubleTapEvent] && typeof this.vm[doubleTapEvent] === 'function') {
            console.log(`[v-swipe].swipeEnd: onDoubleTap!!!`);
            this.vm[doubleTapEvent](e);
            return false;
        }
        // tap模拟click事件
        this.tsTouchEnd = ts;
        if (delta <= this.tapMaxTime && isTap && this.vm[tapEvent] && typeof this.vm[tapEvent] === 'function') {
            console.log(`[v-swipe].swipeEnd: onTap!!!`);
            this.vm[tapEvent](e);
            return false;
        }

        let direction = this.el.getAttribute('swipe-direction');
        // console.log(`[v-swipe].swipeEnd: ${this.direction} === ${direction}`, direction.split(','));
        // if (this.direction === direction && typeof this.expression === 'function') {
        //     this.expression();
        // }
        [].forEach.call(direction, dic => {
            if (dic === direction && typeof this.expression === 'function') {
                this.expression();
            }
        });
        let touchEvent = this.el.getAttribute('handle-touch-end'); //
        if (this.direction && touchEvent && this.vm[touchEvent]) { // 如果需要返回事件
            // let x = this.currentX - this.startX,
            //     y = this.currentY - this.startY;
            this.vm[touchEvent](e, this.direction, {x: x, y: y});
        }
    };

// === infinite scrolll ===

let Swipe = {
    bind (el, binding, vnode) {
        console.log(`[v-swipe].bind!`);
        el[ctx] = {
            el,
            vm: vnode.context,
            // vm: vnode.componentInstance,
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
        el[ctx].swipeEventTarget.removeEventListener('touchstart', el[ctx].startListener);
        el[ctx].swipeEventTarget.removeEventListener('touchmove', el[ctx].movingListener);
        el[ctx].swipeEventTarget.removeEventListener('touchend', el[ctx].endListener);
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('Swipe', Swipe);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Fixed = Swipe;
    Vue.use(install); // eslint-disable-line
}

Swipe.install = install;
export default Swipe;
