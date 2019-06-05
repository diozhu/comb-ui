/**
 * @原生ajax请求
 * @example
 ajax({
            url: "./TestXHR.php",              //请求地址
            type: "POST",                       //请求方式
            data: { name: "super", age: 20 },        //请求参数
            dataType: "json",
            success: function (response, xml) {
                // 此处放成功后执行的代码
            },
            fail: function (status) {
                // 此处放失败后执行的代码
            }
         });
 */
import Vue from 'vue';
const MAjax = (options) => {
    options = options || {};
    options.type = (options.type || 'GET').toUpperCase();
    options.dataType = (options.dataType || 'text').toUpperCase();
    options.cache = options.cache || 'true ';
    options.timeout = parseInt(options.timeout) || 10000;

    // //添加ajax请求框
    // var _dom = document.getElementById('majax-loading');
    // if (!_dom) {
    //     this.creatAjaxLoading();
    // }

    // var params = formatParamsA(options.data);
    var params = options.data; // 需求问题对于参数暂不做处理
    var protocol = /^([\w-]+:)\/\//.test(options.url) ? RegExp.$1 : window.location.protocol;
    // var responseFields = {
    //     'XML': 'responseXML',
    //     'TEXT': 'responseText',
    //     'JSON': 'responseJSON'
    // };

    var headers = {};
    var setHeader = function (name, value) {
        headers[name.toLowerCase()] = [name, value];
    };

    var getHeader = function () {
        xhr.setRequestHeader = setHeader;
        for (let name in headers) {
            nativeSetHeader.apply(xhr, headers[name]);
        }
    };

    // 创建 - 非IE6 - 第一步
    let xhr;
    if (window.XMLHttpRequest) {
        xhr = new window.XMLHttpRequest();
    } else { // IE6及其以下版本浏览器
        xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
    }

    if (options.dataType !== 'TEXT') {
        try {
            xhr.responseType = options.dataType; // 'text'：返回类型为字符串，这是默认值。'arraybuffer'：返回类型为ArrayBuffer。'blob'：返回类型为Blob。'document'：返回类型为Document。'json'：返回类型为JSON object。
        } catch (e) {
            console.log('ajax不支持responseType');
        }
    }
    if (!options.cache) { // 禁用缓存
        xhr.setRequestHeader('If-Modified-Since', '0');
    }
    // 接收 - 第三步
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {  // 请求完成，响应就绪
            options.complete && options.complete.call(this, xhr); // 响应就发送
            // var result = xhr.responseType == "text" ? xhr.responseText : xhr.responseXML; //返回值类型
            // var result = xhr[responseFields[options.dataType]]; // 返回值类型
            var result = xhr.responseText;
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || (xhr.status === 0 && protocol === 'file:') && typeof options.success === 'function') { // 成功
                var dataType = options.dataType || xhr.getResponseHeader('content-type');
                try {
                    if (dataType === 'SCRIPT') {
                        // (1, eval)(result);
                        // window.eval(result);
                        console.error('eval can be harmful! ', result);
                    } else if (dataType === 'XML') {
                        result = xhr.responseXML;
                    } else if (dataType === 'JSON') {
                        result = JSON.parse(result);
                    }
                } catch (e) {
                    console.log('error');
                }
                options.success && options.success(result, xhr.status);
            } else if (xhr.status >= 400 && xhr.status < 500) { // 客户端出错，404啊神马的
                options.error && options.error(xhr, xhr.status);
            } else if (xhr.status >= 500) { // 服务器端出错
                options.error && options.error(xhr, xhr.status);
            } else {
                options.error && options.error(xhr, xhr.status);
            }
        }
    };
    var nativeSetHeader = xhr.setRequestHeader;

    setHeader('Accept', '*/*');
    // 连接 和 发送 - 第二步
    if (options.type === 'GET') {
        xhr.open('GET', options.url + '?' + params, true);
        options.beforeSend && options.beforeSend.call(this, options, setHeader);
        getHeader();
        xhr.send(null);
    } else if (options.type === 'POST') {
        xhr.open('POST', options.url, true);
        // 设置表单提交时的内容类型
        setHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        options.beforeSend && options.beforeSend.call(this, options, setHeader);
        getHeader();
        xhr.send(params);
    }
    // // 格式化参数
    // function formatParamsA(data) {
    //     var arr = [];
    //     for (var name in data) {
    //         arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    //     }
    //     arr.push(('v=' + Math.random()).replace('.'));
    //     return arr.join('&');
    // }
    //
    // function formatParamsB(obj) {
    //     var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
    //     for (name in obj) {
    //         value = obj[name];
    //         if (value instanceof Array) {
    //             for (i = 0; i < value.length; ++i) {
    //                 subValue = value[i];
    //                 fullSubName = name + '[' + i + ']';
    //                 innerObj = {};
    //                 innerObj[fullSubName] = subValue;
    //                 query += param(innerObj) + '&';
    //             }
    //         }
    //         else if (value instanceof Object) {
    //             for (subName in value) {
    //                 subValue = value[subName];
    //                 fullSubName = name + '[' + subName + ']';
    //                 innerObj = {};
    //                 innerObj[fullSubName] = subValue;
    //                 query += param(innerObj) + '&';
    //             }
    //         }
    //         else if (value !== undefined && value !== null) {
    //             query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    //         }
    //
    //     }
    //     return query.length ? query.substr(0, query.length - 1) : query;
    // }
};

export const toonCall = (option, type, callback, errorback) => {
    option = option || {};
    let flagId = new Date().getTime() + Math.random(),
        endTime = new Date() + 300000; // 五分钟
    option.flagId = flagId;

    // 调起toon协议
    window.location.href = 'toon://' + type + '?params=' + JSON.stringify(option);

    /** 获取返回数据 **/
    function getResult () {
        let sendTime = Date.now();
        MAjax({
            url: 'http://127.0.0.1:6780/getResult',
            type: 'POST',
            data: 'params={"flagId":' + option.flagId + '}',
            success: function (e) {
                e = JSON.parse(e);
                if (callback) callback(e.data);
            },
            error: function (e) {
                console.error('toonCall.ERROR: ', e);
                let time = Date.now();
                if (time < sendTime + 1000 * 10 || time > endTime) { // 10秒内，或超过5分钟，就停止
                    if (errorback) {
                        errorback();
                    } else {
                        console.error('未返回信息');
                    }
                } else {
                    console.log('回答状态超时,再次获取！', endTime, time);
                    // getResult();
                    setTimeout(getResult, 1000);
                }
            }
        });
    }
    getResult();
};

/**
 * 上传图片(带状态的)
 * @param option 参数,必传
 * @param dataCall 图片数据回调,必传
 * @param urlCall 上传完毕url回调,必传
 * @param errorCall 错误回调
 */
export const uploadImages = (option, dataCall, urlCall, errorCall) => {
    if (!option || !dataCall || !urlCall) {
        return false;
    }
    let flagId = new Date().getTime() + Math.random(),
        toonUrl = 'http://127.0.0.1:6780/getResult',
        endTime = new Date() + 300000; // 五分钟
    option.flagId = flagId;

    // 调起手机拍照/相册
    window.location.href = 'toon://mwap/photo?params=' + JSON.stringify(option);

    // let imgcount = 1;
    if (window.location.hostname === 'localhost') { // 本地测试环境，指向dev的路径
        toonUrl = 'http://localhost:8080/api/getResult';
    } else if (window.location.hostname === '172.31.240.32') { // 本地测试环境，指向dev的路径
        // toonUrl = 'http://172.31.240.32:8080/api/getResult';
    }
    /** 获取图片base64以及二进制流大小 **/
    function getResult () {
        let sendTime = Date.now();
        MAjax({
            url: toonUrl,
            type: 'POST',
            data: 'params={"flagId":' + option.flagId + '}',
            success: function (e) {
                console.log('toon response: ');
                let res = JSON.parse(e),
                    imgArr = [],
                    originalArr = [];
                if (res.data.result && res.data.result === 'cancel') {
                    // 用户取消
                    if (dataCall) {
                        dataCall('cancel');
                    }
                    return false;
                } else if (res.data.imageArr) {
                    // 多张图片收集长宽
                    let i,
                        len = res.data.imageArr.length,
                        imgItem,
                        imgEl = new window.Image(),
                        imgTemp;
                    originalArr = res.data.imageArr;
                    for (i = 0;i < len;i++) {
                        imgItem = res.data.imageArr[i];
                        imgEl.src = 'data:image/' + imgItem.imageType + ';base64,' + imgItem.base64;
                        imgTemp = {
                            size: imgItem.size,
                            imageType: imgItem.imageType,
                            src: imgEl.src,
                            id: new Date().getTime() + Math.random(),
                            width: imgItem.width,
                            height: imgItem.height
                        };
                        imgArr.push(imgTemp);
                    }
                } else {
                    // 单张图片收集长宽
                    let imgItem,
                        imgEl = new window.Image(),
                        imgTemp;
                    imgItem = res.data;
                    originalArr.push(imgItem);
                    imgEl.src = 'data:image/' + imgItem.imageType + ';base64,' + imgItem.base64;
                    imgTemp = {
                        size: imgItem.size,
                        type: imgItem.imageType,
                        src: imgEl.src,
                        id: new Date().getTime() + Math.random(),
                        width: imgItem.width,
                        height: imgItem.height
                    };
                    imgArr.push(imgTemp);
                }
                // 返回图片
                if (dataCall) {
                    dataCall(imgArr);
                }
                // 获取token，上传图片
                getTokenOnce(imgArr, originalArr, urlCall);
            },
            error: function (e) {
                console.error('未获取到图片信息: ', e);
                let time = Date.now();
                if (time < sendTime + 1000 * 10 || time > endTime) { // 10秒内，或超过5分钟，就停止
                    return errorCall && errorCall();
                } else {
                    console.log('回答状态超时,再次获取！', endTime, time);
                    // getResult();
                    setTimeout(getResult, 1000);
                }
            }
        });
    }
    getResult();

    function getTokenOnce (arr, dataArr, callBack) {
        MAjax({
            // url: "http://t200.signon.systoon.com/phpcode/getToken.php",
            url: 'http://qiniu.systoon.com/getToken.php',
            success: function (res) {
                console.log('base.core.uploadImgStateful.getTokenOnce: ', res);
                var k, len = arr.length;
                for (k = 0;k < len;k++) {
                    uploadToCloud(dataArr[k], res, arr[k].id, callBack, errorCall);
                }
            },
            error: function () {
                console.error('获取Token失败');
                return errorCall && errorCall(arr);
            }
        });
    }

    function uploadToCloud (item, token, id, upCallBack) {
        MAjax({
            url: 'http://upload.qiniu.com/putb64/' + item.size,
            type: 'POST',
            data: item.base64,
            beforeSend: function (res, setHeader) {
                setHeader('Content-Type', 'application/octet-stream');
                setHeader('Authorization', 'UpToken ' + token);
            },
            success: function (res) {
                // 返回图片地址
                var urlTemp = {
                    // url:"http://oa91tlxmn.bkt.clouddn.com/"+JSON.parse(res).key,
                    url: 'http://apr.qiniu.toon.mobi/' + JSON.parse(res).key,
                    id: id
                };
                console.log('base.core.uploadImgStateful.uploadToCloud: ', res, urlTemp);
                upCallBack(urlTemp);
            },
            error: function () {
                console.error('上传失败');
                return errorCall && errorCall(id);
            }
        });
    }
};
/**
 * 上传到思源云存储图片(带状态的)shaoling
 * @param option 参数,必传
 * @param dataCall 图片数据回调,必传
 * @param urlCall 上传完毕url回调,必传
 * @param errorCall 错误回调
 * @param uploadUrl后端提供的图片上传接口地址
 */
export const uploadImagesCloud = (option, dataCall, urlCall, errorCall, uploadUrl) => {
    if (!option || !dataCall || !urlCall) {
        return false;
    }
    let flagId = new Date().getTime() + Math.random(),
        toonUrl = 'http://127.0.0.1:6780/getResult',
        endTime = new Date() + 300000; // 五分钟
    option.flagId = flagId;

    // 调起手机拍照/相册
    window.location.href = 'toon://mwap/photo?params=' + JSON.stringify(option);

    // let imgcount = 1;
    if (window.location.hostname === 'localhost') { // 本地测试环境，指向dev的路径
        toonUrl = 'http://localhost:8080/api/getResult';
    } else if (window.location.hostname === '172.31.240.32') { // 本地测试环境，指向dev的路径
        // toonUrl = 'http://172.31.240.32:8080/api/getResult';
    }
    /** 获取图片base64以及二进制流大小 **/
    function getResult () {
        let sendTime = Date.now();
        MAjax({
            url: toonUrl,
            type: 'POST',
            data: 'params={"flagId":' + option.flagId + '}',
            success: function (e) {
                console.log('toon response: ');
                let res = JSON.parse(e),
                    imgArr = [],
                    originalArr = [];
                if (res.data.result && res.data.result === 'cancel') {
                    // 用户取消
                    // window.alert('33');
                    if (dataCall) {
                        dataCall('cancel');
                    }
                    return false;
                } else if (res.data.imageArr) {
                    // 多张图片收集长宽
                    let i,
                        len = res.data.imageArr.length,
                        imgItem,
                        imgEl = new window.Image(),
                        imgTemp;
                    originalArr = res.data.imageArr;
                    for (i = 0;i < len;i++) {
                        imgItem = res.data.imageArr[i];
                        imgEl.src = 'data:image/' + imgItem.imageType + ';base64,' + imgItem.base64;
                        imgTemp = {
                            size: imgItem.size,
                            imageType: imgItem.imageType,
                            src: imgEl.src,
                            id: new Date().getTime() + Math.random(),
                            width: imgItem.width,
                            height: imgItem.height
                        };
                        imgArr.push(imgTemp);
                    }
                } else {
                    // 单张图片收集长宽
                    let imgItem,
                        imgEl = new window.Image(),
                        imgTemp;
                    imgItem = res.data;
                    originalArr.push(imgItem);
                    imgEl.src = 'data:image/' + imgItem.imageType + ';base64,' + imgItem.base64;
                    imgTemp = {
                        size: imgItem.size,
                        type: imgItem.imageType,
                        src: imgEl.src,
                        id: new Date().getTime() + Math.random(),
                        width: imgItem.width,
                        height: imgItem.height
                    };
                    // window.alert(JSON.stringify(imgTemp));
                    imgArr.push(imgTemp);
                }
                // 返回图片
                if (dataCall) {
                    dataCall(imgArr);
                }
                // 获取token，上传图片
                getTokenOnce(imgArr, originalArr, urlCall, uploadUrl);
            },
            error: function (e) {
                let imgArr = [{type: 'jpg', width: 1080, height: 1080, size: 28992, src: '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAB4AIkDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9RwOKDilHSmOyopZjwOTXnljJ3ITjPrUCYXlAN7HBJ5xUkNwJskAY7EVGwG8xgBcHK47mgRPExZCc9CRTgAuecd8VHAx5Q9RSS4ONoYkYoAe4UDl9pY/WoGILF+WBA59aldGfIYjB6DGKwvEGs3Wk2qwafZJeX0yyPFHJIUjVY03M7kAkKPlHAJLMoHrTSu7ITNZSZchiduPlGOajuIoiqR7yHzkEdjTYridraOaSHyZnjV2iJBMbEDKkjuDkZ9qljgDBZSx3E8Ed6AMWGd7DxellK77b23cx5bIO1VOPqCrn/gVb82Acdz1NfOX/AAk9jrfx68TeKdHne6sfDen2unQypKRE99vOQuDhgMuD7Zr2zwr4qh8SQuksaw3sI3Swg5G0nAYd8dvY0oN1Ye0W2q+52O7MME8vqRozfvOMZNbW5knZ+iZts1xviELhRnnPpVtwD84PIBxzxVO5GEBxklSvuCfQUtuJQNkrjbgAE8fhTOG4T2wkK4cDb1HY/WmxRMk5J+6Bwc1I5IIUU5DhSCSTRcROH2gZODS5HpUIk4zjdj9Kf5h/uD8jSKJi2BUF4rywtEgyX+Xr2pJXDOAGOB1AFOAYqBuIx09aAIraDyR5ZPzKOx61I7IHbKU6GHYxdjljx9BSyorHBPJ4oAYsgbiMcDqfU0Rhw7GXGAfkP4UyFXL/ACYWNSQRjkntUiSLLIVH8P60AJNulHl4wmMknj8K4jxfLda1PP4Y027ks1ltJIbm9hO2aBmI2qhI4PRiR6AV0XibWYtLsCEvI4rm4Pk227J3SH0AB6DJ9OK4bQ9Q1G4gFxJJa3NxdiOT7SgZhJmNeSDjB6nA7be5rooU1LWWwlUdOSlHdHGtrX7QPg2yS3jOheNLSNcJ9qd7S+2joGbox47gn3rjvFXxE/aZ8e2z+HrPwtYeB9NuAY7i8a53y+WeoDnnpnhVzXpevSrq0f2u31CORSSolt/unaSGGdxH3gQfcGvnT41/tAWvw41ux+H3gyybxb8R9ZdYdM0RZMrAzj5Zbkj/AFaAZbbnJAJ+VQWqJZdCWnPK3a/62v8Aie9R4j9jL2v1Wk6nSTi9H35VJQv/ANunqng7SvCfgKDSfBMOoxi8nhlvUjky1zfOmBLdOozsQEhV3YAyACWNeRfEr4sy+GvjK+r+HvEc8Gp+FoYrWx0y0mDyX00qefKktvkGSLy12kjOPm+6QDXX/Drwtd+AtLudQ8Sa2fEfjfxA6Ta9rLL/AK2Qfct4F/5Z28QJWOMADqxGWNYHwS/Y61rx58Sdb+Nvx6097eC5vpZdF0AylJfKLsPNvNvQMm0LDkkD723OK76cadKKhbRdDwcRXr4ytLEVpXnJ3bfVs+t/h/8AEOPx94Ps/Ew0C90madMzWF6AXhkGNyh1JWRefldTg+xyK6m1TAEskhYt8646DNcx4i1bRvBukfbG8q1tbCMBERQiqijhVA4AwOgrc8Oa7pXiLSIdW0e4S5tJwGjdRjAx0I7EdxXBVgoPTYSLznJGOafuG05HWmt8x4GfpT0QuAw4x2rIBUO3gKvOM4607zIf+ei/nTJGJdQRhe+BzTPsdp/zzH5UDJB++zjn1x0p8UZVs5IGMY96WNREmAPfAqVenU/jQOwpOBUEhMjBVH4092PQUqJjr3oAAgC4BwKjm2rHKztgBSScdBjmp26V5R8Yvi5p3hXS9b0jRbe51rWtJ09tRvNM07D3K24GQCoOQWyOACcEeoq6dN1JcqBuyKreNtN8VXkj6bqF0bON0ayl8kRxZBHR2GX39yvAVeorWg32yK7HDlgcnr1zz7k8n8B2r4X+In7avxFs9NvLCLQ7Cxt1TDwWzpK0W4DymWQ5DDkN9z246jmNA/bi+IXwq0ZbT4mrJ4mku3eS3CNEhWMBcr8o3KSSeWJ6EY716qoOK06GWrt5nlE/7aPx68BadrPwf0G3sHvYtZv7Wzu5LN5b+0eS6kLQxpna7b2bZuUkZ6HjHvX7Kf7P2t+B5JvFvi1J9W+JHidWlu5JZPOlsYnOWjaRj99uDLITjgIDgc9R8F/HnwN/aT8Z3Hir4c+EtPt/GkUIm1K5vdLWK8tIj8vmvOAVI/hDKdzdPavqjTLfwl8O9Iaa7lSFWAM1xKP3tyw9uuB2UcDvk81lJjs3oaHgX4eWOjImoXri5vTyZyPlj9RGDyP948ntitrxv8RfCvw90aS/1zUI7aKJCyxLzI49l/qePevmr40ftq6Z4Os3tdDCwyP8kR2iSd89CqdFHHU8V8la18bJ/HWptq3iNtX1CSQ7vLYhV9sljz+WPSnGlUqawVzKpiKNDSckj6H8dfFvXPjH4kEFmr22hQSYijBIMq/7Xrn+gr3z4LX97oIS0LH7LcYEiDkA9Aw96+GtB+Lt3ZDy7LwlbIh4Bkun3Y+qgYP0r0S0+OniO7S13eGdDBtH823MiSy+W+MbsF8E+mQa6I5Tiqz1Vvu/zPOq55g6S+K/yf8AkfoYl5HPJJBbTxSSwHbNHHIHZD/tAHKn61LJqFrYtBDdXUMEt0+yFJZFRpWxnaoJyx9hX526d4r12yu7nUbS4jhurs7ppgv7wknJw2cjJPak1nxb4o1wwf2z4gvr37M7SQefMX8pmxkrnlc4HT0Fdq4ZlzfxNPQ8l8VwUb+zd/X/AIHY/QfxX4m07wdoN34l19p4rGxVWleOEu3JAGAPcivOP+GpvhJ/z/an/wCAJ/8Aiq+RLT4h+ONMk8+z8XaqCowBJctKhHoUfKkfUVu/8Ld+IP8A0H1/8Abb/wCN1rT4cUFab5vnb8LP8zKfFHtHeC5flzfjzR/I+/Y0K8465OPQmpC23CA/MakA4o4FfIn2ogFL0FYfjHxnoHgTQp/EXiO7eCytyqsY4zI5ZjhQFHOT+VeEeOf27/hR4K0K81yfQfEd0kAxAghijNzIQdqKC5IyfbgZNdFLCV60HUhFuK69DnqYuhSqKlOS5nsuv3Hq3xf+KVr8NPD3n2tumoa/qGYNI00Phrib++3cRJ9529BgckV8l/D7w34ktNN8ZaT408UX+qrr8LXGq6tYRrDfPd3LuJhFKG3RFAECoQVA5zyFHGeG9V+NvxR8aL8R/ifoU2kJ4hju/sOqQLJPbWVikBZLRbdFd1CyADzDtLEu3zHFe1fDa4trCwtdP1+60y+8U3Ymm1DSdDSW5EsT5WCNI2AbaExuZgAWLdMZr08PTp0KV38TNKkKvP8A3f1Pz28aPaeMfF+pXdhpt3ZxCzeKwtLg7ZIYY8CIEtgsQn4k9Otafwk/ZQ+Iv7VK6Rf2t/HpfhvT52ttS1yaAiO3iT/llCmB9pnY5OAdq9XK55+5Iv2PvDWr+J/+Fj/H6/trDR7S5kuNM8K2MoRGDHg3Uq/MzHAzHG23gfNj5aj+Mn7Yvw3+F2mw+F/CNnBa29mGtLWx0+FEeFVXIVIRgRJ05OOvc1E587tDc0lUVOOr0Op8L+F/g5+yX8Ol8JeC7CGwtYv39zLPIrXV/OBg3F1Lxvb0HCqOFAHX5N+Nf7ReteMNSuLTw/qkcUe5kF42CFH/AEyXp9Cfyrxn4jfGH4h/GjUludfvDbWaKESztyQhAOQzn+NvfpWZpWhBMMykn1NdVDASm7zZ4mLzWME1D7yZNJgvb59R1C6uNSu5iDJPM2WY+5robTToQR5duEA9K0fDHhXU9e1O10XRNPmvb67cRwW8K7nkb0A/r0FfZ3wZ/ZC0bw3a2/ir4sCO+vGVJYNHU/uoHBz+8YHEp6ZH3Rz96vVnOlgo3m9e3U8GnQr5lNqmtOr6I8J+EH7PPjb4kiPUrW2XTNE3Mr6ndj5Mr2RMhpDnA4496+kdL/Zs+F3hqwMepLqOtXZiCtNLcmBA46siJyPTknivZZZ3uAsUEQSNBtSNBgKPQAdK8V+Mf7RPw4+FpfTr++bV9bKMU0ywYMwI4/ey/cj5I45b/ZryK2ZV6r9x8q8v8z6TA5BQTUFDnk+6v+G39bnk/wASfC+neGNeA0eOSKwukLRxO5cxMvBXceSOQRnnmuNlYk8eldB4c8b3Pxs8T6Da+Ib3S9CstWhe5hhjjaSa2xgMGYn951BzgYHYV9OaH+yF4JRVn1bW9SvgeQI9sIP5ZNezQzmjQoRWJk+f018vwPmMx4exM8ZOOGglC/dWXf8AG+x8esrMpAU9K0/Lk/un8q+3bb9nP4X2a7IvDjS8YDTOXx+ZFXv+FEeA/wDoCWn/AIDj/GplxHheiZlHhXGdZR/H/I5vWf2uPhTYRv8A2UdX1iQcKLazMSN775Sox+Bry3xt+134k8QaXdaV4Y8PjQvPGxb37YZLiNfVcKFU+/OK8IfCpgelViQBW9DJMHRfNy3fm/8AhkZ4jP8AHVly8yin2X66v8TW1PxT4k1sytrOv6hemd/Nl+0XLvvfAGWBOCcAfkKv6D4H8CfFPSZ/A3jX+z7a4W8g1PTL68V9qugKTW7FCG2SIR0PBUEA4IPL78GnEngg4Nd9fCxr0XR2TPPwePng8RHEbtfro9T6W0W+8MeDtGtrPxj8SNLsbax826jsPD7vKzRF2cKJ5wvy89lz78Vwviz9u34V+BILu0+Gmg21vdvHj7R5Xn3Fxg8BnHJ743Nge1fJ/jjwpPfatO0000kbMWjVpGKqDzgAnA70zwl8BvE3ihwdH0VjADhppMJGPxPJ/AV83Uy10rutPT7j7KGffWbRowu/v/IsfFX9qz4tfFe4uoYZ20uyutmQpzKpX+63OzPtXl+l+DdV1i6e8nS4up5n3yyvlmZj3Zj1NfWXhT9lHTrMrLr1890+BmOGPYoP1OSfyFeweHPgt4bsPLhttGU4woGMlj/Wuf63hsPpTVzV4XGYrWq+VHxpoPwr1Aqhkh2A9tpY/pXsPw2/Zb8U+NriOQI2m6Z8we9uI+CR2RM5Y+/A96+v9C+HeiaEiXF9ZQJIwBSBEBc/U1hfFD4/fDj4P2xg8Tauxv8AyzJFo2nJ514y+rKOI1/2nKj0zVf2nUatCNhRyOm5Xqyb/A6P4V/CHwN8JdPFvoOnrdak64nvplDTSH3b+Ff9leK6LU9UtRdH7bcGWYdIIsMw/Doo+pFeEfDn9o4/E7whrfja9hh8LeHdMu5YQ7XPzeTHGrSSTTcAYLYwuBx1NeF+L/8Agob4Wt77/hHPg/4B1TxVeTSeVBNIGtoZ5O3lxKrTS5+ik1wzcpy5pvU9iFONGPs6askfZmqardXYa2wILdwQ0MTHLD/afgn6DA+teF/FP9nL4WeLzaSXGmPpF1brJ9kewn8jG87nxEco2TknjPU5rg9D039sb4pwDWPiP42tPhP4fceY1ho1on9ptH6M7ljDx3Zt3+zXVWHgXwP8NGOvs179ulUqdW1i8k1DVroEc4eYnylP91QP90VLlGmuZuyRvQhXq1FTw93KWiSvd/dueX6j8Gtf8JfEDw94j0O/tLqw0eVY0iLtBJFAxxN8oBWQFSRjg5Oeor9Gvhhqh1fwNpN08m91h8pz3JU4/liviNvH3gjV7hrGS61K3kb5FuZJVdVbsWXHAz7CvqP9nLXvt3hltNklVyFW4jIPBBGDj26GuSriKeJXPTkn6HVissxmVyVPGU3Bva6tc9feRFO0k5PoKZ5yf3z+VOV48HDg4znvim+fb/3f/Ha5zlZ+aM7BUAB7VSkYk8d6syAuBuzgCo1iLHCL+Nfq0Ufjs5ESxnqeKswwFzgL+dbvhLwL4k8ZagNO8PaNc30wGX8tflQerMeFH1NfUnwe/Z4sfCWzV/GNpZ3upuAUtyoljt/fJ4LfhgVw47MqGBjebvLt1OzL8rxGZStBWj/M9v8Ag+h86eFPgt4m8bNHeadp0xVCP3gjOMd+TwPxNfRnhb4WW/hnSUtJCZbhgDK7KAQcdPevcIbeKGJYIo1SNeiqMAfh0qO+tbORDNcxg7ATnODXxmPzWpj3Zqy7H32V5PSyyOjvLv8A8A8qj8KoHWOKIFm4A6VW1jxB4f8ABFjNd3F3awvENs11cOqRQ5OAMnjJ/wD11S+Kfxd8LeA7IwzanBDdXHAQyDzSCwXao64BPJHocZxx+e/xh8Z3/jjxfaXnizxPFr2iXRkS50m2aT7JorxPgwyCMgSg4Z2diGbAHTIqcPhpT1PTlUjDc9L/AGgf2ufF99f6l4V+D/iHT7W2tNMfUbvX45RJNcBJBHLBbufkjdSRk8k5G0jrXgHiXUNX8PeFfC/ifxPfXovNZ02Z7t1lWUi2luXZmkc5Zm2urc5OcjOOm5aw+DLL4d+Io9NKk3sy7L/ULXd52F3FXC4EYjbJVM4PGfStX4X/AA/0XxB4T8If8JdfXt/fC1LW1rMp2NEeRuYfeUBunAPQg7cV3xpxpLcUZOd2lseq6H8Jb3xt+yXqvw90Wa00q+8Q79Sshlljy0sc0UcxxnLKgRyBgHnGBWJ+wz4Qt/hm/ijRPHng+fRfH0V2JElvbfLyabsUA203KMnmbt+xsnKZ4xXrWh62dM0yOzgfy1QlUVQWOM4HNOuvE00lu4SWZzh9o3ADcOD0zg54rkau7hds7fX/ABfaR2c2rXEg+x2OSinkSSL/ABEdwvYevPavjz4neN/E3j3xHPaWdzMq/dmZWOVB/wCWYPYYxnHJPfAr1nx9f3um+EodP+ZjcSAZ3cFuWI/E1g+Bvh8kFus9zHumk/eSMRyWPJ/WvKxUFiK/s5fDGzt3b/yX5n1WAxk8jy361h9K1ZuKl1jCNr27OUna/aPmedeCvgpc3Gox6jHdXFrMGzvhkYbvUMDkMPrX23+zqmoeFNes9AkR5NPlRlhbBzB8uShPQoTyvcHI6YNcT4b8K+VtaOPHA6CvavBOm/2dcW86JlkKtwOvNNU4Qu4rc8fFZli8bBQxFRySu1fu9/yPaH5UKgA3nLGjbH7VAJfOTzIxw3PTnNG1vT/x01BxXPhn4f8AwS8cfERhNptgLSwHDXt2DHF/wHjL/wDAR+Ne/wDhD9lXwVoojm8RahPrFyMFlVfKiz7Dkn8TXtdvpoiVVknZwowqhQqgegA6Cp2iWNSY1G7BAzXuYvO8TiNIPlXl/nv+R4OC4dwmGSdRc8u72+7b77mPpOjaN4cthp2hadBZWy9I4kABPqT1JPqa14UH38cmiK32xhXHJHJxUyqFGAMAe1eLJyk7vc92MVFWS0FArhPjN4lvPCfge+1mytWuJbeGeZY0zudo4XkCj3O0iu8zVDWtHsde0+XTNQjLwzY+6cMrA5DKexBoj7sk7FH4sfEX4wJ8T9VTx1p2j6lqcemqLiXz4EKCVwqx7ju3IFbIAGRtOMc5pngb4cLFNeeL/GnifUNPTUG2yWFrEUa4DEM0ZUE74+g54wMckcfX2t/sc+FNF8TaodItJmtftczQxy42xqzZwqABVH4dK0bL9n6C1IIswxAxllzx6V6P1m3woUuVpJHyB8Q9H8S+NryXSNHsriLR1lxbFgEULn/WsM5yck9M+1et+Exp/gfw2umeH7Oe81FY1gjub4ylETI3HoSAByFzyQBx29+t/g40IAS1RfomKtp8Jrgf8sB/3zWUsROTuy5VOaCgkkl26+bPFE8SavvVbTQXitwpQMERpSu0hXJYY3fNnpx0FRtqnjC8mV2tbggxJHLE0xWJtpJVlA+64+X1Bx0r3ZPhVdjhYR+VTx/C27BAMft0qPayMrI8Hm0XxT4iigTWdQmfyJRKsQRFG7/ZYD04Ib869V8GaDfXNigvbdFnDMpKYI254JxxnGMgcZrvtO+F8ykLLCrAdBiu00HwO9oVCxrtHUYxzUN31tqaSqTlFQlJuMb2XRX3t6mb4Y8MbRHmPhiAPrXp+jeF4o08yYbccbB/Wp9A0VLQGWSMbjyox0963FDK3AH+NZNvoSV4bV7dnGAVYhh7HvUuw+n/AI9T5ll4aM9Rgj1qrmX/AJ6L/wB9VNmDNby+Opo8sepoorr5EIXyx6n8qNg9T+VFFPkQBsHqfyoKe5/KiilyIDFvfDdtc3EkxiBLndnHeoP+EStf+eQ/KiiqSQAPCdsP+WQ/KnjwtbD/AJZD8qKKTSAcPDNsOkQ/KnL4btwTiFfxFFFPlQEyaFDHyEBP0qZNMSP7igfhRRSsgLAtzwOnHanGAY96KKFFAI0JJye3rTPsEP8AdP50UUcqA//Z'}];
                dataCall(imgArr);
                console.error('未获取到图片信息: ', e);
                let time = Date.now();
                if (time < sendTime + 1000 * 10 || time > endTime) { // 10秒内，或超过5分钟，就停止
                    return errorCall && errorCall();
                } else {
                    console.log('回答状态超时,再次获取！', endTime, time);
                    // getResult();
                    setTimeout(getResult, 1000);
                }
            }
        });
    }
    getResult();

    // function getTokenOnce (arr, dataArr, callBack) {
    //     MAjax({
    //         // url: "http://t200.signon.systoon.com/phpcode/getToken.php",
    //         url: 'http://qiniu.systoon.com/getToken.php',
    //         success: function (res) {
    //             console.log('base.core.uploadImgStateful.getTokenOnce: ', res);
    //             var k, len = arr.length;
    //             for (k = 0;k < len;k++) {
    //                 uploadToCloud(dataArr[k], res, arr[k].id, callBack, errorCall);
    //             }
    //         },
    //         error: function () {
    //             console.error('获取Token失败');
    //             return errorCall && errorCall(arr);
    //         }
    //     });
    // }
    function getTokenOnce (arr, dataArr, callBack, uploadUrl) {
            // MAjax({
            //     // url: "http://t200.signon.systoon.com/phpcode/getToken.php",
            //     url: 'http://qiniu.systoon.com/getToken.php',
            //     success: function (res) {
            //         window.alert('token成功');
            //         console.log('base.core.uploadImgStateful.getTokenOnce: ', res);
        var k, len = arr.length;
        let res = window.sessionStorage.getItem('token');
        for (k = 0;k < len;k++) {
            uploadToCloud(dataArr[k], res, arr[k].id, callBack, errorCall, uploadUrl);
        }
        //     },
        //     error: function () {
        //         console.error('获取Token失败');
        //         return errorCall && errorCall(arr);
        //     }
        // });
    }
    function _post (url, body, param) {
        // window.alert('post');
        return Vue.http.post(url, body, {params: param})
        .then((res) => {
            // window.alert(res.code);
            return res.data;
        }).catch((error) => {
            // window.alert('catch');
            return {
                code: error.status,
                message: url + '接口调用异常', // error.statusText,
                data: ''
            };
        });
    }
    function uploadToCloud (item, token, id, upCallBack, uploadUrl) {
        let body = {
            imgStr: item.base64
        };
        let params = {
            access_token: token
        };
        // let url = uploadUrl;
        let url = '//172.28.50.84:8083/authentication/uploadDown/uploadBase64BackUrl'; // **这个是物业的测试地址，他人使用时需把地址改成后端提供的图片上传地址
        _post(url, body, params).then((res) => {
            // window.alert(JSON.stringify(res));
            var urlTemp = {
                // url: 'http://fast.scloud.systoon.com/f/' + JSON.parse(res).key,
                url: res.data,
                // url: 'http://static1.systoon.com/share/img/185x185.png'
                id: id
            };
            upCallBack(urlTemp);
        }).catch((error) => {
            window.alert(error);
        });
        // api.uploadImg(params).then(res => {
        //     window.alert(res);
        // }).catch(e => {
        //     window.alert('失败');
        // });
        // window.alert(JSON.stringify(item.base64));
        // MAjax({
        //     // url: 'http://upload.qiniu.com/putb64/' + item.size,
        //     // url: 'http://172.28.50.84:8083/authentication/uploadDown/uploadBase64AndReturnUrl/' + item.size,
        //     url: 'http://172.31.64.38:8091/uploadDown/uploadBase64AndReturnUrl',
        //     type: 'POST',
        //     data: params,
        //     // data: JSON.stringify(item.base64),
        //     beforeSend: function (res, setHeader) {
        //         setHeader('Content-Type', 'application/octet-stream');
        //         setHeader('Authorization', 'UpToken ' + token);
        //     },
        //     success: function (res) {
        //         window.alert('图片地址' + JSON.parse(res).key);
        //         // 返回图片地址
        //         var urlTemp = {
        //             // url: 'http://fast.scloud.systoon.com/f/' + JSON.parse(res).key,
        //             url: JSON.parse(res).key,
        //             // url: 'http://apr.qiniu.toon.mobi/' + JSON.parse(res).key,
        //             id: id
        //         };
        //         console.log('base.core.uploadImgStateful.uploadToCloud: ', res, urlTemp);
        //         window.alert(urlTemp.url);
        //         upCallBack(urlTemp);
        //     },
        //     error: function () {
        //         window.alert('0');
        //         console.error('上传失败');
        //         return errorCall && errorCall(id);
        //     }
        // });
    }
    // function uploadToCloud (item, token, id, upCallBack) {
    //     MAjax({
    //         // url: 'http://upload.qiniu.com/putb64/' + item.size,
    //         url: 'http://172.28.50.84:8083/authentication/uploadDown/uploadBase64AndReturnUrl/' + item.size,

    //         type: 'POST',
    //         data: item.base64,
    //         beforeSend: function (res, setHeader) {
    //             setHeader('Content-Type', 'application/octet-stream');
    //             setHeader('Authorization', 'UpToken ' + token);
    //         },
    //         success: function (res) {
    //             // 返回图片地址
    //             var urlTemp = {
    //                 // url:"http://oa91tlxmn.bkt.clouddn.com/"+JSON.parse(res).key,
    //                 url: 'http://apr.qiniu.toon.mobi/' + JSON.parse(res).key,
    //                 id: id
    //             };
    //             console.log('base.core.uploadImgStateful.uploadToCloud: ', res, urlTemp);
    //             upCallBack(urlTemp);
    //         },
    //         error: function () {
    //             console.error('上传失败');
    //             return errorCall && errorCall(id);
    //         }
    //     });
    // }
};
/**
 * 给原生传值
 * 注意：需在index.html的head中创建<notification>标签；
 *              -- Author by Dio Zhu. on 2017.3.22
 关注：
 {
     type: 'follow', // 关注
     userId: String, // 当前用户id
     followUserId: String, // 要关注的用户id
     status: Number // 0：未关注、1：已关注
 }
 心动：
 {
     type: 'activityPurpose', // activityPurpose：活动的心动、partyPurpose：组局的心动
     id: String, // 对应的活动id或组局id
     userId: String, // 当前用户id
     status: Number // 0：未心动、1：已心动
 }
 评论点赞：
 {
     type: 'partyComments', // 评论点赞
     id: String, // 对应的组局id
     userId: String, // 当前用户id
     commentum: Number, // 评论数
     praiseNum: Number // 点赞数
 }
 */
export const toonNotify = (dat) => {
    if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) { // ios
        document.notification = dat;
        try {
            setNotification(dat); //eslint-disable-line
            console.log('toonNotify.ios.setNotification.success!', dat);
        } catch (e) {
            console.error('toonNotify.ios.error: not find setNotification...', dat, e);
        }
    } else { // android
        try {
            window.getNotification.getNotification(JSON.stringify(dat)); //eslint-disable-line
            console.log('toonNotify.android.setNotification.success!', dat);
        } catch (e) {
            console.error('toonNotify.android.error: not find setNotification...', dat, e);
        }
    }
};

/**
 * 通知原生打开新的mwap，加载h5页面
 * 注意：需在index.html的head中创建<notification>标签；
 *              -- Author by Dio Zhu. on 2017.6.14
 */
export const toonOpenMwap = (url) => {
    // try {
    //     window.toonOpenMwap.toonOpenMwap(url);
    //     console.log('toonOpenMwap.success: ', url);
    // } catch (e) {
    //     console.error('toonOpenMwap.error: ', e);
    // }
    if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) { // ios
        document.notification = url;
        try {
            toonOpenMwap(url); //eslint-disable-line
            console.log('toonOpenMwap.ios.toonOpenMwap.success!', url);
        } catch (e) {
            console.error('toonOpenMwap.ios.error: not find toonOpenMwap...', url, e);
        }
    } else { // android
        try {
            window.toonOpenMwap.toonOpenMwap(url); //eslint-disable-line
            console.log('toonOpenMwap.android.toonOpenMwap.success!', url);
        } catch (e) {
            console.error('toonOpenMwap.android.error: not find toonOpenMwap...', url, e);
        }
    }
};
/**
 * 通知原生打开新的原生页面
 * 注意：需在index.html的head中创建<notification>标签；
 *              -- Author by Dio Zhu. on 2017.6.14
 */
export const toonOpenNative = (url) => {
    // try {
    //     window.toonOpenNative.toonOpenNative(url);
    //     console.log('toonOpenMwap.success: ', url);
    // } catch (e) {
    //     console.error('toonOpenNative.error: ', e);
    // }
    if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) { // ios
        document.notification = url;
        try {
            toonOpenNative(url); //eslint-disable-line
            console.log('toonOpenNative.ios.toonOpenNative.success!', url);
        } catch (e) {
            console.error('toonOpenNative.ios.error: not find toonOpenNative...', url, e);
        }
    } else { // android
        try {
            window.toonOpenNative.toonOpenNative(url); //eslint-disable-line
            console.log('toonOpenNative.android.toonOpenNative.success!', url);
        } catch (e) {
            console.error('toonOpenNative.android.error: not find toonOpenNative...', url, e);
        }
    }
};
