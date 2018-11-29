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
            >
                <!--:style="{-->
                <!--'width': col.width + 'px'-->
                <!--}"-->
                <div class="v-table_b-r-c cell"
                     v-for="(col, idx) in store.states._columns" :key="idx"
                     :style="getSpanStyles(row, col, index, idx)"
                >
                    {{ (row[col.property] ? row[col.property] : '') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>

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
                currentRow: null
            };

            this.mutations = {
                setData (states, data) {
                    console.log('TableStore.mutations.setData...');
                    const dataInstanceChanged = states._data !== data;
                    states._data = data;
                    states.data = data;
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
            console.log('TableStore.updateColumns...');
            const _columns = this.states._columns || [];
            this.states.originColumns = _columns;
            this.states.columns = _columns;
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
            spanMethod: Function // 合并回调
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
                let obj = {},
                    rowSpan = 1,
                    colSpan = 1,
                    rowTrans = 0;
                obj.width = (column.width || '80') + 'px';
                // 刷新rowStyles
                if (row && this.spanMethod && typeof this.spanMethod === 'function') {
                    const result = this.spanMethod({row, column, rowIndex, columnIndex});
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
        }

        .v-table_b-r-c { // body-row-content: 内容单元格
            flex: 1 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cell {
            padding: 6px;
            background: #ffffff;
            z-index: 1;
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
    }

</style>
