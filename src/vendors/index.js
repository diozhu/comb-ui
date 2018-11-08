/**
 * Created by diozhu on 2017/2/6.
 */

import vButton from './v-button.vue';
// import vText from './v-text.vue';
import vRow from './v-row.vue';
import vCol from './v-col.vue';
import vCell from './v-cell.vue';
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
import Toast from './v-toast.js';
// import Logger from '../js/utils/logger';
// import vImage from '../vendor/v-image';
import vSpinner from './v-spinner';

const version = '1.0.1';
const install = function (Vue) {
    if (install.installed) return;

    Vue.component(vButton.name, vButton);
    // Vue.component(vText.name, vText);
    Vue.component(vRow.name, vRow);
    Vue.component(vCol.name, vCol);
    Vue.component(vCell.name, vCell);
    // Vue.component(vFeed.name, vFeed);
    // Vue.component(vRefresh.name, vRefresh);
    // Vue.component(vScroll.name, vScroll);
    // Vue.component(vInfiniteScroll.name, vInfiniteScroll);
    Vue.component(vSpinner.name, vSpinner);
    //
    // Vue.use(Refresh);
    // Vue.use(Scroll);
    // Vue.use(InfiniteScroll);
    // Vue.use(Swipe);
    // Vue.use(ScrollPosition);
    //
    // Vue.component(vImage.name, vImage);
    // Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
    Vue.$toast = Vue.prototype.$toast = Toast;
    // Vue.$logger = Vue.prototype.$logger = Logger;
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export {
    install as default,
    version,
    vButton,
    // vText,
    vRow,
    vCol,
    vCell,
    // vFeed,
    //
    // Refresh,
    // vRefresh,
    // Scroll,
    // vScroll,
    // vInfiniteScroll,
    // InfiniteScroll,
    vSpinner,
    // Swipe,
    // ScrollPosition,
    //
    // MessageBox,
    Toast
    // Logger,
    // vImage
};
