<template>
    <dl class="v-checkbox"
        :class="[
            {list: !tagsMode},
            {tags: tagsMode},
            { 'limit': max <= currentValue.length }]"
        @change="$emit('change', currentValue)"
    >
        <dt v-if="label" :class="[labelClasses]">{{ label }}</dt>
        <dd :class="[{'m-l': !label}]">
            <label
                v-if="checkAll && this.options.length > 1"
                :for="'vCheckBox' + _uid + '-1'"
                :class="['v-checkbox__checkall', {reverse: reverse}, {checked: currentObj['-1'] === true}]"
            >
                <input type="checkbox" :id="'vCheckBox' + _uid + '-1'" class="v-checkbox__input"
                       v-model="checkAllValue"
                       value="-1"
                >
                <div class="v-checkbox__label">{{ checkAll }}</div>
                <i class="v-checkbox__icon icon icon-check" :class="[radioClasses, {right: reverse}]"></i>
            </label>
            <label v-for="(option, idx) in options"
                   :class="[
                       {slot: $slots['slot' + idx]},
                       {start: idx === 0 || (slotStart && idx == slotStart)},
                       {checked: currentObj[idx] === true},
                       {reverse: reverse}]"
            >
                <input type="checkbox"
                       class="v-checkbox__input"
                       v-model="currentValue"
                       :disabled="option.disabled"
                       :value="option.value || option"
                >
                <div class="v-checkbox__label">
                    <slot :name="'slot' + idx">{{ option.label || option }}</slot>
                    <!--<slot :name="'slot' + idx"><span>{{ option.label || option }}</span></slot>-->
                    <slot :name="'link' + idx"></slot>
                </div>
                <i class="v-checkbox__icon icon icon-check" :class="[radioClasses, {right: reverse}]"></i>
            </label>
        </dd>
    </dl>
</template>
<script type="text/ecmascript-6">
    import _ from 'lodash'; //eslint-disable-line

    /**
     * radio组件
     * @param {string[], object[]} options - 选项数组，格式：
     *      [{label: 'label', value: 'value', disabled: true}]
     *      或
     *      ['ab', 'cd', 'ef']
     *              -- Author by Dio Zhu. on 2017.1.11
     */
    export default {
        name: 'v-checkbox',
        props: {
            id: String,
            label: String,          // 标题
            labelClasses: String,   // 标题的样式
            radioClasses: String,   // 选框的样式
            reverse: {              // 选框的位置是否需要前置，默认在右边
                type: Boolean,
                default: false
            },
            tagsMode: {             // 是否使用标签形式
                type: Boolean,
                default: false
            },
            options: {              // 选项列表
                type: Array,
                required: true
            },
            max: Number,            // 选择限制
            value: Array,
            checkAll: String,       // 是否显示'全选'，如果是，按照传入的字样进行显示，点击选择全部
            checkAllFunc: Function // 全选的操作逻辑，默认依照value和options的长度简单判断，特殊逻辑（企通组织结构切换上下级时需保存每次的选择结果），依照形参函数进行判断
//            opts: Object
        },
        data () {
            return {
                currentValue: this.value,
                checkAllValue: [],
                currentObj: {},
                slotStart: 0        // 显示slot分隔的位置，用于css样式分割
            };
        },
        computed: {
            limit () {
                return this.max < this.currentValue.length;
            }
        },
        watch: {
            value (val) {
                console.log(`v-checkbox.${this._uid}.watch ===> value: `, val);
                this.currentValue = val;

                if (this.checkAll) { // 全选逻辑
                    if (typeof this.checkAllFunc === 'function') { // 如果定制了全选函数逻辑，执行后处理，如果未定职，执行默认的长度匹配逻辑
                        this.checkAllFunc(val).then(res => {
                            console.log(`v-checkbox.${this._uid}.watch ===> currentValue: checkAllFunc.callback!!!`, res);
                            if (!res && this.checkAllValue.length > 0) {
                                this.checkAllValue = []; // 取消任何一个选项，恢复全选状态
                            } else if (res && this.checkAllValue.length < 1) {
                                this.checkAllValue = ['-1'];
                            }
                        });
                    } else if (val.length !== this.options.length && this.checkAllValue.length > 0) { // 值变化，修改全选状态
                        this.checkAllValue = []; // 取消任何一个选项，恢复全选状态
                    } else if (val.length === this.options.length && this.checkAllValue.length < 1) {
                        this.checkAllValue = ['-1'];
                    }
                }
                this._initCurrentObj(val); // 初始化已选标识，用于list中的css标识checked，源于:checked ~ 只支持ios9.3以上Safari. Add by Dio Zhu. on 2017.8.3
            },

            currentValue (val) {
                console.log(`v-checkbox.${this._uid}.watch ===> currentValue: `, val);
                if (this.limit) {
                    val.pop();
                    return;
                }
                this.$emit('input', val);
            },

            checkAllValue (val) { // 全选值变化，改变所有值
                if (!this.checkAll) return;

//                if (val.length > 0) { // 全选
//                    console.log('v-checkbox.watch.checkAllValue: select All!!!');
// //                    if (!this.currentValue.length && this.currentValue.length !== this.options.length) { // 判断是否需要重新赋值
//                    let rtn = [];
//                    this.options.forEach((v) => {
//                        rtn.push(v.value || v);
//                    });
//                    this.$set(this, 'currentValue', rtn);
// //                    }
//                } else if (this.currentValue.length && this.currentValue.length === this.options.length) { // 取消全选
//                    console.log('v-checkbox.watch.checkAllValue: clear All!!!');
//                    this.$set(this, 'currentValue', []);
//                }

                if (typeof this.checkAllFunc === 'function') { // 从vurrentValue中依次添加、删除
                    if (val.length > 0) { // 全选
                        console.log('v-checkbox.watch.checkAllValue: select All !@#');
                        let adds = [];
                        this.options.forEach((v) => {
                            if (!_.find(this.currentValue, function (i) { return i.nodeId === v.nodeId; })) adds.push(v.value || v);
                        });
                        if (adds.length > 0) this.currentValue = this.currentValue.concat(adds);
                    } else if (this.currentValue.length && this.currentValue.length >= this.options.length) { // 取消全选
                        console.log('v-checkbox.watch.checkAllValue: clear All !@#');
                        let dels = [...this.currentValue]; // 原想通过深度拷贝避免vue连续的变更，但实际发现，就算直接循环去删除，vue还是在nexttick提交变化。。。白操心了。。Dio Zhu. on 2017.5.12
                        this.options.forEach((v) => {
                            dels.forEach((m, n) => {
                                if (parseInt(m.nodeId) === parseInt(v.nodeId)) dels.splice(n, 1);
                            });
                        });
//                        console.log('v-checkbox.watch.checkAllValue: clear All !@#', dels, this.currentValue);
                        if (dels.length !== this.currentValue.length) this.$set(this, 'currentValue', dels);
                    }
                } else if (val.length > 0) { // 全选
                    console.log('v-checkbox.watch.checkAllValue: select All!!!');
                    let rtn = [];
                    this.options.forEach((v) => {
                        rtn.push(v.value || v);
                    });
                    this.$set(this, 'currentValue', rtn);
                } else if (this.currentValue.length && this.currentValue.length === this.options.length) { // 取消全选
                    console.log('v-checkbox.watch.checkAllValue: clear All!!!');
                    this.$set(this, 'currentValue', []);
                }
            },

            options (val) { // options 变化，循环slots，添加分割标记
                console.log(`v-checkbox.${this._uid}.watch ===> options: `, val, this.$slots);
                this.slotStart = 0;
                Object.keys(this.$slots).forEach((v) => {
//                    console.log(`v-checkbox.${this._uid}.getSlotStart: `, v);
                    if (!this.slotStart && v.indexOf('slot') >= 0) {
                        this.slotStart = v.substring(4);
                    }
                });

                // options变化，校验checkAll
                if (this.checkAll && typeof this.checkAllFunc === 'function') {
                    let flag = true;
                    this.options.forEach((v) => {
                        if (!_.find(this.currentValue, function (x) { return x.nodeId === v.nodeId; })) flag = false;
                    });
                    if (flag && this.checkAllValue.length < 1) {
                        this.$set(this, 'checkAllValue', ['-1']);
                    } else if (!flag && this.checkAllValue.length > 0) {
                        this.$set(this, 'checkAllValue', []);
                    }
                }
            }
        },

        created () {
            console.log(`v-checkbox.${this._uid}.created: `);
            this._initCurrentObj(this.value); // 初始化已选标识，用于list中的css标识checked，源于:checked ~ 只支持ios9.3以上Safari. Add by Dio Zhu. on 2017.8.3
        },
        mounted () {
            console.log(`v-checkbox.${this._uid}.mounted: `);
        },
        methods: {
            // 循环设定currentObj的属性值，用于list中显示是否已选，原因是css中:checked ~不支持ios9.3以下的Safari。。。mod by Dio Zhu. on 2017.8.3
            _initCurrentObj (val) {
                this.options.forEach((va, ix) => {
                    // console.log('!!!!!!!!', ix, va);
                    this.currentObj[ix] = false;
                    [].forEach.call(val, (v, i) => {
                        // console.log('#####', i, v);
                        if (va === v || (va.value && va.value === v)) this.currentObj[ix] = true;
                    });
                });
                console.log('v-checkbox._initCurrentObj: ', this.checkAllValue);
                if (this.checkAllValue.length) {
                    this.currentObj['-1'] = true;
                } else {
                    this.currentObj['-1'] = false;
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $line-height: pxTorem(44px);
    $line-height-double: pxTorem(64px);
    $tit-color: #000;
    $tit-color-light: #737373;
    $placeholder-color: #007AFF;
    $color-grey: #d9d9d9;
    $color-white: #FFF;
    $color-blue: #4CD864;
    $icon-color: #007AFF;
    $icon-diabled-color: #f2f2f4;
    $icon-diabled-border-color: #ccc;

    .v-checkbox {
        position: relative;
        // height: 100%;
        // @include box_flex;
        // @include align_items(stretch);
        // @include justify-content(space-between);
        display: flex;
        align-items: stretch;
        justify-content: space-between;
        flex-direction: row;

        dt, dd {
            display: block;
        }
        dt {
            width: 24%;
            // font-size: pxTorem(15px);
            // padding-left: pxTorem(15px);
            // padding-top: pxTorem(15px);
            // @include flex_grow(0);
            // @include flex_shrink(0);
            // @include flex_basis(auto);
            flex-grow: 0;
            flex-shrink: 0;
            flex-basis: auto;
            display: flex;
            align-items: center;

            &.light {
                color: #737373;
            }
        }
        dd {
            width: 76%;
            // @include flex_grow(1);
            // @include flex_shrink(1);
            // @include flex_basis(auto);
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: auto;

            .icon {
                /*display: none;*/
                color: transparent;
                /*order: -1;*/

                &.right {
                    order: 9;
                }

                &.disk {
                    width: pxTorem(23px);
                    height: pxTorem(23px);
                    text-align: center;
                    font-size: pxTorem(14px);
                    line-height: pxTorem(23px);
                    color: #FFF;
                    background: transparent;
                    border: $icon-color pxTorem(1px) solid;
                    margin-top: pxTorem(-1px);
                    -webkit-border-radius: 50%;
                    -moz-border-radius: 50%;
                    border-radius: 50%;
                }
            }
        }

        &.list {

            label {
                /*height: $line-height;
                line-height: $line-height;
                font-size: pxTorem(15px);*/

                // @include box_flex;
                // @include align_items(center);
                // @include justify-content(flex-start);
                display: flex;
                align-items: center;
                justify-content: flex-start;

                &.reverse {
                    /*@include box_flex;
                    @include align_items(center);
                    @include justify-content(space-between);*/
                    .icon {
                        order: -1;
                    }
                }

                .v-checkbox__label {
                    min-height: $line-height;
                    line-height: $line-height;
                    font-size: pxTorem(15px);

                    // @include flex_grow(1);
                    // @include flex_shrink(1);
                    // @include flex_basis(auto);
                    flex-grow: 1;
                    flex-shrink: 1;
                    flex-basis: auto;

                    display: flex;
                    justify-content: space-between;
                }

                .v-checkbox__icon {
                    // @include flex_grow(0);
                    // @include flex_shrink(0);
                    // @include flex_basis(auto);
                    flex-grow: 0;
                    flex-shrink: 0;
                    flex-basis: auto;
                }

                // .v-checkbox__input{
                //     @include flex_grow(1);
                //     @include flex_shrink(1);
                //     @include flex_basis(auto);
                // }
                .v-checkbox__input:checked ~ .v-checkbox__icon {
                    /*display: block;*/
                    color: $icon-color;

                    &.disk {
                        color: #FFF;
                        background: $icon-color;
                    }

                    &::after {
                        border-color: $color-white;
                        transform: rotate(45deg) scale(1);
                    }
                }
                // .v-checkbox__input:checked ~ .v-checkbox__label {
                //     color: $icon-color;
                // }
            }

        }
        &.tags {
            @include align_items(stretch);

            dd {
                margin-bottom: pxTorem(15px);
            }

            label {
                display: inline-block;
                /*font-size: pxTorem(14px);
                line-height: 1;
                padding: pxTorem(4px) pxTorem(13px);
                margin-top: pxTorem(15px);
                margin-right: pxTorem(10px);
                border: #DDDEE3 1px solid;
                border-radius: pxTorem(2px);*/

                .v-checkbox__label {
                    font-size: pxTorem(14px);
                    line-height: 1;
                    padding: pxTorem(4px) pxTorem(13px);
                    margin-top: pxTorem(15px);
                    margin-right: pxTorem(10px);
                    border: #DDDEE3 1px solid;
                    border-radius: pxTorem(2px);

                }
                .v-checkbox__input, .v-checkbox__icon {
                    display: none;
                }

                .v-checkbox__input:checked ~ .v-checkbox__label {
                    background: #3395FF;
                    border-color: #3395ff;
                    color: #FFF;
                }
                /*.v-checkbox__input:checked + {
                    background: #3395FF;
                    border-color: #3395ff;
                    color: #FFF;
                }*/
            }
        }

    }

    .v-checkbox { // max限制
        &.list {
            &.limit {
                .v-checkbox__input:checked ~ .v-checkbox__icon{
                    color: $icon-diabled-border-color!important;

                    &.disk {
                        color: $icon-diabled-border-color!important;
                        background: $icon-diabled-color!important;
                        border-color: $icon-diabled-border-color!important;
                    }
                }
                .v-checkbox__input:not(:checked) ~ .v-checkbox__icon {
                    /*.v-checkbox__icon:not(:checked) {*/
                    color: #FFF;

                    &.disk {
                        color: transparent!important;
                        background: transparent!important;
                        border-color: $icon-diabled-border-color!important;
                    }
                }
            }
        }
        &.tags {
            &.limit {
                .v-checkbox__input:checked ~ .v-checkbox__label{
                    // color: $icon-diabled-border-color!important;
                    // background: $icon-diabled-color!important;
                }
                .v-checkbox__input:not(:checked) ~ .v-checkbox__label {
                    /*.v-checkbox__icon:not(:checked) {*/
                    color: $icon-diabled-border-color!important;
                }
            }
        }
    }

    .v-checkbox__label {

    }

    .v-checkbox__input {
        display: none;
    }

    .v-checkbox__icon {
        /*display: none;*/
        margin-right: pxTorem(15px);
        font-size: pxTorem(23px);
        color: #007AFF;

        &.icon-check {
            font-size: pxTorem(14px);
        }
        &.show {
            display: block;
        }
    }


</style>
