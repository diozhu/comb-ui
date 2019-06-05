<template>
    <transition name="slide-fade">
        <div v-show="show" class="bubble">
            <i :class="currentIndex"></i>
            <h5 v-text="title"></h5>
            <p v-text="content"></p>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    export default {
        name: 'v-bubble-frame',
        props: {
            show: {
                type: Boolean
            },
            index: {
                type: String
            },
            title: {
                type: String
            },
            content: {
                type: String
            }
        },
        data () {
            return {
            };
        },
        computed: {
            currentIndex () {
                let flag = '';
                if (this.index === '1') {
                    flag = 'one';
                } else if (this.index === '2') {
                    flag = 'two';
                } else if (this.index === '3') {
                    flag = 'thr';
                } else if (this.index === '4') {
                    flag = 'four';
                } else if (this.index === '5') {
                    flag = 'five';
                }
                return flag;
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .bubble{
        position: relative;
        padding: pxTorem(12px) pxTorem(23px);
        width: 100%;
        height: pxTorem(101px); // 高度是否确定不确定
        background-color: #f8f9f8;
        i{
            position: absolute;
            top: pxTorem(-19px);
            display: block;
            content: '';
            border-width: pxTorem(10px);
            border-style: dashed dashed solid;
            border-color: transparent transparent #f8f9f8;
            &.one{
                left: pxTorem(38px);
            }
            &.two{
                left: pxTorem(108px);
            }
            &.thr{
                left: pxTorem(178px);
            }
            &.four{
                left: pxTorem(247px);
            }
            &.five{
                left: pxTorem(317px);
            }
        }
        h5{
            font-size: pxTorem(14px);
            font-weight: 700;
            color: #2b2b2b;
            line-height: pxTorem(20px);
        }
        p{
            margin-top: pxTorem(4px);
            font-size: pxTorem(12px);
            color: #2b2b2b;
            letter-spacing: 0;
            text-align: justify;
            line-height: pxTorem(17px);
        }
    }
    /*.slide-fade-enter-active {
        transition: height .3s, opacity .5s;
    }
    .slide-fade-leave-active{
        transition: height .5s, opacity .3s;
    }
    .slide-fade-enter, .slide-fade-leave-to {
        height: 0;
        opacity: 0;
    }*/
</style>
