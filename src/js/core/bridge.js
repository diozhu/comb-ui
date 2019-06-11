/**
 * dsBridge封装;
 *              -- Author by Dio sunleqing. on 2019.6.6
 */
import bridge from 'dsbridge';
// import router from '../router.js';
// import store from '../store';
/**
 * 本地假数据
 *              -- Author by Dio sunleqing. on 2018.04.04
 */
// import dsBridge from 'dsbridge';
// let bridge = dsBridge;
// if (process.env.NODE_ENV !== 'production' || !dsBridge) {
//     console.log('[bridge]local', process.env.NODE_ENV !== 'production', !dsBridge, dsBridge);
//     window._dsbridge = b => {
//         return b;
//     };
//     let demoUserInfo = { data: { id: '6750', name: '张阳', token: '6750' }, errcode: 0, errmsg: 'success' };
//     console.error(bridge);
//     bridge = {
//         call: (b, args, cb) => {
//             console.warn('[bridge] local...', b, args, cb);
//             if (b === 'getUserInfoSync') {
//                 return demoUserInfo;
//             } else if (b === 'closeSync') {
//                 return { errcode: 0, errmsg: 'success' };
//             } else if (b === 'configWebViewBarSync') {
//                 return { errcode: 0, errmsg: 'success' };
//             } else if (b === 'sweepCode') {
//                 return { data: { vin: 'SJDKFLJ' }, errcode: 0, errmsg: 'success' };
//             } else if (b === 'chooseImage') {
//                 let data =  {
//                     errcode: 0, errmsg: 'success',
//                     data: [
//                         {
//                             base64:
//                                 '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',
//                             width: '100',
//                             height: '100',
//                             type: 'jpeg'
//                         },
//                         {
//                             base64:
//                                 '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',
//                             width: '100',
//                             height: '100',
//                             type: 'jpeg'
//                         }
//                     ]
//                 };
//                 setTimeout(() => { cb(data); }, 1000);
//             }
//         }
//     };
// }
/**
 * 同步！获取用户信息，包含用户姓名、id、token等
 * 返回：
 *     {
 *           data: {
 *               id: String,
 *               name: String,
 *               token: String
 *           },
 *           errcode: Number,
 *           errmsg: String
 *      }
 *              -- Author by Dio sunleqing. on 2019.04.04
 */
export const getUserInfoSync = () => {
    let rtn = bridge.call('getUserInfoSync');
    console.log('[bridge] getUserInfoSync: ');
    if (typeof rtn === 'string') rtn = JSON.parse(rtn);
    if (rtn && parseInt(rtn.errcode) === 0) return rtn.data;
    // if (rtn && parseInt(rtn.errcode) === 0) return Promise.resolve(rtn.data);
    // else return Promise.reject(rtn);
};
/**
 * 关闭webview
 * 返回：
 *     {
 *           data: '',
 *           errcode: Number,
 *           errmsg: String
 *      }
 */
export const closeSync = url => {
    let rtn = bridge.call('closeSync', url);
    console.log('[bridge] closeSync: ', rtn);
    if (typeof rtn === 'string') rtn = JSON.parse(rtn);
    if (rtn && parseInt(rtn.errcode) === 0) return rtn.data;
    else return rtn;
};
/**
 * 关闭webview
 * 返回：
 *     {
 *           data: '',
 *           errcode: Number,
 *           errmsg: String
 *      }
 */
// params = {
//     isShowBack: false, // 返回按钮是否显示
// }
export const configWebViewBackSync = params => {
    let rtn = bridge.call('configWebViewBackSync', params);
    console.log('[bridge] configWebViewBackSync: ', params);
    if (typeof rtn === 'string') rtn = JSON.parse(rtn);
    if (rtn && parseInt(rtn.errcode) === 0) return Promise.resolve(rtn.data);
    else return Promise.reject(rtn);
};
/**
 * 初始化webviewBar
 * 返回：
 *     {
 *           data: '',
 *           errcode: Number,
 *           errmsg: String
 *      }
 */
// params = {
//         title: this.$route.meta.title,
//         type: 0, // type: 0,显示文字 type: 1 显示搜索
//         callback: '' // type为1的要跳转的地址
// }
export const configWebViewBarSync = params => {
    let rtn = bridge.call('configWebViewBarSync', params);
    console.log('[bridge] configWebViewBarSync: ', params);
    // if (typeof rtn === 'string') window.alert(rtn);
    // else window.alert(JSON.stringify(rtn));
    if (typeof rtn === 'string') rtn = JSON.parse(rtn);
    if (rtn && parseInt(rtn.errcode) === 0) return Promise.resolve(rtn.data);
    else return Promise.reject(rtn);
};

/**
 * 初始化webviewMenu(右上角按钮)
 * 返回：
 *     {
 *           data: '',
 *           errcode: Number,
 *           errmsg: String
 *      }
 */
// params = [{
//             text: '线索录入', // 右侧文字
//             icon: '', // 右侧显示什么icon的图标
//             menuType: 1, // 如果menuType=1时是原生要执行的
//             menuback: 'coach://crm/cluemake', // 告诉原生要执行什么内容。
//             callback: '/mobile/home', // 要执行的内容，calltype=1时，是跳转的路由地址，2的时候是要执行什么方法名
//             callType: 2 //1 执行路由 2 执行方法
// }]
export const configWebViewMenuSync = params => {
    let rtn = bridge.call('configWebViewMenuSync', params);
    console.log('[bridge] configWebViewMenuSync: ', params);
    if (typeof rtn === 'string') rtn = JSON.parse(rtn);
    if (rtn && parseInt(rtn.errcode) === 0) return Promise.resolve(rtn.data);
    else return Promise.reject(rtn);
};

/**
 * 异步！调取原生摄像头，实现扫一扫功能
 * 返回指令号或者vin后再走接口查询数据
 * 返回：
 *     {
 *           data: {
 *               vin: String
 *           },
 *           errcode: Number,
 *           errmsg: String
 *      }
 *              -- Author by Dio sunleqing. on 2019.4.04
 */
// params = {
//     type: 'vinInfo', // vin扫描返回车辆vin direct扫描指令号返回指令号
// }
export const sweepCode = params => {
    return new Promise((resolve, reject) => {
        return bridge.call('sweepCode', params, res => {
            console.log('[bridge] sweepCode: ', res);
            if (typeof res === 'string') res = JSON.parse(res); // android返回的是对象，ios返回的是字符串。 Add by Dio sunleqing. on 2019.04.04
            if (res && (res.errcode === '0' || parseInt(res.errcode) === 0)) return resolve(res.data);
            else return reject(res);
        });
    });
};
/**
 * 异步！调起原生相机相册，并返回bas64图片
 * 返回：
 *     {
 *           data: [
 *             {
 *               base64: 'String',
 *               width: '100',
 *               height: '100p'
 *               type: 'jpeg'
 *             }
 *           ],
 *           errcode: Number,
 *           errmsg: String
 *      }
 *              -- Author by Dio sunleqing. on 2019.4.04
 */
// params = {
//     count: 1, // 最多传几张图
//     sourceType: '' // 值camera 相机  值album 相册， 默认相机相册
//     crop: '1:1' //  按比例裁剪，默认不裁剪
// }
export const chooseImage = params => {
    return new Promise((resolve, reject) => {
        return bridge.call('chooseImage', params, res => {
            console.log('[bridge] chooseImage: ', res);
            if (typeof res === 'string') res = JSON.parse(res);
            if (res && parseInt(res.errcode) === 0) return resolve(res.data);
            else return reject(res);
        });
    });
};
/**
 * 注册原生调用的函数nativeCallback
 * 返回值 type=1 跳转路由 type＝2 执行函数
 * type=2时把返回值path存到vuex 仓库里面，
 * 页面调用时，watch监听值得变化，判断nativeActionBarCallback有值时执行函数
 * nativeActionBarCallback的值不同执行不同的函数，
 * 注意：函数执行完毕，清空vuex仓库里面nativeActionBarCallback的值
 * 返回：
 *     {
 *           data: {
 *              type: Number,
 *              path: 'String'
 *           }
 *           errcode: Number,
 *           errmsg: String
 *      }
 *              -- Author by Dio sunleqing. on 2019.4.04
 */
// const goRouterPage = path => {
//     router.push({ path: path });
// };
// const goFunctionPage = res => {
//     store.commit('SET_BOARD_BAR', res.path);
// };
// bridge.register('nativeCallback', function(rtn) {
//     if (typeof rtn === 'string') rtn = JSON.parse(rtn); // android返回的是对象，ios返回的是字符串。 Add by Dio sunleqing. on 2019.04.04
//     if (rtn.type === 1) {
//         goRouterPage(rtn.path);
//     } else {
//         goFunctionPage(rtn);
//     }
// });

/**
 *只拨打电话
 * 入参：phone：phoneNum
 * */
export const makePhoneCallSync = params => {
    let rtn = bridge.call('makePhoneCall', params);
    console.log('[bridge] makePhoneCall: ', params);
    // window.alert(JSON.stringify(rtn));
    if (typeof rtn === 'string') rtn = JSON.parse(rtn);
    if (rtn && parseInt(rtn.errcode) === 0) return Promise.resolve(rtn.data);
    else return Promise.reject(rtn);
};
