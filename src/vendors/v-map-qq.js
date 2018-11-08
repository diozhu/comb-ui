/**
 * 链式调用后的作用域会混乱，总会提示: this.setOptions is not a function...有时间再说吧。。。
 *              -- Author by Dio Zhu on 2017/11/14
 */
import CONFIG from '../config.js';

let obj = {
    init () {
        if (!window.qq && CONFIG.qqmapImportTag) { // 如果有了全局加载标识，但是还没加载完成，在这里递归检测，这里设定50次，2.5s，可自行配置
            return this._tryBind();
        }
        return this._load().then(() => {
            console.log(`v-map-qq.mounted.then: `);
            CONFIG.mapReady = true;
            return this._init();
            // this.dealMap();
        }).catch((e) => {
            CONFIG.mapReady = false;
            console.error(`v-map-qq.mounted.error: `, e);
        });
    },
    getInstance () {
        return window.qq;
    },
    _tryCount: 0,
    _tryBind () {
        if (this._tryCount > 50) return; //eslint-disable-line
        this._tryCount++;
        if (window.qq) {
            console.log(`v-map-qq.mounted.then: `);
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
        if (window.qq) {
            return Promise.resolve();
        }
        console.log('v-map-qq.load: ');
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
        CONFIG.qqmapImportTag = true; // 全局的加载标识
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.id = 'qqmap';
        script.src = 'http://map.qq.com/api/js?v=2.exp&callback=mapLoaded';
        return script;
    },
    _init () {
        console.log('v-map-qq._init: ');
        let cobj = document.createElement('div');
        cobj.id = 'vQQMap_';
        document.body.appendChild(cobj);
        let mapObj = new window.qq.maps.Map(document.getElementById('vQQMap_'));
        return Promise.resolve(mapObj);
        // return Promise.resolve(window.qq.maps);
    }
};
export default obj;
