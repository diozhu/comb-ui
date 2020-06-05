<template>
    <section class="v-table-wrapper__body-wrapper" :style="{ height: getBodyHeight }">
        <div class="v-table-body-container" v-for="record in animationResult" :key="record[recordKey]">
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
import RenderBody from './expand';

export default {
    name: 'v-table-body-async',
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
        return {
            countOfRender: 0,
            loopCount: 0,
            addNumber: 20,
            animationResult: []
        };
    },
    computed: {
        getRecordHeight: function() {
            return `${this.recordHeight}px`;
        },
        getBodyHeight: function() {
            return `${this.bodyHeight}px`;
        },
        filterResult: function() {
            return this.data.filter(record => {
                return !record.isHidden;
            });
        }
    },
    methods: {
        getColumnStyle: function(column) {
            return {
                width: column.widthExt,
                height: `${this.recordHeight}px`
            };
        },
        addRecord: function() {
            const beginIndex = this.countOfRender * this.addNumber;
            const endIndex = beginIndex + this.addNumber;
            const records = this.filterResult.slice(beginIndex, endIndex);
            this.animationResult = this.animationResult.concat(records);
            this.countOfRender += 1;
            this.loopRender();
        },
        loopRender: function() {
            if (this.countOfRender < this.loopCount) {
                window.requestAnimationFrame(this.addRecord);
            }
        },
        removeAllAnimationRecord: function() {
            this.animationResult = [];
        },
        generateRecords: function() {
            this.countOfRender = 0;
            const total = this.filterResult.length;
            this.loopCount = total / this.addNumber;
            this.removeAllAnimationRecord();
            this.addRecord();
        }
    },
    watch: {
        data: {
            handler: function(val) { //eslint-disable-line
                this.generateRecords();
            },
            immediate: true
        }
    }
};
</script>

<style lang="scss"></style>
