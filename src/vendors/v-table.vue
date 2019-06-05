<template>
    <div class="v-table" :class="[{ 'border': border,  'stripe': stripe}]">
        <div class="hidden-columns" ref="hiddenColumns"><slot></slot></div>
        <div class="v-table_h">
            <!--:style="{-->
            <!--'width': header.width + 'px'-->
            <!--}"-->
            <div v-for="(header, index) in store.states._columns" :key="index"
                 class="v-table_h-c cell"
                 :style="getSpanStyles(null, header)"
            >
                {{ header.label }}
            </div>
        </div>
        <div class="v-table_b">
            <div class="v-table_b-r"
                 v-for="(row, index) in store.states.data" :key="index"
                 :class="getRowClass(row, index)"
                 :style="rowStyles[index]"
                 @mouseenter="handleRowMouseEnter(index)"
                 @mouseleave="handleRowMouseLeave"
            >
                <!--:style="{-->
                <!--'width': col.width + 'px'-->
                <!--}"-->
                <div class="v-table_b-r-c cell"
                     v-for="(col, idx) in store.states._columns" :key="idx"
                     :style="getSpanStyles(row, col, index, idx)"
                >
                    <!--{{ (row[col.property] ? row[col.property] : row[idx][col.property]) }}-->
                    <v-text :value="(row[col.property] ? row[col.property] : row[idx][col.property])" :limit="1"></v-text>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import vText from './v-text.vue';
    import * as dom from '../js/utils/dom.js';

    class TableStore {
        constructor (table, initialState = {}) {
            console.log('TableStore.constructor: ', table, initialState);
            if (!table) throw new Error('Table is required.');
            this.table = table;
            this.states = {
                _data: [],
                _columns: [],
                data: [],
                columns: [],
                originColumns: [], // 原始数据列
                currentRow: null,
                hoverRow: null,
                rules: []   // 合并规则
            };

            this.mutations = {
                setData (states, data) {
                    console.log('TableStore.mutations.setData...');
                    const dataInstanceChanged = states._data !== data;
                    states._data = data;
                    states.data = data;
                    this.computeRules(); // 计算合并规则
                },
                // clearColumn () {
                //     this.states._columns = [];
                // },
                insertColumn (states, column, index, parent) {
                    // console.log(`v-table.${this.table._uid}.insertColumn: `, column.id, index);
                    let array = states._columns;
                    if (typeof index !== 'undefined') {
                        array.splice(index, 0, column);
                    } else {
                        array.push(column);
                    }
                    // console.log(`v-table.${this.table._uid}.insertColumn: `, array);
                    if (this.table.$ready) {
                        this.updateColumns();
                    }
                },
                setHoverRow (states, row) {
                    // console.log('TableStore.setHoverRow...', states, row);
                    states.hoverRow = row;
                }
            };
        }

        commit (name, ...args) {
            // console.log(`TableStore.${this._uid}.commit: `, name, ...args);
            const mutations = this.mutations;
            if (mutations && mutations[name]) {
                mutations[name].apply(this, [this.states].concat(args));
            } else {
                throw new Error(`Action not found: ${name}`);
            }
        }

        updateColumns () {
            // console.log('TableStore.updateColumns...');
            const _columns = this.states._columns || [];
            this.states.originColumns = _columns;
            this.states.columns = _columns;
            // this.computeRules();
        }

        computeRules () { // 计算合并规则，行合并设定在column上，列合并设在table上，都只能做单一维度合并，不支持多合并条件。 Author by Dio Zhu. on 2018.11.30
            let rules = [],
                data = this.states._data,
                columns = this.states._columns,
                colSpanProperty = this.table.colSpan,
                // columnNames = {},
                rowSpanCountObj = {}; // 记录row合并次数

            const rowSpanFn = function (row, col, rowIdx, colIdx, cell) {
                if (!col.rowSpan) return cell;
                // console.log('-> ', ...arguments);
                let upperRow = rowIdx > 0 ? data[rowIdx - 1] : null,
                    upperCol = null,
                    merageTag = false;
                if (Array.isArray(row)) { // 二维数组判断是否需要合并
                    upperCol = upperRow ? upperRow[colIdx][col.property] : null;
                    merageTag = upperRow && upperCol === row[colIdx][col.property];
                } else {
                    upperCol = upperRow ? upperRow[col.property] : null;
                    merageTag = upperRow && upperCol === row[col.property];
                }
                // console.log('--------> ', upperRow, upperCol);
                if (merageTag) { // 字符串相等，可以合并行
                    let parentRowId = rules[rowIdx - 1][colIdx]['parentRowId']; // 上一行的合并id
                    rules[parentRowId][colIdx]['rowSpan'] += 1; // 合并行向下合并数+1
                    cell.rowSpan = 0; // 当前行置零
                    // cell.rowSpan = -(rules[parentRowId][colIdx]['rowSpan'] - 1); // 当前行向上挪的行数
                    cell.parentRowId = parentRowId;

                    rowSpanCountObj[rowIdx] = 1;

                    // // // cell.rowTrans = -(Object.keys(rowSpanCountObj).length);
                    // // // console.log('--------> ', i, rowSpanCountObj, cell);
                    // // // cell.rowTrans = -(Object.keys(rowSpanCountObj).filter(k => { return rowSpanCountObj[k] > 0; }).length + (i - parentRowId - 1));
                    // cell.rowTrans -= (rowIdx - parentRowId - 1); // 当前行向上合并数 + 父级合并行数差
                    // // rowSpanCountObj[rowIdx] += 1;
                    // // cell.rowTrans = -(rowSpanCountObj[rowIdx]); // 当前行向上合并数 + 父级合并行数差
                    // console.log('--------> ', rowIdx, rowSpanCountObj, cell.rowTrans);
                }
                return cell;
            };
            const colSpanFn = function (row, col, rowIdx, colIdx, cell) {
                if (!colSpanProperty) return cell;
                let prevCol = colIdx > 0 ? row[colIdx - 1] : null,
                    merageTag = false;
                if (Array.isArray(row)) {
                    if (!row[colIdx][colSpanProperty]) return cell;
                    merageTag = prevCol && prevCol[colSpanProperty] === row[colIdx][colSpanProperty] && prevCol[col.property] === row[colIdx][col.property];
                } else {
                    if (!row[colSpanProperty]) return cell;
                    merageTag = prevCol && prevCol[colSpanProperty] === row[colSpanProperty] && prevCol[col.property] === row[col.property];
                }
                if (merageTag) {
                    let parentColId = rules[rowIdx][colIdx - 1]['parentColId']; // 合并表格的id
                    rules[rowIdx][parentColId]['colSpan'] += 1; // 合并列+1
                    cell.colSpan = 0;
                    cell.parentColId = parentColId;
                    // console.log('--------> ', cell);
                }
                return cell;
            };

            [].forEach.call(data, (row, rowIdx) => { // row
                if (Object.keys(rowSpanCountObj).length) rowSpanCountObj[rowIdx] = 0;
                [].forEach.call(columns, (col, colIdx) => { // col
                    if (!rules[rowIdx]) rules[rowIdx] = [];
                    let cell = { rowSpan: 1, colSpan: 1, parentRowId: rowIdx, parentColId: colIdx };

                    // // 整行上移数为合并行记录次数
                    // // if (rowSpanCountObj.hasOwnProperty(i)) cell.rowTrans = -(Object.keys(rowSpanCountObj).length);
                    // if (rowSpanCountObj.hasOwnProperty(rowIdx)) {
                    //     cell.rowTrans = -(Object.keys(rowSpanCountObj).filter(k => { return rowSpanCountObj[k] > 0; }).length);
                    // }

                    // console.log('--------> ', i, rowSpanCountObj, cell);
                    cell = rowSpanFn(row, col, rowIdx, colIdx, cell); // 合并行，查找上一行同列的数据是否需要合并
                    cell = colSpanFn(row, col, rowIdx, colIdx, cell); // 列并行，查找上一行同列的数据是否需要合并
                    rules[rowIdx].push(cell);
                });
            });
            // console.log('-----> ', rowSpanCountObj);
            this.rules = rules;
        }

        updateCurrentRow () {
            console.log('TableStore.updateCurrentRow...');
            const oldCurrentRow = this.states.currentRow;
            const data = this.states.data || [];
            if (data.indexOf(oldCurrentRow) < 0) {
                this.states.currentRow = null;
            }
        }
    }

    export default {
        name: 'v-table',
        components: { vText },
        props: {
            value: {
                type: Array,
                default: () => []
            },
            defaultRowHeight: {
                type: Number,
                default: 30
            },
            border: { // 表格边框样式
                type: Boolean,
                default: false
            },
            stripe: Boolean, // 斑马线样式
            colSpan: String // 列合并标识，只支持同行单条件合并！
            // spanMethod: Function // 合并回调
        },
        data () {
            const store = new TableStore(this, {});
            return {
                tableId: `v-table_${this._uid}`,
                currentValue: this.value,
                store,
                $ready: false,
                rowStyles: []
            };
        },
        computed: {
        },
        watch: {
            value (val) {
                this.currentValue = val;
                this.store.commit('setData', val);
            },
            'store.states.hoverRow' (newVal, oldVal) {
                if (!this.$el) return;
                const rows = this.$el.querySelectorAll('.v-table_b-r');
                const oldRow = rows[oldVal];
                const newRow = rows[newVal];
                // console.log('v-table.watch.hoverRow: ', this.$el.querySelectorAll('.v-table_b-r'), oldVal, ' -> ', newVal, ', ', rows, ', ', oldRow, ' --> ', newRow);
                if (oldRow) {
                    dom.removeClass(oldRow, 'hover');
                }
                if (newRow) {
                    dom.addClass(newRow, 'hover');
                }
            }
        },
        mounted () {
            console.log('v-table.mounted: ');
            this.init();
        },
        methods: {
            init () {
                console.log('v-table.init: ');
                // this.tableId = 'v-table_' + this._uid;
                // this.store.commit('clearColumn');
                this.store.commit('setData', this.value);
                this.$ready = true;
            },
            handleRowMouseEnter (rowIdx) {
                this.store.commit('setHoverRow', rowIdx);
            },
            handleRowMouseLeave () {
                this.store.commit('setHoverRow', null);
            },
            handleCellMouseEnter (e, row) {

            },
            handleCellMouseLeave () {

            },
            getRowClass (row, index) {
                let classes = [];
                if (this.stripe && index %2 === 1) {
                    classes.push('striped');
                }
                return classes.join(' ');
            },
            getTransformY (trans) { // 从'translate3d(0px, -60px,0)'中获取y的位移
                return parseInt(trans.match(/\((.*?)\)/)[1].split(',')[1]);
            },
            getSpanStyles (row, column, rowIndex, columnIndex) { // 单元格样式（合并）
                // console.log('====================> ', rowIndex, columnIndex);
                if (!this.store.rules.length) this.store.computeRules();
                let defWidth = column.width || 80,
                    obj = {
                        width: defWidth + 'px'
                    },
                    rowSpan = 1,
                    colSpan = 1,
                    rowTrans = 0;
                // obj.width = (column.width || '80') + 'px';
                // 刷新rowStyles
                // if (row && this.spanMethod && typeof this.spanMethod === 'function') {
                //     const result = this.spanMethod({row, column, rowIndex, columnIndex});
                if (row && this.store.rules.length) {
                    const result = this.store.rules[rowIndex][columnIndex];
                    if (Array.isArray(result)) {
                        rowSpan = result[0];
                        colSpan = result[1];
                        rowTrans = result[2];
                    } else {
                        rowSpan = result['rowSpan'];
                        colSpan = result['colSpan'];
                        rowTrans = result['rowTrans'];
                    }
                    if (rowSpan > 0) {
                        obj.height = (rowSpan * this.defaultRowHeight) + 'px';

                        if (rowSpan > 1) {
                            obj.marginBottom = -(rowSpan * this.defaultRowHeight) + 'px';
                            obj.zIndex = 9;
                        }
                    } else {
                        obj.height = (1 * this.defaultRowHeight) + 'px';
                    }
                    if (colSpan > 0) {
                        obj.width = (defWidth * colSpan) + 'px';

                        if (colSpan > 1) {
                            obj.marginRight = -((colSpan - 1) * defWidth) + 'px';
                            obj.zIndex = 9;
                        }
                    }
                    // if (rowTrans < 0) {
                    //     if (rowSpan <= 0) obj.visibility = 'hidden';
                    //     let rowStyle = { 'transform': 'translate3d(0, ' + (rowTrans * this.defaultRowHeight) + 'px, 0)' };
                    //     // if (!this.rowStyles[rowIndex]) this.$set(this.rowStyles, rowIndex, rowStyle);
                    //     // else if (this.rowStyles[rowIndex]['transform'] !== rowStyle['transform']) {
                    //     let oldTrans = this.rowStyles[rowIndex] ? this.getTransformY(this.rowStyles[rowIndex]['transform']) : 0,
                    //         newTrans = this.getTransformY(rowStyle['transform']);
                    //     // console.log('====================> ', rowIndex, columnIndex, rowSpan, oldTrans, newTrans);
                    //     if (oldTrans > newTrans) {
                    //         // console.log('====================> ', rowIndex, columnIndex, this.rowStyles[rowIndex]['transform'], rowStyle['transform'], this.rowStyles[rowIndex]['transform'] !== rowStyle['transform']);
                    //         this.$set(this.rowStyles, rowIndex, rowStyle);
                    //     }
                    //     // console.log('====================> ', !this.rowStyles[rowIndex] || this.rowStyles[rowIndex]['transform'] !== rowStyle['transform']);
                    //     // if (!this.rowStyles[rowIndex] || this.rowStyles[rowIndex]['transform'] !== rowStyle['transform']) {
                    //     //     this.$set(this.rowStyles, rowIndex, rowStyle);
                    //     // }
                    // }
                    // // console.log('v-table.getSpanStyles: ', obj);
                }
                return obj;
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-table {
        overflow: scroll;

        .v-table_h { // header:
            /*border: #66b3cc 1px solid;*/
            display: flex;
            flex-wrap: nowrap;
            align-items: stretch;
            justify-content: left;
        }

        .v-table_h-c { // header-content:
            flex: 1 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .v-table_b-r { // body-row: 数据行
            display: flex;
            flex-wrap: nowrap;
            align-items: stretch;
            justify-content: left;
            background: #ffffff;
        }

        .v-table_b-r-c { // body-row-content: 内容单元格
            flex: 1 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cell {
            overflow: hidden;
            padding: 6px;
            background: #ffffff;
            z-index: 1;

            .v-text {
                /*font-size: pxTorem(10);*/
                font-size: 12px;
            }
        }


        &.border {
            border-left: 1px solid #ebeef5;
            border-top: 1px solid #ebeef5;

            .cell {
                border-bottom: 1px solid #ebeef5;
                border-right: 1px solid #ebeef5;
            }
        }

        &.stripe {

            .v-table_b-r.striped .cell {
                background: #f2f2f4;
            }
        }

        .v-table_b-r.hover { // 鼠标悬浮样式
            .cell {
                background: #e8e9ff !important;
            }
        }
    }

</style>
