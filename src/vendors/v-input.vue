<template>
    <div class="v-input">
        <div v-if="options && options.label" :class="['v-input__tit', options.labelClass]">{{ options.label }}</div>
        <div v-if="cb" class="v-input__con">
            <p :id="id" :class="[{holder: !value}, options.inputClass]">{{ value? value: options.descr }}</p>
            <i class="icon app icon-arrow-r v-input__arrow"></i>
        </div>
        <div v-else class="v-input__con">
            <input v-if="type === 'number'" type="number" :id="id" :placeholder="options.descr" :class="[options.inputClass]" :value="value" pattern="[0-9]*" />
            <input v-else
                   type="text"
                   @change="$emit('change', currentValue)"
                   :id="id"
                   :placeholder="options.descr"
                   :class="[options.inputClass]"
                   v-model="currentValue"
            />
        </div>
    </div>
</template>
<script>
    export default {
        props: {
            id: String,
            value: String,
            type: String,
            options: Object,
            cb: Function,
            attr: Object,           // 设置原生属性，例如 :attr="{ maxlength: 10 }"
            limit: { // 字数限制
                type: Number,
                default: 0
            }
        },

        data () {
            return {
                currentValue: this.value,
                len: 0
            };
        },

        watch: {
            value (val) {
                this.currentValue = val;
            },

            currentValue (val) {
                this.len = val.length;
                if (this.limit && this.len > this.limit) {
                    this.currentValue = val.substr(0, this.limit);
                    return;
                }
                this.$emit('input', val);
            },

            attr: {
                immediate: true,
                handler (attrs) {
                    this.$nextTick(() => {
                        const target = [this.$refs.input, this.$refs.textarea];
                        target.forEach(el => {
                            if (!el || !attrs) return;
                            Object.keys(attrs).map(name => el.setAttribute(name, attrs[name]));
                        });
                    });
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    $line-height: pxTorem(44px);
    $tit-color: #000;
    $tit-color-light: #737373;
    $placeholder-color: #007AFF;

    .v-input {
        position: relative;
        height: 100%;
        margin-left: pxTorem(15px);
        @include box_flex;
        @include align_items(start);
        @include justify-content(space-between);
    }
    .v-input__tit{
        width: 24%;
        height: 100%;
        font-size: pxTorem(15px);
        line-height: $line-height;
        color: $tit-color;

        @include box_flex;
        @include align_items(center);

        &.light {
            color: $tit-color-light;
        }
    }
    .v-input__con{
        width: 76%;
        height: 100%;
        //border-bottom: #DDDEE3 pxTorem(1px) solid;

        > input {
            width: 100%;
            height: 100%;
            font-size: pxTorem(15px);
            padding-right: pxTorem(15px);
            @include placeholder-color(#737373);

            &.holder-blue {
                @include placeholder-color($placeholder-color);
            }
        }

        >p{
            height: $line-height;
            line-height: $line-height;
            font-size: pxTorem(15px);
            color: #000;

            &.holder {
                color: #737373;
            }
        }

    }
    .v-input__arrow {
        position: absolute;
        color: #ccc;
        font-size: pxTorem(14px);
        margin-top: pxTorem(-7px);
        right: pxTorem(10px);
        top:50%;
    }
</style>
