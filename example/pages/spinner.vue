<template>
    <div class="page page-layout">
        <v-spinner color="#007AFF" type="snake"> </v-spinner>
        <br/>

        <v-spinner color="#777E8C" type="triple-bounce"> </v-spinner>
        <br/>

        <v-spinner color="#007AFF" type="fading-circle"> </v-spinner>
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
