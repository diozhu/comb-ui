<template>
    <div class="v-table">
        <div class="operations">
            <slot name="opts"></slot>
        </div>
        <table-wrapper
            v-if="!isMultHeaderRows"
            ref="wrapper"
            v-loading="loading"
            :data="currentValue"
            :columns="cloneColumns"
            :record-key="recordKey"
            :header-height="headerHeight"
            :body-height="bodyHeight"
            :record-height="recordHeight"
            :render-type="renderType"
            :header-class="headerClass"
            :show-index="showIndex"
            :show-checkbox="showCheckbox"
            @selectionChange="handleSelectionChange"
            @rowClick="handleRowClick"
            :compact="compact"
            @sort="handleSort"
        ></table-wrapper>
    </div>
</template>

<script>
import './requestAnimationFrame.js';
import tableWrapper from './table-wrapper';
import _ from 'lodash';
import {
    ID_NAME,
    SCROLL_WIDTH,
    DEFAULT_TABLE_HEIGHT,
    DEFAULT_TABLE_HEADER_HEIGHT,
    DEFAULT_TABLE_RECORD_HEIGHT,
    TABLE_TYPE_VIRTUAL
} from './constant.js';
import { getRandomStr } from './utils.js';
import bus from '../../eventbus.js';

export default {
    components: { tableWrapper },
    name: 'v-table',
    props: {
        renderType: {
            type: String,
            default: () => TABLE_TYPE_VIRTUAL
        },
        columns: {
            type: Array,
            default: () => []
        },
        value: {
            type: Array,
            default: () => []
        },
        filters: {
            type: Array,
            default: () => []
        },
        recordKey: {
            type: String,
            // required: true
            default: '_id'
        },
        height: {
            type: [Number, String],
            default: () => DEFAULT_TABLE_HEIGHT
        },
        headerHeight: {
            type: Number,
            default: () => DEFAULT_TABLE_HEADER_HEIGHT
        },
        recordHeight: {
            type: Number,
            default: () => DEFAULT_TABLE_RECORD_HEIGHT
        },
        headerClass: {
            type: String,
            default: () => 'c-table-header__default'
        },
        showIndex: Boolean,
        showCheckbox: Boolean,
        compact: Boolean,
        func: Function, // callback function, when the plugin mounted or created will be run ...
        multiple: Boolean
    },
    data() {
        return {
            truename: `${this.$options.name}_${this._uid}`,
            loading: false,
            currentValue: this.value,
            cloneColumns: [],
            cloneColumnsRow: [],
            bodyHeight: DEFAULT_TABLE_HEIGHT - DEFAULT_TABLE_HEADER_HEIGHT
        };
    },
    computed: {
        isMultHeaderRows: function() {
            return _.find(this.columns, function(column) {
                return column.children;
            });
        }
    },
    watch: {
        value: {
            handler: function(val) {
                this.currentValue = val;
                // this.currentValue = _.cloneDeep(val);
                this.recalculate();
                this.reRender();
            },
            immediate: true,
            deep: true
        },
        currentValue(val) {
            this.$emit('input', val);
        },
        height: {
            handler: function() {
                this.recalculate();
            },
            immediate: true
        },
        columns: {
            handler: function(val) {
                const cloneColumns = _.cloneDeep(val);
                this.buildColumnUUID(cloneColumns);
                this.cloneColumns = cloneColumns;
                this.handleResize();
            },
            immediate: true,
            deep: true
        }
    },
    created() {
        bus.$on(`p-table.init`, this.init);
        bus.$on(`${this.truename}.init`, this.init);
    },
    beforeMount() {
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        // 清除事件监听
        bus.$off(`p-table.init`, this.init);
        if (this.tic) this.tic.clear();
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            // console.log(`v-table.${this._uid}.init...`);
            this.currentValue = [];
            this.update();
            this.reRender();
            this.handleResize();
        },
        reRender() {
            if (
                this.renderType === 'VIRTUAL' &&
                this.$refs.wrapper &&
                this.$refs.wrapper.$refs.body &&
                typeof this.$refs.wrapper.$refs.body.init === 'function'
            )
                this.$refs.wrapper.$refs.body.init();
        },
        async update() {
            this.loading = true;
            if (typeof this.func === 'function') {
                let res = await this.func({ page: this.page, limit: this.limit });
                this.currentValue = res.list;
                // console.log(`v-table.${this._uid}.update: `, res.list.length);
                // let o = this.currentValue.find(v => v.id === '27');
                // console.log(`v-table.${this._uid}.update: `, o.layer);
                this.recalculate();
            }
            this.loading = false;
        },
        recalculate() {
            // let h = this.value.length * this.recordHeight + 20,
            let h = this.value.length * this.recordHeight + 5,
                bh =
                    this.height === 'auto'
                        ? document.body.offsetHeight - 160
                        : parseInt(this.height) - this.headerHeight;
            if (h > bh) this.bodyHeight = bh;
            else this.bodyHeight = h;
            // console.error(this.bodyHeight);
        },
        buildColumnUUID: function(columns) {
            return columns.map(item => {
                if ('children' in item) this.buildColumnUUID(item.children);
                if (!item[ID_NAME]) {
                    item[ID_NAME] = getRandomStr(6);
                }
                return item;
            });
        },
        handleResize: function() {
            if (!this.$el) return;
            const tableWidth = this.$el.offsetWidth - SCROLL_WIDTH;
            let width = 0;
            let widthCount = 0;
            let columns = _.cloneDeep(this.cloneColumns);
            for (const column of columns) {
                if (column.width) {
                    width += column.width;
                    widthCount++;
                }
            }
            if (this.showCheckbox) width += 30;
            if (this.showIndex) width += 40;

            const autoWidth = (tableWidth - width) / (columns.length - widthCount);
            for (const column of columns) {
                column.widthExt = column.width ? `${column.width}px` : `${autoWidth}px`;
                if (column.fixed) column.fixedExt = true;
            }

            if (columns.length && tableWidth > width) {
                let lastObj = columns[columns.length - 1];
                lastObj.widthExt = tableWidth - width + (lastObj.width || 0) + 10 + 'px';
                if (lastObj.fixed) lastObj.fixedExt = false;
            }
            this.cloneColumns = columns;
            // console.log('table.handleResize: ', tableWidth, width, widthCount, columns.length, autoWidth);
            // console.log('table.handleResize: ', columns);
        },
        // events
        clearSelection() {
            this.$refs.wrapper.clearSelection();
        },
        toggleRowSelection(ids, selectTag, scrollTag) {
            this.$refs.wrapper.toggleRowSelection(ids, selectTag, scrollTag);
        },
        handleSelectionChange(val) {
            this.$emit('selectionChange', val);
        },
        handleRowClick(e, row) {
            // console.log(e.target, e.target.name);
            this.$emit('rowClick', ...[e, row]);
            let ids = [row.id];
            // if (this.multiple) ids = ids.concat(this.$refs.wrapper.ids);
            if (e.target && e.target.name === 'ids') ids = ids.concat(this.$refs.wrapper.ids);
            this.clearSelection();
            this.toggleRowSelection(ids, true, false);
        },
        handleSort({ idx, sortType } = {}) {
            let prop = (this.columns[idx] && this.columns[idx].prop) || '',
                sortProp = (this.columns[idx] && this.columns[idx].sortProp) || '';
            if (!prop) return;
            // console.warn('table.handleSort: ', ...arguments, this.currentValue, prop, sortProp);
            // let list = _.cloneDeep(this.currentValue);
            this.currentValue.sort((r1, r2) => {
                let r1val = sortProp ? r1[sortProp] : r1[prop],
                    r2val = sortProp ? r2[sortProp] : r2[prop],
                    rtn;
                if (typeof r1val === 'number') rtn = r1val - r2val;
                else if (typeof r1val !== 'object' && r1val.match(/\d+/g) && r2val.match(/\d+/g))
                    rtn = r1val.match(/\d+/g)[0] - r2val.match(/\d+/g)[0];
                else if (r1val < r2val) rtn = -1;
                else if (r1val > r2val) rtn = 1;
                else rtn = -1;

                if (sortType === 'desc') return -rtn;
                else return rtn;
            });
            // console.warn('table.handleSort: ', list);
            // this.currentValue = list;
            this.recalculate();
            this.reRender();
        }
    }
};
</script>

<style lang="scss">
.v-table-wrapper .icon {
    font-size: 13px;
    border-radius: 50%;
}
.v-table {
    .operations {
        position: relative;
        padding: 0 0 6px 0;
        text-align: right;

        .el-button {
            padding: 6px 6px;
        }
        .el-dropdown {
            margin-left: 6px;
        }

        .all-check-box {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}
</style>
