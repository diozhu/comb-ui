/**
 * 暂时项目只要获取地理位置，没有地图显示的需求。。。偷懒实现了高德地图的引入，后续可按options实现初始化。。。
 *              -- Author by Dio Zhu on 2017/11/9
 */
import CONFIG from '../config.js';

let obj = {
    init () {
        if (!window.AMap && CONFIG.amapImportTag) { // 如果有了全局加载标识，但是还没加载完成，在这里递归检测，这里设定50次，2.5s，可自行配置
            return this._tryBind();
        }
        return this._load().then(() => {
            console.log(`v-map-amap.mounted.then: `);
            CONFIG.mapReady = true;
            return this._init();
            // this.dealMap();
        }).catch((e) => {
            CONFIG.mapReady = false;
            console.error(`v-map-amap.mounted.error: `, e);
        });
    },
    getInstance () {
        return window.AMap;
    },
    _tryCount: 0,
    _tryBind () {
        if (this._tryCount > 50) return; //eslint-disable-line
        this._tryCount++;
        if (window.AMap) {
            console.log(`v-map-amap.mounted.then: `);
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
        if (window.AMap) {
            return Promise.resolve();
        }
        console.log('v-map-amap.load: ');
        let script = this._createScript();
        // document.body.appendChild(script);
        document.head.appendChild(script);
        return new Promise((resolve, reject) => {
            window['mapLoaded'] = () => resolve();
            // script.onload = () => resolve();
            script.onerror = error => reject(error);
        });
    },
    _createScript () {
        CONFIG.amapImportTag = true; // 全局的加载标识
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.id = 'amap';
        script.src = 'http://webapi.amap.com/maps?v=' + CONFIG.AMAP_VERSION + '&key=' + CONFIG.AMAP_KEY + '&callback=mapLoaded';
        return script;
    },
    _init () {
        console.log('v-map-amap._init: ');
        let mapObj = new window.AMap.Map('vAMap_', {
            // dragEnable: this.dragEnable,
            keyboardEnable: false,
            // doubleClickZoom: this.dragEnable,
            resizeEnable: false,
            zoomEnable: true,
            touchZoom: true,
            // center: defaultMaker.position,
            // zoom: this.zoom,
            fixed: false
        });
        return Promise.resolve(mapObj);
    }
};
export default obj;
