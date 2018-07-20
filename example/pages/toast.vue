<template>
    <div class="page page-toast">
        <v-cell title="点击弹出toast" is-link @click.native="openToast"></v-cell>
    </div>
</template>

<script>
import Vue from 'vue';
// import vCell from '../../packages/v-cell.vue';
// import vToast from '../../packages/v-toast.js';
// Vue.component(vCell.name, vCell);
// Vue.$toast = Vue.prototype.$toast = vToast;
import { toast, vCell } from '../../src/index.js';
console.warn('toast: ', toast, vCell);
Vue.component(vCell.name, vCell);
Vue.$toast = Vue.prototype.$toast = toast;

export default {
    components: { vCell },
    data () {
        return {
        };
    },
    created () {
    },
    methods: {
        openToast () {
            this.toast = this.$toast('提示文字，尽量限制在一行以内');
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .page-toast {

    }
</style>
