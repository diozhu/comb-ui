<template>
    <div class="img-list">
        <img
            :class="['img-cell', cusClass]"
            :src="item"
            v-for="(item, index) in imageUrls"
            @click="viewImage(index)">
    </div>
</template>
<script>
    export default {
        props: {
            cusClass: String,
            imageUrls: {
                type: Array,
                default: function () {
                    return ['https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1484654789094&di=02466216327a32679ac4ff35e01eb26e&imgtype=0&src=http%3A%2F%2Fpic9.nipic.com%2F20100901%2F4628577_161519016775_2.jpg'];
                }
            }
        },
        data () {
            return {
                initIndex: 0
            };
        },
        mounted () {
        },
        methods: {
            viewImage (index) {
                this.initIndex = parseInt(index);
                this.$emit('click', this.imageUrls);
            }
        },
        watch: {
            imageUrls (n) {
                let nCount = n.length;

                if (nCount > 3) {
                    console.log('列表图片最多显示3张');
                    return false;
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";
    @import "../scss/_mixins";

    .img-list{
        width: 100%;
        height: 100%;
        @include box_flex;
        @include align_items(center);
        @include justify-content(space-between);

        img{
            width: 100%;
            height: 100%;
        }
    }
    .img-cell{
        width: 100%;
        height: 100%;
        vertical-align: middle;
        @include flex_grow(0);
        @include flex_shrink(0);
        @include flex_basis(auto)
    }


</style>
