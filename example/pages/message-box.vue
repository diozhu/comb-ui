<template>
    <div class="page page-message-box">
        <ul class="listview listview-form">
            <li>
                <v-cell title="点击弹出alert" value="默认样式" is-link @click.native="openAlert"></v-cell>
            </li>
            <li>
                <v-cell title="点击弹出alert" value="无标题、多行内容" is-link @click.native="openAlertMulti"></v-cell>
            </li>
            <li>
                <v-cell title="点击弹出alert" value="带参数" is-link @click.native="openAlertCus"></v-cell>
            </li>
            <li>
                <v-cell title="点击弹出confirm" value="默认样式" is-link @click.native="openConfirm"></v-cell>
            </li>
            <li>
                <v-cell title="点击弹出confirm" value="纯标题" is-link @click.native="openConfirmLimit"></v-cell>
            </li>
            <li>
                <v-cell title="点击弹出prompt" value="默认样式" is-link @click.native="openPrompt"></v-cell>
            </li>
        </ul>

    </div>
</template>

<script>
import { MessageBox } from '../../packages/v-message-box';

export default {
    data () {
        return {
        };
    },
    created () {
    },
    methods: {
        openAlert: function () {
            MessageBox.alert('请检查你的网络设置', '发送申请失败');
        },
        openAlertMulti: function () {
            MessageBox.alert('请检查你的网络设置请检查你的网络设置请检查你的网络设置请检查你的网络设置');
        },
        openAlertCus: function () {
            MessageBox({title: '标题', message: '内容', confirmButtonText: '知道了'});
        },

        openConfirm () {
            MessageBox.confirm('确定执行此操作?', '提示').then(act => {
                this.$toast('您点击了确认~');
            }).catch(act => {
                this.$toast('您点击了取消~');
            });
        },
        openConfirmLimit: function () {
            MessageBox.confirm('',
                `退出群聊后，
将不再接受此群聊消息`
            ).then(act => {
                this.$toast('您点击了确认~');
            }).catch(act => {
                this.$toast('您点击了取消~');
            });
        },

        openPrompt () {
            MessageBox.prompt('请填写邀请码或者邀请者的手机号可以获得10个通宝', '', {
                inputPlaceholder: '输入邀请码或邀请人手机号'
            }).then(({ value }) => {
                if (value) {
                    this.$toast(`您输入的是：${value}`);
                }
            }).catch(() => {});
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .page-message-box {

    }
</style>
