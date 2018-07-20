<script type="text/ecmascript-6">
export default {
    name: 'v-col',

    props: {
        span: {
            type: Number,
            default: 12
        },
        gutter: {
            type: Number,
            default: -1
        }
    },

    data () {
        return {
        };
    },

    computed: {
        parentGutter () {
            return this.$parent.gutter;
        },
        dpr () {
            return this.$parent.dpr;
        },
        ratio () {
            return this.$parent.ratio;
        },
        avg () {
            return this.$parent.avg;
        },

        style () {
            let ret = {},
                gutter;
            if (this.gutter === 0) {
                gutter = 0;
            } else if (this.gutter === -1) {
                gutter = this.parentGutter;
            } else {
                gutter = this.gutter;
            }

            if (gutter) {
                ret.paddingLeft = gutter / this.ratio / (this.avg ? 4 : 2) + 'rem';
                ret.paddingRight = ret.paddingLeft;
            }

            return ret;
        }
    },
    render (h) {
        let {style} = this;
        let classList = ['v-col'];

        ['span', 'offset', 'pull', 'push'].forEach(prop => {
            if (this[prop]) {
                classList.push(
                    prop !== 'span'
                        ? `v-col-${prop}-${this[prop]}`
                        : `v-col-${this[prop]}`
                );
            }
        });

        return h('div', {
            attrs: {
                class: classList.join(' ')
            },
            style: style
        }, this.$slots.default);
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../src/scss/_variables.scss";

    %grid-column {
        position: relative;
        min-height: 1px; // Prevent columns from collapsing when empty
        box-sizing: border-box;
    }

    @for $i from 1 through $grid-columns {
        .v-col-#{$i} {
            @extend %grid-column;
            flex-shrink: 0;
            flex-grow: 0;
            flex-basis: percentage($i / $grid-columns);
        }
    }

</style>
