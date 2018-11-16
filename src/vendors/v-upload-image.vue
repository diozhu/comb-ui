<template>
    <div>
    <!--头像上传-->
    <div v-if="mod === 'avatar'" class="v-upload-image avatar">
        <div class="v-upload-image__frm" @click="handleTap">
            <i v-if='currentValue[0] && currentValue[0].loading' class="icon loading icon-loading"></i>
            <!--<img v-if="currentValue[0] && currentValue[0].url" :src="currentValue[0].thumb || currentValue[0].url">-->
            <v-image v-if="currentValue[0] && currentValue[0].url" :value="{url: currentValue[0].thumb || currentValue[0].url, width: 160, height: 160}"></v-image>
            <i v-if="!currentValue[0]" class="icon icon-camera"></i>
        </div>
        <div class="v-upload-image__desc">
            <slot></slot>
        </div>
        <v-popup v-model="popupTag"
                 position="middle">
            <div class="avatar-demo">
                <i class="icon icon-error" @click="popupTag = false"></i>
                <!--<img :src="usercenter.bg" @click.stop=""/>-->
                <v-image @click.stop :value="{url: usercenter.bg, classes: 'popup-image'}"></v-image>
                <!--微信环境显示按钮-->
                <button v-if="isWechat" @click="wxChooseImage" class="wx_upload_button" :disabled="disabled">上传图片</button>
                <!--h5环境显示input-->
                <button v-else class="wx_upload_button">
                    上传图片
                    <input type="file" @change="h5ChooseImage"  accept="image/*" class="wx_input" :disabled="disabled">
                </button>
            </div>
        </v-popup>
    </div>
    <!--多图上传-->
    <div v-if=" mod === 'multi'" class="v-upload-image multi">
        <div v-for="(item, index) in currentValue" :key="index">
            <div :class="['frm', {loading: item.loading, fadeIn: !item.loading}]">
                <!--<img v-if="item.url || item.thumb" :src="item.thumb || item.url"  @click="handleTapPreview(item, index)" />-->
                <v-image :value="{url: item.thumb || item.url}" v-if="item.url || item.thumb" @click="handleTapPreview(item, index)"></v-image>
                <i v-if="item.loading" class="icon loading icon-loading"></i>
                <i v-if="!item.loading && !disabled" class="icon icon-del" @click="handleTapDel(index)"></i>
            </div>
        </div>
        <!--<div class="frm btn" @click="h5ChooseImage">-->
            <!--<i class="icon icon-add"></i>-->
        <!--</div>-->
        <!--微信环境显示按钮-->
        <button v-if="isWechat" :disabled="disabled" v-show="currentValue.length < max" @click="wxChooseImage" class="wx_upload_button wechat frm"><i class="icon icon-camera-fill"></i></button>
        <!--h5环境显示input-->
        <button v-else v-show="currentValue.length < max" class="wx_upload_button wechat frm">
            <i class="icon icon-camera-fill"></i>
            <input type="file" @change="h5ChooseImage"  accept="image/*" class="wx_input" :disabled="disabled">
        </button>
    </div>
    </div>
</template>

<script>
    import wx from 'weixin-js-sdk';
    // import Popup from '../js/utils/popup';
    import vPopup from './v-popup';
    import * as api from '~@/js/core/api.js';
    // import * as wechatApi from '../js/utils/wechat-api.js'; // 引入wechat-api，需要组件的引用页面混入m-wechat-api.js做微信jssdk的config！
    import vueCoreImageUpload from 'vue-core-image-upload';
    import vSpinner from './v-spinner';
    import trans from '../js/core/trans.js';
    import * as utils from '../js/utils/utils.js';
    import CONFIG from '~@/config.js';
    import {usercenter} from '~@/image';
    import {path} from '~@/js/core/api';

    /**
     * 上传图片组件，依赖于微信jssdk，需要组件的引用页面混入m-wechat-api.js做微信jssdk的config！
     * 如果在微信环境，使用jssdk；
     * 如果移动环境，
     *              -- Author by Dio Zhu. on 2017.11.16
     * 不用微信jssdk了，微信选择图片后，转换base64的接口wx.getLocalImgData仅在 iOS WKWebview 下提供
     * 现使用h5的方式，引用组件：vue-core-image-upload实现
     *              -- Author by Dio Zhu. on 2017.11.16
     */
    export default {
        // mixins: [ Popup ],

        components: { 'v-spinner': vSpinner, vueCoreImageUpload, vPopup },
        props: {
            value: {
                type: Array,
                default: () => [],
                twoWay: true
            },
            mod: {      // 上传模式：avatar：头像传单图、multi：普通多图
                type: String,
                default: ''
            },
            max: {
                type: String,
                default: '1'
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                usercenter,
                uploadUrl: CONFIG.URL + path + '/wap/student/upload_image',
                data: {},
                currentValue: this.value,
                isWechat: true,
                uploadedStatus: true, // 上传图片的状态，可据此改变上传按钮的状态
                popupTag: false, // 头像规格展示标识
                localIds: []
            };
        },
        activated () {
            this.popupTag = false;
        },
        computed: {
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.$emit('input', val);
            },
            loadingStatus (val) {
                this.$emit('handle-uploaded-status', val);
            },
//            currentAvatar (val) {
//                this.$emit('handle-avatar-change', val);
//            },
            /**
             * 捕获图片上传状态，可根据此标识做提交按钮的限定等动作
             * 父页面可在组件调用时指定回调函数： @handle-uploaded-status="handleUploadedStatus"
             *              -- Author by Dio Zhu. on 2017.2.28
             */
            uploadedStatus (val) {
                this.$emit('handle-uploaded-status', val);
            }
        },
        mounted () {
            this.init();
        },
        methods: {
            init () {
                this.currentValue = this.value;
                this.isWechat = true;
                this.uploadedStatus = true; // 上传图片的状态，可据此改变上传按钮的状态
                this.popupTag = false; // 头像规格展示标识
                this.localIds = [];
                if (!utils.isWechat()) this.isWechat = false;
                else this.isWechat = true;
            },
            handleTap () {
                this.popupTag = true;
            },
            handleTapDel (idx) { // 点击删除
                this.currentValue.splice(idx, 1);
            },
            handleClick () {
                console.log('v-upload-image.handleClick: ');
                this.popupTag = true;
            },
            handleTapPreview (item, idx) { // 点击大图预览
               // const urls = this.value.map(value => value.url);
                let imgList = [];
                if (this.currentValue.length > 0) {
                    this.currentValue.forEach(element => {
                        let imgObj = {
                            'url': element.url,
                            'width': element.width,
                            'height': element.height
                        };
                        imgList.push(imgObj);
                        // console.log('---------------7--------------', element);
                    });
                }
                this.$root.swipes = {list: imgList, idx: idx}; // swipe
                this.$root.img = imgList; // viewer
                this.$router.push({name: 'viewer', query: {idx: idx}});
                return;
            },
            h5ChooseImage (e) {
            // window.alert(utils.getSessionStorage().get('token'));
                this.popupTag = false;
                // loading状态值
                if (this.mod === 'avatar') {
                    this.currentValue = [{loading: true}];
//                    if (this.currentValue.length === 0) {
//                        this.currentValue = [{loading: true}];
//                    } else {
//                          this.currentValue = [];
//                          this.currentValue = [{loading: true}];
//                        this.$set(this.currentValue[0], 'loading', true);
//                    }
//                    this.currentValue = [{loading: true}];
                } else {
                    console.log('图片的值是this.value:', this.currentValue);
                    this.currentValue.push({loading: true});
                }
                let _self = this;
                try {
                    if (e.target) {
                        this.uploadedStatus = false;
                        var fileInput = e.target;
                        console.log(fileInput.files[0]);
                        var data = new global.FormData();
                        data.append(this.fileName, fileInput.files[0]);
                        var xhr = new window.XMLHttpRequest();
                        xhr.open('post', this.uploadUrl);
                        xhr.setRequestHeader('access-token', utils.getSessionStorage().get('token'));
                        xhr.responseType = 'json';
                        xhr.send(data);
                        xhr.onload = function (e) {
                            if (xhr.status === 200) {
                                if (xhr.response.errcode === 0) {
                              //                    请求返回后不显示默认图片；
                                    _self.uploadedStatus = true;
//                                    _self.currentValue = xhr.response.data.url + '!/both/160x160';
                                    if (Array.isArray(xhr.response.data)) {
                                        if (xhr && xhr.response.data && xhr.response.data.length) {
                                            xhr.response.data.forEach((v, i) => {
                                                if (_self.mod === 'avatar') {
                                                    // _self.currentValue = [{url: xhr.response.data[i].url + '/both/160x160', loading: false, imgId: xhr.response.data[i].img_id}];
                                                    _self.currentValue = [{url: xhr.response.data[i].url, loading: false, imgId: xhr.response.data[i].img_id}];
                                                } else {
                                                    _self.currentValue.push({url: xhr.response.data[i].url, loading: false, imgId: xhr.response.data[i].img_id});
                                                }
                                            });
                                        }
                                    } else {
                                        if (_self.mod === 'avatar') {
                                            console.log('fffdfdfdf123123');
                                            _self.currentValue = [{
                                                // url: utils.thumb(xhr.response.data.url, {width: 160, height: 160}),
                                                url: xhr.response.data.url,
                                                loading: false,
                                                imgId: xhr.response.data.img_id,
                                                width: xhr.response.data.width,
                                                height: xhr.response.data.height
                                            }];
                                        } else {
                                            _self.currentValue.forEach((v, i) => {
                                                if (v.loading) {
                                                    _self.$set(_self.currentValue, i, {
                                                        // url: utils.thumb(xhr.response.data.url, {width: 160, height: 160}),
                                                        url: xhr.response.data.url,
                                                        loading: false,
                                                        imgId: xhr.response.data.img_id,
                                                        width: xhr.response.data.width,
                                                        height: xhr.response.data.height
                                                    });
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    _self.uploadedStatus = true;
                                    _self.$toast(trans(xhr.response.errcode));
                                }
                                _self.popupTag = false;
//                                document.querySelector('.v-modal') && document.querySelector('.v-modal').parentNode.removeChild(document.querySelector('.v-modal'));
                            }
                        };
                    }
                } catch (e) {
                    this.popupTag = false;
                    this.uploadedStatus = true;
//                    document.querySelector('.v-modal') && document.querySelector('.v-modal').parentNode.removeChild(document.querySelector('.v-modal'));
                    console.log('uploadImg', e);
                    this.$toast(trans(e.errcode));
                }
            },
            wxChooseImage () { // 微信jssdk上传图片
                this.popupTag = false;
                let len = this.max - this.value.length;
                if (this.mod !== 'avatar' && len <= 0) return; // 多图上传，超过数量直接返回
                len = this.mod !== 'avatar' ? len : 1;
//                document.querySelector('.v-modal') && document.querySelector('.v-modal').parentNode.removeChild(document.querySelector('.v-modal'));
                // return wechatApi.chooseImage().then(res => {
                //     // this.$toast(res[0]);
                //     console.log('v-upload-image.handleClick.chooseImage.success: ', res[0]);
                //     // return wechatApi.getLocalImgData({localId: res[0]});
                //     return wechatApi.uploadImage({localId: res[0]});
                //     // }).then(rtn => {
                //     //     console.log('v-upload-image.handleClick.uploadImage.success: ', rtn);
                //     //     this.$set(this.currentValue, 'url', rtn);
                //     // }).then(rtn => {
                //     //     // this.$toast(rtn);
                //     //     console.log('v-upload-image.handleClick.uploadImage.success: ', rtn);
                //     //     // return Promise.resolve(wechatApi.downloadImage({serverId: res}));
                //     //     return wechatApi.downloadImage({serverId: rtn});
                // }).then(dat => {
                //     // this.$toast(dat);
                //     console.log('v-upload-image.handleClick.downloadImage.success: ', dat);
                // }).catch(e => {
                //     console.error('v-upload-image.handleClick.wx.error: ', e);
                //     this.$toast(e.errMsg);
                // });
                let uploadImageSuccessFunc = (res) => {
                        console.log(this.currentValue);
                        let tag = false;
                        this.currentValue.forEach((v, i) => {
                            if (!tag && !v.mediaId) {
                                this.$set(this.currentValue[i], 'mediaId', res.serverId);
                                tag = true;
                            }
                        });
                        console.log('v-upload-image.uploadImageSuccessFunc: ', res);
                        // I-YHwkYGPDIHxF-kqmmj-ETgbQitgfzLJITOEwYzGZ7pepobfsfouHYLA92yJ1Yl
                        // http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=5_OYu41gF4xbrXAcuZLtTs3ZNo9OjPiK4V6g2cgUaN5uVkoe5l2MJBmN-DnvftM_B8bbuQtqq12J-eRha3yXvl7VDj7Rv6rRJCpPOmkQLS5fe0CmADzPYPCjxC4axntIz7CzebrmvbZJf32A3zMUGcAEAAIU&media_id=I-YHwkYGPDIHxF-kqmmj-ETgbQitgfzLJITOEwYzGZ7pepobfsfouHYLA92yJ1Yl
                        // https://api.weixin.qq.com/cgi-bin/media/get?access_token=5_OYu41gF4xbrXAcuZLtTs3ZNo9OjPiK4V6g2cgUaN5uVkoe5l2MJBmN-DnvftM_B8bbuQtqq12J-eRha3yXvl7VDj7Rv6rRJCpPOmkQLS5fe0CmADzPYPCjxC4axntIz7CzebrmvbZJf32A3zMUGcAEAAIU&media_id=I-YHwkYGPDIHxF-kqmmj-ETgbQitgfzLJITOEwYzGZ7pepobfsfouHYLA92yJ1Yl
                        // TODO: 调后台接口，传入serverId，后台通过微信媒体下载接口，通过access_token和media_id（就是前面的serverId）获取图片，并上传云，返回url
                        api.uploadImageFromWx({
                            media_id: res.serverId
                        }).then(res => {
                            console.log('v-upload-image.uploadImageFromWx.response: ', res);
                            this.uploadedStatus = true;
                            if (res) {
                                console.log('v-upload-image.uploadImageFromWx.response: ', this.mod);
                                if (this.mod === 'avatar') {
                                    this.currentValue = [{url: utils.thumb(res.url, {width: 160, height: 160}), loading: false, imgId: res.img_id}];
                                    console.log('this.currentValue:', this.currentValue);
                                } else {
                                    this.currentValue.forEach((v, i) => {
                                        console.log('v-upload-image.uploadImageFromWx.response: --->> ', v.mediaId, res.media_id);
                                        if (v.mediaId === res.media_id) {
                                            console.log('v-upload-image.uploadImageFromWx.response: --->>!!! ', i, res.media_id);
                                            let obj = {
                                                mediaId: res.media_id,
                                                url: utils.thumb(res.url, {width: 160, height: 160}),
                                                loading: false,
                                                imgId: res.img_id,
                                                width: res.width,
                                                height: res.height
                                            };
                                            this.$set(this.currentValue, i, obj);
                                        }
                                    });
                                }
                            }
                            syncUploadImage(); // 同步上传
                        }).catch(e => {
                            this.$toast(trans(e.errcode));
                            syncUploadImage(); // 同步上传
                        });
                    },
                    uploadImageFailFunc = (res) => {
                        syncUploadImage(); // 同步上传
                        // window.alert('fail');
                        console.log('v-upload-image.uploadImageFailFunc: ', res);
                    },
                    syncUploadImage = () => {
                        if (!this.localIds || !this.localIds.length) return;
                        let id = this.localIds.pop();
                        wx.uploadImage({
                            localId: id, // 需要上传的图片的本地ID，由chooseImage接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: uploadImageSuccessFunc,
                            fail: uploadImageFailFunc
                        });
                    },
                    chooseImageSuccessFunc = (res) => {
                        console.log('v-upload-image.chooseImageSuccessFunc: ', res);
//                        this.$set(this, 'currentValue', false);
//                        this.$set(this, 'uploadedStatus', true);
                        this.uploadedStatus = false;
                        this.localIds = res.localIds;
                        res.localIds.forEach((v, i) => {
                            this.currentValue.push({url: '', loading: true, imgId: i, mediaId: ''});
                        });
                        syncUploadImage(); // 同步上传
                    }, chooseImageFailFunc = (res) => {
                        window.alert('上传失败，请刷新页面再试~' + res);
                        console.log('v-upload-image.chooseImageFailFunc: ');
                    };
                wx.chooseImage({
                    count: len, // 默认9
                    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: chooseImageSuccessFunc,
                    fail: chooseImageFailFunc
                });
            },
            imageuploaded (res) {
                console.log('v-upload-image.imageuploaded: ', ...arguments);
                if (res.errcode === 0) {
                    // this.src = res.data.src;
                    this.$set(this, 'currentValue', res.data.src);
                }
            },
            uploadImage () {

            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";
    @import "../scss/_mixins";
    @import "../scss/_popup";
    .v-upload-image {

        .v-popup {
            /*display: flex;*/
            /*align-items: flex-start;*/
            /*justify-content: center;*/
            /*bottom: auto!important;*/
            /*background-color: transparent;*/
        }
        .v-upload-image__frm {
            margin:0 auto;
            width: pxTorem(80);
            height: pxTorem(80);
            display: flex;
            justify-content: center;
            align-items: center;
            border: $brand-primary pxTorem(1) solid;
            border-radius: 50%;
            overflow: hidden;
            .loaing {
                width: pxTorem(20);
                height: pxTorem(20);
            }
            img { // 头像
                width:100%;
                height:pxTorem(80);
                margin:0;
                padding:0;
                border-radius:pxTorem(40);
            }
            .icon {
                font-size: pxTorem(36)!important;
                color: $brand-primary;
            }

        }
        .avatar-demo { // 上传头像示例
            width: pxTorem(300);
            position:absolute;
            /*display: flex;*/
            /*flex-flow: column nowrap;*/
            /*justify-content: flex-start;*/
            /*align-items: center;*/
            left: 50%;
            top: 50%;
            -webkit-transform: translate3d(-50%, -50%, 0);
            transform: translate3d(-50%, -50%, 0);



            .popup-image {
                width: pxTorem(300);
                height: pxTorem(345);
            }

            .btn {
                height: pxTorem(55);
                width: pxTorem(300);
                border-radius: 0 0 pxTorem(12) pxTorem(12);
                background-color: #FDD108;
                font-size: pxTorem(20);
                line-height: pxTorem(55);
                font-weight: 700;
                position: relative;
            }
            .icon-error { // 关闭按钮
                position: absolute;
                right: pxTorem(8);
                top: pxTorem(8);
                background: #ccc;
                width: pxTorem(28);
                height: pxTorem(28);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: pxTorem(16);
                color: #FFF;
            }
            .wx_upload_button{
                height:pxTorem(55);
                width:pxTorem(300);
                border-radius: 0 0 pxTorem(12) pxTorem(12);
                background-color:#FDD108;
                font-size:pxTorem(16);
                font-width:700;
                position: relative;
                .wx_input{
                    height:pxTorem(55);
                    width:pxTorem(300);
                    opacity: 0;
                    position: absolute;
                    left: 0;
                    top:0;
                }
            }

        }
    }
    .v-upload-image__avatar {
        position: relative;
        margin:0 auto;
        width: pxTorem(80);
        height: pxTorem(80);
        display: flex;
        justify-content: center;
        align-items: center;
        border: $brand-primary 1px solid;
        border-radius: 50%;
        overflow: hidden;

        image {
            width: pxTorem(80);
            height: pxTorem(80);
        }

        .icon {
            font-size: pxTorem(72)!important;
            color: $brand-primary;
        }
    }

    .v-upload-image__desc {
        display: flex;
        align-items: center;
        justify-content: center;

        text {
            font-size: pxTorem(20);
            text-align: center;
            color: #BEBEBE;
            margin-top: pxTorem(10);
            height: pxTorem(28);
        }
    }

    .v-upload-image {

        .icon-loading {
            display: none;
            /*position: absolute;*/
            /*left: 50%;*/
            /*top: 50%;*/
            font-size: pxTorem(32);
            margin-left: pxTorem(-16);
            margin-top: pxTorem(-16);
            animation: rotating 2s linear infinite; // 转起来~
        }
        .loading {
            margin:0 auto;
            &.icon-loading{
                display: block;
            }
        }
        /*.loading .icon-loading {*/
            /*display: block;*/
        /*}*/
        .fadeIn { image { animation: fadeIn .5s ease; } } // 图片渐显
        @keyframes rotating { 0% { transform: rotateZ(0deg); } 100% { transform: rotateZ(360deg); } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
    }

    .v-upload-image.multi {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        .wx_upload_button{
            &.wechat{
                text-align: center;
                .icon-camera-fill{
                    font-size: pxTorem(40);
                    color: #FDD108 ;

            }
            }
            .wx_input{
                height:pxTorem(80);
                width:pxTorem(80);
                opacity: 0;
                position: absolute;
                left: 0;
                top:0;
            }

        }

        .frm {
            position: relative;
            flex: 0 0 auto;
            width: pxTorem(80);
            height: pxTorem(80);
            margin: pxTorem(20) 0 0 pxTorem(20);
            border: $brand-primary 1px solid;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: pxTorem(80);
                height: pxTorem(80);
            }
            .icon-del {
                position: absolute;
                right: pxTorem(-8);
                top: pxTorem(-8);
                font-size: pxTorem(16);
                color: $brand-danger;
            }

            .icon-add {
                font-size: pxTorem(36);
                color: $brand-primary;
            }
        }

    }
</style>
