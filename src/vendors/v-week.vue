<template>
    <div class="calendar border no-animate">

        <div class="month-swich">
            <ul>
                <!--<li class="arrow pre" @click="pre"><a>&nbsp;<</a></li>-->
                <li class="title">
                    <span>{{title}}</span>
                </li>
                <!--<li class="arrow next" @click="next"><a>&nbsp;></a></li>-->
            </ul>
        </div>
        <div class="months">
            <li v-for="(item, index) in monthList" :key="index" :class="{cur: item.name == month}"
                @click="clickMonth(item)">
                {{item.name}}
            </li>
        </div>
        <div class="weekbox">

                <div class="arrow pre icon icon-arrow-l" @click="pre"><a>&nbsp;<</a></div>
                <div class="arrow next icon icon-arrow-r" @click="next"><a>&nbsp;></a></div>

            <ul class="weekdays" @touchstart="startFn" @touchend="endFn">
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li><i>六</i></li>
                <li><i>日</i></li>
            </ul>
            <ul class="days week" @touchstart="startFn" @touchend="endFn">
                <!--<li @click="onDateClick(day)" v-for="day in weekDays">-->
                    <!--<span :class="day.actived?'actived':isToday(day.moment)?'today':day.existed?'hasdate':''">{{ day.moment.format('D') }}</span>-->
                    <!--<span v-if="day.dot==1" class="icon_dot">.</span>-->
                <!--</li>-->
                <li  v-for="day in weekDays">
                    <span :class="day.actived?'actived':isToday(day.moment)?'today':day.existed?'hasdate':''">{{ day.moment.format('D') }}</span>
                    <span v-if="day.dot==1" class="icon_dot">.</span>
                </li>
            </ul>

        </div>
        <slot></slot>
    </div>
</template>
<script>
    import '../js/utils/tap';

    var moment = require('moment');
    export default {
        props: {
            dot: {
                type: Array,
                default () { return []; }
            },
            func: {
                type: Function,
                default: ''
            },
            times: {
                type: Number
            },
            preNum: { // 当前日期的前几个月
                type: Number,
                default: 3
            },
            nextNum: { // 当前日期的后几个月
                type: Number,
                default: 2
            }
        },
        data () {
            return {
                title: '',
                selectedDate: '',
                weekDays: [],
                monday: '',
                // monday: moment().startOf(this.times).add(0, 'days'),
                dragState: {
                    startLeft: -1
                },
                activedDate: '',
                monthList: [],
                month: moment(new Date()).format('MM月'),
                CurrentWeekDays: []
            };
        },

        mounted () {
            // this.monday = moment(26768016000000).startOf('week').add(1, 'days');
            /**
             * 初始化从传入的时间戳来初始化日历
             */
            this.title = this.times ? moment(this.times).format('YYYY年MM月') : moment().format('YYYY年MM月');
            this.month = this.times ? moment(this.times).format('MM月') : moment().format('MM月');
            this.monday = this.times ? moment(this.times).startOf('isoWeek') : moment().startOf('isoWeek');
            // console.log('v-week.mounted: ', this.times, moment(this.times).startOf('isoWeek'), this.monday);
            this.initCalendar();
            /**
             * 获取初始化月份
             */
            this.getMonthList();
        },
        watch: {
            // start_time (val) {
            //     this.$emit('handle-start-time', val);
            // },
            // end_time (val) {
            //     this.$emit('handle-end-time', val);
            // }
        },
        methods: {
            clickMonth (item) {
                /**
                 * 给当前标题和选中月赋值
                 */
                this.title = moment().format('YYYY年') + item.name;
                this.month = item.name;
                // this.monday = moment(item.value).startOf('week').add(1, 'days');
                /**
                 * 当前点击月份与初始化月份相同时，使用初始化月份日期
                 */
                if (this.month === moment(this.time).format('YYYY年')) this.monday = moment(item.value).startOf('isoWeek');
                else this.monday = moment(item.value).startOf('isoWeek');
                this.initCalendar();
            },
            initCalendar () {
                this.weekDays = [];
                this.selectedDate = this.monday.format('YYYYMMDD');
                if (!this.activedDate) { // 未选中状态默认今天
                    this.activedDate = moment().format('YYYYMMDD');
                }
                for (var i = 0;i < 7;i++) {
                    if (this.isToday(this.monday)) {
                        this.selectedDate = this.monday.format('YYYYMMDD');
                    }
                    this.weekDays.push({
                        actived: false,
                        existed: false,
                        moment: moment(this.monday)
                    });
                    this.monday.add(1, 'days');
                }
                /**
                 * 计算标题和月份的逻辑提出去，为了解决标题和高亮月份逻辑与 计算周返回的月份冲出，踢出去
                 */
                // let endLenth = this.weekDays.length - 1;
                // this.start_time = this.weekDays[0].moment.format('YYYY-MM-DD');
                // this.end_time = this.weekDays[endLenth].moment.format('YYYY-MM-DD');
                // this.title = moment(this.selectedDate, 'YYYYMMDD').format('YYYY年MM月');
                // this.month = moment(this.selectedDate, 'YYYYMMDD').format('MM月');
                // console.log('v-week.initCalendar: ', this.selectedDate, moment(this.selectedDate, 'YYYYMMDD').add(4, 'days').format('YYYY-MM-DD'));
                // this.monthList = [];
                // let arr = [-3, -2, -1, 0, 1];
                // arr.forEach(item => {
                //     this.monthList.push(moment().add(item, 'months').format('MM月'));
                // });
                // window.console.log(this.monday.format('MM月'));
                this.CurrentWeekDays = [];
                this.weekDays.forEach(item => {
                    this.CurrentWeekDays.push(item.moment.format('YYYY-MM-DD'));
                    // this.CurrentWeekDays.push(item.moment.valueOf());
                });
                /**
                 * 循环传入数据与日历比对，如果日期相同，添加dot状态
                 */
                if (this.weekDays.length > 0) {
                    let _self = this;
                    [].forEach.call(this.dot, el => {
                        [].forEach.call(_self.weekDays, day => {
                            if (el === day.moment.format('YYYY-MM-DD')) {
                                day.dot = 1;
                            }
                        });
                    });
                }

                // console.log(this.weekDays);
                // this.$emit('handleDateRange', {begin_date: this.start_time, end_date: this.end_time});
                this.$emit('handleWeekDays', this.CurrentWeekDays);
                this.onDateClick({moment: moment(this.activedDate, 'YYYYMMDD')});
            },
            startFn (event) {
                let t = event.changedTouches[0] || event.touches[0] || event.targetTouches[0];
                this.dragState.startLeft = t.pageX;
            },
            endFn (event) {
                let t = event.changedTouches[0] || event.touches[0] || event.targetTouches[0];
                if ((t.pageX - this.dragState.startLeft) > 10) {
                    // console.log('b===========>', this.weekDays[0].moment.format('YYYYMMDD'));
                    // console.log('c=================>', moment().startOf('week').add(0, 'days').format('YYYYMMDD'));
                    this.pre();
                }
                if ((t.pageX - this.dragState.startLeft) < -10) {
                    this.next();
                }
            },
            /**
             * 上一周
             */
            pre () {
                this.monday.add(-14, 'days');
                // if (this.monthList.indexOf(this.monday.format('MM月')) < 0) {
                //     this.$toast('仅能查看过往3个月上过的课程！');
                //     return false;
                // } else {
                // }
                let timeStamp = this.CurrentWeekDays[0];
                // 最小月份
                let minMonth = parseInt(moment().add(-this.preNum, 'months').format('YYYYMM') + '01');
                // 当前月份
                let nowMonth = parseInt(moment(timeStamp).format('YYYYMMDD'));
                // window.alert(minMonth + '---' + nowMonth);
                if (minMonth < nowMonth) {
                    this.initCalendar();
                    this.title = this.monday.format('YYYY年MM月');
                    this.month = this.monday.format('MM月');
                } else {
                    this.$toast('仅能查看过往3个月上过的课程！');
                    return false;
                }
                // this.initCalendar();
            },
            /**
             * 下一周
             */
            next () {
                let idx = this.CurrentWeekDays.length - 1;
                let timeStamp = this.CurrentWeekDays[idx];
                // 最大月份
                let maxMonth = parseInt(moment().add(this.nextNum, 'months').format('YYYYMM'));
                // 当前月份
                let nowMonth = parseInt(moment(timeStamp).format('YYYYMM'));
                if (maxMonth < nowMonth) {
                    this.$toast('仅能查看未来2个月的课程安排哦！');
                    return false;
                } else {
                    this.initCalendar();
                    /**
                     * 档切换周到最大月下一个月时，不在从新给month重新赋值
                     */
                    if (parseInt(this.monday.format('YYYYMM')) > maxMonth) {
                        return false;
                    } else {
                        this.title = this.monday.format('YYYY年MM月');
                        this.month = this.monday.format('MM月');
                    }
                }
            },
            /**
             * 获取当前是第几周
             * @param day
             * @returns {number}
             */
            getMonthWeek (day) {
                /*
                a = d = 当前日期
                b = 6 - w = 当前周的还有几天过完（不算今天）
                a + b 的和在除以7 就是当天是当前月份的第几周
                */
                let date = moment(day, 'YYYYMMDD').toDate(),
                    w = date.getDay(),
                    d = date.getDate();
                return Math.ceil(
                    (d + 6 - w) / 7
                );
            },
            /**
             * 是否为今天
             */
            isToday (_moment) {
                return moment().isSame(_moment, 'day');
            },
            onDateClick (date) {
                this.activedDate = date.moment.format('YYYYMMDD');
                this.selectedDate = date.moment.format('YYYYMMDD');
                this.weekDays.forEach(function (item) {
                    item.actived = item.moment.isSame(date.moment, 'day');
                });
                this.func();
                // console.log('=========>', this.weekDays);
            },
            /**
             * 获取月份列表
             * preNum 当月前几个月
             * nextNum 当月后几个月
             */
            getMonthList () {
                let numberArr = [];
                this.monthList = [];
                if (!this.preNum && !this.nextNum) {
                    numberArr = [0];
                    numberArr.forEach(item => {
                        let monthVal = {
                            value: moment().add(item, 'months').valueOf(),
                            name: moment().add(item, 'months').format('MM月')
                        };
                        this.monthList.push(monthVal);
                    });
                    return numberArr;
                }
                if (this.nextNum) {
                    for (let i = 0;i <= this.nextNum;i++) {
                        numberArr.push(i);
                    }
                }
                if (this.preNum) {
                    for (let j = 1;j <= this.preNum;j++) {
                        numberArr.unshift(-j);
                    }
                }
                numberArr.forEach(item => {
                    let monthVal = {
                        name: moment().add(item, 'months').format('MM月')
                    };
                    /**
                     * 判断点击的时候为当前月，如果是当前月用当前日期初始化周
                     * 如果不是当前月，使用每月的1号作为周的中间值初始化周。
                     */
                    if (item === 0) {
                        monthVal.value = moment().add(item, 'months').valueOf();
                    } else {
                        let yearMonth = moment().add(item, 'months').format('YYYY-MM');
                        monthVal.value = moment(yearMonth + '-01').valueOf(); // 大哥。。。想明白了么。。。
                        // monthVal.value = moment(yearMonth).valueOf();
                    }
                    this.monthList.push(monthVal);
                });
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .calendar {
        background: #fff;
        box-sizing: border-box;
        position: fixed;
        width: 100%;
        top: 0;
        z-index: 1;
    }

    .border {
        border-bottom: 1px solid;
        border-color: #dddee3;
    }

    .ios .border {
        border-bottom-width: 1px;
    }

    .month-swich {
        width: 100%;
        padding: 0.45rem 015px;
        box-sizing: border-box;
    }

    .month-swich ul {
        height: pxTorem(40px);
        line-height: pxTorem(40px);
        width: 100%;
        display: flex;
        display: -webkit-flex;
        align-items: center;
    }

    .month-swich ul li {
        font-size: pxTorem(15px);
        color: #007aff;
    }

    .month-swich ul li.title {
        flex: 1;
        -webkit-flex: 1;
        text-align: center;
        span {
            color: #000;
            font-size: pxTorem(18px);
        }
    }

    .month-swich ul li.arrow {
        width: pxTorem(53);
        height: pxTorem(53);
    }

    .month-swich ul li.arrow a {
        display: block;
        width: 100%;
        height: 100%;
        background-size: pxTorem(8px) pxTorem(15px);
        background-repeat: no-repeat;
        background-position: center;
    }

    .month-swich ul li.arrow a:active {
        opacity: 0.3;
    }

    .month-swich ul li.arrow.pre a {
        /*background-image: url('img/pre.png')*/
    }

    .month-swich ul li.arrow.next a {
        /*background-image: url('img/next.png')*/
    }

    .weekdays {
        padding-bottom: pxTorem(10px);
        display: flex;
        display: -webkit-flex;
        flex-wrap: wrap;
        li {
            /*display: inline-block;*/
            width: 14.28%;
            text-align: center;
            font-size: pxTorem(15px);
            color: #000000;
            justify-content: space-around;
            i {
                color: #777E8C;
                font-size: pxTorem(15px);
            }
        }
    }

    .days {
        padding: 0;
        margin: 0;
        display: flex;
        display: -webkit-flex;
        flex-wrap: wrap;
        -webkit-flex-wrap: wrap;
        justify-content: space-around;
        padding-bottom: pxTorem(10px);
    }

    .days li {
        list-style-type: none;
        list-style: none;
        display: inline-block;
        width: 14.2%;
        text-align: center;
        font-size: pxTorem(15px);
    }

    .days li .today {
        width: pxTorem(44px);
        height: pxTorem(44px);
        line-height: pxTorem(44px);
        text-align: center;
        border-radius: 50%;
        color: #007aff;
    }

    .days li > span {
        width: pxTorem(44px);
        height: pxTorem(44px);
        line-height: pxTorem(44px);
        font-size: pxTorem(15px);
        text-align: center;
        border-radius: 50%;
        color: #000;
        display: inline-block;
        position: relative;
    }

    .days li .other-month {
        color: gainsboro;
    }

    .days li span.actived,
    .days li span.hasdate.actived {
        /*background: #3395FF;*/
        color: #fff;
    }

    .days li span:active {
        /*background: #3395FF;*/
        color: #fff;
    }

    .days li span.hasdate.actived:after {
        background-color: #fff;
    }

    .days li span.hasdate:after {
        content: '';
        width: pxTorem(4px);
        height: pxTorem(4px);
        border-radius: 50%;
        position: absolute;
        bottom: pxTorem(5px);
        left: pxTorem(20px);
        background-color: #007aff;
    }

    .week {
        top: pxTorem(85px);
        right: 0;
        left: 0;
    }
</style>
