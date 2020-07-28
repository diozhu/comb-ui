<template>
    <section
        class="v-table-wrapper__body-wrapper v-table-body-wrapper__virtual"
        ref="virtualScrollBody"
        @scroll.passive="onVirtualScroll"
        :style="getBodyHeight"
    >
        <div ref="bodyWrapper" :style="getBodyWrapperStyle">
            <div
                class="v-table-body-container v-table-body-container__virtual"
                v-for="(record, ridx) in renderData"
                :key="record[recordKey]"
                :style="getBodyContainerStyle(record)"
            >
                <ul
                    class="v-table-body__record"
                    :style="{ height: getRecordHeight }"
                    @click="e => handleRowClick(e, record)"
                    :class="{ selected: currentIds.indexOf(record.id) >= 0 || hoverId === record.id }"
                    @mouseover="e => handleMouseover(e, record)"
                    @mouseout="e => handleMouseout(e, record)"
                >
                    <!--show checkbox-->
                    <li
                        v-if="showCheckbox"
                        :key="'checkbox' + ridx"
                        class="v-table-body-column v-table__checkbox"
                        :style="getColumnStyle('checkbox')"
                    >
                        <div class="v-table-body-column__container">
                            <input type="checkbox" name="ids" :value="record.id" v-model="currentIds" />
                        </div>
                    </li>
                    <!--show index-->
                    <li
                        v-if="showIndex"
                        :key="'index' + record.__vkey"
                        class="v-table-body-column v-table__index"
                        :style="getColumnStyle('index')"
                    >
                        <div class="v-table-body-column__container">{{ record.__vkey + 1 }}</div>
                    </li>
                    <template v-for="(column, index) in columns">
                        <!-- icon -->
                        <li
                            v-if="column.isIcon"
                            :key="'icon' + index"
                            class="v-table-body-column"
                            :style="getColumnStyle(column)"
                        >
                            <div class="v-table-body-column__container">
                                <i :class="['icon', record[column.prop]]"></i>
                            </div>
                        </li>
                        <!-- background -->
                        <li
                            v-else-if="column.isBranchground"
                            :key="'bg' + index"
                            class="v-table-body-column"
                            :style="getColumnStyle(column)"
                        >
                            <p :style="getBackgroundStyle(record, column)">
                                {{ record[column.prop] && record[column.prop].value ? record[column.prop].value : '' }}
                            </p>
                        </li>
                        <!-- normal | opts -->
                        <li
                            v-else-if="!column.opts || (column.opts && !compact)"
                            :key="'column' + index"
                            class="v-table-body-column"
                            :columnKey="column.prop"
                            :title="record[column.prop]"
                            :style="getColumnStyle(column)"
                        >
                            <div class="v-table-body-column__container">
                                <!-- opts -->
                                <template v-if="column.opts && !compact">
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
                                </template>
                                <!-- defaults -->
                                <span v-else-if="!column.render">{{ record[column.prop] }}</span>
                                <render-body
                                    v-else
                                    :key="column.prop"
                                    :row="record"
                                    :render="column.render"
                                    :index="index"
                                ></render-body>
                            </div>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </section>
</template>

<script>
import _ from 'lodash';
import RenderBody from './expand';
import Color from '../../../vendors/Color.js';
import { VIRTUAL_REMAIN_COUNT } from './constant';
import { calDomItemsHeight } from './utils.js';
import bus from '../../eventbus';

export default {
    name: 'v-table-body-virtual',
    components: { RenderBody },
    props: {
        columns: Array,
        data: Array,
        recordKey: String,
        itemHeight: Number,
        viewportHeight: Number,
        showIndex: Boolean,
        showCheckbox: Boolean,
        compact: Boolean,
        // selected ids
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        const renderItems = Math.ceil(this.viewportHeight / this.itemHeight) + 2 * VIRTUAL_REMAIN_COUNT;
        return {
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
        getRecordHeight: function() {
            return `${this.itemHeight}px`;
        },
        getBodyHeight: function() {
            return {
                height: `${this.viewportHeight}px`
            };
        },
        getBodyWrapperStyle: function() {
            return {
                height: `${this.data.length * this.itemHeight}px`,
                position: 'relative'
            };
        }
    },
    watch: {
        data: {
            handler: function(val) {
                this.virtualData = _.cloneDeep(val);
                this.recalculate();
                this.refreshRenderData();
            },
            immediate: true,
            deep: true
        },
        value(val) {
            this.currentIds = val;
        },
        currentIds(val) {
            this.$emit('input', val);
        },
        renderData: {
            handler(val) {
                this.$emit('randerChange', val);
            },
            deep: true,
            immediate: true
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
        init() {
            // console.log('table-body-virtual.init: ');
            this.renderItems = null;
            this.renderData = [];
        },
        recalculate() {
            if (!this.renderItems) {
                this.renderItems = Math.ceil(this.viewportHeight / this.itemHeight) + 2 * VIRTUAL_REMAIN_COUNT;
                this.renderItemsHeight = this.renderItems * this.itemHeight;
            }
        },
        getColumnStyle(column) {
            // console.log(column.id, column);
            let rtn = { height: `${this.itemHeight}px`, lineHeight: `${this.itemHeight}px` };
            if (column.align) rtn.textAlign = column.align;
            if (column === 'index' || column === 'checkbox') return rtn;
            else return { width: column.widthExt, ...rtn };
        },
        getBackgroundStyle(record, column) {
            let bg = record[column.prop] && record[column.prop].bg ? record[column.prop].bg : '',
                c = bg ? Color.getContrastColor(bg) : '';
            let rtn = { backgroundColor: bg, borderRadius: '3px', color: c, overflow: 'hidden' };
            return rtn;
        },
        buildRenderData(minHeight, maxHeight) {
            const minItemKey = minHeight / this.itemHeight;
            const maxItemKey = maxHeight / this.itemHeight;
            const startIndex = minItemKey > 0 ? minItemKey : -1;
            const endIndex = maxItemKey > this.virtualData.length ? this.data.length : maxItemKey;
            const renderData = [];
            for (let index = startIndex + 1; index < endIndex; index++) {
                const item = this.virtualData[index];
                const recordIndexHight = `${index * this.itemHeight}`;
                item.__vkey = index;
                item.translateY = `${recordIndexHight}px`;
                renderData.push(item);
            }
            // this.$emit('randerChange', renderData);
            return renderData;
        },
        getBodyContainerStyle(record) {
            return {
                // transform: `translateY(${record.translateY})`,
                transform: `translateY(${record.translateY}) translateZ(0)`,
                height: `${this.itemHeight}px`
            };
        },
        buildNewItems(newData) {
            const newItems = [];
            for (const newRecord of newData) {
                if (_.findIndex(this.renderData, { __vkey: newRecord.__vkey }) < 0) {
                    newItems.push(newRecord);
                }
            }
            return newItems;
        },
        buildOutDateItems(newData) {
            const replaceItemsIndex = [];
            for (let index = 0; index < this.renderData.length; index++) {
                const record = this.renderData[index];
                if (_.findIndex(newData, { __vkey: record.__vkey }) < 0) {
                    replaceItemsIndex.push(index);
                }
            }
            return replaceItemsIndex;
        },
        refreshVirtualItems(newItems, replaceItemsIndex) {
            if (newItems.length === this.renderData.length) {
                this.renderData = newItems;
                // this.$emit('randerChange', this.renderData);
                return;
            }
            for (let index = 0; index < newItems.length; index++) {
                if (index < replaceItemsIndex.length) {
                    this.$set(this.renderData, replaceItemsIndex[index], newItems[index]);
                    continue;
                }
                this.renderData.push(newItems[index]);
            }
            // this.$emit('randerChange', this.renderData);
        },
        updateRenderData(newData) {
            if (this.renderData.length === 0) {
                this.renderData = newData;
                // this.$emit('randerChange', this.renderData);
                return;
            }
            const newItems = this.buildNewItems(newData);
            const replaceItemsIndex = this.buildOutDateItems(newData);
            this.refreshVirtualItems(newItems, replaceItemsIndex);
        },
        refreshRenderData() {
            const virtualScrollBody = this.$refs.virtualScrollBody;
            const scrollTop = virtualScrollBody ? virtualScrollBody.scrollTop : 0;
            const [minItemHeight, maxItemHeight] = calDomItemsHeight(
                this.itemHeight,
                this.remainHeight,
                this.viewportHeight,
                this.renderItemsHeight,
                scrollTop
            );
            this.updateRenderData(this.buildRenderData(minItemHeight, maxItemHeight));
        },
        // onVirtualScroll(e) { //eslint-disable-line
        onVirtualScroll: _.throttle(function (e) { //eslint-disable-line
            window.requestAnimationFrame(this.refreshRenderData);
            // this.$emit('scroll', { e, wrapper: this.$refs.bodyWrapper });
            this.$emit('scroll', e);
            // },
        }, 16.7),
        handleRowClick(e, row) {
            // console.log('table-body-virtual.handleRowClick: ', row.id);
            this.$emit('rowClick', ...[e, row]);
        },
        handleOptsClick(e, o, row, column, index) {
            if (typeof o.callback === 'function') o.callback(e, row, column, index);
        },

        handleMouseover(e, row) {
            bus.$emit('v-table-fixed-columns.mouseover', row.id);
        },
        handleMouseout(e, row) {
            bus.$emit('v-table-fixed-columns.mouseout', row.id);
        },
        // emit from v-table-fixed-columns
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
.v-table-body-wrapper__virtual {
    display: inherit;
}

.v-table-body-container__virtual {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
}
</style>
