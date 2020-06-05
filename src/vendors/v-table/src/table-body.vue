<template>
    <section class="v-table-wrapper__body-wrapper" :style="{ height: getBodyHeight }">
        <div class="v-table-body-container" v-for="record in data" :key="record[recordKey]">
            <ul class="v-table-body__record" :style="{ height: getRecordHeight }">
                <li
                    class="v-table-body-column"
                    v-for="(column, index) in columns"
                    :key="index"
                    :columnKey="column.prop"
                    :title="record[column.prop]"
                    :style="getColumnStyle(column)"
                >
                    <div class="v-table-body-column__container">
                        <span v-if="!column.render">{{ record[column.prop] }}</span>
                        <render-body
                            v-else
                            :key="column.prop"
                            :row="record"
                            :render="column.render"
                            :index="index"
                        ></render-body>
                    </div>
                </li>
            </ul>
        </div>
    </section>
</template>

<script>
import RenderBody from './expand.js';

export default {
    name: 'v-table-body',
    components: { RenderBody },
    props: {
        columns: Array,
        data: Array,
        recordKey: String,
        recordHeight: Number,
        bodyHeight: Number,
        showIndex: Boolean,
        showCheckbox: Boolean
    },
    data() {
        return {};
    },
    computed: {
        getRecordHeight: function() {
            return `${this.recordHeight}px`;
        },
        getBodyHeight: function() {
            return `${this.bodyHeight}px`;
        }
    },
    methods: {
        getColumnStyle: function(column) {
            return {
                width: column.widthExt,
                height: `${this.recordHeight}px`
            };
        }
    }
};
</script>

<style lang="scss"></style>
