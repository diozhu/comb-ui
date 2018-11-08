<template>
    <div class="v-video">
        <video :id="id" :src="src" :poster="poster" controls="controls">您的浏览器不支持 video标签。</video>
    </div>
</template>
<script>
    import logger from '../js/utils/logger';
    import bus from '../vendor/eventbus';
    export default {
        components: { logger },
        name: 'v-video',

        props: {
            id: String,
            src: String,
            poster: String
        },
        data () {
            return {
                obj: null, // 播放器对象
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
                this.obj = document.getElementById(this.id); // 播放器对象

                // 绑定事件
                this.obj.onplaying = this.onPlaying;
                this.obj.onended = this.onEnded;
                this.obj.onpause = this.onPause;
            });
        },

        methods: {
            audioPlaying (id, ids) {
                logger.log('!!![v-video]broadcast from app: v-audio: ', id, ids);
                if (id !== this.id && this.obj && !this.obj.paused) { // 接收通知，关掉其他播放器，确保只有一个在播放。 Author by Dio Zhu. on 2017.5.11
                    this.obj.pause();
                }
            },
            /**
             * 播放\暂停的处理, 播放时调用playing修改播放时间等状态和动画...
             *              -- Author by Dio Zhu. on 2016.11.15
             */
            play () {
                logger.log('video.play...');
            },
            /**
             * 播放中, 修改播放时间\播放动画等...
             *              -- Author by Dio Zhu. on 2016.11.11
             */
            onPlaying () {
                logger.log('video.playing...');
                bus.$emit('audio-playing', this.id); // 通知其他播放器
            },
            /**
             * 播放停止, 切换图标等状态提示.
             *              -- Author by Dio Zhu. on 2016.11.15
             */
            onPause () {
                logger.log('video.onPause...');
                this.stop();
            },
            onEnded () {
                logger.log('video.onEnded...');
                this.stop();
            },
            /**
             * 播放停止, 切换图标等状态提示.
             *              -- Author by Dio Zhu. on 2016.11.15
             */
            stop () {
                logger.log('video.stop...');
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";

    .v-video {
        video {
            width: 100%;
            background: black;
            margin: pxTorem(10px) 0;
        }
    }
</style>
