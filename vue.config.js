const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const scripts = [ // 打包后静态文件采用cdn方式，注意与package.json同步版本！！！ Author by Dio Zhu. on 2017.6.27
    { rel: 'preload', url: '//dy-static-h5.oss-cn-beijing.aliyuncs.com/vendor/vue/2.5.16/vue.min.js' },
    { rel: 'preload', url: '//dy-static-h5.oss-cn-beijing.aliyuncs.com/vendor/vue-router/3.0.1/vue-router.min.js' },
    { rel: 'preload', url: '//dy-static-h5.oss-cn-beijing.aliyuncs.com/vendor/axios/0.18.0/axios.min.js' },
    { rel: 'preload', url: '//dy-static-h5.oss-cn-beijing.aliyuncs.com/vendor/vuex/3.0.1/vuex.min.js' },
    { rel: 'preload', url: '//dy-static-h5.oss-cn-beijing.aliyuncs.com/vendor/velocity/1.5.1/velocity.min.js' }
];
const dnsPreOps = [ // 预处理项目中的cdn地址。 Author by Dio Zhu. on 2018.9.3
    { rel: 'dns-prefetch', href: '//hy-sport-img.b0.upaiyun.com' },
    { rel: 'dns-prefetch', href: '//s01.dongyin.net' },
    { rel: 'dns-prefetch', href: '//dy-static-h5.oss-cn-beijing.aliyuncs.com' },
    { rel: 'preconnect', href: '//hy-sport-img.b0.upaiyun.com' },
    { rel: 'preconnect', href: '//s01.dongyin.net' },
    { rel: 'preconnect', href: '//dy-static-h5.oss-cn-beijing.aliyuncs.com' },
];

module.exports = {
    // 是否在保存的时候使用 `eslint-loader` 进行检查
    lintOnSave: undefined,

    baseUrl: process.env.NODE_ENV === 'production' ? "/comb-ui/" : '/',
    outputDir: process.env.NODE_ENV === 'production' ? path.resolve(__dirname, './lib') : undefined,
    assetsDir: "static",
    runtimeCompiler: undefined,
    productionSourceMap: false,
    // parallel: undefined,

    // css: {
    //     // extract: true, // 将组件内的 CSS 提取到一个单独的 CSS 文件 (只用在生产环境中)
    //     // sourceMap: false,
    //     // loaderOptions: {},
    //     // modules: false // 为所有的 CSS 及其预处理文件开启 CSS Modules
    // },

    configureWebpack: config => { // 该对象将会被 webpack-merge 合并入最终的 webpack 配置
        if (process.env.NODE_ENV === 'production') { // 生产环境修改配置...
            config.entry = path.resolve(__dirname, './src/vendors/index.js');
            // console.log('------>>> ', config);
            config.optimization.splitChunks.cacheGroups.default = { minSize: 0 }; // 查了mini-css-extract-plugin源码，默认30K（30*1024）以下的css不进行chunk，会报conflicting order警告。 mod by Dio Zhu. on 2018.9.3
            // 添加externals，vue、vuex、vue-router等使用cdn方式，在此排除后，需要在上面的HtmlWebpackPlugin.scripts中设置外链。 Author by Dio Zhu. on 2017.6.23
            config.externals = {
                'vue': 'Vue',
                'vue-router': 'VueRouter',
                'axios': 'axios',
                'vuex': 'Vuex',
                'velocity-animate': 'Velocity'
            };
            // // 过滤掉默认的plugin或替换成其他的plugin（过滤再push）。。。mod by Dio Zhu. on 2018.9.4
            // let plugins = config.plugins.filter((plugin) => plugin.constructor.name !== 'HtmlWebpackPlugin');
            // config.transpileDependencies = [ // 默认情况下，babel-loader 会排除 node_modules 依赖内部的文件
            //     'comb' // 可以是字符串或正则表达式
            // ];
            if(process.env.npm_lifecycle_event === 'analyze'){
                config.plugins.push(
                    new BundleAnalyzerPlugin() // 打包体积优化
                );
            }
            // config.devtool = false;
        } else { // 开发环境修改配置...
            // config.entry = path.resolve(__dirname, './example/main.js');
            // config.entry = './example/main.js';
            config.resolve = {
                extensions: ['.js', '.vue', '.json'],
                alias: {
                    'vue$': 'vue/dist/vue.esm.js',
                    '@': path.resolve(__dirname, './src'),
                    'assets': path.resolve(__dirname, './src/assets'),
                    // 'assets': __dirname + 'src/assets'
                    // 'jquery': path.resolve(__dirname, './static/js/vendor/jquery.slim.min'),
                    // // '$': path.resolve(__dirname, './static/js/vendor/jquery.slim.min')
                }
            };
            config.output.pathinfo = true; // dev环境下，console中可显示对应的文件位置，而不是打包后的app.js，仅可用于dev环境！   -- Author by Dio Zhu. on 2017.4.20
            config.devtool = false;
            // // config.devtool = '#cheap-module-eval-source-map';
        }
    },

    chainWebpack: config => { // webpack 原始配置的上层抽象，可以添加、修改loader、修改plugin选项
        if (process.env.NODE_ENV === 'production') { // 生产环境修改配置...
            config.plugin('html').tap(args => {
                args[0]['dnsPreOps'] = dnsPreOps; // dns预解析。 Author by Dio Zhu. on 2018.9.4
                args[0]['scripts'] = scripts; // 打包后静态文件采用cdn方式，注意与package.json同步版本！！！ Author by Dio Zhu. on 2017.6.27
                return args;
            });
        }
    },

    pwa: {
        name: '动因体育',
        themeColor: '#FFFFFF',
        msTileColor: '#FFFFFF'
    },

    devServer: {
        port: 8181,
        disableHostCheck: true,
        // index: path.resolve(__dirname, './example/index.html'),
        // contentBase: path.resolve(__dirname, './example'),
        // publicPath: path.resolve(__dirname, './example'),
        open: false,
        historyApiFallback: true,
        noInfo: true,
        overlay: true,
        proxy: {
            '/virtual/order': {
                // target: 'http://server-doing.hy-sport.cn',
                target: 'http://qa.doing.hy-sport.cn',   // qa环境
                // target: 'https://wxapi.dongyin.net',   // 线上环境（20181105）
                // target: 'http://api-dongyin.hy-sport.cn',   // 线上环境
                pathRewrite:{ '^/virtual':'/' }, // 去掉前端虚路径
                changeOrigin: true,
                secure: false
            }
        }
    }
};