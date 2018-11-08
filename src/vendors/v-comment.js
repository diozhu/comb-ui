/**
 * Created by diozhu on 2017/2/9.
 */

import Vue from 'vue';
import CONFIG from '../config';
import logger from '../js/utils/logger';
import * as api from '../js/core/api';
import _promise from '../js/utils/promise';
import store from '../store';

if (typeof Promise === 'undefined') {
    var Promise = _promise;
}

let MicroComment = {
    currentItem: null,    // 当前的评论对象，用于从列表页面跳转到详情页的临时存储
    setCurrentItem (item) {
        if (item) this.currentItem = item;
    },
    getCurrentItem () {
        return this.currentItem;
    },
    clearCurrentItem () {
        this.currentItem = null;
    },

    comments_retry_num: 0,   // 微服务重试次数（目前仅限于token类错误）
    comments_retry_max: 3,   // 微服务最大重试次数

    getToken () {
        if (!api.vGetMicroCommentToken || typeof api.vGetMicroCommentToken !== 'function') {
            return Promise.reject('无效token，请在api中实现vGetMicroCommentToken方法');
        }
        let _self = this;
        if (this.comments_retry_num < this.comments_retry_max) {
            this.comments_retry_num += 1;
            return api.vGetMicroCommentToken().then(function (res) {
                _self.comments_retry_num = 0;
                return Promise.resolve(res);
            });
        } else {
            return Promise.reject('token尝试超过限制，请刷新页面重试');
        }
    },

    /**
     * 添加评论。
     * @subjectId int 本地服务的，需要评论的记录ID
     * @userId int  本地用户ID
     * @content String 评论内容，微服务最多支持到5000，可在配置文件（config）中设定最大长度
     * @toUserId int    所回复的对象，默认0
     * @toId int    所回复的评论ID，默认0
     *              -- Author By Dio Zhu. on 2017.2.10
     */
    addComment ({subjectId = 0, userId = 0, content = '', toUserId = 0, toId = 0, parent = 0}) {
        let _self = this,
            url = CONFIG.COMMENT_UTL + '/v1/comment',
            params = { 'appId': CONFIG.COMMENT_APPID, 'token': CONFIG.COMMENT_TOKEN };

        // 校验token是否存在
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.addComment(subjectId, userId, content, toUserId, toId);
            });
        }

        params.subjectId = parseInt(subjectId);
        params.userId = parseInt(userId);
        params.content = content.replace(/(^\s*)|(\s*$)/g, ''); // trim掉两头空格。 Mod by Dio Zhu. on 2017.1.22
        params.toUserId = parseInt(toUserId);
        params.toId = parseInt(toId);
        params.parent = parseInt(parent);

        if (!params.appId) {
            return new Promise(function (resolve, reject) {
                reject('微服务配置信息错误，请确认config.js的配置(COMMENT_APPID)');
            });
        }

        return Vue.http.post(url, params).then(function (res) {
            let result = res.data;
            logger.log('[comments].addComment.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return this.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.addComment(subjectId, userId, content, toUserId, toId);
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                _self.setCurrentItem({
                    OPT: 1 // 操作标识，返回列表时按此标识操作，1：添加，0：删除
                });
                return Promise.resolve(result);
            }
        });
    },

    /**
     * 删除评论
     *              -- Author By Dio Zhu. on 2017.4.13
     */
    delComment ({subjectId = 0, commentId = 0}) {
        logger.log('[comments].delComment：');
        // if (!topicId) return Promise.reject('删除参数错误');

        let _self = this,
            uri = CONFIG.COMMENT_UTL + '/v1/comment/' + commentId + '?',
            key,
            params = {
                appId: CONFIG.COMMENT_APPID,
                token: CONFIG.COMMENT_TOKEN
            };

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.delComment({subjectId, commentId});
            });
        }

        params.subjectId = parseInt(subjectId);
        // params.cId = parseInt(commentId);
        params.userId = parseInt(store.getters.userInfo.id);
        for (key in params) { if (params.hasOwnProperty(key)) { uri += key + '=' + encodeURIComponent(params[key]) + '&'; } }

        return Vue.http.delete(uri, params).then(function (res) {
            let result = res.data;
            logger.log('[comments].delComment.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.delComment({subjectId, commentId});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                _self.setCurrentItem({
                    OPT: 0 // 操作标识，返回列表时按此标识操作，1：添加，0：删除
                });
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 根据已有的列表数据，获取对应的评论点赞对象列表
     * @newDat Array 本地服务的列表数据
     * return Array 评论点赞对象列表数据
     *              -- Author By Dio Zhu. on 2017.2.10
     */
    getSubject (id) {
        logger.log('[comments].getSubject：', id);
        if (!id) {
            // return Promise.reject('无新数据');
            return Promise.resolve(null);
        }

        let commentsIds = [id],
            uri = CONFIG.COMMENT_UTL + '/v1/comment/subject?',
            params = {ids: '[' + commentsIds.toString() + ']'},
            key;

        if (!params.ids) {
            return Promise.reject({msg: '无效的SubjectIds'});
        }

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then((res) => {
                CONFIG.COMMENT_TOKEN = res;
                return this.getSubject(id);
            });
        }

        params.appId = CONFIG.COMMENT_APPID;
        params.token = CONFIG.COMMENT_TOKEN;
        params.userId = parseInt(store.getters.userInfo.id) || 0;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then((res) => {
            let result = res.data;
            logger.log('[comments].getSubject.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return this.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return this.getSubject(id);
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res[0] || null);
            }
        });
    },
    getSubjectList (newDat) {
        logger.log('[comments].getSubjectList：', newDat);
        if (!newDat) {
            // return Promise.reject('无新数据');
            return Promise.resolve([]);
        }

        let commentsIds = [];
        newDat.forEach(function (v) { // 添加需要检索的id，后续批量获取评论用
            commentsIds.push(v.id);
        });

        let _self = this,
            uri = CONFIG.COMMENT_UTL + '/v1/comment/subject?',
            params = {ids: '[' + commentsIds.toString() + ']'},
            key;

        if (!params.ids) {
            return Promise.reject({msg: '无效的SubjectIds'});
        }

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.getSubjectList(newDat);
            });
        }

        params.appId = CONFIG.COMMENT_APPID;
        params.token = CONFIG.COMMENT_TOKEN;
        params.userId = parseInt(store.getters.userInfo.id) || 0;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(function (res) {
            let result = res.data;
            logger.log('[comments].getSubjectList.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.getSubjectList(newDat);
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 获取当前主题的评论列表
     * @subjectId int 本地服务的主题ID
     * @offset int 当前页
     * @limit int 获取记录数
     *              -- Author by Dio Zhu. on 2017.2.10
     */
    getComments ({subjectId = 0, offset = 1, limit = CONFIG.COMMENT_LIMIT} = {}) {
    // getComments (subjectId, offset, limit) {
        let _self = this,
            params = {},
            key,
            uri = CONFIG.COMMENT_UTL + '/v1/comment?';

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.getComments({subjectId, offset, limit});
            });
        }

        logger.log('MicroComment.getComments: ', subjectId, offset, limit);

        params.appId = CONFIG.COMMENT_APPID;
        params.token = CONFIG.COMMENT_TOKEN;
        params.userId = parseInt(store.getters.userInfo.id) || 0;
        params.subjectId = subjectId;
        params.offset = offset;
        // params.limit = offset + limit;
        params.limit = limit;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(function (res) {
            let result = res.data;
            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.getComments({subjectId, offset, limit});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },
    /**
     * 获取当前主题的评论列表--盖楼样式
     *              -- Author by Dio Zhu. on 2017.4.19
     */
    getCommentsReply ({subjectId = 0, offset = 1, limit = CONFIG.COMMENT_LIMIT} = {}) {
    // getComments (subjectId, offset, limit) {
        let _self = this,
            params = {},
            key,
            uri = CONFIG.COMMENT_UTL + '/v1/comment/list?';

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.getCommentsReply({subjectId, offset, limit});
            });
        }

        logger.log('MicroComment.getCommentsReply: ', subjectId, offset, limit);

        params.appId = CONFIG.COMMENT_APPID;
        params.token = CONFIG.COMMENT_TOKEN;
        params.userId = parseInt(store.getters.userInfo.id) || 0;
        params.subjectId = subjectId;
        params.offset = offset;
        // params.limit = offset + limit;
        params.limit = limit;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(function (res) {
            let result = res.data;
            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.getCommentsReply({subjectId, offset, limit});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 获取当前主题的点赞列表
     * @subjectId int 本地服务的主题ID
     * @offset int 当前页
     * @limit int 获取记录数
     *              -- Author by Dio Zhu. on 2017.2.10
     */
    getPraise ({subjectId = 0, offset = 1, limit = 15} = {}) {
    // getComments (subjectId, offset, limit) {
        let _self = this,
            params = {},
            key,
            uri = CONFIG.COMMENT_UTL + '/v1/like?';

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.getPraise({subjectId, offset, limit});
            });
        }

        logger.log('MicroComment.getPraise: ', subjectId, offset, limit);

        params.appId = CONFIG.COMMENT_APPID;
        params.token = CONFIG.COMMENT_TOKEN;
        params.userId = parseInt(store.getters.userInfo.id) || 0;
        params.subjectId = subjectId;
        params.offset = offset;
        // params.limit = offset + limit;
        params.limit = limit;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(function (res) {
            let result = res.data;
            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.getPraise({subjectId, offset, limit});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 点赞/踩
     *              -- Author by Dio Zhu. on 2016.11.25
     */
    addPraise: function ({subjectId = 0, toId = 0, type = 1} = {}) {
        let _self = this,
            uri = CONFIG.COMMENT_UTL + '/v1/like',
            param = {};

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.addPraise({subjectId, toId, type});
            });
        }

        param.appId = CONFIG.COMMENT_APPID;
        param.token = CONFIG.COMMENT_TOKEN;
        param.subjectId = parseInt(subjectId);
        // param.userId = parseInt(userId);
        param.userId = parseInt(store.getters.userInfo.id) || 0;
        param.toId = parseInt(toId);
        param.type = parseInt(type);

        // return post(uri, param, opts);
        return Vue.http.post(uri, param).then(function (res) {
            let result = res.data;
            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.addPraise({subjectId, toId, type});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },
    /**
     * 取消点赞/踩
     *              -- Author by Dio Zhu. on 2016.11.25
     */
    delPraise: function ({cId = 0, subjectId = 0, userId = 0} = {}) {
        let _self = this,
            uri = CONFIG.COMMENT_UTL + '/v1/like?',
            param = {},
            key;

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(function (res) {
                CONFIG.COMMENT_TOKEN = res;
                return _self.delPraise({cId, subjectId, userId});
            });
        }

        param.appId = CONFIG.COMMENT_APPID;
        param.token = CONFIG.COMMENT_TOKEN;
        param.userId = parseInt(userId);
        param.cId = parseInt(cId);
        param.subjectId = parseInt(subjectId);
        for (key in param) { if (param.hasOwnProperty(key)) { uri += key + '=' + encodeURIComponent(param[key]) + '&'; } }

        // return post(uri, param, opts);
        return Vue.http.delete(uri).then(function (res) {
            let result = res.data;
            if (result.Code === 1002) { // token错误
                return _self.getToken().then(function (res) {
                    CONFIG.COMMENT_TOKEN = res;
                    return _self.delPraise({cId, subjectId, userId});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 用户评论列表
     *              -- Author by Dio Zhu. no 2017.4.18
     */
    getUserComments ({userId = parseInt(store.getters.userInfo.id) || 0, subjectId = 0, page = 1, pageNum = CONFIG.COMMENT_LIMIT} = {}) {
        if (!userId) {
            return Promise.resolve([]);
        }

        let uri = CONFIG.COMMENT_UTL + '/v1/comment/user?',
            params = {
                appId: CONFIG.COMMENT_APPID,
                token: CONFIG.COMMENT_TOKEN
            };

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(res => {
                CONFIG.COMMENT_TOKEN = res;
                return this.getUserComments({userId, subjectId, page, pageNum});
            });
        }

        params.userId = parseInt(userId);
        params.subjectId = parseInt(subjectId);
        params.page = parseInt(page);
        params.pageNum = parseInt(pageNum);

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(res => {
            let result = res.data;
            logger.log('[comments].getSubjectList.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return this.getToken().then(res => {
                    CONFIG.COMMENT_TOKEN = res;
                    return this.getUserComments({userId, subjectId, page, pageNum});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 用户点赞列表
     *              -- Author by Dio Zhu. no 2017.4.18
     */
    getUserPrises ({userId = parseInt(store.getters.userInfo.id) || 0, subjectId = 0, page = 1, pageNum = CONFIG.COMMENT_LIMIT} = {}) {
        if (!userId) {
            return Promise.resolve([]);
        }

        let uri = CONFIG.COMMENT_UTL + '/v1/like/user?',
            params = {
                appId: CONFIG.COMMENT_APPID,
                token: CONFIG.COMMENT_TOKEN
            };

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(res => {
                CONFIG.COMMENT_TOKEN = res;
                return this.getUserPrises({userId, subjectId, page, pageNum});
            });
        }

        params.userId = parseInt(userId);
        params.subjectId = parseInt(subjectId);
        params.page = parseInt(page);
        params.pageNum = parseInt(pageNum);

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(res => {
            let result = res.data;
            logger.log('[comments].getSubjectList.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return this.getToken().then(res => {
                    CONFIG.COMMENT_TOKEN = res;
                    return this.getUserPrises({userId, subjectId, page, pageNum});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 获取用户评论总数
     *              -- Author by Dio Zhu. on 2017.4.19
     */
    getCommentsNum ({userId = parseInt(store.getters.userInfo.id) || 0, subjectId = 0}) {
        let uri = CONFIG.COMMENT_UTL + '/v1/comment/user/num?',
            params = {
                appId: CONFIG.COMMENT_APPID,
                token: CONFIG.COMMENT_TOKEN
            };

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(res => {
                CONFIG.COMMENT_TOKEN = res;
                return this.getCommentsNum({userId, subjectId});
            });
        }

        params.userId = parseInt(userId);
        params.subjectId = parseInt(subjectId);

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(res => {
            let result = res.data;
            logger.log('[comments].getCommentsNum.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return this.getToken().then(res => {
                    CONFIG.COMMENT_TOKEN = res;
                    return this.getCommentsNum({userId, subjectId});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    },

    /**
     * 获取用户点赞总数
     *              -- Author by Dio Zhu. on 2017.4.19
     */
    getPraisesNum ({userId = parseInt(store.getters.userInfo.id) || 0, subjectId = 0}) {
        let uri = CONFIG.COMMENT_UTL + '/v1/like/user/num?',
            params = {
                appId: CONFIG.COMMENT_APPID,
                token: CONFIG.COMMENT_TOKEN
            };

        // 校验token
        if (!CONFIG.COMMENT_TOKEN) {
            return this.getToken().then(res => {
                CONFIG.COMMENT_TOKEN = res;
                return this.getPraisesNum({userId, subjectId});
            });
        }

        params.userId = parseInt(userId);
        params.subjectId = parseInt(subjectId);

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                uri += key + '=' + encodeURIComponent(params[key]) + '&';
            }
        }
        return Vue.http.get(uri).then(res => {
            let result = res.data;
            logger.log('[comments].getPraisesNum.SUCCESS: ', result);

            if (result.Code === 1002) { // token错误
                return this.getToken().then(res => {
                    CONFIG.COMMENT_TOKEN = res;
                    return this.getPraisesNum({userId, subjectId});
                });
            } else if (result.Code !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.Res);
            }
        });
    }
};

export default MicroComment;
