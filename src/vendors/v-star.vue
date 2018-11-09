<template>
    <div class="v-star">
        <div v-if="label" class="label">{{ label }}</div>
        <div class="v-star__frm">
            <i v-for="n in 5"
               class="icon"
               :class="[{'icon-star-fill': n <= currentValue}, {'icon-star': n > currentValue}]"
               @click="handleClick(n)"
            ></i>
            <p class="desc" v-if="enableDesc && desc && desc.length">{{ desc[currentValue] }}</p>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    /**
     *
     *              -- Author by Dio Zhu. on 2018.4.10
     */
    export default {
        // name: 'v-star',
        components: {},

        props: {
            label: {
                type: String,
                default: ''
            },
            value: {
                type: Number,
                default: 0
            },
            disabled: {
                type: Boolean,
                default: false
            },
            enableDesc: {
                type: Boolean,
                default: true
            },
            desc: {
                type: Array,
                default: () => ['', '非常不满意', '不满意', '一般', '满意', '非常满意']
            }
        },
        data () {
            return {
                currentValue: this.value
            };
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },
            currentValue (val) {
                this.$emit('input', val);
            }
        },

        mounted () {
            console.log('v-star.mounted!');
        },

        methods: {
            handleClick (val) {
                if (this.disabled) return;
                this.currentValue = val;
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-star {
        display: flex;
        flex-direction: row;
        font-size: pxTorem(12);

        .label {
            flex: 0 0 auto;
            width: pxTorem(80);
        }
        .v-star__frm {
            flex: 1 1 auto;

            .icon {
                font-size: pxTorem(12);
                padding: 0 pxTorem(6) 0 0;
            }
            .desc {
                display: inline-block;
                font-size: pxTorem(12);
                line-height: 1;
            }
        }
    }
</style>
