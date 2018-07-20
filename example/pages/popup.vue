<template>
    <div class="page page-message-box">
        <ul class="listview listview-form">
            <li>
            <v-cell title="点击popup" value="注释浮动" is-link @click.native="popupVisible1 = true"></v-cell>
            </li>
            <li>
            <v-cell title="点击popup" value="顶部浮动" is-link @click.native="popupVisible2 = true"></v-cell>
            </li>
            <li>
            <v-cell title="点击popup" value="右侧弹出" is-link @click.native="popupVisible3 = true"></v-cell>
            </li>
            <li>
                <v-cell title="点击popup" value="底部弹出" is-link @click.native="popupVisible4 = true"></v-cell>
            </li>
        </ul>

        <div class="popup-con">
            <v-popup v-model="popupVisible1" position="middle" class="v-popup-float">
                <h2>标题</h2>
                <p>注释文字注释文字注释文字注释文字注释文字注释文字</p>
            </v-popup>
            <v-popup v-model="popupVisible2" position="top" class="v-popup-top" :modal="false">
                <p>更新成功</p>
            </v-popup>
            <v-popup v-model="popupVisible3" position="right" class="v-popup-panel" :modal="false">
                <v-button @clvick.native="popupVisible3 = false">关闭 popup</v-button>
            </v-popup>
            <v-popup v-model="popupVisible4" class="v-popup-4">
                <v-picker v-model="dateValue" :slots="dateSlots" @change="onDateChange" :visible-item-count="5"
                          :show-toolbar="true">
                    <span class="v-popup-action v-popup-cancel" @click="popupVisible4 = false">取消</span>
                    <span class="v-popup-action v-popup-confirm" @click="confirm">确定</span>
                </v-picker>
            </v-popup>
        </div>

    </div>
</template>

<script>
// import vPopup from '../../packages/v-popup.vue';

export default {
    // components: { vPopup },

    data () {
        return {
            popupVisible1: false,
            popupVisible2: false,
            popupVisible3: false,
            popupVisible4: false,
            buttonBottom: 0,
            dateSlots: [{
                flex: 1,
                values: ['1984', '1985', '1986', '1987', '1988', '1989', '1990', '1991', '1992', '1993', '1994', '1995'],
                className: 'slot1'
            }],
            dateValue: ''
        };
    },
    created () {
    },
    watch: {
        popupVisible2 (val) {
            if (val) {
                setTimeout(() => {
                    this.popupVisible2 = false;
                }, 2000);
            }
        }
    },
    methods: {
        onDateChange (picker, values) {
            console.log('values:::', values);

            if (values[0] > values[1]) {
                picker.setSlotValue(1, values[0]);
            }
            this.dateValue = values[0];
        },

        confirm () {
            this.$logger.log('popup.confirm: ');
            this.$toast(this.dateValue);
            this.popupVisible4 = false;
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .page-message-box {

    }
</style>
