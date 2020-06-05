<template>
    <div class="v-table-fixed-columns">
        <div :style="getHeaderStyle">
            <ul class="v-table-header__record">
                <template v-for="column in columns">
                    <li
                        v-if="column.fixed"
                        class="v-table-header-column"
                        :key="column[cIdKey]"
                        :columnKey="column[cIdKey]"
                        :title="column.label"
                        :style="getHeaderStyle"
                    >
                        <div class="v-table-header-column__container">
                            <span>{{ column.label }}</span>
                        </div>
                    </li>
                </template>
            </ul>
        </div>
        <div
            class="v-table-wrapper__body-wrapper v-table-body-wrapper__virtual"
            ref="body"
            @scroll.passive="handleScroll"
            :style="getBodyStyle"
        >
            <div ref="bodyWrapper" :style="getBodyWrapperStyle">
                <div
                    class="v-table-body-container v-table-body-container__fixed"
                    v-for="record in data"
                    :key="record[recordKey]"
                    :style="getBodyContainerStyle(record)"
                >
                    <ul
                        class="v-table-body__record"
                        :style="{ height: getRecordHeight }"
                        :class="{ selected: currentIds.indexOf(record.id) >= 0 || hoverId === record.id }"
                        @mouseover="e => handleMouseover(e, record)"
                        @mouseout="e => handleMouseout(e, record)"
                    >
                        <template v-for="(column, index) in columns">
                            <!--opts-->
                            <li
                                v-if="column.opts"
                                :key="'opts' + index"
                                class="v-table-body-column"
                                :style="getColumnStyle(column)"
                            >
                                <div class="v-table-body-column__container">
                                    <!--{{ record.id }}-->
                                    <template v-for="(o, i) in column.opts">
                                        <!-- <input
                                            :key="'opts' + i"
                                            type="button"
                                            :value="o.label"
                                            class="btn"
                                            @click="e => handleOptsClick(e, o, record, column, index)"
                                        /> -->
                                        <button
                                            :key="'opts' + i"
                                            type="button"
                                            class="btn el-button el-button--mini is-plain"
                                            :class="[`el-button--${o.type}`]"
                                            @click="e => handleOptsClick(e, o, record, column, index)"
                                        >
                                            <template v-if="o.icon">
                                                <i class="icon" :class="o.icon"></i>
                                            </template>
                                            <template v-else>{{ o.label }}</template>
                                        </button>
                                    </template>
                                </div>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { VIRTUAL_REMAIN_COUNT } from './constant';
import { ID_NAME } from './constant';
import bus from '../../eventbus';

export default {
    name: 'v-table-fixed-columns',
    components: {},
    props: {
        columns: Array,
        data: Array,
        recordKey: String,
        headerHeight: Number,
        itemHeight: Number,
        viewportHeight: Number,
        totalHeight: Number,
        showIndex: Boolean,
        showCheckbox: Boolean,
        // selected ids
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        const renderItems = Math.ceil(this.viewportHeight / this.itemHeight) + 2 * VIRTUAL_REMAIN_COUNT;
        return {
            cIdKey: ID_NAME,
            currentIds: this.value,
            virtualData: {},
            renderData: [],
            minItemKeyHeight: -1,
            maxItemKeyHeight: -1,
            remainHeight: VIRTUAL_REMAIN_COUNT * this.itemHeight,
            renderItems: renderItems,
            renderItemsHeight: renderItems * this.itemHeight,
            hoverId: null
        };
    },
    computed: {
        getWidth() {
            let cols = this.columns.filter(v => v.opts),
                w = 0;
            cols.every(c => (w += c.width));
            return w;
        },
        getHeaderStyle: function() {
            return {
                width: `${this.getWidth}px`,
                height: `${this.headerHeight}px`,
                lineHeight: `${this.headerHeight}px`
            };
        },
        getRecordHeight: function() {
            return `${this.itemHeight}px`;
        },
        getBodyStyle: function() {
            return {
                width: `${this.getWidth}px`,
                height: `${this.viewportHeight}px`
            };
        },
        getBodyWrapperStyle: function() {
            return {
                height: `${this.totalHeight}px`,
                position: 'relative'
            };
        }
    },
    watch: {
        value(val) {
            this.currentIds = val;
        }
    },
    created() {
        bus.$on(`${this.$options.name}.mouseover`, this.mouseover);
        bus.$on(`${this.$options.name}.mouseout`, this.mouseout);
    },
    beforeDestroy() {
        bus.$off(`${this.$options.name}.mouseover`, this.mouseover);
        bus.$off(`${this.$options.name}.mouseout`, this.mouseout);
    },
    methods: {
        getColumnStyle: function(column) {
            let rtn = { height: `${this.itemHeight}px`, lineHeight: `${this.itemHeight}px` };
            if (column === 'index' || column === 'checkbox') return rtn;
            else return { width: column.widthExt, ...rtn };
        },
        getBodyContainerStyle: function(record) {
            return {
                transform: `translateY(${record.translateY})`,
                height: `${this.itemHeight}px`
            };
        },
        handleScroll(e) {
            this.$emit('scroll', e);
        },
        handleOptsClick(e, o, row, column, index) {
            if (typeof o.callback === 'function') o.callback(e, row, column, index);
        },

        handleMouseover(e, row) {
            bus.$emit('v-table-body-virtual.mouseover', row.id);
        },
        handleMouseout(e, row) {
            bus.$emit('v-table-body-virtual.mouseout', row.id);
        },
        mouseover(id) {
            this.hoverId = id;
        },
        mouseout() {
            this.hoverId = null;
        }
    }
};
</script>

<style lang="scss">
.v-table-fixed-columns {
    position: absolute;
    top: 1px;
    right: 0;
    z-index: 9;
    /*overflow-y: auto;*/
    background-color: #f2f2f4;
    box-sizing: content-box;
    border-left: #dddddd 1px solid;
    box-shadow: 0 0 6px #dddddd;

    .v-table-header__record {
    }

    .v-table-wrapper__body-wrapper {
        /*&::-webkit-scrollbar {*/
        /*    display: none; !* Chrome Safari *!*/
        /*}*/
    }
}

.v-table-body-container__fixed {
    position: absolute;
}
.v-table-body-column__container {
    .btn {
        cursor: pointer;
        padding: 3px 4px;
        margin-left: 8px;
        // border: none;
        // background: transparent;
        // color: #3c9ccb;
        // &:hover {
        //     color: rgb(40, 102, 136);
        //     box-shadow: none;
        // }
    }
}
</style>
