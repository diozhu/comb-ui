<template>
    <div class="v-map" :id="'vAMap_' + _uid">
        <div v-if="!mapReady" class="map-loading"></div>
        <!--<div class="v-map__img" :style="bgStyle" v-if="img"></div>-->
        <!--<div class="v-map__location" v-if="location">{{location}}<i class="icon icon-arror-r"></i></div>-->
        <!--<div class="v-map__local" @click="markerBack"><div></div></div>-->
    </div>
</template>
<script type="text/ecmascript-6">
    // import AMap from 'AMap';
    import bus from './eventbus.js';
    // import toast from '';

    let defaultMaker = {
        position: [116.699352, 40.091508],
        draggable: false,
        isPanTo: true
        // content: '<div class="marker-default"></div>'
    };
    export default {
        name: 'VMapTms',
        props: {
            keywords: {
                type: String,
                default: ''
            },
            lng: {
                type: String,
                default: '116.699352'
            },
            lat: {
                type: String,
                default: '40.091508'
            },
            // img: {
            //     type: String,
            //     default: ''
            // },         // 图片地址
            // location: {
            //     type: String,
            //     default: ''
            // },    // 显示地址
            // placeSearch: {       // 是否启用地址搜索
            //     type: Boolean,
            //     default: false
            // },
            // radius: {            // 默认半径，搜索时使用
            //     type: Number,
            //     default: 500
            // },
            // locations: {         // 地址列表
            //     type: Array,
            //     default: () => []
            // },
            dragEnable: {
                type: Boolean,
                default: false
            },
            markers: {// 位置点数组:[{lng: '', lat: '', icon: {}}]
                type: Array,
                default: () => []
            },
            clusterEnable: { // 是否打开点聚合
                type: Boolean,
                default: true
            },
            openMarkerInfoFunc: { // 打开信息窗口后的回调，用于标题和内容的自定义
                type: Function,
                default: () => {}
            },
            openSimplifierWindowFunc: { // 轨迹动画进行时的信息窗口,数据补全
                type: Function,
                default: () => {}
            },
            paths: {
                type: Array,
                default: () => []
            },
            speed: {
                type: Number,
                default: 400
            },
            zoom: {
                type: Number,
                default: 16
            },
            backAddr: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                amap: null,     // 高德地图对象
                bgStyle: {
                    background: 'url(' + this.img + ')',
                    'background-position': '50% 50%',
                    'background-repeat': 'no-repeat',
                    'background-size': 'cover'
                },
                geocoder: null, // 高德地图地理api
                mapReady: false,
                mapMarker: [],
                centerPos: [],
                page: 1,                // 页数
                pageNum: process.env.VUE_APP_LIMIT,  // 每页记录数
                hasMore: true,
                currentPaths: this.paths // 路径轨迹，点坐标集合
            };
        },

        watch: {
            markers () {
                this.removeMarkers();
                this.amap && this.dealMap();
            },

//             keywords (val) {
// //                if (val === '' || /[^\u0000-\u00FF]/.test(val)) { // 检索中文
//                 if (val === '' || /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(val)) { // 检索中文
//                     this.hasMore = true;
//                     this.searchNearBy({keywords: val, refreshTag: true});
//                 }
//             },

            paths: { // 监听路径变化，刷新轨迹
                handler () {
                    // this.currentPaths = val;
                    this.pathSimplifierChange(); // 路径变化，触发轨迹播放
                },
                deep: true
            },
            speed () { // 监听速度变化，调整轨迹动画的速度
                this.setNavgSpeed();
            }
        },

        created () {
            // 绑定事件
            // bus.$on('v-map.changeMarker', this.changeMarker); // 监听切换标记
            bus.$on('v-map-tms.navgPlay', this.navgPlay); // 监听切换标记
            bus.$on('v-map-tms.navgStop', this.navgStop);
            bus.$on('v-map-tms.navgPause', this.navgPause);
            bus.$on('v-map-tms.navgResume', this.navgResume);
            bus.$on('v-map-tms.navgPrev', this.navgPrev);
            bus.$on('v-map-tms.navgNext', this.navgNext);
        },
        deactivated () {
            bus.$off('v-map-tms.navgPlay', this.navgPlay); // 解绑
            bus.$off('v-map-tms.navgStop', this.navgStop);
            bus.$off('v-map-tms.navgPause', this.navgPause);
            bus.$off('v-map-tms.navgResume', this.navgResume);
            bus.$off('v-map-tms.navgPrev', this.navgPrev);
            bus.$off('v-map-tms.navgNext', this.navgNext);
        },
        beforeDestroy () {
            bus.$off('v-map-tms.navgPlay', this.navgPlay); // 解绑
            bus.$off('v-map-tms.navgStop', this.navgStop);
            bus.$off('v-map-tms.navgPause', this.navgPause);
            bus.$off('v-map-tms.navgResume', this.navgResume);
            bus.$off('v-map-tms.navgPrev', this.navgPrev);
            bus.$off('v-map-tms.navgNext', this.navgNext);
        },

        mounted () {
            console.log(`v-map.${this._uid}.mounted: `);

            if (!window.AMap && this.$root.amapImportTag) { // 如果有了全局加载标识，但是还没加载完成，在这里递归检测，这里设定50次，2.5s，可自行配置
                let tryCount = 0;
                let tryBind = () => {
                    if (tryCount > 50) return; //eslint-disable-line
                    tryCount++;
                    if (window.AMap) {
                        console.log(`v-map.${this._uid}.mounted.then: `);
                        this.mapReady = true;
                        this.init();
                        this.dealMap();
                    } else {
                        setTimeout(tryBind, 50);
                    }
                };
                tryBind();
                return;
            }

            this.load().then(() => {
                console.log(`v-map.${this._uid}.mounted.then: `);
                this.mapReady = true;
                this.init();
                this.dealMap();
            }).catch((e) => {
                this.mapReady = false;
                console.error(`v-map.${this._uid}.mounted.error: `, e);
            });
        },

        methods: {
            load () {
                if (window.AMap && window.AMapUI) {
                    return Promise.resolve();
                }
                console.log(`v-map.${this._uid}.load: `);
                let script = this.createScript('//webapi.amap.com/maps?v=' + process.env.VUE_APP_AMAP_VERSION + '&key=' + process.env.VUE_APP_AMAP_KEY + '&callback=mapLoaded');
                // document.body.appendChild(script);
                document.head.appendChild(script);

                return new Promise((resolve, reject) => {
                    window['mapLoaded'] = () => {
                        resolve();

                        let ui = this.createScript('//webapi.amap.com/ui/1.0/main.js?v=' + (process.env.VUE_APP_AMAP_UI_VERSION || '1.0.11'));
                        document.head.appendChild(ui);
                    };
                    // script.onload = () => resolve();
                    script.onerror = error => reject(error);
                });
            },
            createScript (src) {
                this.$root.amapImportTag = true; // 全局的加载标识
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                // script.id = 'amap';
                script.src = src;
                return script;
            },
            init () { // 初始化地图对象
                console.log(`v-map.${this._uid}.init: `, this.mapReady, window.AMap);
                this.amap = new window.AMap.Map('vAMap_' + this._uid, {
                    dragEnable: this.dragEnable,
                    keyboardEnable: false,
                    doubleClickZoom: this.dragEnable,
                    resizeEnable: false,
                    zoomEnable: true,
                    touchZoom: true,
                    center: defaultMaker.position,
                    zoom: this.zoom,
                    fixed: false
                });

//                 if (this.placeSearch) {
// //                    window.AMap.event.addDomListener('dragMap', 'change', this.onModeChange);
//                     this.amap.on('moveend', this.onMoveEnd);
//                     window.AMap.service('AMap.PlaceSearch', () => {
//                         this.placeSearcher = new window.AMap.PlaceSearch({ // 构造地点查询类
//                             pageSize: this.pageNum,
//                             type: '汽车服务|汽车销售|汽车维修|摩托车服务|餐饮服务|购物服务|生活服务|体育休闲服务|医疗保健服务|住宿服务|风景名胜|商务住宅|政府机构及社会团体|科教文化服务|交通设施服务|金融保险服务|公司企业|道路附属设施|地名地址信息|公共设施',
//                             pageIndex: this.page,
// //                            city: '010', // 城市
// //                            map: this.amap,
//                             showCover: false
//                         });
//
// //                        this.placeSearcher.searchNearBy('', [this.lng, this.lat], 200, (status, result) => {
// //                            if (status === 'complete' && result.info === 'OK') {
// //                                console.log('v-map.onDragEnd: ', status, result);
// // //                            this.locations = result.poiList.pois;
// //                                this.$emit('locations-change', result.poiList.pois);
// //                            }
// //                        });
// //                        this.$el['@@SearchNearBy'] = this.searchNearBy.bind(this);
// //                        bus.$emit('v-scroll.getList'); // 初始化完成后，触发滚动条拉取数据
//                         this.searchNearBy();
//                     });
//                 }

                // 如果支持弹出infoWindow，这里加载
                if (this.openMarkerInfoFunc && typeof this.openMarkerInfoFunc === 'function') {
                    this.initGeocoder();

                    // setTimeout(() => { // 延迟是为了让AMapUI加载完成。。。
                    //     window.AMapUI.loadUI(['overlay/SimpleInfoWindow'], (cla1) => {
                    //       this.SimpleInfoWindow = cla1;
                    //     });
                    // }, 200);
                    this.loadUI().then(() => {
                        // console.log('-----------> ', typeof this.openMarkerInfoFunc);
                        window.AMapUI.loadUI(['overlay/SimpleInfoWindow'], (cla1) => {
                            // console.log('-----------> ', cla1);
                            this.SimpleInfoWindow = cla1;
                        });
                    }).catch(e => {
                        console.error('v-map-tms.init.loadUI: ', e);
                    });
                }

            },
            loadUI () { // 处理异步组件加载

                return new Promise((resolve, reject) => {
                    if (!this.loadUiMaxTry) this.loadUiMaxTry = 0;
                    if (window.AMapUI) {
                        // console.warn('v-map-tms.loadUI: 2 -------> ', window.AMapUI, this.loadUiMaxTry);
                        resolve({});
                    } else if (!window.AMapUI && this.loadUiMaxTry < 10) {
                        // console.warn('v-map-tms.loadUI: 1 -------> ', window.AMapUI, this.loadUiMaxTry);
                        this.loadUiMaxTry++;
                        // setTimeout(() => {
                        //     this.loadUI();
                        // }, 200);
                        setTimeout(() => {
                            return this.loadUI().then(res => resolve(res));
                        }, 200);
                    } else {
                        // console.warn('v-map-tms.loadUI: 3 -------> ', window.AMapUI, this.loadUiMaxTry);
                        reject();
                    }
                });
            },

            /** ======================================== SimpleInfoWindow ======================================== */

            // 【SimpleInfoWindow】初始化。  -- Author by Dio Zhu. on 2019.5.29
            async initSimpleInfoWindow () {
                await this.loadUI();

                return new Promise(resolve => {
                    window.AMapUI.loadUI(['overlay/SimpleInfoWindow'], (res) => {
                        this.SimpleInfoWindow = res;
                        resolve();
                    });
                });
            },

            async openMarkerInfo (item) { // 打开信息窗口
                // console.log('v-map.openMarkerInfo: ', item);
                // if (!this.geocoder) { // 如果地理解析Geocoder组件未实例化，则去实例化
                //     this.initGeocoder();
                // }

                if (!this.SimpleInfoWindow) await this.initSimpleInfoWindow();

                let cusFunc = () => {
                        this.openMarkerInfoFunc(item.extData).then(res => {
                            // console.log('v-map.openMarkerInfo.callback: ', res);
                            let win =  new this.SimpleInfoWindow({
                                infoTitle: res.infoTitle || 'error',
                                infoBody: res.infoBody || '抱歉，数据获取失败...',
                                offset: new window.AMap.Pixel(0, 0)
                            });
                            win.open(this.amap, item.position);
                        });
                    },
                    func = () => {
                        // console.log('v-map.openMarkerInfo.func: ', location);
                        let win =  new window.AMap.InfoWindow({
                            isCustom: true,  //使用自定义窗体
                            infoTitle: item.extData['location'],
                            offset: new window.AMap.Pixel(0, -8)
                        });
                        win.open(this.amap, item.position);
                    };

                this.geocoder.getAddress(item.extData.position, (status, result) => {
                    // console.log('v-map.openMarkerInfo.getAddress: ', status, result);
                    if (status === 'complete' && result.info === 'OK') {
                        let location = result.regeocode.formattedAddress;
                        // console.log('v-map.openMarkerInfo.getAddress: ', location);

                        if (this.openMarkerInfoFunc && typeof this.openMarkerInfoFunc === 'function') {
                            item.extData['location'] = location;
                            cusFunc();
                        } else {
                            func();
                        }

                    }
                });
            },

            async openSimplifierWindow (item) { // 与上面的调用不同的回调函数,表现形式不一样,而且上面的markers窗口实例是数组,也没有保存,所以这里重新写了一个...
                if (!this.SimpleInfoWindow) await this.initSimpleInfoWindow();

                let cusFunc = async () => {
                    console.log('v-map.openSimplifierWindow.cusFunc: ', this.navg.getPosition());
                    let res = await this.openSimplifierWindowFunc();
                    this.simplifierWindowIns =  new this.SimpleInfoWindow({
                        infoTitle: res.infoTitle || 'error',
                        infoBody: res.infoBody || '抱歉，数据获取失败...',
                        offset: new window.AMap.Pixel(0, 0)
                    });
                };
                let defFunc = () => {
                    console.log('v-map.openSimplifierWindow.defFunc: ', this.navg.getPosition());
                    this.simplifierWindowIns =  new window.AMap.InfoWindow({
                        isCustom: true,  //使用自定义窗体
                        infoTitle: 'location',
                        offset: new window.AMap.Pixel(0, 0)
                    });
                    // this.simplifierWindowIns.open(this.amap, this.navg.getPosition());
                };

                console.log('v-map-tms.openSimplifierWindow: ', item);
                // defFunc();
                // this.simplifierWindowIns.open(this.amap, this.navg.getPosition());
                // 如果有自定义函数,调用进行数据格式化,否则调用基本样式展示
                if (this.openSimplifierWindowFunc && typeof this.openSimplifierWindowFunc === 'function') {
                    cusFunc();
                } else {
                    defFunc();
                }

                return Promise.resolve();
            },

            /** ======================================== 动画控制 PathSimplifier ======================================== */

            // 【轨迹】初始化轨迹。 -- Author by Dio Zhu. on 2019.5.29
            async initPathSimplifier () {
                let emptyLineStyle = {
                        lineWidth: 0,
                        fillStyle: null,
                        strokeStyle: null,
                        borderStyle: null
                    },
                    PathSimplifierInsInitFunc = (Func) => {
                        let onLoad = () => {},
                            onError = () => {};
                        if (!this.pathNavigatorStyle) {
                            this.pathNavigatorStyle = { // 巡航器的样式
                                width: 16,
                                height: 32,
                                content: this.PathSimplifier.Render.Canvas.getImageContent('//static.91wuliu.com/plateform/car.png', onLoad, onError),
                                strokeStyle: null,
                                fillStyle: null,
                                pathlinePassedStyle: {
                                    lineWidth: 7,
                                    strokeStyle: '#00ff66'
                                }
                            };
                        }

                        this.pathSimplifierIns = new Func({
                            zIndex: 100,
                            map: this.amap,
                            getPath: function(pathData) {
                                //返回轨迹数据中的节点坐标信息，[AMap.LngLat, AMap.LngLat...] 或者 [[lng|number,lat|number],...]
                                return pathData.path;
                            },
                            renderOptions: { // 轨迹线样式
                                pathLineStyle: {
                                    pathLineStyle: emptyLineStyle,
                                    pathSelectedStyle: emptyLineStyle,
                                    pathLineHoverStyle: emptyLineStyle,
                                    keyPointStyle: emptyLineStyle,
                                    startPointStyle: emptyLineStyle,
                                    endPointStyle: emptyLineStyle,
                                    keyPointHoverStyle: emptyLineStyle,
                                    keyPointOnSelectedPathLineStyle: emptyLineStyle
                                }
                            }
                        });

                        // console.log('this.paths: ', this.paths);
                        // // let p = this.paths.shift();
                        let dat = [{
                            name: '轨迹',
                            path: this.paths.slice(0, 1),
                            // path: [JSON.parse(JSON.stringify(p))],
                            // path: this.paths,
                            // path:  [
                            //     [100.340417, 27.376994],
                            //     [108.426354, 37.827452],
                            //     [113.392174, 31.208439],
                            //     [124.905846, 42.232876]
                            // ],
                            carrierShortName: 'aaa',
                            driverName: 'bbb'
                        }];

                        this.pathSimplifierIns.setData(dat);

                        this.navg = this.pathSimplifierIns.createPathNavigator(0, {
                            loop: false,
                            speed: this.speed,
                            pathNavigatorStyle: this.pathNavigatorStyle
                        });
                        this.navg.start();
                    };
                await this.loadUI();

                return new Promise((resolve, reject) => {
                    window.AMapUI.load(['ui/misc/PathSimplifier'], res => {
                        if (!res.supportCanvas) {
                            console.error('当前环境不支持 Canvas！');
                            return reject();
                        }
                        this.PathSimplifier = res;
                        PathSimplifierInsInitFunc(res);
                        return resolve(res);
                    });
                });
            },
            // 【轨迹】监听this.paths变化时触发。 -- Author by Dio Zhu. on 2019.5.29
            async pathSimplifierChange () {
                // 首次需要初始化
                if (!this.PathSimplifier) await this.initPathSimplifier();

                let cursor = this.navg.getCursor().clone(), // 保存巡航器位置
                    status = this.navg.getNaviStatus(); // 延展路径
                console.log('[v-map] async pathSimplifierChange: ', (this.paths ? this.paths.length : 0), cursor, status);

                let dat = [{
                    name: '轨迹',
                    path: this.paths
                    // path: this.paths.slice(0, 1)
                }];
                this.pathSimplifierIns.setData(dat);

                this.navg = this.pathSimplifierIns.createPathNavigator(0, {
                    loop: false,
                    speed: this.speed,
                    pathNavigatorStyle: this.pathNavigatorStyle
                });
                // this.navg.start();
                if (status !== 'stop') this.navg.start();
                if (cursor.idx >= 0) this.navg.moveToPoint(cursor.idx, cursor.tail);

                this.navg.on('move', async () => {
                    let idx = this.navg.getCursor()['idx'];
                    let infoTitle = '',
                        infoBody = '';

                    if (this.openSimplifierWindowFunc && typeof this.openSimplifierWindowFunc === 'function') {
                        let res = await this.openSimplifierWindowFunc(idx);
                        infoTitle = res.infoTitle;
                        infoBody = res.infoBody;
                    }
                    if (!this.simplifierWindowIns) {
                        this.openSimplifierWindow(idx).then(() => {
                            this.simplifierWindowIns.open(this.amap, this.navg.getPosition());
                        });
                    } else {
                        this.simplifierWindowIns.setInfoTitle(infoTitle);
                        this.simplifierWindowIns.setInfoBody(infoBody);
                        this.simplifierWindowIns.setPosition(this.navg.getPosition());
                    }
                });
            },

            setNavgSpeed () { // 修改轨迹动画的速度
                if (this.navg && this.navg.setSpeed) this.navg.setSpeed(this.speed);
            },
            navgMoveTo (pointIndex) { // 轨迹移动: 移动到对应的索引位置
                if (!this.navg) return;
                if (pointIndex < 0) pointIndex = 0;
                if (pointIndex > this.paths.length) pointIndex = this.paths.length;
                this.navg.pause();
                this.navg.moveToPoint(pointIndex);
                this.navg.resume();
            },

            // 动画控制
            navgPlay () {
                if (this.navg) this.navg.start();
            },
            navgStop () {
                if (this.navg) this.navg.stop();
            },
            navgPause () {
                if (this.navg) this.navg.pause();
            },
            navgResume () {
                if (this.navg) this.navg.resume();
            },
            navgPrev () {
                if (!this.navg) return;
                let idx = this.navg.getCursor().idx - 30;
                this.navgMoveTo(idx);
            },
            navgNext () {
                if (!this.navg) return;
                let idx = this.navg.getCursor().idx + 30;
                this.navgMoveTo(idx);
            },

            /** ======================================== Geocoder ======================================== */

            // 实例化AMap的Geocoder
            initGeocoder () {
                return new Promise(resolve => {
                    window.AMap.service('AMap.Geocoder', () => {
                        this.geocoder = new window.AMap.Geocoder({
                            radius: 0,
                            extensions: 'all'
                        });
                        // this.geocoderPromise(position, cb);
                        resolve();
                    });
                });
            },

            /** ======================================== 标记 markers ======================================== */

            initMarkers () { // 初始化点标记
                if (!this.markers || !this.markers.length) return;
                this.markers.forEach((item, i) => { // markers为了兼顾一个或者多个点的情况，所以为数组
                    if (item.position[0] >= -180 && item.position[0] <= 180 && item.position[1] >= -90 && item.position[1] <= 90) { // 判断经纬度是否合法，不合法的经纬度会引起报错
                        let opts = Object.assign({
                            map: this.amap,
                            offset: new window.AMap.Pixel(0, 0),
                            // position: item.position,
                            title: item.p || '',
                            extData: item
                        }, defaultMaker, JSON.parse(JSON.stringify(item)));//
                        // if (item.icon) opts.icon = item.icon;
                        // console.log('---> ', opts);
                        let marker = this.createMarker(opts);
                        if (this.backAddr) { // 如果需要回传地址
                            this.getAddr(item.position, (regeocode) => { // 调用地址解析
                                let addressObj = this.dealAddress(regeocode);
                                if (item.label) { // 如果需要标注位置信息（label)
                                    this.setLabel(item.label, addressObj.shortAddress, marker);
                                }
                                this.$emit('getAddress', { // 触发回调传出高德地址
                                    address: addressObj.formateAddr,
                                    shortAddress: addressObj.shortAddress,
                                    index: i
                                });
                            });
                        }
                        if (this.openMarkerInfoFunc && typeof this.openMarkerInfoFunc === 'function') { // 如果需要弹出窗口。 Author by Dio Zhu. on 2019.5.28
                            window.AMap.event.addListener(marker, 'click', () => { this.openMarkerInfo(opts) });
                        }
                        this.mapMarker.push(marker); // 将实例化后的marker存入数组，以便后续进行相应操作，比如清空操作，改变maker标注信息等

                        // 点聚合
                        if (this.clusterEnable) {
                            if (!this.cluster) {
                                // this.cluster = new window.AMap.MarkerClusterer(this.amap, this.mapMarker, { gridSize: 60, maxZoom: 14, minCLusterSize: 8 });
                                this.amap.plugin(["AMap.MarkerClusterer"], () => {
                                    this.cluster = new window.AMap.MarkerClusterer(this.amap, this.mapMarker, { gridSize: 60, maxZoom: 14, minCLusterSize: 8 });
                                });
                            } else {
                                this.cluster.setMarkers(this.mapMarker);
                            }
                        }
                    } else {
                        // this.$toast('位置信息错误！');
                        console.warn('坐标错误,', '经度：' + item.position[0], '纬度：' + item.position[1]);
                    }
                });
            },
            createMarker (item) {
                return new window.AMap.Marker(item);
            },
            setFitView () {
                this.amap.setFitView();
            },
            removeMarkers () {
                if (this.mapMarker.length <= 0) return;
                this.amap.remove(this.mapMarker);
                this.mapMarker = [];
            },
            setZoomAndCenter (pos) {
                this.amap.setZoomAndCenter(this.zoom, pos);
            },
            dealMap () {
                if (this.markers.length === 0) {
                    // this.setZoomAndCenter(defaultMaker.position);
                    return;
                } else {
                    this.setZoomAndCenter(this.markers[0].position);
                    this.initMarkers();
                    if (this.markers.length > 1) {
                        this.setFitView();
                    }
                }
            },
            getAddr (position, cb) {
                if (!this.geocoder) { // 如果地理解析Geocoder组件未实例化，则去实例化
                    this.initGeocoder();
                } else {
                    this.geocoderAddress(position, cb);
                }
            }
//             geocoderAddress (position, cb) {
//                 this.geocoder.getAddress(position, (status, result) => { // 调用高德api函数getAddress
//                     if (status === 'complete' && result.info === 'OK') {
//                         cb(result.regeocode);
//                     } else {
//                         cb('未能获取到地址');
//                     }
//                 });
//             },
//             dealAddress (regeocode) {
//                 let shortAddress = '';
//                 let formateAddr = ''; // eslint-disable-line
//                 if (typeof (regeocode) === 'string') { // '未能获取到地址'
//                     shortAddress = regeocode;
//                 } else {
//                     let addressComponent = regeocode.addressComponent;
//                     if (regeocode.pois.length > 0) { // 如果存在热点位置，则取出第一个热点位置的地址（address）、短地址（name)
//                         formateAddr = regeocode.pois[0].address;
//                         shortAddress = regeocode.pois[0].name;
//                     } else { // 如果没有热点位置，则采用高德解析后的完整地址（formattedAddress）
//                         formateAddr = regeocode.formattedAddress;
//                         shortAddress = regeocode.formattedAddress.replace(addressComponent.province + addressComponent.district, ''); // 人为去除省市区，制作短地址，这种方式不太好
//                     }
//                 }
//                 return { // 触发回调传出高德地址
//                     address: formateAddr,
//                     shortAddress: shortAddress
//                 };
//             },
//             setLabel (label, showAddress, marker) {
//                 let makerDom = label.content;
//                 makerDom = label.content.replace(/<em replace>.*<\/em>/g, showAddress); // 对含有‘<em replace>.*<\/em>’的内容进行替换，如果没有则不替换
//                 marker.setLabel({ // 调用高德api，maker的setLabel函数
//                     content: makerDom,
//                     offset: new window.AMap.Pixel(0, 0) // 相对于基点的偏移位置
//                 });
//             },
//             onMoveEnd () { // 拖拽地图
//                 let lnglat = this.amap.getCenter();
//                 console.log('v-map.onMoveEnd: ', lnglat);
// //                this.amapPlaceSearch.searchNearBy('', lnglat, 200, (status, result) => {
// //                    console.log('v-map.onDragEnd: ', status, result);
// //                });
//             },
//             searchNearBy ({keywords = '', refreshTag = false} = {}) {
//                 console.log(`v-map.searchNearBy: ${keywords}, ${refreshTag}, ${this.page}, ${this.placeSearch}, ${this.hasMore}`);
//                 if (!this.placeSearch || !this.hasMore) return Promise.reject('placeSearch false');
//
//                 if (refreshTag) this.page = 1; // 如果需要刷新，则page置为1
//                 this.placeSearcher.setPageIndex(this.page);
//                 try {
//                     return this.placeSearcher.searchNearBy(keywords, [this.lng, this.lat], this.radius, (status, result) => { // 以[this.lng, this.lat]为中心，搜寻半径为radius的keywords相关内容
// //                        return new Promise((resolve, reject) => {
//                         console.log('v-map.searchNearBy.response: ', status, result);
//                         if (status === 'complete' && result.info === 'OK') { // 搜索完成
//                             this.page += 1;
//
//                             console.log('v-map.searchNearBy: ', status, result);
// //                            this.locations = result.poiList.pois;
// //                            this.locations = this.locations.concat(result.poiList.pois);
//                             this.$emit('locations-change', {data: result.poiList.pois, refreshTag: refreshTag}); // 触发父级locations-change事件，传出搜索数据
//
//                             if (result.poiList.pois.length < this.pageNum) this.hasMore = false; // 如果搜索出的结果小于期望数量，则表示再往后已经没有数据了
// //                            return () => resolve(result);
//                         } else {
//                             this.hasMore = false; // 如果没有搜索结果，直接赋值标志变量false
//                         }
// //                        return () => reject('response empty~');
// //                        });
//                     });
//                 } catch (e) {
//                     console.error('v-map.searchNearBy.error: ', e);
//                     return Promise.reject('v-map.searchNearBy.error: ', e);
//                 }
//             },
//             markerBack () {
//                 this.changeMarker(defaultMaker.position);
//             },
//             changeMarker (pos) {
//                 console.log('v-map.changeMarker: ', pos, this.mapMarker);
//                 if (!this.mapMarker || this.mapMarker.length < 1) return;
//                 let marker = this.mapMarker[0];
//                 this.amap.panTo(pos);// 地图平移到指定中心
//                 marker.setPosition(pos); // 添加marker
//             },

        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-map {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 0;
        /* transform: translateZ(1px); */
        /* overflow: hidden; */
        /* backface-visibility: hidden; */
        /* perspective:1000px; */
        /* canvas{
            backface-visibility: hidden;
            perspective:1000;
        } */
        /* border: #DDDEE3 1px solid; */
        transform: translate3d(0, 0, 0); // 防止滚动时重绘造成的卡顿白屏
    }
    /* .v-map object{
        z-index:0 !important;
    } */
    .v-map__img {
        width: 100%;
        height: 100%;
        z-index: 8;
        position: absolute;
        top:0;
        left: 0;
    }
    .map-loading{
        width: pxTorem(30px);
        height: 100%;
        margin: 0 auto;
        text-align: center;
        /*background: url('../../static/images/loading.jpg') no-repeat center;*/
        background: url('//static.91wuliu.com/loading.jpg') no-repeat center;
        background-size: pxTorem(30px) auto;
    }
    .v-map__location {
        position: absolute;
        width: 100%;
        height: pxTorem(30px);
        font-size: pxTorem(14px);
        line-height: pxTorem(30px);
        /*background: url(../assets/download-bg.png);*/
        background: url('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        color: #FFF;
        z-index: 9;
        bottom: 0;
        @include nowarp(pxTorem(14px));
        padding-left: pxTorem(15px);
        padding-right: pxTorem(50px);
        @include opacity(.8);

        .icon {
            &:before {
                position: absolute;
                right: pxTorem(10px);
                font-size: pxTorem(20px);
                font-weight: bold;
                top: 50%;
                margin-top: pxTorem(-10px);
            }
        }
    }
    .amap-marker .marker-default {
        position: absolute;
        /* width: pxTorem(18px);
        height: pxTorem(36px); */
        width: pxTorem(36px);
        height: pxTorem(61px);
        font-size: pxTorem(12px);
        color: #e90000;
        /*background: url('../../static/images/mark.png') no-repeat;*/
        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAA/CAYAAACM5Lr9AAAFkklEQVR42s3VaWxUVRjG8ddiEKPRxAQTCVSWLnZaWmjpTgulpYUBExP9Agou4IKAogUKAgItlNJCgUIXINFPfsFoDCjibkQRI0QIICAQWUpZugKtpcv0+DxyYqaTe2/vTLf58Etu7znnPf+0k44opQw5i5qsjIFs2APHoBZatFq+02vZeq94yyKs0dOjsAzOTCtuVtNKWtX0UpeaXqHU07tgt4ZnvuMa93Avz/CsniE2WIQV3iEaCDnQ8F/MTgZ4h2d4ljNgmZ4pFszDpmIRIuFP57YWDMcFu7uHMziLMyEKxJBl2MbbM6DZub2NQ3sUZ3K2vkMMGIdNKbi1ADqcZe1q2i7VKzibd8BCEE8GUQ3PQ4ez3KWcGNCbeAfv0neKm85hWRvqo+Hu1LJ2HuwTvAt3tkAciKbDIDO/7iE4l7X9rpqCA30pa3uLwt3nYRAIuIfV5mcWN6msnapf8G405IGQMGry+prB0DiloqPfwng3G3SLDltXnTt5S6PK3NnRr9jAFhDJyLsZAJcz8SGcjOr+xAa0XGGTpOfeSMrYUKcyKlx+gS1oSkbY9VXpm2+rjHKXX2ALm2TS2qq96duaVHp5u19gC5skbc3V05N23FWT8NIfsIVNkra6siGttE2llbX7h9JWhaZ6mfj+lfaJZW3Kn6DJJRNWXWqbgN+Y39jRqtDUKKkrL15PxfdjammrfyhpVmiqlNQVfx9KwX/cFJT6A7awSVLeu1CeUlinxu9o8QsphbUKTWUyfvn5Wcm511QSXvoDtrBJkpedewzaE/E58wdsYZMopSQ55+z+pKK6fo9KKqpXaDkAIgxLWnomK3H1JZVQ0tyv2ICW6XAvLHHJ6QD4K6GgRsVjQ3/g3WzQLffCKGHJqfHgisOXaNy2f/oU7+TdukGIUW5xJ0vic6+oWGzsS7yTd4NoncPiF594GC7FFlSrcVub+gTv4p36btE6h1Fc9nFn7IpzKmZrY5/gXbwTxI0O8xD77rGPYtZeVtE42Jt4B+8C8WAcNu6dPwZDzVh8PYzdcqdXcDbvgMdBPDHEOG7R0Xkxqy6oKAzpDZzNO0AMmIfFvH1kABwZk1epIotv9yjOxOyj+g4xYB4W/dbvlAAdozGsJ3Gmni0mzMPGLvyN6IMo/NojNt/qEZyFmR+CWLAIW3CYaDDUR+D/TTgGdwdncJaeKRbMw8bM/9XdosjlZ5VjU0O3cAZngXTBPCzqzV/cPQAXHeuqVBgu8IVj/TXFGXqWdME8LHLez55mRSw9qUI31fuEZzFjNogNFmFvHPQUACfC8IUbUlTvlbDcSsWzeobYYB42+vWfjDwbnn3c6zCewdnnQGwyD4t47UcjAXA2JO+qCi6ss4V7eUafFZuswn4wM8ex+LgKwqV2cC/OzAXxgnlY+KvfmxkIVaPyr6tRhbWWuId79RnxgnmYY+53VlaHLj2lRm6stRSSc0ph7xoQL1mEzfnWyhPQNrKgGgE1hrjGPTAExEvmYWGvfNOVPUErz6vhiDDCNez5GMQHVmFfd2Vq6MLD6smCGkNc4x4QH5iHPfXyV125H64NX1eFkOpO+I5reo/4wDws9KUDdhSPxFdNIGLc8R3XQHxkFfalHYnB8w6qYRuqO+E7roH4yDws5MX9dtwHlYF5lQi6qYjPfKfXxEcWYbO/sKtsBP50QxFFI/D/De8qQLrBPCwYizY9M2r+of/D+Mx3ID6zDJv1uaVwGfAIBDqGJsbhZ9eQ/BuK+OwYlhzPNe7hXh9Yhe0zwqBB4IAYouCZn1wIXH5GEZ/d1sjBMzzrBfOwoBf2GWFYBMS4C03JWRA087OaoBmf3uCz5zrP8Kx9lmF7jXiE2RbBs95ghB0MIo8/pS0OeJAzvOBLmKY//BAGURBN+jmMa3qPkLdh/wKOL8SpLbnYFgAAAABJRU5ErkJggg==') no-repeat;
        background-size: 100%;
        cursor: pointer;
        text-align:center;
        color:#fff;
        left: pxTorem(-9px);
        top:pxTorem(-8px);
        transform: translateZ(1px);
    }
    .amap-logo{
        display: none !important;
    }
    .amap-copyright{
        display: none !important;
    }
    .amap-marker-label{
        background-color: transparent;
        border:none;
    }

    .v-map__local { // 点击回默认点的悬浮按钮
        position: absolute;
        z-index: 99;
        left: pxTorem(10px);
        bottom: pxTorem(10px);
        width: pxTorem(30px);
        height: pxTorem(30px);
        border-radius: pxTorem(3px);
        border: #898989 1px solid;
        background: rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;

        > div {
            width: pxTorem(18px);
            height: pxTorem(18px);
            background: #FFF;
            border-radius: 50%;
            border: #898989 pxTorem(1px) solid;

            &::after {
                content: ' ';
                position: absolute;
                width: pxTorem(8px);
                height: pxTorem(8px);
                background: #898989;
                border-radius: 50%;
                left: pxTorem(10.5px);
                top: pxTorem(10.5px);
            }
        }
    }
</style>
