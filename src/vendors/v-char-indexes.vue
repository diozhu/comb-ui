<template>
    <div class="v-char-indexes" ref="container" @touchmove="handleMove">
        <div v-for="(item, index) in letters"
             :key="index"
             class="v-char-indexes__frm"
             :class="{'cur fade': item == currentValue || item == showValue}"
             @click="handleClick(item)"
        >
            <p class="v-char-indexes__con">
                {{item}}
            </p>
            <p v-show="item == currentValue" class="label">{{item}}</p>
        </div>
    </div>
</template>
<script>
    // import * as utils from '../js/utils/utils'; //eslint-disable-line

    /**
     *              -- Author by Dio Zhu. on 2018.4.10
     */

    export default {
        name: 'v-char-indexes',
        components: {},

        props: {
            value: {        // 当前选择字符
                type: String,
                default: ''
            },
            letters: {
                type: Array,
                default: () => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
            },
            showLetter: {   // 当前需要显示的字符，不参与位置逻辑返回，避免冲突
                type: String,
                default: ''
            }
        },

        data () {
            return {
                // keys: [] // 26个大写字母
                currentValue: this.value,
                showValue: this.showLetter
            };
        },

        computed: {
        },

        watch: {
            value (val) {
                this.showValue = '';
                this.currentValue = val;
            },
            showLetter (val) {
                this.currentValue = '';
                this.showValue = val;
            }
        },

        created () {
            this.$logger.log(`v-char-indexes.created: `, this.value);
            this.init();
        },

        methods: {
            init () { // 初始化
                this.$logger.log('v-char-indexes.init...');
                // for (let i = 0, len = 26;i < len;i++) this.keys.push(String.fromCharCode(65 + i));
            },
            handleClick (item) {
                // this.$logger.log('v-char-indexes.handleClick...', item);
                this.showValue = ''; // 清除显示字符
                this.$emit('input', item);
            },
            handleMove (e) {
                this.showValue = ''; // 清除显示字符
                // let h = parseInt(this.$refs.container.offsetHeight / 26),
                let c = (this.$refs.container.childNodes && this.$refs.container.childNodes.length) ? this.$refs.container.childNodes[0] : null,
                    h = c ? c.offsetHeight : window.lib.flexible.dpr * 20,
                    // t = this.$refs.container.offsetTop,
                    t = c ? c.offsetTop : 0,
                    y = e.touches[0].clientY,
                    idx = parseInt((y - t) / h),
                    // letter = this.letters[idx] || this.letters[0];
                    letter = this.letters[idx] || '';
                // this.$logger.log('v-char-indexes.handleMove... =========>>> ', idx, letter);
                e.preventDefault();
                e.stopPropagation();
                if (this.value !== letter) this.$emit('input', letter);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";
    .v-char-indexes {
        /*border: red 1px solid;*/
        width: pxTorem(40);
        /*height: pxTorem(520);*/
        height: 100%;
        padding: 0;
        position: fixed;
        right: pxTorem(12);
/*
        text-align: center;
        top: 50%;
        display: block;
        !*margin-top: -50%;*!
        margin-top: pxTorem(-260);
*/
        top: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .v-char-indexes__frm {
        width: pxTorem(40);
        position: relative;
        display: block;

        .label {
            position: absolute;
            font-size: pxTorem(18);
            top: pxTorem(-2);
            left: pxTorem(-20);
            color: #FDD108;
            opacity: 0;
        }
    }

    .v-char-indexes__con {
        display: block;
        /*width: pxTorem(20);*/
        /*height: pxTorem(20);*/
        /*padding: pxTorem(1) pxTorem(4);*/
        /*margin: 0 pxTorem(10);*/
        text-align: center;
        font-size: pxTorem(12);
        line-height: pxTorem(20);
    }

    .v-char-indexes__frm {

        &.cur {

            .v-char-indexes__con {
                /*border: #cccccc 1px solid;*/
                /*border-radius: 50%;*/
                font-size: pxTorem(14);
                color: #FDD108;
                font-weight: 700;
            }

            .label {
                opacity: 0;
            }
        }
        &.fade {

            .label {
                animation: fade_out 1s ease-in-out;
            }
        }
    }

    .v-char-indexes {
        @keyframes fade_out {
            0% { opacity: 1; }
            90% { opacity: 0.8; }
            95% { opacity: 0.3; }
            100% { opacity: 0; }
        }
    }
</style>
