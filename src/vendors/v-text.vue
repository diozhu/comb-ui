<script>
import { hasClass, addClass, removeClass } from '../js/utils/dom';
/**
 * 文字组件，可根据参数进行省略和展开。
 *              -- Author by Dio Zhu. on 2017.5.2
 */
export default {
    name: 'v-text',
    props: {
        value: {
            type: [String, Number],
            default: ''
        },
        limit: {
            type: Number,
            default: 0
        },
        length: Number,
        expandEnabled: {
            type: Boolean,
            default: false
        },
        className: {
            type: String,
            default: ''
        }
    },
    data() {
        return {};
    },
    computed: {
        classes() {
            let cls = '';
            if (this.expandEnabled) cls = 'limit' + this.limit;
            else cls = this.limit === 1 ? 'single' : this.limit ? 'limit' + this.limit : '';
            return cls;
        }
    },
    created() {},
    methods: {
        handleClick() {
            let cls = 'limit' + this.limit;
            if ((hasClass(this.$el), cls)) removeClass(this.$el, cls);
            else addClass(this.$el, cls);
        }
    },
    render(createElement) {
        let prop = {
            attrs: { id: 'vText' + this._uid },
            class: ['v-text', this.className, this.classes]
        };
        if (this.expandEnabled) prop.on = { click: this.handleClick };
        if (this.center) prop.class.push('center');
        return createElement('p', prop, this.length && this.value ? this.value.substring(0, this.length) : this.value);
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
@import '../scss/variables';
@import '../scss/mixins';

.v-text {
    white-space: normal;
    word-break: break-all;
    text-align: left;

    &.single {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    &[class*='limit'] {
        /*text-align: left;*/
        /*overflow: hidden;*/
        /*text-overflow: ellipsis;*/
        /*// 限定三行, 后面加..., 此方式为-webkit私有方法...存在一定的兼容性问题, 并非最佳方案. Dio Zhu. on 2016.12.15*/
        /*display: -webkit-box;*/
        /*-webkit-line-clamp: 1;*/
        /*-webkit-box-orient: vertical;*/
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    &.limit2 {
        -webkit-line-clamp: 2;
    }
    &.limit3 {
        -webkit-line-clamp: 3;
    }
    &.limit4 {
        -webkit-line-clamp: 4;
    }
    &.limit5 {
        -webkit-line-clamp: 5;
    }

    .re {
        display: inline-table;
        font-size: 15px;
        line-height: 19px;
        color: #007aff;
    }
    .center {
        text-align: center;
    }
}
</style>
