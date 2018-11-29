<template>
    <div class="v-table-column">

    </div>
</template>

<script>
    const getDefaultColumn = function (type = 'default', options = {}) {
        const column = {
            minWidth: 80
        };
        let col = Object.assign(column, options);
        col.readWidth = !col.width ? col.minWidth : col.width;
        return col;
    };

    export default {
        name: 'v-table-column',
        props: {
            type: {
                type: String,
                default: 'default'
            },
            label: String,
            columnKey: String,
            prop: String,
            property: String,
            width: {
                type: String,
                default: '80'
            },
            rowSpan: String // 单行简单数据的，行合并依赖字段名
        },
        data () {
            return {
                columnId: (this.$parent.tableId || this.$parent.columnId) + '_c_' + this._uid,
                currentValue: this.value
            };
        },
        computed: {
            owner () {
                let parent = this.$parent;
                while (parent && !parent.tableId) {
                    parent = parent.$parent;
                }
                return parent;
            }
        },
        mounted () {
            // console.log('v-table-column.mounted: ');
            this.init();
        },
        methods: {
            init () {
                // console.log(`v-table-column.${this._uid}.init: `, this.label);
                let column = getDefaultColumn(this.type, {
                    id: this.columnId,
                    columnKey: this.columnKey,
                    label: this.label,
                    property: this.prop || this.property,
                    width: this.width
                });
                let columnIndex = [].indexOf.call(this.$parent.$refs.hiddenColumns.children, this.$el);
                this.owner.store.commit('insertColumn', column, columnIndex, null);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-table-column {

    }

</style>
