<script type="text/ecmascript-6">
    import Vue from 'vue';
    import InfiniteScroller from '../js/utils/infinite.js';
    import ContentSource from '../js/utils/content-source.js';
    import {
        getEventPosition,
        requestAnimationFrame,
        preventDefaultException,
        assign
    } from '../js/utils/util.js';
    import bus from '../vendor/eventbus.js';

    const Loading = {
        render (h) {
            return h('div', {
                attrs: {
                    class: 'v-scroll-infinite__loading'
                }
            }, 'Loading...');
        }
    };

    const Tombstone = {
        render (h) {
            return h('div', {
                attrs: {
                    class: 'v-scroll-infinite__item tombstone'
                },
                style: {
                    height: '100px',
                    width: '100%'
                }
            }, '');
        }
    };

    const options = {
        preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|IMG)$/ },
        distance: 50,
        animation_duration_ms: 200,
        tombstone_class: 'tombstone',
        invisible_class: 'invisible',
        prerender: 20,
        remain: 10,
        preventDefault: false,
        column: 1,
        waterflow: false,
        cacheVM: 0,
        reuseVM: false,
        props: {}
    };

    export default {
        name: 'v-scroll-infinite',
        props: {
            fetch: Function, // Data fetching function
            list: Array, // List data of RecyclerView
            item: Object, // The Vue component of RecyclerView's item
            loading: Object, // The loading component behind the RecyclerView pull-to-refresh
            tombstone: { // The Vue component of RecyclerView's tombstone
                type: Object,
                default: () => Tombstone
            },
            column: Number, // Specifies how many columns the listings should be displayed in
            prerender: Number, // Number of items to instantiate beyond current view in the opposite direction. default 20
            remain: Number, // Number of items to instantiate beyond current view in the opposite direction. default 10
            waterflow: Boolean,
            preventDefault: Boolean,
            options: Object,
            tag: {
                type: String,
                default: 'div'
            }
        },
        render (h) {
            return h(this.tag, {
                attrs: {
                    class: 'v-scroll-infinite'
                }
            }, [
                h(this.loading || Loading),
                h(this.tag, {
                    ref: 'recyclerview', // mod by Dio Zhu. on 2017.9.14
                    attrs: {
                        class: 'v-scroll-infinite__container'
                    },
                    on: {
                        touchstart: this._start,
                        touchmove: this._move,
                        touchend: this._end,
                        touchcancel: this._end,
                        mousedown: this._start,
                        mousemove: this._move,
                        mouseup: this._end
                    }
                })]
            );
        },
        data () {
            return {
                startPointer: {
                    x: 0,
                    y: 0
                },
                _options: {},
                distance: 0,
                pulling: false,
                _contentSource: null,
                scroller: null
            };
        },
        created () {
            bus.$on('v-scroll-infinite.init', this.init);
        },
        mounted () {
            console.log('v-scroll-infinite.mounted: ');
            this.init();
        },
        beforeDestroy () {
            this.scroller.destroy();
            this.scroller = null;
        },
        methods: {
            init () {
                console.log(`v-scroll-infinite.${this._uid}.init ... `);
                this._options = assign({}, options, {
                    prerender: this.prerender || options.prerender,
                    remain: this.remain || options.remain,
                    column: this.column || options.column,
                    waterflow: this.waterflow || options.waterflow,
                    fetch: this.fetch,
                    list: this.list,
                    item: this.item,
                    loading: this.loading,
                    tombstone: this.tombstone
                }, this.options);

                this._contentSource = new ContentSource(Vue, this._options);

                // this.$list = this.$el.querySelector('.recyclerview');
                this.$list = this.$refs.recyclerview; // mod by Dio Zhu. on 2017.9.14
                this.scroller = new InfiniteScroller(
                    this.$list,
                    this._contentSource,
                    this._options
                );
                this.$emit('inited');
            },
            scrollToIndex (index) {
                if (this.waterflow) {
                    for (let i = 0, len = this.scroller.items_.length;i < len;i++) {
                        if (i === index) {
                            this._scrollTo(this.scroller.items_[i].top - this.scroller.items_[i].height * this._options.column + this.$list.offsetWidth);
                        }
                    }
                    return;
                }
                index = Number(index);
                this.scroller.scrollToIndex(index);
                this.$nextTick(() => {
                    this._scrollToBottom();
                });
            },
            _scrollTo (top) {
                top = top || 0;
                this.$list.scrollTop = Number(top);
            },
            _scrollToBottom () {
                this._scrollTo(this.$list.scrollHeight);
            },
            _renderListStyle () {
                this.$list.style.transform = 'translate3d(0, ' + this.distance + 'px, 0)';
            },
            _start (e) {
                if (this.$list.scrollTop > 0) return;
                this.pulling = true;
                this.startPointer = getEventPosition(e);
                this.$list.style.transition = 'transform .2s';
                if (this.preventDefault && !preventDefaultException(e.target, this._options.preventDefaultException)) {
                    e.preventDefault();
                }
            },
            _move (e) {
                if (!this.pulling) return;
                const pointer = getEventPosition(e);
                const distance = pointer.y - this.startPointer.y;

                if (distance < 0) {
                    this._scrollTo(-distance);
                    return;
                }

                if (this.preventDefault && !preventDefaultException(e.target, this._options.preventDefaultException)) {
                    e.preventDefault();
                }

                this.distance = Math.floor(distance * 0.5);
                if (this.distance > this._options.distance) {
                    this.distance = this._options.distance;
                }
                requestAnimationFrame(this._renderListStyle.bind(this));
            },
            _end (e) {
                if (!this.pulling) return;
                if (this.preventDefault && !preventDefaultException(e.target, this._options.preventDefaultException)) {
                    e.preventDefault();
                }
                this.pulling = false;
                this.$list.style.transition = 'transform .3s';
                this.$nextTick(() => {
                    this.$list.style.transform = '';
                });
                if (this.distance >= this._options.distance) {
                    this.distance = 0;
                    this.scroller.clear();
                }
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">
    @import "../scss/variables";
    @import "../scss/mixins";

    .v-scroll-infinite {
        position: relative;
        height: 100%;

        .v-scroll-infinite__loading {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #9E9E9E;
        }
        .v-scroll-infinite__container {
            background: #fff;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            overflow-y: scroll;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            height: 100%;
            position: absolute;
            box-sizing: border-box;
            contain: layout;
            will-change: transform;

            // li {
            //     position: absolute;
            // }

            .invisible {
                display: none;
            }
        }

    }
</style>
