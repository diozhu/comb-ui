<template>
    <div class="v-tic" ref="vTic">
        <ul>
            <li v-for="item in currentValue" :key="item">{{ item }}</li>
        </ul>
    </div>
</template>
<script>
import Tic from './Tic';
/**
 * v-tic组件
 * 传入大量list，任务分解后分别处理；
 */
export default {
    name: 'v-text',

    props: {
        value: {
            type: Array,
            default: () => []
        }
    },

    data () {
        return {
            currentValue: [],
            tic: ''
        };
    },
    computed: {
        // formatedValue1 () {
        //     let vTic = this.$refs.vTic,
        //         pElems = vTic.getElementsByTagName('li');
        //     return pElems;
        //     // return this.value1 ? utils.formatTime(this.value1) : '请选择日期（datetime picker）';
        // }
    },
    
    watch: {
        // currentValue (val) {
            // console.log('pElems', this.formatedValue1);
        // }
    },
    beforeDestroy: function () { // 清除事件监听
        if (this.tic) this.task.clear();
    },
    created () {
        console.log('v-tic created...');
        this.init();
    },
    methods: {
        init () {
            // this.currentValue = this.value;
            this.tic = new Tic(this.value, o => {
                this.currentValue.push(o);
                // if (this.currentValue.length < 20) this.currentValue.push(o)
            });
        },

    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-tic {
        width: 100%;
    }
</style>
