import vTable from './src/table.vue';
// https://github.com/kcikkick/vue-table-optimize
/* istanbul ignore next */
vTable.install = function(Vue) {
    Vue.component(vTable.name, vTable);
};

export default vTable;
