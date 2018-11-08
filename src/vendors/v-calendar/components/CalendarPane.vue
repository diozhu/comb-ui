<template>
  <div class='c-pane'>
    <!--Header-->
    <div class='c-header-wrapper'>
      <!--Header vertical divider-->
      <div
        :style='verticalDividers.header'
        v-if='verticalDividers.header'>
      </div>
      <!--Header slot-->
      <slot name='header' :page='page_'>
        <div class='c-header' :style='headerStyle'>
          <!--Header prev button-->
          <div class='c-arrow-layout'>
            <slot name='header-left-button' :page='page_'>
              <!-- <span
                class='c-arrow vc-angle-left icon icon-arrow-l'
                :class='{ "c-disabled": !canMovePrevMonth }'
                :style='arrowStyle'
                @click='movePrevMonth'
                v-if="isShowPrevMonth">
              </span>
                <span v-if="isShowPrevMonth" class="left-month" @click='movePrevMonth'>{{page_.prevMonthComps.month}}月</span> -->
                <!-- <div
                class='c-arrow vc-angle-left icon icon-arrow-l'
                :class='{ "c-disabled": !canMovePrevMonth }'
                :style='arrowStyle'
                @click='movePrevMonth'
                v-if="isShowPrevMonth">
              </div> -->
                <div class="left-month" v-if="isShowPrevMonth && page_.prevMonthComps.month > 9" @click='movePrevMonth'><i class=" icon icon-arrow-l"></i>{{page_.prevMonthComps.month}}月</div>
                <div class="left-month" v-else-if="isShowPrevMonth" @click='movePrevMonth'><i class=" icon icon-arrow-l"></i>0{{page_.prevMonthComps.month}}月</div>
            </slot>
          </div>
          <!--Header title-->
          <transition-group
            tag='div'
            :class='["c-title", titleClass]'
            :name='titleTransition_'>
            <div
              class='c-title-1'
              v-for='p in pages'
              :key='p.key'
              v-if='p === page_'>
              <slot name='header-title' :page='p'>
                <div class='c-title-2'
                  :style='titleStyle'>
                  <div class='c-select-container'>
                    <span class='c-select-span'>
                      {{ p.yearLabel }}年
                    </span>
                    <!-- <select class='c-select' v-model='yearNumber'>
                      <option
                        v-for='year in yearList'
                        :key='year'
                        :value='year'
                        :disabled='yearIsDisabled(year)'>
                        {{ year }}
                      </option>
                    </select> -->
                  </div>
                  <div class='c-select-container'>
                    <span v-if="p.month>9"class='c-select-span'>
                      <!-- {{ p.monthLabel }} -->
                       {{ p.month }}月
                    </span>
                    <span v-else class='c-select-span'>
                      <!-- {{ p.monthLabel }} -->
                       0{{ p.month }}月
                    </span>
                    <!-- <select class='c-select' v-model='monthNumber'>
                      <option
                        v-for='(monthLabel, i) in monthLabels'
                        :key='monthLabel'
                        :value='i + 1'
                        :disabled='monthIsDisabled(i + 1)'>
                        {{ monthLabel }}
                      </option>
                    </select> -->
                  </div>
                </div>
              </slot>


              <!--<div class='header-desc'>-->
                  <!--<div class="header-desc__con">-->
                      <!--<p class="demo"></p>-->
                      <!--<p class="con">当日可约课程</p>-->
                  <!--</div>-->
                  <!--<div class="header-desc__con">-->
                      <!--<p class="demo full"></p>-->
                      <!--<p class="con">当日已约课程</p>-->
                  <!--</div>-->
              <!--</div>-->
            </div>
          </transition-group>
          <!--Header next button-->
          <div class='c-arrow-layout'>
            <slot name='header-right-button' :page='page_'>
                <!-- <span v-if="isShowNextMonth" class="right-month" @click='moveNextMonth'>{{page_.nextMonthComps.month}}月</span>
              <span
                class='c-arrow vc-angle-right icon icon-arrow-r'
                :class='{ "c-disabled": !canMoveNextMonth }'
                :style='arrowStyle'
                @click='moveNextMonth'
                v-if="isShowNextMonth">
              </span> -->
              <div v-if="isShowNextMonth && page_.nextMonthComps.month>9" class="right-month" @click='moveNextMonth'>{{page_.nextMonthComps.month}}月<i class=" icon icon-arrow-r"></i></div>
              <div v-else-if="isShowNextMonth" class="right-month " @click='moveNextMonth'>0{{page_.nextMonthComps.month}}月<i class=" icon icon-arrow-r"></i></div>
            </slot>
          </div>
        </div>
      </slot>
    </div>
    <!--Header horizontal divider-->
    <div
      class='c-horizontal-divider'
      :style='headerHorizontalDividerStyle_'
      v-if='headerHorizontalDividerStyle_'>
    </div>
    <!--Weekdays-->
    <div class='c-weekdays-wrapper'>
      <!--Weekday vertical divider-->
      <div
        :style='verticalDividers.weekdays'
        v-if='verticalDividers.weekdays'>
      </div>
      <div
        class='c-weekdays'
        :style='weekdayStyle_'>
        <!--Weekday labels-->
        <div
          v-for='weekday in weekdayLabels_'
          :key='weekday'
          class='c-weekday'>
          {{ weekday }}
        </div>
      </div>
    </div>
    <!--Weekday horizontal divider-->
    <div
      class='c-horizontal-divider'
      :style='weekdaysHorizontalDividerStyle_'
      v-if='weekdaysHorizontalDividerStyle_'>
    </div>
    <!--Weeks-->
    <div class='c-weeks-wrapper'>
      <!--Weeks vertical divider-->
      <div
        :style='verticalDividers.weeks'
        v-if='verticalDividers.weeks'>
      </div>
      <!--Week rows-->
      <div
        class='c-weeks'
        :style='weeksStyle_'>
        <transition-group
          tag='div'
          class='c-weeks-rel'
          :style='weekRowsStyle'
          :name='weeksTransition_'>
          <calendar-weeks
            class='c-weeks-abs'
            v-for='p in pages'
            :key='p.key'
            :month='p.month'
            :todayComps='todayComps'
            :year='p.year'
            :is-leap-year='p.isLeapYear'
            :days-in-month='p.daysInMonth'
            :first-weekday-in-month='p.firstWeekdayInMonth'
            :prev-month-comps='p.prevMonthComps'
            :next-month-comps='p.nextMonthComps'
            :first-day-of-week='firstDayOfWeek'
            :styles='styles'
            v-bind='$attrs'
            @touchstart='touchStart($event)'
            @touchmove='touchMove($event)'
            @touchend='touchEnd($event)'
            v-on='$listeners'
            v-if='p === page_'>
          </calendar-weeks>
        </transition-group>
      </div>
    </div>
      <div class='bottom-desc'>
          <div class="bottom-desc__con">
              <p class="demo"></p>
              <p class="con">可预约课程</p>
          </div>
          <div class="bottom-desc__con">
              <p class="demo full"></p>
              <p class="con">已预约课程</p>
          </div>
          <div class="bottom-desc__con">
              <p class="demo current"></p>
              <p class="con">当前选中</p>
          </div>
      </div>
  </div>
</template>

<script>
import Vue from 'vue';
import CalendarWeeks from './CalendarWeeks';
import {
    // todayComps,
    yearList,
    getIsLeapYear,
    getMonthComps,
    // getThisMonthComps,
    getPrevMonthComps,
    getNextMonthComps,
    pageIsBeforePage,
    pageIsAfterPage
} from '../utils/helpers';
import {
    monthLabels,
    weekdayLabels,
    titleTransition,
    weeksTransition,
    maxSwipeTimeMs,
    minHorizontalSwipeDistance,
    maxVerticalSwipeDistance
} from '../utils/defaults';

export default {
    components: {
        CalendarWeeks
    },
    props: {
        todayComps: {
            type: Object,
            default: () => {
                return {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    day: new Date().getDate()
                };
            }
        },
        position: { type: Number, default: 1 },
        page: { type: Object, default: () => this.todayComps },
        minPage: Object,
        maxPage: Object,
        monthLabels: { type: Array, default: () => monthLabels },
        weekdayLabels: { type: Array, default: () => weekdayLabels },
        firstDayOfWeek: { type: Number, default: 1 },
        styles: Object,
        titlePosition: String,
        titleTransition: { type: String, default: titleTransition },
        weeksTransition: { type: String, default: weeksTransition },
        // 达到最大最小月份是的提示语
        isBeforePageMsg: { type: String, default: '' },
        isAfterPageMsg: { type: String, default: '' }
    },
    data () {
        return {
            // todayComps,
            pages: [],
            page_: null,
            transitionDirection: '',
            monthNumber: 0,
            yearNumber: 0,
            touchState: {},
            yearList,
            // 是否显示不可切换的月份
            isShowPrevMonth: false,
            isShowNextMonth: false
        };
    },
    computed: {
        weekdayLabels_ () {
            const labels = [];
            for (let i = 1, d = this.firstDayOfWeek;i <= 7;i++, d += (d === 7) ? -6 : 1) {
                labels.push(this.weekdayLabels[d - 1]);
            }
            return labels;
        },
        titleClass () {
            return this.titlePosition ? `align-${this.titlePosition}` : '';
        },
        titleTransition_ () {
            return this.getTransitionName(this.titleTransition, this.transitionDirection);
        },
        weeksTransition_ () {
            return this.getTransitionName(this.weeksTransition, this.transitionDirection);
        },
        headerStyle () {
            return this.getDividerStyle(this.styles.header);
        },
        titleStyle () {
            return this.styles.headerTitle;
        },
        arrowStyle () {
            return this.styles.headerArrows;
        },
        verticalDividers () {
            return this.position === 2 ? {
                header: this.styles.headerVerticalDivider || this.styles.verticalDivider,
                weekdays: this.styles.weekdaysVerticalDivider || this.styles.verticalDivider,
                weeks: this.styles.weeksVerticalDivider || this.styles.verticalDivider
            } : {};
        },
        headerHorizontalDividerStyle_ () {
            return this.styles.headerHorizontalDivider;
        },
        weekdayStyle_ () {
            return this.getDividerStyle(this.styles.weekdays);
        },
        weekdaysHorizontalDividerStyle_ () {
            return this.styles.weekdaysHorizontalDivider;
        },
        weeksStyle_ () {
            return this.getDividerStyle(this.styles.weeks);
        },
        weekRowsStyle () {
            return {
                height: '192px'
            };
        },
        canMovePrevMonth () {
            return this.canMove(this.page_.prevMonthComps);
        },
        canMoveNextMonth () {
            return this.canMove(this.page_.nextMonthComps);
        }
    },
    watch: {
        page (val) {
            this.move(val);
        },
        /**
         * 监听月份变化，如果日历当前年月份大于等于最大年月份，则不现实下月及右箭头；
         * 如果当前年月份小于等于最小年月，则不现实上个月及箭头
         */
        page_ (val, oldVal) {
            // let nowYearMonth = val.year + '' + val.month;
            // let minYearMonth = this.minPage.year + '' + this.minPage.month;
            // let maxYearMonth = this.maxPage.year + '' + this.maxPage.month;
            let nowYearMonth = parseInt(val.year + '' + val.month);
            let minYearMonth = parseInt(this.minPage.year + '' + this.minPage.month);
            let maxYearMonth = parseInt(this.maxPage.year + '' + this.maxPage.month);
            if (nowYearMonth >= maxYearMonth) this.isShowNextMonth = false;
            else this.isShowNextMonth = true;
            if (nowYearMonth <= minYearMonth) this.isShowPrevMonth = false;
            else this.isShowPrevMonth = true;
            this.transitionDirection = this.getTransitionDirection(oldVal, val);
            // if (val.month < 10) this.monthNumber = '0' + val.month;
            // else this.monthNumber = val.month;
            this.monthNumber = val.month;
            this.yearNumber = val.year;
        },
        monthNumber (val) {
            if (val !== this.page_.month) {
                this.move({
                    month: val,
                    year: this.yearNumber
                });
            }
        },
        yearNumber (val) {
            if (val !== this.page_.year) {
                this.move({
                    month: this.monthNumber,
                    year: val
                });
            }
        }
    },
    created () {
        if (this.page) {
            this.page_ = this.loadPage(this.page);
        } else {
            this.page_ = this.loadPage(this.todayComps);
            this.$emit('update:page');
        }
        this.preloadPages();
    },
    methods: {
        getThisMonthComps () {
            getMonthComps(this.todayComps.month, this.todayComps.year);
        },
        monthIsDisabled (month) {
            if (this.minPage && this.yearNumber === this.minPage.year) return month < this.minPage.month;
            if (this.maxPage && this.yearNumber === this.maxPage.year) return month > this.maxPage.month;
            return false;
        },
        yearIsDisabled (year) {
            if (this.minPage && year < this.minPage.year) return true;
            if (this.maxPage && year > this.maxPage.year) return true;
            return false;
        },
        touchStart (e) {
            const t = e.changedTouches[0];
            this.touchState = {
                active: true,
                startX: t.screenX,
                startY: t.screenY,
                startTime: new Date().getTime(),
                isSwiping: false,
                isMonitoringSwipe: true
            };
        },
        touchMove (e) {
            if (!this.touchState.isMonitoringSwipe) {
                if (this.touchState.isSwiping) e.preventDefault();
                return;
            }
            const deltaTime = new Date().getTime() - this.touchState.startTime;
            if (deltaTime <= 5) {
                e.preventDefault();
                return;
            }
            const t = e.changedTouches[0];
            const deltaX = t.screenX - this.touchState.startX;
            const deltaY = t.screenY - this.touchState.startY;
            if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                this.touchState.isSwiping = true;
                e.preventDefault();
            }
            this.touchState.isMonitoringSwipe = false;
        },
        touchEnd (e) {
            const t = e.changedTouches[0];
            const deltaX = t.screenX - this.touchState.startX;
            const deltaY = t.screenY - this.touchState.startY;
            const deltaTime = new Date().getTime() - this.touchState.startTime;
            // console.log('------------> touchEnd: ', deltaTime, maxSwipeTimeMs, Math.abs(deltaX) >= minHorizontalSwipeDistance && Math.abs(deltaY) <= maxVerticalSwipeDistance);
            if (deltaTime < maxSwipeTimeMs) {
                if (Math.abs(deltaX) >= minHorizontalSwipeDistance && Math.abs(deltaY) <= maxVerticalSwipeDistance) {
                    // Swipe left
                    if (deltaX < 0) {
                        // Move to previous month
                        this.moveNextMonth();
                    } else {
                        // Move to next month
                        this.movePrevMonth();
                    }
                }
            }
        },
        canMove (pageInfo) {
            if (this.minPage && pageIsBeforePage(pageInfo, this.minPage)) return false;
            if (this.maxPage && pageIsAfterPage(pageInfo, this.maxPage)) return false;
            return true;
        },
        movePrevYear () {
            this.move({ month: this.page_.month, year: this.page_.year - 1 });
        },
        movePrevMonth () {
            this.move(this.page_.prevMonthComps);
        },
        moveThisMonth () {
            this.move(this.todayComps);
        },
        moveNextMonth () {
            this.move(this.page_.nextMonthComps);
        },
        moveNextYear () {
            this.move({ month: this.page_.month, year: this.page_.year + 1 });
        },
        move (pageInfo) {
            if (this.canMove(pageInfo)) {
                this.forceMove(pageInfo);
            // } else if (pageIsBeforePage(this.todayComps, this.minPage)) {
            } else if (pageIsBeforePage(pageInfo, this.minPage)) {
                if (this.isBeforePageMsg) this.$toast(this.isBeforePageMsg);
                this.forceMove(this.minPage);
            } else if (pageIsAfterPage(pageInfo, this.maxPage)) {
                if (this.isAfterPageMsg) this.$toast(this.isAfterPageMsg);
                this.forceMove(this.maxPage);
            }
        },
        forceMove (pageInfo) {
            // Exit if there is no page info or page info matches the current page
            if (!pageInfo || (pageInfo.month === this.page_.month && pageInfo.year === this.page_.year)) return;
            // Extract just the month and year info
            const monthYear = { month: pageInfo.month, year: pageInfo.year };
            // Set the active page
            this.page_ = this.loadPage(monthYear);
            // Flag that page was moved to/updated
            this.$emit('move', monthYear);
            this.$emit('update:page', monthYear);
            // Preload other pages
            this.preloadPages();
        },
        loadPage ({ month, year }, position = 0) {
            const key = `${year.toString()}.${month.toString()}`;
            let page;
//            let page = this.pages.find(p => (p.key === key));
            for (let i = 0;i < this.pages.length;i += 1) {
                if (this.pages[i].key === key) {
                    page = this.pages[i];
                }
            }
            if (!page) {
                const monthLabel = this.monthLabels[month - 1];
                const yearLabel = year.toString();
                const yearLabel2 = yearLabel.substring(2, 4);
                const headerLabel = `${monthLabel} ${yearLabel}`;
                const firstWeekdayInMonth = new Date(year, month - 1, 1).getDay() + 1;
                const currMonthComps = getMonthComps(month, year);
                const isLeapYear = getIsLeapYear(year);
                const daysInMonth = currMonthComps.days;
                const thisMonthComps = this.getThisMonthComps();
                const prevMonthComps = getPrevMonthComps(month, year);
                const nextMonthComps = getNextMonthComps(month, year);
                page = {
                    key,
                    month,
                    year,
                    monthLabel,
                    yearLabel,
                    yearLabel_2: yearLabel2,
                    headerLabel,
                    isLeapYear,
                    daysInMonth,
                    firstWeekdayInMonth,
                    thisMonthComps,
                    prevMonthComps,
                    nextMonthComps,
                    canMove: pg => this.canMove(pg),
                    move: pg => this.move(pg),
                    moveThisMonth: () => this.moveThisMonth(),
                    movePrevMonth: () => this.move(prevMonthComps),
                    moveNextMonth: () => this.move(nextMonthComps)
                };
                this.pages.push(page);
            }
            page.position = position;
            page.loaded = true;
            return page;
        },
        preloadPages () {
            // Load the next and previous pages
            Vue.nextTick(() => {
                this.loadPage(this.page_.prevMonthComps, -1);
                this.loadPage(this.page_.nextMonthComps, 1);
                this.pages = this.pages.filter(p => p.loaded);
                this.pages.forEach((p) => {
                    p.loaded = false;
                });
            });
        },
        getTransitionDirection (fromPage, toPage) {
            if (!fromPage || !toPage) return '';
            if (fromPage.year !== toPage.year) return fromPage.year < toPage.year ? 'next' : 'prev';
            if (fromPage.month !== toPage.month) return fromPage.month < toPage.month ? 'next' : 'prev';
            return '';
        },
        getTransitionName (type, direction) {
            if (type === 'slide-h') {
                return `title-${direction === 'next' ? 'slide-left' : 'slide-right'}`;
            } else if (type === 'slide-v') {
                return `title-${direction === 'next' ? 'slide-up' : 'slide-down'}`;
            }
            return `title-${type}`;
        },
        getDividerStyle (defaultStyle) {
            if (this.position === 1) return { ...defaultStyle, borderRight: '0' };
            if (this.position === 2) return { ...defaultStyle, borderLeft: '0' };
            return defaultStyle;
        }
    }
};
</script>

<style lang='sass' scoped>

@import '../styles/vars'

=box($justify: center, $align: center)
  display: flex
  justify-content: $justify
  align-items: $align
  margin: 0
  padding: 0

.c-pane
  flex-grow: 1
  flex-shrink: 1
  // min-width: $paneMinWidth
  // width: $paneWidth
  display: flex
  flex-direction: column
  align-items: stretch
  overflow: hidden

.c-header-wrapper
  display: flex

.c-header
  flex: 1
  display: flex
  align-items: stretch
  user-select: none
  padding: $headerPadding

  .c-arrow-layout
    +box()
    .c-arrow
      +box()
      font-size: $arrowFontSize
    //   width: $arrowWidth
    //   height: $arrowHeight
    
      transition: $arrowTransition
      cursor: pointer
      user-select: none
      &:hover
        opacity: 0.5

  .c-title
    +box()
    flex-grow: 1
    position: relative
    .c-title-1
      position: absolute
      left: 0
      top: 0
      width: 100%
      height: 100%
      display: flex
      align-items: center
      .c-title-2
        +box()
        font-weight: $titleFontWeight
        font-size: $titleFontSize
        user-select: none
        margin: $titleMargin
        text-align: center
        width: 100%

        .c-select-container
          position: relative
          transition: $titleTransition
          &:hover
            opacity: 0.5
          &:not(:first-child)
            margin-left: 5px
          .c-select-span
            height: 100%
          .c-select
            position: absolute
            top: 0
            left: 0
            width: 100%
            height: 100%
            border: none
            font-size: 1rem
            opacity: 0
            cursor: pointer
    &.align-left
      order: -1
      .c-title-2
        justify-content: flex-start
    &.align-right
      order: 1
      .c-title-2
        justify-content: flex-end

  .c-arrow.c-disabled
    cursor: not-allowed
    pointer-events: none
    opacity: 0.2

.c-horizontal-divider
  align-self: center

.c-weekdays-wrapper
  display: flex

.c-weekdays
  flex-grow: 1
  display: flex
  padding: $weekdayPadding
  color: $weekdayColor
  font-size: $weekdayFontSize
  font-weight: $weekdayFontWeight

.c-weekday
  +box()
  flex-grow: 1
  cursor: default

.c-weeks-wrapper
  display: flex

.c-weeks
  flex-grow: 1
  padding: $weeksPadding

.c-weeks-rel
  position: relative
  .c-weeks-abs
    position: absolute
    width: 100%
    display: flex
    flex-direction: column

.title-slide-left-enter-active,
.title-slide-left-leave-active,
.title-slide-right-enter-active,
.title-slide-right-leave-active,
.title-slide-up-enter-active,
.title-slide-up-leave-active,
.title-slide-down-enter-active,
.title-slide-down-leave-active,
.title-fade-enter-active,
.title-fade-leave-active
  transition: $titleTransition

.title-none-enter-active,
.title-none-leave-active
  transition-duration: 0s

.title-slide-left-enter,
.title-slide-right-leave-to
  opacity: 0
  transform: translateX($titleTranslateX)

.title-slide-left-leave-to,
.title-slide-right-enter
  opacity: 0
  transform: translateX(-$titleTranslateX)

.title-slide-up-enter,
.title-slide-down-leave-to
  opacity: 0
  transform: translateY($weeksTranslateX)

.title-slide-down-enter,
.title-slide-up-leave-to
  opacity: 0
  transform: translateY(-$weeksTranslateX)

.weeks-slide-left-enter-active,
.weeks-slide-left-leave-active,
.weeks-slide-right-enter-active,
.weeks-slide-right-leave-active,
.weeks-slide-up-enter-active,
.weeks-slide-up-leave-active,
.weeks-slide-down-enter-active,
.weeks-slide-down-leave-active,
.weeks-fade-enter-active,
.weeks-fade-leave-active
  transition: $weeksTransition

.weeks-none-enter-active,
.weeks-none-leave-active
  transition-duration: 0s

.weeks-slide-left-enter,
.weeks-slide-right-leave-to
  opacity: 0
  transform: translateX($weeksTranslateX)

.weeks-slide-left-leave-to,
.weeks-slide-right-enter
  opacity: 0
  transform: translateX(-$weeksTranslateX)

.weeks-slide-up-enter,
.weeks-slide-down-leave-to
  opacity: 0
  transform: translateY($weeksTranslateX)

.weeks-slide-down-enter,
.weeks-slide-up-leave-to
  opacity: 0
  transform: translateY(-$weeksTranslateX)

.weeks-fade-enter,
.weeks-fade-leave-to,
.weeks-none-enter,
.weeks-none-leave-to,
.title-fade-enter,
.title-fade-leave-to,
.title-none-enter,
.title-none-leave-to,
  opacity: 0

</style>
