<template>
    <div class="comment">
        <div class="star" :class="starType">
            <div v-if="label" class="label">{{label}}</div>
            <div class="star-con">
                <div class="star-box">
                    <i v-for="(item, index) in starClasses" :key="index" :class="['icon-star','icon', item]" @click="selectStar(index,$event)"></i>
                </div>
                <div class="star-grade">
                    <!--<p>评分：{{score}}</p>-->
                    <!--<p>满意度：{{scoreCon}}</p>-->
                    <p>{{scoreCon}}</p>
                </div>
            </div>
        </div>

    </div>
</template>
<script>
    import '../js/utils/tap';
    const scoreContent = ['', '非常不满意', '不满意', '一般', '满意', '非常满意'];
    export default {
        props: {
            label: {
                type: String,
                default: ''
            },
            value: {
                type: Number,
                default: 0
            },
            starType: {
                type: String,
                default: ''
            },
            maxLength: {
                type: Number,
                default: 5
            },
            disabled: {
                type: Boolean,
                default: false
            }

        },
        data () {
            return {
                score: this.value,
                scoreCon: ''
            };
        },

        mounted () {
        },
        watch: {
            value (val) {
                console.log('v-comment', val);
                this.scoreCon = scoreContent[val];
                this.score = val;
            },
            score (val) {
                this.$emit('input', val);
            }
        },
        methods: {
            selectStar (index, event) {
                if (this.disabled) return;
                this.score = index + 1;
                this.scoreCon = scoreContent[index + 1];
                this.$emit('input', this.score);
            }
        },
        computed: {
            //* 计算显示星星
            starClasses () {
                const starFull = 'icon-star-fill'; // 全星
                const starHalf = 'icon-star-half'; // 半星
                const starOff = 'icon-star-empty'; // 空星
                let result = []; // 返回的是一个数组,用来遍历输出星星
                let score = Math.floor(this.score * 2) / 2; // 计算所有星星的数量
                let hasDecimal = score % 1 !== 0; // 非整数星星判断
                let integer = Math.floor(score); // 整数星星判断
                for (let i = 0;i < integer;i++) { // 整数星星使用
                    result.push(starFull);// 一个整数星星就push一个starFull到数组
                }
                if (hasDecimal) { // 非整数星星使用half
                    result.push(starHalf);// 类似
                }
                while (result.length < this.maxLength) { // 余下的用无星星补全,使用off
                    result.push(starOff);// 类似
                }
                this.scoreCon = scoreContent[Math.floor(this.score)];
                // console.log('liuweliuweliuaaaaaa', this.scoreCon);
                return result;
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";
    .comment{
        .star{
            display: flex;
            justify-content: flex-start;
            align-items: center;
            .label{
                flex: 0 0 auto;
                width: pxTorem(100);
            }
            .star-con{
                width: 70%;
                flex: 0 0 auto;
                display: flex;
                flex-direction: row;
                align-items: center;
                .star-box{
                    flex: 0 0 auto;
                    width: pxTorem(100);
                }
                .star-grade{
                    flex: 1 1 auto;
                }
            }
            .icon-star{
                &.icon-star-empty:before{
                    font-size: pxTorem(16);
                }
                &.icon-star-fill:before{
                    font-size: pxTorem(16);
                }
                display: inline-block;
            }

        }


    }

</style>
