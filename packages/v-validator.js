/**
 * 校验
 *              -- Author by Dio Zhu. on 2017.8.15
 */
// 修改说明---孙硕--2018，2，27
// 先前的验证是通过bind的时候执行一次验证条件的筛选，然后全部加入观察者（$watch）--在触发正则条件的时候讲文案统一加入到$validation
// 中,然后在使用的页面通过遍历validation的方式逐一弹出提示，现在由于有判断条件根据用户交互而改变的需求，因此只执行一次的bind无法满足

import Vue from 'vue';
import * as utils from '../src/utils/utils.js';

const ctx = '@@Validator'; //eslint-disable-line

// === base ===

let validate = function () {
        console.log(`【validator】${this.vm._uid}.doUpdate！！！ `, JSON.stringify(this.expression), this);
        if (!this) return;
        // if (this.watchs && this.watchs.length) [].forEach.call(this.watchs, v => { v(); });
        // this.watchs = []; // 清除所有绑定事件，这个不能删，避免重复绑定多次执行。。。mod by Dio Zhu. on 2018.5.9
        this.field = this['validate_id'] || this.vm._uid;
        Vue.$validation[this.field] = {};
        if (this.field) {
            if (!Vue.$validation[this.field]) Vue.$validation[this.field] = Vue.prototype.$validation[this.field] = {}; // 初始化
            if (this.expression.required) _validateRequired.call(this, this.vm.value);
            if (this.expression.minLength || this.expression.maxLength) _validateLength.call(this, this.vm.value);
            if (this.expression.mail) _validateMail.call(this, this.vm.value);
            if (this.expression.tel) _validateTel.call(this, this.vm.value);
            if (this.expression.mobile) _validateMobile.call(this, this.vm.value);
            if (this.expression.card) _validateCard.call(this, this.vm.value);
            if (this.expression.numbers) _validateNumbers.call(this, this.vm.value);
            if (this.expression.text) _validateText.call(this, this.vm.value);
            if (this.expression.bank) _validateBank.call(this, this.vm.value);
            if (this.expression.sorderIdenty) _validateSorderIdenty.call(this, this.vm.value);
            if (this.expression.socialSecurityCard) _validateSocialSecurityCard.call(this, this.vm.value);
            if (this.expression.hongKongMacauPasser) _validateHongKongMacauPasser.call(this, this.vm.value);
            if (this.expression.taiwanPasser) _validateTaiwanPasser.call(this, this.vm.value);
            if (this.expression.houseHoldRegister) _validateHouseHoldRegister.call(this, this.vm.value);
            if (this.expression.interimId) _validateInterimId.call(this, this.vm.value);
            if (this.expression.passport) _validatePassport.call(this, this.vm.value);
            if (this.expression.username) _validateUsername.call(this, this.vm.value);
        }
    },
    _getMsg = function (tag, def) {
        let msg = '';
        if (typeof this.expression[tag] === 'string') {
            msg = this.expression[tag];
        } else if (this.expression[tag]['message'] && typeof this.expression[tag]['message'] === 'string') {
            msg = this.expression[tag]['message'];
        } else {
            msg = def;
        }
        return msg;
    },
    _validateRequired = function (newVal, oldVal) { // 监听输入与否
        if (newVal && newVal.length && !newVal.match(/^\s*$/g)) { // 如果存在，删除标识，如果不存在，写入提示语（或true）,这里我添加了一个不能全为空格的判断---孙硕；
            delete Vue.$validation[this.field]['required'];
            delete Vue.prototype.$validation[this.field]['required'];
        } else {
            let msg = _getMsg.call(this, 'required', '您有未录入的数据哦~');
            Vue.$validation[this.field]['required'] = Vue.prototype.$validation[this.field]['required'] = msg;
        }
        console.log(`【validator】${this.vm._uid}.doUpdate！！！ `, Vue.prototype.$validation);
    },
    _validateLength = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.minLength) {
            let min = typeof this.expression.minLength === 'number' ? this.expression.minLength : this.expression.minLength.rule;
            if (newVal.length && newVal.length >= min) {
                delete Vue.$validation[this.field]['minLength'];
                delete Vue.prototype.$validation[this.field]['minLength'];
            } else {
                let msg = _getMsg.call(this, 'minLength', '至少输入' + min + '字哦~');
                Vue.$validation[this.field]['minLength'] = Vue.prototype.$validation[this.field]['minLength'] = msg;
            }
        }
        if (newVal && this.expression.maxLength) {
            let max = typeof this.expression.maxLength === 'number' ? this.expression.maxLength : this.expression.maxLength.rule;
            if (newVal.length && newVal.length < max) {
                delete Vue.$validation[this.field]['maxLength'];
                delete Vue.prototype.$validation[this.field]['maxLength'];
            } else {
                let msg = _getMsg.call(this, 'maxLength', '最多输入' + max + '字哦~');
                Vue.$validation[this.field]['maxLength'] = Vue.prototype.$validation[this.field]['maxLength'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['minLength'];
            delete Vue.prototype.$validation[this.field]['minLength'];
            delete Vue.$validation[this.field]['maxLength'];
            delete Vue.prototype.$validation[this.field]['maxLength'];
        }
    },
    _validateMail = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.mail) {
            if (utils.validateEmail(newVal)) {
                delete Vue.$validation[this.field]['mail'];
                delete Vue.prototype.$validation[this.field]['mail'];
            } else {
                let msg = _getMsg.call(this, 'mail', '邮箱格式不对哦~');
                Vue.$validation[this.field]['mail'] = Vue.prototype.$validation[this.field]['mail'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['mail'];
            delete Vue.prototype.$validation[this.field]['mail'];
        }
    },
    _validateTel = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.tel) {
            if (utils.validateTel(newVal)) {
                delete Vue.$validation[this.field]['tel'];
                delete Vue.prototype.$validation[this.field]['tel'];
            } else {
                let msg = _getMsg.call(this, 'tel', '电话格式不对哦~');
                Vue.$validation[this.field]['tel'] = Vue.prototype.$validation[this.field]['tel'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['tel'];
            delete Vue.prototype.$validation[this.field]['tel'];
        }
    },
    _validateMobile = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.mobile) {
            if (utils.validateMobile(newVal)) {
                delete Vue.$validation[this.field]['mobile'];
                delete Vue.prototype.$validation[this.field]['mobile'];
            } else {
                let msg = _getMsg.call(this, 'mobile', '手机格式不对哦~');
                Vue.$validation[this.field]['mobile'] = Vue.prototype.$validation[this.field]['mobile'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['mobile'];
            delete Vue.prototype.$validation[this.field]['mobile'];
        }
    },
    _validateCard = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.card) {
            if (utils.validateCard(newVal)) {
                delete Vue.$validation[this.field]['card'];
                delete Vue.prototype.$validation[this.field]['card'];
            } else {
                let msg = _getMsg.call(this, 'card', '身份证号格式不对哦~');
                Vue.$validation[this.field]['card'] = Vue.prototype.$validation[this.field]['card'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['card'];
            delete Vue.prototype.$validation[this.field]['card'];
        }
    },
    _validateNumbers = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.numbers) {
            if (utils.validateNumbers(newVal)) {
                delete Vue.$validation[this.field]['numbers'];
                delete Vue.prototype.$validation[this.field]['numbers'];
            } else {
                let msg = _getMsg.call(this, 'numbers', '只能输入数字哦~');
                Vue.$validation[this.field]['numbers'] = Vue.prototype.$validation[this.field]['numbers'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['numbers'];
            delete Vue.prototype.$validation[this.field]['numbers'];
        }
    },
    _validateText = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.text) {
            if (utils.validateText(newVal)) {
                delete Vue.$validation[this.field]['text'];
                delete Vue.prototype.$validation[this.field]['text'];
            } else {
                let msg = _getMsg.call(this, 'text', '不能包含特殊字符哦~');
                Vue.$validation[this.field]['text'] = Vue.prototype.$validation[this.field]['text'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['text'];
            delete Vue.prototype.$validation[this.field]['text'];
        }
    },
    _validateBank = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.bank) {
            if (utils.validateBank(newVal)) {
                delete Vue.$validation[this.field]['bank'];
                delete Vue.prototype.$validation[this.field]['bank'];
            } else {
                let msg = _getMsg.call(this, 'bank', '银行卡格式不对哦~');
                Vue.$validation[this.field]['bank'] = Vue.prototype.$validation[this.field]['bank'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['bank'];
            delete Vue.prototype.$validation[this.field]['bank'];
        }
    },
    // 新添加的军人身份证验证---孙硕---2017-12-15
    _validateSorderIdenty = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.sorderIdenty) {
            if (utils.validateSorderIdenty(newVal)) {
                delete Vue.$validation[this.field]['sorderIdenty'];
                delete Vue.prototype.$validation[this.field]['sorderIdenty'];
            } else {
                let msg = _getMsg.call(this, 'sorderIdenty', '军人身份证格式不对哦~');
                Vue.$validation[this.field]['sorderIdenty'] = Vue.prototype.$validation[this.field]['sorderIdenty'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['sorderIdenty'];
            delete Vue.prototype.$validation[this.field]['sorderIdenty'];
        }
    },
    // 新添加的社保卡验证--孙硕--2017-12-15；
    _validateSocialSecurityCard = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.socialSecurityCard) {
            if (utils.validateSocialSecurityCard(newVal)) {
                delete Vue.$validation[this.field]['socialSecurityCard'];
                delete Vue.prototype.$validation[this.field]['socialSecurityCard'];
            } else {
                let msg = _getMsg.call(this, 'socialSecurityCard', '社会保障卡格式不对哦~');
                Vue.$validation[this.field]['socialSecurityCard'] = Vue.prototype.$validation[this.field]['socialSecurityCard'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['socialSecurityCard'];
            delete Vue.prototype.$validation[this.field]['socialSecurityCard'];
        }
    },
    // 新添加的港澳台通行证验证--孙硕--2017-12-15；
    _validateHongKongMacauPasser = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.hongKongMacauPasser) {
            if (utils.validateHongKongMacauPasser(newVal)) {
                delete Vue.$validation[this.field]['hongKongMacauPasser'];
                delete Vue.prototype.$validation[this.field]['hongKongMacauPasser'];
            } else {
                let msg = _getMsg.call(this, 'hongKongMacauPasser', '港澳通行证格式不对哦~');
                Vue.$validation[this.field]['hongKongMacauPasser'] = Vue.prototype.$validation[this.field]['hongKongMacauPasser'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['hongKongMacauPasser'];
            delete Vue.prototype.$validation[this.field]['hongKongMacauPasser'];
        }
    },
    // 新添加的台湾居民来往大陆通行证验证--孙硕--2017-12-15；
    _validateTaiwanPasser = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.taiwanPasser) {
            if (utils.validateTaiwanPasser(newVal)) {
                delete Vue.$validation[this.field]['taiwanPasser'];
                delete Vue.prototype.$validation[this.field]['taiwanPasser'];
            } else {
                let msg = _getMsg.call(this, 'taiwanPasser', '台湾居民来往大陆通行证格式不对哦~');
                Vue.$validation[this.field]['taiwanPasser'] = Vue.prototype.$validation[this.field]['taiwanPasser'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['taiwanPasser'];
            delete Vue.prototype.$validation[this.field]['taiwanPasser'];
        }
    },
    // 新添加的户口薄证验证--孙硕--2017-12-15；
    _validateHouseHoldRegister = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.houseHoldRegister) {
            if (utils.validateHouseHoldRegister(newVal)) {
                delete Vue.$validation[this.field]['houseHoldRegister'];
                delete Vue.prototype.$validation[this.field]['houseHoldRegister'];
            } else {
                let msg = _getMsg.call(this, 'houseHoldRegister', '户口薄格式不对哦~');
                Vue.$validation[this.field]['houseHoldRegister'] = Vue.prototype.$validation[this.field]['houseHoldRegister'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['houseHoldRegister'];
            delete Vue.prototype.$validation[this.field]['houseHoldRegister'];
        }
    },
    // 新添加的临时居民身份证证验证--孙硕--2017-12-15；
    _validateInterimId = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.interimId) {
            if (utils.validateInterimId(newVal)) {
                delete Vue.$validation[this.field]['interimId'];
                delete Vue.prototype.$validation[this.field]['interimId'];
            } else {
                let msg = _getMsg.call(this, 'interimId', '临时居民身份证格式不对哦~');
                Vue.$validation[this.field]['interimId'] = Vue.prototype.$validation[this.field]['interimId'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['interimId'];
            delete Vue.prototype.$validation[this.field]['interimId'];
        }
    },
    // 新添加的临时居民身份证证验证--孙硕--2017-12-15；
    _validatePassport = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.passport) {
            if (utils.validatePassport(newVal)) {
                delete Vue.$validation[this.field]['passport'];
                delete Vue.prototype.$validation[this.field]['passport'];
            } else {
                let msg = _getMsg.call(this, 'passport', '护照格式不对哦~');
                Vue.$validation[this.field]['passport'] = Vue.prototype.$validation[this.field]['passport'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['passport'];
            delete Vue.prototype.$validation[this.field]['passport'];
        }
    },
    // 用户名规则：中文五个、英文30个、不能特殊字符、不能中英混排。 Author by Dio Zhu. on 2018.5.9
    _validateUsername = function (newVal, oldVal) { // 监听输入长度
        if (newVal && this.expression.username) {
            if (utils.validateUsername(newVal)) {
                delete Vue.$validation[this.field]['username'];
                delete Vue.prototype.$validation[this.field]['username'];
            } else {
                let msg = _getMsg.call(this, 'username', '用户名输入有误~');
                Vue.$validation[this.field]['username'] = Vue.prototype.$validation[this.field]['username'] = msg;
            }
        }
        if (!newVal && !this.expression.required) {
            delete Vue.$validation[this.field]['username'];
            delete Vue.prototype.$validation[this.field]['username'];
        }
    };

// === init ===

let Validator = {
        bind (el, binding, vnode) {
            // console.warn('执行一次bind钩子，全局validation为', Vue.$validation, vnode.context);
            if (typeof binding.value === 'undefined') return;
            el[ctx] = {
                el,
                vm: vnode.context,
                expression: binding.value,
                validate_id: binding.value.key || vnode.context._uid
            };
            const args = arguments;
            el[ctx].vm.$nextTick(() => {
                setTimeout(() => { validate.call(el[ctx], args); }, 0);
            });
        },
        // inserted (el, binding, vnode) {
        //     console.error('页面执行了inserted钩子，全局validation为', Vue.$validation);
        //     if (typeof binding.value === 'undefined') return;
        //     el[ctx] = {
        //         el,
        //         vm: vnode.context,
        //         expression: binding.value,
        //         validate_id: binding.value.key || vnode.context._uid
        //     };
        //     const args = arguments;
        //     el[ctx].vm.$nextTick(() => {
        //         setTimeout(() => { validate.call(el[ctx], args); }, 0);
        //     });
        // },
        componentUpdated (el, binding, vnode) {
            // console.warn('组件更新了，当前的全局validation为', Vue.$validation);
            if (typeof binding.value === 'undefined') return;
            el[ctx] = {
                el,
                vm: vnode.context,
                expression: binding.value,
                validate_id: binding.value.key || vnode.context._uid
            };
            const args = arguments;
            el[ctx].vm.$nextTick(() => {
                setTimeout(() => { validate.call(el[ctx], args); }, 0);
            });
        },
        unbind (el, binding, vnode) {
            // console.warn('执行了unbind钩子,全局validation为', Vue.$validation);
            if (typeof binding.value === 'undefined') return;
            let field = binding.value.key || vnode.context._uid;
            Vue.$validation[field] = {};
        }
    },
    validation = {
    };

// === install ===

const install = function (Vue) {
    Vue.directive('validator', Validator);
    Vue.$validation = Vue.prototype.$validation = validation; // 全局数据标识
};

if (!Vue.prototype.$isServer && window.Vue) {
    window.Validator = Validator;
    Vue.use(install); // eslint-disable-line
}

Validator.install = install;
export default Validator;

