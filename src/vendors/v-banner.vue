<!--<template>-->
    <!--<v-touch v-on:swiperight="swipe" v-bind:swipe-options="{ direction: 'horizontal' }" tag="div" class="v-banner swiper-container">-->
        <!--&lt;!&ndash;<div class="swiper-container swiperContainer">&ndash;&gt;-->
            <!--<div class="swiper-wrapper">-->
                <!--&lt;!&ndash;:style="{'background': 'url('+item.url+')','background-repeat':'no-repeat','background-size':'cover','background-position':'center'}"&ndash;&gt;-->
                <!--<div class="swiper-slide v-banner__slide" v-for="item in value"-->
                <!--&gt;-->
                    <!--<img :src="item.url | thumb" alt="">-->
                <!--</div>-->
            <!--</div>-->
        <!--<div class="swiper-pagination" v-if="value.length>1"></div>-->
        <!--&lt;!&ndash;<div class="swiper-count">&ndash;&gt;-->
                <!--&lt;!&ndash;<span>{{initIndex+1}}</span><em>/</em><span>{{imageUrls.length}}</span>&ndash;&gt;-->
            <!--&lt;!&ndash;</div>&ndash;&gt;-->
        <!--&lt;!&ndash;</div>&ndash;&gt;-->
    <!--</v-touch>-->
<!--</template>-->

<!--<script>-->
    <!--require('../../static/js/vendor/swiper-3.4.1.min'); // get swiper.js-->
    <!--import Swiper from '../../static/js/vendor/swiper-3.3.1.min';-->

    <!--export default {-->
        <!--name: 'v-banner',-->

        <!--props: {-->
            <!--value: {-->
                <!--type: Array,-->
                <!--required: true-->
            <!--}-->
        <!--},-->

        <!--data () {-->
            <!--return {-->
                <!--swiper: ''-->
            <!--};-->
        <!--},-->

        <!--methods: {-->
            <!--/**-->
             <!--* index中用了右划翻页, 此处阻止冒泡.-->
             <!--*              &#45;&#45; Author by Dio Zhu. on 2017.2.14-->
             <!--*/-->
            <!--swipe: function (e) {-->
                <!--console.log('swipe in viewImage...', this.swiper.activeIndex, this.swiper.previousIndex);-->
                <!--e.srcEvent.stopPropagation();-->
                <!--if (!this.swiper.previousIndex) {-->
                    <!--this.$router.go(-1);-->
                <!--}-->
            <!--}-->
        <!--},-->

        <!--mounted () {-->
            <!--console.log('v-banner.mounted: ');-->
            <!--let self = this;-->
            <!--if (self.swiper) {-->
                <!--self.swiper.destroy(false);-->
                <!--self.swiper = null;-->
            <!--}-->
            <!--this.$nextTick(() => {-->
                <!--self.swiper = new Swiper('.swiper-container', {-->
                    <!--observer: true, // 修改swiper自己或子元素时，自动初始化swiper-->
                    <!--observeParents: true, // 修改swiper的父元素时，自动初始化swiper-->
                    <!--loop: false,-->
                    <!--autoplay: 3000,-->
                    <!--autoplayDisableOnInteraction: false,-->
                    <!--pagination: '.swiper-pagination',-->
                    <!--paginationElement: 'span',-->
                    <!--paginationType: 'bullets'-->
                <!--});-->
            <!--});-->
<!--//            setTimeout(() => {-->
<!--//                this.swiper.updateSlidesSize();-->
<!--//                this.swiper.updatePagination();-->
<!--//                console.log('-&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;');-->
<!--//            }, 3000);-->
        <!--},-->
        <!--computed: {-->

        <!--}-->
    <!--};-->

<!--</script>-->
<!--<style rel="stylesheet/scss" lang="scss">-->
    <!--@import "../../static/js/vendor/swiper-3.4.1.min.css"; // get swiper.css-->

    <!--@import "../scss/variables";-->
    <!--@import "../scss/_mixins";-->

    <!--.v-banner {-->
        <!--width: 100%;-->
        <!--height: pxTorem(138px);-->
    <!--}-->

    <!--.v-banner__slide {-->
        <!--/*display: flex;*/-->
        <!--/*align-items: center;*/-->
        <!--/*justify-content: center;*/-->

        <!--img {-->
            <!--width: 100%;-->
            <!--height: 100%;-->

            <!--/*flex-shrink: 0;*/-->
            <!--/*flex-grow: 0;*/-->
            <!--/*flex-basis: auto;*/-->
        <!--}-->
    <!--}-->
<!--</style>-->
