var path = require("path");
var webpack = require("webpack");

var BundleTracker = require("webpack-bundle-tracker");
var postcssImport = require("postcss-import");
var postcssCssnext = require("postcss-cssnext");
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
    context: __dirname,

    mode: "development",

    entry: {
        parkhang: ["./app/index", "./website/index"]
    },

    output: {
        path: path.resolve(__dirname, "static/bundles/"),
        filename: "[name]-dev.js",
        library: "parkhang",
        publicPath: "/static/bundles/"
    },

    plugins: [
        new BundleTracker({ filename: "./webpack-stats-dev.json" }),
        new MiniCssExtractPlugin({
            filename: "styles-dev.css"
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        }),
        new LodashModuleReplacementPlugin()
        
    ],

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                "@babel/preset-react",
                                "@babel/preset-env",
                                "@babel/preset-flow"
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                exclude: /accounts\.css/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            importLoaders: 1,
                            modules: true,
                            localIdentName: "[name]---[local]"
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                            plugins: () => [
                                postcssImport({
                                    addDependencyTo: webpack,
                                    path: path.resolve("./app")
                                }),
                                postcssCssnext({
                                    compress: true
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /accounts\.css/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true,
                            importLoaders: 1,
                            modules: false
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                            plugins: () => [
                                postcssImport({
                                    addDependencyTo: webpack,
                                    path: path.resolve("./app")
                                }),
                                postcssCssnext({
                                    compress: true
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.svg$/,
                use: [
                    {
                        loader: "@svgr/webpack",
                        options: {
                            svgoConfig: {
                                plugins: [
                                    {
                                        inlineStyles: {
                                            onlyMatchedOnce: false
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader"
                    }
                ]
            }
        ]
    },

    resolve: {
        extensions: [".js", ".jsx"],
        modules: [path.resolve("./node_modules"), path.resolve("./app")]
    },

    devtool: "cheap-module-source-map"
};
