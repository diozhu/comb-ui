<template>
    <div class="page page-layout">
        <v-row>
            <v-col :span="12">1/1</v-col>
        </v-row>
        <v-row>
            <v-col :span="6">1/2</v-col>
            <v-col :span="6">1/2</v-col>
        </v-row>
        <v-row>
            <v-col :span="4">1/3</v-col>
            <v-col :span="4">1/3</v-col>
            <v-col :span="4">1/3</v-col>
        </v-row>
        <v-row>
            <v-col :span="3">1/4</v-col>
            <v-col :span="3">1/4</v-col>
            <v-col :span="3">1/4</v-col>
            <v-col :span="3">1/4</v-col>
        </v-row>
        <v-row>
            <v-col :span="2">1/6</v-col>
            <v-col :span="2">1/6</v-col>
            <v-col :span="2">1/6</v-col>
            <v-col :span="2">1/6</v-col>
            <v-col :span="2">1/6</v-col>
            <v-col :span="2">1/6</v-col>
        </v-row>
        <v-row>
            <v-col :span="2">1/6</v-col>
            <v-col :span="10">5/6</v-col>
        </v-row>

        <br/>
        <v-row justify="space-between">
            <v-col :span="3">1/4</v-col>
            <v-col :span="3">1/4</v-col>
        </v-row>
        <br/>

        <v-row justify="center">
            <v-col :span="3">1/4</v-col>
            <v-col :span="3">1/4</v-col>
        </v-row>
        <br/>

        <v-row justify="end">
            <v-col :span="3">1/4</v-col>
            <v-col :span="3">1/4</v-col>
        </v-row>
        <br/>

        <v-row>
            <v-col :span="6">第一个第一个第一个第一个第一个第一个第一个第一个</v-col>
            <v-col :span="6">第二个第二个第二个第二个第二个第二个第二个第二个第二个</v-col>
            <v-col :span="6">第三个第三个第三个第三个第三个第三个第三个第三个第三个第三个</v-col>
            <v-col :span="6">第四个第四个第四个第四个第四个第四个第四个第四个第四个第四个第四个</v-col>
        </v-row>
        <br/>

        <v-row :gutter="30">
            <v-col :span="6"><p>文字</p></v-col>
            <v-col :span="6"><p>文字</p></v-col>
        </v-row>
        <v-row :gutter="30">
            <v-col :span="4"><p>文字</p></v-col>
            <v-col :span="4"><p>文字</p></v-col>
            <v-col :span="4"><p>文字</p></v-col>
        </v-row>
        <v-row :gutter="30">
            <v-col :span="3"><p>文字</p></v-col>
            <v-col :span="3"><p>文字</p></v-col>
            <v-col :span="3"><p>文字</p></v-col>
            <v-col :span="3"><p>文字</p></v-col>
        </v-row>
        <br/>

        <v-row :gutter="30" :avg="true">
            <v-col :span="6"><p>文字</p></v-col>
            <v-col :span="6"><p>文字</p></v-col>
        </v-row>
        <v-row :gutter="30" :avg="true">
            <v-col :span="4"><p>文字</p></v-col>
            <v-col :span="4"><p>文字</p></v-col>
            <v-col :span="4"><p>文字</p></v-col>
        </v-row>
        <v-row :gutter="30" :avg="true">
            <v-col :span="3"><p>文字</p></v-col>
            <v-col :span="3"><p>文字</p></v-col>
            <v-col :span="3"><p>文字</p></v-col>
            <v-col :span="3"><p>文字</p></v-col>
        </v-row>
        <br/>

        <v-row :gutter="30">
            <v-col :span="6"><p>文字</p></v-col>
            <v-col :span="6">
                <v-row :gutter="30">
                    <v-col :span="6"><p>文字</p></v-col>
                    <v-col :span="6"><p>文字</p></v-col>
                </v-row>
                <v-row :gutter="30">
                    <v-col :span="6"><p>文字</p></v-col>
                    <v-col :span="6"><p>文字</p></v-col>
                </v-row>
            </v-col>
        </v-row>
        <br/>

        <v-row :gutter="30" :avg="true">
            <v-col :span="6"><p>文字</p></v-col>
            <v-col :span="6">
                <v-row :gutter="30" :avg="true">
                    <v-col :span="6"><p>文字</p></v-col>
                    <v-col :span="6"><p>文字</p></v-col>
                </v-row>
                <v-row :gutter="30" :avg="true">
                    <v-col :span="6"><p>文字</p></v-col>
                    <v-col :span="6"><p>文字</p></v-col>
                </v-row>
            </v-col>
        </v-row>
        <br/>

    </div>
</template>

<script>
export default {
    data () {
        return {
        };
    },
    created () {
    },
    methods: {
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .page-layout {
        padding: 0 ($grid-gutter-width / 2);

        .v-row {

            .v-col {
                line-height: pxTorem(28px);
                background: rgba(86,61,124,0.15);
                border: 1px solid rgba(86,61,124,0.2);

                > p {
                    height: 100%;
                    background: #f2f2f4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }

    }
</style>
