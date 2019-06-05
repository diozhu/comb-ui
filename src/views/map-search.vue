<template>
    <div class="page page-map-search">
        <v-map
            :zoom="zoom"
            drag-enable
            :keywords="keywords"
            placeSearchEnable
        ></v-map>

        <!-- <v-row :aligment="true">
            <v-col>
                <input type="text" v-model="keywords" />
            </v-col>
        </v-row> -->

        <v-row :aligment="true">
            <v-col>
                <v-button type="primary" size="small">查询</v-button>
            </v-col>
        </v-row>

        <!-- <div id="panel"></div> -->

    </div>
</template>

<script>
    import vMap from '../vendors/v-map.vue';
    import vRow from '../vendors/v-row.vue';
    import vCol from '../vendors/v-col.vue';
    import vButton from '../vendors/v-button.vue';
    import * as utils from '../js/utils/utils.js';
    import bus from '../vendors/eventbus.js';


    export default {
        components: { vMap, vRow, vCol, vButton },
        data () {
            return {
                keywords: '',
                zoom: 12
            };
        },
        mounted () {
            this.init();
        },
        methods: {
            init () {
            }
        }
    };
</script>

<style rel="stylesheet/scss" lang="scss">
    @import "../scss/_variables.scss";
    @import "../scss/_icon.scss";

    .page-map-search {

        .v-map {
            height: 500px;

        }

        .v-row {
            margin: 10px;
        }
    }
</style>
