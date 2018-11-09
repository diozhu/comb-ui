<template>
    <div class="v-map" :id="'vAMap_' + _uid">
        <div v-if="!mapReady" class="map-loading"></div>
        <div class="v-map__img" :style="bgStyle" v-if="img"></div>
        <div class="v-map__location" v-if="location">{{location}}<i class="icon icon-arror-r"></i></div>
        <div class="v-map__local" @click="markerBack"><div></div></div>
    </div>
</template>
<script type="text/ecmascript-6">
    import bus from '../vendor/eventbus.js';
    import CONFIG from '../config';

    let defaultMaker = {
        position: [116.458076, 39.996648],
        draggable: false,
        isPanTo: true,
        content: '<div class="marker-default"></div>'
    };
    export default {
        name: 'v-map',
        props: {
            keywords: {
                type: String,
                default: ''
            },
            lng: {
                type: String,
                default: '116.4514501384251588'
            },
            lat: {
                type: String,
                default: '39.9951573546932124'
            },
            img: String,         // 图片地址
            location: String,    // 显示地址
            placeSearch: {       // 是否启用地址搜索
                type: Boolean,
                default: false
            },
            radius: {            // 默认半径，搜索时使用
                type: Number,
                default: 500
            },
            locations: {         // 地址列表
                type: Array,
                default: () => { return []; }
            },
            dragEnable: {
                type: Boolean,
                default: false
            },
            markers: {// 位置点数组:[{lng: '', lat: '', icon: {}}]
                type: Array,
                default: function () { return []; }
            },
            zoom: {
                type: Number,
                default: 17
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
                pageNum: CONFIG.LIMIT,  // 每页记录数
                hasMore: true
            };
        },

        watch: {
            markers (makers) {
                this.removeMarkers();
                this.amap && this.dealMap();
            },

            keywords (val) {
//                if (val === '' || /[^\u0000-\u00FF]/.test(val)) { // 检索中文
                if (val === '' || /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(val)) { // 检索中文
                    this.hasMore = true;
                    this.searchNearBy({keywords: val, refreshTag: true});
                }
            }
        },
        mounted () {
            console.log(`v-map.${this._uid}.mounted: `);

            bus.$on('v-map.changeMarker', this.changeMarker); // 监听切换标记

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
                if (window.AMap) {
                    return Promise.resolve();
                }
                console.log(`v-map.${this._uid}.load: `);
                let script = this.createScript();
                // document.body.appendChild(script);
                document.head.appendChild(script);
                return new Promise((resolve, reject) => {
                    window['mapLoaded'] = () => resolve();
                    // script.onload = () => resolve();
                    script.onerror = error => reject(error);
                });
            },
            createScript () {
                this.$root.amapImportTag = true; // 全局的加载标识
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = true;
                script.defer = true;
                script.id = 'amap';
                script.src = 'http://webapi.amap.com/maps?v=' + CONFIG.AMAP_VERSION + '&key=' + CONFIG.AMAP_KEY + '&callback=mapLoaded';
                return script;
            },
            init () {
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

                if (this.placeSearch) {
//                    window.AMap.event.addDomListener('dragMap', 'change', this.onModeChange);
                    this.amap.on('moveend', this.onMoveEnd);
                    window.AMap.service('AMap.PlaceSearch', () => {
                        this.placeSearcher = new window.AMap.PlaceSearch({ // 构造地点查询类
                            pageSize: this.pageNum,
                            type: '汽车服务|汽车销售|汽车维修|摩托车服务|餐饮服务|购物服务|生活服务|体育休闲服务|医疗保健服务|住宿服务|风景名胜|商务住宅|政府机构及社会团体|科教文化服务|交通设施服务|金融保险服务|公司企业|道路附属设施|地名地址信息|公共设施',
                            pageIndex: this.page,
//                            city: '010', // 城市
//                            map: this.amap,
                            showCover: false
                        });

//                        this.placeSearcher.searchNearBy('', [this.lng, this.lat], 200, (status, result) => {
//                            if (status === 'complete' && result.info === 'OK') {
//                                console.log('v-map.onDragEnd: ', status, result);
// //                            this.locations = result.poiList.pois;
//                                this.$emit('locations-change', result.poiList.pois);
//                            }
//                        });
//                        this.$el['@@SearchNearBy'] = this.searchNearBy.bind(this);
//                        bus.$emit('v-scroll.getList'); // 初始化完成后，触发滚动条拉取数据
                        this.searchNearBy();
                    });
                }
            },
            initGeocoder (position, cb) { // 实例化AMap的Geocoder
                window.AMap.service('AMap.Geocoder', () => {
                    this.geocoder = new window.AMap.Geocoder({
                        radius: 0,
                        extensions: 'all'
                    });
                    this.geocoderPromise(position, cb);
                });
            },
            initMarkers () {
                if (this.markers.length <= 0) return;
                this.markers.forEach((item, i) => { // markers为了兼顾一个或者多个点的情况，所以为数组
                    if (item.position[0] >= -180 && item.position[0] <= 180 && item.position[1] >= -90 && item.position[1] <= 90) { // 判断经纬度是否合法，不合法的经纬度会引起报错
                        let opts = Object.assign({
                            map: this.amap,
                            offset: new window.AMap.Pixel(0, 0)
                        }, defaultMaker, item);//
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
                        };
                        this.mapMarker.push(marker); // 将实例化后的marker存入数组，以便后续进行相应操作，比如清空操作，改变maker标注信息等
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
                    this.initGeocoder(position, cb);
                } else {
                    this.geocoderAddress(position, cb);
                }
            },
            geocoderAddress (position, cb) {
                this.geocoder.getAddress(position, (status, result) => { // 调用高德api函数getAddress
                    if (status === 'complete' && result.info === 'OK') {
                        cb(result.regeocode);
                    } else {
                        cb('未能获取到地址');
                    }
                });
            },
            dealAddress (regeocode) {
                let shortAddress = '';
                let formateAddr = ''; // eslint-disable-line
                if (typeof (regeocode) === 'string') { // '未能获取到地址'
                    shortAddress = regeocode;
                } else {
                    let addressComponent = regeocode.addressComponent;
                    if (regeocode.pois.length > 0) { // 如果存在热点位置，则取出第一个热点位置的地址（address）、短地址（name)
                        formateAddr = regeocode.pois[0].address;
                        shortAddress = regeocode.pois[0].name;
                    } else { // 如果没有热点位置，则采用高德解析后的完整地址（formattedAddress）
                        formateAddr = regeocode.formattedAddress;
                        shortAddress = regeocode.formattedAddress.replace(addressComponent.province + addressComponent.district, ''); // 人为去除省市区，制作短地址，这种方式不太好
                    }
                }
                return { // 触发回调传出高德地址
                    address: formateAddr,
                    shortAddress: shortAddress
                };
            },
            setLabel (label, showAddress, marker) {
                let makerDom = label.content;
                makerDom = label.content.replace(/<em replace>.*<\/em>/g, showAddress); // 对含有‘<em replace>.*<\/em>’的内容进行替换，如果没有则不替换
                marker.setLabel({ // 调用高德api，maker的setLabel函数
                    content: makerDom,
                    offset: new window.AMap.Pixel(0, 0) // 相对于基点的偏移位置
                });
            },
            onMoveEnd (e) { // 拖拽地图
                let lnglat = this.amap.getCenter();
                console.log('v-map.onMoveEnd: ', lnglat);
//                this.amapPlaceSearch.searchNearBy('', lnglat, 200, (status, result) => {
//                    console.log('v-map.onDragEnd: ', status, result);
//                });
            },
            searchNearBy ({keywords = '', refreshTag = false} = {}) {
                console.log(`v-map.searchNearBy: ${keywords}, ${refreshTag}, ${this.page}, ${this.placeSearch}, ${this.hasMore}`);
                if (!this.placeSearch || !this.hasMore) return Promise.reject('placeSearch false');

                if (refreshTag) this.page = 1; // 如果需要刷新，则page置为1
                this.placeSearcher.setPageIndex(this.page);
                try {
                    return this.placeSearcher.searchNearBy(keywords, [this.lng, this.lat], this.radius, (status, result) => { // 以[this.lng, this.lat]为中心，搜寻半径为radius的keywords相关内容
//                        return new Promise((resolve, reject) => {
                        console.log('v-map.searchNearBy.response: ', status, result);
                        if (status === 'complete' && result.info === 'OK') { // 搜索完成
                            this.page += 1;

                            console.log('v-map.searchNearBy: ', status, result);
//                            this.locations = result.poiList.pois;
//                            this.locations = this.locations.concat(result.poiList.pois);
                            this.$emit('locations-change', {data: result.poiList.pois, refreshTag: refreshTag}); // 触发父级locations-change事件，传出搜索数据

                            if (result.poiList.pois.length < this.pageNum) this.hasMore = false; // 如果搜索出的结果小于期望数量，则表示再往后已经没有数据了
//                            return () => resolve(result);
                        } else {
                            this.hasMore = false; // 如果没有搜索结果，直接赋值标志变量false
                        }
//                        return () => reject('response empty~');
//                        });
                    });
                } catch (e) {
                    console.error('v-map.searchNearBy.error: ', e);
                    return Promise.reject('v-map.searchNearBy.error: ', e);
                }
            },
            markerBack () {
                this.changeMarker(defaultMaker.position);
            },
            changeMarker (pos) {
                console.log('v-map.changeMarker: ', pos, this.mapMarker);
                if (!this.mapMarker || this.mapMarker.length < 1) return;
                let marker = this.mapMarker[0];
                this.amap.panTo(pos);// 地图平移到指定中心
                marker.setPosition(pos); // 添加marker
            }
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
        background: url('../../static/images/loading.jpg') no-repeat center;
        background-size: pxTorem(30px) auto;
    }
    .v-map__location {
        position: absolute;
        width: 100%;
        height: pxTorem(30px);
        font-size: pxTorem(14px);
        line-height: pxTorem(30px);
        background: url(../assets/download-bg.png);
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
        background: url('../../static/images/mark.png') no-repeat;
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
