<script>
import {hasClass, addClass, removeClass} from '../src/utils/dom';

/**
 * 文字组件，可根据参数进行省略和展开。
 *              -- Author by Dio Zhu. on 2017.5.2
 */
export default {
    name: 'v-text',

    props: {
        value: String,      // 要显示的字符串
        limit: {            // 限定行数，0：不限制，1：限定一行，超出省略，以此类推
            type: Number,
            default: 0
        },
        length: Number,     // 限定内容长度，按此剪切，目的是不显示省略号
        expandEnabled: {    // 展开标识
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
        };
    },
    created () {
        //            this.$logger.log('v-text.created: ', this.expandEnabled);
    },
    methods: {
        handleClick () {
            let cls = 'limit' + this.limit;
            if (hasClass(this.$el, cls)) {
                removeClass(this.$el, cls);
            } else {
                addClass(this.$el, cls);
            }
        }
    },
    render (createElement) {
        let prop = {
            attrs: {id: 'vText' + this._uid},
            'class': [
                'v-text',
                this.limit === 1 ? 'single' : (this.limit ? 'limit' + this.limit : '')
            ]
        };
        if (this.expandEnabled) { // 是否添加展开事件
            prop.on = {click: this.handleClick};
        }
        return createElement(
            'p',
            prop,
            // this.value
            ((this.length && this.value) ? this.value.substring(0, this.length) : this.value)
        );
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";
    // @import "../scss/mixins";

    .v-text {
        font-size: pxTorem(15px);
        line-height: 1.2;
        text-align: justify;

        &.single {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        &[class*='limit'] {
            text-align: left;
            overflow: hidden;
            text-overflow: ellipsis;
            // 限定三行, 后面加..., 此方式为-webkit私有方法...存在一定的兼容性问题, 并非最佳方案. Author by Dio Zhu. on 2016.12.15
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
        }
        &.limit2 { -webkit-line-clamp: 2; }
        &.limit3 { -webkit-line-clamp: 3; }
        &.limit4 { -webkit-line-clamp: 4; }
        &.limit5 { -webkit-line-clamp: 5; }

        .re {
            display: inline-table;
            font-size: pxTorem(15px);
            line-height: pxTorem(19px);
            color: #007AFF;
        }
    }
</style>
