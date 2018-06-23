<template>
    <div class="v-row" :style="style"
         :class="[
        justify !== 'start' ? 'is-justify-' + justify : '',
        align !== 'top' ? 'is-align-' + align : '',
        avg ? 'avg' : '',
        { 'v-row__flex': type === 'flex' }
        ]"
    >
        <slot></slot>
    </div>
</template>
<script type="text/ecmascript-6">
export default {
    name: 'v-row',

    props: {
        gutter: {
            type: Number,
            default: 0
        },
        type: String,
        justify: { // default: start, // start, end, center, space-between, space-around
            type: String,
            default: 'start'
        },
        align: {
            type: String,
            default: 'top'
        },
        avg: {  // 其中的每列是否平均分配边距（padding），使列中内容绝对居中
            type: Boolean,
            default: false
        }
        //            aligment: { // 重置基线（padding），其内所有行（row)、列（col）无沟槽
        // type: Boolean,
        // default: false
        //            }
    },

    data () {
        return {
            dpr: window.lib.flexible.dpr || 1,
            ratio: 37.5 // UI的设计图比例，用于计算pxTorem
        };
    },

    computed: {
        style () {
            let ret = {};

            if (this.gutter) {
                //     ret.marginLeft = `-${this.gutter * this.dpr / 2}px`;
                ret.marginLeft = `-${this.gutter / this.ratio / 2}rem`;
                ret.marginRight = ret.marginLeft;
            }

            return ret;
        }
    },
    mounted () {
        // this.$logger.log('v-row.mounted: ', this.$el, this.$el.childNodes);
        if (this.avg && this.gutter) {
            [].forEach.call(this.$el.childNodes, (v, i) => {
                if (i === 0) {
                    //         v.style.paddingLeft = `${this.gutter * this.dpr / 2}px`;
                    v.style.paddingLeft = `${this.gutter / this.ratio / 2}rem`;
                } else if (i === this.$el.childNodes.length - 1) {
                    //         v.style.paddingRight = `${this.gutter * this.dpr / 2}px`;
                    v.style.paddingRight = `${this.gutter / this.ratio / 2}rem`;
                } else {
                    //         v.style.paddingLeft = `${this.gutter * this.dpr / 4}px`;
                    //         v.style.paddingRight = v.style.paddingLeft;
                }
            });
            // this.$el.firstChild.style.marginLeft = `${this.gutter * this.dpr / 2}px`;
            // this.$el.lastChild.style.marginRight = `${this.gutter * this.dpr / 2}px`;
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    .v-row {
        display: flex;
        flex-wrap: wrap;

        &.is-justify-space-between {
            justify-content: space-between;
        }
        &.is-justify-center {
            justify-content: center;
        }
        &.is-justify-start {
            justify-content: flex-start;
        }
        &.is-justify-end {
            justify-content: flex-end;
        }
        &.is-justify-space-around {
            justify-content: space-around;
        }

        > a {
            width: 100%;
        }
    }
</style>
