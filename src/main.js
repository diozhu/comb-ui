// import Vue from 'vue';
import Vue from 'vue/dist/vue.common.js';
import App from './app.vue';
import Comb from './vendors/index';
import router from './router.js';
import VueLazyload from 'vue-lazyload';
import * as dom from './js/utils/dom.js';

Vue.use(Comb); // 注册蜂巢（Comb）组件
console.log('[main.js] ... '); //eslint-disable-line


// 延时加载
Vue.use(VueLazyload, {
    preLoad: 1.3,
    // // set observer to true
    // observer: true,
    // // optional
    // observerOptions: {
    //     rootMargin: '0px',
    //     threshold: 0.1
    // },
    error: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAMAAAArteDzAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAByUExURUxpcf94U/93Tv9vSP9vSP9vSP+Sbf+CVf9vSf9vS/9vSP9yTv9vSP9vSP9vSP9zSv9xSf9vSP9vSP9wSf9vSP9wSf9wSv9vSP9vSP91Sv9wSP9vSP9vSP9xSv9vSP9wSf9vSP9wSf9vSP9vSv9wSv9vSJlteWgAAAAldFJOUwAKD/j80QIGeUDGF+ji8yMz24BPu2Ir7bAda5KgOolZqHWaSD0A4EBrAAACIUlEQVR42u2Z3XaCMBCEAYGAaEXxDwVUlPd/xbbH0OU0hGGBNjfkCiN+xjEMO4vVeySJNfU47qtqf5wU6Vzd6mu4V2cypH85VXKcLv40zNCrGsMLJ0BuzpK23cqD82asmMXiTfoIhAg+3seLYpS0h5VcXRZ9v4wy+XJ1GIzMl5KxjOup+GcqH4RM7/Lz61tz+raW0/eUjbR3tYA7+/c7tcz0Dh7qevBvwIOU817tJ7w8RW0wotKt/2Nfe5HV+8Itox5I8ZBiuoXTvYNdKe1DIOZTvW7wtfZEBifFlOeBFdTS7o/A4BQvQv4lTRGcQNpj54/KroWE9FN4zk+ShVrRE77zJ+1/riCDG+L8ZIqiOUsGN8T5yRQVqBePcf7Ya4UG45w/QFDs/Bwo3/kxlO/8GMp3fgxlO//W50Bf/Zx/x1pp2Mv51zYfWiLnv1l8aIic3/oDqDVDZ+gMnaEzdAqoU0RcKN2i9Depkg2lCk9bCboxC7qh235XbF2yoJZQCpTWEsVn1lJpRqVUe2zNUp6matEHyj4A1ZanoECFUJKvaCaMRilt8za/PgspyQZAKUigcEKbFwcJkk4XoyhIociDwxkFPop8OJzhGEkBlMIpjpEkXecntd9HYrOzuxCwRzB9E+Ff2h1YdHBd4BaSEmtBE/QhTDS7+G05Iw1EfuA125SlkZNyqtq5sUY33o1gBxt+eICbXeYfyOAGovmHXOMfx30CPRTVXNdLE+8AAAAASUVORK5CYII=',
    // error: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIkAAAByCAIAAADoE2VEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjA3MTI1NkU0RkVCMTFFNjkyOUVFQUE4MzM1MzQ3OTIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjA3MTI1NkY0RkVCMTFFNjkyOUVFQUE4MzM1MzQ3OTIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCMDcxMjU2QzRGRUIxMUU2OTI5RUVBQTgzMzUzNDc5MiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCMDcxMjU2RDRGRUIxMUU2OTI5RUVBQTgzMzUzNDc5MiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkJ5Fv8AAArXSURBVHja7F1Zd+LY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',
    // loading: '/static/images/loading.jpg',
    // loading: process.env.BASE_URL + 'static/images/loading.jpg',
    // loading: require('../static/images/loading.jpg'),
    // loading: 'assets/loading.jpg',
    attempt: 3,
    // the default is ['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend']
    listenEvents: [ 'scroll', 'mousewheel' ],
    filter: { // 动态设定loading状态的缩略图. mod by Dio Zhu. on 2018.8.15
        progressive (listener, options) {
            let thumb = listener.src;
            let ossidx = thumb.lastIndexOf('?x-oss-process');
            if (ossidx > 0) thumb = thumb.substring(0, ossidx);
            let ypidx = thumb.lastIndexOf('!/');
            if (ypidx > 0) thumb = thumb.substring(0, ypidx);
            if (/static.91wuliu.com|aliyuncs.com/.test(thumb)) thumb += '?x-oss-process=image/resize,w_21'; // oss 缩略图
            else if (/upaiyun.com/.test(thumb)) thumb += '!/format/fw/21'; // 又拍云 缩略图
            else thumb = listener.src;
            // console.warn('[plugins.vue-lazyload] filter.progressive: ', thumb, listener.src);
            listener.loading = thumb;
            if (!listener.startTime) listener.startTime = Date.now();
        }
    },
    adapter: {
        loaded (listener, options) { // load完成后根据加载时间判断是否从缓存加载，'cached'的class决定动画时间长短。 add by Dio Zhu. on 2019.1.4
            if (!listener.endTime) listener.endTime = Date.now();
            let dif = parseInt(listener.endTime - listener.startTime);
            // console.warn('[vue-lazyload] loading time: ', dif, ' ==> ', listener.src);
            if (dif <= 50 && !dom.hasClass(listener.el, 'cached')) dom.addClass(listener.el, 'cached');
            // console.log('[plugins.vue-lazyload] adapter.loaded: el -> ', dom.hasClass(el, 'loading'));
            if (dom.hasClass(listener.el, 'loading')) dom.removeClass(listener.el, 'loading');
            dom.addClass(listener.el, 'loaded');
        }
    }
});


new Vue({
    router,
    el: '#app',
    render: h => h(App)
});
