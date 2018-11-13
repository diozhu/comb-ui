<template>
  <v-popup v-model="visible" position="bottom" class="v-datetime" modalClass="global">
    <v-picker
      :slots="dateSlots"
      @change="onChange"
      :visible-item-count="visibleItemCount"
      class="v-datetime-picker"
      ref="picker"
    >
    <div class="date-time-msg-box">
        <slot name="topMessage"></slot>
        <div class="concel-confirm-button">
            <span class="v-datetime-action v-datetime-cancel" @click="visible = false">{{ cancelText }}</span>
            <span class="v-datetime-action v-datetime-confirm" @click="confirm">{{ confirmText }}</span>
        </div>
    </div>
    </v-picker>
  </v-popup>
</template>

<script>
    import * as utils from '../js/utils/utils';
    import vPicker from './v-picker';
    import vPopup from './v-popup';

//    if (process.env.NODE_ENV === 'component') {
//        require('mint-ui/packages/picker/style.css');
//        require('mint-ui/packages/popup/style.css');
//    }

    const FORMAT_MAP = {
        Y: 'year',
        M: 'month',
        D: 'date',
        H: 'hour',
        m: 'minute'
    };

    /**
     * 添加smart显示模式，调用时传入type="smart"，显示"xx月xx日 周几 小时 分钟"样式
     *              -- Author by Dio Zhu. on 2017.3.1
     * 修改了getSpecialDate() 和 getValue() 的month-1的方式，原因是发现2017年3月31日无法选取，奇怪全年为啥只有这一天无法正确计算。。。
     *              -- Author by Dio Zhu. on 2017.3.31
     */
    export default {
        name: 'v-datetime-picker',

        components: { vPicker, vPopup },

        props: {
            cancelText: {
                type: String,
                default: '取消'
            },
            confirmText: {
                type: String,
                default: '确定'
            },
            type: {
                type: String,
                default: 'datetime'
            },
            startDate: {
                type: Date,
                default () {
                    let sd = new Date(new Date().getFullYear() - 18, 0, 1);
                    if (this.type === 'smart') sd = new Date(); // Dio Zhu. on 2017.3.1
                    return sd;
                }
            },
            endDate: {
                type: Date,
                default () {
                    let ed = new Date(new Date().getFullYear() + 10, 11, 31), cur = new Date();
                    if (this.type === 'smart') ed = new Date(cur.getFullYear(), cur.getMonth() + 2, cur.getDate()); // Dio Zhu. on 2017.3.1
                    return ed;
                }
            },
            startHour: {
                type: Number,
                default: 0
            },
            endHour: {
                type: Number,
                default: 23
            },
            yearFormat: {
                type: String,
                default: '{value}'
            },
            monthFormat: {
                type: String,
                default: '{value}'
            },
            dateFormat: {
                type: String,
                default: '{value}'
            },
            hourFormat: {
                type: String,
                default: '{value}'
            },
            minuteFormat: {
                type: String,
                default: '{value}'
            },
            visibleItemCount: {
                type: Number,
                default: 5
            },
            value: null,
            validity: {
                type: Boolean,
                default: false
            },
            isValidator: {
                type: Boolean,
                default: false
            }
        },

        data () {
            return {
                visible: false,
                startYear: null,
                endYear: null,
                startMonth: 1,
                endMonth: 12,
                startDay: 1,
                endDay: 31,
                currentValue: null,
                selfTriggered: false,
                dateSlots: [],
                shortMonthDates: [],
                longMonthDates: [],
                febDates: [],
                leapFebDates: []
            };
        },

        computed: {
            rims () {
                if (!this.currentValue) return {year: [], month: [], date: [], hour: [], min: []};
                let result;
                if (this.type === 'time') {
                    result = {
                        hour: [this.startHour, this.endHour],
                        min: [0, 59]
                    };
                    return result;
                }
                if (this.type === 'smart') { // 设定起止范围，日期默认从今天开始，两个月。 add by Dio Zhu. on 2017.2.28
                    let st = this.startDate, // new Date()
                        ed = new Date(st.getFullYear(), st.getMonth() + 2, st.getDate()),
                        stm = st.getMonth() + 1,
                        edm = ed.getMonth() + 1;
                    st = st.getFullYear().toString() + '/' + (stm >= 10 ? stm.toString() : '0' + stm) + '/' + (st.getDate() >= 10 ? st.getDate().toString() : '0' + st.getDate());
                    ed = ed.getFullYear().toString() + '/' + (edm >= 10 ? edm.toString() : '0' + edm) + '/' + (ed.getDate() >= 10 ? ed.getDate().toString() : '0' + ed.getDate());
                    result = {
                        date: [st, ed],
                        hour: [0, 23],
                        min: [0, 59]
                    };
//                    console.log(`v-datetime-picker[${this._uid}].rims: `, this.currentValue, this.startDate, this.startHour, this.endHour);
//                    this.rimDetect(result, 'start');
//                    this.rimDetect(result, 'end');
                    return result;
                }
                result = {
                    year: [this.startDate.getFullYear(), this.endDate.getFullYear()],
                    month: [1, 12],
                    date: [1, this.getMonthEndDay(this.getYear(this.currentValue), this.getMonth(this.currentValue))],
                    hour: [0, 23],
                    min: [0, 59]
                };
                this.rimDetect(result, 'start');
                this.rimDetect(result, 'end');
                return result;
            },

            typeStr () {
                if (this.type === 'time') {
                    return 'Hm';
                } else if (this.type === 'date') {
                    return 'YMD';
                } else if (this.type === 'smart') {
                    return 'DHm';
                } else {
                    return 'YMDHm';
                }
            }
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },

            rims () {
                this.generateSlots();
            }
        },

        methods: {
            open () {
                this.visible = true;

//                console.log('v-datetime-picker.open: ', this.$refs.picker.$refs.mask.getBoundingClientRect());
//                this.$nextTick(() => {
//                    this.$refs.picker.$refs.mask.style.top = 0;
//                });
            },

            close () {
                this.visible = false;
            },

            isLeapYear (year) {
                return (year % 400 === 0) || (year % 100 !== 0 && year % 4 === 0);
            },

            isShortMonth (month) {
                return [4, 6, 9, 11].indexOf(month) > -1;
            },

            getMonthEndDay (year, month) {
                if (this.isShortMonth(month)) {
                    return 30;
                } else if (month === 2) {
                    return this.isLeapYear(year) ? 29 : 28;
                } else {
                    return 31;
                }
            },

            getTrueValue (formattedValue) {
                if (!formattedValue) return;
                while (isNaN(parseInt(formattedValue, 10))) {
                    formattedValue = formattedValue.slice(1);
                }
                return parseInt(formattedValue, 10);
            },

            /**
             * 格式化特殊日期              -- Author by Dio Zhu. on 2017.2.28
             */
            getSpecialDate (str) {
                if (!str || str.length < 8) return new Date();
                let cur = new Date(),
                    m = parseInt(str.substring(0, 2)) - 1,
                    d = parseInt(str.substring(3, 5)),
                    y = m < cur.getMonth() ? cur.getFullYear() + 1 : cur.getFullYear(),
                    dt = new Date(y, m, d);
//                console.log('v-datetime-picker.getSpecialDate: ', str, y, m, d, dt);
                return dt;
            },
            setSpecialDate (dt) {
                let str = '';

                return str;
            },

            getValue (values) {
                let value;
                if (this.type === 'time') {
                    value = values.map(value => ('0' + this.getTrueValue(value)).slice(-2)).join(':');
                } else if (this.type === 'smart') {
//                    console.log('****** ', values);
                    let year = this.getSpecialDate(values[0]).getFullYear(),
                        month = this.getSpecialDate(values[0]).getMonth(),
                        date = this.getSpecialDate(values[0]).getDate(),
                        hour = this.typeStr.indexOf('H') > -1 ? this.getTrueValue(values[this.typeStr.indexOf('H')]) : 0,
                        minute = this.typeStr.indexOf('m') > -1 ? this.getTrueValue(values[this.typeStr.indexOf('m')]) : 0;
                    value = new Date(year, month, date, hour, minute);
                } else {
                    let year = this.getTrueValue(values[0]);
                    let month = this.getTrueValue(values[1]);
                    let date = this.getTrueValue(values[2]);
                    let maxDate = this.getMonthEndDay(year, month);
                    if (date > maxDate) {
                        this.selfTriggered = true;
                        date = 1;
                    }
                    let hour = this.typeStr.indexOf('H') > -1 ? this.getTrueValue(values[this.typeStr.indexOf('H')]) : 0;
                    let minute = this.typeStr.indexOf('m') > -1 ? this.getTrueValue(values[this.typeStr.indexOf('m')]) : 0;
                    value = new Date(year, month - 1, date, hour, minute);
                }
//                console.log('!!!v-datetime-picker.getValue: ', utils.formatTime(value));
                return value;
            },

            onChange (picker) {
                let values = picker.$children.filter(child => child.currentValue !== undefined).map(child => child.currentValue);
                // console.log('v-datetime-picker.onChange: ', this.selfTriggered, values, this.currentValue);
                if (this.selfTriggered) {
                    this.selfTriggered = false;
                    return;
                }

                this.currentValue = this.getValue(values);
                if (this.type === 'smart') { // smart模式时间校验。 add by Dio Zhu. on 2017.3.31
                    let std = new Date();
                    console.log('v-datetime-picker.onChange: ', values, this.currentValue < std);
                    if (this.currentValue < std) {
                        let st = [
                            utils.formatTime(std, 'MM月dd日 week'),
                            this.hourFormat.replace('{value}', ('0' + this.getHour(std)).slice(-2)),
                            this.minuteFormat.replace('{value}', ('0' + this.getMinute(std)).slice(-2))
                        ];
                        this.setSlotsByValues(st);
                        return;
                    }
                }
                this.handleValueChange();
            },

            fillValues (type, start, end) {
                let values = [];
                if (this.type === 'smart' && type === 'D') {
                    let cur = new Date(start), str = '';
                    // console.log('v-datetime-picker.fillValues...', type, start, end);
                    while (cur < new Date(end)) {
                        str = utils.formatTime(cur, 'MM月dd日 week');
                        values.push(this[`${FORMAT_MAP[type]}Format`].replace('{value}', str));
                        cur.setDate(cur.getDate() + 1);
                    }
                    return values;
                }
                for (let i = start;i <= end;i++) {
                    if (i < 10) {
                        values.push(this[`${FORMAT_MAP[type]}Format`].replace('{value}', ('0' + i).slice(-2)));
                    } else {
                        values.push(this[`${FORMAT_MAP[type]}Format`].replace('{value}', i));
                    }
                }
                return values;
            },

            pushSlots (slots, type, start, end) {
                // console.log('v-datetime-picker.pushSlots: ', slots, type, start, end);
                if (this.type === 'smart') { // 日期自适应，两列时间固定宽度。 add by Dio Zhu. on 2017.2.29
                    let flx = type === 'D' ? '1 1 0%' : '0 0 20%';
                    slots.push({
                        flex: flx,
                        values: this.fillValues(type, start, end)
                    });
                } else {
                    slots.push({
                        flex: 1,
                        values: this.fillValues(type, start, end),
                        className: type
                    });
                }
            },

            generateSlots () {
                let dateSlots = [];
                const INTERVAL_MAP = {
                    Y: this.rims.year,
                    M: this.rims.month,
                    D: this.rims.date,
                    H: this.rims.hour,
                    m: this.rims.min
                };
                let typesArr = this.typeStr.split('');
                // console.log('!!!!!!!!!!!!!!! dateSlots: ', INTERVAL_MAP, typesArr);
                typesArr.forEach(type => {
                    if (INTERVAL_MAP[type]) {
                        this.pushSlots.apply(null, [dateSlots, type].concat(INTERVAL_MAP[type]));
                    }
                });
                if (this.typeStr === 'Hm') {
                    dateSlots.splice(1, 0, {
                        divider: true,
                        content: ':'
                    });
                }
                if (this.typeStr === 'YMDHm') {
                    dateSlots.splice(1, 0, { divider: true, content: '年' });
                    dateSlots.splice(3, 0, { divider: true, content: '月' });
                    dateSlots.splice(5, 0, { divider: true, content: '日' });
                    dateSlots.splice(7, 0, { divider: true, content: ':' });
                }
                if (this.typeStr === 'YMD') {
                    dateSlots.splice(1, 0, { divider: true, content: '年' });
                    dateSlots.splice(3, 0, { divider: true, content: '月' });
                    dateSlots.splice(5, 0, { divider: true, content: '日', className: 'dayStr' });
                }
                this.dateSlots = dateSlots;
                // console.log('v-datetime-picker.generateSlots: ', this.rims, dateSlots);
                this.handleExceededValue();
            },

            handleExceededValue () {
                let values = [];
                if (this.type === 'time') {
                    values = this.currentValue.split(':');
                } else if (this.type === 'smart') { // add by Dio Zhu. on 2017.2.28
                    // console.log('------------>>> ', this.currentValue);
                    values = [
//                        this.yearFormat.replace('{value}', this.getYear(this.currentValue)),
//                        this.monthFormat.replace('{value}', ('0' + this.getMonth(this.currentValue)).slice(-2)),
                        utils.formatTime(this.currentValue, 'MM月dd日 week'),
//                        this.dateFormat.replace('{value}', ('0' + this.getDate(this.currentValue)).slice(-2)),
                        this.hourFormat.replace('{value}', ('0' + this.getHour(this.currentValue)).slice(-2)),
                        this.minuteFormat.replace('{value}', ('0' + this.getMinute(this.currentValue)).slice(-2))
                    ];
//                    console.log('v-datetime-picker.handleExceededValue: ', values);
                } else {
                    values = [
                        this.yearFormat.replace('{value}', this.getYear(this.currentValue)),
                        this.monthFormat.replace('{value}', ('0' + this.getMonth(this.currentValue)).slice(-2)),
                        this.dateFormat.replace('{value}', ('0' + this.getDate(this.currentValue)).slice(-2))
                    ];
                    if (this.type === 'datetime') {
                        values.push(
                            this.hourFormat.replace('{value}', ('0' + this.getHour(this.currentValue)).slice(-2)),
                            this.minuteFormat.replace('{value}', ('0' + this.getMinute(this.currentValue)).slice(-2))
                        );
                    }
                }
                this.dateSlots.filter(child => child.values !== undefined).map(slot => slot.values).forEach((slotValues, index) => {
                    if (slotValues.indexOf(values[index]) === -1) {
                        values[index] = slotValues[0];
                    }
                });
                this.$nextTick(() => {
                    this.setSlotsByValues(values);
                });
            },

            setSlotsByValues (values) {
                const setSlotValue = this.$refs.picker.setSlotValue;
                // console.log('========> ', values);
                if (this.type === 'time') {
                    setSlotValue(0, values[0]);
                    setSlotValue(1, values[1]);
                }
                if (this.type !== 'time') {
                    setSlotValue(0, values[0]);
                    setSlotValue(1, values[1]);
                    setSlotValue(2, values[2]);
                    if (this.type === 'datetime') {
                        setSlotValue(3, values[3]);
                        setSlotValue(4, values[4]);
                    }
                }
                [].forEach.call(this.$refs.picker.$children, child => child.doOnValueChange());
            },

            rimDetect (result, rim) {
                let position = rim === 'start' ? 0 : 1;
                let rimDate = rim === 'start' ? this.startDate : this.endDate;
                if (this.type === 'smart') { // add by Dio Zhu. on 2017.3.1
                    console.log('v-datetime-picker.rimDetect: ', rim, this.startDate, this.endDate);
                } else {
                    if (this.getYear(this.currentValue) === rimDate.getFullYear()) {
                        result.month[position] = rimDate.getMonth() + 1;
                        if (this.getMonth(this.currentValue) === rimDate.getMonth() + 1) {
                            result.date[position] = rimDate.getDate();
                            if (this.getDate(this.currentValue) === rimDate.getDate()) {
                                result.hour[position] = rimDate.getHours();
                                if (this.getHour(this.currentValue) === rimDate.getHours()) {
                                    result.min[position] = rimDate.getMinutes();
                                }
                            }
                        }
                    }
                }
            },

            isDateString (str) {
                return /\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/.test(str);
            },

            getYear (value) {
                return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[0] : value.getFullYear();
            },

            getMonth (value) {
                // value = new Date(value.getFullYear(), value.getMonth() + 1, value.getDate());
                // console.log('bbbbbbb', value.getMonth());
                return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[1] : value.getMonth() + 1;
            },

            getDate (value) {
                return this.isDateString(value) ? value.split(' ')[0].split(/-|\/|\./)[2] : value.getDate();
            },

            getHour (value) {
                if (this.isDateString(value)) {
                    const str = value.split(' ')[1] || '00:00:00';
                    return str.split(':')[0];
                }
                return value.getHours();
            },

            getMinute (value) {
                if (this.isDateString(value)) {
                    const str = value.split(' ')[1] || '00:00:00';
                    return str.split(':')[1];
                }
                return value.getMinutes();
            },

            confirm () {
                this.visible = false;
                this.$emit('confirm', this.currentValue);
            },

            handleValueChange () {
                this.$emit('input', this.currentValue);
            }
        },

        mounted () {
            this.currentValue = this.value;
            if (!this.value) {
                if (this.type.indexOf('date') > -1) {
                    // this.currentValue = this.startDate; 如果是课程有效期默认下一个月 孙乐卿 2018-02-11
                    if (this.isValidator) this.currentValue = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, this.startDate.getDate());
                    else this.currentValue = this.startDate;
                } else if (this.type.indexOf('smart') > -1) { // add by Dio Zhu. on 2017.2.28
                    this.currentValue = this.startDate; // new Date();
                } else {
                    this.currentValue = `${('0' + this.startHour).slice(-2)}:00`;
                }
            }
            this.generateSlots();
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-datetime {
        width: 100%;
        .dayStr{
            padding-right:pxTorem(20px);
        }

        .v-datetime-action {
            display: inline-block;
            width: 50%;
            text-align: center;
            line-height: pxTorem(40px);
            font-size: pxTorem(16px);
            color: #007AFF;
        }
        .v-datetime-cancel {
            float: left;
            text-align: left;
            padding-left: pxTorem(22px);
        }
        .v-datetime-confirm{
            text-align: right;
            padding-right: pxTorem(22px);
        }
        .picker-item{
            font-size: pxTorem(16px);
            font-weight: 300;
        }
        .picker-toolbar{
            height: pxTorem(44px);
        }
        .date-time-msg-box{width:100%;}
        .concel-confirm-button {
            height: pxTorem(40px);
            display: flex;
            justify-content: space-between;
        }
    }
</style>
