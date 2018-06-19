<template>
    <div class="page page-toast">
        <v-cell title="点击弹出toast" is-link @click.native="openToast"></v-cell>
    </div>
</template>

<script>
export default {
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

<style scoped>

</style>
