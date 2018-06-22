/**
 * Created by diozhu on 2017/2/6.
 */

import vToast from '../packages/v-toast.js';
import vMessageBox from '../packages/v-message-box.js';
import Validator from '../packages/v-validator.js';
import vButton from '../packages/v-button.vue';
import vCell from '../packages/v-cell.vue';
import vRow from '../packages/v-row.vue';
import vCol from '../packages/v-col.vue';
import vPopup from '../packages/v-popup.vue';
import vPicker from '../packages/v-picker.vue';
import vDatetimePicker from '../packages/v-datetime-picker.vue';
import vField from '../packages/v-field.vue';
import vSpinner from '../packages/v-spinner';
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
// import Logger from '../js/utils/logger';

// const version = '1.0.0';
const install = function (Vue) {
    if (install.installed) return;

    Vue.$toast = Vue.prototype.$toast = vToast;
    Vue.$messagebox = Vue.prototype.$messagebox = vMessageBox;
    Vue.$validator = Vue.prototype.$validator = Validator;

    Vue.component(vButton.name, vButton);
    Vue.component(vCell.name, vCell);
    Vue.component(vRow.name, vRow);
    Vue.component(vCol.name, vCol);
    Vue.component(vPopup.name, vPopup);
    Vue.component(vPicker.name, vPicker);
    Vue.component(vDatetimePicker.name, vDatetimePicker);
    Vue.component(vField.name, vField);
    Vue.component(vSpinner.name, vSpinner);
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
    // Vue.$logger = Vue.prototype.$logger = Logger;
};

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

// export {
//     install as default,
//     version,
//     Toast,
//     MessageBox,
//     Validator,
//     vButton,
//     vCell,
//     vRow,
//     vCol,
//     vPopup,
//     vPicker,
//     vDatetimePicker,
//     vField,
//     vSpinner,
//     // vText,
//     // vFeed,
//     //
//     // Refresh,
//     // vRefresh,
//     // Scroll,
//     // vScroll,
//     // vInfiniteScroll,
//     // InfiniteScroll,
//     // Swipe,
//     // ScrollPosition,
//     //
//     // Logger
// };
export default install;

export const Toast = vToast;
export const MessageBox = vMessageBox;
//     MessageBox,
//     Validator,
//     vButton,
//     vCell,
//     vRow,
//     vCol,
//     vPopup,
//     vPicker,
//     vDatetimePicker,
//     vField,
//     vSpinner,
//     // vText,
//     // vFeed,
//     //
//     // Refresh,
//     // vRefresh,
//     // Scroll,
//     // vScroll,
//     // vInfiniteScroll,
//     // InfiniteScroll,
//     // Swipe,
//     // ScrollPosition,
//     //
//     // Logger
// };
