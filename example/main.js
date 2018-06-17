import Vue from 'vue';
import App from './App.vue';
import Comb from '../src/index';

Vue.use(Comb); // 注册蜂巢（Comb）组件

new Vue({
    el: '#app',
    render: h => h(App)
});
