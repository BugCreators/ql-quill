const webpack = require("webpack");
const path = require("path");
const pkg = require("./package.json");
const dir = (...args) => path.resolve(__dirname, ...args);

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isEnvProduction = process.env.NODE_ENV === "production";

const bannerPack = new webpack.BannerPlugin({
  banner: "Ql Quill v" + pkg.version + "\n" + "Copyright (c) 2020, Huang",
  entryOnly: true,
});

const plugins = [
  bannerPack,
  new CleanWebpackPlugin(),
  new webpack.ProvidePlugin({
    "window.Quill": "quill",
  }),
  new MiniCssExtractPlugin({
    filename: "[name].snow.css",
    chunkFilename: "[id].css",
  }),
];

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    "ql-quill": dir("index.js"),
  },
  devtool: isEnvProduction ? false : "source-map",
  output: {
    path: dir("dist"),
    filename: "[name].js",
    library: "QlQuill",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: "url-loader",
        options: {
          limit: 10000,
          name: "images/[name].[hash:8].[ext]",
        },
      },
      {
        test: /\.svg$/,
        use: "raw-loader",
      },
      {
        test: /\.styl$/,
        include: [dir("assets")],
        use: [MiniCssExtractPlugin.loader, "css-loader", "stylus-loader"],
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: isEnvProduction,
          },
        },
        extractComments: /Copyright/,
      }),
      new OptimizeCssAssetsPlugin(),
    ],
  },
  plugins: plugins,
};
