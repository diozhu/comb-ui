<template>
    <div class="v-feed" :class="[classes]">
        <div @click="handleClick"><div class="v-feed__img" :class="[feedClass]"><img :src="feedImg" ></div><i v-if="msgNum > 0" class="v-feed__num" :class="[{mix: msgNum > 9}]" v-text="msgNum"></i></div>
        <div class="v-feed__con">
            <div class="v-feed__con-info">
                <div class="v-feed__tit" v-text="title"></div>
                <div class="v-feed__sex icon" :class="[{'icon-male': sex == '1'}, {'icon-female': sex == '2'}]" v-if="sex"></div>
                <div class="v-feed__age" v-if="age" v-text="age"></div>
                <div class="v-feed__desc" v-text="desc" v-if="desc"></div>
            </div>
            <div class="v-feed__sub" v-text="subtitle"></div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import * as utils from '../js/utils/utils';

    /**
     * feed组件
     *              -- Author by Dio Zhu. on 2017.2.8
     */
    export default {
        name: 'v-feed',

        props: {
            id: String,
            feedId: String,
            imgUrl: String,     // 头像地址
            msgNum: String,     // 头像右上角标识数字
            title: String,      // 用户名
            subtitle: String,   // 推广语
            sex: String,        // 性别: 0未知，1男，2女
            age: String,        // 年龄
            desc: String,        // 右上角备注，时间（13:00）或者距离（1.1km以内）
            classes: String,     // 附加class
            iconFunc: Function  // 点击头像的回调函数
        },

        data () {
            return {
            };
        },

        computed: {
            feedImg () {
                return utils.thumb(this.imgUrl);
            },
            /**
             * 根据feedid判断来源, 显示不同形式头像.
             * o、s方的，其他圆的, g是群组,六边形, 暂时不考虑.
             *              -- Author by Dio Zhu. on 2016.12.2
             */
            feedClass () {
                let rtn = '';
                if (/^o_/.test(this.feedId) || /^s_/.test(this.feedId)) {
                    rtn = 'square';
                } else if (/^g_/.test(this.feedId)) {
                    rtn = 'hexagon';
                } else {
                    rtn = 'circle';
                }
                return rtn;
            }
        },

        created () {
//            this.$logger.log('v-feed created...');
        },

        methods: {
            handleClick (e) {
                if (this.iconFunc && typeof this.iconFunc === 'function') {
                    e.stopPropagation();
                    e.preventDefault();
                    this.iconFunc();
                    this.$toast({message: '您是不是想去个人中心？', duration: 1000, position: 'bottom'});
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-feed {
        height: pxTorem(68px);
        background: #fff;
        border-bottom: #DDDEE3 1px solid;
        /*background: #DDDEE3;*/
        position: relative;

        //        @include box_flex;
        //        @include align_items(center);
        display: flex;
        align-items: center;

        > div {
            position: relative;
            /*@include flex_grow(0);
            @include flex_shrink(0);
            @include flex_basis(auto);*/
            flex: 0 0 auto;

            &:last-child {
                /*@include flex_grow(1);
                @include flex_shrink(1);*/
                flex: 1 1 auto;
            }
        }
    }

    .v-feed__img {
        width: pxTorem(54px);
        height: pxTorem(54px);
        margin-left: pxTorem(10px);
        margin-right: pxTorem(10px);
        position: relative;
        border: 0;

        img {
            width: 100%;
        }

        &.circle {
            -webkit-border-radius: 50%;
            -moz-border-radius: 50%;
            border-radius: 50%;
            overflow: hidden;
        }
        &.hexagon {
            height:pxTorem(46px);
            overflow: hidden;

            &:before {
                content: "";
                width: 0;
                height: 0;
                position: absolute;
                left: 0;
                top: 0;
                border-right: pxTorem(12px) solid transparent;
                border-top: pxTorem(23px) solid #FFF;
                border-bottom: pxTorem(23px) solid #FFF;
            }
            &:after {
                content: "";
                width: 0;
                height: 0;
                position: absolute;
                right: 0;
                top: 0;
                border-left: pxTorem(12px) solid transparent;
                border-top: pxTorem(23px) solid #FFF;
                border-bottom: pxTorem(23px) solid #FFF;
            }
        }
    }

    .small {
        height: pxTorem(52px);

        .v-feed__img {
            width: pxTorem(32px);
            height: pxTorem(32px);
            margin-left: pxTorem(15px);
        }

        .v-feed__tit {
            font-size: pxTorem(14px);
        }
        .v-feed__sub {
            font-size: pxTorem(12px);
        }
    }

    .v-feed__num {  /* 头像右上角数字 */
        width: pxTorem(18px);
        height: pxTorem(18px);
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;
        background: #FF3B2F;
        position: absolute;
        right:pxTorem(6px);
        top: pxTorem(-4px);
        font-size: pxTorem(12px);
        color: #FFF;
        line-height: pxTorem(18px);
        text-align: center;

        &.mix { /* 10以上不显示数字，只显示成红点儿 */
            width: pxTorem(10px);
            height: pxTorem(10px);
            color: transparent;
            right: pxTorem(8px);
            top: pxTorem(-2px);
        }
    }

    .v-feed__con {
        @include box_flex;
        //        @include flex-direction-column;
        margin-right: pxTorem(10px);
        flex-direction: column;
    }

    .v-feed__con-info {
        @include box_flex;
        @include flex-direction-row;
        @include justify-content(space-between);

        > div:last-child {
            @include flex_grow(1);
            @include flex_shrink(1);
            @include flex_basis(auto);
        }
    }

    .v-feed__tit {
        font-size: pxTorem(17px);
        line-height: 1;
    }
    .v-feed__sex { /* 性别icon */
        width: pxTorem(12px);
        height: pxTorem(12px);
        margin: pxTorem(1px) pxTorem(5px);
        text-align: center;
        /*font-size: pxTorem(8px);*/
        font-size: pxTorem(12px);
        line-height: pxTorem(12px);
        color: #FF88B2;
        /*background: #FF88B2;*/
        -webkit-border-radius: pxTorem(2px);
        -moz-border-radius: pxTorem(2px);
        border-radius: pxTorem(2px);

        &.icon-male { /* 男 */
            /*background: #4392EC;*/
            color: #4392EC;
        }
    }
    .v-feed__age {/* 年龄 */
        font-size: pxTorem(10px);
        line-height: pxTorem(17px);
        color: #777E8C;
    }
    .v-feed__desc {
        text-align: right;
        font-size: pxTorem(12px);
        line-height: 1;
        color: #8E8E93;
    }
    .v-feed__sub {
        margin-top: pxTorem(7px);
        font-size: pxTorem(14px);
        line-height: 1;
        color: #777E8C;
    }

</style>
