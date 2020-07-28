<template>
    <article class="v-table-wrapper">
        <section ref="headerWrapper" class="v-table-wrapper__header-wrapper" :class="headerClass">
            <table-header
                :columns="columns"
                :height="headerHeight"
                :show-index="showIndex"
                :show-checkbox="showCheckbox"
                :compact="compact"
                v-model="selectedStatus"
                @sort="handleSort"
            ></table-header>
        </section>
        <table-body
            v-if="showRender('COMMON')"
            ref="body"
            :data="data"
            :record-key="recordKey"
            :columns="columns"
            :record-height="recordHeight"
            :body-height="bodyHeight"
            :show-index="showIndex"
            :show-checkbox="showCheckbox"
            :compact="compact"
            v-model="ids"
        >
        </table-body>
        <table-body-async
            v-if="showRender('ANIMATION')"
            ref="body"
            :data="data"
            :record-key="recordKey"
            :columns="columns"
            :record-height="recordHeight"
            :body-height="bodyHeight"
            :show-index="showIndex"
            :show-checkbox="showCheckbox"
            :compact="compact"
            v-model="ids"
        >
        </table-body-async>
        <table-body-virtual
            v-if="showRender('VIRTUAL')"
            ref="body"
            :data="data"
            :record-key="recordKey"
            :columns="columns"
            :item-height="recordHeight"
            :viewport-height="bodyHeight"
            :show-index="showIndex"
            :show-checkbox="showCheckbox"
            :compact="compact"
            v-model="ids"
            @scroll="handleScroll"
            @rowClick="handleRowClick"
            @randerChange="v => (randerData = v)"
        >
        </table-body-virtual>
        <table-fixed-columns
            v-if="fixedColumns"
            ref="fixed"
            :data="randerData"
            :record-key="recordKey"
            :columns="columns"
            :headerHeight="headerHeight"
            :item-height="recordHeight"
            :viewport-height="bodyHeight"
            :totalHeight="totalHeight"
            :show-index="showIndex"
            :show-checkbox="showCheckbox"
            :compact="compact"
            v-model="ids"
            @scroll="handleScroll"
        ></table-fixed-columns>
    </article>
</template>

<script>
import TableHeader from './table-header.vue';
import TableBody from './table-body.vue';
import TableBodyAsync from './table-body-async.vue';
import TableBodyVirtual from './table-body-virtual.vue';
import TableFixedColumns from './table-fixed-columns.vue';

export default {
    name: 'v-table-wrapper',
    components: {
        TableHeader,
        TableBody,
        TableBodyAsync,
        TableBodyVirtual,
        TableFixedColumns
    },
    props: {
        columns: Array,
        data: Array,
        recordKey: String,
        headerHeight: Number,
        bodyHeight: Number,
        recordHeight: Number,
        renderType: String,
        headerClass: String,
        compact: Boolean,
        showIndex: Boolean,
        showCheckbox: Boolean
    },
    data() {
        return {
            ids: [],
            selectedStatus: 0,
            randerData: []
        };
    },
    computed: {
        totalHeight() {
            return this.data.length * this.recordHeight;
        },
        fixedColumns() {
            return !this.compact && this.columns.some(v => v.fixedExt);
            // return !this.compact;
        }
    },
    watch: {
        ids(val) {
            if (val && this.data && val.length === this.data.length && this.data.length > 0) this.selectedStatus = 2;
            else if (val && this.data && val.length) this.selectedStatus = 1;
            else this.selectedStatus = 0;
            this.$emit('selectionChange', val);
        },
        selectedStatus(val) {
            if (val === 2 && this.ids && this.data && this.ids.length !== this.data.length) {
                let ids = [];
                this.data.every(v => ids.push(v.id));
                this.ids = ids;
            } else if (val === 0 && this.ids && this.ids.length) this.ids = [];
        }
    },
    methods: {
        showRender: function(type) {
            return this.renderType === type;
        },
        handleScroll(e) {
            let isFixed = e.target.parentNode.className.indexOf('fixed') !== -1;
            if (isFixed) {
                this.$refs.body.$refs.virtualScrollBody.scrollTop = e.target.scrollTop;
            } else {
                this.$refs.headerWrapper.scrollLeft = e.target.scrollLeft;
                // if (!this.compact) this.$refs.fixed.$refs.body.scrollTop = e.target.scrollTop;
                if (this.fixedColumns) this.$refs.fixed.$refs.body.scrollTop = e.target.scrollTop;
            }
        },

        // events
        clearSelection() {
            // console.log('v-table-wrapper.clearSelection: ');
            this.ids = [];
        },
        toggleRowSelection(ids, selectTag = true, scrollTag = true) {
            // return, when its same...
            // if (ids.length === this.ids.length && ids.every((v, i) => v === this.ids[i])) return;

            // Addition only...
            if (selectTag) this.clearSelection();
            let rows = this.data.filter(v => ids.indexOf(v.id) >= 0 && this.ids.indexOf(v.id) === -1);
            if (!rows || !rows.length) return;
            rows.forEach(row => {
                if (selectTag) this.ids.push(row.id);
            });
            if (scrollTag) this.scrollTo(rows[rows.length - 1].id);
            // console.log('v-table-wrapper.toggleRowSelection: ', ids, selectTag, scrollTag, this.ids);
        },
        scrollTo(id) {
            let idx = this.data.findIndex(v => v.id === id);
            if (idx === -1) return;
            // let h = this.$refs.body.$el.offsetHeight,
            let offsetHeight = this.$refs.body.$refs.bodyWrapper.offsetHeight,
                len = this.data && this.data.length,
                t = (offsetHeight / len) * idx || 0;
            this.$refs.body.$el.scrollTop = t;
            // console.log('v-table-wrapper.scrollTo: ', id, h, offsetHeight, t);
        },
        handleSelectionChange(val) {
            this.$emit('selectionChange', val);
        },
        handleRowClick(e, row) {
            this.$emit('rowClick', ...[e, row]);
        },
        handleSort({ idx, sortType } = {}) {
            this.$emit('sort', { idx, sortType });
        }
    }
};
</script>

<style lang="scss">
$green: #1b813e;
$red: #f17c67;
$orange: #e2943b;
$yellow: #ffc408;
$blue: #268785;
$ayame: #6f3381;

.v-table-wrapper {
    position: relative;
    width: inherit;
    overflow: hidden;
    font-size: 12px;
    user-select: text;
    ul {
        display: inline-block;
        padding-left: 0;
        margin: 0;
    }

    ul > li {
        padding-left: 0;
        margin: 0;
        list-style: none;
    }

    .v-table-header-column,
    .v-table-body-column {
        /*padding-left: 6px;*/
        padding: 0 6px;
        /*display: flex;*/
        /*align-items: center;*/
        p {
            line-height: 1.2;
            width: 100%;
            margin: 3px 0;
            padding: 3px;
            box-sizing: border-box;
        }
    }

    .v-table__checkbox {
        width: 30px;
    }
    .v-table__index {
        width: 38px;
    }
}

.v-table-wrapper__header-wrapper,
.v-table-wrapper__body-wrapper {
    display: flex;
    /*flex-direction: column;*/
    overflow-x: auto;
}

.v-table-wrapper__header-wrapper {
    width: 100%;
    background-color: #f2f2f4;
    border: 1px solid #dddddd;
    border-bottom: 0;
    position: relative;
    box-shadow: 0 3px 3px #ccc;
    overflow: hidden;

    &::-webkit-scrollbar {
        display: none;
        width: 0;
    }

    input[type='checkbox'] {
        display: none;
    }
    .icon-subtract,
    .icon-checked {
        /*display: inline-block;*/
        font-size: 10px;
        font-weight: 700;
        border: #cccccc 1px solid;
        border-radius: 3px;
        background-color: #ffffff;
        color: #ffffff;
        &.checked {
            border: 0;
            background-color: rgb(47, 111, 252);
        }
    }
    .icon-sort-asc,
    .icon-sort-desc {
        color: #409eff;
    }
}

.v-table-wrapper__body-wrapper {
    overflow-y: auto;
    width: 100%;
    background-color: #ffffff;
    border: 1px solid #dddddd;
    -webkit-overflow-scrolling: touch;
    transform: translate3d(0, 0, 0);
    scrollbar-color: transparent transparent;
    scrollbar-track-color: transparent;
    -ms-scrollbar-track-color: transparent;
    &::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 6px;
        height: 6px;
    }
    &::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 3px;
        box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
        background: #535353;
    }
    &::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        background: #ededed;
    }
}
@media screen and (min--moz-device-pixel-ratio: 0) {
    .v-table-wrapper__body-wrapper {
        scrollbar-color: #dedede #fff !important;
        padding-bottom: 19px;
    }
}
.v-table-header__record,
.v-table-body__record {
    /*display: flex;*/
    white-space: nowrap;
}

.v-table-header__record {
    padding-right: 17px;
}

.v-table-header-column,
.v-table-body-column {
    /*flex: 1 1 auto;*/
    /*display: flex;*/
    /*align-items: center;*/
    display: inline-block;
    border-right: 1px solid #dddddd;
    border-bottom: 1px solid #dddddd;
    overflow: hidden;
    white-space: nowrap;
    box-sizing: border-box;
}

.v-table-header-column__container,
.v-table-body-column__container {
    text-overflow: ellipsis;
    overflow: hidden;
}

.v-table-body__record {
    /*border-bottom: 1px solid #dddddd;*/
    &:hover {
        background-color: rgb(242, 245, 249);
    }
    &.selected {
        background-color: rgb(242, 245, 249);
    }
}

/*.v-table-body-container:last-child {*/
/*    border-bottom: 0;*/
/*    .v-table-body__record {*/
/*        border-bottom: 1px solid #dddddd;*/
/*    }*/
/*}*/

.v-table-header__default {
    background-color: #f8f8f9;
    color: #297ea3;
    font-weight: bold;
    font-size: 12px;
}
</style>
