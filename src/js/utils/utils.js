/**
 * 工具类
 *              -- Author by Dio Zhu. on 2017.2.9
 *
 * 修改了以前的对象的方式，以前各方法作为对象属性，问题在打包（build）后，会把整个对象打进去。
 * 现改用es6的模块方式，前端引用方法：
 *      import * as utils from '../utils.js';
 *      utils.formatTime();
 * 打包时webpack的tree-shaking会只处理被引用的方法；
 *              -- Author by Dio Zhu. on 2017.6.26
 */

/** ==================== 浏览器相关 ==================== */
export function getQueryStringByName (name) {
    var result = document.location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
    if (result == null || result.length < 1) {
        return '';
    }
    return result[1];
};
export function getCurrentPath (opts) {
    // var rtn = document.location.hash;
    // if (opts && opts.pathOnly) {
    //     rtn = rtn.split('?')[0].replace(/#!\//g, '');
    // }
    // return rtn;
    return document.location.pathname;
};

/** ==================== 事件扩展 ==================== */
export function throttle (fn, delay) { // 节流
    let now, lastExec, timer, context, args; //eslint-disable-line

    let execute = function () {
        fn.apply(context, args);
        lastExec = now;
    };

    return function () {
        context = this;
        args = arguments;

        now = Date.now();

        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        if (lastExec) {
            let diff = delay - (now - lastExec);
            if (diff < 0) {
                execute();
            } else {
                timer = setTimeout(() => {
                    execute();
                }, diff);
            }
        } else {
            execute();
        }
    };
};
/** ==================== 图片相关 ==================== */
/**
 * 头像、七牛的缩略图
 *              -- Author by Dio Zhu. on 2017.5.2
 */
export function getThumbnail (url) {
    if (!url) {
        return 'http://static1.systoon.com/share/img/185x185.png';
        // return '../static/images/default-avatar.png';
    }
    if (/qiniu.toon.mobi/.test(url)) { // 七牛缩略图
        return url + '?imageView2/0/w/750';
    }
    // 静态服务器头像
    if (url.indexOf('http://img.icon.systoon.com') >= 0 || url.indexOf('http://static1.systoon.com') >= 0) {
        return url;
    }
    if (url.match(/_/g) && url.match(/_/g).length > 1) return url; // 已经转过的
    let w = 80, h = 80, q = 100,
        path = url.substr(0, url.lastIndexOf('.')),
        mimeType = url.substring(url.lastIndexOf('.'), url.length),
        suffix = '_' + w + '_' + h + '_' + q + '_1';
    if (mimeType.length > 4) { // 会有没有后缀，直接显示地址的头像：feedId：s_1948762391184096，avatar："http://scloud.toon.mobi/f/Zs9xtlKKvwI6-iy1CGlAK5UFxlwMtlBU-U4tt0aqqYkfI"
        return path + mimeType + suffix + '.jpg';
    } else {
        return path + suffix + mimeType;
    }
};

/** ==================== 时间函数 ==================== */
/**
 * 时间转化
 * time 时间毫秒数,必传
 * format 格式,非必传 yyyy年 MM月 dd日 hh小时 mm分 ss秒，比如传入'始于yyyy-MM-dd的hh:mm',则返回'始于2014-06-15的12:05'
 *
 * 添加了毫秒格式, 用于logger.
 * 添加了星期格式, 用于酒店, 做了'今天'的判断.
 *              -- Modified by Dio Zhu. on 2016.10.20
 * ios下new Date(2016-10-31)报错:invalid date...要改为: 2016/10/31样式
 *              -- Modified by Dio Zhu. on 2016.11.01
 * */
export function formatTime (time, format) {
    if (!time) {
        return '';
    }
    if (typeof time === 'string') {
        time = time.toString().replace(/-/g, '/'); // ios下new Date(2016-10-31)报错:invalid date...要改为: 2016/10/31样式
    }
    if (typeof time === 'number' && (time.toString().length) === 10) {
        time = parseInt(time + '000');
    }
    // 过去
    var stamp = new Date(time),
        cur = new Date(),
        year = stamp.getFullYear(),
        month = (stamp.getMonth() + 1) > 9 ? (stamp.getMonth() + 1) : '0' + (stamp.getMonth() + 1),
        day = stamp.getDate() > 9 ? stamp.getDate() : '0' + stamp.getDate(),
        hour = stamp.getHours() > 9 ? stamp.getHours() : '0' + stamp.getHours(),
        minute = stamp.getMinutes() > 9 ? stamp.getMinutes() : '0' + stamp.getMinutes(),
        sec = stamp.getSeconds() > 9 ? stamp.getSeconds() : '0' + stamp.getSeconds(),
        ms = stamp.getMilliseconds() < 100 ? '0' + (stamp.getMilliseconds() < 10 ? '0' + stamp.getMilliseconds() : stamp.getMilliseconds()) : stamp.getMilliseconds(),
        weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        week = weeks[stamp.getDay()];
    if (format) {
        format = format.replace('yyyy', year);
        format = format.replace('MM', month);
        format = format.replace('dd', day);
        format = format.replace('hh', hour);
        format = format.replace('mm', minute);
        format = format.replace('ss', sec);
        format = format.replace('ms', ms);

        if (year === cur.getFullYear() && stamp.getMonth() === cur.getMonth() && stamp.getDate() === cur.getDate()) {
            week = '今天';
        }
        format = format.replace('week', week);
    } else {
        format = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    }

    return format;
};

/**
 * 把字符串、数字转换成时间对象
 *              -- Author by Dio Zhu. on 2017.2.18
 */
export function dateTrans (dt) {
    if (typeof dt === 'string') {
        dt = dt.toString().replace(/-/g, '/'); // ios下new Date(2016-10-31)报错:invalid date...要改为: 2016/10/31样式
    }
    if (typeof dt === 'number' && (dt.toString().length) === 10) {
        dt = parseInt(dt + '000');
    }
    dt = new Date(dt);
    return dt;
};
/**
 * 时间是否同年、同月、同日的判断函数
 *              -- Author by Dio Zhu. on 2017.2.18
 */
export function isSameYear (dt1, dt2) {
    if (!dt1 || !dt2) return false;
    dt1 = (dt1 instanceof Date) ? dt1 : this.dateTrans(dt1);
    dt2 = (dt2 instanceof Date) ? dt2 : this.dateTrans(dt2);
    return dt1.getFullYear() === dt2.getFullYear();
};
export function isSameMonth (dt1, dt2) {
    if (!dt1 || !dt2) return false;
    dt1 = (dt1 instanceof Date) ? dt1 : this.dateTrans(dt1);
    dt2 = (dt2 instanceof Date) ? dt2 : this.dateTrans(dt2);
    return dt1.getFullYear() === dt2.getFullYear() && dt1.getMonth() === dt2.getMonth();
};
export function isSameDay (dt1, dt2) {
    if (!dt1 || !dt2) return false;
    dt1 = (dt1 instanceof Date) ? dt1 : this.dateTrans(dt1);
    dt2 = (dt2 instanceof Date) ? dt2 : this.dateTrans(dt2);
    return dt1.getMonth() === dt2.getMonth() && dt1.getDate() === dt2.getDate();
};

/** ==================== 各种正则 ==================== */
/**
 * validator校验
 *              -- Author By Dio Zhu. on 2017.5.10
 */
export function validateEmail (val) {
    let re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/; // (字母、数字、下划线、-、. )@(字母、数字、-)
    return re.test(val);
};
export function validateTel (val) {
    let re = /^0\d{2,3}-?\d{7,8}$/; // 0开头2~3位区号，可以加-（也可不加），加上7~8位数字
    return re.test(val);
};
export function validateMobile (val) {
    let re = /^1\d{10}$/; // 1开头的11位数字
    return re.test(val);
};
/**
 * 不允许输入特殊字符
 * */
export function validateText (val) {
    let re = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
    return re.test(val);
};
/**
 * 输入手机号的校验
 * */
export function validatePhone (val) {
    let re = /^0?1[3|4|5|7|8]\d{9}$/;
    return re.test(val);
};
/**
 * 数字
 * */
export function validateNumbers (val) {
    let re = /^[0-9]*$/;
    return re.test(val);
};
/**
 * 输入身份证号的校验
 * */
export function validateCard (val) {
    let re = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
    return re.test(val);
};
/**
 * 银行卡号校验
 * */
export function validateBank (val) {
    return true;
};

export function getComputedStyle (el) {
    // return Vue.prototype.$isServer ? {} : document.defaultView.getComputedStyle(el);
    return document.defaultView.getComputedStyle(el);
}
