<template>
    <div class="v-form">
        <!--v-if="options && options[index] && options[index]['type'] && options[index]['type'] != 'hidden'"-->
        <template
            v-for="(val, key, index) in currentValue"
        >
            <!--前面的分隔符-->
            <template v-if="dividers && dividers[index]">
                <div class="v-form__divider">
                    <slot :name="'slotB' + index">
                        <p v-if="dividers[index]['label']">{{dividers[index]['label']}}</p>
                    </slot>
                </div>
            </template>

            <!--上标题-->
            <template v-if="dividers && dividers[index]">
                <div v-if="dividers[index]['title']">
                    <div class="v-form__title" >{{dividers[index]['title']}} <span>（{{dividers[index]['describe']}}）</span></div>
                </div>
            </template>

            <!--渲染表单组件-->
            <v-form-item
                v-if="currentOptions && currentOptions[key] && currentOptions[key]['type'] && currentOptions[key]['type'] != 'hidden'"
                :key="'VFI_' + key"
                v-model="currentValue[key]"
                :option="currentOptions[key]"
                @fun="typeof currentOptions[key]=== 'function' && currentOptions[key]['cb']() || ''"
                :idx="index"
                :attr="key"
                :class="{'last': dividers && dividers[key]}"
                :validator="validators && validators[key]"
            ></v-form-item>

            <!--后面的分隔符-->
            <template v-if="dividers && dividers[key]">
                <div class="v-form__divider">
                    <slot :name="'slotE' + index">
                        <p v-if="dividers[key]['label']">{{dividers[key]['label']}}</p>
                    </slot>
                </div>
            </template>

            <!--下标题-->
            <template v-if="dividers && dividers[key]">
                <div v-if="dividers[key]['title']">
                    <div class="v-form__title" >{{dividers[key]['title']}} <span>（{{dividers[key]['describe']}}）</span></div>
                </div>
            </template>
        </template>
    </div>
</template>
<script>
    /**
     * v-form
     * @param value Object 传入的绑定对象，规定表单中有多少字段；
     * @param options Object 传入的字段描述对象，描述每个字段为什么类型的组件，及disabled等限制条件；
     * @param dividers Object 传入的分隔对象，可按位置和字段放置，提供slot；
     * @param validators Object 传入的校验对象；
     *              -- Author by Dio Zhu. on 2018.5.17
     */
    import vFormItem from '../vendor/v-form-item';
    import vCell from '../vendor/v-cell';
    import vRadio from '../vendor/v-radio';
    import clickoutside from '../js/utils/clickoutside';
    import vPopup from '../vendor/v-popup';
    import * as utils from '../js/utils/utils'; //eslint-disable-line
    import vPicker from '../vendor/v-picker';
    import vDatetimePicker from '../vendor/v-datetime-picker';
    import Vue from 'vue';
    import Validator from '../vendor/v-validator.js';
    Vue.use(Validator);

    export default {
        name: 'v-form',

        components: { vFormItem, vCell, vRadio, vPopup, vPicker, vDatetimePicker },
        directives: { clickoutside },
        props: {
            value: {                // 绑定表单字段对象的默认值
                type: Object,
                default: () => {}
            },
            options: {              // 各字段对象的组件类型声明，及组件的各种依赖参数
                type: Object,
                default: () => {}
            },
            dividers: {             // 表单分隔符，可按对象下标数（放前面）、字段名（放后面）
                type: Object,
                default: () => {}
            },
            validators: {           // 各字段对象的校验规则
                type: Object,
                default: () => {}
            }
        },

        data () {
            return {
                currentValue: this.value,
                currentOptions: this.options
            };
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                // this.$logger.log('【v-form】watch.currentValue: ', val);
                this.$emit('input', val);
            },
            options (val) {
                this.currentOptions = val;
                this.init();
            },
            currentOptions (val) {
                this.$emit('handleChangeOptions', val);
            }
        },

        created () {
            this.init();
        },

        methods: {
            init () {
                // this.$logger.log('【v-form】init... ', this.options);
                for (let key in this.options) { // 自定义显示条件，根据传入的表达式对象进行显示判断。
                    if (this.options.hasOwnProperty(key) && this.options[key]['displayExpr']) {
                        this.bindWatcher(key, this.options[key]['displayExpr']);
                    }
                }
                this.checkValidator(); // 检测默认特定逻辑的校验规则，比如证件类型、证件号
            },
            bindWatcher (attr, expr) { // 根据自定义显示条件，添加watcher~ Author by Dio Zhu. on 2018.5.15
                if (!expr || !expr.exp || !expr.key || !expr.val) return;
                let key = 'currentValue.' + expr.key;
                let fn = (k, v, o) => {
                    // this.$logger.log('【v-form】bindWatcher.fn:**** ', k, v, o, this.options, attr);
                    if (expr.exp === '!==') {
                        // 数据还没有加载过来，此处就执行，会报错 - Added By 刘俊俊 2018.6.28
                        if (this.options[attr]) {
                            if (expr.val !== v) this.$set(this.options[attr], 'hidden', false);
                            else this.$set(this.options[attr], 'hidden', true);
                        }
                    }
                };
                this.$watch(key, fn.bind(this, expr.key));
                let arr = expr.key.split('.'), obj = null;
                [].forEach.call(arr, (v, i) => {
                    if (i === 0) obj = this.currentValue[v];
                    else obj = obj[v];
                });
                fn(key, obj);
                // this.$logger.log('【v-form】bindWatcher: ', expr, expr.key, obj);
            },
            checkValidator () { // 检测默认特定逻辑的校验规则，比如证件类型、证件号~ Author by Dio Zhu. on 2018.5.15
                // this.$logger.log('【v-form】checkValidator: ', this.validators);
                if (!this.validators) return;
                let fn = (k, v, o) => { // 根据证类型校验证件号的合法性
                    let attr = k.replace('IdentyType', 'IdentyNo'), // 根据证件类型，找到证件号码的字段名
                        key = this.options[k] && this.options[k]['key'] || 'key', // 取出options中指定的key标识
                        val = v[key],   // 按标识取出当前证件对象的key值
                        vid = this.validators && this.validators[attr] && this.validators[attr]['key']; // 取出之前validator的key值，用于还原提示顺序
                    // this.$logger.log('【v-form】checkValidator.fn: ', k, attr, val, vid, v, key);
                    if (parseInt(val) === 0 || parseInt(val) === 1) { // 身份证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写身份证号码' }, card: { message: '请输入正确的身份证号' } });
                    } else if (parseInt(val) === 2) { // 护照验证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写护照号码' }, passport: { message: '请输入正确的护照号码' } });
                    } else if (parseInt(val) === 3) { // 军人身份证验证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写军人身份证号' }, sorderIdenty: { message: '请输入正确的军人身份证号' } });
                    } else if (parseInt(val) === 4) { // 社保卡验证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写社保卡号' }, socialSecurityCard: { message: '请输入正确的社保卡号' } });
                    } else if (parseInt(val) === 5) { // 港澳通行证验证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写港澳通行证号' }, hongKongMacauPasser: { message: '请填写正确的港澳通行证号' } });
                    } else if (parseInt(val) === 6) { // 台湾往来大陆通行证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写台湾往来大陆通行证号' }, taiwanPasser: { message: '请填写正确的台湾往来大陆通行证号' } });
                    } else if (parseInt(val) === 7) { // 户口簿验证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写户口簿号码' }, taiwanPasser: { message: '请填写正确的户口簿号码' } });
                    } else if (parseInt(val) === 8) { // 临时居民身份证验证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写临时居民身份证号码' }, taiwanPasser: { message: '请填写正确的临时居民身份证号码' } });
                    } else if (parseInt(val) === 9) { // 外国人永久居留证
                        this.$set(this.validators, attr, { key: vid, required: { rule: true, message: '请填写永久居留证号码' } });
                    }

                    // 证件类型为非身份证时，证件照必填。Author by Dio Zhu. on 2018.6.21
                    let imgAttr = k.replace('IdentyType', 'IdentyImages'), // 根据证件类型，找到证件照的字段名
                        imgId = this.validators && this.validators[imgAttr] && this.validators[imgAttr]['key']; // 取出之前validator的key值，用于还原提示顺序
                        // imgVal = this.currentValue[imgAttr],
                        // imgMsg = this.validators[imgAttr] && this.validators[imgAttr]['required'] && this.validators[imgAttr]['required']['message'];
                    // this.$logger.log('【v-form】checkValidator.checkIdentyImages: ', imgAttr, imgId, imgVal, imgMsg, this.$parent.$validation);

                    let attrName = '';
                    if (imgAttr.indexOf('firstparty') >= 0) {
                        attrName = '甲方';
                    } else if (imgAttr.indexOf('student') >= 0) {
                        attrName = '学员';
                    }

                    let tmp = parseInt(val);
                    if (tmp === 0 || tmp === 1) { // 身份证
                        this.$set(this.validators, imgAttr, { key: imgId });
                        this.$set(this.validators, 'sex', { key: 14 });
                        this.$set(this.validators, 'birthday', { key: 16 });
                        // Vue.$validation[imgId] = {};
                        this.$parent.$set(this.$parent.$validation, imgId, {});
                        this.$parent.$set(this.$parent.$validation, 14, {});
                        this.$parent.$set(this.$parent.$validation, 16, {});
                    } else if (tmp === 2 || tmp === 3 || tmp === 4 || tmp === 5 || tmp === 6 || tmp === 7 || tmp === 8 || tmp === 9) { // 护照验证
                        this.$set(this.validators, imgAttr, { key: imgId, required: { rule: true, message: '请上传' + attrName + '证件图片' } });
                        this.$set(this.validators, 'sex', { key: 14, required: {rule: true, message: '请选择性别'} });
                        this.$set(this.validators, 'birthday', { key: 16, required: {rule: true, message: '请输入学员出生日期'} });
                    }
                };
                for (let k in this.validators) {
                    // 判断是否是身份证，增加特殊验证规则
                    if (k.indexOf('IdentyType') >= 0) {
                        this.$watch('currentValue.' + k, fn.bind(this, k));

                        // 初始化调用一次，确保开始就验证
                        // let key = k.replace('IdentyType', 'IdentyImages');
                        fn(k, this.currentValue[k]);
                    }
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-form {

        .v-cell {
            /*min-height: pxTorem(55);*/

            .v-cell__value span {
                color: #1B1B20;
                font-weight: 500;
            }
        }

        .v-form-item.last .v-cell__wrapper{
            border: none;
        }

        .v-form__divider {
            min-height: pxTorem(12);
            background: #F8F9F8;
            overflow: auto;
            border-top: 1px solid #E3E3E3;
            border-bottom: 1px solid #E3E3E3;

            > p {
                box-sizing: border-box;
                height: pxTorem(20);
                margin: pxTorem(11) 0 pxTorem(4) 0;
                padding: 0 0 0 pxTorem(20);
                font-size: pxTorem(14);
                line-height: pxTorem(20);
                color: #9D9D9D;
            }
        }
        .v-form__title{
            margin-top: pxTorem(7);
            border-left: pxTorem(4) solid #fdd108;
            padding: pxTorem(5) pxTorem(5) pxTorem(5) pxTorem(10);
            font-size: pxTorem(14);
            font-weight: 700;
            span{
                color: red;
                font-weight: normal;
            }
        }
    }
</style>
