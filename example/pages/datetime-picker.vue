<template>
    <div class="page page-datetime-picker">
        <v-cell title="选择日期" is-link @click.native="openPicker1" :value="formatedValue1"></v-cell>

        <v-cell title="选择日期" is-link @click.native="openPicker2" :value="formatedValue2"></v-cell>

        <v-cell title="选择时间" is-link @click.native="openPicker3" :value="formatedValue3"></v-cell>

        <v-cell title="选择日期" is-link @click.native="openPicker4" :value="formatedValue4"></v-cell>

        <v-cell title="选择日期" is-link @click.native="openPicker5" :value="formatedValue5"></v-cell>

        <v-cell title="选择日期" is-link @click.native="openPicker6" :value="formatedValue6"></v-cell>

        <!--<v-cell title="选择日期" is-link @click.native="openPicker7" :value="value7"></v-cell>-->
        <v-field title="有效期" placeholder="请选择开始、结束时间" :readonly="true" :value="startEndTime" @click.native="openPicker7"></v-field>

        <v-datetime-picker
            ref="picker1"
            @confirm="handlePicker1"
        ></v-datetime-picker>
        <v-datetime-picker
            ref="picker2"
            type="date"
            @confirm="handlePicker2"
        ></v-datetime-picker>
        <v-datetime-picker
            ref="picker3"
            type="time"
            @confirm="handlePicker3"
        ></v-datetime-picker>
        <v-datetime-picker
            ref="picker4"
            type="date"
            @confirm="handlePicker4"
            year-format="{value} 年"
            month-format="{value} 月"
            date-format="{value} 日"
        ></v-datetime-picker>
        <v-datetime-picker
            ref="picker5"
            v-model="value5"
            @confirm="handlePicker5"
        ></v-datetime-picker>
        <v-datetime-picker
            ref="picker6"
            type="smart"
            :visibleItemCount="5"
            @confirm="handlePicker6"
        ></v-datetime-picker>
        <v-datetime-picker
            ref="picker7"
            type="date"
            @confirm="handlePicker7"
            @input="handlePickerInput7"
            :startDate="startDate"
            :endDate="endDate"
            isRegion
        >
            <div class="top-message" slot="topMessage">
                <div class="msg-tit">选择开始和结束的日期</div>
            </div>
        </v-datetime-picker>
    </div>
</template>

<script>
import * as utils from '../../src/utils/utils';

export default {
    data () {
        return {
            value1: null,
            value2: null,
            value3: null,
            value4: null,
            value5: new Date(),
            visible: false,
            visible2: false,
            visible3: false,
            visible4: false,
            visible5: false,
            value6: null,
            visible6: false,

            topMessage: 'topMessage',
            value7: null,
            visible7: false,
            startEndTime: null,
            startDate: new Date(new Date().getFullYear() - 2, 0, 1),
            endDate: new Date(new Date().getFullYear() + 2, 11, 31)
        };
    },
    computed: {
        formatedValue1 () {
            return this.value1 ? utils.formatTime(this.value1) : '请选择日期（datetime picker）';
        },
        formatedValue2 () {
            return this.value2 ? utils.formatTime(this.value2) : '请选择日期（date picker）';
        },
        formatedValue3 () {
            return this.value3 ? (this.value3) : '请选择时间（time picker）';
        },
        formatedValue4 () {
            return this.value4 ? utils.formatTime(this.value4) : '自定义格式';
        },
        formatedValue5 () {
            return this.value5 ? utils.formatTime(this.value5) : '设定初始值';
        },
        formatedValue6 () {
            return this.value6 ? utils.formatTime(this.value6) : '请选择日期（smart picker）';
        }
    },

    mounted () {
        setTimeout(this.openPicker7, 500);
    },
    methods: {
        open (picker) {
            console.log('datetime-picker.open: ');
            this.$refs[picker].open();
        },

        handleChange (value) {
            console.log('datetime-picker.handleChange: ', value);
            this.$toast({
                message: '选择: ' + utils.formatTime(value),
                position: 'bottom'
            });
        },

        openPicker1 () {
            this.$refs.picker1.open();
        },
        handlePicker1 (value) {
            console.log('datetime-picker.handlePicker1: ', value);
            this.value1 = value;
        },

        openPicker2 () {
            this.$refs.picker2.open();
        },
        handlePicker2 (value) {
            console.log('datetime-picker.handlePicker2: ', value);
            this.value2 = value;
        },

        openPicker3 () {
            this.$refs.picker3.open();
        },
        handlePicker3 (value) {
            console.log('datetime-picker.handlePicker3: ', value);
            this.value3 = value;
        },

        openPicker4 () {
            this.$refs.picker4.open();
        },
        handlePicker4 (value) {
            console.log('datetime-picker.handlePicker4: ', value);
            this.value4 = value;
        },

        openPicker5 () {
            this.$refs.picker5.open();
        },
        handlePicker5 (value) {
            console.log('datetime-picker.handlePicker5: ', value);
            this.value5 = value;
        },

        openPicker6 () {
            this.$refs.picker6.open();
        },
        handlePicker6 (value) {
            console.log('datetime-picker.handlePicker6: ', value);
            this.value6 = value;
        },

        openPicker7 () {
            this.$refs.picker7.open();
        },
        handlePickerInput7 (value) {
            console.log('datetime-picker.handlePickerInput7: ', value);
            // this.value7 = value;
        },
        handlePicker7 (dates) {
            console.log('datetime-picker.handlePicker7: ', dates);
            // this.value7 = value;
            if (dates && dates.length && dates[0].val) {
                this.startEndTime = dates[0].lab + ' 至 ' + (dates[1].val ? dates[1].lab : utils.formatTime(Date.now(), 'yyyy-MM-dd'));
            } else {
                this.$toast('日期得选...');
            }
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .page-datetime-picker {

    }
</style>
