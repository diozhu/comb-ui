<template>
    <div class="qr-code"
         :id="cusId">
    </div>
</template>
<script>
    import QRCode from '../../static/js/vendor/qrcode.min';

    /**
     * 二维码
     *              -- Author by Xiowei Shen. on 2017.4.17
     */
    export default {
        name: 'v-qr-code',

        props: {
            cusId: String,
            cusUrl: String,
            cusWidth: Number,
            cusHeight: Number
        },
        data () {
            return {
                el: null
            };
        },
        ready: function () {
            console.log('form qr-code $el... ' + this.el);
        },
        created: function () {
            console.log('form qr-code... ' + this.cusUrl);
//            this.codeModule();
        },
        mounted () {
            this.$nextTick(() => {
                this.el = document.getElementById(this.cusId);
                console.log('v-qr-code.mounted...' + this.el);
                this.codeModule();
            });
        },
        methods: {
            codeModule () {
                var that = this;
                var qrcode;
                console.log('codeModule');
                that.$logger.log('form v-qr-code... ' + that.el);
                qrcode = new QRCode(that.el, { //eslint-disable-line
                    width: that.cusWidth, // 设置宽高
                    height: that.cusHeight
                });
                qrcode.makeCode(that.cusUrl);
                setTimeout(function () {
                    var $img = that.el.getElementsByTagName('img')[0];
                    var imgsrc = $img.src;
                    var $newimg = document.createElement('img');
                    $newimg.src = imgsrc;
                    $newimg.id = 'hidImg';
                    that.el.appendChild($newimg);
                }, 500);
            }
        }
    };
</script>
<style rel="stylesheet/scss" lang="scss">

    @import "../scss/variables";

    @mixin circle-corner($radius) {
        border-radius: $radius;
    }

</style>
