const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const componts = {
    'comb-ui': './src/index.js',
    'spinner': './packages/v-spinner',
    'button': './packages/v-button.vue',
    'cell': './packages/v-cell.vue',
    'col': './packages/v-col.vue',
    'datetime-picker': './packages/v-datetime-picker.vue',
    'field': './packages/v-field.vue',
    'message-box': './packages/v-message-box.js',
    'picker': './packages/v-picker.vue',
    'picker-slot': './packages/v-picker-slot.vue',
    'popup': './packages/v-popup.vue',
    'row': './packages/v-row.vue',
    'toast': './packages/v-toast.js',
    'validator': './packages/v-validator.js',
};
module.exports = {
    // entry: './example/main.js',
    entry: path.resolve(__dirname, './example/main.js'),
    // template: './example/index.html',
    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [path.resolve(__dirname, './packages')],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader?indentedSyntax'
                ],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader'
                        ],
                        'sass': [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader?indentedSyntax'
                        ]
                    }
                    // other vue-loader options go here
                }
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            // 'vue$': 'vue/lib/vue.esm.js',
            'vue$': 'vue/lib/vue.common.js',
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['*', '.js', '.vue', '.json']
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map',
};

if (process.env.NODE_ENV === 'development') {
    module.exports.devServer = {
        host: '127.0.0.1',
        port: '8181',
        // publicPath: path.resolve(__dirname, '/'),
        // publicPath: '/',
        contentBase: path.resolve(__dirname, './example'),
        open: false,
        historyApiFallback: true,
        noInfo: true,
        overlay: true
    };
    module.exports.plugins = [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, './example/index.html'),
            inject: true
        })
    ];
}
if (process.env.NODE_ENV === 'production') {
    // module.exports.entry = './src/index.js';
    module.exports.entry = componts;
    module.exports.devtool = '#source-map';
    module.exports.output = {
        path: path.resolve(__dirname, './lib'),
        publicPath: '/lib/',
        // filename: 'comb-ui.js',
        filename: '[name].js',
        library: 'comb-ui',
        libraryTarget: 'commonjs', // 'umd',
        // umdNamedDefine: true
    };

    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]);
    // 添加externals，vue、vuex、vue-router等使用cdn方式，在此排除后，需要在上面的HtmlWebpackPlugin.scripts中设置外链。 Author by Dio Zhu. on 2017.6.23
    module.exports.externals = {
        'vue': 'Vue',
        'vue-router': 'VueRouter',
        'axios': 'axios',
        'vuex': 'Vuex',
        'vue-resource': 'VueResource'
    };
}
