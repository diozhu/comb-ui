<template>
    <div class="page page-upload-image">
        <v-upload-image v-model="photoList"></v-upload-image>
    </div>
</template>

<script>
    import vUploadImage from '../vendors/v-upload-image.vue';
    export default {
        components: {vUploadImage},
        data () {
            return {
                photoList: []
            };
        },
        created () {
        },
        methods: {
            init () {
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";

    .page-upload-image {

    }
</style>
