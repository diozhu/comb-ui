/**
 * Created by diozhu on 2017/2/6.
 * mod by Dio Zhu. on 2018.6.12
 */
import Vue from 'vue';
// const ToastConstructor = Vue.extend(require('./v-toast.vue'));
import vToast from './v-toast.vue';
const ToastConstructor = Vue.extend(vToast);
let toastPool = [],
    getAnInstance = () => {
        if (toastPool.length > 0) {
            let instance = toastPool[0];
            toastPool.splice(0, 1);
            return instance;
        }
        return new ToastConstructor({
            el: document.createElement('div')
        });
    }, returnAnInstance = instance => {
        if (instance) {
            toastPool.push(instance);
        }
    }, removeDom = event => {
        if (event.target.parentNode) {
            event.target.parentNode.removeChild(event.target);
        }
    }, VToast = (options = {}) => {
        let duration = options.duration || 3000, instance = getAnInstance();
        instance.closed = false;
        clearTimeout(instance.timer);
        instance.message = typeof options === 'string' ? options : options.message;
        instance.position = options.position || 'middle';
        instance.className = options.className || '';
        instance.iconClass = options.iconClass || '';

        document.body.appendChild(instance.$el);
        Vue.nextTick(function () {
            instance.visible = true;
            instance.$el.removeEventListener('transitionend', removeDom);
            ~duration && (instance.timer = setTimeout(function () {
                if (instance.closed) return;
                instance.close();
            }, duration));
        });
        return instance;
    };

ToastConstructor.prototype.close = function () {
    this.visible = false;
    this.$el.addEventListener('transitionend', removeDom);
    this.closed = true;
    returnAnInstance(this);
};

export default VToast;
