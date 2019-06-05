<template>
    <div class="v-calendar" :class="classes">
        <div class="v-calendar__panel">
            <!--日历头-->
            <div class="header-wrapper">
                <div class="header">
                    <div class="prev-month">
                        <div v-if="isShowPrevMonth" class="prev-month__con" @click="movePrevMonth">
                            <i class="icon icon-arrow-l"></i>
                            <p>{{enableMonthLabel ? '上个' : page.prevMonthComps.month}}月</p>
                        </div>
                    </div>
                    <div class="title" @click="moveCurMonth">
                        <p class="year">{{page.year}}年{{page.month}}月</p>
                    </div>
                    <div class="next-month">
                        <div v-if="isShowNextMonth" class="next-month__con" @click="moveNextMonth">
                            <p>{{enableMonthLabel ? '下个' : page.nextMonthComps.month}}月</p>
                            <i class="icon icon-arrow-r"></i>
                        </div>
                    </div>
                </div>
            </div>
            <!--星期标签-->
            <div class="weekdays-wrapper">
                <!--<p v-for="(item, index) in weekLabels" class="weekday" :class="{sun: index == 0, sat: index == 6}">{{item}}</p>-->
                <p v-for="(item, index) in weekLabels" class="weekday">{{item}}</p>
            </div>
            <!--日标签-->
            <div class="weeks-wrapper">
                <div v-for="(week, index) in weeks" class="week" :key="index">
                    <!--日历每天的布局-->
                    <!--<div class="day-wrapper">-->
                    <transition-group class="day-wrapper" tag="div" name="slide">
                        <div v-for="(day, idx) in week.week" :key="index + '-' + idx"
                             class="day-layer"
                             :class="[day.classes, {pre: day.isPrevMonth, 'shadow cur': day.isToday, nxt: day.isNextMonth}]"
                             @click="chooseDate(day, index, idx)">
                            <div class="day-header">
                                <!--<i v-if="day.iconClass" class="day icon" :class="day.iconClass"></i>-->
                                <!--如果有icon样式 且 不是当前选中，显示icon样式，否则就用其他样式覆盖，不支持多重样式并存~-->
                                <i v-if="day.iconClass && day.dateFormated != currentValue" class="day icon" :class="day.iconClass"></i>
                                <p v-else class="day">{{day.day}}</p>
                                <slot name="day-header" :data="day"></slot>
                            </div>
                            <div v-if="day.datas && day.datas.length" class="day-content">
                                <slot name="day-content" :data="day"></slot>
                            </div>
                        </div>
                    <!--</div>-->
                    </transition-group>
                    <!--日历中间的分割内容-->
                    <!--<v-collaple-transition v-if="week.current && week.current.length">-->
                    <v-collaple-transition>
                        <div v-show="week.current && week.current.length" class="week-content">
                            <slot name="week-content" :data="week.current"></slot>
                        </div>
                    </v-collaple-transition>
                </div>
            </div>
            <!--说明插槽-->
            <slot name="desc"></slot>
        </div>
    </div>
</template>
<script>
    import * as utils from '../js/utils/utils'; //eslint-disable-line
    import vCollapleTransition from './v-collaple-transition';

    /**
     *              -- Author by Dio Zhu. on 2018.4.10
     */
    const DateInfo = class DateInfo {
        constructor (date, order = 0) {
            if (!date) return;
            const hasStart = !!date.start;
            const hasEnd = !!date.end;
            if (hasStart || hasEnd) {
                // Normalize start and end dates
                let start = new Date(date.start);
                let end = new Date(date.end);
                if (start > end) {
                    const temp = start;
                    start = end;
                    end = temp;
                }
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                // Assign start and end dates
                this.type = 'range';
                this.isRange = true;
                this.start = start;
                this.startTime = start.getTime();
                this.end = end;
                this.endTime = end.getTime();
            } else {
                this.type = 'date';
                this.isDate = true;
                this.date = new Date(date);
                this.date.setHours(0, 0, 0, 0);
                this.dateTime = this.date.getTime();
            }
            this.order = order;
            this.intersects = this.intersects.bind(this);
        }

        toRange () {
            if (this.isDate) {
                return {
                    start: new Date(this.dateTime),
                    startTime: this.dateTime,
                    end: new Date(this.dateTime),
                    endTime: this.dateTime
                };
            }
            return {
                start: new Date(this.startTime),
                startTime: this.startTime,
                end: new Date(this.endTime),
                endTime: this.endTime
            };
        }

        containsDate (date) {
            // console.warn(this.isDate, utils.formatTime(this.dateTime, 'yyyy-MM-dd'), utils.formatTime(date, 'yyyy-MM-dd'), this.dateTime, date.getTime());
            if (this.isDate) return this.dateTime === date.getTime();
            if (this.start && date < this.start) return false;
            if (this.end && date > this.end) return false;
            return true;
        }

        compare (other) {
            if (this.order !== other.order) return this.order - other.order;
            if (this.type !== other.type) return this.isDate ? 1 : -1;
            if (this.isDate) return 0;
            const diff = this.start - other.start;
            return diff !== 0 ? diff : this.end - other.end;
        }

        intersects (other) {
            if (this.isDate) {
                return other.isDate ? this.dateTime === other.dateTime : other.containsDate(this.date);
            }
            if (other.isDate) return this.containsDate(other.date);
            return this.containsDate(other.start) || this.containsDate(other.end);
        }
    };

    export default {
        name: 'v-calendar',
        components: { vCollapleTransition },

        props: {
            value: {        // 当前组件选择日期，默认为当前月，因为考虑接口传递可按月、可按天，所以这里没有使用Date类型
                type: String,
                default: ''
            },
            attributes: {   // 在日期标签上的样式描述
                type: Array,
                default: () => []
            },
            datas: {        // 日期内的数据
                type: Array,
                default: () => []
            },
            minDt: Date,    // 最小可选日期
            maxDt: Date,    // 最大可选日期
            minPage: Object,
            maxPage: Object,
            enableMonthLabel: Boolean,  // 是否用'上个月'、'下个月'替换具体月份
            today: {
                type: Date,
                default: () => new Date()
            },
            // selectedDt: {
            //     type: Date,
            //     default: null
            // },
            firstDay: {         // 日历起始是从星期几，默认：7（周日）
                type: Number,
                default: 7
            }
            // selectedDateStr: {
            //     type: String,
            //     default: '',
            //     twoWay: true
            // }
        },

        data () {
            return {
                monthLabels: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],    // 日历月份
                weekLabels: ['日', '一', '二', '三', '四', '五', '六'],    // 日历星期的标签
                page: {
                    prevMonthComps: {
                        days: 31
                    },
                    firstWeekdayInMonth: 0
                },   // 当前日历页的对象
                weeks: [],
                currentValue: this.value,
                currentAttributes: this.attributes,
                currentDatas: this.datas,
                selectedDt: null,
                todayComps: null,
                classes: 'normal', // 当前组件样式，如果有attributes：normal，如果有datas：grid
                isShowPrevMonth: false, // 是否显示不可切换的月份
                isShowNextMonth: false,
                animation: 'fade'     // 转场动画
            };
        },

        computed: {
        },

        watch: {
            value (val) {
                // console.log(`v-calendar.${this._uid}.watch.value: `, val);
                this.currentValue = val;
                if (val && val.length < 8) {
                    this.selectedDt = null;
                } else {
                    this.selectedDt = new Date(val);
                }
            },
            currentValue (val) {
                // console.log(`v-calendar.${this._uid}.watch.currentValue: `, val);
                // this.weeksDataInit(); // 填充数据~
                this.$emit('input', val);
            },
            attributes (val) {
                // console.log(`v-calendar.${this._uid}.watch.attributes: `, val);
                this.currentAttributes = val;
                // this.attributesInit(val);
                this.weeksDataInit({animation: false}); // 填充数据~
            },
            datas (val) {
                // console.log(`v-calendar.${this._uid}.watch.datas: `, val);
                this.currentDatas = val;
                this.classes = 'grid';
                // this.weeksInit();
                this.weeksDataInit({animation: false}); // 填充数据~
                // this.attributesInit(this.attributes);
            },
            page (val) { // page变化时，重新初始化日历
                // console.log(`v-calendar.${this._uid}.watch.page: `, val);
                // 重新计算是否显示上下月
                if (!this.minDt || (this.minDt && val.year >= this.minDt.getFullYear() && val.month > this.minDt.getMonth() + 1)) this.isShowPrevMonth = true;
                else this.isShowPrevMonth = false;
                if (!this.maxDt || (this.maxDt && val.year <= this.maxDt.getFullYear() && val.month <= this.maxDt.getMonth())) this.isShowNextMonth = true;
                else this.isShowNextMonth = false;
                this.currentValue = val.year + '-' + (val.month > 9 ? val.month : '0' + val.month);
                // this.weeksInit();
                // this.attributesInit(this.attributes);
                this.weeksInit(); // 重新初始化日历
                // this.weeksDataInit(); // 填充数据~
            },
            // currentAttributes (val) {
            //     console.log(`v-calendar.watch.currentAttributes: `, val);
            //     this.attributesInit();
            // },
            selectedDt (val) { // 点击的时候抛出日期，外部变更时，重新计算，用于选择后展示每天的数据。 Author by Dio Zhu. on 2018.4.17
                // console.log(`v-calendar.watch.selectedDt: `, val);
                this.weeksDataInit({animation: false}); // 填充数据~
                this.$emit('selectedDtChanged', val);
            }
        },

        created () {
            // console.log(`v-calendar.${this._uid}.created: `, this.value);
            if (!this.currentValue) this.currentValue = utils.formatTime(this.today, 'yyyy-MM');
            this.init({year: this.today.getFullYear(), month: this.today.getMonth() + 1});
        },

        methods: {
            init ({year, month}) { // 初始化
                // console.log('v-calendar.init...', year, month);
                // if (this.selectedDateStr) this.selectedDt = new Date(this.selectedDateStr);
                // this.attributesInit(this.attributes);
                // this.firstDay -= 1;
                if (this.datas && this.datas.length) this.classes = 'grid';
                else this.classes = 'normal';
                let tCh = (n) => n - (this.firstDay - 1) <= 0 ? n - (this.firstDay - 1) + 7 : n - (this.firstDay - 1);
                let currMonthComps = utils.getMonthComps(month, year),
                    page = {
                        isLeapYear: utils.getIsLeapYear(year),
                        prevMonthComps: utils.getPrevMonthComps(month, year),
                        nextMonthComps: utils.getNextMonthComps(month, year),
                        firstWeekdayInMonth: tCh(new Date(year, month - 1, 1).getDay()), // 当月第一天是周几
                        // firstWeekdayInMonth: this.firstDay - 1 + 7, // 当月第一天是周几
                        daysInMonth: currMonthComps.days,
                        month,
                        year
                    };
                this.$set(this, 'page', page);
                this.$set(this, 'todayComps', {
                    year: this.today.getFullYear(),
                    month: this.today.getMonth() + 1,
                    day: this.today.getDate()
                });
                this.resetWeekLabels(); // 重设周显示模式
            },
            resetWeekLabels () { // 根据指定的firstDay，计算周标签显示
                // if (this.firstDay === 0) this.weekLabels = ['一', '二', '三', '四', '五', '六', '日'];
                // else this.weekLabels = ['日', '一', '二', '三', '四', '五', '六'];
                let arr = ['一', '二', '三', '四', '五', '六', '日'];
                if (this.firstDay === 1) this.weekLabels = arr;
                else this.weekLabels = arr.slice(this.firstDay - 1).concat(arr.slice(0, this.firstDay - 1));
            },
            movePrevMonth () { // 上月
                // console.log(`v-calendar.movePrevMonth: `);
                this.animation = 'fade-left';
                this.move(this.page.prevMonthComps);
            },
            moveCurMonth () { // 当月
                // console.log(`v-calendar.moveCurMonth: `);
                // this.move(this.todayComps);
            },
            moveNextMonth () { // 下月
                // console.log(`v-calendar.moveNextMonth: `);
                this.animation = 'fade-right';
                this.move(this.page.nextMonthComps);
            },
            chooseDate (day, index, idx) { // 点击日期
                let selectedDt = new Date(day.year, day.month - 1, day.day);
                // console.log(`v-calendar.chooseDate: `, index, idx, day, selectedDt, this.selectedDt);
                // this.$set(this.weeks[index].week[idx], 'classes', ' selected');
                // this.selectedDate = selectedDt;
                // if (selectedDt === this.selectedDt) selectedDt = null;
                // if (utils.isSameDay(selectedDt, this.selectedDt)) {
                if (utils.isSameDay(selectedDt, this.selectedDt)) {
                    this.selectedDt = selectedDt = null;
                    this.currentValue = this.page.year + '-' + (this.page.month > 9 ? this.page.month : '0' + this.page.month);
                } else {
                    this.selectedDt = selectedDt;
                    this.currentValue = utils.formatTime(selectedDt, 'yyyy-MM-dd');
                }
                this.selectedDtStr = selectedDt ? utils.formatTime(selectedDt, 'yyyy-MM-dd') : '';
                // this.$apply();
                // console.log(`v-calendar.chooseDate: `, day, index, idx, this.selectedDt, this.selectedDtStr);
                // this.weeksInit({animation: false});
                // this.$emit('chooseDate', this.selectedDt);
            },
            weeksInit ({animation = true} = {}) { // 按照page进行单月渲染
                this.$set(this, 'weeks', []); // 还原
                let day = (this.page.prevMonthComps.days - this.page.firstWeekdayInMonth) + 2, // 起始日期
                    month = this.page.prevMonthComps.month,
                    year = this.page.prevMonthComps.year,
                    previousMonth = true,
                    thisMonth = false,
                    nextMonth = false,
                    weeks = [];
                // console.log(`v-calendar.${this._uid}.weeksInit ==>> animation: `, animation, ' --> ', day, this.page.prevMonthComps.days, this.page.firstWeekdayInMonth);
                // for (let w = 1, len = 6;w <= len && !nextMonth;w++) {
                for (let w = 1, len = 6;w <= len;w++) {
                    let week = [], current = null;
                    for (let i = 1, d = 1;i <= 7;i++, d += (d === 7) ? -6 : 1) {
                        if (previousMonth && d >= this.page.firstWeekdayInMonth) {
                            day = 1;
                            month = this.page.month;
                            year = this.page.year;
                            previousMonth = false;
                            thisMonth = true;
                        }
                        let dayInfo = {
                            dateFormated: utils.formatTime(year + '-' + month + '-' + day, 'yyyy-MM-dd'),
                            day: day,
                            month: month,
                            year: year,
                            isToday: day === this.todayComps.day && month === this.todayComps.month && year === this.todayComps.year,
                            isPrevMonth: previousMonth,
                            isNextMonth: nextMonth,
                            // attributes: this._getDayAttributes(new Date(year, month - 1, day), animation),
                            // classes: '', // 剥离，先初始化日历，再初始化数据
                            // datas: [] // 剥离，先初始化日历，再初始化数据
                            classes: this.getDayClasses(new Date(year, month - 1, day), animation),
                            datas: this.getDayDatas(new Date(year, month - 1, day), animation)
                        };
                        // // if (!utils.isSameDay(new Date(year, month - 1, day), this.selectedDate)) {
                        if (!utils.isSameDay(new Date(year, month - 1, day), this.selectedDt)) {
                            dayInfo.iconClass = dayInfo.classes.indexOf('check') >= 0 ? dayInfo.classes.replace('check', 'icon-check') : ''; // 如果是'check'样式，直接用icon
                        } else {
                            current = dayInfo.datas;
                        }
                        // // 补充是否有数据的样式
                        // if (dayInfo.datas && dayInfo.datas.length) dayInfo.classes += ' has-data';
                        // if (utils.isSameDay(new Date(year, month - 1, day), this.selectedDt)) current = dayInfo.datas;
                        // // 判断day是否小10 如果小于10 label前面加0
                        if (dayInfo.day < 10) dayInfo.day = '0' + day;
                        // console.log(`v-calendar._weeksInit.dayInfo: `, this.selectedDt, utils.isSameDay(new Date(year, month - 1, day), this.selectedDt));
                        week.push(dayInfo);

                        if (thisMonth && day >= this.page.daysInMonth) {
                            thisMonth = false;
                            nextMonth = true;
                            day = 1;
                            month = this.page.nextMonthComps.month;
                            year = this.page.nextMonthComps.year;
                        } else {
                            day += 1;
                        }
                    }
                    weeks.push({week, current});
                }
                this.$set(this, 'weeks', weeks);
                // this.$apply();
                // console.log(`v-calendar._weeksInit.weeks: `, this.page, JSON.stringify(this.weeks));
                if (animation) this.clearAnimation();
            },

            weeksDataInit ({animation = true} = {}) { // 绘制日历数据
                if (!this.weeks || !this.weeks.length) return;
                // console.log(`v-calendar.${this._uid}.weeksDataInit: animation: `, animation);
                this.weeks.forEach(w => {
                    w.current = null;
                    w.week.forEach(d => {
                        // 如果有样式
                        // if (this.attributes && this.attributes.length) d.classes = this.getDayClasses(new Date(d.year, d.month - 1, d.day), true);
                        d.classes = this.getDayClasses(new Date(d.year, d.month - 1, d.day), animation);
                        // 如果有数据
                        if (this.datas && this.datas.length) d.datas = this.getDayDatas(new Date(d.year, d.month - 1, d.day), animation);
                        if (!utils.isSameDay(new Date(d.year, d.month - 1, d.day), this.selectedDt)) {
                            d.iconClass = d.classes.indexOf('check') >= 0 ? d.classes.replace('check', 'icon-check') : ''; // 如果是'check'样式，直接用icon
                        } else {
                            w.current = d.datas;
                            // if (d.classes.indexOf('selected') < 0) d.classes += ' selected'; // 当前被选中，标记selected
                        }
                        // 补充是否有数据的样式
                        // if (d.datas && d.datas.length && d.classes.indexOf('has-data') < 0) d.classes += ' has-data';
                    });
                });
            },

            // attributesInit (arr) { // 整理attributes的格式
            //     console.log(`v-calendar._attributesInit: `, arr, this.currentAttributes, arr === this.currentAttributes);
            //     if (!arr || !arr.length) {
            //         this.weeksInit();
            //         return;
            //     }
            //     // if (arr === this.currentAttributes) return;
            //     let attrs = [];
            //     arr.map((a, i) => {
            //         // console.log(`v-calendar._attributesInit: `, a, i);
            //         let attribute = {
            //             key: a.key || i.toString(),
            //             order: a.order || 0,
            //             dates: a.dates.map(
            //                 d => (d instanceof DateInfo ? d : new DateInfo(d, a.order))
            //             ),
            //             classes: a.classes,
            //             isIcon: a.isIcon
            //         };
            //         attrs.push(attribute);
            //     });
            //     this.$set(this, 'currentAttributes', attrs);
            //     // this.$apply();
            //     this.weeksDataInit(); // 绘制日历数据~
            // },
            move (p) {
                // console.log(`v-calendar._move: `, p);
                // this.selectedDt = null; // 切换月份，移除当前选择的日期
                // this.selectedDtStr = '';
                // this.$apply();
                this.init({year: p.year, month: p.month});
                this.$emit('handleChange', {year: p.year, month: p.month});
            },
            // getDayAttributes (date) {
            //     // console.log(`v-calendar._getDayAttributes: `, utils.formatTime(date, 'yyyy-MM-dd'), this.currentAttributes, this.currentAttributes.length);
            //     if (!this.currentAttributes || !this.currentAttributes.length) return '';
            //     const attributes = [];
            //     this.currentAttributes.forEach((attr) => {
            //         attr.dates.forEach((dateInfo) => {
            //             // console.log(`v-calendar._weeksInit.weeks: `, utils.formatTime(date, 'yyyy-MM-dd'), dateInfo, date, dateInfo.containsDate(date));
            //             if (!dateInfo.containsDate(date)) return;
            //             const attribute = {
            //                 ...attr,
            //                 date: dateInfo.date,
            //                 dateInfo
            //             };
            //             delete attribute.dates;
            //             attributes.push(attribute);
            //         });
            //     });
            //     attributes.sort((a, b) => a.dateInfo.compare(b.dateInfo));
            //     return attributes;
            // },
            getDayClasses (date, animation) { // 获取某一天的样式
                // console.log(`v-calendar.getDayClasses: `, utils.formatTime(date, 'yyyy-MM-dd'), this.attributes, this.currentAttributes, this.currentAttributes.length);
                // let classes = animation ? ' fade' : '';
                let classes = animation ? ' ' + this.animation : '';
                // classes = (date < this.today) ? classes + ' past' : classes; // 已过日期标识
                if (date < this.today && !utils.isSameDay(date, this.today)) classes += ' past'; // 已过日期标识
                if (this.currentAttributes && this.currentAttributes.length) {
                    this.currentAttributes.forEach((attr, idx) => {
                        // 扩充数据格式
                        attr.key = attr.key || idx.toString();
                        attr.order = attr.order || idx;
                        attr.classes = attr.classes || '';
                        attr.isIcon = attr.isIcon || false;
                        attr.dates.forEach((dateInfo, i) => {
                            if (!(dateInfo instanceof DateInfo)) {
                                dateInfo = new DateInfo(dateInfo, attr.order);
                                this.$set(this.currentAttributes[idx]['dates'], i, dateInfo);
                            }
                            // console.log(`v-calendar._getDayClasses: `, dateInfo, utils.formatTime(date, 'yyyy-MM-dd'), attr);
                            if (!dateInfo.containsDate(date)) return;
                            if (!/ shadow/.test(classes)) classes += ' shadow';
                            classes += ' ' + attr.classes;
                        });
                        // if (attr.isIcon && classes.indexOf('check') >= 0) classes = classes.replace('check', 'icon-check'); // 如果是'check'样式，直接用icon
                        // console.log(`v-calendar._getDayClasses: `, utils.formatTime(date, 'yyyy-MM-dd'), attr, classes);
                    });
                }
                if (this.datas && this.datas.length) {
                    this.datas.forEach(d => {
                        if (d.datas && d.datas.length && utils.isSameDay(date, d.date) && classes.indexOf('has-data') < 0) classes += ' has-data';
                    });
                }
                // console.log(`v-calendar._getDayClasses: `, utils.formatTime(date, 'yyyy-MM-dd'), utils.formatTime(this.selectedDate, 'yyyy-MM-dd'));
                if (utils.isSameDay(date, this.selectedDt)) classes += ' selected'; // 当前被选中，标记selected
                return classes;
            },
            getDayDatas (date, animation) { // 获取某一天的数据
                // console.log(`v-calendar.getDayDatas: `, utils.formatTime(date, 'yyyy-MM-dd'), this.datas, this.currentDatas);
                let datas = [];
                // if (!this.currentDatas || !this.currentDatas.length) return datas;
                if (!this.datas || !this.datas.length) return datas;
                // this.currentDatas.forEach((dat) => {
                this.datas.forEach((dat) => {
                    // console.log(`v-calendar.getDayDatas: ---==========>>> `, dat);
                    if (utils.isSameDay(date, dat.date)) {
                        // console.log(`v-calendar.getDayDatas: --->>> `, utils.formatTime(date, 'yyyy-MM-dd'), dat.date);
                        // datas.push(dat.datas);
                        datas = dat.datas;
                    }
                });
                // console.log(`v-calendar._getDayClasses: `, utils.formatTime(date, 'yyyy-MM-dd'), utils.formatTime(this.selectedDate, 'yyyy-MM-dd'));
                // // if (utils.isSameDay(date, this.selectedDate)) classes += ' shadow selected'; // 当前被选中，标记selected
                // if (utils.isSameDay(date, this.selectedDt)) classes += ' shadow selected'; // 当前被选中，标记selected
                return datas;
            },
            clearAnimation () { // 延时清除动画class
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this.weeks.forEach(w => {
                            w.week.forEach(d => {
                                // d.classes = d.classes.replace(/ fade/gm, '');
                                d.classes = d.classes.replace(/ fade-left/gm, '').replace(/ fade-right/gm, '').replace(/ fade/gm, '');
                            });
                        });
                        // this.$apply();
                        resolve();
                    }, 500);
                });
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";
    $dayContentTransitionTime: .38s ease-in-out;
    .v-calendar {
        $fadeTransition: opacity .2s ease-in-out;
        $slideRightEnterAnimation: slideRightEnter .18s ease-in-out;
        $slideLeftEnterAnimation: slideLeftEnter .18s ease-in-out;
        $scaleEnterAnimation: scaleEnter .18s ease-in-out;

        @keyframes slideRightEnter {
            /*0% { transform: scaleX(0); }*/
            /*60% { transform: scaleX(1.08); }*/
            /*100% { transform: scaleX(1); }*/
            0% { transform: translateX(.2rem); }
            60% { transform: translateX(.1rem); }
            100% { transform: translateX(0); }
        }

        @keyframes slideLeftEnter {
            /*0% { transform: scaleX(0); }*/
            /*60% { transform: scaleX(.90); }*/
            /*100% { transform: scaleX(1); }*/
            0% { transform: translateX(-.2rem); }
            60% { transform: translateX(-.1rem); }
            100% { transform: translateX(0); }
        }
        @keyframes scaleEnter {
            0% { transform: scaleX(0.7) scaleY(0.7); opacity: 0.3; }
            90% { transform: scaleX(1.1) scaleY(1.1); }
            95% { transform: scaleX(0.95) scaleY(0.95); }
            100% { transform: scaleX(1) scaleY(1); opacity: 1; }
        }
        @keyframes fadeIn {
            0% { opacity: 0; transform: scaleX(0.7) scaleY(0.7); }
            90% { transform: scaleX(1.1) scaleY(1.1); }
            95% { transform: scaleX(0.95) scaleY(0.95); }
            100% { opacity: 1; transform: scaleX(1) scaleY(1); }
        }

        .slide-enter-active {
        }

        .fade {
            /*animation: fadeIn 1s 1s normal;*/
            /*animation: fadeIn .18s ease;*/
            animation: $fadeTransition;
        }
        .fade-left {
            animation: $slideLeftEnterAnimation;
        }
        .fade-right {
            animation: $slideRightEnterAnimation;
        }

    }

    .v-calendar { // 日历
        /*padding: pxTorem(44) 0;*/
        display: flex;
        align-items: center;
        justify-content: center;

        .v-calendar__panel {
            /*border: red 1px solid;*/
            /*width: pxTorem(660);*/
            width: 100%;
            /*padding: pxTorem(20) pxTorem(40) pxTorem(0) pxTorem(40);*/
            padding: 0 pxTorem(10) pxTorem(0) pxTorem(10);
            flex: 0 0 auto;
            background: #FFF;
            /*box-shadow: 0 pxTorem(10) pxTorem(40) 0 rgba(0, 0 , 0, 0.2);*/
            /*border-radius: pxTorem(20);*/
        }

        .header-wrapper { // 表头
            /*border-bottom: #bebebe 1px solid;*/
            margin: 0 pxTorem(10);

            .header {
                display: flex;
                align-items: center;
                justify-content: center;

                .prev-month, .next-month {
                    min-width: pxTorem(60);
                    flex: 0 0 auto;
                }
                .prev-month__con, .next-month__con {
                    /*font-size: pxTorem(30);*/
                    color: #999;
                    display: flex;
                    align-items: center;

                    p, .icon {
                        font-size: pxTorem(15);
                        line-height: 1;
                    }
                }
                .prev-month__con { justify-content: flex-start; }
                .next-month__con { justify-content: flex-end; }

                .title {
                    height: pxTorem(40);
                    flex: 1 1 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .year {
                        font-size: pxTorem(20);
                        /*font-weight: 500;*/
                        color: #2b2b2b;
                    }
                }
            }
        }

        .weekdays-wrapper { // 星期几的标签
            /*border: #b26f57 1px solid;*/
            display: flex;
            justify-content: center;
            align-items: center;

            .weekday {
                /*width: pxTorem(60);*/
                height: pxTorem(30);
                flex: 1 1 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: pxTorem(16);
                /*font-weight: 500;*/
                /*color: #bebebe;*/
                color: rgba(52,72,94,0.54);
                margin: 0;

                &.sun, &.sat {
                    color: red;
                }
            }
        }
        .weeks-wrapper { // 每天的标签
            /*border: #8083b2 1px solid;*/
            padding: 0;

            .week {
                /*display: flex;*/
                /*justify-content: center;*/
                /*align-items: stretch;*/
            }
        }

        .day-wrapper {
            display: flex;
            justify-content: center;
            align-items: stretch;

            .day-layer {
                /*width: pxTorem(70);*/
                /*min-height: pxTorem(70);*/
                /*flex: 1 1 auto;*/
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                align-items: flex-start;

                .day-header {
                    width: 100%;
                    height: pxTorem(34);
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;

                    /*> :first-child {*/
                    /*flex: 0 0 auto;*/
                    /*}*/
                    /*> :last-child {*/
                    /*flex: 1 1 auto;*/
                    /*}*/
                    p {
                        flex: 0 0 auto;
                        margin: 0;
                        padding: 0;
                        font-size: pxTorem(14);
                        line-height: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                }

                .day {
                    /*box-sizing: content-box;*/
                    justify-content: center;
                    /*border: #3E3A39 1px solid;*/
                    width: pxTorem(28);
                    height: pxTorem(28);
                    font-size: pxTorem(30);
                    font-weight: 500;
                    color: #7C86A2;
                    /*transition: opacity .5s;*/
                    /*transition-timing-function: ease-out;*/
                    /*opacity: .8;*/
                    /*transition: opacity $dayContentTransitionTime;*/
                    opacity: 1;

                    &.icon {
                        background: #FDD108;
                        color: #fff;
                        font-size: pxTorem(20);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                }

                &.pre, &.nxt {
                    /*color: #bfbdc1;*/
                    font-weight: 300;
                    /*opacity: .4;*/
                    /*transition: opacity .8s;*/
                    /*transition-timing-function: ease-out;*/
                    .day {
                        /*color: #E1E4E7;*/
                        opacity: .4;
                    }
                }
                &.cur {
                    color: goldenrod;
                }

                &.shadow {

                    .day {
                        border-radius: 50%;
                        /*box-shadow: 0 pxTorem(8) pxTorem(10) 0 rgba(0,0,0,0.10);*/
                        box-shadow: 0 pxTorem(4) pxTorem(8) 0 #FFEB90;
                    }
                }
            }
        }

        /*.desc {*/
            /*padding: 0 pxTorem(80);*/
            /*font-size: pxTorem(22);*/
            /*display: flex;*/
            /*justify-content: space-between;*/

            /*.row {*/

                /*.icon {*/
                    /*font-size: pxTorem(10);*/
                /*}*/
            /*}*/
        /*}*/

    }

    .v-calendar { // 数据样式

        .day-wrapper {
            .day-layer {

                &.round .day { // 实心圆
                    background: #FDD108;
                    color: #fff;
                    transition: background .5s;
                    transition-timing-function: ease-out;
                }
                &.tour .day { // 带'赛'字实心圆
                    position: relative;
                    background: #FDD108;
                    color: transparent;
                    transition: background .5s;
                    transition-timing-function: ease-out;

                    &::before {
                        width: pxTorem(28);
                        height: pxTorem(28);
                        /*content: '&#36187;';*/
                        content: '赛';
                        position: absolute;
                        left: 0;
                        top: 0;
                        font-size: pxTorem(14);
                        font-weight: 300;
                        color: #fff;
                        text-align: center;
                        line-height: pxTorem(28);
                    }
                }
                &.dot .day { // 圆点
                    position: relative;
                    box-shadow: none!important;
                    /*background: #FDD108;*/
                    /*color: transparent!important;*/
                    /*transition: background .5s;*/
                    /*transition-timing-function: ease-out;*/

                    &:after {
                        width: pxTorem(6);
                        height: pxTorem(6);
                        box-sizing: content-box;
                        border: #ffffff pxTorem(1) solid;
                        background: #7ED321;
                        border-radius: 50%;
                        content: ' ';
                        position: absolute;
                        left: pxTorem(10);
                        bottom: pxTorem(-5);
                        font-weight: 300;
                        color: #000;
                        text-align: center;
                        line-height: pxTorem(44);
                    }
                }

                &.circle .day { // 圆圈
                    border: #FDD108 pxTorem(2) solid;
                    transition: background .5s;
                    transition-timing-function: ease-out;
                    &::after {
                        left: pxTorem(8); // 矫正浮动dot的位置
                        bottom: pxTorem(-7);
                    }
                }

                &.check .day { // 圆点
                    position: relative;
                    background: #FDD108;
                    /*box-shadow: none !important;*/
                    box-shadow: 0 pxTorem(4) pxTorem(8) 0 #FFEB90!important;
                }
                &.cur .day { // 当天的样式
                    position: relative;
                    background: #FDD108;
                    border-radius: 50%;
                    color: transparent;

                    &::before {
                        width: pxTorem(28);
                        height: pxTorem(28);
                        /*content: '&#36187;';*/
                        content: '今';
                        position: absolute;
                        left: 0;
                        top: 0;
                        font-size: pxTorem(14);
                        font-weight: 300;
                        color: #fff;
                        text-align: center;
                        line-height: pxTorem(28);
                    }
                }
                &.selected .day { // 选中时要清除赛事的文字哈。。。
                    border: #FDD108 pxTorem(2) solid;
                    border-radius: 50%;
                    background: transparent;
                    color: #7C86A2;
                    transition: background .5s;
                    transition-timing-function: ease-out;
                    /*box-sizing: content-box;*/

                    &::after {
                        left: pxTorem(8); // 矫正浮动dot的位置
                        bottom: pxTorem(-7);
                    }
                }
                &.cur.selected .day,
                &.check.selected .day,
                &.tour.selected .day {
                    &::before { // 文字放在before，其他样式放在after。。。选中时，隐藏before的文字，显示日期。。。
                        content: '';
                        display: none;
                    }
                }
            }
        }
    }
    .v-calendar { // 两种布局样式的重置

        &.grid { // 当日期内有数据的时候，带表格的样式。 Author by Dio Zhu. on 2018.4.17

            .v-calendar__panel {
                padding: 0;
            }

            .weekdays-wrapper { // 边框
                /*border-top: $table-border-color 1px solid; // 边框*/
                /*border-right: $table-border-color 1px solid; // 边框*/
            }
            .weekday {
                /*border-left: $table-border-color 1px solid; // 边框
                border-bottom: $table-border-color 1px solid; // 边框*/
                font-size: pxTorem(12);
            }
            .weeks-wrapper {
                box-sizing: border-box;
                border-top: $table-border-color 1px solid; // 边框
                /*border-right: $table-border-color 1px solid; // 边框*/
                .day-wrapper {
                    box-sizing: border-box;
                    border-bottom: $table-border-color 1px solid; // 边框
                }
                .day-layer {
                    box-sizing: border-box;
                    border-left: $table-border-color 1px solid; // 边框
                    /*border-bottom: $table-border-color 1px solid; // 边框*/
                    /*border: $table-border-color 1px solid; // 边框*/
                    /*margin: -1px 0 0 -1px;*/
                }
            }

            .day-wrapper {
                .day-layer {
                    min-height: pxTorem(76);

                    .day-header {
                        align-items: flex-start;
                        justify-content: space-between;
                        .day {
                            margin: pxTorem(6) pxTorem(4);
                            width: pxTorem(20);
                            height: pxTorem(20);
                            font-size: pxTorem(14);
                            font-weight: 300;
                            color: #2b2b2b;
                        }
                    }
                    &.pre .day, &.nxt .day {
                        color: #999;
                    }
                    &.cur .day {
                        color: transparent;

                        &::before {
                            width: pxTorem(20);
                            height: pxTorem(20);
                            font-size: pxTorem(12);
                            line-height: pxTorem(20);
                        }
                    }
                    &.selected {
                        position: relative;
                        background: #FF6900;
                        /*border: #FF6900 pxTorem(.5px) solid;*/
                        border: none;
                        border-radius: pxTorem(3);
                        box-shadow: 0 pxTorem(2) pxTorem(6) 0 rgba(253,188,8,0.20);
                        transform: translate3d(0, 0, 0);

                        &.has-data {
                            &::after {
                                width: pxTorem(20);
                                height: pxTorem(20);
                                /*background: #7ED321;*/
                                border-top: transparent pxTorem(10) solid;
                                border-left: transparent pxTorem(10) solid;
                                border-right: #FF6900 pxTorem(10) solid;
                                border-bottom: #FF6900 pxTorem(10) solid;
                                transform: rotate(45deg);
                                border-radius: pxTorem(4);
                                content: ' ';
                                position: absolute;
                                left: pxTorem(15);
                                bottom: pxTorem(-6);
                                font-weight: 300;
                                color: #000;
                                text-align: center;
                                line-height: pxTorem(44);
                                z-index: -1;
                            }
                        }

                        .day {
                            color: #FDD108;
                            border: none;
                        }

                    }
                }
                .day-layer.selected.cur .day {
                    background: #FDD108;
                    border-radius: 50%;
                    color: transparent;
                    box-shadow: none;

                    &::before {
                        width: pxTorem(20);
                        height: pxTorem(20);
                        font-size: pxTorem(12);
                        line-height: pxTorem(20);
                        content: '今';
                        position: absolute;
                        left: 0;
                        top: 0;
                        font-weight: 300;
                        color: #fff;
                        text-align: center;
                    }
                    &::after {
                        width: pxTorem(20);
                        height: pxTorem(20);
                        font-size: pxTorem(12);
                        line-height: pxTorem(20);
                        content: '今'!important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        font-weight: 300;
                        color: #fff;
                        text-align: center;
                    }
                }
            }

            .week-content {
                background: #F9F9F9;
                margin: 0;
                /*transition: height .5s;*/
                /*transition-timing-function: ease-out;*/
            }
        }

        .fade-enter-active, .fade-leave-active {
            transition: opacity .5s
        }
        .fade-enter, .fade-leave-to /* .fade-leave-active in below version 2.1.8 */ {
            opacity: 0
        }
    }

</style>
