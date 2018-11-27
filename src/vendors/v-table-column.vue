<template>
    <div class="v-table-column">

    </div>
</template>

<script>
    export default {
        name: 'v-table-column',
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
            console.log('v-table-column.mounted: ');
            this.init();
        },
        methods: {
            init () {
                console.log('v-table-column.init: ');
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/_mixins";

    .v-table-column {

    }

</style>
