<template>
    
</template>

<script>
    // import vImage from './v-image';
//     import * as utils from '../js/utils/utils.js';

//     /**
//      * 上传图片组件，依赖于微信jssdk，需要组件的引用页面混入m-wechat-api.js做微信jssdk的config！
//      * 如果在微信环境，使用jssdk；
//      * 如果移动环境，
//      *              -- Author by Dio Zhu. on 2017.11.16
//      * 不用微信jssdk了，微信选择图片后，转换base64的接口wx.getLocalImgData仅在 iOS WKWebview 下提供
//      * 现使用h5的方式，引用组件：vue-core-image-upload实现
//      *              -- Author by Dio Zhu. on 2017.11.16
//      */
//     export default {
//         // mixins: [ Popup ],

//         // components: { vImage },
//         props: {
//             value: {
//                 type: Array,
//                 default: () => [],
//                 twoWay: true
//             },
//             max: { // 最多上传多少张
//                 type: String,
//                 default: '1'
//             },
//             disabled: {
//                 type: Boolean,
//                 default: false
//             },
//             preview: { // 是否可以查看大图
//                 type: Boolean,
//                 default: false
//             },
//             apiUrl: { // 上传图片的apiurl
//                 type: String,
//                 default: ''
//             },
//             tokenKey: { // 上传图片的apiurl
//                 type: String,
//                 default: 'token'
//             },
//             tokenVal: { // 上传图片的apiurl
//                 type: String,
//                 default: ''
//             }
//         },
//         data () {
//             return {
//                 uploadUrl: this.apiUrl,
//                 data: {},
//                 currentValue: this.value,
//                 isWechat: true,
//                 isApp: '',
//                 uploadedStatus: true, // 上传图片的状态，可据此改变上传按钮的状态
//                 localIds: []
//             };
//         },
//         activated () {
//         },
//         computed: {
//         },

//         watch: {
//             value (val) {
//                 this.currentValue = val;
//             },
//             currentValue (val) {
//                 this.$emit('input', val);
//             },
//             loadingStatus (val) {
//                 this.$emit('handle-uploaded-status', val);
//             },
// //            currentAvatar (val) {
// //                this.$emit('handle-avatar-change', val);
// //            },
//             /**
//              * 捕获图片上传状态，可根据此标识做提交按钮的限定等动作
//              * 父页面可在组件调用时指定回调函数： @handle-uploaded-status="handleUploadedStatus"
//              *              -- Author by Dio Zhu. on 2017.2.28
//              */
//             uploadedStatus (val) {
//                 this.$emit('handle-uploaded-status', val);
//             }
//         },
//         mounted () {
//             this.init();
//         },
//         methods: {
//             init () {
//                 this.currentValue = this.value;
//                 this.isApp = utils.isApp();
//                 this.isWechat = utils.isWechat();
//                 this.uploadedStatus = true; // 上传图片的状态，可据此改变上传按钮的状态
//                 this.localIds = [];
//                 // if (!utils.isWechat()) this.isWechat = false;
//                 // else this.isWechat = true;
//             },
//             handleTapDel (idx) { // 点击删除
//                 this.currentValue.splice(idx, 1);
//             },
//             handleTapPreview (item, idx) { // 点击大图预览
//                 if (!preview) return;
//                // const urls = this.value.map(value => value.url);
//                 let imgList = [];
//                 if (this.currentValue.length > 0) {
//                     this.currentValue.forEach(element => {
//                         let imgObj = {
//                             'url': element.orgurl,
//                             'width': element.width,
//                             'height': element.height
//                         };
//                         imgList.push(imgObj);
//                         // console.log('---------------7--------------', element);
//                     });
//                 }
//                 this.$root.swipes = {list: imgList, idx: idx}; // swipe
//                 this.$root.img = imgList; // viewer
//                 this.$router.push({name: 'viewer', query: {idx: idx}});
//                 return;
//             },
//             h5ChooseImage (e) {
//                 // loading状态值
//                 this.currentValue.push({loading: true});
//                 let _self = this;
//                 try {
//                     if (e.target) {
//                         this.uploadedStatus = false;
//                         var fileInput = e.target;
//                         console.log(fileInput.files[0]);
//                         var data = new global.FormData();
//                         data.append(this.fileName, fileInput.files[0]);
//                         var xhr = new window.XMLHttpRequest();
//                         xhr.open('post', this.uploadUrl);
//                         xhr.setRequestHeader(this.tokenKey, this.tokenVal);
//                         xhr.responseType = 'json';
//                         xhr.send(data);
//                         xhr.onload = function (e) {
//                             if (xhr.status === 200) {
//                                 if (xhr.response.status === 0) {
//                               //                    请求返回后不显示默认图片；
//                                     _self.uploadedStatus = true;
// //                                    _self.currentValue = xhr.response.data.url + '!/both/160x160';
//                                     if (Array.isArray(xhr.response.data)) {
//                                         if (xhr && xhr.response.data && xhr.response.data.length) {
//                                             xhr.response.data.forEach((v, i) => {
//                                                 _self.currentValue.push({
//                                                     url: utils.thumb(xhr.response.data[i].url, {width: 160, height: 160}),
//                                                     orgurl: xhr.response.data[i].url,
//                                                     loading: false,
//                                                     imgId: xhr.response.data[i].img_id
//                                                 });
//                                             });
//                                         }
//                                     } else {
//                                         _self.currentValue.forEach((v, i) => {
//                                             if (v.loading) {
//                                                 _self.$set(_self.currentValue, i, {
//                                                     // url: utils.thumb(xhr.response.data.url, {width: 160, height: 160}),
//                                                     url: utils.thumb(xhr.response.data.url, {width: 160, height: 160}),
//                                                     orgurl: xhr.response.data.url,
//                                                     loading: false,
//                                                     imgId: xhr.response.data.img_id,
//                                                     width: xhr.response.data.width,
//                                                     height: xhr.response.data.height
//                                                 });
//                                             }
//                                         });
//                                     }
//                                 } else {
//                                     _self.uploadedStatus = true;
//                                     _self.$toast(trans(xhr.response.errcode));
//                                 }
// //                                document.querySelector('.v-modal') && document.querySelector('.v-modal').parentNode.removeChild(document.querySelector('.v-modal'));
//                             }
//                         };
//                     }
//                 } catch (e) {
//                     this.uploadedStatus = true;
// //                    document.querySelector('.v-modal') && document.querySelector('.v-modal').parentNode.removeChild(document.querySelector('.v-modal'));
//                     console.log('uploadImg', e);
//                     this.$toast(trans(e.errcode));
//                 }
//             },
//             appChooseImage () { // APP端上传图片
//                 let len = this.max - this.value.length,
//                     _self = this;
//                 if (len <= 0) return; // 多图上传，超过数量直接返回
//                 let uploadImageSuccessFunc = (params) => {
//                     var data = {
//                         img: params.base64,
//                         returnReq: params.returnReq
//                     };
//                     var xhr = new window.XMLHttpRequest();
//                         xhr.open('post', this.uploadUrl);
//                         xhr.setRequestHeader(this.tokenKey, this.tokenVal);
//                         xhr.widthCredentials = true;
//                         xhr.responseType = 'json';
//                         xhr.send(data);
//                         xhr.onload = function () {
//                             let res = JSON.parse(xhr.response);
//                             if (xhr.status === 200) {
//                                 if (res.status === 0) {
//                                     // 成功处理
//                                     if (res.data) {
//                                         console.log('v-upload-image.uploadImageAPP.response: ', this.mod);
//                                         let num = 0;
//                                         this.currentValue.forEach((v, i) => {
//                                             if (v.returnReq === params.returnReq) {
//                                                 let obj = {
//                                                     // mediaId: res.media_id,
//                                                     url: utils.thumb(res.data.url, {width: 160, height: 160}),
//                                                     orgurl: res.data.url,
//                                                     loading: false,
//                                                     imgId: res.data.img_id,
//                                                     width: res.data.width,
//                                                     height: res.data.height
//                                                 };
//                                                 this.$set(this.currentValue, i, obj);
//                                             }
//                                         });
//                                         // 判断是否全部有url了 如果都有了 说明上传完成了。
//                                         this.currentValue.forEach((el, i) => {
//                                             if (el.url) num = num + 1;
//                                             if (num != 0 && num === this.currentValue.length) this.uploadedStatus = true;
//                                         });
//                                     }
//                                 } else {
//                                     // 失败处理
//                                     _self.uploadedStatus = true;
//                                     _self.$toast(trans(xhr.response.errcode));
//                                 }
//                             }
//                         };
//                     // api.postUploadOldImg({ img: params.base64 }, { returnReq: params.returnReq }).then(res => {
//                     //     console.log('v-upload-image.uploadImageAPP.response: ', res);
//                         // if (res) {
//                         //     console.log('v-upload-image.uploadImageAPP.response: ', this.mod);
//                         //     let num = 0;
//                         //     this.currentValue.forEach((v, i) => {
//                         //         if (v.returnReq === res.returnReq) {
//                         //             let obj = {
//                         //                 // mediaId: res.media_id,
//                         //                 url: utils.thumb(res.url, {width: 160, height: 160}),
//                         //                 orgurl: res.url,
//                         //                 loading: false,
//                         //                 imgId: res.img_id,
//                         //                 width: res.width,
//                         //                 height: res.height
//                         //             };
//                         //             this.$set(this.currentValue, i, obj);
//                         //         }
//                         //     });
//                         //     // 判断是否全部有url了 如果都有了 说明上传完成了。
//                         //     this.currentValue.forEach((el, i) => {
//                         //         if (el.url) num = num + 1;
//                         //         if (num != 0 && num === this.currentValue.length) this.uploadedStatus = true;
//                         //     });
//                         // }
//                     // }).catch(e => {
//                     //     this.$toast(trans(e.errcode));
//                     // });
//                 };
//                 Bridge.chooseImage({count: this.max - this.value.length}).then(res => {
//                     this.uploadedStatus = false;
//                     // window.alert(JSON.stringify(res));
//                     if (parseInt(this.max) === 1) this.currentValue = [];
//                     res.forEach((v, i) => {
//                         this.currentValue.push({url: '', loading: true, returnReq: i + 1, mediaId: ''});
//                         uploadImageSuccessFunc({base64: 'data:image/jpeg;base64,' + v.base64, returnReq: i + 1});
//                     });
//                 });
//             },
//             wxChooseImage () { // 微信jssdk上传图片
//                 let len = this.max - this.value.length;
//                 if (len <= 0) return; // 多图上传，超过数量直接返回
// //                document.querySelector('.v-modal') && document.querySelector('.v-modal').parentNode.removeChild(document.querySelector('.v-modal'));
//                 // return wechatApi.chooseImage().then(res => {
//                 //     // this.$toast(res[0]);
//                 //     this.$logger.log('v-upload-image.handleClick.chooseImage.success: ', res[0]);
//                 //     // return wechatApi.getLocalImgData({localId: res[0]});
//                 //     return wechatApi.uploadImage({localId: res[0]});
//                 //     // }).then(rtn => {
//                 //     //     this.$logger.log('v-upload-image.handleClick.uploadImage.success: ', rtn);
//                 //     //     this.$set(this.currentValue, 'url', rtn);
//                 //     // }).then(rtn => {
//                 //     //     // this.$toast(rtn);
//                 //     //     this.$logger.log('v-upload-image.handleClick.uploadImage.success: ', rtn);
//                 //     //     // return Promise.resolve(wechatApi.downloadImage({serverId: res}));
//                 //     //     return wechatApi.downloadImage({serverId: rtn});
//                 // }).then(dat => {
//                 //     // this.$toast(dat);
//                 //     this.$logger.log('v-upload-image.handleClick.downloadImage.success: ', dat);
//                 // }).catch(e => {
//                 //     this.$logger.error('v-upload-image.handleClick.wx.error: ', e);
//                 //     this.$toast(e.errMsg);
//                 // });
//                 let uploadImageSuccessFunc = (res) => {
//                         console.log(this.currentValue);
//                         let tag = false;
//                         this.currentValue.forEach((v, i) => {
//                             if (!tag && !v.mediaId) {
//                                 this.$set(this.currentValue[i], 'mediaId', res.serverId);
//                                 tag = true;
//                             }
//                         });
//                         console.log('v-upload-image.uploadImageSuccessFunc: ', res);
//                         // I-YHwkYGPDIHxF-kqmmj-ETgbQitgfzLJITOEwYzGZ7pepobfsfouHYLA92yJ1Yl
//                         // http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=5_OYu41gF4xbrXAcuZLtTs3ZNo9OjPiK4V6g2cgUaN5uVkoe5l2MJBmN-DnvftM_B8bbuQtqq12J-eRha3yXvl7VDj7Rv6rRJCpPOmkQLS5fe0CmADzPYPCjxC4axntIz7CzebrmvbZJf32A3zMUGcAEAAIU&media_id=I-YHwkYGPDIHxF-kqmmj-ETgbQitgfzLJITOEwYzGZ7pepobfsfouHYLA92yJ1Yl
//                         // https://api.weixin.qq.com/cgi-bin/media/get?access_token=5_OYu41gF4xbrXAcuZLtTs3ZNo9OjPiK4V6g2cgUaN5uVkoe5l2MJBmN-DnvftM_B8bbuQtqq12J-eRha3yXvl7VDj7Rv6rRJCpPOmkQLS5fe0CmADzPYPCjxC4axntIz7CzebrmvbZJf32A3zMUGcAEAAIU&media_id=I-YHwkYGPDIHxF-kqmmj-ETgbQitgfzLJITOEwYzGZ7pepobfsfouHYLA92yJ1Yl
//                         // TODO: 调后台接口，传入serverId，后台通过微信媒体下载接口，通过access_token和media_id（就是前面的serverId）获取图片，并上传云，返回url
//                         api.uploadImageFromWx({
//                             media_id: res.serverId
//                         }).then(res => {
//                             console.log('v-upload-image.uploadImageFromWx.response: ', res);
//                             if (res) {
//                                 console.log('v-upload-image.uploadImageFromWx.response: ', this.mod);
//                                 this.currentValue.forEach((v, i) => {
//                                     console.log('v-upload-image.uploadImageFromWx.response: --->> ', v.mediaId, res.media_id);
//                                     if (v.mediaId === res.media_id) {
//                                         console.log('v-upload-image.uploadImageFromWx.response: --->>!!! ', i, res.media_id);
//                                         let obj = {
//                                             mediaId: res.media_id,
//                                             url: utils.thumb(res.url, {width: 160, height: 160}),
//                                             orgurl: res.url,
//                                             loading: false,
//                                             imgId: res.img_id,
//                                             width: res.width,
//                                             height: res.height
//                                         };
//                                         this.$set(this.currentValue, i, obj);
//                                     }
//                                 });
//                                 this.uploadedStatus = true;
//                             }
//                             syncUploadImage(); // 同步上传
//                         }).catch(e => {
//                             this.uploadedStatus = true;
//                             this.$toast(trans(e.errcode));
//                             syncUploadImage(); // 同步上传
//                         });
//                     },
//                     uploadImageFailFunc = (res) => {
//                         syncUploadImage(); // 同步上传
//                         // window.alert('fail');
//                         console.log('v-upload-image.uploadImageFailFunc: ', res);
//                     },
//                     syncUploadImage = () => {
//                         if (!this.localIds || !this.localIds.length) return;
//                         // if (!this.localIds || !this.localIds.length) {
//                         //     this.uploadedStatus = true;
//                         //     return;
//                         // }
//                         let id = this.localIds.pop();
//                         this.$wx.uploadImage({
//                             localId: id, // 需要上传的图片的本地ID，由chooseImage接口获得
//                             isShowProgressTips: 1, // 默认为1，显示进度提示
//                             success: uploadImageSuccessFunc,
//                             fail: uploadImageFailFunc
//                         });
//                     },
//                     chooseImageSuccessFunc = (res) => {
//                         console.log('v-upload-image.chooseImageSuccessFunc: ', res);
// //                        this.$set(this, 'currentValue', false);
// //                        this.$set(this, 'uploadedStatus', true);
//                         this.uploadedStatus = false;
//                         this.localIds = res.localIds;
//                         if (parseInt(this.max) === 1) this.currentValue = [];
//                         res.localIds.forEach((v, i) => {
//                             this.currentValue.push({url: '', loading: true, imgId: i, mediaId: ''});
//                         });
//                         syncUploadImage(); // 同步上传
//                     }, chooseImageFailFunc = (res) => {
//                         window.alert('上传失败，请刷新页面再试~' + res);
//                         console.log('v-upload-image.chooseImageFailFunc: ');
//                     };
//                 this.$wx.chooseImage({
//                     count: len, // 默认9
//                     sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
//                     sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
//                     success: chooseImageSuccessFunc,
//                     fail: chooseImageFailFunc
//                 });
//             },
//             imageuploaded (res) {
//                 this.$logger.log('v-upload-image.imageuploaded: ', ...arguments);
//                 if (res.errcode === 0) {
//                     // this.src = res.data.src;
//                     this.$set(this, 'currentValue', res.data.src);
//                 }
//             },
//             uploadImage () {

//             }
//         }
//     };
</script>
<style rel="stylesheet/scss" lang="scss">

    // @import "../scss/variables";
    // @import "../scss/mixins";

    // .v-upload-image {

    //     .icon-loading {
    //         display: none;
    //         /*position: absolute;*/
    //         /*left: 50%;*/
    //         /*top: 50%;*/
    //         font-size: pxTorem(32);
    //         margin-left: pxTorem(-16);
    //         margin-top: pxTorem(-16);
    //         animation: rotating 2s linear infinite; // 转起来~
    //     }
    //     .loading {
    //         margin:0 auto;
    //         &.icon-loading{
    //             display: block;
    //         }
    //     }
    //     /*.loading .icon-loading {*/
    //         /*display: block;*/
    //     /*}*/
    //     .fadeIn { image { animation: fadeIn .5s ease; } } // 图片渐显
    //     @keyframes rotating { 0% { transform: rotateZ(0deg); } 100% { transform: rotateZ(360deg); } }
    //     @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
    // }

    // .v-upload-image.multi {
    //     display: flex;
    //     flex-direction: row;
    //     flex-wrap: wrap;
    //     align-items: center;
    //     justify-content: flex-start;
    //     .wx_upload_button{
    //         &.wechat{
    //             text-align: center;
    //             .icon-camera-fill{
    //                 font-size: pxTorem(40);
    //                 color: #FDD108 ;

    //         }
    //         }
    //         .wx_input{
    //             height:pxTorem(80);
    //             width:pxTorem(80);
    //             opacity: 0;
    //             position: absolute;
    //             left: 0;
    //             top:0;
    //         }

    //     }

    //     .frm {
    //         position: relative;
    //         flex: 0 0 auto;
    //         width: pxTorem(80);
    //         height: pxTorem(80);
    //         margin: pxTorem(20) 0 0 pxTorem(20);
    //         border: $brand-primary 1px solid;
    //         background: transparent;
    //         display: flex;
    //         align-items: center;
    //         justify-content: center;

    //         img {
    //             width: pxTorem(80);
    //             height: pxTorem(80);
    //         }
    //         .icon-del {
    //             position: absolute;
    //             right: pxTorem(-8);
    //             top: pxTorem(-8);
    //             font-size: pxTorem(16);
    //             color: $brand-danger;
    //         }

    //         .icon-add {
    //             font-size: pxTorem(36);
    //             color: $brand-primary;
    //         }
    //     }

    // }
</style>
