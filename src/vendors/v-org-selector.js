/**
 * Created by diozhu on 2017/2/9.
 */

import Vue from 'vue';
import CONFIG from '../config';
import logger from '../js/utils/logger';
import _promise from '../js/utils/promise';
import store from '../store/';

if (typeof Promise === 'undefined') {
    var Promise = _promise;
}

let MicroOrg = {
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

    retry_num: 0,   // 微服务重试次数（目前仅限于token类错误）
    retry_max: 3,   // 微服务最大重试次数

    getToken () {
        // if (!api.vGetMicroOrgToken || typeof api.vGetMicroOrgToken !== 'function') {
        //     return Promise.reject('无效token，请在api中实现vGetMicroOrgToken方法');
        // }
        // let _self = this;
        // if (this.retry_num < this.retry_max) {
        //     this.retry_num += 1;
        //     return api.vGetMicroOrgToken().then(function (res) {
        //         _self.retry_num = 0;
        //         return Promise.resolve(res);
        //     });
        // } else {
        //     return Promise.reject('token尝试超过限制，请刷新页面重试');
        // }

        return Promise.resolve('87863949-398f-4913-85a6-1cc5d7927917');
    },

    /**
     * 获取组织结构树
     *              -- Author by Dio Zhu. on 2017.5.4
     */
    getOrgTree ({parentNodeId = 0, isIncludeEmp = 0, isCalcEmpNum = 0, groupId = 0, selectType = 0, loading = false}) {
        // logger.log('!!!MicroOrg.getOrgTree: parentNodeId: 1', parentNodeId, typeof arguments[0][0] === 'object' ? arguments[0][0].parentNodeId : '');
        if (loading) store.commit('OPEN_LOADING'); // 显示菊花
        let body = '', //eslint-disable-line
            params = {},
            uri = CONFIG.ORG_URL + '/orgDept/getOrgTree';

        // 校验token
        if (!CONFIG.ORG_TOKEN) {
            return this.getToken().then(res => {
                CONFIG.ORG_TOKEN = res;
                return this.getOrgTree({...arguments[0]});
            });
        }

        // logger.log('!!!MicroOrg.getOrgTree: parentNodeId: 2', parentNodeId);

        params.access_token = CONFIG.ORG_TOKEN;
        params.parentNodeId = parentNodeId;
        params.isIncludeEmp = isIncludeEmp;
        params.isCalcEmpNum = isCalcEmpNum;
        params.groupId = groupId;
        params.selectType = selectType;

        return Vue.http.post(uri, body, {params: params}).then(res => {
            if (loading) store.commit('CLOSE_LOADING'); // 隐藏菊花
            let result = res.data;

            if (parseInt(result.code) !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.data);
            }
        }).catch(e => {
            if (loading) store.commit('CLOSE_LOADING'); // 隐藏菊花
            return Promise.reject(e);
        });
    },

    /**
     * 获取组织结构树
     *              -- Author by Dio Zhu. on 2017.5.4
     */
    searchNode ({name = '', queryType = 2, groupId = 0, selectType = 0, loading = false} = {}) {
        if (loading) store.commit('OPEN_LOADING'); // 显示菊花
        let body = '', //eslint-disable-line
            params = {},
            uri = CONFIG.ORG_URL + '/orgDept/searchNode';

        // 校验token
        if (!CONFIG.ORG_TOKEN) {
            return this.getToken().then(res => {
                CONFIG.ORG_TOKEN = res;
                return this.searchNode({...arguments[0]});
            });
        }

        logger.log('MicroOrg.getOrgTree: ', arguments);

        params.access_token = CONFIG.ORG_TOKEN;
        params.name = name;             // 员工姓名
        params.queryType = queryType;   // 查询类型 0：只查部门 1：只查员工 2：员工部门一起查
        params.groupId = groupId;       // 考勤组ID，用于判断是否选中
        params.selectType = selectType; // 0:考勤组包括的人选中 1:不包括的人选中 2:考勤组负责人选中

        return Vue.http.post(uri, body, {params: params}).then(res => {
            if (loading) store.commit('CLOSE_LOADING'); // 隐藏菊花
            let result = res.data;

            if (parseInt(result.code) !== 0) { // 抛出异常
                return Promise.reject(result);
            } else { // 正常处理
                return Promise.resolve(result.data);
            }
        }).catch(e => {
            if (loading) store.commit('CLOSE_LOADING'); // 隐藏菊花
            return Promise.reject(e);
        });
    }
};

export default MicroOrg;
