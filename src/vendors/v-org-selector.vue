<!--<template>-->
    <!--<div class="v-org-selector">-->
        <!--&lt;!&ndash; 搜索栏 &ndash;&gt;-->
        <!--<v-search v-if="type" :autofocus="false" v-model="keywords" @handle-search="onSearch"></v-search>-->
        <!--&lt;!&ndash; 导航 &ndash;&gt;-->
        <!--<v-nav :value="navList" @handleClick="onNavClick" :min="2"></v-nav>-->
        <!--&lt;!&ndash; 如果是组织：使用checkbox默认样式，如果是个人：使用feed样式。&#45;&#45; Author by Dio Zhu. on 2017.5.5 &ndash;&gt;-->
        <!--<v-checkbox-->
                <!--v-model="values"-->
                <!--:options="options"-->
                <!--radioClasses="disk"-->
                <!--checkAll="全选"-->
                <!--:checkAllFunc="checkAllFunc"-->
                <!--reverse-->
        <!--&gt;-->
            <!--<template v-for="(item, idx) in options">-->
                <!--<div v-if="item.nodeType == 0"-->
                     <!--class="v-org-selector__btn"-->
                     <!--:slot="'link' + idx"-->
                     <!--@click.stop="getOrgTree({nodeId: item.nodeId, nodeName: item.value.nodeName}, $event)"-->
                <!--&gt;下级</div>-->
                <!--<v-feed-->
                        <!--v-if="item.nodeType == 1"-->
                        <!--:slot="'slot' + idx"-->
                        <!--:imgUrl="item.value.avatar"-->
                        <!--:title="item.value.nodeName"-->
                        <!--:subtitle="item.value.positionName"-->
                        <!--:classes="'title small no-border'"-->
                <!--&gt;</v-feed>-->
            <!--</template>-->
        <!--</v-checkbox>-->

        <!--<v-row class="fix-btn">-->
            <!--<v-col :span="8" :gutter="30" class="msg">{{ msg }}</v-col>-->
            <!--<v-col :span="4" :gutter="30"><v-button @click="onSubmit">确定</v-button></v-col>-->
        <!--</v-row>-->
    <!--</div>-->
<!--</template>-->
<!--<script type="text/ecmascript-6">-->
    <!--import vRow from './v-row.vue';-->
    <!--import vCol from './v-col.vue';-->
    <!--import vSearch from './v-search.vue';-->
    <!--import * as api from '../js/core/api';-->
    <!--import MicroOrg from './v-org-selector';-->
    <!--import vNav from './v-nav.vue';-->
    <!--import vCheckbox from './v-checkbox';-->
    <!--import vButton from './v-button.vue';-->
    <!--import vFeed from './v-feed.vue';-->
    <!--import _ from 'lodash';-->

    <!--/**-->
     <!--* 企通组织结构选择器-->
     <!--*              &#45;&#45; Author by Dio Zhu. on 2017.5.4-->
     <!--* 修改企业组织人员选择器（调日志的接口）-->
     <!--*              &#45;&#45;Author by xufeng on 2017.5.27-->
     <!--*/-->
    <!--export default {-->
        <!--name: 'v-org-selector',-->
        <!--components: { vRow, vCol, vSearch, vNav, vCheckbox, vButton, vFeed },-->

        <!--props: {-->
            <!--nodeId: {-->
                <!--type: Number,-->
                <!--default: 1-->
            <!--},-->
            <!--type: { // 显示类型，0：显示部门，1：部门 + 用户，默认只显示部门-->
                <!--type: Number,-->
                <!--default: 0-->
            <!--},-->
            <!--returnKey: { // 返回时的key标识，用于处理同个页面多个请求返回-->
                <!--type: String,-->
                <!--default: 'dept'-->
            <!--}-->
        <!--},-->

        <!--data () {-->
            <!--return {-->
                <!--loading: false,    // 加载标识-->
                <!--keywords: '',-->
                <!--listData: [],-->
                <!--values: [],-->
                <!--options: [],-->
                <!--userInfo: [],       // 已选择的全部人员（部门 + 人员）-->
<!--//                searchUserInfo: [],     // 搜索出来的人员-->
                <!--selectedDepts: [], // 已选部门-->
                <!--selectedUsers: [], // 已选用户-->
                <!--selectedUserNum: 0, // 已选用户数 = 已选部门包含的用户数 + 已选用户的数量-->
                <!--totalUsers: 0,     // 可选总数，依据根节点所有用户数求和，用于"全选"字样显示与否-->
                <!--navList: [], // 导航-->
                <!--msg: ''      // 提示语-->
            <!--};-->
        <!--},-->

        <!--computed: {-->
            <!--formatedMsg () {-->
                <!--let str = '';-->

                <!--return str;-->
            <!--}-->
        <!--},-->

        <!--watch: {-->
            <!--values (val) { // 每次选择后，重新计算提示语-->
                <!--console.log('v-org-selector.watch.values: ', val);-->

                <!--this.selectedDepts = [];-->
                <!--this.selectedUsers = [];-->
                <!--this.selectedUserNum = 0;-->
                <!--this.msg = '已选择：';-->
                <!--val.forEach((v) => {-->
                    <!--if (parseInt(v.nodeType) === 0) { // 计算组织数、累加人员数-->
                        <!--this.selectedDepts.push(v);-->
                        <!--this.selectedUserNum += parseInt(v.empNum);-->
                    <!--} else if (parseInt(v.nodeType) === 1) { // 直接累加人员数-->
                        <!--this.selectedUsers.push(v);-->
                        <!--this.selectedUserNum += 1;-->
                    <!--}-->
                <!--});-->
                <!--if (this.selectedUserNum) this.msg += this.selectedUserNum + '人';-->
                <!--if (this.selectedDepts.length > 0) this.msg += '，其中有' + this.selectedDepts.length + '个部门（含子部门）';-->
                <!--if (!this.selectedUserNum && this.selectedDepts.length < 1) this.msg = '';-->
            <!--},-->
            <!--keywords (val) {-->
                <!--console.log('v-org-selector.watch.keywords: ', val);-->
                <!--if (/[^\u0000-\u00FF]/.test(val)) { // 检索中文-->
                    <!--this.onSearch();-->
                <!--}-->
            <!--}-->
        <!--},-->

        <!--mounted () {-->
            <!--console.log('v-org-selector.mounted...');-->
            <!--this.init();-->
        <!--},-->

        <!--methods: {-->
            <!--init () {-->
                <!--this.getOrgTree({nodeId: this.nodeId});-->

                <!--let cur = MicroOrg.getCurrentItem();-->
                <!--if (cur) { // 初始化，如果传入的默认值不能自动选中，在这里需要把默认对象与options中的进行匹对并替换，这俩对象不一样。。。详细去看：font/qitong-checkin项目中的方式。 Add by Dio Zhu. on 2017.6.1-->
                    <!--this.values = cur;-->
                    <!--MicroOrg.clearCurrentItem();-->
                <!--}-->
            <!--},-->

            <!--onSearch () {-->
                <!--let self = this;-->
                <!--if (self.loading) return;-->
                <!--this.loading = true;-->
<!--//                日志人员选择的接口-->
                <!--api.searchUser({-->
                    <!--name: this.keywords,-->
                    <!--loading: true-->
                <!--}).then(function (res) {-->
                    <!--self.loading = false;-->
                    <!--self.formatResponse(1, res.dataList); // 整理返回数据-->
                <!--}, function (err) {-->
                    <!--self.loading = false;-->
                    <!--console.log(err, 'error');-->
                <!--});-->
<!--//                demo的接口-->
<!--//                MicroOrg.searchNode({-->
<!--//                    name: this.keywords,-->
<!--//                    queryType: this.type, // 查询类型 0：只查部门 1：只查员工 2：员工部门一起查-->
<!--//                    groupId: 0,-->
<!--//                    selectType: 0,-->
<!--//                    loading: true-->
<!--//                }).then(res => {-->
<!--//                    this.loading = false;-->
<!--//                    console.log('v-org-selector.onSearch...');-->
<!--//                    this.formatResponse(1, res); // 整理返回数据-->
<!--//                }).catch(e => {-->
<!--//                    console.error('v-org-selector.onSearch: ERROR, ', e);-->
<!--//                    this.loading = false;-->
<!--//                });-->
            <!--},-->

            <!--/**-->
             <!--* 获取企通组织结构-->
             <!--*              &#45;&#45; Author by Dio Zhu. on 2017.5.5-->
             <!--*/-->
            <!--getOrgTree ({nodeId = 1, nodeName = '联系人', isIncludeEmp = 1, isCalcEmpNum = 1} = {}, e) {-->
                <!--console.log('v-org-selector.getOrgTree: ', nodeId, this.loading, !!e, nodeId);-->
                <!--let self = this;-->
                <!--if (this.loading) return;-->
                <!--if (e) {-->
                    <!--e.stopPropagation();-->
                    <!--e.preventDefault();-->

                    <!--// 点击"下级"时，需判断是否已选当前组织，已选的不请求数据-->
                    <!--let tag = false;-->
                    <!--this.values.forEach((v) => {-->
                        <!--if (parseInt(v.nodeId) === parseInt(nodeId)) tag = true;-->
                    <!--});-->
                    <!--if (tag) return;-->
                <!--}-->

                <!--self.$set(self, 'loading', true);-->
                <!--self.navInit({nodeId, nodeName});-->
                <!--api.getOrgTree({-->
                    <!--parentDeptId: nodeId,    // 组织(部门)ID-->
                    <!--isIncludeEmp: isIncludeEmp,    // 是否包含员工-->
                    <!--isCalcEmpNum: isCalcEmpNum,    // 是否计算员工数-->
                    <!--operateId: 0,       // 业务ID-->
                    <!--selectType: 0,      // 和业务ID相关：0:业务中包括的人选中 1:不包括的人选中-->
                    <!--loading: true-->
                <!--}).then(function (res) {-->
                    <!--self.$set(self, 'loading', false);-->
                    <!--self.formatResponse(nodeId, res);-->
                <!--}).catch(e => {-->
                    <!--this.$set(this, 'loading', false);-->
                <!--});-->
<!--//                MicroOrg.getOrgTree({-->
<!--//                    parentNodeId: 1,-->
<!--//                    parentNodeId: nodeId,-->
<!--//                    parentNodeId: 1475148557166866,-->
<!--//                    isIncludeEmp: isIncludeEmp,-->
<!--//                    isCalcEmpNum: isCalcEmpNum,-->
<!--//                    loading: true-->
<!--//                }).then((res) => {-->
<!--//                    this.$set(this, 'loading', false);-->
<!--//                    console.log('v-org-selector.getOrgTree: SUCCESS, ', res);-->
<!--//                    this.formatResponse(nodeId, res); // 整理返回数据-->
<!--//                }).catch(e => {-->
<!--//                    console.error('v-org-selector.getOrgTree: ERROR, ', e);-->
<!--//                    this.$set(this, 'loading', false);-->
<!--//                });-->
            <!--},-->

            <!--formatResponse (nodeId, res) {-->
                <!--this.options = [];-->
                <!--if (res && res.length > 0) {-->
                    <!--if (nodeId === 1) this.totalUsers = 0;-->
                    <!--res.forEach((v) => {-->
                        <!--if ((this.type === 0 && parseInt(v.nodeType) === 0) || this.type === 1) { // 按条件显示-->
                            <!--// 整理checkbox数据-->
                            <!--this.options.push({-->
                                <!--label: v.nodeName + '(' + v.empNum + '人)',-->
                                <!--nodeId: v.nodeId,-->
                                <!--value: v,-->
                                <!--nodeType: v.nodeType-->
                            <!--});-->
                            <!--// 计算总人数total，用于全选逻辑-->
                            <!--if (parseInt(nodeId) === 1 && parseInt(v.nodeType) === 0) {-->
                                <!--this.totalUsers += parseInt(v.empNum);-->
                            <!--} else if (parseInt(nodeId) === 1 && parseInt(v.nodeType) === 1) {-->
                                <!--this.totalUsers += 1;-->
                            <!--}-->
                        <!--}-->
                    <!--});-->
                <!--}-->
            <!--},-->

            <!--navInit ({nodeId = 1, nodeName = '联系人', url = ''} = {}) {-->
                <!--if (this.navList.length < 1) {-->
                    <!--this.navList.push({-->
                        <!--label: nodeName,-->
                        <!--value: nodeId,-->
                        <!--url: ''-->
                    <!--});-->
                <!--} else {-->
                    <!--this.navList.forEach((v, i) => {-->
                        <!--if (v.value === nodeId) this.navList.splice(i, this.navList.length);-->
                    <!--});-->

                    <!--this.navList.push({-->
                        <!--label: nodeName,-->
                        <!--value: nodeId,-->
                        <!--url: ''-->
                    <!--});-->
                <!--}-->
            <!--},-->

            <!--/**-->
             <!--* 捕获导航组件返回的点击事件，按照id进行数据刷新-->
             <!--*              &#45;&#45; Author by Dio Zhu. on 2017.5.5-->
             <!--*/-->
            <!--onNavClick (obj) {-->
                <!--console.log('v-org-selector.onNavClick: ', obj);-->
                <!--this.getOrgTree({nodeId: obj.value, nodeName: obj.label});-->
            <!--},-->

            <!--/**-->
             <!--* 复写全选逻辑，组件的全选依照当前options数量，而此应用需要切换options进行选择，并保存多选结果，所以此处依照总用户人数进行判断是否已经全选~-->
             <!--*              &#45;&#45; Author by Dio Zhu. on 2017.5.5-->
             <!--*/-->
            <!--checkAllFunc (val) {-->
                <!--console.log('v-org-selector.checkAllFunc: ', val, this.selectedUserNum, this.totalUsers);-->
                <!--let tag = true;-->
                <!--this.options.forEach((v) => {-->
<!--//                    if (!_.contains(this.values, v)) tag = false;-->
<!--//                    console.log('@@@@@@@@@', _.find(this.values, function (i) { return parseInt(i.nodeId) === parseInt(v.nodeId); }));-->
                    <!--if (!_.find(this.values, function (i) { return parseInt(i.nodeId) === parseInt(v.nodeId); })) tag = false;-->
                <!--});-->
<!--//                if (this.selectedUserNum && this.selectedUserNum === this.totalUsers) { // 简单用总数判断是否全选，指的是总数-->
                <!--if (this.selectedUserNum && tag) { // 判断当前options与values的包含关系，只针对当前页显示是否全选-->
                    <!--return Promise.resolve(true);-->
                <!--} else {-->
                    <!--return Promise.resolve(false);-->
                <!--}-->
            <!--},-->
            <!--onSubmit () {-->
                <!--MicroOrg.setCurrentItem({key: this.returnKey, value: this.values});-->
                <!--this.$router.go(-1);-->
            <!--}-->
        <!--}-->
    <!--};-->
<!--</script>-->
<!--<style rel="stylesheet/scss" lang="scss">-->
    <!--@import "../scss/variables";-->
    <!--@import "../scss/mixins";-->

    <!--.v-org-selector {-->
        <!--width: 100%;-->
        <!--/*height: 100%;*/-->

        <!--.v-nav {-->
            <!--min-height: pxTorem(50px);-->
            <!--border-bottom: #f2f2f4 pxTorem(10px) solid;-->
        <!--}-->

        <!--.v-checkbox {-->
            <!--.m-l {-->
                <!--margin-left: 0;-->
                <!--padding-left: 0;-->

                <!--&gt;label {-->
                    <!--padding-left: pxTorem(15px);-->
                    <!--border-bottom: #f2f2f4 1px solid;-->

                    <!--&.start {-->
                        <!--border-top: #f2f2f4 pxTorem(10px) solid;-->
                    <!--}-->
                <!--}-->
            <!--}-->

            <!--/*.v-checkbox__checkall {*/-->
            <!--/*border-top: #f2f2f4 pxTorem(10px) solid;*/-->
            <!--/*}*/-->
        <!--}-->

        <!--.v-org-selector__btn {-->
            <!--padding-right: pxTorem(15px);-->
        <!--}-->

        <!--.v-col.msg{-->
            <!--font-size: pxTorem(15px);-->
            <!--color: #007aff;-->
        <!--}-->

        <!--.fix-btn {-->
            <!--width: 100%;-->
            <!--position: fixed;-->
            <!--bottom: 0;-->
            <!--padding: pxTorem(10px) 0;-->
            <!--border-top: #f2f2f4 pxTorem(1px) solid;-->
            <!--background: #FFF;-->
        <!--}-->
    <!--}-->

<!--</style>-->
