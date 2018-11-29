<template>
    <div class="page page-huge-table">
        <v-table
            border
            stripe
            v-model="list"
            :span-method="spanMethod"
        >
            <v-table-column label="序号" prop="idx" width="30"></v-table-column>
            <v-table-column label="日期" prop="date" width="150"></v-table-column>
            <v-table-column label="姓名" prop="name" width="150"></v-table-column>
            <v-table-column label="8:00" prop="t1" width="80"></v-table-column>
            <v-table-column label="8:30" prop="t2" width="80"></v-table-column>
            <v-table-column label="9:00" prop="t3" width="80"></v-table-column>
            <v-table-column label="省份" prop="province" width="150"></v-table-column>
            <v-table-column label="地址" prop="address" width="300"></v-table-column>
        </v-table>
    </div>
</template>

<script>
    import vTable from '../vendors/v-table.vue';
    import vTableColumn from '../vendors/v-table-column.vue';

    class RulesHelper {
        constructor () {
        }

        reverseBro (rowIdx, colIdx) { // 重置兄弟元素顺序

        }

        getRules (data, columnNames = {}) {
            if (!data) return [];
            let rules = [],
                rowSpanCountObj = {}; // 记录row合并次数
            const reverseBro = function (rowIdx, colIdx) {

            };
            const rowSpan = function (rowIdx, colIdx, mergeKey, cell) {
                if (!columnNames[mergeKey]) return cell;
                let row = data[rowIdx],
                    upperRow = rowIdx > 0 ? data[rowIdx - 1] : null,
                    upperCol = upperRow ? upperRow[mergeKey] : null;
                // console.log('--------> ', upperRow, upperCol, r[c]);
                if (upperRow && upperCol === row[mergeKey]) { // 字符串相等，可以合并行
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
            [].forEach.call(data, (row, rowIdx) => { // row
                if (Object.keys(rowSpanCountObj).length) rowSpanCountObj[rowIdx] = 1;
                if (typeof row === 'object') { // data是一维数组，简单对象
                    let colIdx = 0;
                    Object.keys(row).map(columnKey => { // col
                        if (row.hasOwnProperty(columnKey) && columnNames.hasOwnProperty(columnKey)) {
                            if (!rules[rowIdx]) rules[rowIdx] = [];
                            let cell = { rowSpan: 1, colSpan: 1, parentRowId: rowIdx };

                            // // 整行上移数为合并行记录次数
                            // // if (rowSpanCountObj.hasOwnProperty(i)) cell.rowTrans = -(Object.keys(rowSpanCountObj).length);
                            // if (rowSpanCountObj.hasOwnProperty(rowIdx)) {
                            //     cell.rowTrans = -(Object.keys(rowSpanCountObj).filter(k => { return rowSpanCountObj[k] > 0; }).length);
                            // }

                            // console.log('--------> ', i, rowSpanCountObj, cell);
                            cell = rowSpan(rowIdx, colIdx, columnKey, cell); // 需要合并的列，查找上一行同列的数据是否需要合并
                            rules[rowIdx].push(cell);
                            colIdx++;
                        }
                    });
                }
            });
            console.log('-----> ', rowSpanCountObj);
            if (Object.keys(rowSpanCountObj).length) { // 计算每行上移距离
                Object.keys(rowSpanCountObj).map(rowIdx => {
                    console.log('     -----> ', rowIdx);

                });
            }
            console.log('=====> ', rowSpanCountObj);
            return rules;
        }
    }

    export default {
        components: { vTable, vTableColumn },
        data () {
            return {
                rules: [],
                list: []
            };
        },
        created () {
            this.init();
        },
        methods: {
            init () {
                console.log('page.huge-table.init: ');
                this.list = [
                    { idx: '0', userId: 1, date: '2018-11-1', name: '张三', t1: '1t1', t2: '1t2', t3: '1t3', province: '北京', address: '朝阳区酒仙桥路瀚海国际大厦' },
                    { idx: 1, userId: 2, date: '2018-11-2', name: '李四', t1: '2t1', t2: '2t1', t3: '2t3', province: '上海', address: '浦东区区酒仙桥路瀚海国际大厦' },
                    { idx: 2, userId: 2, date: '2018-11-3', name: '李四', t1: '2t1', t2: '2t2', t3: '2t2', province: '上海', address: '浦东区酒仙桥路瀚海国际大厦' },
                    { idx: 3, userId: 3, date: '2018-11-4', name: '王五', t1: '3t1', t2: '3t1', t3: '3t1', province: '广州', address: '佛山区酒仙桥路瀚海国际大厦' },
                    { idx: 4, userId: 3, date: '2018-11-5', name: '王五', t1: '3t1', t2: '3t2', t3: '3t2', province: '广州', address: '佛山区酒仙桥路瀚海国际大厦' },
                    { idx: 5, userId: 3, date: '2018-11-6', name: '王五', t1: '3t2', t2: '3t2', t3: '3t3', province: '广州', address: '佛山区酒仙桥路瀚海国际大厦' },
                    { idx: 6, userId: 4, date: '2018-11-7', name: '赵六', t1: '4t1', t2: '4t1', t3: '4t1', province: '深圳', address: '罗湖区酒仙桥路瀚海国际大厦' },
                    { idx: 7, userId: 4, date: '2018-11-8', name: '赵六', t1: '4t1', t2: '4t1', t3: '4t1', province: '深圳', address: '罗湖区酒仙桥路瀚海国际大厦' },
                    { idx: 8, userId: 4, date: '2018-11-9', name: '赵六', t1: '4t1', t2: '4t1', t3: '4t1', province: '深圳', address: '罗湖区酒仙桥路瀚海国际大厦' },
                    { idx: 9, userId: 4, date: '2018-11-10', name: '赵六', t1: '4t1', t2: '4t1', t3: '4t1', province: '深圳', address: '罗湖区酒仙桥路瀚海国际大厦' },
                    { idx: 10, userId: 4, date: '2018-11-11', name: '赵六', t1: '4t1', t2: '4t1', t3: '4t1', province: '深圳', address: '罗湖区酒仙桥路瀚海国际大厦' },
                    { idx: 11, userId: 5, date: '2018-11-12', name: '王二麻子', t1: '4t1', t2: '4t1', t3: '4t1', province: '北京', address: '朝阳区酒仙桥路瀚海国际大厦' }
                ];
                // this.rules = new RulesHelper().getRules(this.list, ['date', 'name', 't1', 't2', 't3', 'province', 'address']);
                this.rules = new RulesHelper().getRules(this.list, {
                    'idx': null,
                    'date': null,
                    'name': 'userId',
                    't1': null,
                    't2': null,
                    't3': null,
                    'province': null,
                    'address': null
                    // 'province': 'userId',
                    // 'address': 'userId'
                });
            },
            spanMethod ({ row, column, rowIndex, columnIndex }) {
                // console.log('huge-table.spanMethod: ', ...arguments);
                let cur = this.rules[rowIndex][columnIndex],
                    parentRowId = cur['parentRowId'],
                    parentRowSpan = this.rules[parentRowId][columnIndex]['rowSpan'],
                    trans = (parentRowId === rowIndex) ? cur['rowTrans'] : (rowIndex - parentRowId) - parentRowSpan;
                    // trans = (rowIndex - parentRowId < 2) ? cur['rowTrans'] : (rowIndex - parentRowId) - parentRowSpan;
                // console.log('', rowIndex, columnIndex, trans);
                return {
                    rowSpan: cur['rowSpan'],
                    colSpan: cur['colSpan'],
                    rowTrans: cur['rowTrans']
                    // // rowTrans: this.rules[rowIndex][columnIndex]['rowTrans']
                    // rowTrans: trans
                };
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";

    .page-huge-table {

    }
</style>
