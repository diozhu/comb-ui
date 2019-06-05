<template>
    <div class="page page-image">
        <v-image :value="{ url: '//static.91wuliu.com/plateform/demo-truck.jpg', width: '140', height: '100' }"></v-image>
    </div>
</template>

<script>
import vImage from '../vendors/v-image.vue';
export default {
    components: { vImage },
    data () {
        return {
        };
    },
    created () {
    },
    methods: {
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";

    .page-image {

    }
</style>
