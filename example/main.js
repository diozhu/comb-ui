// import Vue from 'vue';
import Vue from 'vue/dist/vue.common.js';
import App from './App.vue';
import router from './router.js';
// import Comb from '../src/index';
// console.warn('main.js: ', Comb);
// Vue.use(Comb); // 注册蜂巢（Comb）组件

new Vue({
    router,
    el: '#app',
    render: h => h(App)
});
