/**
 * 百度地图
 *              -- Author by Dio Zhu on 2017/11/14
 */
import CONFIG from '../config.js';

let obj = {
    init () {
        if (!window.BMap && CONFIG.bmapImportTag) { // 如果有了全局加载标识，但是还没加载完成，在这里递归检测，这里设定50次，2.5s，可自行配置
            return this._tryBind();
        }
        return this._load().then(() => {
            console.log(`v-map-bmap.mounted.then: `);
            CONFIG.mapReady = true;
            return this._init();
            // this.dealMap();
        }).catch((e) => {
            CONFIG.mapReady = false;
            console.error(`v-map-bmap.mounted.error: `, e);
        });
    },
    getInstance () {
        return window.BMap;
    },
    _tryCount: 0,
    _tryBind () {
        if (this._tryCount > 50) return; //eslint-disable-line
        this._tryCount++;
        if (window.BMap) {
            console.log(`v-map-bmap.mounted.then: `);
            CONFIG.mapReady = true;
            return this._init();
        } else {
            // return Promise.resolve(setTimeout(this._tryBind, 50));
            return new Promise(resolve => {
                setTimeout(() => resolve(this._tryBind), 50);
            });
        }
    },
    _load () {
        if (window.BMap) {
            return Promise.resolve();
        }
        console.log('v-map-bmap.load: ');
        let script = this._createScript();
        // document.body.appendChild(script);
        document.head.appendChild(script);
        return new Promise((resolve, reject) => {
            // window['mapLoaded'] = () => resolve(); // 回调方式
            // script.onload = () => resolve();         // 无回调方式
            script.onload = () => {
                // console.log('v-map-bmap.load2: ');
                resolve();
            };
            script.onerror = error => reject(error);
        });
    },
    _createScript () {
        CONFIG.bmapImportTag = true; // 全局的加载标识
        window.BMap_loadScriptTime = (new Date()).getTime();
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.id = 'bmap';
        // script.src = 'http://api.map.baidu.com/api?v=2.0&ak=' + CONFIG.BMAP_AK;
        script.src = 'http://api.map.baidu.com/getscript?v=2.0&ak=' + CONFIG.BMAP_AK + '&services=&t=' + window.BMap_loadScriptTime;
        return script;
    },
    _init () {
        console.log('v-map-bmap._init: ');
        // let mapObj = new window.BMap.Map('vBMap_');
        // return Promise.resolve(mapObj);
        let cobj = document.createElement('div');
        cobj.id = 'vBMap_';
        document.body.appendChild(cobj);
        let mapObj = new window.BMap.Map('vBMap_');
        // console.log('@@@@@@@@@@@@@@@@@@', mapObj);
        return Promise.resolve(mapObj);
    }
};
export default obj;
