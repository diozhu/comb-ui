// import Vue from 'vue';
import Vue from 'vue/dist/vue.common.js';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
const routes = [
    {
        title: 'Base Components',
        list: [
            { name: 'Toast', path: '/toast' },
            { name: 'Button', path: '/button' }
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
