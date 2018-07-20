<template>
    <div class="page page-button">
        <v-button>normal</v-button>
        <v-button :disabled="true">normal-disable</v-button>
        <v-button nativeType="submit">submit</v-button>

        <v-button size="small">default</v-button>
        <v-button type="danger" size="small">danger</v-button>
        <v-button type="primary" size="small">primary</v-button>
        <v-button type="info" size="small">info</v-button>

        <v-button size="full" styles="rectangle">default.full</v-button>

        <v-row>
            <v-col>
                <v-button styles="circle">default.circle</v-button>
            </v-col>
        </v-row>

        <v-row :gutter="30" :avg="true">
            <v-col :span="6">
                <v-button>default</v-button>
            </v-col>
            <v-col :span="6">
                <v-button type="danger">danger</v-button>
            </v-col>
        </v-row>

        <v-row :gutter="30">
            <v-col :span="6" :gutter="0">
                <v-button styles="rectangle">default</v-button>
            </v-col>
            <v-col :span="6" :gutter="0">
                <v-button type="info" styles="rectangle">info</v-button>
            </v-col>
        </v-row>


    </div>
</template>

<script>
export default {
    data () {
        return {
        };
    },
    created () {
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../../src/scss/_variables.scss";

    .page-button {
        padding: 0 ($grid-gutter-width / 2);

        .v-btn {
            margin: pxTorem(20) 0;
        }
    }
</style>
