<template>
    <a class="v-cell" :href="href">
        <!--<span class="v-cell__mask" v-if="isLink"></span>-->
        <!--<div class="v-cell__left">-->
        <!--<slot name="left"></slot>-->
        <!--</div>-->
        <div class="v-cell__wrapper">
            <div class="v-cell__title" v-if="title || $slots.title" :class="[{reverse}]">
                <slot name="icon">
                    <i v-if="icon" class="app icon" :class="'icon-' + icon"></i>
                </slot>
                <slot name="title">
                    <!--<span class="v-cell__text" v-text="title"></span>-->
                    <!--<span v-if="label" class="v-cell__label" v-text="label"></span>-->
                    <span class="v-cell__text">
                        {{ title }}
                        <span v-if="label" class="v-cell__label" v-text="label"></span>
                    </span>
                </slot>
            </div>
            <div class="v-cell__value" :class="{ 'is-link' : isLink }" v-if="value || desc || $slots.default">
                <slot>
                    <span v-text="value"></span>
                    <span v-text="desc"></span>
                </slot>
            </div>
        </div>
        <div class="v-cell__right" v-if="$slots.right">
            <slot name="right"></slot>
        </div>
        <i v-if="isLink" class="v-cell__allow-right"></i>
    </a>
</template>
<script type="text/ecmascript-6">
/**
 * v-cell
 */
export default {
    name: 'v-cell',

    props: {
        to: [String, Object],   // 路由对象或href
        icon: String,           // 可传入iconfont名称不包含'icon-'部分
        reverse: Boolean,       // 图标反转标识
        title: String,          // 标题
        label: String,          // 子标题
        isLink: Boolean,        // 右侧箭头图标显示
        value: {},              // 右侧内容
        desc: String            // 右侧注释，会被value覆盖
    },
    computed: {
        href () {
            if (this.to && !this.added && this.$router) {
                const resolved = this.$router.match(this.to);
                console.log('v-cell.computed.href: ', resolved);
                if (!resolved.matched.length) return this.to;

                this.$nextTick(() => {
                    this.added = true; //eslint-disable-line
                    this.$el.addEventListener('click', this.handleClick);
                });
                return resolved.path;
            }
            return this.to;
        }
    },

    created () {
        // console.log('v-cell.created: ');
    },

    methods: {
        handleClick ($event) {
            this.$emit('handleClick', $event);
            console.log('v-cell.handleClick: ');
            $event.preventDefault();
            this.$router.push(this.to);
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    $line-height: pxTorem(44px);
    .v-cell {
        // background-color:#fff;
        box-sizing:border-box;
        color:inherit;
        min-height: $line-height;
        display:block;
        overflow:hidden;
        position:relative;
        text-decoration:none;

        > div {
            border-bottom: #DDDEE3 1px solid;
        }
        &:last-child {
            border-bottom: 0;
        }

        &.noborder {

            .v-cell__wrapper {
                border: none;
            }
        }
    }
    .v-cell img {
        vertical-align:middle;
    }
    .v-cell:first-child .v-cell__wrapper {
        background-origin:border-box;
    }
    .v-cell:last-child {
        /*background-image:-webkit-linear-gradient(bottom, #d9d9d9, #d9d9d9 50%, transparent 50%);*/
        /*background-image:linear-gradient(0deg, #d9d9d9, #d9d9d9 50%, transparent 50%);*/
        /*background-size:100% 1px;*/
        /*background-repeat:no-repeat;*/
        /*background-position:bottom;*/
    }
    .v-cell__wrapper {
        /*background-image:-webkit-linear-gradient(top, #d9d9d9, #d9d9d9 50%, transparent 50%);*/
        /*background-image:linear-gradient(180deg, #d9d9d9, #d9d9d9 50%, transparent 50%);*/
        /*background-size: 120% 1px;*/
        /*background-repeat: no-repeat;*/
        /*background-position: top left;*/
        /*background-origin: content-box;*/
        /*width: 100%;*/
        height: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: stretch;
        justify-content: flex-start;
        font-size: pxTorem(14);
        line-height: 1;
        min-height: inherit;
        overflow: hidden;
        padding: 0 pxTorem(15px) 0 0;
        margin: 0 0 0 pxTorem(15px);
    }
    .v-cell__mask {}
    .v-cell__mask::after {
        background-color:#000;
        content:" ";
        opacity:0;
        top:0;
        right:0;
        bottom:0;
        left:0;
        position:absolute;
    }
    .v-cell__mask:active::after {
        opacity:.1;
    }
    .v-cell__text {
        vertical-align: middle;
        font-size: pxTorem(14);
        font-weight: 500;
        color: #3E3A39;
    }
    .v-cell__label {
        color: #888;
        display: block;
        font-size: pxTorem(12px);
        margin-top: pxTorem(6px);
    }
    .v-cell__title {
        text-align: left;
        min-width: pxTorem(76px);
        /*-webkit-box-flex: 1;*/
        /*-ms-flex: 1;*/
        /*flex: 1;*/
        /* @include flex_grow(1);
         @include flex_shrink(1);
         @include flex_basis(auto);*/
        /*flex: 1 1 auto;*/
        flex-shrink: 0;
        flex-grow: 0;
        flex-basis: auto;
        display: flex;
        align-items: center;

        .icon {
            margin-right: pxTorem(8px);
            font-size: pxTorem(14);

            &.disk {
                width: pxTorem(30px);
                height: pxTorem(30px);
                background: #007aff;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: pxTorem(3px);
                /*margin: 0;*/
            }
        }
    }
    .v-cell__title.reverse {
        flex-direction: row-reverse;
        flex-grow: 1;

        >div,
        .v-cell__text {
            flex-grow: 1;
        }

        .icon {
            margin: 0;
        }
    }
    .v-cell__value {
        position: relative;
        color: #888;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-left: pxTorem(10px);
        /*flex: 1 1 auto;*/
        flex-shrink: 1;
        flex-grow: 1;
        flex-basis: auto;

        span {
            font-size: pxTorem(14);

            &:first-child { // 兼容input样式。 mod by Dio Zhu. on 2018.5.10
                padding: 0 pxTorem(10) 0 0;
            }
        }

        > div {
            flex: 1 1 auto;
        }

        input {
            width: 100%;
            min-height: pxTorem(30px);
            /*padding-left: pxTorem(10px);*/
            font-size: pxTorem(15px);
            line-height: 1;
            overflow: hidden;
        }
    }
    .v-cell__value.is-link {
        margin-right: pxTorem(15px);
    }
    .v-cell__left {
        position: absolute;
        height: 100%;
        left: 0;
        -webkit-transform: translate3d(-100%, 0, 0);
        transform: translate3d(-100%, 0, 0);
    }
    .v-cell__right {
        position: absolute;
        height: 100%;
        right: 0;
        top: 0;
        -webkit-transform: translate3d(100%, 0, 0);
        transform: translate3d(100%, 0, 0);
    }
    .v-cell__allow-right::after {
        border: solid 2px #3e3a39;
        border-bottom-width: 0;
        border-left-width: 0;
        content: " ";
        top:50%;
        right:pxTorem(15px);
        position: absolute;
        width: pxTorem(7);
        height: pxTorem(7);
        -webkit-transform: translateY(-50%) rotate(45deg);
        transform: translateY(-50%) rotate(45deg);
    }

</style>
