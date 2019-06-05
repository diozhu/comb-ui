<template>
  <div
    class="v-carousel"
    :class="{ 'v-carousel--card': type === 'card' }"
    @mouseenter.stop="handleMouseEnter"
    @mouseleave.stop="handleMouseLeave">
    <div
      class="v-carousel__container"
      :style="{ height: height }">
      <transition name="carousel-arrow-left">
        <button
          v-if="arrow !== 'never'"
          v-show="arrow === 'always' || hover"
          @mouseenter="handleButtonEnter('left')"
          @mouseleave="handleButtonLeave"
          @click.stop="throttledArrowClick(activeIndex - 1)"
          class="v-carousel__arrow v-carousel__arrow--left">
          <i class="el-icon-arrow-left"></i>
        </button>
      </transition>
      <transition name="carousel-arrow-right">
        <button
          v-if="arrow !== 'never'"
          v-show="arrow === 'always' || hover"
          @mouseenter="handleButtonEnter('right')"
          @mouseleave="handleButtonLeave"
          @click.stop="throttledArrowClick(activeIndex + 1)"
          class="v-carousel__arrow v-carousel__arrow--right">
          <i class="el-icon-arrow-right"></i>
        </button>
      </transition>
      <slot></slot>
    </div>
    <ul
      class="v-carousel__indicators"
      v-if="indicatorPosition !== 'none'"
      :class="{ 'v-carousel__indicators--labels': hasLabel, 'v-carousel__indicators--outside': indicatorPosition === 'outside' || type === 'card' }">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="v-carousel__indicator"
        :class="{ 'is-active': index === activeIndex }"
        @mouseenter="throttledIndicatorHover(index)"
        @click.stop="handleIndicatorClick(index)">
        <button class="v-carousel__button"><span v-if="hasLabel">{{ item.label }}</span></button>
      </li>
    </ul>
  </div>
</template>

<script>
import * as utils from '../js/utils/utils.js';
// import throttle from 'throttle-debounce/throttle';
// import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event';

export default {
    name: 'v-carousel',

    props: {
        initialIndex: {
            type: Number,
            default: 0
        },
        height: String,
        trigger: {
            type: String,
            default: 'hover'
        },
        autoplay: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 3000
        },
        indicatorPosition: String,
        indicator: {
            type: Boolean,
            default: true
        },
        arrow: {
            type: String,
            default: 'hover'
        },
        type: String
    },

    data () {
        return {
            items: [],
            activeIndex: -1,
            containerWidth: 0,
            timer: null,
            hover: false
        };
    },

    computed: {
        hasLabel () {
            return this.items.some(item => item.label.toString().length > 0);
        }
    },

    watch: {
        items (val) {
            if (val.length > 0) this.setActiveItem(this.initialIndex);
        },

        activeIndex (val, oldVal) {
            this.resetItemPosition(oldVal);
            this.$emit('change', val, oldVal);
        },

        autoplay (val) {
            val ? this.startTimer() : this.pauseTimer();
        }
    },

    methods: {
        handleMouseEnter () {
            this.hover = true;
            this.pauseTimer();
        },

        handleMouseLeave () {
            this.hover = false;
            this.startTimer();
        },

        itemInStage (item, index) {
            const length = this.items.length;
            if (index === length - 1 && item.inStage && this.items[0].active ||
                (item.inStage && this.items[index + 1] && this.items[index + 1].active)) {
                return 'left';
            } else if (index === 0 && item.inStage && this.items[length - 1].active ||
                (item.inStage && this.items[index - 1] && this.items[index - 1].active)) {
                return 'right';
            }
            return false;
        },

        handleButtonEnter (arrow) {
            this.items.forEach((item, index) => {
                if (arrow === this.itemInStage(item, index)) {
                    item.hover = true;
                }
            });
        },

        handleButtonLeave () {
            this.items.forEach(item => {
                item.hover = false;
            });
        },

        updateItems () {
            this.items = this.$children.filter(child => child.$options.name === 'v-carousel-item');
        },

        resetItemPosition (oldIndex) {
            this.items.forEach((item, index) => {
                item.translateItem(index, this.activeIndex, oldIndex);
            });
        },

        playSlides () {
            if (this.activeIndex < this.items.length - 1) {
                this.activeIndex++;
            } else {
                this.activeIndex = 0;
            }
        },

        pauseTimer () {
            clearInterval(this.timer);
        },

        startTimer () {
            if (this.interval <= 0 || !this.autoplay) return;
            this.timer = setInterval(this.playSlides, this.interval);
        },

        setActiveItem (index) {
            if (typeof index === 'string') {
                const filteredItems = this.items.filter(item => item.name === index);
                if (filteredItems.length > 0) {
                    index = this.items.indexOf(filteredItems[0]);
                }
            }
            index = Number(index);
            if (isNaN(index) || index !== Math.floor(index)) {
                process.env.NODE_ENV !== 'production' &&
                console.warn('[Element Warn][Carousel]index must be an integer.');
                return;
            }
            let length = this.items.length;
            if (index < 0) {
                this.activeIndex = length - 1;
            } else if (index >= length) {
                this.activeIndex = 0;
            } else {
                this.activeIndex = index;
            }
        },

        prev () {
            this.setActiveItem(this.activeIndex - 1);
        },

        next () {
            this.setActiveItem(this.activeIndex + 1);
        },

        handleIndicatorClick (index) {
            this.activeIndex = index;
        },

        handleIndicatorHover (index) {
            if (this.trigger === 'hover' && index !== this.activeIndex) {
                this.activeIndex = index;
            }
        }
    },

    created () {
        // this.throttledArrowClick = throttle(300, true, index => {
        //     this.setActiveItem(index);
        // });
        // this.throttledIndicatorHover = throttle(300, index => {
        //     this.handleIndicatorHover(index);
        // });
        this.throttledArrowClick = utils.throttle(index => {
            this.setActiveItem(index);
        }, 300);
        this.throttledIndicatorHover = utils.throttle(index => {
            this.handleIndicatorHover(index);
        }, 300);
    },

    mounted () {
        this.updateItems();
        this.$nextTick(() => {
            // addResizeListener(this.$el, this.resetItemPosition);
            this.resetItemPosition();
            if (this.initialIndex < this.items.length && this.initialIndex >= 0) {
                this.activeIndex = this.initialIndex;
            }
            this.startTimer();
        });
    },

    beforeDestroy () {
        // if (this.$el) removeResizeListener(this.$el, this.resetItemPosition);
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.v-carousel {
    overflow-x: hidden;
    position: relative
}

.v-carousel__container {
    position: relative;
    height: 300px
}

.v-carousel__arrow {
    border: none;
    outline: 0;
    padding: 0;
    margin: 0;
    height: 36px;
    width: 36px;
    cursor: pointer;
    -webkit-transition: .3s;
    transition: .3s;
    border-radius: 50%;
    background-color: rgba(31, 45, 61, .11);
    color: #fff;
    position: absolute;
    top: 50%;
    z-index: 10;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    text-align: center;
    font-size: 12px
}

.v-carousel__arrow--left {
    left: 16px
}

.v-carousel__arrow--right {
    right: 16px
}

.v-carousel__arrow:hover {
    background-color: rgba(31, 45, 61, .23)
}

.v-carousel__arrow i {
    cursor: pointer
}

.v-carousel__indicators {
    position: absolute;
    list-style: none;
    bottom: 0;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    margin: 0;
    padding: 0;
    z-index: 2
}

.v-carousel__indicators--outside {
    bottom: 26px;
    text-align: center;
    position: static;
    -webkit-transform: none;
    transform: none
}

.v-carousel__indicators--outside .v-carousel__indicator:hover button {
    opacity: .64
}

.v-carousel__indicators--outside button {
    background-color: #b4bccc;
    opacity: .24
}

.v-carousel__indicators--labels {
    left: 0;
    right: 0;
    -webkit-transform: none;
    transform: none;
    text-align: center
}

.v-carousel__indicators--labels .v-carousel__button {
    height: auto;
    width: auto;
    padding: 2px 18px;
    font-size: 12px
}

.v-carousel__indicators--labels .v-carousel__indicator {
    padding: 6px 4px
}

.v-carousel__indicator {
    display: inline-block;
    background-color: transparent;
    padding: 12px 4px;
    cursor: pointer
}

.v-carousel__indicator:hover button {
    opacity: .72
}

.v-carousel__indicator.is-active button {
    opacity: 1
}

.v-carousel__button {
    display: block;
    opacity: .48;
    width: 30px;
    height: 2px;
    background-color: #fff;
    border: none;
    outline: 0;
    padding: 0;
    margin: 0;
    cursor: pointer;
    -webkit-transition: .3s;
    transition: .3s
}

.carousel-arrow-left-enter,
.carousel-arrow-left-leave-active {
    -webkit-transform: translateY(-50%) translateX(-10px);
    transform: translateY(-50%) translateX(-10px);
    opacity: 0
}

.carousel-arrow-right-enter,
.carousel-arrow-right-leave-active {
    -webkit-transform: translateY(-50%) translateX(10px);
    transform: translateY(-50%) translateX(10px);
    opacity: 0
}
</style>
