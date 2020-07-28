<template>
    <div class="v-weather container">
        <svg id="inner" class="inner">
			<defs>
                <linearGradient id="linearGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:rgba(250,250,250,1);
                    stop-opacity:1"/>
                    <stop offset="50%" style="stop-color:rgba(250,250,250,0);
                    stop-opacity:1"/>
                    <stop offset="100%" style="stop-color:rgba(250,250,250,1);
                    stop-opacity:1"/>
                </linearGradient>
				<path id="leaf" d="M41.9,56.3l0.1-2.5c0,0,4.6-1.2,5.6-2.2c1-1,3.6-13,12-15.6c9.7-3.1,19.9-2,26.1-2.1c2.7,0-10,23.9-20.5,25 c-7.5,0.8-17.2-5.1-17.2-5.1L41.9,56.3z"/>
			</defs>
			<circle id="sun" style="fill: #F7ED47" cx="0" cy="0" r="50"/>
			<g id="layer3"></g>
			<g id="cloud3" class="cloud" style="fill:url(#linearGradient)"></g>
			<g id="layer2"></g>
			<g id="cloud2" class="cloud" style="fill:url(#linearGradient)"></g>
			<g id="layer1"></g>
			<g id="cloud1" class="cloud" style="fill:url(#linearGradient)"></g>
			<!-- <g id="layer3"></g>
			<g id="cloud3" class="cloud"></g>
			<g id="layer2"></g>
			<g id="cloud2" class="cloud"></g>
			<g id="layer1"></g>
			<g id="cloud1" class="cloud"></g> -->
        </svg>
    </div>
</template>
<script>
/**
 * v-weather组件
 *              -- Author by Dio Zhu. on 2019.10.21
 */
export default {
    name: 'v-weather',

    props: {
        value: {
            type: Number,
            default: 0
        }
    },

    data () {
        return {
             tickCount: 0,
             settings: {
                windSpeed: 2,
                rainCount: 0,
                leafCount: 0,
                snowCount: 0,
                cloudHeight: 0,
                cloudSpace: 20,
                cloudArch: 50,
                renewCheck: 100,
                splashBounce: 60
            },
            sizes: {
                container: {width: document.body.offsetWidth, height: 160},
                card: {width: document.body.offsetWidth, height: 30}
            },
            weather: [
                { type: 'snow', name: 'Snow'},
                { type: 'wind', name: 'Windy'},
                { type: 'rain', name: 'Rain'},
                { type: 'thunder', name: 'Storms'},
                { type: 'sun', name: 'Sunny'}
            ],
            currentWeather: {}
       };
    },

    computed: {
    },

    watch: {
    },

    mounted () {
        this.init();
    },

    methods: {
        init () {
            let p1 = this.importSnapSvg(),
                p2 = this.importTweenMax();
            Promise.all([p1, p2]).then(() => {
                console.log('v-weather.init: total complete...');
                this.initClouds();
                this.currentWeather = this.weather[0];
                requestAnimationFrame(this.tick);
            });
        },
        importSnapSvg () {
            return new Promise(resolve => {
                if (window.Snap) return resolve();
                console.log(`v-weather.${this._uid}.importSnapSvg ... `);
                let script = this.createScript('snapsvg');
                script.onload = function () {
                    resolve();
                };
                document.head.appendChild(script);
            });
        },
        importTweenMax () {
            return new Promise(resolve => {
                if (window.TweenMax) return resolve();
                console.log(`v-weather.${this._uid}.importTweenMax ... `);
                let script = this.createScript('TweenMax');
                script.onload = function () {
                    resolve();
                };
                document.head.appendChild(script);
            });
        },
        createScript (filename) {
            this.$root.amapImportTag = true; // 全局的加载标识
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.defer = true;
            script.id = filename;
            if (filename === 'TweenMax') script.src = location.protocol + '//vendors.91wuliu.com/tweenmax/2.1.3/TweenMax.min.js';
            else script.src = location.protocol + '//vendors.91wuliu.com/snapsvg/0.5.0/snap.svg.min.js';
            return script;
        },
        initClouds () {
            this.clouds = [
                {group: window.Snap.select('#cloud1')},
                {group: window.Snap.select('#cloud2')},
                {group: window.Snap.select('#cloud3')}
            ];

            this.clouds.forEach((c, i) => {
                c.offset = Math.random() * this.sizes.card.width;

                var space  = this.settings.cloudSpace * i;
                var height = space + this.settings.cloudHeight;
                var arch = height + this.settings.cloudArch + (Math.random() * this.settings.cloudArch);
                var width = this.sizes.card.width;

                var points = [];
                points.push('M' + [-(width), 0].join(','));
                points.push([width, 0].join(','));
                points.push('Q' + [width * 2, height / 2].join(','));
                points.push([width, height].join(','));
                points.push('Q' + [width * 0.5, arch].join(','));
                points.push([0, height].join(','));
                points.push('Q' + [width * -0.5, arch].join(','));
                points.push([-width, height].join(','));
                points.push('Q' + [- (width * 2), height/2].join(','));
                points.push([-(width), 0].join(','));

                var path = points.join(' ');
                if(!c.path) c.path = c.group.path();
                c.path.animate({
                    d: path
                }, 0)
            });
        },
        tick () {
            this.tickCount++;
            let check = this.tickCount % this.settings.renewCheck;
            if(check) {
            //     if(rain.length < settings.rainCount) makeRain();
            //     if(leafs.length < settings.leafCount) makeLeaf();
            //     if(snow.length < settings.snowCount) makeSnow();
            }

            for(var i = 0; i < this.clouds.length; i++) {
                if(this.currentWeather.type == 'sun') {
                    // if(clouds[i].offset > -(sizes.card.width * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1);
                    // if(clouds[i].offset > sizes.card.width * 2.5) clouds[i].offset = -(sizes.card.width * 1.5);
                    // clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
                } else {
                    this.clouds[i].offset += this.settings.windSpeed / (i + 1);
                    if(this.clouds[i].offset > this.sizes.card.width) this.clouds[i].offset = 0 + (this.clouds[i].offset - this.sizes.card.width);
                    this.clouds[i].group.transform('t' + this.clouds[i].offset + ',' + 0);
                }
            }

            requestAnimationFrame(this.tick);
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "../scss/variables";

.v-weather {
    &.container {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
            -ms-flex-direction: column;
                flex-direction: column;
        -webkit-box-align: center;
            -ms-flex-align: center;
                align-items: center;
        -webkit-box-pack: center;
            -ms-flex-pack: center;
                justify-content: center;
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: auto;
        position: relative;
        // background: #eee;
        // background: -webkit-linear-gradient(210deg, rgba(150, 50, 50, 0.3), rgba(0, 0, 200, 0));
        // background: linear-gradient(240deg, rgba(150, 50, 50, 0.3), rgba(0, 0, 200, 0));
        // background: linear-gradient(240deg, rgba(150, 50, 50, 0.3), transparent);
        // background-image: linear-gradient(right,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%);
    }
    .inner {
        width: 100%;
        height: 100%;
        // background-color: white;
        // background: -webkit-linear-gradient(top, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
        // background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
    }

    #cloud1 {
        fill: #efefef;
    }
    #cloud2 {
        fill: #E6E6E6;
    }
    #cloud3 {
        fill: #D5D5D5;
    }
}
</style>
