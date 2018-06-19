/**
 * Created by diozhu on 2017/2/6.
 */

import Toast from '../packages/toast/index';
import vButton from '../packages/button/index';
import vCell from '../packages/cell/index';
import vRow from '../packages/row';
import vCol from '../packages/col';
// import vText from './v-text.vue';
// import vFeed from './v-feed.vue';
// import Refresh from './v-refresh';
// import vRefresh from './v-refresh.vue';
// import Scroll from './v-scroll';
// import vScroll from './v-scroll.vue';
// import InfiniteScroll from './v-infinite-scroll';
// import vInfiniteScroll from './v-infinite-scroll.vue';
// import Swipe from './v-swipe'; // 滑动手势
// import ScrollPosition from './v-scroll-position'; // 滚动条位置记录、还原
// import MessageBox from './v-message-box.js';
// import Logger from '../js/utils/logger';

const version = '1.0.0';
const install = function (Vue) {
    if (install.installed) return;

    Vue.$toast = Vue.prototype.$toast = Toast;

    Vue.component(vButton.name, vButton);
    Vue.component(vCell.name, vCell);
    Vue.component(vRow.name, vRow);
    Vue.component(vCol.name, vCol);
    // Vue.component(vText.name, vText);
    // Vue.component(vFeed.name, vFeed);
    // Vue.component(vRefresh.name, vRefresh);
    // Vue.component(vScroll.name, vScroll);
    // Vue.component(vInfiniteScroll.name, vInfiniteScroll);
    //
    // Vue.use(Refresh);
    // Vue.use(Scroll);
    // Vue.use(InfiniteScroll);
    // Vue.use(Swipe);
    // Vue.use(ScrollPosition);
    //
    // Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
    // Vue.$logger = Vue.prototype.$logger = Logger;
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export {
    install as default,
    version,
    Toast,
    vButton,
    vCell,
    vRow,
    vCol,
    // vText,
    // vFeed,
    //
    // Refresh,
    // vRefresh,
    // Scroll,
    // vScroll,
    // vInfiniteScroll,
    // InfiniteScroll,
    // Swipe,
    // ScrollPosition,
    //
    // MessageBox,
    // Logger
};
