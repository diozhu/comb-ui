/**
 * Created by diozhu on 2017/2/6.
 */

import vRow from './v-row.vue';
import vCol from './v-col.vue';
import vCell from './v-cell.vue';
import vButton from './v-button.vue';
import vText from './v-text.vue';
import vAnimat from './v-animat.vue';

import vImage from './v-image.vue';
// import vFeed from './v-feed.vue';
// import Refresh from './v-refresh';
// import vRefresh from './v-refresh.vue';
// import Scroll from './v-scroll';
// import vScroll from './v-scroll.vue';
// import InfiniteScroll from './v-infinite-scroll';
// import vInfiniteScroll from './v-infinite-scroll.vue';
// import Swipe from './v-swipe'; // 滑动手势
// import ScrollPosition from './v-scroll-position'; // 滚动条位置记录、还原
import Toast from './v-toast.js';
import MessageBox from './v-message-box.js';
import vPicker from './v-picker.vue';
import vPopup from './v-popup.vue';
import vDatetimePicker from './v-datetime-picker.vue';
// import Logger from '../js/utils/logger';
import vSpinner from './v-spinner';

import Swipe from './v-swipe.js';
import Sticky from './v-sticky.js';
import ScrollPosition from './v-scroll-position.js';

const version = '1.0.1';
const install = function (Vue) {
    if (install.installed) return;

    Vue.component(vRow.name, vRow);
    Vue.component(vCol.name, vCol);
    Vue.component(vCell.name, vCell);
    Vue.component(vButton.name, vButton);
    Vue.component(vText.name, vText);
    Vue.component(vAnimat.name, vAnimat);

    Vue.component(vPicker.name, vPicker);
    Vue.component(vPopup.name, vPopup);
    Vue.component(vDatetimePicker.name, vDatetimePicker);
    // Vue.component(vSwipe.name, vSwipe);
    Vue.component(vImage.name, vImage);
    // Vue.component(vFeed.name, vFeed);
    // Vue.component(vRefresh.name, vRefresh);
    // Vue.component(vScroll.name, vScroll);
    // Vue.component(vInfiniteScroll.name, vInfiniteScroll);
    Vue.component(vSpinner.name, vSpinner);
    //
    Vue.use(Swipe);
    Vue.use(Sticky);
    Vue.use(ScrollPosition);
    // Vue.use(Refresh);
    // Vue.use(Scroll);
    // Vue.use(InfiniteScroll);
    // Vue.use(Swipe);
    // Vue.use(ScrollPosition);
    //
    Vue.$messagebox = Vue.prototype.$messagebox = MessageBox;
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
    vRow,
    vCol,
    vCell,
    vButton,
    vText,
    vAnimat,
    vPicker,
    vPopup,
    vDatetimePicker,
    vImage,
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
    Swipe,
    Sticky,
    ScrollPosition,
    //
    MessageBox,
    Toast
    // Logger,
};
