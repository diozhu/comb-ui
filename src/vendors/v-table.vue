<template>
    <div class="v-table">

    </div>
</template>

<script>
    export default {
        name: 'v-table',
        props: {
            value: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                currentValue: this.value
            };
        },
        computed: {
        },
        mounted () {
            console.log('v-table.mounted: ');
            this.init();
        },
        methods: {
            init () {
                console.log('v-table.init: ');
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-table{

    }

</style>
