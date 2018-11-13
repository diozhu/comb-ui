/**
 * Created by diozhu on 2017/2/6.
 */
/* istanbul ignore next */

import Vue from 'vue';

const isServer = Vue.prototype.$isServer;
// const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const SPECIAL_CHARS_REGEXP = /((.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const ieVersion = isServer ? 0 : Number(document.documentMode);

/* istanbul ignore next */
const trim = function (string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};
/* istanbul ignore next */
const camelCase = function (name) {
    return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
};

/* istanbul ignore next */
export const on = (function () {
    if (!isServer && document.addEventListener) {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.addEventListener(event, handler, false);
            }
        };
    } else {
        return function (element, event, handler) {
            if (element && event && handler) {
                element.attachEvent('on' + event, handler);
            }
        };
    }
})();

/* istanbul ignore next */
export const off = (function () {
    if (!isServer && document.removeEventListener) {
        return function (element, event, handler) {
            if (element && event) {
                element.removeEventListener(event, handler, false);
            }
        };
    } else {
        return function (element, event, handler) {
            if (element && event) {
                element.detachEvent('on' + event, handler);
            }
        };
    }
})();

/* istanbul ignore next */
export const once = function (el, event, fn) {
    var listener = function () {
        if (fn) {
            fn.apply(this, arguments);
        }
        off(el, event, listener);
    };
    on(el, event, listener);
};

/* istanbul ignore next */
export function hasClass (el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
        return el.classList.contains(cls);
    } else {
        return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
};

/* istanbul ignore next */
export function addClass (el, cls) {
    if (!el) return;
    var curClass = el.className,
        classes = (cls || '').split(' ');

    for (let i = 0, j = classes.length;i < j;i++) {
        let clsName = classes[i];
        if (!clsName) continue;

        if (el.classList) {
            el.classList.add(clsName);
        } else {
            if (!hasClass(el, clsName)) {
                curClass += ' ' + clsName;
            }
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
};

/* istanbul ignore next */
export function removeClass (el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' '),
        curClass = ' ' + el.className + ' ';

    for (let i = 0, j = classes.length;i < j;i++) {
        let clsName = classes[i];
        if (!clsName) continue;

        if (el.classList) {
            el.classList.remove(clsName);
        } else {
            if (hasClass(el, clsName)) {
                curClass = curClass.replace(' ' + clsName + ' ', ' ');
            }
        }
    }
    if (!el.classList) {
        el.className = trim(curClass);
    }
};

/* istanbul ignore next */
export const getStyle = ieVersion < 9 ? function (element, styleName) {
    if (isServer) return;
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'styleFloat';
    }
    try {
        switch (styleName) {
        case 'opacity':
            try {
                return element.filters.item('alpha').opacity / 100;
            } catch (e) {
                return 1.0;
            }
        default:
            return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
        }
    } catch (e) {
        return element.style[styleName];
    }
} : function (element, styleName) {
    if (isServer) return;
    if (!element || !styleName) return null;
    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }
    try {
        var computed = document.defaultView.getComputedStyle(element, '');
        return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
        return element.style[styleName];
    }
};

/* istanbul ignore next */
export function setStyle (element, styleName, value) {
    if (!element || !styleName) return;

    if (typeof styleName === 'object') {
        for (var prop in styleName) {
            if (styleName.hasOwnProperty(prop)) {
                setStyle(element, prop, styleName[prop]);
            }
        }
    } else {
        styleName = camelCase(styleName);
        if (styleName === 'opacity' && ieVersion < 9) {
            element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')';
        } else {
            element.style[styleName] = value;
        }
    }
};

// export function getComputedStyle () {
//     return Vue.prototype.$isServer ? {} : document.defaultView.getComputedStyle
// };

export function isAttached (element) {
    var currentNode = element.parentNode;
    while (currentNode) {
        if (currentNode.tagName === 'HTML') {
            return true;
        }
        if (currentNode.nodeType === 11) {
            return false;
        }
        currentNode = currentNode.parentNode;
    }
    return false;
};

let getComputedStyle = Vue.prototype.$isServer ? {} : document.defaultView.getComputedStyle;
export function getScrollEventTarget (element) {
    var currentNode = element;
    // bugfix, see http://w3help.org/zh-cn/causes/SD9013 and http://stackoverflow.com/questions/17016740/onscroll-function-is-not-working-for-chrome
    while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
        var overflowY = getComputedStyle(currentNode).overflowY;
        // console.log('!!!dom ===>>> ', currentNode.className, overflowY);
        if (overflowY === 'scroll' || overflowY === 'auto') {
            return currentNode;
        }
        currentNode = currentNode.parentNode;
    }
    return window;
};

/**
 * Detecting prefixes for saving time and bytes
 */
export function getDetectPrefixes () {
    let transform;
    let transition;
    let transitionEnd;
    let hasTranslate3d;
    (function () {
        let el = document.createElement('_');
        let style = el.style;
        let prop;
        if (style[prop = 'webkitTransition'] === '') {
            transitionEnd = 'webkitTransitionEnd';
            transition = prop;
        }
        if (style[prop = 'transition'] === '') {
            transitionEnd = 'transitionend';
            transition = prop;
        }
        if (style[prop = 'webkitTransform'] === '') {
            transform = prop;
        }
        if (style[prop = 'msTransform'] === '') {
            transform = prop;
        }
        if (style[prop = 'transform'] === '') {
            transform = prop;
        }
        document.body.insertBefore(el, null);
        style[transform] = 'translate3d(0, 0, 0)';
        hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform);
        document.body.removeChild(el);
    }());
    return {
        transform,
        transition,
        transitionEnd,
        hasTranslate3d
    };
}
