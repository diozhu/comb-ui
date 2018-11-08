// import Vue from 'vue';
import Vue from 'vue/dist/vue.common.js';
import App from './app.vue';
import Comb from './vendors/index';
import router from './router.js';

Vue.use(Comb); // 注册蜂巢（Comb）组件
console.log('[main.js] ... '); //eslint-disable-line

new Vue({
    router,
    el: '#app',
    render: h => h(App)
});
