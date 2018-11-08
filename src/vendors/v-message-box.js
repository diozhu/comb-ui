/**
 * Created by diozhu on 2017/2/6.
 */
import Vue from 'vue';
import msgboxVue from './v-message-box.vue';

let CONFIRM_TEXT = '确定',
    CANCEL_TEXT = '取消',
    defaults = {
        title: '',
        message: '',
        type: '',
        showInput: false,
        showClose: true,
        modalFade: false,
        lockScroll: false,
        closeOnClickModal: true,
        inputValue: null,
        inputPlaceholder: '',
        inputPattern: null,
        inputValidator: null,
        inputErrorMessage: '',
        showConfirmButton: true,
        showCancelButton: false,
        confirmButtonPosition: 'right',
        confirmButtonHighlight: false,
        cancelButtonHighlight: false,
        confirmButtonText: CONFIRM_TEXT,
        cancelButtonText: CANCEL_TEXT,
        confirmButtonClass: '',
        cancelButtonClass: ''
    },
    merge = function (target) {
        for (let i = 1, j = arguments.length;i < j;i++) {
            let source = arguments[i];
            for (let prop in source) {
                if (source.hasOwnProperty(prop)) {
                    let value = source[prop];
                    if (value !== undefined) {
                        target[prop] = value;
                    }
                }
            }
        }
        return target;
    },
    MessageBoxConstructor = Vue.extend(msgboxVue),
    currentMsg,
    instance,
    msgQueue = [];

const defaultCallback = action => {
    if (currentMsg) {
        var callback = currentMsg.callback;
        if (typeof callback === 'function') {
            if (instance.showInput) {
                callback(instance.inputValue, action);
            } else {
                callback(action);
            }
        }
        if (currentMsg.resolve) {
            let $type = currentMsg.options.$type;
            if ($type === 'confirm' || $type === 'prompt') {
                if (action === 'confirm') {
                    if (instance.showInput) {
                        currentMsg.resolve({ value: instance.inputValue, action });
                    } else {
                        currentMsg.resolve(action);
                    }
                } else if (action === 'cancel' && currentMsg.reject) {
                    currentMsg.reject(action);
                }
            } else {
                currentMsg.resolve(action);
            }
        }
    }
};

var initInstance = function () {
        instance = new MessageBoxConstructor({
            el: document.createElement('div')
        });

        instance.callback = defaultCallback;
    },
    showNextMsg = function () {
        if (!instance) {
            initInstance();
        }
        // console.log('==>', instance, instance.$data.message);

        if (!instance.value || instance.closeTimer) {
            if (msgQueue.length > 0) {
                currentMsg = msgQueue.shift();

                let options = currentMsg.options;
                for (let prop in options) {
                    if (options.hasOwnProperty(prop)) {
                        instance[prop] = options[prop];
                    }
                }
                if (options.callback === undefined) {
                    instance.callback = defaultCallback;
                }
                ['modal', 'showClose', 'closeOnClickModal', 'closeOnPressEscape'].forEach(prop => {
                    if (instance[prop] === undefined) {
                        instance[prop] = true;
                    }
                });
                document.body.appendChild(instance.$el);

                Vue.nextTick(() => {
                    instance.value = true;
                });
            }
        }
    },
    MessageBox = function (options, callback) {
        // console.log('==>', options);

        if (typeof options === 'string') {
            options = {
                title: options
            };
            if (arguments[1]) {
                options.message = arguments[1];
            }
            if (arguments[2]) {
                options.type = arguments[2];
            }
        } else if (options.callback && !callback) {
            callback = options.callback;
        }

        if (typeof Promise !== 'undefined') {
            return new Promise(function(resolve, reject) { // eslint-disable-line
                msgQueue.push({
                    options: merge({}, defaults, MessageBox.defaults || {}, options),
                    callback: callback,
                    resolve: resolve,
                    reject: reject
                });

                showNextMsg();
            });
        } else {
            msgQueue.push({
                options: merge({}, defaults, MessageBox.defaults || {}, options),
                callback: callback
            });

            showNextMsg();
        }
    };

MessageBox.setDefaults = function (defaults) {
    MessageBox.defaults = defaults;
};

MessageBox.alert = function (message, title, options) {
    if (typeof title === 'object') {
        options = title;
        title = '';
    }
    return MessageBox(merge({
        title: title,
        message: message,
        $type: 'alert',
        closeOnPressEscape: false,
        closeOnClickModal: false
    }, options));
};

MessageBox.confirm = function (message, title, options) {
    if (typeof title === 'object') {
        options = title;
        title = '';
    }
    return MessageBox(merge({
        title: title,
        message: message,
        $type: 'confirm',
        showCancelButton: true
    }, options));
};

MessageBox.prompt = function (message, title, options) {
    if (typeof title === 'object') {
        options = title;
        title = '';
    }
    return MessageBox(merge({
        title: title,
        message: message,
        showCancelButton: true,
        showInput: true,
        $type: 'prompt'
    }, options));
};

MessageBox.close = function () {
    instance.value = false;
    msgQueue = [];
    currentMsg = null;
};

export default MessageBox;
export { MessageBox };
