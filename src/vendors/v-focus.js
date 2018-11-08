/**
 * Created by diozhu on 2017/6/19.
 */
import Vue from 'vue';

// === infinite scrolll ===

let Focus = {
    inserted: function (el, binding) {
        // console.log('[v-focus].inserted: ', el, binding);
        if (binding.value) el.focus();
        else el.blur();
    },

    componentUpdated: function (el, binding) {
        // console.log('[v-focus].componentUpdated: ', el, binding);
        if (binding.modifiers.lazy) {
            if (Boolean(binding.value) === Boolean(binding.oldValue)) {
                return;
            }
        }

        if (binding.value) {
            // el.focus();
            setTimeout(() => { el.focus(); }, 0);
        } else {
            el.blur();
        }
    },

    unbind (el) {
    }
};

// === install ===

const install = function (Vue) {
    Vue.directive('Focus', Focus);
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Focus = Focus;
    Vue.use(install); // eslint-disable-line
}

Focus.install = install;
export default Focus;
