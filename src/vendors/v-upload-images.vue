<template>
    <div class="v-upload-images">
        <transition-group name="fade" tag="div" class="v-upload-images__con">
            <!--加上v-if避免传入字符串时按照字符串去循环。。。mod by Dio Zhu. on 2017.7.13-->
            <div v-if="typeof imgList === 'object'" v-for="(img, idx) in imgList" key="img.id" v-show="img.src" class="v-upload-images__frm" @click.stop="goViewer(idx)">
                <div class="v-upload-images__img" :style="{backgroundImage: 'url(' + img.src + ')', backgroundSize: 'cover'}"></div>
                <div v-if="!img.url" class="v-upload-images__loading"><v-spinner color="#FFF" type="fading-circle"></v-spinner></div>
                <div v-if="!disableDel" @click.stop="delImage(idx)" class="v-upload-images__del"><i class="icon icon-error"></i></div>
            </div>
            <div @click="uploadImage" key="addBtn" class="v-upload-images__frm v-upload-images__btn" v-if="showTag">
                <div class="v-upload-images__img icon icon-add"></div>
            </div>
        </transition-group>
        <div v-if="desc" class="v-upload-images__tit" v-text="desc"></div>
    </div>
</template>

<script>
    import vSpinner from '../vendor/v-spinner/';
    import logger from '../js/utils/logger';
    import { uploadImages } from '../js/core/core';

    /**
     * 上传图片组件
     * 以后可加入布局，限定单张上传或者指定多列的布局。
     *              -- Author by Dio Zhu. on 2017.2.28
     * 添加lazyTag标识，如果有初始化的图片，产品要求要等图片加载完后，显示添加图标。
     * 默认lazyTag不打开，如果需要此方案，传入true即可
     *              -- Author by Dio Zhu. on 2017.4.12
     */
    export default {

        components: { 'v-spinner': vSpinner },

        props: {
            max: {
                type: Number,
                default: 9
            },
            value: {
                type: Array,
                default: () => []
            },
            desc: {
                type: String,
                default: ''
            },
            classes: {
                type: String,
                default: ''
            },
            uploaded: {
                type: Boolean,
                default: true
            },
            lazyTag: {
                type: Boolean,
                default: false
            },
            disableAdd: {
                type: Boolean,
                default: false
            },
            disableDel: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                showTag: !this.disableAdd && !this.lazyTag,
                imgList: this.value,
                uploadedStatus: this.uploaded
            };
        },

        computed: {

        },

        watch: {
            value () {
                this.imgList = this.value;
                if (!this.disableAdd && this.imgList.length < this.max) {
                    this.showTag = true;
                } else {
                    this.showTag = false;
                }
            },

            lazyTag (val) {
                if (!this.disableAdd && !val) this.showTag = true;
            },

            imgList (val) {
                this.$emit('input', val);
            },

            /**
             * 捕获图片上传状态，可根据此标识做提交按钮的限定等动作
             * 父页面可在组件调用时指定回调函数： @handle-uploaded-status="handleUploadedStatus"
             *              -- Author by Dio Zhu. on 2017.2.28
             */
            uploadedStatus (val) {
                this.$emit('handle-uploaded-status', val);
            }
        },

        methods: {
            uploadImage () {
                // 数量限制
                if (this.imgList.length >= this.max) {
                    this.$toast(`您最多只能选择${this.max}张`);
                    return;
                }
                logger.log('v-upload-images.uploadImage: ');
//                this.uploadedStatus = false; // 开始上传
                let max = this.max - this.imgList.length,
                    option = {
                        'type': 1,          // 0：裁切，1：不裁切
                        'ratio': 0.6,       // 压缩比，不传默认0.1
                        'functionType': 2,  // 相机和相册
                        'maxCount': max     // 最大可选数
                    };
                uploadImages(option, (e) => { // 返回base64的回调, 用于显示图片正在上传的状态, 避免白屏等待
                    logger.log('v-upload-images.uploadImage. -> back', e);
                    let i, len;
                    if (e === 'cancel') {
                        this.checkStatus(); // 检查状态，返回通知                    this.uploadedStatus = true; // 结束上传
                        return;
                    }
                    this.uploadedStatus = false; // 开始上传
                    for (i = 0, len = e.length;i < len;i++) {
                        e[i].url = ''; // 为了实现vue.js对对象内部属性监听，加上初始化值
                        if (this.imgList.length < this.max) this.imgList.push(e[i]);
                    }
                }, (e) => { // 成功上传七牛后的回调, url回写, 并清除图片上传的状态
                    logger.log('v-upload-images.uploadImage.qiqiu -> back', e);
                    let i, len;
                    for (i = 0, len = this.imgList.length;i < len;i++) {
                        if (e.id === this.imgList[i].id) {
                            this.imgList[i].url = e.url;
                            break;
                        }
                    }
//                    this.uploadedStatus = true; // 结束上传
                    this.checkStatus(); // 检查状态，返回通知                    this.uploadedStatus = true; // 结束上传
                }, (e) => { // 中途错误回调, 清除本次上传的图片信息
//                    this.uploadedStatus = true; // 结束上传
                    this.checkStatus(); // 检查状态，返回通知                    this.uploadedStatus = true; // 结束上传
                    logger.error('v-upload-images.uploadImage.error: ', e);
                    let i, len, j, jlen, img;
                    if (!e) { //  返回错误
                        // do nothing...
                    } else if (typeof e === 'object') { // 图片list
                        for (i = 0, len = this.imgList.length;i < len;i++) {
                            for (j = 0, jlen = e.length;j < jlen;j++) {
                                if (this.imgList[i].id === e[j].id) {
                                    // 删除数组对象
                                    this.imgList.splice(i, 1);
                                    // 删除dom
                                    img = document.getElementById(e[j].id);
                                    img.parentNode.removeChild(img);
                                }
                            }
                        }
                    } else if (typeof e === 'number') { // 图片id
                        for (i = 0, len = this.imgList.length;i < len;i++) {
                            if (this.imgList[i].id === e) {
                                // 删除数组对象
                                this.imgList.splice(i, 1);
                                // 删除dom
                                img = document.getElementById(e);
                                img.parentNode.removeChild(img);
                            }
                        }
                    }
                });
            },
            checkStatus () {
                let tag = true;
                for (let i = 0, len = this.imgList.length;i < len;i++) {
                    if (!this.imgList[i].url) {
                        tag = false;
                    }
                }
                this.$logger.log('handle-uploaded-status: ', this.imgList.length, tag);
                if (tag) {
                    this.uploadedStatus = true;
//                    this.$emit('handle-uploaded-status', true);
                } else {
                    this.uploadedStatus = false;
//                    this.$emit('handle-uploaded-status', false);
                }
            },
            delImage (idx) {
                logger.log('v-upload-images.delImage: ', idx);
                this.imgList.splice(idx, 1);
            },

            /**
             * 图片预览
             */
            goViewer (idx) {
                logger.log('v-upload-images.goViewer: ', idx);
//                this.$root.img = this.imgList;
                this.$root.img = [];
                this.imgList.forEach((v, i) => {
                //    this.$root.img.push(v.url);
                    this.$root.img.push(v.src || v.url);
                });
                this.$router.push({name: 'viewer', query: {idx: idx}});
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-upload-images{

    }

    .v-upload-images__con {

        /* autoprefixer: off */
        @include box-flex;
        @include align_items(center);
        // @include justify-content(space-between);
        @include flex-direction-row;

        /*display: flex;*/
        /*align-items: center;*/
        /*flex-direction: row;*/
        -webkit-flex-wrap: wrap;
        flex-wrap: wrap;

        > div {
            @include flex-grow(0);
            @include flex-shrink(0);
            @include flex_basis(auto);
            /*flex: 0 0 auto;*/
        }
    }

    .v-upload-images__frm {
        width: pxTorem(105px);
        height: pxTorem(105px);
        position: relative;
        margin-left: pxTorem(15px);
        margin-bottom: pxTorem(15px);

        &.v-upload-images__btn {
            border: #898989 pxTorem(1px) dashed;
        }
    }

    .v-upload-images__img {
        width: 100%;
        height: 100%;

        &.icon {
            font-size: pxTorem(48px);
            color: #898989;
            display:flex;
            display:-webkit-flex;
            align-items: center;
            -webkit-align-items: center;
            justify-content: center;
            -webkit-justify-content: center;
        }
    }

    .v-upload-images__loading {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background: #000;
        opacity: 0.8;
        @include box-flex;
        @include align_items(center);
        @include justify-content(center);

        /*.v-upload__mask {
            width: 100%;
            height: 100%;
            position: absolute;
            background: #000;
            @include opacity(.8);
        }*/

        .v-spinner {
            z-index: 9;
        }
    }

    .v-upload-images__del {
        position: absolute;
        top: pxTorem(5px);
        right: pxTorem(5px);
        display: block;

        .icon {
            font-size: pxTorem(18px);
            color: #333;
            line-height: 1;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
        }
    }

    .v-upload-images__tit {
        margin: 0 pxTorem(15px) pxTorem(15px);
        font-size: pxTorem(14px);
        color: #737373;
    }
</style>
