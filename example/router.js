// import Vue from 'vue';
import Vue from 'vue/dist/vue.common.js';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
const routes = [
    {
        title: 'CSS Components',
        list: [
            { name: 'Layout', path: '/layout' },
            { name: 'Spinner', path: '/spinner' },
            { name: 'Icon', path: '/toast' },
            { name: 'Button', path: '/button' },
            { name: 'Text', path: '/button' },
            { name: 'Album', path: '/button' },
            { name: 'Animat', path: '/button' },
        ]
    },
    {
        title: 'Base Components',
        list: [
            { name: 'Toast', path: '/toast' },
            { name: 'MessageBox', path: '/message-box' },
            { name: 'Picker', path: '/picker' },
            { name: 'Popup', path: '/popup' },
            { name: 'DatetimePicker', path: '/datetime-picker' },
            { name: 'Swipe', path: '/swipe' },
            { name: 'CharIndexes', path: '/char-indexes' },
            { name: 'Tab', path: '/message-box' },
            { name: 'Scroll', path: '/message-box' },
            { name: 'Refresh', path: '/message-box' },
            { name: 'Viewer', path: '/toast' },
            { name: 'Timeline', path: '/toast' },
            { name: 'Star', path: '/toast' },
            { name: 'Calendar', path: '/toast' },
        ]
    },
    {
        title: 'Form Components',
        list: [
            { name: 'Form', path: '/toast' },
            { name: 'Cell', path: '/toast' },
            { name: 'CellSwipe', path: '/toast' },
            { name: 'CellSwipe', path: '/toast' },
            { name: 'Switch', path: '/toast' },
            { name: 'CheckBox', path: '/toast' },
            { name: 'Radio', path: '/toast' },
            { name: 'Field', path: '/toast' },
            { name: 'Badge', path: '/toast' },
            { name: 'Search', path: '/toast' },
            { name: 'UploadImages', path: '/toast' },
            { name: 'Validator', path: '/toast' },
        ]
    }
];

const initRoute = (list) => {
    // let routes = [];
    let routes = [ { name: 'home', path: '/', component: Vue.extend(require(`./pages/home.vue`).default) } ];
    list.map(item =>
        item.list.map(page =>
            routes.push({
                name: page.name,
                path: page.path,
                component: Vue.extend(require(`./pages${page.path}`).default),
                meta: {
                    title: page.title || page.name,
                    description: page.description || ''
                }
            })
        )
    );
    return routes;
};
const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes: initRoute(routes)
});

export default router;

export const menus = routes;
