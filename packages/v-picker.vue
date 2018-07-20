<template>
    <div class="v-picker" :class="{ 'v-picker-3d': rotateEffect }">
        <!-- <slot name='message'></slot> -->
        <div class="v-picker-toolbar" v-if="$slots.default">
            <!-- <div v-if="$slots.default"> -->
            <slot></slot>
        </div>

        <div class="v-picker-items">
            <v-picker-slot v-for="(slot, idx) in slots"
                           :key="idx"
                           :valueKey="valueKey"
                           :values="slot.values || []"
                           :text-align="slot.textAlign || 'center'"
                           :visible-item-count="visibleItemCount"
                           :class-name="slot.className"
                           :flex="slot.flex"
                           v-model="values[slot.valueIndex]"
                           :rotate-effect="rotateEffect"
                           :divider="slot.divider"
                           :content="slot.content"
                           :descKey="descKey"
            ></v-picker-slot>
            <div ref="mask" class="v-picker-center-mask"></div>
            <div class="v-picker-center-highlight"></div>
        </div>
    </div>
</template>

<script type="text/babel">
import vPickerSlot from './v-picker-slot.vue';

export default {
    name: 'v-picker',
    componentName: 'picker',

    components: { vPickerSlot },

    props: {
        slots: {
            type: Array
        },
        visibleItemCount: {
            type: Number,
            default: 5
        },
        valueKey: String,
        rotateEffect: {
            type: Boolean,
            default: false
        },
        descKey: {
            type: String,
            default: ''
        }
    },

    computed: {
        values () {
            let slots = this.slots || [],
                values = [];
            slots.forEach(function (slot) {
                if (!slot.divider) values.push(slot.value);
            });

            return values;
        },
        slotCount () {
            let slots = this.slots || [],
                result = 0;
            slots.forEach(function (slot) {
                if (!slot.divider) result++;
            });
            return result;
        }
    },

    // watch: {
    //     slots () {
    //         this.$logger.warn('v-picker.watch.slots: ', this.slots, ...arguments);
    //     }
    // },

    created () {
        this.$on('slotValueChange', this.slotValueChange);
        let slots = this.slots || [], valueIndexCount = 0;
        // this.values = []; // 会报错。。。mod by Dio Zhu. on 2017.11.4
        let values = this.values;
        slots.forEach(function (slot) {
            if (!slot.divider) {
                slot.valueIndex = valueIndexCount++;
                values[slot.valueIndex] = (slot.values || [])[slot.defaultIndex || 0];
            }
        });
        // this.$logger.log(`v-picker[${this._uid}].created: `, values);
    },

    mounted () {
        // this.$logger.log('picker.mounted: ');
    },
    methods: {
        slotValueChange () {
            this.$emit('change', this, this.values);
        },
        getSlot (slotIndex) {
            let slots = this.slots || [], count = 0, target,
                children = this.$children.filter(child => child.$options.name === 'picker-slot');

            slots.forEach(function (slot, index) {
                if (!slot.divider) {
                    if (slotIndex === count) {
                        target = children[index];
                    }
                    count++;
                }
            });

            return target;
        },
        getSlotValue (index) {
            let slot = this.getSlot(index);
            if (slot) {
                return slot.value;
            }
            return null;
        },
        setSlotValue (index, value) {
            let slot = this.getSlot(index);
            if (slot) {
                slot.currentValue = value;
            }
        },
        getSlotValues (index) {
            let slot = this.getSlot(index);
            if (slot) {
                return slot.mutatingValues;
            }
            return null;
        },
        setSlotValues (index, values) {
            let slot = this.getSlot(index);
            if (slot) {
                slot.mutatingValues = values;
            }
        },
        getValues () {
            return this.values;
        },
        setValues (values) {
            let slotCount = this.slotCount;
            values = values || [];
            if (slotCount !== values.length) {
                throw new Error('values length is not equal slot count.');
            }
            values.forEach((value, index) => {
                this.setSlotValue(index, value);
            });
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    $line-height: pxTorem(36px);
    .v-picker {
        overflow: hidden;
    }
    .v-picker .top-message{
        font-size: pxTorem(14px);
        // height: pxTorem(80px);
        padding:pxTorem(12px) pxTorem(15px);
        // display: block;
        /*border-bottom: 1px solid #E3E3E3;*/
        border-top: 1px solid #E3E3E3;
        .msg-tit{
            font-size:pxTorem(15px);
            color: #3E3A39;
            text-align: center;
            padding-bottom:pxTorem(2px);
        }
        .msg-con{
            font-size: pxTorem(13px);
            color: #3E3A39;
            text-align: center;
        }
    }
    .v-picker-toolbar {
        min-height: pxTorem(40px);
        border-bottom: 1px solid #E3E3E3;
        display: flex;
        justify-content: space-between;

        .v-popup-action {
            font-size: pxTorem(15px);
            color: #000000;
            margin: 0 pxTorem(15px);

            flex: 0 0 auto;
            display: flex;
            align-items: center;
            /*justify-content: center;*/
        }
    }

    .v-picker-items {
        /*display: flex;*/
        /*justify-content: center;*/
        text-align: right;
        font-size: pxTorem(24px);
        position: relative;
        padding: 0 pxTorem(15px);
        display: flex;
        justify-content: center;
        align-items: center;

        /* 渐变蒙版 */
        /*background-image: linear-gradient(180deg, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6)), linear-gradient(0deg, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
        background-position: top, bottom;
        background-size: 100% $line-height*3;
        background-repeat: no-repeat;*/
    }

    .v-picker-center-mask {
        width: 100%;
        height: 100.1%;
        position: absolute;
        left: 0;
        top: -1px;
        /*position: fixed;*/
        /*left: 0;*/
        /*bottom: 0;*/

        /* 渐变蒙版 -- Author by Dio Zhu. on 2017.3.2 */
        /*!* Webkit: Safari 4-5, Chrome 1-9 *!
        background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(hsla(0, 0%, 100%, .95)), to(hsla(0, 0%, 100%, .6)));
        !* Webkit: Safari 5.1+, Chrome 10+ *!
        background: -webkit-linear-gradient(top, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
        !* Firefox 3.6+ *!
        background: -moz-linear-gradient(top, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
        !* Opera 11.10+ *!
        background: -o-linear-gradient(top, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
        !* IE 10 *!
        background: -ms-linear-gradient(top, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
        !* IE < 10 *!
        !* 注意：这一行必须写在最后 *!
        !*FILTER: progid:DXImageTransform.Microsoft.Gradient(startColorStr=#ff6600, endColorStr=#339900);*!*/

        background: linear-gradient(180deg, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6)), linear-gradient(0deg, hsla(0, 0%, 100%, .95), hsla(0, 0%, 100%, .6));
        background-position: top, bottom;
        /*background-size: 100% $line-height*3;*/
        background-size: 100% 42%;
        background-repeat: no-repeat;
        pointer-events: none;   // 屏蔽蒙版事件
        z-index: 9;
    }
    .v-picker-center-highlight {
        height: $line-height;
        box-sizing: border-box;
        position: absolute;
        left: 0;
        width: 100%;
        top: 50%;
        margin-top: pxTorem(-18px);
        pointer-events: none;   // 屏蔽蒙版事件

        /* 上下黑边 -- Author by Dio Zhu. on 2017.3.2 */
        /*background-image: -webkit-linear-gradient(top, #d0d0d0, #d0d0d0, transparent, transparent), -webkit-linear-gradient(bottom, #d0d0d0, #d0d0d0, transparent, transparent);*/
        /*background-image: linear-gradient(180deg, #d0d0d0, #d0d0d0, transparent, transparent), linear-gradient(0deg, #d0d0d0, #d0d0d0, transparent, transparent);*/
        /*background-position: top, bottom;*/
        /*background-size: 100% pxTorem(1px);*/
        /*background-repeat: no-repeat;*/
    }

    .v-picker-center-highlight:before,
    .v-picker-center-highlight:after {
        content: '';
        position: absolute;
        height: pxTorem(1px);
        width: 100%;
        background-color: #DDDEE3;
        display: block;
        z-index: 15;
        transform: scaleY(0.5);
    }

    .v-picker-center-highlight:before {
        left: 0;
        top: 0;
        bottom: auto;
        right: auto;
    }

    .v-picker-center-highlight:after {
        left: 0;
        bottom: 0;
        right: auto;
        top: auto;
    }
</style>
