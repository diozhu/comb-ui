<template>
    <div class="picker-slot" ref="center" :class="classNames" :style="flexStyle" @touchend.stop>
        <div v-if="!divider" ref="wrapper" class="picker-slot-wrapper" :class="{ dragging: dragging }"
             :style="{ height: contentHeight + 'px' }">
            <!-- <div v-if="isAddress" class="picker-item" ref="item" v-for="itemValue in mutatingValues"
                 :class="{ 'picker-selected': itemValue === currentValue }">a
            </div>
            <div v-ele class="picker-item" ref="item" v-for="itemValue in mutatingValues"
                 :class="{ 'picker-selected': itemValue === currentValue }">
                {{ typeof itemValue === 'object' && itemValue[valueKey] ? itemValue[valueKey] : itemValue }}
            </div> -->
            <div class="picker-item" ref="item" v-for="(itemValue, index) in mutatingValues" :key="index"
                 :class="[{ 'picker-selected': itemValue === currentValue }, {'hasDesc': descKey}]">
                {{ typeof itemValue === 'object' && itemValue[valueKey] ? itemValue[valueKey] : itemValue }}
                <p v-if="descKey">{{ itemValue[descKey] }}</p>
            </div>
        </div>
        <div v-if="divider">{{ content }}</div>
    </div>
</template>

<script type="text/ecmascript-6">
import draggable from '../src/utils/draggable';
import translateUtil from '../src/utils/translate';
import {once, addClass, removeClass} from '../src/utils/dom';
import emitter from '../src/utils/emitter';
//    import Vue from 'vue';
//    if (!Vue.prototype.$isServer) {
//        require('raf.js');
//    }

let rotateElement = function (element, angle) {
    if (!element) return;
    let transformProperty = translateUtil.transformProperty;

    element.style[transformProperty] = element.style[transformProperty].replace(/rotateX\(.+?deg\)/gi, '') + ` rotateX(${angle}deg)`;
};

const ITEM_HEIGHT = (36 / 37.5) * window.rem;
const VISIBLE_ITEMS_ANGLE_MAP = {
    3: -45,
    5: -20,
    7: -15
};

export default {
    name: 'picker-slot',

    props: {
        values: {
            type: Array,
            default () {
                return [];
            }
        },
        value: {},
        visibleItemCount: {
            type: Number,
            default: 5
        },
        valueKey: String,
        rotateEffect: {
            type: Boolean,
            default: false
        },
        divider: {
            type: Boolean,
            default: false
        },
        textAlign: {
            type: String,
            default: 'center'
        },
        flex: {},
        className: {},
        content: {},
        descKey: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            currentValue: this.value,
            mutatingValues: this.values,
            dragging: false,
            animationFrameId: null
        };
    },

    mixins: [emitter],
    computed: {
        flexStyle () {
            return {
                'flex': this.flex,
                '-webkit-box-flex': this.flex,
                '-moz-box-flex': this.flex,
                '-ms-flex': this.flex
            };
        },
        classNames () {
            const PREFIX = 'picker-slot-';
            let resultArray = [],
                textAlign = this.textAlign || 'center';

            if (this.rotateEffect) {
                resultArray.push(PREFIX + 'absolute');
            }

            resultArray.push(PREFIX + textAlign);

            if (this.divider) {
                resultArray.push(PREFIX + 'divider');
            }

            if (this.className) {
                resultArray.push(this.className);
            }

            return resultArray.join(' ');
        },
        contentHeight () {
            return ITEM_HEIGHT * this.visibleItemCount;
        },
        valueIndex () {
            return this.mutatingValues.indexOf(this.currentValue);
        },
        dragRange () {
            let values = this.mutatingValues,
                visibleItemCount = this.visibleItemCount;
            return [-ITEM_HEIGHT * (values.length - Math.ceil(visibleItemCount / 2)), ITEM_HEIGHT * Math.floor(visibleItemCount / 2)];
        }
    },

    methods: {
        value2Translate (value) {
            let values = this.mutatingValues,
                // valueIndex = values.indexOf(value), // 组件使用时，如果用v-model外部值外部会跟着变，如果不用v-model绑定，比如p-position，要指定默认值，传入的对象和当前对象用这种方法无法判断为相等！-- Author by Dio Zhu. on 2018.2.4
                valueIndex,
                offset = Math.floor(this.visibleItemCount / 2);
            // if (values && values.length && value) {
            //     [].forEach.call(values, (v, i) => {
            //         console.log('=========> ', i, v, value, v === value, v[this.valueKey] === value, v[this.valueKey], value[this.valueKey], (v[this.valueKey] !== undefined && v[this.valueKey] === value[this.valueKey]));
            //         if (v === value || v[this.valueKey] === value || (v[this.valueKey] !== undefined && v[this.valueKey] === value[this.valueKey])) {
            //             valueIndex = i;
            //         }
            //     });
            // }
            if (values && values.length && value) [].forEach.call(values, (v, i) => { if (v === value || v[this.valueKey] === value || (v[this.valueKey] !== undefined && v[this.valueKey] === value[this.valueKey])) valueIndex = i; });
            if (!value && valueIndex === undefined) valueIndex = -1;
            if (valueIndex !== -1) {
                // if (value) this.$logger.warn('v-picker-slot.value2Translate: ', values, value, valueIndex, offset, (valueIndex - offset) * -ITEM_HEIGHT);
                return (valueIndex - offset) * -ITEM_HEIGHT;
            }
        },

        translate2Value (translate) {
            translate = Math.round(translate / ITEM_HEIGHT) * ITEM_HEIGHT;
            let index = -(translate - Math.floor(this.visibleItemCount / 2) * ITEM_HEIGHT) / ITEM_HEIGHT;
            return this.mutatingValues[Math.round(index)];
        },

        updateRotate: function (currentTranslate, pickerItems) {
            if (this.divider) return;
            let dragRange = this.dragRange,
                wrapper = this.$refs.wrapper,
                itemsFit = Math.ceil(this.visibleItemCount / 2),
                angleUnit = VISIBLE_ITEMS_ANGLE_MAP[this.visibleItemCount] || -20;

            // this.$logger.log('v-picker-slot.updateRotate: ', pickerItems);
            if (!pickerItems) {
                pickerItems = wrapper.querySelectorAll('.picker-item');
            }

            if (currentTranslate === undefined) {
                currentTranslate = translateUtil.getElementTranslate(wrapper).top;
            }

            [].forEach.call(pickerItems, (item, index) => {
                let itemOffsetTop = index * ITEM_HEIGHT,
                    translateOffset = dragRange[1] - currentTranslate,
                    itemOffset = itemOffsetTop - translateOffset,
                    percentage = itemOffset / ITEM_HEIGHT,
                    angle = angleUnit * percentage;

                if (angle > 180) angle = 180;
                if (angle < -180) angle = -180;

                rotateElement(item, angle);

                if (Math.abs(percentage) > itemsFit) {
                    addClass(item, 'picker-item-far');
                } else {
                    removeClass(item, 'picker-item-far');
                }
            });
        },

        planUpdateRotate: function () {
            let el = this.$refs.wrapper;
            window.cancelAnimationFrame(this.animationFrameId);

            this.animationFrameId = window.requestAnimationFrame(() => {
                this.updateRotate();
            });

            once(el, translateUtil.transitionEndProperty, () => {
                this.animationFrameId = null;
                window.cancelAnimationFrame(this.animationFrameId);
            });
        },

        initEvents () {
            let el = this.$refs.wrapper,
                dragState = {},

                velocityTranslate, prevTranslate, pickerItems;

            // 阻止空白区域的滚动事件冒泡。 Author by Dio Zhu. on 2017.4.5
            this.$refs.center.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });

            draggable(el, {
                start: (event) => {
                    window.cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                    dragState = {
                        range: this.dragRange,
                        start: new Date(),
                        startLeft: event.pageX,
                        startTop: event.pageY,
                        startTranslateTop: translateUtil.getElementTranslate(el).top
                    };
                    pickerItems = el.querySelectorAll('.picker-item');
                },

                drag: (event) => {
                    this.dragging = true;

                    dragState.left = event.pageX;
                    dragState.top = event.pageY;

                    let deltaY = dragState.top - dragState.startTop,
                        translate = dragState.startTranslateTop + deltaY;

                    translateUtil.translateElement(el, null, translate);

                    velocityTranslate = translate - prevTranslate || translate;

                    prevTranslate = translate;

                    if (this.rotateEffect) {
                        this.updateRotate(prevTranslate, pickerItems);
                    }
                },

                end: () => {
                    this.dragging = false;
                    let momentumRatio = 7,
                        currentTranslate = translateUtil.getElementTranslate(el).top,
                        duration = new Date() - dragState.start,
                        dragRange = dragState.range,
                        momentumTranslate;

                    if (duration < 300) {
                        momentumTranslate = currentTranslate + velocityTranslate * momentumRatio;
                    }

                    this.$nextTick(() => {
                        let translate;
                        if (momentumTranslate) {
                            translate = Math.round(momentumTranslate / ITEM_HEIGHT) * ITEM_HEIGHT;
                        } else {
                            translate = Math.round(currentTranslate / ITEM_HEIGHT) * ITEM_HEIGHT;
                        }

                        translate = Math.max(Math.min(translate, dragRange[1]), dragRange[0]);

                        translateUtil.translateElement(el, null, translate);

                        this.currentValue = this.translate2Value(translate);
                        // let currentIndex = this.translate2Value(translate);
                        // this.currentValue = this.mutatingValues[Math.round(currentIndex)];
                        // let vRange = Math.floor(this.visibleItemCount / 2);
                        // let startIndex = currentIndex - vRange;
                        // let endIndex = currentIndex + vRange;
                        // this.$logger.log('v-picker-slot.initEvents.currentValue: ', this.currentValue);

                        if (this.rotateEffect) {
                            this.planUpdateRotate();
                        }
                    });

                    dragState = {};
                }
            });
        },

        doOnValueChange () {
            let value = this.currentValue,
                wrapper = this.$refs.wrapper;
            translateUtil.translateElement(wrapper, null, this.value2Translate(value));
        },

        doOnValuesChange () {
            let el = this.$el,
                items = el.querySelectorAll('.picker-item');
            [].forEach.call(items, (item, index) => {
                translateUtil.translateElement(item, null, ITEM_HEIGHT * index);
            });
            if (this.rotateEffect) {
                this.planUpdateRotate();
            }
        }
    },

    mounted () {
        this.ready = true;
        this.$emit('input', this.currentValue);

        if (!this.divider) {
            // this.$logger.log('v-picker-slot.mounted: ==> doOnValueChange() ');
            this.initEvents();
            this.doOnValueChange();
        }

        if (this.rotateEffect) {
            // this.$logger.log('v-picker-slot.mounted: ==> doOnValuesChange() ');
            this.doOnValuesChange();
        }
    },

    watch: {
        values (val) {
            this.mutatingValues = val;
        },

        mutatingValues (val) {
            if (this.valueIndex === -1) {
                this.currentValue = (val || [])[0];
            }
            if (this.rotateEffect) {
                this.$nextTick(() => {
                    this.doOnValuesChange();
                });
            }
        },
        currentValue (val) {
            // console.log('!!!!!!!!!!!1', JSON.stringify(val));
            this.doOnValueChange();
            if (this.rotateEffect) {
                this.planUpdateRotate();
            }
            this.$emit('input', val);
            this.dispatch('picker', 'slotValueChange', this);
        },
        className () {
            this.$logger.warn('v-picker-slot.watch.className: ', ...arguments);
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    .picker-slot {
        font-size: pxTorem(18px);
        overflow: hidden;
        position: relative;
        max-height: 100%
    }

    .picker-slot.picker-slot-left {
        text-align: left;
    }

    .picker-slot.picker-slot-center {
        text-align: center;
        touch-action: none;
    }

    .picker-slot.picker-slot-right {
        text-align: right;
    }

    .picker-slot.picker-slot-divider {
        color: #000;
        display: flex;
        align-items: center;

        div {
            font-size: pxTorem(16px);
        }
    }

    .picker-slot-wrapper {
        transition-duration: 0.3s;
        transition-timing-function: ease-out;
        backface-visibility: hidden;
    }

    .picker-slot-wrapper.dragging,
    .picker-slot-wrapper.dragging .picker-item {
        transition-duration: 0s;
    }

    .picker-item {
        height: pxTorem(36px);
        line-height: pxTorem(36px);
        padding: 0 pxTorem(3px);
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        text-overflow: ellipsis;
        /*color: #BABABA;*/
        font-size: pxTorem(15px);
        color: #000;
        left: 0;
        top: 0;
        width: 100%;
        box-sizing: border-box;
        transition-duration: .3s;
        /*backface-visibility: hidden; // 不面向屏幕时隐藏*/

        &.hasDesc {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            p {
                padding: 0 0 0 pxTorem(10);
                font-size: pxTorem(12);
                color: #333;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
        }
    }

    .picker-slot-absolute .picker-item {
        position: absolute;
    }

    .picker-item.picker-item-far {
        pointer-events: none
    }

    .picker-item.picker-selected {
        color: #000;
        transform: translate3d(0, 0, 0) rotateX(0);
    }

    .picker-3d .picker-items {
        overflow: hidden;
        perspective: pxTorem(700px);
    }

    .picker-3d .picker-item,
    .picker-3d .picker-slot,
    .picker-3d .picker-slot-wrapper {
        transform-style: preserve-3d
    }

    .picker-3d .picker-slot {
        overflow: visible
    }

    .picker-3d .picker-item {
        transform-origin: center center;
        backface-visibility: hidden;
        transition-timing-function: ease-out
    }
</style>
