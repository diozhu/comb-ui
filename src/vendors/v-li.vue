<template>
    <li class="li-text" @click="handleClick">
        <h5 class="li-title"><slot name="title"></slot></h5>
        <p>
            <slot></slot>
        </p>
    </li>
</template>
<script>
    export default {
        props: {
            title: String
        },
        data () {
            return {
            };
        },
        methods: {
            handleClick (evt) {
                this.$emit('click', evt);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";
    @import "../scss/_mixins";

    .li-text{
        width: 100%;
        margin-bottom: pxTorem(10px);
        .li-title{
            font-size: pxTorem(16px);
            margin-bottom: pxTorem(8px);
        }
        p{
            font-size: pxTorem(15px);
            line-height: pxTorem(19px);
            color: #333333;
            @include box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 3;
            overflow: hidden;
        }
    }

</style>
