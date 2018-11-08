<template>
    <div class="v-audio">
        <audio :id="id" class="org" :src="src" controls="controls" >您的浏览器d不支持 audio标签。</audio>
        <i :class="['icon', {'icon-play': btnPlay}, {'icon-pause': !btnPlay}]" @click="play"></i>
        <div class="txt"><span v-text="txtplay"></span><span class="tim">{{txttime}}</span></div>
        <div class="bar" :class="{'act':cssbar}"><div></div><div></div><div></div></div>
    </div>
</template>
<script>
    import logger from '../js/utils/logger';
    import bus from '../vendor/eventbus';
    export default {
        components: { logger },
        name: 'v-audio',

        props: {
            id: String,
            src: String,
            desc: Boolean,
            drt: Number
        },
        data () {
            return {
                audio: null, // 播放器对象
                btnPlay: true, // 播放/暂停按钮
                txtplay: '语音', // 播放文字
                txttime: null, // 播放时间
                cssbar: null, // 播放效果
                paused: false // 播放标识
            };
        },
        created: function () {
            bus.$on('audio-playing', this.audioPlaying);
        },
        // 最好在组件销毁前
        // 清除事件监听
        beforeDestroy: function () {
            bus.$off('audio-playing', this.audioPlaying);
        },
        mounted () {
            this.$nextTick(() => {
                this.txttime = this.drt + '\"';
                this.audio = document.getElementById(this.id); // 播放按钮
            });
        },
        methods: {
            audioPlaying (id, ids) {
                logger.log('!!!broadcast from app: v-audio: ', id, ids);
                // if (id !== this.id) this.stop(); // 接收通知，关掉其他播放器，确保只有一个在播放。 Author by Dio Zhu. on 2017.5.11
                if (id !== this.id && this.audio && !this.audio.paused) { // 接收通知，关掉其他播放器，确保只有一个在播放。 Author by Dio Zhu. on 2017.5.11
                    this.audio.pause();
                    this.btnPlay = true;
                    this.txtplay = '语音';
                    this.cssbar = false;
                }
            },
            /**
             * 播放\暂停的处理, 播放时调用playing修改播放时间等状态和动画...
             *              -- Author by Dio Zhu. on 2016.11.15
             */
            play () {
                logger.log('play...');
                if (!this.audio) {
                    logger.error('audio init error');
                    return;
                }
                if (this.audio.paused) {
                    logger.log('pause...', this.id);
                    bus.$emit('audio-playing', this.id); // 通知其他播放器
                    this.audio.play();
                    this.btnPlay = false;
                    this.txtplay = '播放中';
                    this.playing();
                    this.cssbar = true;
                    return;
                }
                this.audio.pause();
                this.btnPlay = true;
                this.txtplay = '语音';
                this.cssbar = false;
            },
            /**
             * 播放中, 修改播放时间\播放动画等...
             *              -- Author by Dio Zhu. on 2016.11.11
             */
            playing () {
                var _self = this;
                logger.log('playing...', (new Date()), ', this.audio.ended: ', this.audio.ended);
                if (this.audio.ended) {
                    logger.log('is done...');
                    this.stop();
                }

                if (this.audio.paused) {
                    return;
                }

                if (this.desc) {
                    this.txttime = parseInt(this.drt) - parseInt(this.audio.currentTime) + '\"';
                } else {
                    this.txttime = parseInt(this.audio.currentTime) + 1 + '\"';
                }

                setTimeout(() => {
                    _self.playing();
                }, 1000);
            },
            /**
             * 播放停止, 切换图标等状态提示.
             *              -- Author by Dio Zhu. on 2016.11.15
             */
            stop () {
                logger.log('stop...', this.audio);
                this.audio.pause();
                this.audio.startTime = 0;
                this.btnPlay = true;
                this.txtplay = '语音';
                this.cssbar = false;
                this.txttime = parseInt(this.drt) + '\"';
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";

    .v-audio {
        position: relative;
        width: 100%;
        height: pxTorem(44px);
        background: #E5F1FF;
        border: #3395FF 1px solid;
        border-radius: pxTorem(4px);
        font-size: pxTorem(16px);

        .org {
            display: none;
        }

        div {
            position: absolute;
            display: inline-block;
            height: pxTorem(44px);
            line-height: pxTorem(44px);
        }

        .icon {
            margin: pxTorem(9px) 0 pxTorem(13px) pxTorem(15px);
            display: inline-block;
            vertical-align: middle;
            width: pxTorem(23px);
            height: pxTorem(23px);
            line-height: pxTorem(23px);
            font-size: pxTorem(22px);
            color: #007AFF;
        }

        .txt {
            margin-left: pxTorem(10px);
            font-size: pxTorem(16px);
            span {
                font-size: pxTorem(16px);
            }
        }
        .tim {
            margin-left: pxTorem(5px);
            font-size: pxTorem(16px);
            color: #777E8C;
        }

        .bar {
            right: 0;
            width: pxTorem(38px);

            div {
                width: pxTorem(2px);
                background: #007AFF;
                bottom: 33%;

                &:nth-child(1) {
                     height: pxTorem(10px);
                     margin-left: pxTorem(15px);
                 }
                &:nth-child(2) {
                     height: pxTorem(15px);
                     margin-left: pxTorem(20px);
                 }
                &:nth-child(3) {
                     height: pxTorem(5px);
                     margin-left: pxTorem(25px);
                 }
            }

            &.act {
                div {
                    /* Set the animation properties */
                    animation-duration: 1s;
                    animation-iteration-count: infinite;
                    &:nth-child(1) {
                         animation-name: playing1;
                     }
                    &:nth-child(2) {
                         animation-name: playing2;
                     }
                    &:nth-child(3) {
                         animation-name: playing3;
                     }
                }
            }

            /* The actual animation */
            @keyframes playing1 { 0% { height: pxTorem(10px); } 25% { height: pxTorem(13px);  } 50% { height: pxTorem(15px);  } 75% { height: pxTorem(13px);  } 100% {  height: pxTorem(10px); } }
            @keyframes playing2 { 0% { height: pxTorem(15px); } 25% { height: pxTorem(13px);  } 50% { height: pxTorem(10px);  } 75% { height: pxTorem(13px);  } 100% {  height: pxTorem(15px); } }
            @keyframes playing3 { 0% { height: pxTorem(5px); } 25% { height: pxTorem(8px);  } 50% { height: pxTorem(11px);  } 75% { height: pxTorem(8px);  } 100% {  height: pxTorem(5px); } }
        }
    }
</style>
