<template>
    <ul class="v-table-header__record" :style="getHeaderHeight">
        <!--show checkbox-->
        <li v-if="showCheckbox" class="v-table-header-column v-table__checkbox" :style="getColumnStyle('checkbox')">
            <div class="v-table-body-column__container">
                <i
                    :class="[
                        'icon',
                        { 'icon-subtract': currentSelectedStatus !== 2 },
                        { 'icon-checked': currentSelectedStatus === 2 },
                        { checked: currentSelectedStatus }
                    ]"
                    @click="handleSelectedAll"
                ></i>
                <input type="checkbox" value="" />
            </div>
        </li>
        <!--show index-->
        <li v-if="showIndex" class="v-table-header-column v-table__index" :style="getColumnStyle('index')">
            <div class="v-table-body-column__container">{{ $i18n.t('lang.index') }}</div>
        </li>

        <template v-for="(column, index) in columns">
            <li
                class="v-table-header-column"
                :key="column[cIdKey]"
                :columnKey="column[cIdKey]"
                :title="column.text || column.label"
                :style="getColumnStyle(column)"
                @click="e => handleSort(e, column.prop, index)"
            >
                <div class="v-table-header-column__container">
                    <template v-if="column.isIcon">
                        <!-- <span v-if="column.text">{{ column.text }}</span>
                        <i v-else :class="['icon', column.label]"></i> -->
                        <span v-if="column.label.indexOf('icon-') == -1">{{ column.label }}</span>
                        <i v-else :class="['icon', column.label]"></i>
                    </template>
                    <template v-else>
                        <span v-if="!column.renderHeader">{{ column.label }}</span>
                        <render-header
                            v-else
                            :render="column.renderHeader"
                            :column="column"
                            :index="index"
                        ></render-header>
                    </template>
                    <template v-if="orderBy === column.prop">
                        <i v-if="sortType === 'asc'" class="icon icon-sort-asc"></i>
                        <i v-else class="icon icon-sort-desc"></i>
                    </template>
                </div>
            </li>
        </template>
    </ul>
</template>

<script>
import RenderHeader from './expand';
import { ID_NAME } from './constant';

export default {
    name: 'v-table-header',
    components: { RenderHeader },
    props: {
        columns: Array,
        height: Number,
        showIndex: Boolean,
        showCheckbox: Boolean,
        // selected all
        value: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            cIdKey: ID_NAME,
            currentSelectedStatus: this.selectedAll,
            orderBy: '',
            sortType: ''
        };
    },
    computed: {
        getHeaderHeight: function() {
            return {
                height: `${this.height}px`,
                lineHeight: `${this.height}px`
            };
        }
    },
    watch: {
        value: {
            handler(val) {
                this.currentSelectedStatus = val;
            },
            deep: true
        },
        currentSelectedStatus(val) {
            this.$emit('input', val);
        }
    },
    methods: {
        getColumnStyle: function(column) {
            let rtn = { height: `${this.height}px`, lineHeight: `${this.height}px` };
            if (column.align) rtn.textAlign = column.align;
            if (typeof column === 'string') return rtn;
            else return { width: column.widthExt, ...rtn };
        },
        handleSelectedAll() {
            if (this.currentSelectedStatus) this.currentSelectedStatus = 0;
            else this.currentSelectedStatus = 2;
        },
        handleSort(e, key, idx) {
            if (!this.orderBy) {
                this.orderBy = key;
                this.sortType = 'asc';
            } else if (this.orderBy !== key) {
                this.orderBy = key;
                this.sortType = 'asc';
            } else if (this.orderBy === key && this.sortType === 'asc') {
                this.orderBy = key;
                this.sortType = 'desc';
            } else {
                this.orderBy = '';
                this.sortType = '';
            }
            this.$emit('sort', { e, key, idx, orderBy: this.orderBy, sortType: this.sortType });
        }
    }
};
</script>

<style lang="scss"></style>
